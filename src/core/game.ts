import {
  ABILITIES,
  ABILITY_ORDER,
  ROLES,
  abilityLevel,
  createDefaultAbilities,
  rankForTotal,
  totalAbilityLevels
} from "./abilities.ts";
import {
  getNode,
  randomEventEligibleCount
} from "./story.ts";
import { addDimensionExp, applyMoraleChange } from "./leadership-model.ts";
import { normalizeReviewCards } from "./review-schedule.ts";
import type {
  AbilityId,
  ChoiceOutcome,
  DecisionRecord,
  DuelHistoryEntry,
  LeadershipDimension,
  OptionQuality,
  PlayerProfile,
  ResourceKey,
  RoleId,
  SaveState,
  StoryOption
} from "./types.ts";

const SAVE_KEY = "adaptive-ascent-save-v1";
const BACKUP_SAVE_KEY = "adaptive-ascent-save-backup-v1";
const CORRUPT_SAVE_KEY = "adaptive-ascent-save-corrupt";
const ROLE_SAVE_PREFIX = "adaptive-ascent-save-role-v1-";
const ACTIVE_ROLE_KEY = "adaptive-ascent-active-role-v1";
export const ROLE_IDS: RoleId[] = ["parachute", "founder", "highPotential"];

/** 难度档位对应的资源缩放系数（负面 delta 放大、正面 delta 收窄）。 */
export const PRESSURE_FACTORS: Record<
  "normal" | "pressure" | "extreme",
  { neg: number; pos: number }
> = {
  normal: { neg: 1, pos: 1 },
  pressure: { neg: 1.4, pos: 0.7 },
  extreme: { neg: 1.8, pos: 0.5 }
};

/** 各难度档位的每回合决策时限（毫秒）。标准档不计时（返回 0）。 */
export function roundDurationMsForDifficulty(
  difficulty: "normal" | "pressure" | "extreme"
): number {
  if (difficulty === "normal") return NORMAL_DECISION_MS;
  if (difficulty === "pressure") return 22000;
  return 14000;
}

export const NORMAL_DECISION_MS = 0;

/** 把旧版音量值归一到设置下拉允许的档位，避免显示 0 但实际有声。 */
export function normalizeVolume(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const options = [0, 25, 50, 75, 100];
  return options.reduce((best, option) =>
    Math.abs(option - value) < Math.abs(best - value) ? option : best
  );
}

/** 高压/极限档的决策时限：长文本按阅读量动态加时，短文本仍保持原有节奏。 */
export function decisionWindowMs(baseMs: number, text: string): number {
  if (baseMs <= 0) return 0;
  const readableLength = Math.max(0, (text || "").length);
  return baseMs + Math.min(60000, Math.ceil(readableLength / 30) * 1200);
}

/** 把按条件即时判定的成就补写入存档，保持成就墙与全局统计同源。 */
function syncDerivedAchievements(save: SaveState): void {
  const push = (id: string) => {
    if (!save.achievements.includes(id)) save.achievements.push(id);
  };
  if ((save.playCount ?? 0) >= 1) push("first_step");
  const trainingCount = (save.completedTraining ?? []).length;
  if (trainingCount >= 1) push("training_first");
  if (trainingCount >= 4) push("training_four");
  if (trainingCount >= 10) push("training_all");
  save.achievements = [...new Set(save.achievements)];
}
export const RESOURCE_STRAIN_SOFT = 30;
export const RESOURCE_STRAIN_HARD = 15;
export const MAX_HISTORY_LENGTH = 200;

export const DEFAULT_SAVE: SaveState = {
  version: 1,
  profileCreated: false,
  profile: {
    name: "你",
    role: "highPotential",
    abilities: createDefaultAbilities(),
    resources: { energy: 75, trust: 60, influence: 40, capital: 45 }
  },
  chapterRecords: [],
  unlockedChapters: [1],
  completedSideQuests: [],
  achievements: [],
  duelWins: 0,
  duelLosses: 0,
  playCount: 0,
  masteryPoints: 0,
  decisionHistory: [],
  duelHistory: [],
  claimedChallenges: [],
  claimedDaily: {},
  claimedWeekly: {},
  randomEventCycle: 0,
  assessmentScore: 0,
  completedRandomEvents: [],
  completedBranchNodes: [],
  completedTraining: [],
  trainingScores: {},
  trialEnergy: 100,
  trialHp: 100,
  trialCleared: [],
  trialItems: [],
  completedPracticeTasks: [],
  trialStreak: 0,
  lastTrialEnergyDate: "",
  trialAccelerator: false,
  trialAcceleratorLevel: 0,
  trialOpenAnswers: {},
  hiddenRoutes: [],
  bestScore: 0,
  campaignCompletions: 0,
  hiddenRouteProgress: {},
  alternateEndings: [],
  routePath: {},
  highPressureMode: false,
  difficulty: "normal",
  explorationFound: {},
  explorationCompleted: [],
  firstPickStreak: 0,
  duelSeenNodeIds: [],
  completedFilmQuests: [],
  junqiWins: 0,
  junqiLosses: 0,
  leadershipGameWins: 0,
  leadershipGameLosses: 0,
  leadershipAchievements: {},
  leadershipBranches: {},
  leadershipBestLevel: {},
  reviewCards: [],
  dimensionExp: {
    credibility: 0,
    empathy: 0,
    decisiveness: 0,
    vision: 0,
    resilience: 0
  },
  morale: 75,
  recentPickPositions: [],
  organizationInvestments: 0,
  npcLeads: [],
  lastProductionDate: "",
  productionCount: 0,
  lastDuelBonusDate: "",
  duelsToday: 0
};

export function createProfile(name: string, role: RoleId): PlayerProfile {
  const roleDef = ROLES[role];
  const abilities = createDefaultAbilities();
  for (const [id, exp] of Object.entries(roleDef.startingAbilities) as Array<
    [AbilityId, number]
  >) {
    abilities[id] = exp;
  }
  return {
    name: name.trim() || "你",
    role,
    abilities,
    resources: { ...roleDef.startingResources }
  };
}

export function roleSaveKey(role: RoleId): string {
  return `${ROLE_SAVE_PREFIX}${role}`;
}

function readSlot(role: RoleId): SaveState | null {
  try {
    const raw = localStorage.getItem(roleSaveKey(role));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as SaveState;
    return parsed.version === DEFAULT_SAVE.version
      ? normalizeSave(parsed)
      : migrateSave(parsed);
  } catch {
    return null;
  }
}

export function loadSave(role?: RoleId): SaveState {
  if (role) {
    const slot = readSlot(role);
    if (slot) {
      return slot;
    }
    const fresh = structuredClone(DEFAULT_SAVE);
    fresh.profile.role = role;
    return fresh;
  }
  let activeRole: RoleId | null = null;
  try {
    activeRole = localStorage.getItem(ACTIVE_ROLE_KEY) as RoleId | null;
  } catch {
    activeRole = null;
  }
  if (activeRole && ROLE_IDS.includes(activeRole)) {
    const slot = readSlot(activeRole);
    if (slot) {
      return slot;
    }
  }
  const legacy = loadLegacySave();
  if (legacy.profileCreated) {
    saveState(legacy);
  }
  return legacy;
}

function loadLegacySave(): SaveState {
  let corruptRaw: string | null = null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return structuredClone(DEFAULT_SAVE);
    }
    const parsed = JSON.parse(raw) as SaveState;
    if (parsed.version !== DEFAULT_SAVE.version) {
      return migrateSave(parsed);
    }
    return normalizeSave(parsed);
  } catch {
    try {
      corruptRaw = localStorage.getItem(SAVE_KEY);
    } catch {
      corruptRaw = null;
    }
  }
  if (corruptRaw) {
    try {
      localStorage.setItem(CORRUPT_SAVE_KEY, corruptRaw.slice(0, 4000));
    } catch {
      // 通知标记写不进去也不阻断恢复流程
    }
  }
  try {
    const backup = sessionStorage.getItem(BACKUP_SAVE_KEY);
    if (backup) {
      const parsed = JSON.parse(backup) as SaveState;
      if (parsed.version !== DEFAULT_SAVE.version) {
        return migrateSave(parsed);
      }
      return normalizeSave(parsed);
    }
  } catch {
    // 备份也不可用时回默认档
  }
  return structuredClone(DEFAULT_SAVE);
}

function normalizeSave(save: SaveState): SaveState {
  const profile = save.profile;
  const abilities = createDefaultAbilities();
  for (const id of ABILITY_ORDER) {
    abilities[id] = Math.max(0, Number(profile.abilities[id]) || 0);
  }
  const resources: PlayerProfile["resources"] = {
    energy: clamp(Number(profile.resources.energy) || 75, 0, 100),
    trust: clamp(Number(profile.resources.trust) || 60, 0, 100),
    influence: clamp(Number(profile.resources.influence) || 40, 0, 100),
    capital: clamp(Number(profile.resources.capital) || 45, 0, 100)
  };
  const normalized: SaveState = {
    version: DEFAULT_SAVE.version,
    profileCreated: Boolean(save.profileCreated),
    profile: {
      name: profile.name || "你",
      role: profile.role,
      abilities,
      resources
    },
    chapterRecords: Array.isArray(save.chapterRecords) ? save.chapterRecords : [],
    unlockedChapters: Array.isArray(save.unlockedChapters)
      ? save.unlockedChapters
      : [1],
    completedSideQuests: Array.isArray(save.completedSideQuests)
      ? save.completedSideQuests
      : [],
    achievements: Array.isArray(save.achievements) ? save.achievements : [],
    duelWins: Number(save.duelWins) || 0,
    duelLosses: Number(save.duelLosses) || 0,
    playCount: Number(save.playCount) || 0,
    lastStoryNodeId:
      typeof save.lastStoryNodeId === "string"
        ? save.lastStoryNodeId
        : undefined,
    bestScore: Number(save.bestScore) || 0,
    campaignCompletions: Number(save.campaignCompletions) || 0,
    masteryPoints: Number(save.masteryPoints) || 0,
    decisionHistory: Array.isArray(save.decisionHistory)
      ? save.decisionHistory.slice(-MAX_HISTORY_LENGTH)
      : [],
    duelHistory: Array.isArray(save.duelHistory)
      ? save.duelHistory.slice(-MAX_HISTORY_LENGTH)
      : [],
    claimedChallenges: Array.isArray(save.claimedChallenges)
      ? save.claimedChallenges
      : [],
    claimedDaily:
      save.claimedDaily && typeof save.claimedDaily === "object"
        ? save.claimedDaily
        : {},
    claimedWeekly:
      save.claimedWeekly && typeof save.claimedWeekly === "object"
        ? { ...save.claimedWeekly }
        : {},
    randomEventCycle: Math.max(0, Number(save.randomEventCycle) || 0),
    assessmentScore: Number(save.assessmentScore) || 0,
    completedRandomEvents: Array.isArray(save.completedRandomEvents)
      ? save.completedRandomEvents
      : [],
    completedBranchNodes: Array.isArray(save.completedBranchNodes)
      ? save.completedBranchNodes
      : [],
    completedTraining: Array.isArray(save.completedTraining)
      ? save.completedTraining
      : [],
    trainingScores:
      save.trainingScores && typeof save.trainingScores === "object"
        ? { ...save.trainingScores }
        : {},
    trialEnergy: clamp(Number(save.trialEnergy) || 100, 0, 100),
    trialHp: clamp(Number(save.trialHp) || 100, 0, 100),
    trialCleared: Array.isArray(save.trialCleared) ? save.trialCleared : [],
    trialItems: Array.isArray(save.trialItems) ? save.trialItems : [],
    completedPracticeTasks: Array.isArray(save.completedPracticeTasks)
      ? save.completedPracticeTasks
      : [],
    trialStreak: Math.max(0, Number(save.trialStreak) || 0),
    lastTrialEnergyDate:
      typeof save.lastTrialEnergyDate === "string"
        ? save.lastTrialEnergyDate
        : "",
    trialAccelerator: Boolean(save.trialAccelerator),
    trialAcceleratorLevel: Math.max(
      0,
      Math.min(3, Number(save.trialAcceleratorLevel) || 0)
    ),
    trialOpenAnswers:
      save.trialOpenAnswers && typeof save.trialOpenAnswers === "object"
        ? { ...save.trialOpenAnswers }
        : {},
    hiddenRoutes: Array.isArray(save.hiddenRoutes)
      ? save.hiddenRoutes
      : [],
    hiddenRouteProgress:
      save.hiddenRouteProgress && typeof save.hiddenRouteProgress === "object"
        ? { ...save.hiddenRouteProgress }
        : {},
    alternateEndings: Array.isArray(save.alternateEndings)
      ? save.alternateEndings
      : [],
    routePath:
      save.routePath && typeof save.routePath === "object"
        ? { ...save.routePath }
        : {},
    highPressureMode: Boolean(save.highPressureMode),
    difficulty:
      save.difficulty === "pressure" || save.difficulty === "extreme"
        ? save.difficulty
        : "normal",
    scenarioSeed:
      typeof save.scenarioSeed === "number" && Number.isFinite(save.scenarioSeed)
        ? Math.abs(save.scenarioSeed) || 1
        : undefined,
    explorationFound:
      save.explorationFound && typeof save.explorationFound === "object"
        ? save.explorationFound
        : {},
    explorationCompleted: Array.isArray(save.explorationCompleted)
      ? save.explorationCompleted
      : [],
    firstPickStreak: Math.max(0, Number(save.firstPickStreak) || 0),
    duelSeenNodeIds: Array.isArray(save.duelSeenNodeIds)
      ? save.duelSeenNodeIds.slice(-400)
      : [],
    completedFilmQuests: Array.isArray(save.completedFilmQuests)
      ? save.completedFilmQuests
      : [],
    junqiWins: Math.max(0, Number(save.junqiWins) || 0),
    junqiLosses: Math.max(0, Number(save.junqiLosses) || 0),
    leadershipGameWins: Math.max(0, Number(save.leadershipGameWins) || 0),
    leadershipGameLosses: Math.max(
      0,
      Number(save.leadershipGameLosses) || 0
    ),
    leadershipAchievements:
      save.leadershipAchievements &&
      typeof save.leadershipAchievements === "object"
        ? save.leadershipAchievements
        : {},
    leadershipBranches:
      save.leadershipBranches && typeof save.leadershipBranches === "object"
        ? save.leadershipBranches
        : {},
    leadershipBestLevel:
      save.leadershipBestLevel && typeof save.leadershipBestLevel === "object"
        ? save.leadershipBestLevel
        : {},
    reviewCards: normalizeReviewCards(save.reviewCards),
    dimensionExp: {
      credibility: clamp(
        Number(save.dimensionExp?.credibility) || 0,
        0,
        100
      ),
      empathy: clamp(Number(save.dimensionExp?.empathy) || 0, 0, 100),
      decisiveness: clamp(
        Number(save.dimensionExp?.decisiveness) || 0,
        0,
        100
      ),
      vision: clamp(Number(save.dimensionExp?.vision) || 0, 0, 100),
      resilience: clamp(Number(save.dimensionExp?.resilience) || 0, 0, 100)
    },
    morale: clamp(Number(save.morale) || 75, 0, 100),
    recentPickPositions: Array.isArray(save.recentPickPositions)
      ? save.recentPickPositions.slice(-5)
      : [],
    organizationInvestments: Math.max(
      0,
      Number(save.organizationInvestments) || 0
    ),
    npcLeads: Array.isArray(save.npcLeads) ? save.npcLeads : [],
    lastProductionDate:
      typeof save.lastProductionDate === "string"
        ? save.lastProductionDate
        : "",
    productionCount: Math.max(0, Number(save.productionCount) || 0),
    lastDuelBonusDate:
      typeof save.lastDuelBonusDate === "string"
        ? save.lastDuelBonusDate
        : "",
    duelsToday: Math.max(0, Number(save.duelsToday) || 0)
  };
  syncDerivedAchievements(normalized);
  return normalized;
}

/**
 * 计算存档核心进度的内容哈希（确定性）。
 * 刻意排除 lastSavedAt / saveHash 本身，避免每次保存都改变哈希。
 */
export function computeSaveHash(save: SaveState): string {
  const projection = {
    v: save.version,
    p: save.profile,
    cr: save.chapterRecords,
    uc: save.unlockedChapters,
    csq: save.completedSideQuests,
    ach: save.achievements,
    dw: save.duelWins,
    dl: save.duelLosses,
    jw: save.junqiWins,
    jl: save.junqiLosses,
    lgw: save.leadershipGameWins,
    lgl: save.leadershipGameLosses,
    lgach: save.leadershipAchievements,
    lgbranch: save.leadershipBranches,
    lgbest: save.leadershipBestLevel,
    rv: (save.reviewCards ?? []).map((card) => [
      card.nodeId,
      card.easiness,
      card.intervalDays,
      card.repetition,
      card.dueAt,
      card.lastQuality
    ]),
    dexp: save.dimensionExp,
    mor: save.morale,
    pc: save.playCount,
    mp: save.masteryPoints,
    dh: (save.decisionHistory ?? []).map((d) => [d.nodeId, d.optionIndex, d.qualityScore]),
    duh: (save.duelHistory ?? []).length,
    cc: save.claimedChallenges,
    cd: save.claimedDaily,
    rec: save.randomEventCycle ?? 0,
    ss: save.scenarioSeed ?? 0,
    as: save.assessmentScore,
    cre: save.completedRandomEvents,
    cbn: save.completedBranchNodes,
    ct: save.completedTraining,
    ts: save.trainingScores ?? {},
    trial: [
      save.trialEnergy,
      save.trialHp,
      save.trialCleared,
      save.trialItems,
      save.completedPracticeTasks,
      save.trialStreak,
      save.lastTrialEnergyDate,
      save.trialAccelerator,
      save.trialAcceleratorLevel,
      save.trialOpenAnswers,
      save.hiddenRoutes,
      save.hiddenRouteProgress,
      save.alternateEndings,
      save.routePath
    ],
    diff: save.difficulty
  };
  const json = JSON.stringify(projection);
  let hash = 5381;
  for (let i = 0; i < json.length; i += 1) {
    hash = ((hash << 5) + hash + json.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

export function saveState(save: SaveState): boolean {
  save.lastSavedAt = Date.now();
  save.saveHash = computeSaveHash(save);
  const json = JSON.stringify(save);
  try {
    localStorage.setItem(SAVE_KEY, json);
    if (save.profileCreated && ROLE_IDS.includes(save.profile.role)) {
      try {
        localStorage.setItem(roleSaveKey(save.profile.role), json);
        localStorage.setItem(ACTIVE_ROLE_KEY, save.profile.role);
      } catch {
        // role slot write failure should not block the main save
      }
    }
    try {
      sessionStorage.setItem(BACKUP_SAVE_KEY, json);
    } catch {
      // session 备份失败不阻断主存档
    }
    return true;
  } catch {
    try {
      sessionStorage.setItem(BACKUP_SAVE_KEY, json);
    } catch {
      // 主存档与备份都失败，由调用方提示导出
    }
    return false;
  }
}

/** 读取并清除损坏存档通知标记；返回损坏原始内容片段（用于提示导出）。 */
export function consumeCorruptSaveNotice(): string | null {
  try {
    const raw = localStorage.getItem(CORRUPT_SAVE_KEY);
    if (raw) {
      localStorage.removeItem(CORRUPT_SAVE_KEY);
      return raw;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * 版本不符时向前/向后兼容迁移：保留已知字段、默认缺失字段、
 * 保留未知字段（旧存档遇到新增字段不再被清空）。
 */
export function migrateSave(parsed: any): SaveState {
  const base = normalizeSave({ ...structuredClone(DEFAULT_SAVE), ...parsed } as SaveState);
  const result: any = { ...base };
  for (const key of Object.keys(parsed)) {
    if (!(key in base)) result[key] = parsed[key];
  }
  result.version = DEFAULT_SAVE.version;
  return result as SaveState;
}

export function resetSave(role?: RoleId): SaveState {
  const fresh = structuredClone(DEFAULT_SAVE);
  if (role) {
    fresh.profile.role = role;
  }
  saveState(fresh);
  return fresh;
}

export function importSaveJson(text: string): SaveState {
  const parsed = JSON.parse(text) as SaveState;
  const save =
    parsed.version === DEFAULT_SAVE.version ? normalizeSave(parsed) : migrateSave(parsed);
  saveState(save);
  return save;
}

export function activateProfile(save: SaveState, profile: PlayerProfile): void {
  save.profile = profile;
  save.profileCreated = true;
  if (save.scenarioSeed === undefined) {
    save.scenarioSeed = Math.floor(Math.random() * 1_000_000) + 1;
  }
  saveState(save);
}

export interface RoleSlotSummary {
  role: RoleId;
  exists: boolean;
  name: string;
  chapterCount: number;
  masteryPoints: number;
  campaignCompletions: number;
}

export function roleSlotSummaries(): RoleSlotSummary[] {
  return ROLE_IDS.map((role) => {
    const slot = readSlot(role);
    return {
      role,
      exists: Boolean(slot && slot.profileCreated),
      name: slot?.profile?.name ?? "",
      chapterCount: slot
        ? slot.chapterRecords.filter(
            (record) => record.completedNodeIds.length >= 2
          ).length
        : 0,
      masteryPoints: slot?.masteryPoints ?? 0,
      campaignCompletions: slot?.campaignCompletions ?? 0
    };
  });
}

export interface GlobalArchiveStats {
  savedRoles: number;
  completedRoles: number;
  totalMastery: number;
  totalChapters: number;
  totalDuels: number;
  totalTrials: number;
  uniqueAchievements: number;
}

/** 跨角色全局成就层：把三个存档槽的进度聚合成可见的档案资产。 */
export function globalArchiveStats(): GlobalArchiveStats {
  const slots = ROLE_IDS.map(readSlot).filter(
    (slot): slot is SaveState => Boolean(slot && slot.profileCreated)
  );
  const achievementIds = new Set<string>();
  for (const slot of slots) {
    for (const id of slot.achievements ?? []) {
      achievementIds.add(id);
    }
  }
  return {
    savedRoles: slots.length,
    completedRoles: slots.filter((slot) => (slot.campaignCompletions ?? 0) > 0)
      .length,
    totalMastery: slots.reduce((sum, slot) => sum + slot.masteryPoints, 0),
    totalChapters: slots.reduce(
      (sum, slot) =>
        sum +
        slot.chapterRecords.filter((record) => record.completedNodeIds.length >= 2)
          .length,
      0
    ),
    totalDuels: slots.reduce(
      (sum, slot) => sum + (slot.duelWins ?? 0) + (slot.duelLosses ?? 0),
      0
    ),
    totalTrials: slots.reduce(
      (sum, slot) => sum + (slot.trialCleared ?? []).length,
      0
    ),
    uniqueAchievements: achievementIds.size
  };
}

export function deleteRoleSlot(role: RoleId): void {
  try {
    localStorage.removeItem(roleSaveKey(role));
  } catch {
    // ignore
  }
  try {
    if (localStorage.getItem(ACTIVE_ROLE_KEY) === role) {
      localStorage.removeItem(ACTIVE_ROLE_KEY);
    }
  } catch {
    // ignore
  }
}

function boostLowestFocusAbility(save: SaveState): void {
  const focus = ROLES[save.profile.role].focusAbilities;
  if (focus.length === 0) {
    return;
  }
  const lowest = focus.reduce((a, b) =>
    save.profile.abilities[a] <= save.profile.abilities[b] ? a : b
  );
  save.profile.abilities[lowest] = clamp(
    save.profile.abilities[lowest] + 1,
    0,
    40
  );
}

export function applyStoryChoice(
  save: SaveState,
  nodeId: string,
  optionIndex: number
): ChoiceOutcome {
  // 已完成节点只能通过显式「重打」模式回看，不能再次结算，否则能力/资源/修炼点会被无限刷取。
  if (isNodeComplete(save, nodeId)) {
    throw new Error(`completed node cannot be resolved again: ${nodeId}`);
  }
  const node = getNode(nodeId);
  const option = node.options[optionIndex];
  const outcome = buildOutcome(save, option, optionIndex);

  const decisionRecord: DecisionRecord = {
    nodeId,
    optionIndex,
    quality: option.quality,
    qualityScore: outcome.qualityScore,
    chapterId: node.chapterId
  };
  save.decisionHistory.push(decisionRecord);
  if (save.decisionHistory.length > MAX_HISTORY_LENGTH) {
    save.decisionHistory = save.decisionHistory.slice(-MAX_HISTORY_LENGTH);
  }

  for (const [abilityId, gained] of Object.entries(option.effects) as Array<
    [AbilityId, number]
  >) {
    save.profile.abilities[abilityId] += gained;
  }
  for (const [resource, delta] of Object.entries(option.resources) as Array<
    [ResourceKey, number]
  >) {
    const effectiveDifficulty =
      save.difficulty !== "normal"
        ? save.difficulty
        : save.highPressureMode
          ? "pressure"
          : "normal";
    const factor = PRESSURE_FACTORS[effectiveDifficulty];
    const adjustedDelta =
      delta < 0
        ? Math.round(delta * factor.neg)
        : Math.round(delta * factor.pos);
    save.profile.resources[resource] = clamp(
      save.profile.resources[resource] + adjustedDelta,
      0,
      100
    );
  }
  if (option.quality === "expert") {
    save.profile.resources.trust = clamp(
      save.profile.resources.trust + 1,
      0,
      100
    );
    save.profile.resources.influence = clamp(
      save.profile.resources.influence + 1,
      0,
      100
    );
  } else if (option.quality === "partial") {
    save.profile.resources.influence = clamp(
      save.profile.resources.influence + 1,
      0,
      100
    );
  } else {
    save.profile.resources.capital = clamp(
      save.profile.resources.capital - 1,
      0,
      100
    );
  }

  save.playCount += 1;
  syncDerivedAchievements(save);
  if (node.kind === "side") {
    if (!save.completedSideQuests.includes(nodeId)) {
      save.completedSideQuests.push(nodeId);
      save.masteryPoints += 5;
      boostLowestFocusAbility(save);
    }
  } else if (node.kind === "branch") {
    if (!save.completedBranchNodes.includes(nodeId)) {
      save.completedBranchNodes.push(nodeId);
      save.masteryPoints += 5;
    }
  } else if (node.kind === "random") {
    if (!save.completedRandomEvents.includes(nodeId)) {
      save.completedRandomEvents.push(nodeId);
      save.masteryPoints += 5;
    }
  } else {
    const record =
      save.chapterRecords.find((item) => item.chapterId === node.chapterId) ??
      {
        chapterId: node.chapterId,
        completedNodeIds: [],
        stars: 0
      };
    if (!record.completedNodeIds.includes(nodeId)) {
      record.completedNodeIds.push(nodeId);
      record.stars += outcome.qualityScore;
    }
    if (!save.chapterRecords.some((item) => item.chapterId === node.chapterId)) {
      save.chapterRecords.push(record);
    }
    if (record.completedNodeIds.length >= 2) {
      const chapterAchievement = `chapter_${node.chapterId}`;
      const firstComplete = !save.achievements.includes(chapterAchievement);
      const passed = record.stars >= CHAPTER_PASS_STARS;
      if (firstComplete && passed) {
        save.masteryPoints += 10;
        save.achievements.push(chapterAchievement);
        if (node.chapterId === 9) {
          save.campaignCompletions = (save.campaignCompletions ?? 0) + 1;
        }
      }
      const nextChapter = node.chapterId + 1;
      if (
        passed &&
        nextChapter <= 9 &&
        !save.unlockedChapters.includes(nextChapter)
      ) {
        save.unlockedChapters.push(nextChapter);
      }
    }
  }

  save.trialEnergy = clamp(
    save.trialEnergy + (node.kind === "main" ? 5 : 3),
    0,
    100
  );
  save.achievements = [...new Set(save.achievements)];
  saveState(save);
  return outcome;
}

function buildOutcome(
  save: SaveState,
  option: StoryOption,
  optionIndex: number
): ChoiceOutcome {
  const gainedAbilityIds = (Object.entries(option.effects) as Array<
    [AbilityId, number]
  >)
    .filter(([, gained]) => gained > 0)
    .map(([id]) => id);
  const relevantLevel = Math.max(
    ...Object.keys(option.effects).map((id) =>
      abilityLevel(save.profile.abilities[id as AbilityId])
    ),
    1
  );
  const unlockBonus = relevantLevel >= 5 ? 14 : relevantLevel >= 3 ? 8 : 0;
  const strain = resourceStrainFor(save, option);
  return {
    option,
    optionIndex,
    gainedAbilityIds,
    resourceDeltas: option.resources,
    qualityScore: scoreQuality(
      option.quality,
      save.profile,
      unlockBonus,
      strain
    ),
    resourceStrain: strain
  };
}

export function scoreQuality(
  quality: OptionQuality,
  profile: PlayerProfile,
  abilityBonus = 0,
  strain = 0
): number {
  const base = quality === "expert" ? 100 : quality === "partial" ? 55 : 20;
  const best = bestAbilityLevel(profile) + abilityBonus;
  const roleFocus = ROLES[profile.role].focusAbilities;
  const roleBest = Math.max(
    ...roleFocus.map((id) => abilityLevel(profile.abilities[id]))
  );
  return Math.max(
    0,
    Math.round(
      base + Math.min(30, best * 3) + Math.min(12, roleBest * 2) - strain
    )
  );
}

function bestAbilityLevel(profile: PlayerProfile): number {
  return Math.max(...ABILITY_ORDER.map((id) => abilityLevel(profile.abilities[id])));
}

export type OptionGate =
  | { kind: "ok" }
  | {
      kind: "resource";
      resource: ResourceKey;
      needed: number;
      current: number;
    }
  | {
      kind: "ability";
      ability: AbilityId;
      needed: number;
      current: number;
    };

export function optionResourceRequirement(
  option: StoryOption
): Partial<Record<ResourceKey, number>> {
  const requirement: Partial<Record<ResourceKey, number>> = {};
  for (const [key, delta] of Object.entries(option.resources ?? {}) as Array<
    [ResourceKey, number]
  >) {
    if (delta < 0) requirement[key] = Math.abs(delta);
  }
  return requirement;
}

function effectiveDifficulty(
  save: SaveState
): "normal" | "pressure" | "extreme" {
  return save.difficulty !== "normal"
    ? save.difficulty
    : save.highPressureMode
      ? "pressure"
      : "normal";
}

export function optionGateFor(
  save: SaveState,
  option: StoryOption,
  chapterId: number
): OptionGate {
  const factor = PRESSURE_FACTORS[effectiveDifficulty(save)];
  for (const [key, needed] of Object.entries(
    optionResourceRequirement(option)
  ) as Array<[ResourceKey, number]>) {
    const current = save.profile.resources[key];
    const effectiveNeeded = Math.ceil(needed * factor.neg);
    if (current < effectiveNeeded) {
      return {
        kind: "resource",
        resource: key,
        needed: effectiveNeeded,
        current
      };
    }
  }
  if (option.quality === "expert") {
    const abilityIds = Object.keys(option.effects ?? {}) as AbilityId[];
    if (abilityIds.length > 0) {
      const gate =
        chapterId >= 8 ? 4 : chapterId >= 5 ? 3 : chapterId >= 2 ? 2 : 1;
      const best = Math.max(
        ...abilityIds.map((id) => abilityLevel(save.profile.abilities[id]))
      );
      if (best < gate) {
        const ability = abilityIds.reduce((a, b) =>
          abilityLevel(save.profile.abilities[a]) >=
          abilityLevel(save.profile.abilities[b])
            ? a
            : b
        );
        return {
          kind: "ability",
          ability,
          needed: gate,
          current: best
        };
      }
    }
  }
  return { kind: "ok" };
}

export function resourceStrainFor(
  save: SaveState,
  option: StoryOption
): number {
  const factor = PRESSURE_FACTORS[effectiveDifficulty(save)];
  let strain = 0;
  for (const [key, delta] of Object.entries(option.resources ?? {}) as Array<
    [ResourceKey, number]
  >) {
    if (delta >= 0) continue;
    const adjusted = Math.round(delta * factor.neg);
    const after = save.profile.resources[key] + adjusted;
    if (after < RESOURCE_STRAIN_HARD) strain += 15;
    else if (after < RESOURCE_STRAIN_SOFT) strain += 8;
  }
  return strain;
}

/** 导致下一章解锁的最低分数（一星）。 */
export const CHAPTER_PASS_STARS = 70;

export function chapterStarCount(stars: number): number {
  if (stars >= 200) return 3;
  if (stars >= 150) return 2;
  if (stars >= CHAPTER_PASS_STARS) return 1;
  return 0;
}

export function isChapterComplete(save: SaveState, chapterId: number): boolean {
  const record = save.chapterRecords.find((item) => item.chapterId === chapterId);
  return Boolean(record && record.completedNodeIds.length >= 2);
}

/** 章节是否达到一星门槛（可解锁下一章、可入座复盘）。 */
export function isChapterPassed(save: SaveState, chapterId: number): boolean {
  const record = save.chapterRecords.find((item) => item.chapterId === chapterId);
  return Boolean(
    record &&
      record.completedNodeIds.length >= 2 &&
      record.stars >= CHAPTER_PASS_STARS
  );
}

/** 已构成但未达一星的章节可重新冒险，清除该章节记录与决策历史后重新结算。 */
export function retryChapter(save: SaveState, chapterId: number): void {
  save.chapterRecords = save.chapterRecords.filter(
    (record) => record.chapterId !== chapterId
  );
  save.decisionHistory = save.decisionHistory.filter(
    (record) => record.chapterId !== chapterId
  );
  save.achievements = save.achievements.filter(
    (achievement) => achievement !== `chapter_${chapterId}`
  );
  saveState(save);
}

export function isNodeComplete(save: SaveState, nodeId: string): boolean {
  const node = getNode(nodeId);
  if (node.kind === "side") {
    return save.completedSideQuests.includes(nodeId);
  }
  if (node.kind === "branch") {
    return save.completedBranchNodes.includes(nodeId);
  }
  if (node.kind === "random") {
    return save.completedRandomEvents.includes(nodeId);
  }
  return Boolean(
    save.chapterRecords
      .find((record) => record.chapterId === node.chapterId)
      ?.completedNodeIds.includes(nodeId)
  );
}

export function profileSummary(save: SaveState) {
  const total = totalAbilityLevels(save.profile.abilities);
  const rank = rankForTotal(total);
  const chapterCount = save.chapterRecords.filter((record) =>
    isChapterComplete(save, record.chapterId)
  ).length;
  return {
    total,
    rank,
    chapterCount,
    abilityCount: ABILITY_ORDER.filter(
      (id) => abilityLevel(save.profile.abilities[id]) >= 2
    ).length
  };
}

export function recordDuelResult(
  save: SaveState,
  won: boolean,
  humanIsPlayerOne: boolean,
  scoreDelta: number,
  opponentName: string,
  playerScore: number,
  opponentScore: number
): SaveState {
  if (won) {
    save.duelWins += 1;
    save.masteryPoints += Math.max(1, Math.floor(scoreDelta / 25));
  } else {
    save.duelLosses += 1;
    save.masteryPoints += 1;
  }
  if (humanIsPlayerOne) {
    save.profile.resources.energy = clamp(
      save.profile.resources.energy + (won ? 5 : -5),
      0,
      100
    );
    save.profile.resources.influence = clamp(
      save.profile.resources.influence + (won ? 8 : -3),
      0,
      100
    );
    save.trialEnergy = clamp(
      save.trialEnergy + (won ? 15 : 5),
      0,
      100
    );
  }
  save.achievements.push("first_duel");
  save.achievements = [...new Set(save.achievements)];
  save.duelHistory.push({
    opponentName,
    playerScore,
    opponentScore,
    won,
    timestamp: Date.now()
  });
  if (save.duelHistory.length > MAX_HISTORY_LENGTH) {
    save.duelHistory = save.duelHistory.slice(-MAX_HISTORY_LENGTH);
  }
  save.bestScore = Math.max(save.bestScore ?? 0, playerScore);
  saveState(save);
  return save;
}

export interface TrainingOutcome {
  correct: number;
  total: number;
  gainedExp: number;
  firstComplete: boolean;
}

export function applyTrainingResult(
  save: SaveState,
  abilityId: AbilityId,
  correct: number,
  total: number
): TrainingOutcome {
  const firstComplete = !save.completedTraining.includes(abilityId);
  const gainedExp = firstComplete ? Math.min(6, Math.max(2, correct * 2)) : 0;
  if (firstComplete) {
    save.completedTraining.push(abilityId);
    save.profile.abilities[abilityId] += gainedExp;
    save.masteryPoints += Math.max(1, Math.min(4, correct));
    save.trialEnergy = clamp(save.trialEnergy + 10, 0, 100);
    save.achievements.push("training_first");
    if (save.completedTraining.length >= 4) {
      save.achievements.push("training_four");
    }
    if (save.completedTraining.length >= 10) {
      save.achievements.push("training_all");
    }
  } else {
    // 复习给小额能量，避免「二次零收益」，但不再提供能力经验。
    save.masteryPoints += 2;
    save.trialEnergy = clamp(save.trialEnergy + 6, 0, 100);
  }
  save.trainingScores[abilityId] = Math.max(
    save.trainingScores[abilityId] ?? 0,
    correct
  );
  save.achievements = [...new Set(save.achievements)];
  saveState(save);
  return { correct, total, gainedExp, firstComplete };
}

export interface TrialAnswerOutcome {
  cleared: boolean;
  correct: boolean;
  energyChange: number;
  gainedExp: number;
  item?: string;
}

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function applyDailyTrialRecovery(save: SaveState): boolean {
  const today = todayDateKey();
  if (save.lastTrialEnergyDate === today) {
    return false;
  }
  const stageBonus = Math.min(20, save.trialCleared.length);
  const acceleratorBonus = save.trialAcceleratorLevel * 20;
  save.trialEnergy = clamp(
    save.trialEnergy + 50 + stageBonus + acceleratorBonus,
    0,
    100
  );
  save.trialHp = clamp(save.trialHp + 50, 0, 100);
  save.lastTrialEnergyDate = today;
  saveState(save);
  return true;
}

/** 主线资源（精力、信任、影响力、组织资源）每日低额恢复一次，让资源环有可感知的恢复路径。 */
export function applyDailyResourceRecovery(save: SaveState): boolean {
  const today = todayDateKey();
  if (save.lastResourceDate === today) {
    return false;
  }
  save.profile.resources.energy = clamp(
    save.profile.resources.energy + 10,
    0,
    100
  );
  save.profile.resources.trust = clamp(
    save.profile.resources.trust + 4,
    0,
    100
  );
  save.profile.resources.influence = clamp(
    save.profile.resources.influence + 3,
    0,
    100
  );
  save.profile.resources.capital = clamp(
    save.profile.resources.capital + 3,
    0,
    100
  );
  save.lastResourceDate = today;
  saveState(save);
  return true;
}

/** 随机事件全部完成后扭动事件池，重新可接触并给一次小奖励。 */
export function rotateRandomEventPool(save: SaveState): boolean {
  if (save.completedRandomEvents.length < randomEventEligibleCount(save)) {
    return false;
  }
  save.completedRandomEvents = [];
  save.randomEventCycle = (save.randomEventCycle ?? 0) + 1;
  save.masteryPoints += save.randomEventCycle >= 2 ? 8 : 5;
  save.achievements.push("random_rotation");
  if (save.randomEventCycle >= 2) {
    save.achievements.push("random_rotation_2");
  }
  save.achievements = [...new Set(save.achievements)];
  saveState(save);
  return true;
}

export function buyTrialEnergy(
  save: SaveState,
  cost = 15,
  amount = 30
): boolean {
  if (save.profile.resources.capital < cost || save.trialEnergy >= 100) {
    return false;
  }
  save.profile.resources.capital = clamp(
    save.profile.resources.capital - cost,
    0,
    100
  );
  save.trialEnergy = clamp(save.trialEnergy + amount, 0, 100);
  saveState(save);
  return true;
}

export function buyTrialEnergyWithInfluence(
  save: SaveState,
  cost = 25,
  amount = 30
): boolean {
  if (
    save.profile.resources.influence < cost ||
    save.trialEnergy >= 100
  ) {
    return false;
  }
  save.profile.resources.influence = clamp(
    save.profile.resources.influence - cost,
    0,
    100
  );
  save.trialEnergy = clamp(save.trialEnergy + amount, 0, 100);
  saveState(save);
  return true;
}

export function investTrialAccelerator(
  save: SaveState,
  baseCost = 40
): boolean {
  if (
    save.trialAcceleratorLevel >= 3
  ) {
    return false;
  }
  const cost = baseCost + save.trialAcceleratorLevel * 20;
  if (save.profile.resources.capital < cost) {
    return false;
  }
  save.profile.resources.capital = clamp(
    save.profile.resources.capital - cost,
    0,
    100
  );
  save.trialAccelerator = true;
  save.trialAcceleratorLevel += 1;
  saveState(save);
  return true;
}

export function hireTrialAlly(save: SaveState, cost = 20): boolean {
  if (
    save.trialItems.includes("临时同伴") ||
    save.profile.resources.trust < cost
  ) {
    return false;
  }
  save.profile.resources.trust = clamp(
    save.profile.resources.trust - cost,
    0,
    100
  );
  save.trialItems.push("临时同伴");
  saveState(save);
  return true;
}

export function submitTrialSummary(
  save: SaveState,
  stageId: string,
  summary: string
): boolean {
  if (!summary.trim()) {
    return false;
  }
  save.trialOpenAnswers[stageId] = summary.trim();
  saveState(save);
  return true;
}

export function recordHiddenRoute(
  save: SaveState,
  routeId: string
): void {
  if (!save.hiddenRoutes.includes(routeId)) {
    save.hiddenRoutes.push(routeId);
    save.achievements.push("hidden_route");
    save.achievements = [...new Set(save.achievements)];
  }
  saveState(save);
}

export function recordAlternateEnding(
  save: SaveState,
  endingId: string
): void {
  if (!save.alternateEndings.includes(endingId)) {
    save.alternateEndings.push(endingId);
  }
  saveState(save);
}

export function applyTrialAnswer(
  save: SaveState,
  stageId: string,
  abilityId: AbilityId,
  correct: boolean,
  staminaCost: number,
  rewardExp: number,
  rewardItem?: string,
  resourceCost = 0,
  wrongPenalty = 6,
  hpCost = 0,
  dimension?: LeadershipDimension
): TrialAnswerOutcome {
  const cleared = correct && !save.trialCleared.includes(stageId);
  const energyChange = -(staminaCost + (correct ? 0 : wrongPenalty));
  if (resourceCost > 0) {
    save.profile.resources.capital = clamp(
      save.profile.resources.capital - resourceCost,
      0,
      100
    );
  }
  save.trialEnergy = clamp(save.trialEnergy + energyChange, 0, 100);
  save.trialHp = clamp(
    save.trialHp + (correct ? 20 : -hpCost),
    0,
    100
  );
  if (cleared) {
    save.trialCleared.push(stageId);
    save.profile.abilities[abilityId] += rewardExp;
    if (rewardItem) {
      save.trialItems.push(rewardItem);
    }
    save.masteryPoints += 2;
    save.trialStreak += 1;
    save.achievements.push("trial_first");
    if (save.trialCleared.length >= 5) save.achievements.push("trial_five");
    if (save.trialCleared.length >= 19) save.achievements.push("trial_all");
    if (stageId.startsWith("mba_")) save.achievements.push("mba_clear");
    if (dimension) {
      addDimensionExp(save, dimension, 2);
    }
  } else {
    save.trialStreak = 0;
    save.masteryPoints += 1;
  }
  applyMoraleChange(save, correct ? 5 : -4);
  save.achievements = [...new Set(save.achievements)];
  saveState(save);
  return {
    cleared,
    correct,
    energyChange,
    gainedExp: cleared ? rewardExp : 0,
    item: cleared ? rewardItem : undefined
  };
}

export function completePracticeTask(
  save: SaveState,
  taskId: string,
  abilityId: AbilityId,
  rewardEnergy: number,
  rewardExp: number
): boolean {
  if (save.completedPracticeTasks.includes(taskId)) {
    // 修炼任务可重复练习，重复练习只给小额能量，不再增加能力经验。
    save.trialEnergy = clamp(
      save.trialEnergy + Math.max(3, Math.floor(rewardEnergy / 2)),
      0,
      100
    );
    saveState(save);
    return true;
  }
  save.completedPracticeTasks.push(taskId);
  save.trialEnergy = clamp(save.trialEnergy + rewardEnergy, 0, 100);
  save.profile.abilities[abilityId] += rewardExp;
  save.masteryPoints += 1;
  saveState(save);
  return true;
}

export function decisionProfile(save: SaveState): {
  identity: string;
  counts: { expert: number; partial: number; risk: number };
  totalScore: number;
} {
  const counts = { expert: 0, partial: 0, risk: 0 };
  let totalScore = 0;
  for (const record of save.decisionHistory) {
    counts[record.quality] += 1;
    totalScore += record.qualityScore;
  }
  const total = Math.max(1, save.decisionHistory.length);
  const expertRatio = counts.expert / total;
  const partialRatio = counts.partial / total;
  const riskRatio = counts.risk / total;
  let identity = "平衡型领导者";
  if (save.decisionHistory.length < 3) {
    identity = "观察期决策者";
  } else if (expertRatio >= 0.7) {
    identity = "精准决策者";
  } else if (riskRatio >= 0.35) {
    identity = "高压破局者";
  } else if (partialRatio >= 0.6) {
    identity = "渐进探索者";
  }
  return { identity, counts, totalScore };
}

export function buildDuelProfile(
  profile: PlayerProfile,
  name?: string,
  color = "#41c7c0"
) {
  return {
    name: name || profile.name,
    role: profile.role,
    abilities: { ...profile.abilities },
    resources: { ...profile.resources },
    color,
    isHuman: true
  };
}

export function buildAiProfile(
  role: RoleId,
  strength: number,
  playerAbilities?: Record<AbilityId, number>,
  archetype?: import("./types").AiArchetype
) {
  const base = createDefaultAbilities();
  let state = (strength * 1009 + role.charCodeAt(0) * 31 + 12345) >>> 0;
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const playerMean = playerAbilities
    ? ABILITY_ORDER.reduce((sum, id) => sum + (playerAbilities[id] ?? 0), 0) /
      ABILITY_ORDER.length
    : 6 + strength * 2;
  const scale = 0.55 + strength * 0.22;
  for (const id of ABILITY_ORDER) {
    const jitter = (rand() - 0.5) * (4 + strength * 2);
    base[id] = Math.round(clamp(playerMean * scale + jitter, 0, 40));
  }
  const roleDef = ROLES[role];
  for (const [id, exp] of Object.entries(roleDef.startingAbilities) as Array<
    [AbilityId, number]
  >) {
    base[id] = clamp(base[id] + exp + strength, 0, 40);
  }
  return {
    name: roleDef.shortName + "陪练",
    role,
    abilities: base,
    resources: { energy: 75, trust: 45, influence: 50, capital: 40 },
    color: "#e9826c",
    isHuman: false,
    strength: Math.max(0, Math.min(5, strength)),
    archetype: archetype ?? "builder"
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function abilityLabel(id: AbilityId): string {
  return ABILITIES[id].name;
}

export function optionQualityLabel(quality: OptionQuality): string {
  if (quality === "expert") return "专家级应对";
  if (quality === "partial") return "部分有效";
  return "高风险应对";
}

export type CloudConflictResolution =
  | "local-newer"
  | "remote-newer"
  | "conflict"
  | "equal"
  | "no-remote";

/**
 * 云端同步冲突判定：用「时间戳 + 内容哈希」双校验。
 * 相比原先只比 playCount，能在「同一游玩次数但内容不同」时正确识别冲突，
 * 避免本地无脑覆盖远端进度。
 */
export function resolveCloudConflict(
  local: SaveState | null,
  remote: SaveState | null
): CloudConflictResolution {
  if (!remote) return "no-remote";
  if (!local) return "remote-newer";
  const localTime = local.lastSavedAt ?? 0;
  const remoteTime = remote.lastSavedAt ?? 0;
  if (remoteTime > localTime) return "remote-newer";
  if (localTime > remoteTime) return "local-newer";
  // 时间戳相同或缺失 → 退化为内容哈希 / playCount
  if (local.saveHash && remote.saveHash) {
    return local.saveHash === remote.saveHash ? "equal" : "conflict";
  }
  if (remote.playCount > local.playCount) return "remote-newer";
  if (local.playCount > remote.playCount) return "local-newer";
  return "conflict";
}
