import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';
import type { Player } from '../entities/Player';

// Bridges keyboard (Space/S) and virtual touch buttons (via EventBus) to the player.
export class InputController {
  private readonly player: Player;
  private readonly spaceKey: Phaser.Input.Keyboard.Key;
  private readonly sKey: Phaser.Input.Keyboard.Key;
  private enabled = true;

  constructor(scene: Phaser.Scene, player: Player) {
    this.player = player;
    const keyboard = scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    this.spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.sKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    this.spaceKey.on('down', this.handleJump);
    this.sKey.on('down', this.handleSlideDown);
    this.sKey.on('up', this.handleSlideUp);

    EventBus.on(GameEvents.InputJumpDown, this.handleJump);
    EventBus.on(GameEvents.InputSlideDown, this.handleSlideDown);
    EventBus.on(GameEvents.InputSlideUp, this.handleSlideUp);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private handleJump = (): void => {
    if (!this.enabled) return;
    this.player.jump();
  };

  private handleSlideDown = (): void => {
    if (!this.enabled) return;
    this.player.startSlide();
  };

  private handleSlideUp = (): void => {
    if (!this.enabled) return;
    this.player.endSlide();
  };

  destroy(): void {
    this.spaceKey.off('down', this.handleJump);
    this.sKey.off('down', this.handleSlideDown);
    this.sKey.off('up', this.handleSlideUp);
    EventBus.off(GameEvents.InputJumpDown, this.handleJump);
    EventBus.off(GameEvents.InputSlideDown, this.handleSlideDown);
    EventBus.off(GameEvents.InputSlideUp, this.handleSlideUp);
  }
}
