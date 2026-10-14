import { useCallback, useState } from 'react';
import './MuteButton.css';
import { sound } from '../game/systems/SoundManager';
import { useTapHandler } from '../hooks/useTapHandler';

interface MuteButtonProps {
  className?: string;
}

export function MuteButton({ className }: MuteButtonProps) {
  const [muted, setMutedState] = useState(sound.isMuted);
  const toggle = useCallback(() => {
    setMutedState(sound.toggleMuted());
  }, []);
  const { onPointerUp, onClick } = useTapHandler(toggle);

  return (
    <button
      type="button"
      className={className ? `mute-btn ${className}` : 'mute-btn'}
      onPointerUp={onPointerUp}
      onClick={onClick}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
