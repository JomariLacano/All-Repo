import Phaser from 'phaser';
import { TEX } from '../textures/generateTextures';
import { WORLD, WORLD_EVENTS } from '../constants';
import { randFloat, randInt, pick } from '../utils/random';
import type { WorldEventType } from '../types';

const EVENT_POOL: readonly WorldEventType[] = [
  'rainstorm',
  'rainstorm',
  'wind',
  'wind',
  'fog',
  'meteor-shower',
  'earthquake',
];

interface ActiveMeteor {
  sprite: Phaser.Physics.Arcade.Sprite;
}

// Randomly cycles dynamic world events (rainstorm, wind, fog, meteor shower,
// earthquake) for atmosphere and occasional extra hazards.
export class WorldEventSystem {
  readonly meteorGroup: Phaser.Physics.Arcade.Group;

  private readonly scene: Phaser.Scene;
  private readonly platformGroup: Phaser.Physics.Arcade.StaticGroup;
  private readonly rain: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly wind: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly fogOverlay: Phaser.GameObjects.Rectangle;
  private readonly meteors: Set<ActiveMeteor> = new Set();
  private readonly meteorPool: Phaser.Physics.Arcade.Sprite[] = [];

  private current: WorldEventType = 'clear';
  private cooldownMs = 0;
  private activeDurationMs = 0;
  private meteorSpawnTimer = 0;
  private earthquakeTimer = 0;

  constructor(scene: Phaser.Scene, platformGroup: Phaser.Physics.Arcade.StaticGroup) {
    this.scene = scene;
    this.platformGroup = platformGroup;
    this.meteorGroup = scene.physics.add.group();

    this.rain = scene.add
      .particles(0, -20, TEX.raindrop, {
        x: { min: 0, max: WORLD.width },
        y: 0,
        lifespan: 900,
        speedY: { min: 550, max: 780 },
        speedX: -70,
        quantity: 3,
        frequency: 25,
        emitting: false,
      })
      .setDepth(-5)
      .setScrollFactor(0);

    this.wind = scene.add
      .particles(WORLD.width + 10, 0, TEX.raindrop, {
        x: WORLD.width + 10,
        y: { min: 0, max: WORLD.height },
        lifespan: 700,
        speedX: { min: -900, max: -650 },
        speedY: 0,
        scaleX: 0.5,
        scaleY: 2.2,
        rotate: 90,
        tint: 0xe8e8e8,
        alpha: { start: 0.5, end: 0 },
        quantity: 1,
        frequency: 40,
        emitting: false,
      })
      .setDepth(-5)
      .setScrollFactor(0);

    this.fogOverlay = scene.add
      .rectangle(0, 0, WORLD.width, WORLD.height, 0xdfe9f2, 0)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(40);

    this.rollCooldown();
  }

  reset(): void {
    this.endCurrentEvent();
    this.meteors.forEach((m) => this.despawnMeteor(m));
    this.meteors.clear();
    this.rollCooldown();
  }

  get currentEvent(): WorldEventType {
    return this.current;
  }

  update(deltaMs: number, camera: Phaser.Cameras.Scene2D.Camera): void {
    if (this.current === 'clear') {
      this.cooldownMs -= deltaMs;
      if (this.cooldownMs <= 0) {
        this.startRandomEvent();
      }
      return;
    }

    this.activeDurationMs -= deltaMs;
    this.tickCurrentEvent(deltaMs, camera);
    if (this.activeDurationMs <= 0) {
      this.endCurrentEvent();
      this.rollCooldown();
    }
  }

  private rollCooldown(): void {
    this.cooldownMs = randFloat(WORLD_EVENTS.cycleMinMs, WORLD_EVENTS.cycleMaxMs);
  }

  private startRandomEvent(): void {
    const type = pick(EVENT_POOL);
    this.current = type;
    switch (type) {
      case 'rainstorm':
        this.activeDurationMs = WORLD_EVENTS.rainstormDurationMs;
        this.rain.emitting = true;
        break;
      case 'wind':
        this.activeDurationMs = WORLD_EVENTS.windDurationMs;
        this.wind.emitting = true;
        break;
      case 'fog':
        this.activeDurationMs = WORLD_EVENTS.fogDurationMs;
        this.scene.tweens.add({ targets: this.fogOverlay, fillAlpha: 0.4, duration: 600 });
        break;
      case 'meteor-shower':
        this.activeDurationMs = WORLD_EVENTS.meteorShowerDurationMs;
        this.meteorSpawnTimer = 0;
        break;
      case 'earthquake':
        this.activeDurationMs = WORLD_EVENTS.earthquakeDurationMs;
        this.earthquakeTimer = 0;
        this.scene.cameras.main.shake(WORLD_EVENTS.earthquakeDurationMs, WORLD_EVENTS.earthquakeShakeIntensity);
        break;
      case 'clear':
        break;
    }
  }

  private endCurrentEvent(): void {
    this.rain.emitting = false;
    this.wind.emitting = false;
    this.scene.tweens.add({ targets: this.fogOverlay, fillAlpha: 0, duration: 600 });
    this.current = 'clear';
  }

  private tickCurrentEvent(deltaMs: number, camera: Phaser.Cameras.Scene2D.Camera): void {
    if (this.current === 'meteor-shower') {
      this.meteorSpawnTimer += deltaMs;
      if (this.meteorSpawnTimer >= WORLD_EVENTS.meteorIntervalMs) {
        this.meteorSpawnTimer = 0;
        this.spawnMeteor(camera);
      }
    } else if (this.current === 'earthquake') {
      this.earthquakeTimer += deltaMs;
      if (this.earthquakeTimer >= randInt(500, 900)) {
        this.earthquakeTimer = 0;
        this.rattlePlatform();
      }
    }

    this.meteors.forEach((meteor) => {
      if (meteor.sprite.y > WORLD.height + 200) {
        this.despawnMeteor(meteor);
      }
    });
  }

  private acquireMeteorSprite(): Phaser.Physics.Arcade.Sprite {
    const free = this.meteorPool.find((s) => !s.active);
    if (free) return free;
    const sprite = this.scene.physics.add.sprite(0, 0, TEX.rock);
    sprite.setDepth(17);
    sprite.setActive(false);
    sprite.setVisible(false);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.meteorGroup.add(sprite);
    this.meteorPool.push(sprite);
    return sprite;
  }

  private spawnMeteor(camera: Phaser.Cameras.Scene2D.Camera): void {
    const sprite = this.acquireMeteorSprite();
    const x = camera.scrollX + randFloat(40, camera.width - 40);
    sprite.setPosition(x, -60);
    sprite.setScale(1.1);
    sprite.setActive(true);
    sprite.setVisible(true);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(true);
    body.setVelocity(randFloat(-40, 40), randFloat(200, 320));
    this.meteors.add({ sprite });
  }

  despawnMeteor(meteor: ActiveMeteor): void {
    this.meteors.delete(meteor);
    const body = meteor.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;
    meteor.sprite.setActive(false);
    meteor.sprite.setVisible(false);
  }

  findMeteor(sprite: Phaser.Physics.Arcade.Sprite): ActiveMeteor | undefined {
    for (const meteor of this.meteors) {
      if (meteor.sprite === sprite) return meteor;
    }
    return undefined;
  }

  private rattlePlatform(): void {
    const children = this.platformGroup.getChildren();
    if (children.length === 0) return;
    const target = pick(children) as Phaser.GameObjects.GameObject & { body: Phaser.Physics.Arcade.StaticBody };
    const body = target.body;
    if (!body) return;
    body.checkCollision.up = false;
    this.scene.time.delayedCall(450, () => {
      body.checkCollision.up = true;
    });
  }
}
