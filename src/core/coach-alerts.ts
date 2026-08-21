import { dueFsrsCards, fsrsStats } from "./fsrs-schedule.ts";
import {
  masterySummary,
  weakestAbilitiesByMastery
} from "./learner-model.ts";
import { dueReviewCards } from "./review-schedule.ts";
import type {
  AbilityId,
  SaveState
} from "./types.ts";

export type CoachAlertType =
  | "forgetting"
  | "plateau"
  | "overload"
  | "mastery_ready"
  | "dependency_increasing"
  | "affect_negative";

export interface CoachAlert {
  type: CoachAlertType;
  severity: "low" | "medium" | "high";
  titleZh: string;
  titleEn: string;
  bodyZh: string;
  bodyEn: string;
  evidence: string;
}

export function computeCoachAlerts(
  save: SaveState,
  now = Date.now()
): CoachAlert[] {
  const alerts: CoachAlert[] = [];
  const fsrs = fsrsStats(save.fsrsCards ?? [], now);
  const dueFsrs = dueFsrsCards(save.fsrsCards ?? [], now);
  const dueReview = dueReviewCards(save.reviewCards ?? [], now);

  if (fsrs.forgotten > 0 || dueFsrs.some((card) => card.retrievability < 0.6)) {
    alerts.push({
      type: "forgetting",
      severity: fsrs.forgotten >= 3 ? "high" : "medium",
      titleZh: "遗忘预警",
      titleEn: "Forgetting risk",
      bodyZh: `有 ${fsrs.forgotten} 张记忆卡的可提取性低于 0.6，建议先回练再开新情境。`,
      bodyEn: `${fsrs.forgotten} cards have retrievability below 0.6; review before new scenarios.`,
      evidence: `due=${fsrs.due}, forgotten=${fsrs.forgotten}`
    });
  }
  if (dueReview.length > 0) {
    alerts.push({
      type: "forgetting",
      severity: "low",
      titleZh: "到期复盘",
      titleEn: "Review due",
      bodyZh: `${dueReview.length} 个未选专家项的决策已到期，建议进入回练。`,
      bodyEn: `${dueReview.length} missed decisions are due for review.`,
      evidence: `dueReview=${dueReview.length}`
    });
  }

  const model = save.adaptive?.learnerModel;
  if (model) {
    const weakest = weakestAbilitiesByMastery(model, 5);
    for (const ability of weakest) {
      const summary = masterySummary(model, ability);
      if (
        summary.state.attempts >= 8 &&
        summary.state.mastery >= 0.4 &&
        summary.state.mastery < 0.72
      ) {
        alerts.push({
          type: "plateau",
          severity: "medium",
          titleZh: "能力平台期",
          titleEn: "Ability plateau",
          bodyZh: `「${ability}」已尝试 ${summary.state.attempts} 次，掌握度停在 ${Math.round(
            summary.state.mastery * 100
          )}%，需要换一种情境类型打破平台。`,
          bodyEn: `"${ability}" has ${summary.state.attempts} attempts and mastery ${Math.round(
            summary.state.mastery * 100
          )}%; switch scenario type to break the plateau.`,
          evidence: `attempts=${summary.state.attempts}, mastery=${summary.state.mastery.toFixed(2)}`
        });
        break;
      }
    }
    const ready = (
      Object.keys(model.abilities) as AbilityId[]
    ).filter((ability) => {
      const stage = masterySummary(model, ability).stage;
      return stage === "demonstrated" || stage === "transferred";
    });
    if (ready.length >= 2) {
      alerts.push({
        type: "mastery_ready",
        severity: "medium",
        titleZh: "掌握度挑战就绪",
        titleEn: "Mastery challenge ready",
        bodyZh: `「${ready
          .slice(0, 2)
          .join("、")}」证据充足，可以进入掌握度挑战。`,
        bodyEn: `"${ready
          .slice(0, 2)
          .join(", ")}" has enough evidence for a mastery challenge.`,
        evidence: `ready=${ready.length}`
      });
    }
  }

  const energy = save.profile.resources.energy;
  const recent = save.decisionHistory.slice(-5);
  const riskCount = recent.filter(
    (record) => record.quality === "risk"
  ).length;
  const partialCount = recent.filter(
    (record) => record.quality === "partial"
  ).length;
  const morale = save.morale ?? 75;
  if (energy < 30 && riskCount >= 2) {
    alerts.push({
      type: "overload",
      severity: "high",
      titleZh: "高压过载",
      titleEn: "Pressure overload",
      bodyZh: `精力 ${energy} 且最近风险选择偏多，建议降一档压力并安排恢复。`,
      bodyEn: `Energy ${energy} with repeated risk choices; lower pressure and recover.`,
      evidence: `energy=${energy}, risk=${riskCount}`
    });
  }
  if (morale < 35) {
    alerts.push({
      type: "affect_negative",
      severity: "high",
      titleZh: "士气低",
      titleEn: "Low morale",
      bodyZh: `士气 ${morale}，优先修复关系与共识。`,
      bodyEn: `Morale ${morale}; prioritize relationship and consensus repair.`,
      evidence: `morale=${morale}`
    });
  }
  if (recent.length >= 4 && partialCount / recent.length >= 0.5) {
    alerts.push({
      type: "dependency_increasing",
      severity: "medium",
      titleZh: "责任滞留",
      titleEn: "Ownership stuck",
      bodyZh: "部分有效决策占比过高，说明你在解决症状但把责任留在自己手里。",
      bodyEn:
        "Partial decisions are high; you solve symptoms but keep ownership yourself.",
      evidence: `partial=${partialCount}/${recent.length}`
    });
  }
  return alerts.slice(0, 3);
}

