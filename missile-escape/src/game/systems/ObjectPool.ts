import type Phaser from 'phaser';

type Poolable = Phaser.GameObjects.GameObject & {
  setActive: (value: boolean) => unknown;
  setVisible: (value: boolean) => unknown;
};

// Generic acquire/release pool to avoid repeated allocation + GC churn for
// high-churn entities (missiles, coins, obstacles) spawned during endless scrolling.
export class ObjectPool<T extends Poolable> {
  private readonly available: T[] = [];
  private readonly factory: () => T;

  constructor(factory: () => T, initialSize = 0) {
    this.factory = factory;
    for (let i = 0; i < initialSize; i++) {
      const obj = factory();
      obj.setActive(false);
      obj.setVisible(false);
      this.available.push(obj);
    }
  }

  acquire(): T {
    const obj = this.available.pop();
    if (obj) {
      return obj;
    }
    return this.factory();
  }

  release(obj: T): void {
    obj.setActive(false);
    obj.setVisible(false);
    this.available.push(obj);
  }

  get pooledCount(): number {
    return this.available.length;
  }
}
