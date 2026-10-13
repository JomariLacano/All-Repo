import Phaser from 'phaser';
import { TEX } from '../../textures/generateTextures';

export class FallingRock extends Phaser.Physics.Arcade.Sprite {
  private triggerX = 0;
  private triggered = false;
  private landed = false;

  constructor(scene: Phaser.Scene, hazardGroup: Phaser.Physics.Arcade.Group) {
    super(scene, 0, 0, TEX.rock);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(21);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.enable = false;
    this.setActive(false);
    this.setVisible(false);
    hazardGroup.add(this);
  }

  spawn(triggerX: number, startX: number, startY: number): void {
    this.triggerX = triggerX;
    this.triggered = false;
    this.landed = false;
    this.setPosition(startX, startY);
    this.setActive(true);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    body.setAllowGravity(false);
    body.setImmovable(false);
    body.setVelocity(0, 0);
  }

  update(cameraRightEdge: number): void {
    if (!this.active || this.landed || this.triggered) {
      return;
    }
    if (cameraRightEdge >= this.triggerX) {
      this.triggered = true;
      this.setVisible(true);
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.enable = true;
      body.setAllowGravity(true);
    }
  }

  onLand(): void {
    if (this.landed) return;
    this.landed = true;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);
    body.setImmovable(true);
  }

  despawn(): void {
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
  }
}
