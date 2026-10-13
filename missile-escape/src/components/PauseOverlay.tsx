import './PauseOverlay.css';

interface PauseOverlayProps {
  onResume: () => void;
}

export function PauseOverlay({ onResume }: PauseOverlayProps) {
  return (
    <div className="overlay pause-overlay">
      <h2>Paused</h2>
      <button className="primary-btn" onClick={onResume}>
        Resume
      </button>
    </div>
  );
}
