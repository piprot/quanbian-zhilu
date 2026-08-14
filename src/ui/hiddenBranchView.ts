import { EXPANDED_TRAINING } from "../core/trainingExtras";
import { EXPANDED_TRAINING_EN } from "../core/trainingExtrasEn";
import { hiddenRouteSteps } from "../core/hiddenRoutes";
import { uiString, type Language } from "../core/i18n";
import type { AbilityId, SaveState } from "../core/types";
import { abilityDisplay } from "./display";
import { escapeHtml } from "./escape";

export interface HiddenBranchViewState {
  abilityId: AbilityId;
  step: number;
  lastCorrect: boolean | undefined;
}

export function hiddenBranchView(
  save: SaveState,
  language: Language,
  state: HiddenBranchViewState
): string {
  const abilityId = state.abilityId;
  const view =
    language === "en"
      ? EXPANDED_TRAINING_EN[abilityId]
      : EXPANDED_TRAINING[abilityId];
  const en = language === "en";
  const steps = hiddenRouteSteps(abilityId);
  const completed = save.hiddenRoutes.includes(`hidden-${abilityId}`);
  const stepIndex = Math.min(state.step, Math.max(0, steps.length - 1));
  const currentStep = steps[stepIndex];
  const answered = state.lastCorrect !== undefined;
  return `
      <header class="topbar">
        <div class="brand">${uiString(language, "brand")}</div>
        <button class="link" data-action="open-map">${uiString(language, "hiddenBranchBack")}</button>
      </header>
      <main class="hidden-branch-shell" aria-label="${uiString(language, "hiddenBranchTitle")}">
        <section class="hidden-branch-hero">
          <p class="eyebrow">${uiString(language, "hiddenBranchTitle")}</p>
          <h1>${abilityDisplay(language, abilityId).name} · ${escapeHtml(view.routeTitle)}</h1>
          <p class="muted">${escapeHtml(view.routeSummary)}</p>
          <p class="hidden-route-progress">${stepIndex + 1} / ${steps.length}</p>
        </section>
        ${
          completed
            ? `
              <section class="hidden-branch-grid">
                <div>
                  <h2>${uiString(language, "trainingFormula")}</h2>
                  <code>${escapeHtml(view.formula.expression)}</code>
                  <p>${escapeHtml(view.formula.explanation)}</p>
                </div>
                <div>
                  <h2>${uiString(language, "trainingApplication")}</h2>
                  <ul>${view.applicationPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
                </div>
                <div>
                  <h2>${uiString(language, "trainingExamples")}</h2>
                  <p>${escapeHtml(view.workedExamples[0]?.scenario ?? "")}</p>
                  <p class="muted">${escapeHtml(view.workedExamples[0]?.application ?? "")}</p>
                </div>
              </section>
              <p class="muted">${en ? "Hidden route completed and written into your ending." : "隐藏章节已完成，并已写入结局。"}</p>
              <button class="primary" data-action="continue-hidden-exit">${en ? "Back to Outcome" : "返回本次结算"}</button>
            `
            : answered
              ? `
                <section class="hidden-route-feedback">
                  <h2>${state.lastCorrect ? (en ? "Correct" : "判断正确") : (en ? "Not quite" : "判断有偏差")}</h2>
                  <p>${escapeHtml(currentStep.explanation)}</p>
                  <p class="muted">${en ? "Reference: " : "参考答案："}${escapeHtml(currentStep.referenceAnswer)}</p>
                  <button class="primary" data-action="hidden-next">${state.lastCorrect ? (en ? "Next Step" : "下一节点") : (en ? "Try Again" : "重试本题")}</button>
                </section>
              `
              : `
                <section class="hidden-route-question">
                  <h2>${escapeHtml(currentStep.prompt)}</h2>
                  <div class="hidden-route-options">
                    ${currentStep.options.map((option, index) => `<button data-action="hidden-option" data-option="${index}">${escapeHtml(option)}</button>`).join("")}
                  </div>
                </section>
              `
        }
      </main>
    `;
}
