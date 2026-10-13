// Central tuning constants. Keeping magic numbers here makes difficulty balancing easy.

export const WORLD = {
  width: 960,
  height: 600,
  gravityY: 1900,
  groundY: 480,
};

export const PLAYER = {
  startX: 180,
  width: 44,
  height: 64,
  slideHeight: 34,
  jumpVelocity: -680,
  doubleJumpVelocity: -560,
  baseRunSpeed: 230,
  maxRunSpeed: 520,
  slideDuration: 520,
};

export const DIFFICULTY = {
  intervalMs: 30000,
  maxLevel: 12,
  runSpeedStep: 0.08,
  obstacleDensityStep: 0.12,
  missileFrequencyStep: 0.1,
  missileSpeedStep: 0.09,
};

export const MISSILE = {
  minIntervalS: 5,
  maxIntervalS: 10,
  minIntervalFloorS: 1.8,
  warningDurationMs: 1000,
  baseSpeed: 620,
  maxSpeed: 1150,
  nearMissRadius: 90,
  nearMissBonus: 50,
};

export const TERRAIN = {
  generateAheadPx: 1400,
  cleanupBehindPx: 500,
  minGroundWidth: 260,
  maxGroundWidth: 620,
  minGapWidth: 90,
  maxGapWidth: 190,
  floatingPlatformChance: 0.45,
};

export const SCORING = {
  pointsPerSecond: 10,
  coinValue: 25,
  goldenCoinValue: 150,
  goldenCoinChance: 0.08,
};

export const STORAGE_KEYS = {
  bestScore: 'missile-escape:best-score',
};
