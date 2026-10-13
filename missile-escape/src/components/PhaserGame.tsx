import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config';

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;
    const game = new Phaser.Game(createGameConfig(containerRef.current));
    gameRef.current = game;

    // Mobile browsers often report a stale/zero layout size on first paint
    // (address bar collapsing, orientation change) - force a rescale once
    // the real viewport settles so the canvas doesn't stay stuck tiny/blank.
    const refresh = () => game.scale.refresh();
    window.addEventListener('resize', refresh);
    window.addEventListener('orientationchange', refresh);
    const settleTimeout = window.setTimeout(refresh, 300);

    return () => {
      window.removeEventListener('resize', refresh);
      window.removeEventListener('orientationchange', refresh);
      window.clearTimeout(settleTimeout);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="phaser-container" />;
}
