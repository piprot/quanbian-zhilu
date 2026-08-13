export class GameAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private ambientGain?: GainNode;
  private musicTimer?: number;
  private musicNodes: AudioNode[] = [];
  private musicGain?: GainNode;
  private musicFilter?: BiquadFilterNode;
  private ambientScene: "menu" | "story" | "duel" = "menu";
  private sfxVolume = 0.9;
  private muted = false;
  private musicMuted = false;
  private userGesture = false;

  /** 首次用户手势后允许恢复音频上下文，避免加载阶段无意义的 resume 警告。 */
  unlock(): void {
    this.userGesture = true;
    if (this.context && this.context.state === "suspended") {
      void this.context.resume();
    }
  }

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
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : this.sfxVolume;
      this.master.connect(this.context.destination);
    }
    if (this.userGesture && this.context.state === "suspended") {
      void this.context.resume();
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master) {
      this.master.gain.value = muted ? 0 : this.sfxVolume;
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume / 100));
    if (this.master) {
      this.master.gain.value = this.muted ? 0 : this.sfxVolume;
    }
  }

  setMusicMuted(muted: boolean): void {
    this.musicMuted = muted;
    if (this.musicGain) {
      this.musicGain.gain.value = muted ? 0 : 0.6;
    }
  }

  setMusicVolume(volume: number): void {
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicMuted
        ? 0
        : Math.max(0, Math.min(1, volume / 100));
    }
  }

  ui(): void {
    this.tone(420, 0.06, "sine", 0.018);
  }

  choose(): void {
    this.tone(520, 0.08, "triangle", 0.028);
    this.tone(780, 0.1, "sine", 0.02, 0.06);
  }

  expert(): void {
    this.tone(523.25, 0.12, "triangle", 0.045);
    this.tone(659.25, 0.14, "triangle", 0.04, 0.08);
    this.tone(783.99, 0.2, "sine", 0.035, 0.16);
  }

  partial(): void {
    this.tone(392, 0.12, "triangle", 0.04);
    this.tone(466.16, 0.16, "sine", 0.03, 0.09);
  }

  risk(): void {
    this.tone(220, 0.18, "sawtooth", 0.028);
    this.tone(164.81, 0.24, "sine", 0.035, 0.08);
  }

  duelPick(): void {
    this.tone(660, 0.07, "square", 0.018);
  }

  round(): void {
    this.tone(330, 0.09, "triangle", 0.03);
    this.tone(495, 0.12, "sine", 0.025, 0.07);
  }

  win(): void {
    this.tone(523.25, 0.12, "triangle", 0.05);
    this.tone(659.25, 0.14, "triangle", 0.045, 0.1);
    this.tone(783.99, 0.18, "triangle", 0.04, 0.2);
    this.tone(1046.5, 0.26, "sine", 0.03, 0.3);
  }

  lose(): void {
    this.tone(392, 0.16, "sine", 0.045);
    this.tone(311.13, 0.2, "sine", 0.04, 0.12);
    this.tone(233.08, 0.28, "sine", 0.035, 0.24);
  }

  remoteConnected(): void {
    this.tone(520, 0.1, "triangle", 0.035);
    this.tone(780, 0.14, "sine", 0.03, 0.08);
  }

  trainingStart(): void {
    this.tone(261.63, 0.12, "triangle", 0.04);
    this.tone(329.63, 0.14, "triangle", 0.035, 0.08);
    this.tone(392, 0.2, "sine", 0.03, 0.16);
    this.tone(523.25, 0.28, "sine", 0.022, 0.26);
  }

  trainingCorrect(): void {
    this.tone(440, 0.1, "triangle", 0.03);
    this.tone(554.37, 0.16, "sine", 0.024, 0.08);
  }

  trainingMastery(): void {
    this.tone(392, 0.16, "triangle", 0.04);
    this.tone(523.25, 0.18, "triangle", 0.035, 0.1);
    this.tone(659.25, 0.24, "sine", 0.03, 0.2);
    this.tone(783.99, 0.34, "sine", 0.022, 0.32);
  }

  startAmbient(scene: "menu" | "story" | "duel" = "menu"): void {
    // 浏览器禁止在用户手势前创建/恢复 AudioContext，加载阶段先不启动环境音。
    if (!this.userGesture) {
      return;
    }
    this.ensure();
    if (!this.context || !this.master || this.ambientGain) {
      return;
    }
    this.ambientScene = scene;
    const gain = this.context.createGain();
    gain.gain.value = this.muted ? 0 : 0.012;
    if (!this.musicGain) {
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = 0.6;
      this.musicFilter = this.context.createBiquadFilter();
      this.musicFilter.type = "lowpass";
      this.musicFilter.frequency.value = 1100;
      this.musicFilter.Q.value = 0.4;
      this.musicGain.connect(this.musicFilter);
      this.musicFilter.connect(this.context.destination);
    }
    const oscillator = this.context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 55;
    const second = this.context.createOscillator();
    second.type = "triangle";
    second.frequency.value = 82.41;
    const third = this.context.createOscillator();
    third.type = "sine";
    third.frequency.value = 110;
    const filter = this.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 320;
    oscillator.connect(filter);
    second.connect(filter);
    third.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    oscillator.start();
    second.start();
    third.start();
    this.ambientGain = gain;
    this.musicNodes = [oscillator, second, third, filter, gain];

    const chords: Record<"menu" | "story" | "duel", number[][]> = {
      menu: [
        [110, 130.81, 164.81, 220],
        [87.31, 110, 130.81, 174.61],
        [98, 123.47, 146.83, 196],
        [73.42, 110, 146.83, 196],
        [98, 130.81, 164.81, 220],
        [87.31, 116.54, 146.83, 196]
      ],
      story: [
        [98, 116.54, 146.83, 196],
        [110, 130.81, 164.81, 220],
        [87.31, 110, 130.81, 174.61],
        [82.41, 98, 123.47, 164.81],
        [92.5, 110, 138.59, 185],
        [98, 123.47, 146.83, 196]
      ],
      duel: [
        [82.41, 98, 123.47, 164.81],
        [65.41, 82.41, 98, 130.81],
        [73.42, 92.5, 110, 146.83],
        [77.78, 98, 123.47, 155.56],
        [65.41, 87.31, 110, 146.83],
        [69.3, 82.41, 103.83, 138.59]
      ]
    };
    const melodySeeds: Record<"menu" | "story" | "duel", number[]> = {
      menu: [
        329.63, 293.66, 261.63, 349.23, 392, 440
      ],
      story: [
        392, 349.23, 329.63, 293.66, 440, 493.88
      ],
      duel: [
        440, 392, 349.23, 493.88, 523.25, 587.33
      ]
    };
    const phraseGap: Record<"menu" | "story" | "duel", number> = {
      menu: 4200,
      story: 3800,
      duel: 3100
    };
    let musicIndex = 0;
    const playPhrase = () => {
      if (!this.context || !this.master || this.muted) return;
      const moodUp = Math.floor(musicIndex / 4) % 2 === 1;
      const transpose = moodUp ? Math.pow(2, 2 / 12) : 1;
      const gapMs = phraseGap[this.ambientScene];
      const row = chords[this.ambientScene][musicIndex % chords[this.ambientScene].length];
      // 低音根音：让每句有更明确的调性方向
      this.musicTone((row[0] / 2) * transpose, 2.8, "sine", 0.02, 0, 420);
      row.forEach((freq, index) => {
        this.musicTone(
          freq * transpose,
          2.6,
          index % 2 === 0 ? "sine" : "triangle",
          0.006,
          index * 0.08,
          900
        );
      });
      // 琶音层：让织体流动起来
      const arp = [...row.slice(1), row[1] * 2];
      arp.forEach((freq, index) => {
        this.musicTone(
          freq * transpose,
          0.9,
          "triangle",
          0.004,
          0.6 + index * 0.22,
          1600
        );
      });
      // 旋律层：从场景音阶种子中取音，带轻微随机，避免 4 句死循环
      const seed = melodySeeds[this.ambientScene];
      for (let i = 0; i < 3; i += 1) {
        const note =
          seed[(musicIndex * 3 + i * 2 + Math.floor(Math.random() * 2)) % seed.length];
        const octave = Math.random() < 0.2 ? 0.5 : 1;
        this.musicTone(
          note * octave * transpose,
          1.2,
          i % 2 === 0 ? "sine" : "triangle",
          0.006,
          0.4 + i * 0.5,
          1400
        );
      }
      // 每两小节一个低音脉冲，保留沉稳的“心跳”但不再喧宾夺主
      if (musicIndex % 2 === 0) {
        this.musicTone((row[0] / 2) * transpose, 0.5, "sine", 0.012, 0, 260);
      }
      // 每 8 句一次高音 shimmer，让长听不疲劳
      if (musicIndex % 8 === 0) {
        this.musicTone(seed[0] * 2 * transpose, 1.6, "sine", 0.003, 0.5, 2400);
      }
      // 情绪段落之间的滤波器扫频：明亮/沉暗交替
      if (this.musicFilter && this.context) {
        const now = this.context.currentTime;
        this.musicFilter.frequency.cancelScheduledValues(now);
        this.musicFilter.frequency.setValueAtTime(
          this.musicFilter.frequency.value,
          now
        );
        this.musicFilter.frequency.linearRampToValueAtTime(
          moodUp ? 2400 : 900,
          now + gapMs / 1000
        );
      }
      musicIndex += 1;
    };
    playPhrase();
    this.musicTimer = window.setInterval(playPhrase, phraseGap[this.ambientScene]);
  }

  setAmbientScene(scene: "menu" | "story" | "duel"): void {
    if (this.ambientScene === scene && this.ambientGain) {
      return;
    }
    this.stopAmbient();
    this.startAmbient(scene);
  }

  stopAmbient(): void {
    if (this.musicTimer !== undefined) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = undefined;
    }
    if (this.context && this.ambientGain) {
      const fading = this.ambientGain;
      this.ambientGain = undefined;
      fading.gain.setTargetAtTime(0, this.context.currentTime, 0.2);
      window.setTimeout(() => {
        fading.disconnect();
      }, 500);
    }
  }

  private musicTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0,
    cutoff = 1200
  ): void {
    if (!this.context || !this.musicGain || this.muted) {
      return;
    }
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0
  ): void {
    if (!this.context || !this.master || this.muted) {
      return;
    }
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }
}
