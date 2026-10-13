import Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';
import { PLAYER } from '../constants';
import type { PlayerState } from '../types';

export class Player extends Phaser.Physics.Arcade.Sprite {
  state: PlayerState = 'running';
  runSpeed = PLAYER.baseRunSpeed;
  private jumpsUsed = 0;
  private sliding = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEX.player);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setDepth(20);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER.width, PLAYER.height);
    body.setMaxVelocity(PLAYER.maxRunSpeed + 50, 1600);
  }

  get isGrounded(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down || body.touching.down;
  }

  get isSliding(): boolean {
    return this.sliding;
  }

  jump(): void {
    if (this.state === 'dead') return;
    if (this.sliding) this.endSlide();
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.isGrounded) {
      body.setVelocityY(PLAYER.jumpVelocity);
      this.jumpsUsed = 1;
      this.state = 'jumping';
    } else if (this.jumpsUsed === 1) {
      body.setVelocityY(PLAYER.doubleJumpVelocity);
      this.jumpsUsed = 2;
      this.state = 'jumping';
      this.scene.tweens.add({
        targets: this,
        angle: 360,
        duration: 320,
        onComplete: () => this.setAngle(0),
      });
    }
  }

  startSlide(): void {
    if (this.state === 'dead' || this.sliding || !this.isGrounded) return;
    this.sliding = true;
    this.state = 'sliding';
    this.setTexture(TEX.playerSlide);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER.width + 6, PLAYER.slideHeight);
  }

  endSlide(): void {
    if (!this.sliding) return;
    this.sliding = false;
    this.state = this.isGrounded ? 'running' : 'jumping';
    this.setTexture(TEX.player);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER.width, PLAYER.height);
  }

  die(): void {
    if (this.state === 'dead') return;
    this.state = 'dead';
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);
    this.setTint(0xff5a4d);
  }

  update(): void {
    if (this.state === 'dead') return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.runSpeed);
    if (this.isGrounded) {
      this.jumpsUsed = 0;
      if (this.state === 'jumping') {
        this.state = this.sliding ? 'sliding' : 'running';
      }
    } else if (!this.sliding) {
      this.state = 'jumping';
    }
  }
}
