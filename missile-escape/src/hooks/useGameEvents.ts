import { useCallback, useEffect, useRef, useState } from 'react';
import { EventBus, GameEvents } from '../game/EventBus';
import { getBestScore } from '../game/utils/storage';
import type { GameOverPayload, MilestonePayload, ScoreUpdatePayload } from '../game/types';

export interface Banner {
  id: number;
  message: string;
}

// Bridges Phaser score/game-over/milestone events into React state for the UI layer.
export function useGameEvents() {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [best, setBest] = useState<number>(() => getBestScore());
  const [gameOver, setGameOver] = useState<GameOverPayload | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const bannerIdRef = useRef(0);
  const pendingStartRef = useRef(false);

  useEffect(() => {
    const onScore = (payload: ScoreUpdatePayload) => {
      setScore(payload.score);
      setCoins(payload.coins);
    };
    const onGameOver = (payload: GameOverPayload) => {
      setGameOver(payload);
      setBest(payload.best);
    };
    const onMilestone = (payload: MilestonePayload) => {
      bannerIdRef.current += 1;
      setBanner({ id: bannerIdRef.current, message: payload.message });
    };
    const onSurvivalMode = () => {
      bannerIdRef.current += 1;
      setBanner({ id: bannerIdRef.current, message: 'SURVIVAL MODE ACTIVATED' });
    };
    // Fires once GameScene finishes booting and has registered its own
    // start-game listener. Taps before this point would otherwise be lost.
    const onSceneReady = () => {
      setSceneReady(true);
      if (pendingStartRef.current) {
        pendingStartRef.current = false;
        EventBus.emit(GameEvents.StartGame);
      }
    };
    EventBus.on(GameEvents.ScoreUpdate, onScore);
    EventBus.on(GameEvents.GameOver, onGameOver);
    EventBus.on(GameEvents.Milestone, onMilestone);
    EventBus.on(GameEvents.SurvivalModeStart, onSurvivalMode);
    EventBus.on(GameEvents.SceneReady, onSceneReady);
    return () => {
      EventBus.off(GameEvents.ScoreUpdate, onScore);
      EventBus.off(GameEvents.GameOver, onGameOver);
      EventBus.off(GameEvents.Milestone, onMilestone);
      EventBus.off(GameEvents.SurvivalModeStart, onSurvivalMode);
      EventBus.off(GameEvents.SceneReady, onSceneReady);
    };
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setCoins(0);
    setGameOver(null);
    setBanner(null);
    if (sceneReady) {
      EventBus.emit(GameEvents.StartGame);
    } else {
      // Scene still booting (common on slower phones) - fire once it signals ready.
      pendingStartRef.current = true;
    }
  }, [sceneReady]);

  const restartGame = useCallback(() => {
    setScore(0);
    setCoins(0);
    setGameOver(null);
    setBanner(null);
    EventBus.emit(GameEvents.RestartGame);
  }, []);

  // Dismisses the game-over screen without starting a new run - the Phaser
  // scene just stays frozen on its last frame until Start Run is pressed again.
  const returnToMenu = useCallback(() => {
    setGameOver(null);
    setBanner(null);
  }, []);

  return { score, coins, best, gameOver, banner, sceneReady, startGame, restartGame, returnToMenu };
}
