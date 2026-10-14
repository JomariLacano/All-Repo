import './GameOverScreen.css';
import type { GameOverPayload } from '../game/types';
import { useTapHandler } from '../hooks/useTapHandler';

interface GameOverScreenProps {
  payload: GameOverPayload;
  onRestart: () => void;
  onBackToMenu: () => void;
}

const CAUSE_LABEL: Record<GameOverPayload['cause'], string> = {
  obstacle: 'You hit an obstacle!',
  pit: 'You fell into a pit!',
  missile: 'A missile got you!',
  meteor: 'A meteor crushed you!',
};

export function GameOverScreen({ payload, onRestart, onBackToMenu }: GameOverScreenProps) {
  const restart = useTapHandler(onRestart);
  const backToMenu = useTapHandler(onBackToMenu);
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
      <button type="button" className="primary-btn" onPointerUp={restart.onPointerUp} onClick={restart.onClick}>
        Run Again
      </button>
      <button
        type="button"
        className="secondary-btn"
        onPointerUp={backToMenu.onPointerUp}
        onClick={backToMenu.onClick}
      >
        Back to Menu
      </button>
    </div>
  );
}
