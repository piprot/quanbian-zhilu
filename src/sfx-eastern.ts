/**
 * 东方主题音效模块 (Eastern-Themed Sound Effects Module)
 *
 * 本模块为领导力训练网页游戏提供四种东方风格音效：
 *   1. 印章 (Stamp/Seal)   — 石印盖下的沉稳声响
 *   2. 笔墨 (Brush/Ink)    — 毛笔拂过宣纸的沙沙声
 *   3. 卷轴 (Scroll)       — 展开卷轴的纸张声
 *   4. 铜钱 (Copper Coins) — 古铜钱碰撞的清脆金属声
 *
 * 技术实现：基于 Web Audio API，使用振荡器、滤波器、噪声缓冲区与增益包络
 * 可独立于 audio-v2.ts 使用，也可并行导入
 *
 * @author SOLO Agent
 * @version 1.0.0
 */

// ============================================================
// 工具函数：生成白噪声缓冲区
// ============================================================

/**
 * 创建指定时长的白噪声 AudioBuffer
 * 白噪声在所有频率上具有均匀的能量分布，
 * 是模拟纸张、笔触、金属质感等自然声响的基础素材。
 *
 * @param ctx  - AudioContext 实例
 * @param duration - 缓冲区时长（秒）
 * @returns 填充了随机白噪声样本的 AudioBuffer
 */
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    // Math.random() * 2 - 1 生成 [-1, 1] 范围的随机值
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

// ============================================================
// 工具函数：创建带通滤波器节点
// ============================================================

/**
 * 创建 BiquadFilter 带通滤波器
 * 用于从噪声中截取特定频段，模拟不同材质的音色特征
 *
 * @param ctx        - AudioContext 实例
 * @param frequency  - 中心频率 (Hz)
 * @param Q          - 品质因数（共振峰锐度），值越高频带越窄
 * @param gainDb     - 峰值增益 (dB)，仅在 peaking 类型时有效
 * @returns 配置好的 BiquadFilterNode
 */
function createBandpass(
  ctx: AudioContext,
  frequency: number,
  Q: number = 1,
  gainDb: number = 0
): BiquadFilterNode {
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  filter.Q.value = Q;
  filter.gain.value = gainDb;
  return filter;
}

// ============================================================
// 主类：EasternSfx
// ============================================================

/**
 * 东方音效引擎类
 *
 * 封装四种东方风格音效的合成逻辑，每个音效方法均可独立调用。
 * 所有音效节点均连接到调用者提供的 masterBus，便于统一音量管理。
 *
 * @example
 * ```ts
 * const ctx = new AudioContext();
 * const master = ctx.createGain();
 * master.connect(ctx.destination);
 * const sfx = new EasternSfx(ctx, master);
 * sfx.playStamp();    // 播放印章音效
 * sfx.playBrush(0.7); // 以 70% 音量播放笔墨音效
 * ```
 */
export class EasternSfx {
  /** Web Audio 上下文实例 */
  private ctx: AudioContext;

  /** 主输出增益节点，所有音效最终汇入此节点 */
  private masterBus: GainNode;

  /** 预生成的白噪声缓冲区（复用，避免重复创建） */
  private noiseBuffer: AudioBuffer;

  /**
   * @param ctx       - AudioContext 实例（通常由宿主应用创建）
   * @param masterBus - 主增益节点，用于统一控制音量与路由
   */
  constructor(audioContext: AudioContext, masterBus: GainNode) {
    this.ctx = audioContext;
    this.masterBus = masterBus;

    // 预生成 2 秒白噪声缓冲区，供多种音效复用
    // 2 秒足以覆盖所有音效的最大时长需求
    this.noiseBuffer = createNoiseBuffer(audioContext, 2);
  }

  // ----------------------------------------------------------
  // 1. 印章 (Stamp/Seal) 音效
  // ----------------------------------------------------------

  /**
   * 播放印章音效
   *
   * 声音特征：
   *   - 低沉浑厚的"咚"声，模拟石质印章按压在宣纸上的触感
   *   - 极低频（80-200Hz）的正弦波提供"撞击"的厚重感
   *   - 极快起音（5ms）模拟印章触纸的瞬间
   *   - 短衰减（150ms）表现石头与纸张接触的干脆
   *   - 叠加一层滤波噪声模拟纸张纤维被按压的细微质感
   *
   * @param volume - 音量系数 0.0~1.0，默认 0.8
   */
  playStamp(volume: number = 0.8): void {
    const now = this.ctx.currentTime;

    // === 第一层：低频撞击音（正弦波） ===
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sine';
    // 起始频率 180Hz，快速下滑至 80Hz，模拟撞击后的共振衰减
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    // 增益包络：5ms 极速起音 → 150ms 指数衰减
    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(volume, now + 0.005); // 5ms 起音
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15); // 150ms 衰减

    osc.connect(oscGain);
    oscGain.connect(this.masterBus);

    osc.start(now);
    osc.stop(now + 0.2); // 预留 50ms 余量确保衰减完成

    // === 第二层：纸张质感噪声 ===
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    // 低通滤波器截取低频噪声，模拟纸张受压的闷响
    const noiseFilter = createBandpass(this.ctx, 300, 0.8);
    const noiseGain = this.ctx.createGain();

    // 噪声层音量低于正弦波层，作为质感补充
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterBus);

    noise.start(now);
    noise.stop(now + 0.15);
  }

  // ----------------------------------------------------------
  // 2. 笔墨 (Brush/Ink) 音效
  // ----------------------------------------------------------

  /**
   * 播放笔墨音效
   *
   * 声音特征：
   *   - 柔和的"沙——"声，模拟毛笔在宣纸上书写的摩擦声
   *   - 白噪声通过带通滤波器（800-2000Hz），模拟笔毛与纸面的接触
   *   - 滤波器中心频率缓慢扫动，模拟笔锋在纸上的运动轨迹
   *   - 总时长 300ms，音量包络呈弧形（缓起缓落）
   *
   * @param volume - 音量系数 0.0~1.0，默认 0.5
   */
  playBrush(volume: number = 0.5): void {
    const now = this.ctx.currentTime;
    const duration = 0.3; // 300ms 总时长

    // === 噪声源 ===
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    // === 带通滤波器：模拟笔毛摩擦纸面的频段特征 ===
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.5; // 较高的 Q 值使频带集中，更像笔触而非纯噪声

    // 中心频率从 800Hz 缓慢扫至 2000Hz
    // 模拟笔锋从侧锋转为中锋的行笔过程
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(2000, now + duration);

    // === 增益包络：弧形（缓起缓落） ===
    // 模拟毛笔从落纸到离纸的完整笔触
    const envGain = this.ctx.createGain();
    envGain.gain.setValueAtTime(0.001, now);
    envGain.gain.linearRampToValueAtTime(volume, now + duration * 0.3); // 30% 处达到峰值
    envGain.gain.linearRampToValueAtTime(volume * 0.8, now + duration * 0.7); // 70% 处略降
    envGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // 尾部自然消失

    // === 信号路由 ===
    noise.connect(filter);
    filter.connect(envGain);
    envGain.connect(this.masterBus);

    noise.start(now);
    noise.stop(now + duration + 0.05);
  }

  // ----------------------------------------------------------
  // 3. 卷轴 (Scroll) 音效
  // ----------------------------------------------------------

  /**
   * 播放卷轴展开音效
   *
   * 声音特征：
   *   - 连续的噪声脉冲，模拟纸张从卷轴上展开的过程
   *   - 滤波器的共振峰逐渐上移，模拟纸张展开时张力变化
   *   - 叠加细微的"皱褶"质感（高频噪声间歇脉冲）
   *   - 总时长 500ms
   *
   * @param volume - 音量系数 0.0~1.0，默认 0.4
   */
  playScroll(volume: number = 0.4): void {
    const now = this.ctx.currentTime;
    const duration = 0.5; // 500ms 总时长

    // === 主噪声层：纸张展开的连续声 ===
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    // 带通滤波器，共振峰上移模拟展开过程
    const mainFilter = this.ctx.createBiquadFilter();
    mainFilter.type = 'bandpass';
    mainFilter.Q.value = 3; // 高 Q 值产生共振峰，模拟纸张的共鸣特性

    // 共振峰从 400Hz 上移至 1800Hz
    // 模拟卷轴从紧到松、纸张逐渐展开的张力变化
    mainFilter.frequency.setValueAtTime(400, now);
    mainFilter.frequency.exponentialRampToValueAtTime(1800, now + duration);

    // 主噪声增益包络
    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0.001, now);
    mainGain.gain.linearRampToValueAtTime(volume, now + 0.05); // 快速起音
    mainGain.gain.setValueAtTime(volume, now + duration * 0.6); // 持续展开
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // 尾部消散

    // 信号路由
    noise.connect(mainFilter);
    mainFilter.connect(mainGain);
    mainGain.connect(this.masterBus);

    noise.start(now);
    noise.stop(now + duration + 0.05);

    // === 第二层：皱褶质感（高频间歇脉冲） ===
    // 模拟纸张展开时细微的折痕弹开声
    const crinkleNoise = this.ctx.createBufferSource();
    crinkleNoise.buffer = this.noiseBuffer;

    // 高通滤波器，仅保留高频成分模拟皱褶
    const crinkleFilter = this.ctx.createBiquadFilter();
    crinkleFilter.type = 'highpass';
    crinkleFilter.frequency.value = 3000; // 3kHz 以上，模拟纸张皱褶的清脆感

    const crinkleGain = this.ctx.createGain();
    crinkleGain.gain.value = volume * 0.15; // 皱褶层音量很低，仅作质感点缀

    // 使用 LFO（低频振荡器）调制增益，产生间歇性的脉冲效果
    // 模拟纸张展开时不均匀的"咔咔"声
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'square'; // 方波产生明显的开/关效果
    lfo.frequency.value = 12; // 12Hz 的脉冲频率，模拟快速连续的皱褶声
    lfoGain.gain.value = volume * 0.12;

    lfo.connect(lfoGain);
    lfoGain.connect(crinkleGain.gain); // LFO 调制皱褶层增益

    crinkleNoise.connect(crinkleFilter);
    crinkleFilter.connect(crinkleGain);
    crinkleGain.connect(this.masterBus);

    crinkleNoise.start(now);
    crinkleNoise.stop(now + duration + 0.05);
    lfo.start(now);
    lfo.stop(now + duration + 0.05);
  }

  // ----------------------------------------------------------
  // 4. 铜钱 (Copper Coins) 音效
  // ----------------------------------------------------------

  /**
   * 播放铜钱音效
   *
   * 声音特征：
   *   - 多个高频正弦振荡器叠加，模拟古铜钱碰撞的金属颤音
   *   - 频率范围 2000-4000Hz，覆盖铜钱的主要共振频段
   *   - 各振荡器略微失谐（detune），产生丰富的拍频效果
   *   - 快速起音 + 中等衰减，模拟金属碰撞后自然衰减的余韵
   *   - 叠加泛音成分增加金属质感
   *
   * @param volume - 音量系数 0.0~1.0，默认 0.6
   */
  playCoins(volume: number = 0.6): void {
    const now = this.ctx.currentTime;
    const attackTime = 0.005; // 5ms 快速起音，模拟金属碰撞的瞬态
    const decayTime = 0.4;    // 400ms 衰减，模拟金属余韵

    /**
     * 铜钱共振频率配置
     * 每个频率对代表一次"碰撞"的基频与泛音
     * detune 值（音分）用于产生微妙的拍频，使声音更自然
     */
    const coinTones = [
      { freq: 2200, detune: -5, gain: 1.0 },    // 主音 — 低沉的铜质共鸣
      { freq: 2800, detune: 8, gain: 0.7 },     // 泛音1 — 略高，带明亮感
      { freq: 3500, detune: -12, gain: 0.5 },   // 泛音2 — 高频金属质感
      { freq: 4000, detune: 15, gain: 0.3 },    // 泛音3 — 极高频的"叮"声
      { freq: 2500, detune: -3, gain: 0.6 },    // 补充音 — 增加厚度
    ];

    // 为每个频率分量创建独立的振荡器 + 增益节点
    coinTones.forEach((tone) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine'; // 正弦波 — 最纯净的金属共振音色
      osc.frequency.value = tone.freq;
      osc.detune.value = tone.detune; // 微失谐产生拍频效果

      // 增益包络：快速起音 → 指数衰减
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(
        volume * tone.gain,
        now + attackTime
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + attackTime + decayTime
      );

      osc.connect(gain);
      gain.connect(this.masterBus);

      osc.start(now);
      osc.stop(now + attackTime + decayTime + 0.05);
    });

    // === 噪声层：碰撞瞬间的金属摩擦质感 ===
    const impactNoise = this.ctx.createBufferSource();
    impactNoise.buffer = this.noiseBuffer;

    // 高通滤波器，仅保留极高频成分模拟金属碰撞的"嚓"声
    const impactFilter = this.ctx.createBiquadFilter();
    impactFilter.type = 'highpass';
    impactFilter.frequency.value = 5000; // 5kHz 以上

    const impactGain = this.ctx.createGain();
    // 噪声层极短促（30ms），仅模拟碰撞瞬间
    impactGain.gain.setValueAtTime(volume * 0.2, now);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    impactNoise.connect(impactFilter);
    impactFilter.connect(impactGain);
    impactGain.connect(this.masterBus);

    impactNoise.start(now);
    impactNoise.stop(now + 0.05);
  }

  // ----------------------------------------------------------
  // 随机过渡音效
  // ----------------------------------------------------------

  /**
   * 随机播放四种音效之一
   *
   * 用途：页面切换、场景过渡、随机事件触发等场景
   * 每种音效被选中的概率相等（25%）
   *
   * @returns 本次播放的音效名称（中文），便于日志记录
   */
  playRandomTransition(): string {
    // 四种音效的名称与对应播放方法
    const effects: Array<{ name: string; play: () => void }> = [
      { name: '印章', play: () => this.playStamp() },
      { name: '笔墨', play: () => this.playBrush() },
      { name: '卷轴', play: () => this.playScroll() },
      { name: '铜钱', play: () => this.playCoins() },
    ];

    // 随机选取一种音效
    const selected = effects[Math.floor(Math.random() * effects.length)];
    selected.play();

    return selected.name;
  }
}

// ============================================================
// 默认导出（可选）
// ============================================================

export default EasternSfx;
