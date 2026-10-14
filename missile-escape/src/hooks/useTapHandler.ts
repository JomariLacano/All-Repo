import { useCallback, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { sound } from '../game/systems/SoundManager';

// Some mobile browsers (notably in-app/WebView browsers) don't reliably
// synthesize a 'click' from a touch tap on overlay buttons sitting above the
// Phaser canvas, so the button visually presses (:active) but onClick never
// fires. Firing on 'pointerup' for touch/pen input - and preventing the
// native click that would otherwise follow it - makes taps register
// immediately, while mouse clicks keep using the normal 'click' event.
export function useTapHandler(handler: () => void) {
  const lastFiredAt = useRef(0);

  const fire = useCallback(() => {
    const now = Date.now();
    if (now - lastFiredAt.current < 400) return;
    lastFiredAt.current = now;
    sound.play('click');
    handler();
  }, [handler]);

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse') return;
      event.preventDefault();
      fire();
    },
    [fire],
  );

  return { onPointerUp, onClick: fire };
}
