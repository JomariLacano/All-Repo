import { getMuted, setMuted } from '../utils/storage';

export type SfxName =
  | 'jump'
  | 'doubleJump'
  | 'slide'
  | 'coin'
  | 'goldenCoin'
  | 'nearMiss'
  | 'explosion'
  | 'milestone'
  | 'survivalMode'
  | 'gameOver'
  | 'click';

type OscType = OscillatorType;

interface ToneOptions {
  type?: OscType;
  volume?: number;
  glideTo?: number;
  delay?: number;
}

// All sound effects are synthesized with the Web Audio API (oscillators +
// filtered noise bursts) - this project has no audio asset pipeline, so SFX
// are generated in code the same way textures are in generateTextures.ts.
export class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = getMuted();

  get isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    setMuted(muted);
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  play(name: SfxName): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    switch (name) {
      case 'jump':
        this.tone(ctx, 320, 0.11, { type: 'square', glideTo: 560, volume: 0.18 });
        break;
      case 'doubleJump':
        this.tone(ctx, 420, 0.14, { type: 'square', glideTo: 760, volume: 0.18 });
        break;
      case 'slide':
        this.tone(ctx, 220, 0.12, { type: 'triangle', glideTo: 120, volume: 0.14 });
        break;
      case 'coin':
        this.tone(ctx, 880, 0.08, { type: 'sine', volume: 0.16 });
        this.tone(ctx, 1320, 0.09, { type: 'sine', volume: 0.16, delay: 0.05 });
        break;
      case 'goldenCoin':
        this.tone(ctx, 880, 0.08, { type: 'sine', volume: 0.18 });
        this.tone(ctx, 1320, 0.08, { type: 'sine', volume: 0.18, delay: 0.05 });
        this.tone(ctx, 1760, 0.12, { type: 'sine', volume: 0.18, delay: 0.1 });
        break;
      case 'nearMiss':
        this.tone(ctx, 900, 0.1, { type: 'sawtooth', glideTo: 500, volume: 0.12 });
        break;
      case 'explosion':
        this.noiseBurst(ctx, 0.35, 0.3, 900);
        break;
      case 'milestone':
        this.tone(ctx, 523, 0.12, { type: 'sine', volume: 0.16 });
        this.tone(ctx, 659, 0.12, { type: 'sine', volume: 0.16, delay: 0.1 });
        this.tone(ctx, 784, 0.18, { type: 'sine', volume: 0.16, delay: 0.2 });
        break;
      case 'survivalMode':
        this.tone(ctx, 200, 0.4, { type: 'sawtooth', glideTo: 90, volume: 0.2 });
        break;
      case 'gameOver':
        this.tone(ctx, 300, 0.18, { type: 'triangle', glideTo: 140, volume: 0.2 });
        this.tone(ctx, 220, 0.3, { type: 'triangle', glideTo: 80, volume: 0.2, delay: 0.16 });
        break;
      case 'click':
        this.tone(ctx, 520, 0.05, { type: 'sine', volume: 0.14 });
        break;
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtor();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private tone(ctx: AudioContext, freq: number, duration: number, options: ToneOptions = {}): void {
    const startAt = ctx.currentTime + (options.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = options.type ?? 'sine';
    osc.frequency.setValueAtTime(freq, startAt);
    if (options.glideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, options.glideTo), startAt + duration);
    }
    const volume = options.volume ?? 0.15;
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  }

  private noiseBurst(ctx: AudioContext, duration: number, volume: number, filterFreq: number): void {
    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration + 0.02);
  }
}

export const sound = new SoundManager();
