import Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';
import { MISSILE } from '../constants';

export class Missile extends Phaser.Physics.Arcade.Sprite {
  hasExploded = false;
  isSuper = false;

  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
    super(scene, 0, 0, TEX.missile);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(21);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.enable = false;
    this.setActive(false);
    this.setVisible(false);
    group.add(this);
  }

  launch(
    fromX: number,
    fromY: number,
    targetX: number,
    targetY: number,
    speed: number,
    isSuper = false,
  ): void {
    this.hasExploded = false;
    this.isSuper = isSuper;
    this.setPosition(fromX, fromY);
    this.setActive(true);
    this.setVisible(true);
    this.setScale(isSuper ? MISSILE.superMissileScale : 1);
    this.setTint(isSuper ? 0xff6b5a : 0xffffff);
    const angle = Phaser.Math.Angle.Between(fromX, fromY, targetX, targetY);
    this.setRotation(angle);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    const scale = isSuper ? MISSILE.superMissileScale : 1;
    // Resize before reset() - setSize() recenters the body's offset but
    // doesn't resync position, so sizing after reset left the hitbox
    // trailing one frame behind the sprite for every freshly spawned missile.
    body.setSize(this.width * 0.75 * scale, this.height * 0.6 * scale, true);
    body.reset(fromX, fromY);
    const launchSpeed = isSuper ? speed * MISSILE.superMissileSpeedMultiplier : speed;
    this.scene.physics.velocityFromRotation(angle, launchSpeed, body.velocity);
  }

  despawn(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;
    this.setActive(false);
    this.setVisible(false);
    this.setScale(1);
    this.clearTint();
  }
}

