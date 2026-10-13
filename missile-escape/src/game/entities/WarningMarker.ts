import Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';

export class WarningMarker extends Phaser.GameObjects.Image {
  private pulseTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, TEX.warning);
    scene.add.existing(this);
    this.setDepth(26);
    this.setActive(false);
    this.setVisible(false);
  }

  show(x: number, y: number): void {
    this.setPosition(x, y - 46);
    this.setActive(true);
    this.setVisible(true);
    this.setScale(0.6);
    this.setAlpha(1);
    this.pulseTween?.stop();
    this.pulseTween = this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  follow(x: number, y: number): void {
    if (this.active) {
      this.setPosition(x, y - 46);
    }
  }

  hide(): void {
    this.pulseTween?.stop();
    this.setActive(false);
    this.setVisible(false);
  }
}
