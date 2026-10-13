import { DIFFICULTY, MISSILE, PLAYER } from '../constants';
import type { DifficultyState } from '../types';

// Escalates run speed, obstacle density, and missile pressure every fixed interval.
export class DifficultyManager {
  private elapsedMs = 0;
  private level = 0;

  update(deltaMs: number): void {
    this.elapsedMs += deltaMs;
    const nextLevel = Math.min(
      DIFFICULTY.maxLevel,
      Math.floor(this.elapsedMs / DIFFICULTY.intervalMs),
    );
    this.level = nextLevel;
  }

  reset(): void {
    this.elapsedMs = 0;
    this.level = 0;
  }

  get state(): DifficultyState {
    return {
      level: this.level,
      runSpeedMultiplier: 1 + this.level * DIFFICULTY.runSpeedStep,
      obstacleDensityMultiplier: 1 + this.level * DIFFICULTY.obstacleDensityStep,
      missileFrequencyMultiplier: 1 + this.level * DIFFICULTY.missileFrequencyStep,
      missileSpeedMultiplier: 1 + this.level * DIFFICULTY.missileSpeedStep,
    };
  }

  get runSpeed(): number {
    const speed = PLAYER.baseRunSpeed * this.state.runSpeedMultiplier;
    return Math.min(speed, PLAYER.maxRunSpeed);
  }

  get missileSpeed(): number {
    const speed = MISSILE.baseSpeed * this.state.missileSpeedMultiplier;
    return Math.min(speed, MISSILE.maxSpeed);
  }

  get missileIntervalRange(): [number, number] {
    const factor = this.state.missileFrequencyMultiplier;
    const min = Math.max(MISSILE.minIntervalFloorS, MISSILE.minIntervalS / factor);
    const max = Math.max(min + 0.5, MISSILE.maxIntervalS / factor);
    return [min, max];
  }
}
