import {
  ASSESSMENT_QUESTIONS,
  assessmentTrackFor,
  certificationLevel,
  roleTrackScores
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
}

export function assessmentView(
  profile: PlayerProfile,
  language: Language,
  state: AssessmentViewState
): string {
  const question = ASSESSMENT_QUESTIONS[state.assessmentStep];
  const questionView = assessmentDisplay(language, question);
  const en = language === "en";
  const track = assessmentTrackFor(profile.role);
  return `
      <header class="topbar">
        <div class="brand">${uiString(language, "brand")}</div>
        <button class="link" data-action="open-profile">${en ? "Back to Profile" : "返回建档"}</button>
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
                  <div class="assessment-track-preview">
                    <h2>${en ? "Your Role Track" : "你的角色专属轨道"}</h2>
                    <p class="muted">${en ? `Five sub-dimensions for ${track.nameEn}, mapped onto the ten-ability model.` : `「${track.name}」的五个子维度，全部映射到现有十项能力主模型。`}</p>
                    <div class="track-dimension-list">
                      ${track.dimensions
                        .map(
                          (dimension) => `
                            <span class="track-dimension">
                              <strong>${escapeHtml(en ? dimension.nameEn : dimension.name)}</strong>
                              <small>${escapeHtml(
                                en
                                  ? `Focus: ${dimension.abilityIds
                                      .map((id) => abilityDisplay(language, id).name)
                                      .join(" · ")}`
                                  : dimension.description
                              )}</small>
                            </span>
                          `
                        )
                        .join("")}
                    </div>
                  </div>
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
  language: Language
): string {
  const summary = profileSummary(save);
  const cert = certificationLevel(save);
  const trackScores = roleTrackScores(save.profile.role, save.profile.abilities);
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
        <section class="role-track-panel">
          <h2>${en ? "Role Track" : "角色专属轨道"}</h2>
          <p class="muted">${en ? "Five role-specific sub-dimensions mapped onto the ten-ability model." : "五个角色专属子维度，映射到十项能力主模型。"}</p>
          <div class="track-dimension-list">
            ${trackScores
              .map(
                (dimension) => `
                  <div class="track-dimension-result">
                    <span class="track-grade">${dimension.grade}</span>
                    <strong>${escapeHtml(en ? dimension.nameEn : dimension.name)}</strong>
                    <small>${escapeHtml(
                      en
                        ? `Focus: ${dimension.abilityIds
                            .map((id) => abilityDisplay(language, id).name)
                            .join(" · ")}`
                        : dimension.description
                    )}</small>
                    <em>${dimension.score} / 6</em>
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
