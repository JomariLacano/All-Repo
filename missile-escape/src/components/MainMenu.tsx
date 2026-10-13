import './MainMenu.css';

interface MainMenuProps {
  best: number;
  ready: boolean;
  onStart: () => void;
}

export function MainMenu({ best, ready, onStart }: MainMenuProps) {
  return (
    <div className="overlay main-menu">
      <h1 className="title">Missile Escape</h1>
      <p className="subtitle">Run. Jump. Slide. Survive the missiles.</p>
      <button className="primary-btn" onClick={onStart} disabled={!ready}>
        {ready ? 'Start Run' : 'Loading…'}
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
      <div className="bonus-tip">
        🎉 Score 10,000+? Screenshot it and send to Jomari Lacano for ₱100 GCash reward!
      </div>
    </div>
  );
}
