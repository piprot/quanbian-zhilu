/**
 * ============================================================
 * 分层环境音效模块 (Ambient Layers)
 * 领导力训练网页游戏 · 东方美学主题
 * ============================================================
 *
 * 本模块使用 Web Audio API 创建三种不同的环境氛围音效：
 *   1. 会议室 (boardroom)  — 沉稳、专业的室内氛围
 *   2. 深夜 (latenight)    — 沉思、宁静的夜间氛围
 *   3. 危机 (crisis)       — 紧张、压迫的危机氛围
 *
 * 合成原理概述：
 *   - 所有音效均通过振荡器 (OscillatorNode)、噪声发生器、
 *     滤波器 (BiquadFilterNode) 和增益节点 (GainNode) 实时合成
 *   - 不依赖任何外部音频文件，完全程序化生成
 *   - 每个环境由多个音频层叠加而成，各层独立控制
 *
 * ============================================================
 */

/** 环境类型枚举 */
type EnvironmentType = 'boardroom' | 'latenight' | 'crisis';

/**
 * 音频层接口 —— 每个环境音效由若干层组成
 * 每层包含自己的音频节点链和增益控制
 */
interface AudioLayer {
  /** 该层的输出增益节点 */
  gain: GainNode;
  /** 该层包含的所有振荡器（需要停止的） */
  oscillators: OscillatorNode[];
  /** 该层包含的所有噪声源节点 */
  noiseSources: AudioBufferSourceNode[];
  /** 定时器 ID 列表（用于清理随机触发） */
  timers: number[];
  /** 该层的音频节点列表（用于断开连接） */
  nodes: AudioNode[];
}

/**
 * AmbientLayers —— 分层环境音效管理器
 *
 * 使用方法：
 *   const ctx = new AudioContext();
 *   const masterGain = ctx.createGain();
 *   masterGain.connect(ctx.destination);
 *   const ambient = new AmbientLayers(ctx, masterGain);
 *   ambient.setEnvironment('boardroom');
 *   ambient.setIntensity(0.7);
 *   // 切换环境（带 2 秒交叉淡入淡出）
 *   ambient.crossfadeTo('latenight');
 *   // 清理
 *   ambient.dispose();
 */
export class AmbientLayers {
  /** 音频上下文 */
  private ctx: AudioContext;
  /** 音乐总线 —— 所有音效通过此节点输出 */
  private musicBus: GainNode;

  /** 当前激活的环境名称 */
  private currentEnv: EnvironmentType | null = null;
  /** 当前环境的音频层集合 */
  private layers: Map<string, AudioLayer> = new Map();

  /** 当前强度值 (0-1) */
  private intensity: number = 0.5;

  /** 交叉淡入淡出状态 */
  private fadingOut: Map<string, AudioLayer> | null = null;
  private fadeTimer: number | null = null;

  /** 主输出增益 —— 控制整体音量 */
  private masterGain: GainNode;

  constructor(audioContext: AudioContext, musicBus: GainNode) {
    this.ctx = audioContext;
    this.musicBus = musicBus;

    // 创建主增益节点，作为所有环境音效的总控
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.musicBus);
  }

  /* ============================================================
   * 公共接口
   * ============================================================ */

  /**
   * 设置环境音效 —— 立即切换（无过渡）
   * @param env 目标环境类型
   */
  setEnvironment(env: EnvironmentType): void {
    // 先停止当前所有层
    this.stopCurrentLayers();

    this.currentEnv = env;
    this.layers.clear();

    // 根据环境类型构建对应的音频层
    switch (env) {
      case 'boardroom':
        this.buildBoardroom();
        break;
      case 'latenight':
        this.buildLateNight();
        break;
      case 'crisis':
        this.buildCrisis();
        break;
    }

    // 应用当前强度
    this.applyIntensity();
  }

  /**
   * 交叉淡入淡出切换到新环境
   * 旧环境在 duration 秒内淡出，新环境同时淡入
   * @param env 目标环境名称
   * @param duration 过渡时长（秒），默认 2 秒
   */
  crossfadeTo(env: EnvironmentType, duration: number = 2): void {
    // 清除之前的淡入淡出定时器
    if (this.fadeTimer !== null) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }

    // 将当前层标记为淡出层
    if (this.layers.size > 0) {
      this.fadingOut = new Map(this.layers);

      // 设置淡出增益曲线
      const now = this.ctx.currentTime;
      this.fadingOut.forEach((layer) => {
        layer.gain.gain.cancelScheduledValues(now);
        layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
        layer.gain.gain.linearRampToValueAtTime(0, now + duration);
      });

      // 淡出结束后清理旧层
      this.fadeTimer = window.setTimeout(() => {
        if (this.fadingOut) {
          this.fadingOut.forEach((layer) => this.destroyLayer(layer));
          this.fadingOut = null;
        }
        this.fadeTimer = null;
      }, duration * 1000);
    }

    // 构建新环境层
    this.currentEnv = env;
    this.layers.clear();

    switch (env) {
      case 'boardroom':
        this.buildBoardroom();
        break;
      case 'latenight':
        this.buildLateNight();
        break;
      case 'crisis':
        this.buildCrisis();
        break;
    }

    // 新层从静音开始淡入
    const now = this.ctx.currentTime;
    this.layers.forEach((layer) => {
      const targetGain = layer.gain.gain.value;
      layer.gain.gain.setValueAtTime(0, now);
      layer.gain.gain.linearRampToValueAtTime(targetGain, now + duration);
    });

    this.applyIntensity();
  }

  /**
   * 设置音效强度
   * 影响整体音量和各层的密度/音量
   * @param level 强度值，范围 0 到 1
   */
  setIntensity(level: number): void {
    this.intensity = Math.max(0, Math.min(1, level));
    this.applyIntensity();
  }

  /**
   * 停止所有音效
   */
  stop(): void {
    this.stopCurrentLayers();
    this.layers.clear();
    this.currentEnv = null;
  }

  /**
   * 释放所有资源 —— 在组件销毁时调用
   */
  dispose(): void {
    this.stop();

    // 清理淡出中的层
    if (this.fadingOut) {
      this.fadingOut.forEach((layer) => this.destroyLayer(layer));
      this.fadingOut = null;
    }

    if (this.fadeTimer !== null) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }

    this.masterGain.disconnect();
  }

  /* ============================================================
   * 会议室环境 (Boardroom)
   * ============================================================
   *
   * 合成思路：
   *   模拟一间安静的现代会议室，有以下声音元素：
   *   - 空调/暖通系统的低频嗡鸣声 (60Hz 正弦波 + 轻微调制)
   *   - 偶尔的纸张翻动声 (滤波噪声突发)
   *   - 远处的时钟滴答声 (高频短促点击)
   *   - 空调白噪声底 (高通滤波的宽带噪声)
   *
   * 整体感受：沉稳、安静、专业，适合思考和决策场景
   * ============================================================
   */
  private buildBoardroom(): void {
    // --- 层1: 暖通系统低频嗡鸣 ---
    // 原理：60Hz 正弦波模拟空调压缩机嗡鸣
    // 加入轻微的频率调制 (LFO) 使声音更自然，避免过于机械
    {
      const layer = this.createLayer('hvac');

      // 主振荡器 —— 60Hz 正弦波
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 60;

      // LFO 调制器 —— 0.1Hz 正弦波，用于轻微调制主频率
      // 模拟真实空调压缩机转速的微小波动
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1;

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 2; // 调制深度：±2Hz

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // 增益控制 —— 非常低的音量，作为背景底噪
      layer.gain.gain.value = 0.03 * this.intensity;

      osc.connect(layer.gain);
      layer.gain.connect(this.masterGain);

      osc.start();
      lfo.start();

      layer.oscillators.push(osc, lfo);
      layer.nodes.push(lfoGain);
    }

    // --- 层2: 纸张翻动声 ---
    // 原理：使用带通滤波的噪声突发模拟纸张翻动
    // 在随机时间间隔触发，模拟会议中偶尔翻文件的声响
    {
      const layer = this.createLayer('paper');
      layer.gain.gain.value = 0.08 * this.intensity;

      // 创建噪声缓冲区 —— 0.15 秒的短促噪声
      const noiseBuffer = this.createNoiseBuffer(0.15);

      // 定时触发纸张声 —— 每 4-12 秒随机触发一次
      const schedulePaper = () => {
        if (this.currentEnv !== 'boardroom') return;

        const source = this.ctx.createBufferSource();
        source.buffer = noiseBuffer;

        // 带通滤波器 —— 模拟纸张的频率特征 (2-6kHz)
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 3000 + Math.random() * 3000;
        bandpass.Q.value = 1.5;

        // 随机增益变化 —— 模拟不同力度的翻纸
        const paperGain = this.ctx.createGain();
        paperGain.gain.value = 0.3 + Math.random() * 0.5;

        // 包络 —— 快速起音，自然衰减
        const now = this.ctx.currentTime;
        paperGain.gain.setValueAtTime(0, now);
        paperGain.gain.linearRampToValueAtTime(
          0.3 + Math.random() * 0.5,
          now + 0.01
        );
        paperGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        source.connect(bandpass);
        bandpass.connect(paperGain);
        paperGain.connect(layer.gain);
        layer.gain.connect(this.masterGain);

        source.start(now);
        source.stop(now + 0.2);

        layer.noiseSources.push(source);
        layer.nodes.push(bandpass, paperGain);

        // 安排下一次触发
        const nextTime = 4000 + Math.random() * 8000;
        const timerId = window.setTimeout(schedulePaper, nextTime);
        layer.timers.push(timerId);
      };

      // 首次延迟 2-5 秒后开始
      const initialDelay = window.setTimeout(schedulePaper, 2000 + Math.random() * 3000);
      layer.timers.push(initialDelay);
    }

    // --- 层3: 时钟滴答声 ---
    // 原理：极高音量的短促高频点击，模拟远处挂钟
    // 非常低的音量，若有若无，增加空间的真实感
    {
      const layer = this.createLayer('clock');
      layer.gain.gain.value = 0.02 * this.intensity;

      const scheduleTick = () => {
        if (this.currentEnv !== 'boardroom') return;

        // 点击声 —— 短促的高频正弦波突发
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 4000 + Math.random() * 1000;

        const tickGain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        // 极短的包络 —— 模拟机械点击
        tickGain.gain.setValueAtTime(0, now);
        tickGain.gain.linearRampToValueAtTime(0.5, now + 0.001);
        tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(tickGain);
        tickGain.connect(layer.gain);
        layer.gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.05);

        layer.oscillators.push(osc);
        layer.nodes.push(tickGain);

        // 每 1 秒一次（模拟秒针），加微小随机偏移
        const nextTick = 980 + Math.random() * 40;
        const timerId = window.setTimeout(scheduleTick, nextTick);
        layer.timers.push(timerId);
      };

      const timerId = window.setTimeout(scheduleTick, 1000);
      layer.timers.push(timerId);
    }

    // --- 层4: 空调白噪声底 ---
    // 原理：高通滤波的宽带噪声，模拟空调出风口的持续气流声
    // 音量极低，仅用于填充空间的"静默感"
    {
      const layer = this.createLayer('aircon');

      // 较长的噪声缓冲区 —— 2 秒，循环播放
      const noiseBuffer = this.createNoiseBuffer(2);

      const source = this.ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      // 高通滤波器 —— 切除低频，只保留高频气流声
      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 2000;
      highpass.Q.value = 0.5;

      layer.gain.gain.value = 0.015 * this.intensity;

      source.connect(highpass);
      highpass.connect(layer.gain);
      layer.gain.connect(this.masterGain);

      source.start();

      layer.noiseSources.push(source);
      layer.nodes.push(highpass);
    }
  }

  /* ============================================================
   * 深夜环境 (Late Night)
   * ============================================================
   *
   * 合成思路：
   *   模拟深夜独坐书房的沉思氛围：
   *   - 蟋蟀般的虫鸣 (高频振荡器突发，随机间隔)
   *   - 柔和的风声 (低通滤波噪声 + LFO 缓慢调制)
   *   - 远处的钟声 (正弦波 + 长衰减，随机五声音阶音符)
   *   - 微弱的房间混响感 (通过多个延迟叠加模拟)
   *
   * 整体感受：宁静、深远、略带孤寂，适合反思和战略规划
   * ============================================================
   */
  private buildLateNight(): void {
    // --- 层1: 蟋蟀/虫鸣 ---
    // 原理：高频正弦波以短促突发方式播放
    // 每个突发的频率略有不同，间隔随机，模拟真实虫鸣的不规则性
    {
      const layer = this.createLayer('crickets');
      layer.gain.gain.value = 0.04 * this.intensity;

      const scheduleChirp = () => {
        if (this.currentEnv !== 'latenight') return;

        // 一组连续的短促 chirp —— 模拟蟋蟀连续鸣叫
        const chirpCount = 2 + Math.floor(Math.random() * 4);
        const baseFreq = 4500 + Math.random() * 1500;

        for (let i = 0; i < chirpCount; i++) {
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = baseFreq + Math.random() * 200;

          const chirpGain = this.ctx.createGain();
          const startTime = this.ctx.currentTime + i * 0.08;

          // 每个 chirp 的包络：极快的起音和衰减
          chirpGain.gain.setValueAtTime(0, startTime);
          chirpGain.gain.linearRampToValueAtTime(
            0.2 + Math.random() * 0.3,
            startTime + 0.005
          );
          chirpGain.gain.exponentialRampToValueAtTime(
            0.001,
            startTime + 0.06
          );

          osc.connect(chirpGain);
          chirpGain.connect(layer.gain);
          layer.gain.connect(this.masterGain);

          osc.start(startTime);
          osc.stop(startTime + 0.08);

          layer.oscillators.push(osc);
          layer.nodes.push(chirpGain);
        }

        // 下一组虫鸣的间隔：2-8 秒
        const nextTime = 2000 + Math.random() * 6000;
        const timerId = window.setTimeout(scheduleChirp, nextTime);
        layer.timers.push(timerId);
      };

      const initialDelay = window.setTimeout(scheduleChirp, 1000 + Math.random() * 2000);
      layer.timers.push(initialDelay);
    }

    // --- 层2: 柔和风声 ---
    // 原理：低通滤波的宽带噪声 + LFO 调制增益
    // LFO 的频率很低 (0.05-0.1Hz)，模拟风的起伏呼吸感
    {
      const layer = this.createLayer('wind');

      // 长噪声缓冲区 —— 循环播放
      const noiseBuffer = this.createNoiseBuffer(3);

      const source = this.ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      // 低通滤波器 —— 只保留低频风声
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 400;
      lowpass.Q.value = 0.7;

      // LFO 调制滤波器截止频率 —— 模拟风力的变化
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05; // 极慢的调制

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 150; // 截止频率摆动范围 ±150Hz

      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);

      layer.gain.gain.value = 0.06 * this.intensity;

      source.connect(lowpass);
      lowpass.connect(layer.gain);
      layer.gain.connect(this.masterGain);

      source.start();
      lfo.start();

      layer.noiseSources.push(source);
      layer.oscillators.push(lfo);
      layer.nodes.push(lowpass, lfoGain);
    }

    // --- 层3: 远处钟声 ---
    // 原理：正弦波 + 极长的指数衰减，模拟远处寺庙/钟楼的声音
    // 使用中国五声音阶 (宫商角徵羽) 的音符，增加东方韵味
    {
      const layer = this.createLayer('bell');
      layer.gain.gain.value = 0.05 * this.intensity;

      // 五声音阶频率 —— C D E G A (对应宫商角徵羽)
      // 选择较低 octave 使声音更沉稳悠远
      const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00];

      const scheduleBell = () => {
        if (this.currentEnv !== 'latenight') return;

        // 随机选择一个五声音阶音符
        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

        // 基音 —— 正弦波
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        // 泛音 —— 另一个正弦波在 2.5 倍频率处，模拟钟的泛音列
        const harmonic = this.ctx.createOscillator();
        harmonic.type = 'sine';
        harmonic.frequency.value = freq * 2.5;

        const bellGain = this.ctx.createGain();
        const harmonicGain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        // 基音包络 —— 快速起音，极长衰减 (4-6 秒)
        const decayTime = 4 + Math.random() * 2;
        bellGain.gain.setValueAtTime(0, now);
        bellGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

        // 泛音包络 —— 衰减更快，模拟钟泛音的自然消散
        harmonicGain.gain.setValueAtTime(0, now);
        harmonicGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
        harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime * 0.5);

        osc.connect(bellGain);
        harmonic.connect(harmonicGain);
        bellGain.connect(layer.gain);
        harmonicGain.connect(layer.gain);
        layer.gain.connect(this.masterGain);

        osc.start(now);
        harmonic.start(now);
        osc.stop(now + decayTime + 0.1);
        harmonic.stop(now + decayTime * 0.5 + 0.1);

        layer.oscillators.push(osc, harmonic);
        layer.nodes.push(bellGain, harmonicGain);

        // 下一次钟声：8-20 秒后，非常稀疏
        const nextTime = 8000 + Math.random() * 12000;
        const timerId = window.setTimeout(scheduleBell, nextTime);
        layer.timers.push(timerId);
      };

      // 首次钟声在 3-8 秒后
      const initialDelay = window.setTimeout(scheduleBell, 3000 + Math.random() * 5000);
      layer.timers.push(initialDelay);
    }

    // --- 层4: 房间混响感 ---
    // 原理：使用极低音量的噪声 + 长延迟模拟小房间的混响尾巴
    // 这里简单使用低通滤波噪声作为"房间底噪"来暗示空间感
    {
      const layer = this.createLayer('roomTone');

      const noiseBuffer = this.createNoiseBuffer(2);
      const source = this.ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      // 带通滤波器 —— 模拟房间的共振频率
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 300;
      bandpass.Q.value = 2;

      layer.gain.gain.value = 0.01 * this.intensity;

      source.connect(bandpass);
      bandpass.connect(layer.gain);
      layer.gain.connect(this.masterGain);

      source.start();

      layer.noiseSources.push(source);
      layer.nodes.push(bandpass);
    }
  }

  /* ============================================================
   * 危机环境 (Crisis)
   * ============================================================
   *
   * 合成思路：
   *   模拟高压决策场景的紧张氛围：
   *   - 低沉的隆隆声 (锯齿波通过重低通 + 缓慢音高调制)
   *   - 不规则心跳般的脉冲 (类 kick 合成，40-60 BPM)
   *   - 紧张弦乐般的持续音 (失谐锯齿波对)
   *   - 偶尔的金属撞击声 (高频 + 长混响尾巴)
   *
   * 整体感受：压迫、紧迫、不安，适合危机处理和紧急决策
   * ============================================================
   */
  private buildCrisis(): void {
    // --- 层1: 低沉隆隆声 ---
    // 原理：锯齿波包含丰富谐波，通过低通滤波器只保留低频
    // 缓慢的音高调制使声音产生"呼吸"般的不安感
    {
      const layer = this.createLayer('drone');

      // 主振荡器 —— 锯齿波，低频
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 40;

      // 低通滤波器 —— 切除大部分高频，只留下隆隆低频
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 100;
      lowpass.Q.value = 4; // 高 Q 值增加共振，使声音更有"力量感"

      // LFO 调制音高 —— 模拟不稳定的地面震动感
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.08; // 极慢的调制

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 8; // 音高调制深度 ±8Hz

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // LFO 同时调制滤波器截止频率 —— 产生"明暗"变化
      const lfoFilterGain = this.ctx.createGain();
      lfoFilterGain.gain.value = 30;
      lfo.connect(lfoFilterGain);
      lfoFilterGain.connect(lowpass.frequency);

      layer.gain.gain.value = 0.08 * this.intensity;

      osc.connect(lowpass);
      lowpass.connect(layer.gain);
      layer.gain.connect(this.masterGain);

      osc.start();
      lfo.start();

      layer.oscillators.push(osc, lfo);
      layer.nodes.push(lowpass, lfoGain, lfoFilterGain);
    }

    // --- 层2: 心跳脉冲 ---
    // 原理：模拟 kick drum 的合成方式
    // 正弦波从高频率快速滑向低频，产生"嘭"的冲击感
    // BPM 在 40-60 之间随机波动，模拟不规则的心跳
    {
      const layer = this.createLayer('heartbeat');
      layer.gain.gain.value = 0.12 * this.intensity;

      const scheduleBeat = () => {
        if (this.currentEnv !== 'crisis') return;

        const now = this.ctx.currentTime;

        // 心跳振荡器 —— 正弦波
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';

        // 心跳增益
        const beatGain = this.ctx.createGain();

        // 心跳合成：频率从 150Hz 快速下滑到 40Hz
        // 模拟真实心跳的低频冲击感
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

        // 振幅包络：快速起音，短促衰减
        beatGain.gain.setValueAtTime(0, now);
        beatGain.gain.linearRampToValueAtTime(0.8, now + 0.01);
        beatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(beatGain);
        beatGain.connect(layer.gain);
        layer.gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.4);

        layer.oscillators.push(osc);
        layer.nodes.push(beatGain);

        // 第二拍 —— 模拟心跳的"咚-哒"双拍节奏
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        const beatGain2 = this.ctx.createGain();

        const secondBeatTime = now + 0.2;
        osc2.frequency.setValueAtTime(120, secondBeatTime);
        osc2.frequency.exponentialRampToValueAtTime(35, secondBeatTime + 0.1);

        beatGain2.gain.setValueAtTime(0, secondBeatTime);
        beatGain2.gain.linearRampToValueAtTime(0.4, secondBeatTime + 0.01);
        beatGain2.gain.exponentialRampToValueAtTime(0.001, secondBeatTime + 0.2);

        osc2.connect(beatGain2);
        beatGain2.connect(layer.gain);

        osc2.start(secondBeatTime);
        osc2.stop(secondBeatTime + 0.3);

        layer.oscillators.push(osc2);
        layer.nodes.push(beatGain2);

        // 下一次心跳间隔：根据 BPM 40-60 计算
        // BPM 40 = 1500ms, BPM 60 = 1000ms
        const bpm = 40 + Math.random() * 20;
        const interval = (60 / bpm) * 1000;

        const timerId = window.setTimeout(scheduleBeat, interval);
        layer.timers.push(timerId);
      };

      const timerId = window.setTimeout(scheduleBeat, 500);
      layer.timers.push(timerId);
    }

    // --- 层3: 紧张弦乐 ---
    // 原理：两个略微失谐的锯齿波叠加
    // 失谐产生"拍频"效果，营造不安和紧张感
    // 通过低通滤波器控制亮度，缓慢变化
    {
      const layer = this.createLayer('strings');

      // 锯齿波对 —— 频率略微不同，产生拍频
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 220; // A3

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sawtooth';
      // 失谐 +3 音分 —— 微妙但可感知的不协和
      osc2.frequency.value = 220.4;

      // 低通滤波器 —— 使声音沉闷压抑
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 600;
      lowpass.Q.value = 1;

      // LFO 调制滤波器 —— 产生明暗呼吸
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.03; // 非常缓慢

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 200;

      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);

      layer.gain.gain.value = 0.04 * this.intensity;

      osc1.connect(lowpass);
      osc2.connect(lowpass);
      lowpass.connect(layer.gain);
      layer.gain.connect(this.masterGain);

      osc1.start();
      osc2.start();
      lfo.start();

      layer.oscillators.push(osc1, osc2, lfo);
      layer.nodes.push(lowpass, lfoGain);
    }

    // --- 层4: 金属撞击声 ---
    // 原理：高频正弦波 + 极长衰减，模拟远处金属碰撞的回响
    // 随机间隔触发，增加不可预测的紧张感
    {
      const layer = this.createLayer('metallic');
      layer.gain.gain.value = 0.06 * this.intensity;

      const schedulePing = () => {
        if (this.currentEnv !== 'crisis') return;

        const now = this.ctx.currentTime;

        // 金属音 —— 高频正弦波
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 2000 + Math.random() * 3000;

        // 第二个泛音 —— 增加金属质感
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = osc.frequency.value * 1.5;

        const pingGain = this.ctx.createGain();
        const pingGain2 = this.ctx.createGain();

        // 长衰减包络 —— 模拟金属共鸣的余音
        const decayTime = 2 + Math.random() * 2;

        pingGain.gain.setValueAtTime(0, now);
        pingGain.gain.linearRampToValueAtTime(0.3, now + 0.002);
        pingGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

        pingGain2.gain.setValueAtTime(0, now);
        pingGain2.gain.linearRampToValueAtTime(0.1, now + 0.002);
        pingGain2.gain.exponentialRampToValueAtTime(0.001, now + decayTime * 0.6);

        osc.connect(pingGain);
        osc2.connect(pingGain2);
        pingGain.connect(layer.gain);
        pingGain2.connect(layer.gain);
        layer.gain.connect(this.masterGain);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + decayTime + 0.1);
        osc2.stop(now + decayTime * 0.6 + 0.1);

        layer.oscillators.push(osc, osc2);
        layer.nodes.push(pingGain, pingGain2);

        // 下一次金属声：5-15 秒后
        const nextTime = 5000 + Math.random() * 10000;
        const timerId = window.setTimeout(schedulePing, nextTime);
        layer.timers.push(timerId);
      };

      const initialDelay = window.setTimeout(schedulePing, 2000 + Math.random() * 4000);
      layer.timers.push(initialDelay);
    }
  }

  /* ============================================================
   * 工具方法
   * ============================================================ */

  /**
   * 创建一个空的音频层对象
   * @param name 层名称（用于调试）
   */
  private createLayer(name: string): AudioLayer {
    const layer: AudioLayer = {
      gain: this.ctx.createGain(),
      oscillators: [],
      noiseSources: [],
      timers: [],
      nodes: [],
    };
    this.layers.set(name, layer);
    return layer;
  }

  /**
   * 创建指定时长的白噪声缓冲区
   * 用于生成风声、纸张声等噪声类音效
   * @param duration 缓冲区时长（秒）
   * @returns AudioBuffer 噪声缓冲区
   */
  private createNoiseBuffer(duration: number): AudioBuffer {
    // 采样率 * 时长 = 采样点数
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // 填充白噪声 —— 每个采样点为 [-1, 1] 的随机值
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  /**
   * 停止并销毁当前所有音频层
   */
  private stopCurrentLayers(): void {
    this.layers.forEach((layer) => this.destroyLayer(layer));
    this.layers.clear();
  }

  /**
   * 销毁单个音频层 —— 停止所有振荡器和噪声源，清除定时器
   * @param layer 要销毁的音频层
   */
  private destroyLayer(layer: AudioLayer): void {
    // 停止所有振荡器
    layer.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // 振荡器可能已经停止，忽略错误
      }
    });

    // 停止所有噪声源
    layer.noiseSources.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // 噪声源可能已经停止，忽略错误
      }
    });

    // 清除所有定时器
    layer.timers.forEach((timerId) => clearTimeout(timerId));

    // 断开所有节点连接
    layer.nodes.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // 节点可能已经断开，忽略错误
      }
    });

    // 断开增益节点
    try {
      layer.gain.disconnect();
    } catch {
      // 忽略
    }
  }

  /**
   * 将当前强度值应用到所有活跃音频层
   * 不同层对强度的响应方式不同：
   *   - 基础层（嗡鸣、风声）：音量随强度线性变化
   *   - 事件层（纸张、钟声、金属声）：音量和触发频率同时变化
   */
  private applyIntensity(): void {
    // 主增益随强度变化 —— 使用平方曲线使低强度区域更细腻
    this.masterGain.gain.value = 0.3 + 0.7 * (this.intensity * this.intensity);
  }
}
