import { profileSummary } from "../core/game";
import { uiString, type Language } from "../core/i18n";
import { NPCS, npcRelation } from "../core/npcs";
import type { SaveState } from "../core/types";
import { artAsset } from "./assets";
import { rankName } from "./display";
import { escapeHtml } from "./escape";

export interface MenuViewState {
  muted: boolean;
  latestDecision: string;
  dueReviewBanner: string;
  guideSteps: string[];
  showBackupHint: boolean;
}

function sandboxCounts(save: SaveState): {
  establishedCount: number;
  knownCount: number;
  unmetCount: number;
  sandboxChapter: number;
} {
  const relationRows = NPCS.map((npc) => ({
    npc,
    relation: npcRelation(save, npc)
  }));
  const establishedCount = relationRows.filter(
    (row) => row.relation.status === "已建立关系"
  ).length;
  const knownCount = relationRows.filter(
    (row) => row.relation.status === "存在线索"
  ).length;
  return {
    establishedCount,
    knownCount,
    unmetCount: NPCS.length - establishedCount - knownCount,
    sandboxChapter: save.unlockedChapters.at(-1) ?? 1
  };
}

export function menuSandboxCaption(save: SaveState, language: Language): string {
  const started = save.profileCreated;
  const { establishedCount, knownCount, unmetCount, sandboxChapter } =
    sandboxCounts(save);
  return started
    ? language === "en"
      ? `Chapter ${sandboxChapter} · Established ${establishedCount} · Leads ${knownCount} · Unmet ${unmetCount}`
      : `第 ${sandboxChapter} 章 · 已建立 ${establishedCount} · 线索 ${knownCount} · 未接触 ${unmetCount}`
    : language === "en"
      ? "Create a profile and make your first choice to light up this map"
      : "创建档案并完成第一次选择后，这张地图会开始亮起来";
}

export function menuView(
  save: SaveState,
  language: Language,
  state: MenuViewState
): string {
  const en = language === "en";
  const summary = profileSummary(save);
  const started = save.profileCreated;
  const { establishedCount, knownCount, unmetCount, sandboxChapter } =
    sandboxCounts(save);
  const lastDecision = save.decisionHistory[save.decisionHistory.length - 1];
  const sandboxCaption = menuSandboxCaption(save, language);
  const sandboxLive =
    lastDecision && started
      ? en
        ? `Latest judgment: ${state.latestDecision}. The graph updates as relationships gain or lose trust.`
        : `最近判断：${state.latestDecision}。人物关系正随信任变化实时更新。`
      : en
        ? "No decisions yet. Every choice redraws the connection between you and key people."
        : "还没有决策。每一次选择，都会重新绘制你与关键人物之间的连接。";
  const card = (
    action: string,
    art: string,
    index: string,
    titleZh: string,
    titleEn: string,
    descZh: string,
    descEn: string,
    extra = ""
  ) => `
    <button class="menu-card has-art" data-action="${action}" ${extra}>
      <img class="menu-card-cover" src="${artAsset(art)}" alt="" loading="lazy" onerror="this.style.display='none'" />
      <span class="menu-card-mask"></span>
      <span class="card-index">${index}</span>
      <h2>${en ? titleEn : titleZh}</h2>
      <p>${en ? descEn : descZh}</p>
    </button>`;
  const group = (
    index: string,
    titleZh: string,
    titleEn: string,
    descZh: string,
    descEn: string,
    cards: string
  ) => `
    <section class="menu-group">
      <header class="menu-group-head">
        <span class="menu-group-index">${index}</span>
        <div>
          <h2>${en ? titleEn : titleZh}</h2>
          <p>${en ? descEn : descZh}</p>
        </div>
      </header>
      <div class="menu-group-grid">${cards}</div>
    </section>`;
  const personalCards = [
    save.lastStoryNodeId
      ? `<button class="menu-card resume-card has-art" data-action="resume-last-node">
          <img class="menu-card-cover" src="${artAsset("menu-card-00")}" alt="" loading="lazy" onerror="this.style.display='none'" />
          <span class="menu-card-mask"></span>
          <span class="card-index">00</span>
          <h2>${uiString(language, "menuResume")}</h2>
          <p>${uiString(language, "resumeHint")}</p>
        </button>`
      : "",
    card("open-map", "menu-card-01", "01", uiString(language, "mainQuest"), "Campaign", "九章权力架构，18 个真实职场情境，每一次选择都在改变你的能力图谱。", "Nine chapters of power, 18 real workplace scenarios, and choices that reshape your ability map.", 'aria-keyshortcuts="M"'),
    card("open-duel", "menu-card-02", "02", uiString(language, "duel"), "1v1 Duel", "AI 陪练、本地双人或远程对战，用情境高尔夫基准判断谁更能应对复杂局势。", "AI practice, local duo, or remote duels use scenario-golf baselines to judge who handles complexity better.", 'aria-keyshortcuts="D"'),
    card("open-leadership-games", "menu-card-10", "03", "领导力游戏", "Leadership Games", "五个精品小游戏：教学、训练、对战、复盘、成就与逐级难度。", "Five polished mini-games with teaching, training, battle, review, achievements, and increasing difficulty."),
    card("open-ability", "menu-card-03", "04", uiString(language, "ability"), "Ability Map", "十项能力、五级段位、经典理论支撑，随时查看你的优势、短板和成长路径。", "Ten abilities, five ranks, and classic theory support let you see strengths, gaps, and growth paths.", 'aria-keyshortcuts="A"'),
    card("open-report", "menu-card-04", "05", uiString(language, "report"), "Review Report", "从游戏表现反推训练建议，把决策反馈迁移回真实工作。", "Turn in-game performance into training advice you can transfer back to real work.", 'aria-keyshortcuts="R"'),
    card("open-trial", "menu-card-07", "06", uiString(language, "trialTitle"), "Trial Grounds", "消耗精力挑战高难案例，用能力门槛解锁关卡、工具和 MBA 级案例。", "Spend energy on demanding cases, break through ability gates, and unlock tools and MBA-level cases."),
    card("open-achievements", "menu-card-05", "07", uiString(language, "achievements"), "Achievements", "追踪章节、支线、测评、1v1 与能力段位的完成进度。", "Track chapters, side quests, assessments, duels, and rank milestones."),
    card("open-relations", "menu-card-06", "08", uiString(language, "relations"), "Relations", "查看主线与支线中结识的关键人物，以及关系是否已经转化为组织能力。", "See key people from the campaign and side quests, and whether those relationships became organizational capability.")
  ].join("");
  const groupCards = [
    card("open-team-academy", "menu-card-10", "01", "团队管理训练营", "Team Academy", "三类角色、108 个情境，用情境→公式→练习→作业闭环提升团队管理能力。", "Three roles, 108 scenarios, and a scenario-to-homework learning loop for team management."),
    card("open-duel", "menu-card-02", "02", "双人/远程对练", "Local & Remote Duels", "本地双人轮流、远程邀请码对战，用对决大厅直接开房间。", "Take turns on one device or duel remotely with invite codes from the same lobby."),
    card("open-leadership-games", "menu-card-10", "03", "领导力对战", "Leadership Battle", "教学、训练、对战与复盘一体，适合两人或小组轮流上场。", "Teach, train, battle, and review together, built for pairs and small groups.")
  ].join("");
  const trainerCards = [
    card("open-coach", "menu-card-10", "01", "教练工作坊", "Coach Workshop", "导入学员存档，对比小组雷达，找出决策盲区，生成可执行的工作坊流程。", "Import team saves, compare group radar, surface decision blind spots, and plan a facilitated workshop."),
    card("open-custom-scenarios", "menu-card-10", "02", "情境工坊", "Scenario Workshop", "写下真实职场两难，校验专家/部分/风险结构，再与团队一起试玩复盘。", "Write a real workplace dilemma, validate the expert/partial/risk structure, and play it with your team.")
  ].join("");
  const systemCards = [
    card("open-settings", "menu-card-08", "01", uiString(language, "settingsTitle"), "Settings", "统一管理声音、语言、难度、存档数据与操作说明。", "Sound, language, difficulty, save data, and help in one place."),
    card("open-profile", "menu-card-09", "02", "角色档案", "Role Archives", "空降、创业、高潜三套档案独立保存，随时切换，不再删档。", "Keep every role's save and switch between parachute, founder, and high potential without deleting progress.")
  ].join("");
  const groups = [
    group("01", "个人训练", "Personal Training", "主线、AI 对练、小游戏与个人复盘，完成从判断到成长的闭环。", "Campaign, AI duels, mini-games and reviews for your personal leadership loop.", personalCards),
    group("02", "团体训练", "Group Training", "两人或小组一起练：团队课程、同屏轮流、远程开房和领导力小游戏。", "Practice together as a pair or group: team courses, same-screen turns, remote rooms, and leadership mini-games.", groupCards),
    group("03", "培训师模块", "Trainer Hub", "面向培训师：导入小组存档、生成工作坊流程、校验并共创真实案例。", "For facilitators: import team saves, build workshop agendas, validate and co-create real cases.", trainerCards),
    group("04", "系统设置", "System & Settings", "声音、语言、难度、存档数据与操作说明统一管理。", "Sound, language, difficulty, save data and help in one place.", systemCards)
  ].join("");

  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link sound-toggle" data-action="toggle-sound" aria-label="${en ? "Toggle sound" : "切换声音"}" title="${en ? "Toggle sound" : "切换声音"}"><span aria-hidden="true">${state.muted ? "🔇" : "🔊"}</span>${state.muted ? uiString(language, "soundOff") : uiString(language, "soundOn")}</button>
      <button class="link language-toggle" data-action="toggle-language" aria-label="${en ? "Switch language" : "切换语言"}" title="${en ? "Switch language" : "切换语言"}"><span aria-hidden="true">🌐</span>${uiString(language, "language")}</button>
      <div class="topbar-meta">
        <span>${started ? save.profile.name : "未建档"}</span>
        <span>${rankName(language, summary.rank)}</span>
      </div>
    </header>
    <main class="menu-shell" aria-label="${en ? "Main menu" : "主菜单"}">
      <img class="menu-bg" src="./bg/bg-main-menu.jpg" alt="" aria-hidden="true">
      <section class="hero-strip">
        <div class="hero-copy">
          <p class="eyebrow">${en ? "Adaptive Leadership Scenario Game" : "自适应领导力情境游戏"}</p>
          <h1>${started ? uiString(language, "menuContinue") : uiString(language, "menuTitle")}</h1>
          <p>${en ? "Based on The Book of Power, Heifetz adaptive leadership, and scenario-golf scoring, the campaign, side quests, and 1v1 duels train people reading, talent placement, influence, power strategy, execution, and self-evolution." : "基于《权经》九章架构、Heifetz 自适应领导力与情境高尔夫方法，通过主线剧情、支线任务和 1v1 对决，训练识人、用人、驭人、谋权、掌权、固权与自我进化能力。"}</p>
          <div class="hero-actions">
            ${!started ? `<button class="hero-start-hint" data-action="open-profile">${en ? "New here? Create a profile and make your first decision" : "新玩家从这里开始：创建档案，完成第一次选择"}</button>` : ""}
            ${!started ? `<button class="trial-now" data-action="start-trial-chapter">${en ? "Play Chapter 1 now" : "立即试玩第一章"}</button>` : ""}
            <button class="primary" data-action="${started ? "open-map" : "open-profile"}">${started ? uiString(language, "menuContinue") : uiString(language, "createProfile")}</button>
            <button data-action="open-duel">${uiString(language, "enterDuel")}</button>
          </div>
        </div>
        <div class="rank-panel">
          <span class="rank-name">${rankName(language, summary.rank)}</span>
          <strong>${summary.total}</strong>
          <span class="rank-caption">${started ? uiString(language, "totalAbility") : en ? "Baseline · grows with decisions" : "初始基线 · 随决策成长"}</span>
          <div class="rank-meter"><i style="width:${Math.min(100, (summary.total / 60) * 100)}%"></i></div>
          <p title="${en ? "A chapter counts after both main scenarios are completed" : "完成本章全部主线情境后才会计入通关"}">${en ? `Completed ${summary.chapterCount} / 9 chapters` : `已通关 ${summary.chapterCount} / 9 章`}</p>
        </div>
      </section>
      ${
        started && state.showBackupHint
          ? `
            <section class="backup-hint">
              <div>
                <strong>${en ? "Your progress lives in this browser" : "进度仅保存在当前浏览器"}</strong>
                <p>${en ? "Export your save or copy the save link after each session so clearing the cache never loses progress." : "每次游玩后导出存档或复制存档链接，清缓存也不怕丢进度。"}</p>
              </div>
              <div class="backup-hint-actions">
                <button data-action="export-save">${uiString(language, "exportSave")}</button>
                <button data-action="copy-save-link">${uiString(language, "copySaveLink")}</button>
                <button data-action="dismiss-backup-hint">${en ? "Got it" : "知道了"}</button>
              </div>
            </section>
          `
          : ""
      }
      ${state.dueReviewBanner}
      ${
        started && save.playCount === 0
          ? `
            <section class="first-run-guide interactive-guide">
              <strong>${en ? "Three guided tasks" : "三个引导任务"}</strong>
              <p class="muted">${en ? "Finish all three to earn +2 mastery." : "完成全部三项可获得 +2 修炼点。"}</p>
              <div class="guide-tasks">
                <button data-action="guide-ability" ${state.guideSteps.includes("ability") ? "disabled" : ""}>${en ? "1. Open Ability Map" : "1. 查看能力图谱"}${state.guideSteps.includes("ability") ? " ✓" : ""}</button>
                <button data-action="open-map" ${state.guideSteps.includes("map") ? "disabled" : ""}>${en ? "2. Finish your first decision" : "2. 完成第一次决策"}${state.guideSteps.includes("map") ? " ✓" : ""}</button>
                <button data-action="open-report" ${state.guideSteps.includes("report") ? "disabled" : ""}>${en ? "3. Open the Review Report" : "3. 查看复盘报告"}${state.guideSteps.includes("report") ? " ✓" : ""}</button>
              </div>
              ${state.guideSteps.length >= 3 ? `<p class="guide-done">${en ? "Guide complete" : "引导完成"}</p>` : ""}
            </section>
          `
          : ""
      }
      <section class="scene-art">
        <button
          class="power-board-hit"
          data-action="open-relations"
          aria-label="${en ? "Open the live power relationship sandbox" : "打开实时权力关系沙盘"}"
        >
          <canvas class="power-board" id="power-board"></canvas>
        </button>
        <div class="scene-caption">
          <strong>${en ? "Power Relationship Sandbox" : "权力关系沙盘"}</strong>
          <span>${escapeHtml(sandboxCaption)}</span>
          <p class="scene-live">${escapeHtml(sandboxLive)}</p>
          <div class="scene-legend">
            <span><i class="legend-dot gold"></i>${en ? "Established" : "已建立关系"}</span>
            <span><i class="legend-dot teal"></i>${en ? "Lead found" : "存在线索"}</span>
            <span><i class="legend-dot gray"></i>${en ? "Not contacted" : "尚未接触"}</span>
          </div>
          <button data-action="open-relations">${en ? "Open Relationship Map" : "查看人物关系"}</button>
        </div>
      </section>
      <section class="menu-groups" aria-label="${en ? "Training modules" : "训练模块"}">
        ${groups}
      </section>
    </main>
  `;
}
