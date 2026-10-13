import { useCallback, useEffect, useState } from 'react';
import { EventBus, GameEvents } from '../game/EventBus';
import { getBestScore } from '../game/utils/storage';
import type { GameOverPayload, ScoreUpdatePayload } from '../game/types';

// Bridges Phaser score/game-over events into React state for the UI layer.
export function useGameEvents() {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [best, setBest] = useState<number>(() => getBestScore());
  const [gameOver, setGameOver] = useState<GameOverPayload | null>(null);

  useEffect(() => {
    const onScore = (payload: ScoreUpdatePayload) => {
      setScore(payload.score);
      setCoins(payload.coins);
    };
    const onGameOver = (payload: GameOverPayload) => {
      setGameOver(payload);
      setBest(payload.best);
    };
    EventBus.on(GameEvents.ScoreUpdate, onScore);
    EventBus.on(GameEvents.GameOver, onGameOver);
    return () => {
      EventBus.off(GameEvents.ScoreUpdate, onScore);
      EventBus.off(GameEvents.GameOver, onGameOver);
    };
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setCoins(0);
    setGameOver(null);
    EventBus.emit(GameEvents.StartGame);
  }, []);

  const restartGame = useCallback(() => {
    setScore(0);
    setCoins(0);
    setGameOver(null);
    EventBus.emit(GameEvents.RestartGame);
  }, []);

  return { score, coins, best, gameOver, startGame, restartGame };
}
