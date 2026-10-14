import Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';
import { PLAYER } from '../constants';
import { sound } from '../systems/SoundManager';
import type { PlayerState } from '../types';

const RUN_FRAMES = [TEX.playerRun0, TEX.playerRun1, TEX.playerRun2, TEX.playerRun3] as const;
const BASE_FRAME_DURATION_MS = 150;
const SKID_DURATION_MS = 220;
const LEAN_MAX_RAD = 0.16;
const LEAN_SPEED_RANGE = 500;
const LANDING_IMPACT_VELOCITY = 350;

export class Player extends Phaser.Physics.Arcade.Sprite {
  state: PlayerState = 'running';
  runSpeed = PLAYER.baseRunSpeed;
  private jumpsUsed = 0;
  private sliding = false;
  private grounded = true;
  private wasGrounded = true;
  private previousVelocityY = 0;
  private runFrameTimer = 0;
  private runFrameIndex = 0;
  private skidTimer = 0;
  private landedCallback?: (x: number, y: number) => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEX.player);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setDepth(20);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER.width, PLAYER.height);
    body.setMaxVelocity(100000, 1600);
  }

  /** Called by GameScene so landings can spawn dust particles without a circular import. */
  onLanded(callback: (x: number, y: number) => void): void {
    this.landedCallback = callback;
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
    if (this.grounded) {
      body.setVelocityY(PLAYER.jumpVelocity);
      this.jumpsUsed = 1;
      // Mark airborne immediately - the Arcade body's touching/blocked flags
      // only refresh once per physics step, so a fast double-tap calling
      // jump() twice in the same frame would otherwise still see grounded
      // and repeat the ground jump instead of double-jumping.
      this.grounded = false;
      this.state = 'jumping';
      this.setTexture(TEX.playerJump);
      sound.play('jump');
    } else if (this.jumpsUsed === 1) {
      body.setVelocityY(PLAYER.doubleJumpVelocity);
      this.jumpsUsed = 2;
      this.state = 'jumping';
      sound.play('doubleJump');
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
    this.setRotation(0);
    sound.play('slide');
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

  update(deltaMs: number): void {
    if (this.state === 'dead') return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.runSpeed);

    const grounded = this.isGrounded;
    if (grounded && !this.wasGrounded) {
      this.handleLanding();
    }
    this.wasGrounded = grounded;
    this.grounded = grounded;
    this.previousVelocityY = body.velocity.y;

    if (grounded) {
      this.jumpsUsed = 0;
      if (this.state === 'jumping') {
        this.state = this.sliding ? 'sliding' : 'running';
      }
    } else if (!this.sliding) {
      this.state = 'jumping';
      this.setTexture(TEX.playerJump);
    }

    if (this.skidTimer > 0) {
      this.skidTimer -= deltaMs;
      if (this.skidTimer <= 0) {
        this.runFrameIndex = 0;
      }
    } else if (this.state === 'running') {
      this.updateRunAnimation(deltaMs);
    }

    this.updateLean(deltaMs);
  }

  private handleLanding(): void {
    if (this.previousVelocityY >= LANDING_IMPACT_VELOCITY && !this.sliding) {
      this.skidTimer = SKID_DURATION_MS;
      this.setTexture(TEX.playerSkid);
      this.scene.tweens.add({
        targets: this,
        scaleY: 0.82,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
      this.landedCallback?.(this.x, this.y);
    }
  }

  private updateRunAnimation(deltaMs: number): void {
    const speedRatio = Math.max(1, this.runSpeed / PLAYER.baseRunSpeed);
    const frameDuration = BASE_FRAME_DURATION_MS / speedRatio;
    this.runFrameTimer += deltaMs;
    if (this.runFrameTimer >= frameDuration) {
      this.runFrameTimer = 0;
      this.runFrameIndex = (this.runFrameIndex + 1) % RUN_FRAMES.length;
      this.setTexture(RUN_FRAMES[this.runFrameIndex]);
    }
  }

  private updateLean(deltaMs: number): void {
    if (this.state !== 'running') {
      this.rotation = Phaser.Math.Linear(this.rotation, 0, 0.15);
      return;
    }
    const overSpeed = Phaser.Math.Clamp((this.runSpeed - PLAYER.baseRunSpeed) / LEAN_SPEED_RANGE, 0, 1);
    const target = overSpeed * LEAN_MAX_RAD;
    const lerpFactor = Phaser.Math.Clamp(deltaMs / 120, 0, 1);
    this.rotation = Phaser.Math.Linear(this.rotation, target, lerpFactor);
  }
}

