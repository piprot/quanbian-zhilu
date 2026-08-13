/**
 * ============================================================================
 *  MusicClimax — 三首高潮音乐程序化合成模块
 * ============================================================================
 *
 *  使用 OfflineAudioContext 将音乐渲染为 WAV 文件，可直接部署为音频资源。
 *
 *  三首曲目:
 *    1. Theme Song (主题曲)    — 60s，首页 + 关键结算时刻
 *    2. Duel BGM (对决音乐)    — 45s，1v1 对决场景
 *    3. Victory Fanfare (胜利短曲) — 15s，通关/段位认证
 *
 *  使用方法:
 *    const climax = new MusicClimax();
 *    const themeWav = await climax.renderTheme();    // ArrayBuffer
 *    const duelWav  = await climax.renderDuel();
 *    const victoryWav = await climax.renderVictory();
 *
 *    // 下载为文件
 *    climax.downloadWav(themeWav, 'theme-song.wav');
 *
 *    // 或直接播放
 *    climax.playTheme();
 * ============================================================================
 */

// ============================================================================
//  音符频率常量 (MIDI → Hz)
// ============================================================================

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const N = {
  C2: midiToFreq(36), D2: midiToFreq(38), Eb2: midiToFreq(39), F2: midiToFreq(41),
  G2: midiToFreq(43), Ab2: midiToFreq(44), Bb2: midiToFreq(46),
  C3: midiToFreq(48), D3: midiToFreq(50), Eb3: midiToFreq(51), E3: midiToFreq(52), F3: midiToFreq(53),
  G3: midiToFreq(55), Ab3: midiToFreq(56), A3: midiToFreq(57), Bb3: midiToFreq(58), B3: midiToFreq(59),
  C4: midiToFreq(60), D4: midiToFreq(62), Eb4: midiToFreq(63), E4: midiToFreq(64),
  F4: midiToFreq(65), G4: midiToFreq(67), Ab4: midiToFreq(68), A4: midiToFreq(69),
  Bb4: midiToFreq(70), C5: midiToFreq(72), D5: midiToFreq(74), Eb5: midiToFreq(75),
  E5: midiToFreq(76), F5: midiToFreq(77), G5: midiToFreq(79), Ab5: midiToFreq(80),
  A5: midiToFreq(81), Bb5: midiToFreq(82), C6: midiToFreq(84),
};

// ============================================================================
//  WAV 编码工具
// ============================================================================

/** 将 AudioBuffer 编码为 WAV 格式的 ArrayBuffer */
function encodeWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Interleave channels
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// ============================================================================
//  合成乐器函数 (OfflineAudioContext 版本)
// ============================================================================

interface NoteDef {
  freq: number;
  time: number;
  dur: number;
  vel: number;
  pan?: number;
}

interface ChordDef {
  freqs: number[];
  time: number;
  dur: number;
  vel: number;
  pan?: number;
}

/** 古琴拨弦音 */
function playGuqin(
  ctx: OfflineAudioContext, dest: AudioNode,
  freq: number, time: number, dur: number, vel: number, pan = 0, warmth = 0,
): void {
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = freq;
  osc1.detune.value = -3;

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = freq * 2.003;
  osc2.detune.value = 3;
  const hGain = ctx.createGain();
  hGain.gain.value = 0.28;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(freq * 8, time);
  filter.frequency.exponentialRampToValueAtTime(freq * 2, time + 0.4);
  filter.frequency.exponentialRampToValueAtTime(freq * 1.5, time + dur);

  const gain = ctx.createGain();
  const peak = vel * 0.55;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(Math.max(peak * 0.3, 0.0001), time + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  // 颤音
  const vib = ctx.createOscillator();
  vib.type = 'sine';
  vib.frequency.value = 4.5;
  const vibGain = ctx.createGain();
  vibGain.gain.setValueAtTime(0, time);
  vibGain.gain.setValueAtTime(0, time + 0.3);
  vibGain.gain.linearRampToValueAtTime(3.5, time + 0.8);
  vib.connect(vibGain);
  vibGain.connect(osc1.detune);
  vibGain.connect(osc2.detune);

  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;

  osc1.connect(gain);
  osc2.connect(hGain);
  hGain.connect(gain);
  gain.connect(filter);
  filter.connect(panner);
  panner.connect(dest);

  const stop = time + dur + 0.15;
  osc1.start(time); osc2.start(time); vib.start(time);
  osc1.stop(stop); osc2.stop(stop); vib.stop(stop);
}

/** 弦乐铺底 */
function playStringPad(
  ctx: OfflineAudioContext, dest: AudioNode,
  freqs: number[], time: number, dur: number, vel: number, pan = 0,
): void {
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  filter.Q.value = 0.7;

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.25;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 400;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  const padGain = ctx.createGain();
  const peak = vel * 0.22;
  padGain.gain.setValueAtTime(0.0001, time);
  padGain.gain.linearRampToValueAtTime(peak, time + 0.5);
  padGain.gain.setValueAtTime(peak, time + dur - 1.0);
  padGain.gain.linearRampToValueAtTime(0.0001, time + dur);

  filter.connect(padGain);
  padGain.connect(panner);
  panner.connect(dest);

  for (const freq of freqs) {
    for (const detune of [-7, 0, 7]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      osc.connect(filter);
      osc.start(time);
      osc.stop(time + dur + 0.1);
    }
  }
  lfo.start(time);
  lfo.stop(time + dur + 0.1);
}

/** 贝斯持续音 */
function playBass(
  ctx: OfflineAudioContext, dest: AudioNode,
  freq: number, time: number, dur: number, vel: number,
): void {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = freq;

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = freq * 0.5;
  const subGain = ctx.createGain();
  subGain.gain.value = 0.5;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 320;

  const gain = ctx.createGain();
  const peak = vel * 0.35;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + 0.05);
  gain.gain.setValueAtTime(peak, time + dur - 0.3);
  gain.gain.linearRampToValueAtTime(0.0001, time + dur);

  osc.connect(filter);
  sub.connect(subGain);
  subGain.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  const stop = time + dur + 0.1;
  osc.start(time); sub.start(time);
  osc.stop(stop); sub.stop(stop);
}

/** 太鼓击打 */
function playTaiko(
  ctx: OfflineAudioContext, dest: AudioNode,
  time: number, vel: number,
): void {
  // 噪声层
  const noiseLen = Math.floor(ctx.sampleRate * 0.4);
  const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const noiseData = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) noiseData[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'lowpass';
  nFilter.frequency.value = 900;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.0001, time);
  nGain.gain.linearRampToValueAtTime(vel * 0.55, time + 0.001);
  nGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(dest);
  noise.start(time);
  noise.stop(time + 0.4);

  // 低频体声
  const body = ctx.createOscillator();
  body.type = 'sine';
  body.frequency.setValueAtTime(130, time);
  body.frequency.exponentialRampToValueAtTime(55, time + 0.08);
  const bGain = ctx.createGain();
  bGain.gain.setValueAtTime(0.0001, time);
  bGain.gain.linearRampToValueAtTime(vel * 0.85, time + 0.001);
  bGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);
  body.connect(bGain);
  bGain.connect(dest);
  body.start(time);
  body.stop(time + 0.45);
}

/** 竖琴琶音 */
function playHarp(
  ctx: OfflineAudioContext, dest: AudioNode,
  freq: number, time: number, dur: number, vel: number,
): void {
  const osc1 = ctx.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.value = freq;
  osc1.detune.value = -4;
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = freq;
  osc2.detune.value = 4;
  const o2Gain = ctx.createGain();
  o2Gain.gain.value = 0.6;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 5000;

  const gain = ctx.createGain();
  const peak = vel * 0.30;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  const panner = ctx.createStereoPanner();
  panner.pan.value = 0.25;

  osc1.connect(gain);
  osc2.connect(o2Gain);
  o2Gain.connect(gain);
  gain.connect(filter);
  filter.connect(panner);
  panner.connect(dest);

  const stop = time + dur + 0.1;
  osc1.start(time); osc2.start(time);
  osc1.stop(stop); osc2.stop(stop);
}

/** 对位旋律 */
function playCounter(
  ctx: OfflineAudioContext, dest: AudioNode,
  freq: number, time: number, dur: number, vel: number,
): void {
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = freq;
  osc1.detune.value = -5;
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = freq * 2;
  osc2.detune.value = 5;
  const hGain = ctx.createGain();
  hGain.gain.value = 0.15;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 1.0;
  filter.frequency.setValueAtTime(freq * 4, time);
  filter.frequency.exponentialRampToValueAtTime(freq * 1.5, time + 0.5);

  const gain = ctx.createGain();
  const peak = vel * 0.40;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  const panner = ctx.createStereoPanner();
  panner.pan.value = -0.25;

  osc1.connect(gain);
  osc2.connect(hGain);
  hGain.connect(gain);
  gain.connect(filter);
  filter.connect(panner);
  panner.connect(dest);

  const stop = time + dur + 0.1;
  osc1.start(time); osc2.start(time);
  osc1.stop(stop); osc2.stop(stop);
}

// ============================================================================
//  混响脉冲响应
// ============================================================================

function createImpulseResponse(ctx: OfflineAudioContext, dur: number, decay: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * dur);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
  }
  return buf;
}

// ============================================================================
//  乐谱数据 — 主题曲 (Theme Song, 60s)
// ============================================================================

const THEME_MELODY: NoteDef[] = [
  // 引子 (0-15s)
  { freq: N.C4, time: 0, dur: 3, vel: 0.70 },
  { freq: N.G3, time: 3, dur: 1.5, vel: 0.50 },
  { freq: N.Eb4, time: 4.5, dur: 2, vel: 0.60 },
  { freq: N.G4, time: 6.5, dur: 3, vel: 0.80 },
  { freq: N.F4, time: 9.5, dur: 1.5, vel: 0.60 },
  { freq: N.Eb4, time: 11, dur: 1.5, vel: 0.50 },
  { freq: N.C4, time: 12.5, dur: 2.5, vel: 0.70 },
  // 蓄势 (15-30s)
  { freq: N.Eb4, time: 15, dur: 0.75, vel: 0.60 },
  { freq: N.F4, time: 15.75, dur: 0.75, vel: 0.60 },
  { freq: N.G4, time: 16.5, dur: 1, vel: 0.70 },
  { freq: N.Bb4, time: 17.5, dur: 0.75, vel: 0.70 },
  { freq: N.G4, time: 18.25, dur: 0.75, vel: 0.60 },
  { freq: N.F4, time: 19, dur: 0.75, vel: 0.60 },
  { freq: N.Eb4, time: 19.75, dur: 1, vel: 0.60 },
  { freq: N.C4, time: 20.75, dur: 0.75, vel: 0.60 },
  { freq: N.Eb4, time: 21.5, dur: 0.75, vel: 0.60 },
  { freq: N.F4, time: 22.25, dur: 0.75, vel: 0.70 },
  { freq: N.G4, time: 23, dur: 1, vel: 0.70 },
  { freq: N.Bb4, time: 24, dur: 0.75, vel: 0.70 },
  { freq: N.Ab4, time: 24.75, dur: 0.75, vel: 0.60 },
  { freq: N.G4, time: 25.5, dur: 1, vel: 0.70 },
  { freq: N.Eb4, time: 26.5, dur: 0.75, vel: 0.60 },
  { freq: N.F4, time: 27.25, dur: 0.75, vel: 0.60 },
  { freq: N.G4, time: 28, dur: 1, vel: 0.70 },
  { freq: N.C5, time: 29, dur: 1, vel: 0.80 },
  // 高潮 (30-50s)
  { freq: N.C5, time: 30, dur: 1.5, vel: 0.90 },
  { freq: N.Eb5, time: 31.5, dur: 1, vel: 0.80 },
  { freq: N.G5, time: 32.5, dur: 2, vel: 1.00 },
  { freq: N.F5, time: 34.5, dur: 1, vel: 0.80 },
  { freq: N.Eb5, time: 35.5, dur: 1.5, vel: 0.70 },
  { freq: N.Ab4, time: 37, dur: 1.5, vel: 0.80 },
  { freq: N.C5, time: 38.5, dur: 1, vel: 0.80 },
  { freq: N.Eb5, time: 39.5, dur: 2, vel: 0.90 },
  { freq: N.Eb5, time: 42, dur: 1.5, vel: 0.80 },
  { freq: N.G5, time: 43.5, dur: 1, vel: 0.90 },
  { freq: N.F5, time: 44.5, dur: 1.5, vel: 0.80 },
  { freq: N.Bb4, time: 46, dur: 1, vel: 0.80 },
  { freq: N.D5, time: 47, dur: 1, vel: 0.80 },
  { freq: N.F5, time: 48, dur: 1, vel: 0.90 },
  { freq: N.G5, time: 49, dur: 1, vel: 1.00 },
  // 收束 (50-60s)
  { freq: N.C4, time: 50, dur: 3, vel: 0.60 },
  { freq: N.Eb4, time: 53, dur: 2, vel: 0.50 },
  { freq: N.G4, time: 55, dur: 3, vel: 0.40 },
  { freq: N.F4, time: 58, dur: 1, vel: 0.30 },
  { freq: N.C4, time: 59, dur: 1, vel: 0.20 },
];

const THEME_CHORDS: ChordDef[] = [
  { freqs: [N.C3, N.Eb3, N.G3], time: 15, dur: 7.5, vel: 0.35 },
  { freqs: [N.Ab2, N.C3, N.Eb3], time: 22.5, dur: 7.5, vel: 0.35 },
  { freqs: [N.C3, N.Eb3, N.G3, N.C4], time: 30, dur: 5, vel: 0.45 },
  { freqs: [N.Ab2, N.C3, N.Eb3, N.Ab3], time: 35, dur: 5, vel: 0.45 },
  { freqs: [N.Eb3, N.G3, N.Bb3, N.Eb4], time: 40, dur: 5, vel: 0.45 },
  { freqs: [N.Bb2, N.D3, N.F3, N.Bb3], time: 45, dur: 5, vel: 0.45 },
];

const THEME_BASS: NoteDef[] = [
  { freq: N.C2, time: 15, dur: 7.5, vel: 0.50 },
  { freq: N.G2, time: 22.5, dur: 7.5, vel: 0.50 },
  { freq: N.C2, time: 30, dur: 5, vel: 0.60 },
  { freq: N.Ab2, time: 35, dur: 5, vel: 0.60 },
  { freq: N.Eb2, time: 40, dur: 5, vel: 0.60 },
  { freq: N.Bb2, time: 45, dur: 5, vel: 0.60 },
];

const THEME_COUNTER: NoteDef[] = [
  { freq: N.G3, time: 30, dur: 2, vel: 0.50 },
  { freq: N.Eb4, time: 32, dur: 2, vel: 0.50 },
  { freq: N.F4, time: 34, dur: 2, vel: 0.50 },
  { freq: N.C4, time: 36, dur: 2, vel: 0.50 },
  { freq: N.Eb4, time: 38, dur: 2, vel: 0.50 },
  { freq: N.C4, time: 40, dur: 2, vel: 0.50 },
  { freq: N.Bb3, time: 42, dur: 2, vel: 0.50 },
  { freq: N.Eb4, time: 44, dur: 2, vel: 0.50 },
  { freq: N.F3, time: 46, dur: 2, vel: 0.50 },
  { freq: N.Bb3, time: 48, dur: 2, vel: 0.50 },
];

// ============================================================================
//  乐谱数据 — 对决 BGM (Duel BGM, 45s)
// ============================================================================

const DUEL_MELODY: NoteDef[] = [
  // 紧张开场 (0-10s) — 低音区快速音符
  { freq: N.D3, time: 0, dur: 0.3, vel: 0.70 },
  { freq: N.F3, time: 0.4, dur: 0.3, vel: 0.65 },
  { freq: N.G3, time: 0.8, dur: 0.3, vel: 0.70 },
  { freq: N.Bb3, time: 1.2, dur: 0.5, vel: 0.75 },
  { freq: N.G3, time: 1.8, dur: 0.3, vel: 0.65 },
  { freq: N.F3, time: 2.2, dur: 0.3, vel: 0.60 },
  { freq: N.Eb3, time: 2.6, dur: 0.5, vel: 0.70 },
  { freq: N.D3, time: 3.2, dur: 0.3, vel: 0.65 },
  { freq: N.F3, time: 3.6, dur: 0.3, vel: 0.70 },
  { freq: N.G3, time: 4.0, dur: 0.5, vel: 0.75 },
  { freq: N.Bb3, time: 4.6, dur: 0.3, vel: 0.70 },
  { freq: N.Ab3, time: 5.0, dur: 0.3, vel: 0.65 },
  { freq: N.G3, time: 5.4, dur: 0.5, vel: 0.70 },
  { freq: N.F3, time: 6.0, dur: 0.3, vel: 0.60 },
  { freq: N.Eb3, time: 6.4, dur: 0.3, vel: 0.65 },
  { freq: N.D3, time: 6.8, dur: 0.8, vel: 0.75 },
  // 升级对抗 (10-25s) — 中音区，节奏加密
  { freq: N.D4, time: 10, dur: 0.4, vel: 0.80 },
  { freq: N.F4, time: 10.5, dur: 0.4, vel: 0.75 },
  { freq: N.G4, time: 11.0, dur: 0.6, vel: 0.85 },
  { freq: N.Bb4, time: 11.7, dur: 0.4, vel: 0.80 },
  { freq: N.G4, time: 12.2, dur: 0.4, vel: 0.75 },
  { freq: N.F4, time: 12.7, dur: 0.4, vel: 0.70 },
  { freq: N.Eb4, time: 13.2, dur: 0.6, vel: 0.80 },
  { freq: N.D4, time: 14.0, dur: 0.4, vel: 0.75 },
  { freq: N.F4, time: 14.5, dur: 0.4, vel: 0.80 },
  { freq: N.G4, time: 15.0, dur: 0.6, vel: 0.85 },
  { freq: N.Bb4, time: 15.7, dur: 0.4, vel: 0.80 },
  { freq: N.Ab4, time: 16.2, dur: 0.4, vel: 0.75 },
  { freq: N.G4, time: 16.7, dur: 0.6, vel: 0.80 },
  { freq: N.F4, time: 17.4, dur: 0.4, vel: 0.70 },
  { freq: N.Eb4, time: 17.9, dur: 0.4, vel: 0.75 },
  { freq: N.D4, time: 18.4, dur: 0.8, vel: 0.85 },
  // 高潮对决 (25-40s) — 高音区，全力输出
  { freq: N.D5, time: 25, dur: 0.5, vel: 0.90 },
  { freq: N.F5, time: 25.6, dur: 0.5, vel: 0.85 },
  { freq: N.G5, time: 26.2, dur: 0.8, vel: 1.00 },
  { freq: N.Bb5, time: 27.1, dur: 0.5, vel: 0.90 },
  { freq: N.G5, time: 27.7, dur: 0.5, vel: 0.85 },
  { freq: N.F5, time: 28.3, dur: 0.5, vel: 0.80 },
  { freq: N.Eb5, time: 28.9, dur: 0.8, vel: 0.90 },
  { freq: N.D5, time: 29.8, dur: 0.5, vel: 0.85 },
  { freq: N.F5, time: 30.4, dur: 0.5, vel: 0.90 },
  { freq: N.G5, time: 31.0, dur: 0.8, vel: 1.00 },
  { freq: N.Bb5, time: 31.9, dur: 0.5, vel: 0.90 },
  { freq: N.Ab5, time: 32.5, dur: 0.5, vel: 0.85 },
  { freq: N.G5, time: 33.1, dur: 0.8, vel: 0.90 },
  { freq: N.F5, time: 34.0, dur: 0.5, vel: 0.80 },
  { freq: N.Eb5, time: 34.6, dur: 0.5, vel: 0.85 },
  { freq: N.D5, time: 35.2, dur: 1.0, vel: 0.95 },
  // 收束 (40-45s)
  { freq: N.D4, time: 40, dur: 1, vel: 0.60 },
  { freq: N.F4, time: 41.5, dur: 0.8, vel: 0.50 },
  { freq: N.D3, time: 42.5, dur: 1.5, vel: 0.40 },
  { freq: N.D3, time: 44, dur: 1, vel: 0.20 },
];

const DUEL_CHORDS: ChordDef[] = [
  { freqs: [N.D3, N.F3, N.A3], time: 0, dur: 5, vel: 0.30 },
  { freqs: [N.Bb2, N.D3, N.F3], time: 5, dur: 5, vel: 0.30 },
  { freqs: [N.F3, N.A3, N.C4], time: 10, dur: 5, vel: 0.35 },
  { freqs: [N.G3, N.Bb3, N.D4], time: 15, dur: 5, vel: 0.35 },
  { freqs: [N.D3, N.F3, N.A3, N.D4], time: 25, dur: 5, vel: 0.45 },
  { freqs: [N.Bb2, N.D3, N.F3, N.Bb3], time: 30, dur: 5, vel: 0.45 },
  { freqs: [N.F3, N.A3, N.C4, N.F4], time: 35, dur: 5, vel: 0.45 },
];

const DUEL_BASS: NoteDef[] = [
  { freq: N.D2, time: 0, dur: 5, vel: 0.55 },
  { freq: N.Bb2, time: 5, dur: 5, vel: 0.55 },
  { freq: N.F2, time: 10, dur: 5, vel: 0.60 },
  { freq: N.G2, time: 15, dur: 5, vel: 0.60 },
  { freq: N.D2, time: 25, dur: 5, vel: 0.65 },
  { freq: N.Bb2, time: 30, dur: 5, vel: 0.65 },
  { freq: N.F2, time: 35, dur: 5, vel: 0.65 },
];

// ============================================================================
//  乐谱数据 — 胜利短曲 (Victory Fanfare, 15s)
// ============================================================================

const VICTORY_MELODY: NoteDef[] = [
  // 辉煌开场 (0-5s)
  { freq: N.C5, time: 0, dur: 0.5, vel: 0.90 },
  { freq: N.E5, time: 0.5, dur: 0.5, vel: 0.90 },
  { freq: N.G5, time: 1.0, dur: 0.8, vel: 1.00 },
  { freq: N.C6, time: 2.0, dur: 1.5, vel: 1.00 },
  // 华丽展开 (5-10s)
  { freq: N.G5, time: 5, dur: 0.4, vel: 0.85 },
  { freq: N.A5, time: 5.4, dur: 0.4, vel: 0.85 },
  { freq: N.Bb5, time: 5.8, dur: 0.4, vel: 0.90 },
  { freq: N.C6, time: 6.2, dur: 1.2, vel: 1.00 },
  { freq: N.Bb5, time: 7.5, dur: 0.5, vel: 0.85 },
  { freq: N.G5, time: 8.0, dur: 0.5, vel: 0.80 },
  { freq: N.E5, time: 8.5, dur: 0.8, vel: 0.85 },
  // 辉煌收束 (10-15s)
  { freq: N.C5, time: 10, dur: 0.5, vel: 0.90 },
  { freq: N.E5, time: 10.5, dur: 0.5, vel: 0.90 },
  { freq: N.G5, time: 11.0, dur: 0.5, vel: 0.95 },
  { freq: N.C6, time: 11.5, dur: 3.5, vel: 1.00 },
];

const VICTORY_CHORDS: ChordDef[] = [
  { freqs: [N.C3, N.E3, N.G3, N.C4], time: 0, dur: 5, vel: 0.50 },
  { freqs: [N.F3, N.A3, N.C4, N.F4], time: 5, dur: 5, vel: 0.50 },
  { freqs: [N.G3, N.B3 || N.C4, N.D4, N.G4], time: 10, dur: 5, vel: 0.55 },
];

// ============================================================================
//  MusicClimax 主类
// ============================================================================

export class MusicClimax {
  private readonly SAMPLE_RATE = 44100;

  // ========================================================================
  //  渲染主题曲 (60s)
  // ========================================================================

  async renderTheme(): Promise<ArrayBuffer> {
    const duration = 60;
    const ctx = new OfflineAudioContext(2, this.SAMPLE_RATE * duration, this.SAMPLE_RATE);

    // 混响
    const convolver = ctx.createConvolver();
    convolver.buffer = createImpulseResponse(ctx, 3.5, 2.5);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.45;
    convolver.connect(reverbGain);
    reverbGain.connect(ctx.destination);

    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.72;
    dryGain.connect(ctx.destination);

    const bus = ctx.createGain();
    bus.connect(dryGain);
    bus.connect(convolver);

    const dynamicsGain = ctx.createGain();
    dynamicsGain.gain.value = 0.7;
    dynamicsGain.connect(bus);

    // 引子 (0-15s)
    for (const note of THEME_MELODY.filter(n => n.time < 15)) {
      playGuqin(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel, 0);
    }

    // 蓄势 (15-30s)
    for (const note of THEME_MELODY.filter(n => n.time >= 15 && n.time < 30)) {
      playGuqin(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel, 0);
    }
    for (const chord of THEME_CHORDS.filter(c => c.time >= 15 && c.time < 30)) {
      playStringPad(ctx, dynamicsGain, chord.freqs, chord.time, chord.dur, chord.vel, -0.35);
      playStringPad(ctx, dynamicsGain, chord.freqs, chord.time, chord.dur, chord.vel * 0.85, 0.35);
    }
    for (const note of THEME_BASS.filter(n => n.time >= 15 && n.time < 30)) {
      playBass(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel);
    }
    // 太鼓
    for (let t = 15.5; t < 30; t += 0.75) {
      const beat = Math.round((t - 15.5) / 0.75);
      playTaiko(ctx, dynamicsGain, t, beat % 2 === 0 ? 0.70 : 0.45);
    }

    // 高潮 (30-50s)
    for (const note of THEME_MELODY.filter(n => n.time >= 30 && n.time < 50)) {
      playGuqin(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel, 0);
    }
    for (const chord of THEME_CHORDS.filter(c => c.time >= 30)) {
      playStringPad(ctx, dynamicsGain, chord.freqs, chord.time, chord.dur, chord.vel, -0.3);
      playStringPad(ctx, dynamicsGain, chord.freqs, chord.time, chord.dur, chord.vel * 0.85, 0.3);
    }
    for (const note of THEME_BASS.filter(n => n.time >= 30)) {
      playBass(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel);
    }
    for (const note of THEME_COUNTER) {
      playCounter(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel);
    }
    // 竖琴琶音
    const harpNotes = [
      ...this.genArp([N.C4, N.Eb4, N.G4, N.C5], 30, 10, 0.5),
      ...this.genArp([N.Ab3, N.C4, N.Eb4, N.Ab4], 35, 10, 0.5),
      ...this.genArp([N.Eb4, N.G4, N.Bb4, N.Eb5], 40, 10, 0.5),
      ...this.genArp([N.Bb3, N.D4, N.F4, N.Bb4], 45, 10, 0.5),
    ];
    for (const note of harpNotes) {
      playHarp(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel);
    }
    // 太鼓
    for (let t = 30; t < 50; t += 0.5) {
      const beat = Math.round(t / 0.5);
      const isAccent = Math.round(t) % 2 === 0;
      playTaiko(ctx, dynamicsGain, t, isAccent ? 0.90 : beat % 2 === 0 ? 0.65 : 0.40);
    }

    // 收束 (50-60s)
    for (const note of THEME_MELODY.filter(n => n.time >= 50)) {
      playGuqin(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel, 0, 0.3);
    }

    // 动态包络
    this.applyDynamics(ctx, dynamicsGain, [
      [0, 0.7], [15, 0.7], [29.9, 0.88], [30, 0.88], [32, 1.0],
      [49.9, 1.0], [50, 0.8], [59.9, 0.0],
    ]);

    const rendered = await ctx.startRendering();
    return encodeWav(rendered);
  }

  // ========================================================================
  //  渲染对决 BGM (45s)
  // ========================================================================

  async renderDuel(): Promise<ArrayBuffer> {
    const duration = 45;
    const ctx = new OfflineAudioContext(2, this.SAMPLE_RATE * duration, this.SAMPLE_RATE);

    const convolver = ctx.createConvolver();
    convolver.buffer = createImpulseResponse(ctx, 2.0, 3.5);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.35;
    convolver.connect(reverbGain);
    reverbGain.connect(ctx.destination);

    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.75;
    dryGain.connect(ctx.destination);

    const bus = ctx.createGain();
    bus.connect(dryGain);
    bus.connect(convolver);

    const dynamicsGain = ctx.createGain();
    dynamicsGain.gain.value = 0.6;
    dynamicsGain.connect(bus);

    // 主旋律 — 使用锯齿波增加紧张感
    for (const note of DUEL_MELODY) {
      this.playDuelLead(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel);
    }

    // 和弦铺底
    for (const chord of DUEL_CHORDS) {
      playStringPad(ctx, dynamicsGain, chord.freqs, chord.time, chord.dur, chord.vel, -0.3);
      playStringPad(ctx, dynamicsGain, chord.freqs, chord.time, chord.dur, chord.vel * 0.85, 0.3);
    }

    // 贝斯
    for (const note of DUEL_BASS) {
      playBass(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel);
    }

    // 太鼓 — 快速驱动节奏
    for (let t = 0; t < 40; t += 0.5) {
      const beat = Math.round(t / 0.5);
      const isAccent = Math.round(t) % 2 === 0;
      playTaiko(ctx, dynamicsGain, t, isAccent ? 0.85 : beat % 2 === 0 ? 0.60 : 0.35);
    }

    // 动态包络
    this.applyDynamics(ctx, dynamicsGain, [
      [0, 0.5], [10, 0.6], [25, 0.75], [30, 0.85], [35, 1.0],
      [40, 0.8], [44.9, 0.0],
    ]);

    const rendered = await ctx.startRendering();
    return encodeWav(rendered);
  }

  // ========================================================================
  //  渲染胜利短曲 (15s)
  // ========================================================================

  async renderVictory(): Promise<ArrayBuffer> {
    const duration = 15;
    const ctx = new OfflineAudioContext(2, this.SAMPLE_RATE * duration, this.SAMPLE_RATE);

    const convolver = ctx.createConvolver();
    convolver.buffer = createImpulseResponse(ctx, 2.5, 2.0);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.50;
    convolver.connect(reverbGain);
    reverbGain.connect(ctx.destination);

    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.70;
    dryGain.connect(ctx.destination);

    const bus = ctx.createGain();
    bus.connect(dryGain);
    bus.connect(convolver);

    const dynamicsGain = ctx.createGain();
    dynamicsGain.gain.value = 0.8;
    dynamicsGain.connect(bus);

    // 主旋律 — 明亮三角波
    for (const note of VICTORY_MELODY) {
      this.playVictoryLead(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel);
    }

    // 和弦
    for (const chord of VICTORY_CHORDS) {
      playStringPad(ctx, dynamicsGain, chord.freqs, chord.time, chord.dur, chord.vel, -0.25);
      playStringPad(ctx, dynamicsGain, chord.freqs, chord.time, chord.dur, chord.vel * 0.85, 0.25);
    }

    // 贝斯
    playBass(ctx, dynamicsGain, N.C2, 0, 5, 0.60);
    playBass(ctx, dynamicsGain, N.F2, 5, 5, 0.60);
    playBass(ctx, dynamicsGain, N.G2, 10, 5, 0.65);

    // 太鼓 — 庆典节奏
    for (let t = 0; t < 12; t += 0.5) {
      const beat = Math.round(t / 0.5);
      const isAccent = beat % 4 === 0;
      playTaiko(ctx, dynamicsGain, t, isAccent ? 0.90 : beat % 2 === 0 ? 0.65 : 0.40);
    }

    // 竖琴琶音
    const harpNotes = [
      ...this.genArp([N.C4, N.E4, N.G4, N.C5], 0, 8, 0.25),
      ...this.genArp([N.F4, N.A4, N.C5, N.F5], 5, 8, 0.25),
      ...this.genArp([N.G4, N.B3 || N.C4, N.D5, N.G5], 10, 8, 0.25),
    ];
    for (const note of harpNotes) {
      playHarp(ctx, dynamicsGain, note.freq, note.time, note.dur, note.vel);
    }

    // 动态包络
    this.applyDynamics(ctx, dynamicsGain, [
      [0, 0.8], [1, 1.0], [10, 1.0], [13, 0.6], [14.9, 0.0],
    ]);

    const rendered = await ctx.startRendering();
    return encodeWav(rendered);
  }

  // ========================================================================
  //  辅助方法
  // ========================================================================

  /** 生成琶音音符 */
  private genArp(notes: number[], startTime: number, count: number, interval: number): NoteDef[] {
    const result: NoteDef[] = [];
    for (let i = 0; i < count; i++) {
      const cycle = Math.floor(i / notes.length);
      const idx = i % notes.length;
      const noteIdx = cycle % 2 === 0 ? idx : notes.length - 1 - idx;
      result.push({
        freq: notes[noteIdx],
        time: startTime + i * interval,
        dur: interval * 1.5,
        vel: 0.35,
      });
    }
    return result;
  }

  /** 应用动态包络 */
  private applyDynamics(
    ctx: OfflineAudioContext, gainNode: GainNode,
    points: [number, number][],
  ): void {
    for (const [time, value] of points) {
      try {
        gainNode.gain.setValueAtTime(value, time);
      } catch { /* ignore scheduling errors */ }
    }
  }

  /** 对决主旋律 — 锯齿波 + 滤波 */
  private playDuelLead(
    ctx: OfflineAudioContext, dest: AudioNode,
    freq: number, time: number, dur: number, vel: number,
  ): void {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 2.0;
    filter.frequency.setValueAtTime(freq * 3, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, time + dur);

    const gain = ctx.createGain();
    const peak = vel * 0.30;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    const panner = ctx.createStereoPanner();
    panner.pan.value = (Math.random() - 0.5) * 0.3;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(dest);

    const stop = time + dur + 0.05;
    osc.start(time);
    osc.stop(stop);
  }

  /** 胜利主旋律 — 明亮三角波 + 谐波 */
  private playVictoryLead(
    ctx: OfflineAudioContext, dest: AudioNode,
    freq: number, time: number, dur: number, vel: number,
  ): void {
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.value = freq;
    osc1.detune.value = -3;

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;
    const hGain = ctx.createGain();
    hGain.gain.value = 0.20;

    const gain = ctx.createGain();
    const peak = vel * 0.45;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.02);
    gain.gain.setValueAtTime(peak, time + dur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    const panner = ctx.createStereoPanner();
    panner.pan.value = 0;

    osc1.connect(gain);
    osc2.connect(hGain);
    hGain.connect(gain);
    gain.connect(panner);
    panner.connect(dest);

    const stop = time + dur + 0.1;
    osc1.start(time); osc2.start(time);
    osc1.stop(stop); osc2.stop(stop);
  }

  // ========================================================================
  //  下载 & 播放工具
  // ========================================================================

  /** 下载 WAV 文件 */
  downloadWav(buffer: ArrayBuffer, filename: string): void {
    const blob = new Blob([buffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** 播放 ArrayBuffer 音频 */
  async playBuffer(buffer: ArrayBuffer): Promise<void> {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(buffer.slice(0));
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  }

  /** 播放主题曲 */
  async playTheme(): Promise<void> {
    const wav = await this.renderTheme();
    await this.playBuffer(wav);
  }

  /** 播放对决 BGM */
  async playDuel(): Promise<void> {
    const wav = await this.renderDuel();
    await this.playBuffer(wav);
  }

  /** 播放胜利短曲 */
  async playVictory(): Promise<void> {
    const wav = await this.renderVictory();
    await this.playBuffer(wav);
  }
}
