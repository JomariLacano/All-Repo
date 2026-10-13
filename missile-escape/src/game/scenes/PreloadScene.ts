import Phaser from 'phaser';
import { generateGameTextures } from '../textures/generateTextures';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  create(): void {
    generateGameTextures(this);
    this.scene.start('Game');
  }
}
