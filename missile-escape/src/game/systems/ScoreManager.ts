import { EventBus, GameEvents } from '../EventBus';
import { SCORING } from '../constants';
import { getBestScore, setBestScore } from '../utils/storage';
import type { GameOverCause, GameOverPayload } from '../types';

// Tracks survival time + coin bonuses, emits live score updates, and
// reconciles the best score against localStorage at game over.
export class ScoreManager {
  private survivalMs = 0;
  private coinScore = 0;
  private coinsCollected = 0;
  private nearMisses = 0;
  private lastEmitMs = 0;

  reset(): void {
    this.survivalMs = 0;
    this.coinScore = 0;
    this.coinsCollected = 0;
    this.nearMisses = 0;
    this.lastEmitMs = 0;
  }

  update(deltaMs: number): void {
    this.survivalMs += deltaMs;
    this.lastEmitMs += deltaMs;
    if (this.lastEmitMs >= 100) {
      this.lastEmitMs = 0;
      EventBus.emit(GameEvents.ScoreUpdate, {
        score: this.currentScore,
        coins: this.coinsCollected,
        survivalTime: this.survivalMs / 1000,
      });
    }
  }

  addCoin(golden: boolean): void {
    this.coinScore += golden ? SCORING.goldenCoinValue : SCORING.coinValue;
    this.coinsCollected += 1;
  }

  addNearMiss(bonus: number): void {
    this.coinScore += bonus;
    this.nearMisses += 1;
  }

  get currentScore(): number {
    const survivalScore = Math.floor((this.survivalMs / 1000) * SCORING.pointsPerSecond);
    return survivalScore + this.coinScore;
  }

  finish(cause: GameOverCause): GameOverPayload {
    const score = this.currentScore;
    const best = getBestScore();
    const isNewBest = score > best;
    if (isNewBest) {
      setBestScore(score);
    }
    return {
      score,
      best: isNewBest ? score : best,
      isNewBest,
      coins: this.coinsCollected,
      survivalTime: this.survivalMs / 1000,
      cause,
    };
  }
}
