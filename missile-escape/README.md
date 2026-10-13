# Missile Escape

An endless runner built with **React**, **TypeScript**, **Vite**, and **Phaser 3**.
The character runs automatically and never stops; you only control jumping
(and double-jumping) and sliding while dodging obstacles and homing missiles.

## Controls

| Input | Action |
| --- | --- |
| `Space` | Jump (press again mid-air to double jump) |
| `S` (hold) | Slide / crouch |
| Touch: Jump / Slide buttons | Same actions on mobile |

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build (tsc -b && vite build)
npm run preview  # preview the production build
```

## Project structure

```
src/
  game/                    Phaser-side game code (framework-agnostic)
    scenes/                Boot -> Preload (procedural textures) -> Game
    entities/              Player, Coin, Missile, WarningMarker, obstacles/
    systems/                TerrainGenerator, MissileSystem, DifficultyManager,
                            ScoreManager, ParallaxBackground, ParticleManager,
                            WeatherSystem, InputController, ObjectPool
    textures/              Procedural Graphics-based texture generation
    utils/                 random helpers, localStorage best-score persistence
    constants.ts           All tunable gameplay numbers
    types.ts               Shared TS types/event payloads
    EventBus.ts            Phaser <-> React event bridge
  components/              React UI: MainMenu, HUD, GameOverScreen,
                            PauseOverlay, TouchControls, PhaserGame (mounts
                            the Phaser.Game instance)
  hooks/useGameEvents.ts    Subscribes to EventBus, exposes score/best/gameOver
```

## Design notes

- **No external art assets.** All sprites (player, terrain, obstacles, coins,
  missiles, parallax hills/clouds) are drawn procedurally at boot time with
  Phaser's `Graphics.generateTexture`, so the project is fully self-contained.
- **World stays still, camera moves.** Ground, platforms, and obstacles are
  placed at fixed world coordinates; the camera follows the player, which is
  what makes "remove old objects behind the camera" a simple cleanup pass in
  `TerrainGenerator` instead of manually translating every object each frame.
- **Object pooling** is used for coins, missiles, and all obstacle types to
  avoid per-frame allocation/GC churn during infinite procedural generation.
- **Best score** is persisted with `localStorage` only — no backend, accounts,
  or database.

