import {
  ASSESSMENT_QUESTIONS,
  certificationLevel
} from "../core/assessment";
import { profileSummary } from "../core/game";
import { recommendedTraining } from "../core/duel";
import {
  ABILITIES,
  ABILITY_ORDER,
  ROLES,
  abilityLevel
} from "../core/abilities";
import { ROLE_EN } from "../core/translations";
import { uiString, type Language } from "../core/i18n";
import type { PlayerProfile, SaveState } from "../core/types";
import {
  abilityDisplay,
  assessmentDisplay,
  rankName,
  roleDisplay
} from "./display";
import { escapeHtml } from "./escape";

export interface AssessmentViewState {
  assessmentStep: number;
  selected: number | undefined;
  muted: boolean;
}

export function assessmentView(
  profile: PlayerProfile,
  language: Language,
  state: AssessmentViewState
): string {
  const question = ASSESSMENT_QUESTIONS[state.assessmentStep];
  const questionView = assessmentDisplay(language, question);
  const en = language === "en";
  return `
      <header class="topbar">
        <div class="brand">${uiString(language, "brand")}</div>
        <button class="link" data-action="open-profile">${en ? "Back to Profile" : "返回建档"}</button>
        <button class="link sound-toggle" data-action="toggle-sound" aria-label="${language === "en" ? "Toggle sound" : "切换声音"}">${state.muted ? uiString(language, "soundOff") : uiString(language, "soundOn")}</button>
      </header>
      <main class="assessment-shell" aria-label="${language === "en" ? "Ability assessment" : "能力测评"}">
        <section class="assessment-panel">
          <div class="assessment-progress">
            <span>${en ? "Ability Baseline Assessment" : "能力基线测评"}</span>
            <small>${state.assessmentStep + 1} / ${ASSESSMENT_QUESTIONS.length}</small>
          </div>
          <div class="assessment-bar"><i style="width:${((state.assessmentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100}%"></i></div>
          ${
            state.assessmentStep === 0
              ? `
                <div class="assessment-intro">
                  <p>${uiString(language, "assessmentOptional")}</p>
                </div>
              `
              : ""
          }
          <h1>${escapeHtml(questionView.prompt)}</h1>
          <p class="muted">${abilityDisplay(language, question.abilityId).name} · ${abilityDisplay(language, question.abilityId).tagline}</p>
          <div class="assessment-art">
            <canvas id="assessment-art" aria-label="${en ? "Ability baseline chart" : "能力基线图"}"></canvas>
          </div>
          <div class="assessment-options">
            ${questionView.options
              .map(
                (option, index) => `
                  <button class="assessment-option ${state.selected === index ? "selected" : ""}" data-action="assessment-option" data-option="${index}">
                    ${escapeHtml(option.label)}
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="assessment-actions">
            <button data-action="assessment-prev" ${state.assessmentStep === 0 ? "disabled" : ""}>${en ? "Previous" : "上一题"}</button>
            ${
              state.assessmentStep === ASSESSMENT_QUESTIONS.length - 1
                ? `<button class="primary" data-action="assessment-submit">${en ? "Generate Profile" : "生成能力档案"}</button>`
                : `<button class="primary" data-action="assessment-next">${en ? "Next" : "下一题"}</button>`
            }
            <button class="link" data-action="assessment-skip">${uiString(language, "assessmentTryFirst")}</button>
          </div>
        </section>
      </main>
    `;
}

export function assessmentResultView(
  save: SaveState,
  language: Language,
  muted: boolean
): string {
  const summary = profileSummary(save);
  const cert = certificationLevel(save);
  const training = recommendedTraining(
    save.profile.abilities,
    save.profile.role,
    save.decisionHistory,
    save.trainingScores
  );
  const strengths = ABILITY_ORDER.slice()
    .sort(
      (a, b) =>
        abilityLevel(save.profile.abilities[b]) -
        abilityLevel(save.profile.abilities[a])
    )
    .slice(0, 3);
  const en = language === "en";
  return `
      <header class="topbar">
        <div class="brand">${uiString(language, "brand")}</div>
        <button class="link sound-toggle" data-action="toggle-sound" aria-label="${language === "en" ? "Toggle sound" : "切换声音"}">${muted ? uiString(language, "soundOff") : uiString(language, "soundOn")}</button>
      </header>
      <main class="assessment-result-shell" aria-label="${language === "en" ? "Assessment report" : "测评报告"}">
        <section class="assessment-result-hero">
          <div>
            <p class="eyebrow">${en ? "Ability Baseline Report" : "能力基线报告"}</p>
            <h1>${roleDisplay(language, save.profile.role).name} · ${rankName(language, summary.rank)}</h1>
            <p class="muted">${en ? `Total Ability ${summary.total}; role focus and assessment tendencies are now in your starting profile.` : `综合能力值 ${summary.total}，角色重点与测评倾向已经写入初始档案。`}</p>
          </div>
          <canvas class="radar" id="assessment-result-radar"></canvas>
        </section>
        <section class="result-columns">
          <div class="report-panel">
            <h2>${en ? "Strengths" : "优势能力"}</h2>
            ${strengths
              .map(
                (id) => `
                  <div class="strength-row">
                    <span style="--dot:${ABILITIES[id].color}"></span>
                    <strong>${abilityDisplay(language, id).name} Lv.${abilityLevel(save.profile.abilities[id])}</strong>
                    <small>${abilityDisplay(language, id).tagline}</small>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="report-panel">
            <h2>${en ? "Recommended Training" : "建议训练"}</h2>
            ${training
              .map(
                (id) => `
                  <div class="training-item compact">
                    <span style="--dot:${ABILITIES[id].color}"></span>
                    <strong>${abilityDisplay(language, id).name}</strong>
                    <p>${abilityDisplay(language, id).tagline}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
        <section class="baseline-detail">
          <h2>${en ? "Baseline Detail" : "能力基线明细"}</h2>
          <div class="baseline-list">
            ${ABILITY_ORDER.map((id) => {
              const level = abilityLevel(save.profile.abilities[id]);
              const grade = level >= 3 ? "A" : level === 2 ? "B" : "C";
              return `
                <div class="baseline-row">
                  <span style="--dot:${ABILITIES[id].color}"></span>
                  <strong>${abilityDisplay(language, id).name}</strong>
                  <em>Lv.${level}</em>
                  <small>${grade} ${en ? "grade" : "级"}</small>
                </div>
              `;
            }).join("")}
          </div>
          <p class="cert-note">
            ${en ? `Certification: ${cert.level} (${cert.score} / 60) ${cert.next}` : `认证状态：${cert.level}（${cert.score} / 60）${cert.next}`}
          </p>
        </section>
        <section class="role-start-panel">
          <h2>${en ? "Role Starting Advice" : "本角色开局建议"}</h2>
          <p>${en ? ROLE_EN[save.profile.role].objective : ROLES[save.profile.role].objective}</p>
          <button class="primary" data-action="start-campaign">${en ? "Enter Campaign" : "进入主线"}</button>
        </section>
      </main>
    `;
}
