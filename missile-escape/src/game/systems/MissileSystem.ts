import Phaser from 'phaser';
import { Missile } from '../entities/Missile';
import { WarningMarker } from '../entities/WarningMarker';
import { ObjectPool } from './ObjectPool';
import { MISSILE, NEAR_MISS_TIERS } from '../constants';
import { randFloat, pick, chance } from '../utils/random';
import type { Player } from '../entities/Player';
import type { DifficultyManager } from './DifficultyManager';
import type { MissileSpawnSide, NearMissTier } from '../types';

interface PendingWarning {
  marker: WarningMarker;
  elapsed: number;
  offsetX: number;
  launchDelayMs: number;
  isSuper: boolean;
  targetX: number;
  targetY: number;
}

export type NearMissHandler = (tier: NearMissTier, bonus: number, x: number, y: number) => void;

const SPAWN_SIDES: readonly MissileSpawnSide[] = ['top-left', 'top-right', 'offscreen-left', 'offscreen-right'];

// Owns the warn -> lock-on -> launch -> explode lifecycle for incoming missiles,
// including the multi-missile / wave / super-missile evolution over survival time.
export class MissileSystem {
  readonly missileGroup: Phaser.Physics.Arcade.Group;
  private readonly scene: Phaser.Scene;
  private readonly player: Player;
  private readonly difficulty: DifficultyManager;
  private readonly onNearMiss: NearMissHandler;
  private readonly missilePool: ObjectPool<Missile>;
  private readonly markerPool: ObjectPool<WarningMarker>;
  private readonly activeMissiles = new Set<Missile>();
  private pendingWarnings: PendingWarning[] = [];
  private nextSpawnInS = 0;
  private cooldownS = 0;

  constructor(scene: Phaser.Scene, player: Player, difficulty: DifficultyManager, onNearMiss: NearMissHandler) {
    this.scene = scene;
    this.player = player;
    this.difficulty = difficulty;
    this.onNearMiss = onNearMiss;
    this.missileGroup = scene.physics.add.group();
    this.missilePool = new ObjectPool(() => new Missile(scene, this.missileGroup), 8);
    this.markerPool = new ObjectPool(() => new WarningMarker(scene), 6);
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
      warning.targetY = this.player.y;
      warning.marker.follow(this.player.x + warning.offsetX, this.player.y - this.player.displayHeight / 2);
      if (warning.elapsed >= MISSILE.warningDurationMs + warning.launchDelayMs) {
        this.pendingWarnings.splice(i, 1);
        this.markerPool.release(warning.marker);
        this.launchMissile(warning.targetX, warning.targetY, warning.isSuper);
      }
    }

    const cam = this.scene.cameras.main;
    this.activeMissiles.forEach((missile) => {
      this.checkNearMiss(missile);
      const outOfBounds =
        missile.x < cam.scrollX - 300 ||
        missile.x > cam.scrollX + cam.width + 500 ||
        missile.y > 2000 ||
        missile.y < -500;
      if (outOfBounds) {
        this.recycleMissile(missile);
      }
    });
  }

  private beginWarning(): void {
    const count = this.difficulty.missileCountPerWave;
    const superEligible = this.difficulty.superMissileEligible;
    for (let i = 0; i < count; i++) {
      const marker = this.markerPool.acquire();
      const offsetX = (i - (count - 1) / 2) * 26;
      marker.show(this.player.x + offsetX, this.player.y - this.player.displayHeight / 2);
      const isSuper = i === 0 && superEligible && chance(MISSILE.superMissileChance);
      this.pendingWarnings.push({
        marker,
        elapsed: 0,
        offsetX,
        launchDelayMs: i * MISSILE.waveStaggerMs,
        isSuper,
        targetX: this.player.x,
        targetY: this.player.y,
      });
    }
  }

  private launchMissile(targetX: number, targetY: number, isSuper: boolean): void {
    const missile = this.missilePool.acquire();
    const cam = this.scene.cameras.main;
    const side = pick(SPAWN_SIDES);
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
    missile.launch(fromX, fromY, targetX, targetY, this.difficulty.missileSpeed, isSuper);
    this.activeMissiles.add(missile);
  }

  private checkNearMiss(missile: Missile): void {
    if (missile.hasExploded || missile.getData('nearMissCounted')) return;
    const dist = Phaser.Math.Distance.Between(missile.x, missile.y, this.player.x, this.player.y);
    if (dist >= MISSILE.nearMissRadius) return;

    missile.setData('nearMissCounted', true);
    let tier: NearMissTier = 'close-call';
    let bonus = MISSILE.nearMissBonus;
    if (dist < NEAR_MISS_TIERS.insaneDodgeRadius) {
      tier = 'insane-dodge';
      bonus = MISSILE.nearMissBonus * 3;
    } else if (dist < NEAR_MISS_TIERS.luckyEscapeRadius) {
      tier = 'lucky-escape';
      bonus = MISSILE.nearMissBonus * 2;
    }
    if (missile.isSuper) {
      bonus += MISSILE.superMissileBonus;
    }
    this.onNearMiss(tier, bonus, this.player.x, this.player.y - this.player.displayHeight);
    this.triggerSlowMotion();
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
