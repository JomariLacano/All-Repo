import { STORAGE_KEYS } from '../constants';

export function getBestScore(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.bestScore);
    const value = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function setBestScore(score: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.bestScore, String(Math.floor(score)));
  } catch {
    // localStorage unavailable (private browsing / disabled) - fail silently.
  }
}
