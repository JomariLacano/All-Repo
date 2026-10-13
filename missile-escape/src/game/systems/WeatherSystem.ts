import type Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';
import { WORLD } from '../constants';
import { pick } from '../utils/random';
import type { WeatherType } from '../types';

const WEATHER_CYCLE_MS = 18000;

// Randomly cycles ambient weather for visual variety (bonus requirement).
export class WeatherSystem {
  private current: WeatherType = 'clear';
  private timer = 0;
  private readonly rain: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly snow: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.rain = scene.add
      .particles(0, -20, TEX.raindrop, {
        x: { min: 0, max: WORLD.width },
        y: 0,
        lifespan: 900,
        speedY: { min: 500, max: 700 },
        speedX: -60,
        quantity: 2,
        frequency: 30,
        emitting: false,
      })
      .setDepth(-5)
      .setScrollFactor(0);

    this.snow = scene.add
      .particles(0, -20, TEX.snowflake, {
        x: { min: 0, max: WORLD.width },
        y: 0,
        lifespan: 4000,
        speedY: { min: 40, max: 90 },
        speedX: { min: -20, max: 20 },
        rotate: { min: 0, max: 360 },
        quantity: 1,
        frequency: 90,
        emitting: false,
      })
      .setDepth(-5)
      .setScrollFactor(0);
  }

  update(deltaMs: number): void {
    this.timer += deltaMs;
    if (this.timer >= WEATHER_CYCLE_MS) {
      this.timer = 0;
      this.setWeather(pick<WeatherType>(['clear', 'clear', 'rain', 'snow', 'wind']));
    }
  }

  reset(): void {
    this.timer = 0;
    this.setWeather('clear');
  }

  private setWeather(type: WeatherType): void {
    this.current = type;
    this.rain.emitting = type === 'rain';
    this.snow.emitting = type === 'snow';
  }

  get weather(): WeatherType {
    return this.current;
  }
}
