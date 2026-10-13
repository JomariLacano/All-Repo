import Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';
import { TERRAIN, WORLD, SCORING } from '../constants';
import { randFloat, randInt, chance, pick } from '../utils/random';
import { ObjectPool } from './ObjectPool';
import { Coin } from '../entities/Coin';
import { Spike } from '../entities/obstacles/Spike';
import { SawBlade } from '../entities/obstacles/SawBlade';
import { Hammer } from '../entities/obstacles/Hammer';
import { Barrel } from '../entities/obstacles/Barrel';
import { FallingRock } from '../entities/obstacles/FallingRock';
import type { DifficultyManager } from './DifficultyManager';

type ObstacleKind = 'spike' | 'saw' | 'hammer' | 'barrel' | 'rock';

interface ActiveEntry {
  cleanupX: number;
  release: () => void;
  tick?: (time: number, camRightEdge: number) => void;
}

const GROUND_THICKNESS = WORLD.height - WORLD.groundY + 60;
const SAFE_RUNWAY = 900;
const OBSTACLE_TYPES: readonly ObstacleKind[] = ['spike', 'saw', 'hammer', 'barrel', 'rock'];

// Drives infinite procedural generation: ground/gaps, floating platforms,
// obstacles and coins ahead of the camera; recycles everything behind it.
export class TerrainGenerator {
  readonly groundGroup: Phaser.Physics.Arcade.StaticGroup;
  readonly platformGroup: Phaser.Physics.Arcade.StaticGroup;
  readonly hazardGroup: Phaser.Physics.Arcade.Group;
  readonly coinGroup: Phaser.Physics.Arcade.Group;

  private readonly scene: Phaser.Scene;
  private readonly difficulty: DifficultyManager;
  private readonly spikePool: ObjectPool<Spike>;
  private readonly sawPool: ObjectPool<SawBlade>;
  private readonly barrelPool: ObjectPool<Barrel>;
  private readonly rockPool: ObjectPool<FallingRock>;
  private readonly coinPool: ObjectPool<Coin>;
  private readonly hammerPool: Hammer[] = [];
  private readonly activeHammers = new Set<Hammer>();

  private active: ActiveEntry[] = [];
  private generatedUntilX = 0;

  constructor(scene: Phaser.Scene, difficulty: DifficultyManager) {
    this.scene = scene;
    this.difficulty = difficulty;
    this.groundGroup = scene.physics.add.staticGroup();
    this.platformGroup = scene.physics.add.staticGroup();
    this.hazardGroup = scene.physics.add.group();
    this.coinGroup = scene.physics.add.group();

    this.spikePool = new ObjectPool(() => new Spike(scene, this.hazardGroup), 6);
    this.sawPool = new ObjectPool(() => new SawBlade(scene, this.hazardGroup), 4);
    this.barrelPool = new ObjectPool(() => new Barrel(scene, this.hazardGroup), 4);
    this.rockPool = new ObjectPool(() => new FallingRock(scene, this.hazardGroup), 4);
    this.coinPool = new ObjectPool(() => new Coin(scene, this.coinGroup), 24);
  }

  reset(): void {
    this.active.forEach((entry) => entry.release());
    this.active = [];
    this.activeHammers.forEach((h) => this.releaseHammer(h));
    this.activeHammers.clear();
    this.generatedUntilX = 0;
    this.addGroundSegment(0, SAFE_RUNWAY);
    this.generatedUntilX = SAFE_RUNWAY;
  }

  update(time: number, camera: Phaser.Cameras.Scene2D.Camera): void {
    const targetX = camera.scrollX + camera.width + TERRAIN.generateAheadPx;
    while (this.generatedUntilX < targetX) {
      this.generateNextChunk();
    }

    const camRightEdge = camera.scrollX + camera.width;
    this.active.forEach((entry) => entry.tick?.(time, camRightEdge));

    const cleanupThreshold = camera.scrollX - TERRAIN.cleanupBehindPx;
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (this.active[i].cleanupX < cleanupThreshold) {
        this.active[i].release();
        this.active.splice(i, 1);
      }
    }
  }

  handleRockLanding(rock: FallingRock): void {
    rock.onLand();
  }

  private generateNextChunk(): void {
    const density = this.difficulty.state.obstacleDensityMultiplier;
    const gapChance = Phaser.Math.Clamp(0.22 * density, 0.15, 0.4);

    if (chance(gapChance) && this.generatedUntilX > SAFE_RUNWAY) {
      const gapWidth = randFloat(TERRAIN.minGapWidth, TERRAIN.maxGapWidth);
      const gapStart = this.generatedUntilX;
      if (chance(TERRAIN.floatingPlatformChance)) {
        const platformWidth = 110;
        const platformX = gapStart + gapWidth / 2 - platformWidth / 2;
        const platformY = WORLD.groundY - randInt(50, 130);
        this.addFloatingPlatform(platformX, platformY, platformWidth);
        if (chance(0.7)) {
          this.spawnCoinArc(platformX + 10, platformY - 30, 3);
        }
      } else if (chance(0.5)) {
        this.spawnCoinArc(gapStart + gapWidth / 2 - 50, WORLD.groundY - 120, 4);
      }
      this.generatedUntilX = gapStart + gapWidth;
      return;
    }

    const groundWidth = randFloat(TERRAIN.minGroundWidth, TERRAIN.maxGroundWidth);
    const groundStart = this.generatedUntilX;
    this.addGroundSegment(groundStart, groundWidth);
    this.populateGround(groundStart, groundWidth, density);
    this.generatedUntilX = groundStart + groundWidth;
  }

  private populateGround(start: number, width: number, density: number): void {
    const margin = 70;
    if (width > margin * 2 && this.generatedUntilX > SAFE_RUNWAY && chance(Math.min(0.75, 0.4 * density))) {
      const x = randFloat(start + margin, start + width - margin);
      this.spawnObstacle(pick(OBSTACLE_TYPES), x);
    }
    if (chance(0.55)) {
      const coinX = randFloat(start + 40, start + width - 40);
      this.spawnCoinArc(coinX, WORLD.groundY - 110, randInt(3, 5));
    }
  }

  private spawnObstacle(kind: ObstacleKind, centerX: number): void {
    const groundTopY = WORLD.groundY;
    const density = this.difficulty.state.obstacleDensityMultiplier;
    switch (kind) {
      case 'spike': {
        const spike = this.spikePool.acquire();
        spike.spawn(centerX, groundTopY);
        this.active.push({ cleanupX: centerX + 50, release: () => this.spikePool.release(spike) });
        break;
      }
      case 'saw': {
        const saw = this.sawPool.acquire();
        const vertical = chance(0.3);
        saw.spawn(centerX, groundTopY - 44, randFloat(50, 90), vertical, 1 + density * 0.25);
        this.active.push({
          cleanupX: centerX + 90,
          release: () => this.sawPool.release(saw),
          tick: (time) => saw.update(time),
        });
        break;
      }
      case 'hammer': {
        const hammer = this.acquireHammer();
        hammer.spawn(centerX, groundTopY - 170, 0.85, 1 + density * 0.2);
        this.activeHammers.add(hammer);
        this.active.push({
          cleanupX: centerX + 90,
          release: () => this.releaseHammer(hammer),
          tick: (time) => hammer.update(time),
        });
        break;
      }
      case 'barrel': {
        const barrel = this.barrelPool.acquire();
        barrel.spawn(centerX, groundTopY);
        this.active.push({ cleanupX: centerX + 50, release: () => this.barrelPool.release(barrel) });
        break;
      }
      case 'rock': {
        const rock = this.rockPool.acquire();
        const triggerX = centerX - 320;
        rock.spawn(triggerX, centerX, groundTopY - 420);
        this.active.push({
          cleanupX: centerX + 60,
          release: () => this.rockPool.release(rock),
          tick: (_time, camRightEdge) => rock.update(camRightEdge),
        });
        break;
      }
    }
  }

  private spawnCoinArc(centerX: number, baseY: number, count: number): void {
    const goldenIndex = chance(SCORING.goldenCoinChance) ? randInt(0, count - 1) : -1;
    for (let i = 0; i < count; i++) {
      const coin = this.coinPool.acquire();
      const offset = (i - (count - 1) / 2) * 34;
      const arcLift = Math.sin((i / Math.max(count - 1, 1)) * Math.PI) * 26;
      const isGolden = i === goldenIndex;
      coin.spawn(centerX + offset, baseY - arcLift, isGolden, isGolden ? SCORING.goldenCoinValue : SCORING.coinValue);
      const entry: ActiveEntry = {
        cleanupX: centerX + offset + 30,
        release: () => this.coinPool.release(coin),
      };
      coin.setData('entry', entry);
      this.active.push(entry);
    }
  }

  // Called when the player collects a coin early, so it isn't released twice
  // (once here, once when the normal cleanup pass later scrolls past it).
  releaseCoin(coin: Coin): void {
    const entry = coin.getData('entry') as ActiveEntry | undefined;
    if (entry) {
      const index = this.active.indexOf(entry);
      if (index >= 0) this.active.splice(index, 1);
    }
    coin.despawn();
    this.coinPool.release(coin);
  }

  private addGroundSegment(x: number, width: number): void {
    const tile = this.scene.add
      .tileSprite(x, WORLD.groundY, width, GROUND_THICKNESS, TEX.ground)
      .setOrigin(0, 0)
      .setDepth(2);
    this.scene.physics.add.existing(tile, true);
    this.groundGroup.add(tile);
    this.active.push({
      cleanupX: x + width,
      release: () => {
        this.groundGroup.remove(tile, true, true);
      },
    });
  }

  private addFloatingPlatform(x: number, y: number, width: number): void {
    const tile = this.scene.add
      .tileSprite(x, y, width, 28, TEX.platform)
      .setOrigin(0, 0)
      .setDepth(2);
    this.scene.physics.add.existing(tile, true);
    this.platformGroup.add(tile);
    this.active.push({
      cleanupX: x + width,
      release: () => {
        this.platformGroup.remove(tile, true, true);
      },
    });
  }

  private acquireHammer(): Hammer {
    const free = this.hammerPool.find((h) => !this.activeHammers.has(h));
    if (free) return free;
    const hammer = new Hammer(this.scene, this.hazardGroup);
    this.hammerPool.push(hammer);
    return hammer;
  }

  private releaseHammer(hammer: Hammer): void {
    hammer.despawn();
    this.activeHammers.delete(hammer);
  }
}
