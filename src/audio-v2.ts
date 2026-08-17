/**
 * GameAudioV2 — Enhanced audio system for the leadership training web game.
 *
 * Drop-in replacement for GameAudio. Maintains the exact same public API while
 * adding:
 *
 * 1. Expanded music system — 5 scenes (menu, story, duel, training, victory),
 *    each with its own chord progression, melody seeds, bass rhythm, arp pattern,
 *    percussion pattern, and scale (pentatonic / blues).
 * 2. Enhanced SFX — every effect uses multiple oscillator layers, BiquadFilter
 *    chains, optional WaveShaper distortion, stereo panning, and reverb / delay
 *    sends. New effects: pageTurn, notification, achievement, levelUp,
 *    decisionLock, timerTick, cardFlip, coin.
 * 3. Dynamic music transitions — smooth crossfade between scenes, intensity
 *    layers that can be toggled, and a tension parameter that increases urgency.
 * 4. Better sound quality — BiquadFilter chains for warmth, LFO modulation for
 *    organic movement, WaveShaperNode for subtle grit, StereoPannerNode for
 *    spatial placement.
 * 5. Memory management — oscillator-limit gating, pre-generated impulse
 *    responses and noise buffers, automatic node cleanup via onended handlers.
 */

import { EasternSfx } from "./sfx-eastern";
import { AmbientLayers } from "./ambient-layers";

/**
 * Scene master level for ambient music. The layer sits between every phrase
 * note and the music bus, so it must stay high enough to be audible.
 */
const MUSIC_LAYER_GAIN = 0.8;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The five supported ambient music scenes. The original three ("menu",
 * "story", "duel") are preserved for backward compatibility; "training" and
 * "victory" are new.
 */
export type MusicScene = "menu" | "story" | "duel" | "training" | "victory";

/** Configuration that defines the musical character of a scene. */
interface SceneConfig {
  /** Chord progression — each entry is [root, third, fifth, seventh] in Hz. */
  readonly chords: number[][];
  /** Melody note pool in Hz (used for generative melodic phrases). */
  readonly melodySeeds: number[];
  /** Scale intervals (semitones from root) for generative melody fallback. */
  readonly scale: number[];
  /** Bass rhythm: 1 = play, 0 = rest, per beat. */
  readonly bassRhythm: number[];
  /** Arpeggiator step pattern — indices into the current chord. */
  readonly arpPattern: number[];
  /** Percussion pattern per beat: [kick, snare, hat]. */
  readonly percussionPattern: number[][];
  /** Milliseconds between phrases. */
  readonly phraseGap: number;
  /** Number of beats per phrase. */
  readonly beatsPerPhrase: number;
  /** Base lowpass cutoff for the pad layer. */
  readonly padCutoff: number;
  /** Pad oscillator waveform. */
  readonly padWave: OscillatorType;
  /** Bass oscillator waveform. */
  readonly bassWave: OscillatorType;
  /** Melody oscillator waveform. */
  readonly melodyWave: OscillatorType;
  /** Default intensity layers: [pad, bass, arp, melody, percussion]. */
  readonly defaultIntensity: readonly boolean[];
}

/** A running ambient music layer (one per active scene during crossfade). */
interface AmbientLayer {
  scene: MusicScene;
  gain: GainNode;
  timer: number | undefined;
  padNodes: AudioScheduledSourceNode[];
  lfoNodes: AudioScheduledSourceNode[];
  padFilter: BiquadFilterNode | undefined;
  phraseIndex: number;
  active: boolean;
}

/** Options for the rich SFX tone generator. */
interface SfxToneOptions {
  frequency: number;
  /** Target frequency for sweeps (exponential ramp). */
  frequencyEnd?: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  delay?: number;
  /** Lowpass cutoff. */
  cutoff?: number;
  /** Target cutoff for filter sweeps. */
  cutoffEnd?: number;
  /** Stereo pan: -1 (left) to 1 (right). */
  pan?: number;
  /** Reverb send amount (0–1). */
  reverb?: number;
  /** Delay send amount (0–1). */
  delaySend?: number;
  /** Distortion amount (0–1, maps to WaveShaper curve). */
  distortion?: number;
  /** Detune in cents for secondary oscillator layers. */
  detune?: number;
  /** Number of oscillator layers (default 1). */
  layers?: number;
  /** Attack time in seconds (default 0.005). */
  attack?: number;
}

/** Options for the noise-based SFX generator. */
interface SfxNoiseOptions {
  duration: number;
  volume: number;
  filterType: BiquadFilterType;
  filterFreq: number;
  filterQ?: number;
  delay?: number;
  pan?: number;
  reverb?: number;
}

// ---------------------------------------------------------------------------
// Scale constants (semitone offsets from root)
// ---------------------------------------------------------------------------

const PENTATONIC_MAJOR = [0, 2, 4, 7, 9];
const PENTATONIC_MINOR = [0, 3, 5, 7, 10];
const BLUES_SCALE = [0, 3, 5, 6, 7, 10];

// ---------------------------------------------------------------------------
// Scene configurations
// ---------------------------------------------------------------------------

const SCENE_CONFIGS: Record<MusicScene, SceneConfig> = {
  // --- Menu: calm, welcoming, jazzy -----------------------------------------
  menu: {
    chords: [
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
      [110.0, 130.81, 164.81, 196.0], // Am7
      [87.31, 110.0, 130.81, 174.61], // Fmaj7
      [98.0, 123.47, 146.83, 196.0], // G7
    ],
    melodySeeds: [523.25, 587.33, 659.25, 698.46, 783.99, 880.0],
    scale: PENTATONIC_MAJOR,
    bassRhythm: [1, 0, 1, 0, 1, 0, 1, 0],
    arpPattern: [0, 1, 2, 3, 2, 1],
    percussionPattern: [
      [1, 0, 0],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [0, 0, 1],
    ],
    phraseGap: 4800,
    beatsPerPhrase: 8,
    padCutoff: 800,
    padWave: "sine",
    bassWave: "sine",
    melodyWave: "triangle",
    defaultIntensity: [true, true, true, true, false],
  },

  // --- Story: narrative, contemplative, minor ------------------------------
  story: {
    chords: [
      [110.0, 130.81, 164.81, 196.0], // Am7
      [87.31, 110.0, 130.81, 174.61], // Fmaj7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
      [98.0, 123.47, 146.83, 196.0], // G7
    ],
    melodySeeds: [440.0, 493.88, 523.25, 587.33, 659.25, 698.46],
    scale: PENTATONIC_MINOR,
    bassRhythm: [1, 0, 0, 1, 0, 0, 1, 0],
    arpPattern: [0, 2, 1, 3, 1, 2],
    percussionPattern: [
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 1],
      [0, 0, 0],
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 1],
      [0, 0, 0],
    ],
    phraseGap: 4400,
    beatsPerPhrase: 8,
    padCutoff: 700,
    padWave: "sine",
    bassWave: "triangle",
    melodyWave: "sine",
    defaultIntensity: [true, true, true, true, false],
  },

  // --- Duel: tense, urgent, blues-based ------------------------------------
  duel: {
    chords: [
      [73.42, 87.31, 110.0, 146.83], // Dm
      [116.54, 146.83, 174.61, 233.08], // Bb
      [87.31, 110.0, 130.81, 174.61], // F
      [98.0, 123.47, 146.83, 196.0], // C
    ],
    melodySeeds: [293.66, 349.23, 392.0, 440.0, 466.16, 523.25],
    scale: BLUES_SCALE,
    bassRhythm: [1, 0, 1, 1, 0, 1, 1, 0],
    arpPattern: [0, 1, 0, 2, 0, 1],
    percussionPattern: [
      [1, 0, 1],
      [0, 0, 1],
      [1, 0, 1],
      [0, 1, 1],
      [1, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
    ],
    phraseGap: 3200,
    beatsPerPhrase: 8,
    padCutoff: 600,
    padWave: "sawtooth",
    bassWave: "sawtooth",
    melodyWave: "square",
    defaultIntensity: [true, true, true, true, true],
  },

  // --- Training: focused, energetic, steady --------------------------------
  training: {
    chords: [
      [130.81, 164.81, 196.0, 246.94], // C
      [98.0, 123.47, 146.83, 196.0], // G
      [110.0, 130.81, 164.81, 196.0], // Am
      [87.31, 110.0, 130.81, 174.61], // F
    ],
    melodySeeds: [523.25, 587.33, 659.25, 783.99, 880.0, 987.77],
    scale: PENTATONIC_MAJOR,
    bassRhythm: [1, 0, 1, 0, 1, 0, 1, 1],
    arpPattern: [0, 1, 2, 3, 0, 1, 2, 3],
    percussionPattern: [
      [1, 0, 1],
      [0, 0, 1],
      [1, 0, 1],
      [0, 0, 1],
      [1, 0, 1],
      [0, 1, 1],
      [1, 0, 1],
      [0, 0, 1],
    ],
    phraseGap: 3600,
    beatsPerPhrase: 8,
    padCutoff: 900,
    padWave: "triangle",
    bassWave: "triangle",
    melodyWave: "triangle",
    defaultIntensity: [true, true, true, true, true],
  },

  // --- Victory: triumphant, bright, celebratory ----------------------------
  victory: {
    chords: [
      [130.81, 164.81, 196.0, 261.63], // C (bright octave)
      [98.0, 123.47, 146.83, 196.0], // G
      [110.0, 130.81, 164.81, 220.0], // Am
      [87.31, 110.0, 130.81, 174.61], // F
    ],
    melodySeeds: [523.25, 659.25, 783.99, 880.0, 1046.5, 1318.5],
    scale: PENTATONIC_MAJOR,
    bassRhythm: [1, 1, 0, 1, 1, 0, 1, 1],
    arpPattern: [0, 2, 1, 3, 2, 0, 3, 1],
    percussionPattern: [
      [1, 0, 1],
      [0, 1, 1],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    phraseGap: 3400,
    beatsPerPhrase: 8,
    padCutoff: 1200,
    padWave: "triangle",
    bassWave: "sine",
    melodyWave: "triangle",
    defaultIntensity: [true, true, true, true, true],
  },
};

// ---------------------------------------------------------------------------
// Main class
// ---------------------------------------------------------------------------

export class GameAudioV2 {
  // --- Core audio context & buses ------------------------------------------
  private context?: AudioContext;
  private master?: GainNode; // SFX master bus
  private musicGain?: GainNode; // Music master bus

  // --- Shared effect nodes (created once in ensure()) ----------------------
  private reverbConvolver?: ConvolverNode;
  private reverbReturn?: GainNode;
  private delayNode?: DelayNode;
  private delayFeedback?: GainNode;
  private delayReturn?: GainNode;
  private noiseBuffer?: AudioBuffer;
  private distortionCurve?: Float32Array<ArrayBuffer>;
  private eastern?: EasternSfx;
  private ambient?: AmbientLayers;

  // --- Ambient music state -------------------------------------------------
  private currentLayer?: AmbientLayer;
  private fadingLayers: AmbientLayer[] = [];
  private ambientScene: MusicScene = "menu";

  // --- Dynamic control -----------------------------------------------------
  private tension = 0; // 0–1, increases urgency
  private intensityLayers: boolean[] = [true, true, true, true, false];

  // --- Volume / mute -------------------------------------------------------
  private sfxVolume = 0.9;
  private muted = false;
  private musicMuted = false;
  private musicLevel = 0.6;
  private userGesture = false;

  // --- Memory management ---------------------------------------------------
  private activeSources: Set<AudioScheduledSourceNode> = new Set();
  private readonly maxConcurrentSources = 80;

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /** Mark that a user gesture has occurred and resume the context if needed. */
  unlock(): void {
    this.userGesture = true;
    if (this.context && this.context.state === "suspended") {
      void this.context.resume();
    }
  }

  /** 东方主题音效：印章压纸。 */
  playStamp(volume = 0.8): void {
    this.ensure();
    this.eastern?.playStamp(volume);
  }

  /** 东方主题音效：笔墨拂纸。 */
  playBrush(volume = 0.5): void {
    this.ensure();
    this.eastern?.playBrush(volume);
  }

  /** 东方主题音效：展卷。 */
  playScroll(volume = 0.4): void {
    this.ensure();
    this.eastern?.playScroll(volume);
  }

  /** 东方主题音效：铜钱碰撞。 */
  playCoins(volume = 0.6): void {
    this.ensure();
    this.eastern?.playCoins(volume);
  }

  /** 分层环境音：会议室 / 深夜 / 危机。 */
  setEnvironment(env: "boardroom" | "latenight" | "crisis"): void {
    if (!this.userGesture) return;
    this.ensure();
    if (!this.context || !this.master) return;
    if (!this.ambient) {
      this.ambient = new AmbientLayers(this.context, this.master);
    }
    this.ambient.setEnvironment(env);
  }

  /** Lazily create the AudioContext and all shared effect nodes. */
  ensure(): void {
    if (!this.context) {
      const AudioContextClass =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      this.context = new AudioContextClass();

      // SFX master bus
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : this.sfxVolume;
      this.master.connect(this.context.destination);

      // Music master bus
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = this.musicMuted ? 0 : this.musicLevel;
      this.musicGain.connect(this.context.destination);

      this.setupSharedNodes();
      this.eastern = new EasternSfx(this.context, this.master);
    }
    if (this.userGesture && this.context.state === "suspended") {
      void this.context.resume();
    }
  }

  /** Tear down everything — close the context and release all nodes. */
  dispose(): void {
    // Clean up ambient layers immediately (no fade)
    if (this.currentLayer) {
      this.cleanupLayer(this.currentLayer);
      this.currentLayer = undefined;
    }
    for (const layer of this.fadingLayers) {
      this.cleanupLayer(layer);
    }
    this.fadingLayers = [];

    this.activeSources.clear();

    if (this.context) {
      void this.context.close();
      this.context = undefined;
    }
    this.master = undefined;
    this.musicGain = undefined;
    this.reverbConvolver = undefined;
    this.reverbReturn = undefined;
    this.delayNode = undefined;
    this.delayFeedback = undefined;
    this.delayReturn = undefined;
    this.noiseBuffer = undefined;
  }

  // -------------------------------------------------------------------------
  // Volume & mute control (same API as GameAudio)
  // -------------------------------------------------------------------------

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(
        muted ? 0 : this.sfxVolume,
        this.context.currentTime,
        0.02,
      );
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume / 100));
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(
        this.muted ? 0 : this.sfxVolume,
        this.context.currentTime,
        0.02,
      );
    }
  }

  setMusicMuted(muted: boolean): void {
    this.musicMuted = muted;
    if (this.musicGain && this.context) {
      this.musicGain.gain.setTargetAtTime(
        muted ? 0 : this.musicLevel,
        this.context.currentTime,
        0.05,
      );
    }
    if (!muted && this.currentLayer && this.context) {
      const now = this.context.currentTime;
      this.currentLayer.gain.gain.cancelScheduledValues(now);
      this.currentLayer.gain.gain.setValueAtTime(
        this.currentLayer.gain.gain.value,
        now,
      );
      this.currentLayer.gain.gain.linearRampToValueAtTime(
        MUSIC_LAYER_GAIN,
        now + 0.5,
      );
    }
  }

  setMusicVolume(volume: number): void {
    this.musicLevel = Math.max(0, Math.min(1, volume / 100));
    const v = this.musicMuted ? 0 : this.musicLevel;
    if (this.musicGain && this.context) {
      this.musicGain.gain.setTargetAtTime(v, this.context.currentTime, 0.05);
    }
    if (!this.musicMuted && this.currentLayer && this.context) {
      const now = this.context.currentTime;
      if (this.currentLayer.gain.gain.value < MUSIC_LAYER_GAIN * 0.5) {
        this.currentLayer.gain.gain.cancelScheduledValues(now);
        this.currentLayer.gain.gain.setValueAtTime(
          this.currentLayer.gain.gain.value,
          now,
        );
        this.currentLayer.gain.gain.linearRampToValueAtTime(
          MUSIC_LAYER_GAIN,
          now + 0.5,
        );
      }
    }
  }

  // -------------------------------------------------------------------------
  // Original SFX (enhanced with layers, filters, reverb, panning)
  // -------------------------------------------------------------------------

  ui(): void {
    this.sfxTone({
      frequency: 420,
      duration: 0.07,
      type: "sine",
      volume: 0.018,
      reverb: 0.08,
    });
  }

  choose(): void {
    this.sfxTone({
      frequency: 520,
      duration: 0.09,
      type: "triangle",
      volume: 0.028,
      reverb: 0.1,
      layers: 2,
      detune: 4,
    });
    this.sfxTone({
      frequency: 780,
      duration: 0.11,
      type: "sine",
      volume: 0.02,
      delay: 0.06,
      reverb: 0.12,
    });
  }

  expert(): void {
    this.sfxTone({
      frequency: 523.25,
      duration: 0.13,
      type: "triangle",
      volume: 0.045,
      reverb: 0.2,
      layers: 2,
      detune: 3,
    });
    this.sfxTone({
      frequency: 659.25,
      duration: 0.15,
      type: "triangle",
      volume: 0.04,
      delay: 0.08,
      reverb: 0.2,
    });
    this.sfxTone({
      frequency: 783.99,
      duration: 0.22,
      type: "sine",
      volume: 0.035,
      delay: 0.16,
      reverb: 0.25,
      delaySend: 0.1,
    });
  }

  partial(): void {
    this.sfxTone({
      frequency: 392,
      duration: 0.13,
      type: "triangle",
      volume: 0.04,
      reverb: 0.12,
    });
    this.sfxTone({
      frequency: 466.16,
      duration: 0.17,
      type: "sine",
      volume: 0.03,
      delay: 0.09,
      reverb: 0.15,
    });
  }

  risk(): void {
    this.sfxTone({
      frequency: 220,
      duration: 0.2,
      type: "sawtooth",
      volume: 0.028,
      cutoff: 1200,
      distortion: 0.15,
      reverb: 0.15,
    });
    this.sfxTone({
      frequency: 164.81,
      duration: 0.26,
      type: "sine",
      volume: 0.035,
      delay: 0.08,
      reverb: 0.2,
    });
  }

  duelPick(): void {
    this.sfxTone({
      frequency: 660,
      duration: 0.08,
      type: "square",
      volume: 0.018,
      cutoff: 2500,
      pan: 0.15,
    });
  }

  round(): void {
    this.sfxTone({
      frequency: 330,
      duration: 0.1,
      type: "triangle",
      volume: 0.03,
      reverb: 0.1,
    });
    this.sfxTone({
      frequency: 495,
      duration: 0.13,
      type: "sine",
      volume: 0.025,
      delay: 0.07,
      reverb: 0.12,
    });
  }

  win(): void {
    this.sfxTone({
      frequency: 523.25,
      duration: 0.13,
      type: "triangle",
      volume: 0.05,
      reverb: 0.25,
      layers: 2,
      detune: 3,
    });
    this.sfxTone({
      frequency: 659.25,
      duration: 0.15,
      type: "triangle",
      volume: 0.045,
      delay: 0.1,
      reverb: 0.25,
    });
    this.sfxTone({
      frequency: 783.99,
      duration: 0.19,
      type: "triangle",
      volume: 0.04,
      delay: 0.2,
      reverb: 0.3,
    });
    this.sfxTone({
      frequency: 1046.5,
      duration: 0.28,
      type: "sine",
      volume: 0.03,
      delay: 0.3,
      reverb: 0.35,
      delaySend: 0.15,
    });
  }

  lose(): void {
    this.sfxTone({
      frequency: 392,
      duration: 0.17,
      type: "sine",
      volume: 0.045,
      reverb: 0.3,
    });
    this.sfxTone({
      frequency: 311.13,
      duration: 0.21,
      type: "sine",
      volume: 0.04,
      delay: 0.12,
      reverb: 0.3,
    });
    this.sfxTone({
      frequency: 233.08,
      duration: 0.3,
      type: "sine",
      volume: 0.035,
      delay: 0.24,
      reverb: 0.35,
      delaySend: 0.12,
    });
  }

  remoteConnected(): void {
    this.sfxTone({
      frequency: 520,
      duration: 0.11,
      type: "triangle",
      volume: 0.035,
      reverb: 0.15,
      layers: 2,
      detune: 4,
    });
    this.sfxTone({
      frequency: 780,
      duration: 0.15,
      type: "sine",
      volume: 0.03,
      delay: 0.08,
      reverb: 0.2,
      delaySend: 0.1,
    });
  }

  trainingStart(): void {
    this.sfxTone({
      frequency: 261.63,
      duration: 0.13,
      type: "triangle",
      volume: 0.04,
      reverb: 0.15,
    });
    this.sfxTone({
      frequency: 329.63,
      duration: 0.15,
      type: "triangle",
      volume: 0.035,
      delay: 0.08,
      reverb: 0.15,
    });
    this.sfxTone({
      frequency: 392,
      duration: 0.21,
      type: "sine",
      volume: 0.03,
      delay: 0.16,
      reverb: 0.2,
    });
    this.sfxTone({
      frequency: 523.25,
      duration: 0.3,
      type: "sine",
      volume: 0.022,
      delay: 0.26,
      reverb: 0.25,
      delaySend: 0.1,
    });
  }

  trainingCorrect(): void {
    this.sfxTone({
      frequency: 440,
      duration: 0.11,
      type: "triangle",
      volume: 0.03,
      reverb: 0.12,
    });
    this.sfxTone({
      frequency: 554.37,
      duration: 0.17,
      type: "sine",
      volume: 0.024,
      delay: 0.08,
      reverb: 0.15,
    });
  }

  trainingMastery(): void {
    this.sfxTone({
      frequency: 392,
      duration: 0.17,
      type: "triangle",
      volume: 0.04,
      reverb: 0.2,
      layers: 2,
      detune: 3,
    });
    this.sfxTone({
      frequency: 523.25,
      duration: 0.19,
      type: "triangle",
      volume: 0.035,
      delay: 0.1,
      reverb: 0.2,
    });
    this.sfxTone({
      frequency: 659.25,
      duration: 0.25,
      type: "sine",
      volume: 0.03,
      delay: 0.2,
      reverb: 0.25,
    });
    this.sfxTone({
      frequency: 783.99,
      duration: 0.36,
      type: "sine",
      volume: 0.022,
      delay: 0.32,
      reverb: 0.3,
      delaySend: 0.15,
    });
  }

  // -------------------------------------------------------------------------
  // New SFX
  // -------------------------------------------------------------------------

  /** Paper-rustle page turn: layered bandpass-filtered noise. */
  pageTurn(): void {
    this.sfxNoise({
      duration: 0.15,
      volume: 0.03,
      filterType: "bandpass",
      filterFreq: 2500,
      filterQ: 1.5,
      pan: -0.2,
      reverb: 0.12,
    });
    this.sfxNoise({
      duration: 0.08,
      volume: 0.02,
      filterType: "bandpass",
      filterFreq: 3000,
      filterQ: 1.2,
      delay: 0.06,
      pan: 0.2,
    });
  }

  /** Gentle two-note chime for notifications. */
  notification(): void {
    this.sfxTone({
      frequency: 880,
      duration: 0.15,
      type: "sine",
      volume: 0.03,
      reverb: 0.3,
      layers: 2,
      detune: 5,
    });
    this.sfxTone({
      frequency: 1318.5,
      duration: 0.22,
      type: "sine",
      volume: 0.025,
      delay: 0.08,
      reverb: 0.35,
      delaySend: 0.1,
    });
  }

  /** Triumphant ascending arpeggio fanfare. */
  achievement(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.sfxTone({
        frequency: freq,
        duration: 0.36,
        type: "triangle",
        volume: 0.035,
        delay: i * 0.07,
        reverb: 0.4,
        layers: 2,
        detune: 4,
        pan: (i - 1.5) * 0.15,
        delaySend: 0.15,
      });
    });
  }

  /** Rising frequency sweep with harmonic layer. */
  levelUp(): void {
    this.sfxTone({
      frequency: 200,
      frequencyEnd: 800,
      duration: 0.35,
      type: "sawtooth",
      volume: 0.03,
      cutoff: 400,
      cutoffEnd: 3000,
      reverb: 0.3,
      delaySend: 0.15,
    });
    this.sfxTone({
      frequency: 400,
      frequencyEnd: 1600,
      duration: 0.3,
      type: "triangle",
      volume: 0.02,
      delay: 0.05,
      reverb: 0.25,
    });
    this.sfxTone({
      frequency: 600,
      frequencyEnd: 2400,
      duration: 0.25,
      type: "sine",
      volume: 0.015,
      delay: 0.1,
      reverb: 0.2,
    });
  }

  /** Solid low square click + high sine confirmation. */
  decisionLock(): void {
    this.sfxTone({
      frequency: 150,
      duration: 0.06,
      type: "square",
      volume: 0.025,
      cutoff: 800,
      distortion: 0.1,
    });
    this.sfxTone({
      frequency: 1200,
      duration: 0.09,
      type: "sine",
      volume: 0.02,
      delay: 0.02,
      reverb: 0.1,
    });
  }

  /** Very short high click for timer ticks. */
  timerTick(): void {
    this.sfxTone({
      frequency: 2000,
      duration: 0.025,
      type: "square",
      volume: 0.008,
      cutoff: 3000,
    });
  }

  /** Quick downward sweep + noise for card flips. */
  cardFlip(): void {
    this.sfxTone({
      frequency: 800,
      frequencyEnd: 300,
      duration: 0.1,
      type: "triangle",
      volume: 0.025,
      cutoff: 2500,
    });
    this.sfxNoise({
      duration: 0.06,
      volume: 0.015,
      filterType: "bandpass",
      filterFreq: 2000,
      filterQ: 2,
      delay: 0.01,
      pan: 0.1,
    });
  }

  /** Classic two-tone coin / resource pickup. */
  coin(): void {
    this.sfxTone({
      frequency: 987.77,
      duration: 0.08,
      type: "square",
      volume: 0.02,
      cutoff: 4000,
      reverb: 0.08,
    });
    this.sfxTone({
      frequency: 1318.5,
      duration: 0.16,
      type: "square",
      volume: 0.018,
      delay: 0.08,
      cutoff: 4000,
      reverb: 0.12,
      delaySend: 0.08,
    });
  }

  // -------------------------------------------------------------------------
  // Ambient music (same API, extended scene type)
  // -------------------------------------------------------------------------

  /**
   * Start ambient music for the given scene. If music is already playing the
   * same scene this is a no-op; if a different scene is playing the call is
   * ignored (use setAmbientScene for crossfade transitions).
   */
  startAmbient(scene: MusicScene = "menu"): void {
    // Browser autoplay policy: don't start audio before a user gesture.
    if (!this.userGesture) {
      return;
    }
    this.ensure();
    if (!this.context || !this.master) {
      return;
    }
    // Already running — original behaviour was to bail out.
    if (this.currentLayer) {
      return;
    }
    this.startNewLayer(scene, 1.0);
  }

  /**
   * Start ambient music on the first user gesture if no scene layer is running.
   * Lets any first click bring the BGM back even when it does not navigate.
   */
  startAmbientIfIdle(scene: MusicScene = this.ambientScene): void {
    if (!this.userGesture || this.currentLayer || !this.context || !this.musicGain) {
      return;
    }
    this.startNewLayer(scene, 1.0);
  }

  /**
   * Crossfade to a new scene. If the same scene is already playing this is a
   * no-op. Otherwise the current layer fades out over ~1.5 s while the new
   * layer fades in simultaneously.
   */
  setAmbientScene(scene: MusicScene): void {
    if (this.ambientScene === scene && this.currentLayer) {
      return;
    }
    if (!this.userGesture) {
      this.ambientScene = scene; // remember for when gesture arrives
      return;
    }
    this.ensure();
    if (!this.context || !this.master) {
      return;
    }
    // Crossfade: fade out old layer while fading in new.
    if (this.currentLayer) {
      this.fadeOutLayer(this.currentLayer);
      this.currentLayer = undefined;
    }
    this.startNewLayer(scene, 1.5);
  }

  /** Stop all ambient music with a short fade. */
  stopAmbient(): void {
    // Immediately clean up any layers that were already fading out.
    for (const layer of this.fadingLayers) {
      this.cleanupLayer(layer);
    }
    this.fadingLayers = [];

    // Fade out the current layer.
    if (this.currentLayer) {
      this.fadeOutLayer(this.currentLayer);
      this.currentLayer = undefined;
    }
  }

  // -------------------------------------------------------------------------
  // Dynamic control (new API)
  // -------------------------------------------------------------------------

  /**
   * Set the tension level (0–1). Higher tension:
   *  - speeds up the phrase tempo (up to 15 %),
   *  - brightens the filter cutoff,
   *  - enables the percussion layer above 0.4,
   *  - raises the melody octave above 0.6,
   *  - adds extra melody notes.
   */
  setTension(tension: number): void {
    this.tension = Math.max(0, Math.min(1, tension));
    // Auto-toggle percussion based on tension.
    this.intensityLayers[4] = this.tension > 0.4;
  }

  /**
   * Manually toggle an intensity layer.
   * Layer indices: 0 = pad, 1 = bass, 2 = arpeggiator, 3 = melody, 4 = percussion.
   */
  setIntensity(layer: number, active: boolean): void {
    if (layer >= 0 && layer < this.intensityLayers.length) {
      this.intensityLayers[layer] = active;
    }
  }

  /** Returns the currently active (or last-requested) scene. */
  getScene(): MusicScene {
    return this.ambientScene;
  }

  // -------------------------------------------------------------------------
  // Private: shared node setup
  // -------------------------------------------------------------------------

  private setupSharedNodes(): void {
    if (!this.context) return;
    const ctx = this.context;

    // --- Reverb (ConvolverNode with pre-generated impulse response) --------
    this.reverbConvolver = ctx.createConvolver();
    this.reverbConvolver.buffer = this.createImpulseResponse(2.2, 3.0);
    this.reverbReturn = ctx.createGain();
    this.reverbReturn.gain.value = 0.3;
    this.reverbConvolver.connect(this.reverbReturn);
    this.reverbReturn.connect(ctx.destination);

    // --- Delay (with feedback loop) ----------------------------------------
    this.delayNode = ctx.createDelay(1.0);
    this.delayNode.delayTime.value = 0.25;
    this.delayFeedback = ctx.createGain();
    this.delayFeedback.gain.value = 0.35;
    this.delayReturn = ctx.createGain();
    this.delayReturn.gain.value = 0.25;
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode); // feedback loop
    this.delayNode.connect(this.delayReturn);
    this.delayReturn.connect(ctx.destination);

    // --- Pre-generated noise buffer (for percussion & SFX) -----------------
    this.noiseBuffer = this.createNoiseBuffer(1.0);

    // --- Pre-generated distortion curve ------------------------------------
    this.distortionCurve = this.createDistortionCurve(5);
  }

  /** Generate a stereo impulse response for the reverb convolver. */
  private createImpulseResponse(duration: number, decay: number): AudioBuffer {
    const ctx = this.context!;
    const rate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(rate * duration));
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  /** Generate a soft-clip distortion curve for the WaveShaperNode. */
  private createDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const n = 4096;
    const buffer = new ArrayBuffer(n * 4);
    const curve = new Float32Array(buffer);
    const k = amount;
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] =
        ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /** Generate a white-noise buffer for percussion and noise-based SFX. */
  private createNoiseBuffer(duration: number): AudioBuffer {
    const ctx = this.context!;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /** Create a StereoPannerNode if the browser supports it. */
  private createStereoPanner(): StereoPannerNode | null {
    if (!this.context) return null;
    if (typeof this.context.createStereoPanner === "function") {
      return this.context.createStereoPanner();
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // Private: source tracking & cleanup
  // -------------------------------------------------------------------------

  /**
   * Register a source node for cleanup. Returns false (and the caller should
   * bail) when the concurrent-source limit has been reached.
   */
  private trackSource(
    source: AudioScheduledSourceNode,
    outputNode?: AudioNode,
  ): boolean {
    if (this.activeSources.size >= this.maxConcurrentSources) {
      return false;
    }
    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
      try {
        source.disconnect();
      } catch {
        // already disconnected — ignore
      }
      if (outputNode) {
        try {
          outputNode.disconnect();
        } catch {
          // already disconnected — ignore
        }
      }
    };
    return true;
  }

  // -------------------------------------------------------------------------
  // Private: SFX tone & noise generators
  // -------------------------------------------------------------------------

  /**
   * Create a rich SFX tone with filter chain, optional distortion, stereo
   * panning, reverb/delay sends, and multiple detuned oscillator layers.
   */
  private sfxTone(opts: SfxToneOptions): void {
    if (!this.context || !this.master || this.muted) return;
    if (this.activeSources.size >= this.maxConcurrentSources) return;

    const ctx = this.context;
    const start = ctx.currentTime + (opts.delay ?? 0);
    const layers = opts.layers ?? 1;
    const attack = opts.attack ?? 0.005;
    const cutoff = opts.cutoff ?? 5000;

    // --- Output gain with attack + exponential decay -----------------------
    const outGain = ctx.createGain();
    outGain.gain.setValueAtTime(0, start);
    outGain.gain.linearRampToValueAtTime(opts.volume, start + attack);
    outGain.gain.exponentialRampToValueAtTime(0.0001, start + opts.duration);

    // --- Filter chain: lowpass → (optional WaveShaper) --------------------
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = cutoff;
    lp.Q.value = 0.8;

    if (opts.cutoffEnd !== undefined) {
      lp.frequency.setValueAtTime(cutoff, start);
      lp.frequency.exponentialRampToValueAtTime(
        Math.max(20, opts.cutoffEnd),
        start + opts.duration,
      );
    }

    let chainEnd: AudioNode = lp;

    if (opts.distortion && this.distortionCurve) {
      const shaper = ctx.createWaveShaper();
      shaper.curve = this.distortionCurve;
      shaper.oversample = "2x";
      lp.connect(shaper);
      chainEnd = shaper;
    }

    // --- Stereo panner ----------------------------------------------------
    const panner = this.createStereoPanner();
    if (panner && opts.pan !== undefined) {
      panner.pan.value = opts.pan;
    }

    // --- Connect chain: filter → gain → (panner?) → master ----------------
    chainEnd.connect(outGain);
    if (panner) {
      outGain.connect(panner);
      panner.connect(this.master);
    } else {
      outGain.connect(this.master);
    }

    // --- Reverb send ------------------------------------------------------
    if (this.reverbConvolver && opts.reverb) {
      const reverbSend = ctx.createGain();
      reverbSend.gain.value = opts.reverb;
      outGain.connect(reverbSend);
      reverbSend.connect(this.reverbConvolver);
    }

    // --- Delay send -------------------------------------------------------
    if (this.delayNode && opts.delaySend) {
      const delaySend = ctx.createGain();
      delaySend.gain.value = opts.delaySend;
      outGain.connect(delaySend);
      delaySend.connect(this.delayNode);
    }

    // --- Create oscillator layers -----------------------------------------
    for (let i = 0; i < layers; i++) {
      const osc = ctx.createOscillator();
      osc.type = opts.type;
      if (opts.detune && i > 0) {
        osc.detune.value = opts.detune * i;
      }
      if (opts.frequencyEnd !== undefined) {
        osc.frequency.setValueAtTime(opts.frequency, start);
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(1, opts.frequencyEnd),
          start + opts.duration,
        );
      } else {
        osc.frequency.value = opts.frequency;
      }
      osc.connect(lp);

      if (!this.trackSource(osc, outGain)) {
        // Over limit — stop immediately.
        try {
          osc.stop(start);
        } catch {
          // ignore
        }
        return;
      }
      osc.start(start);
      osc.stop(start + opts.duration + 0.05);
    }
  }

  /**
   * Create a filtered noise burst (for percussion-style SFX and effects).
   */
  private sfxNoise(opts: SfxNoiseOptions): void {
    if (!this.context || !this.master || this.muted || !this.noiseBuffer) return;
    if (this.activeSources.size >= this.maxConcurrentSources) return;

    const ctx = this.context;
    const start = ctx.currentTime + (opts.delay ?? 0);

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = opts.filterType;
    filter.frequency.value = opts.filterFreq;
    if (opts.filterQ !== undefined) {
      filter.Q.value = opts.filterQ;
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(opts.volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + opts.duration);

    const panner = this.createStereoPanner();
    if (panner && opts.pan !== undefined) {
      panner.pan.value = opts.pan;
    }

    noise.connect(filter);
    filter.connect(gain);
    if (panner) {
      gain.connect(panner);
      panner.connect(this.master);
    } else {
      gain.connect(this.master);
    }

    if (this.reverbConvolver && opts.reverb) {
      const reverbSend = ctx.createGain();
      reverbSend.gain.value = opts.reverb;
      gain.connect(reverbSend);
      reverbSend.connect(this.reverbConvolver);
    }

    if (!this.trackSource(noise, gain)) {
      return;
    }
    noise.start(start);
    noise.stop(start + opts.duration + 0.05);
  }

  // -------------------------------------------------------------------------
  // Private: music tone generator
  // -------------------------------------------------------------------------

  /**
   * Play a single music note through the given ambient layer. Uses a
   * highpass → lowpass filter chain for warmth, a smooth attack/decay envelope,
   * subtle random stereo panning, and a light reverb send.
   */
  private musicTone(
    layer: AmbientLayer,
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay: number,
    cutoff: number,
  ): void {
    if (!this.context || !this.musicGain) return;
    if (this.activeSources.size >= this.maxConcurrentSources) return;

    const ctx = this.context;
    const start = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;

    // Filter chain: highpass (remove sub-bass rumble) → lowpass (warmth)
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 50;
    hp.Q.value = 0.5;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = cutoff;
    lp.Q.value = 0.7;

    // Smooth envelope: quick attack, exponential decay
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.04);
    gain.gain.setTargetAtTime(0.0001, start + duration * 0.4, duration * 0.25);

    // Subtle random stereo pan for organic spatial feel
    const panner = this.createStereoPanner();
    if (panner) {
      panner.pan.value = (Math.random() - 0.5) * 0.5;
    }

    osc.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    if (panner) {
      gain.connect(panner);
      panner.connect(layer.gain);
    } else {
      gain.connect(layer.gain);
    }

    // Light reverb send for music
    if (this.reverbConvolver) {
      const reverbSend = ctx.createGain();
      reverbSend.gain.value = volume * 0.25;
      gain.connect(reverbSend);
      reverbSend.connect(this.reverbConvolver);
    }

    if (!this.trackSource(osc, gain)) {
      return;
    }
    osc.start(start);
    osc.stop(start + duration + 0.2);
  }

  // -------------------------------------------------------------------------
  // Private: percussion (noise + envelope)
  // -------------------------------------------------------------------------

  /**
   * Play a percussion hit. Uses pre-generated noise buffer through a filter
   * with an amplitude envelope. The kick also gets a sine body layer for punch.
   */
  private playPercussion(
    layer: AmbientLayer,
    type: "kick" | "snare" | "hat",
    delay: number,
    volume: number,
  ): void {
    if (!this.context || !this.musicGain || !this.noiseBuffer) {
      return;
    }
    if (this.activeSources.size >= this.maxConcurrentSources) return;

    const ctx = this.context;
    const start = ctx.currentTime + delay;

    // --- Noise layer ------------------------------------------------------
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    switch (type) {
      case "kick":
        filter.type = "lowpass";
        filter.frequency.value = 200;
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
        break;
      case "snare":
        filter.type = "highpass";
        filter.frequency.value = 1000;
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
        break;
      case "hat":
        filter.type = "highpass";
        filter.frequency.value = 6000;
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);
        break;
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(layer.gain);

    if (!this.trackSource(noise)) {
      return;
    }
    noise.start(start);
    noise.stop(start + 0.3);

    // --- Sine body for kick (adds punch) ----------------------------------
    if (type === "kick") {
      if (this.activeSources.size >= this.maxConcurrentSources) return;
      const kickOsc = ctx.createOscillator();
      kickOsc.type = "sine";
      kickOsc.frequency.setValueAtTime(120, start);
      kickOsc.frequency.exponentialRampToValueAtTime(40, start + 0.1);
      const kickGain = ctx.createGain();
      kickGain.gain.setValueAtTime(volume * 1.8, start);
      kickGain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      kickOsc.connect(kickGain);
      kickGain.connect(layer.gain);
      if (!this.trackSource(kickOsc)) {
        return;
      }
      kickOsc.start(start);
      kickOsc.stop(start + 0.2);
    }
  }

  // -------------------------------------------------------------------------
  // Private: ambient layer management
  // -------------------------------------------------------------------------

  /** Create a new ambient layer (pad drone + LFO) for the given scene. */
  private createAmbientLayer(scene: MusicScene): AmbientLayer {
    const ctx = this.context!;
    const config = SCENE_CONFIGS[scene];

    const layer: AmbientLayer = {
      scene,
      gain: ctx.createGain(),
      timer: undefined,
      padNodes: [],
      lfoNodes: [],
      padFilter: undefined,
      phraseIndex: 0,
      active: true,
    };

    layer.gain.gain.value = 0;
    layer.gain.connect(this.musicGain!);

    // --- Pad filter (shared by all pad oscillators) -----------------------
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = config.padCutoff;
    padFilter.Q.value = 1.0;
    layer.padFilter = padFilter;

    // --- LFO modulating the pad filter cutoff for organic movement --------
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.15 + Math.random() * 0.2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = config.padCutoff * 0.12;
    lfo.connect(lfoGain);
    lfoGain.connect(padFilter.frequency);
    lfo.start();
    layer.lfoNodes.push(lfo);

    // --- Pad oscillators (root, fifth, octave root) -----------------------
    const rootFreq = config.chords[0][0];
    const fifthFreq = config.chords[0][2];
    const padFreqs = [rootFreq / 2, rootFreq, fifthFreq / 2];

    for (const freq of padFreqs) {
      const osc = ctx.createOscillator();
      osc.type = config.padWave;
      osc.frequency.value = freq;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.03;
      osc.connect(oscGain);
      oscGain.connect(padFilter);
      osc.start();
      layer.padNodes.push(osc);
    }

    padFilter.connect(layer.gain);

    // Apply default intensity for this scene
    this.intensityLayers = [...config.defaultIntensity];

    return layer;
  }

  /** Start a new layer: create, fade in, and begin the phrase scheduler. */
  private startNewLayer(scene: MusicScene, fadeInDuration: number): void {
    if (!this.context || !this.musicGain) return;

    this.ambientScene = scene;
    this.currentLayer = this.createAmbientLayer(scene);

    // Fade in
    const now = this.context.currentTime;
    this.currentLayer.gain.gain.setValueAtTime(0, now);
    this.currentLayer.gain.gain.linearRampToValueAtTime(
      this.musicMuted ? 0 : MUSIC_LAYER_GAIN,
      now + fadeInDuration,
    );

    // Play first phrase immediately, then schedule subsequent phrases.
    this.playPhrase(this.currentLayer);
    this.scheduleNextPhrase(this.currentLayer);
  }

  /**
   * Fade out a layer over ~1.5 s, then clean it up. The layer is added to
   * fadingLayers and removed after the cleanup timeout fires.
   */
  private fadeOutLayer(layer: AmbientLayer): void {
    layer.active = false;
    if (layer.timer !== undefined) {
      window.clearTimeout(layer.timer);
      layer.timer = undefined;
    }
    if (this.context) {
      const now = this.context.currentTime;
      const currentVal = layer.gain.gain.value;
      layer.gain.gain.cancelScheduledValues(now);
      layer.gain.gain.setValueAtTime(currentVal, now);
      layer.gain.gain.linearRampToValueAtTime(0, now + 1.5);
    }
    this.fadingLayers.push(layer);
    window.setTimeout(() => {
      this.cleanupLayer(layer);
      const idx = this.fadingLayers.indexOf(layer);
      if (idx >= 0) {
        this.fadingLayers.splice(idx, 1);
      }
    }, 2000);
  }

  /** Immediately stop all nodes in a layer and disconnect them. */
  private cleanupLayer(layer: AmbientLayer): void {
    layer.active = false;
    if (layer.timer !== undefined) {
      window.clearTimeout(layer.timer);
      layer.timer = undefined;
    }
    for (const node of layer.padNodes) {
      try {
        node.stop();
        node.disconnect();
      } catch {
        // already stopped — ignore
      }
    }
    for (const node of layer.lfoNodes) {
      try {
        node.stop();
        node.disconnect();
      } catch {
        // already stopped — ignore
      }
    }
    if (layer.padFilter) {
      try {
        layer.padFilter.disconnect();
      } catch {
        // ignore
      }
    }
    try {
      layer.gain.disconnect();
    } catch {
      // ignore
    }
    layer.padNodes = [];
    layer.lfoNodes = [];
  }

  /** Schedule the next phrase for a layer using setTimeout (allows tempo changes). */
  private scheduleNextPhrase(layer: AmbientLayer): void {
    if (!layer.active) return;
    const config = SCENE_CONFIGS[layer.scene];
    // Tension speeds up the tempo by up to 15 %.
    const gap = config.phraseGap * (1 - this.tension * 0.15);
    layer.timer = window.setTimeout(() => {
      if (!layer.active) return;
      this.playPhrase(layer);
      this.scheduleNextPhrase(layer);
    }, gap);
  }

  /**
   * Play one musical phrase: pad chord, bass line, arpeggiator, melody, and
   * percussion — each gated by the current intensity layers and shaped by the
   * tension parameter.
   */
  private playPhrase(layer: AmbientLayer): void {
    if (!this.context || !layer.active) return;

    const config = SCENE_CONFIGS[layer.scene];
    const chord = config.chords[layer.phraseIndex % config.chords.length];
    const beatDur = config.phraseGap / config.beatsPerPhrase / 1000;
    const tension = this.tension;
    const cutoffBoost = tension * 400;

    // --- Pad layer: sustained chord tones with slow filter ----------------
    if (this.intensityLayers[0]) {
      chord.forEach((freq, i) => {
        this.musicTone(
          layer,
          freq,
          beatDur * 6,
          config.padWave,
          0.05,
          i * 0.04,
          config.padCutoff + cutoffBoost,
        );
      });
    }

    // --- Bass layer: root note following the rhythm pattern ---------------
    if (this.intensityLayers[1]) {
      config.bassRhythm.forEach((beat, i) => {
        if (beat) {
          const noteDur = tension > 0.5 ? beatDur * 0.8 : beatDur * 0.5;
          this.musicTone(
            layer,
            chord[0] / 2,
            noteDur,
            config.bassWave,
            0.14,
            i * beatDur,
            300,
          );
        }
      });
      // Every other phrase, add a low "heartbeat" pulse
      if (layer.phraseIndex % 2 === 0) {
        this.musicTone(
          layer,
          chord[0] / 4,
          beatDur * 0.6,
          "sine",
          0.1,
          0,
          260,
        );
      }
    }

    // --- Arpeggiator layer: cycling chord tones in scene-specific pattern -
    if (this.intensityLayers[2]) {
      const arpBeatDur = beatDur * 0.5;
      config.arpPattern.forEach((idx, i) => {
        const freq = chord[idx % chord.length] * 2;
        this.musicTone(
          layer,
          freq,
          arpBeatDur * 1.5,
          "triangle",
          0.055,
          i * arpBeatDur,
          2000 + cutoffBoost,
        );
      });
    }

    // --- Melody layer: generative notes from scene seeds with variation ---
    if (this.intensityLayers[3]) {
      const seed = config.melodySeeds;
      const noteCount = 3 + Math.floor(tension * 2);
      for (let i = 0; i < noteCount; i++) {
        const note =
          seed[
            (layer.phraseIndex * 3 + i * 2 + Math.floor(Math.random() * 2)) %
              seed.length
          ];
        // Higher tension raises the melody octave
        const octave = tension > 0.6 ? 1 : Math.random() < 0.15 ? 0.5 : 1;
        this.musicTone(
          layer,
          note * octave,
          beatDur * 2,
          config.melodyWave,
          0.09,
          0.3 + i * beatDur * 0.6,
          1500 + cutoffBoost,
        );
      }
    }

    // --- Percussion layer: noise-based kick / snare / hat -----------------
    if (this.intensityLayers[4]) {
      config.percussionPattern.forEach((beat, i) => {
        const time = i * beatDur;
        if (beat[0]) this.playPercussion(layer, "kick", time, 0.07);
        if (beat[1]) this.playPercussion(layer, "snare", time, 0.05);
        if (beat[2]) this.playPercussion(layer, "hat", time, 0.035);
      });
    }

    layer.phraseIndex++;
  }
}
