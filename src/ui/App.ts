import {
  ABILITIES,
  ABILITY_ORDER,
  ROLES,
  RESOURCE_NAMES,
  abilityLevel,
  rankForTotal,
  totalAbilityLevels
} from "../core/abilities";
import {
  ACHIEVEMENTS,
  achievementCategory,
  achievementLore,
  achievementProgress,
  achievementRarity,
  isAchievementUnlocked,
  type AchievementCategory,
  type AchievementRarity,
  unlockedCount
} from "../core/achievements";
import {
  aiArchetype,
  aiOpponentRole,
  DuelEngine,
  DUEL_ROUND_TIMEOUT_MS,
  type DuelSnapshot,
  duelSeed,
  recommendedTraining
} from "../core/duel";
import {
  activateProfile,
  applyDailyResourceRecovery,
  applyStoryChoice,
  applyTrainingResult,
  applyTrialAnswer,
  applyDailyTrialRecovery,
  buyTrialEnergy,
  buyTrialEnergyWithInfluence,
  completePracticeTask,
  hireTrialAlly,
  investTrialAccelerator,
  recordAlternateEnding,
  recordHiddenRoute,
  submitTrialSummary,
  buildAiProfile,
  buildDuelProfile,
  chapterStarCount,
  clamp,
  consumeCorruptSaveNotice,
  createProfile,
  decisionProfile,
  deleteRoleSlot,
  globalArchiveStats,
  importSaveJson,
  isChapterComplete,
  isChapterPassed,
  isNodeComplete,
  loadSave,
  optionGateFor,
  optionQualityLabel,
  profileSummary,
  recordDuelResult,
  resetSave,
  decisionWindowMs,
  DEFAULT_SAVE,
  normalizeVolume,
  retryChapter,
  resolveCloudConflict,
  roleSlotSummaries,
  rotateRandomEventPool,
  roundDurationMsForDifficulty,
  saveState,
  scoreQuality
} from "../core/game";
import {
  CHAPTERS,
  forkNodeForRoute,
  NODE_INTEL,
  RANDOM_EVENT_IDS,
  RANDOM_EVENT_META,
  randomEventEligibleCount,
  nextRandomEvent,
  SIDE_QUEST_ARCS,
  getChapter,
  getNode,
  getNodeForRole,
  sideNodesForChapter
} from "../core/story";
import { chapterNarrative } from "../core/chapterNarrative";
import type {
  AbilityId,
  ChoiceOutcome,
  OptionQuality,
  PlayerProfile,
  ResourceKey,
  RoleId,
  SaveState,
  StoryNode
} from "../core/types";
import { ManualRtcPeer, type RtcMessage } from "../net/rtc";
import { RoomClient, type RoomServerMessage } from "../net/roomClient";
import { GameAudioV2 } from "../audio-v2";
import { ThemeMusic } from "../core/theme-music";
import {
  stageForChapter,
  reconMoments
} from "../core/expedition";
import { npcStoryFor } from "../core/npcStories";
import {
  LeadershipGamesApp,
  type LeadershipGameId
} from "./leadership-games";
import { TeamAcademyApp } from "./team-academy";
import {
  LEADERSHIP_DIMENSIONS,
  dimensionLevel
} from "../core/leadership-model";
import {
  CoachWorkshopEngine,
  LiveScenarioRunner,
  type WorkshopReport
} from "../core/coach-workshop";
import {
  CHALLENGE_TITLES,
  GOAL_TITLES,
  generateCoachPlan,
  type CoachChallenge,
  type CoachGoal,
  type CoachPlan
} from "../core/coach-plan";
import { scenarioCoachHint } from "../core/coach-hints";
import {
  ASSESSMENT_QUESTIONS,
  certificationLevel
} from "../core/assessment";
import { NPCS, npcRelation } from "../core/npcs";
import {
  dailyChallenges,
  todayKey,
  weekEndsAt,
  weekKey,
  weeklyChallenges
} from "../core/challenges";
import { scoreTrainingAnswers } from "../core/training";
import {
  EXPANDED_TRAINING,
  type ExpandedAbilityTraining
} from "../core/trainingExtras";
import {
  EXPANDED_TRAINING_EN,
  type ExpandedAbilityTrainingEn
} from "../core/trainingExtrasEn";
import {
  PRACTICE_TASKS,
  TRIAL_STAGES,
  canEnterTrial,
  scoreOpenText,
  trialCostFor,
  trialQuestionFor,
  trialRewardExpFor,
  trialStageLabel,
  type TrialStageDef
} from "../core/trials";
import { hiddenRouteSteps } from "../core/hiddenRoutes";
import { ROLE_ROADMAPS } from "../core/roleTraining";
import { uiString, type Language } from "../core/i18n";
import { readAnalyticsEvents, trackEvent } from "../core/analytics";
import {
  ABILITY_EN,
  ABILITY_DETAIL_EN,
  CHAPTER_EN,
  NPC_EN,
  RESOURCE_EN,
  ROLE_EN,
  SIDE_ARC_EN
} from "../core/translations";
import { rankName, chapterDisplay, abilityDisplay, abilityDetailDisplay, roleDisplay, resourceDisplay, qualityLabel, npcDisplay, relationStatusText, sideArcDisplay, npcAvatarColor, achievementDisplay, challengeDisplay, challengeCategoryLabel, assessmentDisplay, chapterReflectionText, aiArchetypeLabel, leadershipLensText, roleMove, nodeIntel, relationNoteText, resourceChips, chapterBadge, dimensionMarkup } from "./display";
import { buildReportMarkdown, downloadText, encodeSaveLink } from "./export";
import { artAsset, chapterArtStyle } from "./assets";
import { storyNodeDisplay } from "./nodeView";
import { escapeAttr, escapeHtml, formatDelta } from "./escape";
import {
  chapterTrainingMarkup,
  expeditionHeroMarkup,
  npcCameoMarkup,
  npcStoryMarkup,
  optionCostSummary,
  primaryAbilityForOption,
  storyOptionOrder
} from "./storyMarkup";
import { renderAbilityRadar, renderGroupRadar } from "./charts";
import { renderPowerBoard } from "./art";
import { renderTrainingBoard } from "./trainingArt";
import {
  proceduralNarrativeFor,
  scenarioShellFor
} from "../core/scenarioShell";
import {
  dueReviewCards,
  dualAxisQuality,
  recordReviewResult,
  reviewBoard,
  reviewStats,
  scheduleMissedDecision,
  scoreDualAxis,
  worstOptionIndex,
  type DualAxisOutcome
} from "../core/review-schedule";
import {
  createCustomScenario,
  customScenarioToNode,
  exportCustomScenarios,
  importCustomScenarios,
  loadCustomScenarios,
  saveCustomScenarios,
  validateCustomScenario,
  type CustomScenario
} from "../core/custom-scenarios";
import {
  renderPowerSandbox,
  renderRelationGraph
} from "./relationsArt";

const ONLINE_ENABLED = import.meta.env.VITE_ENABLE_ONLINE === "true";
const DUEL_SNAPSHOT_KEY = "adaptive-ascent-duel-snapshot-v1";
const SAVE_BACKUP_HINT_KEY = "adaptive-ascent-backup-hint-dismissed";
const SETTINGS_MIGRATION_KEY = "adaptive-ascent-settings-v2";
const GUIDE_KEY = "adaptive-ascent-guide-v1";
const GUIDE_REWARD_KEY = "adaptive-ascent-guide-reward";
const ACHIEVEMENT_FAVORITE_KEY = "adaptive-ascent-achievement-favorites";
const APP_VERSION = "1.7.36";

type View =
  | "menu"
  | "profile"
  | "assessment"
  | "assessmentResult"
  | "achievements"
  | "relations"
  | "settings"
  | "map"
  | "story"
  | "leadershipGames"
  | "dualReview"
  | "customScenarios"
  | "customScenarioPlay"
  | "teamAcademy"
  | "chapterTransition"
  | "ability"
  | "report"
  | "ending"
  | "hiddenBranch"
  | "training"
  | "coach"
  | "trial"
  | "trialBattle"
  | "duelLobby"
  | "duel";

type DuelMode = "ai" | "local" | "remote";
type DuelQuality = "expert" | "partial" | "risk";

export class AdaptiveGameApp {
  private root: HTMLElement;
  private audio = new GameAudioV2();
  private themeMusic = new ThemeMusic();
  private themeMusicPlaying = false;
  private coachEngine = new CoachWorkshopEngine();
  private coachReport?: WorkshopReport;
  private coachPlan?: CoachPlan;
  private coachGoal?: CoachGoal;
  private coachChallenge?: CoachChallenge;
  private coachPlanStep: "goal" | "challenge" | "plan" = "goal";
  private coachPlanChecks: Record<string, boolean> = {};
  private muted = localStorage.getItem("adaptive-ascent-muted") === "1";
  private musicMuted =
    localStorage.getItem("adaptive-ascent-music") === "1";
  private musicVolume = normalizeVolume(
    Number(localStorage.getItem("adaptive-ascent-music-volume") || 60)
  );
  private sfxVolume = normalizeVolume(
    Number(localStorage.getItem("adaptive-ascent-sfx-volume") || 90)
  );
  private fontScale = Number(
    localStorage.getItem("adaptive-ascent-font-scale") || 1
  );
  private favoriteAchievements = new Set<string>(
    (() => {
      try {
        const parsed = JSON.parse(
          localStorage.getItem(ACHIEVEMENT_FAVORITE_KEY) || "[]"
        ) as unknown;
        return Array.isArray(parsed)
          ? parsed.filter((item): item is string => typeof item === "string")
          : [];
      } catch {
        return [];
      }
    })()
  );
  private language: Language =
    localStorage.getItem("adaptive-ascent-lang") === "en" ? "en" : "zh";
  private save: SaveState;
  private view: View = "menu";
  private pendingRole: RoleId = "parachute";
  private pendingProfile?: PlayerProfile;
  private assessmentStep = 0;
  private assessmentAnswers: number[] = [];
  private selectedChapter = 1;
  private mapDetailOpen = false;
  private trainingAbilityId: AbilityId = "insight";
  private trainingStage: "story" | "quiz" | "result" = "story";
  private trainingStep = 0;
  private trainingAnswers: number[] = [];
  private trainingReturnView: View = "ability";
  private activeTrialId?: string;
  private trialAnswerResult?: ReturnType<typeof applyTrialAnswer>;
  private lastTrialAnswer?: number;
  private trialObserveRevealed = false;
  private trialAllyChoice?: string;
  private trialAllyCorrect?: boolean;
  private trialSuspectChoice?: string;
  private trialSuspectCorrect?: boolean;
  private trialIntelChoice?: string;
  private trialIntelCorrect?: boolean;
  private trialBetrayalChoice?: string;
  private trialBetrayalCorrect?: boolean;
  private trialFactionTrust = 50;
  private trialFactionSuspicion = 50;
  private trialFollowUpAnswer?: number;
  private trialFollowUpAnswered = false;
  private trialSummaryPending = false;
  private trialSummaryKeywordCorrect?: boolean;
  private trialCalculationAnswer?: string;
  private trialCalculationCorrect?: boolean;
  private activePracticeTaskId?: string;
  private trainingResult?: {
    correct: number;
    total: number;
    gainedExp: number;
    firstComplete: boolean;
    answered: boolean[];
  };
  private storyNodeId?: string;
  private storyHintRevealed = false;
  private replayMode = false;
  private integrityGateNodeId?: string;
  private pendingIntegrityOption?: number;
  private integrityGateMode: "cost" | "ability" = "cost";
  private leadershipGames?: LeadershipGamesApp;
  private teamAcademy?: TeamAcademyApp;
  private wrongReviewQueue: string[] = [];
  private wrongReviewIndex = 0;
  private dualReviewQueue: string[] = [];
  private dualReviewIndex = 0;
  private dualBestIndex?: number;
  private dualWorstIndex?: number;
  private dualSubmitted = false;
  private dualLastOutcome?: DualAxisOutcome;
  private customScenarios: CustomScenario[] = [];
  private customPlayId?: string;
  private customPlayResult?: number;
  private liveRunner = new LiveScenarioRunner();
  private liveSessionId?: string;
  private liveNode?: StoryNode;
  private livePendingOption = 0;
  private liveName = "";
  private liveRevealed = false;
  private liveDistribution?: Map<number, number>;
  private hiddenBranchAbilityId?: AbilityId;
  private hiddenRouteStep = 0;
  private hiddenRouteLastAnswer?: number;
  private hiddenRouteLastCorrect?: boolean;
  private endingChoice?: string;
  private pendingBranchNodeId?: string;
  private pendingChapterTransition?: number;
  private pendingForkNodeId?: string;
  private lastUnlockedAchievement?: string;
  private lastOutcome?: ChoiceOutcome;
  private lastOutcomeNodeId?: string;
  private duelMode: DuelMode = "ai";
  private duelRounds = 3;
  private duelRematchAction: "ai" | "local" | undefined = undefined;
  private duelEngine?: DuelEngine;
  private hotSeatTurn: 0 | 1 = 0;
  private localPassed = false;
  private remotePeer?: ManualRtcPeer;
  private remotePlayerIndex: 0 | 1 = 0;
  private remoteOpponentName =
    this.language === "en" ? "Waiting for opponent" : "等待对手";
  private remoteOpponentReady = false;
  private remoteOpponentPicked = false;
  private remoteOwnOption?: number;
  private remoteOpponentAbilities: Record<AbilityId, number> = {
    insight: 2,
    deploy: 2,
    mobilize: 2,
    strategy: 2,
    authority: 2,
    stability: 2,
    recovery: 2,
    execution: 2,
    structure: 2,
    communication: 2
  };
  private remoteOpponentResources = {
    energy: 75,
    trust: 55,
    influence: 45,
    capital: 40
  } as Record<ResourceKey, number>;
  private remoteInviteCode = "";
  private remoteAnswerCode = "";
  private remoteStatus =
    this.language === "en" ? "Not connected" : "尚未建立连接";
  private duelRecorded = false;
  private duelRevealing = false;
  private duelRevealTimer?: number;
  private duelPrediction?: DuelQuality;
  private duelPredictionPhase = false;
  private duelPredictionCorrect?: boolean;
  private duelPredictionHistory: boolean[] = [];
  private duelPredictionBonusTotal = 0;
  private duelRoundResult?: DuelEngine["roundResults"][number];
  private duelRoundResultTimer?: number;
  private duelRoundTimerId?: number;
  private duelRoundTickId?: number;
  private duelRoundDeadline = 0;
  private duelTimedOutThisRound = false;
  private duelWarningPlayed = new Set<number>();
  private resourceRecoveryNote = false;
  private roomClient?: RoomClient;
  private cloudToken = localStorage.getItem("adaptive-ascent-cloud-token") || "";
  private cloudRecoveryCode =
    localStorage.getItem("adaptive-ascent-recovery-code") || "";
  private cloudStatus =
    this.language === "en" ? "Cloud not connected" : "未连接云端";
  private cloudEntries: Array<{
    name: string;
    role: string;
    score: number;
    percentile?: number;
  }> = [];
  private pendingCloudAction: "sync" | "load" | "match" = "sync";
  private usingCloudMatch = false;
  private lastRoomId =
    localStorage.getItem("adaptive-ascent-room-id") || "";
  private cloudConflict = false;
  private cloudRemoteSave?: SaveState;
  private cloudAccountName?: string;
  // 高压/极限模式的回合时限与突发干扰状态
  private roundTimerId?: number;
  private roundDeadline = 0;
  private roundDurationMs = 0;
  private activeDecisionNodeId?: string;
  private interferenceText?: string;
  private lastTimedOut = false;
  private energyRestoreUsed = false;
  private lastEnergyRestoreChapter = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    document.querySelector("#app-loading")?.remove();
    document.documentElement.classList.toggle("online-off", !ONLINE_ENABLED);
    document.documentElement.lang = this.language;
    this.audio.setMuted(this.muted);
    if (localStorage.getItem(SETTINGS_MIGRATION_KEY) !== "1") {
      if (this.musicVolume === 0) this.musicVolume = 60;
      if (this.sfxVolume === 0) this.sfxVolume = 90;
      localStorage.setItem("adaptive-ascent-music-volume", String(this.musicVolume));
      localStorage.setItem("adaptive-ascent-sfx-volume", String(this.sfxVolume));
      localStorage.setItem(SETTINGS_MIGRATION_KEY, "1");
    }
    this.audio.setSfxVolume(this.sfxVolume);
    document.documentElement.style.fontSize = `${this.fontScale * 100}%`;
    this.save = loadSave();
    if (this.save.profileCreated) {
      this.resourceRecoveryNote = applyDailyResourceRecovery(this.save);
    }
    trackEvent("session_start", { language: this.language });
    const corruptSave = consumeCorruptSaveNotice();
    if (corruptSave) {
      window.setTimeout(() => {
        window.alert(
          this.language === "en"
            ? "Local save was damaged. A backup was restored when possible. Export your progress now to avoid losing it."
            : "检测到本地存档损坏，已尽可能恢复备份。请立即导出当前进度，避免丢失。"
        );
      }, 0);
    }
    this.restoreFromHash();
    this.root.addEventListener("click", (event) => this.handleClick(event));
    this.root.addEventListener("submit", (event) => this.handleSubmit(event));
    this.root.addEventListener("change", (event) => this.handleChange(event));
    document.addEventListener("keydown", (event) => this.handleShortcut(event));
    this.customScenarios = loadCustomScenarios();
    this.show("menu");
    // 只有真实菜单渲染完成后才算 ready：放在构造函数开头会让初始化中途抛异常时
    // 也被标记为就绪，index.html 里那段 5 秒 loading 兜底就会失效。
    document.body.setAttribute("data-app-ready", "1");
  }

  /** 显式保存入口：写失败时立刻提醒玩家导出，避免静默丢档。 */
  private persistSave(): boolean {
    const ok = saveState(this.save);
    if (!ok) {
      window.alert(
        this.language === "en"
          ? "Save failed. Export your progress before continuing."
          : "存档写入失败，请先导出进度再继续。"
      );
    }
    return ok;
  }

  /** 轻量全局 toast：状态变化后给出可见且读屏可感知的确认。 */
  private showToast(message: string): void {
    const existing = document.querySelector<HTMLElement>("#app-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = "app-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => {
      toast.classList.add("app-toast-hide");
      window.setTimeout(() => toast.remove(), 300);
    }, 2400);
  }

  private handleShortcut(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable)
    ) {
      return;
    }
    const key = event.key.toLowerCase();
    const routes: Record<string, View> = {
      h: "menu",
      m: "map",
      a: "ability",
      r: "report",
      d: "duelLobby"
    };
    const view = routes[key];
    if (!view) return;
    if (view === "map" && !this.save.profileCreated) return;
    event.preventDefault();
    this.audio.unlock();
    this.audio.ensure();
    this.audio.startAmbientIfIdle();
    this.audio.ui();
    this.show(view);
  }

  private restoreFromHash(): void {
    const match = location.hash.match(/^#save=(.+)$/);
    if (!match) {
      return;
    }
    try {
      const encoded = match[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = encoded.padEnd(
        encoded.length + ((4 - (encoded.length % 4)) % 4),
        "="
      );
      const json = decodeURIComponent(atob(padded));
      this.save = importSaveJson(json);
      history.replaceState(null, "", location.pathname);
    } catch {
      history.replaceState(null, "", location.pathname);
    }
  }

  private stopRoundTimer(): void {
    if (this.roundTimerId !== undefined) {
      window.clearInterval(this.roundTimerId);
      this.roundTimerId = undefined;
    }
  }

  /**
   * 启动当前决策回合的时限计时器（高压/极限档有效，标准档不计时）。
   * 按 effectiveDifficulty 取时长：pressure=22s，extreme=14s，normal=0（不计时）。
   * 倒计时通过 #round-timer 元素实时显示；归零时停止计时并施加轻量后果。
   */
  private startRoundTimer(): void {
    this.stopRoundTimer();
    this.lastTimedOut = false;
    let scenarioText = "";
    try {
      const nodeId = this.storyNodeId;
      if (nodeId) {
        const node = storyNodeDisplay(this.language, this.save,
          getNodeForRole(this.save.profile.role, nodeId)
        );
        scenarioText = [
          node.context,
          node.stake,
          ...node.options.map((option) => `${option.label} ${option.summary}`)
        ].join(" ");
      }
    } catch {
      scenarioText = "";
    }
    this.roundDurationMs = decisionWindowMs(
      roundDurationMsForDifficulty(this.save.difficulty),
      scenarioText
    );
    if (this.roundDurationMs <= 0) {
      this.roundDeadline = 0;
      this.updateRoundTimerDisplay();
      return;
    }
    this.roundDeadline = Date.now() + this.roundDurationMs;
    this.updateRoundTimerDisplay();
    this.roundTimerId = window.setInterval(() => {
      const remaining = this.roundDeadline - Date.now();
      if (remaining <= 0) {
        this.stopRoundTimer();
        this.handleRoundTimeout();
      } else {
        this.updateRoundTimerDisplay();
      }
    }, 250);
  }

  /** 把剩余秒数写进 #round-timer（标准档隐藏）。无该元素时静默跳过。 */
  private updateRoundTimerDisplay(): void {
    const el = this.root.querySelector<HTMLElement>("#round-timer");
    if (!el) return;
    if (this.roundDurationMs <= 0) {
      el.textContent = "";
      el.style.display = "none";
      return;
    }
    const seconds = Math.ceil(Math.max(0, this.roundDeadline - Date.now()) / 1000);
    el.style.display = "";
    el.classList.toggle("urgent", seconds <= 10);
    el.textContent = `${this.t("roundTimer")}：${seconds}s`;
  }

  /**
   * 回合超时处理：停止计时，并施加一个轻量且安全的后果——
   * 自动采用当前最稳妥的选项应对（复用 applyStoryChoice 的资源结算机制），
   * 不引入新的崩溃路径。同时给出"超时"反馈（timedOutNote）。
   */
  private handleRoundTimeout(): void {
    if (this.lastTimedOut || !this.storyNodeId) return;
    this.lastTimedOut = true;
    const node = getNodeForRole(this.save.profile.role, this.storyNodeId);
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;
    node.options.forEach((option, index) => {
      const score = scoreQuality(option.quality, this.save.profile);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    this.resolveStoryOption(bestIndex);
  }

  show(view: View): void {
    this.stopRoundTimer();
    if (view !== "duel") {
      this.stopDuelRoundTimer();
    }
    this.view = view;
    window.scrollTo(0, 0);
    const scene =
      view === "story"
        ? "story"
        : view === "leadershipGames"
          ? "menu"
        : view === "dualReview"
          ? "menu"
        : view === "customScenarios" || view === "customScenarioPlay"
          ? "menu"
        : view === "teamAcademy"
          ? "menu"
        : view === "duel"
          ? "duel"
          : view === "training" || view === "trial" || view === "trialBattle"
            ? "training"
            : view === "ending"
              ? "victory"
              : "menu";
    this.audio.setAmbientScene(scene);
    if (view === "ending") {
      if (!this.themeMusicPlaying) {
        this.themeMusic.play();
        this.themeMusicPlaying = true;
      }
    } else if (this.themeMusicPlaying) {
      this.themeMusic.stop();
      this.themeMusicPlaying = false;
    }
    this.render();
  }

  private stopDuelRoundTimer(): void {
    if (this.duelRoundTimerId !== undefined) {
      window.clearTimeout(this.duelRoundTimerId);
      this.duelRoundTimerId = undefined;
    }
    if (this.duelRoundTickId !== undefined) {
      window.clearInterval(this.duelRoundTickId);
      this.duelRoundTickId = undefined;
    }
  }

  private t(key: Parameters<typeof uiString>[1]): string {
    return uiString(this.language, key);
  }


  private explorationPanelMarkup(node: StoryNode): string {
    const en = this.language === "en";
    const seed = this.save.scenarioSeed ?? 1;
    const moments = reconMoments(node.chapterId, node.id, seed);
    const found = this.save.explorationFound?.[node.id] ?? [];
    const doneAll = (this.save.explorationCompleted ?? []).includes(node.id);
    const actions = moments
      .map((moment) => {
        const done = found.includes(moment.kind);
        return `
          <button
            class="exploration-action ${done ? "done" : ""}"
            data-action="expedition-explore"
            data-kind="${moment.kind}"
            ${done ? "disabled" : ""}
          >${done ? "✓ " : ""}${escapeHtml(en ? moment.titleEn : moment.titleZh)}</button>
        `;
      })
      .join("");
    const findings = found
      .map((kind) => {
        const moment = moments.find((item) => item.kind === kind);
        if (!moment) return "";
        return `
          <p>
            <strong>${escapeHtml(en ? moment.titleEn : moment.titleZh)}</strong>
            ${escapeHtml(en ? moment.textEn : moment.textZh)}
          </p>
        `;
      })
      .join("");
    return `
      <section class="exploration-panel ${doneAll ? "complete" : ""}">
        <div class="exploration-head">
          <span>${en ? "Field recon" : "情报勘察"}</span>
          <strong>${found.length} / 3</strong>
        </div>
        <div class="exploration-actions">${actions}</div>
        <div class="exploration-findings">${findings}</div>
        ${doneAll ? `<p class="exploration-reward">${en ? "Full survey complete: +1 focus ability, +2 energy, +1 mastery." : "完整勘察完成：重点能力+1、精力+2、修炼点+1。"}</p>` : ""}
      </section>
    `;
  }

  private integrityGateMarkup(node: StoryNode): string {
    if (this.pendingIntegrityOption === undefined) return "";
    const option = node.options[this.pendingIntegrityOption];
    if (!option) return "";
    const en = this.language === "en";
    if (this.integrityGateMode === "ability") {
      const primary = primaryAbilityForOption(option);
      const distractors = ABILITY_ORDER.filter((id) => id !== primary).slice(
        0,
        2
      );
      return `
        <section class="integrity-gate" role="dialog" aria-label="${en ? "Weakness verification" : "短板验证"}">
          <div class="integrity-gate-head">
            <span>${en ? "Adaptive Weakness Check" : "自适应短板验证"}</span>
            <h3>${en ? "Recent decisions missed too many expert moves." : "你近期的决策错过了太多专家方案。"}</h3>
            <p>${en ? "Name the ability this move truly tests before it can pass." : "先说出这一手真正考验的能力，才能继续。"}</p>
          </div>
          <div class="integrity-gate-options">
            ${[primary, ...distractors]
              .map(
                (id) => `
                  <button data-action="integrity-answer" data-ability="${id}">
                    ${abilityDisplay(this.language, id).name}
                    <small>${abilityDisplay(this.language, id).tagline}</small>
                  </button>
                `
              )
              .join("")}
          </div>
        </section>
      `;
    }
    const cost = optionCostSummary(this.language,option);
    const wrongOne = en
      ? "No cost at all; the choice itself is the answer"
      : "没有代价，选择本身就是答案";
    const wrongTwo = en
      ? "It only affects other people, not you"
      : "只影响别人，不影响你";
    return `
      <section class="integrity-gate" role="dialog" aria-label="${en ? "Colleague verification" : "同事验证"}">
        <div class="integrity-gate-head">
          <span>${en ? "Decision Witness" : "决策见证人"}</span>
          <h3>${en ? "Mechanical pick pattern detected." : "检测到机械选择模式。"}</h3>
          <p>${en ? "Before this move counts, name its real trade-off." : "在让这一手生效前，先说出它真正的取舍。"}</p>
        </div>
        <div class="integrity-gate-options">
          <button data-action="integrity-answer" data-cost="correct">
            ${escapeHtml(cost)}
            <small>${en ? "This is the actual trade-off" : "这才是真实的取舍"}</small>
          </button>
          <button data-action="integrity-answer" data-cost="wrong-one">
            ${escapeHtml(wrongOne)}
            <small>${en ? "Too convenient to be true" : "太顺理成章，反而不真实"}</small>
          </button>
          <button data-action="integrity-answer" data-cost="wrong-two">
            ${escapeHtml(wrongTwo)}
            <small>${en ? "Ignoring who carries the cost" : "忽略了代价由谁承担"}</small>
          </button>
        </div>
      </section>
    `;
  }

  private render(): void {
    switch (this.view) {
      case "menu":
        this.renderMenu();
        break;
      case "profile":
        this.renderProfile();
        break;
      case "assessment":
        this.renderAssessment();
        break;
      case "assessmentResult":
        this.renderAssessmentResult();
        break;
      case "achievements":
        this.renderAchievements();
        break;
      case "relations":
        this.renderRelations();
        break;
      case "settings":
        this.renderSettings();
        break;
      case "map":
        this.renderMap();
        break;
      case "story":
        this.renderStory();
        break;
      case "leadershipGames":
        this.renderLeadershipGames();
        break;
      case "dualReview":
        this.renderDualReview();
        break;
      case "customScenarios":
        this.renderCustomScenarios();
        break;
      case "customScenarioPlay":
        this.renderCustomScenarioPlay();
        break;
      case "teamAcademy":
        this.renderTeamAcademy();
        break;
      case "chapterTransition":
        this.renderChapterTransition();
        break;
      case "ability":
        this.renderAbility();
        break;
      case "report":
        this.renderReport();
        break;
      case "ending":
        this.renderEnding();
        break;
      case "hiddenBranch":
        this.renderHiddenBranch();
        break;
      case "training":
        this.renderTraining();
        break;
      case "coach":
        this.renderCoach();
        break;
      case "trial":
        this.renderTrial();
        break;
      case "trialBattle":
        this.renderTrialBattle();
        break;
      case "duelLobby":
        this.renderDuelLobby();
        break;
      case "duel":
        this.renderDuel();
        break;
    }
    this.wireTrainingLinks();
  }

  private renderMenu(): void {
    const summary = profileSummary(this.save);
    const started = this.save.profileCreated;
    const relationRows = NPCS.map((npc) => ({
      npc,
      relation: npcRelation(this.save, npc)
    }));
    const establishedCount = relationRows.filter(
      (row) => row.relation.status === "已建立关系"
    ).length;
    const knownCount = relationRows.filter(
      (row) => row.relation.status === "存在线索"
    ).length;
    const unmetCount = NPCS.length - establishedCount - knownCount;
    const lastDecision =
      this.save.decisionHistory[this.save.decisionHistory.length - 1];
    const sandboxChapter = this.save.unlockedChapters.at(-1) ?? 1;
    const sandboxCaption = started
      ? this.language === "en"
        ? `Chapter ${sandboxChapter} · Established ${establishedCount} · Leads ${knownCount} · Unmet ${unmetCount}`
        : `第 ${sandboxChapter} 章 · 已建立 ${establishedCount} · 线索 ${knownCount} · 未接触 ${unmetCount}`
      : this.language === "en"
        ? "Create a profile and make your first choice to light up this map"
        : "创建档案并完成第一次选择后，这张地图会开始亮起来";
    const sandboxLive =
      lastDecision && started
        ? this.language === "en"
          ? `Latest judgment: ${this.latestDecisionText()}. The graph updates as relationships gain or lose trust.`
          : `最近判断：${this.latestDecisionText()}。人物关系正随信任变化实时更新。`
        : this.language === "en"
          ? "No decisions yet. Every choice redraws the connection between you and key people."
          : "还没有决策。每一次选择，都会重新绘制你与关键人物之间的连接。";
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link sound-toggle" data-action="toggle-sound" aria-label="${this.language === "en" ? "Toggle sound" : "切换声音"}" title="${this.language === "en" ? "Toggle sound" : "切换声音"}"><span aria-hidden="true">${this.muted ? "🔇" : "🔊"}</span>${this.muted ? this.t("soundOff") : this.t("soundOn")}</button>
        <button class="link language-toggle" data-action="toggle-language" aria-label="${this.language === "en" ? "Switch language" : "切换语言"}" title="${this.language === "en" ? "Switch language" : "切换语言"}"><span aria-hidden="true">🌐</span>${this.t("language")}</button>
        <div class="topbar-meta">
          <span>${started ? this.save.profile.name : "未建档"}</span>
          <span>${rankName(this.language, summary.rank)}</span>
        </div>
      </header>
      <main class="menu-shell" aria-label="${this.language === "en" ? "Main menu" : "主菜单"}">
        <img class="menu-bg" src="./bg/bg-main-menu.jpg" alt="" aria-hidden="true">
        <section class="hero-strip">
          <div class="hero-copy">
            <p class="eyebrow">${this.language === "en" ? "Adaptive Leadership Scenario Game" : "自适应领导力情境游戏"}</p>
            <h1>${started ? this.t("menuContinue") : this.t("menuTitle")}</h1>
            <p>${this.language === "en" ? "Based on The Book of Power, Heifetz adaptive leadership, and scenario-golf scoring, the campaign, side quests, and 1v1 duels train people reading, talent placement, influence, power strategy, execution, and self-evolution." : "基于《权经》九章架构、Heifetz 自适应领导力与情境高尔夫方法，通过主线剧情、支线任务和 1v1 对决，训练识人、用人、驭人、谋权、掌权、固权与自我进化能力。"}</p>
            <div class="hero-actions">
              ${!started ? `<button class="hero-start-hint" data-action="open-profile">${this.language === "en" ? "New here? Create a profile and make your first decision" : "新玩家从这里开始：创建档案，完成第一次选择"}</button>` : ""}
              ${!started ? `<button class="trial-now" data-action="start-trial-chapter">${this.language === "en" ? "Play Chapter 1 now" : "立即试玩第一章"}</button>` : ""}
              <button class="primary" data-action="${started ? "open-map" : "open-profile"}">${started ? this.t("menuContinue") : this.t("createProfile")}</button>
              <button data-action="open-duel">${this.t("enterDuel")}</button>
            </div>
          </div>
          <div class="rank-panel">
            <span class="rank-name">${rankName(this.language, summary.rank)}</span>
            <strong>${summary.total}</strong>
            <span class="rank-caption">${started ? this.t("totalAbility") : this.language === "en" ? "Baseline · grows with decisions" : "初始基线 · 随决策成长"}</span>
            <div class="rank-meter"><i style="width:${Math.min(100, (summary.total / 60) * 100)}%"></i></div>
            <p title="${this.language === "en" ? "A chapter counts after both main scenarios are completed" : "完成本章全部主线情境后才会计入通关"}">${this.language === "en" ? `Completed ${summary.chapterCount} / 9 chapters` : `已通关 ${summary.chapterCount} / 9 章`}</p>
          </div>
        </section>
        ${
          started &&
          localStorage.getItem(`${SAVE_BACKUP_HINT_KEY}-${APP_VERSION}`) !== "1"
            ? `
              <section class="backup-hint">
                <div>
                  <strong>${this.language === "en" ? "Your progress lives in this browser" : "进度仅保存在当前浏览器"}</strong>
                  <p>${this.language === "en" ? "Export your save or copy the save link after each session so clearing the cache never loses progress." : "每次游玩后导出存档或复制存档链接，清缓存也不怕丢进度。"}</p>
                </div>
                <div class="backup-hint-actions">
                  <button data-action="export-save">${this.t("exportSave")}</button>
                  <button data-action="copy-save-link">${this.t("copySaveLink")}</button>
                  <button data-action="dismiss-backup-hint">${this.language === "en" ? "Got it" : "知道了"}</button>
                </div>
              </section>
            `
            : ""
        }
        ${this.dueReviewBanner()}
        ${
          started && this.save.playCount === 0
            ? `
              <section class="first-run-guide interactive-guide">
                <strong>${this.language === "en" ? "Three guided tasks" : "三个引导任务"}</strong>
                <p class="muted">${this.language === "en" ? "Finish all three to earn +2 mastery." : "完成全部三项可获得 +2 修炼点。"}</p>
                <div class="guide-tasks">
                  <button data-action="guide-ability" ${this.guideSteps().includes("ability") ? "disabled" : ""}>${this.language === "en" ? "1. Open Ability Map" : "1. 查看能力图谱"}${this.guideSteps().includes("ability") ? " ✓" : ""}</button>
                  <button data-action="open-map" ${this.guideSteps().includes("map") ? "disabled" : ""}>${this.language === "en" ? "2. Finish your first decision" : "2. 完成第一次决策"}${this.guideSteps().includes("map") ? " ✓" : ""}</button>
                  <button data-action="open-report" ${this.guideSteps().includes("report") ? "disabled" : ""}>${this.language === "en" ? "3. Open the Review Report" : "3. 查看复盘报告"}${this.guideSteps().includes("report") ? " ✓" : ""}</button>
                </div>
                ${this.guideSteps().length >= 3 ? `<p class="guide-done">${this.language === "en" ? "Guide complete" : "引导完成"}</p>` : ""}
              </section>
            `
            : ""
        }
        <section class="scene-art">
          <button
            class="power-board-hit"
            data-action="open-relations"
            aria-label="${this.language === "en" ? "Open the live power relationship sandbox" : "打开实时权力关系沙盘"}"
          >
            <canvas class="power-board" id="power-board"></canvas>
          </button>
          <div class="scene-caption">
            <strong>${this.language === "en" ? "Power Relationship Sandbox" : "权力关系沙盘"}</strong>
            <span>${escapeHtml(sandboxCaption)}</span>
            <p class="scene-live">${escapeHtml(sandboxLive)}</p>
            <div class="scene-legend">
              <span><i class="legend-dot gold"></i>${this.language === "en" ? "Established" : "已建立关系"}</span>
              <span><i class="legend-dot teal"></i>${this.language === "en" ? "Lead found" : "存在线索"}</span>
              <span><i class="legend-dot gray"></i>${this.language === "en" ? "Not contacted" : "尚未接触"}</span>
            </div>
            <button data-action="open-relations">${this.language === "en" ? "Open Relationship Map" : "查看人物关系"}</button>
          </div>
        </section>
        <section class="menu-groups" aria-label="${this.language === "en" ? "Training modules" : "训练模块"}">
          ${(() => {
            const en = this.language === "en";
            const card = (
              action: string,
              art: string,
              index: string,
              titleZh: string,
              titleEn: string,
              descZh: string,
              descEn: string,
              extra = ""
            ) => `
              <button class="menu-card has-art" data-action="${action}" ${extra}>
                <img class="menu-card-cover" src="${artAsset(art)}" alt="" loading="lazy" onerror="this.style.display='none'" />
                <span class="menu-card-mask"></span>
                <span class="card-index">${index}</span>
                <h2>${en ? titleEn : titleZh}</h2>
                <p>${en ? descEn : descZh}</p>
              </button>`;
            const group = (
              index: string,
              titleZh: string,
              titleEn: string,
              descZh: string,
              descEn: string,
              cards: string
            ) => `
              <section class="menu-group">
                <header class="menu-group-head">
                  <span class="menu-group-index">${index}</span>
                  <div>
                    <h2>${en ? titleEn : titleZh}</h2>
                    <p>${en ? descEn : descZh}</p>
                  </div>
                </header>
                <div class="menu-group-grid">${cards}</div>
              </section>`;
            const personalCards = [
              this.save.lastStoryNodeId
                ? `<button class="menu-card resume-card has-art" data-action="resume-last-node">
                    <img class="menu-card-cover" src="${artAsset("menu-card-00")}" alt="" loading="lazy" onerror="this.style.display='none'" />
                    <span class="menu-card-mask"></span>
                    <span class="card-index">00</span>
                    <h2>${this.t("menuResume")}</h2>
                    <p>${this.t("resumeHint")}</p>
                  </button>`
                : "",
              card("open-map", "menu-card-01", "01", this.t("mainQuest"), "Campaign", "九章权力架构，18 个真实职场情境，每一次选择都在改变你的能力图谱。", "Nine chapters of power, 18 real workplace scenarios, and choices that reshape your ability map.", 'aria-keyshortcuts="M"'),
              card("open-duel", "menu-card-02", "02", this.t("duel"), "1v1 Duel", "AI 陪练、本地双人或远程对战，用情境高尔夫基准判断谁更能应对复杂局势。", "AI practice, local duo, or remote duels use scenario-golf baselines to judge who handles complexity better.", 'aria-keyshortcuts="D"'),
              card("open-leadership-games", "menu-card-10", "03", "领导力游戏", "Leadership Games", "五个精品小游戏：教学、训练、对战、复盘、成就与逐级难度。", "Five polished mini-games with teaching, training, battle, review, achievements, and increasing difficulty."),
              card("open-ability", "menu-card-03", "04", this.t("ability"), "Ability Map", "十项能力、五级段位、经典理论支撑，随时查看你的优势、短板和成长路径。", "Ten abilities, five ranks, and classic theory support let you see strengths, gaps, and growth paths.", 'aria-keyshortcuts="A"'),
              card("open-report", "menu-card-04", "05", this.t("report"), "Review Report", "从游戏表现反推训练建议，把决策反馈迁移回真实工作。", "Turn in-game performance into training advice you can transfer back to real work.", 'aria-keyshortcuts="R"'),
              card("open-trial", "menu-card-07", "06", this.t("trialTitle"), "Trial Grounds", "消耗精力打怪升级，用能力门槛解锁关卡、战利品和 MBA 高难案例。", "Spend energy, break through gates, collect loot, and unlock MBA cases."),
              card("open-achievements", "menu-card-05", "07", this.t("achievements"), "Achievements", "追踪章节、支线、测评、1v1 与能力段位的完成进度。", "Track chapters, side quests, assessments, duels, and rank milestones."),
              card("open-relations", "menu-card-06", "08", this.t("relations"), "Relations", "查看主线与支线中结识的关键人物，以及关系是否已经转化为组织能力。", "See key people from the campaign and side quests, and whether those relationships became organizational capability.")
            ].join("");
            const groupCards = [
              card("open-team-academy", "menu-card-10", "01", "团队管理训练营", "Team Academy", "三类角色、108 个情境，用情境→公式→练习→作业闭环提升团队管理能力。", "Three roles, 108 scenarios, and a scenario-to-homework learning loop for team management."),
              card("open-duel", "menu-card-02", "02", "双人/远程对练", "Local & Remote Duels", "本地双人轮流、远程邀请码对战，用对决大厅直接开房间。", "Take turns on one device or duel remotely with invite codes from the same lobby."),
              card("open-leadership-games", "menu-card-10", "03", "领导力对战", "Leadership Battle", "教学、训练、对战与复盘一体，适合两人或小组轮流上场。", "Teach, train, battle, and review together, built for pairs and small groups.")
            ].join("");
            const trainerCards = [
              card("open-coach", "menu-card-10", "01", "教练工作坊", "Coach Workshop", "导入学员存档，对比小组雷达，找出决策盲区，生成可执行的工作坊流程。", "Import team saves, compare group radar, surface decision blind spots, and plan a facilitated workshop."),
              card("open-custom-scenarios", "menu-card-10", "02", "情境工坊", "Scenario Workshop", "写下真实职场两难，校验专家/部分/风险结构，再与团队一起试玩复盘。", "Write a real workplace dilemma, validate the expert/partial/risk structure, and play it with your team.")
            ].join("");
            const systemCards = [
              card("open-settings", "menu-card-08", "01", this.t("settingsTitle"), "Settings", "统一管理声音、语言、难度、存档数据与操作说明。", "Sound, language, difficulty, save data, and help in one place."),
              card("open-profile", "menu-card-09", "02", "角色档案", "Role Archives", "空降、创业、高潜三套档案独立保存，随时切换，不再删档。", "Keep every role's save and switch between parachute, founder, and high potential without deleting progress.")
            ].join("");
            return [
              group("01", "个人训练", "Personal Training", "主线、AI 对练、小游戏与个人复盘，完成从判断到成长的闭环。", "Campaign, AI duels, mini-games and reviews for your personal leadership loop.", personalCards),
              group("02", "团体训练", "Group Training", "两人或小组一起练：团队课程、同屏轮流、远程开房和领导力小游戏。", "Practice together as a pair or group: team courses, same-screen turns, remote rooms, and leadership mini-games.", groupCards),
              group("03", "培训师模块", "Trainer Hub", "面向培训师：导入小组存档、生成工作坊流程、校验并共创真实案例。", "For facilitators: import team saves, build workshop agendas, validate and co-create real cases.", trainerCards),
              group("04", "系统设置", "System & Settings", "声音、语言、难度、存档数据与操作说明统一管理。", "Sound, language, difficulty, save data and help in one place.", systemCards)
            ].join("");
          })()}
        </section>
      </main>
    `;
    const powerBoard = this.root.querySelector<HTMLCanvasElement>("#power-board");
    if (powerBoard) {
      renderPowerSandbox(
        powerBoard,
        this.save,
        this.save.playCount + 7,
        this.language === "en" ? "Power Relationship Sandbox" : "权力关系沙盘",
        sandboxCaption
      );
    }
  }

  private renderProfile(): void {
    const en = this.language === "en";
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-menu">${this.t("returnHome")}</button>
      </header>
      <main class="narrow-shell" aria-label="${this.language === "en" ? "Profile creation" : "创建档案"}">
        ${
          this.save.profileCreated
            ? `
              <section class="role-slot-panel">
                <p class="eyebrow">${en ? "Role Archives" : "角色档案"}</p>
                <h2>${en ? "Switch roles without deleting progress" : "切换角色，无需删档"}</h2>
                <p class="role-slot-totals">${(() => {
                  const stats = globalArchiveStats();
                  const savedRoles = stats.savedRoles;
                  const totalMastery = stats.totalMastery;
                  const completedRoles = stats.completedRoles;
                  return en
                    ? `Saved roles ${savedRoles}/3 · Mastery ${totalMastery} · Completed ${completedRoles}/3 · Chapters ${stats.totalChapters}/27 · Duels ${stats.totalDuels} · Trials ${stats.totalTrials} · Global achievements ${stats.uniqueAchievements}/${ACHIEVEMENTS.length}`
                    : `已建档 ${savedRoles}/3 · 累计修炼 ${totalMastery} · 通关角色 ${completedRoles}/3 · 章节 ${stats.totalChapters}/27 · 对局 ${stats.totalDuels} · 试炼 ${stats.totalTrials} · 全局成就 ${stats.uniqueAchievements}/${ACHIEVEMENTS.length}`;
                })()}</p>
                ${
                  (() => {
                    const stats = globalArchiveStats();
                    const allRolesDone = stats.savedRoles === 3 && stats.completedRoles === 3;
                    const masteryFull = stats.totalMastery >= 100;
                    const label = allRolesDone
                      ? en
                        ? "All-role completion achieved"
                        : "全角色通关达成"
                      : masteryFull
                        ? en
                          ? "100+ cumulative mastery achieved"
                          : "累计修炼 100+ 达成"
                        : en
                          ? "Global archive grows across roles"
                          : "跨角色全局档案持续积累";
                    return `<div class="role-global-badge">${label}</div>`;
                  })()
                }
                <div class="role-slot-list">
                  ${roleSlotSummaries()
                    .map((slot) => {
                      const active = slot.role === this.save.profile.role;
                      return `
                        <div class="role-slot-card ${active ? "active" : ""} ${slot.exists ? "" : "empty"} has-slot-art">
                          <img class="role-slot-avatar" src="${artAsset(`role-${slot.role}.svg`)}" alt="${roleDisplay(this.language, slot.role).name}" onerror="this.style.opacity='0'" loading="lazy" />
                          <div class="role-slot-body">
                            <strong>${roleDisplay(this.language, slot.role).name}</strong>
                            <span>${slot.exists ? `${escapeHtml(slot.name)} · ${en ? "Chapters" : "章节"} ${slot.chapterCount}/9 · ${en ? "Mastery" : "修炼"} ${slot.masteryPoints}` : (en ? "No save yet" : "未建档")}</span>
                            <button data-action="${slot.exists ? "switch-role" : "new-role"}" data-role="${slot.role}">${slot.exists ? (active ? (en ? "Current" : "当前") : (en ? "Switch" : "切换")) : (en ? "Create" : "新建")}</button>
                          </div>
                        </div>
                      `;
                    })
                    .join("")}
                </div>
              </section>
            `
            : ""
        }
        <section class="panel profile-panel">
          <p class="eyebrow">${en ? "Build Your Leadership Profile" : "建立领导力档案"}</p>
          <h1>${en ? "Choose Your Starting Identity" : "选择你的初始身份"}</h1>
          <p class="muted">${en ? "Your identity sets starting resources and abilities, not your final ceiling." : "身份决定起点资源与初始能力，不决定最终上限。"}</p>
          <form class="profile-form" data-form="profile">
            <label class="field">
              <span>${en ? "Your Name" : "你的名字"}</span>
              <input name="playerName" maxlength="12" placeholder="${en ? "e.g. Alex" : "例如：林远"}" value="${escapeAttr(this.save.profile.name === "你" ? "" : this.save.profile.name)}" />
            </label>
            <div class="role-grid">
              ${(Object.values(ROLES) as Array<(typeof ROLES)[RoleId]>)
                .map(
                  (role) => {
                    const roleView = roleDisplay(this.language, role.id);
                    return `
                    <button type="button" class="role-card ${this.pendingRole === role.id ? "selected" : ""}" data-action="select-role" data-role="${role.id}">
                      <img class="role-portrait" src="${artAsset(`role-${role.id}.svg`)}" alt="${roleView.name}" onerror="this.onerror=null; this.src='./art/role-${role.id}.svg'" loading="lazy" />
                      <span class="role-name">${roleView.name}</span>
                      <span class="role-desc">${en ? ROLE_EN[role.id].description : role.description}</span>
                      <span class="role-start">${en ? `Start: ${role.startingResources.energy} Energy / ${role.startingResources.trust} Trust` : `起点：${role.startingResources.energy} 精力 / ${role.startingResources.trust} 信任`}</span>
                    </button>
                  `;
                  }
                )
                .join("")}
            </div>
            <button class="primary" data-action="create-profile">${en ? "Start Your Journey" : "开启征程"}</button>
            <div class="trial-role-preview">
              <strong>${en ? `First chapter trial starts as ${roleDisplay(this.language, this.pendingRole).name}` : `首章试玩将以「${roleDisplay(this.language, this.pendingRole).name}」开局`}</strong>
              <p>${en ? ROLE_EN[this.pendingRole].objective : ROLES[this.pendingRole].objective}</p>
            </div>
            <button data-action="start-without-assessment">${en ? `Start Trial as ${roleDisplay(this.language, this.pendingRole).name}` : `以「${roleDisplay(this.language, this.pendingRole).name}」进入首章试玩`}</button>
            <small class="profile-note">${this.t("assessmentLater")}</small>
          </form>
        </section>
      </main>
    `;
  }

  private renderAssessment(): void {
    if (!this.pendingProfile) {
      this.show("profile");
      return;
    }
    const question = ASSESSMENT_QUESTIONS[this.assessmentStep];
    const questionView = assessmentDisplay(this.language, question);
    const selected = this.assessmentAnswers[this.assessmentStep];
    const en = this.language === "en";
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-profile">${en ? "Back to Profile" : "返回建档"}</button>
        <button class="link sound-toggle" data-action="toggle-sound" aria-label="${this.language === "en" ? "Toggle sound" : "切换声音"}">${this.muted ? this.t("soundOff") : this.t("soundOn")}</button>
      </header>
      <main class="assessment-shell" aria-label="${this.language === "en" ? "Ability assessment" : "能力测评"}">
        <section class="assessment-panel">
          <div class="assessment-progress">
            <span>${en ? "Ability Baseline Assessment" : "能力基线测评"}</span>
            <small>${this.assessmentStep + 1} / ${ASSESSMENT_QUESTIONS.length}</small>
          </div>
          <div class="assessment-bar"><i style="width:${((this.assessmentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100}%"></i></div>
          ${
            this.assessmentStep === 0
              ? `
                <div class="assessment-intro">
                  <p>${this.t("assessmentOptional")}</p>
                </div>
              `
              : ""
          }
          <h1>${escapeHtml(questionView.prompt)}</h1>
          <p class="muted">${abilityDisplay(this.language, question.abilityId).name} · ${abilityDisplay(this.language, question.abilityId).tagline}</p>
          <div class="assessment-art">
            <canvas id="assessment-art" aria-label="${en ? "Ability baseline chart" : "能力基线图"}"></canvas>
          </div>
          <div class="assessment-options">
            ${questionView.options
              .map(
                (option, index) => `
                  <button class="assessment-option ${selected === index ? "selected" : ""}" data-action="assessment-option" data-option="${index}">
                    ${escapeHtml(option.label)}
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="assessment-actions">
            <button data-action="assessment-prev" ${this.assessmentStep === 0 ? "disabled" : ""}>${en ? "Previous" : "上一题"}</button>
            ${
              this.assessmentStep === ASSESSMENT_QUESTIONS.length - 1
                ? `<button class="primary" data-action="assessment-submit">${en ? "Generate Profile" : "生成能力档案"}</button>`
                : `<button class="primary" data-action="assessment-next">${en ? "Next" : "下一题"}</button>`
            }
            <button class="link" data-action="assessment-skip">${this.t("assessmentTryFirst")}</button>
          </div>
        </section>
      </main>
    `;
    const assessmentArt =
      this.root.querySelector<HTMLCanvasElement>("#assessment-art");
    if (assessmentArt) {
      renderPowerBoard(
        assessmentArt,
        this.assessmentStep * 17 + 3,
        this.language === "en" ? "Ability baseline chart" : "能力基线图",
        this.language === "en"
          ? `${roleDisplay(this.language, this.pendingProfile.role).shortName} · Ten Ability Tendencies`
          : `${ROLES[this.pendingProfile.role].shortName} · 十项能力倾向`
      );
    }
  }

  private renderAssessmentResult(): void {
    const summary = profileSummary(this.save);
    const cert = certificationLevel(this.save);
    const training = recommendedTraining(
      this.save.profile.abilities,
      this.save.profile.role
    );
    const strengths = ABILITY_ORDER.slice()
      .sort(
        (a, b) =>
          abilityLevel(this.save.profile.abilities[b]) -
          abilityLevel(this.save.profile.abilities[a])
      )
      .slice(0, 3);
    const en = this.language === "en";
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link sound-toggle" data-action="toggle-sound" aria-label="${this.language === "en" ? "Toggle sound" : "切换声音"}">${this.muted ? this.t("soundOff") : this.t("soundOn")}</button>
      </header>
      <main class="assessment-result-shell" aria-label="${this.language === "en" ? "Assessment report" : "测评报告"}">
        <section class="assessment-result-hero">
          <div>
            <p class="eyebrow">${en ? "Ability Baseline Report" : "能力基线报告"}</p>
            <h1>${roleDisplay(this.language, this.save.profile.role).name} · ${rankName(this.language, summary.rank)}</h1>
            <p class="muted">${en ? `Total Ability ${summary.total}; role focus and assessment tendencies are now in your starting profile.` : `综合能力值 ${summary.total}，角色重点与测评倾向已经写入初始档案。`}</p>
          </div>
          <canvas class="radar" id="assessment-result-radar"></canvas>
        </section>
        <section class="result-columns">
          <div class="report-panel">
            <h2>${en ? "Strengths" : "优势能力"}</h2>
            ${strengths
              .map(
                (id) => `
                  <div class="strength-row">
                    <span style="--dot:${ABILITIES[id].color}"></span>
                    <strong>${abilityDisplay(this.language, id).name} Lv.${abilityLevel(this.save.profile.abilities[id])}</strong>
                    <small>${abilityDisplay(this.language, id).tagline}</small>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="report-panel">
            <h2>${en ? "Recommended Training" : "建议训练"}</h2>
            ${training
              .map(
                (id) => `
                  <div class="training-item compact">
                    <span style="--dot:${ABILITIES[id].color}"></span>
                    <strong>${abilityDisplay(this.language, id).name}</strong>
                    <p>${abilityDisplay(this.language, id).tagline}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
        <section class="baseline-detail">
          <h2>${en ? "Baseline Detail" : "能力基线明细"}</h2>
          <div class="baseline-list">
            ${ABILITY_ORDER.map((id) => {
              const level = abilityLevel(this.save.profile.abilities[id]);
              const grade = level >= 3 ? "A" : level === 2 ? "B" : "C";
              return `
                <div class="baseline-row">
                  <span style="--dot:${ABILITIES[id].color}"></span>
                  <strong>${abilityDisplay(this.language, id).name}</strong>
                  <em>Lv.${level}</em>
                  <small>${grade} ${en ? "grade" : "级"}</small>
                </div>
              `;
            }).join("")}
          </div>
          <p class="cert-note">
            ${en ? `Certification: ${cert.level} (${cert.score} / 60) ${cert.next}` : `认证状态：${cert.level}（${cert.score} / 60）${cert.next}`}
          </p>
        </section>
        <section class="role-start-panel">
          <h2>${en ? "Role Starting Advice" : "本角色开局建议"}</h2>
          <p>${en ? ROLE_EN[this.save.profile.role].objective : ROLES[this.save.profile.role].objective}</p>
          <button class="primary" data-action="start-campaign">${en ? "Enter Campaign" : "进入主线"}</button>
        </section>
      </main>
    `;
    const radar =
      this.root.querySelector<HTMLCanvasElement>("#assessment-result-radar");
    if (radar) {
      renderAbilityRadar(radar, this.save.profile.abilities);
    }
  }

  private renderAchievements(): void {
    const unlocked = unlockedCount(this.save);
    const en = this.language === "en";
    const categories: Array<AchievementCategory> = [
      "story",
      "training",
      "trial",
      "duel",
      "event",
      "rank"
    ];
    const categoryName: Record<AchievementCategory, string> = {
      story: en ? "Story" : "剧情",
      training: en ? "Training" : "训练",
      trial: en ? "Trial" : "试炼",
      duel: en ? "Duel" : "对决",
      event: en ? "Event" : "事件",
      rank: en ? "Rank" : "段位"
    };
    const rarityName: Record<AchievementRarity, string> = {
      common: en ? "Common" : "普通",
      rare: en ? "Rare" : "稀有",
      epic: en ? "Epic" : "史诗",
      legendary: en ? "Legendary" : "传说"
    };
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-menu">${this.t("returnHome")}</button>
      </header>
      <main class="achievement-shell" aria-label="${this.language === "en" ? "Achievements" : "成就墙"}">
        <section class="achievement-hero">
          <div>
            <p class="eyebrow">${this.t("achievementsTitle")}</p>
            <h1>${unlocked} / ${ACHIEVEMENTS.length} ${en ? "Unlocked" : "已解锁"} · ${this.favoriteAchievements.size} ${en ? "Collected" : "已收藏"}</h1>
            <p class="muted">${en ? "Collect rare lore cards, favorite the ones that matter, and let every unlock pull you deeper into the campaign." : "收集稀有剧情卡片，收藏对你重要的成就，让每一次解锁都把你推回主线。"}</p>
          </div>
          <div class="achievement-progress"><i style="width:${(unlocked / ACHIEVEMENTS.length) * 100}%"></i></div>
        </section>
        <section class="achievement-category-stats">
          ${categories
            .map((category) => {
              const items = ACHIEVEMENTS.filter(
                (item) => achievementCategory(item.id) === category
              );
              const done = items.filter((item) =>
                isAchievementUnlocked(this.save, item.id)
              ).length;
              return `
                <div class="achievement-category-stat has-cat-art">
                  <img class="ach-cat-cover" src="${artAsset(`ach-cat-${category}`)}" alt="" loading="lazy" onerror="this.style.display='none'" />
                  <span class="ach-cat-mask"></span>
                  <strong>${categoryName[category]}</strong>
                  <span>${done} / ${items.length}</span>
                </div>
              `;
            })
            .join("")}
        </section>
        ${categories
          .map((category) => {
            const items = ACHIEVEMENTS.filter(
              (item) => achievementCategory(item.id) === category
            );
            if (items.length === 0) return "";
            return `
              <section class="achievement-group">
                <div class="achievement-group-head">
                  <h2>${categoryName[category]} ${en ? "Collection" : "图鉴"}</h2>
                  <span>${items.filter((item) => isAchievementUnlocked(this.save, item.id)).length} / ${items.length}</span>
                </div>
                <div class="achievement-grid">
                  ${items
                    .map((achievement) => {
                      const done = isAchievementUnlocked(
                        this.save,
                        achievement.id
                      );
                      const view = achievementDisplay(this.language, achievement.id);
                      const progress = achievementProgress(
                        this.save,
                        achievement.id
                      );
                      const displayProgress = Math.min(
                        progress.target,
                        Math.round(progress.current)
                      );
                      const pct = Math.min(
                        100,
                        Math.round((displayProgress / progress.target) * 100)
                      );
                      const rarity = achievementRarity(achievement.id);
                      const lore = achievementLore(
                        achievement.id,
                        this.language
                      );
                      const pendingAssessment =
                        achievement.id === "assessment_done" &&
                        !done &&
                        this.save.assessmentScore === 0 &&
                        this.save.playCount > 0;
                      const favorited = this.favoriteAchievements.has(
                        achievement.id
                      );
                      return `
                        <article class="achievement-card rarity-${rarity} ${done ? "unlocked" : "locked"} has-ach-art">
                          <button
                            class="ach-favorite"
                            data-action="toggle-achievement-favorite"
                            data-achievement="${achievement.id}"
                            aria-pressed="${favorited ? "true" : "false"}"
                            aria-label="${en ? (favorited ? "Remove from collection" : "Add to collection") : (favorited ? "取消收藏" : "加入收藏")}"
                          >${favorited ? "★" : "☆"}</button>
                          <div class="achievement-icon-wrap">
                            <img class="achievement-badge" src="${artAsset("ach-badge-base")}" alt="" loading="lazy" onerror="this.style.display='none'" />
                            <span class="achievement-icon">${achievement.icon}</span>
                          </div>
                          <div>
                            <div class="achievement-meta">
                              <span class="ach-rarity rarity-${rarity}">${rarityName[rarity]}</span>
                              <span class="ach-category">${categoryName[category]}</span>
                            </div>
                            <h2>${view.name}</h2>
                            <p>${view.description}</p>
                            ${pendingAssessment ? `<span class="ach-hint">${en ? "Assessment pending" : "可补测"} <button class="ach-retest-button" data-action="open-assessment">${en ? "Retake" : "去补测"}</button></span>` : ""}
                            <p class="ach-lore">${escapeHtml(lore)}</p>
                            <div class="achievement-card-progress" aria-label="${escapeHtml(
                              done
                                ? en
                                  ? "Unlocked"
                                  : "已解锁"
                                : `${displayProgress} / ${progress.target}`
                            )}">
                              <i style="width:${done ? 100 : pct}%"></i>
                            </div>
                          </div>
                          <small>${
                            done
                              ? en
                                ? "Unlocked"
                                : "已解锁"
                              : `${displayProgress} / ${progress.target}`
                          }</small>
                        </article>
                      `;
                    })
                    .join("")}
                </div>
              </section>
            `;
          })
          .join("")}
      </main>
    `;
  }

  private renderRelations(): void {
    const related = NPCS.filter(
      (npc) => npcRelation(this.save, npc).status !== "尚未接触"
    ).length;
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-menu">${this.t("returnHome")}</button>
      </header>
      <main class="relation-shell" aria-label="${this.language === "en" ? "Relationships" : "人物关系图"}">
        <section class="relation-hero">
          <div>
            <p class="eyebrow">${this.t("relationsTitle")}</p>
            <h1>${related} / ${NPCS.length} ${this.language === "en" ? "people in your network" : "人已进入你的关系网络"}</h1>
            <p class="muted">${this.language === "en" ? "NPCs you faced directly in side quests evolve from leads into lasting organizational relationships." : "支线中真正面对过的 NPC，会从线索变成可延续的组织关系。"}</p>
          </div>
        </section>
        <canvas class="relation-graph" id="relation-graph"></canvas>
        <section class="relation-grid">
          ${NPCS.map((npc) => {
            const relation = npcRelation(this.save, npc);
            const view = npcDisplay(this.language, npc);
            return `
              <div class="npc-card ${relation.status === "已建立关系" ? "trusted" : relation.status === "存在线索" ? "known" : "hidden"}">
                <div class="npc-avatar-wrap">
                  <span class="npc-avatar npc-avatar-fallback">${view.name.slice(0, 1)}</span>
                  <img class="npc-portrait npc-avatar" src="./npc/${npc.id}.jpg" alt="${escapeHtml(view.name)}" loading="lazy">
                </div>
                <div>
                  <h2>${view.name}</h2>
                  <small>${view.title}</small>
                  <p>${view.description}</p>
                </div>
                <span class="npc-status">${relationStatusText(this.language, relation.status)}</span>
                <em>${relationNoteText(this.language, this.save, npc)}</em>
                ${relation.status !== "尚未接触" ? npcStoryMarkup(this.language,npc) : ""}
              </div>
            `;
          }).join("")}
        </section>
      </main>
    `;
    this.root.querySelectorAll("img.npc-portrait").forEach((element) => {
      const image = element as HTMLImageElement;
      const fallback = image.previousElementSibling as HTMLElement | null;
      if (image.complete && image.naturalWidth > 0) {
        if (fallback) fallback.style.display = "none";
        return;
      }
      image.addEventListener("load", () => {
        if (fallback) fallback.style.display = "none";
      });
      image.addEventListener("error", () => image.remove());
    });
    const relationGraph = this.root.querySelector<HTMLCanvasElement>(
      "#relation-graph"
    );
    if (relationGraph) {
      renderRelationGraph(relationGraph, this.save);
    }
  }

  private nextActionAdvice(): {
    text: string;
    action?: "open-trial" | "open-map" | "open-training";
    ability?: AbilityId;
  } {
    const lastDecision = this.save.decisionHistory.at(-1);
    const lastRisk =
      lastDecision?.quality === "risk"
        ? this.language === "en"
          ? " Your last decision was high-risk; review that scenario."
          : " 你上一次决策为高风险，请先复盘该情境。"
        : "";
    const openTrial = TRIAL_STAGES.find(
      (stage) => canEnterTrial(this.save, stage) && !this.save.trialCleared.includes(stage.id)
    );
    if (openTrial) {
      return {
        text:
          this.language === "en"
            ? `Reason: ${openTrial.name} is ready. Energy ${this.save.trialEnergy}/100, capital ${this.save.profile.resources.capital}.${lastRisk}`
            : `原因：「${openTrial.name}」已可进入。精力 ${this.save.trialEnergy}/100，组织资源 ${this.save.profile.resources.capital}。${lastRisk}`,
        action: "open-trial"
      };
    }
    const missing = TRIAL_STAGES.find(
      (stage) => !this.save.trialCleared.includes(stage.id)
    );
    if (missing) {
      return {
        text:
          this.language === "en"
            ? `Reason: ${missing.name} needs ${missing.gates.map((g) => `${abilityDisplay(this.language, g.abilityId).name} Lv.${g.level}`).join(" + ")}. Train the missing abilities first.${lastRisk}`
            : `原因：「${missing.name}」需要 ${missing.gates.map((g) => `${abilityDisplay(this.language, g.abilityId).name} Lv.${g.level}`).join(" + ")}，先提升缺失能力。${lastRisk}`,
        action: "open-training",
        ability: missing.gates[0].abilityId
      };
    }
    return {
      text:
        this.language === "en"
          ? `Reason: all trials cleared. Continue the campaign; current energy ${this.save.trialEnergy}/100.`
          : "原因：试炼已全部通关。继续主线；当前精力 " + `${this.save.trialEnergy}/100。${lastRisk}`,
      action: "open-map"
    };
  }

  private renderMap(): void {
    const summary = profileSummary(this.save);
    const en = this.language === "en";
    const chapter = getChapter(this.selectedChapter);
    const mainNodes = chapter.nodeIds.map(getNode);
    const mainDoneCount = mainNodes.filter((node) =>
      isNodeComplete(this.save, node.id)
    ).length;
    const coreDoneCount = mainNodes
      .slice(0, 2)
      .filter((node) => isNodeComplete(this.save, node.id)).length;
    const extraDoneCount = Math.max(0, mainDoneCount - coreDoneCount);
    const chapterDone = isChapterComplete(this.save, chapter.id);
    const chapterPassed = isChapterPassed(this.save, chapter.id);
    const availableRandom = nextRandomEvent({
      ...this.save,
      role: this.save.profile.role,
      difficulty: this.save.difficulty
    });
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-menu">${this.t("returnHome")}</button>
        <div class="topbar-meta">
          <span>${this.save.profile.name}</span>
          <span>${rankName(this.language, summary.rank)}</span>
        </div>
      </header>
      <main class="map-shell ${this.mapDetailOpen ? "map-detail-open" : ""}" style="${chapterArtStyle(chapter.id)}" aria-label="${this.language === "en" ? "Campaign map" : "主线地图"}">
        ${expeditionHeroMarkup(this.language, this.save,chapter.id)}
        ${
          this.save.playCount === 0 && !this.guideSteps().includes("map-intro")
            ? `
              <section class="map-guide-overlay" role="dialog" aria-label="${en ? "First map guide" : "首次地图引导"}">
                <div>
                  <p class="eyebrow">${en ? "Three things to know" : "进入地图前，先记住三件事"}</p>
                  <ol>
                    <li><strong>${en ? "Recon first" : "先勘察"}</strong>${en ? "Complete one recon action to unlock choices." : "先完成一个勘察动作，才能解锁选择。"}</li>
                    <li><strong>${en ? "Core + Extended" : "核心 + 扩展"}</strong>${en ? "Core 2/2 unlocks the next chapter; 7 extended scenarios add depth and rewards." : "核心 2/2 推进章节，7 个扩展情境提供深度和奖励。"}</li>
                    <li><strong>${en ? "Guardian verification" : "守护验证"}</strong>${en ? "Repeatedly picking the first option triggers a real trade-off check." : "反复选择第一个方案会触发真实取舍验证。"}</li>
                  </ol>
                  <button class="primary" data-action="dismiss-map-guide">${en ? "Start Recon" : "开始勘察"}</button>
                </div>
              </section>
            `
            : ""
        }
        ${
          this.riskCrisisActive()
            ? `<div class="trust-crisis-banner" role="alert">${this.language === "en" ? "Trust crisis: recent risk-heavy choices made the team withhold information. Play steady scenarios to rebuild trust." : "信任危机：近期风险选择让团队开始保留信息。先完成稳健情境重建信任。"}</div>`
            : ""
        }
        <section class="lg-quest-banner" style="--dot:#41c7c0">
          <img src="./art/chapter-${chapter.id}.jpg" alt="" loading="lazy" />
          <div>
            <p class="eyebrow">${this.language === "en" ? "Leadership Game Center" : "领导力游戏中心"}</p>
            <h2>${this.language === "en" ? "Five games to train leadership judgment" : "五个游戏，练出领导力判断"}</h2>
            <p>${this.language === "en" ? `Wins ${this.save.leadershipGameWins} · Losses ${this.save.leadershipGameLosses}. Decision chess, game theory, resource allocation, team management, and crisis command.` : `胜 ${this.save.leadershipGameWins} · 负 ${this.save.leadershipGameLosses}。决策棋、博弈推演、资源分配、团队管理与危机指挥。`}</p>
            <button data-action="open-leadership-games">${this.language === "en" ? "Enter Game Center" : "进入游戏中心"}</button>
          </div>
        </section>
        ${
          this.resourceRecoveryNote
            ? `<div class="recovery-banner" role="status">${this.language === "en" ? "Daily resource recovery applied: +10 energy, +4 trust, +3 influence, +3 capital. Refreshes once per day when entering the map." : "今日资源恢复已生效：精力+10、信任+4、影响力+3、组织资源+3；每天首次进入地图时自动恢复一次。"}</div>`
            : ""
        }
        ${
          this.save.profile.resources.energy < 25 ||
          this.save.profile.resources.trust < 40 ||
          this.save.profile.resources.capital < 25
            ? `<div class="resource-crisis-banner" role="alert">${this.language === "en" ? "A key resource is low. Restore energy once per chapter, or play side quests to rebuild trust and capital before continuing." : "关键资源偏低：每章可深呼吸恢复一次精力，也可先做支线补充信任与组织资源，再继续主线。"}</div>`
            : ""
        }
        <section class="map-head">
          <div>
            <p class="eyebrow">${this.t("mainQuest")}</p>
            <h1>${this.t("campaignTitle")}</h1>
            <p class="muted">${this.t("mapHint")}</p>
            <p class="muted chapter-count-hint">${this.language === "en" ? "Core 2/2 unlocks the next chapter; 7 extended scenarios add optional depth and rewards." : "完成每章前 2 个核心主线即可推进章节；另外 7 个主线扩展情境提供额外深度与奖励。"}</p>
          </div>
          <div class="resource-strip">
            ${resourceChips(this.language, this.save.profile)}
          </div>
        </section>
        <section class="chapter-track">
          ${CHAPTERS.map((item) => chapterBadge(this.language, this.save, this.selectedChapter,item)).join("")}
        </section>
        <section class="map-body">
          <div class="chapter-detail">
            <div class="chapter-title">
              <span class="chapter-code">${this.language === "en" ? `Chapter ${chapter.code}` : `第 ${chapter.code} 章`}</span>
              <h2>${chapterDisplay(this.language, chapter).title}</h2>
              <p>${chapterDisplay(this.language, chapter).subtitle}</p>
              <p class="chapter-main-progress">${this.language === "en" ? `Core ${coreDoneCount} / 2 · Extended ${extraDoneCount} / 7` : `核心 ${coreDoneCount} / 2 · 扩展 ${extraDoneCount} / 7`}</p>
            </div>
            <div class="expedition-chapter-card" style="--civ:${stageForChapter(chapter.id).color}">
              <span>${this.language === "en" ? `Stage · ${stageForChapter(chapter.id).nameEn}` : `阶段 · ${stageForChapter(chapter.id).nameZh}`}</span>
              <strong>${this.language === "en" ? stageForChapter(chapter.id).relicEn : stageForChapter(chapter.id).relicZh}</strong>
              <p>${escapeHtml(this.language === "en" ? stageForChapter(chapter.id).clueEn : stageForChapter(chapter.id).clueZh)}</p>
            </div>
            <div class="node-list">
              ${mainNodes.map((node) => this.nodeRow(node)).join("")}
            </div>
            ${
              chapterDone
                ? `
                  <section class="chapter-reflection">
                    <h3>${this.t("chapterReflectionTitle")}</h3>
                    <p>${escapeHtml(chapterReflectionText(this.language, chapter.id))}</p>
                  </section>
                  ${
                    chapterPassed
                      ? ""
                      : `<p class="star-gate-warning">${this.language === "en" ? "This chapter did not reach one star. Retry it to unlock the next chapter." : "本章未达到一星，需重新挑战才能解锁下一章。"}</p>`
                  }
                  <button class="replay-chapter-button" data-action="replay-chapter" data-chapter="${chapter.id}">${this.t("replayChapter")}</button>
                  ${
                    chapterPassed
                      ? ""
                      : `<button class="retry-chapter-button" data-action="retry-chapter" data-chapter="${chapter.id}">${this.language === "en" ? "Retry Chapter" : "重新挑战本章"}</button>`
                  }
                `
                : ""
            }
            ${chapterTrainingMarkup(this.language, this.save,chapter.id)}
            <section class="quest-board">
              <h3>${this.t("sideQuestArcsTitle")}</h3>
              <p class="muted">${this.t("sideQuestHint")}</p>
              ${SIDE_QUEST_ARCS.map((arc) => this.questArcMarkup(arc)).join("")}
            </section>
          </div>
          <aside class="map-side">
            <button
              class="map-collapse-toggle"
              data-action="toggle-map-detail"
              aria-expanded="${this.mapDetailOpen ? "true" : "false"}"
            >${this.language === "en"
              ? this.mapDetailOpen
                ? "Collapse extra panels"
                : "Show more panels"
              : this.mapDetailOpen
                ? "收起更多面板"
                : "展开更多面板"}</button>
            <div class="mini-panel next-step-panel">
              <h3>${this.t("nextStepTitle")}</h3>
              <p>${escapeHtml(this.nextActionAdvice().text)}</p>
              ${
                this.nextActionAdvice().action
                  ? `<button data-action="${this.nextActionAdvice().action}" ${this.nextActionAdvice().ability ? `data-ability="${this.nextActionAdvice().ability}"` : ""}>${this.t("nextStepAction")}</button>`
                  : ""
              }
            </div>
            ${npcCameoMarkup(this.language, this.save,chapter.id)}
            <div class="mini-panel power-panel">
              <h3>${this.language === "en" ? "Power Structure" : "权力架构"}</h3>
              <div class="power-track">
                ${CHAPTERS.map((item) => {
                  const done = isChapterComplete(this.save, item.id);
                  const civ = stageForChapter(item.id);
                  const title = escapeAttr(this.language === "en" ? civ.relicEn : civ.relicZh);
                  return `<span class="${done ? "found" : "missing"} power-frag-wrap" title="${title}" style="--dot:${civ.color}">
                    <img class="power-frag" src="${artAsset(`power-stage-${item.id}`)}" alt="${title}" onerror="this.style.display='none'" loading="lazy" />
                    <span class="power-frag-text">${done ? "✓" : "○"}</span>
                  </span>`;
                }).join("")}
              </div>
              <p class="muted">${this.language === "en" ? "Each completed chapter advances the power structure." : "每完成一章，权力架构就推进一段。"}</p>
            </div>
            <div class="mini-panel investment-panel">
              <h3>${this.language === "en" ? "Reinvest in the Organization" : "组织再投资"}</h3>
              <p class="muted">${this.language === "en" ? "Spend 25 organizational resources to gain trust, influence, and mastery; every third investment upgrades production capacity." : "消耗 25 点组织资源，换取信任、影响力和修炼点；每 3 次触发一次产能升级。"}</p>
              <p class="muted">${this.language === "en" ? `Invested ${this.save.organizationInvestments ?? 0} times` : `已投资 ${this.save.organizationInvestments ?? 0} 次`}</p>
              <button data-action="organizational-invest" ${this.save.profile.resources.capital < 25 ? "disabled" : ""}>${this.language === "en" ? "Invest 25" : "投资 25"}</button>
            </div>
            <div class="mini-panel production-panel">
              <h3>${this.language === "en" ? "Daily Production" : "每日产能"}</h3>
              <p class="muted">${this.language === "en" ? "Complete 3 decisions today, then claim resources." : "今天完成 3 次决策后领取资源奖励。"}</p>
              <div class="production-progress">
                <span style="width:${Math.min(100, ((this.save.productionCount ?? 0) / 3) * 100)}%"></span>
              </div>
              <p class="muted">${this.save.productionCount ?? 0} / 3</p>
              <button data-action="claim-production" ${this.productionReady() ? "" : "disabled"}>${this.language === "en" ? "Claim Rewards" : "领取产能奖励"}</button>
            </div>
            <div class="mini-panel role-objective">
              <h3>${this.t("roleObjective")}</h3>
              <p>${this.language === "en" ? ROLE_EN[this.save.profile.role].objective : ROLES[this.save.profile.role].objective}</p>
            </div>
            <div class="mini-panel mobile-collapse">
              <h3>${this.t("situation")}</h3>
              <p>${this.language === "en" ? `Completed ${summary.chapterCount}/9 chapters, ${this.save.completedSideQuests.length}/${SIDE_QUEST_ARCS.reduce((count, arc) => count + arc.nodes.length, 0)} side quests, ${this.save.completedRandomEvents.length} random events. Latest decision: ${this.latestDecisionText()}.` : `已完成 ${summary.chapterCount}/9 章，支线 ${this.save.completedSideQuests.length}/${SIDE_QUEST_ARCS.reduce((count, arc) => count + arc.nodes.length, 0)}，随机事件 ${this.save.completedRandomEvents.length}，最近决策 ${this.latestDecisionText()}。`}</p>
            </div>
            <div>${this.difficultySelectorMarkup()}</div>
            <div class="challenge-panel">
              <h3>${this.t("dailyTitle")}</h3>
              ${dailyChallenges(this.save)
                .map(
                  (challenge) => {
                    const today = todayKey();
                    const claimedToday = (this.save.claimedDaily[today] ?? []).includes(challenge.id);
                    const view = challengeDisplay(this.language, challenge);
                    return `
                    <div class="challenge-row ${challenge.done ? "done" : ""}">
                      <div>
                        <strong>${escapeHtml(view.title)}</strong>
                        <small>${challengeCategoryLabel(this.language, challenge.category)}</small>
                        <span>${challenge.current} / ${challenge.target}</span>
                        <p>${escapeHtml(view.description)}</p>
                      </div>
                      ${
                        challenge.done && !claimedToday
                          ? `<button data-action="claim-challenge" data-challenge="${challenge.id}">${this.t("claim")}${challenge.reward}</button>`
                          : claimedToday
                            ? `<small>${this.t("claimed")}</small>`
                            : `<small>${this.t("inProgress")}</small>`
                      }
                    </div>
                  `;
                  }
                )
                .join("")}
            </div>
            <div class="challenge-panel weekly-panel mobile-collapse">
              <h3>${this.language === "en" ? "Weekly Focus" : "本周聚焦"}</h3>
              <p class="muted">${this.language === "en" ? "One leadership theme per week, not daily chores." : "每周一个领导力主题，少而精。"}</p>
              <p class="muted">${this.language === "en" ? `Week ${weekKey()} 路 resets in ${Math.max(0, Math.ceil((weekEndsAt() - Date.now()) / 3600000))}h` : `本周 ${weekKey()} 路 ${Math.max(0, Math.ceil((weekEndsAt() - Date.now()) / 3600000))} 小时后重置`}</p>
              ${weeklyChallenges(this.save)
                .map(
                  (challenge) => `
                    <div class="challenge-row ${challenge.done ? "done" : ""}">
                      <div>
                        <strong>${escapeHtml(challengeDisplay(this.language, challenge).title)}</strong>
                        <small>${challengeCategoryLabel(this.language, challenge.category)}</small>
                        <span>${challenge.current} / ${challenge.target}</span>
                        <p>${escapeHtml(challengeDisplay(this.language, challenge).description)}</p>
                      </div>
                      ${
                        (this.save.claimedWeekly?.[weekKey()] ?? []).includes(
                          challenge.id
                        )
                          ? `<small>${this.t("claimed")}</small>`
                          : challenge.done
                            ? `<button data-action="claim-weekly" data-challenge="${challenge.id}">${this.t("claim")}${challenge.reward}</button>`
                            : `<small>${this.t("inProgress")}</small>`
                      }
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="random-event-panel">
              <h3>${this.t("randomEvent")}</h3>
              ${ 
                availableRandom
                  ? `
                    <p>${this.t("randomAvailable")}</p>
                    <button data-action="open-node" data-node="${availableRandom}">${this.t("handleRandomEvent")}</button>
                  `
                  : `
                    <p class="muted">${this.t("randomDone")}</p>
                    <button data-action="rotate-events">${this.language === "en" ? "Rotate Event Pool" : "轮转事件池"}</button>
                  `
              }
            </div>
            <div class="lg-quest-panel">
              <h3>${this.language === "en" ? "Leadership Game Center" : "领导力游戏中心"}</h3>
              <p class="muted">${this.language === "en" ? `Wins ${this.save.leadershipGameWins} · Losses ${this.save.leadershipGameLosses}` : `胜 ${this.save.leadershipGameWins} · 负 ${this.save.leadershipGameLosses}`}</p>
              <p class="muted">${this.language === "en" ? "Five single-player games with teach, train, and battle modes." : "五个单机游戏，每个都有教学、训练、对战模式。"}</p>
              <button data-action="open-leadership-games">${this.language === "en" ? "Enter Game Center" : "进入游戏中心"}</button>
            </div>
            <div class="event-book-panel mobile-collapse">
              <h3>${this.language === "en" ? "Event Log" : "事件簿"}</h3>
              <p class="muted">${
                this.language === "en"
                  ? `Completed ${this.save.completedRandomEvents.length} / ${randomEventEligibleCount(this.save)} random events for your role and difficulty`
                  : `已完成 ${this.save.completedRandomEvents.length} / ${randomEventEligibleCount(this.save)} 个当前角色与难度可触发事件`
              }</p>
              <div class="event-book-list">
                ${RANDOM_EVENT_IDS.map((id) => {
                  const done = this.save.completedRandomEvents.includes(id);
                  const meta = RANDOM_EVENT_META[id];
                  const roleLocked = Boolean(
                    meta?.roles && !meta.roles.includes(this.save.profile.role)
                  );
                  const difficultyLocked = Boolean(
                    meta?.difficulties &&
                      !meta.difficulties.includes(this.save.difficulty)
                  );
                  let title = id;
                  try {
                    title = storyNodeDisplay(this.language, this.save,getNode(id)).title;
                  } catch {
                    // keep id
                  }
                  const lockLabel = roleLocked
                    ? this.language === "en"
                      ? "role-only"
                      : "限角色"
                    : difficultyLocked
                      ? this.language === "en"
                        ? "difficulty-only"
                        : "限难度"
                      : "";
                  return `<span class="${done ? "done" : ""}" title="${escapeAttr(title)}">${done ? "✓" : "○"}${escapeHtml(title)}${lockLabel ? `<em>${lockLabel}</em>` : ""}</span>`;
                }).join("")}
              </div>
            </div>
            <div class="mini-panel mobile-collapse">
              <h3>${this.t("currentProgress")}</h3>
              <strong>${summary.chapterCount} / 9</strong>
              <p>${this.t("totalAbility")} ${summary.total}</p>
            </div>
            <div class="mini-panel mobile-collapse">
              <h3>${this.t("unlockedTitle")}</h3>
              <p>${this.save.unlockedChapters.map((id) => chapterDisplay(this.language, getChapter(id)).title).join(this.language === "en" ? ", " : "、")}</p>
            </div>
            <div class="map-quick-actions">
              <button class="primary" data-action="open-report">${this.t("viewReport")}</button>
              <button data-action="open-duel">${this.t("enterDuel")}</button>
              <button data-action="open-ability">${this.t("ability")}</button>
            </div>
          </aside>
        </section>
      </main>
    `;
  }

  private difficultySelectorMarkup(): string {
    const options: Array<{ id: "normal" | "pressure" | "extreme"; label: string }> = [
      { id: "normal", label: this.t("difficultyNormal") },
      { id: "pressure", label: this.t("difficultyPressure") },
      { id: "extreme", label: this.t("difficultyExtreme") }
    ];
    const buttons = options
      .map(
        (option) => `
          <button
            class="diff-btn ${this.save.difficulty === option.id ? "active" : ""}"
            data-action="set-difficulty"
            data-difficulty="${option.id}"
          >${escapeHtml(option.label)}</button>`
      )
      .join("");
    const note =
      this.save.difficulty === "normal"
        ? this.language === "en"
          ? "Active: no resource scaling, no story timer, standard trial energy, untimed duels"
          : "已生效：资源不缩放、剧情无时限、试炼精力标准、对决不强制计时"
        : this.save.difficulty === "pressure"
          ? this.language === "en"
            ? "Active: 1.4x resource losses, story/duel rounds from 22s (scaled by text length), 1.15x trial energy, more disruptions"
            : "已生效：资源损耗 1.4 倍、剧情/对决 22 秒起（随文本长度增加）、试炼精力 1.15 倍、干扰更多"
          : this.language === "en"
            ? "Active: 1.8x resource losses, story/duel rounds from 14s (scaled by text length), 1.3x trial energy, frequent disruptions"
            : "已生效：资源损耗 1.8 倍、剧情/对决 14 秒起（随文本长度增加）、试炼精力 1.3 倍、干扰频繁";
    return `
      <div class="mini-panel difficulty-panel">
        <h3>${this.t("difficultyLabel")} <span class="diff-active">${this.language === "en" ? "Active" : "已生效"}</span></h3>
        <div class="diff-row">${buttons}</div>
        <p class="muted">${escapeHtml(note)}</p>
      </div>`;
  }

  /** 上一章章末路线横幅：让玩家看到选择真的带到了下一章。 */
  private routeBannerMarkup(chapterId: number): string {
    const route = this.save.routePath[chapterId - 1];
    if (!route) return "";
    const labelKey =
      route === "expert"
        ? "routeExpert"
        : route === "risk"
          ? "routeRisk"
          : "routePartial";
    return `
      <div class="route-banner" role="status">
        <strong>${escapeHtml(this.t("routeBannerPrefix"))}</strong>
        <span>${escapeHtml(this.t(labelKey))}</span>
      </div>
    `;
  }

  private proceduralNarrativeMarkup(): string {
    if (!this.storyNodeId) return "";
    let node: StoryNode;
    try {
      node = getNode(this.storyNodeId);
    } catch {
      return "";
    }
    const narrative = proceduralNarrativeFor(
      node.chapterId,
      this.save.scenarioSeed ?? 1,
      this.save.profile.role
    );
    const en = this.language === "en";
    return `
      <details class="procedural-narrative">
        <summary>${en ? "Procedural Narrative" : "程序化叙事"}</summary>
        <p>${escapeHtml(en ? narrative.en : narrative.zh)}</p>
      </details>
    `;
  }

  private renderStory(): void {
    if (!this.storyNodeId) {
      this.show("map");
      return;
    }
    const node = storyNodeDisplay(this.language, this.save,
      getNodeForRole(this.save.profile.role, this.storyNodeId)
    );
    const chapter = chapterDisplay(this.language, getChapter(node.chapterId));
    const en = this.language === "en";
    let scenarioSeed = this.save.scenarioSeed;
    if (scenarioSeed === undefined) {
      scenarioSeed = Math.floor(Math.random() * 1_000_000) + 1;
      this.save.scenarioSeed = scenarioSeed;
    }
    const scenarioShell = scenarioShellFor(node.chapterId, scenarioSeed);
    const showingOutcome = this.lastOutcomeNodeId === node.id && this.lastOutcome;
    const showOnboarding = this.save.playCount === 0 && !showingOutcome;
    const civ = stageForChapter(node.chapterId);
    const narrative = chapterNarrative(node.chapterId);
    const isExtraMainNode =
      node.kind === "main" && /n[3-9]$/.test(node.id);
    const chapterFocusAbility = chapter.focus[0] ?? "insight";
    const lessonExtra =
      this.language === "en"
        ? EXPANDED_TRAINING_EN[chapterFocusAbility]
        : EXPANDED_TRAINING[chapterFocusAbility];
    const sceneNpc = NPCS.find(
      (npc) =>
        npc.nodeId === node.id ||
        (npc.nodeId.startsWith("c") &&
          Number(npc.nodeId.slice(1, 2)) === node.chapterId)
    );
    const explorationFound = this.save.explorationFound?.[node.id] ?? [];
    const explorationReady =
      this.replayMode || showingOutcome || explorationFound.length > 0;
    if (!showingOutcome && !this.replayMode) {
      this.save.lastStoryNodeId = node.id;
      this.persistSave();
    }
    const relevantAbilities = [
      ...new Set(
        node.options.flatMap((option) =>
          Object.keys(option.effects) as AbilityId[]
        )
      )
    ];
    const optionOrder = storyOptionOrder(this.save,node);
    const optionGates = optionOrder.map((index) =>
      optionGateFor(this.save, node.options[index], node.chapterId)
    );
    const enabledOptionCount = optionGates.filter(
      (gate) => gate.kind === "ok"
    ).length;
    const energyLocked = optionGates.some(
      (gate) => gate.kind === "resource" && gate.resource === "energy"
    );
    if (node.chapterId !== this.lastEnergyRestoreChapter) {
      this.lastEnergyRestoreChapter = node.chapterId;
      this.energyRestoreUsed = false;
    }
    const unlockAbility = relevantAbilities.find(
      (id) => abilityLevel(this.save.profile.abilities[id]) >= 3
    );
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <div class="topbar-meta">
          ${resourceChips(this.language, this.save.profile)}
          <span id="round-timer" class="round-timer" style="display:none"></span>
        </div>
      </header>
      <main class="story-shell" style="${chapterArtStyle(chapter.id)}" aria-label="${this.language === "en" ? "Story scenario" : "剧情情境"}">
        ${this.routeBannerMarkup(node.chapterId)}
        ${
          this.riskCrisisActive()
            ? `<div class="trust-crisis-banner" role="alert">${this.language === "en" ? "Trust is shaking: recent risk-heavy choices made the team withhold information. Choose steady moves to rebuild trust." : "信任正在动摇：你近期的风险选择让团队开始保留信息。选择稳健动作可以重建信任。"}</div>`
            : ""
        }
        <div class="scenario-shell" aria-label="${en ? "Scenario shell" : "情境外壳"}">
          <span>${en ? "Scenario shell" : "情境外壳"}</span>
          <strong>${en ? scenarioShell.en : scenarioShell.zh}</strong>
        </div>
        <section class="expedition-scene" style="--civ:${civ.color}">
          <div>
            <span>${en ? `${civ.nameEn} · ${civ.relicEn}` : `${civ.nameZh} · ${civ.relicZh}`}</span>
            <strong>${en ? "Intel Journal" : "情报笔记"}</strong>
          </div>
          <p>${escapeHtml(en ? civ.clueEn : civ.clueZh)}</p>
        </section>
        ${
          narrative
            ? `
              <section class="chapter-narrative" style="--civ:${civ.color}">
                <div class="chapter-narrative-art" style="background-image:url('./art/chapter-${node.chapterId}.jpg')"></div>
                <div class="chapter-narrative-copy">
                  <span>${en ? "Chapter Story" : "本章剧情"}</span>
                  <h2>${en ? "The story behind this chapter" : "这一章发生了什么"}</h2>
                  <p>${escapeHtml(en ? narrative.en[0] : narrative.zh[0])}</p>
                  <details>
                    <summary>${en ? "Continue the story" : "继续看剧情"}</summary>
                    ${(en ? narrative.en : narrative.zh)
                      .slice(1)
                      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
                      .join("")}
                  </details>
                </div>
              </section>
            `
            : ""
        }
        ${
          node.chapterId === 4 || node.chapterId === 7
            ? `<div class="route-checkpoint" role="status">${this.language === "en" ? "Route checkpoint: your earlier choices are now shaping upcoming events and endings." : "路线分叉：此前的选择正在改变后续事件与结局权重。"}</div>`
            : ""
        }
        ${this.replayMode ? `<button class="link replay-exit" data-action="open-map">${this.t("replayExit")}</button>` : ""}
        ${
          this.wrongReviewQueue.length
            ? `<div class="wrong-review-header" role="status">${this.language === "en" ? `Missed-move review ${this.wrongReviewIndex + 1}/${this.wrongReviewQueue.length}` : `错题回练 ${this.wrongReviewIndex + 1}/${this.wrongReviewQueue.length}`}</div>`
            : ""
        }
        <button class="link back-link" data-action="open-map">${this.t("backToMap")}</button>
        <section class="story-art">
          <canvas id="story-art" aria-label="${this.language === "en" ? "Diagram of the current situation" : "当前情境的局势示意图"}"></canvas>
        </section>
        <section class="story-layout">
          <section class="story-narrative">
            <section class="scenario-panel">
              <div class="scenario-meta">
                <span>${this.language === "en" ? `Chapter ${chapter.code} · ${chapter.title}` : `第 ${chapter.code} 章 · ${chapter.title}`}</span>
                <span>${node.kind === "side" ? this.t("storyKindSide") : node.kind === "branch" ? this.t("storyKindBranch") : node.kind === "random" ? this.t("storyKindRandom") : isExtraMainNode ? (en ? "Extended Main Scenario" : "主线扩展情境") : this.t("storyKindMain")}</span>
              </div>
              <h1>${node.title}</h1>
              ${
                this.interferenceText
                  ? `
                    <div class="interference-banner" role="alert">
                      <strong>${this.t("interferenceTitle")}</strong>
                      <span>${escapeHtml(this.interferenceText)}</span>
                    </div>
                  `
                  : ""
              }
              ${
                showOnboarding
                  ? `
                    <div class="onboarding-tip">
                      <strong>${this.t("onboardingTitle")}</strong>
                      <p>${this.t("onboarding1")}</p>
                      <p>${this.t("onboarding2")}</p>
                      <p>${this.t("onboarding3")}</p>
                    </div>
                  `
                  : ""
              }
              ${
                unlockAbility
                  ? `
                    <div class="ability-unlock-banner">
                      <strong>${abilityDisplay(this.language, unlockAbility).name} Lv.${abilityLevel(this.save.profile.abilities[unlockAbility])} · ${this.t("abilityUnlockTitle")}</strong>
                      <p>${this.t("abilityUnlockText")}</p>
                    </div>
                  `
                  : ""
              }
              <div class="role-lens">
                <strong>${roleDisplay(this.language, this.save.profile.role).name}${this.language === "zh" ? "视角" : " Lens"}</strong>
                <span class="role-tag">${this.language === "en" ? "Role-specific" : "角色专属"}</span>
                <p>${escapeHtml(this.language === "en" ? ROLE_EN[this.save.profile.role].lens : ROLES[this.save.profile.role].lens)}</p>
              </div>
              <p class="scenario-context">${escapeHtml(node.context)}</p>
              ${this.proceduralNarrativeMarkup()}
              <div class="stake">
                <strong>${this.t("currentTest")}</strong>
                <p>${escapeHtml(node.stake)}</p>
              </div>
              ${
                sceneNpc
                  ? `
                    <div class="npc-scene-quote" style="--dot:${npcAvatarColor(sceneNpc.id)}">
                      <span>${escapeHtml(npcDisplay(this.language, sceneNpc).name)}</span>
                      <p>${escapeHtml(
                        this.language === "en"
                          ? (npcStoryFor(sceneNpc.id)?.en[1] ??
                              npcDisplay(this.language, sceneNpc).description)
                          : (npcStoryFor(sceneNpc.id)?.zh[1] ??
                              npcDisplay(this.language, sceneNpc).description)
                      )}</p>
                    </div>
                  `
                  : ""
              }
              <section class="story-lesson" style="--dot:${ABILITIES[chapterFocusAbility].color}">
                <span>${en ? "Chapter Practice" : "本章修炼"} · ${abilityDisplay(this.language, chapterFocusAbility).name}</span>
                <code>${escapeHtml(lessonExtra.formula.expression)}</code>
                <p>${escapeHtml(lessonExtra.roleApplications[this.save.profile.role])}</p>
                <button data-action="open-training" data-ability="${chapterFocusAbility}">${en ? "Enter Practice" : "进入修炼"}</button>
              </section>
            </section>
          </section>
          <aside class="story-side">
            <section class="intel-panel">
              <div class="intel-head">
                <span>${this.t("intelTitle")}</span>
                <small>${this.t("intelHint")}</small>
              </div>
              <div class="intel-list">
                ${nodeIntel(this.language, this.save.profile.role, node).map((clue) => `<p>${escapeHtml(clue)}</p>`).join("")}
              </div>
            </section>
            <section class="decision-panel">
              ${
                showingOutcome && this.lastOutcome
                  ? this.outcomeMarkup(this.lastOutcome)
                  : `
                    ${
                      this.lastTimedOut
                        ? `<p class="timed-out-note">${escapeHtml(this.t("timedOutNote"))}</p>`
                        : ""
                    }
                    <div class="hint-controls">
                      <button data-action="toggle-hint">${this.storyHintRevealed ? this.t("hideHint") : this.t("showHint")}</button>
                      ${
                        this.storyHintRevealed
                          ? `<p class="coach-hint">${escapeHtml(this.adaptiveHint(node))}</p>`
                          : ""
                      }
                    </div>
                    ${
                      enabledOptionCount === 0 && energyLocked
                        ? `
                          <div class="energy-restore-panel" role="status">
                            <strong>${this.language === "en" ? "Energy exhausted" : "精力耗尽"}</strong>
                            <p>${this.language === "en" ? "Every move needs more energy right now. Take a breath to recover +25 once per chapter." : "当前所有选项都需要更多精力。深呼吸恢复 +25，每章限一次。"}</p>
                            ${
                              this.energyRestoreUsed
                                ? `<small>${this.language === "en" ? "Recovery already used this chapter." : "本章恢复已使用。"}</small>`
                                : `<button data-action="energy-restore">${this.language === "en" ? "Breathe & Recover +25" : "深呼吸恢复 +25"}</button>`
                            }
                          </div>
                        `
                        : ""
                    }
                    ${
                      this.integrityGateNodeId === node.id
                        ? this.integrityGateMarkup(node)
                        : `
                          ${!showingOutcome && !this.replayMode ? this.explorationPanelMarkup(node) : ""}
                          ${
                            !explorationReady && !showingOutcome && !this.replayMode
                              ? `<p class="exploration-lock-note">${en ? "Complete one recon action to unlock the choices." : "先完成一个勘察动作，才能解锁选择。"}</p>`
                              : ""
                          }
                          <div class="option-list">
                            ${optionOrder
                              .map(
                                (originalIndex, index) => {
                                  const option = node.options[originalIndex];
                                  const gate = optionGateFor(
                                    this.save,
                                    option,
                                    node.chapterId
                                  );
                                  const blocked =
                                    gate.kind !== "ok" || !explorationReady;
                                  const gateNote =
                                    gate.kind === "resource"
                                      ? `${this.t("optionLockedResource")} ${resourceDisplay(this.language, gate.resource)} ${gate.needed}`
                                      : gate.kind === "ability"
                                        ? `${this.t("optionLockedAbility")} ${abilityDisplay(this.language, gate.ability).name} Lv.${gate.needed}`
                                        : !explorationReady
                                          ? en
                                            ? "Complete a recon action first"
                                            : "先完成一个勘察动作"
                                          : "";
                                  return `
                                    <button class="option-card ${blocked ? "locked" : ""}" data-action="choose-option" data-option="${originalIndex}" data-quality="${option.quality}" ${blocked ? "disabled" : ""}>
                                      <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                                      <span class="option-body">
                                        <strong>${escapeHtml(option.label)}</strong>
                                        <em>${escapeHtml(option.summary)}</em>
                                        <small class="role-move">${roleMove(this.language, this.save.profile.role,option.quality)}</small>
                                        ${gateNote ? `<small class="option-gate-note">${escapeHtml(gateNote)}</small>` : ""}
                                      </span>
                                    </button>
                                  `;
                                }
                              )
                              .join("")}
                          </div>
                        `
                    }
                  `
              }
            </section>
          </aside>
        </section>
      </main>
    `;
    const storyArt = this.root.querySelector<HTMLCanvasElement>("#story-art");
    if (storyArt) {
      renderPowerBoard(storyArt, node.id.length * 11 + node.chapterId * 13);
    }
    const relationsArt = this.root.querySelector<HTMLCanvasElement>(
      "#outcome-relations"
    );
    if (relationsArt) {
      renderRelationGraph(relationsArt, this.save);
    }
  }

  private organizationalInvest(): void {
    if (this.save.profile.resources.capital < 25) {
      this.showToast(
        this.language === "en"
          ? "Need 25 organizational resources."
          : "需要 25 点组织资源。"
      );
      return;
    }
    this.save.profile.resources.capital -= 25;
    this.save.profile.resources.trust = clamp(
      this.save.profile.resources.trust + 8,
      0,
      100
    );
    this.save.profile.resources.influence = clamp(
      this.save.profile.resources.influence + 6,
      0,
      100
    );
    this.save.masteryPoints += 1;
    const investments = (this.save.organizationInvestments ?? 0) + 1;
    this.save.organizationInvestments = investments;
    let message =
      this.language === "en"
        ? "Reinvested: +8 trust, +6 influence, +1 mastery."
        : "再投资完成：信任 +8、影响力 +6、修炼点 +1。";
    if (investments % 3 === 0) {
      for (const key of Object.keys(this.save.profile.resources) as ResourceKey[]) {
        this.save.profile.resources[key] = clamp(
          this.save.profile.resources[key] + 10,
          0,
          100
        );
      }
      message =
        this.language === "en"
          ? "Capacity upgrade: all resources +10."
          : "产能升级：全部资源 +10。";
    }
    this.persistSave();
    this.audio.playCoins();
    this.showToast(message);
    this.renderMap();
  }

  private openLeadershipGames(): void {
    this.leadershipGames = new LeadershipGamesApp(this.language, {
      onBack: () => this.show("map"),
      onReward: (gameId, won, score, achievements, branch) =>
        this.completeLeadershipGame(
          gameId,
          won,
          score,
          achievements,
          branch
        ),
      onAudio: (kind) => {
        if (kind === "ui") this.audio.ui();
        else if (kind === "win") this.audio.win();
        else if (kind === "lose") this.audio.lose();
        else this.audio.choose();
      },
      getProgress: (gameId) => ({
        maxLevel: Math.min(
          3,
          this.save.leadershipBestLevel?.[gameId] ?? 1
        ),
        achievements: this.save.leadershipAchievements?.[gameId] ?? []
      })
    });
    this.audio.ui();
    this.show("leadershipGames");
  }

  private renderLeadershipGames(): void {
    if (!this.leadershipGames) {
      this.openLeadershipGames();
      return;
    }
    this.leadershipGames.render(this.root);
  }

  private renderTeamAcademy(): void {
    if (!this.teamAcademy) {
      this.show("menu");
      return;
    }
    this.teamAcademy.render(this.root);
  }

  private resetDualSelection(): void {
    this.dualBestIndex = undefined;
    this.dualWorstIndex = undefined;
    this.dualSubmitted = false;
    this.dualLastOutcome = undefined;
  }

  private renderDualReview(): void {
    const nodeId = this.dualReviewQueue[this.dualReviewIndex];
    if (!nodeId) {
      this.show("report");
      return;
    }
    const roleNode = getNodeForRole(this.save.profile.role, nodeId);
    const nodeView = storyNodeDisplay(this.language, this.save,roleNode);
    const options = nodeView.options;
    const en = this.language === "en";
    const expertIndex = options.findIndex(
      (option) => option.quality === "expert"
    );
    const worstIndex = worstOptionIndex(options);
    const expertOption = options[expertIndex];
    const worstOption = options[worstIndex];
    const optionCards = options
      .map((option, index) => {
        const isBest = this.dualBestIndex === index;
        const isWorst = this.dualWorstIndex === index;
        const cls = `dual-option ${isBest ? "best" : ""} ${
          isWorst ? "worst" : ""
        }`;
        return `
          <article class="${cls}">
            <strong>${escapeHtml(option.label)}</strong>
            <small>${escapeHtml(option.summary)}</small>
            <div class="dual-axes">
              <button class="${isBest ? "active" : ""}" data-action="dual-toggle" data-axis="best" data-option="${index}" aria-pressed="${isBest}">${en ? "Best" : "最佳"}</button>
              <button class="${isWorst ? "active" : ""}" data-action="dual-toggle" data-axis="worst" data-option="${index}" aria-pressed="${isWorst}">${en ? "Worst" : "最差"}</button>
            </div>
          </article>
        `;
      })
      .join("");
    const feedback =
      this.dualSubmitted && this.dualLastOutcome && expertOption && worstOption
        ? `
          <section class="dual-result ${this.dualLastOutcome}">
            <h2>${
              this.dualLastOutcome === "perfect"
                ? en
                  ? "Best and worst both precise"
                  : "最佳与最差判断都准确"
                : this.dualLastOutcome === "partial"
                  ? en
                    ? "Best precise, worst needs calibration"
                    : "最佳准确，最差判断需要校准"
                  : en
                    ? "Best judgment needs another pass"
                    : "最佳判断需要再次回练"
            }</h2>
            <p>${en ? "Expert baseline" : "专家基准"}：${escapeHtml(expertOption.label)}</p>
            <p>${en ? "Worst baseline" : "最差基准"}：${escapeHtml(worstOption.label)}</p>
          </section>
        `
        : "";
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="dual-close">${en ? "Report" : "返回报告"}</button>
        <div class="topbar-meta"><span>${en ? `Dual-axis review ${this.dualReviewIndex + 1}/${this.dualReviewQueue.length}` : `双轴回练 ${this.dualReviewIndex + 1}/${this.dualReviewQueue.length}`}</span></div>
      </header>
      <main class="dual-review-shell" aria-label="${en ? "Best and worst judgment review" : "最佳与最差判断回练"}">
        <section class="dual-review-hero">
          <p class="eyebrow">${escapeHtml(nodeView.title)}</p>
          <h1>${en ? "Pick the best and the worst move" : "同时选出最佳与最差选项"}</h1>
          <p>${escapeHtml(nodeView.context)}</p>
        </section>
        <p class="dual-hint">${en ? "Best and worst are mutually exclusive. Choose one option for each." : "最佳与最差互斥，同一个选项不能同时兼任。"}</p>
        ${feedback}
        <section class="dual-option-list">${optionCards}</section>
        <div class="dual-footer">
          <button class="primary" data-action="dual-submit" ${this.dualSubmitted ? "disabled aria-disabled=\"true\"" : ""}>${en ? "Submit Judgment" : "提交判断"}</button>
          ${this.dualSubmitted ? `<button class="primary" data-action="dual-next">${en ? "Next Review" : "下一题"}</button>` : ""}
        </div>
      </main>
    `;
  }

  private renderCustomScenarios(): void {
    const en = this.language === "en";
    const list = this.customScenarios
      .map(
        (scenario) => `
          <article class="custom-scenario-card">
            <strong>${escapeHtml(scenario.title)}</strong>
            <p>${escapeHtml(scenario.context)}</p>
            <div class="custom-scenario-actions">
              <button data-action="custom-play" data-id="${escapeAttr(scenario.id)}">${en ? "Play" : "试玩"}</button>
              <button data-action="custom-delete" data-id="${escapeAttr(scenario.id)}">${en ? "Delete" : "删除"}</button>
            </div>
          </article>
        `
      )
      .join("");
    const optionFields = [0, 1, 2]
      .map((index) => {
        const qualityName =
          index === 0 ? "expert" : index === 1 ? "partial" : "risk";
        return `
          <fieldset class="custom-option-field">
            <legend>${en ? `Option ${index + 1} · ${qualityName}` : `选项 ${index + 1} · ${qualityName}`}</legend>
            <label><span>${en ? "Label" : "标题"}</span><input name="custom-option-${index}-label" maxlength="60" /></label>
            <label><span>${en ? "Summary" : "摘要"}</span><input name="custom-option-${index}-summary" maxlength="120" /></label>
            <label><span>${en ? "Feedback" : "反馈"}</span><textarea name="custom-option-${index}-feedback" rows="2" maxlength="300"></textarea></label>
            <label><span>${en ? "Quality" : "质量"}</span>
              <select name="custom-option-${index}-quality">
                <option value="expert" ${index === 0 ? "selected" : ""}>${en ? "Expert" : "专家"}</option>
                <option value="partial" ${index === 1 ? "selected" : ""}>${en ? "Partial" : "部分有效"}</option>
                <option value="risk" ${index === 2 ? "selected" : ""}>${en ? "Risk" : "高风险"}</option>
              </select>
            </label>
          </fieldset>
        `;
      })
      .join("");
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-menu">${en ? "Menu" : "返回主菜单"}</button>
        <div class="topbar-meta"><span>${en ? "Scenario Workshop" : "情境工坊"}</span></div>
      </header>
      <main class="custom-workshop-shell" aria-label="${en ? "Scenario Workshop" : "情境工坊"}">
        <section class="custom-workshop-hero">
          <p class="eyebrow">${en ? "UGC Scenarios" : "自定义情境"}</p>
          <h1>${en ? "Write a real dilemma, then play it" : "写下一个真实两难，再把它玩出来"}</h1>
          <p class="muted">${en ? "Keep the expert / partial / risk structure, and your team can use the same baseline the campaign uses." : "保持专家 / 部分 / 高风险结构，团队就能复用主线同样的基准反馈。"}</p>
        </section>
        <section class="custom-scenario-list">
          <h2>${en ? `Saved Scenarios (${this.customScenarios.length})` : `已保存情境（${this.customScenarios.length}）`}</h2>
          ${list || `<p class="muted">${en ? "No scenarios yet. Create the first one below." : "还没有自定义情境，先在下方面创建第一个。"}</p>`}
          <div class="custom-transfer-actions">
            <button data-action="custom-export" ${list ? "" : "disabled aria-disabled=\"true\""}>${en ? "Export Scenarios" : "导出情境包"}</button>
            <label class="file-button">${en ? "Import Scenarios" : "导入情境包"}<input type="file" data-custom-import="1" accept="application/json" hidden /></label>
          </div>
        </section>
        <section class="custom-scenario-form">
          <h2>${en ? "Create Scenario" : "创建情境"}</h2>
          <label><span>${en ? "Title" : "标题"}</span><input name="custom-title" maxlength="40" /></label>
          <label><span>${en ? "Situation" : "现场描述"}</span><textarea name="custom-context" rows="3" maxlength="500"></textarea></label>
          <label><span>${en ? "Stake" : "利害关系"}</span><textarea name="custom-stake" rows="2" maxlength="300"></textarea></label>
          <div class="custom-option-grid">${optionFields}</div>
          <button class="primary" data-action="custom-submit">${en ? "Save Scenario" : "保存情境"}</button>
        </section>
      </main>
    `;
  }

  private renderCustomScenarioPlay(): void {
    const scenario = this.customScenarios.find(
      (item) => item.id === this.customPlayId
    );
    if (!scenario) {
      this.show("customScenarios");
      return;
    }
    const en = this.language === "en";
    const node = customScenarioToNode(scenario);
    const options =
      this.customPlayResult === undefined
        ? scenario.options
            .map(
              (option, index) => `
                <button class="custom-play-option ${option.quality}" data-action="custom-option" data-option="${index}">
                  <strong>${escapeHtml(option.label)}</strong>
                  <small>${escapeHtml(option.summary)}</small>
                </button>
              `
            )
            .join("")
        : "";
    const result =
      this.customPlayResult !== undefined &&
      scenario.options[this.customPlayResult]
        ? (() => {
            const option = scenario.options[this.customPlayResult];
            return `
              <section class="custom-play-result ${option.quality}">
                <span class="quality ${option.quality}">${qualityLabel(this.language, option.quality)}</span>
                <h2>${escapeHtml(option.label)}</h2>
                <p>${escapeHtml(option.feedback)}</p>
                <blockquote>${escapeHtml(node.options[this.customPlayResult].theory)}</blockquote>
              </section>
            `;
          })()
        : "";
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="custom-back">${en ? "Workshop" : "返回工坊"}</button>
        <div class="topbar-meta"><span>${escapeHtml(scenario.title)}</span></div>
      </header>
      <main class="custom-play-shell" aria-label="${en ? "Custom scenario" : "自定义情境"}">
        <section class="custom-play-hero">
          <p class="eyebrow">${en ? "Custom Scenario" : "自定义情境"}</p>
          <h1>${escapeHtml(scenario.title)}</h1>
          <p>${escapeHtml(scenario.context)}</p>
          <blockquote>${escapeHtml(scenario.stake)}</blockquote>
        </section>
        ${result}
        ${options ? `<section class="custom-play-options">${options}</section>` : `<div class="custom-play-actions"><button class="primary" data-action="custom-back">${en ? "Back to Workshop" : "返回工坊"}</button></div>`}
      </main>
    `;
  }

  private completeLeadershipGame(
    gameId: LeadershipGameId,
    won: boolean,
    score: number,
    achievements: string[],
    branch: string
  ): void {
    if (won) {
      this.save.leadershipGameWins += 1;
      this.save.masteryPoints += 2;
      const currentLevel =
        this.save.leadershipBestLevel?.[gameId] ?? 1;
      if (currentLevel < 3) {
        this.save.leadershipBestLevel[gameId] = currentLevel + 1;
      }
      this.save.profile.resources.influence = clamp(
        this.save.profile.resources.influence + 5,
        0,
        100
      );
      this.save.profile.resources.trust = clamp(
        this.save.profile.resources.trust + 3,
        0,
        100
      );
    } else {
      this.save.leadershipGameLosses += 1;
      this.save.profile.resources.energy = clamp(
        this.save.profile.resources.energy - 4,
        0,
        100
      );
    }
    const earned = this.save.leadershipAchievements[gameId] ?? [];
    const merged = [...new Set([...earned, ...achievements])];
    this.save.leadershipAchievements[gameId] = merged;
    if (branch) {
      this.save.leadershipBranches[gameId] = branch;
    }
    if (achievements.length > 0) {
      this.showToast(
        this.language === "en"
          ? `Leadership game achievement unlocked: +${achievements.length}`
          : `领导力游戏解锁新成就：+${achievements.length}`
      );
    }
    this.persistSave();
    trackEvent("leadership_game", {
      gameId,
      won,
      score,
      achievements: achievements.join(","),
      branch
    });
  }

  private renderChapterTransition(): void {
    if (!this.pendingChapterTransition) {
      this.show("map");
      return;
    }
    const chapter = getChapter(this.pendingChapterTransition);
    const next = chapter.id < CHAPTERS.length ? CHAPTERS[chapter.id] : undefined;
    const civ = stageForChapter(chapter.id);
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link sound-toggle" data-action="toggle-sound" aria-label="${this.language === "en" ? "Toggle sound" : "切换声音"}">${this.muted ? this.t("soundOff") : this.t("soundOn")}</button>
        <button class="link language-toggle" data-action="toggle-language" aria-label="${this.language === "en" ? "Switch language" : "切换语言"}">${this.t("language")}</button>
      </header>
      <main class="transition-shell" aria-label="${this.language === "en" ? "Chapter transition" : "章节过渡"}">
        <section class="transition-panel">
          <p class="eyebrow">${this.language === "en" ? `Chapter ${chapter.code} ${this.t("chapterComplete")}` : `第 ${chapter.code} 章完成`}</p>
          <h1>${chapterDisplay(this.language, chapter).title}</h1>
          <p class="expedition-transition-line" style="--civ:${civ.color}">${this.language === "en" ? `${civ.nameEn} · ${civ.relicEn}` : `${civ.nameZh} · ${civ.relicZh}`}</p>
          <p class="transition-summary">${escapeHtml(chapterReflectionText(this.language, chapter.id))}</p>
          <div class="route-choice-panel">
            <h3>${this.t("routeTitle")}</h3>
            <p class="muted">${this.t("routeHint")}</p>
            <div class="route-choice-actions">
              ${(["expert", "risk", "partial"] as const)
                .map((route) => {
                  const selected = this.save.routePath[chapter.id] === route;
                  const labelKey =
                    route === "expert"
                      ? "routeExpert"
                      : route === "risk"
                        ? "routeRisk"
                        : "routePartial";
                  return `<button class="${selected ? "selected" : ""}" data-action="choose-route" data-chapter="${chapter.id}" data-route="${route}" aria-pressed="${selected ? "true" : "false"}">${this.t(labelKey)}${selected ? ` <span class="route-selected-tag">${this.language === "en" ? "Selected" : "已选"}</span>` : ""}</button>`;
                })
                .join("")}
            </div>
            ${this.save.routePath[chapter.id] ? `<p class="route-preview" role="status">${this.t(this.save.routePath[chapter.id] === "expert" ? "routeExpertPreview" : this.save.routePath[chapter.id] === "risk" ? "routeRiskPreview" : "routePartialPreview")}</p>` : ""}
            ${
              this.pendingForkNodeId
                ? `<button class="primary fork-entry-button" data-action="enter-fork">${this.language === "en" ? "Enter Route Fork" : "进入路线分叉"}</button>`
                : ""
            }
          </div>
          ${ 
            next
              ? `
                <div class="next-chapter">
                  <span>${this.t("nextChapter")}</span>
                  <strong>${this.language === "en" ? `Chapter ${next.code} · ${chapterDisplay(this.language, next).title}` : `第 ${next.code} 章 · ${next.title}`}</strong>
                  <p>${chapterDisplay(this.language, next).subtitle}</p>
                </div>
              `
              : `
                <div class="next-chapter">
                  <span>${this.t("campaignComplete")}</span>
                  <strong>${this.t("campaignCompleteText")}</strong>
                  <p>${this.t("campaignCompleteHint")}</p>
                </div>
              `
          }
          <button class="primary" data-action="continue-transition-map">${this.t("menuContinue")}</button>
        </section>
      </main>
    `;
  }

  private renderAbility(): void {
    const summary = profileSummary(this.save);
    const training = recommendedTraining(
      this.save.profile.abilities,
      this.save.profile.role
    );
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-menu">${this.t("returnHome")}</button>
      </header>
      <main class="ability-shell" aria-label="${this.language === "en" ? "Ability map" : "能力图谱"}">
        ${dimensionMarkup(this.language, this.save)}
        <section class="ability-head">
          <div>
            <p class="eyebrow">${this.t("abilityTitle")}</p>
            <h1>${rankName(this.language, summary.rank)}</h1>
            <p class="muted">${this.language === "en" ? `Total Ability ${summary.total}, next rank needs ${this.nextRankNeed(summary.total)} points.` : `综合能力值 ${summary.total}，下一段位需要 ${this.nextRankNeed(summary.total)} 点。`}</p>
            <div class="role-focus">
              <strong>${roleDisplay(this.language, this.save.profile.role).name}${this.language === "en" ? " Focus" : "重点"}</strong>
              <div>
                ${ROLES[this.save.profile.role].focusAbilities
                  .map(
                    (id) => `
                      <span style="--dot:${ABILITIES[id].color}">${abilityDisplay(this.language, id).name}</span>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
          <canvas class="radar" id="ability-radar"></canvas>
          <button class="primary" data-action="open-report">${this.t("viewReport")}</button>
        </section>
        ${
          (() => {
            const roadmap = ROLE_ROADMAPS[this.save.profile.role];
            const role = this.save.profile.role;
            const lang = this.language;
            return `
              <section class="role-roadmap">
                <div class="role-roadmap-head">
                  <p class="eyebrow">${lang === "en" ? "Role Training Roadmap" : "角色训练路线"}</p>
                  <h2>${escapeHtml(roadmap.theme[lang])}</h2>
                  <p>${escapeHtml(roadmap.themeDetail[lang])}</p>
                  <ul class="role-pitfalls">
                    ${roadmap.pitfalls
                      .map((pitfall) => `<li>${escapeHtml(pitfall[lang])}</li>`)
                      .join("")}
                  </ul>
                </div>
                <div class="role-stages">
                  ${roadmap.stages
                    .map(
                      (stage, index) => `
                        <div class="role-stage">
                          <span>${index + 1}</span>
                          <div>
                            <strong>${escapeHtml(stage.title[lang])}</strong>
                            <p>${escapeHtml(stage.goal[lang])}</p>
                            <div class="role-stage-abilities">
                              ${stage.abilities
                                .map((id) => {
                                  const done = this.save.completedTraining.includes(id);
                                  return `<span class="${done ? "done" : ""}">${abilityDisplay(this.language, id).name} Lv.${abilityLevel(this.save.profile.abilities[id])}${done ? " ✓" : ""}</span>`;
                                })
                                .join("")}
                            </div>
                          </div>
                        </div>
                      `
                    )
                    .join("")}
                </div>
                <div class="role-focus-applications">
                  <h3>${lang === "en" ? "Role Applications" : "角色落地动作"}</h3>
                  <div class="role-application-grid">
                    ${ROLES[role].focusAbilities
                      .map((id) => {
                        const extra =
                          lang === "en"
                            ? EXPANDED_TRAINING_EN[id]
                            : EXPANDED_TRAINING[id];
                        return `
                          <div>
                            <strong>${abilityDisplay(this.language, id).name}</strong>
                            <p>${escapeHtml(extra.roleApplications[role])}</p>
                            <code>${escapeHtml(extra.formula.expression)}</code>
                          </div>
                        `;
                      })
                      .join("")}
                  </div>
                </div>
              </section>
            `;
          })()
        }
        <section class="ability-grid">
          ${ABILITY_ORDER.map((id) => this.abilityCard(id)).join("")}
        </section>
        <section class="training-panel">
          <h2>${this.language === "en" ? "Recommended Training" : "建议训练方向"}</h2>
          <div class="training-list">
            ${training
              .map(
                (id) => `
                  <div class="training-item">
                    <span style="--dot:${ABILITIES[id].color}"></span>
                    <strong>${abilityDisplay(this.language, id).name}</strong>
                    <p>${abilityDisplay(this.language, id).tagline}</p>
                    <small>${abilityDisplay(this.language, id).tagline}</small>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
      </main>
    `;
    const canvas = this.root.querySelector<HTMLCanvasElement>("#ability-radar");
    if (canvas) {
      renderAbilityRadar(canvas, this.save.profile.abilities);
    }
  }

  private renderReport(): void {
    const summary = profileSummary(this.save);
    const decision = decisionProfile(this.save);
    const cert = certificationLevel(this.save);
    const strengths = ABILITY_ORDER.filter(
      (id) => abilityLevel(this.save.profile.abilities[id]) >= 4
    );
    const gaps = recommendedTraining(
      this.save.profile.abilities,
      this.save.profile.role
    );
    const chapterReports = CHAPTERS.map((chapter) => {
      const record = this.save.chapterRecords.find(
        (item) => item.chapterId === chapter.id
      );
      return {
        chapter,
        stars: record ? chapterStarCount(record.stars) : 0,
        done: Boolean(record && record.completedNodeIds.length >= 2)
      };
    });
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-menu">${this.t("returnHome")}</button>
        <button class="link sound-toggle" data-action="toggle-sound" aria-label="${this.language === "en" ? "Toggle sound" : "切换声音"}">${this.muted ? this.t("soundOff") : this.t("soundOn")}</button>
      </header>
      <main class="report-shell" aria-label="${this.language === "en" ? "Review report" : "复盘报告"}">
        ${dimensionMarkup(this.language, this.save)}
        <section class="report-hero">
          <div>
            <p class="eyebrow">${this.t("reportTitle")}</p>
            <h1>${this.save.profile.name} · ${this.t("leadershipTrajectory")}</h1>
            <p class="muted">${this.language === "en" ? `Rank: ${rankName(this.language, summary.rank)} · Total Ability: ${summary.total} · Campaign ${summary.chapterCount}/9` : `段位：${rankName(this.language, summary.rank)} · 综合能力值：${summary.total} · 主线 ${summary.chapterCount}/9`}</p>
          </div>
          <div class="duel-stats">
            <span><strong>${this.save.duelWins}</strong> ${this.language === "en" ? "Wins" : "胜"}</span>
            <span><strong>${this.save.duelLosses}</strong> ${this.language === "en" ? "Losses" : "负"}</span>
            <span><strong>${this.save.masteryPoints}</strong> ${this.language === "en" ? "Mastery" : "修炼点"}</span>
          </div>
          <div class="best-score-badge">
            <span>${this.t("bestScore")}</span>
            <strong>${this.save.bestScore ?? 0}</strong>
          </div>
          <div class="identity-badge">
            <span>${this.language === "en" ? "Decision Profile" : "决策画像"}</span>
            <strong>${roleDisplay(this.language, this.save.profile.role).shortName} · ${decision.identity}</strong>
          </div>
          <p class="adaptive-note">${this.language === "en" ? `Adaptive ${decision.counts.expert} · Technical ${decision.counts.partial} · Authority ${decision.counts.risk}. Adaptive leadership grows when you diagnose from the balcony, hold the tension, and give the work back; partial moves are technical fixes, and high-risk moves lean on authority or avoidance.` : `自适应 ${decision.counts.expert} · 技术性 ${decision.counts.partial} · 权威/回避 ${decision.counts.risk}。自适应领导力来自登台观察、稳住张力、把工作还给团队；部分有效是技术性解决，高风险回应依赖权威或回避。`}</p>
          <p class="decision-insight" role="note">${
            decision.counts.risk >= decision.counts.expert
              ? this.language === "en"
                ? "Insight: under pressure you reach for authority first. The next move is to make that pressure visible instead of absorbing it alone."
                : "洞察：压力之下你习惯先动用权威。下一步是把这份压力摆到台面，而不是独自吸收。"
              : decision.counts.partial >= decision.counts.expert
                ? this.language === "en"
                  ? "Insight: you solve the symptom fast and carry the responsibility yourself. Try handing the problem back with a check node."
                  : "洞察：你擅长快速解决症状，但责任往往留在自己手里。试试把问题还回去，并带上检查节点。"
                : this.language === "en"
                  ? "Insight: you diagnose before acting. The next upgrade is turning diagnosis into a shared, verifiable agenda."
                  : "洞察：你习惯先诊断再行动。下一步是把诊断变成大家共同可验收的议程。"
          }</p>
          <section class="coach-prompts" aria-label="${this.language === "en" ? "Coach follow-up questions" : "教练追问"}" role="region">
            <h2>${this.language === "en" ? "Coach Follow-Ups & Group Discussion" : "教练追问 · 小组讨论引导"}</h2>
            <p class="muted">${this.language === "en" ? "Project these questions in a workshop to invite peer reflection." : "工作坊可直接投影这些问题，引导学员互评。"}</p>
            <ul>
              ${this.coachPromptMarkup(decision)}
            </ul>
          </section>
          <div class="certification-badge ${cert.passed ? "passed" : ""}">
            <span>${this.language === "en" ? "Certification" : "能力认证"}</span>
            <strong>${cert.passed ? (this.language === "en" ? `Certified · ${cert.level}` : `认证通过 · ${cert.level}`) : (this.language === "en" ? `Not Certified · ${cert.next}` : `未认证 · ${cert.next}`)}</strong>
          </div>
          <div class="cert-details">
            <p>${this.language === "en" ? "Requirements: assessment score and role focus abilities." : "认证条件：测评总分与角色重点能力合计。"}</p>
            <p><strong>${this.language === "en" ? "Assessment" : "测评总分"}</strong> ${cert.score}/42 · <strong>${this.language === "en" ? "Focus abilities" : "重点能力"}</strong> ${ROLES[this.save.profile.role].focusAbilities.reduce((sum, id) => sum + abilityLevel(this.save.profile.abilities[id]), 0)}/30</p>
            <ul>
              ${ROLES[this.save.profile.role].focusAbilities
                .map(
                  (id) =>
                    `<li>${abilityDisplay(this.language, id).name} Lv.${abilityLevel(this.save.profile.abilities[id])}</li>`
                )
                .join("")}
            </ul>
            <button data-action="apply-certification">${this.language === "en" ? "Apply for Certification" : "申请认证"}</button>
            <button data-action="certification-help">${this.language === "en" ? "How Certification Points Work" : "认证点如何获得"}</button>
          </div>
          <button data-action="reset-profile">${this.t("resetProfile")}</button>
          <button data-action="export-save">${this.t("exportSave")}</button>
          <button data-action="export-report">${this.t("exportReport")}</button>
          <button data-action="copy-save-link">${this.t("copySaveLink")}</button>
          <p class="save-reminder">${this.language === "en" ? "This save lives only in this browser. Export or copy the link regularly." : "本存档仅保存在当前浏览器，请定期导出或复制链接。"}</p>
          <button data-action="export-report-card">${this.language === "en" ? "Generate Report Card" : "生成报告卡片"}</button>
          <canvas id="report-card-canvas" width="900" height="520" hidden></canvas>
          ${
            ONLINE_ENABLED
              ? ""
              : `<p class="static-lock-note">${this.language === "en" ? "Static build keeps this content: account, cloud save, leaderboard and auto-match are bundled but need the online build plus backend. Local alternatives stay available: export save, copy link, local duo, manual WebRTC." : "静态版已保留这部分内容：账号、云存档、排行榜、云端自动匹配代码均已内置，但需在线版与后端才可启用。本地仍可用：导出存档、复制存档链接、本地双人、手动远程对战。"}</p>`
          }
          <button class="online-only" data-action="cloud-sync" ${ONLINE_ENABLED ? "" : "disabled"} title="${ONLINE_ENABLED ? "" : (this.language === "en" ? "Demo locked in static build" : "静态版演示锁定")}">${this.t("cloudSync")}${ONLINE_ENABLED ? "" : (this.language === "en" ? " (Demo)" : "（演示）")}</button>
          <button class="online-only" data-action="cloud-load" ${ONLINE_ENABLED ? "" : "disabled"} title="${ONLINE_ENABLED ? "" : (this.language === "en" ? "Demo locked in static build" : "静态版演示锁定")}">${this.t("cloudLoad")}${ONLINE_ENABLED ? "" : (this.language === "en" ? " (Demo)" : "（演示）")}</button>
          <button class="online-only" data-action="cloud-leaderboard" ${ONLINE_ENABLED ? "" : "disabled"} title="${ONLINE_ENABLED ? "" : (this.language === "en" ? "Demo locked in static build" : "静态版演示锁定")}">${this.t("cloudLeaderboard")}${ONLINE_ENABLED ? "" : (this.language === "en" ? " (Demo)" : "（演示）")}</button>
          <div class="account-panel online-only">
            <h2>${this.t("accountTitle")}</h2>
            ${
              this.cloudAccountName
                ? `<p class="account-name">${this.t("accountName")}：${escapeHtml(this.cloudAccountName)}</p>`
                : ""
            }
            <input data-login-token placeholder="${this.t("accountToken")}" value="${escapeAttr(this.cloudToken)}" ${ONLINE_ENABLED ? "" : "disabled"} />
            <input data-recovery-code placeholder="${this.t("accountRecovery")}" value="${escapeAttr(this.cloudRecoveryCode)}" ${ONLINE_ENABLED ? "" : "disabled"} />
            <small class="account-recovery-note">${this.t("accountRecoveryNote")}</small>
            <input data-account-username placeholder="${this.t("accountUsername")}" ${ONLINE_ENABLED ? "" : "disabled"} />
            <input data-account-password type="password" placeholder="${this.t("accountPassword")}" ${ONLINE_ENABLED ? "" : "disabled"} />
            <div class="account-actions">
              <button data-action="cloud-login-password" ${ONLINE_ENABLED ? "" : "disabled"}>${this.t("accountPasswordLogin")}</button>
              <button data-action="cloud-login-token" ${ONLINE_ENABLED ? "" : "disabled"}>${this.t("accountLogin")}</button>
              <button data-action="cloud-login-recovery" ${ONLINE_ENABLED ? "" : "disabled"}>${this.t("accountRecoveryLogin")}</button>
              <button data-action="cloud-register" ${ONLINE_ENABLED ? "" : "disabled"}>${this.t("cloudSync")}</button>
              <button data-action="cloud-logout" ${ONLINE_ENABLED ? "" : "disabled"}>${this.t("accountLogout")}</button>
            </div>
          </div>
          <span class="cloud-status online-only" role="status" aria-live="polite">${this.cloudStatus}</span>
          ${
            this.cloudConflict
              ? `
                <div class="cloud-conflict">
                  <p>${this.language === "en" ? "Local and cloud progress differ. Choose which version to keep." : "检测到本地与云端进度不一致，请选择保留哪一份。"}</p>
                  <button data-action="cloud-use-remote">${this.language === "en" ? "Use Cloud Save" : "使用云端存档"}</button>
                  <button data-action="cloud-force-local">${this.language === "en" ? "Upload Local Anyway" : "仍要上传本地"}</button>
                </div>
              `
              : ""
          }
          <label class="file-button">
            ${this.t("importSave")}
            <input type="file" data-import-save accept="application/json" hidden />
          </label>
        </section>
        <section class="local-leaderboard">
          <h3>${this.language === "en" ? "Local Leaderboard" : "本地排行榜"}</h3>
          <p>${this.language === "en" ? `Best Duel Score: ${this.save.bestScore ?? 0} 路 Wins ${this.save.duelWins} 路 Losses ${this.save.duelLosses}` : `最佳对局分：${this.save.bestScore ?? 0} 路 胜 ${this.save.duelWins} 路 负 ${this.save.duelLosses}`}</p>
          ${
            this.save.duelHistory.length
              ? `<ul>${this.save.duelHistory
                  .slice(-5)
                  .reverse()
                  .map(
                    (entry) =>
                      `<li>${escapeHtml(entry.opponentName)} 路 ${entry.playerScore}:${entry.opponentScore} 路 ${entry.won ? (this.language === "en" ? "Win" : "胜") : (this.language === "en" ? "Loss" : "负")}</li>`
                  )
                  .join("")}</ul>`
              : `<p class="muted">${this.language === "en" ? "Finish a duel to see local records." : "完成一局对战后会显示本地记录。"}</p><button data-action="open-duel">${this.language === "en" ? "Play a Duel" : "去打一局"}</button>`
          }
        </section>
        ${this.dueReviewMarkup()}
        ${this.reviewBoardMarkup()}
        <section class="wrong-answer-review">
          <h3>${this.language === "en" ? "Judgment Review (Missed Expert Moves)" : "判断错题集（未选专家项）"}</h3>
          ${
            this.wrongAnswerMarkup()
              ? `<div class="wrong-answer-list">${this.wrongAnswerMarkup()}</div><button class="wrong-review-cta" data-action="open-wrong-review">${this.language === "en" ? "Review All Missed Moves" : "一键回练错题"}</button>`
              : `<p class="muted">${this.language === "en" ? "No missed expert moves yet. Keep choosing deliberately." : "暂无错选，继续保持有意识判断。"}</p>`
          }
        </section>
        <section class="stat-tiles">
          <div class="stat-tile">
            <strong>${decision.counts.expert}</strong>
            <span>${this.language === "en" ? "Expert Decisions" : "专家级决策"}</span>
          </div>
          <div class="stat-tile">
            <strong>${decision.counts.partial}</strong>
            <span>${this.language === "en" ? "Partially Effective" : "部分有效"}</span>
          </div>
          <div class="stat-tile">
            <strong>${decision.counts.risk}</strong>
            <span>${this.language === "en" ? "High-Risk Responses" : "高风险应对"}</span>
          </div>
          <div class="stat-tile">
            <strong>${decision.totalScore}</strong>
            <span>${this.language === "en" ? "Decision Score" : "决策总分"}</span>
          </div>
          <div class="stat-tile">
            <strong>${this.save.completedRandomEvents.length}</strong>
            <span>${this.language === "en" ? "Random Events" : "随机事件"}</span>
          </div>
        </section>
        ${
          this.cloudEntries.length
            ? `
              <section class="cloud-leaderboard online-only">
                <h2>${this.language === "en" ? "Cloud Leaderboard" : "云端排行榜"}</h2>
                <div class="cloud-leaderboard-list">
                  ${this.cloudEntries
                    .slice(0, 10)
                    .map(
                      (entry, index) => `
                        <div class="cloud-rank-row">
                          <span>${index + 1}</span>
                          <strong>${escapeHtml(entry.name)}</strong>
                          <em>${ROLES[entry.role as RoleId]?.shortName ?? entry.role}</em>
                          <small>${entry.score}${entry.percentile !== undefined ? ` · P${entry.percentile}` : ""}</small>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              </section>
            `
            : ""
        }
        <section class="duel-history">
          <h2>${this.language === "en" ? "Recent Duels" : "近期对决"}</h2>
          ${
            this.save.duelHistory.length === 0
              ? `<p class="muted">${this.language === "en" ? "No duels yet. Results are saved automatically after a match." : "还没有对决记录，进入 1v1 后会自动保存。"}</p>`
              : `
                <div class="duel-history-list">
                  ${this.save.duelHistory
                    .slice(-5)
                    .reverse()
                    .map(
                      (entry) => `
                        <div class="duel-history-row ${entry.won ? "won" : "lost"}">
                          <span>${entry.won ? (this.language === "en" ? "Win" : "胜") : (this.language === "en" ? "Loss" : "负")}</span>
                          <strong>${escapeHtml(entry.opponentName)}</strong>
                          <em>${entry.playerScore} : ${entry.opponentScore}</em>
                          <small>${new Date(entry.timestamp).toLocaleDateString()}</small>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              `
          }
        </section>
        <section class="report-grid">
          <div class="report-panel">
            <h2>${this.language === "en" ? "Strengths" : "优势能力"}</h2>
            ${
              strengths.length
                ? strengths
                    .map(
                      (id) => `
                        <div class="strength-row">
                          <span style="--dot:${ABILITIES[id].color}"></span>
                          <strong>${abilityDisplay(this.language, id).name}</strong>
                          <small>${abilityDisplay(this.language, id).tagline}</small>
                        </div>
                      `
                    )
                    .join("")
                : `<p class="muted">${this.language === "en" ? "Continue the campaign to bring an ability into the fourth rank." : "继续推进主线，先让能力进入第四段位。"}</p>`
            }
          </div>
          <div class="report-panel">
            <h2>${this.language === "en" ? "Recommended Training" : "建议训练"}</h2>
            ${gaps
              .map(
                (id) => `
                  <div class="training-item compact">
                    <span style="--dot:${ABILITIES[id].color}"></span>
                    <strong>${abilityDisplay(this.language, id).name}</strong>
                    <p>${abilityDisplay(this.language, id).tagline}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
        <section class="chapter-report">
          <h2>${this.language === "en" ? "Chapter Performance" : "章节表现"}</h2>
          <div class="chapter-report-list">
            ${chapterReports
              .map(
                (item) => `
                  <div class="chapter-report-row">
                    <span>${item.chapter.code}</span>
                    <strong>${chapterDisplay(this.language, item.chapter).title}</strong>
                    <div class="stars">${"★".repeat(item.stars)}${"☆".repeat(3 - item.stars)}</div>
                    <small>${item.done ? (this.language === "en" ? "Complete" : "已完成") : (this.language === "en" ? "Incomplete" : "未完成")}</small>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
        ${this.endingMarkup()}
      </main>
    `;
  }

  private wireTrainingLinks(): void {
    const recommended = recommendedTraining(
      this.save.profile.abilities,
      this.save.profile.role
    );
    this.root
      .querySelectorAll<HTMLElement>(".training-item")
      .forEach((item, index) => {
        const id = recommended[index];
        if (id) {
          item.classList.add("training-link");
          item.setAttribute("data-action", "open-training");
          item.setAttribute("data-ability", id);
        }
      });
    this.root
      .querySelectorAll<HTMLElement>(".ability-card")
      .forEach((card, index) => {
        const id = ABILITY_ORDER[index];
        if (!card.querySelector(".ability-training-button")) {
          const button = document.createElement("button");
          button.className = "ability-training-button";
          button.textContent =
            this.language === "en" ? "Start Training" : "进入训练";
          button.dataset.action = "open-training";
          button.dataset.ability = id;
          card.appendChild(button);
        }
      });
  }

  private trainingDisplay(path: ExpandedAbilityTraining): ExpandedAbilityTrainingEn {
    return this.language === "en" ? EXPANDED_TRAINING_EN[path.abilityId] : path;
  }

  private trainingMasteryLabel(correct: number, total: number): string {
    if (correct === total) return this.t("trainingMastered");
    if (correct >= Math.ceil(total / 2)) return this.t("trainingBasic");
    return this.t("trainingReviewNeeded");
  }

  private renderTraining(): void {
    const path = EXPANDED_TRAINING[this.trainingAbilityId];
    const view = this.trainingDisplay(path);
    const en = this.language === "en";
    const ability = abilityDisplay(this.language, this.trainingAbilityId);
    const exp = this.save.profile.abilities[this.trainingAbilityId];
    const done = this.save.completedTraining.includes(this.trainingAbilityId);
    const best = this.save.trainingScores[this.trainingAbilityId] ?? 0;
    const role = this.save.profile.role;

    if (this.trainingStage === "quiz") {
      const question = view.questions[this.trainingStep];
      const selected = this.trainingAnswers[this.trainingStep];
      const last = this.trainingStep === view.questions.length - 1;
      this.root.innerHTML = `
        <header class="topbar">
          <div class="brand">${this.t("brand")}</div>
          <button class="link" data-action="training-back">${en ? "Back" : "返回"}</button>
        </header>
        <main class="training-shell training-quiz-shell" aria-label="${this.t("trainingQuiz")}">
          <section class="training-quiz-head">
            <div>
              <p class="eyebrow">${this.t("trainingQuiz")}</p>
              <h1>${ability.name} · ${escapeHtml(view.routeTitle)}</h1>
            </div>
            <strong>${this.trainingStep + 1} / ${view.questions.length}</strong>
          </section>
          <div class="assessment-bar"><i style="width:${((this.trainingStep + 1) / view.questions.length) * 100}%"></i></div>
          <section class="training-question">
            <h2>${escapeHtml(question.prompt)}</h2>
            <div class="training-options">
              ${question.options
                .map(
                  (option, index) => `
                    <button class="training-option ${selected === index ? "selected" : ""}" data-action="training-option" data-option="${index}">
                      ${escapeHtml(option.label)}
                    </button>
                  `
                )
                .join("")}
            </div>
            <div class="training-actions">
              <button data-action="training-prev" ${this.trainingStep === 0 ? "disabled" : ""}>${this.t("trainingPrev")}</button>
              ${
                last
                  ? `<button class="primary" data-action="training-submit">${this.t("trainingSubmit")}</button>`
                  : `<button class="primary" data-action="training-next">${this.t("trainingNext")}</button>`
              }
            </div>
          </section>
        </main>
      `;
      return;
    }

    if (this.trainingStage === "result" && this.trainingResult) {
      const result = this.trainingResult;
      const masteryLabel = this.trainingMasteryLabel(result.correct, result.total);
      this.root.innerHTML = `
        <header class="topbar">
          <div class="brand">${this.t("brand")}</div>
          <button class="link" data-action="training-back">${en ? "Back" : "返回"}</button>
        </header>
        <main class="training-result-shell" aria-label="${this.t("trainingResult")}">
          <section class="training-result-hero">
            <p class="eyebrow">${this.t("trainingResult")}</p>
            <h1>${result.correct} / ${result.total}</h1>
            <div class="training-mastery-badge">${this.t("trainingMastery")} · ${masteryLabel}</div>
            <p class="muted">${this.t("trainingCorrect")} ${ability.name}</p>
            <div class="training-reward">
              <span>${this.t("trainingReward")}</span>
              <strong>+${result.gainedExp} ${ability.name}</strong>
              <small>${result.firstComplete ? (en ? "First completion reward" : "首次完成奖励") : (en ? "Review only; reward already claimed" : "复训仅复盘，奖励已领取")}</small>
            </div>
          </section>
          <section class="training-review">
            <h2>${this.t("trainingReview")}</h2>
            ${view.questions
              .map(
                (question, index) => `
                  <div class="training-review-card ${result.answered[index] ? "correct" : "wrong"}">
                    <span>${result.answered[index] ? "✓" : "×"}</span>
                    <div>
                      <h3>${escapeHtml(question.prompt)}</h3>
                      <p><strong>${en ? "Your answer: " : "你的选择："}</strong>${escapeHtml(question.options[this.trainingAnswers[index]].label)}</p>
                      <p><strong>${en ? "Correct: " : "正确做法："}</strong>${escapeHtml(question.options[question.answer].label)}</p>
                      <div class="training-solution">
                        <strong>${this.t("trainingSolved")}</strong>
                        <ol>
                          ${question.solutionSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
                        </ol>
                      </div>
                      <p class="reference-answer"><strong>${this.t("trainingReference")}</strong>${escapeHtml(question.referenceAnswer)}</p>
                      <em>${escapeHtml(question.options[question.answer].feedback)}</em>
                    </div>
                  </div>
                `
              )
              .join("")}
          </section>
          <div class="training-result-actions">
            <button data-action="training-restart">${en ? "Review the Lesson" : "重新学习"}</button>
            <button class="primary" data-action="open-ability">${en ? "Ability Map" : "能力图谱"}</button>
          </div>
        </main>
      `;
      return;
    }

    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="training-back">${en ? "Back" : "返回"}</button>
        <button class="link" data-action="open-ability">${en ? "Ability Map" : "能力图谱"}</button>
      </header>
      <main class="training-shell" aria-label="${this.t("trainingTitle")}">
        <section class="training-hero">
          <div>
            <p class="eyebrow">${this.t("trainingTitle")}</p>
            <h1>${escapeHtml(view.routeTitle)}</h1>
            <p class="muted">${escapeHtml(view.routeSummary)}</p>
            <div class="training-ability-tag" style="--dot:${ABILITIES[this.trainingAbilityId].color}">
              <strong>${ability.name} · Lv.${abilityLevel(exp)}</strong>
              <span>${done ? this.t("trainingCompleted") : `${this.t("trainingBest")} ${best} / ${view.questions.length}`}</span>
            </div>
          </div>
          <canvas class="training-board" id="training-board"></canvas>
        </section>
        <section class="training-flow">
          <div class="training-panel">
            <h2>${this.t("trainingProblem")}</h2>
            <p>${escapeHtml(view.problemPrompt)}</p>
          </div>
          <div class="training-panel">
            <h2>${this.t("trainingAnalogy")}</h2>
            <p>${escapeHtml(view.analogy)}</p>
          </div>
        </section>
        <section class="training-columns">
          <div class="training-panel training-route-panel">
            <h2>${this.t("trainingBreakdown")}</h2>
            <ol class="training-route">
              ${view.route.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
            </ol>
          </div>
          <div class="training-panel">
            <h2>${this.t("trainingApplication")}</h2>
            <ul class="training-points">
              ${view.applicationPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
            </ul>
          </div>
          <div class="training-panel training-formula-panel">
            <h2>${this.t("trainingFormula")}</h2>
            <h3>${escapeHtml(view.formula.name)}</h3>
            <code>${escapeHtml(view.formula.expression)}</code>
            <p>${escapeHtml(view.formula.explanation)}</p>
          </div>
        </section>
        <section class="training-panel role-application-panel">
          <h2>${this.t("trainingRoleApply")} · ${roleDisplay(this.language, role).name}</h2>
          <div class="role-apply-grid role-single">
            <div class="role-apply-card active">
              <strong>${roleDisplay(this.language, role).name}</strong>
              <p>${escapeHtml(view.roleApplications[role])}</p>
            </div>
          </div>
          <p class="role-split-note">${en ? "This lesson is scoped to your current role. Other-role strategies are not mixed in." : "当前训练只针对你的角色，不混入其他角色策略。"}</p>
        </section>
        <section class="training-panel worked-examples-panel">
          <h2>${this.t("trainingExamples")}</h2>
          <div class="worked-examples">
            ${view.workedExamples
              .map(
                (example) => `
                  <article>
                    <h3>${escapeHtml(example.title)}</h3>
                    <p>${escapeHtml(example.scenario)}</p>
                    <p class="application">${escapeHtml(example.application)}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
        <section class="training-panel training-story-panel">
          <div class="story-meta">
            <h2>${this.t("trainingStory")}</h2>
            <span>${escapeHtml(view.story.source)}</span>
          </div>
          <h3>${escapeHtml(view.story.title)}</h3>
          <p>${escapeHtml(view.story.scenario)}</p>
          <blockquote>${escapeHtml(view.story.lesson)}</blockquote>
          <section class="training-teach">
            <div>
              <h3>${this.t("trainingFormula")}</h3>
              <code>${escapeHtml(view.formula.expression)}</code>
              <p class="muted">${escapeHtml(view.formula.explanation)}</p>
            </div>
            <div>
              <h3>${this.t("trainingApplication")}</h3>
              <ul>
                ${view.applicationPoints
                  .map((point) => `<li>${escapeHtml(point)}</li>`)
                  .join("")}
              </ul>
            </div>
            <div>
              <h3>${this.t("trainingExamples")}</h3>
              ${
                view.workedExamples[0]
                  ? `
                    <p>${escapeHtml(view.workedExamples[0].scenario)}</p>
                    <p class="muted">${escapeHtml(view.workedExamples[0].application)}</p>
                  `
                  : ""
              }
            </div>
          </section>
          <section class="training-panel training-role-panel">
            <h2>${this.t("trainingRoleApply")} · ${roleDisplay(this.language, this.save.profile.role).name}</h2>
            <p>${escapeHtml(view.roleApplications[this.save.profile.role])}</p>
          </section>
          <button class="primary" data-action="training-start-quiz">${this.t("trainingStartQuiz")}</button>
        </section>
      </main>
    `;
    const board = this.root.querySelector<HTMLCanvasElement>("#training-board");
    if (board) {
      renderTrainingBoard(
        board,
        this.trainingAbilityId,
        exp,
        this.language === "en"
          ? `${ability.name} Training Path`
          : `${ability.name}训练路径`
      );
    }
  }


  private loadCoachDemo(): void {
    this.coachEngine.importParticipants(this.coachDemoParticipants());
    this.coachReport = this.coachEngine.generateReport(
      this.language === "en"
        ? "Leadership Training Demo Group"
        : "领导力训练演示小组"
    );
    this.audio.expert();
    this.renderCoach();
  }

  private importCoachParticipants(): void {
    const textarea = this.root.querySelector<HTMLTextAreaElement>(
      "textarea[data-coach-import]"
    );
    const raw = textarea?.value.trim() ?? "";
    if (!raw) {
      this.showToast(
        this.language === "en"
          ? "Paste participant saves as JSON first."
          : "请先粘贴学员存档 JSON。"
      );
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Array<{
        name: string;
        data: SaveState;
      }>;
      if (
        !Array.isArray(parsed) ||
        parsed.length === 0 ||
        parsed.some((item) => !item?.data?.profile)
      ) {
        throw new Error("invalid participants payload");
      }
      this.coachEngine.importParticipants(parsed);
      this.coachReport = this.coachEngine.generateReport(
        this.language === "en" ? "Imported Group" : "导入小组"
      );
      this.audio.expert();
      this.renderCoach();
      this.showToast(
        this.language === "en"
          ? `Imported ${parsed.length} participants.`
          : `已导入 ${parsed.length} 名学员。`
      );
    } catch {
      this.audio.risk();
      this.showToast(
        this.language === "en"
          ? "Invalid JSON. Expected [{ name, data }] with exported saves."
          : "JSON 格式无效：请使用 [{ name, data }]，data 为导出的存档。"
      );
    }
  }

  private coachDemoParticipants(): Array<{ name: string; data: SaveState }> {
    const nodeIds = ["c1n1", "c1n2", "c2n1", "c2n2", "c3n1", "c3n2"];
    const specs: Array<{
      name: string;
      role: RoleId;
      abilities: Record<AbilityId, number>;
      qualities: OptionQuality[];
    }> = [
      {
        name: "林岚",
        role: "parachute",
        abilities: {
          insight: 28,
          deploy: 16,
          mobilize: 12,
          strategy: 8,
          authority: 20,
          stability: 14,
          recovery: 10,
          execution: 24,
          structure: 18,
          communication: 22
        },
        qualities: ["expert", "expert", "partial", "risk", "expert", "partial"]
      },
      {
        name: "周屿",
        role: "founder",
        abilities: {
          insight: 12,
          deploy: 26,
          mobilize: 22,
          strategy: 18,
          authority: 24,
          stability: 10,
          recovery: 8,
          execution: 30,
          structure: 14,
          communication: 12
        },
        qualities: ["risk", "partial", "expert", "risk", "partial", "expert"]
      },
      {
        name: "许澄",
        role: "highPotential",
        abilities: {
          insight: 20,
          deploy: 10,
          mobilize: 18,
          strategy: 26,
          authority: 8,
          stability: 22,
          recovery: 20,
          execution: 14,
          structure: 28,
          communication: 30
        },
        qualities: ["partial", "risk", "partial", "expert", "partial", "risk"]
      }
    ];
    return specs.map((spec) => {
      const data = structuredClone(DEFAULT_SAVE);
      data.profileCreated = true;
      data.profile.name = spec.name;
      data.profile.role = spec.role;
      Object.assign(data.profile.abilities, spec.abilities);
      data.playCount = nodeIds.length;
      data.decisionHistory = nodeIds.map((nodeId, index) => {
        const quality = spec.qualities[index];
        return {
          nodeId,
          optionIndex: quality === "expert" ? 0 : quality === "partial" ? 1 : 2,
          quality,
          qualityScore:
            quality === "expert" ? 105 : quality === "partial" ? 55 : 20,
          chapterId: Number(nodeId[1])
        };
      });
      return { name: spec.name, data };
    });
  }

  private coachPlanMarkup(): string {
    const en = this.language === "en";
    if (this.coachPlanStep === "goal") {
      const goals = Object.entries(GOAL_TITLES) as Array<
        [CoachGoal, { zh: string; en: string; zhNote: string; enNote: string }]
      >;
      return `
        <div class="coach-plan-wizard">
          <h3>${en ? "Step 1 · Choose your 90-day goal" : "第 1 步 · 选择你的 90 天目标"}</h3>
          <div class="coach-plan-options">
            ${goals
              .map(
                ([key, info]) => `
                  <button data-action="coach-plan-goal" data-goal="${key}">
                    <strong>${en ? info.en : info.zh}</strong>
                    <span>${en ? info.enNote : info.zhNote}</span>
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      `;
    }
    if (this.coachPlanStep === "challenge") {
      const challenges = Object.entries(CHALLENGE_TITLES) as Array<
        [
          CoachChallenge,
          { zh: string; en: string; zhNote: string; enNote: string }
        ]
      >;
      return `
        <div class="coach-plan-wizard">
          <h3>${en ? "Step 2 · Which challenge must the plan solve first?" : "第 2 步 · 计划必须优先解决哪个挑战？"}</h3>
          <div class="coach-plan-options">
            ${challenges
              .map(
                ([key, info]) => `
                  <button data-action="coach-plan-challenge" data-challenge="${key}">
                    <strong>${en ? info.en : info.zh}</strong>
                    <span>${en ? info.enNote : info.zhNote}</span>
                  </button>
                `
              )
              .join("")}
          </div>
          <button class="link" data-action="coach-plan-restart">${en ? "Restart" : "重新开始"}</button>
        </div>
      `;
    }
    if (!this.coachPlan) {
      return `<p class="muted">${en ? "Generate your plan first." : "请先生成你的计划。"}</p>`;
    }
    const plan = this.coachPlan;
    return `
      <div class="coach-plan-result">
        <p class="muted">${en ? plan.summaryEn : plan.summaryZh}</p>
        <div class="coach-plan-phases">
          ${plan.phases
            .map(
              (phase, phaseIndex) => `
                <article class="coach-plan-phase">
                  <p class="eyebrow">${en ? phase.days : phase.days}</p>
                  <h3>${en ? phase.titleEn : phase.titleZh}</h3>
                  <p>${en ? phase.focusEn : phase.focusZh}</p>
                  <ol>
                    ${(en ? phase.actionsEn : phase.actionsZh)
                      .map(
                        (action, actionIndex) => {
                          const key = `phase-${phaseIndex}-${actionIndex}`;
                          const done = Boolean(this.coachPlanChecks[key]);
                          return `<li><button class="${done ? "done" : ""}" data-action="coach-plan-check" data-key="${key}">${done ? "✔ " : ""}${escapeHtml(action)}</button></li>`;
                        }
                      )
                      .join("")}
                  </ol>
                  <p class="coach-plan-weekly"><strong>${en ? "Weekly" : "每周"}</strong> ${en ? phase.weeklyEn : phase.weeklyZh}</p>
                  <p class="coach-plan-checkpoint"><strong>${en ? "Checkpoint" : "检查点"}</strong> ${en ? phase.checkpointEn : phase.checkpointZh}</p>
                  <p class="coach-plan-question">${en ? phase.questionEn : phase.questionZh}</p>
                </article>
              `
            )
            .join("")}
        </div>
        <p class="coach-plan-metrics">${en ? plan.metricEn : plan.metricZh}</p>
        <div class="coach-plan-actions">
          <button data-action="coach-plan-restart">${en ? "Rebuild Plan" : "重新生成"}</button>
          <button data-action="open-report">${en ? "Open Review" : "打开复盘报告"}</button>
        </div>
      </div>
    `;
  }

  private liveMarkup(): string {
    const en = this.language === "en";
    const scenarioOptions = [
      `<option value="c1n1">${escapeHtml(storyNodeDisplay(this.language, this.save,getNode("c1n1")).title)}</option>`,
      `<option value="c1n2">${escapeHtml(storyNodeDisplay(this.language, this.save,getNode("c1n2")).title)}</option>`,
      ...this.customScenarios.map(
        (scenario) =>
          `<option value="${escapeAttr(scenario.id)}">${escapeHtml(scenario.title)}</option>`
      )
    ].join("");
    let sessionMarkup = "";
    const node = this.liveNode;
    if (node && this.liveSessionId) {
      const session = this.liveRunner.getSession(this.liveSessionId);
      const picks = session ? [...session.participantPicks.entries()] : [];
      const expertIndex = node.options.findIndex(
        (option) => option.quality === "expert"
      );
      const expert = node.options[expertIndex];
      const participantList = picks
        .map(
          ([name, optionIndex]) =>
            `<li>${escapeHtml(name)} · ${escapeHtml(node.options[optionIndex]?.label ?? "")}</li>`
        )
        .join("");
      const optionButtons = node.options
        .map(
          (option, index) =>
            `<button class="${index === this.livePendingOption ? "active" : ""}" data-action="live-pick" data-option="${index}">${escapeHtml(option.label)}</button>`
        )
        .join("");
      const distributionMarkup =
        this.liveRevealed && this.liveDistribution
          ? `<div class="live-distribution">
              ${node.options
                .map((option, index) => {
                  const count = this.liveDistribution?.get(index) ?? 0;
                  const total = picks.length || 1;
                  const pct = Math.round((count / total) * 100);
                  return `
                    <div class="live-bar-row">
                      <span>${escapeHtml(option.label)}</span>
                      <div class="live-bar"><i style="width:${pct}%"></i></div>
                      <small>${count}/${picks.length} · ${pct}%</small>
                    </div>
                  `;
                })
                .join("")}
              ${expert ? `<p class="expert-ref">${en ? "Expert baseline" : "专家基准"}：${escapeHtml(expert.label)}</p>` : ""}
            </div>`
          : "";
      sessionMarkup = `
        <div class="live-session">
          <h3>${escapeHtml(node.title)}</h3>
          <p>${escapeHtml(node.context)}</p>
          <div class="live-pick-row">
            <input name="live-name" value="${escapeAttr(this.liveName)}" placeholder="${en ? "Participant name" : "学员姓名"}" />
            <div class="live-options">${optionButtons}</div>
          </div>
          <button data-action="live-add">${en ? "Add Participant" : "添加学员"}</button>
          <ul class="live-participants">${participantList || `<li class="muted">${en ? "No picks yet." : "还没有学员提交。"}</li>`}</ul>
          <button class="primary" data-action="live-reveal" ${picks.length ? "" : "disabled aria-disabled=\"true\""}>${en ? "Reveal & Compare" : "揭示并对比"}</button>
          ${distributionMarkup}
          <button data-action="live-reset">${en ? "End Session" : "结束推演"}</button>
        </div>
      `;
    }
    return `
      <section class="coach-live-panel">
        <h2>${en ? "Live Scenario Exercise" : "实时情境推演"}</h2>
        <p class="muted">${en ? "Choose a scenario, collect participant picks on one screen, then reveal the group distribution and compare it with the expert baseline." : "选择一个情境，在同一屏幕收集学员选择，再揭示小组分布并与专家基准对比。"}</p>
        <label>${en ? "Scenario" : "情境"}<select data-live-scenario>${scenarioOptions}</select></label>
        <button data-action="live-create">${en ? "Create Session" : "创建推演"}</button>
        ${sessionMarkup}
      </section>
    `;
  }

  private renderCoach(): void {
    const en = this.language === "en";
    const report = this.coachReport;
    const personal = this.save.profileCreated
      ? this.coachEngine.generatePersonalReport(this.save)
      : undefined;
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-menu">${this.t("returnHome")}</button>
      </header>
      <main class="coach-shell" aria-label="${en ? "Coach Workshop" : "教练工作坊"}">
        <section class="coach-hero">
          <div>
            <p class="eyebrow">${en ? "Coach Workshop" : "教练工作坊"}</p>
            <h1>${en ? "Turn team saves into a facilitated workshop" : "把学员存档变成一场可执行的工作坊"}</h1>
            <p class="muted">${en ? "Import exported saves, compare the group radar, surface decision blind spots, and follow a ready-made facilitation plan." : "导入导出的存档，对比小组能力雷达，定位决策盲区，并按照内置流程主持工作坊。"}</p>
          </div>
          <div class="coach-status">
            <strong>${this.coachEngine.participants.length}</strong>
            <span>${en ? "Participants" : "已导入学员"}</span>
          </div>
        </section>

        <section class="coach-personal-panel">
          <div class="coach-personal-head">
            <div>
              <p class="eyebrow">${en ? "My Coach Card" : "我的教练卡"}</p>
              <h2>${en ? "Based on your own save" : "基于你的真实存档生成"}</h2>
              <p class="muted">${en ? "Your abilities, decision style, and missed moves are turned into three concrete next steps." : "你的能力、决策风格和错过的关键选择，会直接变成三个可执行的下一步。"}</p>
            </div>
            ${
              personal
                ? `<div class="coach-personal-name"><strong>${escapeHtml(personal.name)}</strong><span>${roleDisplay(this.language, personal.role).name}</span></div>`
                : `<p class="muted">${en ? "Create a profile and make decisions first." : "先创建档案并完成决策，这里才会生成你的教练卡。"}</p>`
            }
          </div>
          ${
            personal
              ? `
                <div class="coach-personal-grid">
                  <div class="coach-card">
                    <h3>${en ? "Strengths" : "优势能力"}</h3>
                    ${personal.strengths
                      .map((id) => {
                        const ability = abilityDisplay(this.language, id);
                        const level = abilityLevel(this.save.profile.abilities[id]);
                        return `<p><span style="--dot:${ABILITIES[id].color}"></span>${ability.name} <strong>Lv.${level}</strong></p>`;
                      })
                      .join("")}
                  </div>
                  <div class="coach-card">
                    <h3>${en ? "Focus Next" : "下一步聚焦"}</h3>
                    ${personal.focus
                      .map((id) => {
                        const ability = abilityDisplay(this.language, id);
                        return `<button data-action="open-training" data-ability="${id}">${ability.name} · ${ability.tagline}</button>`;
                      })
                      .join("")}
                  </div>
                  <div class="coach-card">
                    <h3>${en ? "Decision Style" : "决策风格"}</h3>
                    <p>${en ? "Expert" : "专家"} ${personal.decisionProfile.expert} · ${en ? "Balanced" : "稳健"} ${personal.decisionProfile.partial} · ${en ? "Risk" : "风险"} ${personal.decisionProfile.risk}</p>
                    <p class="muted">${en ? `Total ${personal.decisionProfile.total} decisions` : `共 ${personal.decisionProfile.total} 次决策`}</p>
                  </div>
                  <div class="coach-card">
                    <h3>${en ? "Missed Moves" : "错过的好棋"}</h3>
                    ${
                      personal.blindSpotNodes.length
                        ? personal.blindSpotNodes
                            .map(
                              (spot) =>
                                `<p><strong>${escapeHtml(spot.nodeTitle)}</strong><small>${roleMove(this.language, this.save.profile.role,spot.quality)}</small></p>`
                            )
                            .join("")
                        : `<p class="muted">${en ? "No missed moves yet." : "暂未发现明显失误。"}</p>`
                    }
                  </div>
                </div>
                <div class="coach-action-plan">
                  <h3>${en ? "30-Day Action Plan" : "30 天行动计划"}</h3>
                  <ol>
                    ${personal.actionPlan
                      .map((action, index) => {
                        const label =
                          action.action === "train"
                            ? en
                              ? `Train ${abilityDisplay(this.language, action.ability ?? "insight").name}`
                              : `训练 ${abilityDisplay(this.language, action.ability ?? "insight").name}`
                            : action.action === "review"
                              ? en
                                ? "Review a missed scenario"
                                : "回看错过的情境"
                              : en
                                ? "Practice in a 1v1 duel"
                                : "用 1v1 对练巩固";
                        const dataAttr =
                          action.action === "train"
                            ? `data-action="open-training" data-ability="${action.ability ?? "insight"}"`
                            : action.action === "review"
                              ? `data-action="open-report"`
                              : `data-action="open-duel"`;
                        return `<li><button ${dataAttr}>${index + 1}. ${escapeHtml(label)}</button></li>`;
                      })
                      .join("")}
                  </ol>
                </div>
              `
              : ""
          }
        </section>

        <section class="coach-plan-panel">
          <h2>${en ? "Solo 90-Day Action Plan" : "单人 90 天行动计划"}</h2>
          <p class="muted">${en ? "Answer two questions, and the coach will generate an adaptive plan from your role, ability gaps, leadership profile, decision trajectory, and training progress." : "回答两个问题，教练会根据你的角色、能力短板、领导力画像、决策轨迹和训练进度生成自适应计划。"}</p>
          ${this.coachPlanMarkup()}
        </section>

        <section class="coach-import-panel">
          <h2>${en ? "Group Workshop Mode" : "小组工作坊模式（教练 / 培训师用）"}</h2>
          <p class="muted">${en ? "For trainers: import exported saves, compare group radar, and follow the facilitation plan." : "面向教练与培训师：导入学员存档，对比小组能力雷达，并按内置流程主持工作坊。"}</p>
          <textarea data-coach-import rows="4" placeholder='[{"name":"学员A","data":{}}]'></textarea>
          <div class="coach-import-actions">
            <button class="primary" data-action="coach-load-demo">${en ? "Load Demo Group" : "载入演示小组"}</button>
            <button data-action="coach-import">${en ? "Import & Generate" : "导入并生成"}</button>
          </div>
        </section>
        ${this.liveMarkup()}

        ${
          report
            ? `
              <section class="coach-report">
                <div class="coach-report-head">
                  <div>
                    <h2>${escapeHtml(report.groupName)}</h2>
                    <p class="muted">${en ? `${report.participantCount} participants · generated ${new Date(report.generatedAt).toLocaleTimeString()}` : `${report.participantCount} 名学员 · 生成于 ${new Date(report.generatedAt).toLocaleTimeString()}`}</p>
                  </div>
                </div>
                <div class="coach-radar-wrap">
                  <h3>${en ? "Group Radar" : "小组能力雷达"}</h3>
                  <canvas class="coach-radar" id="coach-radar" aria-label="${en ? "Group ability radar chart" : "小组能力雷达图"}"></canvas>
                  <p class="muted">${en ? "Band = min/max · line = median · gold dots = average" : "色带 = 最低/最高 · 折线 = 中位数 · 金点 = 平均"}</p>
                </div>
                <div class="coach-section">
                  <h3>${en ? "Decision Blind Spots" : "决策盲区"}</h3>
                  ${
                    report.blindSpots.length
                      ? `<div class="coach-blind-grid">${report.blindSpots
                          .map(
                            (spot) => `
                              <article class="coach-blind-card">
                                <strong>${escapeHtml(spot.nodeTitle)}</strong>
                                <small>${en ? "Expert" : "专家"} ${Math.round(spot.expertRate * 100)}% · ${en ? "Risk" : "风险"} ${Math.round(spot.riskRate * 100)}% · ${spot.totalAttempts} ${en ? "attempts" : "次尝试"}</small>
                                <p>${escapeHtml(spot.insight)}</p>
                              </article>
                            `
                          )
                          .join("")}</div>`
                      : `<p class="muted">${en ? "No blind spots found yet. Add more decisions." : "暂未发现明显盲区，继续积累决策即可。"}</p>`
                  }
                </div>
                <div class="coach-section">
                  <h3>${en ? "Discussion Prompts" : "讨论引导"}</h3>
                  <ul class="coach-discussion">
                    ${report.discussionQuestions
                      .map(
                        (item) => `
                          <li>
                            <strong>${escapeHtml(item.question)}</strong>
                            <p class="muted">${escapeHtml(item.evidence)}</p>
                            <p>${escapeHtml(item.facilitation)}</p>
                          </li>
                        `
                      )
                      .join("")}
                  </ul>
                </div>
                <div class="coach-section coach-scenario-row">
                  <div>
                    <h3>${en ? "Consensus" : "高度一致"}</h3>
                    ${report.consensusScenarios.length ? `<ul>${report.consensusScenarios.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>` : `<p class="muted">-</p>`}
                  </div>
                  <div>
                    <h3>${en ? "Divergence" : "分歧最大"}</h3>
                    ${report.divergenceScenarios.length ? `<ul>${report.divergenceScenarios.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>` : `<p class="muted">-</p>`}
                  </div>
                </div>
                <div class="coach-section">
                  <h3>${en ? "Growth Trajectory" : "成长轨迹"}</h3>
                  <div class="coach-trajectory">
                    ${report.growthTrajectory
                      .map(
                        (item) => `
                          <div class="coach-trajectory-row">
                            <strong>${escapeHtml(item.name)}</strong>
                            <span class="trajectory-${item.trajectory}">${en ? item.trajectory : item.trajectory === "rising" ? "上升" : item.trajectory === "plateau" ? "平稳" : "下滑"}</span>
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                </div>
                <div class="coach-section">
                  <h3>${en ? "Workshop Plan" : "工作坊流程"}</h3>
                  <ol class="coach-plan">
                    ${report.workshopPlan
                      .map(
                        (session) => `
                          <li>
                            <strong>${escapeHtml(session.phase)} · ${session.duration}min</strong>
                            <p>${escapeHtml(session.activity)}</p>
                            <p class="muted">${escapeHtml(session.facilitationNotes)}</p>
                          </li>
                        `
                      )
                      .join("")}
                  </ol>
                </div>
              </section>
            `
            : ""
        }
      </main>
    `;
    const radar = this.root.querySelector<HTMLCanvasElement>("#coach-radar");
    if (radar && report) {
      renderGroupRadar(radar, report.groupRadar);
    }
  }

  private renderTrial(): void {
    const en = this.language === "en";
    const energy = this.save.trialEnergy;
    const hp = this.save.trialHp;
    const items = this.save.trialItems;
    const capital = this.save.profile.resources.capital;
    const influence = this.save.profile.resources.influence;
    const trust = this.save.profile.resources.trust;
    const accelerator = this.save.trialAcceleratorLevel;
    const restDone =
      this.save.lastTrialEnergyDate ===
      new Date().toISOString().slice(0, 10);
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-menu">${this.t("returnHome")}</button>
      </header>
      <main class="trial-shell" aria-label="${this.t("trialTitle")}">
        <section class="trial-hero">
          <div>
            <p class="eyebrow">${this.t("trialTitle")}</p>
            <h1>${en ? "Grow through battles, not questionnaires" : "不是问卷，是打怪升级"}</h1>
            <p class="muted">${en ? "Clear gates with ability levels, spend energy on battles, and unlock loot, companions, and MBA cases." : "用能力门槛解锁关卡，消耗精力值挑战守关者，获得道具、同伴和 MBA 高难案例。"}</p>
          </div>
          <div class="trial-energy-panel">
            <span>${this.t("trialEnergy")}</span>
            <strong>${energy} / 100</strong>
            <div class="trial-energy-bar"><i style="width:${energy}%"></i></div>
            <strong>${this.t("trialHp")} ${hp} / 100</strong>
            <div class="trial-energy-bar hp-bar"><i style="width:${hp}%"></i></div>
            <div class="trial-energy-actions">
              <button data-action="trial-rest" ${restDone ? "disabled" : ""}>${this.t("trialRest")} +30</button>
              <button data-action="trial-buy-energy" ${capital < 15 || energy >= 100 ? "disabled" : ""}>${this.t("trialBuyEnergy")} -15</button>
              <button data-action="trial-buy-energy-influence" ${influence < 25 || energy >= 100 ? "disabled" : ""}>${this.t("trialBuyEnergyInfluence")} -25</button>
              <button data-action="trial-invest-accelerator" ${accelerator >= 3 || capital < 40 + accelerator * 20 ? "disabled" : ""}>${this.t("trialAccelerator")} Lv.${accelerator} -${40 + accelerator * 20}</button>
              <button data-action="trial-hire-ally" ${trust < 20 || this.save.trialItems.includes("临时同伴") ? "disabled" : ""}>${this.t("trialAllyHire")} -20</button>
            </div>
            <small>${accelerator > 0 ? `${this.t("trialAcceleratorActive")} Lv.${accelerator}` : this.t("trialBuyCost")} 15 · ${capital} · ${influence} · ${trust}</small>
          </div>
        </section>
        <section class="trial-morale-panel">
          <strong>${en ? "Morale" : "士气"}</strong>
          <div class="trial-energy-bar"><i style="width:${this.save.morale ?? 75}%"></i></div>
          <small>${en ? "Resilience and adversity choices move morale." : "韧性值与困境选择会改变士气。"}</small>
        </section>
        ${
          this.activePracticeTaskId
            ? (() => {
                const task = PRACTICE_TASKS.find(
                  (item) => item.id === this.activePracticeTaskId
                );
                if (!task) return "";
                return `
                  <section class="practice-editor">
                    <h2>${escapeHtml(task.title)}</h2>
                    <p>${escapeHtml(task.action)}</p>
                    <textarea data-practice-result rows="5" placeholder="${this.t("practiceHint")}"></textarea>
                    <button class="primary" data-action="practice-submit">${this.t("practiceSubmit")}</button>
                  </section>
                `;
              })()
            : ""
        }
        <section class="trial-next-step">
          <h2>${this.t("nextStepTitle")}</h2>
          <p>${escapeHtml(this.nextActionAdvice().text)}</p>
          ${
            this.nextActionAdvice().action
              ? `<button data-action="${this.nextActionAdvice().action}" ${this.nextActionAdvice().ability ? `data-ability="${this.nextActionAdvice().ability}"` : ""}>${this.t("nextStepAction")}</button>`
              : ""
          }
        </section>
        <section class="trial-loot-panel">
          <h2>${this.t("trialItems")}</h2>
          ${
            items.length
              ? `<div class="trial-loot">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`
              : `<p class="muted">${en ? "No loot yet. Clear trial stages to collect weapons, allies, and tools." : "还没有战利品，通关试炼会获得武器、同伴和工具。"}</p>`
          }
        </section>
        <section class="trial-unlocks">
          <h2>${en ? "Growth Unlocks" : "成长解锁"}</h2>
          <div class="unlock-list">
            <span class="unlocked">${en ? "HP: Energy Bar" : "血条：精力值"}</span>
            <span class="${Math.max(...ABILITY_ORDER.map((id) => abilityLevel(this.save.profile.abilities[id]))) >= 2 ? "unlocked" : "locked"}">${en ? "Skill: Ability Lv.2" : "技能：能力 Lv.2"}</span>
            <span class="${this.save.trialCleared.length >= 5 ? "unlocked" : "locked"}">${en ? "Armor: Clear Trial 5" : "防护：通关第 5 关"}</span>
            <span class="${this.save.trialCleared.length >= 7 ? "unlocked" : "locked"}">${en ? "Ally: Clear Trial 7" : "同伴：通关第 7 关"}</span>
            <span class="${this.save.trialCleared.length >= 10 ? "unlocked" : "locked"}">${en ? "Weapon: Clear Trial 10" : "武器：通关第 10 关"}</span>
            <span class="${this.save.trialCleared.length >= 19 ? "unlocked" : "locked"}">${en ? "MBA Cases: Clear All Trials" : "MBA 关卡：通关全部试炼"}</span>
          </div>
        </section>
        <section class="trial-stages">

          <h2>${this.t("trialStages")}</h2>
          <div class="trial-stage-list">
            ${TRIAL_STAGES.map((stage) => {
              const done = this.save.trialCleared.includes(stage.id);
              const enterable = canEnterTrial(this.save, stage);
              const gateText = stage.gates
                .map((gate) => `${abilityDisplay(this.language, gate.abilityId).name} Lv.${gate.level}`)
                .join(" + ");
              return `
                <div class="trial-stage-card ${done ? "cleared" : enterable ? "open" : "locked"}">
                  <div class="trial-stage-head">
                    <span>${String(stage.order).padStart(2, "0")}</span>
                    <strong>${escapeHtml(stage.name)}</strong>
                    <em>${escapeHtml(stage.boss)}</em>
                  </div>
                  <p>${trialStageLabel(stage)}</p>
                  <div class="trial-stage-meta">
                    <span>${this.t("trialGate")}：${escapeHtml(gateText)}</span>
                    <span>${this.t("trialEnergyCost")} ${trialCostFor(this.save, stage)}</span>
                  </div>
                  ${
                    enterable
                      ? `<button class="primary" data-action="trial-stage" data-stage="${stage.id}">${this.t("trialEnter")}</button>`
                      : `
                        <div class="trial-lock-actions">
                          <span class="trial-lock">${done ? this.t("trialCleared") : this.t("trialLocked")}</span>
                          ${
                            done
                              ? ""
                              : stage.gates
                                  .map(
                                    (gate) => `
                                      <button data-action="open-training" data-ability="${gate.abilityId}">
                                        ${abilityDisplay(this.language, gate.abilityId).name} Lv.${gate.level}
                                      </button>
                                    `
                                  )
                                  .join("")
                          }
                        </div>
                      `
                  }
                </div>
              `;
            }).join("")}
          </div>
        </section>
        <section class="trial-practice">
          <h2>${this.t("trialPractice")}</h2>
          <p class="muted">${en ? "Write a real reflection; rewards unlock after keyword scoring." : "请完成真实文字修炼，通过关键词评分后才会发放奖励。"}</p>
          <div class="practice-list">
            ${PRACTICE_TASKS.map((task) => {
              const done = this.save.completedPracticeTasks.includes(task.id);
              return `
                <article class="practice-card ${done ? "done" : ""}">
                  <div>
                    <h3>${escapeHtml(task.title)}</h3>
                    <small>${escapeHtml(task.source)}</small>
                    <blockquote>${escapeHtml(task.quote)}</blockquote>
                    <p>${escapeHtml(task.action)}</p>
                  </div>
                  <div class="practice-reward">
                    <span>${abilityDisplay(this.language, task.rewardAbility).name} +${task.rewardExp}</span>
                    <span>${this.t("trialEnergy")} +${task.rewardEnergy}</span>
                  </div>
                  ${
                    done
                      ? `<span class="practice-done">${this.t("trialCleared")}</span>`
                      : `<button data-action="practice-task" data-task="${task.id}">${en ? "Complete Mission" : "完成修炼"}</button>`
                  }
                </article>
              `;
            }).join("")}
          </div>
        </section>
      </main>
    `;
  }

  private trialResultBranch(): string {
    if (!this.trialAnswerResult) return "";
    if (!this.trialAnswerResult.correct) {
      return this.t("trialResultFail");
    }
    if (this.trialSummaryKeywordCorrect === true) {
      return this.t("trialResultExcellent");
    }
    if (this.trialSummaryKeywordCorrect === false) {
      return this.t("trialResultWeak");
    }
    return this.t("trialResultGood");
  }

  private trialSuspectImpactMarkup(stage: TrialStageDef): string {
    if (
      !stage.suspects?.length ||
      !stage.correctSuspect ||
      !this.trialSuspectChoice
    ) {
      return "";
    }
    const chosen = this.trialSuspectChoice;
    const correct = chosen === stage.correctSuspect;
    const impact = correct
      ? this.language === "en"
        ? `Your identification of "${chosen}" closes the evidence chain, and the trust bar tilts your way.`
        : `你的指认「${chosen}」与证据链闭合，局势条向信任倾斜。`
      : this.language === "en"
        ? `You identified "${chosen}", but the key suspect was "${stage.correctSuspect}". Suspicion rises and the case is not yet closed.`
        : `你指认了「${chosen}」，但真正的关键嫌疑人是「${stage.correctSuspect}」。局势条转向怀疑，调查仍需继续。`;
    return `<p class="trial-suspect-impact ${correct ? "good" : "bad"}">${escapeHtml(impact)}</p>`;
  }

  private renderTrialBattle(): void {
    const stage = TRIAL_STAGES.find((item) => item.id === this.activeTrialId);
    if (!stage) {
      this.show("trial");
      return;
    }
    const en = this.language === "en";
    const question = trialQuestionFor(stage);
    const result = this.trialAnswerResult;
    const followUp = question.followUp;
    const followUpPending = Boolean(followUp) && !this.trialFollowUpAnswered;
    const referenceAnswer = followUp
      ? followUp.referenceAnswer
      : question.referenceAnswer;
    const explanation = followUp
      ? followUp.explanation
      : question.explanation;
    const wolfPending =
      stage.style === "wolf" && !this.trialObserveRevealed;
    const suspectPending =
      stage.style === "wolf" &&
      this.trialObserveRevealed &&
      !this.trialSuspectChoice;
    const allyPending =
      Boolean(stage.allies?.length) && !this.trialAllyChoice;
    const intelPending =
      Boolean(stage.intelChoices?.length) &&
      Boolean(this.trialAllyChoice) &&
      !this.trialIntelChoice;
    const betrayalPending =
      Boolean(stage.betrayalChoices?.length) &&
      Boolean(this.trialIntelChoice) &&
      !this.trialBetrayalChoice;
    const phaseReady =
      !wolfPending &&
      !suspectPending &&
      !allyPending &&
      !intelPending &&
      !betrayalPending;
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="trial-next">${this.t("trialNext")}</button>
      </header>
      <main class="trial-battle-shell" aria-label="${this.t("trialTitle")}">
        <section class="trial-boss-panel">
          <div>
            <p class="eyebrow">${trialStageLabel(stage)}</p>
            <h1>${escapeHtml(stage.boss)}</h1>
            <p class="muted">${escapeHtml(stage.name)}</p>
          </div>
          <div class="trial-boss-stats">
            <span>${this.t("trialEnergyCost")} ${trialCostFor(this.save, stage)}</span>
            <span>${this.t("trialHp")} ${this.save.trialHp} / 100</span>
            <span>${stage.gates.map((gate) => `${abilityDisplay(this.language, gate.abilityId).name} Lv.${gate.level}`).join(" + ")}</span>
            ${stage.dimension ? `<span>${en ? LEADERSHIP_DIMENSIONS[stage.dimension].en : LEADERSHIP_DIMENSIONS[stage.dimension].zh} · Lv.${dimensionLevel(this.save.dimensionExp?.[stage.dimension] ?? 0)}</span>` : ""}
          </div>
          <div class="trial-faction-bars">
            <span>${this.t("trialTrust")} ${this.trialFactionTrust}</span>
            <span>${this.t("trialSuspicion")} ${this.trialFactionSuspicion}</span>
          </div>
        </section>
        ${
          !result && stage.scene
            ? `
              <section class="trial-scene-panel">
                <p class="eyebrow">${en ? "Scene" : "试炼场景"}</p>
                <p>${escapeHtml(stage.scene)}</p>
              </section>
            `
            : ""
        }
        ${
          result
            ? `
              <section class="trial-battle-result ${result.correct ? "win" : "lose"}">
                <h2>${result.correct ? this.t("trialCorrect") : this.t("trialWrong")}</h2>
                <p class="trial-branch-label">${this.trialResultBranch()}</p>
                <p>${this.t("trialEnergy")} ${result.energyChange > 0 ? "+" : ""}${result.energyChange}</p>
                ${
                  result.cleared
                    ? `<p>${this.t("trialReward")}：${abilityDisplay(this.language, stage.source.kind === "training" ? stage.source.abilityId : stage.gates[0].abilityId).name} +${result.gainedExp}${result.item ? ` · ${escapeHtml(result.item)}` : ""}</p>`
                    : ""
                }
                ${
                  this.trialAllyCorrect === true
                    ? `<p>${this.t("trialAllyCorrect")}</p>`
                    : this.trialAllyCorrect === false
                      ? `<p>${this.t("trialAllyWrong")}</p>`
                      : ""
                }
                ${
                  this.trialSuspectCorrect === true
                    ? `<p>${this.t("trialSuspectCorrect")}</p>`
                    : this.trialSuspectCorrect === false
                      ? `<p>${this.t("trialSuspectWrong")}</p>`
                      : ""
                }
                ${
                  this.trialIntelCorrect === true
                    ? `<p>${this.t("trialIntelCorrect")}</p>`
                    : this.trialIntelCorrect === false
                      ? `<p>${this.t("trialIntelWrong")}</p>`
                      : ""
                }
                ${
                  this.trialBetrayalCorrect === true
                    ? `<p>${this.t("trialBetrayalCorrect")}</p>`
                    : this.trialBetrayalCorrect === false
                      ? `<p>${this.t("trialBetrayalWrong")}</p>`
                      : ""
                }
                ${
                  this.trialSummaryKeywordCorrect === true
                    ? `<p>${this.t("trialSummaryKeyword")}</p>`
                    : this.trialSummaryKeywordCorrect === false
                      ? `<p>${this.t("trialSummaryKeywordMiss")}</p>`
                      : ""
                }
                ${
                  this.trialCalculationCorrect === true
                    ? `<p>${this.t("trialCalculationCorrect")}</p>`
                    : this.trialCalculationCorrect === false
                      ? `<p>${this.t("trialCalculationWrong")}</p>`
                      : ""
                }
                <div class="trial-answer-review">
                  ${
                    followUp && this.trialFollowUpAnswer !== undefined
                      ? `
                        <strong>${this.t("trialStageDecision")}</strong>
                        <p>${escapeHtml(question.options[this.trialFollowUpAnswer] ?? "")}</p>
                      `
                      : ""
                  }
                  <strong>${this.t("trialAnswer")}</strong>
                  <p>${escapeHtml(question.options[this.lastTrialAnswer ?? 0])}</p>
                  <strong>${this.t("trialReference")}</strong>
                  <p>${escapeHtml(referenceAnswer)}</p>
                  <strong>${this.t("trialExplanation")}</strong>
                  <p>${escapeHtml(explanation)}</p>
                </div>
                ${
                  stage.resolution
                    ? `
                      <section class="trial-resolution-panel">
                        <p class="eyebrow">${en ? "Truth Revealed" : "真相揭晓"}</p>
                        <p>${escapeHtml(stage.resolution)}</p>
                        ${this.trialSuspectImpactMarkup(stage)}
                      </section>
                    `
                    : ""
                }
                <button class="primary" data-action="trial-next">${this.t("trialNext")}</button>
              </section>
            `
            : `
              ${
                wolfPending
                  ? `
                    <section class="trial-phase-panel">
                      <p class="eyebrow">${this.t("trialClue")}</p>
                      <p>${escapeHtml(stage.clue ?? "")}</p>
                      <button class="primary" data-action="trial-observe">${this.t("trialObserve")}</button>
                    </section>
                  `
                  : ""
              }
              ${
                suspectPending
                  ? `
                    <section class="trial-phase-panel">
                      <p class="eyebrow">${this.t("trialSuspect")}</p>
                      <div class="trial-ally-options">
                        ${(stage.suspects ?? []).map((suspect) => `<button data-action="trial-suspect" data-suspect="${escapeAttr(suspect)}">${escapeHtml(suspect)}</button>`).join("")}
                      </div>
                    </section>
                  `
                  : ""
              }
              ${
                allyPending
                  ? `
                    <section class="trial-phase-panel">
                      <p class="eyebrow">${this.t("trialAlly")}</p>
                      <div class="trial-ally-options">
                        ${(stage.allies ?? []).map((ally) => `<button data-action="trial-ally" data-ally="${escapeAttr(ally)}">${escapeHtml(ally)}</button>`).join("")}
                      </div>
                    </section>
                  `
                  : ""
              }
              ${
                intelPending
                  ? `
                    <section class="trial-phase-panel">
                      <p class="eyebrow">${this.t("trialIntel")}</p>
                      <div class="trial-ally-options">
                        ${(stage.intelChoices ?? []).map((intel) => `<button data-action="trial-intel" data-intel="${escapeAttr(intel)}">${escapeHtml(intel)}</button>`).join("")}
                      </div>
                    </section>
                  `
                  : ""
              }
              ${
                betrayalPending
                  ? `
                    <section class="trial-phase-panel">
                      <p class="eyebrow">${this.t("trialBetrayal")}</p>
                      <div class="trial-ally-options">
                        ${(stage.betrayalChoices ?? []).map((choice) => `<button data-action="trial-betrayal" data-betrayal="${escapeAttr(choice)}">${escapeHtml(choice)}</button>`).join("")}
                      </div>
                    </section>
                  `
                  : ""
              }
              ${
                this.trialSummaryPending
                  ? `
                    <section class="trial-summary-panel">
                      <h2>${this.t("trialSummary")}</h2>
                      <p>${escapeHtml(referenceAnswer)}</p>
                      ${
                        question.calculation
                          ? `
                            <label class="field">
                              <span>${escapeHtml(question.calculation.prompt)}</span>
                              <input data-trial-calculation type="number" value="${escapeAttr(this.trialCalculationAnswer ?? "")}" placeholder="${escapeHtml(question.calculation.unit)}" />
                            </label>
                          `
                          : ""
                      }
                      <textarea data-trial-summary rows="5" placeholder="${en ? "Write your one-page decision summary with evidence, owner, and checkpoint." : "写出你的决策摘要：依据、负责人、检查节点。"}"></textarea>
                      <button class="primary" data-action="trial-submit-summary">${this.t("trialSummarySubmit")}</button>
                    </section>
                  `
                  : `
                    <section class="trial-question-panel">
                ${
                  followUpPending && followUp
                    ? `
                      <section class="trial-new-info">
                        <h3>${this.t("trialNewInfo")}</h3>
                        <p>${escapeHtml(followUp.prompt)}</p>
                      </section>
                    `
                    : ""
                }
                <h2>${escapeHtml(followUpPending && followUp ? followUp.prompt : question.prompt)}</h2>
                <div class="trial-options">
                  ${(followUpPending && followUp ? followUp.options : question.options).map((option, index) => `<button class="trial-option" data-action="trial-option" data-option="${index}" ${phaseReady ? "" : "disabled"}>${escapeHtml(option)}</button>`).join("")}
                </div>
              </section>
                  `
              }
            `
        }
      </main>
    `;
  }


  private duelRoundResultMarkup(engine: DuelEngine): string {
    const round = this.duelRoundResult;
    const en = this.language === "en";
    if (!round) {
      return "";
    }
    return `
      <main class="duel-round-result" aria-label="${en ? "Round result" : "本回合揭晓"}">
        <p class="eyebrow">${en ? `Round ${engine.currentRound}` : `第 ${engine.currentRound} 回合`}</p>
        <h1>${en ? "Round settled" : "本回合揭晓"}</h1>
        <div class="round-result-grid">
          ${engine.players
            .map((player, index) => {
              const option = round.node.options[round.picks[index]];
              return `
                <article>
                  <strong>${escapeHtml(player.name)}</strong>
                  <p>${escapeHtml(option.label)}</p>
                  <span class="round-points">+${round.points[index]}</span>
                </article>
              `;
            })
            .join("")}
        </div>
        <p class="round-total">${en ? "Running total" : "当前总分"}：${escapeHtml(engine.players[0].name)} ${engine.scores[0]} · ${escapeHtml(engine.players[1].name)} ${engine.scores[1]}</p>
        <p class="muted">${en ? "Next round starts shortly..." : "即将进入下一回合…"}</p>
      </main>
    `;
  }


  private duelResultMarkup(
    engine: DuelEngine,
    result: ReturnType<DuelEngine["toResult"]>
  ): string {
    const en = this.language === "en";
    const playerIndex = this.duelMode === "remote" ? this.remotePlayerIndex : 0;
    const analysis = engine.roundResults.map((round, index) => {
      const node = round.node;
      const nodeView = storyNodeDisplay(this.language, this.save,node);
      const best = node.options.find((option) => option.quality === "expert") ?? node.options[0];
      const playerPick = round.picks[playerIndex];
      const playerOption = node.options[playerPick] ?? node.options[0];
      const gap =
        playerOption.quality === "expert"
          ? en
            ? "This move matched the expert baseline. Keep applying this logic under pressure."
            : "本次应对符合专家基准，保持这种在压力下先诊断再行动的逻辑。"
          : playerOption.quality === "partial"
            ? en
              ? "Direction is right, but the execution is incomplete. Add evidence, ownership, and a check node."
              : "方向对但执行不完整，需要补充证据、负责人和检查节点。"
            : en
              ? "High-risk move. Stabilize the situation first, then turn the resistance into shared responsibility."
              : "高风险应对。先稳住局势，再把阻力变成共同责任。";
      return `
        <article class="duel-analysis-card">
          <div class="duel-analysis-head">
            <span>${index + 1}</span>
            <strong>${escapeHtml(nodeView.title)}</strong>
          </div>
          <p class="duel-analysis-context">${escapeHtml(nodeView.context)}</p>
          <div class="duel-analysis-grid">
            <div>
              <h3>${this.t("duelBestMove")}</h3>
              <p>${escapeHtml(best.label)}</p>
              <small>${escapeHtml(best.theory)}</small>
            </div>
            <div>
              <h3>${this.t("duelWhy")}</h3>
              <p>${escapeHtml(best.feedback)}</p>
            </div>
            <div>
              <h3>${this.t("duelPlayerMove")}</h3>
              <p>${escapeHtml(playerOption.label)}</p>
            </div>
            <div>
              <h3>${this.t("duelGap")}</h3>
              <p>${gap}</p>
            </div>
          </div>
          <div class="duel-round-score">
            <span>${engine.players[0].name} ${round.points[0]}</span>
            <span>${engine.players[1].name} ${round.points[1]}</span>
          </div>
        </article>
      `;
    }).join("");

    return `
      <main class="duel-result" aria-label="${en ? "Duel result" : "对决结果"}">
        <section class="result-hero">
          <p class="eyebrow">${en ? "Duel Complete" : "对决结束"}</p>
          <h1>${escapeHtml(result.winnerName)} ${en ? "wins" : "获胜"}</h1>
          <div class="result-scores">
            <span>${engine.players[0].name} <strong>${result.scores[0]}</strong></span>
            <span>${engine.players[1].name} <strong>${result.scores[1]}</strong></span>
          </div>
          ${
            this.duelPredictionHistory.length
              ? `<p class="duel-prediction-summary">${this.t("duelPredictionSummary")}：${this.duelPredictionHistory.filter(Boolean).length} / ${this.duelPredictionHistory.length}</p>`
              : ""
          }
          ${
            this.duelPredictionBonusTotal
              ? `<p class="duel-prediction-bonus">${en ? "Prediction bonus" : "预判加成"} +${this.duelPredictionBonusTotal}</p>`
              : ""
          }
          <button class="primary" data-action="open-duel-lobby">${en ? "Back to Lobby" : "返回大厅"}</button>
          ${this.duelRematchAction ? `<button class="primary" data-action="duel-rematch">${this.t("duelRematch")}</button>` : ""}
          <button data-action="open-map">${this.t("menuContinue")}</button>
        </section>
        <section class="duel-review-discussion" aria-label="${en ? "Debrief discussion" : "复盘讨论"}">
          <h2>${en ? "Debrief Discussion" : "复盘讨论"}</h2>
          <p class="muted">${en ? `Opponent style: ${aiArchetypeLabel(this.language,engine.players[1].archetype ?? "builder")}` : `对手风格：${aiArchetypeLabel(this.language,engine.players[1].archetype ?? "builder")}`}</p>
          <ul>
            <li>${en ? `Where did ${engine.players[1].name} push you outside your usual pattern?` : `${engine.players[1].name}在哪些回合把你逼出了平时的判断习惯？`}</li>
            <li>${en ? "Which decision would you defend in front of your team, and which would you revisit?" : "哪一次选择你敢在团队面前辩护，哪一次你会重新考虑？"}</li>
            <li>${en ? "What would this opponent say about your leadership style after the match?" : "这局之后，对手会怎样描述你的领导风格？"}</li>
          </ul>
        </section>
        <section class="duel-analysis">
          <h2>${this.t("duelAnalysisTitle")}</h2>
          ${analysis}
        </section>
      </main>
    `;
  }


  private renderHiddenBranch(): void {
    const abilityId = this.hiddenBranchAbilityId;
    if (!abilityId || !EXPANDED_TRAINING[abilityId]) {
      this.show("map");
      return;
    }
    const path = EXPANDED_TRAINING[abilityId];
    const view = this.trainingDisplay(path);
    const en = this.language === "en";
    const steps = hiddenRouteSteps(abilityId);
    const completed = this.save.hiddenRoutes.includes(`hidden-${abilityId}`);
    const stepIndex = Math.min(
      this.hiddenRouteStep,
      Math.max(0, steps.length - 1)
    );
    const currentStep = steps[stepIndex];
    const answered = this.hiddenRouteLastCorrect !== undefined;
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-map">${this.t("hiddenBranchBack")}</button>
      </header>
      <main class="hidden-branch-shell" aria-label="${this.t("hiddenBranchTitle")}">
        <section class="hidden-branch-hero">
          <p class="eyebrow">${this.t("hiddenBranchTitle")}</p>
          <h1>${abilityDisplay(this.language, abilityId).name} · ${escapeHtml(view.routeTitle)}</h1>
          <p class="muted">${escapeHtml(view.routeSummary)}</p>
          <p class="hidden-route-progress">${stepIndex + 1} / ${steps.length}</p>
        </section>
        ${
          completed
            ? `
              <section class="hidden-branch-grid">
                <div>
                  <h2>${this.t("trainingFormula")}</h2>
                  <code>${escapeHtml(view.formula.expression)}</code>
                  <p>${escapeHtml(view.formula.explanation)}</p>
                </div>
                <div>
                  <h2>${this.t("trainingApplication")}</h2>
                  <ul>${view.applicationPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
                </div>
                <div>
                  <h2>${this.t("trainingExamples")}</h2>
                  <p>${escapeHtml(view.workedExamples[0]?.scenario ?? "")}</p>
                  <p class="muted">${escapeHtml(view.workedExamples[0]?.application ?? "")}</p>
                </div>
              </section>
              <p class="muted">${en ? "Hidden route completed and written into your ending." : "隐藏章节已完成，并已写入结局。"}</p>
              <button class="primary" data-action="continue-hidden-exit">${en ? "Back to Outcome" : "返回本次结算"}</button>
            `
            : answered
              ? `
                <section class="hidden-route-feedback">
                  <h2>${this.hiddenRouteLastCorrect ? (en ? "Correct" : "判断正确") : (en ? "Not quite" : "判断有偏差")}</h2>
                  <p>${escapeHtml(currentStep.explanation)}</p>
                  <p class="muted">${en ? "Reference: " : "参考答案："}${escapeHtml(currentStep.referenceAnswer)}</p>
                  <button class="primary" data-action="hidden-next">${this.hiddenRouteLastCorrect ? (en ? "Next Step" : "下一节点") : (en ? "Try Again" : "重试本题")}</button>
                </section>
              `
              : `
                <section class="hidden-route-question">
                  <h2>${escapeHtml(currentStep.prompt)}</h2>
                  <div class="hidden-route-options">
                    ${currentStep.options.map((option, index) => `<button data-action="hidden-option" data-option="${index}">${escapeHtml(option)}</button>`).join("")}
                  </div>
                </section>
              `
        }
      </main>
    `;
  }


  private renderSettings(): void {
    const en = this.language === "en";
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-menu">${this.t("returnHome")}</button>
      </header>
      <main class="settings-shell" aria-label="${this.t("settingsTitle")}">
        <section class="settings-hero">
          <p class="eyebrow">${this.t("settingsTitle")}</p>
          <h1>${en ? "One place to tune the experience" : "一个地方，管理你的体验"}</h1>
        </section>
        <section class="settings-grid">
          <div class="settings-panel">
            <h2>${en ? "Audio & Language" : "声音与语言"}</h2>
            <button data-action="toggle-sound">${this.muted ? this.t("soundOff") : this.t("soundOn")}</button>
            <button data-action="toggle-music">${this.musicMuted ? this.t("musicOff") : this.t("musicOn")}</button>
            <label class="field">
              <span>${this.t("musicVolume")}</span>
              <select data-select="music-volume">
                <option value="0" ${this.musicVolume === 0 ? "selected" : ""}>0</option>
                <option value="25" ${this.musicVolume === 25 ? "selected" : ""}>25</option>
                <option value="50" ${this.musicVolume === 50 ? "selected" : ""}>50</option>
                <option value="75" ${this.musicVolume === 75 ? "selected" : ""}>75</option>
                <option value="100" ${this.musicVolume === 100 ? "selected" : ""}>100</option>
              </select>
            </label>
            <label class="field">
              <span>${en ? "SFX Volume" : "音效音量"}</span>
              <select data-select="sfx-volume">
                <option value="0" ${this.sfxVolume === 0 ? "selected" : ""}>0</option>
                <option value="25" ${this.sfxVolume === 25 ? "selected" : ""}>25</option>
                <option value="50" ${this.sfxVolume === 50 ? "selected" : ""}>50</option>
                <option value="75" ${this.sfxVolume === 75 ? "selected" : ""}>75</option>
                <option value="100" ${this.sfxVolume === 100 ? "selected" : ""}>100</option>
              </select>
            </label>
            <button data-action="preview-sfx">${en ? "Preview SFX" : "试听音效"}</button>
            <button data-action="toggle-language">${this.t("language")}</button>
            ${
              this.musicVolume === 0 || this.sfxVolume === 0
                ? `<p class="muted volume-zero-note">${en ? "Volume is 0: audio stays silent while toggles are on." : "音量为 0：开关虽为开，当前仍无声。"}</p>`
                : ""
            }
          </div>
          <div class="settings-panel">
            <h2>${this.t("difficultyLabel")}</h2>
            ${this.difficultySelectorMarkup()}
          </div>
          <div class="settings-panel">
            <h2>${this.t("settingsHelp")}</h2>
            <p>${this.t("settingsHelpText")}</p>
          </div>
          <div class="settings-panel">
            <h2>${this.t("settingsData")}</h2>
            <button data-action="open-assessment">${this.t("assessmentReopen")}</button>
            <button data-action="export-save">${this.t("exportSave")}</button>
            <button data-action="export-analytics">${this.language === "en" ? "Export Event Log" : "导出事件日志"}</button>
            <button data-action="export-return-package">${this.language === "en" ? "Export Return Package" : "生成回传包"}</button>
            <button data-action="import-save">${this.t("importSave")}</button>
            <label class="file-button">
              ${this.t("importSave")}
              <input type="file" data-import-save accept="application/json" hidden />
            </label>
            <button data-action="reset-profile">${this.t("resetProfile")}</button>
            <p class="muted">${this.language === "en" ? `Version ${APP_VERSION} 路 Static build` : `版本 ${APP_VERSION} 路 静态版`}</p>
          </div>
          <div class="settings-panel">
            <h2>${this.t("settingsAccessibility")}</h2>
            <p>${this.t("shortcutsTitle")}</p>
            <p class="muted">${this.t("shortcutsText")}</p>
            <p>${this.t("fontSize")}</p>
            <div class="settings-actions">
              <button data-action="settings-font-size" data-size="0.9">90%</button>
              <button data-action="settings-font-size" data-size="1">100%</button>
              <button data-action="settings-font-size" data-size="1.15">115%</button>
            </div>
            <p class="muted">${en ? "Reduced-motion preferences are respected by the UI." : "界面已支持系统减少动态效果偏好。"}</p>
          </div>
          <div class="settings-panel">
            <h2>${this.language === "en" ? "About Ascend" : "关于升维"}</h2>
            <p>${this.language === "en" ? "Ascend is an offline-first leadership scenario game based on The Book of Power, Heifetz adaptive leadership, and scenario-golf scoring." : "升维是一款基于《权经》九章架构、Heifetz 自适应领导力与情境高尔夫计分法的可离线领导力情境游戏。"}</p>
            <p class="muted">${this.language === "en" ? "v1.1 路 standard mode has no decision timer; failed chapters can be retried; duels can be resumed after refresh." : "v1.1 路 标准档不计时；未达一星的章节可重打；对局刷新后可续战。"}</p>
            <p class="muted">${this.language === "en" ? "Static content includes the full campaign, role branches, 9 side quests, training formulas, trials, local duels, save export/import and manual WebRTC. Account, cloud save, leaderboard and auto-match are bundled and become active in the online build." : "静态版包含完整主线、角色分岔、9 个支线、训练公式、试炼、本地对战、存档导出/导入与手动远程对战；账号、云存档、排行榜与自动匹配已内置，在线版构建后启用。"}</p>
          </div>
          <div class="settings-panel">
            <h2>${this.language === "en" ? "Feedback for Coaches" : "体验反馈"}</h2>
            <label>${this.language === "en" ? "Rating" : "评分"}<select data-feedback-rating>${[1, 2, 3, 4, 5].map((value) => `<option value="${value}">${value} / 5</option>`).join("")}</select></label>
            <label>${this.language === "en" ? "Feedback" : "反馈内容"}<textarea data-feedback-text rows="3" maxlength="800" placeholder="${this.language === "en" ? "What worked, what confused you, and what you would change." : "哪些有效、哪里困惑、最想改什么。"}"></textarea></label>
            <button data-action="generate-feedback">${this.language === "en" ? "Copy Feedback Package" : "生成并复制反馈"}</button>
          </div>
        </section>
      </main>
    `;
  }

  private renderEnding(): void {
    const en = this.language === "en";
    const decisions = this.save.decisionHistory.slice(-10).reverse();
    const topAbility = ABILITY_ORDER.slice().sort(
      (a, b) =>
        abilityLevel(this.save.profile.abilities[b]) -
          abilityLevel(this.save.profile.abilities[a]) ||
        (this.save.profile.abilities[b] ?? 0) -
          (this.save.profile.abilities[a] ?? 0)
    )[0];
    const relationsCount = NPCS.filter(
      (npc) => npcRelation(this.save, npc).status !== "尚未接触"
    ).length;
    const routeSummary = Object.entries(this.save.routePath)
      .map(([chapter, route]) => `${chapter}:${route}`)
      .join(" · ");
    const npcRows = NPCS.filter(
      (npc) => npcRelation(this.save, npc).status !== "尚未接触"
    )
      .map((npc) => {
        const view = npcDisplay(this.language, npc);
        return `<li>${escapeHtml(view.name)} · ${escapeHtml(view.title)}</li>`;
      })
      .join("");
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="ending-back">${this.t("endingBack")}</button>
      </header>
      <main class="ending-shell" aria-label="${this.t("endingTitle")}">
        <img class="ending-bg" src="./bg/bg-victory.jpg" alt="" aria-hidden="true">
        <section class="ending-hero">
          <p class="eyebrow">${this.t("endingTitle")}</p>
          <h1>${this.save.profile.name} · ${roleDisplay(this.language, this.save.profile.role).name}</h1>
          <button data-action="ending-share">${this.t("endingShare")}</button>
          <button data-action="ending-card">${this.t("endingCard")}</button>
          <button data-action="open-duel">${en ? "Play Again in a Duel" : "再来一轮 1v1"}</button>
          <textarea id="ending-share-target" readonly hidden></textarea>
          <canvas id="ending-card-canvas" width="900" height="520" hidden></canvas>
        </section>
        <section class="ending-summary">
          <div>
            <span>${en ? "Signature Ability" : "招牌能力"}</span>
            <strong>${topAbility ? abilityDisplay(this.language, topAbility).name : "-"}</strong>
          </div>
          <div>
            <span>${en ? "Relationships" : "关系网络"}</span>
            <strong>${relationsCount} / ${NPCS.length}</strong>
          </div>
          <div>
            <span>${en ? "Decisions" : "决策总数"}</span>
            <strong>${this.save.decisionHistory.length}</strong>
          </div>
          <div>
            <span>${en ? "Best Score" : "最高分"}</span>
            <strong>${this.save.bestScore ?? 0}</strong>
          </div>
          <div class="ending-route-summary">
            <span>${en ? "Route Choices" : "路线选择"}</span>
            <strong>${routeSummary || (en ? "Not recorded" : "暂无记录")}</strong>
          </div>
        </section>
        <section class="ending-choice-panel">
          <h2>${this.t("endingChoiceTitle")}</h2>
          <p>${this.t("endingChoicePrompt")}</p>
          <div class="ending-choice-actions">
            <button data-action="ending-choice" data-ending="stabilize">${this.t("endingChoiceStabilize")}</button>
            <button data-action="ending-choice" data-ending="expand">${this.t("endingChoiceExpand")}</button>
            <button data-action="ending-choice" data-ending="legacy">${this.t("endingChoiceLegacy")}</button>
          </div>
          ${
            this.endingChoice
              ? `<p class="ending-choice-result">${en ? `Final move: ${this.endingChoice}` : `最终选择：${this.endingChoice}`}</p>`
              : ""
          }
        </section>
        <section class="ending-timeline">
          <h2>${this.t("endingTimeline")}</h2>
          <div class="ending-decision-list">
            ${
              decisions.length
                ? decisions
                    .map((record) => {
                      let title = record.nodeId;
                      try {
                        title = getNode(record.nodeId).title;
                      } catch {
                        // keep id
                      }
                      return `
                        <div class="ending-decision-row">
                          <span>${qualityLabel(this.language, record.quality)}</span>
                          <strong>${escapeHtml(title)}</strong>
                          <small>${record.qualityScore} pts</small>
                        </div>
                      `;
                    })
                    .join("")
                : `<p class="muted">${en ? "No decisions recorded yet." : "暂无决策记录。"}</p>`
            }
          </div>
        </section>
        <section class="ending-relations">
          <h2>${this.t("relationsTitle")}</h2>
          <ul>${npcRows || `<li class="muted">${en ? "No relationships established." : "尚未建立人物关系。"}</li>`}</ul>
        </section>
        <section class="ending-progress">
          <h2>${en ? "Collections" : "收集进度"}</h2>
          <p>${en ? `Hidden routes ${this.save.hiddenRoutes.length} · Alternate endings ${this.save.alternateEndings.length}` : `高阶路线 ${this.save.hiddenRoutes.length} · 备选结局 ${this.save.alternateEndings.length}`}</p>
        </section>
      </main>
    `;
  }

  private endingMarkup(): string {
    if (!isChapterComplete(this.save, 9)) {
      return `
        <section class="ending-panel locked">
          <h2>${roleDisplay(this.language, this.save.profile.role).name}${this.language === "en" ? " Ending" : "结局"}</h2>
          <p class="muted">${this.language === "en" ? "Complete chapter 9 to unlock your role ending." : "完成第九章后解锁专属结局。"}</p>
        </section>
      `;
    }
    const role = this.save.profile.role;
    const decision = decisionProfile(this.save);
    const en = this.language === "en";
    const endings: Record<RoleId, string> = {
      parachute:
        en
          ? "You proved you can not only parachute in but also turn an unfamiliar organization into a stable system. When you left, power had returned to systems, succession, and shared judgment rather than staying in one person."
          : "你证明了自己不仅能空降，还能把陌生组织变成稳定系统。你离开时，权力已经回到制度、梯队与共识里，而不是停留在你个人身上。",
      founder:
        en
          ? "You turned founder instinct into replicable organizational method. The company no longer depends on one person for every decision, while you kept your sensitivity to direction and built a team that can absorb growth."
          : "你把创业直觉变成了可复制的组织方法，公司开始不依赖你一个人做所有决定。你保留了对方向的敏感，也建立了能接住增长的团队。",
      highPotential:
        en
          ? "Without positional power, you built an influence network across departments. The organization needs you not because of your title but because you made it clearer where everyone should go."
          : "你没有职位权力，却建立了横跨部门的影响力网络。你最终被组织需要，不是因为头衔，而是因为你让所有人更清楚该往哪里走。"
    };
    let style: "expert" | "risk" | "partial" | "balanced" = "balanced";
    if (decision.counts.expert >= 8) {
      style = "expert";
    } else if (decision.counts.risk >= 5) {
      style = "risk";
    } else if (decision.counts.partial >= 8) {
      style = "partial";
    }
    const finalRoute = this.save.routePath[9];
    if (finalRoute === "expert" || finalRoute === "risk" || finalRoute === "partial") {
      style = finalRoute;
    }
    const styleLabels = {
      expert: en ? "Precise" : "精准决策",
      risk: en ? "High-Pressure" : "高压破局",
      partial: en ? "Incremental" : "渐进推进",
      balanced: en ? "Balanced" : "平衡演进"
    };
    const styleEndings = {
      expert:
        en
          ? "You became known for precise judgment. The team began using the checklists you created, and the organization gained replicable judgment."
          : "你以精准判断著称，团队开始使用你沉淀的检查清单做决策，组织获得了可复制的判断力。",
      risk:
        en
          ? "You were willing to place high-pressure bets. The organization learned to act fast in uncertainty, but it also inherited risks that still need repair."
          : "你敢于在压力下押注，组织因此学会在不确定中快速行动，但也留下了需要持续修复的风险。",
      partial:
        en
          ? "You chose incremental progress. The organization changed with low disruption, though slower than expected and with more room for adjustment."
          : "你选择渐进推进，组织在低震荡中完成了变革，只是节奏比想象中更慢，留下了更多调整空间。",
      balanced:
        en
          ? "You balanced boldness and caution. The organization gained explainable stability while retaining the flexibility to keep evolving."
          : "你在激进与保守之间保持了平衡，组织最终获得了一种可解释的稳定，也保留了继续进化的弹性。"
    };
    const arcLegacy: Record<string, string> = {
      trust_rebuild:
        en
          ? "The person you protected later became one of the most honest voices in the organization, and that trust became the deepest foundation of change."
          : "你救下的个体后来成了组织中最敢表达真实问题的人，这份信任成为变革最深的根基。",
      resilience:
        en
          ? "The review mechanism you built in crisis allowed the team to repair mistakes after you left, freeing execution from personal dependence."
          : "你在危机中建立的复盘机制，让团队在离开你之后仍能自己修复错误，执行系统真正脱离了个人依赖。"
    };
    const legacy = SIDE_QUEST_ARCS.filter((arc) =>
      arc.nodes.every((nodeId) =>
        this.save.completedSideQuests.includes(nodeId)
      )
    )
      .map((arc) => arcLegacy[arc.id])
      .filter(Boolean)
      .join(" ");
    const randomLegacy =
      this.save.completedRandomEvents.length >= 5
        ? en
          ? "The unexpected situations you handled became invisible training for the team's judgment."
          : "你处理过的那些临时情境，最终成为了团队判断力的隐性训练。"
        : "";
    return `
      <section class="ending-panel">
        <h2>${roleDisplay(this.language, role).name} · ${styleLabels[style]}${en ? " Ending" : "结局"}</h2>
        <p>${endings[role]} ${styleEndings[style]} ${legacy} ${randomLegacy}</p>
        <button data-action="open-ending">${this.t("endingTitle")}</button>
      </section>
    `;
  }

  private renderDuelLobby(): void {
    const summary = profileSummary(this.save);
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand">${this.t("brand")}</div>
        <button class="link" data-action="open-menu">${this.t("returnHome")}</button>
      </header>
      <main class="duel-lobby has-lobby-art" aria-label="${this.language === "en" ? "Duel lobby" : "1v1 大厅"}">
        <img class="duel-lobby-bg" src="${artAsset("bg-duel-lobby")}" alt="" aria-hidden="true" onerror="this.style.display='none'" />
        <section class="duel-hero has-hero-art">
          <img class="duel-hero-art" src="${artAsset("duel-lobby")}" alt="" loading="lazy" onerror="this.style.display='none'" />
          <p class="eyebrow">${this.t("duelTitle")}</p>
          <h1>${this.language === "en" ? "Who can make the better call in a complex situation?" : "谁能在复杂局势中做出更好的判断？"}</h1>
          <p class="muted">${this.language === "en" ? "Every round uses a real workplace slice, and choices are scored against an expert baseline. Remote mode connects peer to peer through WebRTC without a server." : "每一回合都使用真实职场切片，选择会被专家基准评分。远程模式通过 WebRTC 点对点连接，无需服务器。"}</p>
          <div class="mode-switch">
            <button class="${this.duelMode === "ai" ? "active" : ""}" data-action="set-duel-mode" data-mode="ai">${this.language === "en" ? "AI Practice" : "AI 陪练"}</button>
            <button class="${this.duelMode === "local" ? "active" : ""}" data-action="set-duel-mode" data-mode="local">${this.language === "en" ? "Local Duo" : "本地双人"}</button>
            <button class="${this.duelMode === "remote" ? "active" : ""}" data-action="set-duel-mode" data-mode="remote">${this.language === "en" ? "Remote" : "远程对战"}</button>
          </div>
          ${
            this.hasDuelSnapshot()
              ? `<button class="primary resume-duel-button" data-action="resume-duel">${this.language === "en" ? "Resume Duel" : "继续上次对局"}</button>`
              : ""
          }
        </section>
        <section class="duel-bonus-panel">
          <div>
            <p class="eyebrow">${this.language === "en" ? "Daily Duel Goal" : "今日对练目标"}</p>
            <h2>${this.language === "en" ? "Play 3 duels today" : "今天完成 3 场 1v1"}</h2>
            <p class="muted">${this.language === "en" ? "Claim the Duel Pioneer title and rewards." : "领取「对练先锋」称号与奖励。"}</p>
          </div>
          <div class="duel-bonus-status">
            <strong>${this.save.duelsToday ?? 0} / 3</strong>
            <button data-action="claim-duel-bonus" ${this.duelBonusReady() ? "" : "disabled"}>${this.language === "en" ? "Claim" : "领取"}</button>
          </div>
        </section>
        <section class="lobby-panel">
          <div class="lobby-row">
            <label class="field">
              <span>${this.language === "en" ? "Rounds" : "回合数"}</span>
              <select data-select="rounds">
                <option value="3" ${this.duelRounds === 3 ? "selected" : ""}>${this.language === "en" ? "3 rounds" : "3 回合"}</option>
                <option value="5" ${this.duelRounds === 5 ? "selected" : ""}>${this.language === "en" ? "5 rounds" : "5 回合"}</option>
                <option value="7" ${this.duelRounds === 7 ? "selected" : ""}>${this.language === "en" ? "7 rounds" : "7 回合"}</option>
              </select>
            </label>
            <span class="muted">${this.language === "en" ? `Profile: ${this.save.profile.name} · ${rankName(this.language, summary.rank)}` : `当前档案：${this.save.profile.name} · ${rankName(this.language, summary.rank)}`}</span>
          </div>
          ${
            this.duelMode === "ai"
              ? `
                <div class="mode-note">
                  <h2>${this.language === "en" ? "AI Practice" : "AI 陪练"}</h2>
                  <p>${this.language === "en" ? "The system builds an opponent from each scenario's expert baseline and your ability level, then adjusts difficulty based on your expert-decision rate. Best for sustained decision training." : "系统会根据每道情境的专家基准和你的能力水平生成对手，并基于你的专家判断率动态调整难度。适合持续训练决策质量。"}</p>
                  <p class="muted">${this.language === "en" ? `Next opponent style: ${aiArchetypeLabel(this.language,aiArchetype(this.save))}` : `下一场对手风格：${aiArchetypeLabel(this.language,aiArchetype(this.save))}`}</p>
                  <button class="primary" data-action="start-ai-duel">${this.language === "en" ? "Start Duel" : "开始对战"}</button>
                  <button data-action="start-challenge-duel">${this.language === "en" ? "7-Round Challenge" : "7 回合挑战赛"}</button>
                  <button data-action="start-endless-duel">${this.language === "en" ? "Endless Challenge" : "无尽挑战"}</button>
                </div>
              `
              : this.duelMode === "local"
                ? `
                  <div class="mode-note">
                    <h2>${this.language === "en" ? "Local Duo" : "本地双人"}</h2>
                    <p>${this.language === "en" ? "Players take turns on one device; player one hands it over after finishing. Built for classrooms, coaching workshops, and paired reviews." : "同一台设备轮流选择，玩家一完成后把设备交给玩家二。适合课堂、教练工作坊与双人复盘。"}</p>
                    <button class="primary" data-action="start-local-duel">${this.language === "en" ? "Start Duel" : "开始对战"}</button>
                  </div>
                `
                : this.remoteLobbyMarkup()
          }
        </section>
      </main>
    `;
  }

  private remoteLobbyMarkup(): string {
    const en = this.language === "en";
    return `
      <div class="remote-lobby">
        ${
          !import.meta.env.VITE_TURN_URL
            ? `<p class="experimental-note">${en ? "Experimental: without a TURN server, strict NAT networks may not connect." : "实验性功能：未配置 TURN，严格 NAT 下可能无法建立连接。"}</p>`
            : ""
        }
        <div class="remote-create">
          <h2>${en ? "Create Room" : "创建房间"}</h2>
          <p>${en ? "Generate an invite code, send it to your opponent, and wait for their answer code." : "生成邀请码后发给对手，对手会返回一个应答码。"}</p>
          <button class="primary" data-action="create-remote">${en ? "Generate Invite" : "生成邀请码"}</button>
          ${
            this.remoteInviteCode
              ? `
                <textarea readonly rows="4" data-copy-target>${escapeHtml(this.remoteInviteCode)}</textarea>
                <button data-action="copy-invite">${en ? "Copy Invite" : "复制邀请码"}</button>
              `
              : ""
          }
        </div>
        <div class="remote-join">
          <h2>${en ? "Join Room" : "加入房间"}</h2>
          <p>${en ? "Paste the invite code, generate an answer code, and send it back to the creator." : "粘贴对方邀请码，生成应答码后发回给创建方。"}</p>
          <textarea rows="4" placeholder="${en ? "Paste opponent invite code" : "粘贴对方邀请码"}" data-remote-input></textarea>
          <button data-action="join-remote">${en ? "Generate Answer" : "生成应答码"}</button>
          ${
            this.remoteAnswerCode
              ? `
                <textarea readonly rows="4">${escapeHtml(this.remoteAnswerCode)}</textarea>
                <button data-action="copy-answer">${en ? "Copy Answer" : "复制应答码"}</button>
              `
              : ""
          }
        </div>
        <div class="remote-finish">
          <h2>${en ? "Complete Connection" : "完成连接"}</h2>
          <p>${en ? "The creator pastes the opponent's answer code and completes the connection." : "创建方粘贴对手应答码，然后点击完成连接。"}</p>
          <textarea rows="4" placeholder="${en ? "Paste opponent answer code" : "粘贴对方应答码"}" data-answer-input></textarea>
          <button class="primary" data-action="finish-remote">${en ? "Complete Connection" : "完成连接"}</button>
          <p class="status-text" role="status" aria-live="polite">${this.remoteStatus}</p>
        </div>
        ${
          ONLINE_ENABLED
            ? ""
            : `<p class="static-lock-note">${en ? "Cloud auto-match is bundled but needs the online build and room server. Manual remote via invite code works without a server." : "云端自动匹配代码已内置，但需在线版与房间服务器；手动邀请码远程对战无需服务器即可使用。"}</p>`
        }
        <div class="remote-match online-only">
          <h2>${en ? "Cloud Auto-Match" : "云端自动匹配"}</h2>
          <p>${en ? "Connect to the room server and match automatically without exchanging invite codes. The server must be deployed or running locally first." : "连接服务端后自动匹配对手，不需要手动交换邀请码。需先部署或本地运行房间服务器。"}</p>
          <button class="primary" data-action="cloud-match" ${ONLINE_ENABLED ? "" : "disabled"} title="${ONLINE_ENABLED ? "" : (en ? "Demo locked in static build" : "静态版演示锁定")}">${en ? "Start Matching" : "开始匹配"}${ONLINE_ENABLED ? "" : (en ? " (Demo)" : "（演示）")}</button>
          ${
            this.lastRoomId
              ? `<button data-action="cloud-reconnect">${this.t("reconnectRoom")} · ${this.lastRoomId}</button>`
              : ""
          }
          <p class="status-text">${this.cloudStatus}</p>
        </div>
      </div>
    `;
  }

  private renderDuel(): void {
    const engine = this.duelEngine;
    const en = this.language === "en";
    if (
      this.duelMode === "local" &&
      engine &&
      !engine.finished &&
      !this.duelRoundResult &&
      !this.duelPredictionPhase &&
      engine.picks[0] === null &&
      engine.picks[1] === null
    ) {
      this.hotSeatTurn = 0;
      this.localPassed = false;
    }
    if (engine && !engine.finished) {
      this.startDuelRoundTimer();
    }
    if (!engine) {
      this.root.innerHTML = `
        <main class="duel-waiting" aria-label="${this.language === "en" ? "Waiting for opponent" : "等待对手"}">
          <h1>${this.remoteStatus}</h1>
          <p>${this.language === "en" ? "Waiting for your opponent. Keep this page open." : "等待对手加入。请保持页面打开。"}</p>
        </main>
      `;
      return;
    }

    if (this.duelRoundResult) {
      this.root.innerHTML = this.duelRoundResultMarkup(engine);
      return;
    }

    if (engine.finished) {
      if (!this.duelRecorded) {
        this.duelRecorded = true;
        if (this.duelMode === "local") {
          this.audio.round();
        } else {
          const humanWon =
            (this.duelMode === "ai" && engine.winnerIndex === 0) ||
            (this.duelMode === "remote" &&
              engine.winnerIndex === this.remotePlayerIndex);
          if (humanWon) {
            this.audio.win();
          } else {
            this.audio.lose();
          }
          const delta = Math.abs(engine.scores[0] - engine.scores[1]);
          const playerIndex =
            this.duelMode === "remote" ? this.remotePlayerIndex : 0;
          const opponentIndex = playerIndex === 0 ? 1 : 0;
          recordDuelResult(
            this.save,
            humanWon,
            playerIndex === 0,
            delta,
            engine.players[opponentIndex].name,
            engine.scores[playerIndex],
            engine.scores[opponentIndex]
          );
          trackEvent("duel_result", {
            mode: this.duelMode,
            won: humanWon,
            rounds: engine.roundCount
          });
          if (this.duelMode !== "remote") {
            const seen = new Set(this.save.duelSeenNodeIds ?? []);
            engine.nodes.forEach((duelNode) => seen.add(duelNode.id));
            this.save.duelSeenNodeIds = [...seen].slice(-400);
            this.recordDuelPlay();
            this.persistSave();
          }
        }
        this.clearDuelSnapshot();
      }
      const result = engine.toResult();
      this.root.innerHTML = this.duelResultMarkup(engine, result);
      return;
    }

    const node = engine.node;
    const nodeView = storyNodeDisplay(this.language, this.save,node);
    const lastResult = engine.roundResults[engine.currentRound - 1];
    const roundKey = `${engine.currentRound}-${engine.picks[0] ?? ""}-${engine.picks[1] ?? ""}`;
    if (this.duelPredictionPhase) {
      this.root.innerHTML = `
        <main class="duel-predict has-predict-art" aria-label="${this.t("duelPredict")}">
          <img class="duel-predict-bg" src="${artAsset("duel-match")}" alt="" aria-hidden="true" onerror="this.style.display='none'" />
          <p class="eyebrow">${this.t("duelPredict")}</p>
          <h1>${en ? "Bet on the opponent's style before the reveal" : "揭晓前，先押注对手风格"}</h1>
          <p class="muted">${en ? "Hit the opponent's actual style this round for a +20% score bonus (minimum +2)." : "押中对方本回合的实际风格，获得本回合 20% 分数加成（至少 +2 分）。"}<br />${escapeHtml(nodeView.stake)}</p>
          ${this.duelMode === "local" ? `<p class="muted duel-local-note">${this.t("duelLocalBetNote")}</p>` : ""}
          <div class="duel-predict-options">
            ${
              (
                [
                  {
                    quality: "expert" as DuelQuality,
                    zh: "专家式",
                    en: "Expert",
                    hintZh: "对方最可能选择专家级应对",
                    hintEn: "The opponent's most likely expert move"
                  },
                  {
                    quality: "partial" as DuelQuality,
                    zh: "稳健式",
                    en: "Balanced",
                    hintZh: "对方可能选择稳妥推进",
                    hintEn: "The opponent may play it safe"
                  },
                  {
                    quality: "risk" as DuelQuality,
                    zh: "冒险式",
                    en: "Risk-taking",
                    hintZh: "对方可能冒险破局",
                    hintEn: "The opponent may take a risk"
                  }
                ] as const
              )
                .map(
                  (item) => `
                    <button data-action="duel-predict" data-quality="${item.quality}">
                      <strong>${en ? item.en : item.zh}</strong>
                      <span>${en ? item.hintEn : item.hintZh}</span>
                    </button>
                  `
                )
                .join("")
            }
          </div>
        </main>
      `;
      return;
    }
    if (this.duelRevealing) {
      this.root.innerHTML =
        '<main class="duel-reveal has-reveal-art" aria-label="' + this.t("duelReveal") + '">' +
        '<img class="duel-reveal-bg" src="${artAsset("duel-reveal")}" alt="" aria-hidden="true" onerror="this.style.display=\'none\'" />' +
        '<h1>' + this.t("duelReveal") + '</h1>' +
        '<div class="reveal-spinner"></div>' +
        '</main>';
      return;
    }
    this.root.innerHTML = `
      <header class="topbar duel-top">
        <div class="brand">${this.t("duelTitle")}</div>
        <div class="duel-score">
          <span style="--dot:${engine.players[0].color}"><strong>${engine.players[0].name}</strong> ${engine.scores[0]}</span>
          <span>${this.language === "en" ? `Round ${Math.min(engine.currentRound + 1, engine.roundCount)} / ${engine.roundCount}` : `第 ${Math.min(engine.currentRound + 1, engine.roundCount)} / ${engine.roundCount} 回合`}</span>
          <span id="duel-timer" class="duel-timer" role="timer" style="display:none"></span>
          <span style="--dot:${engine.players[1].color}"><strong>${engine.players[1].name}</strong> ${engine.scores[1]}</span>
        </div>
      </header>
      <main class="duel-shell has-duel-art" data-round-key="${roundKey}" aria-label="${this.language === "en" ? "Duel round" : "对决回合"}">
        <img class="duel-stage-bg" src="${artAsset("duel-match")}" alt="" aria-hidden="true" onerror="this.style.display='none'" />
        ${
          this.duelTimedOutThisRound
            ? `<div class="duel-timeout-note" role="status">${this.language === "en" ? "This round timed out. The system chose the safest option for you." : "本回合超时，系统已自动选择最稳妥选项。"}</div>`
            : ""
        }
        ${
          lastResult
            ? `
              <section class="round-result">
                <span>${this.language === "en" ? "Previous Round" : "上一回合"}</span>
                <strong>${escapeHtml(storyNodeDisplay(this.language, this.save,lastResult.node).title)}</strong>
                <p>${engine.players[0].name} ${lastResult.points[0]} ${this.language === "en" ? "pts" : "分"} · ${engine.players[1].name} ${lastResult.points[1]} ${this.language === "en" ? "pts" : "分"}</p>
              </section>
            `
            : ""
        }
        <section class="duel-scenario">
          <div class="scenario-meta">
            <span>${this.language === "en" ? `Round ${engine.currentRound + 1}` : `回合 ${engine.currentRound + 1}`}</span>
            <span>${nodeView.title}</span>
          </div>
          <h1>${escapeHtml(nodeView.context)}</h1>
          <div class="stake"><strong>${this.t("currentTest")}</strong><p>${escapeHtml(nodeView.stake)}</p></div>
        </section>
        <section class="duel-players">
          ${this.playerPanel(0)}
          <div class="versus">VS</div>
          ${this.playerPanel(1)}
        </section>
        <section class="duel-options">
          ${nodeView.options
            .map(
              (option, index) => `
                <button class="option-card ${this.optionState(index)}" data-action="duel-pick" data-option="${index}" ${this.duelPickEnabled(index) ? "" : "disabled"}>
                  <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                  <span class="option-body">
                    <strong>${escapeHtml(option.label)}</strong>
                    <em>${escapeHtml(option.summary)}</em>
                  </span>
                </button>
              `
            )
            .join("")}
        </section>
        ${
          this.duelMode === "local" && this.localPassed && this.hotSeatTurn === 1
            ? `<div class="pass-note">${this.t("playerTwoTurn")}</div>`
            : this.duelMode === "local" &&
                !this.localPassed &&
                this.hotSeatTurn === 0 &&
                this.duelEngine &&
                this.duelEngine.picks[0] === null &&
                !this.duelEngine.finished &&
                this.duelEngine.currentRound > 0
              ? `<div class="pass-note">${this.t("playerOneTurn")}</div>`
              : ""
        }
        ${
          this.duelMode === "local" &&
          this.hotSeatTurn === 1 &&
          !this.localPassed &&
          this.duelEngine?.picks[0] !== null
            ? `<button class="primary pass-button" data-action="pass-local">${this.language === "en" ? "Pass to Player Two" : "传递给玩家二"}</button>`
            : ""
        }
      </main>
    `;
  }

  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const actionTarget = target.closest<HTMLElement>("[data-action]");
    if (!actionTarget) {
      return;
    }
    const action = actionTarget.dataset.action;
    if (!action) {
      return;
    }
    this.audio.unlock();
    this.audio.ensure();
    this.audio.startAmbientIfIdle();

    if (this.view === "leadershipGames" && action.startsWith("lg-")) {
      this.leadershipGames?.handleAction(action, actionTarget);
      return;
    }
    if (this.view === "teamAcademy" && action.startsWith("ta-")) {
      this.teamAcademy?.handleAction(action, actionTarget);
      return;
    }

    if (!ONLINE_ENABLED && action.startsWith("cloud-")) {
      this.cloudStatus =
        this.language === "en"
          ? "Online mode is disabled in this build."
          : "当前为静态版，未启用云端功能。";
      this.render();
      return;
    }

    if (this.handleTrainingClick(action, actionTarget)) return;
    if (this.handleAssessmentClick(action, actionTarget)) return;
    if (this.handleDuelClick(action, actionTarget)) return;
    if (this.handleTrialClick(action, actionTarget)) return;
    if (this.handleSettingsClick(action, actionTarget)) return;
    if (this.handleCloudClick(action, actionTarget)) return;
    if (this.handleExportClick(action, actionTarget)) return;

    switch (action) {
      case "open-node": {
        const nodeId = actionTarget.dataset.node;
        if (nodeId) {
          // 已完成节点只用于展示，不可再次结算；重打请走 replay-chapter。
          if (isNodeComplete(this.save, nodeId)) {
            this.audio.ui();
            return;
          }
          this.audio.ui();
          this.replayMode = false;
          this.storyNodeId = nodeId;
          this.storyHintRevealed = false;
          this.pendingBranchNodeId = undefined;
          this.pendingChapterTransition = undefined;
          this.lastUnlockedAchievement = undefined;
          this.lastOutcome = undefined;
          this.lastOutcomeNodeId = undefined;
          // D3：派发随机事件时展示"突发干扰"横幅；普通节点清空。
          try {
            const opened = getNode(nodeId);
            this.interferenceText =
              opened.kind === "random"
                ? this.t("interferenceNote")
                : opened.kind === "main" && this.recentExpertRate() < 0.35
                  ? this.adaptiveInterferenceText()
                  : undefined;
          } catch {
            this.interferenceText = undefined;
          }
          this.show("story");
          // D2：每个决策回合开始时启动时限计时器（标准档不计时）。
          this.startRoundTimer();
        }
        break;
      }
      case "resume-last-node": {
        const nodeId = this.save.lastStoryNodeId;
        if (!nodeId) break;
        try {
          const node = getNode(nodeId);
          if (isNodeComplete(this.save, node.id)) {
            this.save.lastStoryNodeId = undefined;
            this.persistSave();
            break;
          }
          this.audio.ui();
          this.replayMode = false;
          this.storyNodeId = node.id;
          this.storyHintRevealed = false;
          this.pendingBranchNodeId = undefined;
          this.pendingChapterTransition = undefined;
          this.lastUnlockedAchievement = undefined;
          this.lastOutcome = undefined;
          this.lastOutcomeNodeId = undefined;
          this.interferenceText =
            node.kind === "random"
              ? this.t("interferenceNote")
              : node.kind === "main" && this.recentExpertRate() < 0.35
                ? this.adaptiveInterferenceText()
                : undefined;
          this.show("story");
          this.startRoundTimer();
        } catch {
          this.save.lastStoryNodeId = undefined;
          this.persistSave();
        }
        break;
      }
      case "select-chapter": {
        const chapterId = Number(actionTarget.dataset.chapter);
        if (this.save.unlockedChapters.includes(chapterId)) {
          this.audio.ui();
          this.selectedChapter = chapterId;
          this.renderMap();
        }
        break;
      }
      case "select-role":
        this.audio.ui();
        this.pendingRole = (actionTarget.dataset.role as RoleId) ?? "highPotential";
        this.renderProfile();
        break;
      case "switch-role": {
        const role = actionTarget.dataset.role as RoleId;
        if (!role || !ROLES[role]) break;
        this.save = loadSave(role);
        this.pendingRole = role;
        this.pendingProfile = undefined;
        this.audio.ui();
        if (this.save.profileCreated) {
          this.show("menu");
        } else {
          this.show("profile");
        }
        break;
      }
      case "new-role": {
        const role = actionTarget.dataset.role as RoleId;
        if (!role || !ROLES[role]) break;
        const existing = roleSlotSummaries().find(
          (slot) => slot.role === role && slot.exists
        );
        if (
          existing &&
          !window.confirm(
            this.language === "en"
              ? `A ${roleDisplay(this.language, role).name} save already exists. Create a new one and overwrite it?`
              : `已存在「${roleDisplay(this.language, role).name}」档案，新建会覆盖它，确定吗？`
          )
        ) {
          break;
        }
        if (existing) {
          deleteRoleSlot(role);
        }
        this.save = loadSave(role);
        this.pendingRole = role;
        this.pendingProfile = undefined;
        this.audio.ui();
        this.show("profile");
        break;
      }
      case "open-menu":
        this.audio.ui();
        this.show("menu");
        break;
      case "open-profile":
        this.audio.ui();
        this.show("profile");
        break;
      case "start-trial-chapter":
        this.pendingRole = "parachute";
        this.startWithoutAssessment();
        this.showToast(
          this.language === "en"
            ? "Chapter 1 trial started as Parachute Manager."
            : "已以空降管理者身份进入首章试玩。"
        );
        break;
      case "open-map":
        this.audio.ui();
        if (this.save.profileCreated && this.save.playCount === 0) {
          this.markGuideStep("map");
        }
        this.interferenceText = undefined;
        this.replayMode = false;
        this.selectedChapter =
          this.save.unlockedChapters[this.save.unlockedChapters.length - 1] ?? 1;
        this.show("map");
        break;
      case "replay-chapter": {
        const chapterId = Number(actionTarget.dataset.chapter);
        const chapter = CHAPTERS.find((item) => item.id === chapterId);
        if (chapter && isChapterComplete(this.save, chapter.id)) {
          this.audio.ui();
          this.replayMode = true;
          this.storyNodeId = chapter.nodeIds[0];
          this.storyHintRevealed = false;
          this.pendingBranchNodeId = undefined;
          this.pendingChapterTransition = undefined;
          this.lastUnlockedAchievement = undefined;
          this.lastOutcome = undefined;
          this.lastOutcomeNodeId = undefined;
          this.interferenceText = undefined;
          this.show("story");
        }
        break;
      }
      case "retry-chapter": {
        const chapterId = Number(actionTarget.dataset.chapter);
        const chapter = CHAPTERS.find((item) => item.id === chapterId);
        if (chapter && isChapterComplete(this.save, chapter.id)) {
          retryChapter(this.save, chapter.id);
          trackEvent("chapter_retry", { chapterId });
          this.audio.ui();
          this.replayMode = false;
          this.storyNodeId = chapter.nodeIds[0];
          this.storyHintRevealed = false;
          this.pendingBranchNodeId = undefined;
          this.pendingChapterTransition = undefined;
          this.lastUnlockedAchievement = undefined;
          this.lastOutcome = undefined;
          this.lastOutcomeNodeId = undefined;
          this.interferenceText = undefined;
          this.show("story");
        }
        break;
      }
      case "guide-ability":
        if (this.save.profileCreated && this.save.playCount === 0) {
          this.markGuideStep("ability");
        }
        this.audio.ui();
        this.show("ability");
        break;
      case "open-ability":
        this.audio.ui();
        if (this.save.profileCreated && this.save.playCount === 0) {
          this.markGuideStep("ability");
        }
        this.show("ability");
        break;
      case "open-report":
        this.audio.ui();
        if (this.save.profileCreated && this.save.playCount === 0) {
          this.markGuideStep("report");
        }
        this.show("report");
        break;
      case "apply-certification": {
        const cert = certificationLevel(this.save);
        if (cert.passed) {
          this.showToast(
            this.language === "en"
              ? `Certification approved · ${cert.level}`
              : `认证通过 · ${cert.level}`
          );
          this.audio.expert();
        } else {
          this.showToast(
            this.language === "en"
              ? `Not certified yet · ${cert.next}`
              : `暂未达标 · ${cert.next}`
          );
          this.audio.partial();
        }
        break;
      }
      case "certification-help":
        this.showToast(
          this.language === "en"
            ? "Certification = assessment score + role focus ability levels. Finish the 30-question assessment and train focus abilities to grow."
            : "认证点 = 测评总分 + 角色重点能力等级合计；完成 30 题测评提升总分，训练角色重点能力提升等级。"
        );
        this.audio.ui();
        break;
      case "open-due-review": {
        const ability = actionTarget.dataset.ability;
        const dueIds = dueReviewCards(this.save.reviewCards ?? [])
          .filter(
            (card) =>
              !ability || this.reviewAbilityFor(card.nodeId) === ability
          )
          .map((card) => card.nodeId);
        if (dueIds.length === 0) {
          this.showToast(
            this.language === "en"
              ? "No review cards are due right now."
              : "当前没有到期的复习卡。"
          );
          break;
        }
        this.wrongReviewQueue = dueIds;
        this.wrongReviewIndex = 0;
        this.storyNodeId = dueIds[0];
        this.replayMode = true;
        this.lastOutcome = undefined;
        this.lastOutcomeNodeId = undefined;
        this.audio.ui();
        this.show("story");
        break;
      }
      case "open-dual-review": {
        const ability = actionTarget.dataset.ability;
        const dueIds = dueReviewCards(this.save.reviewCards ?? [])
          .filter(
            (card) =>
              !ability || this.reviewAbilityFor(card.nodeId) === ability
          )
          .map((card) => card.nodeId);
        if (dueIds.length === 0) {
          this.showToast(
            this.language === "en"
              ? "No review cards are due right now."
              : "当前没有到期的复习卡。"
          );
          break;
        }
        this.dualReviewQueue = dueIds;
        this.dualReviewIndex = 0;
        this.resetDualSelection();
        this.audio.ui();
        this.show("dualReview");
        break;
      }
      case "dual-toggle": {
        const axis = actionTarget.dataset.axis as "best" | "worst";
        const option = Number(actionTarget.dataset.option);
        if (axis === "best") {
          this.dualBestIndex = option;
          if (this.dualWorstIndex === option) this.dualWorstIndex = undefined;
        } else {
          this.dualWorstIndex = option;
          if (this.dualBestIndex === option) this.dualBestIndex = undefined;
        }
        this.audio.ui();
        this.renderDualReview();
        break;
      }
      case "dual-submit": {
        if (
          this.dualBestIndex === undefined ||
          this.dualWorstIndex === undefined
        ) {
          this.showToast(
            this.language === "en"
              ? "Choose both the best and worst move first."
              : "请先同时选择最佳和最差选项。"
          );
          break;
        }
        const nodeId = this.dualReviewQueue[this.dualReviewIndex];
        if (!nodeId) break;
        const roleNode = getNodeForRole(this.save.profile.role, nodeId);
        const options = storyNodeDisplay(this.language, this.save,roleNode).options;
        const expertIndex = options.findIndex(
          (option) => option.quality === "expert"
        );
        const worstIndex = worstOptionIndex(options);
        const outcome = scoreDualAxis(
          this.dualBestIndex,
          this.dualWorstIndex,
          expertIndex,
          worstIndex
        );
        this.dualLastOutcome = outcome;
        this.dualSubmitted = true;
        this.save.reviewCards = recordReviewResult(
          this.save.reviewCards ?? [],
          nodeId,
          dualAxisQuality(outcome)
        );
        this.persistSave();
        if (outcome === "perfect") this.audio.expert();
        else if (outcome === "partial") this.audio.partial();
        else this.audio.risk();
        this.renderDualReview();
        break;
      }
      case "dual-next":
        this.dualReviewIndex += 1;
        if (this.dualReviewIndex >= this.dualReviewQueue.length) {
          this.dualReviewQueue = [];
          this.dualReviewIndex = 0;
          this.resetDualSelection();
          this.audio.ui();
          this.show("report");
          break;
        }
        this.resetDualSelection();
        this.audio.ui();
        this.renderDualReview();
        break;
      case "dual-close":
        this.dualReviewQueue = [];
        this.dualReviewIndex = 0;
        this.resetDualSelection();
        this.audio.ui();
        this.show("report");
        break;
      case "open-team-academy":
        this.teamAcademy = new TeamAcademyApp(
          this.save.profile.role as "parachute" | "founder" | "highPotential",
          this.language,
          {
            onBack: () => this.show("menu"),
            onAudio: (kind) => {
              if (kind === "correct") this.audio.expert();
              else if (kind === "wrong") this.audio.risk();
              else this.audio.ui();
            }
          }
        );
        this.audio.ui();
        this.show("teamAcademy");
        break;
      case "open-custom-scenarios":
        this.customPlayId = undefined;
        this.customPlayResult = undefined;
        this.audio.ui();
        this.show("customScenarios");
        break;
      case "custom-submit": {
        const value = (name: string): string =>
          this.root.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value ??
          "";
        const title = value("custom-title");
        const context = value("custom-context");
        const stake = value("custom-stake");
        const options = [0, 1, 2].map((index) => ({
          label: value(`custom-option-${index}-label`),
          summary: value(`custom-option-${index}-summary`),
          feedback: value(`custom-option-${index}-feedback`),
          quality: this.root.querySelector<HTMLSelectElement>(
            `[name="custom-option-${index}-quality"]`
          )?.value as "expert" | "partial" | "risk"
        }));
        const errors = validateCustomScenario({ title, context, stake, options });
        if (errors.length > 0) {
          this.showToast(errors[0]);
          this.audio.risk();
          break;
        }
        this.customScenarios = [
          ...this.customScenarios,
          createCustomScenario({ title, context, stake, options })
        ];
        saveCustomScenarios(this.customScenarios);
        this.audio.expert();
        this.renderCustomScenarios();
        break;
      }
      case "custom-export": {
        const text = exportCustomScenarios(this.customScenarios);
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "ascend-custom-scenarios.json";
        anchor.click();
        URL.revokeObjectURL(url);
        this.audio.ui();
        break;
      }
      case "custom-delete": {
        const id = actionTarget.dataset.id;
        this.customScenarios = this.customScenarios.filter(
          (scenario) => scenario.id !== id
        );
        saveCustomScenarios(this.customScenarios);
        this.audio.ui();
        this.renderCustomScenarios();
        break;
      }
      case "custom-play": {
        const id = actionTarget.dataset.id;
        if (this.customScenarios.some((scenario) => scenario.id === id)) {
          this.customPlayId = id;
          this.customPlayResult = undefined;
          this.audio.ui();
          this.show("customScenarioPlay");
        }
        break;
      }
      case "custom-option": {
        const index = Number(actionTarget.dataset.option);
        this.customPlayResult = index;
        const scenario = this.customScenarios.find(
          (item) => item.id === this.customPlayId
        );
        const quality = scenario?.options[index]?.quality;
        if (quality === "expert") this.audio.expert();
        else if (quality === "partial") this.audio.partial();
        else this.audio.risk();
        this.renderCustomScenarioPlay();
        break;
      }
      case "custom-back":
        this.customPlayId = undefined;
        this.customPlayResult = undefined;
        this.audio.ui();
        this.show("customScenarios");
        break;
      case "live-create": {
        const select = this.root.querySelector<HTMLSelectElement>(
          "[data-live-scenario]"
        );
        const id = select?.value;
        let node: StoryNode | undefined;
        if (id?.startsWith("custom-")) {
          const scenario = this.customScenarios.find(
            (item) => item.id === id
          );
          if (scenario) node = customScenarioToNode(scenario);
        } else if (id) {
          try {
            node = getNode(id);
          } catch {
            node = undefined;
          }
        }
        if (!node) {
          this.showToast(
            this.language === "en"
              ? "Choose a scenario first."
              : "请先选择一个情境。"
          );
          break;
        }
        this.liveNode = node;
        this.liveSessionId = this.liveRunner.createSession("coach", node).sessionId;
        this.livePendingOption = 0;
        this.liveName = "";
        this.liveRevealed = false;
        this.liveDistribution = undefined;
        this.audio.ui();
        this.renderCoach();
        break;
      }
      case "live-pick":
        this.liveName =
          this.root.querySelector<HTMLInputElement>('input[name="live-name"]')
            ?.value.trim() ?? "";
        this.livePendingOption = Number(actionTarget.dataset.option) || 0;
        this.audio.ui();
        this.renderCoach();
        break;
      case "live-add": {
        const name = this.liveName;
        if (!name || !this.liveSessionId || !this.liveNode) {
          this.showToast(
            this.language === "en"
              ? "Enter a participant name first."
              : "请先输入学员姓名。"
          );
          break;
        }
        this.liveRunner.submitPick(
          this.liveSessionId,
          name,
          this.livePendingOption
        );
        this.liveName = "";
        this.audio.ui();
        this.renderCoach();
        break;
      }
      case "live-reveal": {
        if (!this.liveSessionId) break;
        this.liveDistribution = this.liveRunner.reveal(
          this.liveSessionId
        ).distribution;
        this.liveRevealed = true;
        this.audio.expert();
        this.renderCoach();
        break;
      }
      case "live-reset":
        this.liveSessionId = undefined;
        this.liveNode = undefined;
        this.liveRevealed = false;
        this.liveDistribution = undefined;
        this.livePendingOption = 0;
        this.liveName = "";
        this.audio.ui();
        this.renderCoach();
        break;
      case "open-wrong-review": {
        const wrongIds = [
          ...new Set(
            this.save.decisionHistory
              .filter((record) => record.quality !== "expert")
              .map((record) => record.nodeId)
          )
        ]
          .slice(-8)
          .reverse();
        if (wrongIds.length === 0) {
          this.showToast(
            this.language === "en"
              ? "No missed moves to review yet."
              : "暂无可回练的错题。"
          );
          break;
        }
        this.wrongReviewQueue = wrongIds;
        this.wrongReviewIndex = 0;
        this.storyNodeId = wrongIds[0];
        this.replayMode = true;
        this.lastOutcome = undefined;
        this.lastOutcomeNodeId = undefined;
        this.audio.ui();
        this.show("story");
        break;
      }
      case "next-wrong-review":
        this.wrongReviewIndex += 1;
        if (this.wrongReviewIndex >= this.wrongReviewQueue.length) {
          this.wrongReviewQueue = [];
          this.wrongReviewIndex = 0;
          this.replayMode = false;
          this.audio.ui();
          this.show("report");
          break;
        }
        this.storyNodeId = this.wrongReviewQueue[this.wrongReviewIndex];
        this.lastOutcome = undefined;
        this.lastOutcomeNodeId = undefined;
        this.audio.ui();
        this.show("story");
        break;
      case "open-ending":
        if (isChapterPassed(this.save, 9)) {
          this.audio.ui();
          this.show("ending");
        }
        break;
      case "ending-back":
        this.audio.ui();
        this.show("report");
        break;
      case "ending-share": {
        const textarea = this.root.querySelector<HTMLTextAreaElement>(
          "#ending-share-target"
        );
        const summary = profileSummary(this.save);
        const text =
          `${this.save.profile.name} · ${rankName(this.language, summary.rank)} · ${this.language === "en" ? "Ascend" : "升维"}\n` +
          `${this.language === "en" ? `Total Ability ${summary.total}` : `综合能力值 ${summary.total}`}`;
        if (textarea) {
          textarea.value = text;
          void navigator.clipboard?.writeText(text);
        }
        this.audio.ui();
        break;
      }
      case "ending-card": {
        const en = this.language === "en";
        const canvas = this.root.querySelector<HTMLCanvasElement>(
          "#ending-card-canvas"
        );
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const summary = profileSummary(this.save);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            bg.addColorStop(0, "#0a1013");
            bg.addColorStop(1, "#17262e");
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#f2c14e";
            ctx.font = "700 34px 'Microsoft YaHei', sans-serif";
            ctx.fillText("升维", 48, 78);
            ctx.fillStyle = "#e7eef2";
            ctx.font = "700 42px 'Microsoft YaHei', sans-serif";
            ctx.fillText(
              `${this.save.profile.name} · ${rankName(this.language, summary.rank)}`,
              48,
              170
            );
            ctx.fillStyle = "#9fb3c8";
            ctx.font = "22px 'Microsoft YaHei', sans-serif";
            ctx.fillText(
              `${en ? "Total Ability" : "综合能力值"} ${summary.total}`,
              48,
              240
            );
            ctx.fillText(
              `${en ? "Chapters" : "章节"} ${summary.chapterCount}/9`,
              48,
              290
            );
            ctx.fillStyle = "#f2c14e";
            ctx.fillText("升维 · 自适应领导力情境游戏", 48, 430);
            const url = canvas.toDataURL("image/png");
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${en ? "Ascend-ending" : "升维结局"}.png`;
            anchor.click();
          }
        }
        this.audio.ui();
        break;
      }
      case "ending-choice": {
        const ending = actionTarget.dataset.ending;
        if (ending) {
          this.endingChoice = ending;
          recordAlternateEnding(this.save, `ending-${ending}`);
          this.audio.expert();
          this.renderEnding();
        }
        break;
      }
      case "hidden-option": {
        const abilityId = this.hiddenBranchAbilityId;
        if (!abilityId) break;
        const steps = hiddenRouteSteps(abilityId);
        const step = Math.min(this.hiddenRouteStep, steps.length - 1);
        const selected = Number(actionTarget.dataset.option);
        const correct = selected === steps[step].answer;
        this.hiddenRouteLastAnswer = selected;
        this.hiddenRouteLastCorrect = correct;
        if (correct) {
          this.save.hiddenRouteProgress[abilityId] = Math.max(
            this.save.hiddenRouteProgress[abilityId] ?? 0,
            step + 1
          );
          if (step + 1 >= steps.length) {
            recordHiddenRoute(this.save, `hidden-${abilityId}`);
          }
        }
        this.audio.ui();
        this.renderHiddenBranch();
        break;
      }
      case "hidden-next": {
        const abilityId = this.hiddenBranchAbilityId;
        if (!abilityId) break;
        if (this.hiddenRouteLastCorrect) {
          const steps = hiddenRouteSteps(abilityId);
          this.hiddenRouteStep = Math.min(
            steps.length - 1,
            this.hiddenRouteStep + 1
          );
        }
        this.hiddenRouteLastAnswer = undefined;
        this.hiddenRouteLastCorrect = undefined;
        this.audio.ui();
        this.renderHiddenBranch();
        break;
      }
      case "continue-hidden-exit":
        this.audio.ui();
        if (this.lastOutcome && this.lastOutcomeNodeId) {
          this.storyNodeId = this.lastOutcomeNodeId;
          this.show("story");
        } else {
          this.show("map");
        }
        break;
      case "open-achievements":
        this.audio.ui();
        this.show("achievements");
        break;
      case "open-relations":
        this.audio.ui();
        this.show("relations");
        break;
      case "open-settings":
        this.audio.ui();
        this.show("settings");
        break;
      case "open-assessment":
        this.pendingProfile = structuredClone(this.save.profile);
        this.assessmentAnswers = [];
        this.assessmentStep = 0;
        this.audio.ui();
        this.show("assessment");
        break;
      case "open-coach":
        this.audio.ui();
        this.show("coach");
        break;
      case "coach-plan-goal":
        this.coachGoal = actionTarget.dataset.goal as CoachGoal;
        this.coachPlanStep = "challenge";
        this.renderCoach();
        break;
      case "coach-plan-challenge":
        this.coachChallenge =
          actionTarget.dataset.challenge as CoachChallenge;
        this.coachPlanStep = "plan";
        this.coachPlan =
          this.coachGoal && this.coachChallenge
            ? generateCoachPlan(
                this.save,
                this.coachGoal,
                this.coachChallenge
              )
            : undefined;
        this.coachPlanChecks = {};
        this.renderCoach();
        break;
      case "coach-plan-check": {
        const key = actionTarget.dataset.key ?? "";
        this.coachPlanChecks[key] = !this.coachPlanChecks[key];
        this.renderCoach();
        break;
      }
      case "coach-plan-restart":
        this.coachPlan = undefined;
        this.coachGoal = undefined;
        this.coachChallenge = undefined;
        this.coachPlanStep = "goal";
        this.coachPlanChecks = {};
        this.renderCoach();
        break;
      case "coach-load-demo":
        this.loadCoachDemo();
        break;
      case "coach-import":
        this.importCoachParticipants();
        break;
      case "claim-challenge": {
        const challengeId = actionTarget.dataset.challenge ?? "";
        const today = todayKey();
        if (!(this.save.claimedDaily[today] ?? []).includes(challengeId)) {
          const reward =
            dailyChallenges(this.save).find(
              (challenge) => challenge.id === challengeId
            )?.reward ?? 3;
          this.save.claimedDaily[today] = [
            ...(this.save.claimedDaily[today] ?? []),
            challengeId
          ];
          this.save.masteryPoints += reward;
          this.persistSave();
          trackEvent("daily_claim", { challengeId });
          this.audio.expert();
          this.renderMap();
        }
        break;
      }
      case "claim-weekly": {
        const challengeId = actionTarget.dataset.challenge ?? "";
        const week = weekKey();
        const weekly = weeklyChallenges(this.save);
        const reward =
          weekly.find((challenge) => challenge.id === challengeId)?.reward ?? 4;
        this.save.claimedWeekly = {
          ...(this.save.claimedWeekly ?? {}),
          [week]: [
            ...((this.save.claimedWeekly ?? {})[week] ?? []),
            challengeId
          ]
        };
        this.save.masteryPoints += reward;
        this.save.trialEnergy = clamp(this.save.trialEnergy + 15, 0, 100);
        this.persistSave();
        trackEvent("weekly_claim", { challengeId });
        this.audio.expert();
        this.renderMap();
        break;
      }
      case "toggle-pressure":
        this.save.highPressureMode = !this.save.highPressureMode;
        this.persistSave();
        this.audio.ui();
        this.renderMap();
        break;
      case "set-difficulty": {
        // D1：把难度选择器写入存档，重渲染地图让按钮高亮与说明立即反映所选档位；
        // 资源缩放由 applyStoryChoice 以 save.difficulty 为准，下个决策即生效。
        const difficulty = actionTarget.dataset.difficulty;
        if (difficulty === "normal" || difficulty === "pressure" || difficulty === "extreme") {
          this.audio.ui();
          this.save.difficulty = difficulty;
          this.persistSave();
          this.showToast(
            this.language === "en"
              ? `Difficulty set to ${difficulty === "normal" ? "Normal" : difficulty === "pressure" ? "Pressure" : "Extreme"}.`
              : `难度已切换为${difficulty === "normal" ? "标准" : difficulty === "pressure" ? "高压" : "极限"}。`
          );
          if (this.view === "settings") {
            this.renderSettings();
          } else {
            this.renderMap();
          }
        }
        break;
      }
      case "toggle-achievement-favorite": {
        const achievementId = actionTarget.dataset.achievement;
        if (!achievementId) break;
        if (this.favoriteAchievements.has(achievementId)) {
          this.favoriteAchievements.delete(achievementId);
        } else {
          this.favoriteAchievements.add(achievementId);
        }
        try {
          localStorage.setItem(
            ACHIEVEMENT_FAVORITE_KEY,
            JSON.stringify([...this.favoriteAchievements])
          );
        } catch {
          // ignore storage failures
        }
        this.audio.ui();
        this.renderAchievements();
        break;
      }
      case "toggle-hint":
        this.storyHintRevealed = !this.storyHintRevealed;
        this.audio.ui();
        this.renderStory();
        break;
      case "energy-restore":
        if (!this.energyRestoreUsed) {
          this.save.profile.resources.energy = Math.min(
            100,
            this.save.profile.resources.energy + 25
          );
          this.energyRestoreUsed = true;
          this.persistSave();
          this.audio.expert();
          this.showToast(
            this.language === "en"
              ? "Energy restored +25."
              : "精力已恢复 +25。"
          );
          this.renderStory();
        }
        break;
      case "choose-option":
        this.chooseStoryOption(actionTarget);
        break;
      case "open-leadership-games":
        this.openLeadershipGames();
        break;
      case "organizational-invest":
        this.organizationalInvest();
        break;
      case "claim-production":
        this.claimProduction();
        break;
      case "claim-duel-bonus":
        this.claimDuelBonus();
        break;
      case "dismiss-map-guide":
        this.markGuideStep("map-intro");
        this.audio.ui();
        this.renderMap();
        break;
      case "expedition-explore":
        this.exploreNodeAction(actionTarget);
        break;
      case "integrity-answer":
        this.answerIntegrityGate(actionTarget);
        break;
      case "continue-story":
        if (
          this.replayMode &&
          this.lastOutcome &&
          this.storyNodeId
        ) {
          const chapterId = getNode(this.storyNodeId).chapterId;
          recordAlternateEnding(this.save, `replay-${chapterId}`);
        }
        this.lastOutcome = undefined;
        this.lastOutcomeNodeId = undefined;
        this.lastUnlockedAchievement = undefined;
        this.pendingBranchNodeId = undefined;
        this.pendingChapterTransition = undefined;
        this.interferenceText = undefined;
        this.show("map");
        break;
      case "choose-route": {
        const chapterId = Number(actionTarget.dataset.chapter);
        const route = actionTarget.dataset.route;
        if (
          Number.isFinite(chapterId) &&
          (route === "expert" || route === "risk" || route === "partial")
        ) {
          this.save.routePath[chapterId] = route;
          this.persistSave();
          trackEvent("route_choice", { chapterId, route });
          this.showToast(
            this.language === "en"
              ? `Route set to ${route === "expert" ? "Precision" : route === "risk" ? "Pressure" : "Incremental"}.`
              : `路线已选择：${route === "expert" ? "精准路线" : route === "risk" ? "高压路线" : "渐进路线"}。`
          );
          this.pendingForkNodeId = forkNodeForRoute(chapterId, route);
          this.renderChapterTransition();
        }
        break;
      }
      case "continue-transition":
        if (this.pendingChapterTransition) {
          this.audio.ui();
          this.show("chapterTransition");
        }
        break;
      case "continue-transition-map": {
        const forkId = this.pendingForkNodeId;
        if (forkId) {
          this.audio.ui();
          this.storyNodeId = forkId;
          this.storyHintRevealed = false;
          this.pendingBranchNodeId = undefined;
          this.lastOutcome = undefined;
          this.lastOutcomeNodeId = undefined;
          this.lastUnlockedAchievement = undefined;
          this.interferenceText = undefined;
          this.show("story");
          this.startRoundTimer();
          break;
        }
        const completed = this.pendingChapterTransition;
        this.pendingChapterTransition = undefined;
        this.lastOutcome = undefined;
        this.lastOutcomeNodeId = undefined;
        this.lastUnlockedAchievement = undefined;
        if (completed && completed < CHAPTERS.length) {
          this.selectedChapter = completed + 1;
        }
        this.audio.ui();
        this.show("map");
        break;
      }
      case "enter-fork": {
        const forkId = this.pendingForkNodeId;
        if (forkId) {
          this.audio.ui();
          this.storyNodeId = forkId;
          this.storyHintRevealed = false;
          this.pendingBranchNodeId = undefined;
          this.lastOutcome = undefined;
          this.lastOutcomeNodeId = undefined;
          this.lastUnlockedAchievement = undefined;
          this.interferenceText = undefined;
          this.show("story");
          this.startRoundTimer();
        }
        break;
      }
      case "finish-fork": {
        this.pendingForkNodeId = undefined;
        this.pendingBranchNodeId = undefined;
        this.lastOutcome = undefined;
        this.lastOutcomeNodeId = undefined;
        this.lastUnlockedAchievement = undefined;
        this.audio.ui();
        if (this.pendingChapterTransition) {
          this.renderChapterTransition();
        } else {
          this.show("map");
        }
        break;
      }
      case "continue-branch": {
        const branchId = this.pendingBranchNodeId;
        if (branchId) {
          if (branchId.startsWith("ability-")) {
            this.hiddenBranchAbilityId = branchId.slice(
              "ability-".length
            ) as AbilityId;
            this.hiddenRouteStep =
              this.save.hiddenRouteProgress[this.hiddenBranchAbilityId] ?? 0;
            this.hiddenRouteLastAnswer = undefined;
            this.hiddenRouteLastCorrect = undefined;
            this.pendingBranchNodeId = undefined;
            this.audio.ui();
            this.show("hiddenBranch");
            break;
          }
          this.storyNodeId = branchId;
          this.storyHintRevealed = false;
          this.pendingBranchNodeId = undefined;
          this.lastOutcome = undefined;
          this.lastOutcomeNodeId = undefined;
          this.interferenceText = undefined;
          this.audio.ui();
          this.show("story");
          this.startRoundTimer();
        }
        break;
      }
      case "reset-profile":
        if (
          window.confirm(
            this.language === "en"
              ? "Clear the current profile and all progress?"
              : "确定要清空当前档案和所有进度吗？"
          )
        ) {
          deleteRoleSlot(this.save.profile.role);
          this.save = resetSave(this.save.profile.role);
          trackEvent("profile_reset");
          this.pendingRole = this.save.profile.role;
          this.show("profile");
        }
        break;
    }
  }

  /** 训练视图点击：从 handleClick 拆出的训练域动作，返回 true 表示已处理。 */
  private handleTrainingClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
      case "open-training": {
        const abilityId = actionTarget.dataset.ability as AbilityId | undefined;
        if (abilityId && EXPANDED_TRAINING[abilityId]) {
          this.audio.ui();
          this.trainingReturnView =
            this.view === "report" || this.view === "assessmentResult"
              ? this.view
              : "ability";
          this.trainingAbilityId = abilityId;
          this.trainingStage = "story";
          this.trainingStep = 0;
          this.trainingAnswers = Array(
            EXPANDED_TRAINING[abilityId].questions.length
          ).fill(0);
          this.trainingResult = undefined;
          this.show("training");
        }
        return true;
      }
      case "training-back":
        this.audio.ui();
        this.show(
          this.trainingReturnView === "training"
            ? "ability"
            : this.trainingReturnView
        );
        return true;
      case "training-start-quiz":
        this.audio.trainingStart();
        this.trainingStage = "quiz";
        this.trainingStep = 0;
        this.trainingAnswers = Array(
          EXPANDED_TRAINING[this.trainingAbilityId].questions.length
        ).fill(0);
        this.renderTraining();
        return true;
      case "training-option": {
        const trainingQuestion = EXPANDED_TRAINING[this.trainingAbilityId].questions[this.trainingStep];
        this.trainingAnswers[this.trainingStep] = Number(
          actionTarget.dataset.option
        );
        if (Number(actionTarget.dataset.option) === trainingQuestion.answer) {
          this.audio.trainingCorrect();
        } else {
          this.audio.ui();
        }
        this.renderTraining();
        return true;
      }
      case "training-next":
        this.trainingStep = Math.min(
          EXPANDED_TRAINING[this.trainingAbilityId].questions.length - 1,
          this.trainingStep + 1
        );
        this.audio.ui();
        this.renderTraining();
        return true;
      case "training-prev":
        this.trainingStep = Math.max(0, this.trainingStep - 1);
        this.audio.ui();
        this.renderTraining();
        return true;
      case "training-submit": {
        const questions = EXPANDED_TRAINING[this.trainingAbilityId].questions;
        const scored = scoreTrainingAnswers(questions, this.trainingAnswers);
        const result = applyTrainingResult(
          this.save,
          this.trainingAbilityId,
          scored.correct,
          scored.total
        );
        trackEvent("training_result", {
          abilityId: this.trainingAbilityId,
          correct: scored.correct,
          total: scored.total,
          firstComplete: result.firstComplete
        });
        this.trainingResult = { ...result, answered: scored.answered };
        this.trainingStage = "result";
        if (result.correct === scored.total) {
          this.audio.trainingMastery();
        } else if (result.correct >= 1) {
          this.audio.trainingCorrect();
        } else {
          this.audio.risk();
        }
        this.renderTraining();
        return true;
      }
      case "training-restart":
        this.trainingStage = "story";
        this.trainingStep = 0;
        this.trainingAnswers = Array(
          EXPANDED_TRAINING[this.trainingAbilityId].questions.length
        ).fill(0);
        this.trainingResult = undefined;
        this.audio.ui();
        this.renderTraining();
        return true;
      default:
        return false;
    }
  }

  /** 建档/测评视图点击：从 handleClick 拆出的测评域动作，返回 true 表示已处理。 */
  private handleAssessmentClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
      case "create-profile":
        this.createProfileFromForm();
        return true;
      case "start-without-assessment":
        this.startWithoutAssessment();
        return true;
      case "assessment-option":
        this.assessmentAnswers[this.assessmentStep] = Number(
          actionTarget.dataset.option
        );
        this.audio.ui();
        this.renderAssessment();
        return true;
      case "assessment-next":
        this.assessmentAnswers[this.assessmentStep] ??= 0;
        this.assessmentStep = Math.min(
          ASSESSMENT_QUESTIONS.length - 1,
          this.assessmentStep + 1
        );
        this.audio.ui();
        this.renderAssessment();
        return true;
      case "assessment-prev":
        this.assessmentStep = Math.max(0, this.assessmentStep - 1);
        this.audio.ui();
        this.renderAssessment();
        return true;
      case "assessment-submit":
        this.assessmentAnswers[this.assessmentStep] ??= 0;
        this.finishProfile(true);
        return true;
      case "assessment-skip":
        this.finishProfile(false);
        return true;
      case "start-campaign":
        this.audio.ui();
        this.show("map");
        return true;
      default:
        return false;
    }
  }

  /** 1v1 对局视图点击：从 handleClick 拆出的对决域动作，返回 true 表示已处理。 */
  private handleDuelClick(action: string, actionTarget: HTMLElement): boolean {
    switch (action) {
      case "open-duel":
        this.audio.ui();
        this.show("duelLobby");
        return true;
      case "open-duel-lobby":
        this.audio.ui();
        this.cleanupRemote();
        this.show("duelLobby");
        return true;
      case "set-duel-mode":
        this.duelMode = (actionTarget.dataset.mode as DuelMode) ?? "ai";
        this.renderDuelLobby();
        return true;
      case "start-ai-duel":
        this.startAiDuel();
        return true;
      case "start-challenge-duel":
        this.startChallengeDuel();
        return true;
      case "start-endless-duel":
        this.startEndlessDuel();
        return true;
      case "resume-duel":
        this.resumeDuel();
        return true;
      case "start-local-duel":
        this.startLocalDuel();
        return true;
      case "duel-rematch":
        if (this.duelRematchAction === "ai") {
          this.startAiDuel();
        } else if (this.duelRematchAction === "local") {
          this.startLocalDuel();
        }
        return true;
      case "create-remote":
        void this.createRemote();
        return true;
      case "join-remote":
        void this.joinRemote();
        return true;
      case "finish-remote":
        void this.finishRemote();
        return true;
      case "copy-invite":
        this.copyText(actionTarget, "copy-target");
        return true;
      case "copy-answer":
        this.copyText(actionTarget, "copy-target");
        return true;
      case "duel-pick":
        this.duelPick(actionTarget);
        return true;
      case "duel-predict": {
        const prediction = actionTarget.dataset.quality as
          | DuelQuality
          | undefined;
        if (!prediction) {
          return true;
        }
        const engine = this.duelEngine;
        if (
          engine?.currentRound === 0 &&
          engine?.roundResults.length === 0
        ) {
          this.duelPredictionHistory = [];
        }
        this.duelPrediction = prediction;
        this.duelPredictionPhase = false;
        if (this.duelMode === "remote") {
          this.duelPredictionCorrect = undefined;
          this.duelPredictionHistory.push(false);
          const ownOption = this.remoteOwnOption ?? 0;
          if (this.usingCloudMatch && this.roomClient) {
            this.roomClient.reveal(ownOption);
          } else if (this.remotePeer) {
            this.remotePeer.send({
              kind: "reveal",
              optionIndex: ownOption
            });
          }
          this.audio.duelPick();
          this.renderDuel();
          return true;
        }
        const predictingIndex =
          this.duelMode === "local" ? (this.hotSeatTurn as 0 | 1) : 0;
        const bonus = engine
          ? engine.predictOpponentStyle(predictingIndex, prediction)
          : 0;
        this.duelPredictionCorrect = bonus > 0;
        this.duelPredictionHistory.push(bonus > 0);
        this.duelPredictionBonusTotal += bonus;
        this.audio.duelPick();
        this.maybeRevealDuelRound();
        return true;
      }
      case "pass-local":
        this.localPassed = true;
        this.hotSeatTurn = 1;
        this.renderDuel();
        return true;
      default:
        return false;
    }
  }

  private handleTrialClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
      case "open-trial":
        this.audio.ui();
        this.activeTrialId = undefined;
        this.trialAnswerResult = undefined;
        this.lastTrialAnswer = undefined;
        this.trialObserveRevealed = false;
        this.trialAllyChoice = undefined;
        this.trialAllyCorrect = undefined;
        this.trialSuspectChoice = undefined;
        this.trialSuspectCorrect = undefined;
        this.trialIntelChoice = undefined;
        this.trialIntelCorrect = undefined;
        this.trialBetrayalChoice = undefined;
        this.trialBetrayalCorrect = undefined;
        this.trialFactionTrust = 50;
        this.trialFactionSuspicion = 50;
        this.trialFollowUpAnswer = undefined;
        this.trialFollowUpAnswered = false;
        this.trialSummaryPending = false;
        this.trialSummaryKeywordCorrect = undefined;
        this.trialCalculationAnswer = undefined;
        this.trialCalculationCorrect = undefined;
        this.activePracticeTaskId = undefined;
        this.show("trial");
        return true;
      case "trial-stage": {
        const stageId = actionTarget.dataset.stage ?? "";
        const stage = TRIAL_STAGES.find((item) => item.id === stageId);
        if (stage && canEnterTrial(this.save, stage)) {
          this.audio.trainingStart();
          this.activeTrialId = stage.id;
          this.trialAnswerResult = undefined;
          this.lastTrialAnswer = undefined;
          this.trialObserveRevealed =
            stage.style === "wolf" &&
            this.save.trialItems.includes("矛盾镜");
          this.trialAllyChoice = undefined;
          this.trialAllyCorrect = undefined;
          this.trialSuspectChoice = undefined;
          this.trialSuspectCorrect = undefined;
          this.trialIntelChoice = undefined;
          this.trialIntelCorrect = undefined;
          this.trialBetrayalChoice = undefined;
          this.trialBetrayalCorrect = undefined;
          this.trialFactionTrust = 50;
          this.trialFactionSuspicion = 50;
          this.trialFollowUpAnswer = undefined;
          this.trialFollowUpAnswered = false;
          this.trialSummaryPending = false;
          this.trialSummaryKeywordCorrect = undefined;
          this.trialCalculationAnswer = undefined;
          this.trialCalculationCorrect = undefined;
          this.show("trialBattle");
        }
        return true;
      }
      case "trial-observe":
        this.trialObserveRevealed = true;
        this.trialFactionTrust = Math.min(100, this.trialFactionTrust + 5);
        this.trialFactionSuspicion = Math.min(
          100,
          this.trialFactionSuspicion + 5
        );
        this.audio.ui();
        this.renderTrialBattle();
        return true;
      case "trial-ally":
        this.trialAllyChoice = actionTarget.dataset.ally;
        this.audio.ui();
        this.renderTrialBattle();
        return true;
      case "trial-suspect":
        this.trialSuspectChoice = actionTarget.dataset.suspect;
        {
          const stage = TRIAL_STAGES.find(
            (item) => item.id === this.activeTrialId
          );
          if (stage?.correctSuspect) {
            this.trialSuspectCorrect =
              this.trialSuspectChoice === stage.correctSuspect;
            this.trialFactionTrust = Math.max(
              0,
              Math.min(
                100,
                this.trialFactionTrust +
                  (this.trialSuspectCorrect ? 15 : -10)
              )
            );
            this.trialFactionSuspicion = Math.max(
              0,
              Math.min(
                100,
                this.trialFactionSuspicion +
                  (this.trialSuspectCorrect ? -10 : 15)
              )
            );
          }
        }
        this.audio.ui();
        this.renderTrialBattle();
        return true;
      case "trial-intel":
        this.trialIntelChoice = actionTarget.dataset.intel;
        {
          const stage = TRIAL_STAGES.find(
            (item) => item.id === this.activeTrialId
          );
          if (stage?.correctIntel) {
            this.trialIntelCorrect =
              this.trialIntelChoice === stage.correctIntel;
            this.trialFactionTrust = Math.max(
              0,
              Math.min(
                100,
                this.trialFactionTrust +
                  (this.trialIntelCorrect ? 10 : -5)
              )
            );
          }
        }
        this.audio.ui();
        this.renderTrialBattle();
        return true;
      case "trial-betrayal":
        this.trialBetrayalChoice = actionTarget.dataset.betrayal;
        {
          const stage = TRIAL_STAGES.find(
            (item) => item.id === this.activeTrialId
          );
          if (stage?.correctBetrayal) {
            this.trialBetrayalCorrect =
              this.trialBetrayalChoice === stage.correctBetrayal;
            this.trialFactionTrust = Math.max(
              0,
              Math.min(
                100,
                this.trialFactionTrust +
                  (this.trialBetrayalCorrect ? 10 : -10)
              )
            );
          }
        }
        this.audio.ui();
        this.renderTrialBattle();
        return true;
      case "trial-submit-summary": {
        const activeStage = TRIAL_STAGES.find(
          (item) => item.id === this.activeTrialId
        );
        if (!activeStage) return true;
        const question = trialQuestionFor(activeStage);
        const textarea = this.root.querySelector<HTMLTextAreaElement>(
          "textarea[data-trial-summary]"
        );
        const summary = textarea?.value ?? "";
        const calculationInput = this.root.querySelector<HTMLInputElement>(
          "input[data-trial-calculation]"
        );
        this.trialCalculationAnswer = calculationInput?.value ?? "";
        if (question.calculation) {
          this.trialCalculationCorrect =
            Number(this.trialCalculationAnswer) ===
            question.calculation.answer;
          if (this.trialCalculationCorrect) {
            this.save.masteryPoints += 1;
          }
        }
        if (!submitTrialSummary(this.save, activeStage.id, summary)) {
          this.audio.risk();
          return true;
        }
        const keywordMap: Record<string, string[]> = {
          mba_cashflow: ["现金贡献", "现金流", "验证"],
          mba_supplychain: ["交付", "替代", "双源"],
          mba_people: ["成果", "陪跑", "梯队"],
          domain_marketing: ["转化", "验证", "渠道"],
          domain_finance: ["成本", "口径", "税务"],
          domain_legal: ["风险", "边界", "协议"],
          domain_customer: ["补救", "计划", "客户"],
          domain_employee: ["成长", "底线", "激励"],
          domain_delivery: ["风险", "关键结果", "资源"]
        };
        this.trialSummaryKeywordCorrect =
          scoreOpenText(
            summary,
            keywordMap[activeStage.id] ?? [],
            40
          ) >= 60;
        if (this.trialSummaryKeywordCorrect) {
          this.save.masteryPoints += 1;
        }
        const firstCorrect = question.followUp
          ? this.trialFollowUpAnswer === question.answer
          : true;
        const finalCorrect =
          this.lastTrialAnswer ===
          (question.followUp ? question.followUp.answer : question.answer);
        const correct = firstCorrect && finalCorrect;
        const abilityId =
          activeStage.source.kind === "training"
            ? activeStage.source.abilityId
            : activeStage.gates[0].abilityId;
        if (activeStage.allies && activeStage.correctAlly) {
          this.trialAllyCorrect =
            this.trialAllyChoice === activeStage.correctAlly;
          if (this.trialAllyCorrect) this.save.masteryPoints += 1;
        }
        if (activeStage.suspects && activeStage.correctSuspect) {
          this.trialSuspectCorrect =
            this.trialSuspectChoice === activeStage.correctSuspect;
          if (this.trialSuspectCorrect) this.save.masteryPoints += 1;
        }
        if (activeStage.intelChoices && activeStage.correctIntel) {
          this.trialIntelCorrect =
            this.trialIntelChoice === activeStage.correctIntel;
          if (this.trialIntelCorrect) this.save.masteryPoints += 1;
        }
        if (
          activeStage.betrayalChoices &&
          activeStage.correctBetrayal
        ) {
          this.trialBetrayalCorrect =
            this.trialBetrayalChoice === activeStage.correctBetrayal;
          if (this.trialBetrayalCorrect) this.save.masteryPoints += 1;
        }
        this.trialAnswerResult = applyTrialAnswer(
          this.save,
          activeStage.id,
          abilityId,
          correct,
          trialCostFor(this.save, activeStage),
          trialRewardExpFor(this.save, activeStage),
          activeStage.rewardItem,
          activeStage.resourceCost ?? 0,
          this.save.trialItems.includes("重启铃") ? 3 : 6,
          this.save.trialItems.includes("风险边界书") ? 10 : 20,
          activeStage.dimension
        );
        if (correct) {
          this.audio.trainingMastery();
        } else {
          this.audio.risk();
        }
        this.renderTrialBattle();
        return true;
      }
      case "trial-option": {
        const activeStage = TRIAL_STAGES.find((item) => item.id === this.activeTrialId);
        if (!activeStage) return true;
        const question = trialQuestionFor(activeStage);
        const selected = Number(actionTarget.dataset.option);
        if (question.followUp && !this.trialFollowUpAnswered) {
          this.trialFollowUpAnswer = selected;
          this.trialFollowUpAnswered = true;
          this.renderTrialBattle();
          return true;
        }
        if (
          activeStage.source.kind === "custom" &&
          !this.trialSummaryPending
        ) {
          this.lastTrialAnswer = selected;
          this.trialSummaryPending = true;
          this.renderTrialBattle();
          return true;
        }
        const firstCorrect = question.followUp
          ? this.trialFollowUpAnswer === question.answer
          : true;
        const finalCorrect =
          selected ===
          (question.followUp ? question.followUp.answer : question.answer);
        const correct = firstCorrect && finalCorrect;
        const abilityId =
          activeStage.source.kind === "training"
            ? activeStage.source.abilityId
            : activeStage.gates[0].abilityId;
        this.lastTrialAnswer = selected;
        if (activeStage.allies && activeStage.correctAlly) {
          if (this.save.trialItems.includes("同盟令")) {
            this.trialAllyChoice = activeStage.correctAlly;
          }
          this.trialAllyCorrect =
            this.trialAllyChoice === activeStage.correctAlly;
          if (this.trialAllyCorrect) {
            this.save.masteryPoints += 1;
          }
        }
        if (
          activeStage.suspects &&
          activeStage.correctSuspect
        ) {
          this.trialSuspectCorrect =
            this.trialSuspectChoice === activeStage.correctSuspect;
          if (this.trialSuspectCorrect) {
            this.save.masteryPoints += 1;
          }
        }
        if (
          activeStage.intelChoices &&
          activeStage.correctIntel
        ) {
          this.trialIntelCorrect =
            this.trialIntelChoice === activeStage.correctIntel;
          if (this.trialIntelCorrect) {
            this.save.masteryPoints += 1;
          }
        }
        if (
          activeStage.betrayalChoices &&
          activeStage.correctBetrayal
        ) {
          this.trialBetrayalCorrect =
            this.trialBetrayalChoice === activeStage.correctBetrayal;
          if (this.trialBetrayalCorrect) {
            this.save.masteryPoints += 1;
          }
        }
        this.trialAnswerResult = applyTrialAnswer(
          this.save,
          activeStage.id,
          abilityId,
          correct,
          trialCostFor(this.save, activeStage),
          trialRewardExpFor(this.save, activeStage),
          activeStage.rewardItem,
          activeStage.resourceCost ?? 0,
          this.save.trialItems.includes("重启铃") ? 3 : 6,
          this.save.trialItems.includes("风险边界书") ? 10 : 20,
          activeStage.dimension
        );
        if (correct) {
          this.audio.trainingMastery();
        } else {
          this.audio.risk();
        }
        this.renderTrialBattle();
        return true;
      }
      case "trial-next":
        this.audio.ui();
        this.activeTrialId = undefined;
        this.trialAnswerResult = undefined;
        this.lastTrialAnswer = undefined;
        this.trialObserveRevealed = false;
        this.trialAllyChoice = undefined;
        this.trialAllyCorrect = undefined;
        this.trialSuspectChoice = undefined;
        this.trialSuspectCorrect = undefined;
        this.trialIntelChoice = undefined;
        this.trialIntelCorrect = undefined;
        this.trialBetrayalChoice = undefined;
        this.trialBetrayalCorrect = undefined;
        this.trialFactionTrust = 50;
        this.trialFactionSuspicion = 50;
        this.trialFollowUpAnswer = undefined;
        this.trialFollowUpAnswered = false;
        this.trialSummaryPending = false;
        this.trialSummaryKeywordCorrect = undefined;
        this.trialCalculationAnswer = undefined;
        this.trialCalculationCorrect = undefined;
        this.show("trial");
        return true;
      case "practice-task": {
        const taskId = actionTarget.dataset.task ?? "";
        const task = PRACTICE_TASKS.find((item) => item.id === taskId);
        if (task && !this.save.completedPracticeTasks.includes(task.id)) {
          this.activePracticeTaskId = task.id;
          this.audio.trainingCorrect();
          this.renderTrial();
        }
        return true;
      }
      case "practice-submit": {
        const task = PRACTICE_TASKS.find(
          (item) => item.id === this.activePracticeTaskId
        );
        const textarea = this.root.querySelector<HTMLTextAreaElement>(
          "textarea[data-practice-result]"
        );
        const text = textarea?.value.trim() ?? "";
        if (!task) {
          return true;
        }
        const practiceScore = scoreOpenText(text, task.keywords, 20);
        const matchedKeywords = task.keywords.filter((keyword) =>
          text.includes(keyword)
        );
        const missingKeywords = task.keywords.filter(
          (keyword) => !text.includes(keyword)
        );
        if (
          practiceScore >= 60 &&
          completePracticeTask(
            this.save,
            task.id,
            task.rewardAbility,
            task.rewardEnergy,
            task.rewardExp
          )
        ) {
          this.activePracticeTaskId = undefined;
          this.audio.trainingMastery();
          this.renderTrial();
          this.showToast(
            this.language === "en"
              ? `Practice scored ${practiceScore}/100 · Hit keywords: ${matchedKeywords.join(", ") || "-"} · Rewards: +${task.rewardEnergy} energy, +${task.rewardExp} mastery`
              : `修炼得分 ${practiceScore}/100 · 命中关键词：${matchedKeywords.join("、") || "无"} · 奖励：+${task.rewardEnergy} 精力、+${task.rewardExp} 修炼点`
          );
        } else {
          this.audio.risk();
          this.showToast(
            this.language === "en"
              ? `Score ${practiceScore}/100 · Missing: ${missingKeywords.join(", ") || "none"} · Add concrete output that covers: ${missingKeywords.join(", ") || "the keywords"}`
              : `得分 ${practiceScore}/100 · 命中：${matchedKeywords.join("、") || "无"} · 缺少：${missingKeywords.join("、") || "无"} · 请补充具体产出（含以上关键词）`
          );
        }
        return true;
      }
      case "trial-rest":
        if (applyDailyTrialRecovery(this.save)) {
          this.audio.trainingCorrect();
          this.renderTrial();
        }
        return true;
      case "trial-buy-energy":
        if (buyTrialEnergy(this.save)) {
          this.audio.trainingCorrect();
          this.renderTrial();
        }
        return true;
      case "trial-buy-energy-influence":
        if (buyTrialEnergyWithInfluence(this.save)) {
          this.audio.trainingCorrect();
          this.renderTrial();
        }
        return true;
      case "trial-invest-accelerator":
        if (investTrialAccelerator(this.save)) {
          this.audio.trainingCorrect();
          this.renderTrial();
        }
        return true;
      case "trial-hire-ally":
        if (hireTrialAlly(this.save)) {
          this.audio.trainingCorrect();
          this.renderTrial();
        }
        return true;
      default:
        return false;
    }
  }

  private handleSettingsClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
      case "toggle-sound":
        this.muted = !this.muted;
        localStorage.setItem("adaptive-ascent-muted", this.muted ? "1" : "0");
        this.audio.setMuted(this.muted);
        this.showToast(
          this.language === "en"
            ? this.muted
              ? "Sound muted."
              : "Sound on."
            : this.muted
              ? "声音已关闭。"
              : "声音已开启。"
        );
        this.render();
        return true;
      case "preview-sfx":
        this.audio.ensure();
        this.audio.expert();
        return true;
      case "toggle-music":
        this.musicMuted = !this.musicMuted;
        localStorage.setItem("adaptive-ascent-music", this.musicMuted ? "1" : "0");
        this.audio.setMusicMuted(this.musicMuted);
        this.showToast(
          this.language === "en"
            ? this.musicMuted
              ? "Music muted."
              : "Music on."
            : this.musicMuted
              ? "音乐已关闭。"
              : "音乐已开启。"
        );
        this.render();
        return true;
      case "settings-font-size":
        this.fontScale = Number(actionTarget.dataset.size) || 1;
        localStorage.setItem(
          "adaptive-ascent-font-scale",
          String(this.fontScale)
        );
        document.documentElement.style.fontSize =
          `${this.fontScale * 100}%`;
        this.render();
        return true;
      case "toggle-language":
        this.language = this.language === "zh" ? "en" : "zh";
        localStorage.setItem("adaptive-ascent-lang", this.language);
        document.documentElement.lang = this.language;
        this.audio.ui();
        this.showToast(
          this.language === "en"
            ? "Language switched to English."
            : "已切换为中文。"
        );
        this.render();
        return true;
      case "reset-profile":
        if (
          window.confirm(
            this.language === "en"
              ? "Clear the current profile and all progress?"
              : "确定要清空当前档案和所有进度吗？"
          )
        ) {
          deleteRoleSlot(this.save.profile.role);
          this.save = resetSave(this.save.profile.role);
          trackEvent("profile_reset");
          this.pendingRole = this.save.profile.role;
          this.show("profile");
        }
        return true;
      default:
        return false;
    }
  }

  private handleCloudClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
      case "copy-save-link":
        this.copySaveLink(actionTarget);
        this.showToast(
          this.language === "en"
            ? "Save link copied."
            : "存档链接已复制。"
        );
        return true;
      case "import-save": {
        const input =
          this.root.querySelector<HTMLInputElement>("input[data-import-save]");
        input?.click();
        return true;
      }
      case "dismiss-backup-hint":
        localStorage.setItem(
          `${SAVE_BACKUP_HINT_KEY}-${APP_VERSION}`,
          "1"
        );
        this.audio.ui();
        this.showToast(
          this.language === "en"
            ? "Backup reminder dismissed for this version."
            : "本次版本的备份提醒已关闭。"
        );
        this.renderMenu();
        return true;
      case "rotate-events":
        if (rotateRandomEventPool(this.save)) {
          trackEvent("random_events_rotated");
          this.audio.expert();
          this.renderMap();
        }
        return true;
      case "toggle-map-detail":
        this.mapDetailOpen = !this.mapDetailOpen;
        this.audio.ui();
        this.renderMap();
        return true;
      case "cloud-sync":
        void this.cloudSync();
        return true;
      case "cloud-load":
        void this.cloudLoad();
        return true;
      case "cloud-leaderboard":
        void this.cloudLeaderboard();
        return true;
      case "cloud-login-token": {
        const input = this.root.querySelector<HTMLInputElement>("input[data-login-token]");
        const token = input?.value.trim() ?? "";
        if (!token) {
          this.cloudStatus =
            this.language === "en" ? "Paste an account token first." : "请先粘贴账号 Token";
          this.renderReport();
          return true;
        }
        this.cloudToken = token;
        localStorage.setItem("adaptive-ascent-cloud-token", token);
        void this.loginWithToken();
        return true;
      }
      case "cloud-register":
        void this.cloudSync();
        return true;
      case "cloud-login-recovery": {
        const input = this.root.querySelector<HTMLInputElement>("input[data-recovery-code]");
        const code = input?.value.trim() ?? "";
        if (!code) {
          this.cloudStatus =
            this.language === "en"
              ? "Paste a recovery code first."
              : "请先粘贴恢复码";
          this.renderReport();
          return true;
        }
        void this.loginWithRecovery(code);
        return true;
      }
      case "cloud-login-password": {
        const username =
          this.root.querySelector<HTMLInputElement>("input[data-account-username]")
            ?.value.trim() ?? "";
        const password =
          this.root.querySelector<HTMLInputElement>("input[data-account-password]")
            ?.value ?? "";
        if (!username || !password) {
          this.cloudStatus =
            this.language === "en"
              ? "Enter username and password."
              : "请输入用户名和密码";
          this.renderReport();
          return true;
        }
        void this.loginWithPassword(username, password);
        return true;
      }
      case "cloud-logout":
        if (this.cloudToken && this.roomClient) {
          this.roomClient.logout(this.cloudToken);
        }
        this.cloudToken = "";
        this.cloudRecoveryCode = "";
        this.cloudAccountName = undefined;
        localStorage.removeItem("adaptive-ascent-cloud-token");
        localStorage.removeItem("adaptive-ascent-recovery-code");
        this.cloudStatus =
          this.language === "en" ? "Logged out locally" : "已退出本地账号";
        this.renderReport();
        return true;
      case "cloud-use-remote":
        if (this.cloudRemoteSave) {
          try {
            this.save = importSaveJson(JSON.stringify(this.cloudRemoteSave));
            this.cloudConflict = false;
            this.cloudStatus =
              this.language === "en" ? "Cloud save applied" : "已使用云端存档";
            this.audio.expert();
            this.show("report");
          } catch {
            this.cloudStatus =
              this.language === "en" ? "Cloud save could not be parsed" : "云端存档无法解析";
            this.cloudConflict = false;
            this.renderReport();
          }
        }
        return true;
      case "cloud-force-local":
        if (this.roomClient && this.cloudToken) {
          this.cloudConflict = false;
          this.roomClient.cloudSave(this.cloudToken, this.save);
          this.cloudStatus =
            this.language === "en" ? "Uploading local save" : "正在上传本地存档";
          this.renderReport();
        }
        return true;
      case "cloud-match":
        void this.cloudMatch();
        return true;
      case "cloud-reconnect":
        void this.cloudReconnect();
        return true;
      default:
        return false;
    }
  }

  private handleExportClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
      case "export-save":
        this.exportSave();
        this.showToast(
          this.language === "en"
            ? "Save exported."
            : "存档已导出。"
        );
        return true;
      case "export-report":
        this.exportReport();
        return true;
      case "export-analytics":
        this.exportAnalytics();
        return true;
      case "export-return-package":
        this.exportReturnPackage();
        return true;
      case "generate-feedback": {
        const rating =
          this.root.querySelector<HTMLSelectElement>(
            "[data-feedback-rating]"
          )?.value ?? "5";
        const feedback =
          this.root.querySelector<HTMLTextAreaElement>(
            "[data-feedback-text]"
          )?.value.trim() ?? "";
        const summary = profileSummary(this.save);
        const text =
          `升维 · Ascend · v${APP_VERSION}\n` +
          `角色：${this.save.profile.role}\n` +
          `评分：${rating}/5\n` +
          `综合能力：${summary.total} · 通关章节：${summary.chapterCount}/9\n` +
          `反馈：${feedback || "-"}`;
        void navigator.clipboard?.writeText(text);
        this.showToast(
          this.language === "en"
            ? "Feedback copied. Paste it into the coach's collection form."
            : "反馈已复制，可粘贴给教练或回传表单。"
        );
        this.audio.ui();
        return true;
      }
      case "export-report-card": {
        const canvas = this.root.querySelector<HTMLCanvasElement>(
          "#report-card-canvas"
        );
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const summary = profileSummary(this.save);
            const decision = decisionProfile(this.save);
            const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            bg.addColorStop(0, "#0a1013");
            bg.addColorStop(1, "#17262e");
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#f2c14e";
            ctx.font = "700 30px 'Microsoft YaHei', sans-serif";
            ctx.fillText("升维 · Ascend", 48, 70);
            ctx.fillStyle = "#e7eef2";
            ctx.font = "700 40px 'Microsoft YaHei', sans-serif";
            ctx.fillText(
              `${this.save.profile.name} · ${rankName(this.language, summary.rank)}`,
              48,
              150
            );
            ctx.fillStyle = "#9fb3c8";
            ctx.font = "22px 'Microsoft YaHei', sans-serif";
            ctx.fillText(
              `${this.language === "en" ? "Total Ability" : "综合能力值"} ${summary.total} · ${this.language === "en" ? "Chapters" : "章节"} ${summary.chapterCount}/9`,
              48,
              220
            );
            ctx.fillText(
              `${this.language === "en" ? "Adaptive" : "自适应"} ${decision.counts.expert} · ${this.language === "en" ? "Technical" : "技术性"} ${decision.counts.partial} · ${this.language === "en" ? "Authority" : "权威/回避"} ${decision.counts.risk}`,
              48,
              280
            );
            ctx.fillText(
              `${this.language === "en" ? "Best Duel" : "最佳对局"} ${this.save.bestScore ?? 0} · ${this.language === "en" ? "Mastery" : "修炼"} ${this.save.masteryPoints}`,
              48,
              330
            );
            ctx.fillStyle = "#f2c14e";
            ctx.fillText(
              this.language === "en"
                ? "Ascend · adaptive leadership scenario game"
                : "升维 · 自适应领导力情境游戏",
              48,
              440
            );
            const url = canvas.toDataURL("image/png");
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${this.language === "en" ? "Ascend-report" : "升维报告卡片"}.png`;
            anchor.click();
          }
        }
        this.audio.ui();
        return true;
      }
      default:
        return false;
    }
  }

  private handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (form.dataset.form === "profile") {
      this.createProfileFromForm();
    }
  }

  private handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement & HTMLInputElement;
    if (target.dataset.customImport && target instanceof HTMLInputElement) {
      const file = target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const imported = importCustomScenarios(String(reader.result ?? ""));
        if (imported.length === 0) {
          this.showToast(
            this.language === "en"
              ? "Import failed: no valid scenarios found."
              : "导入失败：未找到有效情境。"
          );
          return;
        }
        this.customScenarios = [...this.customScenarios, ...imported];
        saveCustomScenarios(this.customScenarios);
        this.audio.expert();
        this.renderCustomScenarios();
      };
      reader.readAsText(file);
      target.value = "";
      return;
    }
    if (this.view === "leadershipGames" && target.dataset.alloc) {
      this.leadershipGames?.handleAllocationChange();
      return;
    }
    if (target.dataset.select === "rounds") {
      this.duelRounds = Number(target.value) || 3;
    }
    if (target.dataset.select === "music-volume") {
      this.musicVolume = Number(target.value) || 0;
      localStorage.setItem(
        "adaptive-ascent-music-volume",
        String(this.musicVolume)
      );
      this.audio.setMusicVolume(this.musicVolume);
      if (this.view === "settings") {
        this.renderSettings();
      }
    }
    if (target.dataset.select === "sfx-volume") {
      this.sfxVolume = Number(target.value) || 0;
      localStorage.setItem(
        "adaptive-ascent-sfx-volume",
        String(this.sfxVolume)
      );
      this.audio.setSfxVolume(this.sfxVolume);
      if (this.view === "settings") {
        this.renderSettings();
      }
    }
    if (target.dataset.importSave && target instanceof HTMLInputElement) {
      void this.importSave(target);
    }
  }

  private createProfileFromForm(): void {
    const input = this.root.querySelector<HTMLInputElement>("input[name='playerName']");
    const name =
      input?.value.trim() || (this.language === "en" ? "You" : "你");
    const profile = createProfile(name, this.pendingRole);
    this.pendingProfile = profile;
    this.assessmentAnswers = [];
    this.assessmentStep = 0;
    this.show("assessment");
  }

  private startWithoutAssessment(): void {
    const input = this.root.querySelector<HTMLInputElement>(
      "input[name='playerName']"
    );
    const name =
      input?.value.trim() || (this.language === "en" ? "You" : "你");
    const profile = createProfile(name, this.pendingRole);
    activateProfile(this.save, profile);
    this.audio.startAmbient();
    this.audio.setMusicMuted(this.musicMuted);
    this.audio.setMusicVolume(this.musicVolume);
    this.selectedChapter = 1;
    this.show("map");
  }

  private finishProfile(applyAssessment: boolean): void {
    if (!this.pendingProfile) {
      this.show("profile");
      return;
    }
    if (applyAssessment) {
      let score = 0;
      ASSESSMENT_QUESTIONS.forEach((question, index) => {
        const answer = this.assessmentAnswers[index] ?? 0;
        const points = question.options[answer].points;
        this.pendingProfile!.abilities[question.abilityId] += points;
        score += points;
      });
      this.save.assessmentScore = score;
      this.save.achievements.push("assessment_done");
      this.save.achievements = [...new Set(this.save.achievements)];
    }
    activateProfile(this.save, this.pendingProfile);
    trackEvent("profile_created", {
      role: this.save.profile.role,
      assessment: applyAssessment
    });
    this.pendingProfile = undefined;
    this.audio.startAmbient();
    this.audio.setMusicMuted(this.musicMuted);
    this.audio.setMusicVolume(this.musicVolume);
    this.audio.expert();
    this.selectedChapter = 1;
    this.show("assessmentResult");
  }

  private chooseStoryOption(target: HTMLElement): void {
    const optionIndex = Number(target.dataset.option);
    this.resolveStoryOption(optionIndex);
  }

  private exploreNodeAction(target: HTMLElement): void {
    if (!this.storyNodeId) return;
    const kind = target.dataset.kind;
    const node = getNode(this.storyNodeId);
    const seed = this.save.scenarioSeed ?? 1;
    const moments = reconMoments(node.chapterId, this.storyNodeId, seed);
    if (!kind || !moments.some((moment) => moment.kind === kind)) return;
    const found = [...(this.save.explorationFound?.[this.storyNodeId] ?? [])];
    if (found.includes(kind)) return;
    found.push(kind);
    this.save.explorationFound = {
      ...(this.save.explorationFound ?? {}),
      [this.storyNodeId]: found
    };
    let rewardText = "";
    if (
      found.length >= 3 &&
      !(this.save.explorationCompleted ?? []).includes(this.storyNodeId)
    ) {
      const focus = getChapter(node.chapterId).focus[0] ?? "insight";
      this.save.profile.abilities[focus] = Math.min(
        40,
        this.save.profile.abilities[focus] + 1
      );
      this.save.profile.resources.energy = clamp(
        this.save.profile.resources.energy + 2,
        0,
        100
      );
      this.save.masteryPoints += 1;
      this.save.explorationCompleted = [
        ...(this.save.explorationCompleted ?? []),
        this.storyNodeId
      ];
      rewardText =
        this.language === "en"
          ? "Full survey: +1 ability, +2 energy, +1 mastery."
          : "完整勘察：能力+1、精力+2、修炼点+1。";
    }
    this.persistSave();
    this.audio.playBrush();
    if (rewardText) this.showToast(rewardText);
    this.renderStory();
  }

  private answerIntegrityGate(target: HTMLElement): void {
    if (!this.integrityGateNodeId || this.pendingIntegrityOption === undefined) {
      return;
    }
    const cost = target.dataset.cost;
    const ability = target.dataset.ability as AbilityId | undefined;
    const node = getNode(this.integrityGateNodeId);
    const option = node.options[this.pendingIntegrityOption];
    const primary = primaryAbilityForOption(option);
    const correct =
      this.integrityGateMode === "ability"
        ? ability === primary
        : cost === "correct";
    if (correct) {
      this.save.firstPickStreak = 0;
      this.save.recentPickPositions = [];
      this.persistSave();
      const pending = this.pendingIntegrityOption;
      this.integrityGateNodeId = undefined;
      this.pendingIntegrityOption = undefined;
      this.audio.playStamp();
      this.showToast(
        this.language === "en" ? "Verification passed." : "验证通过。"
      );
      this.resolveStoryOption(pending);
    } else {
      this.audio.risk();
      this.showToast(
        this.language === "en"
          ? "That is not the real trade-off of this move."
          : "这不是这一手真正的取舍。"
      );
      this.renderStory();
    }
  }

  private recordPickPosition(position: number): void {
    const positions =
      position > 1
        ? [position]
        : [...(this.save.recentPickPositions ?? []), position].slice(-5);
    this.save.recentPickPositions = positions;
  }

  private mechanicalPatternDetected(): boolean {
    const positions = this.save.recentPickPositions ?? [];
    if (positions.length < 5) return false;
    return positions.every((position) => position <= 1);
  }

  private recentExpertRate(): number {
    const recent = this.save.decisionHistory.slice(-5);
    if (recent.length === 0) return 1;
    return (
      recent.filter((decision) => decision.quality === "expert").length /
      recent.length
    );
  }

  private adaptiveInterferenceText(): string {
    const focus = recommendedTraining(
      this.save.profile.abilities,
      this.save.profile.role
    )[0];
    const abilityName = focus ? abilityDisplay(this.language, focus).name : "沟通";
    return this.language === "en"
      ? `Recent expert rate is low. Before deciding, focus on ${abilityName}.`
      : `近期专家率偏低。决策前，先聚焦「${abilityName}」。`;
  }

  private riskCrisisActive(): boolean {
    const recent = this.save.decisionHistory.slice(-5);
    const riskCount = recent.filter(
      (decision) => decision.quality === "risk"
    ).length;
    return riskCount >= 3 && this.save.profile.resources.trust < 40;
  }

  private randomEventNpcId(nodeId: string): string | undefined {
    const map: Record<string, string> = {
      r2: "npc-finance",
      r6: "npc-young",
      r11: "npc-young",
      r23: "npc-finance",
      r29: "npc-veteran",
      r36: "npc-finance"
    };
    return map[nodeId];
  }

  private recordProduction(): void {
    const today = new Date().toISOString().slice(0, 10);
    if (this.save.lastProductionDate !== today) {
      this.save.lastProductionDate = today;
      this.save.productionCount = 0;
    }
    this.save.productionCount = (this.save.productionCount ?? 0) + 1;
  }

  private productionReady(): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return (
      this.save.lastProductionDate === today &&
      (this.save.productionCount ?? 0) >= 3
    );
  }

  private claimProduction(): void {
    if (!this.productionReady()) {
      this.showToast(
        this.language === "en"
          ? "Complete 3 decisions today to claim production rewards."
          : "今天完成 3 次决策后才能领取产能奖励。"
      );
      return;
    }
    this.save.profile.resources.energy = clamp(
      this.save.profile.resources.energy + 10,
      0,
      100
    );
    this.save.profile.resources.trust = clamp(
      this.save.profile.resources.trust + 5,
      0,
      100
    );
    this.save.profile.resources.influence = clamp(
      this.save.profile.resources.influence + 5,
      0,
      100
    );
    this.save.profile.resources.capital = clamp(
      this.save.profile.resources.capital + 3,
      0,
      100
    );
    this.save.productionCount = 0;
    this.persistSave();
    this.audio.playCoins();
    this.showToast(
      this.language === "en"
        ? "Production claimed: +10 energy, +5 trust, +5 influence, +3 capital."
        : "产能领取完成：精力 +10、信任 +5、影响力 +5、组织资源 +3。"
    );
    this.renderMap();
  }

  private recordDuelPlay(): void {
    const today = new Date().toISOString().slice(0, 10);
    if (this.save.lastDuelBonusDate !== today) {
      this.save.lastDuelBonusDate = today;
      this.save.duelsToday = 0;
    }
    this.save.duelsToday = (this.save.duelsToday ?? 0) + 1;
  }

  private duelBonusReady(): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return (
      this.save.lastDuelBonusDate === today &&
      (this.save.duelsToday ?? 0) >= 3
    );
  }

  private claimDuelBonus(): void {
    if (!this.duelBonusReady()) {
      this.showToast(
        this.language === "en"
          ? "Complete 3 duels today to claim the bonus."
          : "今天完成 3 场对局后才能领取奖励。"
      );
      return;
    }
    this.save.masteryPoints += 10;
    this.save.profile.resources.energy = clamp(
      this.save.profile.resources.energy + 10,
      0,
      100
    );
    this.save.profile.resources.influence = clamp(
      this.save.profile.resources.influence + 5,
      0,
      100
    );
    if (!this.save.achievements.includes("duel_pioneer")) {
      this.save.achievements.push("duel_pioneer");
    }
    this.save.lastDuelBonusDate = new Date().toISOString().slice(0, 10);
    this.save.duelsToday = 0;
    this.persistSave();
    this.audio.expert();
    this.showToast(
      this.language === "en"
        ? "Duel Pioneer title unlocked: +10 mastery, +10 energy, +5 influence."
        : "对练先锋称号解锁：修炼点 +10、精力 +10、影响力 +5。"
    );
    this.renderDuelLobby();
  }

  /** 结算某个选项（手动点击或回合超时自动采用最稳妥选项共用此路径）。 */
  private resolveStoryOption(optionIndex: number): void {
    this.stopRoundTimer();
    this.interferenceText = undefined;
    if (!this.storyNodeId) {
      return;
    }
    if (this.replayMode) {
      const roleNode = getNodeForRole(
        this.save.profile.role,
        this.storyNodeId
      );
      const rawOption = roleNode.options[optionIndex];
      const displayOption =
        storyNodeDisplay(this.language, this.save,roleNode).options[optionIndex];
      const outcome: ChoiceOutcome = {
        option: displayOption,
        optionIndex,
        gainedAbilityIds: (Object.entries(rawOption.effects) as Array<
          [AbilityId, number]
        >)
          .filter(([, value]) => value > 0)
          .map(([id]) => id),
        resourceDeltas: rawOption.resources,
        qualityScore: scoreQuality(rawOption.quality, this.save.profile)
      };
      this.lastOutcome = outcome;
      this.lastOutcomeNodeId = this.storyNodeId;
      this.pendingBranchNodeId = undefined;
      this.pendingChapterTransition = undefined;
      if (this.wrongReviewQueue.length > 0) {
        this.save.reviewCards = recordReviewResult(
          this.save.reviewCards ?? [],
          this.storyNodeId,
          rawOption.quality
        );
        this.persistSave();
      }
      this.renderStory();
      return;
    }
    if (isNodeComplete(this.save, this.storyNodeId)) {
      this.renderStory();
      return;
    }
    const rawNode = getNode(this.storyNodeId);
    if (
      optionGateFor(this.save, rawNode.options[optionIndex], rawNode.chapterId)
        .kind !== "ok"
    ) {
      return;
    }
    const optionOrder = storyOptionOrder(this.save,rawNode);
    const displayIndex = optionOrder.indexOf(optionIndex);
    this.recordPickPosition(displayIndex);
    if (optionIndex === optionOrder[0]) {
      this.save.firstPickStreak = (this.save.firstPickStreak ?? 0) + 1;
    } else {
      this.save.firstPickStreak = 0;
    }
    if ((this.save.firstPickStreak ?? 0) >= 2 || this.mechanicalPatternDetected()) {
      this.integrityGateMode =
        this.recentExpertRate() < 0.25 ? "ability" : "cost";
      this.integrityGateNodeId = this.storyNodeId;
      this.pendingIntegrityOption = optionIndex;
      this.persistSave();
      this.renderStory();
      return;
    }
    if (
      this.riskCrisisActive() &&
      rawNode.options[optionIndex].quality === "risk"
    ) {
      this.audio.risk();
      this.showToast(
        this.language === "en"
          ? "Trust crisis: high-risk moves are blocked until you restore trust."
          : "信任危机：在恢复信任之前，本轮不能选择高风险动作。"
      );
      this.renderStory();
      return;
    }
    this.save.lastStoryNodeId = undefined;
    const beforeIds = ACHIEVEMENTS.filter((achievement) =>
      isAchievementUnlocked(this.save, achievement.id)
    ).map((achievement) => achievement.id);
    const outcome = applyStoryChoice(this.save, this.storyNodeId, optionIndex);
    if (outcome.option.quality !== "expert") {
      this.save.reviewCards = scheduleMissedDecision(
        this.save.reviewCards ?? [],
        this.storyNodeId,
        outcome.option.quality
      );
    }
    const leadNpc = this.randomEventNpcId(this.storyNodeId);
    if (leadNpc && !(this.save.npcLeads ?? []).includes(leadNpc)) {
      this.save.npcLeads = [...(this.save.npcLeads ?? []), leadNpc];
      this.showToast(
        this.language === "en"
          ? "New character lead discovered."
          : "发现新的人物线索。"
      );
    }
    this.recordProduction();
    trackEvent("story_choice", {
      nodeId: this.storyNodeId,
      quality: outcome.option.quality,
      chapterId: getNode(this.storyNodeId).chapterId
    });
    const afterIds = ACHIEVEMENTS.filter((achievement) =>
      isAchievementUnlocked(this.save, achievement.id)
    ).map((achievement) => achievement.id);
    const newAchievementId = afterIds.find((id) => !beforeIds.includes(id));
    this.lastUnlockedAchievement = newAchievementId
      ? ACHIEVEMENTS.find((achievement) => achievement.id === newAchievementId)
          ?.name
      : undefined;
    const roleNode = getNodeForRole(
      this.save.profile.role,
      this.storyNodeId
    );
    outcome.option = storyNodeDisplay(this.language, this.save,roleNode).options[optionIndex];
    this.lastOutcome = outcome;
    this.lastOutcomeNodeId = this.storyNodeId;
    const baseNode = getNode(this.storyNodeId);
    this.pendingChapterTransition =
      baseNode.kind === "main" && isChapterPassed(this.save, baseNode.chapterId)
        ? baseNode.chapterId
        : undefined;
    const highAbility = (
      Object.keys(outcome.option.effects) as AbilityId[]
    ).find((id) => abilityLevel(this.save.profile.abilities[id]) >= 3);
    const isForkNode = this.pendingForkNodeId === baseNode.id;
    if (!isForkNode && outcome.option.quality === "expert" && highAbility) {
      this.hiddenBranchAbilityId = highAbility;
      this.pendingBranchNodeId = `ability-${highAbility}`;
    } else {
      this.hiddenBranchAbilityId = undefined;
      this.pendingBranchNodeId =
        outcome.option.branchTo?.[this.save.profile.role];
    }
    if (outcome.option.quality === "expert") {
      this.audio.expert();
    } else if (outcome.option.quality === "partial") {
      this.audio.partial();
    } else {
      this.audio.risk();
    }
    this.renderStory();
  }

  private startAiDuel(): void {
    const human = buildDuelProfile(this.save.profile, this.save.profile.name, "#41c7c0");
    const history = this.save.decisionHistory;
    const expertCount = history.filter(
      (record) => record.quality === "expert"
    ).length;
    const expertRatio =
      history.length > 0 ? expertCount / history.length : 0.33;
    const strength = Math.max(
      1,
      Math.min(4, Math.round(expertRatio * 4 + this.save.duelWins * 0.15))
    );
    const ai = buildAiProfile(
      aiOpponentRole(this.save),
      strength,
      this.save.profile.abilities,
      aiArchetype(this.save)
    );
    this.audio.ensure();
    this.audio.round();
    this.duelEngine = new DuelEngine(
      human,
      ai,
      this.duelRounds,
      duelSeed(),
      this.save.duelSeenNodeIds ?? []
    );
    this.duelRematchAction = "ai";
    this.duelRecorded = false;
    this.duelPredictionBonusTotal = 0;
    this.show("duel");
  }

  private startChallengeDuel(): void {
    const human = buildDuelProfile(this.save.profile, this.save.profile.name, "#41c7c0");
    const ai = buildAiProfile(
      aiOpponentRole(this.save),
      4,
      this.save.profile.abilities,
      aiArchetype(this.save)
    );
    this.audio.ensure();
    this.audio.round();
    this.duelEngine = new DuelEngine(
      human,
      ai,
      7,
      duelSeed(),
      this.save.duelSeenNodeIds ?? []
    );
    this.duelRematchAction = undefined;
    this.duelRecorded = false;
    this.duelPredictionBonusTotal = 0;
    this.show("duel");
  }

  private startEndlessDuel(): void {
    const human = buildDuelProfile(
      this.save.profile,
      this.save.profile.name,
      "#41c7c0"
    );
    const strength = Math.min(5, Math.max(1, Math.round(this.save.duelWins / 4) + 1));
    const ai = buildAiProfile(
      aiOpponentRole(this.save),
      strength,
      this.save.profile.abilities,
      aiArchetype(this.save)
    );
    this.audio.ensure();
    this.audio.round();
    this.duelEngine = new DuelEngine(
      human,
      ai,
      7,
      duelSeed(),
      this.save.duelSeenNodeIds ?? []
    );
    this.duelRematchAction = undefined;
    this.duelRecorded = false;
    this.duelPredictionBonusTotal = 0;
    this.show("duel");
  }

  private startLocalDuel(): void {
    const playerOne = buildDuelProfile(
      this.save.profile,
      this.language === "en"
        ? `${this.save.profile.name} · Player One`
        : `${this.save.profile.name} · 玩家一`,
      "#41c7c0"
    );
    const playerTwo = buildDuelProfile(
      this.save.profile,
      this.language === "en" ? "Player Two" : "玩家二",
      "#e9826c"
    );
    this.audio.ensure();
    this.audio.round();
    this.duelEngine = new DuelEngine(
      playerOne,
      playerTwo,
      this.duelRounds,
      duelSeed(),
      this.save.duelSeenNodeIds ?? []
    );
    this.duelRematchAction = "local";
    this.hotSeatTurn = 0;
    this.localPassed = false;
    this.duelRecorded = false;
    this.duelPredictionBonusTotal = 0;
    this.show("duel");
  }

  private async createRemote(): Promise<void> {
    this.cleanupRemote();
    const seed = duelSeed();
    this.remoteStatus =
      this.language === "en" ? "Generating invite code..." : "正在生成邀请码，请稍候…";
    this.renderDuelLobby();
    try {
      const { peer, inviteCode } = await ManualRtcPeer.createHost(seed);
      this.remotePeer = peer;
      this.remotePlayerIndex = 0;
      this.remoteInviteCode = inviteCode;
      this.remoteOpponentName =
        this.language === "en" ? "Waiting for opponent" : "等待对手";
      this.remoteOpponentReady = false;
      this.remoteStatus =
        this.language === "en" ? "Invite generated. Waiting for answer." : "邀请码已生成，等待对方应答";
      this.bindRemotePeer(peer);
      this.renderDuelLobby();
    } catch (error) {
      this.remoteStatus = error instanceof Error ? error.message : this.language === "en" ? "Failed to create room" : "创建房间失败";
      this.renderDuelLobby();
    }
  }

  private async joinRemote(): Promise<void> {
    const input = this.root.querySelector<HTMLTextAreaElement>("textarea[data-remote-input]");
    const code = input?.value.trim() ?? "";
    if (!code) {
      this.remoteStatus =
        this.language === "en" ? "Paste the invite code first." : "请先粘贴邀请码";
      this.renderDuelLobby();
      return;
    }
    this.cleanupRemote();
    this.remoteStatus =
      this.language === "en" ? "Parsing invite and generating answer..." : "正在解析邀请码并生成应答，请稍候…";
    this.renderDuelLobby();
    try {
      const { peer, answerCode } = await ManualRtcPeer.join(code);
      this.remotePeer = peer;
      this.remotePlayerIndex = 1;
      this.remoteAnswerCode = answerCode;
      this.remoteOpponentName =
        this.language === "en" ? "Waiting for opponent" : "等待对手";
      this.remoteOpponentReady = false;
      this.remoteStatus =
        this.language === "en" ? "Answer generated. Send it to the creator." : "应答码已生成，请发送给创建方";
      this.bindRemotePeer(peer);
      this.renderDuelLobby();
    } catch (error) {
      this.remoteStatus = error instanceof Error ? error.message : this.language === "en" ? "Failed to join room" : "加入房间失败";
      this.renderDuelLobby();
    }
  }

  private async finishRemote(): Promise<void> {
    if (!this.remotePeer || this.remotePlayerIndex !== 0) {
      this.remoteStatus =
        this.language === "en" ? "Create a room first." : "请先创建房间";
      this.renderDuelLobby();
      return;
    }
    const input = this.root.querySelector<HTMLTextAreaElement>("textarea[data-answer-input]");
    const code = input?.value.trim() ?? "";
    try {
      await this.remotePeer.acceptAnswer(code);
      this.remoteStatus =
        this.language === "en" ? "Connection submitted. Waiting for the peer channel." : "连接信息已提交，等待点对点通道建立";
      this.renderDuelLobby();
    } catch (error) {
      this.remoteStatus = error instanceof Error ? error.message : this.language === "en" ? "Connection failed" : "连接失败";
      this.renderDuelLobby();
    }
  }

  private bindRemotePeer(peer: ManualRtcPeer): void {
    peer.onOpen = () => {
      this.remoteStatus =
        this.language === "en" ? "Channel established" : "通道已建立";
      this.audio.remoteConnected();
      peer.send({
        kind: "hello",
        name: this.save.profile.name,
        role: this.save.profile.role,
        roundCount: this.duelRounds,
        abilities: { ...this.save.profile.abilities },
        resources: { ...this.save.profile.resources }
      });
      this.maybeStartRemoteDuel();
    };
    peer.onStatus = (status) => {
      if (status === "failed" || status === "disconnected" || status === "closed") {
        this.saveDuelSnapshot();
        this.remoteStatus =
          this.language === "en"
            ? "Connection lost. A resume snapshot was saved; return to the lobby to continue against AI."
            : "连接已断开，已保存续战快照；返回大厅可转为 AI 续战。";
        this.audio.risk();
      } else {
        this.remoteStatus = status;
      }
      if (this.view === "duelLobby" || this.view === "duel") {
        this.render();
      }
    };
    peer.onMessage = (message) => this.handleRemoteMessage(message);
  }

  private handleRemoteMessage(message: RtcMessage): void {
    if (message.kind === "hello") {
      this.remoteOpponentName = message.name;
      this.remoteOpponentReady = true;
      this.duelRounds = Math.max(1, Number(message.roundCount) || 3);
      this.remoteOpponentAbilities = message.abilities;
      this.remoteOpponentResources = message.resources;
      this.maybeStartRemoteDuel();
      return;
    }
    if (message.kind === "picked") {
      this.remoteOpponentPicked = true;
      this.maybeRevealRemotePrediction();
      return;
    }
    if (message.kind === "reveal" && this.duelEngine) {
      const opponentIndex = this.remotePlayerIndex === 0 ? 1 : 0;
      this.duelEngine.pick(opponentIndex, message.optionIndex);
      this.remoteOpponentPicked = false;
      const predictedStyle = this.duelPrediction;
      const bonus = predictedStyle
        ? this.duelEngine.predictOpponentStyle(
            this.remotePlayerIndex,
            predictedStyle
          )
        : 0;
      this.duelPredictionCorrect = bonus > 0;
      this.duelPredictionBonusTotal += bonus;
      this.duelPrediction = undefined;
      this.duelPredictionPhase = false;
      this.duelEngine.resolvePendingRound();
      this.showDuelRoundResult();
    }
  }

  private maybeStartRemoteDuel(): void {
    if (!this.remotePeer || !this.remoteOpponentReady || !this.remotePeer.pc.connectionState) {
      return;
    }
    if (this.view !== "duelLobby" && this.view !== "duel") {
      return;
    }
    const opponent = {
      name: this.remoteOpponentName,
      role: "highPotential" as RoleId,
      abilities: { ...this.remoteOpponentAbilities },
      resources: { ...this.remoteOpponentResources },
      color: this.remotePlayerIndex === 0 ? "#e9826c" : "#41c7c0",
      isHuman: true
    };
    const me = buildDuelProfile(this.save.profile, this.save.profile.name, this.remotePlayerIndex === 0 ? "#41c7c0" : "#e9826c");
    this.duelEngine =
      this.remotePlayerIndex === 0
        ? new DuelEngine(me, opponent, this.duelRounds, this.remotePeer.seed)
        : new DuelEngine(opponent, me, this.duelRounds, this.remotePeer.seed);
    this.duelRecorded = false;
    this.show("duel");
  }

  private maybeRevealDuelRound(): void {
    const engine = this.duelEngine;
    if (!engine || this.duelRevealing) return;
    if (engine.picks[0] !== null && engine.picks[1] !== null) {
      if (
        (this.duelMode === "ai" || this.duelMode === "local") &&
        this.duelPrediction === undefined
      ) {
        this.duelPredictionPhase = true;
        this.renderDuel();
        return;
      }
      this.duelRevealing = true;
      this.renderDuel();
      this.duelRevealTimer = window.setTimeout(() => {
        this.duelRevealing = false;
        this.duelRevealTimer = undefined;
        engine.resolvePendingRound();
        this.saveDuelSnapshot();
        this.showDuelRoundResult();
      }, 900);
    }
  }

  private maybeRevealRemotePrediction(): void {
    const engine = this.duelEngine;
    if (
      this.duelMode === "remote" &&
      engine &&
      engine.picks[this.remotePlayerIndex] !== null &&
      this.remoteOpponentPicked &&
      this.duelPrediction === undefined
    ) {
      this.duelPredictionPhase = true;
      this.renderDuel();
    }
  }

  private showDuelRoundResult(): void {
    const engine = this.duelEngine;
    const round = engine?.roundResults.at(-1);
    if (!round) {
      this.renderDuel();
      return;
    }
    this.duelRoundResult = round;
    this.duelPrediction = undefined;
    this.duelPredictionPhase = false;
    this.duelPredictionCorrect = undefined;
    this.renderDuel();
    window.clearTimeout(this.duelRoundResultTimer);
    this.duelRoundResultTimer = window.setTimeout(() => {
      this.duelRoundResult = undefined;
      this.duelRoundResultTimer = undefined;
      this.renderDuel();
    }, 2200);
  }

  private saveDuelSnapshot(): void {
    if (!this.duelEngine) {
      return;
    }
    try {
      localStorage.setItem(
        DUEL_SNAPSHOT_KEY,
        JSON.stringify({
          mode: this.duelMode,
          hotSeatTurn: this.hotSeatTurn,
          localPassed: this.localPassed,
          engine: this.duelEngine.toSnapshot()
        })
      );
    } catch {
      // 必须静默失败，不影响对局
    }
  }

  private clearDuelSnapshot(): void {
    try {
      localStorage.removeItem(DUEL_SNAPSHOT_KEY);
    } catch {
      // ignore
    }
  }

  private hasDuelSnapshot(): boolean {
    try {
      return Boolean(localStorage.getItem(DUEL_SNAPSHOT_KEY));
    } catch {
      return false;
    }
  }

  private resumeDuel(): void {
    try {
      const raw = localStorage.getItem(DUEL_SNAPSHOT_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as {
        mode: DuelMode;
        hotSeatTurn: 0 | 1;
        localPassed: boolean;
        engine: DuelSnapshot;
      };
      this.duelMode = parsed.mode === "remote" ? "ai" : parsed.mode;
      this.hotSeatTurn = parsed.hotSeatTurn ?? 0;
      this.localPassed = Boolean(parsed.localPassed);
      this.duelEngine = DuelEngine.fromSnapshot(parsed.engine);
      this.duelRecorded = false;
      this.audio.ensure();
      this.audio.round();
      this.show("duel");
    } catch {
      this.clearDuelSnapshot();
    }
  }

  private startDuelRoundTimer(): void {
    this.stopDuelRoundTimer();
    if (this.duelMode === "remote" || !this.duelEngine) {
      return;
    }
    const engine = this.duelEngine;
    const scenarioText = [
      engine.node.context,
      engine.node.stake,
      ...engine.node.options.map((option) => `${option.label} ${option.summary}`)
    ].join(" ");
    const difficultyMs = decisionWindowMs(
      roundDurationMsForDifficulty(this.save.difficulty),
      scenarioText
    );
    const roundTimeout = difficultyMs > 0 ? difficultyMs : DUEL_ROUND_TIMEOUT_MS;
    this.duelRoundDeadline = Date.now() + roundTimeout;
    this.duelWarningPlayed.clear();
    this.updateDuelTimerDisplay();
    this.duelRoundTickId = window.setInterval(() => {
      this.updateDuelTimerDisplay();
    }, 250);
    this.duelRoundTimerId = window.setTimeout(() => {
      this.duelRoundTimerId = undefined;
      const engine = this.duelEngine;
      if (!engine || engine.finished) {
        return;
      }
      if (engine.picks[0] === null) {
        engine.forceTimeoutPick(0);
      }
      if (engine.picks[1] === null) {
        engine.forceTimeoutPick(1);
      }
      this.duelTimedOutThisRound = true;
      this.duelRoundDeadline = 0;
      this.updateDuelTimerDisplay();
      this.duelPrediction = undefined;
      this.duelPredictionPhase = false;
      engine.resolvePendingRound();
      this.saveDuelSnapshot();
      this.renderDuel();
    }, roundTimeout);
  }

  /** 1v1 回合倒计时：剩余 15/10/5 秒时变色提醒并播放提示音，归零后显示超时。 */
  private updateDuelTimerDisplay(): void {
    const el = this.root.querySelector<HTMLElement>("#duel-timer");
    if (!el) return;
    if (this.duelRoundDeadline <= 0) {
      el.style.display = "none";
      return;
    }
    const seconds = Math.ceil(
      Math.max(0, this.duelRoundDeadline - Date.now()) / 1000
    );
    el.style.display = "";
    el.classList.toggle("urgent", seconds <= 10);
    el.classList.toggle("warning", seconds <= 15);
    if (
      (seconds === 15 || seconds === 10 || seconds === 5) &&
      !this.duelWarningPlayed.has(seconds)
    ) {
      this.duelWarningPlayed.add(seconds);
      this.audio.round();
    }
    el.textContent =
      this.language === "en"
        ? `Time ${seconds}s`
        : `剩余 ${seconds}s`;
  }

  private duelPick(target: HTMLElement): void {
    const engine = this.duelEngine;
    if (!engine) {
      return;
    }
    this.duelTimedOutThisRound = false;
    this.audio.duelPick();
    const optionIndex = Number(target.dataset.option);
    if (this.duelMode === "ai") {
      engine.pick(0, optionIndex);
      this.saveDuelSnapshot();
      window.setTimeout(() => {
        engine.aiPick(1);
        this.saveDuelSnapshot();
        this.maybeRevealDuelRound();
      }, 650);
      this.renderDuel();
      return;
    }
    if (this.duelMode === "local") {
      engine.pick(this.hotSeatTurn, optionIndex);
      this.saveDuelSnapshot();
      if (this.hotSeatTurn === 0 && engine.picks[0] !== null) {
        this.localPassed = false;
        this.hotSeatTurn = 1;
        this.renderDuel();
        return;
      }
      if (engine.picks[0] === null && engine.picks[1] === null) {
        this.hotSeatTurn = 0;
        this.localPassed = false;
      }
      this.maybeRevealDuelRound();
      this.renderDuel();
      return;
    }
    if (this.duelMode === "remote") {
      engine.pick(this.remotePlayerIndex, optionIndex);
      this.remoteOwnOption = optionIndex;
      this.remoteOpponentPicked = false;
      if (this.usingCloudMatch && this.roomClient) {
        this.roomClient.pick(optionIndex);
      } else if (this.remotePeer) {
        this.remotePeer.send({ kind: "picked" });
      }
      this.maybeRevealRemotePrediction();
      this.renderDuel();
    }
  }

  private playerPanel(index: 0 | 1): string {
    const engine = this.duelEngine;
    if (!engine) {
      return "";
    }
    const player = engine.players[index];
    const picked = engine.picks[index] !== null;
    return `
      <div class="player-panel">
        <span class="player-color" style="--dot:${player.color}"></span>
        <strong>${escapeHtml(player.name)}</strong>
        ${player.isHuman ? "" : `<small class="ai-style-tag">${aiArchetypeLabel(this.language,player.archetype ?? "builder")}</small>`}
        <small>${picked ? (this.language === "en" ? "Choice made" : "已作出选择") : (this.language === "en" ? "Thinking" : "正在思考")}</small>
      </div>
    `;
  }

  private duelPickEnabled(optionIndex: number): boolean {
    if (!this.duelEngine) return false;
    if (this.duelMode === "ai") {
      return this.duelEngine.picks[0] === null;
    }
    if (this.duelMode === "local") {
      if (this.hotSeatTurn === 0) return this.duelEngine.picks[0] === null;
      return this.localPassed && this.duelEngine.picks[1] === null;
    }
    if (this.duelMode === "remote") {
      return this.duelEngine.picks[this.remotePlayerIndex] === null;
    }
    return false;
  }

  private optionState(optionIndex: number): string {
    const engine = this.duelEngine;
    if (!engine) return "";
    if (engine.picks[0] === optionIndex) return "picked p1";
    if (engine.picks[1] === optionIndex) return "picked p2";
    return "";
  }

  private cleanupRemote(): void {
    if (this.duelRevealTimer !== undefined) {
      window.clearTimeout(this.duelRevealTimer);
      this.duelRevealTimer = undefined;
    }
    this.duelRevealing = false;
    this.remotePeer?.close();
    this.remotePeer = undefined;
    this.remoteInviteCode = "";
    this.remoteAnswerCode = "";
    this.remoteOpponentReady = false;
    this.remoteStatus =
      this.language === "en" ? "Not connected" : "尚未建立连接";
    this.duelEngine = undefined;
    this.usingCloudMatch = false;
  }

  private exportSave(): void {
    downloadText(
      `${this.language === "en" ? "Ascend" : "升维"}-${this.save.profile.name}-${this.language === "en" ? "save" : "存档"}.json`,
      JSON.stringify(this.save, null, 2),
      "application/json"
    );
    this.audio.ui();
  }

  private exportAnalytics(): void {
    downloadText(
      `${this.language === "en" ? "Ascend-events" : "升维事件日志"}.json`,
      JSON.stringify(readAnalyticsEvents(), null, 2),
      "application/json"
    );
    this.audio.ui();
  }

  private exportReturnPackage(): void {
    const payload = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      build: ONLINE_ENABLED ? "online" : "static",
      save: this.save,
      events: readAnalyticsEvents()
    };
    downloadText(
      `${this.language === "en" ? "Ascend-return-package" : "升维回传包"}.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
    this.audio.ui();
  }

  private exportReport(): void {
    const en = this.language === "en";
    downloadText(
      `${en ? "Ascend" : "升维"}-${this.save.profile.name}-${en ? "report" : "报告"}.md`,
      buildReportMarkdown(this.save, this.language),
      "text/markdown;charset=utf-8"
    );
    this.audio.ui();
  }

  private copySaveLink(target: HTMLElement): void {
    void navigator.clipboard?.writeText(encodeSaveLink(this.save));
    const original = target.textContent;
    target.textContent =
      this.language === "en" ? "Link copied" : "链接已复制";
    window.setTimeout(() => {
      target.textContent = original;
    }, 1400);
    this.audio.ui();
  }

  private async ensureCloudClient(): Promise<RoomClient> {
    if (!ONLINE_ENABLED) {
      throw new Error(
        this.language === "en"
          ? "Online mode is disabled in this build."
          : "当前为静态版，未启用云端功能。"
      );
    }
    if (this.roomClient) {
      return this.roomClient;
    }
    const client = new RoomClient();
    this.roomClient = client;
    client.onMessage = (message) => this.handleCloudMessage(message);
    client.onClose = () => {
      this.cloudStatus = "云端连接已断开";
    };
    await client.connect();
    return client;
  }

  private handleCloudMessage(message: RoomServerMessage): void {
    switch (message.type) {
      case "registered": {
        this.cloudToken = message.token;
        this.cloudAccountName = (message.account as { name?: string })?.name;
        const recovery = (message.account as { recoveryCode?: string })
          ?.recoveryCode;
        if (recovery) {
          this.cloudRecoveryCode = recovery;
          localStorage.setItem(
            "adaptive-ascent-recovery-code",
            recovery
          );
        }
        localStorage.setItem("adaptive-ascent-cloud-token", message.token);
        this.cloudStatus = "云端账号已创建";
        this.audio.remoteConnected();
        this.roomClient?.cloudSave(message.token, this.save);
        break;
      }
      case "recovery_reissued": {
        this.cloudRecoveryCode = message.code;
        localStorage.setItem(
          "adaptive-ascent-recovery-code",
          message.code
        );
        this.cloudStatus =
          this.language === "en"
            ? `Recovery code renewed: ${message.code}`
            : `恢复码已更换：${message.code}`;
        break;
      }
      case "logged_in": {
        this.cloudAccountName = (message.account as { name?: string })?.name;
        this.cloudStatus = "云端账号已连接";
        this.audio.remoteConnected();
        if (this.pendingCloudAction === "load") {
          const remote = message.account as { save?: SaveState };
          if (remote.save) {
            try {
              this.save = importSaveJson(JSON.stringify(remote.save));
              this.show("report");
            } catch {
              this.cloudStatus = "云端存档无法解析";
            }
          } else {
            this.cloudStatus = "云端暂无存档";
          }
        } else if (this.pendingCloudAction === "sync") {
          const remote = message.account as { save?: SaveState };
          const resolution = resolveCloudConflict(this.save, remote.save ?? null);
          if (resolution === "remote-newer" || resolution === "conflict") {
            this.cloudStatus =
              resolution === "conflict"
                ? "检测到内容冲突（同进度但内容不同），已停止覆盖；请选择保留云端或本地"
                : "云端进度较新，已停止覆盖；请使用云端载入";
            this.cloudConflict = true;
            this.cloudRemoteSave = remote.save;
          } else {
            this.cloudConflict = false;
            this.cloudRemoteSave = undefined;
            this.roomClient?.cloudSave(this.cloudToken, this.save);
          }
        }
        break;
      }
      case "save_ok":
        this.cloudStatus = "云端同步成功";
        this.audio.expert();
        break;
      case "leaderboard":
        this.cloudEntries = message.entries;
        this.cloudStatus = "排行榜已刷新";
        this.audio.ui();
        break;
      case "queued":
        this.cloudStatus = "已进入云端匹配队列，等待对手…";
        break;
      case "match_started":
        this.startCloudDuel(
          message.roomId,
          message.playerIndex as 0 | 1,
          message.opponentName || "云端对手"
        );
        break;
      case "picked":
        this.remoteOpponentPicked = true;
        this.maybeRevealRemotePrediction();
        break;
      case "reveal":
        if (this.duelEngine) {
          const opponentIndex = this.remotePlayerIndex === 0 ? 1 : 0;
          this.duelEngine.pick(opponentIndex, message.optionIndex);
          this.remoteOpponentPicked = false;
          const predictedStyle = this.duelPrediction;
          const bonus = predictedStyle
            ? this.duelEngine.predictOpponentStyle(
                this.remotePlayerIndex,
                predictedStyle
              )
            : 0;
          this.duelPredictionCorrect = bonus > 0;
          this.duelPredictionBonusTotal += bonus;
      this.duelPrediction = undefined;
      this.duelPredictionPhase = false;
      this.duelEngine.resolvePendingRound();
      this.showDuelRoundResult();
    }
    break;
      case "opponent_left":
        this.cloudStatus = "对手已离开";
        if (this.view === "duelLobby") this.renderDuelLobby();
        break;
      case "error":
        this.cloudStatus = message.message;
        this.audio.risk();
        break;
      default:
        break;
    }
    if (this.view === "report") {
      this.renderReport();
    }
  }

  private async loginWithToken(): Promise<void> {
    this.pendingCloudAction = "sync";
    this.cloudStatus = "正在登录已有账号…";
    this.renderReport();
    try {
      const client = await this.ensureCloudClient();
      client.login(this.cloudToken);
    } catch (error) {
      this.cloudStatus = error instanceof Error ? error.message : "云端登录失败";
      this.renderReport();
    }
  }

  private async loginWithRecovery(code: string): Promise<void> {
    this.pendingCloudAction = "sync";
    this.cloudStatus = "正在用恢复码登录…";
    this.renderReport();
    try {
      const client = await this.ensureCloudClient();
      client.loginRecovery(code);
    } catch (error) {
      this.cloudStatus = error instanceof Error ? error.message : "恢复码登录失败";
      this.renderReport();
    }
  }

  private async loginWithPassword(
    username: string,
    password: string
  ): Promise<void> {
    this.pendingCloudAction = "sync";
    this.cloudStatus = "正在用用户名登录…";
    this.renderReport();
    try {
      const client = await this.ensureCloudClient();
      client.loginPassword(username, password);
    } catch (error) {
      this.cloudStatus =
        error instanceof Error ? error.message : "用户名登录失败";
      this.renderReport();
    }
  }

  private async cloudSync(): Promise<void> {
    this.pendingCloudAction = "sync";
    this.cloudStatus = "正在连接云端…";
    this.renderReport();
    try {
      const client = await this.ensureCloudClient();
      if (this.cloudToken) {
        client.login(this.cloudToken);
      } else {
        if (!this.cloudRecoveryCode) {
          this.cloudRecoveryCode = Math.random()
            .toString(36)
            .slice(2, 10)
            .toUpperCase();
          localStorage.setItem(
            "adaptive-ascent-recovery-code",
            this.cloudRecoveryCode
          );
        }
        client.register(
          this.save.profile.name,
          this.save.profile.role,
          this.save,
          this.cloudRecoveryCode,
          this.root.querySelector<HTMLInputElement>("input[data-account-username]")?.value.trim() ||
            undefined,
          this.root.querySelector<HTMLInputElement>("input[data-account-password]")?.value ||
            undefined
        );
      }
    } catch (error) {
      this.cloudStatus = error instanceof Error ? error.message : "云端连接失败";
      if (this.cloudStatus === "无法连接房间服务器") {
        this.cloudStatus = this.t("accountOffline");
      }
      this.renderReport();
    }
  }

  private async cloudLoad(): Promise<void> {
    if (!this.cloudToken) {
      this.cloudStatus = "请先云端同步生成账号";
      this.renderReport();
      return;
    }
    this.pendingCloudAction = "load";
    this.cloudStatus = "正在从云端载入…";
    this.renderReport();
    try {
      const client = await this.ensureCloudClient();
      client.login(this.cloudToken);
    } catch (error) {
      this.cloudStatus = error instanceof Error ? error.message : "云端载入失败";
      this.renderReport();
    }
  }

  private async cloudLeaderboard(): Promise<void> {
    this.cloudStatus = "正在刷新排行榜…";
    this.renderReport();
    try {
      const client = await this.ensureCloudClient();
      client.leaderboard();
    } catch (error) {
      this.cloudStatus = error instanceof Error ? error.message : "排行榜刷新失败";
      this.renderReport();
    }
  }

  private async cloudMatch(): Promise<void> {
    this.pendingCloudAction = "match";
    this.cloudStatus = "正在连接云端匹配…";
    this.renderDuelLobby();
    try {
      const client = await this.ensureCloudClient();
      client.match(
        this.save.profile.name,
        this.save.profile.role,
        this.save,
        this.duelRounds
      );
    } catch (error) {
      this.cloudStatus = error instanceof Error ? error.message : "云端匹配失败";
      this.renderDuelLobby();
    }
  }

  private async cloudReconnect(): Promise<void> {
    if (!this.lastRoomId) return;
    this.cloudStatus =
      this.language === "en"
        ? "Reconnecting to the last room..."
        : "正在重连上次房间…";
    this.renderDuelLobby();
    try {
      const client = await this.ensureCloudClient();
      client.reconnect(
        this.lastRoomId,
        this.save.profile.name,
        this.save.profile.role,
        this.save
      );
    } catch (error) {
      this.cloudStatus = error instanceof Error ? error.message : "重连失败";
      this.renderDuelLobby();
    }
  }

  private startCloudDuel(
    roomId: string,
    playerIndex: 0 | 1,
    opponentName: string
  ): void {
    const me = buildDuelProfile(
      this.save.profile,
      this.save.profile.name,
      playerIndex === 0 ? "#41c7c0" : "#e9826c"
    );
    const opponent = {
      name: opponentName,
      role: "highPotential" as RoleId,
      abilities: {
        insight: 2,
        deploy: 2,
        mobilize: 2,
        strategy: 2,
        authority: 2,
        stability: 2,
        recovery: 2,
        execution: 2,
        structure: 2,
        communication: 2
      } as Record<AbilityId, number>,
      resources: { energy: 75, trust: 55, influence: 45, capital: 40 },
      color: playerIndex === 0 ? "#e9826c" : "#41c7c0",
      isHuman: true
    };
    const seed =
      [...roomId].reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7) %
      100000;
    this.duelEngine =
      playerIndex === 0
        ? new DuelEngine(me, opponent, this.duelRounds, seed)
        : new DuelEngine(opponent, me, this.duelRounds, seed);
    this.remotePlayerIndex = playerIndex;
    this.remoteOpponentName = opponentName;
    this.usingCloudMatch = true;
    this.lastRoomId = roomId;
    localStorage.setItem("adaptive-ascent-room-id", roomId);
    this.duelMode = "remote";
    this.duelRecorded = false;
    this.audio.remoteConnected();
    this.show("duel");
  }

  private async importSave(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      this.save = importSaveJson(text);
      this.audio.ensure();
      this.audio.expert();
      this.show("menu");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "导入存档失败");
    } finally {
      input.value = "";
    }
  }

  private copyText(target: HTMLElement, selector: string): void {
    const textarea = target
      .closest<HTMLElement>(".remote-lobby, .remote-create, .remote-join")
      ?.querySelector<HTMLTextAreaElement>(`textarea[${selector}]`);
    const value = textarea?.value;
    if (!value) return;
    void navigator.clipboard?.writeText(value);
    const original = target.textContent;
    target.textContent = this.language === "en" ? "Copied" : "已复制";
    window.setTimeout(() => {
      target.textContent = original;
    }, 1200);
  }

  private questArcMarkup(arc: (typeof SIDE_QUEST_ARCS)[number]): string {
    const doneCount = arc.nodes.filter((id) =>
      isNodeComplete(this.save, id)
    ).length;
    const done = doneCount === arc.nodes.length;
    const view = sideArcDisplay(this.language, arc);
    return `
      <div class="quest-arc ${done ? "complete" : ""}">
        <div class="quest-arc-head">
          <div>
            <strong>${view.title}</strong>
            <span>${doneCount} / ${arc.nodes.length} ${this.language === "en" ? "nodes" : "节点"}</span>
          </div>
          <small>${done ? (this.language === "en" ? "Complete" : "已完成") : (this.language === "en" ? "In Progress" : "进行中")}</small>
        </div>
        <p class="quest-summary">${escapeHtml(view.summary)}</p>
        <p class="quest-intro">${escapeHtml(view.intro)}</p>
        <div class="quest-nodes">
          ${arc.nodes
            .map((nodeId, index) => {
              const node = getNode(nodeId);
              const nodeView = storyNodeDisplay(this.language, this.save,node);
              const unlocked = this.canEnterSideNode(nodeId);
              const nodeDone = isNodeComplete(this.save, nodeId);
              return `
                <button class="quest-node ${nodeDone ? "done" : ""} ${unlocked ? "" : "locked"}" data-action="open-node" data-node="${nodeId}" ${unlocked && !nodeDone ? "" : "disabled aria-disabled=\"true\""}>
                  <span>${index + 1}</span>
                  <div>
                    <strong>${escapeHtml(nodeView.title)}</strong>
                    <em>${nodeDone ? (this.language === "en" ? "Complete" : "已完成") : unlocked ? (this.language === "en" ? "Available" : "可接取") : escapeHtml(this.sideNodeLockReason(nodeId))}</em>
                  </div>
                </button>
              `;
            })
            .join("")}
        </div>
        ${done ? `<p class="quest-conclusion">${escapeHtml(view.conclusion)}</p>` : ""}
      </div>
    `;
  }

  private canEnterSideNode(nodeId: string): boolean {
    const arc = SIDE_QUEST_ARCS.find((item) => item.nodes.includes(nodeId));
    if (!arc) {
      return false;
    }
    if (
      arc.id === "trust_rebuild" &&
      this.save.profile.resources.trust < 30
    ) {
      return false;
    }
    if (
      arc.id === "resilience" &&
      this.save.profile.resources.influence < 30
    ) {
      return false;
    }
    const index = arc.nodes.indexOf(nodeId);
    if (index > 0) {
      return isNodeComplete(this.save, arc.nodes[index - 1]);
    }
    const node = getNode(nodeId);
    return getChapter(node.chapterId).nodeIds.some((mainId) =>
      isNodeComplete(this.save, mainId)
    );
  }

  private sideNodeLockReason(nodeId: string): string {
    const arc = SIDE_QUEST_ARCS.find((item) => item.nodes.includes(nodeId));
    if (!arc) {
      return this.language === "en" ? "Locked" : "未解锁";
    }
    if (
      arc.id === "trust_rebuild" &&
      this.save.profile.resources.trust < 30
    ) {
      return this.language === "en" ? "Needs Trust 30+" : "需要信任 30+";
    }
    if (
      arc.id === "resilience" &&
      this.save.profile.resources.influence < 30
    ) {
      return this.language === "en"
        ? "Needs Influence 30+"
        : "需要影响力 30+";
    }
    const index = arc.nodes.indexOf(nodeId);
    if (index > 0 && !isNodeComplete(this.save, arc.nodes[index - 1])) {
      const previousNode = getNode(arc.nodes[index - 1]);
      const previousView = storyNodeDisplay(this.language, this.save,previousNode);
      return this.language === "en"
        ? `Complete "${previousView.title}" first`
        : `需先完成「${previousView.title}」`;
    }
    const node = getNode(nodeId);
    const mainIds = getChapter(node.chapterId).nodeIds;
    const doneMain = mainIds.filter((id) =>
      isNodeComplete(this.save, id)
    ).length;
    const chapterReady = mainIds.some((mainId) =>
      isNodeComplete(this.save, mainId)
    );
    return chapterReady
      ? (this.language === "en" ? "Available" : "可接取")
      : this.language === "en"
        ? `Finish this chapter's main scenarios first (${doneMain}/${mainIds.length})`
        : `需先完成本章主线情境（${doneMain}/${mainIds.length}）`;
  }

  private nodeRow(node: StoryNode): string {
    const done = isNodeComplete(this.save, node.id);
    const chapter = getChapter(node.chapterId);
    const view = storyNodeDisplay(this.language, this.save,node);
    const isExtraMain = node.kind === "main" && /n[3-9]$/.test(node.id);
    const kindLabel =
      node.kind === "side"
        ? this.t("storyKindSide")
        : node.kind === "branch"
          ? this.t("storyKindBranch")
          : node.kind === "random"
            ? this.t("storyKindRandom")
            : isExtraMain
              ? this.language === "en"
                ? "Extended Main Scenario"
                : "主线扩展情境"
              : this.t("storyKindMain");
    const statusLabel = done
      ? this.language === "en"
        ? "Complete"
        : "已完成"
      : this.language === "en"
        ? "Available"
        : "可进入";
    return `
      <button class="node-row ${done ? "done" : ""}" data-action="open-node" data-node="${node.id}" ${done ? "disabled aria-disabled=\"true\"" : ""}>
        <span class="node-state">${done ? "✓" : node.kind === "side" ? "支" : chapter.code}</span>
        <span>
          <strong>${escapeHtml(view.title)}</strong>
          <em>${kindLabel}</em>
        </span>
        <small>${statusLabel}</small>
      </button>
    `;
  }

  private abilityCard(id: AbilityId): string {
    const exp = this.save.profile.abilities[id];
    const level = abilityLevel(exp);
    const ability = ABILITIES[id];
    const detail = abilityDetailDisplay(this.language, id);
    // ABILITY_ORDER 是固定 10 项顺序，对应 ability-01.jpg ~ ability-10.jpg
    const abilityIndex = (ABILITY_ORDER.indexOf(id) + 1).toString().padStart(2, "0");
    return `
      <div class="ability-card has-ability-art">
        <img class="ability-illust" src="${artAsset(`ability-${abilityIndex}`)}" alt="${abilityDisplay(this.language, id).name}" loading="lazy" onerror="this.style.display='none'" />
        <div class="ability-head">
          <span style="--dot:${ability.color}"></span>
          <div>
            <h3>${abilityDisplay(this.language, id).name}</h3>
            <small>${ability.code}</small>
          </div>
          <strong>Lv.${level}</strong>
        </div>
        <p>${abilityDisplay(this.language, id).tagline}</p>
        <div class="ability-bar"><i style="width:${Math.min(100, (level / 6) * 100)}%"></i></div>
        <div class="subskill-list">${detail.subSkills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}</div>
        <p class="training-path">${escapeHtml(detail.trainingPath)}</p>
        ${
          EXPANDED_TRAINING[id]?.formula?.expression
            ? `<p class="ability-formula">${escapeHtml(EXPANDED_TRAINING[id].formula.expression)}</p>`
            : ""
        }
        ${
          EXPANDED_TRAINING[id]?.workedExamples?.[0]?.scenario
            ? `<p class="ability-example">${escapeHtml(EXPANDED_TRAINING[id].workedExamples[0].scenario)}</p>`
            : ""
        }
        ${
          (() => {
            const next = TRIAL_STAGES.find((stage) =>
              stage.gates.some(
                (gate) =>
                  gate.abilityId === id && gate.level > abilityLevel(exp)
              )
            );
            if (!next) return "";
            const nextLevel = next.gates.find((gate) => gate.abilityId === id)
              ?.level;
            return `<p class="ability-next-gate">${this.language === "en" ? "Next gate" : "下一门"}：Lv.${nextLevel} · ${escapeHtml(next.name)}</p>`;
          })()
        }
        <div class="ability-sources">${detail.sources.slice(0, 2).map((source) => `<span>${escapeHtml(source)}</span>`).join("")}</div>
        <button class="ability-practice-button" data-action="open-training" data-ability="${id}">${this.language === "en" ? "Enter Practice" : "进入修炼"}</button>
      </div>
    `;
  }

  private adaptiveHint(node: StoryNode): string {
    return scenarioCoachHint({
      node,
      save: this.save,
      language: this.language,
      seed: this.save.scenarioSeed
    });
  }

  private reviewBoardMarkup(): string {
    const entries = reviewBoard(this.save.reviewCards ?? [], (nodeId) =>
      this.reviewAbilityFor(nodeId)
    );
    if (entries.length === 0) return "";
    const en = this.language === "en";
    return `
      <section class="review-board">
        <h3>${en ? "Review by Ability" : "按能力复习看板"}</h3>
        <div class="review-board-grid">
          ${entries
            .map((entry) => {
              const display = abilityDisplay(this.language, entry.ability as AbilityId);
              const pct = entry.total
                ? Math.round((entry.mastered / entry.total) * 100)
                : 0;
              return `
                <article class="review-board-card" style="--bar:${pct}%">
                  <strong>${escapeHtml(display.name)}</strong>
                  <span>${escapeHtml(display.tagline)}</span>
                  <div class="review-board-bar"><i></i></div>
                  <p>${en ? `${entry.due} due · ${entry.mastered} mastered / ${entry.total}` : `到期 ${entry.due} · 已掌握 ${entry.mastered} / ${entry.total}`}</p>
                  <div class="review-board-actions">
                    <button data-action="open-due-review" data-ability="${escapeAttr(entry.ability)}" ${entry.due ? "" : "disabled aria-disabled=\"true\""}>${en ? "Review" : "回练"}</button>
                    <button data-action="open-dual-review" data-ability="${escapeAttr(entry.ability)}" ${entry.due ? "" : "disabled aria-disabled=\"true\""}>${en ? "Best/Worst" : "双轴"}</button>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  private reviewAbilityFor(nodeId: string): string {
    try {
      return getChapter(getNode(nodeId).chapterId).focus[0];
    } catch {
      return "insight";
    }
  }

  private dueReviewBanner(): string {
    const due = dueReviewCards(this.save.reviewCards ?? []);
    if (due.length === 0) return "";
    const en = this.language === "en";
    return `
      <section class="due-review-banner">
        <strong>${en ? `Spaced review: ${due.length} due now` : `间隔复习：${due.length} 题已到期`}</strong>
        <button data-action="open-due-review">${en ? "Review Now" : "立即回练"}</button>
      </section>
    `;
  }

  private dueReviewMarkup(): string {
    const cards = this.save.reviewCards ?? [];
    const due = dueReviewCards(cards);
    const stats = reviewStats(cards);
    if (stats.total === 0) return "";
    const en = this.language === "en";
    return `
      <section class="due-review-panel">
        <h3>${en ? "Spaced Review" : "间隔复习"}</h3>
        <p>${en
          ? `${stats.due} due now · ${stats.total} tracked · ${stats.mastered} mastered. Missed expert moves return after 1 / 6 / 15+ day intervals.`
          : `当前到期 ${stats.due} 题 · 累计 ${stats.total} 题 · 已掌握 ${stats.mastered} 题。未选专家项会按 1 / 6 / 15+ 天间隔安排回练。`}</p>
        ${
          due.length
            ? `<div class="due-review-actions"><button class="wrong-review-cta" data-action="open-due-review">${en ? `Start Due Review (${due.length})` : `开始到期回练（${due.length}）`}</button><button class="wrong-review-cta" data-action="open-dual-review">${en ? `Best/Worst Review (${due.length})` : `双轴回练（${due.length}）`}</button></div>`
            : `<p class="muted">${en ? "No cards due right now." : "当前没有到期的复习卡。"}</p>`
        }
      </section>
    `;
  }

  private wrongAnswerMarkup(): string {
    const wrong = this.save.decisionHistory
      .filter((record) => record.quality !== "expert")
      .slice(-8)
      .reverse();
    return wrong
      .map((record) => {
        let node: StoryNode | null = null;
        try {
          node = getNode(record.nodeId);
        } catch {
          node = null;
        }
        if (!node) {
          return "";
        }
        const expert = node.options.find(
          (option) => option.quality === "expert"
        );
        const chosen = node.options[record.optionIndex];
        const focus = getChapter(node.chapterId).focus[0];
        return `
          <div class="wrong-answer-card">
            <strong>${escapeHtml(node.title)}</strong>
            <p><b>${qualityLabel(this.language, record.quality)}</b> · ${escapeHtml(chosen?.label ?? "")}</p>
            ${
              expert
                ? `<p class="expert-ref">${this.language === "en" ? "Expert baseline" : "专家基准"}：${escapeHtml(expert.label)} · ${escapeHtml(expert.theory)}</p>`
                : ""
            }
            <button data-action="open-training" data-ability="${focus}">${this.language === "en" ? "Train This Ability" : "训练该能力"}</button>
          </div>
        `;
      })
      .join("");
  }

  private coachPromptMarkup(
    decision: ReturnType<typeof decisionProfile>
  ): string {
    const en = this.language === "en";
    const prompts: string[] = [];
    if (decision.counts.risk >= 2) {
      prompts.push(
        en
          ? "You leaned on authority or avoidance several times. Is your real team holding back honest information?"
          : "你多次使用权威/回避动作。现实团队是否正在因此少说真话？"
      );
    }
    if (decision.counts.partial >= 2) {
      prompts.push(
        en
          ? "Several moves were technical fixes. Which problems are you still carrying alone?"
          : "多次选择偏向技术性解决。哪些问题其实还压在你一个人身上？"
      );
    }
    if (decision.counts.expert >= 3) {
      prompts.push(
        en
          ? "You diagnosed before acting repeatedly. Can the next diagnosis become a verifiable meeting agenda?"
          : "你连续先诊断再行动。下一次能否把诊断变成可验收的会议议题？"
      );
    }
    if (this.save.profile.resources.trust < 45) {
      prompts.push(
        en
          ? "Trust is low in your run. When did you last choose efficiency over a relationship?"
          : "本局信任值偏低。你上一次为了效率牺牲关系是什么时候？"
      );
    }
    if (this.save.profile.resources.energy < 25) {
      prompts.push(
        en
          ? "Energy nearly ran out. What would a sustainable week look like for you?"
          : "精力接近枯竭。对你来说，可持续的一周应该长什么样？"
      );
    }
    if (prompts.length === 0) {
      prompts.push(
        en
          ? "Your decisions are balanced. Which scenario challenged your usual style the most?"
          : "你的决策风格比较均衡。哪个情境最挑战你平时的做法？"
      );
    }
    return prompts
      .slice(0, 3)
      .map((prompt) => `<li>${escapeHtml(prompt)}</li>`)
      .join("");
  }

  private sixPartReviewMarkup(outcome: ChoiceOutcome): string {
    const en = this.language === "en";
    const nodeId = this.lastOutcomeNodeId ?? this.storyNodeId;
    let node: StoryNode | null = null;
    try {
      if (nodeId) {
        node = storyNodeDisplay(this.language, this.save,
          getNodeForRole(this.save.profile.role, nodeId)
        );
      }
    } catch {
      node = null;
    }
    if (!node) return "";
    const intel = NODE_INTEL[node.id] ?? [];
    const expert = node.options.find(
      (option) => option.quality === "expert"
    );
    const quality = outcome.option.quality;
    const lesson =
      quality === "expert"
        ? en
          ? "Replicate this pattern in the next similar situation: diagnose first, act second, and keep a verifiable standard."
          : "把这一判断复制到下一个相似情境：先诊断、再行动，用可验证标准守住结果。"
        : quality === "partial"
          ? en
            ? "You solved part of it. Hand the responsibility and verification node back instead of carrying the team alone."
            : "你解决了一半；下一步把责任和验证节点还回去，而不是继续替团队扛。"
          : en
            ? "Stop the loss first, then review. Confirm key information and trust before using authority or risk again."
            : "先止损再复盘；下一次先确认关键信息和信任，再动用权威或冒险。";
    return `
      <details class="six-part-review">
        <summary>${en ? "Six-Part Review" : "六段式复盘"}</summary>
        <dl>
          <div>
            <dt>${en ? "Situation" : "现场"}</dt>
            <dd>${escapeHtml(node.context)}</dd>
          </div>
          <div>
            <dt>${en ? "Intel" : "情报"}</dt>
            <dd>${intel.length ? `<ul>${intel.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : escapeHtml(node.stake)}</dd>
          </div>
          <div>
            <dt>${en ? "Trade-off" : "取舍"}</dt>
            <dd>${escapeHtml(outcome.option.label)} · ${escapeHtml(outcome.option.summary)}</dd>
          </div>
          <div>
            <dt>${en ? "Outcome" : "结果"}</dt>
            <dd>${escapeHtml(outcome.option.feedback)}</dd>
          </div>
          <div>
            <dt>${en ? "Comparison" : "对比"}</dt>
            <dd>${en ? `Your move: ${qualityLabel(this.language, quality)}` : `你的选择：${qualityLabel(this.language, quality)}`}${expert ? ` · ${en ? "Expert baseline" : "专家基准"}：${escapeHtml(expert.label)}` : ""}</dd>
          </div>
          <div>
            <dt>${en ? "Lesson" : "教训"}</dt>
            <dd>${escapeHtml(lesson)}</dd>
          </div>
        </dl>
      </details>
    `;
  }

  private outcomeMarkup(outcome: ChoiceOutcome): string {
    const option = outcome.option;
    const transitionId = this.pendingChapterTransition;
    const forkId = this.pendingForkNodeId;
    const action = forkId
      ? "finish-fork"
      : transitionId
        ? "continue-transition"
        : this.pendingBranchNodeId
          ? "continue-branch"
          : "continue-story";
    const actionLabel = forkId
      ? this.language === "en"
        ? "Finish Fork"
        : "完成分叉"
      : transitionId
        ? this.language === "en"
          ? "View Chapter Transition"
          : "查看章节过渡"
        : this.pendingBranchNodeId
          ? this.language === "en"
            ? this.pendingBranchNodeId.startsWith("ability-")
              ? "Enter Advanced Review"
              : "Enter Role Branch"
            : this.pendingBranchNodeId.startsWith("ability-")
              ? "进入高阶复盘"
              : "进入角色分岔"
          : this.language === "en"
            ? "Back to Map"
            : "返回地图";
    const reviewActive = this.wrongReviewQueue.length > 0;
    const finalAction = reviewActive ? "next-wrong-review" : action;
    const finalLabel = reviewActive
      ? this.wrongReviewIndex + 1 >= this.wrongReviewQueue.length
        ? this.language === "en"
          ? "Finish Review"
          : "完成回练"
        : this.language === "en"
          ? "Next Missed Move"
          : "下一道错题"
      : actionLabel;
    const streak = this.expertStreak();
    const encouragement =
      option.quality === "expert"
        ? streak >= 2
          ? this.language === "en"
            ? `Expert streak x${streak}. You are finding your decision rhythm.`
            : `连续专家判断 x${streak}，你已经找到自己的判断节奏！`
          : this.language === "en"
            ? "Precise read. Keep this rhythm."
            : "这一手判断精准，保持这个节奏。"
        : option.quality === "partial"
          ? this.language === "en"
            ? "Good direction; make the next step steadier."
            : "方向不错，下一步可以更稳。"
          : this.language === "en"
            ? "You acted under pressure; that courage is part of leadership."
            : "你敢于在高压中行动，这份胆识也是领导力的一部分。";
    return `
      <section class="outcome-panel" role="status" aria-live="polite">
        <span class="quality ${option.quality}">${qualityLabel(this.language, option.quality)}</span>
        <div class="positive-feedback">${encouragement}</div>
        <div class="story-advancement ${option.quality}">${this.storyAdvancementText(outcome)}</div>
        ${
          this.lastUnlockedAchievement
            ? `<div class="achievement-unlock">${this.language === "en" ? "Achievement Unlocked: " : "新成就解锁："}${escapeHtml(this.lastUnlockedAchievement)}</div>`
            : ""
        }
        <h2>${escapeHtml(option.label)}</h2>
        <p>${escapeHtml(option.feedback)}</p>
        <blockquote>${escapeHtml(option.theory)}</blockquote>
        ${this.sixPartReviewMarkup(outcome)}
        <div class="leadership-lens ${option.quality}">
          <strong>${this.language === "en" ? "Adaptive Leadership Lens" : "自适应领导力视角"}</strong>
          <p>${escapeHtml(leadershipLensText(this.language, option.quality))}</p>
        </div>
        <div class="outcome-effects score-pop">
          <span><b>+${outcome.qualityScore}</b> ${this.language === "en" ? "Expert Fit" : "专家契合分"}</span>
          ${outcome.gainedAbilityIds.map((id) => `<span><b>+${option.effects[id] ?? 0}</b> ${abilityDisplay(this.language, id).name}</span>`).join("")}
          ${(Object.keys(outcome.resourceDeltas) as ResourceKey[])
            .filter((key) => outcome.resourceDeltas[key])
            .map(
              (key) => `
                <span class="${(outcome.resourceDeltas[key] ?? 0) < 0 ? "negative" : "positive"}">
                  <b>${formatDelta(outcome.resourceDeltas[key] ?? 0)}</b> ${resourceDisplay(this.language, key)}
                </span>
              `
            )
            .join("")}
        </div>
        ${outcome.resourceStrain ? `<p class="strain-note">${this.t("strainNote")} -${outcome.resourceStrain}</p>` : ""}
        <div class="outcome-resources">
          ${(Object.keys(RESOURCE_NAMES) as ResourceKey[])
            .map((key) => {
              const value = this.save.profile.resources[key];
              return `
                <span class="outcome-resource ${value < 30 ? "low" : ""}">
                  <b>${resourceDisplay(this.language, key)}</b>
                  <i><em style="width:${Math.round(value)}%"></em></i>
                  <small>${Math.round(value)}</small>
                </span>
              `;
            })
            .join("")}
        </div>
        <canvas id="outcome-relations" class="outcome-relations" aria-label="${this.language === "en" ? "Relationship graph after this decision" : "本次决策后的人物关系图"}"></canvas>
        <button class="primary" data-action="${finalAction}">${finalLabel}</button>
      </section>
    `;
  }

  private storyAdvancementText(outcome: ChoiceOutcome): string {
    const en = this.language === "en";
    let kind = "main";
    try {
      if (this.storyNodeId) {
        kind = getNode(this.storyNodeId).kind;
      }
    } catch {
      // keep main
    }
    if (kind === "side") {
      return en
        ? "Side story advances: this relationship moved one step forward."
        : "支线剧情推进：你与这个人的关系向前走了一步。";
    }
    if (kind === "branch" || this.pendingBranchNodeId) {
      return en
        ? "The story is branching: your choice is opening a new route."
        : "剧情分叉：你的选择正在打开一条新路线。";
    }
    if (outcome.option.quality === "expert") {
      return en
        ? "The story advances: key people begin trusting you, and new information opens."
        : "剧情推进：关键人物开始信任你，新的信息向你开放。";
    }
    if (outcome.option.quality === "partial") {
      return en
        ? "The story holds steady, but the real tension is still unresolved."
        : "剧情暂时稳住，但真正的悬念还没有解开。";
    }
    return en
      ? "The story shifts: your strong signal changed the situation, and the cost begins to show."
      : "剧情转向：你用强信号改变了局面，代价也开始显现。";
  }

  private expertStreak(): number {
    let streak = 0;
    for (let i = this.save.decisionHistory.length - 1; i >= 0; i -= 1) {
      if (this.save.decisionHistory[i].quality === "expert") {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }

  private latestDecisionText(): string {
    const last = this.save.decisionHistory[this.save.decisionHistory.length - 1];
    return last
      ? qualityLabel(this.language, last.quality)
      : this.language === "en"
        ? "No decision yet"
        : "尚未决策";
  }

  private guideSteps(): string[] {
    try {
      const raw = localStorage.getItem(GUIDE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private markGuideStep(step: string): void {
    const steps = [...new Set([...this.guideSteps(), step])];
    try {
      localStorage.setItem(GUIDE_KEY, JSON.stringify(steps));
    } catch {
      // ignore
    }
    if (steps.length >= 3 && !localStorage.getItem(GUIDE_REWARD_KEY)) {
      try {
        localStorage.setItem(GUIDE_REWARD_KEY, "1");
      } catch {
        // ignore
      }
      this.save.masteryPoints += 2;
      this.persistSave();
      trackEvent("guide_complete");
      this.audio.expert();
    }
  }

  private nextRankNeed(total: number): number {
    const ranks = [
      { min: 16 },
      { min: 26 },
      { min: 38 },
      { min: 48 }
    ];
    const next = ranks.find((rank) => total < rank.min);
    return next ? next.min - total : 0;
  }
}

