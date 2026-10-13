import Phaser from 'phaser';
import { TEX } from '../../textures/generateTextures';

export class SawBlade extends Phaser.Physics.Arcade.Sprite {
  private anchorX = 0;
  private anchorY = 0;
  private rangeX = 0;
  private rangeY = 0;
  private speedScale = 1;

  constructor(scene: Phaser.Scene, hazardGroup: Phaser.Physics.Arcade.Group) {
    super(scene, 0, 0, TEX.saw);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(9);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.enable = false;
    this.setActive(false);
    this.setVisible(false);
    hazardGroup.add(this);
  }

  spawn(x: number, y: number, range: number, vertical: boolean, speedScale: number): void {
    this.anchorX = x;
    this.anchorY = y;
    this.rangeX = vertical ? 0 : range;
    this.rangeY = vertical ? range : 0;
    this.speedScale = speedScale;
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setCircle(this.width * 0.42);
    body.reset(x, y);
  }

  update(time: number): void {
    if (!this.active) return;
    this.rotation += 0.22;
    const t = time * 0.0025 * this.speedScale;
    const x = this.anchorX + Math.sin(t) * this.rangeX;
    const y = this.anchorY + Math.sin(t) * this.rangeY;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.reset(x, y);
  }

  despawn(): void {
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
  }
}
