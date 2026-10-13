import type Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';

// Thin wrapper around a handful of burst emitters reused for the whole scene
// (coin sparkle, run/landing dust, explosion debris) instead of allocating new ones.
export class ParticleManager {
  private readonly sparkle: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly dust: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly debris: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.sparkle = scene.add
      .particles(0, 0, TEX.particle, {
        lifespan: 420,
        speed: { min: 60, max: 170 },
        scale: { start: 1, end: 0 },
        tint: [0xffe999, 0xffd23f],
        quantity: 0,
        emitting: false,
      })
      .setDepth(30);

    this.dust = scene.add
      .particles(0, 0, TEX.particle, {
        lifespan: 280,
        speed: { min: 20, max: 60 },
        scale: { start: 0.6, end: 0 },
        tint: 0xffffff,
        alpha: { start: 0.5, end: 0 },
        quantity: 0,
        emitting: false,
      })
      .setDepth(4);

    this.debris = scene.add
      .particles(0, 0, TEX.particle, {
        lifespan: 620,
        speed: { min: 120, max: 340 },
        scale: { start: 1.1, end: 0 },
        tint: [0xff8a3d, 0xffd23f, 0x8d8d99],
        gravityY: 900,
        quantity: 0,
        emitting: false,
      })
      .setDepth(30);
  }

  coinBurst(x: number, y: number): void {
    this.sparkle.explode(10, x, y);
  }

  runDust(x: number, y: number): void {
    this.dust.explode(1, x, y);
  }

  explosionDebris(x: number, y: number): void {
    this.debris.explode(18, x, y);
  }
}
