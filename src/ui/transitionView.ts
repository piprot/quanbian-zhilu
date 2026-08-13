import { getChapter, CHAPTERS } from "../core/story";
import { stageForChapter } from "../core/expedition";
import { uiString, type Language } from "../core/i18n";
import type { SaveState } from "../core/types";
import { chapterDisplay, chapterReflectionText } from "./display";
import { escapeHtml } from "./escape";

export function chapterTransitionView(
  save: SaveState,
  language: Language,
  muted: boolean,
  pendingChapterTransition: number,
  pendingForkNodeId: string | undefined
): string {
  const en = language === "en";
  const chapter = getChapter(pendingChapterTransition);
  const next = chapter.id < CHAPTERS.length ? CHAPTERS[chapter.id] : undefined;
  const civ = stageForChapter(chapter.id);
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link sound-toggle" data-action="toggle-sound" aria-label="${en ? "Toggle sound" : "切换声音"}">${muted ? uiString(language, "soundOff") : uiString(language, "soundOn")}</button>
      <button class="link language-toggle" data-action="toggle-language" aria-label="${en ? "Switch language" : "切换语言"}">${uiString(language, "language")}</button>
    </header>
    <main class="transition-shell" aria-label="${en ? "Chapter transition" : "章节过渡"}">
      <section class="transition-panel">
        <p class="eyebrow">${en ? `Chapter ${chapter.code} ${uiString(language, "chapterComplete")}` : `第 ${chapter.code} 章完成`}</p>
        <h1>${chapterDisplay(language, chapter).title}</h1>
        <p class="expedition-transition-line" style="--civ:${civ.color}">${en ? `${civ.nameEn} · ${civ.focusEn}` : `${civ.nameZh} · ${civ.focusZh}`}</p>
        <p class="transition-summary">${escapeHtml(chapterReflectionText(language, chapter.id))}</p>
        <div class="route-choice-panel">
          <h3>${uiString(language, "routeTitle")}</h3>
          <p class="muted">${uiString(language, "routeHint")}</p>
          <div class="route-choice-actions">
            ${(["expert", "risk", "partial"] as const)
              .map((route) => {
                const selected = save.routePath[chapter.id] === route;
                const labelKey =
                  route === "expert"
                    ? "routeExpert"
                    : route === "risk"
                      ? "routeRisk"
                      : "routePartial";
                return `<button class="${selected ? "selected" : ""}" data-action="choose-route" data-chapter="${chapter.id}" data-route="${route}" aria-pressed="${selected ? "true" : "false"}">${uiString(language, labelKey)}${selected ? ` <span class="route-selected-tag">${en ? "Selected" : "已选"}</span>` : ""}</button>`;
              })
              .join("")}
          </div>
          ${save.routePath[chapter.id] ? `<p class="route-preview" role="status">${uiString(language, save.routePath[chapter.id] === "expert" ? "routeExpertPreview" : save.routePath[chapter.id] === "risk" ? "routeRiskPreview" : "routePartialPreview")}</p>` : ""}
          ${
            pendingForkNodeId
              ? `<button class="primary fork-entry-button" data-action="enter-fork">${en ? "Enter Route Fork" : "进入路线分叉"}</button>`
              : ""
          }
        </div>
        ${
          next
            ? `
              <div class="next-chapter">
                <span>${uiString(language, "nextChapter")}</span>
                <strong>${en ? `Chapter ${next.code} · ${chapterDisplay(language, next).title}` : `第 ${next.code} 章 · ${next.title}`}</strong>
                <p>${chapterDisplay(language, next).subtitle}</p>
              </div>
            `
            : `
              <div class="next-chapter">
                <span>${uiString(language, "campaignComplete")}</span>
                <strong>${uiString(language, "campaignCompleteText")}</strong>
                <p>${uiString(language, "campaignCompleteHint")}</p>
              </div>
            `
        }
        <button class="primary" data-action="continue-transition-map">${uiString(language, "menuContinue")}</button>
      </section>
    </main>
  `;
}
