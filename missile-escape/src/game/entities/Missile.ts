import Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';

export class Missile extends Phaser.Physics.Arcade.Sprite {
  hasExploded = false;

  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
    super(scene, 0, 0, TEX.missile);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(16);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(this.width * 0.75, this.height * 0.6, true);
    body.enable = false;
    this.setActive(false);
    this.setVisible(false);
    group.add(this);
  }

  launch(fromX: number, fromY: number, targetX: number, targetY: number, speed: number): void {
    this.hasExploded = false;
    this.setPosition(fromX, fromY);
    this.setActive(true);
    this.setVisible(true);
    const angle = Phaser.Math.Angle.Between(fromX, fromY, targetX, targetY);
    this.setRotation(angle);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(fromX, fromY);
    this.scene.physics.velocityFromRotation(angle, speed, body.velocity);
  }

  despawn(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;
    this.setActive(false);
    this.setVisible(false);
  }
}
