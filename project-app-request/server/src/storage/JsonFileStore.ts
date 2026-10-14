import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

/**
 * A minimal per-key mutex used to serialize writes to the same file so that
 * concurrent requests can never interleave and corrupt a JSON file.
 */
class KeyedMutex {
  private queues = new Map<string, Promise<unknown>>();

  async run<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = this.queues.get(key) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.queues.set(
      key,
      previous.then(() => current)
    );

    await previous;
    try {
      return await task();
    } finally {
      release();
      if (this.queues.get(key) === previous.then(() => current)) {
        this.queues.delete(key);
      }
    }
  }
}

const mutex = new KeyedMutex();

export interface JsonStoreOptions<T> {
  /** Absolute path to the JSON file. */
  filePath: string;
  /** Value written to the file the first time it is created. */
  defaultValue: T;
  /** Optional validator; must return true if the parsed data has the expected shape. */
  validate?: (data: unknown) => data is T;
}

/**
 * Reusable JSON file storage helper.
 *
 * - Creates the file (and parent directory) with sensible defaults if missing.
 * - Serializes all writes for the same file through a mutex.
 * - Writes atomically: write to a temp file, fsync, then rename over the target.
 * - Keeps a single rolling `.bak` backup of the previous good file before overwriting.
 * - Falls back to the backup file if the main file is corrupted/unreadable.
 */
export class JsonFileStore<T> {
  private readonly filePath: string;
  private readonly backupPath: string;
  private readonly tempPath: string;
  private readonly defaultValue: T;
  private readonly validate?: (data: unknown) => data is T;

  constructor(options: JsonStoreOptions<T>) {
    this.filePath = options.filePath;
    this.backupPath = `${options.filePath}.bak`;
    this.tempPath = `${options.filePath}.tmp`;
    this.defaultValue = options.defaultValue;
    this.validate = options.validate;
    this.ensureFileExistsSync();
  }

  private ensureFileExistsSync(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(this.defaultValue, null, 2), 'utf-8');
    }
  }

  private parse(raw: string): T | null {
    try {
      const data = JSON.parse(raw);
      if (this.validate && !this.validate(data)) {
        return null;
      }
      return data as T;
    } catch {
      return null;
    }
  }

  /** Reads and parses the JSON file, recovering from the backup if corrupted. */
  async read(): Promise<T> {
    return mutex.run(this.filePath, async () => this.readUnlocked());
  }

  private async readUnlocked(): Promise<T> {
    try {
      const raw = await fsp.readFile(this.filePath, 'utf-8');
      const parsed = this.parse(raw);
      if (parsed !== null) {
        return parsed;
      }
      // eslint-disable-next-line no-console
      console.error(`[JsonFileStore] Corrupted JSON detected in ${path.basename(this.filePath)}, attempting backup recovery.`);
    } catch {
      // File missing or unreadable; fall through to backup/default recovery.
    }

    try {
      const backupRaw = await fsp.readFile(this.backupPath, 'utf-8');
      const parsedBackup = this.parse(backupRaw);
      if (parsedBackup !== null) {
        await this.writeUnlocked(parsedBackup);
        return parsedBackup;
      }
    } catch {
      // No usable backup either.
    }

    await this.writeUnlocked(this.defaultValue);
    return this.defaultValue;
  }

  /** Validates and atomically persists the given data, keeping a backup of the prior state. */
  async write(data: T): Promise<void> {
    if (this.validate && !this.validate(data)) {
      throw new Error(`Refusing to write invalid data to ${path.basename(this.filePath)}`);
    }
    return mutex.run(this.filePath, async () => this.writeUnlocked(data));
  }

  private async writeUnlocked(data: T): Promise<void> {
    const serialized = JSON.stringify(data, null, 2);

    // Back up the current good file before overwriting it.
    try {
      if (fs.existsSync(this.filePath)) {
        await fsp.copyFile(this.filePath, this.backupPath);
      }
    } catch {
      // Backup failure should not block the write.
    }

    const handle = await fsp.open(this.tempPath, 'w');
    try {
      await handle.writeFile(serialized, 'utf-8');
      await handle.sync();
    } finally {
      await handle.close();
    }

    await fsp.rename(this.tempPath, this.filePath);
  }

  /** Runs a read-modify-write cycle atomically with respect to other writers of this file. */
  async update(mutator: (current: T) => T | Promise<T>): Promise<T> {
    return mutex.run(this.filePath, async () => {
      const current = await this.readUnlocked();
      const next = await mutator(current);
      await this.writeUnlocked(next);
      return next;
    });
  }
}
