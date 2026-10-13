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
  baseRunSpeed: 220,
  slideDuration: 520,
};

// Speed/difficulty curve: a smooth continuous ramp layered with small (30s) and
// significant (2min) step increases. No cap - the game is meant to become
// nearly impossible the longer a run lasts.
export const DIFFICULTY = {
  smallStepIntervalMs: 30000,
  smallStepAmount: 8,
  bigStepIntervalMs: 120000,
  bigStepAmount: 40,
  continuousSpeedPerSecond: 0.55,
  obstacleDensityPerMinute: 0.16,
  missileFrequencyPerMinute: 0.22,
  missileSpeedPerMinute: 0.12,
  survivalModeAtMs: 15 * 60 * 1000,
  survivalModeExtraMissileFrequency: 0.6,
  survivalModeExtraDensity: 0.4,
};

export const MISSILE = {
  minIntervalS: 5,
  maxIntervalS: 10,
  minIntervalFloorS: 1.1,
  warningDurationMs: 1000,
  baseSpeed: 600,
  nearMissRadius: 95,
  nearMissBonus: 50,
  // Evolution thresholds (survival time in ms).
  twoMissileAtMs: 2 * 60 * 1000,
  waveAtMs: 5 * 60 * 1000,
  superMissileAtMs: 10 * 60 * 1000,
  waveSize: 3,
  waveStaggerMs: 220,
  superMissileChance: 0.22,
  superMissileScale: 1.6,
  superMissileSpeedMultiplier: 1.35,
  superMissileBonus: 120,
};

export const NEAR_MISS_TIERS = {
  insaneDodgeRadius: 28,
  luckyEscapeRadius: 58,
};

export const TERRAIN = {
  generateAheadPx: 1400,
  cleanupBehindPx: 500,
  minGroundWidth: 260,
  maxGroundWidth: 620,
  minGapWidth: 90,
  maxGapWidth: 190,
  floatingPlatformChance: 0.45,
  comboObstacleChance: 0.3,
  fakeSafePathChance: 0.18,
  minGroundWidthFloor: 150,
};

export const SCORING = {
  pointsPerSecond: 10,
  coinValue: 25,
  goldenCoinValue: 150,
  goldenCoinChance: 0.08,
};

export const MILESTONES: ReadonlyArray<{ score: number; message: string }> = [
  { score: 1000, message: 'Good start. Keep running!' },
  { score: 5000, message: "You're getting good at this." },
  {
    score: 10000,
    message:
      '🎉 Reached 10,000 points! Take a screenshot and send it to Jomari Lacano for your imaginary ₱100 reward!',
  },
  { score: 25000, message: 'This run is becoming legendary.' },
  { score: 50000, message: 'Are you even human?' },
  { score: 100000, message: 'You have mastered Missile Escape.' },
];

export const WORLD_EVENTS = {
  cycleMinMs: 22000,
  cycleMaxMs: 40000,
  meteorShowerDurationMs: 8000,
  meteorIntervalMs: 550,
  earthquakeDurationMs: 6000,
  earthquakeShakeIntensity: 0.01,
  fogDurationMs: 12000,
  rainstormDurationMs: 14000,
  windDurationMs: 10000,
};

export const EFFECTS = {
  highSpeedThreshold: 420,
  extremeSpeedThreshold: 750,
  ghostIntervalMs: 55,
  speedLineMaxFrequency: 18,
};

export const STORAGE_KEYS = {
  bestScore: 'missile-escape:best-score',
};

