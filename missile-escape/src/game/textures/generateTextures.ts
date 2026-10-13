import Phaser from 'phaser';

export const TEX = {
  player: 'tex-player',
  playerSlide: 'tex-player-slide',
  playerRun0: 'tex-player-run-0',
  playerRun1: 'tex-player-run-1',
  playerRun2: 'tex-player-run-2',
  playerRun3: 'tex-player-run-3',
  playerJump: 'tex-player-jump',
  playerSkid: 'tex-player-skid',
  ground: 'tex-ground',
  platform: 'tex-platform',
  coin: 'tex-coin',
  coinGolden: 'tex-coin-golden',
  missile: 'tex-missile',
  warning: 'tex-warning',
  explosion: 'tex-explosion',
  shockwave: 'tex-shockwave',
  spike: 'tex-spike',
  saw: 'tex-saw',
  hammer: 'tex-hammer',
  barrel: 'tex-barrel',
  rock: 'tex-rock',
  cloud: 'tex-cloud',
  hillFar: 'tex-hill-far',
  hillNear: 'tex-hill-near',
  sky: 'tex-sky',
  particle: 'tex-particle',
  raindrop: 'tex-raindrop',
  snowflake: 'tex-snowflake',
} as const;

// All art is drawn procedurally with Phaser Graphics -> no external image assets required.
export function generateGameTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const draw = (width: number, height: number, key: string, fn: (gfx: Phaser.GameObjects.Graphics) => void) => {
    g.clear();
    fn(g);
    g.generateTexture(key, width, height);
  };

  // --- Player (running) ---
  draw(56, 70, TEX.player, (gfx) => {
    gfx.fillStyle(0x2d6cdf, 1);
    gfx.fillRoundedRect(10, 22, 30, 36, 10); // torso
    gfx.fillStyle(0xffcf9e, 1);
    gfx.fillCircle(28, 16, 15); // head
    gfx.fillStyle(0xff5252, 1);
    gfx.fillRoundedRect(10, 4, 34, 11, 5); // cap
    gfx.fillStyle(0x1b1b1b, 1);
    gfx.fillCircle(34, 15, 3); // eye
    gfx.fillStyle(0x24408f, 1);
    gfx.fillRoundedRect(14, 52, 11, 16, 4); // back leg
    gfx.fillRoundedRect(31, 52, 11, 16, 4); // front leg
    gfx.fillStyle(0xffcf9e, 1);
    gfx.fillRoundedRect(4, 28, 10, 22, 4); // trailing arm
    gfx.fillRoundedRect(40, 24, 10, 20, 4); // leading arm
  });

  // --- Player (slide / crouch) ---
  draw(60, 40, TEX.playerSlide, (gfx) => {
    gfx.fillStyle(0x2d6cdf, 1);
    gfx.fillRoundedRect(8, 10, 40, 22, 10);
    gfx.fillStyle(0xffcf9e, 1);
    gfx.fillCircle(46, 18, 13);
    gfx.fillStyle(0xff5252, 1);
    gfx.fillRoundedRect(34, 4, 28, 10, 5);
    gfx.fillStyle(0x1b1b1b, 1);
    gfx.fillCircle(52, 17, 2.6);
    gfx.fillStyle(0x24408f, 1);
    gfx.fillRoundedRect(4, 28, 14, 10, 4);
    gfx.fillRoundedRect(24, 28, 14, 10, 4);
  });

  // --- Running cycle, jump, and landing-skid poses (sprint animation frames) ---
  const runnerPose = (
    gfx: Phaser.GameObjects.Graphics,
    lift: number,
    legL: [number, number, number, number],
    legR: [number, number, number, number],
    armL: [number, number, number, number],
    armR: [number, number, number, number],
  ) => {
    gfx.fillStyle(0x2d6cdf, 1);
    gfx.fillRoundedRect(10, 22 + lift, 30, 36, 10);
    gfx.fillStyle(0xffcf9e, 1);
    gfx.fillCircle(28, 16 + lift, 15);
    gfx.fillStyle(0xff5252, 1);
    gfx.fillRoundedRect(10, 4 + lift, 34, 11, 5);
    gfx.fillStyle(0x1b1b1b, 1);
    gfx.fillCircle(34, 15 + lift, 3);
    gfx.fillStyle(0x24408f, 1);
    gfx.fillRoundedRect(...legL, 4);
    gfx.fillRoundedRect(...legR, 4);
    gfx.fillStyle(0xffcf9e, 1);
    gfx.fillRoundedRect(...armL, 4);
    gfx.fillRoundedRect(...armR, 4);
  };

  draw(56, 70, TEX.playerRun0, (gfx) =>
    runnerPose(gfx, 0, [10, 48, 12, 14], [32, 52, 11, 20], [4, 30, 10, 18], [40, 20, 10, 22]),
  );
  draw(56, 70, TEX.playerRun1, (gfx) =>
    runnerPose(gfx, -5, [16, 50, 11, 14], [30, 50, 11, 14], [10, 26, 10, 20], [36, 26, 10, 20]),
  );
  draw(56, 70, TEX.playerRun2, (gfx) =>
    runnerPose(gfx, 0, [13, 52, 11, 20], [34, 48, 12, 14], [4, 20, 10, 22], [42, 30, 10, 18]),
  );
  draw(56, 70, TEX.playerRun3, (gfx) =>
    runnerPose(gfx, -5, [16, 50, 11, 14], [30, 50, 11, 14], [36, 26, 10, 20], [10, 26, 10, 20]),
  );
  draw(56, 70, TEX.playerJump, (gfx) =>
    runnerPose(gfx, -3, [15, 54, 12, 10], [29, 54, 12, 10], [2, 14, 10, 20], [44, 14, 10, 20]),
  );
  draw(56, 70, TEX.playerSkid, (gfx) =>
    runnerPose(gfx, 4, [2, 50, 13, 18], [41, 50, 13, 18], [0, 34, 10, 16], [46, 30, 10, 20]),
  );

  // --- Ground tile ---
  draw(64, 64, TEX.ground, (gfx) => {
    gfx.fillStyle(0x8a5a2b, 1);
    gfx.fillRect(0, 0, 64, 64);
    gfx.fillStyle(0x6b4320, 1);
    gfx.fillRect(0, 44, 64, 20);
    gfx.fillStyle(0x58c93b, 1);
    gfx.fillRect(0, 0, 64, 14);
    gfx.fillStyle(0x6fe050, 1);
    gfx.fillRect(0, 0, 64, 6);
    gfx.fillStyle(0x7a4e26, 1);
    gfx.fillCircle(16, 34, 3);
    gfx.fillCircle(46, 40, 2.5);
    gfx.fillCircle(32, 26, 2);
  });

  // --- Floating platform ---
  draw(96, 28, TEX.platform, (gfx) => {
    gfx.fillStyle(0x9c6b3e, 1);
    gfx.fillRoundedRect(0, 4, 96, 20, 6);
    gfx.fillStyle(0xc08b54, 1);
    gfx.fillRoundedRect(0, 4, 96, 7, 6);
    gfx.fillStyle(0x6e4725, 1);
    for (let i = 0; i < 4; i++) {
      gfx.fillRect(10 + i * 22, 10, 3, 14);
    }
  });

  // --- Coins ---
  draw(28, 28, TEX.coin, (gfx) => {
    gfx.fillStyle(0xffd23f, 1);
    gfx.fillCircle(14, 14, 13);
    gfx.fillStyle(0xffe999, 1);
    gfx.fillCircle(14, 14, 9);
    gfx.fillStyle(0xcf9c1d, 1);
    gfx.fillCircle(14, 14, 3);
  });

  draw(32, 32, TEX.coinGolden, (gfx) => {
    gfx.fillStyle(0xfff1a8, 1);
    gfx.fillCircle(16, 16, 15);
    gfx.fillStyle(0xffd23f, 1);
    gfx.fillCircle(16, 16, 11);
    gfx.fillStyle(0xfff8da, 1);
    gfx.fillCircle(16, 16, 5);
    gfx.lineStyle(2, 0xffffff, 0.9);
    gfx.strokeCircle(16, 16, 15);
  });

  // --- Missile ---
  draw(48, 16, TEX.missile, (gfx) => {
    gfx.fillStyle(0xd8d8d8, 1);
    gfx.fillRoundedRect(0, 4, 34, 8, 4);
    gfx.fillStyle(0xe6413a, 1);
    gfx.fillTriangle(34, 0, 48, 8, 34, 16);
    gfx.fillStyle(0xff8a3d, 1);
    gfx.fillTriangle(0, 2, 10, 8, 0, 6);
    gfx.fillTriangle(0, 10, 10, 8, 0, 14);
    gfx.fillStyle(0xb33, 1);
    gfx.fillRect(6, 2, 4, 12);
  });

  // --- Warning reticle ---
  draw(40, 40, TEX.warning, (gfx) => {
    gfx.lineStyle(3, 0xff2d2d, 1);
    gfx.strokeCircle(20, 20, 17);
    gfx.strokeCircle(20, 20, 9);
    gfx.lineStyle(2, 0xff2d2d, 1);
    gfx.lineBetween(20, 0, 20, 8);
    gfx.lineBetween(20, 32, 20, 40);
    gfx.lineBetween(0, 20, 8, 20);
    gfx.lineBetween(32, 20, 40, 20);
  });

  // --- Explosion blob (single particle frame, scaled/faded in code) ---
  draw(64, 64, TEX.explosion, (gfx) => {
    gfx.fillStyle(0xfff3b0, 1);
    gfx.fillCircle(32, 32, 10);
    gfx.fillStyle(0xffb13d, 1);
    gfx.fillCircle(32, 32, 18);
    gfx.fillStyle(0xff5a2d, 0.9);
    gfx.fillCircle(32, 32, 26);
    gfx.fillStyle(0xff2d2d, 0.5);
    gfx.fillCircle(32, 32, 31);
  });

  // --- Shockwave ring ---
  draw(96, 96, TEX.shockwave, (gfx) => {
    gfx.lineStyle(6, 0xffcf6b, 1);
    gfx.strokeCircle(48, 48, 44);
    gfx.lineStyle(3, 0xffffff, 0.8);
    gfx.strokeCircle(48, 48, 36);
  });

  // --- Spikes ---
  draw(64, 40, TEX.spike, (gfx) => {
    gfx.fillStyle(0x8d8d99, 1);
    for (let i = 0; i < 3; i++) {
      const x0 = i * 22;
      gfx.fillTriangle(x0, 40, x0 + 11, 6, x0 + 22, 40);
    }
    gfx.fillStyle(0xc6c6d2, 1);
    for (let i = 0; i < 3; i++) {
      const x0 = i * 22;
      gfx.fillTriangle(x0 + 8, 40, x0 + 11, 16, x0 + 14, 40);
    }
  });

  // --- Saw blade ---
  draw(48, 48, TEX.saw, (gfx) => {
    gfx.fillStyle(0xb9c0c6, 1);
    gfx.fillCircle(24, 24, 22);
    gfx.fillStyle(0x7d858c, 1);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = 24 + Math.cos(angle) * 18;
      const y1 = 24 + Math.sin(angle) * 18;
      const x2 = 24 + Math.cos(angle) * 24;
      const y2 = 24 + Math.sin(angle) * 24;
      const x3 = 24 + Math.cos(angle + 0.25) * 18;
      const y3 = 24 + Math.sin(angle + 0.25) * 18;
      gfx.fillTriangle(x1, y1, x2, y2, x3, y3);
    }
    gfx.fillStyle(0x50565b, 1);
    gfx.fillCircle(24, 24, 7);
    gfx.fillStyle(0x2b2e30, 1);
    gfx.fillCircle(24, 24, 3);
  });

  // --- Hammer (handle on top, head at bottom; origin top-center for swing pivot) ---
  draw(52, 120, TEX.hammer, (gfx) => {
    gfx.fillStyle(0x8a5a2b, 1);
    gfx.fillRoundedRect(22, 0, 8, 80, 3);
    gfx.fillStyle(0x6b7280, 1);
    gfx.fillRoundedRect(0, 76, 52, 36, 8);
    gfx.fillStyle(0x4b5157, 1);
    gfx.fillRoundedRect(0, 76, 52, 10, 8);
    gfx.fillStyle(0x9aa3ab, 1);
    gfx.fillRoundedRect(6, 86, 40, 8, 3);
  });

  // --- Explosive barrel ---
  draw(42, 50, TEX.barrel, (gfx) => {
    gfx.fillStyle(0xd1352a, 1);
    gfx.fillRoundedRect(2, 4, 38, 44, 8);
    gfx.fillStyle(0x7d1d16, 1);
    gfx.fillRect(2, 10, 38, 6);
    gfx.fillRect(2, 32, 38, 6);
    gfx.fillStyle(0xffd23f, 1);
    gfx.fillCircle(21, 22, 8);
    gfx.fillStyle(0x2b1b17, 1);
    gfx.fillRect(19, 10, 4, 10);
    gfx.fillTriangle(21, 6, 15, 16, 27, 16);
  });

  // --- Falling rock ---
  draw(44, 40, TEX.rock, (gfx) => {
    gfx.fillStyle(0x8c8f94, 1);
    gfx.fillRoundedRect(2, 10, 40, 26, 10);
    gfx.fillStyle(0x6f7277, 1);
    gfx.fillTriangle(4, 22, 16, 6, 24, 20);
    gfx.fillTriangle(24, 24, 36, 10, 42, 24);
    gfx.fillStyle(0xaaadb2, 1);
    gfx.fillCircle(14, 20, 3);
    gfx.fillCircle(30, 26, 2.5);
  });

  // --- Cloud ---
  draw(120, 60, TEX.cloud, (gfx) => {
    gfx.fillStyle(0xffffff, 0.95);
    gfx.fillCircle(30, 36, 20);
    gfx.fillCircle(55, 24, 26);
    gfx.fillCircle(85, 34, 22);
    gfx.fillCircle(100, 40, 16);
    gfx.fillRect(20, 36, 80, 18);
  });

  // --- Parallax hills ---
  draw(960, 220, TEX.hillFar, (gfx) => {
    gfx.fillStyle(0x9adfc6, 1);
    gfx.fillEllipse(140, 220, 420, 180);
    gfx.fillEllipse(520, 220, 500, 200);
    gfx.fillEllipse(860, 220, 380, 160);
  });

  draw(960, 160, TEX.hillNear, (gfx) => {
    gfx.fillStyle(0x4fbf7a, 1);
    gfx.fillEllipse(120, 160, 360, 140);
    gfx.fillEllipse(480, 160, 440, 160);
    gfx.fillEllipse(840, 160, 380, 150);
  });

  // --- Sky gradient (approximated with banded rects) ---
  draw(960, 600, TEX.sky, (gfx) => {
    const top = Phaser.Display.Color.ValueToColor(0x6ec6ff);
    const bottom = Phaser.Display.Color.ValueToColor(0xdff6ff);
    const bands = 40;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(top, bottom, bands, i);
      gfx.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
      gfx.fillRect(0, t * 600, 960, 600 / bands + 1);
    }
  });

  // --- Generic small particle ---
  draw(10, 10, TEX.particle, (gfx) => {
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(5, 5, 5);
  });

  draw(5, 18, TEX.raindrop, (gfx) => {
    gfx.fillStyle(0xbfe3ff, 0.85);
    gfx.fillRoundedRect(0, 0, 5, 18, 2);
  });

  draw(8, 8, TEX.snowflake, (gfx) => {
    gfx.fillStyle(0xffffff, 0.95);
    gfx.fillCircle(4, 4, 4);
  });

  g.destroy();
}
