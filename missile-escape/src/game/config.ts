import Phaser from 'phaser';
import { WORLD } from './constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: WORLD.width,
    height: WORLD.height,
    parent,
    backgroundColor: '#6ec6ff',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: WORLD.gravityY },
        debug: false,
      },
    },
    scene: [BootScene, PreloadScene, GameScene],
    render: {
      antialias: true,
    },
  };
}
