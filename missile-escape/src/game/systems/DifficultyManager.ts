import { DIFFICULTY, MISSILE, PLAYER } from '../constants';
import type { DifficultyState } from '../types';

// Escalates run speed, obstacle density, and missile pressure continuously,
// with extra step-bumps every 30s (small) and 2min (significant). No cap.
export class DifficultyManager {
  private elapsedTimeMs = 0;

  update(deltaMs: number): void {
    this.elapsedTimeMs += deltaMs;
  }

  reset(): void {
    this.elapsedTimeMs = 0;
  }

  get elapsedMs(): number {
    return this.elapsedTimeMs;
  }

  get survivalMode(): boolean {
    return this.elapsedTimeMs >= DIFFICULTY.survivalModeAtMs;
  }

  get state(): DifficultyState {
    const elapsedS = this.elapsedTimeMs / 1000;
    const elapsedMinutes = elapsedS / 60;
    const smallSteps = Math.floor(this.elapsedTimeMs / DIFFICULTY.smallStepIntervalMs);
    const bigSteps = Math.floor(this.elapsedTimeMs / DIFFICULTY.bigStepIntervalMs);
    const survivalBonus = this.survivalMode ? 1 : 0;

    return {
      level: smallSteps,
      runSpeedMultiplier: 1,
      obstacleDensityMultiplier:
        1 +
        elapsedMinutes * DIFFICULTY.obstacleDensityPerMinute +
        survivalBonus * DIFFICULTY.survivalModeExtraDensity,
      missileFrequencyMultiplier:
        1 +
        elapsedMinutes * DIFFICULTY.missileFrequencyPerMinute +
        survivalBonus * DIFFICULTY.survivalModeExtraMissileFrequency,
      missileSpeedMultiplier: 1 + elapsedMinutes * DIFFICULTY.missileSpeedPerMinute + smallSteps * 0.015 + bigSteps * 0.04,
      survivalMode: this.survivalMode,
    };
  }

  get runSpeed(): number {
    const elapsedS = this.elapsedTimeMs / 1000;
    const smallSteps = Math.floor(this.elapsedTimeMs / DIFFICULTY.smallStepIntervalMs);
    const bigSteps = Math.floor(this.elapsedTimeMs / DIFFICULTY.bigStepIntervalMs);
    return (
      PLAYER.baseRunSpeed +
      elapsedS * DIFFICULTY.continuousSpeedPerSecond +
      smallSteps * DIFFICULTY.smallStepAmount +
      bigSteps * DIFFICULTY.bigStepAmount
    );
  }

  get missileSpeed(): number {
    return MISSILE.baseSpeed * this.state.missileSpeedMultiplier;
  }

  get missileIntervalRange(): [number, number] {
    const factor = this.state.missileFrequencyMultiplier;
    const min = Math.max(MISSILE.minIntervalFloorS, MISSILE.minIntervalS / factor);
    const max = Math.max(min + 0.5, MISSILE.maxIntervalS / factor);
    return [min, max];
  }

  /** How many missiles should be launched per warning event right now. */
  get missileCountPerWave(): number {
    if (this.elapsedTimeMs >= MISSILE.waveAtMs) return MISSILE.waveSize;
    if (this.elapsedTimeMs >= MISSILE.twoMissileAtMs) return 2;
    return 1;
  }

  get superMissileEligible(): boolean {
    return this.elapsedTimeMs >= MISSILE.superMissileAtMs;
  }
}

