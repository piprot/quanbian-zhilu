import { HISTORY_MIRRORS } from "../core/historyMirrors";
import { uiString, type Language } from "../core/i18n";
import { abilityDisplay } from "./display";
import { escapeHtml } from "./escape";

export function historyMirrorView(language: Language): string {
  const en = language === "en";
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-map">${en ? "Back to Map" : "返回地图"}</button>
      <button class="link" data-action="open-menu">${en ? "Home" : "主页"}</button>
    </header>
    <main class="history-mirror-shell" aria-label="${en ? "History mirror hall" : "史鉴堂"}">
      <section class="history-mirror-hero">
        <p class="eyebrow">${en ? "History Mirror Hall" : "史鉴堂"}</p>
        <h1>${en ? "Learn from the past to see today's trade-offs" : "鉴于往事，有资于治道"}</h1>
        <p class="muted">${en ? "Every mirror maps to one of the ten abilities. Read the case, then bring the question back to your next decision." : "每条镜鉴都映射到十项能力之一。先读事件，再把那个问题带回你下一次抉择。"}</p>
      </section>
      <section class="history-mirror-grid">
        ${HISTORY_MIRRORS.map((mirror) => {
          const ability = abilityDisplay(language, mirror.abilityId);
          return `
            <article class="history-mirror-entry">
              <span class="mirror-ability">${escapeHtml(ability.name)}</span>
              <h2>${escapeHtml(mirror.title)}</h2>
              <p class="mirror-source">${escapeHtml(mirror.source)}</p>
              <blockquote>${escapeHtml(mirror.quote)}</blockquote>
              <p class="mirror-lesson">${escapeHtml(en ? mirror.lessonEn : mirror.lessonZh)}</p>
            </article>
          `;
        }).join("")}
      </section>
    </main>
  `;
}
