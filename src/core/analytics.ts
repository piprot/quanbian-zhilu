/** 轻量匿名事件日志：仅存 localStorage，不上传、不采集身份信息。 */

const ANALYTICS_KEY = "adaptive-ascent-analytics-v1";
const MAX_EVENTS = 500;

export interface AnalyticsEvent {
  name: string;
  ts: number;
  [key: string]: unknown;
}

export function trackEvent(
  name: string,
  data?: Record<string, unknown>
): void {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY) ?? "[]";
    const parsed = JSON.parse(raw) as unknown;
    const events = Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
    events.push({ name, ts: Date.now(), ...(data ?? {}) });
    const trimmed = events.slice(-MAX_EVENTS);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch {
    // 事件日志失败不影响游戏运行
  }
}

export function readAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY) ?? "[]";
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

// ============================================================
// 聚合分析：把原始事件汇总成留存 / 流失 / 关卡通过率等指标
// ============================================================

export interface ChapterStats {
  /** 该章做出的选择次数（story_choice） */
  choices: number;
  /** 重试次数（chapter_retry） */
  retries: number;
  /** 一星以上通关次数（chapter_complete） */
  completions: number;
}

export interface AnalyticsSummary {
  /** 会话总数（session_start 次数） */
  sessionCount: number;
  /** 有活动的自然日数 */
  activeDays: number;
  /** 首次活动时间戳（ms） */
  firstSeenAt: number | null;
  /** 最近一次活动时间戳（ms） */
  lastSeenAt: number | null;
  /** 以首次会话为锚点的留存回访（D1 / D7 / D30） */
  retention: { d1: boolean; d7: boolean; d30: boolean };
  /** 玩家最后到达的章节（流失点），1-9；无数据为 null */
  lastChapter: number | null;
  /** 每章统计（章节号 → 统计） */
  chapterStats: Record<number, ChapterStats>;
  /** 主线选择总数 */
  totalChoices: number;
  /** 专家选择占比（0..1）；无选择为 null */
  expertRate: number | null;
  /** 1v1 对局总数 */
  duelCount: number;
  /** 1v1 胜场数 */
  duelWins: number;
  /** 训练完成次数 */
  trainingCount: number;
  /** 领导力小游戏次数 */
  leadershipGames: number;
}

const DAY_MS = 86_400_000;

function toChapterId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.floor(parsed) : null;
  }
  return null;
}

export function computeAnalyticsSummary(
  events: AnalyticsEvent[]
): AnalyticsSummary {
  const sessions = events.filter((event) => event.name === "session_start");
  const choices = events.filter((event) => event.name === "story_choice");
  const retries = events.filter((event) => event.name === "chapter_retry");
  const completions = events.filter((event) => event.name === "chapter_complete");
  const duels = events.filter((event) => event.name === "duel_result");
  const trainings = events.filter((event) => event.name === "training_result");
  const games = events.filter((event) => event.name === "leadership_game");

  const timestamps = events
    .map((event) => event.ts)
    .filter((ts) => typeof ts === "number" && Number.isFinite(ts))
    .sort((a, b) => a - b);
  const firstSeenAt = timestamps[0] ?? null;
  const lastSeenAt = timestamps[timestamps.length - 1] ?? null;

  const activeDays = new Set(
    timestamps.map((ts) => new Date(ts).toDateString())
  ).size;

  const retention = { d1: false, d7: false, d30: false };
  if (firstSeenAt !== null) {
    const sessionTimes = sessions
      .map((event) => event.ts)
      .filter((ts): ts is number => typeof ts === "number");
    retention.d1 = sessionTimes.some((ts) => ts - firstSeenAt >= DAY_MS);
    retention.d7 = sessionTimes.some((ts) => ts - firstSeenAt >= 7 * DAY_MS);
    retention.d30 = sessionTimes.some((ts) => ts - firstSeenAt >= 30 * DAY_MS);
  }

  const chapterStats: Record<number, ChapterStats> = {};
  const bump = (id: number): ChapterStats => {
    chapterStats[id] ??= { choices: 0, retries: 0, completions: 0 };
    return chapterStats[id];
  };
  let lastChapter: number | null = null;
  const considerChapter = (value: unknown): void => {
    const id = toChapterId(value);
    if (id === null) return;
    lastChapter = lastChapter === null ? id : Math.max(lastChapter, id);
  };
  for (const event of choices) {
    const id = toChapterId(event.chapterId);
    if (id !== null) {
      bump(id).choices += 1;
      considerChapter(id);
    }
  }
  for (const event of retries) {
    const id = toChapterId(event.chapterId);
    if (id !== null) {
      bump(id).retries += 1;
      considerChapter(id);
    }
  }
  for (const event of completions) {
    const id = toChapterId(event.chapterId);
    if (id !== null) {
      bump(id).completions += 1;
      considerChapter(id);
    }
  }
  // 会话快照里带的最新章节也参与"玩到第几章"的判定
  for (const event of sessions) {
    considerChapter(event.lastChapter);
  }

  const totalChoices = choices.length;
  const expertCount = choices.filter(
    (event) => event.quality === "expert"
  ).length;
  const expertRate =
    totalChoices > 0 ? expertCount / totalChoices : null;

  const duelWins = duels.filter((event) => event.won === true).length;

  return {
    sessionCount: sessions.length,
    activeDays,
    firstSeenAt,
    lastSeenAt,
    retention,
    lastChapter,
    chapterStats,
    totalChoices,
    expertRate,
    duelCount: duels.length,
    duelWins,
    trainingCount: trainings.length,
    leadershipGames: games.length
  };
}

export function exportAnalyticsPayload(
  events: AnalyticsEvent[]
): { summary: AnalyticsSummary; events: AnalyticsEvent[] } {
  return { summary: computeAnalyticsSummary(events), events };
}
