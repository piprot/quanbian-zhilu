import { masterySummary } from "./learner-model.ts";
import type {
  AbilityId,
  SaveState
} from "./types.ts";

export interface AdaptiveMetricsSummary {
  totalDecisions: number;
  expertRate: number;
  partialRate: number;
  riskRate: number;
  flowZoneRatio: number;
  demonstratedCount: number;
  averageDecisionTimeMs: number;
  pps: number;
  tier: string;
  reviewDue: number;
  retentionD7: boolean;
}

export function flowZoneRatio(save: SaveState): number {
  const history = save.decisionHistory;
  if (history.length === 0) return 0;
  const flow = history.filter(
    (record) =>
      record.qualityScore >= 40 &&
      record.qualityScore <= 85
  ).length;
  return flow / history.length;
}

export function demonstratedAbilities(save: SaveState): AbilityId[] {
  const model = save.adaptive?.learnerModel;
  if (!model) return [];
  return (Object.keys(model.abilities) as AbilityId[]).filter((ability) => {
    const stage = masterySummary(model, ability).stage;
    return stage === "demonstrated" || stage === "transferred";
  });
}

export function adaptiveMetricsSummary(
  save: SaveState,
  now = Date.now()
): AdaptiveMetricsSummary {
  const history = save.decisionHistory;
  const expert = history.filter(
    (record) => record.quality === "expert"
  ).length;
  const partial = history.filter(
    (record) => record.quality === "partial"
  ).length;
  const risk = history.filter(
    (record) => record.quality === "risk"
  ).length;
  const total = Math.max(1, history.length);
  const pps = save.adaptive?.pps.currentPps ?? 2.5;
  const ppsObservations = save.adaptive?.pps.observations ?? [];
  const timed = ppsObservations.filter(
    (observation) => typeof observation.decisionTimeMs === "number"
  );
  const averageDecisionTimeMs = timed.length
    ? timed.reduce(
        (sum, observation) => sum + (observation.decisionTimeMs ?? 0),
        0
      ) / timed.length
    : 0;
  const reviewDue = (save.fsrsCards ?? []).filter(
    (card) => card.dueAt <= now
  ).length;
  return {
    totalDecisions: history.length,
    expertRate: expert / total,
    partialRate: partial / total,
    riskRate: risk / total,
    flowZoneRatio: flowZoneRatio(save),
    demonstratedCount: demonstratedAbilities(save).length,
    averageDecisionTimeMs,
    pps,
    tier: save.adaptive?.pps.tier ?? "standard",
    reviewDue,
    retentionD7: false
  };
}
