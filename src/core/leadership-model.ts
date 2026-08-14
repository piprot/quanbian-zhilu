import type {
  AbilityId,
  LeadershipDimension,
  SaveState
} from "./types.ts";

export interface LeadershipDimensionDef {
  id: LeadershipDimension;
  zh: string;
  en: string;
  zhSub: string;
  enSub: string;
  growZh: string;
  growEn: string;
}

export const DIMENSION_ORDER: LeadershipDimension[] = [
  "credibility",
  "empathy",
  "decisiveness",
  "vision",
  "resilience"
];

export const LEADERSHIP_DIMENSIONS: Record<
  LeadershipDimension,
  LeadershipDimensionDef
> = {
  credibility: {
    id: "credibility",
    zh: "信服力",
    en: "Credibility",
    zhSub: "根基 · 尊重",
    enSub: "Roots · Respect",
    growZh: "以身作则、诚信决策",
    growEn: "Lead by example, decide with integrity"
  },
  empathy: {
    id: "empathy",
    zh: "共情力",
    en: "Empathy",
    zhSub: "亲和 · 增值 · 吸引力",
    enSub: "Connection · Value · Attraction",
    growZh: "关怀团队、有效沟通",
    growEn: "Care for the team, communicate effectively"
  },
  decisiveness: {
    id: "decisiveness",
    zh: "决断力",
    en: "Decisiveness",
    zhSub: "导航 · 优先次序 · 时机",
    enSub: "Navigation · Priorities · Timing",
    growZh: "做对的事、把控方向",
    growEn: "Do the right thing, steer the direction"
  },
  vision: {
    id: "vision",
    zh: "格局力",
    en: "Vision",
    zhSub: "授权 · 爆炸性倍增 · 传承",
    enSub: "Empowerment · Multiplied Growth · Legacy",
    growZh: "培养他人、授权放权",
    growEn: "Develop others, empower and delegate"
  },
  resilience: {
    id: "resilience",
    zh: "韧性值",
    en: "Resilience",
    zhSub: "制胜 · 动势 · 舍得",
    enSub: "Victory · Momentum · Sacrifice",
    growZh: "在困境选择中波动，影响士气",
    growEn: "Fluctuates in adversity choices and affects morale"
  }
};

export const ABILITY_DIMENSION_MAP: Record<
  AbilityId,
  LeadershipDimension
> = {
  insight: "empathy",
  deploy: "vision",
  mobilize: "vision",
  strategy: "decisiveness",
  authority: "credibility",
  stability: "credibility",
  recovery: "resilience",
  execution: "decisiveness",
  structure: "credibility",
  communication: "empathy"
};

const DIMENSION_EXP_TABLE = [0, 4, 10, 18, 28, 40];

export function dimensionLevel(exp: number): number {
  let level = 1;
  for (const threshold of DIMENSION_EXP_TABLE.slice(1)) {
    if (exp >= threshold) {
      level += 1;
    } else {
      break;
    }
  }
  return Math.min(5, level);
}

/**
 * 由十项能力经验聚合出五项领导力维度经验（0–40，与能力经验同尺度）。
 * 每个维度取其映射能力（见 ABILITY_DIMENSION_MAP）的平均经验，供「领导力画像」展示，
 * 与 trial 累积的 dimensionExp 相互独立。
 */
export function aggregateDimensionExp(
  abilities: Record<AbilityId, number>
): Record<LeadershipDimension, number> {
  const sums = Object.fromEntries(
    DIMENSION_ORDER.map((id) => [id, 0])
  ) as Record<LeadershipDimension, number>;
  const counts = { ...sums };
  for (const [abilityId, dimension] of Object.entries(
    ABILITY_DIMENSION_MAP
  ) as Array<[AbilityId, LeadershipDimension]>) {
    sums[dimension] += abilities[abilityId] ?? 0;
    counts[dimension] += 1;
  }
  const result = {} as Record<LeadershipDimension, number>;
  for (const id of DIMENSION_ORDER) {
    result[id] = counts[id] > 0 ? sums[id] / counts[id] : 0;
  }
  return result;
}

export function addDimensionExp(
  save: SaveState,
  dimension: LeadershipDimension,
  delta: number
): void {
  const current = save.dimensionExp?.[dimension] ?? 0;
  save.dimensionExp = {
    ...(save.dimensionExp ?? {}),
    [dimension]: Math.max(0, Math.min(100, current + delta))
  };
}

export function applyMoraleChange(save: SaveState, delta: number): void {
  save.morale = Math.max(0, Math.min(100, (save.morale ?? 75) + delta));
}
