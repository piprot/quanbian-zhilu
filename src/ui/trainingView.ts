import { ABILITIES, abilityLevel } from "../core/abilities";
import { uiString, type Language } from "../core/i18n";
import { EXPANDED_TRAINING } from "../core/trainingExtras";
import {
  EXPANDED_TRAINING_EN,
  type ExpandedAbilityTrainingEn
} from "../core/trainingExtrasEn";
import type { AbilityId, SaveState } from "../core/types";
import { abilityDisplay, roleDisplay } from "./display";
import { escapeHtml } from "./escape";

export interface TrainingResult {
  correct: number;
  total: number;
  gainedExp: number;
  firstComplete: boolean;
  answered: boolean[];
}

export interface TrainingViewState {
  abilityId: AbilityId;
  stage: "story" | "quiz" | "result";
  step: number;
  answers: number[];
  result: TrainingResult | undefined;
}

function masteryLabel(
  language: Language,
  correct: number,
  total: number
): string {
  if (correct === total) return uiString(language, "trainingMastered");
  if (correct >= Math.ceil(total / 2)) return uiString(language, "trainingBasic");
  return uiString(language, "trainingReviewNeeded");
}

export function trainingView(
  save: SaveState,
  language: Language,
  state: TrainingViewState
): string {
  const path = EXPANDED_TRAINING[state.abilityId];
  const view: ExpandedAbilityTrainingEn =
    language === "en" ? EXPANDED_TRAINING_EN[state.abilityId] : path;
  const en = language === "en";
  const ability = abilityDisplay(language, state.abilityId);
  const exp = save.profile.abilities[state.abilityId];
  const done = save.completedTraining.includes(state.abilityId);
  const best = save.trainingScores[state.abilityId] ?? 0;
  const role = save.profile.role;

  if (state.stage === "quiz") {
    const question = view.questions[state.step];
    const selected = state.answers[state.step];
    const answered = selected >= 0;
    const isCorrect = answered && selected === question.answer;
    const last = state.step === view.questions.length - 1;
    return `
      <header class="topbar">
        <div class="brand">${uiString(language, "brand")}</div>
        <button class="link" data-action="training-back">${en ? "Back" : "返回"}</button>
      </header>
      <main class="training-shell training-quiz-shell" aria-label="${uiString(language, "trainingQuiz")}">
        <section class="training-quiz-head">
          <div>
            <p class="eyebrow">${uiString(language, "trainingQuiz")}</p>
            <h1>${ability.name} · ${escapeHtml(view.routeTitle)}</h1>
          </div>
          <strong>${state.step + 1} / ${view.questions.length}</strong>
        </section>
        <div class="assessment-bar"><i style="width:${((state.step + 1) / view.questions.length) * 100}%"></i></div>
        <section class="training-question">
          <h2>${escapeHtml(question.prompt)}</h2>
          <div class="training-options">
            ${question.options
              .map(
                (option, index) => `
                  <button class="training-option ${
                    selected === index ? "selected" : ""
                  } ${answered && index === question.answer ? "correct" : ""} ${
                    answered && selected === index && index !== question.answer ? "wrong" : ""
                  }" data-action="training-option" data-option="${index}">
                    ${escapeHtml(option.label)}
                  </button>
                `
              )
              .join("")}
          </div>
          ${
            answered
              ? `
                <div class="training-instant ${isCorrect ? "correct" : "wrong"}">
                  <strong>${isCorrect ? (en ? "Correct!" : "答对了！") : (en ? "Not quite — see the correct approach" : "再想想 —— 看看正确做法")}</strong>
                  <p><strong>${en ? "Correct approach: " : "正确做法："}</strong>${escapeHtml(question.options[question.answer].label)}</p>
                  <p>${escapeHtml(question.options[question.answer].feedback)}</p>
                </div>
              `
              : ""
          }
          <div class="training-actions">
            <button data-action="training-prev" ${state.step === 0 ? "disabled" : ""}>${uiString(language, "trainingPrev")}</button>
            ${
              last
                ? `<button class="primary" data-action="training-submit">${uiString(language, "trainingSubmit")}</button>`
                : `<button class="primary" data-action="training-next">${uiString(language, "trainingNext")}</button>`
            }
          </div>
        </section>
      </main>
    `;
  }

  if (state.stage === "result" && state.result) {
    const result = state.result;
    const label = masteryLabel(language, result.correct, result.total);
    return `
      <header class="topbar">
        <div class="brand">${uiString(language, "brand")}</div>
        <button class="link" data-action="training-back">${en ? "Back" : "返回"}</button>
      </header>
      <main class="training-result-shell" aria-label="${uiString(language, "trainingResult")}">
        <section class="training-result-hero">
          <p class="eyebrow">${uiString(language, "trainingResult")}</p>
          <h1>${result.correct} / ${result.total}</h1>
          <div class="training-mastery-badge">${uiString(language, "trainingMastery")} · ${label}</div>
          <p class="muted">${uiString(language, "trainingCorrect")} ${ability.name}</p>
          <div class="training-reward">
            <span>${uiString(language, "trainingReward")}</span>
            <strong>+${result.gainedExp} ${ability.name}</strong>
            <small>${result.firstComplete ? (en ? "First completion reward" : "首次完成奖励") : (en ? "Review only; reward already claimed" : "复训仅复盘，奖励已领取")}</small>
          </div>
        </section>
        <section class="training-review">
          <h2>${uiString(language, "trainingReview")}</h2>
          ${view.questions
            .map(
              (question, index) => `
                <div class="training-review-card ${result.answered[index] ? "correct" : "wrong"}">
                  <span>${result.answered[index] ? "✓" : "×"}</span>
                  <div>
                    <h3>${escapeHtml(question.prompt)}</h3>
                    <p><strong>${en ? "Your answer: " : "你的选择："}</strong>${escapeHtml(state.answers[index] >= 0 ? question.options[state.answers[index]].label : (en ? "Not answered" : "未作答"))}</p>
                    <p><strong>${en ? "Correct: " : "正确做法："}</strong>${escapeHtml(question.options[question.answer].label)}</p>
                    <div class="training-solution">
                      <strong>${uiString(language, "trainingSolved")}</strong>
                      <ol>
                        ${question.solutionSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
                      </ol>
                    </div>
                    <p class="reference-answer"><strong>${uiString(language, "trainingReference")}</strong>${escapeHtml(question.referenceAnswer)}</p>
                    <em>${escapeHtml(question.options[question.answer].feedback)}</em>
                  </div>
                </div>
              `
            )
            .join("")}
        </section>
        <div class="training-result-actions">
          <button data-action="training-restart">${en ? "Review the Lesson" : "重新学习"}</button>
          <button class="primary" data-action="open-ability">${en ? "Ability Map" : "能力图谱"}</button>
        </div>
      </main>
    `;
  }

  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="training-back">${en ? "Back" : "返回"}</button>
      <button class="link" data-action="open-ability">${en ? "Ability Map" : "能力图谱"}</button>
    </header>
    <main class="training-shell" aria-label="${uiString(language, "trainingTitle")}">
      <section class="training-hero">
        <div>
          <p class="eyebrow">${uiString(language, "trainingTitle")}</p>
          <h1>${escapeHtml(view.routeTitle)}</h1>
          <p class="muted">${escapeHtml(view.routeSummary)}</p>
          <div class="training-ability-tag" style="--dot:${ABILITIES[state.abilityId].color}">
            <strong>${ability.name} · Lv.${abilityLevel(exp)}</strong>
            <span>${done ? uiString(language, "trainingCompleted") : `${uiString(language, "trainingBest")} ${best} / ${view.questions.length}`}</span>
          </div>
        </div>
        <canvas class="training-board" id="training-board"></canvas>
      </section>
      <section class="training-flow">
        <div class="training-panel">
          <h2>${uiString(language, "trainingProblem")}</h2>
          <p>${escapeHtml(view.problemPrompt)}</p>
        </div>
        <div class="training-panel">
          <h2>${uiString(language, "trainingAnalogy")}</h2>
          <p>${escapeHtml(view.analogy)}</p>
        </div>
      </section>
      <section class="training-columns">
        <div class="training-panel training-route-panel">
          <h2>${uiString(language, "trainingBreakdown")}</h2>
          <ol class="training-route">
            ${view.route.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
          </ol>
        </div>
        <div class="training-panel">
          <h2>${uiString(language, "trainingApplication")}</h2>
          <ul class="training-points">
            ${view.applicationPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
          </ul>
        </div>
        <div class="training-panel training-formula-panel">
          <h2>${uiString(language, "trainingFormula")}</h2>
          <h3>${escapeHtml(view.formula.name)}</h3>
          <code>${escapeHtml(view.formula.expression)}</code>
          <p>${escapeHtml(view.formula.explanation)}</p>
        </div>
      </section>
      <section class="training-panel role-application-panel">
        <h2>${uiString(language, "trainingRoleApply")} · ${roleDisplay(language, role).name}</h2>
        <div class="role-apply-grid role-single">
          <div class="role-apply-card active">
            <strong>${roleDisplay(language, role).name}</strong>
            <p>${escapeHtml(view.roleApplications[role])}</p>
          </div>
        </div>
        <p class="role-split-note">${en ? "This lesson is scoped to your current role. Other-role strategies are not mixed in." : "当前训练只针对你的角色，不混入其他角色策略。"}</p>
      </section>
      <section class="training-panel worked-examples-panel">
        <h2>${uiString(language, "trainingExamples")}</h2>
        <div class="worked-examples">
          ${view.workedExamples
            .map(
              (example) => `
                <article>
                  <h3>${escapeHtml(example.title)}</h3>
                  <p>${escapeHtml(example.scenario)}</p>
                  <p class="application">${escapeHtml(example.application)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
      <section class="training-panel training-story-panel">
        <div class="story-meta">
          <h2>${uiString(language, "trainingStory")}</h2>
          <span>${escapeHtml(view.story.source)}</span>
        </div>
        <h3>${escapeHtml(view.story.title)}</h3>
        <p>${escapeHtml(view.story.scenario)}</p>
        <blockquote>${escapeHtml(view.story.lesson)}</blockquote>
        <section class="training-teach">
          <div>
            <h3>${uiString(language, "trainingFormula")}</h3>
            <code>${escapeHtml(view.formula.expression)}</code>
            <p class="muted">${escapeHtml(view.formula.explanation)}</p>
          </div>
          <div>
            <h3>${uiString(language, "trainingApplication")}</h3>
            <ul>
              ${view.applicationPoints
                .map((point) => `<li>${escapeHtml(point)}</li>`)
                .join("")}
            </ul>
          </div>
          <div>
            <h3>${uiString(language, "trainingExamples")}</h3>
            ${
              view.workedExamples[0]
                ? `
                  <p>${escapeHtml(view.workedExamples[0].scenario)}</p>
                  <p class="muted">${escapeHtml(view.workedExamples[0].application)}</p>
                `
                : ""
            }
          </div>
        </section>
        <section class="training-panel training-role-panel">
          <h2>${uiString(language, "trainingRoleApply")} · ${roleDisplay(language, save.profile.role).name}</h2>
          <p>${escapeHtml(view.roleApplications[save.profile.role])}</p>
        </section>
        <button class="primary" data-action="training-start-quiz">${uiString(language, "trainingStartQuiz")}</button>
      </section>
    </main>
  `;
}
