import './HUD.css';

interface HUDProps {
  score: number;
  coins: number;
  best: number;
  onPause: () => void;
}

export function HUD({ score, coins, best, onPause }: HUDProps) {
  return (
    <div className="hud">
      <div className="hud-stats">
        <div className="hud-score">Score: {score}</div>
        <div className="hud-best">Best: {best}</div>
        <div className="hud-coins">Coins: {coins}</div>
      </div>
      <button className="pause-btn" onClick={onPause} aria-label="Pause">
        ❚❚
      </button>
    </div>
  );
}
