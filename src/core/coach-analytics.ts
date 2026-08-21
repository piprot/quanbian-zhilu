import {
  ABILITY_ORDER,
  ROLES,
  abilityLevel,
  abilityRanking,
  rankForTotal,
  totalAbilityLevels,
  weakestAbilities
} from "./abilities.ts";
import type { AbilityId, SaveState } from "./types.ts";

export interface CoachXpPoint {
  index: number;
  xp: number;
  quality: string;
}

export interface CoachStudentSummary {
  name: string;
  role: string;
  rank: string;
  rankEn: string;
  total: number;
  abilities: Record<AbilityId, number>;
  xp: number;
  sessions: number;
  updatedAt?: number;
  strong: AbilityId[];
  weak: AbilityId[];
  regression?: AbilityId;
  balanced: boolean;
  history: CoachXpPoint[];
  recent: Array<{
    nodeId: string;
    quality: string;
    score: number;
    chapterId: number;
  }>;
}

export function xpHistory(save: SaveState): CoachXpPoint[] {
  const abilities = { ...ROLES[save.profile.role].startingAbilities } as Record<
    AbilityId,
    number
  >;
  const points: CoachXpPoint[] = [];
  save.decisionHistory.forEach((record, index) => {
    if (!record.delta?.abilities) return;
    for (const [abilityId, delta] of Object.entries(record.delta.abilities) as Array<
      [AbilityId, number]
    >) {
      abilities[abilityId] = Math.max(0, (abilities[abilityId] ?? 0) + delta);
    }
    points.push({
      index: index + 1,
      xp: totalAbilityLevels(abilities),
      quality: record.quality
    });
  });
  if (!points.length && save.playCount > 0) {
    points.push({ index: save.playCount, xp: totalAbilityLevels(save.profile.abilities), quality: "partial" });
  }
  return points.slice(-20);
}

export function coachStudentSummary(save: SaveState): CoachStudentSummary {
  const total = totalAbilityLevels(save.profile.abilities);
  const rank = rankForTotal(total);
  const levels = ABILITY_ORDER.map((id) => save.profile.abilities[id]);
  const max = Math.max(...levels, 0);
  const min = Math.min(...levels, 0);
  let regression: AbilityId | undefined;
  for (const record of [...save.decisionHistory].reverse()) {
    if (!record.delta?.abilities) continue;
    const negative = Object.entries(record.delta.abilities).filter(
      ([, delta]) => (delta as number) < 0
    ) as Array<[AbilityId, number]>;
    if (negative.length) {
      regression = negative.sort((a, b) => a[1] - b[1])[0][0];
      break;
    }
  }
  return {
    name: save.profile.name,
    role: save.profile.role,
    rank: rank.name,
    rankEn: rank.nameEn,
    total,
    abilities: { ...save.profile.abilities },
    xp: save.masteryPoints,
    sessions: save.playCount,
    updatedAt: save.lastSavedAt,
    strong: abilityRanking(save.profile.abilities, 3),
    weak: weakestAbilities(save.profile.abilities, 3),
    regression,
    balanced: max - min <= 4,
    history: xpHistory(save),
    recent: save.decisionHistory
      .slice(-5)
      .map((record) => ({
        nodeId: record.nodeId,
        quality: record.quality,
        score: record.qualityScore,
        chapterId: record.chapterId
      }))
      .reverse()
  };
}
