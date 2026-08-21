import {
  ABILITIES,
  ABILITY_ORDER,
  ROLES,
  RESOURCE_NAMES,
  abilityLevel
} from "../core/abilities";
import {
  NODE_INTEL,
  getChapter,
  getNode,
  getNodeForRole
} from "../core/story";
import { chapterNarrative } from "../core/chapterNarrative";
import { stageForChapter, reconMoments } from "../core/expedition";
import { NPCS } from "../core/npcs";
import { npcStoryFor } from "../core/npcStories";
import { scenarioCoachHint } from "../core/coach-hints";
import {
  proceduralNarrativeFor,
  scenarioShellFor
} from "../core/scenarioShell";
import { EXPANDED_TRAINING } from "../core/trainingExtras";
import { EXPANDED_TRAINING_EN } from "../core/trainingExtrasEn";
import { optionGateFor } from "../core/game";
import { dominantMirror } from "../core/historyMirrors";
import { uiString, type Language } from "../core/i18n";
import { ROLE_EN } from "../core/translations";
import type {
  AbilityId,
  ChoiceOutcome,
  ResourceKey,
  SaveState,
  StoryNode
} from "../core/types";
import {
  abilityDisplay,
  abilityDetailDisplay,
  chapterDisplay,
  nodeIntel,
  npcAvatarColor,
  npcDisplay,
  qualityLabel,
  resourceChips,
  resourceDisplay,
  roleDisplay,
  roleMove
} from "./display";
import { escapeHtml, formatDelta } from "./escape";
import { artAsset, chapterArtStyle } from "./assets";
import { storyNodeDisplay } from "./nodeView";
import {
  optionCostSummary,
  primaryAbilityForOption,
  storyOptionOrder
} from "./storyMarkup";

export interface StoryViewState {
  storyNodeId: string;
  replayMode: boolean;
  interferenceText: string | undefined;
  storyHintRevealed: boolean;
  lastTimedOut: boolean;
  energyRestoreUsed: number;
  integrityGateNodeId: string | undefined;
  lastOutcome: ChoiceOutcome | undefined;
  lastOutcomeNodeId: string | undefined;
  pendingIntegrityOption: number | undefined;
  integrityGateMode: "cost" | "ability";
  pendingChapterTransition: number | undefined;
  pendingForkNodeId: string | undefined;
  pendingBranchNodeId: string | undefined;
  lastUnlockedAchievement: string | undefined;
  wrongReviewQueue: string[];
  wrongReviewIndex: number;
  riskCrisis: boolean;
}

function expertStreak(save: SaveState): number {
  let streak = 0;
  for (let i = save.decisionHistory.length - 1; i >= 0; i -= 1) {
    if (save.decisionHistory[i].quality === "expert") {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function storyAdvancementText(
  language: Language,
  outcome: ChoiceOutcome,
  storyNodeId: string,
  pendingBranchNodeId: string | undefined
): string {
  const en = language === "en";
  let kind = "main";
  try {
    kind = getNode(storyNodeId).kind;
  } catch {
    // keep main
  }
  if (kind === "side") {
    return en
      ? "Side story advances: this relationship moved one step forward."
      : "支线剧情推进：你与这个人的关系向前走了一步。";
  }
  if (kind === "branch" || pendingBranchNodeId) {
    return en
      ? "The story is branching: your choice is opening a new route."
      : "剧情分叉：你的选择正在打开一条新路线。";
  }
  if (outcome.option.quality === "expert") {
    return en
      ? "The story advances: key people begin trusting you, and new information opens."
      : "剧情推进：关键人物开始信任你，新的信息向你开放。";
  }
  if (outcome.option.quality === "partial") {
    return en
      ? "The story holds steady, but the real tension is still unresolved."
      : "剧情暂时稳住，但真正的悬念还没有解开。";
  }
  return en
    ? "The story shifts: your strong signal changed the situation, and the cost begins to show."
    : "剧情转向：你用强信号改变了局面，代价也开始显现。";
}

function sixPartReviewMarkup(
  save: SaveState,
  language: Language,
  outcome: ChoiceOutcome,
  lastOutcomeNodeId: string | undefined,
  storyNodeId: string
): string {
  const en = language === "en";
  const nodeId = lastOutcomeNodeId ?? storyNodeId;
  let node: StoryNode | null = null;
  try {
    node = storyNodeDisplay(
      language,
      save,
      getNodeForRole(save.profile.role, nodeId)
    );
  } catch {
    node = null;
  }
  if (!node) return "";
  const intel = NODE_INTEL[node.id] ?? [];
  const expert = node.options.find((option) => option.quality === "expert");
  const quality = outcome.option.quality;
  const lesson =
    quality === "expert"
      ? en
        ? "Replicate this pattern in the next similar situation: diagnose first, act second, and keep a verifiable standard."
        : "把这一判断复制到下一个相似情境：先诊断、再行动，用可验证标准守住结果。"
      : quality === "partial"
        ? en
          ? "You solved part of it. Hand the responsibility and verification node back instead of carrying the team alone."
          : "你解决了一半；下一步把责任和验证节点还回去，而不是继续替团队扛。"
        : en
          ? "Stop the loss first, then review. Confirm key information and trust before using authority or risk again."
          : "先止损再复盘；下一次先确认关键信息和信任，再动用权威或冒险。";
  return `
      <details class="six-part-review">
        <summary>${en ? "Six-Part Review" : "六段式复盘"}</summary>
        <dl>
          <div>
            <dt>${en ? "Situation" : "现场"}</dt>
            <dd>${escapeHtml(node.context)}</dd>
          </div>
          <div>
            <dt>${en ? "Intel" : "情报"}</dt>
            <dd>${intel.length ? `<ul>${intel.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : escapeHtml(node.stake)}</dd>
          </div>
          <div>
            <dt>${en ? "Trade-off" : "取舍"}</dt>
            <dd>${escapeHtml(outcome.option.label)} · ${escapeHtml(outcome.option.summary)}</dd>
          </div>
          <div>
            <dt>${en ? "Outcome" : "结果"}</dt>
            <dd>${escapeHtml(outcome.option.feedback)}</dd>
          </div>
          <div>
            <dt>${en ? "Comparison" : "对比"}</dt>
            <dd>${en ? `Your move: ${qualityLabel(language, quality)}` : `你的选择：${qualityLabel(language, quality)}`}${expert ? ` · ${en ? "Expert baseline" : "专家基准"}：${escapeHtml(expert.label)}` : ""}</dd>
          </div>
          <div>
            <dt>${en ? "Lesson" : "教训"}</dt>
            <dd>${escapeHtml(lesson)}</dd>
          </div>
        </dl>
      </details>
    `;
}

// 情感钩子：把本次决策与一个具体 NPC 的后果挂钩，复用人物档案的 storyNote。
function npcEchoMarkup(
  save: SaveState,
  language: Language,
  outcome: ChoiceOutcome,
  storyNodeId: string
): string {
  let node: StoryNode;
  try {
    node = getNodeForRole(save.profile.role, storyNodeId);
  } catch {
    return "";
  }
  const npc = NPCS.find(
    (candidate) =>
      candidate.nodeId === storyNodeId ||
      (candidate.nodeId.startsWith("c") &&
        Number(candidate.nodeId.slice(1, 2)) === node.chapterId)
  );
  if (!npc) return "";
  const view = npcDisplay(language, npc);
  const story = npcStoryFor(npc.id);
  const note =
    language === "en"
      ? (story?.storyNoteEn ?? view.description)
      : (story?.storyNoteZh ?? view.description);
  const label = outcome.option.label;
  const quality = outcome.option.quality;
  const echo =
    quality === "expert"
      ? language === "en"
        ? `After "${label}" took effect, ${view.name} sought you out alone and put a judgment they had kept private on the table. ${note}`
        : `「${label}」落地后，${view.name}在会后单独找到你，把一个原本只藏在心里的判断放到了桌面上。${note}`
      : quality === "partial"
        ? language === "en"
          ? `"${label}" earned a nod from ${view.name}, but a hesitation stayed in their eyes. ${note}`
          : `「${label}」让${view.name}暂时点了点头，但眼神里还留着没说完的保留。${note}`
        : language === "en"
          ? `"${label}" left ${view.name} quiet for a moment. ${note} — winning this person back starts with listening first.`
          : `「${label}」让${view.name}沉默了片刻。${note}——要让这个人重新靠近，需要你下一次先倾听。`;
  return `
      <div class="npc-echo" style="--dot:${npcAvatarColor(npc.id)}">
        <span>${language === "en" ? "Narrative Echo" : "叙事回响"}</span>
        <p>${escapeHtml(echo)}</p>
      </div>
    `;
}

function abilityShiftDetailMarkup(
  language: Language,
  outcome: ChoiceOutcome
): string {
  const en = language === "en";
  const rows = outcome.gainedAbilityIds.map((id, index) => {
    const delta = outcome.option.effects[id] ?? 0;
    const detail = abilityDetailDisplay(language, id);
    const sub = detail.subSkills[index % Math.max(1, detail.subSkills.length)];
    return `
      <div class="ability-shift-row ${delta < 0 ? "negative" : ""}">
        <span style="--dot:${ABILITIES[id].color}"></span>
        <strong>${abilityDisplay(language, id).name}</strong>
        <em>${escapeHtml(sub)}</em>
        <b>${formatDelta(delta)}</b>
      </div>
    `;
  });
  if (!rows.length) return "";
  return `
    <section class="ability-shift-detail">
      <h3>${en ? "Ability Shifts" : "能力涨落"}</h3>
      ${rows.join("")}
    </section>
  `;
}

function coachEyeText(language: Language, outcome: ChoiceOutcome): string {
  const en = language === "en";
  if (outcome.option.quality === "expert") {
    return en
      ? "What evidence made you trust this move? Write down the one step you would repeat next time."
      : "是哪个证据让你敢这样选？把下次要复制的那个步骤写下来。";
  }
  if (outcome.option.quality === "partial") {
    return en
      ? "You solved part of it. Which person or assumption is still untested?"
      : "你解决了一半。还有哪个人的反应、哪个假设没有被验证？";
  }
  return en
    ? "What did you act on before verifying? What would you confirm first next time?"
    : "你刚才是在什么还没验证的情况下行动的？下一次你会先确认什么？";
}

function historyMirrorCardMarkup(
  language: Language,
  outcome: ChoiceOutcome
): string {
  const en = language === "en";
  const mirror = dominantMirror(outcome.option.effects);
  return `
    <section class="history-mirror-card">
      <span>${en ? "History Mirror" : "历史镜鉴"}</span>
      <h3>${escapeHtml(mirror.title)}</h3>
      <p class="mirror-source">${escapeHtml(mirror.source)}</p>
      <blockquote>${escapeHtml(mirror.quote)}</blockquote>
      <p class="mirror-lesson">${escapeHtml(en ? mirror.lessonEn : mirror.lessonZh)}</p>
    </section>
  `;
}

function perspectiveContextNote(
  save: SaveState,
  language: Language
): string {
  const perspective = save.profile.perspective;
  if (!perspective) return "";
  return language === "en"
    ? perspective === "female"
      ? " As a female leader, the room may read you differently; weigh those signals."
      : " As a male leader, the room may read you differently; weigh those signals."
    : perspective === "female"
      ? " 作为女性管理者，会议室的眼光可能不同：把这些信号读进判断里。"
      : " 作为男性管理者，会议室的眼光可能不同：把这些信号读进判断里。";
}

function outcomeMarkup(
  save: SaveState,
  language: Language,
  outcome: ChoiceOutcome,
  state: StoryViewState
): string {
  const option = outcome.option;
  const transitionId = state.pendingChapterTransition;
  const forkId = state.pendingForkNodeId;
  const action = forkId
    ? "finish-fork"
    : transitionId
      ? "continue-transition"
      : state.pendingBranchNodeId
        ? "continue-branch"
        : "continue-story";
  const actionLabel = forkId
    ? language === "en"
      ? "Finish Fork"
      : "完成分叉"
    : transitionId
      ? language === "en"
        ? "View Chapter Transition"
        : "查看章节过渡"
      : state.pendingBranchNodeId
        ? language === "en"
          ? state.pendingBranchNodeId.startsWith("ability-")
            ? "Enter Advanced Review"
            : "Enter Role Branch"
          : state.pendingBranchNodeId.startsWith("ability-")
            ? "进入高阶复盘"
            : "进入角色分岔"
        : language === "en"
          ? "Back to Map"
          : "返回地图";
  const reviewActive = state.wrongReviewQueue.length > 0;
  const finalAction = reviewActive ? "next-wrong-review" : action;
  const finalLabel = reviewActive
    ? state.wrongReviewIndex + 1 >= state.wrongReviewQueue.length
      ? language === "en"
        ? "Finish Review"
        : "完成回练"
      : language === "en"
        ? "Next Missed Move"
        : "下一道错题"
    : actionLabel;
  const streak = expertStreak(save);
  const encouragement =
    option.quality === "expert"
      ? streak >= 2
        ? language === "en"
          ? `Expert streak x${streak}. You are finding your decision rhythm.`
          : `连续专家判断 x${streak}，你已经找到自己的判断节奏！`
        : language === "en"
          ? "Precise read. Keep this rhythm."
          : "这一手判断精准，保持这个节奏。"
      : option.quality === "partial"
        ? language === "en"
          ? "Good direction; make the next step steadier."
          : "方向不错，下一步可以更稳。"
        : language === "en"
          ? "You acted under pressure; that courage is part of leadership."
          : "你敢于在高压中行动，这份胆识也是领导力的一部分。";
  return `
      <section class="outcome-panel" role="status" aria-live="polite">
        <span class="quality ${option.quality}">${qualityLabel(language, option.quality)}</span>
        <div class="positive-feedback">${encouragement}</div>
        <div class="story-advancement ${option.quality}">${storyAdvancementText(language, outcome, state.storyNodeId, state.pendingBranchNodeId)}</div>
        ${
          state.lastUnlockedAchievement
            ? `<div class="achievement-unlock">${language === "en" ? "Achievement Unlocked: " : "新成就解锁："}${escapeHtml(state.lastUnlockedAchievement)}</div>`
            : ""
        }
        <h2>${escapeHtml(option.label)}</h2>
        <p>${escapeHtml(option.feedback)}</p>
        ${npcEchoMarkup(save, language, outcome, state.lastOutcomeNodeId ?? state.storyNodeId)}
        <blockquote>${escapeHtml(option.theory)}</blockquote>
        ${sixPartReviewMarkup(save, language, outcome, state.lastOutcomeNodeId, state.storyNodeId)}
        <div class="leadership-lens ${option.quality}">
          <strong>${language === "en" ? "Coach's Eye · Reflection" : "教练之眼 · 反思"}</strong>
          <p>${escapeHtml(coachEyeText(language, outcome))}</p>
        </div>
        <div class="outcome-effects score-pop">
          <span><b>+${outcome.qualityScore}</b> ${language === "en" ? "Expert Fit" : "专家契合分"}</span>
          ${outcome.gainedAbilityIds.map((id) => `<span><b>+${option.effects[id] ?? 0}</b> ${abilityDisplay(language, id).name}</span>`).join("")}
          ${(Object.keys(outcome.resourceDeltas) as ResourceKey[])
            .filter((key) => outcome.resourceDeltas[key])
            .map(
              (key) => `
                <span class="${(outcome.resourceDeltas[key] ?? 0) < 0 ? "negative" : "positive"}">
                  <b>${formatDelta(outcome.resourceDeltas[key] ?? 0)}</b> ${resourceDisplay(language, key)}
                </span>
              `
            )
            .join("")}
        </div>
        ${abilityShiftDetailMarkup(language, outcome)}
        ${outcome.resourceStrain ? `<p class="strain-note">${uiString(language, "strainNote")} -${outcome.resourceStrain}</p>` : ""}
        <div class="outcome-resources">
          ${(Object.keys(RESOURCE_NAMES) as ResourceKey[])
            .map((key) => {
              const value = save.profile.resources[key];
              return `
                <span class="outcome-resource ${value < 30 ? "low" : ""}">
                  <b>${resourceDisplay(language, key)}</b>
                  <i><em style="width:${Math.round(value)}%"></em></i>
                  <small>${Math.round(value)}</small>
                </span>
              `;
            })
            .join("")}
        </div>
        ${historyMirrorCardMarkup(language, outcome)}
        <canvas id="outcome-relations" class="outcome-relations" aria-label="${language === "en" ? "Relationship graph after this decision" : "本次决策后的人物关系图"}"></canvas>
        <button class="primary" data-action="${finalAction}">${finalLabel}</button>
      </section>
    `;
}

function routeBannerMarkup(
  save: SaveState,
  language: Language,
  chapterId: number
): string {
  const route = save.routePath[chapterId - 1];
  if (!route) return "";
  const labelKey =
    route === "expert"
      ? "routeExpert"
      : route === "risk"
        ? "routeRisk"
        : "routePartial";
  return `
      <div class="route-banner" role="status">
        <strong>${escapeHtml(uiString(language, "routeBannerPrefix"))}</strong>
        <span>${escapeHtml(uiString(language, labelKey))}</span>
      </div>
    `;
}

function proceduralNarrativeMarkup(
  save: SaveState,
  language: Language,
  storyNodeId: string
): string {
  let node: StoryNode;
  try {
    node = getNode(storyNodeId);
  } catch {
    return "";
  }
  const narrative = proceduralNarrativeFor(
    node.chapterId,
    save.scenarioSeed ?? 1,
    save.profile.role
  );
  const en = language === "en";
  return `
      <details class="procedural-narrative">
        <summary>${en ? "Procedural Narrative" : "程序化叙事"}</summary>
        <p>${escapeHtml(en ? narrative.en : narrative.zh)}</p>
      </details>
    `;
}

function adaptiveHint(save: SaveState, language: Language, node: StoryNode): string {
  return scenarioCoachHint({
    node,
    save,
    language,
    seed: save.scenarioSeed
  });
}

function integrityGateMarkup(
  language: Language,
  node: StoryNode,
  pendingIntegrityOption: number | undefined,
  integrityGateMode: "cost" | "ability"
): string {
  if (pendingIntegrityOption === undefined) return "";
  const option = node.options[pendingIntegrityOption];
  if (!option) return "";
  const en = language === "en";
  if (integrityGateMode === "ability") {
    const primary = primaryAbilityForOption(option);
    const distractors = ABILITY_ORDER.filter((id) => id !== primary).slice(
      0,
      2
    );
    return `
        <section class="integrity-gate" role="dialog" aria-label="${en ? "Weakness verification" : "短板验证"}">
          <div class="integrity-gate-head">
            <span>${en ? "Adaptive Weakness Check" : "自适应短板验证"}</span>
            <h3>${en ? "Recent decisions missed too many expert moves." : "你近期的决策错过了太多专家方案。"}</h3>
            <p>${en ? "Name the ability this move truly tests before it can pass." : "先说出这一手真正考验的能力，才能继续。"}</p>
          </div>
          <div class="integrity-gate-options">
            ${[primary, ...distractors]
              .map(
                (id) => `
                  <button data-action="integrity-answer" data-ability="${id}">
                    ${abilityDisplay(language, id).name}
                    <small>${abilityDisplay(language, id).tagline}</small>
                  </button>
                `
              )
              .join("")}
          </div>
        </section>
      `;
  }
  const cost = optionCostSummary(language, option);
  const wrongOne = en
    ? "No cost at all; the choice itself is the answer"
    : "没有代价，选择本身就是答案";
  const wrongTwo = en
    ? "It only affects other people, not you"
    : "只影响别人，不影响你";
  return `
      <section class="integrity-gate" role="dialog" aria-label="${en ? "Colleague verification" : "同事验证"}">
        <div class="integrity-gate-head">
          <span>${en ? "Decision Witness" : "决策见证人"}</span>
          <h3>${en ? "Mechanical pick pattern detected." : "检测到机械选择模式。"}</h3>
          <p>${en ? "Before this move counts, name its real trade-off." : "在让这一手生效前，先说出它真正的取舍。"}</p>
        </div>
        <div class="integrity-gate-options">
          <button data-action="integrity-answer" data-cost="correct">
            ${escapeHtml(cost)}
            <small>${en ? "This is the actual trade-off" : "这才是真实的取舍"}</small>
          </button>
          <button data-action="integrity-answer" data-cost="wrong-one">
            ${escapeHtml(wrongOne)}
            <small>${en ? "Too convenient to be true" : "太顺理成章，反而不真实"}</small>
          </button>
          <button data-action="integrity-answer" data-cost="wrong-two">
            ${escapeHtml(wrongTwo)}
            <small>${en ? "Ignoring who carries the cost" : "忽略了代价由谁承担"}</small>
          </button>
        </div>
      </section>
    `;
}

function explorationPanelMarkup(
  save: SaveState,
  language: Language,
  node: StoryNode
): string {
  const en = language === "en";
  const seed = save.scenarioSeed ?? 1;
  const moments = reconMoments(node.chapterId, node.id, seed);
  const found = save.explorationFound?.[node.id] ?? [];
  const doneAll = (save.explorationCompleted ?? []).includes(node.id);
  const actions = moments
    .map((moment) => {
      const done = found.includes(moment.kind);
      return `
          <button
            class="exploration-action ${done ? "done" : ""}"
            data-action="expedition-explore"
            data-kind="${moment.kind}"
            ${done ? "disabled" : ""}
          >${done ? "✓ " : ""}${escapeHtml(en ? moment.titleEn : moment.titleZh)}</button>
        `;
    })
    .join("");
  const findings = found
    .map((kind) => {
      const moment = moments.find((item) => item.kind === kind);
      if (!moment) return "";
      return `
          <p>
            <strong>${escapeHtml(en ? moment.titleEn : moment.titleZh)}</strong>
            ${escapeHtml(en ? moment.textEn : moment.textZh)}
          </p>
        `;
    })
    .join("");
  return `
      <section class="exploration-panel ${doneAll ? "complete" : ""}">
        <div class="exploration-head">
          <span>${en ? "Field recon" : "情报勘察"}</span>
          <strong>${found.length} / 3</strong>
        </div>
        <div class="exploration-actions">${actions}</div>
        <div class="exploration-findings">${findings}</div>
        ${doneAll ? `<p class="exploration-reward">${en ? "Full survey complete: +1 focus ability, +2 energy, +1 mastery." : "完整勘察完成：重点能力+1、精力+2、修炼点+1。"}</p>` : ""}
      </section>
    `;
}

export function storyView(
  save: SaveState,
  language: Language,
  state: StoryViewState
): string {
  const node = storyNodeDisplay(
    language,
    save,
    getNodeForRole(save.profile.role, state.storyNodeId)
  );
  const chapter = chapterDisplay(language, getChapter(node.chapterId));
  const en = language === "en";
  const scenarioShell = scenarioShellFor(node.chapterId, save.scenarioSeed ?? 1);
  const showingOutcome = state.lastOutcomeNodeId === node.id && state.lastOutcome;
  const civ = stageForChapter(node.chapterId);
  const narrative = chapterNarrative(node.chapterId);
  const isExtraMainNode =
    node.kind === "main" && /n[3-9]$/.test(node.id);
  const chapterFocusAbility = chapter.focus[0] ?? "insight";
  const lessonExtra =
    language === "en"
      ? EXPANDED_TRAINING_EN[chapterFocusAbility]
      : EXPANDED_TRAINING[chapterFocusAbility];
  const sceneNpc = NPCS.find(
    (npc) =>
      npc.nodeId === node.id ||
      (npc.nodeId.startsWith("c") &&
        Number(npc.nodeId.slice(1, 2)) === node.chapterId)
  );
  const explorationFound = save.explorationFound?.[node.id] ?? [];
  // 渐进引导：第一个情境内，按 勘察→选择→看反馈 三步高亮当前一步。
  const decisionCount = save.decisionHistory.length;
  const showOnboarding =
    decisionCount === 0 || (showingOutcome && decisionCount === 1);
  const onboardingStep = showingOutcome
    ? 3
    : explorationFound.length > 0
      ? 2
      : 1;
  const explorationReady =
    state.replayMode ||
    showingOutcome ||
    explorationFound.length > 0 ||
    decisionCount > 0;
  const relevantAbilities = [
    ...new Set(
      node.options.flatMap((option) =>
        Object.keys(option.effects) as AbilityId[]
      )
    )
  ];
  const optionOrder = storyOptionOrder(save, node);
  const optionGates = optionOrder.map((index) =>
    optionGateFor(save, node.options[index], node.chapterId)
  );
  const enabledOptionCount = optionGates.filter(
    (gate) => gate.kind === "ok"
  ).length;
  const energyLocked = optionGates.some(
    (gate) => gate.kind === "resource" && gate.resource === "energy"
  );
  const unlockAbility = relevantAbilities.find(
    (id) => abilityLevel(save.profile.abilities[id]) >= 3
  );
  return `
      <header class="topbar">
        <div class="brand">${uiString(language, "brand")}</div>
        <div class="topbar-meta">
          ${resourceChips(language, save.profile)}
          <span id="round-timer" class="round-timer" style="display:none"></span>
        </div>
      </header>
      <main class="story-shell" style="${chapterArtStyle(chapter.id)}" aria-label="${language === "en" ? "Story scenario" : "剧情情境"}">
        ${routeBannerMarkup(save, language, node.chapterId)}
        ${
          state.riskCrisis
            ? `<div class="trust-crisis-banner" role="alert">${language === "en" ? "Trust is shaking: recent risk-heavy choices made the team withhold information. Choose steady moves to rebuild trust." : "信任正在动摇：你近期的风险选择让团队开始保留信息。选择稳健动作可以重建信任。"}</div>`
            : ""
        }
        <div class="scenario-shell" aria-label="${en ? "Scenario shell" : "情境外壳"}">
          <span>${en ? "Scenario shell" : "情境外壳"}</span>
          <strong>${en ? scenarioShell.en : scenarioShell.zh}</strong>
        </div>
        <section class="expedition-scene" style="--civ:${civ.color}">
          <div>
            <span>${en ? `${civ.nameEn} · ${civ.focusEn}` : `${civ.nameZh} · ${civ.focusZh}`}</span>
            <strong>${en ? "Intel Journal" : "情报笔记"}</strong>
          </div>
          <p>${escapeHtml(en ? civ.clueEn : civ.clueZh)}</p>
        </section>
        ${
          narrative
            ? `
              <section class="chapter-narrative" style="--civ:${civ.color}">
                <div class="chapter-narrative-art" style="background-image:url('./art/chapter-${node.chapterId}.jpg')"></div>
                <div class="chapter-narrative-copy">
                  <span>${en ? "Chapter Story" : "本章剧情"}</span>
                  <h2>${en ? "The story behind this chapter" : "这一章发生了什么"}</h2>
                  <p class="chapter-scene-lead">${en ? `Live scene · ${escapeHtml(node.title)}` : `情境现场 · ${escapeHtml(node.title)}`}</p>
                  <p>${escapeHtml(node.context)}</p>
                  <p>${escapeHtml(en ? narrative.en[0] : narrative.zh[0])}</p>
                  <details>
                    <summary>${en ? "Continue the story" : "继续看剧情"}</summary>
                    ${(en ? narrative.en : narrative.zh)
                      .slice(1)
                      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
                      .join("")}
                  </details>
                </div>
              </section>
            `
            : ""
        }
        ${
          node.chapterId === 4 || node.chapterId === 7
            ? `<div class="route-checkpoint" role="status">${language === "en" ? "Route checkpoint: your earlier choices are now shaping upcoming events and endings." : "路线分叉：此前的选择正在改变后续事件与结局权重。"}</div>`
            : ""
        }
        ${state.replayMode ? `<button class="link replay-exit" data-action="open-map">${uiString(language, "replayExit")}</button>` : ""}
        ${
          state.wrongReviewQueue.length
            ? `<div class="wrong-review-header" role="status">${language === "en" ? `Missed-move review ${state.wrongReviewIndex + 1}/${state.wrongReviewQueue.length}` : `错题回练 ${state.wrongReviewIndex + 1}/${state.wrongReviewQueue.length}`}</div>`
            : ""
        }
        <button class="link back-link" data-action="open-map">${uiString(language, "backToMap")}</button>
        <section class="story-art">
          <canvas id="story-art" aria-label="${language === "en" ? "Diagram of the current situation" : "当前情境的局势示意图"}"></canvas>
        </section>
        <section class="story-layout">
          <section class="story-narrative">
            <section class="scenario-panel">
              <div class="scene-strip" role="img" aria-label="${en ? "Chapter scene" : "章节场景"}" style="background-image:url('./art/chapter-${node.chapterId}.jpg')">
                <span class="scene-strip-caption">${en ? `Chapter ${node.chapterId} · Live Scene` : `第 ${node.chapterId} 章 · 现场`}</span>
              </div>
              <div class="scenario-meta">
                <span>${language === "en" ? `Chapter ${chapter.code} · ${chapter.title}` : `第 ${chapter.code} 章 · ${chapter.title}`}</span>
                <span>${node.kind === "side" ? uiString(language, "storyKindSide") : node.kind === "branch" ? uiString(language, "storyKindBranch") : node.kind === "random" ? uiString(language, "storyKindRandom") : isExtraMainNode ? (en ? "Extended Main Scenario" : "主线扩展情境") : uiString(language, "storyKindMain")}</span>
              </div>
              <h1>${node.title}</h1>
              ${
                state.interferenceText
                  ? `
                    <div class="interference-banner" role="alert">
                      <strong>${uiString(language, "interferenceTitle")}</strong>
                      <span>${escapeHtml(state.interferenceText)}</span>
                    </div>
                  `
                  : ""
              }
              ${
                showOnboarding
                  ? `
                    <div class="onboarding-tip">
                      <strong>${uiString(language, "onboardingTitle")}</strong>
                      <ol class="onboarding-steps">
                        <li class="${onboardingStep === 1 ? "active" : onboardingStep > 1 ? "done" : ""}">
                          <b>①</b>
                          <span>${en ? "Recon first" : "先勘察现场"}：${en ? "Complete one field-recon action on the right to unlock the choices." : "在右侧完成一次情报勘察，才能解锁选项。"}</span>
                        </li>
                        <li class="${onboardingStep === 2 ? "active" : onboardingStep > 2 ? "done" : ""}">
                          <b>②</b>
                          <span>${en ? "Choose a move" : "选择一个动作"}：${en ? "Pick the option that best fits the situation." : "从选项里挑一个最贴合局势的动作。"}</span>
                        </li>
                        <li class="${onboardingStep === 3 ? "active" : ""}">
                          <b>③</b>
                          <span>${en ? "Read the feedback" : "读反馈"}：${en ? "This is the consequence of your decision — who it affected and what it cost." : "这是你这条决定的后果——它影响了谁、付出了什么代价。"}</span>
                        </li>
                      </ol>
                    </div>
                  `
                  : ""
              }
              ${
                unlockAbility
                  ? `
                    <div class="ability-unlock-banner">
                      <strong>${abilityDisplay(language, unlockAbility).name} Lv.${abilityLevel(save.profile.abilities[unlockAbility])} · ${uiString(language, "abilityUnlockTitle")}</strong>
                      <p>${uiString(language, "abilityUnlockText")}</p>
                    </div>
                  `
                  : ""
              }
              <div class="role-lens">
                <strong>${roleDisplay(language, save.profile.role).name}${language === "zh" ? "视角" : " Lens"}</strong>
                <span class="role-tag">${language === "en" ? "Role-specific" : "角色专属"}</span>
                <p>${escapeHtml(language === "en" ? ROLE_EN[save.profile.role].lens : ROLES[save.profile.role].lens)}</p>
              </div>
              <p class="scenario-context">${escapeHtml(node.context + perspectiveContextNote(save, language))}</p>
              ${proceduralNarrativeMarkup(save, language, state.storyNodeId)}
              <div class="stake">
                <strong>${uiString(language, "currentTest")}</strong>
                <p>${escapeHtml(node.stake)}</p>
              </div>
              ${
                sceneNpc
                  ? `
                    <div class="npc-scene-quote" style="--dot:${npcAvatarColor(sceneNpc.id)}">
                      <img class="npc-scene-portrait" src="${artAsset(`npc-${sceneNpc.id}.svg`)}" alt="" loading="lazy" onerror="this.style.display='none'" />
                      <span>${escapeHtml(npcDisplay(language, sceneNpc).name)}</span>
                      <p>${escapeHtml(
                        language === "en"
                          ? (npcStoryFor(sceneNpc.id)?.en[1] ??
                              npcDisplay(language, sceneNpc).description)
                          : (npcStoryFor(sceneNpc.id)?.zh[1] ??
                              npcDisplay(language, sceneNpc).description)
                      )}</p>
                    </div>
                  `
                  : ""
              }
              <section class="story-lesson" style="--dot:${ABILITIES[chapterFocusAbility].color}">
                <span>${en ? "Chapter Practice" : "本章修炼"} · ${abilityDisplay(language, chapterFocusAbility).name}</span>
                <details class="fold fold-formula">
                  <summary>${en ? "Practice formula" : "修炼公式"}</summary>
                  <code>${escapeHtml(lessonExtra.formula.expression)}</code>
                  <p>${escapeHtml(lessonExtra.roleApplications[save.profile.role])}</p>
                </details>
                <button data-action="open-training" data-ability="${chapterFocusAbility}" data-training-mode="story">${en ? "Enter Practice" : "进入修炼"}</button>
              </section>
            </section>
          </section>
          <aside class="story-side">
            <section class="intel-panel">
              <details class="fold fold-intel">
                <summary class="intel-head">
                  <span>${uiString(language, "intelTitle")}</span>
                  <small>${uiString(language, "intelHint")}</small>
                </summary>
                <div class="intel-list">
                  ${nodeIntel(language, save.profile.role, node).map((clue) => `<p>${escapeHtml(clue)}</p>`).join("")}
                </div>
              </details>
            </section>
            <section class="decision-panel">
              ${
                showingOutcome && state.lastOutcome
                  ? outcomeMarkup(save, language, state.lastOutcome, state)
                  : `
                    ${
                      state.lastTimedOut
                        ? `<p class="timed-out-note">${escapeHtml(uiString(language, "timedOutNote"))}</p>`
                        : ""
                    }
                    <div class="hint-controls">
                      <button data-action="toggle-hint">${state.storyHintRevealed ? uiString(language, "hideHint") : uiString(language, "showHint")}</button>
                      ${
                        state.storyHintRevealed
                          ? `<p class="coach-hint">${escapeHtml(adaptiveHint(save, language, node))}</p>`
                          : ""
                      }
                    </div>
                    ${
                      enabledOptionCount === 0 && energyLocked
                        ? `
                          <div class="energy-restore-panel" role="status">
                            <strong>${language === "en" ? "Energy exhausted" : "精力耗尽"}</strong>
                            <p>${language === "en" ? "Every move needs more energy right now. Take a breath to recover +40, up to twice per chapter." : "当前所有选项都需要更多精力。深呼吸恢复 +40，每章最多两次。"}</p>
                            ${
                              state.energyRestoreUsed >= 2
                                ? `<small>${language === "en" ? `Recovery used ${state.energyRestoreUsed}/2 this chapter.` : `本章恢复已使用 ${state.energyRestoreUsed}/2。`}</small>`
                                : `<button data-action="energy-restore">${language === "en" ? `Breathe & Recover +40 (${state.energyRestoreUsed}/2)` : `深呼吸恢复 +40（${state.energyRestoreUsed}/2）`}</button>`
                            }
                          </div>
                        `
                        : ""
                    }
                    ${
                      state.integrityGateNodeId === node.id
                        ? integrityGateMarkup(language, node, state.pendingIntegrityOption, state.integrityGateMode)
                        : `
                          ${!showingOutcome && !state.replayMode ? explorationPanelMarkup(save, language, node) : ""}
                          ${
                            !explorationReady && !showingOutcome && !state.replayMode
                              ? `<p class="exploration-lock-note">${en ? "First scenario only: complete one recon action to unlock the choices." : "仅首个情境需要：先完成一个勘察动作，才能解锁选择。"}</p>`
                              : ""
                          }
                          <div class="option-list">
                            ${optionOrder
                              .map(
                                (originalIndex, index) => {
                                  const option = node.options[originalIndex];
                                  const gate = optionGateFor(
                                    save,
                                    option,
                                    node.chapterId
                                  );
                                  const blocked =
                                    gate.kind !== "ok" || !explorationReady;
                                  const gateNote =
                                    gate.kind === "resource"
                                      ? `${uiString(language, "optionLockedResource")} ${resourceDisplay(language, gate.resource)} ${gate.needed}`
                                      : gate.kind === "ability"
                                        ? `${uiString(language, "optionLockedAbility")} ${abilityDisplay(language, gate.ability).name} Lv.${gate.needed}`
                                        : !explorationReady
                                          ? en
                                            ? "Complete a recon action first"
                                            : "先完成一个勘察动作"
                                          : "";
                                  return `
                                    <button class="option-card ${blocked ? "locked" : ""}" data-action="choose-option" data-option="${originalIndex}" data-quality="${option.quality}" ${blocked ? "disabled" : ""}>
                                      <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                                      <span class="option-body">
                                        <strong>${escapeHtml(option.label)}</strong>
                                        <em>${escapeHtml(option.summary)}</em>
                                        <small class="role-move">${roleMove(language, save.profile.role, option.quality)}</small>
                                        ${gateNote ? `<small class="option-gate-note">${escapeHtml(gateNote)}</small>` : ""}
                                      </span>
                                    </button>
                                  `;
                                }
                              )
                              .join("")}
                          </div>
                        `
                    }
                  `
              }
            </section>
          </aside>
        </section>
      </main>
    `;
}
