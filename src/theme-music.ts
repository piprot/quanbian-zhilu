/**
 * ============================================================================
 *  ThemeMusic — 领导力培训游戏主题曲合成模块
 * ============================================================================
 *
 *  使用 Web Audio API 程序化合成一首完整的 60 秒交响级主题曲。
 *  适用于首页主旋律、章节完成、 rank 认证等关键情感时刻。
 *
 *  乐章结构 (Composition Structure):
 *    1. 引子 Intro    (0–15s)  — 古琴独奏，C 小调五声，沉思悠远
 *    2. 蓄势 Build    (15–30s) — 加入低音持续音、弦乐铺底、太鼓脉动
 *    3. 高潮 Climax   (30–50s) — 全编制交响：高音旋律、和弦行进、竖琴琶音、对位旋律
 *    4. 收束 Resolution(50–60s) — 回归古琴独奏，渐入静默
 *
 *  合成乐器 (Synthesized Instruments):
 *    - 古琴 Guqin    : 正弦波 + 谐波 + 快速起音 + 长指数衰减 + 低通滤波包络 + 延迟颤音
 *    - 太鼓 Taiko    : 白噪声脉冲(低通) + 低频正弦(音高下降) + 快速衰减
 *    - 弦乐铺底 Pad  : 三重失谐锯齿波 + 慢起音 + LFO 调制低通滤波
 *    - 竖琴 Harp     : 三角波 + 明亮固定滤波 + 快速衰减
 *    - 贝斯 Bass     : 锯齿波 + 低通滤波 + 中等起音
 *    - 对位旋律      : 古琴变体，低八度，温暖滤波
 *
 *  音频处理链 (Audio Processing Chain):
 *    [乐器] → [BiquadFilter] → [Gain(ADSR)] → [StereoPanner] → [instrumentBus]
 *           → split → [dryGain] ──────────────────────────→ [dynamicsGain]
 *                   → [ConvolverNode] → [reverbGain] ────→ [dynamicsGain]
 *                                                          → [userVolumeGain]
 *                                                          → [DynamicsCompressor]
 *                                                          → [destination]
 *
 *  五声音阶 (Chinese Pentatonic Scales):
 *    宫(C) 商(D) 角(E) 徵(G) 羽(A) — 用于大调段落
 *    C 小调五声: C, Eb, F, G, Bb   — 用于情感段落
 * ============================================================================
 */

// ============================================================================
//  类型定义
// ============================================================================

/** 单个音符事件 */
export interface NoteEvent {
  /** 频率 (Hz) */
  freq: number;
  /** 起始时间 (秒，相对于段落起点) */
  time: number;
  /** 持续时间 (秒) */
  duration: number;
  /** 力度 (0–1) */
  velocity: number;
}

/** 和弦事件 (多音同时触发) */
export interface ChordEvent {
  /** 和弦各音频率 */
  freqs: number[];
  /** 起始时间 (秒) */
  time: number;
  /** 持续时间 (秒) */
  duration: number;
  /** 力度 (0–1) */
  velocity: number;
}

/** 段落名称 */
export type SectionName = 'intro' | 'build' | 'climax' | 'resolution';

// ============================================================================
//  音符频率常量
// ============================================================================

/** MIDI 音符号 → 频率 (A4 = 69 = 440 Hz) */
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** 全部音符频率表 (Hz) */
const FREQ = {
  // 极低音
  C1:  midiToFreq(24),  //  32.70
  Ab1: midiToFreq(32),  //  51.68
  Bb1: midiToFreq(34),  //  54.85
  // 低音区 — 贝斯/持续音
  C2:  midiToFreq(36),  //  65.41
  D2:  midiToFreq(38),  //  73.42
  Eb2: midiToFreq(39),  //  77.78
  F2:  midiToFreq(41),  //  87.31
  G2:  midiToFreq(43),  //  98.00
  Ab2: midiToFreq(44),  // 103.83
  Bb2: midiToFreq(46),  // 116.54
  // 中音区 — 和弦/对位
  C3:  midiToFreq(48),  // 130.81
  D3:  midiToFreq(50),  // 146.83
  Eb3: midiToFreq(51),  // 155.56
  E3:  midiToFreq(52),  // 164.81
  F3:  midiToFreq(53),  // 174.61
  G3:  midiToFreq(55),  // 196.00
  Ab3: midiToFreq(56),  // 207.65
  A3:  midiToFreq(57),  // 220.00
  Bb3: midiToFreq(58),  // 233.08
  // 中高音区 — 主旋律
  C4:  midiToFreq(60),  // 261.63
  D4:  midiToFreq(62),  // 293.66
  Eb4: midiToFreq(63),  // 311.13
  E4:  midiToFreq(64),  // 329.63
  F4:  midiToFreq(65),  // 349.23
  G4:  midiToFreq(67),  // 392.00
  Ab4: midiToFreq(68),  // 415.30
  A4:  midiToFreq(69),  // 440.00
  Bb4: midiToFreq(70),  // 466.16
  // 高音区 — 高潮旋律
  C5:  midiToFreq(72),  // 523.25
  D5:  midiToFreq(74),  // 587.33
  Eb5: midiToFreq(75),  // 622.25
  E5:  midiToFreq(76),  // 659.25
  F5:  midiToFreq(77),  // 696.59
  G5:  midiToFreq(79),  // 783.99
  Ab5: midiToFreq(80),  // 830.61
  A5:  midiToFreq(81),  // 880.00
  Bb5: midiToFreq(82),  // 932.33
  C6:  midiToFreq(84),  // 1046.50
} as const;

// ============================================================================
//  音阶定义 — 五声音阶 (Chinese Pentatonic Scales)
// ============================================================================

/**
 * 宫调 (C 大调五声): C D E G A — 明亮、大气、王者之气
 * 商调 (D 模式):     D E G A C — 柔和、深思
 * 角调 (E 模式):     E G A C D — 清新、向上
 * 徵调 (G 模式):     G A C D E — 热情、欢快
 * 羽调 (A 小调五声):  A C D E G — 哀婉、深情
 *
 * C 小调五声: C Eb F G Bb — 沉思、内省、情感张力
 */

/** C 小调五声音阶 — 引子 & 收束 */
const C_MINOR_PENTATONIC: number[] = [FREQ.C4, FREQ.Eb4, FREQ.F4, FREQ.G4, FREQ.Bb4];

/** C 大调五声 (宫调) — 高潮段落色彩 */
const GONG_MAJOR_PENTATONIC: number[] = [FREQ.C4, FREQ.D4, FREQ.E4, FREQ.G4, FREQ.A4];

// ============================================================================
//  段落元数据
// ============================================================================

/** 各段落在全曲中的起始偏移 (秒) */
const SECTION_OFFSET: Record<SectionName, number> = {
  intro:      0,
  build:     15,
  climax:    30,
  resolution: 50,
};

/** 各段落时长 (秒) */
const SECTION_DURATION: Record<SectionName, number> = {
  intro:      15,
  build:      15,
  climax:     20,
  resolution: 10,
};

/** 全曲总时长 */
const TOTAL_DURATION = 60;

// ============================================================================
//  乐谱数据 — 旋律
// ============================================================================

/**
 * 引子旋律 — C 小调五声，古琴独奏
 * 沉思悠远，如高士独坐山巅，拨弦寄意
 * 音域: G3 – G4，节奏舒缓，留白充分
 */
const INTRO_MELODY: NoteEvent[] = [
  { freq: FREQ.C4,  time:  0.0, duration: 3.0, velocity: 0.70 }, // 开篇第一音，沉稳如山
  { freq: FREQ.G3,  time:  3.0, duration: 1.5, velocity: 0.50 }, // 下探，沉思
  { freq: FREQ.Eb4, time:  4.5, duration: 2.0, velocity: 0.60 }, // 微光初现
  { freq: FREQ.G4,  time:  6.5, duration: 3.0, velocity: 0.80 }, // 上扬，希望萌生
  { freq: FREQ.F4,  time:  9.5, duration: 1.5, velocity: 0.60 }, // 温柔回落
  { freq: FREQ.Eb4, time: 11.0, duration: 1.5, velocity: 0.50 }, // 继续下行
  { freq: FREQ.C4,  time: 12.5, duration: 2.5, velocity: 0.70 }, // 归于沉静
];

/**
 * 蓄势旋律 — 节奏加密，音符增多，能量渐升
 * 在古琴旋律基础上叠加低音、铺底、太鼓
 * 音域: C4 – C5
 */
const BUILD_MELODY: NoteEvent[] = [
  { freq: FREQ.Eb4, time:  0.00, duration: 0.75, velocity: 0.60 },
  { freq: FREQ.F4,  time:  0.75, duration: 0.75, velocity: 0.60 },
  { freq: FREQ.G4,  time:  1.50, duration: 1.00, velocity: 0.70 },
  { freq: FREQ.Bb4, time:  2.50, duration: 0.75, velocity: 0.70 },
  { freq: FREQ.G4,  time:  3.25, duration: 0.75, velocity: 0.60 },
  { freq: FREQ.F4,  time:  4.00, duration: 0.75, velocity: 0.60 },
  { freq: FREQ.Eb4, time:  4.75, duration: 1.00, velocity: 0.60 },
  { freq: FREQ.C4,  time:  5.75, duration: 0.75, velocity: 0.60 },
  { freq: FREQ.Eb4, time:  6.50, duration: 0.75, velocity: 0.60 },
  { freq: FREQ.F4,  time:  7.25, duration: 0.75, velocity: 0.70 },
  { freq: FREQ.G4,  time:  8.00, duration: 1.00, velocity: 0.70 },
  { freq: FREQ.Bb4, time:  9.00, duration: 0.75, velocity: 0.70 },
  { freq: FREQ.Ab4, time:  9.75, duration: 0.75, velocity: 0.60 }, // 色彩音
  { freq: FREQ.G4,  time: 10.50, duration: 1.00, velocity: 0.70 },
  { freq: FREQ.Eb4, time: 11.50, duration: 0.75, velocity: 0.60 },
  { freq: FREQ.F4,  time: 12.25, duration: 0.75, velocity: 0.60 },
  { freq: FREQ.G4,  time: 13.00, duration: 1.00, velocity: 0.70 },
  { freq: FREQ.C5,  time: 14.00, duration: 1.00, velocity: 0.80 }, // 过渡至高潮
];

/**
 * 高潮旋律 — 高音区翱翔，情感巅峰
 * Cm – Ab – Eb – Bb 和弦行进，每和弦约 5 秒
 * 音域: Ab4 – G5，力度饱满
 */
const CLIMAX_MELODY: NoteEvent[] = [
  // Cm 段 (0–5s) — 主题重现，高八度
  { freq: FREQ.C5,  time:  0.0, duration: 1.5, velocity: 0.90 }, // 高潮起始，明亮
  { freq: FREQ.Eb5, time:  1.5, duration: 1.0, velocity: 0.80 },
  { freq: FREQ.G5,  time:  2.5, duration: 2.0, velocity: 1.00 }, // 情感巅峰
  { freq: FREQ.F5,  time:  4.5, duration: 1.0, velocity: 0.80 },
  { freq: FREQ.Eb5, time:  5.5, duration: 1.5, velocity: 0.70 }, // 过渡
  // Ab 段 (7–12s) — 色彩转换，温暖
  { freq: FREQ.Ab4, time:  7.0, duration: 1.5, velocity: 0.80 },
  { freq: FREQ.C5,  time:  8.5, duration: 1.0, velocity: 0.80 },
  { freq: FREQ.Eb5, time:  9.5, duration: 2.0, velocity: 0.90 },
  // Eb 段 (12–16s) — 回归，坚定
  { freq: FREQ.Eb5, time: 12.0, duration: 1.5, velocity: 0.80 },
  { freq: FREQ.G5,  time: 13.5, duration: 1.0, velocity: 0.90 },
  { freq: FREQ.F5,  time: 14.5, duration: 1.5, velocity: 0.80 },
  // Bb 段 (16–20s) — 最终冲刺
  { freq: FREQ.Bb4, time: 16.0, duration: 1.0, velocity: 0.80 },
  { freq: FREQ.D5,  time: 17.0, duration: 1.0, velocity: 0.80 },
  { freq: FREQ.F5,  time: 18.0, duration: 1.0, velocity: 0.90 },
  { freq: FREQ.G5,  time: 19.0, duration: 1.0, velocity: 1.00 }, // 最终高潮顶点
];

/**
 * 高潮对位旋律 — 低八度回应主旋律，形成复调对话
 * 音域: F3 – Eb4，力度柔和
 */
const CLIMAX_COUNTER_MELODY: NoteEvent[] = [
  { freq: FREQ.G3,  time:  0.0, duration: 2.0, velocity: 0.50 },
  { freq: FREQ.Eb4, time:  2.0, duration: 2.0, velocity: 0.50 },
  { freq: FREQ.F4,  time:  4.0, duration: 2.0, velocity: 0.50 },
  { freq: FREQ.C4,  time:  6.0, duration: 2.0, velocity: 0.50 },
  { freq: FREQ.Eb4, time:  8.0, duration: 2.0, velocity: 0.50 },
  { freq: FREQ.C4,  time: 10.0, duration: 2.0, velocity: 0.50 },
  { freq: FREQ.Bb3, time: 12.0, duration: 2.0, velocity: 0.50 },
  { freq: FREQ.Eb4, time: 14.0, duration: 2.0, velocity: 0.50 },
  { freq: FREQ.F3,  time: 16.0, duration: 2.0, velocity: 0.50 },
  { freq: FREQ.Bb3, time: 18.0, duration: 2.0, velocity: 0.50 },
];

/**
 * 收束旋律 — 回归引子古琴独奏，渐入静默
 * 与引子旋律呼应，力度递减
 */
const RESOLUTION_MELODY: NoteEvent[] = [
  { freq: FREQ.C4,  time:  0.0, duration: 3.0, velocity: 0.60 }, // 回归
  { freq: FREQ.Eb4, time:  3.0, duration: 2.0, velocity: 0.50 }, // 微弱回响
  { freq: FREQ.G4,  time:  5.0, duration: 3.0, velocity: 0.40 }, // 最后的温柔
  { freq: FREQ.F4,  time:  8.0, duration: 1.0, velocity: 0.30 }, // 渐弱
  { freq: FREQ.C4,  time:  9.0, duration: 1.0, velocity: 0.20 }, // 归于沉寂
];

// ============================================================================
//  乐谱数据 — 和弦 / 铺底
// ============================================================================

/** 蓄势段弦乐铺底 — 两组和弦交替，营造层次移动 */
const BUILD_PAD: ChordEvent[] = [
  { freqs: [FREQ.C3, FREQ.Eb3, FREQ.G3], time: 0.0, duration: 7.5, velocity: 0.35 }, // Cm
  { freqs: [FREQ.Ab2, FREQ.C3, FREQ.Eb3], time: 7.5, duration: 7.5, velocity: 0.35 }, // Ab (i → VI 色彩转换)
];

/** 高潮段和弦行进 — Cm → Ab → Eb → Bb，每和弦 5 秒 */
const CLIMAX_CHORDS: ChordEvent[] = [
  { freqs: [FREQ.C3, FREQ.Eb3, FREQ.G3, FREQ.C4],  time:  0.0, duration: 5.0, velocity: 0.45 }, // Cm
  { freqs: [FREQ.Ab2, FREQ.C3, FREQ.Eb3, FREQ.Ab3], time:  5.0, duration: 5.0, velocity: 0.45 }, // Ab
  { freqs: [FREQ.Eb3, FREQ.G3, FREQ.Bb3, FREQ.Eb4], time: 10.0, duration: 5.0, velocity: 0.45 }, // Eb
  { freqs: [FREQ.Bb2, FREQ.D3, FREQ.F3, FREQ.Bb3],  time: 15.0, duration: 5.0, velocity: 0.45 }, // Bb
];

// ============================================================================
//  乐谱数据 — 贝斯
// ============================================================================

/** 蓄势段贝斯持续音 — C 和 G 交替低音 */
const BUILD_BASS: NoteEvent[] = [
  { freq: FREQ.C2, time: 0.0, duration: 7.5,  velocity: 0.50 },
  { freq: FREQ.G2, time: 7.5, duration: 7.5,  velocity: 0.50 },
];

/** 高潮段贝斯 — 跟随和弦行进 */
const CLIMAX_BASS: NoteEvent[] = [
  { freq: FREQ.C2,  time:  0.0, duration: 5.0, velocity: 0.60 },
  { freq: FREQ.Ab1, time:  5.0, duration: 5.0, velocity: 0.60 }, // 深沉低音
  { freq: FREQ.Eb2, time: 10.0, duration: 5.0, velocity: 0.60 },
  { freq: FREQ.Bb1, time: 15.0, duration: 5.0, velocity: 0.60 },
];

// ============================================================================
//  乐谱数据 — 竖琴琶音 (高潮段)
// ============================================================================

/**
 * 高潮段竖琴琶音 — 每和弦 10 个音 (0.5s 间隔)，上行→下行→上行
 * 为高潮段增添闪烁的织体纹理
 */
function generateHarpArpeggio(
  notes: number[],
  startTime: number,
  count: number,
  interval: number,
): NoteEvent[] {
  const result: NoteEvent[] = [];
  for (let i = 0; i < count; i++) {
    const cycle = Math.floor(i / notes.length);
    const idx = i % notes.length;
    // 偶数轮正序，奇数轮倒序
    const noteIdx = cycle % 2 === 0 ? idx : notes.length - 1 - idx;
    result.push({
      freq: notes[noteIdx],
      time: startTime + i * interval,
      duration: interval * 1.5,
      velocity: 0.35,
    });
  }
  return result;
}

/** Cm 琶音 (C4 Eb4 G4 C5) */
const HARP_Cm = generateHarpArpeggio([FREQ.C4, FREQ.Eb4, FREQ.G4, FREQ.C5], 0.0, 10, 0.5);
/** Ab 琶音 (Ab3 C4 Eb4 Ab4) */
const HARP_Ab = generateHarpArpeggio([FREQ.Ab3, FREQ.C4, FREQ.Eb4, FREQ.Ab4], 5.0, 10, 0.5);
/** Eb 琶音 (Eb4 G4 Bb4 Eb5) */
const HARP_Eb = generateHarpArpeggio([FREQ.Eb4, FREQ.G4, FREQ.Bb4, FREQ.Eb5], 10.0, 10, 0.5);
/** Bb 琶音 (Bb3 D4 F4 Bb4) */
const HARP_Bb = generateHarpArpeggio([FREQ.Bb3, FREQ.D4, FREQ.F4, FREQ.Bb4], 15.0, 10, 0.5);

/** 高潮段全部竖琴琶音 */
const CLIMAX_HARP: NoteEvent[] = [...HARP_Cm, ...HARP_Ab, ...HARP_Eb, ...HARP_Bb];

// ============================================================================
//  乐谱数据 — 太鼓节奏
// ============================================================================

/** 太鼓击打事件 */
interface TaikoHit {
  time: number;
  velocity: number;
}

/**
 * 蓄势段太鼓 — 稳定脉动，每 0.75s 一击
 * 强弱交替，模拟心跳般的推进感
 */
const BUILD_TAIKO: TaikoHit[] = (() => {
  const hits: TaikoHit[] = [];
  for (let t = 0.5; t < 15; t += 0.75) {
    const beat = Math.round((t - 0.5) / 0.75);
    hits.push({ time: t, velocity: beat % 2 === 0 ? 0.70 : 0.45 });
  }
  return hits;
})();

/**
 * 高潮段太鼓 — 驱动式节奏，每 0.5s 一击
 * 强拍/弱拍交替，每 2 秒一个重音
 */
const CLIMAX_TAIKO: TaikoHit[] = (() => {
  const hits: TaikoHit[] = [];
  for (let t = 0; t < 20; t += 0.5) {
    const beat = Math.round(t / 0.5);
    const isStrong = beat % 2 === 0;
    const isAccent = Math.round(t) % 2 === 0;
    hits.push({
      time: t,
      velocity: isAccent ? 0.90 : isStrong ? 0.65 : 0.40,
    });
  }
  return hits;
})();

// ============================================================================
//  ThemeMusic 主类
// ============================================================================

export class ThemeMusic {
  // ---- AudioContext 与节点 ----
  private ctx: AudioContext | null = null;
  private instrumentBus: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dynamicsGain: GainNode | null = null;
  private userVolumeGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  // ---- 活跃节点追踪 (用于 stop) ----
  private activeOscillators: OscillatorNode[] = [];
  private activeSources: AudioBufferSourceNode[] = [];
  private activeGains: GainNode[] = [];

  // ---- 播放状态 ----
  private _isPlaying = false;
  private _volume = 0.8;
  private stopTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private fadeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // ---- 常量 ----
  private readonly SCHEDULE_DELAY = 0.1; // 调度前预留时间 (秒)
  private readonly STOP_FADE_TIME = 0.8;  // stop() 淡出时间

  // ==========================================================================
  //  构造函数
  // ==========================================================================

  constructor() {
    // AudioContext 在首次 play() 时创建 (浏览器自动播放策略要求用户手势)
  }

  // ==========================================================================
  //  AudioContext 管理
  // ==========================================================================

  /** 确保 AudioContext 已创建并处于运行状态 */
  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      if (!AC) {
        throw new Error('Web Audio API 不被当前浏览器支持');
      }
      this.ctx = new AC();
      this.setupAudioGraph();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** 搭建完整音频处理图 */
  private setupAudioGraph(): void {
    const ctx = this.ctx!;

    // --- 主压缩器 (专业响度控制) ---
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;   // 阈值
    this.compressor.knee.value = 24;         // 软拐点
    this.compressor.ratio.value = 3.5;       // 压缩比
    this.compressor.attack.value = 0.005;    // 快速反应
    this.compressor.release.value = 0.25;    // 平滑释放
    this.compressor.connect(ctx.destination);

    // --- 用户音量控制 ---
    this.userVolumeGain = ctx.createGain();
    this.userVolumeGain.gain.value = this._volume;
    this.userVolumeGain.connect(this.compressor);

    // --- 动态包络 (自动控制各段落响度) ---
    this.dynamicsGain = ctx.createGain();
    this.dynamicsGain.gain.value = 0.7;
    this.dynamicsGain.connect(this.userVolumeGain);

    // --- 干湿混合 ---
    // 干信号
    this.dryGain = ctx.createGain();
    this.dryGain.gain.value = 0.72;
    this.dryGain.connect(this.dynamicsGain);

    // 湿信号 (混响)
    this.reverbGain = ctx.createGain();
    this.reverbGain.gain.value = 0.45;
    this.convolver = ctx.createConvolver();
    this.convolver.buffer = this.createImpulseResponse(3.5, 2.5); // 大厅混响
    this.convolver.connect(this.reverbGain);
    this.reverbGain.connect(this.dynamicsGain);

    // --- 乐器总线 (所有乐器输出汇聚于此) ---
    this.instrumentBus = ctx.createGain();
    this.instrumentBus.gain.value = 1.0;
    this.instrumentBus.connect(this.dryGain);
    this.instrumentBus.connect(this.convolver); // 送入混响
  }

  // ==========================================================================
  //  脉冲响应生成 (混响)
  // ==========================================================================

  /**
   * 合成脉冲响应 (Impulse Response) — 模拟大厅混响
   * 使用指数衰减的随机噪声，左右声道独立生成
   *
   * @param duration  混响尾音长度 (秒)
   * @param decay     衰减指数 (越大衰减越快)
   */
  private createImpulseResponse(duration: number, decay: number): AudioBuffer {
    const ctx = this.ctx!;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        // 指数衰减包络，前 0.3% 为初始反射
        const envelope = i < length * 0.003
          ? (0.5 + Math.random() * 0.5) * (1 - t * 300)
          : Math.pow(1 - t, decay);
        data[i] = (Math.random() * 2 - 1) * envelope;
      }
    }
    return impulse;
  }

  // ==========================================================================
  //  噪声缓冲区生成
  // ==========================================================================

  /** 生成白噪声 AudioBuffer */
  private createNoiseBuffer(duration: number): AudioBuffer {
    const ctx = this.ctx!;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // ==========================================================================
  //  乐器合成 — 古琴 (Guqin / 拨弦)
  // ==========================================================================

  /**
   * 合成古琴拨弦音
   *
   * 特征:
   *  - 正弦波基音 + 谐波 (2x 频率，含轻微非谐性)
   *  - 极快起音 (5ms) + 长指数衰减 (2–3s)
   *  - 低通滤波包络 (起音时明亮，衰减时温暖)
   *  - 延迟颤音 (0.5s 后渐入)
   *  - 双振荡器微失谐 (±3 cents) 增加厚度
   *
   * @param freq      目标频率 (Hz)
   * @param time      绝对起始时间 (AudioContext 时间)
   * @param duration  持续时间 (秒)
   * @param velocity  力度 (0–1)
   * @param pan       立体声像 (-1 至 1，默认 0 居中)
   * @param warmth    音色温暖度 (0=明亮, 1=温暖，默认 0)
   */
  private playGuqinNote(
    freq: number,
    time: number,
    duration: number,
    velocity: number,
    pan = 0,
    warmth = 0,
  ): void {
    const ctx = this.ctx!;
    const bus = this.instrumentBus!;

    // --- 主振荡器 (正弦波，微失谐) ---
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    osc1.detune.value = -3;

    // --- 谐波振荡器 (2x 频率，含非谐性) ---
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2.003; // 轻微非谐性模拟真实弦振动
    osc2.detune.value = 3;

    const harmonicGain = ctx.createGain();
    harmonicGain.gain.value = 0.28;

    // --- 低通滤波 (包络控制) ---
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 1.2;
    const brightCutoff = freq * (8 - warmth * 4);
    const warmCutoff = freq * (2.0 - warmth * 0.5);
    filter.frequency.setValueAtTime(brightCutoff, time);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(warmCutoff, 80), time + 0.4,
    );
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(warmCutoff * 0.75, 60), time + duration,
    );

    // --- 振幅包络 (拨弦: 快速起音 + 指数衰减) ---
    const gain = ctx.createGain();
    const peakGain = velocity * 0.55;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peakGain, time + 0.005);   // 5ms 起音
    gain.gain.exponentialRampToValueAtTime(
      Math.max(peakGain * 0.3, 0.0001), time + 0.3,
    ); // 快速初始衰减
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration); // 长尾衰减

    // --- 延迟颤音 (0.5s 后渐入) ---
    const vibrato = ctx.createOscillator();
    vibrato.type = 'sine';
    vibrato.frequency.value = 4.5; // 颤音频率
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.setValueAtTime(0, time);
    vibratoGain.gain.setValueAtTime(0, time + 0.3);
    vibratoGain.gain.linearRampToValueAtTime(3.5, time + 0.8); // 渐入
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc1.detune);
    vibratoGain.connect(osc2.detune);

    // --- 立体声像 ---
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;

    // --- 连接信号链 ---
    osc1.connect(gain);
    osc2.connect(harmonicGain);
    harmonicGain.connect(gain);
    gain.connect(filter);
    filter.connect(panner);
    panner.connect(bus);

    // --- 调度启停 ---
    const stopTime = time + duration + 0.15;
    osc1.start(time);
    osc2.start(time);
    vibrato.start(time);
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    vibrato.stop(stopTime);

    this.trackOscillator(osc1);
    this.trackOscillator(osc2);
    this.trackOscillator(vibrato);
  }

  // ==========================================================================
  //  乐器合成 — 太鼓 (Taiko / 打击)
  // ==========================================================================

  /**
   * 合成太鼓击打音
   *
   * 特征:
   *  - 白噪声脉冲经低通滤波 (模拟鼓皮 "啪" 声)
   *  - 低频正弦波音高下降 (模拟鼓体 "咚" 声)
   *  - 快速起音 (1ms) + 中等衰减 (0.3s)
   *
   * @param time      绝对起始时间
   * @param velocity  力度 (0–1)
   */
  private playTaiko(time: number, velocity: number): void {
    const ctx = this.ctx!;
    const bus = this.instrumentBus!;

    // --- 噪声层 (鼓皮 "啪") ---
    const noiseBuf = this.createNoiseBuffer(0.4);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 900;
    noiseFilter.Q.value = 1.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, time);
    noiseGain.gain.linearRampToValueAtTime(velocity * 0.55, time + 0.001);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(bus);

    // --- 低频体声 (鼓体 "咚") ---
    const body = ctx.createOscillator();
    body.type = 'sine';
    body.frequency.setValueAtTime(130, time);
    body.frequency.exponentialRampToValueAtTime(55, time + 0.08); // 音高下降

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, time);
    bodyGain.gain.linearRampToValueAtTime(velocity * 0.85, time + 0.001);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);

    body.connect(bodyGain);
    bodyGain.connect(bus);

    // --- 调度启停 ---
    noise.start(time);
    noise.stop(time + 0.4);
    body.start(time);
    body.stop(time + 0.45);

    this.trackSource(noise);
    this.trackOscillator(body);
  }

  // ==========================================================================
  //  乐器合成 — 弦乐铺底 (String Pad)
  // ==========================================================================

  /**
   * 合成弦乐铺底和弦
   *
   * 特征:
   *  - 每个音由 3 个失谐锯齿波叠加 (-7, 0, +7 cents)
   *  - 慢起音 (0.5s) + 持续 + 慢释放 (1s)
   *  - 低通滤波 + LFO 调制 (呼吸感)
   *
   * @param freqs     和弦各音频率数组
   * @param time      绝对起始时间
   * @param duration  持续时间 (秒)
   * @param velocity  力度 (0–1)
   * @param pan       立体声像
   */
  private playStringPad(
    freqs: number[],
    time: number,
    duration: number,
    velocity: number,
    pan = 0,
  ): void {
    const ctx = this.ctx!;
    const bus = this.instrumentBus!;

    // --- 立体声像 ---
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;

    // --- 低通滤波 + LFO ---
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.7;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.25; // 慢速 LFO
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 400; // ±400 Hz 调制深度
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // --- 总振幅包络 ---
    const padGain = ctx.createGain();
    const peak = velocity * 0.22;
    padGain.gain.setValueAtTime(0.0001, time);
    padGain.gain.linearRampToValueAtTime(peak, time + 0.5);  // 慢起音
    padGain.gain.setValueAtTime(peak, time + duration - 1.0);  // 持续
    padGain.gain.linearRampToValueAtTime(0.0001, time + duration); // 释放

    filter.connect(padGain);
    padGain.connect(panner);
    panner.connect(bus);

    // --- 为每个和弦音创建 3 个失谐锯齿波 ---
    const detuneValues = [-7, 0, 7];
    for (const freq of freqs) {
      for (const detune of detuneValues) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start(time);
        osc.stop(time + duration + 0.1);
        this.trackOscillator(osc);
      }
    }

    lfo.start(time);
    lfo.stop(time + duration + 0.1);
    this.trackOscillator(lfo);
  }

  // ==========================================================================
  //  乐器合成 — 竖琴 (Harp / 琶音)
  // ==========================================================================

  /**
   * 合成竖琴拨弦音
   *
   * 特征:
   *  - 三角波 (比正弦波更明亮，含奇次谐波)
   *  - 双振荡器微失谐 (闪烁感)
   *  - 固定高通滤波 (晶莹音色)
   *  - 快速起音 + 中等衰减 (1–1.5s)
   */
  private playHarpNote(
    freq: number,
    time: number,
    duration: number,
    velocity: number,
  ): void {
    const ctx = this.ctx!;
    const bus = this.instrumentBus!;

    // --- 双三角波振荡器 ---
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.value = freq;
    osc1.detune.value = -4;

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq;
    osc2.detune.value = 4;

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.value = 0.6;

    // --- 滤波 (明亮，带轻微谐振) ---
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 5000;
    filter.Q.value = 0.8;

    // --- 振幅包络 ---
    const gain = ctx.createGain();
    const peak = velocity * 0.30;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    // --- 立体声像 (轻微偏右) ---
    const panner = ctx.createStereoPanner();
    panner.pan.value = 0.25;

    osc1.connect(gain);
    osc2.connect(osc2Gain);
    osc2Gain.connect(gain);
    gain.connect(filter);
    filter.connect(panner);
    panner.connect(bus);

    const stopTime = time + duration + 0.1;
    osc1.start(time);
    osc2.start(time);
    osc1.stop(stopTime);
    osc2.stop(stopTime);

    this.trackOscillator(osc1);
    this.trackOscillator(osc2);
  }

  // ==========================================================================
  //  乐器合成 — 贝斯 (Bass / 持续低音)
  // ==========================================================================

  /**
   * 合成贝斯持续音
   *
   * 特征:
   *  - 锯齿波 (丰富低频谐波)
   *  - 低通滤波 (截止 300 Hz，去除高频)
   *  - 中等起音 (50ms) + 持续 + 释放
   */
  private playBassNote(
    freq: number,
    time: number,
    duration: number,
    velocity: number,
  ): void {
    const ctx = this.ctx!;
    const bus = this.instrumentBus!;

    // --- 主振荡器 ---
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    // --- 次振荡器 (低八度，增加厚度) ---
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = freq * 0.5;

    const subGain = ctx.createGain();
    subGain.gain.value = 0.5;

    // --- 低通滤波 ---
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    filter.Q.value = 0.5;

    // --- 振幅包络 ---
    const gain = ctx.createGain();
    const peak = velocity * 0.35;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.05);
    gain.gain.setValueAtTime(peak, time + duration - 0.3);
    gain.gain.linearRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    subOsc.connect(subGain);
    subGain.connect(filter);
    filter.connect(gain);
    gain.connect(bus);

    const stopTime = time + duration + 0.1;
    osc.start(time);
    subOsc.start(time);
    osc.stop(stopTime);
    subOsc.stop(stopTime);

    this.trackOscillator(osc);
    this.trackOscillator(subOsc);
  }

  // ==========================================================================
  //  乐器合成 — 对位旋律 (Counter-Melody)
  // ==========================================================================

  /**
   * 合成对位旋律音 — 古琴变体，低八度，温暖滤波
   * 用于高潮段与主旋律形成复调对话
   */
  private playCounterNote(
    freq: number,
    time: number,
    duration: number,
    velocity: number,
  ): void {
    const ctx = this.ctx!;
    const bus = this.instrumentBus!;

    // --- 正弦波 + 谐波 ---
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    osc1.detune.value = -5;

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2;
    osc2.detune.value = 5;

    const harmonicGain = ctx.createGain();
    harmonicGain.gain.value = 0.15;

    // --- 温暖低通滤波 ---
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 1.0;
    filter.frequency.setValueAtTime(freq * 4, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, time + 0.5);

    // --- 振幅包络 (较慢起音) ---
    const gain = ctx.createGain();
    const peak = velocity * 0.40;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    // --- 立体声像 (偏左，与主旋律形成空间对比) ---
    const panner = ctx.createStereoPanner();
    panner.pan.value = -0.25;

    osc1.connect(gain);
    osc2.connect(harmonicGain);
    harmonicGain.connect(gain);
    gain.connect(filter);
    filter.connect(panner);
    panner.connect(bus);

    const stopTime = time + duration + 0.1;
    osc1.start(time);
    osc2.start(time);
    osc1.stop(stopTime);
    osc2.stop(stopTime);

    this.trackOscillator(osc1);
    this.trackOscillator(osc2);
  }

  // ==========================================================================
  //  段落调度 — 引子 (Intro)
  // ==========================================================================

  /**
   * 调度引子段落 — 古琴独奏
   * @param baseTime 该段落的绝对起始时间
   */
  private scheduleIntro(baseTime: number): void {
    // 动态: 0.7 (适中)
    this.setDynamics(baseTime, 0, 0.7);

    // 古琴旋律 (居中)
    for (const note of INTRO_MELODY) {
      this.playGuqinNote(
        note.freq,
        baseTime + note.time,
        note.duration,
        note.velocity,
        0,    // 居中
        0,    // 正常音色
      );
    }
  }

  // ==========================================================================
  //  段落调度 — 蓄势 (Build)
  // ==========================================================================

  /**
   * 调度蓄势段落 — 古琴 + 贝斯 + 弦乐铺底 + 太鼓
   * @param baseTime 该段落的绝对起始时间
   */
  private scheduleBuild(baseTime: number): void {
    // 动态: 0.7 → 0.88 (渐强)
    this.setDynamics(baseTime, 0, 0.7);
    this.rampDynamics(baseTime + 0.1, 14.9, 0.88);

    // --- 古琴旋律 (居中) ---
    for (const note of BUILD_MELODY) {
      this.playGuqinNote(
        note.freq,
        baseTime + note.time,
        note.duration,
        note.velocity,
        0,
        0,
      );
    }

    // --- 贝斯持续音 ---
    for (const note of BUILD_BASS) {
      this.playBassNote(
        note.freq,
        baseTime + note.time,
        note.duration,
        note.velocity,
      );
    }

    // --- 弦乐铺底 (左右分布) ---
    for (const chord of BUILD_PAD) {
      // 左声道
      this.playStringPad(chord.freqs, baseTime + chord.time, chord.duration, chord.velocity, -0.35);
      // 右声道 (微失谐增加宽度)
      this.playStringPad(chord.freqs, baseTime + chord.time, chord.duration, chord.velocity * 0.85, 0.35);
    }

    // --- 太鼓脉动 ---
    for (const hit of BUILD_TAIKO) {
      this.playTaiko(baseTime + hit.time, hit.velocity);
    }
  }

  // ==========================================================================
  //  段落调度 — 高潮 (Climax)
  // ==========================================================================

  /**
   * 调度高潮段落 — 全编制交响
   * @param baseTime 该段落的绝对起始时间
   */
  private scheduleClimax(baseTime: number): void {
    // 动态: 0.88 → 1.0 (快速到达满值) → 持续
    this.setDynamics(baseTime, 0, 0.88);
    this.rampDynamics(baseTime + 0.1, 2.0, 1.0);

    // --- 主旋律 (高音古琴，居中) ---
    for (const note of CLIMAX_MELODY) {
      this.playGuqinNote(
        note.freq,
        baseTime + note.time,
        note.duration,
        note.velocity,
        0,
        0,
      );
    }

    // --- 对位旋律 (低八度，偏左) ---
    for (const note of CLIMAX_COUNTER_MELODY) {
      this.playCounterNote(
        note.freq,
        baseTime + note.time,
        note.duration,
        note.velocity,
      );
    }

    // --- 和弦行进 (弦乐铺底，左右分布) ---
    for (const chord of CLIMAX_CHORDS) {
      this.playStringPad(chord.freqs, baseTime + chord.time, chord.duration, chord.velocity, -0.3);
      this.playStringPad(chord.freqs, baseTime + chord.time, chord.duration, chord.velocity * 0.85, 0.3);
    }

    // --- 贝斯 ---
    for (const note of CLIMAX_BASS) {
      this.playBassNote(
        note.freq,
        baseTime + note.time,
        note.duration,
        note.velocity,
      );
    }

    // --- 竖琴琶音 ---
    for (const note of CLIMAX_HARP) {
      this.playHarpNote(
        note.freq,
        baseTime + note.time,
        note.duration,
        note.velocity,
      );
    }

    // --- 太鼓驱动节奏 ---
    for (const hit of CLIMAX_TAIKO) {
      this.playTaiko(baseTime + hit.time, hit.velocity);
    }
  }

  // ==========================================================================
  //  段落调度 — 收束 (Resolution)
  // ==========================================================================

  /**
   * 调度收束段落 — 回归古琴独奏，渐入静默
   * @param baseTime 该段落的绝对起始时间
   */
  private scheduleResolution(baseTime: number): void {
    // 动态: 0.8 → 0.0 (10 秒淡出)
    this.setDynamics(baseTime, 0, 0.8);
    this.rampDynamics(baseTime + 0.1, 9.9, 0.0);

    // --- 古琴旋律 (与引子呼应) ---
    for (const note of RESOLUTION_MELODY) {
      this.playGuqinNote(
        note.freq,
        baseTime + note.time,
        note.duration,
        note.velocity,
        0,
        0.3,  // 更温暖的音色
      );
    }
  }

  // ==========================================================================
  //  动态包络控制
  // ==========================================================================

  /** 设置动态增益瞬时值 */
  private setDynamics(baseTime: number, offset: number, value: number): void {
    if (!this.dynamicsGain || !this.ctx) return;
    const t = baseTime + offset;
    try {
      this.dynamicsGain.gain.cancelScheduledValues(t);
      this.dynamicsGain.gain.setValueAtTime(value, t);
    } catch { /* ignore */ }
  }

  /** 线性渐变动态增益 */
  private rampDynamics(baseTime: number, duration: number, target: number): void {
    if (!this.dynamicsGain || !this.ctx) return;
    const t = baseTime;
    try {
      this.dynamicsGain.gain.linearRampToValueAtTime(target, t + duration);
    } catch { /* ignore */ }
  }

  // ==========================================================================
  //  节点追踪工具
  // ==========================================================================

  /** 追踪活跃振荡器 (用于 stop 时清理) */
  private trackOscillator(osc: OscillatorNode): void {
    this.activeOscillators.push(osc);
    osc.onended = () => {
      const idx = this.activeOscillators.indexOf(osc);
      if (idx >= 0) this.activeOscillators.splice(idx, 1);
    };
  }

  /** 追踪活跃 AudioBufferSourceNode */
  private trackSource(src: AudioBufferSourceNode): void {
    this.activeSources.push(src);
    src.onended = () => {
      const idx = this.activeSources.indexOf(src);
      if (idx >= 0) this.activeSources.splice(idx, 1);
    };
  }

  /** 停止所有活跃节点 */
  private stopAllNodes(): void {
    for (const osc of this.activeOscillators) {
      try { osc.stop(); } catch { /* 已停止 */ }
    }
    for (const src of this.activeSources) {
      try { src.stop(); } catch { /* 已停止 */ }
    }
    this.activeOscillators = [];
    this.activeSources = [];
    this.activeGains = [];
  }

  // ==========================================================================
  //  公共 API
  // ==========================================================================

  /**
   * 播放完整 60 秒主题曲
   * 从引子到收束，完整演绎四个乐章
   */
  play(): void {
    if (this._isPlaying) {
      this.stopImmediate();
    }
    this.clearTimeouts();

    const ctx = this.ensureContext();
    const startTime = ctx.currentTime + this.SCHEDULE_DELAY;

    this._isPlaying = true;

    // 依次调度四个段落
    this.scheduleIntro(startTime + SECTION_OFFSET.intro);
    this.scheduleBuild(startTime + SECTION_OFFSET.build);
    this.scheduleClimax(startTime + SECTION_OFFSET.climax);
    this.scheduleResolution(startTime + SECTION_OFFSET.resolution);

    // 调度播放结束回调
    this.stopTimeoutId = setTimeout(() => {
      this._isPlaying = false;
      this.activeOscillators = [];
      this.activeSources = [];
    }, (TOTAL_DURATION + this.SCHEDULE_DELAY + 1) * 1000);
  }

  /**
   * 播放指定段落
   * @param name 段落名称: 'intro' | 'build' | 'climax' | 'resolution'
   */
  playSection(name: SectionName): void {
    if (this._isPlaying) {
      this.stopImmediate();
    }
    this.clearTimeouts();

    const ctx = this.ensureContext();
    const startTime = ctx.currentTime + this.SCHEDULE_DELAY;

    this._isPlaying = true;
    const duration = SECTION_DURATION[name];

    switch (name) {
      case 'intro':
        this.scheduleIntro(startTime);
        break;
      case 'build':
        this.scheduleBuild(startTime);
        break;
      case 'climax':
        this.scheduleClimax(startTime);
        break;
      case 'resolution':
        this.scheduleResolution(startTime);
        break;
    }

    // 调度段落结束回调
    this.stopTimeoutId = setTimeout(() => {
      this._isPlaying = false;
      this.activeOscillators = [];
      this.activeSources = [];
    }, (duration + this.SCHEDULE_DELAY + 1) * 1000);
  }

  /**
   * 停止播放 (带淡出)
   * 在 STOP_FADE_TIME 秒内平滑淡出至静默，然后停止所有节点
   */
  stop(): void {
    if (!this._isPlaying || !this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 清除播放结束定时器 (保留淡出定时器)
    if (this.stopTimeoutId !== null) {
      clearTimeout(this.stopTimeoutId);
      this.stopTimeoutId = null;
    }

    // 淡出用户音量
    if (this.userVolumeGain) {
      try {
        this.userVolumeGain.gain.cancelScheduledValues(now);
        this.userVolumeGain.gain.setValueAtTime(this.userVolumeGain.gain.value, now);
        this.userVolumeGain.gain.linearRampToValueAtTime(0, now + this.STOP_FADE_TIME);
      } catch { /* ignore */ }
    }

    // 淡出后停止所有节点
    this.fadeTimeoutId = setTimeout(() => {
      this.stopAllNodes();
      // 恢复用户音量
      if (this.userVolumeGain) {
        this.userVolumeGain.gain.value = this._volume;
      }
      this._isPlaying = false;
      this.fadeTimeoutId = null;
    }, this.STOP_FADE_TIME * 1000 + 100);
  }

  /**
   * 立即停止 (无淡出)
   * 内部使用，用于切换播放时快速清理
   */
  private stopImmediate(): void {
    this.stopAllNodes();
    this._isPlaying = false;
    // 恢复动态和音量
    if (this.dynamicsGain && this.ctx) {
      this.dynamicsGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.dynamicsGain.gain.value = 0.7;
    }
    if (this.userVolumeGain && this.ctx) {
      this.userVolumeGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.userVolumeGain.gain.value = this._volume;
    }
  }

  /**
   * 设置主音量
   * @param v 音量 (0–1)，0 = 静音，1 = 最大
   */
  setVolume(v: number): void {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.userVolumeGain && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.userVolumeGain.gain.cancelScheduledValues(now);
        this.userVolumeGain.gain.setValueAtTime(this.userVolumeGain.gain.value, now);
        this.userVolumeGain.gain.linearRampToValueAtTime(this._volume, now + 0.1);
      } catch {
        this.userVolumeGain.gain.value = this._volume;
      }
    }
  }

  /** 当前是否正在播放 */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /** 当前音量 (0–1) */
  get volume(): number {
    return this._volume;
  }

  // ==========================================================================
  //  内部工具
  // ==========================================================================

  /** 清除所有定时器 */
  private clearTimeouts(): void {
    if (this.stopTimeoutId !== null) {
      clearTimeout(this.stopTimeoutId);
      this.stopTimeoutId = null;
    }
    if (this.fadeTimeoutId !== null) {
      clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = null;
    }
  }

  /**
   * 销毁实例，释放资源
   * 关闭 AudioContext，清除所有引用
   */
  dispose(): void {
    this.stopImmediate();
    this.clearTimeouts();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.instrumentBus = null;
    this.dryGain = null;
    this.convolver = null;
    this.reverbGain = null;
    this.dynamicsGain = null;
    this.userVolumeGain = null;
    this.compressor = null;
  }
}

// ============================================================================
//  使用示例 (Usage Example)
// ============================================================================
//
//  const theme = new ThemeMusic();
//
//  // 播放完整主题曲
//  theme.play();
//
//  // 播放特定段落 (如章节完成时播放高潮段)
//  theme.playSection('climax');
//
//  // 调节音量
//  theme.setVolume(0.6);
//
//  // 停止播放 (带淡出)
//  theme.stop();
//
//  // 销毁实例
//  theme.dispose();
//
// ============================================================================
