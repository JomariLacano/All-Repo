import Phaser from 'phaser';

// Singleton event emitter bridging React UI and Phaser scenes.
export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  StartGame: 'start-game',
  RestartGame: 'restart-game',
  PauseGame: 'pause-game',
  ResumeGame: 'resume-game',
  SceneReady: 'current-scene-ready',
  ScoreUpdate: 'score-update',
  GameOver: 'game-over',
  Milestone: 'milestone',
  SurvivalModeStart: 'survival-mode-start',
  InputJumpDown: 'input-jump-down',
  InputSlideDown: 'input-slide-down',
  InputSlideUp: 'input-slide-up',
} as const;
