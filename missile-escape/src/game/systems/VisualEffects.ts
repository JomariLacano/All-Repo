import Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';
import { WORLD, EFFECTS } from '../constants';
import type { Player } from '../entities/Player';

// Juice layer: speed-scaled motion-blur ghost trail, horizontal speed lines,
// floating combat text, and a reusable camera flash helper.
export class VisualEffects {
  private readonly scene: Phaser.Scene;
  private readonly speedLines: Phaser.GameObjects.Particles.ParticleEmitter;
  private ghostTimer = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.speedLines = scene.add
      .particles(WORLD.width + 10, 0, TEX.raindrop, {
        x: WORLD.width + 10,
        y: { min: 0, max: WORLD.height },
        lifespan: 260,
        speedX: { min: -1400, max: -1000 },
        speedY: 0,
        scaleX: 0.4,
        scaleY: 2.6,
        rotate: 90,
        tint: 0xffffff,
        alpha: { start: 0.35, end: 0 },
        quantity: 1,
        frequency: 200,
        emitting: false,
      })
      .setDepth(31)
      .setScrollFactor(0);
  }

  update(deltaMs: number, player: Player): void {
    const speed = player.runSpeed;
    const overThreshold = speed - EFFECTS.highSpeedThreshold;

    if (overThreshold > 0 && player.state !== 'dead') {
      const ratio = Phaser.Math.Clamp(
        overThreshold / (EFFECTS.extremeSpeedThreshold - EFFECTS.highSpeedThreshold),
        0,
        1,
      );
      this.speedLines.emitting = true;
      this.speedLines.frequency = Phaser.Math.Linear(70, 1000 / EFFECTS.speedLineMaxFrequency, 1 - ratio);

      this.ghostTimer += deltaMs;
      const ghostInterval = Phaser.Math.Linear(EFFECTS.ghostIntervalMs * 1.6, EFFECTS.ghostIntervalMs * 0.5, ratio);
      if (this.ghostTimer >= ghostInterval) {
        this.ghostTimer = 0;
        this.spawnGhost(player);
      }
    } else {
      this.speedLines.emitting = false;
    }
  }

  private spawnGhost(player: Player): void {
    const ghost = this.scene.add
      .image(player.x, player.y, player.texture.key)
      .setOrigin(player.originX, player.originY)
      .setScale(player.scaleX, player.scaleY)
      .setRotation(player.rotation)
      .setAlpha(0.32)
      .setTint(0x6fb6ff)
      .setDepth(19);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 220,
      ease: 'Quad.easeOut',
      onComplete: () => ghost.destroy(),
    });
  }

  spawnFloatingText(x: number, y: number, text: string, color: string): void {
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: 'Segoe UI, Roboto, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color,
        stroke: '#1b1b1b',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1)
      .setDepth(50);
    this.scene.tweens.add({
      targets: label,
      y: y - 60,
      alpha: 0,
      duration: 820,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  flash(strength: number): void {
    const duration = Phaser.Math.Linear(90, 220, strength);
    this.scene.cameras.main.flash(duration, 255, 255, 255, false);
  }
}
