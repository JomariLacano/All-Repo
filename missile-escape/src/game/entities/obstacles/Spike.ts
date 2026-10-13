import Phaser from 'phaser';
import { TEX } from '../../textures/generateTextures';

export class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, hazardGroup: Phaser.Physics.Arcade.Group) {
    super(scene, 0, 0, TEX.spike);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setDepth(8);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.enable = false;
    this.setActive(false);
    this.setVisible(false);
    hazardGroup.add(this);
  }

  spawn(x: number, groundY: number): void {
    this.setPosition(x, groundY);
    this.setActive(true);
    this.setVisible(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(this.width * 0.7, this.height * 0.55, true);
    body.reset(x, groundY);
  }

  despawn(): void {
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
  }
}
