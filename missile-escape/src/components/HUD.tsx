import './HUD.css';
import { useTapHandler } from '../hooks/useTapHandler';
import { MuteButton } from './MuteButton';

interface HUDProps {
  score: number;
  coins: number;
  best: number;
  onPause: () => void;
}

export function HUD({ score, coins, best, onPause }: HUDProps) {
  const { onPointerUp, onClick } = useTapHandler(onPause);
  return (
    <div className="hud">
      <div className="hud-stats">
        <div className="hud-score">Score: {score}</div>
        <div className="hud-best">Best: {best}</div>
        <div className="hud-coins">Coins: {coins}</div>
      </div>
      <div className="hud-actions">
        <MuteButton />
        <button className="pause-btn" onPointerUp={onPointerUp} onClick={onClick} aria-label="Pause">
          ❚❚
        </button>
      </div>
    </div>
  );
}
