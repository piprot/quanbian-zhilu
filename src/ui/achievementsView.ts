import {
  ACHIEVEMENTS,
  achievementCategory,
  achievementLore,
  achievementProgress,
  achievementRarity,
  isAchievementUnlocked,
  unlockedCount,
  type AchievementCategory,
  type AchievementRarity
} from "../core/achievements";
import { uiString, type Language } from "../core/i18n";
import type { SaveState } from "../core/types";
import { achievementDisplay } from "./display";
import { artAsset } from "./assets";
import { escapeHtml } from "./escape";

export function achievementsView(
  save: SaveState,
  language: Language,
  favorites: Set<string>
): string {
  const unlocked = unlockedCount(save);
  const en = language === "en";
  const categories: Array<AchievementCategory> = [
    "story",
    "training",
    "trial",
    "duel",
    "event",
    "rank"
  ];
  const categoryName: Record<AchievementCategory, string> = {
    story: en ? "Story" : "剧情",
    training: en ? "Training" : "训练",
    trial: en ? "Trial" : "试炼",
    duel: en ? "Duel" : "对决",
    event: en ? "Event" : "事件",
    rank: en ? "Rank" : "段位"
  };
  const rarityName: Record<AchievementRarity, string> = {
    common: en ? "Common" : "普通",
    rare: en ? "Rare" : "稀有",
    epic: en ? "Epic" : "史诗",
    legendary: en ? "Legendary" : "传说"
  };
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-menu">${uiString(language, "returnHome")}</button>
    </header>
    <main class="achievement-shell" aria-label="${language === "en" ? "Achievements" : "成就墙"}">
      <section class="achievement-hero">
        <div>
          <p class="eyebrow">${uiString(language, "achievementsTitle")}</p>
          <h1>${unlocked} / ${ACHIEVEMENTS.length} ${en ? "Unlocked" : "已解锁"} · ${favorites.size} ${en ? "Collected" : "已收藏"}</h1>
          <p class="muted">${en ? "Collect rare lore cards, favorite the ones that matter, and let every unlock pull you deeper into the campaign." : "收集稀有剧情卡片，收藏对你重要的成就，让每一次解锁都把你推回主线。"}</p>
        </div>
        <div class="achievement-progress"><i style="width:${(unlocked / ACHIEVEMENTS.length) * 100}%"></i></div>
      </section>
      <section class="achievement-category-stats">
        ${categories
          .map((category) => {
            const items = ACHIEVEMENTS.filter(
              (item) => achievementCategory(item.id) === category
            );
            const done = items.filter((item) =>
              isAchievementUnlocked(save, item.id)
            ).length;
            return `
              <div class="achievement-category-stat has-cat-art">
                <img class="ach-cat-cover" src="${artAsset(`ach-cat-${category}`)}" alt="" loading="lazy" onerror="this.style.display='none'" />
                <span class="ach-cat-mask"></span>
                <strong>${categoryName[category]}</strong>
                <span>${done} / ${items.length}</span>
              </div>
            `;
          })
          .join("")}
      </section>
      ${categories
        .map((category) => {
          const items = ACHIEVEMENTS.filter(
            (item) => achievementCategory(item.id) === category
          );
          if (items.length === 0) return "";
          return `
            <section class="achievement-group">
              <div class="achievement-group-head">
                <h2>${categoryName[category]} ${en ? "Collection" : "图鉴"}</h2>
                <span>${items.filter((item) => isAchievementUnlocked(save, item.id)).length} / ${items.length}</span>
              </div>
              <div class="achievement-grid">
                ${items
                  .map((achievement) => {
                    const done = isAchievementUnlocked(
                      save,
                      achievement.id
                    );
                    const view = achievementDisplay(language, achievement.id);
                    const progress = achievementProgress(
                      save,
                      achievement.id
                    );
                    const displayProgress = Math.min(
                      progress.target,
                      Math.round(progress.current)
                    );
                    const pct = Math.min(
                      100,
                      Math.round((displayProgress / progress.target) * 100)
                    );
                    const rarity = achievementRarity(achievement.id);
                    const lore = achievementLore(
                      achievement.id,
                      language
                    );
                    const pendingAssessment =
                      achievement.id === "assessment_done" &&
                      !done &&
                      save.assessmentScore === 0 &&
                      save.playCount > 0;
                    const favorited = favorites.has(
                      achievement.id
                    );
                    return `
                      <article class="achievement-card rarity-${rarity} ${done ? "unlocked" : "locked"} has-ach-art">
                        <button
                          class="ach-favorite"
                          data-action="toggle-achievement-favorite"
                          data-achievement="${achievement.id}"
                          aria-pressed="${favorited ? "true" : "false"}"
                          aria-label="${en ? (favorited ? "Remove from collection" : "Add to collection") : (favorited ? "取消收藏" : "加入收藏")}"
                        >${favorited ? "★" : "☆"}</button>
                        <div class="achievement-icon-wrap">
                          <img class="achievement-badge" src="${artAsset("ach-badge-base")}" alt="" loading="lazy" onerror="this.style.display='none'" />
                          <span class="achievement-icon">${achievement.icon}</span>
                        </div>
                        <div>
                          <div class="achievement-meta">
                            <span class="ach-rarity rarity-${rarity}">${rarityName[rarity]}</span>
                            <span class="ach-category">${categoryName[category]}</span>
                          </div>
                          <h2>${view.name}</h2>
                          <p>${view.description}</p>
                          ${pendingAssessment ? `<span class="ach-hint">${en ? "Assessment pending" : "可补测"} <button class="ach-retest-button" data-action="open-assessment">${en ? "Retake" : "去补测"}</button></span>` : ""}
                          <p class="ach-lore">${escapeHtml(lore)}</p>
                          <div class="achievement-card-progress" aria-label="${escapeHtml(
                            done
                              ? en
                                ? "Unlocked"
                                : "已解锁"
                              : `${displayProgress} / ${progress.target}`
                          )}">
                            <i style="width:${done ? 100 : pct}%"></i>
                          </div>
                        </div>
                        <small>${
                          done
                            ? en
                              ? "Unlocked"
                              : "已解锁"
                            : `${displayProgress} / ${progress.target}`
                        }</small>
                      </article>
                    `;
                  })
                  .join("")}
              </div>
            </section>
          `;
        })
        .join("")}
    </main>
  `;
}
