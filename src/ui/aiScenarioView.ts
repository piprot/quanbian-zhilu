import { ABILITIES, ABILITY_ORDER } from "../core/abilities";
import type { AiDifficulty } from "../core/aiScenario";
import { uiString, type Language } from "../core/i18n";
import type { AbilityId, SaveState } from "../core/types";
import { abilityDisplay } from "./display";
import { escapeHtml } from "./escape";

export interface AiScenarioViewState {
  selectedAbility: AbilityId;
  difficulty: AiDifficulty;
}

export function aiScenarioView(
  save: SaveState,
  language: Language,
  state: AiScenarioViewState
): string {
  const en = language === "en";
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-map">${en ? "Back to Map" : "返回地图"}</button>
      <button class="link" data-action="open-menu">${en ? "Home" : "主页"}</button>
    </header>
    <main class="ai-scenario-shell" aria-label="${en ? "AI dynamic narrative" : "AI 动态叙事"}">
      <section class="ai-scenario-hero">
        <p class="eyebrow">${en ? "AI Dynamic Narrative" : "AI 动态叙事"}</p>
        <h1>${en ? "Infinite Situations" : "无限情境"}</h1>
        <p class="muted">${en ? "Pick the ability you want to train and a difficulty. The generated dilemma starts from your profile and weak spot." : "选择你想练的能力与难度，系统会根据你的档案和最弱项生成专属职场两难。"}</p>
      </section>
      <section class="ai-scenario-panel">
        <h2>${en ? "Focus Ability" : "聚焦能力"}</h2>
        <p class="muted">${en ? "Default: your weakest ability." : "默认推荐你的最弱项。"}</p>
        <div class="ai-ability-grid">
          ${ABILITY_ORDER.map((id) => {
            const display = abilityDisplay(language, id);
            const value = save.profile.abilities[id];
            return `
              <button
                class="ai-ability-card ${state.selectedAbility === id ? "selected" : ""}"
                data-action="ai-scenario-ability"
                data-ability="${id}"
              >
                <span style="--dot:${ABILITIES[id].color}"></span>
                <strong>${escapeHtml(display.name)}</strong>
                <small>${value}</small>
              </button>
            `;
          }).join("")}
        </div>
      </section>
      <section class="ai-scenario-panel">
        <h2>${en ? "Difficulty" : "情境难度"}</h2>
        <div class="ai-difficulty-row">
          ${(
            [
              ["easy", en ? "Starter" : "入门", en ? "Clear signals, build confidence" : "情境直接，建立信心"],
              ["medium", en ? "Advanced" : "进阶", en ? "Real trade-offs" : "真实两难，权衡取舍"],
              ["hard", en ? "Master" : "宗师", en ? "Interwoven pressure" : "复杂交织，考验心力"]
            ] as Array<[AiDifficulty, string, string]>
          )
            .map(
              ([difficulty, label, hint]) => `
                <button
                  class="ai-difficulty-card ${state.difficulty === difficulty ? "selected" : ""}"
                  data-action="ai-scenario-difficulty"
                  data-difficulty="${difficulty}"
                >
                  <strong>${label}</strong>
                  <small>${hint}</small>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
      <button class="secondary ai-auto-button" data-action="ai-scenario-auto">
        ${en ? "Auto Recommend for My Profile" : "按我的画像智能推荐"}
      </button>
      <button class="primary ai-generate-button" data-action="ai-scenario-generate">
        ${en ? "Generate My Scenario" : "生成专属情境"}
      </button>
      <p class="muted ai-generate-note">${en ? "When the server is configured with an LLM key, scenarios come from the model; otherwise a validated local template is used." : "服务端配置 LLM Key 时由模型生成；未配置时自动回退到本地模板。"}</p>
    </main>
  `;
}
