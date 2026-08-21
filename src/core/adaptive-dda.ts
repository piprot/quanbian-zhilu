import { ADAPTIVE_CONFIG, tierForPps } from "./adaptive-config.ts";
import { createDefaultLearnerModel, updateLearnerModel } from "./learner-model.ts";
import type {
  AbilityId,
  AdaptiveAdjustment,
  AdaptiveState,
  OptionQuality,
  PpsObservation,
  PpsState,
  ResourceKey,
  SaveState
} from "./types.ts";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createDefaultPpsState(): PpsState {
  return {
    currentPps: 2.5,
    previousPps: 2.5,
    tier: "standard",
    calibrationRemaining: ADAPTIVE_CONFIG.calibrationCount,
    observations: [],
    lastUpdatedAt: 0,
    consecutiveExpert: 0,
    consecutiveRisk: 0
  };
}

export function createDefaultAdaptiveState(): AdaptiveState {
  return {
    learnerModel: createDefaultLearnerModel(),
    pps: createDefaultPpsState(),
    configVersion: 1
  };
}

export interface AdaptiveDecisionInput {
  abilityIds: AbilityId[];
  quality: OptionQuality;
  resourceDelta: Partial<Record<ResourceKey, number>>;
  decisionTimeMs?: number;
  usedHint?: boolean;
  morale?: number;
  timestamp?: number;
}

export function recordAdaptiveDecision(
  state: AdaptiveState,
  input: AdaptiveDecisionInput
): {
  state: AdaptiveState;
  tierChanged: boolean;
  reason: string | null;
} {
  const now = input.timestamp ?? Date.now();
  const learnerModel = updateLearnerModel(state.learnerModel, {
    abilityIds: input.abilityIds,
    quality: input.quality,
    timestamp: now
  });
  const pps = structuredClone(state.pps);
  const observation: PpsObservation = {
    at: now,
    quality: input.quality,
    abilityIds: input.abilityIds,
    resourceDelta: input.resourceDelta,
    decisionTimeMs: input.decisionTimeMs,
    usedHint: input.usedHint,
    morale: input.morale
  };
  pps.observations.push(observation);
  if (pps.observations.length > ADAPTIVE_CONFIG.ppsWindow) {
    pps.observations = pps.observations.slice(-ADAPTIVE_CONFIG.ppsWindow);
  }

  let adjustment = ADAPTIVE_CONFIG.qualityScore[input.quality] * 0.6 - 0.25;
  const netResource = Object.values(input.resourceDelta).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0
  );
  if (netResource <= -6) adjustment -= 0.08;
  else if (netResource >= 6) adjustment += 0.04;
  if (input.decisionTimeMs !== undefined && input.decisionTimeMs > 90_000) {
    adjustment -= 0.05;
  }
  if (input.decisionTimeMs !== undefined && input.decisionTimeMs < 12_000 && input.quality !== "expert") {
    adjustment -= 0.03;
  }
  if (input.usedHint) adjustment -= 0.04;
  if (input.morale !== undefined && input.morale < 30) adjustment -= 0.05;
  else if (input.morale !== undefined && input.morale >= 80) adjustment += 0.03;

  if (pps.currentPps < ADAPTIVE_CONFIG.comeback.ppsThreshold && adjustment < 0) {
    adjustment *= 0.5;
  }
  if (
    input.quality === "expert" &&
    pps.consecutiveExpert >= 2 &&
    pps.currentPps < ADAPTIVE_CONFIG.comeback.ppsThreshold + 0.5
  ) {
    adjustment += Math.min(
      ADAPTIVE_CONFIG.comeback.maxBonus,
      pps.consecutiveExpert * ADAPTIVE_CONFIG.comeback.bonusPerExpertStreak
    );
  }

  pps.previousPps = pps.currentPps;
  pps.currentPps = clamp(pps.currentPps + adjustment, 0, 5);
  pps.lastUpdatedAt = now;
  pps.consecutiveExpert =
    input.quality === "expert" ? pps.consecutiveExpert + 1 : 0;
  pps.consecutiveRisk =
    input.quality === "risk" ? pps.consecutiveRisk + 1 : 0;

  const beforeTier = pps.tier;
  pps.calibrationRemaining = Math.max(0, pps.calibrationRemaining - 1);
  if (pps.calibrationRemaining > 0) {
    pps.tier = "standard";
  } else {
    pps.tier = tierForPps(pps.currentPps);
  }
  const tierChanged = beforeTier !== pps.tier;
  const reason =
    tierChanged && pps.calibrationRemaining <= 0
      ? `PPS ${pps.previousPps.toFixed(2)} -> ${pps.currentPps.toFixed(2)}，难度档从 ${beforeTier} 变为 ${pps.tier}`
      : null;

  return {
    state: {
      learnerModel,
      pps,
      configVersion: state.configVersion
    },
    tierChanged,
    reason
  };
}

export function adjustmentFor(
  pps: PpsState
): AdaptiveAdjustment {
  const tier = pps.calibrationRemaining > 0 ? "standard" : pps.tier;
  return {
    tier,
    pps: pps.currentPps,
    resourceFactor: ADAPTIVE_CONFIG.resourceFactor[tier],
    decisionWindowMs: ADAPTIVE_CONFIG.decisionWindowMs[tier],
    gateOffset: ADAPTIVE_CONFIG.gateOffset[tier],
    aiStrength: ADAPTIVE_CONFIG.aiStrength[tier],
    recoveryScale: ADAPTIVE_CONFIG.recoveryScale[tier]
  };
}

export function adjustmentForSave(
  save: SaveState
): AdaptiveAdjustment {
  const pps = save.adaptive?.pps ?? createDefaultPpsState();
  return adjustmentFor(pps);
}

export function adaptiveEconomyFactor(
  save: SaveState
): { neg: number; pos: number } {
  const pps = save.adaptive?.pps;
  if (!pps) return { neg: 1, pos: 1 };
  const adjustment = adjustmentFor(pps);
  return adjustment.resourceFactor;
}

export function normalizeAdaptiveState(raw: unknown): AdaptiveState {
  const base = createDefaultAdaptiveState();
  if (!raw || typeof raw !== "object") return base;
  const value = raw as Partial<AdaptiveState>;
  if (value.configVersion !== undefined) {
    base.configVersion = Number(value.configVersion) || 1;
  }
  if (value.learnerModel && typeof value.learnerModel === "object") {
    const model = value.learnerModel as Partial<AdaptiveState["learnerModel"]>;
    if (model.abilities && typeof model.abilities === "object") {
      for (const ability of Object.keys(model.abilities) as AbilityId[]) {
        const state = model.abilities[ability] as
          | Partial<AdaptiveState["learnerModel"]["abilities"][AbilityId]>
          | undefined;
        if (!state || typeof state !== "object") continue;
        const target = base.learnerModel.abilities[ability];
        target.attempts = Math.max(0, Number(state.attempts) || 0);
        target.expert = Math.max(0, Number(state.expert) || 0);
        target.partial = Math.max(0, Number(state.partial) || 0);
        target.risk = Math.max(0, Number(state.risk) || 0);
        target.lastAt = Number(state.lastAt) || 0;
        target.qualitySum = Number(state.qualitySum) || 0;
        target.mastery = clamp(Number(state.mastery) ?? target.mastery, 0, 1);
        target.confidence = clamp(Number(state.confidence) || 0, 0, 1);
        target.bktMastery = clamp(Number(state.bktMastery) ?? target.bktMastery, 0, 1);
      }
    }
    base.learnerModel.updatedAt = Number(model.updatedAt) || 0;
  }
  if (value.pps && typeof value.pps === "object") {
    const pps = value.pps as Partial<PpsState>;
    base.pps.currentPps = clamp(Number(pps.currentPps) ?? base.pps.currentPps, 0, 5);
    base.pps.previousPps = clamp(Number(pps.previousPps) ?? base.pps.previousPps, 0, 5);
    base.pps.tier =
      pps.tier === "recovery" || pps.tier === "stretch"
        ? pps.tier
        : "standard";
    base.pps.calibrationRemaining = Math.max(
      0,
      Number(pps.calibrationRemaining) || 0
    );
    base.pps.lastUpdatedAt = Number(pps.lastUpdatedAt) || 0;
    base.pps.consecutiveExpert = Math.max(0, Number(pps.consecutiveExpert) || 0);
    base.pps.consecutiveRisk = Math.max(0, Number(pps.consecutiveRisk) || 0);
    if (Array.isArray(pps.observations)) {
      base.pps.observations = pps.observations
        .filter(
          (item): item is PpsObservation =>
            Boolean(item && typeof item === "object" && "quality" in item)
        )
        .slice(-ADAPTIVE_CONFIG.ppsWindow);
    }
  }
  return base;
}
