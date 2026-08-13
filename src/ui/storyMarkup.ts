import { abilityLevel } from "../core/abilities";
import { reconStatus, stageForChapter } from "../core/expedition";
import type { Language } from "../core/i18n";
import { NPCS, npcRelation } from "../core/npcs";
import { npcArcFor } from "../core/npcArcs";
import { npcStoryFor } from "../core/npcStories";
import { getChapter } from "../core/story";
import { EXPANDED_TRAINING } from "../core/trainingExtras";
import { EXPANDED_TRAINING_EN } from "../core/trainingExtrasEn";
import type {
  AbilityId,
  ResourceKey,
  SaveState,
  StoryNode,
  StoryOption
} from "../core/types";
import {
  abilityDisplay,
  npcAvatarColor,
  npcDisplay,
  resourceDisplay
} from "./display";
import { escapeHtml } from "./escape";

/** 情境叙事展示辅助：从 App 抽出的、依赖 language/save 的纯标记函数。 */

export function storyOptionOrder(save: SaveState, node: StoryNode): number[] {
  const order = node.options.map((_, index) => index);
  const seed =
    (node.id.length * 131 +
      node.chapterId * 17 +
      save.playCount * 7 +
      save.profile.role.length) %
    Math.max(1, order.length);
  for (let i = 1; i < order.length; i += 1) {
    const j = (i + seed * (i + 1)) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function chapterNpc(chapterId: number): (typeof NPCS)[number] | undefined {
  return NPCS.find((npc) => {
    if (!npc.nodeId.startsWith("c")) return false;
    return Number(npc.nodeId.slice(1, 2)) === chapterId;
  });
}

export function npcStoryMarkup(
  language: Language,
  npc: (typeof NPCS)[number]
): string {
  const story = npcStoryFor(npc.id);
  if (!story) return "";
  const en = language === "en";
  const paragraphs = en ? story.en : story.zh;
  const dialogue = story.dialogue
    .map(
      (line) => `
          <div class="npc-dialogue-line">
            <strong>${escapeHtml(en ? line.questionEn : line.questionZh)}</strong>
            <p>${escapeHtml(en ? line.answerEn : line.answerZh)}</p>
          </div>
        `
    )
    .join("");
  const relic = en ? story.relicNoteEn : story.relicNoteZh;
  const arc = npcArcFor(npc.id);
  const arcMarkup = arc
    ? `
        <div class="npc-arc">
          <h4>${en ? "Deeper Story" : "关系深化"}</h4>
          ${(en ? arc.en : arc.zh)
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join("")}
          <div class="npc-dialogue-line">
            <strong>${escapeHtml(en ? arc.dialogue.questionEn : arc.dialogue.questionZh)}</strong>
            <p>${escapeHtml(en ? arc.dialogue.answerEn : arc.dialogue.answerZh)}</p>
          </div>
          <p class="npc-quest">${en ? "Next step" : "下一步"}：${escapeHtml(en ? arc.questEn : arc.questZh)}</p>
        </div>
      `
    : "";
  return `
      <details class="npc-story">
        <summary>${en ? "Story & Letters" : "故事与书信"}</summary>
        <div class="npc-story-copy">
          ${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </div>
        <div class="npc-dialogue">${dialogue}</div>
        <p class="npc-relic-note">${escapeHtml(relic)}</p>
        ${arcMarkup}
      </details>
    `;
}

export function npcCameoMarkup(
  language: Language,
  save: SaveState,
  chapterId: number
): string {
  const npc = chapterNpc(chapterId);
  if (!npc) return "";
  const relation = npcRelation(save, npc);
  const view = npcDisplay(language, npc);
  const story = npcStoryFor(npc.id);
  const known = relation.status !== "尚未接触";
  const en = language === "en";
  const quote = known
    ? story
      ? en
        ? story.en[0]
        : story.zh[0]
      : view.description
    : en
      ? "Complete the related main or side scenario to open this person's story."
      : "完成相关主线或支线后，解锁这个人的故事。";
  return `
      <div class="npc-cameo-panel">
        <span class="npc-cameo-dot" style="--dot:${npcAvatarColor(npc.id)}"></span>
        <div>
          <strong>${escapeHtml(view.name)}</strong>
          <small>${escapeHtml(view.title)}</small>
          <p>${escapeHtml(quote)}</p>
        </div>
      </div>
    `;
}

export function chapterTrainingMarkup(
  language: Language,
  save: SaveState,
  chapterId: number
): string {
  const chapter = getChapter(chapterId);
  const en = language === "en";
  const items = chapter.focus
    .map((id) => {
      const ability = abilityDisplay(language, id);
      const extra =
        language === "en" ? EXPANDED_TRAINING_EN[id] : EXPANDED_TRAINING[id];
      const done = save.completedTraining.includes(id);
      return `
          <div class="chapter-training-item">
            <strong>${ability.name} Lv.${abilityLevel(save.profile.abilities[id])}</strong>
            <code>${escapeHtml(extra.formula.expression)}</code>
            <small>${done ? (en ? "Practiced ✓" : "已修炼 ✓") : (en ? "Not practiced" : "未修炼")}</small>
            <button data-action="open-training" data-ability="${id}">${en ? "Practice" : "修炼"}</button>
          </div>
        `;
    })
    .join("");
  return `
      <section class="chapter-training-card">
        <h3>${en ? "Chapter Ability Practice" : "本章能力修炼"}</h3>
        <p>${en ? "Train the chapter's focus abilities before entering harder scenarios." : "先把本章重点能力练到能用，再进入更难的情境。"}</p>
        <div class="chapter-training-grid">${items}</div>
      </section>
    `;
}

export function expeditionHeroMarkup(
  language: Language,
  save: SaveState,
  chapterId: number
): string {
  const civ = stageForChapter(chapterId);
  const en = language === "en";
  const exp = reconStatus(save);
  return `
      <section class="expedition-hero" style="--civ:${civ.color}">
        <div>
          <p class="eyebrow">${en ? "Nine-Chapter Power Structure" : "九章权力架构"}</p>
          <h1>${en ? civ.nameEn : civ.nameZh} · ${en ? civ.relicEn : civ.relicZh}</h1>
          <p>${escapeHtml(en ? civ.clueEn : civ.clueZh)}</p>
        </div>
        <div class="progress-ring">
          <strong>${exp.foundPieces} / ${exp.totalPieces}</strong>
          <span>${en ? "Chapters completed" : "章节进度"}</span>
        </div>
      </section>
    `;
}

export function optionCostSummary(
  language: Language,
  option: StoryOption
): string {
  const en = language === "en";
  const negative = (Object.entries(option.resources) as Array<
    [ResourceKey, number]
  >).filter(([, value]) => value < 0);
  const positive = (Object.entries(option.resources) as Array<
    [ResourceKey, number]
  >).filter(([, value]) => value > 0);
  if (negative.length && positive.length) {
    const lose = negative
      .map(([key, value]) => `${resourceDisplay(language, key)} ${Math.abs(value)}`)
      .join("、");
    const gain = positive
      .map(([key, value]) => `${resourceDisplay(language, key)} +${value}`)
      .join("、");
    return en
      ? `Spend ${lose} to gain ${gain}`
      : `消耗 ${lose}，换取 ${gain}`;
  }
  if (negative.length) {
    const lose = negative
      .map(([key, value]) => `${resourceDisplay(language, key)} ${Math.abs(value)}`)
      .join("、");
    return en ? `It costs ${lose}` : `它需要付出 ${lose}`;
  }
  return en
    ? "It takes on the uncertainty of a strong signal"
    : "它承担了一次强信号带来的不确定性";
}

export function primaryAbilityForOption(option: StoryOption): AbilityId {
  const ids = Object.keys(option.effects) as AbilityId[];
  return (
    ids.sort(
      (a, b) => (option.effects[b] ?? 0) - (option.effects[a] ?? 0)
    )[0] ?? "insight"
  );
}
