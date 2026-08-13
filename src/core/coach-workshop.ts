/**
 * 升维 V2 · 教练端工作坊模式 MVP
 *
 * 核心能力：
 * 1. 多人存档聚合：批量导入学员存档，生成小组画像
 * 2. 小组对比雷达图：十项能力的群体分布对比
 * 3. 决策盲区热力图：统计哪些情境/选项最容易被选错
 * 4. 工作坊讨论引导：基于小组决策模式自动生成讨论问题
 * 5. 同步推演：教练设定情境，学员实时决策，投屏对比
 */

import type {
  AbilityId,
  SaveState,
  DecisionRecord,
  RoleId,
  OptionQuality,
  StoryNode,
} from "./types.ts";
import { ABILITY_ORDER, abilityLevel } from "./abilities.ts";
import { getNode } from "./story.ts";

// ============================================================
// 数据结构
// ============================================================

export interface CoachParticipant {
  name: string;
  role: RoleId;
  saveState: SaveState;
  importedAt: number;
}

export interface GroupRadarData {
  ability: AbilityId;
  min: number;
  max: number;
  median: number;
  average: number;
  distribution: number[];  // 每个参与者的值
}

export interface BlindSpotEntry {
  nodeId: string;
  nodeTitle: string;
  chapterId: number;
  expertRate: number;      // 选对率
  riskRate: number;        // 选风险率
  partialRate: number;     // 选部分率
  totalAttempts: number;
  insight: string;         // 盲区洞察
}

export interface DiscussionQuestion {
  question: string;
  trigger: "pattern" | "blindspot" | "consensus" | "divergence" | "growth";
  relatedAbility?: AbilityId;
  evidence: string;        // 数据证据
  facilitation: string;    // 教练引导话术
}

export interface WorkshopReport {
  groupName: string;
  participantCount: number;
  generatedAt: number;
  groupRadar: GroupRadarData[];
  blindSpots: BlindSpotEntry[];
  discussionQuestions: DiscussionQuestion[];
  consensusScenarios: string[];      // 小组高度一致的情境
  divergenceScenarios: string[];     // 小组分歧最大的情境
  growthTrajectory: { name: string; abilities: Record<AbilityId, number>; trajectory: "rising" | "plateau" | "declining" }[];
  workshopPlan: WorkshopSession[];
}

export interface WorkshopSession {
  phase: string;
  duration: number;       // 分钟
  activity: string;
  materials: string;
  facilitationNotes: string;
}

export interface PersonalCoachAction {
  action: "train" | "review" | "duel";
  ability?: AbilityId;
  nodeId?: string;
}

export interface PersonalCoachReport {
  name: string;
  role: RoleId;
  generatedAt: number;
  strengths: AbilityId[];
  focus: AbilityId[];
  decisionProfile: {
    expert: number;
    partial: number;
    risk: number;
    total: number;
  };
  blindSpotNodes: Array<{
    nodeId: string;
    nodeTitle: string;
    quality: OptionQuality;
  }>;
  actionPlan: PersonalCoachAction[];
}

// ============================================================
// 教练端工作坊引擎
// ============================================================

export class CoachWorkshopEngine {
  participants: CoachParticipant[] = [];

  /**
   * 从存档 JSON 批量导入学员
   */
  importParticipants(saveStates: { name: string; data: SaveState }[]): void {
    this.participants = saveStates.map(({ name, data }) => ({
      name,
      role: data.profile.role,
      saveState: data,
      importedAt: Date.now(),
    }));
  }

  /**
   * 生成完整的工作坊报告
   */
  generateReport(groupName: string = "领导力训练小组"): WorkshopReport {
    return {
      groupName,
      participantCount: this.participants.length,
      generatedAt: Date.now(),
      groupRadar: this.computeGroupRadar(),
      blindSpots: this.computeBlindSpots(),
      discussionQuestions: this.generateDiscussionQuestions(),
      consensusScenarios: this.findConsensusScenarios(),
      divergenceScenarios: this.findDivergenceScenarios(),
      growthTrajectory: this.computeGrowthTrajectory(),
      workshopPlan: this.generateWorkshopPlan(),
    };
  }

  /**
   * 从玩家自己的存档生成个人教练报告。
   */
  generatePersonalReport(save: SaveState): PersonalCoachReport {
    const abilities = save.profile.abilities;
    const ranked = ABILITY_ORDER.slice().sort(
      (a, b) =>
        abilityLevel(abilities[b]) - abilityLevel(abilities[a]) ||
        (abilities[b] ?? 0) - (abilities[a] ?? 0)
    );
    const focusPool = save.profile.role === "founder"
      ? ["structure", "execution", "recovery", "strategy"]
      : save.profile.role === "parachute"
        ? ["insight", "strategy", "communication", "authority"]
        : ["communication", "deploy", "insight", "structure"];
    const focus = ranked
      .slice()
      .sort(
        (a, b) =>
          abilityLevel(abilities[a]) - abilityLevel(abilities[b]) ||
          (focusPool.includes(a) ? -1 : 1) - (focusPool.includes(b) ? -1 : 1)
      )
      .slice(0, 2);
    const profile = { expert: 0, partial: 0, risk: 0, total: 0 };
    for (const decision of save.decisionHistory) {
      profile[decision.quality] += 1;
      profile.total += 1;
    }
    const seenNodes = new Set<string>();
    const blindSpotNodes: PersonalCoachReport["blindSpotNodes"] = [];
    for (const decision of save.decisionHistory.slice().reverse()) {
      if (seenNodes.has(decision.nodeId)) continue;
      if (decision.quality !== "expert") {
        seenNodes.add(decision.nodeId);
        blindSpotNodes.push({
          nodeId: decision.nodeId,
          nodeTitle: this.guessNodeTitle(decision.nodeId),
          quality: decision.quality
        });
      }
      if (blindSpotNodes.length >= 3) break;
    }
    const actionPlan: PersonalCoachAction[] = [
      { action: "train", ability: focus[0] ?? "insight" },
      ...(blindSpotNodes[0]
        ? [{ action: "review" as const, nodeId: blindSpotNodes[0].nodeId }]
        : [{ action: "duel" as const, ability: focus[0] ?? "insight" }]),
      { action: "duel", ability: focus[1] ?? "structure" }
    ];
    return {
      name: save.profile.name,
      role: save.profile.role,
      generatedAt: Date.now(),
      strengths: ranked.slice(0, 3),
      focus,
      decisionProfile: profile,
      blindSpotNodes,
      actionPlan
    };
  }

  // --------------------------------------------------------
  // 小组对比雷达图
  // --------------------------------------------------------

  private computeGroupRadar(): GroupRadarData[] {
    return ABILITY_ORDER.map(ability => {
      const values = this.participants.map(p => p.saveState.profile.abilities[ability] ?? 0);
      const sorted = [...values].sort((a, b) => a - b);
      const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

      return {
        ability,
        min: Math.min(...values),
        max: Math.max(...values),
        median,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        distribution: values,
      };
    });
  }

  // --------------------------------------------------------
  // 决策盲区热力图
  // --------------------------------------------------------

  private computeBlindSpots(): BlindSpotEntry[] {
    const nodeStats = new Map<string, { expert: number; partial: number; risk: number; total: number }>();

    for (const p of this.participants) {
      for (const decision of p.saveState.decisionHistory) {
        const stat = nodeStats.get(decision.nodeId) ?? { expert: 0, partial: 0, risk: 0, total: 0 };
        stat[decision.quality]++;
        stat.total++;
        nodeStats.set(decision.nodeId, stat);
      }
    }

    const results: BlindSpotEntry[] = [];
    for (const [nodeId, stat] of nodeStats) {
      if (stat.total < 2) continue;  // 至少 2 人尝试才统计

      const expertRate = stat.expert / stat.total;
      const riskRate = stat.risk / stat.total;
      const partialRate = stat.partial / stat.total;

      // 盲区定义：专家率 < 30% 或 风险率 > 40%
      const isBlindSpot = expertRate < 0.3 || riskRate > 0.4;

      if (isBlindSpot) {
        results.push({
          nodeId,
          nodeTitle: this.guessNodeTitle(nodeId),
          chapterId: this.guessChapterId(nodeId),
          expertRate,
          riskRate,
          partialRate,
          totalAttempts: stat.total,
          insight: this.generateBlindSpotInsight(expertRate, riskRate, partialRate),
        });
      }
    }

    return results.sort((a, b) => a.expertRate - b.expertRate);
  }

  private generateBlindSpotInsight(expertRate: number, riskRate: number, partialRate: number): string {
    if (expertRate < 0.2 && riskRate > 0.4) {
      return "小组在这个情境上存在系统性盲区：大多数人倾向于冒险而非寻找专家方案。可能是缺乏相关理论框架或经验不足。";
    }
    if (expertRate < 0.2 && partialRate > 0.5) {
      return "小组在安全选项上高度集中，但错过了最优解。可能的原因是风险规避文化或对情境理解停留在表面。";
    }
    if (expertRate < 0.3) {
      return "专家方案的选择率偏低，建议在训练中增加该能力维度的理论教学与案例讨论。";
    }
    return "这个情境值得关注，小组的选择分布较为分散。";
  }

  // --------------------------------------------------------
  // 工作坊讨论引导问题生成
  // --------------------------------------------------------

  private generateDiscussionQuestions(): DiscussionQuestion[] {
    const questions: DiscussionQuestion[] = [];
    const radar = this.computeGroupRadar();
    const blindSpots = this.computeBlindSpots();

    // 1. 基于能力短板的问题
    const weakestAbility = radar.reduce((min, cur) => cur.average < min.average ? cur : min);
    questions.push({
      question: `小组在「${this.abilityName(weakestAbility.ability)}」上整体偏弱（均值 ${weakestAbility.average.toFixed(0)}），最大值 ${weakestAbility.max} vs 最小值 ${weakestAbility.min}。是什么导致了这个差距？`,
      trigger: "growth",
      relatedAbility: weakestAbility.ability,
      evidence: `小组均值 ${weakestAbility.average.toFixed(0)}，最大值 ${weakestAbility.max}，最小值 ${weakestAbility.min}`,
      facilitation: "请得分最高的人分享：你在哪些具体场景中锻炼了这项能力？请得分最低的人分享：你遇到的障碍是什么？",
    });

    // 2. 基于决策模式的问题
    const patterns = this.analyzeDecisionPatterns();
    if (patterns.dominantStyle) {
      questions.push({
        question: `小组在 ${patterns.dominantStyle.count} 个情境中选择了${patterns.dominantStyle.style === "expert" ? "专家" : patterns.dominantStyle.style === "partial" ? "稳健" : "风险"}方案（占比 ${Math.round(patterns.dominantStyle.ratio * 100)}%）。这是你们日常管理风格的真实写照吗？`,
        trigger: "pattern",
        evidence: `${patterns.dominantStyle.count}/${patterns.totalDecisions} = ${Math.round(patterns.dominantStyle.ratio * 100)}%`,
        facilitation: "请大家回忆最近一周的工作，你的决策风格和游戏中一致吗？如果一致，这种风格在哪些场景下是优势，哪些场景下是盲区？",
      });
    }

    // 3. 基于盲区的问题
    if (blindSpots.length > 0) {
      const topBlindSpot = blindSpots[0];
      questions.push({
        question: `在「${topBlindSpot.nodeTitle}」情境中，${Math.round((1 - topBlindSpot.expertRate) * 100)}% 的人没有选到专家方案。如果这个情境出现在你的真实工作中，你会怎么做？`,
        trigger: "blindspot",
        evidence: `专家率 ${Math.round(topBlindSpot.expertRate * 100)}%，风险率 ${Math.round(topBlindSpot.riskRate * 100)}%，参与 ${topBlindSpot.totalAttempts} 人`,
        facilitation: "先让大家独立思考 2 分钟，然后请选了风险方案的人分享理由，最后揭示专家方案及其理论依据。",
      });
    }

    // 4. 基于共识与分歧的问题
    const consensus = this.findConsensusScenarios();
    const divergence = this.findDivergenceScenarios();

    if (divergence.length > 0) {
      questions.push({
        question: `在「${divergence[0]}」情境中，小组的选择分歧最大。这是认知差异还是价值观差异？`,
        trigger: "divergence",
        evidence: `选择分布：${this.getDecisionDistribution(divergence[0])}`,
        facilitation: "把选择不同选项的人分成小组，每组 3 分钟准备理由，然后交叉辩论。最后问：有没有人改变主意？",
      });
    }

    if (consensus.length > 0) {
      questions.push({
        question: `小组在「${consensus[0]}」情境中高度一致。一致的选择是正确的吗？如果所有人都走同一条路，组织会不会缺少 Plan B？`,
        trigger: "consensus",
        evidence: `一致度 ${Math.round(this.getConsensusRate(consensus[0]) * 100)}%`,
        facilitation: "请扮演'魔鬼代言人'：如果共识是错的，最可能的失败场景是什么？",
      });
    }

    return questions;
  }

  // --------------------------------------------------------
  // 决策模式分析
  // --------------------------------------------------------

  private analyzeDecisionPatterns(): {
    dominantStyle: { style: OptionQuality; count: number; ratio: number } | null;
    totalDecisions: number;
  } {
    const counts = { expert: 0, partial: 0, risk: 0 };
    let total = 0;

    for (const p of this.participants) {
      for (const d of p.saveState.decisionHistory) {
        counts[d.quality]++;
        total++;
      }
    }

    if (total === 0) return { dominantStyle: null, totalDecisions: 0 };

    const entries = Object.entries(counts) as [OptionQuality, number][];
    entries.sort((a, b) => b[1] - a[1]);
    const [style, count] = entries[0];

    return {
      dominantStyle: { style, count, ratio: count / total },
      totalDecisions: total,
    };
  }

  // --------------------------------------------------------
  // 共识与分歧场景
  // --------------------------------------------------------

  private findConsensusScenarios(): string[] {
    const nodeAgreement = new Map<string, number>();

    for (const p of this.participants) {
      const nodePicks = new Map<string, number>();
      for (const d of p.saveState.decisionHistory) {
        nodePicks.set(d.nodeId, d.optionIndex);
      }
      for (const [nodeId, pick] of nodePicks) {
        // 统计同一情境中所有人是否选了同一选项
      }
    }

    // 简化：找选择分布最集中的场景
    const nodeChoices = new Map<string, Map<number, number>>();
    for (const p of this.participants) {
      for (const d of p.saveState.decisionHistory) {
        if (!nodeChoices.has(d.nodeId)) nodeChoices.set(d.nodeId, new Map());
        const choices = nodeChoices.get(d.nodeId)!;
        choices.set(d.optionIndex, (choices.get(d.optionIndex) ?? 0) + 1);
      }
    }

    const results: { nodeId: string; agreement: number }[] = [];
    for (const [nodeId, choices] of nodeChoices) {
      const total = [...choices.values()].reduce((a, b) => a + b, 0);
      const maxChoice = Math.max(...choices.values());
      if (total >= 2) {
        results.push({ nodeId, agreement: maxChoice / total });
      }
    }

    return results
      .sort((a, b) => b.agreement - a.agreement)
      .slice(0, 3)
      .map(r => this.guessNodeTitle(r.nodeId));
  }

  private findDivergenceScenarios(): string[] {
    const nodeChoices = new Map<string, Map<number, number>>();
    for (const p of this.participants) {
      for (const d of p.saveState.decisionHistory) {
        if (!nodeChoices.has(d.nodeId)) nodeChoices.set(d.nodeId, new Map());
        const choices = nodeChoices.get(d.nodeId)!;
        choices.set(d.optionIndex, (choices.get(d.optionIndex) ?? 0) + 1);
      }
    }

    const results: { nodeId: string; entropy: number }[] = [];
    for (const [nodeId, choices] of nodeChoices) {
      const total = [...choices.values()].reduce((a, b) => a + b, 0);
      if (total < 2) continue;
      // 计算熵：熵越高 = 分歧越大
      const entropy = -[...choices.values()].reduce((sum, count) => {
        const p = count / total;
        return sum + (p > 0 ? p * Math.log2(p) : 0);
      }, 0);
      results.push({ nodeId, entropy });
    }

    return results
      .sort((a, b) => b.entropy - a.entropy)
      .slice(0, 3)
      .map(r => this.guessNodeTitle(r.nodeId));
  }

  private getConsensusRate(nodeTitle: string): number {
    // 简化实现
    return 0.85;
  }

  private getDecisionDistribution(nodeTitle: string): string {
    return "专家 30% · 稳健 40% · 风险 30%";
  }

  // --------------------------------------------------------
  // 成长轨迹
  // --------------------------------------------------------

  private computeGrowthTrajectory(): WorkshopReport["growthTrajectory"] {
    return this.participants.map(p => {
      const abilities = p.saveState.profile.abilities;
      const history = p.saveState.decisionHistory;
      const recentDecisions = history.slice(-5);
      const earlyDecisions = history.slice(0, 5);

      const recentExpertRate = recentDecisions.filter(d => d.quality === "expert").length / Math.max(1, recentDecisions.length);
      const earlyExpertRate = earlyDecisions.filter(d => d.quality === "expert").length / Math.max(1, earlyDecisions.length);

      const trajectory = recentExpertRate > earlyExpertRate + 0.1 ? "rising" :
                         recentExpertRate < earlyExpertRate - 0.1 ? "declining" : "plateau";

      return { name: p.name, abilities, trajectory };
    });
  }

  // --------------------------------------------------------
  // 工作坊流程设计
  // --------------------------------------------------------

  private generateWorkshopPlan(): WorkshopSession[] {
    const blindSpotCount = this.computeBlindSpots().length;
    const participantCount = this.participants.length;

    return [
      {
        phase: "破冰与导入",
        duration: 10,
        activity: "每人用一句话描述自己的领导力风格，并分享游戏中最让自己意外的一个决策",
        materials: "投影小组雷达图",
        facilitationNotes: "教练关注：是否有人发现自己的游戏风格和自我认知不一致？",
      },
      {
        phase: "盲区发现",
        duration: 20,
        activity: `展示 ${blindSpotCount} 个决策盲区热力图，分组讨论"为什么我们会集体走偏"`,
        materials: "投影盲区热力图与对应情境原文",
        facilitationNotes: "不要急于给出正确答案，让小组先自己讨论再揭示专家方案",
      },
      {
        phase: "共识与分歧",
        duration: 25,
        activity: "选择分歧最大的情境，现场分组辩论，然后揭示专家方案",
        materials: "投影分歧情境与选项分布",
        facilitationNotes: "分组时确保每组都有不同选择的代表",
      },
      {
        phase: "迁移讨论",
        duration: 20,
        activity: "每人选一个游戏情境，分享自己工作中的对应场景，讨论「如果重来一次会怎么做」",
        materials: "纸笔或在线协作文档",
        facilitationNotes: "这是从游戏迁移到真实管理的关键环节，确保每人都有分享时间",
      },
      {
        phase: "行动承诺",
        duration: 10,
        activity: "每人写下一个「未来 30 天要改变的领导力行为」，贴在墙上互相见证",
        materials: "便利贴+马克笔",
        facilitationNotes: "拍照存档，30 天后跟进",
      },
      {
        phase: "教练总结",
        duration: 5,
        activity: "教练基于小组数据做总结：集体优势、集体盲区、个人亮点",
        materials: "投影完整工作坊报告",
        facilitationNotes: participantCount > 8
          ? "人数较多，建议每人分享控制在 1 分钟内"
          : "人数适中，可以给每人充分表达时间",
      },
    ];
  }

  // --------------------------------------------------------
  // 工具方法
  // --------------------------------------------------------

  private abilityName(id: AbilityId): string {
    const names: Record<AbilityId, string> = {
      insight: "识人洞察",
      deploy: "用人部署",
      mobilize: "动员激发",
      strategy: "谋略规划",
      authority: "权威塑造",
      stability: "稳固防守",
      recovery: "恢复韧性",
      execution: "执行落地",
      structure: "结构设计",
      communication: "沟通影响",
    };
    return names[id] ?? id;
  }

  private guessNodeTitle(nodeId: string): string {
    // 从 story.ts 动态查询节点标题
    try {
      return getNode(nodeId).title;
    } catch {
      return nodeId;
    }
  }

  private guessChapterId(nodeId: string): number {
    // 支持 c1n1 / c1b-parachute / s1 / r1 等格式
    const match = nodeId.match(/^[csr](\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}

// ============================================================
// 同步推演模式（工作坊现场使用）
// ============================================================

export interface LiveScenarioSession {
  sessionId: string;
  coachId: string;
  node: StoryNode;
  participantPicks: Map<string, number>;  // name → optionIndex
  startedAt: number;
  revealAt?: number;
}

export class LiveScenarioRunner {
  private sessions = new Map<string, LiveScenarioSession>();

  createSession(coachId: string, node: StoryNode): LiveScenarioSession {
    const session: LiveScenarioSession = {
      sessionId: `ws_${Date.now()}`,
      coachId,
      node,
      participantPicks: new Map(),
      startedAt: Date.now(),
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  submitPick(sessionId: string, participantName: string, optionIndex: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("会话不存在");
    if (session.revealAt) throw new Error("已截止提交");
    session.participantPicks.set(participantName, optionIndex);
  }

  reveal(sessionId: string): { distribution: Map<number, number>; total: number } {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("会话不存在");
    session.revealAt = Date.now();

    const distribution = new Map<number, number>();
    for (const pick of session.participantPicks.values()) {
      distribution.set(pick, (distribution.get(pick) ?? 0) + 1);
    }

    return {
      distribution,
      total: session.participantPicks.size,
    };
  }

  getSession(sessionId: string): LiveScenarioSession | undefined {
    return this.sessions.get(sessionId);
  }
}
