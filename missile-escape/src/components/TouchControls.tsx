import './TouchControls.css';
import { EventBus, GameEvents } from '../game/EventBus';

// Virtual buttons for mobile: tap to jump (tap again mid-air to double jump),
// hold to slide.
export function TouchControls() {
  return (
    <div className="touch-controls">
      <button
        className="touch-btn slide-btn"
        onPointerDown={() => EventBus.emit(GameEvents.InputSlideDown)}
        onPointerUp={() => EventBus.emit(GameEvents.InputSlideUp)}
        onPointerLeave={() => EventBus.emit(GameEvents.InputSlideUp)}
      >
        Slide
      </button>
      <button
        className="touch-btn jump-btn"
        onPointerDown={() => EventBus.emit(GameEvents.InputJumpDown)}
      >
        Jump
      </button>
    </div>
  );
}
