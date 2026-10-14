import './PauseOverlay.css';
import { useTapHandler } from '../hooks/useTapHandler';

interface PauseOverlayProps {
  onResume: () => void;
}

export function PauseOverlay({ onResume }: PauseOverlayProps) {
  const { onPointerUp, onClick } = useTapHandler(onResume);
  return (
    <div className="overlay pause-overlay">
      <h2>Paused</h2>
      <button type="button" className="primary-btn" onPointerUp={onPointerUp} onClick={onClick}>
        Resume
      </button>
    </div>
  );
}
