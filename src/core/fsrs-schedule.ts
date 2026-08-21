import type {
  AbilityId,
  FsrsCard,
  OptionQuality
} from "./types.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function qualityScore(quality: OptionQuality): number {
  return quality === "expert" ? 5 : quality === "partial" ? 3 : 1;
}

export function createFsrsCard(
  nodeId: string,
  abilityIds: AbilityId[],
  now = Date.now()
): FsrsCard {
  return {
    nodeId,
    abilityIds,
    stability: 1,
    difficulty: 0.5,
    retrievability: 0.9,
    dueAt: now + DAY_MS,
    lastReviewedAt: now,
    reviews: 1
  };
}

export function scheduleFsrsReview(
  cards: FsrsCard[],
  nodeId: string,
  abilityIds: AbilityId[],
  quality: OptionQuality,
  now = Date.now()
): FsrsCard[] {
  const score = qualityScore(quality);
  const existing = cards.find((card) => card.nodeId === nodeId);
  if (!existing) {
    const card = createFsrsCard(nodeId, abilityIds, now);
    const updated = applyReview(card, score, now);
    return [...cards, updated];
  }
  return cards.map((card) =>
    card.nodeId === nodeId ? applyReview(card, score, now) : card
  );
}

function applyReview(card: FsrsCard, score: number, now: number): FsrsCard {
  const difficulty = clamp(
    card.difficulty + (score - 3) * 0.06,
    0.1,
    1
  );
  const stability = clamp(
    card.stability * (1 + (score - 3) * 0.25),
    0.1,
    30
  );
  const retrievability = clamp(
    card.retrievability + (score - 3) * 0.08,
    0,
    1
  );
  const intervalDays = Math.max(1, Math.round(stability * 2));
  return {
    ...card,
    stability,
    difficulty,
    retrievability,
    dueAt: now + intervalDays * DAY_MS,
    lastReviewedAt: now,
    reviews: card.reviews + 1
  };
}

export function dueFsrsCards(
  cards: FsrsCard[],
  now = Date.now()
): FsrsCard[] {
  return cards
    .filter((card) => Number(card.dueAt) <= now)
    .sort(
      (a, b) =>
        a.dueAt - b.dueAt || a.retrievability - b.retrievability
    )
    .slice(0, 8);
}

export function fsrsStats(
  cards: FsrsCard[],
  now = Date.now()
): { due: number; total: number; forgotten: number } {
  return {
    due: cards.filter((card) => Number(card.dueAt) <= now).length,
    total: cards.length,
    forgotten: cards.filter(
      (card) => Number(card.dueAt) <= now && card.retrievability < 0.6
    ).length
  };
}

export function normalizeFsrsCards(raw: unknown): FsrsCard[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const cards: FsrsCard[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as Partial<FsrsCard>;
    const nodeId =
      typeof record.nodeId === "string" ? record.nodeId.trim() : "";
    if (!nodeId || seen.has(nodeId)) continue;
    seen.add(nodeId);
    cards.push({
      nodeId,
      abilityIds: Array.isArray(record.abilityIds)
        ? record.abilityIds.filter(
            (id): id is AbilityId =>
              typeof id === "string" && id.length > 0
          )
        : [],
      stability: Math.max(0.1, Number(record.stability) || 1),
      difficulty: clamp(Number(record.difficulty) ?? 0.5, 0.1, 1),
      retrievability: clamp(
        Number(record.retrievability) ?? 0.9,
        0,
        1
      ),
      dueAt: Number(record.dueAt) || Date.now(),
      lastReviewedAt: Number(record.lastReviewedAt) || 0,
      reviews: Math.max(0, Number(record.reviews) || 1)
    });
  }
  return cards.slice(-200);
}

