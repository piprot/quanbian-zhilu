import { masterySummary } from "./learner-model.ts";
import { adjustmentForSave } from "./adaptive-dda.ts";
import type {
  AbilityId,
  SaveState
} from "./types.ts";

export type ConsequenceType =
  | "risk_spiral"
  | "mastery_momentum"
  | "energy_low"
  | "morale_low"
  | "mastery_ready";

export interface ConsequenceAdvice {
  type: ConsequenceType;
  severity: "low" | "medium" | "high";
  labelZh: string;
  labelEn: string;
  suggestionZh: string;
  suggestionEn: string;
}

export function analyzeRecentDecisions(
  save: SaveState
): ConsequenceAdvice[] {
  const advice: ConsequenceAdvice[] = [];
  const recent = save.decisionHistory.slice(-6);
  const riskCount = recent.filter(
    (record) => record.quality === "risk"
  ).length;
  const expertCount = recent.filter(
    (record) => record.quality === "expert"
  ).length;
  const energy = save.profile.resources.energy;
  const morale = save.morale ?? 75;

  if (riskCount >= 2 && recent.length >= 3) {
    advice.push({
      type: "risk_spiral",
      severity: riskCount >= 3 ? "high" : "medium",
      labelZh: "风险型选择连续出现",
      labelEn: "Repeated high-risk choices",
      suggestionZh:
        "连续依赖权威或高风险动作后，信任正在承压。下一次先给出可验证的诊断，再行动。",
      suggestionEn:
        "Trust is under pressure after repeated authority-first moves. Diagnose with a verifiable step before acting next.",
      ...{}
    });
  }
  if (expertCount >= 3 && recent.length >= 4) {
    advice.push({
      type: "mastery_momentum",
      severity: "low",
      labelZh: "专家决策连续",
      labelEn: "Expert streak",
      suggestionZh:
        "当前处在流畅状态。可以主动挑战一个弱项情境，把优势转化为迁移。",
      suggestionEn:
        "You are in flow. Take a weak-spot scenario and turn the momentum into transfer.",
      ...{}
    });
  }
  if (energy < 25) {
    advice.push({
      type: "energy_low",
      severity: "high",
      labelZh: "精力过低",
      labelEn: "Energy is low",
      suggestionZh:
        "精力低于 25，先安排恢复型情境或日常休息，不要连续做高压决策。",
      suggestionEn:
        "Energy is below 25. Take a recovery scenario or daily rest before more high-pressure decisions.",
      ...{}
    });
  }
  if (morale < 35) {
    advice.push({
      type: "morale_low",
      severity: "high",
      labelZh: "士气过低",
      labelEn: "Morale is low",
      suggestionZh:
        "士气低于 35，下一个情境应优先修复关系与共识，而不是继续加码。",
      suggestionEn:
        "Morale is below 35. Prioritize relationship and consensus repair over escalation.",
      ...{}
    });
  }
  const model = save.adaptive?.learnerModel;
  if (model) {
    const ready: AbilityId[] = [];
    for (const ability of Object.keys(model.abilities) as AbilityId[]) {
      const summary = masterySummary(model, ability);
      if (
        summary.stage === "demonstrated" ||
        summary.stage === "transferred"
      ) {
        ready.push(ability);
      }
    }
    if (ready.length >= 2) {
      advice.push({
        type: "mastery_ready",
        severity: "medium",
        labelZh: "掌握度就绪",
        labelEn: "Mastery ready",
        suggestionZh: `「${ready.slice(0, 2).join("、")}」已积累足够证据，可以进入掌握度挑战。`,
        suggestionEn: `"${ready
          .slice(0, 2)
          .join(", ")}" has enough evidence for a mastery challenge.`,
        ...{}
      });
    }
  }
  const tier = adjustmentForSave(save).tier;
  if (advice.length === 0) {
    advice.push({
      type: "mastery_momentum",
      severity: "low",
      labelZh: "节奏稳定",
      labelEn: "Stable rhythm",
      suggestionZh:
        tier === "stretch"
          ? "当前处于拉伸档，保持当前压力并继续练弱项。"
          : tier === "recovery"
            ? "当前处于恢复档，用低压力情境重建信心。"
            : "当前处于标准档，保持真实两难节奏。",
      suggestionEn:
        tier === "stretch"
          ? "You are in stretch mode; keep pressure and train the weak spot."
          : tier === "recovery"
            ? "You are in recovery mode; rebuild confidence with lower pressure."
            : "You are in standard mode; keep the real trade-off rhythm.",
      ...{}
    });
  }
  return advice;
}

