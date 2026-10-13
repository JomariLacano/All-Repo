import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';
import { WORLD, PLAYER } from '../constants';
import { TEX } from '../textures/generateTextures';
import { Player } from '../entities/Player';
import { Coin } from '../entities/Coin';
import { Missile } from '../entities/Missile';
import { FallingRock } from '../entities/obstacles/FallingRock';
import { TerrainGenerator } from '../systems/TerrainGenerator';
import { MissileSystem } from '../systems/MissileSystem';
import { DifficultyManager } from '../systems/DifficultyManager';
import { ScoreManager } from '../systems/ScoreManager';
import { ParallaxBackground } from '../systems/ParallaxBackground';
import { ParticleManager } from '../systems/ParticleManager';
import { WeatherSystem } from '../systems/WeatherSystem';
import { InputController } from '../systems/InputController';
import type { GameStatus, GameOverCause } from '../types';

type ArcadeBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;

export class GameScene extends Phaser.Scene {
  private status: GameStatus = 'menu';

  private player!: Player;
  private background!: ParallaxBackground;
  private particles!: ParticleManager;
  private weather!: WeatherSystem;
  private difficulty!: DifficultyManager;
  private terrain!: TerrainGenerator;
  private missiles!: MissileSystem;
  private scoreManager!: ScoreManager;
  private inputController!: InputController;

  constructor() {
    super('Game');
  }

  create(): void {
    this.status = 'menu';
    this.cameras.main.setBackgroundColor('#6ec6ff');

    this.background = new ParallaxBackground(this);
    this.particles = new ParticleManager(this);
    this.weather = new WeatherSystem(this);
    this.difficulty = new DifficultyManager();
    this.terrain = new TerrainGenerator(this, this.difficulty);
    this.terrain.reset();

    this.player = new Player(this, PLAYER.startX, WORLD.groundY);
    this.player.runSpeed = 0;
    this.inputController = new InputController(this, this.player);

    this.missiles = new MissileSystem(this, this.player, this.difficulty);
    this.scoreManager = new ScoreManager();

    this.physics.add.collider(this.player, this.terrain.groundGroup);
    this.physics.add.collider(this.player, this.terrain.platformGroup);

    this.physics.add.collider(
      this.terrain.hazardGroup,
      this.terrain.groundGroup,
      (hazard) => this.handleHazardLanded(hazard as ArcadeBody),
    );
    this.physics.add.collider(
      this.terrain.hazardGroup,
      this.terrain.platformGroup,
      (hazard) => this.handleHazardLanded(hazard as ArcadeBody),
    );

    this.physics.add.overlap(
      this.player,
      this.terrain.hazardGroup,
      () => this.endGame('obstacle'),
    );
    this.physics.add.overlap(
      this.player,
      this.terrain.coinGroup,
      (_player, coin) => this.handleCoinCollected(coin as Coin),
    );
    this.physics.add.overlap(
      this.player,
      this.missiles.missileGroup,
      (_player, missile) => this.handleMissileHitPlayer(missile as Missile),
    );
    this.physics.add.collider(
      this.missiles.missileGroup,
      this.terrain.groundGroup,
      (missile) => this.handleMissileTerrainHit(missile as Missile),
    );
    this.physics.add.collider(
      this.missiles.missileGroup,
      this.terrain.platformGroup,
      (missile) => this.handleMissileTerrainHit(missile as Missile),
    );

    this.cameras.main.scrollX = 0;

    EventBus.on(GameEvents.StartGame, this.handleStartGame);
    EventBus.on(GameEvents.RestartGame, this.handleRestartGame);
    EventBus.on(GameEvents.PauseGame, this.handlePauseGame);
    EventBus.on(GameEvents.ResumeGame, this.handleResumeGame);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown);

    EventBus.emit(GameEvents.SceneReady, this);
  }

  update(time: number, delta: number): void {
    this.player.update();

    if (this.status === 'playing') {
      this.difficulty.update(delta);
      this.player.runSpeed = this.difficulty.runSpeed;
      this.terrain.update(time, this.cameras.main);
      this.missiles.update(delta);
      this.scoreManager.update(delta);

      if (Math.random() < 0.02 && this.player.isGrounded) {
        this.particles.runDust(this.player.x, WORLD.groundY);
      }

      if (this.player.y > WORLD.height + 150) {
        this.endGame('pit');
      }
    }

    this.weather.update(delta);
    this.cameras.main.scrollX = this.player.x - 220;
    this.background.update(this.cameras.main.scrollX);
  }

  private handleStartGame = (): void => {
    if (this.status === 'playing') return;
    this.beginRun(false);
  };

  private handleRestartGame = (): void => {
    this.beginRun(true);
  };

  private handlePauseGame = (): void => {
    if (this.status !== 'playing') return;
    this.status = 'paused';
    this.physics.world.pause();
    this.inputController.setEnabled(false);
  };

  private handleResumeGame = (): void => {
    if (this.status !== 'paused') return;
    this.status = 'playing';
    this.physics.world.resume();
    this.inputController.setEnabled(true);
  };

  private beginRun(isRestart: boolean): void {
    this.difficulty.reset();
    this.scoreManager.reset();
    this.terrain.reset();
    this.missiles.reset();
    this.weather.reset();

    this.player.setPosition(PLAYER.startX, WORLD.groundY);
    this.player.setTexture(TEX.player);
    this.player.clearTint();
    this.player.setAngle(0);
    this.player.state = 'running';
    this.player.runSpeed = PLAYER.baseRunSpeed;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setVelocity(0, 0);

    this.cameras.main.scrollX = 0;
    this.inputController.setEnabled(true);
    this.status = 'playing';

    if (isRestart) {
      this.cameras.main.flash(200, 255, 255, 255);
    }
  }

  private handleHazardLanded(hazard: ArcadeBody): void {
    if (hazard instanceof FallingRock) {
      this.terrain.handleRockLanding(hazard);
    }
  }

  private handleCoinCollected(coinObj: Coin): void {
    if (this.status !== 'playing' || !coinObj.active) return;
    this.scoreManager.addCoin(coinObj.isGolden);
    this.particles.coinBurst(coinObj.x, coinObj.y);
    this.terrain.releaseCoin(coinObj);
  }

  private handleMissileHitPlayer(missile: Missile): void {
    if (this.status !== 'playing' || missile.hasExploded) return;
    this.spawnExplosion(missile.x, missile.y, 0.02);
    this.missiles.explodeMissile(missile);
    this.endGame('missile');
  }

  private handleMissileTerrainHit(missile: Missile): void {
    if (missile.hasExploded) return;
    this.spawnExplosion(missile.x, missile.y, 0.012);
    this.missiles.explodeMissile(missile);
  }

  private spawnExplosion(x: number, y: number, shakeIntensity: number): void {
    this.particles.explosionDebris(x, y);
    const ring = this.add.image(x, y, TEX.shockwave).setDepth(29).setAlpha(0.9).setScale(0.2);
    this.tweens.add({
      targets: ring,
      scale: 1.8,
      alpha: 0,
      duration: 420,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
    this.cameras.main.shake(260, shakeIntensity);
  }

  private endGame(cause: GameOverCause): void {
    if (this.status !== 'playing') return;
    this.status = 'gameover';
    this.player.die();
    this.inputController.setEnabled(false);
    this.cameras.main.shake(220, cause === 'missile' ? 0.02 : 0.012);
    const payload = this.scoreManager.finish(cause);
    EventBus.emit(GameEvents.GameOver, payload);
  }

  private handleShutdown = (): void => {
    EventBus.off(GameEvents.StartGame, this.handleStartGame);
    EventBus.off(GameEvents.RestartGame, this.handleRestartGame);
    EventBus.off(GameEvents.PauseGame, this.handlePauseGame);
    EventBus.off(GameEvents.ResumeGame, this.handleResumeGame);
    this.inputController.destroy();
  };
}
