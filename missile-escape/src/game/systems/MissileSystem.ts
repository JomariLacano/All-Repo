import Phaser from 'phaser';
import { Missile } from '../entities/Missile';
import { WarningMarker } from '../entities/WarningMarker';
import { ObjectPool } from './ObjectPool';
import { EventBus, GameEvents } from '../EventBus';
import { MISSILE, WORLD } from '../constants';
import { randFloat, pick } from '../utils/random';
import type { Player } from '../entities/Player';
import type { DifficultyManager } from './DifficultyManager';
import type { MissileSpawnSide } from '../types';

interface PendingWarning {
  marker: WarningMarker;
  elapsed: number;
  targetX: number;
  targetY: number;
}

// Owns the warn -> lock-on -> launch -> explode lifecycle for incoming missiles.
export class MissileSystem {
  readonly missileGroup: Phaser.Physics.Arcade.Group;
  private readonly scene: Phaser.Scene;
  private readonly player: Player;
  private readonly difficulty: DifficultyManager;
  private readonly missilePool: ObjectPool<Missile>;
  private readonly markerPool: ObjectPool<WarningMarker>;
  private readonly activeMissiles = new Set<Missile>();
  private pendingWarnings: PendingWarning[] = [];
  private nextSpawnInS = 0;
  private cooldownS = 0;

  constructor(scene: Phaser.Scene, player: Player, difficulty: DifficultyManager) {
    this.scene = scene;
    this.player = player;
    this.difficulty = difficulty;
    this.missileGroup = scene.physics.add.group();
    this.missilePool = new ObjectPool(() => new Missile(scene, this.missileGroup), 4);
    this.markerPool = new ObjectPool(() => new WarningMarker(scene), 3);
    this.rollNextSpawn();
  }

  reset(): void {
    this.activeMissiles.forEach((m) => this.recycleMissile(m));
    this.activeMissiles.clear();
    this.pendingWarnings.forEach((w) => this.markerPool.release(w.marker));
    this.pendingWarnings = [];
    this.cooldownS = 0;
    this.rollNextSpawn();
  }

  private rollNextSpawn(): void {
    const [min, max] = this.difficulty.missileIntervalRange;
    this.nextSpawnInS = randFloat(min, max);
    this.cooldownS = 0;
  }

  update(deltaMs: number): void {
    if (this.player.state === 'dead') return;
    const deltaS = deltaMs / 1000;
    this.cooldownS += deltaS;
    if (this.cooldownS >= this.nextSpawnInS) {
      this.beginWarning();
      this.rollNextSpawn();
    }

    for (let i = this.pendingWarnings.length - 1; i >= 0; i--) {
      const warning = this.pendingWarnings[i];
      warning.elapsed += deltaMs;
      warning.targetX = this.player.x;
      warning.targetY = this.player.y - this.player.displayHeight / 2;
      warning.marker.follow(warning.targetX, warning.targetY);
      if (warning.elapsed >= MISSILE.warningDurationMs) {
        this.pendingWarnings.splice(i, 1);
        this.markerPool.release(warning.marker);
        this.launchMissile(warning.targetX, warning.targetY);
      }
    }

    const cam = this.scene.cameras.main;
    this.activeMissiles.forEach((missile) => {
      this.checkNearMiss(missile);
      const outOfBounds =
        missile.x < cam.scrollX - 300 ||
        missile.x > cam.scrollX + cam.width + 500 ||
        missile.y > WORLD.height + 500 ||
        missile.y < -500;
      if (outOfBounds) {
        this.recycleMissile(missile);
      }
    });
  }

  private beginWarning(): void {
    const marker = this.markerPool.acquire();
    marker.show(this.player.x, this.player.y - this.player.displayHeight / 2);
    this.pendingWarnings.push({
      marker,
      elapsed: 0,
      targetX: this.player.x,
      targetY: this.player.y,
    });
  }

  private launchMissile(targetX: number, targetY: number): void {
    const missile = this.missilePool.acquire();
    const cam = this.scene.cameras.main;
    const side = pick<MissileSpawnSide>(['top-left', 'top-right', 'offscreen-left', 'offscreen-right']);
    let fromX = targetX;
    let fromY = -80;
    if (side === 'top-left') {
      fromX = cam.scrollX - 60;
    } else if (side === 'top-right') {
      fromX = cam.scrollX + cam.width + 60;
    } else if (side === 'offscreen-left') {
      fromX = cam.scrollX - 140;
      fromY = targetY + randFloat(-60, 60);
    } else {
      fromX = cam.scrollX + cam.width + 140;
      fromY = targetY + randFloat(-60, 60);
    }
    missile.setData('nearMissCounted', false);
    missile.launch(fromX, fromY, targetX, targetY, this.difficulty.missileSpeed);
    this.activeMissiles.add(missile);
  }

  private checkNearMiss(missile: Missile): void {
    if (missile.hasExploded || missile.getData('nearMissCounted')) return;
    const dist = Phaser.Math.Distance.Between(missile.x, missile.y, this.player.x, this.player.y);
    if (dist < MISSILE.nearMissRadius) {
      missile.setData('nearMissCounted', true);
      EventBus.emit(GameEvents.NearMiss, { bonus: MISSILE.nearMissBonus });
      this.triggerSlowMotion();
    }
  }

  private triggerSlowMotion(): void {
    const slowFactor = 0.35;
    this.scene.time.timeScale = slowFactor;
    this.scene.physics.world.timeScale = slowFactor;
    this.scene.time.delayedCall(260, () => {
      this.scene.time.timeScale = 1;
      this.scene.physics.world.timeScale = 1;
    });
  }

  explodeMissile(missile: Missile): void {
    if (missile.hasExploded) return;
    missile.hasExploded = true;
    this.recycleMissile(missile);
  }

  private recycleMissile(missile: Missile): void {
    this.activeMissiles.delete(missile);
    missile.despawn();
    this.missilePool.release(missile);
  }
}
