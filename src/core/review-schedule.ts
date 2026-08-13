/**
 * 轻量 SM-2 间隔复习：把未选专家项的决策变成可追踪的复习卡，
 * 参考 basketball-iq-trainer 与 claude-tutor 的复习闭环设计。
 */

export interface ReviewCard {
  nodeId: string;
  /** SM-2 easiness factor，最小 1.3。 */
  easiness: number;
  /** 当前复习间隔（天）。 */
  intervalDays: number;
  /** 连续通过的次数。 */
  repetition: number;
  /** 下次复习时间（毫秒时间戳）。 */
  dueAt: number;
  /** 最近一次作答质量 0-5。 */
  lastQuality: number;
  /** 是否曾错过专家项。 */
  wasEverIncorrect: boolean;
  lastReviewedAt: number;
}

export type ReviewQuality = "expert" | "partial" | "risk";

const DAY_MS = 24 * 60 * 60 * 1000;

export function qualityToScore(quality: ReviewQuality): number {
  return quality === "expert" ? 5 : quality === "partial" ? 3 : 1;
}

function applySm2(
  card: ReviewCard,
  score: number,
  now: number
): ReviewCard {
  let easiness = Math.max(1.3, Number(card.easiness) || 2.5);
  let intervalDays = Math.max(0, Number(card.intervalDays) || 0);
  let repetition = Math.max(0, Number(card.repetition) || 0);
  if (score >= 3) {
    repetition += 1;
    if (repetition === 1) {
      intervalDays = 1;
    } else if (repetition === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.max(6, Math.round(intervalDays * easiness));
    }
    easiness = Math.max(
      1.3,
      easiness + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02))
    );
  } else {
    repetition = 0;
    intervalDays = 1;
  }
  return {
    ...card,
    easiness,
    intervalDays,
    repetition,
    dueAt: now + intervalDays * DAY_MS,
    lastQuality: score,
    wasEverIncorrect: true,
    lastReviewedAt: now
  };
}

function upsert(
  cards: ReviewCard[],
  nodeId: string,
  score: number,
  now: number
): ReviewCard[] {
  const existing = cards.find((card) => card.nodeId === nodeId);
  if (!existing) {
    return [
      ...cards,
      {
        nodeId,
        easiness: 2.5,
        intervalDays: 0,
        repetition: 0,
        dueAt: now + DAY_MS,
        lastQuality: score,
        wasEverIncorrect: true,
        lastReviewedAt: now
      }
    ];
  }
  return cards.map((card) =>
    card.nodeId === nodeId ? applySm2(card, score, now) : card
  );
}

export function scheduleMissedDecision(
  cards: ReviewCard[],
  nodeId: string,
  quality: ReviewQuality,
  now = Date.now()
): ReviewCard[] {
  return upsert(cards, nodeId, qualityToScore(quality), now);
}

export function recordReviewResult(
  cards: ReviewCard[],
  nodeId: string,
  quality: ReviewQuality,
  now = Date.now()
): ReviewCard[] {
  const score = quality === "expert" ? 5 : 1;
  return upsert(cards, nodeId, score, now);
}

export function dueReviewCards(
  cards: ReviewCard[],
  now = Date.now()
): ReviewCard[] {
  return cards
    .filter((card) => Number(card.dueAt) <= now)
    .sort((a, b) => a.dueAt - b.dueAt)
    .slice(0, 8);
}

export function reviewStats(cards: ReviewCard[], now = Date.now()): {
  due: number;
  total: number;
  mastered: number;
} {
  return {
    due: cards.filter((card) => Number(card.dueAt) <= now).length,
    total: cards.length,
    mastered: cards.filter((card) => Number(card.intervalDays) >= 15).length
  };
}

export interface ReviewBoardEntry {
  ability: string;
  due: number;
  total: number;
  mastered: number;
}

export type DualAxisOutcome = "perfect" | "partial" | "missed";

export function scoreDualAxis(
  bestIndex: number,
  worstIndex: number,
  expertIndex: number,
  riskIndex: number
): DualAxisOutcome {
  if (bestIndex === expertIndex && worstIndex === riskIndex) {
    return "perfect";
  }
  if (bestIndex === expertIndex) {
    return "partial";
  }
  return "missed";
}

export function dualAxisQuality(
  outcome: DualAxisOutcome
): ReviewQuality {
  return outcome === "perfect"
    ? "expert"
    : outcome === "partial"
      ? "partial"
      : "risk";
}

export function worstOptionIndex(
  options: Array<{
    quality: string;
    resources?: Record<string, number>;
  }>
): number {
  let worst = -1;
  let worstRank = Number.POSITIVE_INFINITY;
  let worstNet = Number.POSITIVE_INFINITY;
  options.forEach((option, index) => {
    const rank =
      option.quality === "risk"
        ? 0
        : option.quality === "partial"
          ? 1
          : 2;
    const net = Object.values(option.resources ?? {}).reduce(
      (sum, value) => sum + value,
      0
    );
    if (rank < worstRank || (rank === worstRank && net < worstNet)) {
      worst = index;
      worstRank = rank;
      worstNet = net;
    }
  });
  return worst;
}

export function reviewBoard(
  cards: ReviewCard[],
  abilityFor: (nodeId: string) => string,
  now = Date.now()
): ReviewBoardEntry[] {
  const groups = new Map<string, ReviewBoardEntry>();
  for (const card of cards) {
    const ability = abilityFor(card.nodeId) || "insight";
    const entry = groups.get(ability) ?? {
      ability,
      due: 0,
      total: 0,
      mastered: 0
    };
    entry.total += 1;
    if (Number(card.dueAt) <= now) entry.due += 1;
    if (Number(card.intervalDays) >= 15) entry.mastered += 1;
    groups.set(ability, entry);
  }
  return [...groups.values()].sort((a, b) => b.due - a.due || b.total - a.total);
}

export function normalizeReviewCards(raw: unknown): ReviewCard[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const cards: ReviewCard[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as Partial<ReviewCard>;
    const nodeId =
      typeof record.nodeId === "string" ? record.nodeId.trim() : "";
    if (!nodeId || seen.has(nodeId)) continue;
    seen.add(nodeId);
    cards.push({
      nodeId,
      easiness: Math.max(1.3, Number(record.easiness) || 2.5),
      intervalDays: Math.max(0, Number(record.intervalDays) || 0),
      repetition: Math.max(0, Number(record.repetition) || 0),
      dueAt: Number(record.dueAt) || Date.now(),
      lastQuality: Math.min(5, Math.max(0, Number(record.lastQuality) || 0)),
      wasEverIncorrect: record.wasEverIncorrect !== false,
      lastReviewedAt: Number(record.lastReviewedAt) || 0
    });
  }
  return cards.slice(-100);
}
