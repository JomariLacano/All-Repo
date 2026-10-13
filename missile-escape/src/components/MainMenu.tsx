import './MainMenu.css';

interface MainMenuProps {
  best: number;
  onStart: () => void;
}

export function MainMenu({ best, onStart }: MainMenuProps) {
  return (
    <div className="overlay main-menu">
      <h1 className="title">Missile Escape</h1>
      <p className="subtitle">Run. Jump. Slide. Survive the missiles.</p>
      <button className="primary-btn" onClick={onStart}>
        Start Run
      </button>
      <div className="best-score">Best Score: {best}</div>
      <div className="controls-hint">
        <span>
          <kbd>Space</kbd> Jump &middot; Double-tap for Double Jump
        </span>
        <span>
          <kbd>S</kbd> Slide
        </span>
      </div>
    </div>
  );
}
