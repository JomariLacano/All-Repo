import Phaser from 'phaser';
import { TEX } from '../../textures/generateTextures';

const HAMMER_LENGTH = 92;

// Composite hazard: a purely visual swinging mallet image plus a decoupled,
// invisible Arcade body tracking just the head - so the pivoting handle never
// fights Arcade's position ownership of the collider.
export class Hammer {
  readonly hitbox: Phaser.Physics.Arcade.Sprite;
  private readonly visual: Phaser.GameObjects.Image;
  private anchorX = 0;
  private anchorY = 0;
  private amplitude = 0.9;
  private speedScale = 1;
  private running = false;

  constructor(scene: Phaser.Scene, hazardGroup: Phaser.Physics.Arcade.Group) {
    this.visual = scene.add.image(0, 0, TEX.hammer).setOrigin(0.5, 0).setDepth(21);
    this.visual.setVisible(false);

    this.hitbox = scene.physics.add.sprite(0, 0, TEX.particle);
    this.hitbox.setVisible(false);
    this.hitbox.setAlpha(0);
    const body = this.hitbox.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    // setCircle() alone keeps the body's offset at (0,0), i.e. anchored to
    // the sprite's top-left frame corner - since this tracking sprite's
    // frame (10x10) is far smaller than the 34px hit circle, that left the
    // collider centered ~12px down-right of the actual swung head position.
    // Centering the offset here makes the hitbox match where the mallet head
    // is actually drawn, left or right of the pivot.
    const radius = 17;
    const centerOffset = this.hitbox.width / 2 - radius;
    body.setCircle(radius, centerOffset, centerOffset);
    body.enable = false;
    this.hitbox.setActive(false);
    hazardGroup.add(this.hitbox);
  }

  get active(): boolean {
    return this.running;
  }

  spawn(anchorX: number, anchorY: number, amplitude: number, speedScale: number): void {
    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.amplitude = amplitude;
    this.speedScale = speedScale;
    this.running = true;
    this.visual.setPosition(anchorX, anchorY).setVisible(true);
    this.hitbox.setActive(true);
    const body = this.hitbox.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
  }

  update(time: number): void {
    if (!this.running) return;
    const angle = Math.sin(time * 0.0016 * this.speedScale) * this.amplitude;
    this.visual.setRotation(angle);
    const headX = this.anchorX + Math.sin(angle) * HAMMER_LENGTH;
    const headY = this.anchorY + Math.cos(angle) * HAMMER_LENGTH;
    const body = this.hitbox.body as Phaser.Physics.Arcade.Body;
    body.reset(headX, headY);
  }

  despawn(): void {
    this.running = false;
    this.visual.setVisible(false);
    this.hitbox.setActive(false);
    const body = this.hitbox.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
  }

  destroy(): void {
    this.visual.destroy();
    this.hitbox.destroy();
  }
}
