import { useCallback, useState } from 'react';
import { PhaserGame } from './components/PhaserGame';
import { MainMenu } from './components/MainMenu';
import { HUD } from './components/HUD';
import { GameOverScreen } from './components/GameOverScreen';
import { TouchControls } from './components/TouchControls';
import { PauseOverlay } from './components/PauseOverlay';
import { useGameEvents } from './hooks/useGameEvents';
import { EventBus, GameEvents } from './game/EventBus';
import './App.css';

type Screen = 'menu' | 'playing';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [paused, setPaused] = useState(false);
  const { score, coins, best, gameOver, startGame, restartGame } = useGameEvents();

  const handleStart = useCallback(() => {
    setScreen('playing');
    setPaused(false);
    startGame();
  }, [startGame]);

  const handleRestart = useCallback(() => {
    setPaused(false);
    restartGame();
  }, [restartGame]);

  const handlePause = useCallback(() => {
    setPaused(true);
    EventBus.emit(GameEvents.PauseGame);
  }, []);

  const handleResume = useCallback(() => {
    setPaused(false);
    EventBus.emit(GameEvents.ResumeGame);
  }, []);

  const isPlaying = screen === 'playing' && !gameOver;

  return (
    <div className="game-root">
      <PhaserGame />
      {screen === 'menu' && <MainMenu best={best} onStart={handleStart} />}
      {isPlaying && !paused && (
        <>
          <HUD score={score} coins={coins} best={best} onPause={handlePause} />
          <TouchControls />
        </>
      )}
      {isPlaying && paused && <PauseOverlay onResume={handleResume} />}
      {screen === 'playing' && gameOver && (
        <GameOverScreen payload={gameOver} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
