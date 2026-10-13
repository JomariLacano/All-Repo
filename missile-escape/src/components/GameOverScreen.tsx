import './GameOverScreen.css';
import type { GameOverPayload } from '../game/types';

interface GameOverScreenProps {
  payload: GameOverPayload;
  onRestart: () => void;
}

const CAUSE_LABEL: Record<GameOverPayload['cause'], string> = {
  obstacle: 'You hit an obstacle!',
  pit: 'You fell into a pit!',
  missile: 'A missile got you!',
};

export function GameOverScreen({ payload, onRestart }: GameOverScreenProps) {
  return (
    <div className="overlay game-over">
      <h2>Game Over</h2>
      <p className="cause">{CAUSE_LABEL[payload.cause]}</p>
      <div className="stat-row">
        <span>Score</span>
        <strong>{payload.score}</strong>
      </div>
      <div className="stat-row">
        <span>Best</span>
        <strong>{payload.best}</strong>
      </div>
      <div className="stat-row">
        <span>Coins</span>
        <strong>{payload.coins}</strong>
      </div>
      <div className="stat-row">
        <span>Survived</span>
        <strong>{payload.survivalTime.toFixed(1)}s</strong>
      </div>
      {payload.isNewBest && <div className="new-best">New Best Score!</div>}
      <button className="primary-btn" onClick={onRestart}>
        Run Again
      </button>
    </div>
  );
}
