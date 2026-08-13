import { getNodeForRole } from "../core/story";
import { uiString, type Language } from "../core/i18n";
import { worstOptionIndex, type DualAxisOutcome } from "../core/review-schedule";
import {
  customScenarioToNode,
  type CustomScenario
} from "../core/custom-scenarios";
import type { SaveState } from "../core/types";
import { qualityLabel } from "./display";
import { escapeAttr, escapeHtml } from "./escape";
import { storyNodeDisplay } from "./nodeView";

export interface DualReviewViewState {
  nodeId: string;
  index: number;
  total: number;
  bestIndex?: number;
  worstIndex?: number;
  submitted: boolean;
  lastOutcome?: DualAxisOutcome;
}

export function dualReviewView(
  save: SaveState,
  language: Language,
  state: DualReviewViewState
): string {
  const en = language === "en";
  const roleNode = getNodeForRole(save.profile.role, state.nodeId);
  const nodeView = storyNodeDisplay(language, save, roleNode);
  const options = nodeView.options;
  const expertIndex = options.findIndex(
    (option) => option.quality === "expert"
  );
  const worstIndex = worstOptionIndex(options);
  const expertOption = options[expertIndex];
  const worstOption = options[worstIndex];
  const optionCards = options
    .map((option, index) => {
      const isBest = state.bestIndex === index;
      const isWorst = state.worstIndex === index;
      const cls = `dual-option ${isBest ? "best" : ""} ${
        isWorst ? "worst" : ""
      }`;
      return `
        <article class="${cls}">
          <strong>${escapeHtml(option.label)}</strong>
          <small>${escapeHtml(option.summary)}</small>
          <div class="dual-axes">
            <button class="${isBest ? "active" : ""}" data-action="dual-toggle" data-axis="best" data-option="${index}" aria-pressed="${isBest}">${en ? "Best" : "最佳"}</button>
            <button class="${isWorst ? "active" : ""}" data-action="dual-toggle" data-axis="worst" data-option="${index}" aria-pressed="${isWorst}">${en ? "Worst" : "最差"}</button>
          </div>
        </article>
      `;
    })
    .join("");
  const feedback =
    state.submitted && state.lastOutcome && expertOption && worstOption
      ? `
        <section class="dual-result ${state.lastOutcome}">
          <h2>${
            state.lastOutcome === "perfect"
              ? en
                ? "Best and worst both precise"
                : "最佳与最差判断都准确"
              : state.lastOutcome === "partial"
                ? en
                  ? "Best precise, worst needs calibration"
                  : "最佳准确，最差判断需要校准"
                : en
                  ? "Best judgment needs another pass"
                  : "最佳判断需要再次回练"
          }</h2>
          <p>${en ? "Expert baseline" : "专家基准"}：${escapeHtml(expertOption.label)}</p>
          <p>${en ? "Worst baseline" : "最差基准"}：${escapeHtml(worstOption.label)}</p>
        </section>
      `
      : "";
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="dual-close">${en ? "Report" : "返回报告"}</button>
      <div class="topbar-meta"><span>${en ? `Dual-axis review ${state.index + 1}/${state.total}` : `双轴回练 ${state.index + 1}/${state.total}`}</span></div>
    </header>
    <main class="dual-review-shell" aria-label="${en ? "Best and worst judgment review" : "最佳与最差判断回练"}">
      <section class="dual-review-hero">
        <p class="eyebrow">${escapeHtml(nodeView.title)}</p>
        <h1>${en ? "Pick the best and the worst move" : "同时选出最佳与最差选项"}</h1>
        <p>${escapeHtml(nodeView.context)}</p>
      </section>
      <p class="dual-hint">${en ? "Best and worst are mutually exclusive. Choose one option for each." : "最佳与最差互斥，同一个选项不能同时兼任。"}</p>
      ${feedback}
      <section class="dual-option-list">${optionCards}</section>
      <div class="dual-footer">
        <button class="primary" data-action="dual-submit" ${state.submitted ? "disabled aria-disabled=\"true\"" : ""}>${en ? "Submit Judgment" : "提交判断"}</button>
        ${state.submitted ? `<button class="primary" data-action="dual-next">${en ? "Next Review" : "下一题"}</button>` : ""}
      </div>
    </main>
  `;
}

export function customScenariosView(
  scenarios: CustomScenario[],
  language: Language
): string {
  const en = language === "en";
  const list = scenarios
    .map(
      (scenario) => `
        <article class="custom-scenario-card">
          <strong>${escapeHtml(scenario.title)}</strong>
          <p>${escapeHtml(scenario.context)}</p>
          <div class="custom-scenario-actions">
            <button data-action="custom-play" data-id="${escapeAttr(scenario.id)}">${en ? "Play" : "试玩"}</button>
            <button data-action="custom-delete" data-id="${escapeAttr(scenario.id)}">${en ? "Delete" : "删除"}</button>
          </div>
        </article>
      `
    )
    .join("");
  const optionFields = [0, 1, 2]
    .map((index) => {
      const qualityName =
        index === 0 ? "expert" : index === 1 ? "partial" : "risk";
      return `
        <fieldset class="custom-option-field">
          <legend>${en ? `Option ${index + 1} · ${qualityName}` : `选项 ${index + 1} · ${qualityName}`}</legend>
          <label><span>${en ? "Label" : "标题"}</span><input name="custom-option-${index}-label" maxlength="60" /></label>
          <label><span>${en ? "Summary" : "摘要"}</span><input name="custom-option-${index}-summary" maxlength="120" /></label>
          <label><span>${en ? "Feedback" : "反馈"}</span><textarea name="custom-option-${index}-feedback" rows="2" maxlength="300"></textarea></label>
          <label><span>${en ? "Quality" : "质量"}</span>
            <select name="custom-option-${index}-quality">
              <option value="expert" ${index === 0 ? "selected" : ""}>${en ? "Expert" : "专家"}</option>
              <option value="partial" ${index === 1 ? "selected" : ""}>${en ? "Partial" : "部分有效"}</option>
              <option value="risk" ${index === 2 ? "selected" : ""}>${en ? "Risk" : "高风险"}</option>
            </select>
          </label>
        </fieldset>
      `;
    })
    .join("");
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-menu">${en ? "Menu" : "返回主菜单"}</button>
      <div class="topbar-meta"><span>${en ? "Scenario Workshop" : "情境工坊"}</span></div>
    </header>
    <main class="custom-workshop-shell" aria-label="${en ? "Scenario Workshop" : "情境工坊"}">
      <section class="custom-workshop-hero">
        <p class="eyebrow">${en ? "UGC Scenarios" : "自定义情境"}</p>
        <h1>${en ? "Write a real dilemma, then play it" : "写下一个真实两难，再把它玩出来"}</h1>
        <p class="muted">${en ? "Keep the expert / partial / risk structure, and your team can use the same baseline the campaign uses." : "保持专家 / 部分 / 高风险结构，团队就能复用主线同样的基准反馈。"}</p>
      </section>
      <section class="custom-scenario-list">
        <h2>${en ? `Saved Scenarios (${scenarios.length})` : `已保存情境（${scenarios.length}）`}</h2>
        ${list || `<p class="muted">${en ? "No scenarios yet. Create the first one below." : "还没有自定义情境，先在下方面创建第一个。"}</p>`}
        <div class="custom-transfer-actions">
          <button data-action="custom-export" ${list ? "" : "disabled aria-disabled=\"true\""}>${en ? "Export Scenarios" : "导出情境包"}</button>
          <label class="file-button">${en ? "Import Scenarios" : "导入情境包"}<input type="file" data-custom-import="1" accept="application/json" hidden /></label>
        </div>
      </section>
      <section class="custom-scenario-form">
        <h2>${en ? "Create Scenario" : "创建情境"}</h2>
        <label><span>${en ? "Title" : "标题"}</span><input name="custom-title" maxlength="40" /></label>
        <label><span>${en ? "Situation" : "现场描述"}</span><textarea name="custom-context" rows="3" maxlength="500"></textarea></label>
        <label><span>${en ? "Stake" : "利害关系"}</span><textarea name="custom-stake" rows="2" maxlength="300"></textarea></label>
        <div class="custom-option-grid">${optionFields}</div>
        <button class="primary" data-action="custom-submit">${en ? "Save Scenario" : "保存情境"}</button>
      </section>
    </main>
  `;
}

export function customScenarioPlayView(
  scenario: CustomScenario,
  playResult: number | undefined,
  language: Language
): string {
  const en = language === "en";
  const node = customScenarioToNode(scenario);
  const options =
    playResult === undefined
      ? scenario.options
          .map(
            (option, index) => `
              <button class="custom-play-option ${option.quality}" data-action="custom-option" data-option="${index}">
                <strong>${escapeHtml(option.label)}</strong>
                <small>${escapeHtml(option.summary)}</small>
              </button>
            `
          )
          .join("")
      : "";
  const result =
    playResult !== undefined && scenario.options[playResult]
      ? (() => {
          const option = scenario.options[playResult];
          return `
            <section class="custom-play-result ${option.quality}">
              <span class="quality ${option.quality}">${qualityLabel(language, option.quality)}</span>
              <h2>${escapeHtml(option.label)}</h2>
              <p>${escapeHtml(option.feedback)}</p>
              <blockquote>${escapeHtml(node.options[playResult].theory)}</blockquote>
            </section>
          `;
        })()
      : "";
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="custom-back">${en ? "Workshop" : "返回工坊"}</button>
      <div class="topbar-meta"><span>${escapeHtml(scenario.title)}</span></div>
    </header>
    <main class="custom-play-shell" aria-label="${en ? "Custom scenario" : "自定义情境"}">
      <section class="custom-play-hero">
        <p class="eyebrow">${en ? "Custom Scenario" : "自定义情境"}</p>
        <h1>${escapeHtml(scenario.title)}</h1>
        <p>${escapeHtml(scenario.context)}</p>
        <blockquote>${escapeHtml(scenario.stake)}</blockquote>
      </section>
      ${result}
      ${options ? `<section class="custom-play-options">${options}</section>` : `<div class="custom-play-actions"><button class="primary" data-action="custom-back">${en ? "Back to Workshop" : "返回工坊"}</button></div>`}
    </main>
  `;
}
