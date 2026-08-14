import {
  isChapterComplete,
  isChapterPassed,
  isNodeComplete,
  profileSummary
} from "../core/game";
import {
  CHAPTERS,
  RANDOM_EVENT_IDS,
  RANDOM_EVENT_META,
  SIDE_QUEST_ARCS,
  getChapter,
  getNode,
  nextRandomEvent,
  randomEventEligibleCount
} from "../core/story";
import { stageForChapter } from "../core/expedition";
import {
  dailyChallenges,
  todayKey,
  weekEndsAt,
  weekKey,
  weeklyChallenges
} from "../core/challenges";
import { ROLES } from "../core/abilities";
import { ROLE_EN } from "../core/translations";
import { uiString, type Language } from "../core/i18n";
import type { AbilityId, SaveState } from "../core/types";
import {
  challengeCategoryLabel,
  challengeDisplay,
  chapterBadge,
  chapterDisplay,
  chapterReflectionText,
  rankName,
  resourceChips
} from "./display";
import { escapeAttr, escapeHtml } from "./escape";
import { artAsset, chapterArtStyle } from "./assets";
import {
  chapterTrainingMarkup,
  expeditionHeroMarkup,
  npcCameoMarkup
} from "./storyMarkup";
import { difficultySelector } from "./settingsView";
import { storyNodeDisplay } from "./nodeView";
import { nodeRow, questArcMarkup } from "./mapHelpers";

export interface NextActionAdvice {
  text: string;
  action?: "open-trial" | "open-map" | "open-training";
  ability?: AbilityId;
}

export interface MapViewState {
  selectedChapter: number;
  mapDetailOpen: boolean;
  resourceRecoveryNote: boolean;
  showMapGuide: boolean;
  riskCrisis: boolean;
  nextAdvice: NextActionAdvice;
  latestDecision: string;
  productionReady: boolean;
}

export function mapView(
  save: SaveState,
  language: Language,
  state: MapViewState
): string {
  const summary = profileSummary(save);
  const en = language === "en";
  const chapter = getChapter(state.selectedChapter);
  const mainNodes = chapter.nodeIds.map(getNode);
  const mainDoneCount = mainNodes.filter((node) =>
    isNodeComplete(save, node.id)
  ).length;
  const coreDoneCount = mainNodes
    .slice(0, 2)
    .filter((node) => isNodeComplete(save, node.id)).length;
  const extraDoneCount = Math.max(0, mainDoneCount - coreDoneCount);
  const chapterDone = isChapterComplete(save, chapter.id);
  const chapterPassed = isChapterPassed(save, chapter.id);
  const availableRandom = nextRandomEvent({
    ...save,
    role: save.profile.role,
    difficulty: save.difficulty
  });
  return `
      <header class="topbar">
        <div class="brand">${uiString(language, "brand")}</div>
        <button class="link" data-action="open-menu">${uiString(language, "returnHome")}</button>
        <div class="topbar-meta">
          <span>${save.profile.name}</span>
          <span>${rankName(language, summary.rank)}</span>
        </div>
      </header>
      <main class="map-shell ${state.mapDetailOpen ? "map-detail-open" : ""}" style="${chapterArtStyle(chapter.id)}" aria-label="${language === "en" ? "Campaign map" : "主线地图"}">
        ${expeditionHeroMarkup(language, save, chapter.id)}
        ${
          state.showMapGuide
            ? `
              <section class="map-guide-overlay" role="dialog" aria-label="${en ? "First map guide" : "首次地图引导"}">
                <div>
                  <p class="eyebrow">${en ? "Three things to know" : "进入地图前，先记住三件事"}</p>
                  <ol>
                    <li><strong>${en ? "Recon first" : "先勘察"}</strong>${en ? "Complete one recon action to unlock choices." : "先完成一个勘察动作，才能解锁选择。"}</li>
                    <li><strong>${en ? "Core + Extended" : "核心 + 扩展"}</strong>${en ? "Core 2/2 unlocks the next chapter; 7 extended scenarios add depth and rewards." : "核心 2/2 推进章节，7 个扩展情境提供深度和奖励。"}</li>
                    <li><strong>${en ? "Guardian verification" : "守护验证"}</strong>${en ? "Repeatedly picking the first option triggers a real trade-off check." : "反复选择第一个方案会触发真实取舍验证。"}</li>
                  </ol>
                  <button class="primary" data-action="dismiss-map-guide">${en ? "Start Recon" : "开始勘察"}</button>
                </div>
              </section>
            `
            : ""
        }
        ${
          state.riskCrisis
            ? `<div class="trust-crisis-banner" role="alert">${language === "en" ? "Trust crisis: recent risk-heavy choices made the team withhold information. Play steady scenarios to rebuild trust." : "信任危机：近期风险选择让团队开始保留信息。先完成稳健情境重建信任。"}</div>`
            : ""
        }
        <section class="lg-quest-banner" style="--dot:#41c7c0">
          <img src="./art/chapter-${chapter.id}.jpg" alt="" loading="lazy" />
          <div>
            <p class="eyebrow">${language === "en" ? "Leadership Game Center" : "领导力游戏中心"}</p>
            <h2>${language === "en" ? "Five games to train leadership judgment" : "五个游戏，练出领导力判断"}</h2>
            <p>${language === "en" ? `Wins ${save.leadershipGameWins} · Losses ${save.leadershipGameLosses}. Decision chess, game theory, resource allocation, team management, and crisis command.` : `胜 ${save.leadershipGameWins} · 负 ${save.leadershipGameLosses}。决策棋、博弈推演、资源分配、团队管理与危机指挥。`}</p>
            <button data-action="open-leadership-games">${language === "en" ? "Enter Game Center" : "进入游戏中心"}</button>
          </div>
        </section>
        ${
          state.resourceRecoveryNote
            ? `<div class="recovery-banner" role="status">${language === "en" ? "Daily resource recovery applied: +10 energy, +4 trust, +3 influence, +3 capital. Refreshes once per day when entering the map." : "今日资源恢复已生效：精力+10、信任+4、影响力+3、组织资源+3；每天首次进入地图时自动恢复一次。"}</div>`
            : ""
        }
        ${
          save.profile.resources.energy < 25 ||
          save.profile.resources.trust < 40 ||
          save.profile.resources.capital < 25
            ? `<div class="resource-crisis-banner" role="alert">${language === "en" ? "A key resource is low. Restore energy once per chapter, or play side quests to rebuild trust and capital before continuing." : "关键资源偏低：每章可深呼吸恢复一次精力，也可先做支线补充信任与组织资源，再继续主线。"}</div>`
            : ""
        }
        <section class="map-head">
          <div>
            <p class="eyebrow">${uiString(language, "mainQuest")}</p>
            <h1>${uiString(language, "campaignTitle")}</h1>
            <p class="muted">${uiString(language, "mapHint")}</p>
            <p class="muted chapter-count-hint">${language === "en" ? "Core 2/2 unlocks the next chapter; 7 extended scenarios add optional depth and rewards." : "完成每章前 2 个核心主线即可推进章节；另外 7 个主线扩展情境提供额外深度与奖励。"}</p>
          </div>
          <div class="resource-strip">
            ${resourceChips(language, save.profile)}
          </div>
        </section>
        <section class="chapter-track">
          ${CHAPTERS.map((item) => chapterBadge(language, save, state.selectedChapter, item)).join("")}
        </section>
        <section class="map-body">
          <div class="chapter-detail">
            <div class="chapter-title">
              <span class="chapter-code">${language === "en" ? `Chapter ${chapter.code}` : `第 ${chapter.code} 章`}</span>
              <h2>${chapterDisplay(language, chapter).title}</h2>
              <p>${chapterDisplay(language, chapter).subtitle}</p>
              <p class="chapter-main-progress">${language === "en" ? `Core ${coreDoneCount} / 2 · Extended ${extraDoneCount} / 7` : `核心 ${coreDoneCount} / 2 · 扩展 ${extraDoneCount} / 7`}</p>
            </div>
            <div class="expedition-chapter-card" style="--civ:${stageForChapter(chapter.id).color}">
              <span>${language === "en" ? `Stage · ${stageForChapter(chapter.id).nameEn}` : `阶段 · ${stageForChapter(chapter.id).nameZh}`}</span>
              <strong>${language === "en" ? stageForChapter(chapter.id).focusEn : stageForChapter(chapter.id).focusZh}</strong>
              <p>${escapeHtml(language === "en" ? stageForChapter(chapter.id).clueEn : stageForChapter(chapter.id).clueZh)}</p>
            </div>
            <div class="node-list">
              ${mainNodes.map((node) => nodeRow(node, save, language)).join("")}
            </div>
            ${
              chapterDone
                ? `
                  <section class="chapter-reflection">
                    <h3>${uiString(language, "chapterReflectionTitle")}</h3>
                    <p>${escapeHtml(chapterReflectionText(language, chapter.id))}</p>
                  </section>
                  ${
                    chapterPassed
                      ? ""
                      : `<p class="star-gate-warning">${language === "en" ? "This chapter did not reach one star. Retry it to unlock the next chapter." : "本章未达到一星，需重新挑战才能解锁下一章。"}</p>`
                  }
                  <button class="replay-chapter-button" data-action="replay-chapter" data-chapter="${chapter.id}">${uiString(language, "replayChapter")}</button>
                  ${
                    chapterPassed
                      ? ""
                      : `<button class="retry-chapter-button" data-action="retry-chapter" data-chapter="${chapter.id}">${language === "en" ? "Retry Chapter" : "重新挑战本章"}</button>`
                  }
                `
                : ""
            }
            ${chapterTrainingMarkup(language, save, chapter.id)}
            <section class="quest-board">
              <h3>${uiString(language, "sideQuestArcsTitle")}</h3>
              <p class="muted">${uiString(language, "sideQuestHint")}</p>
              ${SIDE_QUEST_ARCS.map((arc) => questArcMarkup(arc, save, language)).join("")}
            </section>
          </div>
          <aside class="map-side">
            <button
              class="map-collapse-toggle"
              data-action="toggle-map-detail"
              aria-expanded="${state.mapDetailOpen ? "true" : "false"}"
            >${language === "en"
              ? state.mapDetailOpen
                ? "Collapse extra panels"
                : "Show more panels"
              : state.mapDetailOpen
                ? "收起更多面板"
                : "展开更多面板"}</button>
            <div class="mini-panel next-step-panel">
              <h3>${uiString(language, "nextStepTitle")}</h3>
              <p>${escapeHtml(state.nextAdvice.text)}</p>
              ${
                state.nextAdvice.action
                  ? `<button data-action="${state.nextAdvice.action}" ${state.nextAdvice.ability ? `data-ability="${state.nextAdvice.ability}"` : ""}>${uiString(language, "nextStepAction")}</button>`
                  : ""
              }
            </div>
            ${npcCameoMarkup(language, save, chapter.id)}
            <div class="mini-panel power-panel">
              <h3>${language === "en" ? "Power Structure" : "权力架构"}</h3>
              <div class="power-track">
                ${CHAPTERS.map((item) => {
                  const done = isChapterComplete(save, item.id);
                  const civ = stageForChapter(item.id);
                  const title = escapeAttr(language === "en" ? civ.focusEn : civ.focusZh);
                  return `<span class="${done ? "found" : "missing"} power-frag-wrap" title="${title}" style="--dot:${civ.color}">
                    <img class="power-frag" src="${artAsset(`power-stage-${item.id}`)}" alt="${title}" onerror="this.style.display='none'" loading="lazy" />
                    <span class="power-frag-text">${done ? "✓" : "○"}</span>
                  </span>`;
                }).join("")}
              </div>
              <p class="muted">${language === "en" ? "Each completed chapter advances the power structure." : "每完成一章，权力架构就推进一段。"}</p>
            </div>
            <div class="mini-panel investment-panel">
              <h3>${language === "en" ? "Reinvest in the Organization" : "组织再投资"}</h3>
              <p class="muted">${language === "en" ? "Spend 25 organizational resources to gain trust, influence, and mastery; every third investment upgrades production capacity." : "消耗 25 点组织资源，换取信任、影响力和修炼点；每 3 次触发一次产能升级。"}</p>
              <p class="muted">${language === "en" ? `Invested ${save.organizationInvestments ?? 0} times` : `已投资 ${save.organizationInvestments ?? 0} 次`}</p>
              <button data-action="organizational-invest" ${save.profile.resources.capital < 25 ? "disabled" : ""}>${language === "en" ? "Invest 25" : "投资 25"}</button>
            </div>
            <div class="mini-panel production-panel">
              <h3>${language === "en" ? "Daily Production" : "每日产能"}</h3>
              <p class="muted">${language === "en" ? "Complete 3 decisions today, then claim resources." : "今天完成 3 次决策后领取资源奖励。"}</p>
              <div class="production-progress">
                <span style="width:${Math.min(100, ((save.productionCount ?? 0) / 3) * 100)}%"></span>
              </div>
              <p class="muted">${save.productionCount ?? 0} / 3</p>
              <button data-action="claim-production" ${state.productionReady ? "" : "disabled"}>${language === "en" ? "Claim Rewards" : "领取产能奖励"}</button>
            </div>
            <div class="mini-panel role-objective">
              <h3>${uiString(language, "roleObjective")}</h3>
              <p>${language === "en" ? ROLE_EN[save.profile.role].objective : ROLES[save.profile.role].objective}</p>
            </div>
            <div class="mini-panel mobile-collapse">
              <h3>${uiString(language, "situation")}</h3>
              <p>${language === "en" ? `Completed ${summary.chapterCount}/9 chapters, ${save.completedSideQuests.length}/${SIDE_QUEST_ARCS.reduce((count, arc) => count + arc.nodes.length, 0)} side quests, ${save.completedRandomEvents.length} random events. Latest decision: ${state.latestDecision}.` : `已完成 ${summary.chapterCount}/9 章，支线 ${save.completedSideQuests.length}/${SIDE_QUEST_ARCS.reduce((count, arc) => count + arc.nodes.length, 0)}，随机事件 ${save.completedRandomEvents.length}，最近决策 ${state.latestDecision}。`}</p>
            </div>
            <div>${difficultySelector(save, language)}</div>
            <div class="challenge-panel">
              <h3>${uiString(language, "dailyTitle")}</h3>
              ${dailyChallenges(save)
                .map(
                  (challenge) => {
                    const today = todayKey();
                    const claimedToday = (save.claimedDaily[today] ?? []).includes(challenge.id);
                    const view = challengeDisplay(language, challenge);
                    return `
                    <div class="challenge-row ${challenge.done ? "done" : ""}">
                      <div>
                        <strong>${escapeHtml(view.title)}</strong>
                        <small>${challengeCategoryLabel(language, challenge.category)}</small>
                        <span>${challenge.current} / ${challenge.target}</span>
                        <p>${escapeHtml(view.description)}</p>
                      </div>
                      ${
                        challenge.done && !claimedToday
                          ? `<button data-action="claim-challenge" data-challenge="${challenge.id}">${uiString(language, "claim")}${challenge.reward}</button>`
                          : claimedToday
                            ? `<small>${uiString(language, "claimed")}</small>`
                            : `<small>${uiString(language, "inProgress")}</small>`
                      }
                    </div>
                  `;
                  }
                )
                .join("")}
            </div>
            <div class="challenge-panel weekly-panel mobile-collapse">
              <h3>${language === "en" ? "Weekly Focus" : "本周聚焦"}</h3>
              <p class="muted">${language === "en" ? "One leadership theme per week, not daily chores." : "每周一个领导力主题，少而精。"}</p>
              <p class="muted">${language === "en" ? `Week ${weekKey()} · resets in ${Math.max(0, Math.ceil((weekEndsAt() - Date.now()) / 3600000))}h` : `本周 ${weekKey()} · ${Math.max(0, Math.ceil((weekEndsAt() - Date.now()) / 3600000))} 小时后重置`}</p>
              ${weeklyChallenges(save)
                .map(
                  (challenge) => `
                    <div class="challenge-row ${challenge.done ? "done" : ""}">
                      <div>
                        <strong>${escapeHtml(challengeDisplay(language, challenge).title)}</strong>
                        <small>${challengeCategoryLabel(language, challenge.category)}</small>
                        <span>${challenge.current} / ${challenge.target}</span>
                        <p>${escapeHtml(challengeDisplay(language, challenge).description)}</p>
                      </div>
                      ${
                        (save.claimedWeekly?.[weekKey()] ?? []).includes(
                          challenge.id
                        )
                          ? `<small>${uiString(language, "claimed")}</small>`
                          : challenge.done
                            ? `<button data-action="claim-weekly" data-challenge="${challenge.id}">${uiString(language, "claim")}${challenge.reward}</button>`
                            : `<small>${uiString(language, "inProgress")}</small>`
                      }
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="random-event-panel">
              <h3>${uiString(language, "randomEvent")}</h3>
              ${
                availableRandom
                  ? `
                    <p>${uiString(language, "randomAvailable")}</p>
                    <button data-action="open-node" data-node="${availableRandom}">${uiString(language, "handleRandomEvent")}</button>
                  `
                  : `
                    <p class="muted">${uiString(language, "randomDone")}</p>
                    <button data-action="rotate-events">${language === "en" ? "Rotate Event Pool" : "轮转事件池"}</button>
                  `
              }
            </div>
            <div class="event-book-panel mobile-collapse">
              <h3>${language === "en" ? "Event Log" : "事件簿"}</h3>
              <p class="muted">${
                language === "en"
                  ? `Completed ${save.completedRandomEvents.length} / ${randomEventEligibleCount(save)} random events for your role and difficulty`
                  : `已完成 ${save.completedRandomEvents.length} / ${randomEventEligibleCount(save)} 个当前角色与难度可触发事件`
              }</p>
              <div class="event-book-list">
                ${RANDOM_EVENT_IDS.map((id) => {
                  const done = save.completedRandomEvents.includes(id);
                  const meta = RANDOM_EVENT_META[id];
                  const roleLocked = Boolean(
                    meta?.roles && !meta.roles.includes(save.profile.role)
                  );
                  const difficultyLocked = Boolean(
                    meta?.difficulties &&
                      !meta.difficulties.includes(save.difficulty)
                  );
                  let title = id;
                  try {
                    title = storyNodeDisplay(language, save, getNode(id)).title;
                  } catch {
                    // keep id
                  }
                  const lockLabel = roleLocked
                    ? language === "en"
                      ? "role-only"
                      : "限角色"
                    : difficultyLocked
                      ? language === "en"
                        ? "difficulty-only"
                        : "限难度"
                      : "";
                  return `<span class="${done ? "done" : ""}" title="${escapeAttr(title)}">${done ? "✓" : "○"}${escapeHtml(title)}${lockLabel ? `<em>${lockLabel}</em>` : ""}</span>`;
                }).join("")}
              </div>
            </div>
            <div class="mini-panel mobile-collapse">
              <h3>${uiString(language, "currentProgress")}</h3>
              <strong>${summary.chapterCount} / 9</strong>
              <p>${uiString(language, "totalAbility")} ${summary.total}</p>
            </div>
            <div class="mini-panel mobile-collapse">
              <h3>${uiString(language, "unlockedTitle")}</h3>
              <p>${save.unlockedChapters.map((id) => chapterDisplay(language, getChapter(id)).title).join(language === "en" ? ", " : "、")}</p>
            </div>
            <div class="map-quick-actions">
              <button class="primary" data-action="open-report">${uiString(language, "viewReport")}</button>
              <button data-action="open-duel">${uiString(language, "enterDuel")}</button>
              <button data-action="open-ability">${uiString(language, "ability")}</button>
            </div>
          </aside>
        </section>
      </main>
    `;
}
