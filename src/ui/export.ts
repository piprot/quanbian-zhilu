import { ABILITY_ORDER, abilityLevel } from "../core/abilities";
import { recommendedTraining } from "../core/duel";
import { decisionProfile, profileSummary } from "../core/game";
import type { Language } from "../core/i18n";
import { NPCS, npcRelation } from "../core/npcs";
import { CHAPTERS, SIDE_QUEST_ARCS } from "../core/story";
import type { SaveState } from "../core/types";
import {
  abilityDisplay,
  chapterDisplay,
  npcDisplay,
  rankName,
  relationStatusText,
  roleDisplay,
  sideArcDisplay
} from "./display";

/** 从 App 抽出的导出/下载/复制工具（不依赖 DOM 之外的实例状态）。 */

export function downloadText(
  filename: string,
  text: string,
  mimeType: string
): void {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function encodeSaveLink(save: SaveState): string {
  const json = JSON.stringify(save);
  const encoded = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${location.origin}${location.pathname}#save=${encoded}`;
}

export function buildReportMarkdown(
  save: SaveState,
  language: Language
): string {
  const en = language === "en";
  const summary = profileSummary(save);
  const decision = decisionProfile(save);
  const training = recommendedTraining(
    save.profile.abilities,
    save.profile.role
  );
  const strengths = ABILITY_ORDER.slice()
    .sort(
      (a, b) =>
        abilityLevel(save.profile.abilities[b]) -
        abilityLevel(save.profile.abilities[a])
    )
    .slice(0, 3);
  const role = roleDisplay(language, save.profile.role);
  const lines = [
    `# ${save.profile.name} ${en ? "Leadership Review Report" : "领导力复盘报告"}`,
    "",
    `${en ? "Role" : "角色"}：${role.name}`,
    `${en ? "Rank" : "段位"}：${rankName(language, summary.rank)}`,
    `${en ? "Total Ability" : "综合能力值"}：${summary.total}`,
    `${en ? "Decision Profile" : "决策画像"}：${decision.identity}`,
    "",
    en ? "## Ability Status" : "## 能力现状",
    ...ABILITY_ORDER.map(
      (id) =>
        `- ${abilityDisplay(language, id).name} Lv.${abilityLevel(save.profile.abilities[id])}：${abilityDisplay(language, id).tagline}`
    ),
    "",
    en ? "## Strengths" : "## 优势能力",
    ...strengths.map(
      (id) => `- ${abilityDisplay(language, id).name}：${abilityDisplay(language, id).tagline}`
    ),
    "",
    en ? "## Recommended Training" : "## 建议训练",
    ...training.map(
      (id) => `- ${abilityDisplay(language, id).name}：${abilityDisplay(language, id).tagline}`
    ),
    "",
    en ? "## Chapter Performance" : "## 章节表现",
    ...CHAPTERS.map((chapter) => {
      const chapterView = chapterDisplay(language, chapter);
      const record = save.chapterRecords.find(
        (item) => item.chapterId === chapter.id
      );
      const status =
        record && record.completedNodeIds.length >= 2
          ? en
            ? "Complete"
            : "已完成"
          : en
            ? "Incomplete"
            : "未完成";
      return `- ${chapterView.title}：${status}`;
    }),
    "",
    en ? "## Side Story Arcs" : "## 支线剧情弧",
    ...SIDE_QUEST_ARCS.map((arc) => {
      const arcView = sideArcDisplay(language, arc);
      return `- ${arcView.title}：${arc.nodes.filter((id) => save.completedSideQuests.includes(id)).length}/${arc.nodes.length}`;
    }),
    "",
    en ? "## Relationships" : "## 人物关系",
    ...NPCS.map((npc) => {
      const npcView = npcDisplay(language, npc);
      const relation = npcRelation(save, npc);
      return `- ${npcView.name}（${npcView.title}）：${relationStatusText(language, relation.status)}`;
    }),
    "",
    en ? "## Duel Record" : "## 对决记录",
    `- ${en ? "Wins" : "胜场"}：${save.duelWins}`,
    `- ${en ? "Losses" : "负场"}：${save.duelLosses}`,
    `- ${en ? "Random Events" : "随机事件"}：${save.completedRandomEvents.length}`,
    `- ${en ? "Mastery Points" : "修炼点"}：${save.masteryPoints}`,
    "",
    en ? "## Recent Duels" : "## 近期对决",
    ...save.duelHistory.slice(-5).map(
      (entry) =>
        `- ${entry.won ? (en ? "Win" : "胜") : (en ? "Loss" : "负")} ${entry.opponentName} ${entry.playerScore}:${entry.opponentScore}`
    )
  ];
  return lines.join("\n");
}
