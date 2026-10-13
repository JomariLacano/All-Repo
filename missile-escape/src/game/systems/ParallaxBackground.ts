import Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';
import { WORLD } from '../constants';

// Camera-fixed layers whose tilePosition is offset by scrollX * factor to
// fake depth without moving real world geometry.
export class ParallaxBackground {
  private readonly clouds: Phaser.GameObjects.TileSprite;
  private readonly hillFar: Phaser.GameObjects.TileSprite;
  private readonly hillNear: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene) {
    scene.add.image(0, 0, TEX.sky).setOrigin(0, 0).setScrollFactor(0).setDepth(-40);
    this.clouds = scene.add
      .tileSprite(0, 30, WORLD.width, 120, TEX.cloud)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setAlpha(0.9)
      .setDepth(-30);
    this.hillFar = scene.add
      .tileSprite(0, WORLD.height - 220, WORLD.width, 220, TEX.hillFar)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-20);
    this.hillNear = scene.add
      .tileSprite(0, WORLD.height - 150, WORLD.width, 150, TEX.hillNear)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-10);
  }

  update(scrollX: number): void {
    this.clouds.tilePositionX = scrollX * 0.08;
    this.hillFar.tilePositionX = scrollX * 0.25;
    this.hillNear.tilePositionX = scrollX * 0.5;
  }
}
