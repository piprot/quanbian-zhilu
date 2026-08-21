import { ABILITIES } from "./abilities.ts";
import { masterySummary } from "./learner-model.ts";
import type {
  AbilityId,
  DecisionRecord,
  SaveState
} from "./types.ts";

export interface AdaptiveFeedback {
  evidence: string;
  strengths: string[];
  gaps: string[];
  nextAction: string;
}

function abilityName(id: AbilityId, language: "zh" | "en"): string {
  return language === "en" ? ABILITIES[id].name : ABILITIES[id].name;
}

export function adaptiveFeedbackForDecision(
  save: SaveState,
  record: DecisionRecord,
  language: "zh" | "en"
): AdaptiveFeedback {
  const abilityIds = Object.keys(
    record.delta?.abilities ?? {}
  ) as AbilityId[];
  const quality = record.quality;
  const model = save.adaptive?.learnerModel;
  const strengths: string[] = [];
  const gaps: string[] = [];
  for (const ability of abilityIds) {
    const summary = model ? masterySummary(model, ability) : null;
    const name = abilityName(ability, language);
    if (quality === "expert") {
      strengths.push(
        language === "en"
          ? `${name} shows diagnostic strength`
          : `${name} 展现出诊断型优势`
      );
    } else if (quality === "risk") {
      gaps.push(
        language === "en"
          ? `${name} relies on authority instead of evidence`
          : `${name} 依赖权威而非证据`
      );
    } else {
      gaps.push(
        language === "en"
          ? `${name} solved the symptom but kept ownership`
          : `${name} 解决了症状，但责任仍留在自己手里`
      );
    }
    if (summary && summary.state.attempts > 0) {
      gaps.push(
        language === "en"
          ? `${name} evidence: ${summary.state.attempts} attempts, mastery ${Math.round(
              summary.state.mastery * 100
            )}%`
          : `${name} 证据：${summary.state.attempts} 次，掌握度 ${Math.round(
              summary.state.mastery * 100
            )}%`
      );
    }
  }
  const nextAction =
    language === "en"
      ? quality === "risk"
        ? "Next: turn one pressure signal into a small verifiable test before choosing an action."
        : quality === "partial"
          ? "Next: hand the problem back with a check node instead of carrying it alone."
          : "Next: take one of your weakest abilities into a deliberate challenge."
      : quality === "risk"
        ? "下一步：把一个压力信号转成可验证的小测试，再决定动作。"
        : quality === "partial"
          ? "下一步：把问题连同检查节点一起交回团队，而不是独自承担。"
          : "下一步：把一个最弱能力放进刻意挑战。";
  const evidence =
    language === "en"
      ? `Decision ${quality} with ${abilityIds.length || 0} affected abilities.`
      : `本次为「${quality}」决策，影响 ${abilityIds.length || 0} 项能力。`;
  return { evidence, strengths, gaps, nextAction };
}

