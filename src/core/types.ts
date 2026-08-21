import type { ReviewCard } from "./review-schedule.ts";

export type AbilityId =
  | "insight"
  | "deploy"
  | "mobilize"
  | "strategy"
  | "authority"
  | "stability"
  | "recovery"
  | "execution"
  | "structure"
  | "communication";

export type LeadershipDimension =
  | "credibility"
  | "empathy"
  | "decisiveness"
  | "vision"
  | "resilience";

export type ResourceKey = "energy" | "trust" | "influence" | "capital";

export type RoleId = "parachute" | "founder" | "highPotential";

export type OptionQuality = "expert" | "partial" | "risk";

export interface AbilityDef {
  id: AbilityId;
  name: string;
  code: string;
  tagline: string;
  color: string;
  sources: string[];
  subSkills: string[];
  trainingPath: string;
}

export interface StoryOption {
  label: string;
  summary: string;
  quality: OptionQuality;
  effects: Partial<Record<AbilityId, number>>;
  resources: Partial<Record<ResourceKey, number>>;
  feedback: string;
  theory: string;
  branchTo?: Partial<Record<RoleId, string>>;
}

export interface StoryNode {
  id: string;
  chapterId: number;
  title: string;
  kind: "main" | "side" | "branch" | "random";
  context: string;
  stake: string;
  options: StoryOption[];
}

export interface ChapterDef {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  focus: AbilityId[];
  nodeIds: string[];
}

export interface RoleDef {
  id: RoleId;
  name: string;
  shortName: string;
  description: string;
  objective: string;
  lens: string;
  focusAbilities: AbilityId[];
  startingAbilities: Partial<Record<AbilityId, number>>;
  startingResources: Record<ResourceKey, number>;
}

export interface PlayerProfile {
  name: string;
  role: RoleId;
  abilities: Record<AbilityId, number>;
  resources: Record<ResourceKey, number>;
  /** 名号：仅作身份展示，不参与数值。 */
  title?: string;
  /** 叙事视角：只影响少量情境细节，不改变能力与资源。 */
  perspective?: "male" | "female";
}

/** AI 陪练人格原型：影响选项偏好与对局风格。 */
export type AiArchetype = "executor" | "builder" | "gambler";

export interface DuelProfile {
  name: string;
  role: RoleId;
  abilities: Record<AbilityId, number>;
  resources: Record<ResourceKey, number>;
  color: string;
  isHuman: boolean;
  /** AI 难度强度（影响选择精确率）。 */
  strength?: number;
  archetype?: AiArchetype;
}

export interface ChapterRecord {
  chapterId: number;
  completedNodeIds: string[];
  stars: number;
}

export interface DecisionRecord {
  nodeId: string;
  optionIndex: number;
  quality: OptionQuality;
  qualityScore: number;
  chapterId: number;
  /** 本次决策实际产生的增量，供「重试章节」回滚使用。旧存档可能缺失。 */
  delta?: {
    abilities: Partial<Record<AbilityId, number>>;
    resources: Partial<Record<ResourceKey, number>>;
    masteryPoints: number;
    trialEnergy: number;
  };
}

export interface DuelHistoryEntry {
  opponentName: string;
  playerScore: number;
  opponentScore: number;
  won: boolean;
  timestamp: number;
}

export type AdaptiveDifficultyTier = "recovery" | "standard" | "stretch";

export interface AbilityMasteryState {
  ability: AbilityId;
  attempts: number;
  expert: number;
  partial: number;
  risk: number;
  lastAt: number;
  qualitySum: number;
  mastery: number;
  confidence: number;
  bktMastery: number;
}

export interface LearnerModel {
  abilities: Record<AbilityId, AbilityMasteryState>;
  updatedAt: number;
}

export interface PpsObservation {
  at: number;
  quality: OptionQuality;
  abilityIds: AbilityId[];
  resourceDelta: Partial<Record<ResourceKey, number>>;
  decisionTimeMs?: number;
  usedHint?: boolean;
  morale?: number;
}

export interface PpsState {
  currentPps: number;
  previousPps: number;
  tier: AdaptiveDifficultyTier;
  calibrationRemaining: number;
  observations: PpsObservation[];
  lastUpdatedAt: number;
  consecutiveExpert: number;
  consecutiveRisk: number;
}

export interface AdaptiveState {
  learnerModel: LearnerModel;
  pps: PpsState;
  configVersion: number;
}

export interface FsrsCard {
  nodeId: string;
  abilityIds: AbilityId[];
  stability: number;
  difficulty: number;
  retrievability: number;
  dueAt: number;
  lastReviewedAt: number;
  reviews: number;
}

export interface AdaptiveAdjustment {
  tier: AdaptiveDifficultyTier;
  pps: number;
  resourceFactor: { neg: number; pos: number };
  decisionWindowMs: number;
  gateOffset: number;
  aiStrength: number;
  recoveryScale: number;
  reason?: string;
}

export interface SaveState {
  version: number;
  profileCreated: boolean;
  profile: PlayerProfile;
  chapterRecords: ChapterRecord[];
  unlockedChapters: number[];
  completedSideQuests: string[];
  achievements: string[];
  duelWins: number;
  duelLosses: number;
  playCount: number;
  masteryPoints: number;
  decisionHistory: DecisionRecord[];
  duelHistory: DuelHistoryEntry[];
  claimedChallenges: string[];
  /** 每日挑战领取记录：键为 "YYYY-MM-DD"，值为当天已领取的挑战 id 列表。跨天自然重置，故「每日」可重复领取。 */
  claimedDaily: Record<string, string[]>;
  claimedWeekly?: Record<string, string[]>;
  /** 随机事件轮换周期：每清空一次事件池 +1，用于生成角色/难度变体与二周目差异。 */
  randomEventCycle?: number;
  assessmentScore: number;
  completedRandomEvents: string[];
  completedBranchNodes: string[];
  completedTraining: string[];
  trainingScores: Record<string, number>;
  trialEnergy: number;
  trialHp: number;
  trialCleared: string[];
  trialItems: string[];
  completedPracticeTasks: string[];
  trialStreak: number;
  lastTrialEnergyDate?: string;
  trialAccelerator: boolean;
  trialAcceleratorLevel: number;
  trialOpenAnswers: Record<string, string>;
  hiddenRoutes: string[];
  hiddenRouteProgress: Record<string, number>;
  alternateEndings: string[];
  /** 章节完成时选择的章末路线：精准 / 高压 / 渐进。影响随机事件加权与结局复盘。 */
  routePath: Record<number, "expert" | "risk" | "partial">;
  highPressureMode: boolean;
  /** 难度档位：标准 / 高压 / 极限。驱动资源缩放、回合时限与突发干扰。 */
  difficulty: "normal" | "pressure" | "extreme";
  /** 本局稳定的随机种子：建档时生成一次，用于章节情境外壳等跨屏稳定内容。 */
  scenarioSeed?: number;
  /** 最近一次本地保存的时间戳（毫秒）。用于云端同步冲突判定。 */
  lastSavedAt?: number;
  lastResourceDate?: string;
  /** 存档核心进度的内容哈希。用于云端同步冲突判定（同游玩次数但内容不同也能识别）。 */
  saveHash?: string;
  lastStoryNodeId?: string;
  /** 本局最高单局得分，用于本地成绩留存。 */
  bestScore?: number;
  /** 完成整个九章权力架构的次数，用于「游玩次数」而不是决策次数。 */
  campaignCompletions?: number;
  /** 勘察玩法：每个剧情节点已完成的勘察/访谈/研读动作。 */
  explorationFound?: Record<string, string[]>;
  /** 已完成全部三个勘察动作并获得奖励的节点。 */
  explorationCompleted?: string[];
  /** 连续选择第一个选项的次数，用于防“全选 A”通关。 */
  firstPickStreak?: number;
  /** 1v1 对局中已抽到过的题目，用于在题库内尽量不重复。 */
  duelSeenNodeIds?: string[];
  /** 经典影视副线已完成的作品关卡。 */
  completedFilmQuests?: string[];
  /** 最近几次选择在界面上的显示位置，用于识别 ABAB 机械通关。 */
  recentPickPositions?: number[];
  /** 组织再投资次数：消耗组织资源换取长期产能。 */
  organizationInvestments?: number;
  /** 随机事件解锁的人物线索。 */
  npcLeads?: string[];
  /** 每日产能任务：最近领取日期与当日已完成决策数。 */
  lastProductionDate?: string;
  productionCount?: number;
  /** 每日对练任务：最近领取日期与当日已完成对局数。 */
  lastDuelBonusDate?: string;
  duelsToday?: number;
  /** Leadership game center wins. */
  leadershipGameWins: number;
  /** Leadership game center losses. */
  leadershipGameLosses: number;
  /** Per-game earned achievement ids. */
  leadershipAchievements: Record<string, string[]>;
  /** Per-game highest unlocked difficulty (1-3). */
  leadershipBestLevel: Record<string, number>;
  /** Per-game highest earned star count (1-3). */
  leadershipBestStars?: Record<string, number>;
  /** SM-2 间隔复习卡：未选专家项的决策进入到期回练队列。 */
  reviewCards?: ReviewCard[];
  /** FSRS 风格记忆卡：绑定能力与掌握度遗忘预测。 */
  fsrsCards?: FsrsCard[];
  adaptive?: AdaptiveState;
  /** 90 天引领路线已通关的阶段 id。 */
  adaptiveRoutePassed?: string[];
  /** Five-dimension leadership model experience. */
  dimensionExp: Record<LeadershipDimension, number>;
  /** Team morale affected by resilience and adversity choices. */
  morale: number;
}

export interface ChoiceOutcome {
  option: StoryOption;
  optionIndex: number;
  gainedAbilityIds: AbilityId[];
  resourceDeltas: Partial<Record<ResourceKey, number>>;
  qualityScore: number;
  resourceStrain?: number;
}

export interface DuelResult {
  winnerName: string;
  scores: [number, number];
  roundResults: Array<{
    node: StoryNode;
    picks: [number, number];
    points: [number, number];
  }>;
}
