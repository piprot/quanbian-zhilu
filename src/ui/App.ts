import {
  ABILITIES,
  ABILITY_ORDER,
  ROLES,
  abilityLevel
} from "../core/abilities";
import {
  ACHIEVEMENTS,
  isAchievementUnlocked
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
  clamp,
  consumeCorruptSaveNotice,
  createProfile,
  decisionProfile,
  deleteRoleSlot,
  importSaveJson,
  isChapterComplete,
  isChapterPassed,
  isNodeComplete,
  loadSave,
  optionGateFor,
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
  getChapter,
  getNode,
  getNodeForRole
} from "../core/story";
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
import { reconMoments } from "../core/expedition";
import type { LeadershipGamesApp, LeadershipGameId } from "./leadership-games";
import type { TeamAcademyApp } from "./team-academy";
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
import {
  ASSESSMENT_QUESTIONS,
  certificationLevel
} from "../core/assessment";
import {
  dailyChallenges,
  todayKey,
  weekKey,
  weeklyChallenges
} from "../core/challenges";
import { scoreTrainingAnswers } from "../core/training";
import { LEADERSHIP_GAMES } from "../core/leadership-games";
import {
  EXPANDED_TRAINING
} from "../core/trainingExtras";
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
import { uiString, type Language } from "../core/i18n";
import {
  exportAnalyticsPayload,
  readAnalyticsEvents,
  trackEvent
} from "../core/analytics";
import { rankName, abilityDisplay, roleDisplay, qualityLabel } from "./display";
import { buildReportMarkdown, downloadText, encodeSaveLink } from "./export";
import { artAsset, chapterArtStyle } from "./assets";
import { storyNodeDisplay } from "./nodeView";
import { escapeAttr, escapeHtml } from "./escape";
import { abilityView, endingView, reportView } from "./reportView";
import { settingsView } from "./settingsView";
import { achievementsView } from "./achievementsView";
import { profileView } from "./profileView";
import { relationsView } from "./relationsView";
import { trainingView } from "./trainingView";
import { menuSandboxCaption, menuView } from "./menuView";
import {
  customScenarioPlayView,
  customScenariosView,
  dualReviewView
} from "./trainerViews";
import { chapterTransitionView } from "./transitionView";
import { coachView } from "./coachView";
import { mapView } from "./mapView";
import { trialView } from "./trialView";
import { trialBattleView } from "./trialBattleView";
import { assessmentResultView, assessmentView } from "./assessmentView";
import { hiddenBranchView } from "./hiddenBranchView";
import { storyView } from "./storyView";
import {
  duelLobbyMarkup,
  duelMainMarkup,
  duelPredictMarkup,
  duelResultMarkup,
  duelRevealMarkup,
  duelRoundResultMarkup,
  type DuelMode,
  type DuelQuality
} from "./duelView";
import {
  primaryAbilityForOption,
  storyOptionOrder
} from "./storyMarkup";
import { renderAbilityRadar, renderGroupRadar } from "./charts";
import { renderPowerBoard } from "./art";
import { renderTrainingBoard } from "./trainingArt";
import {
  dueReviewCards,
  dualAxisQuality,
  recordReviewResult,
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
const APP_VERSION = "1.7.38";

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
    trackEvent("session_start", {
      language: this.language,
      lastChapter: this.save.unlockedChapters.at(-1) ?? 1,
      unlockedChapters: this.save.unlockedChapters.length,
      playCount: this.save.playCount
    });
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
    const showBackupHint =
      localStorage.getItem(`${SAVE_BACKUP_HINT_KEY}-${APP_VERSION}`) !== "1";
    this.root.innerHTML = menuView(this.save, this.language, {
      muted: this.muted,
      latestDecision: this.latestDecisionText(),
      dueReviewBanner: this.dueReviewBanner(),
      guideSteps: this.guideSteps(),
      showBackupHint
    });
    const powerBoard = this.root.querySelector<HTMLCanvasElement>("#power-board");
    if (powerBoard) {
      renderPowerSandbox(
        powerBoard,
        this.save,
        this.save.playCount + 7,
        this.language === "en" ? "Power Relationship Sandbox" : "权力关系沙盘",
        menuSandboxCaption(this.save, this.language)
      );
    }
  }

  private renderProfile(): void {
    this.root.innerHTML = profileView(
      this.save,
      this.language,
      this.pendingRole
    );
  }

  private renderAssessment(): void {
    if (!this.pendingProfile) {
      this.show("profile");
      return;
    }
    this.root.innerHTML = assessmentView(this.pendingProfile, this.language, {
      assessmentStep: this.assessmentStep,
      selected: this.assessmentAnswers[this.assessmentStep],
      muted: this.muted
    });
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
    this.root.innerHTML = assessmentResultView(
      this.save,
      this.language,
      this.muted
    );
    const radar =
      this.root.querySelector<HTMLCanvasElement>("#assessment-result-radar");
    if (radar) {
      renderAbilityRadar(radar, this.save.profile.abilities);
    }
  }

  private renderAchievements(): void {
    this.root.innerHTML = achievementsView(
      this.save,
      this.language,
      this.favoriteAchievements
    );
  }

  private renderRelations(): void {
    this.root.innerHTML = relationsView(this.save, this.language);
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
    this.root.innerHTML = mapView(this.save, this.language, {
      selectedChapter: this.selectedChapter,
      mapDetailOpen: this.mapDetailOpen,
      resourceRecoveryNote: this.resourceRecoveryNote,
      showMapGuide:
        this.save.playCount === 0 && !this.guideSteps().includes("map-intro"),
      riskCrisis: this.riskCrisisActive(),
      nextAdvice: this.nextActionAdvice(),
      latestDecision: this.latestDecisionText(),
      productionReady: this.productionReady()
    });
  }

  private renderStory(): void {
    if (!this.storyNodeId) {
      this.show("map");
      return;
    }
    const node = getNodeForRole(this.save.profile.role, this.storyNodeId);
    let scenarioSeed = this.save.scenarioSeed;
    if (scenarioSeed === undefined) {
      scenarioSeed = Math.floor(Math.random() * 1_000_000) + 1;
      this.save.scenarioSeed = scenarioSeed;
    }
    const showingOutcome = this.lastOutcomeNodeId === node.id && this.lastOutcome;
    if (!showingOutcome && !this.replayMode) {
      this.save.lastStoryNodeId = node.id;
      this.persistSave();
    }
    if (node.chapterId !== this.lastEnergyRestoreChapter) {
      this.lastEnergyRestoreChapter = node.chapterId;
      this.energyRestoreUsed = false;
    }
    this.root.innerHTML = storyView(this.save, this.language, {
      storyNodeId: this.storyNodeId,
      replayMode: this.replayMode,
      interferenceText: this.interferenceText,
      storyHintRevealed: this.storyHintRevealed,
      lastTimedOut: this.lastTimedOut,
      energyRestoreUsed: this.energyRestoreUsed,
      integrityGateNodeId: this.integrityGateNodeId,
      lastOutcome: this.lastOutcome,
      lastOutcomeNodeId: this.lastOutcomeNodeId,
      pendingIntegrityOption: this.pendingIntegrityOption,
      integrityGateMode: this.integrityGateMode,
      pendingChapterTransition: this.pendingChapterTransition,
      pendingForkNodeId: this.pendingForkNodeId,
      pendingBranchNodeId: this.pendingBranchNodeId,
      lastUnlockedAchievement: this.lastUnlockedAchievement,
      wrongReviewQueue: this.wrongReviewQueue,
      wrongReviewIndex: this.wrongReviewIndex,
      riskCrisis: this.riskCrisisActive()
    });
    this.applyStoryFolds();
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

  // 移动端信息折叠：情境页默认收起「情报/公式」，点开才显示；桌面端保持展开。
  private applyStoryFolds(): void {
    const mobile = window.matchMedia("(max-width: 980px)").matches;
    this.root
      .querySelectorAll<HTMLDetailsElement>("details.fold")
      .forEach((fold) => {
        fold.open = !mobile;
      });
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

  private async openLeadershipGames(): Promise<void> {
    const { LeadershipGamesApp } = await import("./leadership-games");
    this.leadershipGames = new LeadershipGamesApp(this.language, {
      onBack: () => this.show("map"),
      onReward: (gameId, won, score, stars, achievements, branch) =>
        this.completeLeadershipGame(
          gameId,
          won,
          score,
          stars,
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

  private async openTeamAcademy(): Promise<void> {
    const { TeamAcademyApp } = await import("./team-academy");
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
  }

  private renderLeadershipGames(): void {
    if (!this.leadershipGames) {
      void this.openLeadershipGames();
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
    this.root.innerHTML = dualReviewView(this.save, this.language, {
      nodeId,
      index: this.dualReviewIndex,
      total: this.dualReviewQueue.length,
      bestIndex: this.dualBestIndex,
      worstIndex: this.dualWorstIndex,
      submitted: this.dualSubmitted,
      lastOutcome: this.dualLastOutcome
    });
  }

  private renderCustomScenarios(): void {
    this.root.innerHTML = customScenariosView(this.customScenarios, this.language);
  }

  private renderCustomScenarioPlay(): void {
    const scenario = this.customScenarios.find(
      (item) => item.id === this.customPlayId
    );
    if (!scenario) {
      this.show("customScenarios");
      return;
    }
    this.root.innerHTML = customScenarioPlayView(
      scenario,
      this.customPlayResult,
      this.language
    );
  }

  private completeLeadershipGame(
    gameId: LeadershipGameId,
    won: boolean,
    score: number,
    stars: number,
    achievements: string[],
    branch: string
  ): void {
    if (won) {
      this.save.leadershipGameWins += 1;
      const reward = Math.max(1, stars);
      this.save.masteryPoints += reward;
      const meta = LEADERSHIP_GAMES.find((game) => game.id === gameId);
      if (meta) {
        this.save.profile.abilities[meta.abilityId] = clamp(
          (this.save.profile.abilities[meta.abilityId] ?? 0) + reward,
          0,
          40
        );
      }
      const currentLevel =
        this.save.leadershipBestLevel?.[gameId] ?? 1;
      // 星级门槛：2 星及以上才解锁下一难度，避免「赢一局就通关」的低区分度。
      if (currentLevel < 3 && stars >= 2) {
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
    const starsMap = this.save.leadershipBestStars ?? {};
    starsMap[gameId] = Math.max(starsMap[gameId] ?? 0, stars);
    this.save.leadershipBestStars = starsMap;
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
      stars,
      achievements: achievements.join(","),
      branch
    });
  }

  private renderChapterTransition(): void {
    if (!this.pendingChapterTransition) {
      this.show("map");
      return;
    }
    this.root.innerHTML = chapterTransitionView(
      this.save,
      this.language,
      this.muted,
      this.pendingChapterTransition,
      this.pendingForkNodeId
    );
  }

  private renderAbility(): void {
    this.root.innerHTML = abilityView(this.save, this.language);
    const canvas = this.root.querySelector<HTMLCanvasElement>("#ability-radar");
    if (canvas) {
      renderAbilityRadar(canvas, this.save.profile.abilities);
    }
  }

  private renderReport(): void {
    this.root.innerHTML = reportView(this.save, this.language, {
      muted: this.muted,
      accountName: this.cloudAccountName,
      token: this.cloudToken,
      recoveryCode: this.cloudRecoveryCode,
      status: this.cloudStatus,
      conflict: this.cloudConflict,
      entries: this.cloudEntries
    });
  }

  private wireTrainingLinks(): void {
    const recommended = recommendedTraining(
      this.save.profile.abilities,
      this.save.profile.role,
      this.save.decisionHistory,
      this.save.trainingScores
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

  private renderTraining(): void {
    this.root.innerHTML = trainingView(this.save, this.language, {
      abilityId: this.trainingAbilityId,
      stage: this.trainingStage,
      step: this.trainingStep,
      answers: this.trainingAnswers,
      result: this.trainingResult
    });
    const board = this.root.querySelector<HTMLCanvasElement>("#training-board");
    if (board) {
      const exp = this.save.profile.abilities[this.trainingAbilityId];
      const ability = abilityDisplay(this.language, this.trainingAbilityId);
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
      const view = storyNodeDisplay(this.language, this.save, node);
      const session = this.liveRunner.getSession(this.liveSessionId);
      const picks = session ? [...session.participantPicks.entries()] : [];
      const expertIndex = view.options.findIndex(
        (option) => option.quality === "expert"
      );
      const expert = view.options[expertIndex];
      const participantList = picks
        .map(
          ([name, optionIndex]) =>
            `<li>${escapeHtml(name)} · ${escapeHtml(view.options[optionIndex]?.label ?? "")}</li>`
        )
        .join("");
      const optionButtons = view.options
        .map(
          (option, index) =>
            `<button class="${index === this.livePendingOption ? "active" : ""}" data-action="live-pick" data-option="${index}">${escapeHtml(option.label)}</button>`
        )
        .join("");
      const distributionMarkup =
        this.liveRevealed && this.liveDistribution
          ? `<div class="live-distribution">
              ${view.options
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
          <h3>${escapeHtml(view.title)}</h3>
          <p>${escapeHtml(view.context)}</p>
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
    const personal = this.save.profileCreated
      ? this.coachEngine.generatePersonalReport(this.save)
      : undefined;
    this.root.innerHTML = coachView(
      this.save,
      this.language,
      this.coachReport,
      personal,
      this.coachEngine.participants.length,
      this.coachPlanMarkup(),
      this.liveMarkup()
    );
    const radar = this.root.querySelector<HTMLCanvasElement>("#coach-radar");
    if (radar && this.coachReport) {
      renderGroupRadar(radar, this.coachReport.groupRadar);
    }
  }

  private renderTrial(): void {
    this.root.innerHTML = trialView(this.save, this.language, {
      activePracticeTaskId: this.activePracticeTaskId,
      nextAdvice: this.nextActionAdvice()
    });
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
    this.root.innerHTML = trialBattleView(this.save, this.language, stage, {
      result: this.trialAnswerResult,
      observeRevealed: this.trialObserveRevealed,
      allyChoice: this.trialAllyChoice,
      allyCorrect: this.trialAllyCorrect,
      suspectChoice: this.trialSuspectChoice,
      suspectCorrect: this.trialSuspectCorrect,
      intelChoice: this.trialIntelChoice,
      intelCorrect: this.trialIntelCorrect,
      betrayalChoice: this.trialBetrayalChoice,
      betrayalCorrect: this.trialBetrayalCorrect,
      factionTrust: this.trialFactionTrust,
      factionSuspicion: this.trialFactionSuspicion,
      followUpAnswer: this.trialFollowUpAnswer,
      followUpAnswered: this.trialFollowUpAnswered,
      summaryPending: this.trialSummaryPending,
      summaryKeywordCorrect: this.trialSummaryKeywordCorrect,
      calculationAnswer: this.trialCalculationAnswer,
      calculationCorrect: this.trialCalculationCorrect,
      lastAnswer: this.lastTrialAnswer,
      resultBranch: this.trialResultBranch(),
      suspectImpactMarkup: this.trialSuspectImpactMarkup(stage)
    });
  }


  private renderHiddenBranch(): void {
    const abilityId = this.hiddenBranchAbilityId;
    if (!abilityId || !EXPANDED_TRAINING[abilityId]) {
      this.show("map");
      return;
    }
    this.root.innerHTML = hiddenBranchView(this.save, this.language, {
      abilityId,
      step: this.hiddenRouteStep,
      lastCorrect: this.hiddenRouteLastCorrect
    });
  }


  private renderSettings(): void {
    this.root.innerHTML = settingsView(this.save, this.language, {
      muted: this.muted,
      musicMuted: this.musicMuted,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      version: APP_VERSION
    });
  }

  private renderEnding(): void {
    this.root.innerHTML = endingView(this.save, this.language, this.endingChoice);
  }

  private renderDuelLobby(): void {
    this.root.innerHTML = duelLobbyMarkup(this.language, this.save, {
      duelMode: this.duelMode,
      duelRounds: this.duelRounds,
      duelBonusReady: this.duelBonusReady(),
      hasDuelSnapshot: this.hasDuelSnapshot(),
      remoteInviteCode: this.remoteInviteCode,
      remoteAnswerCode: this.remoteAnswerCode,
      remoteStatus: this.remoteStatus,
      cloudStatus: this.cloudStatus,
      lastRoomId: this.lastRoomId
    });
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
        <main class="duel-waiting" aria-label="${en ? "Waiting for opponent" : "等待对手"}">
          <h1>${this.remoteStatus}</h1>
          <p>${en ? "Waiting for your opponent. Keep this page open." : "等待对手加入。请保持页面打开。"}</p>
        </main>
      `;
      return;
    }

    if (this.duelRoundResult) {
      this.root.innerHTML = duelRoundResultMarkup(
        this.language,
        engine,
        this.duelRoundResult
      );
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
      this.root.innerHTML = duelResultMarkup(
        this.language,
        this.save,
        engine,
        result,
        {
          playerIndex: this.duelMode === "remote" ? this.remotePlayerIndex : 0,
          predictionHistory: this.duelPredictionHistory,
          predictionBonusTotal: this.duelPredictionBonusTotal,
          rematchAction: this.duelRematchAction
        }
      );
      return;
    }

    const node = engine.node;
    const nodeView = storyNodeDisplay(this.language, this.save, node);
    const lastResult = engine.roundResults[engine.currentRound - 1];
    const roundKey = `${engine.currentRound}-${engine.picks[0] ?? ""}-${engine.picks[1] ?? ""}`;
    if (this.duelPredictionPhase) {
      this.root.innerHTML = duelPredictMarkup(
        this.language,
        nodeView,
        this.duelMode
      );
      return;
    }
    if (this.duelRevealing) {
      this.root.innerHTML = duelRevealMarkup(this.language);
      return;
    }
    this.root.innerHTML = duelMainMarkup(
      this.language,
      this.save,
      engine,
      nodeView,
      {
        duelMode: this.duelMode,
        lastResult,
        roundKey,
        duelTimedOutThisRound: this.duelTimedOutThisRound,
        hotSeatTurn: this.hotSeatTurn,
        localPassed: this.localPassed,
        remotePlayerIndex: this.remotePlayerIndex
      }
    );
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
    if (this.handleExportClick(action)) return;
    if (this.handleLiveClick(action, actionTarget)) return;
    if (this.handleCustomScenarioClick(action, actionTarget)) return;
    if (this.handleCoachClick(action, actionTarget)) return;
    if (this.handleEndingClick(action, actionTarget)) return;
    if (this.handleReviewClick(action, actionTarget)) return;
    if (this.handleMapClick(action, actionTarget)) return;
    if (this.handleStoryTransitionClick(action, actionTarget)) return;
    if (this.handleNavClick(action, actionTarget)) return;
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
          ).fill(-1);
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
        ).fill(-1);
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
        ).fill(-1);
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
        const requestedDuelMode = actionTarget.dataset.duelMode as
          | DuelMode
          | undefined;
        if (
          requestedDuelMode === "ai" ||
          requestedDuelMode === "local" ||
          requestedDuelMode === "remote"
        ) {
          this.duelMode = requestedDuelMode;
        }
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
          ? this.trialFollowUpAnswer === question.followUp.answer
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
          ? this.trialFollowUpAnswer === question.followUp.answer
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

  private handleExportClick(action: string): boolean {
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

  private handleLiveClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
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
          return true;
        }
        this.liveNode = node;
        this.liveSessionId = this.liveRunner.createSession("coach", node).sessionId;
        this.livePendingOption = 0;
        this.liveName = "";
        this.liveRevealed = false;
        this.liveDistribution = undefined;
        this.audio.ui();
        this.renderCoach();
        return true;
      }
      case "live-pick":
        this.liveName =
          this.root.querySelector<HTMLInputElement>('input[name="live-name"]')
            ?.value.trim() ?? "";
        this.livePendingOption = Number(actionTarget.dataset.option) || 0;
        this.audio.ui();
        this.renderCoach();
        return true;
      case "live-add": {
        const name = this.liveName;
        if (!name || !this.liveSessionId || !this.liveNode) {
          this.showToast(
            this.language === "en"
              ? "Enter a participant name first."
              : "请先输入学员姓名。"
          );
          return true;
        }
        this.liveRunner.submitPick(
          this.liveSessionId,
          name,
          this.livePendingOption
        );
        this.liveName = "";
        this.audio.ui();
        this.renderCoach();
        return true;
      }
      case "live-reveal": {
        if (!this.liveSessionId) return true;
        this.liveDistribution = this.liveRunner.reveal(
          this.liveSessionId
        ).distribution;
        this.liveRevealed = true;
        this.audio.expert();
        this.renderCoach();
        return true;
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
        return true;
      default:
        return false;
    }
  }

  private handleCustomScenarioClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
      case "open-custom-scenarios":
        this.customPlayId = undefined;
        this.customPlayResult = undefined;
        this.audio.ui();
        this.show("customScenarios");
        return true;
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
          return true;
        }
        this.customScenarios = [
          ...this.customScenarios,
          createCustomScenario({ title, context, stake, options })
        ];
        saveCustomScenarios(this.customScenarios);
        this.audio.expert();
        this.renderCustomScenarios();
        return true;
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
        return true;
      }
      case "custom-delete": {
        const id = actionTarget.dataset.id;
        this.customScenarios = this.customScenarios.filter(
          (scenario) => scenario.id !== id
        );
        saveCustomScenarios(this.customScenarios);
        this.audio.ui();
        this.renderCustomScenarios();
        return true;
      }
      case "custom-play": {
        const id = actionTarget.dataset.id;
        if (this.customScenarios.some((scenario) => scenario.id === id)) {
          this.customPlayId = id;
          this.customPlayResult = undefined;
          this.audio.ui();
          this.show("customScenarioPlay");
        }
        return true;
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
        return true;
      }
      case "custom-back":
        this.customPlayId = undefined;
        this.customPlayResult = undefined;
        this.audio.ui();
        this.show("customScenarios");
        return true;
      default:
        return false;
    }
  }

  private handleCoachClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
      case "open-achievements":
        this.audio.ui();
        this.show("achievements");
        return true;
      case "open-relations":
        this.audio.ui();
        this.show("relations");
        return true;
      case "open-settings":
        this.audio.ui();
        this.show("settings");
        return true;
      case "open-assessment":
        this.pendingProfile = structuredClone(this.save.profile);
        this.assessmentAnswers = [];
        this.assessmentStep = 0;
        this.audio.ui();
        this.show("assessment");
        return true;
      case "open-coach":
        this.audio.ui();
        this.show("coach");
        return true;
      case "coach-plan-goal":
        this.coachGoal = actionTarget.dataset.goal as CoachGoal;
        this.coachPlanStep = "challenge";
        this.renderCoach();
        return true;
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
        return true;
      case "coach-plan-check": {
        const key = actionTarget.dataset.key ?? "";
        this.coachPlanChecks[key] = !this.coachPlanChecks[key];
        this.renderCoach();
        return true;
      }
      case "coach-plan-restart":
        this.coachPlan = undefined;
        this.coachGoal = undefined;
        this.coachChallenge = undefined;
        this.coachPlanStep = "goal";
        this.coachPlanChecks = {};
        this.renderCoach();
        return true;
      case "coach-load-demo":
        this.loadCoachDemo();
        return true;
      case "coach-import":
        this.importCoachParticipants();
        return true;
      default:
        return false;
    }
  }

  private handleEndingClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
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
          return true;
        }
        this.wrongReviewQueue = wrongIds;
        this.wrongReviewIndex = 0;
        this.storyNodeId = wrongIds[0];
        this.replayMode = true;
        this.lastOutcome = undefined;
        this.lastOutcomeNodeId = undefined;
        this.audio.ui();
        this.show("story");
        return true;
      }
      case "next-wrong-review":
        this.wrongReviewIndex += 1;
        if (this.wrongReviewIndex >= this.wrongReviewQueue.length) {
          this.wrongReviewQueue = [];
          this.wrongReviewIndex = 0;
          this.replayMode = false;
          this.audio.ui();
          this.show("report");
          return true;
        }
        this.storyNodeId = this.wrongReviewQueue[this.wrongReviewIndex];
        this.lastOutcome = undefined;
        this.lastOutcomeNodeId = undefined;
        this.audio.ui();
        this.show("story");
        return true;
      case "open-ending":
        if (isChapterPassed(this.save, 9)) {
          this.audio.ui();
          this.show("ending");
        }
        return true;
      case "ending-back":
        this.audio.ui();
        this.show("report");
        return true;
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
        return true;
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
        return true;
      }
      case "ending-choice": {
        const ending = actionTarget.dataset.ending;
        if (ending) {
          this.endingChoice = ending;
          recordAlternateEnding(this.save, `ending-${ending}`);
          this.audio.expert();
          this.renderEnding();
        }
        return true;
      }
      case "hidden-option": {
        const abilityId = this.hiddenBranchAbilityId;
        if (!abilityId) return true;
        const steps = hiddenRouteSteps(abilityId);
        const step = Math.min(this.hiddenRouteStep, steps.length - 1);
        const selected = Number(actionTarget.dataset.option);
        const correct = selected === steps[step].answer;
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
        return true;
      }
      case "hidden-next": {
        const abilityId = this.hiddenBranchAbilityId;
        if (!abilityId) return true;
        if (this.hiddenRouteLastCorrect) {
          const steps = hiddenRouteSteps(abilityId);
          this.hiddenRouteStep = Math.min(
            steps.length - 1,
            this.hiddenRouteStep + 1
          );
        }
        this.hiddenRouteLastCorrect = undefined;
        this.audio.ui();
        this.renderHiddenBranch();
        return true;
      }
      case "continue-hidden-exit":
        this.audio.ui();
        if (this.lastOutcome && this.lastOutcomeNodeId) {
          this.storyNodeId = this.lastOutcomeNodeId;
          this.show("story");
        } else {
          this.show("map");
        }
        return true;
      default:
        return false;
    }
  }

  private handleReviewClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
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
          return true;
        }
        this.wrongReviewQueue = dueIds;
        this.wrongReviewIndex = 0;
        this.storyNodeId = dueIds[0];
        this.replayMode = true;
        this.lastOutcome = undefined;
        this.lastOutcomeNodeId = undefined;
        this.audio.ui();
        this.show("story");
        return true;
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
          return true;
        }
        this.dualReviewQueue = dueIds;
        this.dualReviewIndex = 0;
        this.resetDualSelection();
        this.audio.ui();
        this.show("dualReview");
        return true;
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
        return true;
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
          return true;
        }
        const nodeId = this.dualReviewQueue[this.dualReviewIndex];
        if (!nodeId) return true;
        const roleNode = getNodeForRole(this.save.profile.role, nodeId);
        const nodeView = storyNodeDisplay(this.language, this.save,roleNode);
        // 与 dualReviewView 保持同一打乱顺序，保证 index 语义一致。
        const order = storyOptionOrder(this.save, roleNode);
        const options = order.map((index) => nodeView.options[index]);
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
        return true;
      }
      case "dual-next":
        this.dualReviewIndex += 1;
        if (this.dualReviewIndex >= this.dualReviewQueue.length) {
          this.dualReviewQueue = [];
          this.dualReviewIndex = 0;
          this.resetDualSelection();
          this.audio.ui();
          this.show("report");
          return true;
        }
        this.resetDualSelection();
        this.audio.ui();
        this.renderDualReview();
        return true;
      case "dual-close":
        this.dualReviewQueue = [];
        this.dualReviewIndex = 0;
        this.resetDualSelection();
        this.audio.ui();
        this.show("report");
        return true;
      case "open-team-academy":
        void this.openTeamAcademy();
        return true;
      default:
        return false;
    }
  }

  private handleMapClick(action: string, actionTarget: HTMLElement): boolean {
    switch (action) {
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
        return true;
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
        return true;
      }
      case "toggle-pressure":
        this.save.highPressureMode = !this.save.highPressureMode;
        this.persistSave();
        this.audio.ui();
        this.renderMap();
        return true;
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
        return true;
      }
      case "toggle-achievement-favorite": {
        const achievementId = actionTarget.dataset.achievement;
        if (!achievementId) return true;
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
        return true;
      }
      case "toggle-hint":
        this.storyHintRevealed = !this.storyHintRevealed;
        this.audio.ui();
        this.renderStory();
        return true;
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
        return true;
      case "choose-option":
        this.chooseStoryOption(actionTarget);
        return true;
      case "open-leadership-games":
        void this.openLeadershipGames();
        return true;
      case "organizational-invest":
        this.organizationalInvest();
        return true;
      case "claim-production":
        this.claimProduction();
        return true;
      case "claim-duel-bonus":
        this.claimDuelBonus();
        return true;
      case "dismiss-map-guide":
        this.markGuideStep("map-intro");
        this.audio.ui();
        this.renderMap();
        return true;
      case "expedition-explore":
        this.exploreNodeAction(actionTarget);
        return true;
      case "integrity-answer":
        this.answerIntegrityGate(actionTarget);
        return true;
      default:
        return false;
    }
  }

  private handleStoryTransitionClick(
    action: string,
    actionTarget: HTMLElement
  ): boolean {
    switch (action) {
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
        return true;
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
        return true;
      }
      case "continue-transition":
        if (this.pendingChapterTransition) {
          this.audio.ui();
          this.show("chapterTransition");
        }
        return true;
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
          return true;
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
        return true;
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
        return true;
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
        return true;
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
            this.hiddenRouteLastCorrect = undefined;
            this.pendingBranchNodeId = undefined;
            this.audio.ui();
            this.show("hiddenBranch");
            return true;
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
        return true;
      }
      default:
        return false;
    }
  }

  private handleNavClick(action: string, actionTarget: HTMLElement): boolean {
    switch (action) {
      case "open-node": {
        const nodeId = actionTarget.dataset.node;
        if (nodeId) {
          // 已完成节点只用于展示，不可再次结算；重打请走 replay-chapter。
          if (isNodeComplete(this.save, nodeId)) {
            this.audio.ui();
            return true;
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
        return true;
      }
      case "resume-last-node": {
        const nodeId = this.save.lastStoryNodeId;
        if (!nodeId) return true;
        try {
          const node = getNode(nodeId);
          if (isNodeComplete(this.save, node.id)) {
            this.save.lastStoryNodeId = undefined;
            this.persistSave();
            return true;
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
        return true;
      }
      case "select-chapter": {
        const chapterId = Number(actionTarget.dataset.chapter);
        if (this.save.unlockedChapters.includes(chapterId)) {
          this.audio.ui();
          this.selectedChapter = chapterId;
          this.renderMap();
        }
        return true;
      }
      case "select-role":
        this.audio.ui();
        this.pendingRole = (actionTarget.dataset.role as RoleId) ?? "highPotential";
        this.renderProfile();
        return true;
      case "switch-role": {
        const role = actionTarget.dataset.role as RoleId;
        if (!role || !ROLES[role]) return true;
        this.save = loadSave(role);
        this.pendingRole = role;
        this.pendingProfile = undefined;
        this.audio.ui();
        if (this.save.profileCreated) {
          this.show("menu");
        } else {
          this.show("profile");
        }
        return true;
      }
      case "new-role": {
        const role = actionTarget.dataset.role as RoleId;
        if (!role || !ROLES[role]) return true;
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
          return true;
        }
        if (existing) {
          deleteRoleSlot(role);
        }
        this.save = loadSave(role);
        this.pendingRole = role;
        this.pendingProfile = undefined;
        this.audio.ui();
        this.show("profile");
        return true;
      }
      case "open-menu":
        this.audio.ui();
        this.show("menu");
        return true;
      case "open-profile":
        this.audio.ui();
        this.show("profile");
        return true;
      case "start-trial-chapter":
        this.pendingRole = "parachute";
        this.startWithoutAssessment();
        this.showToast(
          this.language === "en"
            ? "Chapter 1 trial started as Parachute Manager."
            : "已以空降管理者身份进入首章试玩。"
        );
        return true;
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
        return true;
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
        return true;
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
        return true;
      }
      case "guide-ability":
        if (this.save.profileCreated && this.save.playCount === 0) {
          this.markGuideStep("ability");
        }
        this.audio.ui();
        this.show("ability");
        return true;
      case "open-ability":
        this.audio.ui();
        if (this.save.profileCreated && this.save.playCount === 0) {
          this.markGuideStep("ability");
        }
        this.show("ability");
        return true;
      case "open-report":
        this.audio.ui();
        if (this.save.profileCreated && this.save.playCount === 0) {
          this.markGuideStep("report");
        }
        this.show("report");
        return true;
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
        return true;
      }
      case "certification-help":
        this.showToast(
          this.language === "en"
            ? "Certification = assessment score + role focus ability levels. Finish the 30-question assessment and train focus abilities to grow."
            : "认证点 = 测评总分 + 角色重点能力等级合计；完成 30 题测评提升总分，训练角色重点能力提升等级。"
        );
        this.audio.ui();
        return true;
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
      this.save.profile.role,
      this.save.decisionHistory,
      this.save.trainingScores
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
    if (this.pendingChapterTransition !== undefined) {
      trackEvent("chapter_complete", {
        chapterId: this.pendingChapterTransition,
        role: this.save.profile.role
      });
    }
    const highAbility = (
      Object.keys(outcome.option.effects) as AbilityId[]
    ).find((id) => abilityLevel(this.save.profile.abilities[id]) >= 3);
    const isForkNode = this.pendingForkNodeId === baseNode.id;
    const roleBranch = outcome.option.branchTo?.[this.save.profile.role];
    if (
      !isForkNode &&
      outcome.option.quality === "expert" &&
      highAbility &&
      !roleBranch
    ) {
      this.hiddenBranchAbilityId = highAbility;
      this.pendingBranchNodeId = `ability-${highAbility}`;
    } else {
      this.hiddenBranchAbilityId = undefined;
      this.pendingBranchNodeId = roleBranch;
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
      JSON.stringify(exportAnalyticsPayload(readAnalyticsEvents()), null, 2),
      "application/json"
    );
    this.audio.ui();
  }

  private exportReturnPackage(): void {
    const events = readAnalyticsEvents();
    const payload = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      build: ONLINE_ENABLED ? "online" : "static",
      save: this.save,
      events,
      analytics: exportAnalyticsPayload(events).summary
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

}

