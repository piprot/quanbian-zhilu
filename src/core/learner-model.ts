import { ABILITY_ORDER } from "./abilities.ts";
import { ADAPTIVE_CONFIG } from "./adaptive-config.ts";
import type {
  AbilityId,
  AbilityMasteryState,
  LearnerModel,
  OptionQuality
} from "./types.ts";

export type EvidenceStage =
  | "estimated"
  | "retained"
  | "demonstrated"
  | "transferred";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createDefaultLearnerModel(): LearnerModel {
  const abilities = {} as Record<AbilityId, AbilityMasteryState>;
  for (const ability of ABILITY_ORDER) {
    abilities[ability] = {
      ability,
      attempts: 0,
      expert: 0,
      partial: 0,
      risk: 0,
      lastAt: 0,
      qualitySum: 0,
      mastery: 0.3,
      confidence: 0,
      bktMastery: ADAPTIVE_CONFIG.bkt.probMastery
    };
  }
  return { abilities, updatedAt: 0 };
}

/** 标准 BKT 一次观测更新，返回新的掌握概率。 */
export function bktUpdate(
  params: {
    probMastery: number;
    probLearn: number;
    probGuess: number;
    probSlip: number;
  },
  isCorrect: boolean
): number {
  const mastery = clamp(params.probMastery, 0, 1);
  const learn = clamp(params.probLearn, 0, 1);
  const guess = clamp(params.probGuess, 0, 1);
  const slip = clamp(params.probSlip, 0, 1);
  if (isCorrect) {
    const numerator = mastery * (1 - slip);
    const denominator = numerator + (1 - mastery) * guess;
    const posterior = denominator === 0 ? mastery : numerator / denominator;
    return clamp(posterior + (1 - posterior) * learn, 0, 1);
  }
  const numerator = mastery * slip;
  const denominator =
    numerator + (1 - mastery) * (1 - guess);
  const posterior = denominator === 0 ? mastery : numerator / denominator;
  return clamp(posterior + (1 - posterior) * learn, 0, 1);
}

export function updateLearnerModel(
  model: LearnerModel,
  input: {
    abilityIds: AbilityId[];
    quality: OptionQuality;
    timestamp?: number;
  }
): LearnerModel {
  const now = input.timestamp ?? Date.now();
  const next = structuredClone(model);
  for (const ability of new Set(input.abilityIds)) {
    const state = next.abilities[ability];
    const score = ADAPTIVE_CONFIG.qualityScore[input.quality];
    state.attempts += 1;
    state.lastAt = now;
    state.qualitySum += score;
    if (input.quality === "expert") state.expert += 1;
    else if (input.quality === "partial") state.partial += 1;
    else state.risk += 1;
    const qualityMastery =
      state.qualitySum / Math.max(1, state.attempts);
    state.bktMastery = bktUpdate(
      {
        probMastery: state.bktMastery,
        probLearn: ADAPTIVE_CONFIG.bkt.probLearn,
        probGuess: ADAPTIVE_CONFIG.bkt.probGuess,
        probSlip: ADAPTIVE_CONFIG.bkt.probSlip
      },
      input.quality === "expert"
    );
    state.mastery = clamp(
      state.bktMastery * 0.45 + qualityMastery * 0.55,
      0,
      1
    );
    state.confidence = clamp(state.attempts / 6, 0, 1);
  }
  next.updatedAt = now;
  return next;
}

export function masterySummary(
  model: LearnerModel,
  ability: AbilityId
): {
  state: AbilityMasteryState;
  stage: EvidenceStage;
} {
  const state = model.abilities[ability];
  let stage: EvidenceStage = "estimated";
  if (state.attempts >= 5 && state.mastery >= 0.78 && state.expert / state.attempts >= 0.6) {
    stage = "demonstrated";
  } else if (state.attempts >= 3 && state.mastery >= 0.55) {
    stage = "retained";
  }
  if (
    stage === "demonstrated" &&
    state.attempts >= 8 &&
    state.mastery >= 0.85
  ) {
    stage = "transferred";
  }
  return { state, stage };
}

export function abilityGap(
  model: LearnerModel,
  ability: AbilityId
): number {
  return clamp(1 - model.abilities[ability].mastery, 0, 1);
}

export function weakestAbilitiesByMastery(
  model: LearnerModel,
  limit = 3
): AbilityId[] {
  return ABILITY_ORDER.slice()
    .sort(
      (a, b) =>
        model.abilities[a].mastery - model.abilities[b].mastery ||
        model.abilities[a].attempts - model.abilities[b].attempts
    )
    .slice(0, limit);
}

export function strongestAbilitiesByMastery(
  model: LearnerModel,
  limit = 3
): AbilityId[] {
  return ABILITY_ORDER.slice()
    .sort(
      (a, b) =>
        model.abilities[b].mastery - model.abilities[a].mastery ||
        model.abilities[b].attempts - model.abilities[a].attempts
    )
    .slice(0, limit);
}

