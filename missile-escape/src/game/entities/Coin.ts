import Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';

export class Coin extends Phaser.Physics.Arcade.Sprite {
  isGolden = false;
  value = 0;

  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
    super(scene, 0, 0, TEX.coin);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(6);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.enable = false;
    this.setActive(false);
    this.setVisible(false);
    group.add(this);
  }

  spawn(x: number, y: number, golden: boolean, value: number): void {
    this.isGolden = golden;
    this.value = value;
    this.setTexture(golden ? TEX.coinGolden : TEX.coin);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(this.width * 0.75, this.height * 0.75, true);
    this.scene.tweens.add({
      targets: this,
      scale: { from: 0.85, to: 1.1 },
      duration: 480,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  despawn(): void {
    this.scene.tweens.killTweensOf(this);
    this.setScale(1);
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
  }
}
