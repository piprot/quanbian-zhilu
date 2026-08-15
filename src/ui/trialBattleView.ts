import {
  trialCostFor,
  trialQuestionFor,
  trialStageLabel,
  type TrialStageDef
} from "../core/trials";
import {
  LEADERSHIP_DIMENSIONS,
  dimensionLevel
} from "../core/leadership-model";
import type { TrialAnswerOutcome } from "../core/game";
import { uiString, type Language } from "../core/i18n";
import type { SaveState } from "../core/types";
import { abilityDisplay } from "./display";
import { escapeAttr, escapeHtml } from "./escape";

export interface TrialBattleState {
  result: TrialAnswerOutcome | undefined;
  observeRevealed: boolean;
  allyChoice: string | undefined;
  allyCorrect: boolean | undefined;
  suspectChoice: string | undefined;
  suspectCorrect: boolean | undefined;
  intelChoice: string | undefined;
  intelCorrect: boolean | undefined;
  betrayalChoice: string | undefined;
  betrayalCorrect: boolean | undefined;
  factionTrust: number;
  factionSuspicion: number;
  followUpAnswer: number | undefined;
  followUpAnswered: boolean;
  summaryPending: boolean;
  summaryKeywordCorrect: boolean | undefined;
  calculationAnswer: string | undefined;
  calculationCorrect: boolean | undefined;
  lastAnswer: number | undefined;
  resultBranch: string;
  suspectImpactMarkup: string;
}

export function trialBattleView(
  save: SaveState,
  language: Language,
  stage: TrialStageDef,
  state: TrialBattleState
): string {
  const en = language === "en";
  const question = trialQuestionFor(stage);
  const result = state.result;
  const followUp = question.followUp;
  const followUpPending = Boolean(followUp) && !state.followUpAnswered;
  const referenceAnswer = followUp
    ? followUp.referenceAnswer
    : question.referenceAnswer;
  const explanation = followUp
    ? followUp.explanation
    : question.explanation;
  const wolfPending =
    stage.style === "wolf" && !state.observeRevealed;
  const suspectPending =
    stage.style === "wolf" &&
    state.observeRevealed &&
    !state.suspectChoice;
  const allyPending =
    Boolean(stage.allies?.length) && !state.allyChoice;
  const intelPending =
    Boolean(stage.intelChoices?.length) &&
    Boolean(state.allyChoice) &&
    !state.intelChoice;
  const betrayalPending =
    Boolean(stage.betrayalChoices?.length) &&
    Boolean(state.intelChoice) &&
    !state.betrayalChoice;
  const phaseReady =
    !wolfPending &&
    !suspectPending &&
    !allyPending &&
    !intelPending &&
    !betrayalPending;
  return `
      <header class="topbar">
        <div class="brand">${uiString(language, "brand")}</div>
        <button class="link" data-action="trial-next">${uiString(language, "trialNext")}</button>
      </header>
      <main class="trial-battle-shell" aria-label="${uiString(language, "trialTitle")}">
        <section class="trial-boss-panel">
          <div>
            <p class="eyebrow">${trialStageLabel(stage)}</p>
            <h1>${escapeHtml(stage.boss)}</h1>
            <p class="muted">${escapeHtml(stage.name)}</p>
          </div>
          <div class="trial-boss-stats">
            <span>${uiString(language, "trialEnergyCost")} ${trialCostFor(save, stage)}</span>
            <span>${uiString(language, "trialHp")} ${save.trialHp} / 100</span>
            <span>${stage.gates.map((gate) => `${abilityDisplay(language, gate.abilityId).name} Lv.${gate.level}`).join(" + ")}</span>
            ${stage.dimension ? `<span>${en ? LEADERSHIP_DIMENSIONS[stage.dimension].en : LEADERSHIP_DIMENSIONS[stage.dimension].zh} · ${en ? `Tier ${dimensionLevel(save.dimensionExp?.[stage.dimension] ?? 0)}` : `第 ${dimensionLevel(save.dimensionExp?.[stage.dimension] ?? 0)} 档`}</span>` : ""}
          </div>
          <div class="trial-faction-bars">
            <span>${uiString(language, "trialTrust")} ${state.factionTrust}</span>
            <span>${uiString(language, "trialSuspicion")} ${state.factionSuspicion}</span>
          </div>
        </section>
        ${
          !result && stage.scene
            ? `
              <section class="trial-scene-panel">
                <p class="eyebrow">${en ? "Scene" : "试炼场景"}</p>
                <p>${escapeHtml(stage.scene)}</p>
              </section>
            `
            : ""
        }
        ${
          result
            ? `
              <section class="trial-battle-result ${result.correct ? "win" : "lose"}">
                <h2>${result.correct ? uiString(language, "trialCorrect") : uiString(language, "trialWrong")}</h2>
                <p class="trial-branch-label">${state.resultBranch}</p>
                <p>${uiString(language, "trialEnergy")} ${result.energyChange > 0 ? "+" : ""}${result.energyChange}</p>
                ${
                  result.cleared
                    ? `<p>${uiString(language, "trialReward")}：${abilityDisplay(language, stage.source.kind === "training" ? stage.source.abilityId : stage.gates[0].abilityId).name} +${result.gainedExp}${result.item ? ` · ${escapeHtml(result.item)}` : ""}</p>`
                    : ""
                }
                ${
                  state.allyCorrect === true
                    ? `<p>${uiString(language, "trialAllyCorrect")}</p>`
                    : state.allyCorrect === false
                      ? `<p>${uiString(language, "trialAllyWrong")}</p>`
                      : ""
                }
                ${
                  state.suspectCorrect === true
                    ? `<p>${uiString(language, "trialSuspectCorrect")}</p>`
                    : state.suspectCorrect === false
                      ? `<p>${uiString(language, "trialSuspectWrong")}</p>`
                      : ""
                }
                ${
                  state.intelCorrect === true
                    ? `<p>${uiString(language, "trialIntelCorrect")}</p>`
                    : state.intelCorrect === false
                      ? `<p>${uiString(language, "trialIntelWrong")}</p>`
                      : ""
                }
                ${
                  state.betrayalCorrect === true
                    ? `<p>${uiString(language, "trialBetrayalCorrect")}</p>`
                    : state.betrayalCorrect === false
                      ? `<p>${uiString(language, "trialBetrayalWrong")}</p>`
                      : ""
                }
                ${
                  state.summaryKeywordCorrect === true
                    ? `<p>${uiString(language, "trialSummaryKeyword")}</p>`
                    : state.summaryKeywordCorrect === false
                      ? `<p>${uiString(language, "trialSummaryKeywordMiss")}</p>`
                      : ""
                }
                ${
                  state.calculationCorrect === true
                    ? `<p>${uiString(language, "trialCalculationCorrect")}</p>`
                    : state.calculationCorrect === false
                      ? `<p>${uiString(language, "trialCalculationWrong")}</p>`
                      : ""
                }
                <div class="trial-answer-review">
                  ${
                    followUp && state.followUpAnswer !== undefined
                      ? `
                        <strong>${uiString(language, "trialStageDecision")}</strong>
                        <p>${escapeHtml(followUp.options[state.followUpAnswer] ?? "")}</p>
                      `
                      : ""
                  }
                  <strong>${uiString(language, "trialAnswer")}</strong>
                  <p>${escapeHtml(question.options[state.lastAnswer ?? 0])}</p>
                  <strong>${uiString(language, "trialReference")}</strong>
                  <p>${escapeHtml(referenceAnswer)}</p>
                  <strong>${uiString(language, "trialExplanation")}</strong>
                  <p>${escapeHtml(explanation)}</p>
                </div>
                ${
                  stage.resolution
                    ? `
                      <section class="trial-resolution-panel">
                        <p class="eyebrow">${en ? "Truth Revealed" : "真相揭晓"}</p>
                        <p>${escapeHtml(stage.resolution)}</p>
                        ${state.suspectImpactMarkup}
                      </section>
                    `
                    : ""
                }
                <button class="primary" data-action="trial-next">${uiString(language, "trialNext")}</button>
              </section>
            `
            : `
              ${
                wolfPending
                  ? `
                    <section class="trial-phase-panel">
                      <p class="eyebrow">${uiString(language, "trialClue")}</p>
                      <p>${escapeHtml(stage.clue ?? "")}</p>
                      <button class="primary" data-action="trial-observe">${uiString(language, "trialObserve")}</button>
                    </section>
                  `
                  : ""
              }
              ${
                suspectPending
                  ? `
                    <section class="trial-phase-panel">
                      <p class="eyebrow">${uiString(language, "trialSuspect")}</p>
                      <div class="trial-ally-options">
                        ${(stage.suspects ?? []).map((suspect) => `<button data-action="trial-suspect" data-suspect="${escapeAttr(suspect)}">${escapeHtml(suspect)}</button>`).join("")}
                      </div>
                    </section>
                  `
                  : ""
              }
              ${
                allyPending
                  ? `
                    <section class="trial-phase-panel">
                      <p class="eyebrow">${uiString(language, "trialAlly")}</p>
                      <div class="trial-ally-options">
                        ${(stage.allies ?? []).map((ally) => `<button data-action="trial-ally" data-ally="${escapeAttr(ally)}">${escapeHtml(ally)}</button>`).join("")}
                      </div>
                    </section>
                  `
                  : ""
              }
              ${
                intelPending
                  ? `
                    <section class="trial-phase-panel">
                      <p class="eyebrow">${uiString(language, "trialIntel")}</p>
                      <div class="trial-ally-options">
                        ${(stage.intelChoices ?? []).map((intel) => `<button data-action="trial-intel" data-intel="${escapeAttr(intel)}">${escapeHtml(intel)}</button>`).join("")}
                      </div>
                    </section>
                  `
                  : ""
              }
              ${
                betrayalPending
                  ? `
                    <section class="trial-phase-panel">
                      <p class="eyebrow">${uiString(language, "trialBetrayal")}</p>
                      <div class="trial-ally-options">
                        ${(stage.betrayalChoices ?? []).map((choice) => `<button data-action="trial-betrayal" data-betrayal="${escapeAttr(choice)}">${escapeHtml(choice)}</button>`).join("")}
                      </div>
                    </section>
                  `
                  : ""
              }
              ${
                state.summaryPending
                  ? `
                    <section class="trial-summary-panel">
                      <h2>${uiString(language, "trialSummary")}</h2>
                      <p>${escapeHtml(referenceAnswer)}</p>
                      ${
                        question.calculation
                          ? `
                            <label class="field">
                              <span>${escapeHtml(question.calculation.prompt)}</span>
                              <input data-trial-calculation type="number" value="${escapeAttr(state.calculationAnswer ?? "")}" placeholder="${escapeHtml(question.calculation.unit)}" />
                            </label>
                          `
                          : ""
                      }
                      <textarea data-trial-summary rows="5" placeholder="${en ? "Write your one-page decision summary with evidence, owner, and checkpoint." : "写出你的决策摘要：依据、负责人、检查节点。"}"></textarea>
                      <button class="primary" data-action="trial-submit-summary">${uiString(language, "trialSummarySubmit")}</button>
                    </section>
                  `
                  : `
                    <section class="trial-question-panel">
                ${
                  followUpPending && followUp
                    ? `
                      <section class="trial-new-info">
                        <h3>${uiString(language, "trialNewInfo")}</h3>
                        <p>${escapeHtml(followUp.prompt)}</p>
                      </section>
                    `
                    : ""
                }
                <h2>${escapeHtml(followUpPending && followUp ? followUp.prompt : question.prompt)}</h2>
                <div class="trial-options">
                  ${(followUpPending && followUp ? followUp.options : question.options).map((option, index) => `<button class="trial-option" data-action="trial-option" data-option="${index}" ${phaseReady ? "" : "disabled"}>${escapeHtml(option)}</button>`).join("")}
                </div>
              </section>
                  `
              }
            `
        }
      </main>
    `;
}
