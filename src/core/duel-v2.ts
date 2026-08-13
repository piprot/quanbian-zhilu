/**
 * 升维 V2 · 1v1 博弈引擎
 * 
 * 核心改造：
 * 1. 暗牌阶段：双方同时选择，但不立即揭示
 * 2. 资源下注：可用精力/影响力下注，赢了翻倍，输了没收
 * 3. 信息战：花费影响力购买对手风格倾向情报
 * 4. 揭示阶段：同时翻开暗牌，结算分数与下注
 * 5. 心理战层：AI 模拟思考时间、虚张声势
 * 
 * 兼容现有 DuelEngine 接口，可渐进替换
 */

import type {
  AbilityId,
  DuelProfile,
  DuelResult,
  AiArchetype,
  StoryNode,
  OptionQuality,
} from "./types.ts";

// ============================================================
// 阶段定义
// ============================================================

export type DuelPhase =
  | "intel"       // 信息战阶段：花费资源获取情报
  | "bet"         // 下注阶段：押注资源
  | "pick"        // 暗牌阶段：同时选择选项
  | "reveal"      // 揭示阶段：翻开暗牌
  | "settle"      // 结算阶段：计算分数
  | "finished";   // 对局结束

export interface IntelPurchase {
  buyer: 0 | 1;
  cost: number;           // 花费的影响力
  intelType: "style_bias" | "resource_level" | "last_pick";
  result: string;         // 情报文本
  accuracy: number;       // 0-1，1=完全准确
}

export interface ResourceBet {
  bettor: 0 | 1;
  resource: "energy" | "trust" | "influence" | "capital";
  amount: number;
  condition: "win" | "expert" | "risk";  // 赢/选专家/选风险
}

export interface RoundState {
  phase: DuelPhase;
  picks: [number | null, number | null];       // 暗牌选择
  styleBets: [("expert" | "partial" | "risk") | null, ("expert" | "partial" | "risk") | null];
  resourceBets: ResourceBet[];
  intelPurchases: IntelPurchase[];
  revealed: boolean;
  points: [number, number];
  bonusFromBets: [number, number];
  bonusFromStyle: [number, number];
  bonusFromIntel: [number, number];
}

export interface DuelV2Snapshot {
  players: DuelProfile[];
  nodes: StoryNode[];
  roundCount: number;
  currentRound: number;
  scores: [number, number];
  rounds: RoundState[];
  totalBetsWon: [number, number];
  totalIntelBought: [number, number];
}

// ============================================================
// 配置常量
// ============================================================

const INTEL_COST = 8;           // 每次情报购买花费影响力
const INTEL_ACCURACY = 0.7;     // 情报准确率
const MAX_BET_RATIO = 0.3;      // 最多下注当前资源的 30%
const STYLE_BET_BONUS = 0.2;    // 风格押中加成 20%
const RESOURCE_BET_MULTIPLIER = 2; // 赢了翻倍

const AI_THINK_DELAYS: Record<AiArchetype, [number, number]> = {
  executor: [800, 1500],   // 铁血执行者：快速决策
  builder: [1500, 3000],   // 关系构建者：深思熟虑
  gambler: [500, 2500],    // 赌徒：忽快忽慢
};

// ============================================================
// 引擎核心
// ============================================================

export class DuelEngineV2 {
  players: [DuelProfile, DuelProfile];
  nodes: StoryNode[];
  readonly roundCount: number;
  currentRound = 0;
  scores: [number, number] = [0, 0];
  rounds: RoundState[] = [];
  totalBetsWon: [number, number] = [0, 0];
  totalIntelBought: [number, number] = [0, 0];

  constructor(
    playerOne: DuelProfile,
    playerTwo: DuelProfile,
    roundCount: number,
    seed: number
  ) {
    this.players = [playerOne, playerTwo];
    this.roundCount = Math.min(7, Math.max(1, roundCount));
    this.nodes = this.generateNodes(seed);
    this.startNewRound();
  }

  get node(): StoryNode {
    return this.nodes[this.currentRound];
  }

  get currentRoundState(): RoundState {
    return this.rounds[this.currentRound];
  }

  // --------------------------------------------------------
  // 阶段流转
  // --------------------------------------------------------

  startNewRound(): void {
    this.rounds.push({
      phase: "intel",
      picks: [null, null],
      styleBets: [null, null],
      resourceBets: [],
      intelPurchases: [],
      revealed: false,
      points: [0, 0],
      bonusFromBets: [0, 0],
      bonusFromStyle: [0, 0],
      bonusFromIntel: [0, 0],
    });
  }

  /**
   * 信息战：玩家花费影响力获取对手情报
   * 返回情报文本与准确度
   */
  buyIntel(playerIndex: 0 | 1, intelType: IntelPurchase["intelType"]): IntelPurchase {
    const state = this.currentRoundState;
    const player = this.players[playerIndex];
    const cost = INTEL_COST;

    if (player.resources.influence < cost) {
      throw new Error("影响力不足，无法购买情报");
    }

    player.resources.influence -= cost;
    this.totalIntelBought[playerIndex]++;

    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const opponent = this.players[opponentIndex];
    let result = "";
    let accuracy = INTEL_ACCURACY;

    switch (intelType) {
      case "style_bias": {
        // 返回对手的风格倾向（可能不准确）
        const archetype = opponent.archetype ?? "builder";
        const biasMap: Record<AiArchetype, string> = {
          executor: "倾向高压执行与权威选项",
          builder: "倾向协商与关系构建选项",
          gambler: "倾向冒险与高风险选项",
        };
        // 30% 概率返回错误信息
        if (Math.random() > accuracy) {
          const wrongOptions = (["executor", "builder", "gambler"] as AiArchetype[])
            .filter(a => a !== archetype);
          result = biasMap[wrongOptions[Math.floor(Math.random() * wrongOptions.length)]];
        } else {
          result = biasMap[archetype];
        }
        break;
      }
      case "resource_level": {
        const res = opponent.resources;
        result = `精力 ${Math.round(res.energy * (0.8 + Math.random() * 0.4))}·信任 ${Math.round(res.trust * (0.8 + Math.random() * 0.4))}`;
        break;
      }
      case "last_pick": {
        if (this.rounds.length > 1) {
          const prevRound = this.rounds[this.rounds.length - 2];
          const prevPick = prevRound.picks[opponentIndex];
          if (prevPick !== null) {
            const quality = this.nodes[this.currentRound - 1]?.options[prevPick]?.quality;
            result = quality ? `上轮选择了${quality === "expert" ? "专家" : quality === "partial" ? "稳健" : "风险"}选项` : "无记录";
          } else {
            result = "上轮超时未选";
          }
        } else {
          result = "首局无历史记录";
        }
        break;
      }
    }

    const purchase: IntelPurchase = {
      buyer: playerIndex,
      cost,
      intelType,
      result,
      accuracy,
    };
    state.intelPurchases.push(purchase);
    return purchase;
  }

  /**
   * 资源下注：玩家押注资源，赢了翻倍，输了没收
   */
  placeBet(playerIndex: 0 | 1, resource: "energy" | "trust" | "influence" | "capital", amount: number, condition: "win" | "expert" | "risk"): void {
    const state = this.currentRoundState;
    const player = this.players[playerIndex];
    const maxBet = Math.floor(player.resources[resource] * MAX_BET_RATIO);

    if (amount > maxBet) {
      throw new Error(`下注超出上限（${maxBet}）`);
    }
    if (amount <= 0) {
      throw new Error("下注必须大于 0");
    }

    player.resources[resource] -= amount;

    state.resourceBets.push({
      bettor: playerIndex,
      resource,
      amount,
      condition,
    });
  }

  /**
   * 暗牌选择：双方同时选择，不立即揭示
   */
  pickHidden(playerIndex: 0 | 1, optionIndex: number): void {
    const state = this.currentRoundState;
    if (state.picks[playerIndex] !== null) {
      throw new Error("已选择");
    }
    state.picks[playerIndex] = optionIndex;
  }

  /**
   * 风格押注：押对手本轮会选什么风格（保留 V1 机制）
   */
  betOpponentStyle(playerIndex: 0 | 1, quality: "expert" | "partial" | "risk"): void {
    const state = this.currentRoundState;
    state.styleBets[playerIndex] = quality;
  }

  /**
   * 揭示阶段：翻开双方暗牌
   */
  reveal(): void {
    const state = this.currentRoundState;
    if (state.picks[0] === null || state.picks[1] === null) {
      throw new Error("双方尚未完成选择");
    }
    state.revealed = true;
    state.phase = "settle";
    this.settle();
  }

  // --------------------------------------------------------
  // 结算逻辑
  // --------------------------------------------------------

  private settle(): void {
    const state = this.currentRoundState;
    const [pickOne, pickTwo] = state.picks as [number, number];

    // 基础得分
    const points: [number, number] = [
      this.scorePick(0, pickOne),
      this.scorePick(1, pickTwo),
    ];

    // 风格押注加成
    for (const playerIndex of [0, 1] as const) {
      const styleBet = state.styleBets[playerIndex];
      if (styleBet !== null) {
        const opponentIndex = playerIndex === 0 ? 1 : 0;
        const opponentPick = state.picks[opponentIndex]!;
        const opponentQuality = this.node.options[opponentPick].quality;
        if (opponentQuality === styleBet) {
          const bonus = Math.max(2, Math.round(points[playerIndex] * STYLE_BET_BONUS));
          state.bonusFromStyle[playerIndex] = bonus;
          points[playerIndex] += bonus;
        }
      }
    }

    // 资源下注结算
    for (const bet of state.resourceBets) {
      const bettorPick = state.picks[bet.bettor]!;
      const bettorQuality = this.node.options[bettorPick].quality;
      const opponentIndex = bet.bettor === 0 ? 1 : 0;
      const wonRound = points[bet.bettor] > points[opponentIndex];
      const conditionMet =
        bet.condition === "win" ? wonRound :
        bet.condition === "expert" ? bettorQuality === "expert" :
        bettorQuality === "risk";

      if (conditionMet) {
        // 赢了：返还本金 + 等额奖励
        const reward = bet.amount * RESOURCE_BET_MULTIPLIER;
        this.players[bet.bettor].resources[bet.resource] += reward;
        state.bonusFromBets[bet.bettor] += bet.amount; // 记录净收益
        this.totalBetsWon[bet.bettor]++;
      }
      // 输了：资源已被扣除，不返还
    }

    // 情报加成：如果买了情报且正确利用，额外 +5
    for (const intel of state.intelPurchases) {
      const buyerPick = state.picks[intel.buyer]!;
      const buyerQuality = this.node.options[buyerPick].quality;
      const opponentIndex = intel.buyer === 0 ? 1 : 0;
      const opponentQuality = this.node.options[state.picks[opponentIndex]!].quality;
      // 如果买了风格情报且选择了克制对手风格的选项
      if (intel.intelType === "style_bias" && buyerQuality === "expert" && opponentQuality !== "expert") {
        state.bonusFromIntel[intel.buyer] += 5;
        points[intel.buyer] += 5;
      }
    }

    state.points = points;
    this.scores[0] += points[0];
    this.scores[1] += points[1];
    state.phase = "settle";

    // 推进到下一回合或结束
    this.currentRound += 1;
    if (this.currentRound < this.roundCount) {
      this.startNewRound();
    } else {
      state.phase = "finished";
    }
  }

  // --------------------------------------------------------
  // AI 行为
  // --------------------------------------------------------

  /**
   * AI 决策：包含信息战、下注、暗牌选择
   * 返回 AI 的思考延迟（毫秒），用于前端模拟思考动画
   */
  aiAct(playerIndex: 0 | 1): { delay: number; actions: AiAction[] } {
    const player = this.players[playerIndex];
    const archetype = player.archetype ?? "builder";
    const state = this.currentRoundState;
    const actions: AiAction[] = [];

    // 1. 信息战决策
    if (state.phase === "intel" && player.resources.influence >= INTEL_COST) {
      const intelChance = archetype === "gambler" ? 0.2 : archetype === "executor" ? 0.3 : 0.5;
      if (Math.random() < intelChance) {
        const intel = this.buyIntel(playerIndex, "style_bias");
        actions.push({ type: "intel", intel });
      }
    }

    // 2. 资源下注决策
    if (state.phase === "intel" || state.phase === "bet") {
      const betChance = archetype === "gambler" ? 0.6 : archetype === "executor" ? 0.25 : 0.15;
      if (Math.random() < betChance) {
        const resource = this.pickBetResource(player);
        const maxBet = Math.floor(player.resources[resource] * MAX_BET_RATIO);
        if (maxBet > 5) {
          const amount = Math.max(5, Math.floor(maxBet * (0.3 + Math.random() * 0.5)));
          const condition = archetype === "gambler" ? "risk" : "win";
          this.placeBet(playerIndex, resource, amount, condition);
          actions.push({ type: "bet", resource, amount, condition });
        }
      }
    }

    // 3. 暗牌选择
    state.phase = "pick";
    const pick = this.aiPick(playerIndex);
    actions.push({ type: "pick", optionIndex: pick });

    // 4. 风格押注
    const styleBetChance = archetype === "gambler" ? 0.7 : 0.4;
    if (Math.random() < styleBetChance) {
      const opponentArchetype = this.players[playerIndex === 0 ? 1 : 0].archetype ?? "builder";
      const styleMap: Record<AiArchetype, "expert" | "partial" | "risk"> = {
        executor: "expert",
        builder: "partial",
        gambler: "risk",
      };
      // 70% 准确率
      const predicted = Math.random() < 0.7
        ? styleMap[opponentArchetype]
        : (["expert", "partial", "risk"] as const)[Math.floor(Math.random() * 3)];
      this.betOpponentStyle(playerIndex, predicted);
      actions.push({ type: "style_bet", quality: predicted });
    }

    const [min, max] = AI_THINK_DELAYS[archetype];
    const delay = min + Math.random() * (max - min);

    return { delay, actions };
  }

  private aiPick(playerIndex: 0 | 1): number {
    const player = this.players[playerIndex];
    const node = this.node;
    const strength = player.strength ?? 2;
    const archetype = player.archetype ?? "builder";

    // 赌徒偶尔虚张声势：选风险选项
    if (archetype === "gambler" && Math.random() < 0.25) {
      const riskIndex = node.options.findIndex(o => o.quality === "risk");
      if (riskIndex >= 0) {
        this.pickHidden(playerIndex, riskIndex);
        return riskIndex;
      }
    }

    const expertChance = strength <= 1 ? 0.45 : strength <= 3 ? 0.65 : 0.85;
    const preferExpert = Math.random() < expertChance;

    const scored = node.options.map((option, index) => {
      const quality = option.quality === "expert" ? 1 : option.quality === "partial" ? 0.55 : 0.2;
      const focus = Object.keys(option.effects).reduce(
        (best, id) => Math.max(best, this.getAbilityLevel(player, id as AbilityId)),
        1
      );

      const archetypeBias =
        archetype === "executor" && ["authority", "execution", "stability"].some(id => id in option.effects) ? 0.3 :
        archetype === "builder" && ["communication", "insight", "recovery"].some(id => id in option.effects) ? 0.3 :
        archetype === "gambler" && option.quality === "risk" ? 0.2 : 0;

      return {
        index,
        score: quality * (2 + focus) + this.resourceBonus(player) / 40 + Math.random() * 0.35 + archetypeBias,
      };
    });

    const best = scored.reduce((a, b) => (b.score > a.score ? b : a));
    this.pickHidden(playerIndex, best.index);
    return best.index;
  }

  private pickBetResource(player: DuelProfile): "energy" | "trust" | "influence" | "capital" {
    const resources = player.resources;
    const entries = Object.entries(resources) as [string, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0] as "energy" | "trust" | "influence" | "capital";
  }

  // --------------------------------------------------------
  // 评分与工具
  // --------------------------------------------------------

  private scorePick(playerIndex: 0 | 1, optionIndex: number): number {
    const option = this.node.options[optionIndex];
    const profile = this.players[playerIndex];
    const relevantLevel = Object.keys(option.effects).reduce(
      (best, id) => Math.max(best, this.getAbilityLevel(profile, id as AbilityId)),
      1
    );
    const base = option.quality === "expert" ? 100 : option.quality === "partial" ? 55 : 20;

    let combo = 0;
    for (let i = this.rounds.length - 2; i >= 0; i--) {
      const prev = this.rounds[i];
      if (prev.picks[playerIndex] !== null) {
        const prevOption = this.nodes[this.currentRound - (this.rounds.length - 1 - i)]?.options[prev.picks[playerIndex]!];
        if (prevOption?.quality === "expert") combo++;
        else break;
      }
    }

    return Math.round(base + relevantLevel * 4 + this.resourceBonus(profile) + Math.min(15, combo * 5));
  }

  private resourceBonus(profile: DuelProfile): number {
    return (
      profile.resources.energy / 15 +
      profile.resources.trust / 25 +
      profile.resources.influence / 30 +
      profile.resources.capital / 35
    );
  }

  private getAbilityLevel(profile: DuelProfile, abilityId: AbilityId): number {
    const value = profile.abilities[abilityId] ?? 0;
    return Math.floor(value / 20) + 1;
  }

  private generateNodes(seed: number): StoryNode[] {
    // 委托给现有 duelNodes 函数
    // import { duelNodes } from "./story.ts";
    // return duelNodes(this.roundCount, seed);
    // 这里用占位实现，实际使用时替换
    return [];
  }

  // --------------------------------------------------------
  // 序列化
  // --------------------------------------------------------

  toSnapshot(): DuelV2Snapshot {
    return {
      players: [...this.players] as [DuelProfile, DuelProfile],
      nodes: [...this.nodes],
      roundCount: this.roundCount,
      currentRound: this.currentRound,
      scores: [...this.scores] as [number, number],
      rounds: this.rounds.map(r => ({ ...r })),
      totalBetsWon: [...this.totalBetsWon] as [number, number],
      totalIntelBought: [...this.totalIntelBought] as [number, number],
    };
  }

  get finished(): boolean {
    return this.currentRound >= this.roundCount;
  }

  get winnerIndex(): 0 | 1 | -1 {
    if (this.scores[0] === this.scores[1]) return -1;
    return this.scores[0] > this.scores[1] ? 0 : 1;
  }

  toResult(): DuelResult {
    return {
      winnerName: this.winnerIndex === -1 ? "平局" : this.players[this.winnerIndex].name,
      scores: [...this.scores] as [number, number],
      roundResults: this.rounds.map((r, i) => ({
        node: this.nodes[i],
        picks: r.picks as [number, number],
        points: r.points,
      })),
    };
  }
}

export interface AiAction {
  type: "intel" | "bet" | "pick" | "style_bet";
  intel?: IntelPurchase;
  resource?: "energy" | "trust" | "influence" | "capital";
  amount?: number;
  condition?: "win" | "expert" | "risk";
  optionIndex?: number;
  quality?: "expert" | "partial" | "risk";
}

// ============================================================
// 前端阶段流转辅助
// ============================================================

export const PHASE_LABELS: Record<DuelPhase, { zh: string; en: string; hint: string }> = {
  intel: { zh: "情报战", en: "Intel Phase", hint: "花费影响力获取对手情报，或跳过直接进入下注" },
  bet: { zh: "资源下注", en: "Bet Phase", hint: "押注资源，赢了翻倍，输了没收。也可跳过" },
  pick: { zh: "暗牌选择", en: "Hidden Pick", hint: "同时选择选项，对方看不到你的选择" },
  reveal: { zh: "揭示阶段", en: "Reveal", hint: "翻开双方暗牌，结算分数与下注" },
  settle: { zh: "结算阶段", en: "Settle", hint: "查看本回合得分与资源变化" },
  finished: { zh: "对局结束", en: "Finished", hint: "查看最终结果与复盘" },
};

/**
 * UI 流程状态机：
 * intel → (optional) bet → pick → (both picked) reveal → settle → next round
 */
export function nextPhase(current: DuelPhase, state: RoundState): DuelPhase {
  switch (current) {
    case "intel":
      return "bet";
    case "bet":
      return "pick";
    case "pick":
      // 只有双方都选完才进入揭示
      return state.picks[0] !== null && state.picks[1] !== null ? "reveal" : "pick";
    case "reveal":
      return "settle";
    case "settle":
      return "finished";
    default:
      return current;
  }
}
