import {
  PRACTICE_TASKS,
  TRIAL_STAGES,
  canEnterTrial,
  trialCostFor,
  trialStageLabel
} from "../core/trials";
import { ABILITY_ORDER, abilityLevel } from "../core/abilities";
import { uiString, type Language } from "../core/i18n";
import type { AbilityId, SaveState } from "../core/types";
import { abilityDisplay } from "./display";
import { escapeHtml } from "./escape";

interface NextAdvice {
  text: string;
  action?: "open-trial" | "open-map" | "open-training";
  ability?: AbilityId;
}

export interface TrialViewState {
  activePracticeTaskId: string | undefined;
  nextAdvice: NextAdvice;
}

export function trialView(
  save: SaveState,
  language: Language,
  state: TrialViewState
): string {
  const en = language === "en";
  const energy = save.trialEnergy;
  const hp = save.trialHp;
  const items = save.trialItems;
  const capital = save.profile.resources.capital;
  const influence = save.profile.resources.influence;
  const trust = save.profile.resources.trust;
  const accelerator = save.trialAcceleratorLevel;
  const restDone =
    save.lastTrialEnergyDate === new Date().toISOString().slice(0, 10);
  return `
      <header class="topbar">
        <div class="brand">${uiString(language, "brand")}</div>
        <button class="link" data-action="open-menu">${uiString(language, "returnHome")}</button>
      </header>
      <main class="trial-shell" aria-label="${uiString(language, "trialTitle")}">
        <section class="trial-hero">
          <div>
            <p class="eyebrow">${uiString(language, "trialTitle")}</p>
            <h1>${en ? "Grow through real scenarios, not questionnaires" : "不是问卷，是实战历练"}</h1>
            <p class="muted">${en ? "Clear gates with ability levels, spend energy on demanding cases, and unlock tools, allies, and MBA-level cases." : "用能力门槛解锁关卡，消耗精力值挑战高难案例，获得工具、同伴和 MBA 级案例。"}</p>
          </div>
          <div class="trial-energy-panel">
            <span>${uiString(language, "trialEnergy")}</span>
            <strong>${energy} / 100</strong>
            <div class="trial-energy-bar"><i style="width:${energy}%"></i></div>
            <strong>${uiString(language, "trialHp")} ${hp} / 100</strong>
            <div class="trial-energy-bar hp-bar"><i style="width:${hp}%"></i></div>
            <div class="trial-energy-actions">
              <button data-action="trial-rest" ${restDone ? "disabled" : ""}>${uiString(language, "trialRest")} +30</button>
              <button data-action="trial-buy-energy" ${capital < 15 || energy >= 100 ? "disabled" : ""}>${uiString(language, "trialBuyEnergy")} -15</button>
              <button data-action="trial-buy-energy-influence" ${influence < 25 || energy >= 100 ? "disabled" : ""}>${uiString(language, "trialBuyEnergyInfluence")} -25</button>
              <button data-action="trial-invest-accelerator" ${accelerator >= 3 || capital < 40 + accelerator * 20 ? "disabled" : ""}>${uiString(language, "trialAccelerator")} Lv.${accelerator} -${40 + accelerator * 20}</button>
              <button data-action="trial-hire-ally" ${trust < 20 || items.includes("临时同伴") ? "disabled" : ""}>${uiString(language, "trialAllyHire")} -20</button>
            </div>
            <small>${accelerator > 0 ? `${uiString(language, "trialAcceleratorActive")} Lv.${accelerator}` : uiString(language, "trialBuyCost")} 15 · ${capital} · ${influence} · ${trust}</small>
          </div>
        </section>
        <section class="trial-morale-panel">
          <strong>${en ? "Morale" : "士气"}</strong>
          <div class="trial-energy-bar"><i style="width:${save.morale ?? 75}%"></i></div>
          <small>${en ? "Resilience and adversity choices move morale." : "韧性值与困境选择会改变士气。"}</small>
        </section>
        ${
          state.activePracticeTaskId
            ? (() => {
                const task = PRACTICE_TASKS.find(
                  (item) => item.id === state.activePracticeTaskId
                );
                if (!task) return "";
                return `
                  <section class="practice-editor">
                    <h2>${escapeHtml(task.title)}</h2>
                    <p>${escapeHtml(task.action)}</p>
                    <textarea data-practice-result rows="5" placeholder="${uiString(language, "practiceHint")}"></textarea>
                    <button class="primary" data-action="practice-submit">${uiString(language, "practiceSubmit")}</button>
                  </section>
                `;
              })()
            : ""
        }
        <section class="trial-next-step">
          <h2>${uiString(language, "nextStepTitle")}</h2>
          <p>${escapeHtml(state.nextAdvice.text)}</p>
          ${
            state.nextAdvice.action
              ? `<button data-action="${state.nextAdvice.action}" ${state.nextAdvice.ability ? `data-ability="${state.nextAdvice.ability}"` : ""}>${uiString(language, "nextStepAction")}</button>`
              : ""
          }
        </section>
        <section class="trial-loot-panel">
          <h2>${uiString(language, "trialItems")}</h2>
          ${
            items.length
              ? `<div class="trial-loot">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`
              : `<p class="muted">${en ? "No tools yet. Clear trial stages to unlock frameworks, allies, and tools." : "还没有收获，通关试炼会获得方法、同伴和工具。"}</p>`
          }
        </section>
        <section class="trial-unlocks">
          <h2>${en ? "Growth Unlocks" : "成长解锁"}</h2>
          <div class="unlock-list">
            <span class="unlocked">${en ? "Stamina: Energy Bar" : "状态：精力值"}</span>
            <span class="${Math.max(...ABILITY_ORDER.map((id) => abilityLevel(save.profile.abilities[id]))) >= 2 ? "unlocked" : "locked"}">${en ? "Skill: Ability Lv.2" : "技能：能力 Lv.2"}</span>
            <span class="${save.trialCleared.length >= 5 ? "unlocked" : "locked"}">${en ? "Protection: Clear Trial 5" : "防护：通关第 5 关"}</span>
            <span class="${save.trialCleared.length >= 7 ? "unlocked" : "locked"}">${en ? "Ally: Clear Trial 7" : "同伴：通关第 7 关"}</span>
            <span class="${save.trialCleared.length >= 10 ? "unlocked" : "locked"}">${en ? "Toolkit: Clear Trial 10" : "工具：通关第 10 关"}</span>
            <span class="${save.trialCleared.length >= 19 ? "unlocked" : "locked"}">${en ? "MBA Cases: Clear All Trials" : "MBA 关卡：通关全部试炼"}</span>
          </div>
        </section>
        <section class="trial-stages">

          <h2>${uiString(language, "trialStages")}</h2>
          <div class="trial-stage-list">
            ${TRIAL_STAGES.map((stage) => {
              const done = save.trialCleared.includes(stage.id);
              const enterable = canEnterTrial(save, stage);
              const gateText = stage.gates
                .map((gate) => `${abilityDisplay(language, gate.abilityId).name} Lv.${gate.level}`)
                .join(" + ");
              return `
                <div class="trial-stage-card ${done ? "cleared" : enterable ? "open" : "locked"}">
                  <div class="trial-stage-head">
                    <span>${String(stage.order).padStart(2, "0")}</span>
                    <strong>${escapeHtml(stage.name)}</strong>
                    <em>${escapeHtml(stage.boss)}</em>
                  </div>
                  <p>${trialStageLabel(stage, language)}</p>
                  <div class="trial-stage-meta">
                    <span>${uiString(language, "trialGate")}：${escapeHtml(gateText)}</span>
                    <span>${uiString(language, "trialEnergyCost")} ${trialCostFor(save, stage)}</span>
                  </div>
                  ${
                    enterable
                      ? `<button class="primary" data-action="trial-stage" data-stage="${stage.id}">${uiString(language, "trialEnter")}</button>`
                      : `
                        <div class="trial-lock-actions">
                          <span class="trial-lock">${done ? uiString(language, "trialCleared") : uiString(language, "trialLocked")}</span>
                          ${
                            done
                              ? ""
                              : stage.gates
                                  .map(
                                    (gate) => `
                                      <button data-action="open-training" data-ability="${gate.abilityId}">
                                        ${abilityDisplay(language, gate.abilityId).name} Lv.${gate.level}
                                      </button>
                                    `
                                  )
                                  .join("")
                          }
                        </div>
                      `
                  }
                </div>
              `;
            }).join("")}
          </div>
        </section>
        <section class="trial-practice">
          <h2>${uiString(language, "trialPractice")}</h2>
          <p class="muted">${en ? "Write a real reflection; rewards unlock after keyword scoring." : "请写下真实反思，通过关键词评分后才会发放奖励。"}</p>
          <div class="practice-list">
            ${PRACTICE_TASKS.map((task) => {
              const done = save.completedPracticeTasks.includes(task.id);
              return `
                <article class="practice-card ${done ? "done" : ""}">
                  <div>
                    <h3>${escapeHtml(task.title)}</h3>
                    <small>${escapeHtml(task.source)}</small>
                    <blockquote>${escapeHtml(task.quote)}</blockquote>
                    <p>${escapeHtml(task.action)}</p>
                  </div>
                  <div class="practice-reward">
                    <span>${abilityDisplay(language, task.rewardAbility).name} +${task.rewardExp}</span>
                    <span>${uiString(language, "trialEnergy")} +${task.rewardEnergy}</span>
                  </div>
                  ${
                    done
                      ? `<span class="practice-done">${uiString(language, "trialCleared")}</span>`
                      : `<button data-action="practice-task" data-task="${task.id}">${en ? "Complete Task" : "完成训练"}</button>`
                  }
                </article>
              `;
            }).join("")}
          </div>
        </section>
      </main>
    `;
}
