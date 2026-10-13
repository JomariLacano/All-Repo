// Shared type definitions used across the Phaser game layer and the React UI layer.

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover';

export type PlayerState = 'running' | 'jumping' | 'sliding' | 'dead';

export type MissileSpawnSide = 'top-left' | 'top-right' | 'offscreen-left' | 'offscreen-right';

export type WeatherType = 'clear' | 'rain' | 'snow' | 'wind';

export type GameOverCause = 'obstacle' | 'pit' | 'missile';

export interface ScoreUpdatePayload {
  score: number;
  coins: number;
  survivalTime: number;
}

export interface GameOverPayload {
  score: number;
  best: number;
  isNewBest: boolean;
  coins: number;
  survivalTime: number;
  cause: GameOverCause;
}

export interface DifficultyState {
  level: number;
  runSpeedMultiplier: number;
  obstacleDensityMultiplier: number;
  missileFrequencyMultiplier: number;
  missileSpeedMultiplier: number;
}

export interface NearMissPayload {
  bonus: number;
}
