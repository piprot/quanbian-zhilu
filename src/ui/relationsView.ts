import { uiString, type Language } from "../core/i18n";
import { NPCS, npcRelation } from "../core/npcs";
import type { SaveState } from "../core/types";
import { npcDisplay, relationNoteText, relationStatusText } from "./display";
import { npcStoryMarkup } from "./storyMarkup";
import { escapeHtml } from "./escape";

export function relationsView(save: SaveState, language: Language): string {
  const related = NPCS.filter(
    (npc) => npcRelation(save, npc).status !== "尚未接触"
  ).length;
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-menu">${uiString(language, "returnHome")}</button>
    </header>
    <main class="relation-shell" aria-label="${language === "en" ? "Relationships" : "人物关系图"}">
      <section class="relation-hero">
        <div>
          <p class="eyebrow">${uiString(language, "relationsTitle")}</p>
          <h1>${related} / ${NPCS.length} ${language === "en" ? "people in your network" : "人已进入你的关系网络"}</h1>
          <p class="muted">${language === "en" ? "NPCs you faced directly in side quests evolve from leads into lasting organizational relationships." : "支线中真正面对过的 NPC，会从线索变成可延续的组织关系。"}</p>
        </div>
      </section>
      <canvas class="relation-graph" id="relation-graph"></canvas>
      <section class="relation-grid">
        ${NPCS.map((npc) => {
          const relation = npcRelation(save, npc);
          const view = npcDisplay(language, npc);
          return `
            <div class="npc-card ${relation.status === "已建立关系" ? "trusted" : relation.status === "存在线索" ? "known" : "hidden"}">
              <div class="npc-avatar-wrap">
                <span class="npc-avatar npc-avatar-fallback">${view.name.slice(0, 1)}</span>
                <img class="npc-portrait npc-avatar" src="./npc/${npc.id}.jpg" alt="${escapeHtml(view.name)}" loading="lazy">
              </div>
              <div>
                <h2>${view.name}</h2>
                <small>${view.title}</small>
                <p>${view.description}</p>
              </div>
              <span class="npc-status">${relationStatusText(language, relation.status)}</span>
              <em>${relationNoteText(language, save, npc)}</em>
              ${relation.status !== "尚未接触" ? npcStoryMarkup(language, npc) : ""}
            </div>
          `;
        }).join("")}
      </section>
    </main>
  `;
}
