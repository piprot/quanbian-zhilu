import {
  adaptiveProgress,
  adaptiveStageRequirements
} from "../core/adaptiveRoute";
import {
  RANDOM_EVENT_IDS,
  SIDE_QUEST_ARCS,
  randomEventEligibleCount
} from "../core/story";
import { NPCS, npcRelation } from "../core/npcs";
import { uiString, type Language } from "../core/i18n";
import type { SaveState } from "../core/types";
import {
  npcDisplay,
  relationStatusText,
  sideArcDisplay
} from "./display";
import { escapeHtml } from "./escape";

export function lorebookView(
  save: SaveState,
  language: Language
): string {
  const en = language === "en";
  const adaptive = adaptiveProgress(save);
  const stage = adaptive.done
    ? undefined
    : adaptive.route.stages[adaptive.currentIndex];
  const stageRequirements = stage
    ? adaptiveStageRequirements(save, stage, language).join(" · ")
    : "";
  const established = NPCS.filter(
    (npc) => npcRelation(save, npc).status === "已建立关系"
  ).length;
  const known = NPCS.filter(
    (npc) => npcRelation(save, npc).status === "存在线索"
  ).length;

  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-menu">${en ? "Menu" : "返回主菜单"}</button>
      <button class="link" data-action="open-map">${en ? "Map" : "主线地图"}</button>
    </header>
    <main class="lorebook-shell" aria-label="${en ? "Lore & Clue Atlas" : "线索图鉴"}">
      <section class="lorebook-hero">
        <p class="eyebrow">${en ? "Clue Atlas" : "线索图鉴"}</p>
        <h1>${en ? "Hidden content, made visible" : "把隐藏内容变成看得见的路线"}</h1>
        <p class="muted">${en ? "This atlas turns hidden routes, side arcs, events, and NPC stories into a clear checklist instead of guesswork." : "隐藏路线、支线剧情弧、随机事件与 NPC 故事都在这里汇总，不用再靠猜。"}</p>
      </section>
      <section class="lorebook-grid">
        <article class="lorebook-card route-card">
          <h2>${en ? "90-Day Route" : "90 天路线"}</h2>
          <p class="muted">${en ? `Stage ${adaptive.currentIndex + 1} / ${adaptive.route.stages.length}` : `阶段 ${adaptive.currentIndex + 1} / ${adaptive.route.stages.length}`}</p>
          ${
            adaptive.done
              ? `<p class="lorebook-done">${en ? "Route complete" : "路线已完成"}</p>`
              : stage
                ? `
                  <strong>${en ? stage.titleEn : stage.titleZh}</strong>
                  <p class="muted">${escapeHtml(stageRequirements)}</p>
                `
                : ""
          }
          <button data-action="open-map">${en ? "Go to Route" : "前往路线"}</button>
        </article>

        <article class="lorebook-card">
          <h2>${en ? "Side Arcs" : "支线剧情弧"}</h2>
          <div class="lorebook-list">
            ${SIDE_QUEST_ARCS.map((arc) => {
              const view = sideArcDisplay(language, arc);
              const done = arc.nodes.every((id) =>
                save.completedSideQuests.includes(id)
              );
              const doneCount = arc.nodes.filter((id) =>
                save.completedSideQuests.includes(id)
              ).length;
              return `
                <div class="lorebook-row ${done ? "done" : ""}">
                  <strong>${escapeHtml(view.title)}</strong>
                  <span>${doneCount} / ${arc.nodes.length}</span>
                  <p class="muted">${done ? (en ? "Complete" : "已完成") : (en ? "Unlock by finishing the related chapter scenarios" : "完成对应章节情境后解锁")}</p>
                </div>
              `;
            }).join("")}
          </div>
        </article>

        <article class="lorebook-card">
          <h2>${en ? "Random Events" : "随机事件"}</h2>
          <p class="muted">${en ? `Completed ${save.completedRandomEvents.length} / ${randomEventEligibleCount(save)} eligible events` : `已完成 ${save.completedRandomEvents.length} / ${randomEventEligibleCount(save)} 个可触发事件`}</p>
          <p class="muted">${en ? `Total pool: ${RANDOM_EVENT_IDS.length}` : `事件池：${RANDOM_EVENT_IDS.length}`}</p>
          <button data-action="open-map">${en ? "Check Event Log" : "查看事件簿"}</button>
        </article>

        <article class="lorebook-card">
          <h2>${en ? "Hidden Routes" : "隐藏路线"}</h2>
          <p class="muted">${en ? `Unlocked ${save.hiddenRoutes.length}` : `已解锁 ${save.hiddenRoutes.length}`}</p>
          <p class="muted">${en ? "Hint: earn three stars in a chapter, then open the advanced review in your report." : "提示：章节达到三星后，在复盘报告中进入高阶复盘。"}</p>
          <button data-action="open-report">${en ? "Open Report" : "打开报告"}</button>
        </article>

        <article class="lorebook-card">
          <h2>${en ? "NPC Relations" : "NPC 关系"}</h2>
          <p class="muted">${en ? `Established ${established} · Leads ${known} · Total ${NPCS.length}` : `已建立 ${established} · 线索 ${known} · 共 ${NPCS.length}`}</p>
          <div class="lorebook-list">
            ${NPCS.slice(0, 6).map((npc) => {
              const relation = npcRelation(save, npc);
              return `
                <div class="lorebook-row">
                  <strong>${escapeHtml(npcDisplay(language, npc).name)}</strong>
                  <span>${escapeHtml(relationStatusText(language, relation.status))}</span>
                </div>
              `;
            }).join("")}
          </div>
          <button data-action="open-relations">${en ? "Open Relations" : "人物关系图"}</button>
        </article>
      </section>
    </main>
  `;
}
