import {
  adjustmentForSave
} from "../core/adaptive-dda.ts";
import {
  masterySummary,
  weakestAbilitiesByMastery
} from "../core/learner-model.ts";
import { analyzeRecentDecisions } from "../core/consequence-rules.ts";
import { adaptiveFeedbackForDecision } from "../core/adaptive-feedback.ts";
import { computeCoachAlerts } from "../core/coach-alerts.ts";
import { fsrsStats } from "../core/fsrs-schedule.ts";
import { tierLabel } from "../core/adaptive-config.ts";
import type { SaveState } from "../core/types.ts";
import { abilityDisplay } from "./display.ts";

export function adaptiveCoachPanelMarkup(
  save: SaveState,
  language: "zh" | "en"
): string {
  if (!save.adaptive) return "";
  const pps = save.adaptive.pps;
  const adjustment = adjustmentForSave(save);
  const weakest = weakestAbilitiesByMastery(
    save.adaptive.learnerModel,
    3
  );
  const rows = weakest
    .map((id) => {
      const summary = masterySummary(save.adaptive!.learnerModel, id);
      const name = abilityDisplay(language, id).name;
      const stageText =
        language === "en"
          ? summary.stage === "estimated"
            ? "estimated"
            : summary.stage === "retained"
              ? "retained"
              : summary.stage === "demonstrated"
                ? "demonstrated"
                : "transferred"
          : summary.stage === "estimated"
            ? "估算中"
            : summary.stage === "retained"
              ? "已保留"
              : summary.stage === "demonstrated"
                ? "已验证"
                : "已迁移";
      return `<li><strong>${name}</strong><span>${Math.round(
        summary.state.mastery * 100
      )}% 路 ${stageText} 路 ${summary.state.attempts} 次</span></li>`;
    })
    .join("");

  const calibration =
    pps.calibrationRemaining > 0
      ? language === "en"
        ? `Calibrating: observe ${pps.calibrationRemaining} more decisions before difficulty changes.`
        : `校准中：再观察 ${pps.calibrationRemaining} 次决策后才调整难度。`
      : language === "en"
        ? `Difficulty now follows your PPS: ${adjustment.resourceFactor.neg.toFixed(
            2
          )}x resource cost, ${adjustment.decisionWindowMs / 1000}s decision window.`
        : `难度已跟随 PPS：资源损耗 ${adjustment.resourceFactor.neg.toFixed(
            2
          )}x，决策窗口 ${adjustment.decisionWindowMs / 1000} 秒。`;
  const advice = analyzeRecentDecisions(save).slice(0, 2);
  const alert = computeCoachAlerts(save)[0];
  const fsrs = fsrsStats(save.fsrsCards ?? []);
  const lastDecision = save.decisionHistory.at(-1);
  const feedback = lastDecision
    ? adaptiveFeedbackForDecision(save, lastDecision, language)
    : null;

  return `
    <section class="adaptive-coach-panel" aria-label="${
      language === "en" ? "Adaptive coach panel" : "自适应教练面板"
    }" role="region">
      <div class="adaptive-coach-head">
        <h2>${language === "en" ? "Adaptive Coach" : "自适应教练"}</h2>
        <span class="adaptive-tier">${tierLabel(pps.tier, language)} 路 PPS ${pps.currentPps.toFixed(2)}</span>
      </div>
      <div class="adaptive-coach-grid">
        <div><span>${language === "en" ? "Resource factor" : "资源系数"}</span><strong>${adjustment.resourceFactor.neg.toFixed(2)}x</strong></div>
        <div><span>${language === "en" ? "Decision window" : "决策窗口"}</span><strong>${adjustment.decisionWindowMs / 1000}s</strong></div>
        <div><span>${language === "en" ? "AI strength" : "AI 强度"}</span><strong>${adjustment.aiStrength.toFixed(2)}</strong></div>
        <div><span>${language === "en" ? "Recovery" : "恢复系数"}</span><strong>${adjustment.recoveryScale.toFixed(2)}x</strong></div>
      </div>
      <ul class="adaptive-weak-list">
        ${rows}
      </ul>
      <div class="adaptive-advice">
        ${
          alert
            ? `
              <div class="adaptive-advice-item adaptive-alert">
                <strong>${language === "en" ? alert.titleEn : alert.titleZh}</strong>
                <p>${language === "en" ? alert.bodyEn : alert.bodyZh}</p>
              </div>
            `
            : ""
        }
        ${advice
          .map(
            (item) => `
              <div class="adaptive-advice-item">
                <strong>${language === "en" ? item.labelEn : item.labelZh}</strong>
                <p>${language === "en" ? item.suggestionEn : item.suggestionZh}</p>
              </div>
            `
          )
          .join("")}
      </div>
      <p class="adaptive-reason">${
        language === "en"
          ? `Memory cards: ${fsrs.due} due, ${fsrs.forgotten} at forgetting risk.`
          : `记忆卡：${fsrs.due} 张到期，${fsrs.forgotten} 张有遗忘风险。`
      }</p>
      <p class="adaptive-reason">${calibration}</p>
      ${
        feedback
          ? `<p class="adaptive-reason adaptive-feedback-line"><strong>${
              language === "en" ? "Coach" : "教练"
            }：</strong>${feedback.nextAction}</p>`
          : ""
      }
    </section>
  `;
}
