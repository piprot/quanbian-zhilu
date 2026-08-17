import { getChapter, getNode } from "./story.ts";
import {
  BRANCH_NODE_EN,
  CHAPTER_EN,
  MAIN_NODE_EN,
  RANDOM_NODE_EN,
  SIDE_NODE_EN
} from "./translations.ts";
import type { SaveState } from "./types";

export interface PowerStageDef {
  id: string;
  nameZh: string;
  nameEn: string;
  regionZh: string;
  regionEn: string;
  focusZh: string;
  focusEn: string;
  clueZh: string;
  clueEn: string;
  color: string;
  chapters: number[];
}

export const POWER_STAGES: PowerStageDef[] = [
  {
    id: "opening",
    nameZh: "识局 · 谋权",
    nameEn: "Diagnose · Build Power",
    regionZh: "第 1–2 章",
    regionEn: "Chapters 1–2",
    focusZh: "权力地图",
    focusEn: "Power Map",
    clueZh:
      "在授权之前先诊断：谁被询问、谁保持沉默，比任何架构图更接近真实权力结构。",
    clueEn:
      "Diagnose before acting: who gets asked and who stays silent reveals the real power structure better than any org chart.",
    color: "#d9a441",
    chapters: [1, 2]
  },
  {
    id: "people",
    nameZh: "用人 · 驭势",
    nameEn: "Staff · Align",
    regionZh: "第 3–4 章",
    regionEn: "Chapters 3–4",
    focusZh: "制度流程",
    focusEn: "Institution",
    clueZh:
      "规则只有写成流程才能存续：把判断变成制度，组织才不会在权力交接时崩塌。",
    clueEn:
      "Rules survive only when they become process: turn judgment into procedure so the organization does not collapse when power changes hands.",
    color: "#57c7a3",
    chapters: [3, 4]
  },
  {
    id: "authority",
    nameZh: "执权 · 掌权",
    nameEn: "Decide · Hold",
    regionZh: "第 5–6 章",
    regionEn: "Chapters 5–6",
    focusZh: "组织地图",
    focusEn: "Org Map",
    clueZh:
      "真正的组织地图不在架构图上，而在资源流动里：钱、时间和关键任务流向哪里，权力就在哪里。",
    clueEn:
      "The real organization map lives in resource flows: where money, time, and critical tasks go, power follows.",
    color: "#4db7d6",
    chapters: [5, 6]
  },
  {
    id: "legacy",
    nameZh: "固权 · 成业",
    nameEn: "Anchor · Succeed",
    regionZh: "第 7–9 章",
    regionEn: "Chapters 7–9",
    focusZh: "传承系统",
    focusEn: "Succession",
    clueZh:
      "成业之秘不是个人的威名，而是传位、复盘与交接制度：让系统在你离开后仍能自转。",
    clueEn:
      "Lasting success is not a person's fame but succession, review, and handover: a system that keeps turning after you leave.",
    color: "#e9826c",
    chapters: [7, 8, 9]
  }
];

export function stageForChapter(chapterId: number): PowerStageDef {
  return (
    POWER_STAGES.find((civ) => civ.chapters.includes(chapterId)) ??
    POWER_STAGES[0]
  );
}

export interface ReconStatus {
  foundPieces: number;
  totalPieces: number;
  currentFocusZh: string;
  currentFocusEn: string;
  chapterCluesFound: number;
  chapterCluesTotal: number;
}

export function reconStatus(save: SaveState): ReconStatus {
  const totalPieces = 9;
  const foundPieces = Math.min(
    totalPieces,
    save.chapterRecords.filter(
      (record) =>
        record.completedNodeIds.length >=
        getChapter(record.chapterId).nodeIds.length
    ).length
  );
  const currentChapter = save.unlockedChapters.at(-1) ?? 1;
  const civ = stageForChapter(currentChapter);
  const cluesFound =
    save.explorationFound
      ? Object.values(save.explorationFound).flat().length
      : 0;
  const cluesTotal = Math.max(
    cluesFound,
    save.chapterRecords.reduce(
      (sum, record) => sum + Math.min(3, record.completedNodeIds.length),
      0
    ) + 3
  );
  return {
    foundPieces,
    totalPieces,
    currentFocusZh: civ.focusZh,
    currentFocusEn: civ.focusEn,
    chapterCluesFound: Math.min(3, cluesFound),
    chapterCluesTotal: 3
  };
}

export interface ReconMoment {
  kind: "survey" | "talk" | "decode";
  titleZh: string;
  titleEn: string;
  textZh: string;
  textEn: string;
}

const DECODE_CLUES = [
  "先看谁在牵头，再看谁在假装不知道。",
  "资源流向哪里，真正的权力就在哪里。",
  "规则写进流程，而不是只挂在嘴边。",
  "最珍贵的线索，往往藏在交接记录里。",
  "不要急着拍板，先数清决策链上有几个人。",
  "沉默的人往往握有最后一版数据。",
  "上一次的补救方案，正成为这一次的默认路径。",
  "公开承诺越响，私下保留越多。"
];

const DECODE_CLUES_EN = [
  "See who is leading, then who pretends not to know.",
  "Where resources flow, real power follows.",
  "Write rules into process, not just into words.",
  "The most valuable clues hide in handover records.",
  "Do not decide too fast; first count who sits on the decision chain.",
  "The silent ones often hold the latest version of the data.",
  "Last time's patch is becoming this time's default path.",
  "The louder the public promise, the more is kept private."
];

const SURVEY_ZH = [
  "你在「{chapter}」相关档案里翻到与「{node}」对应的记录：{focus}的痕迹比明面流程更早出现。",
  "旧档案里有一份没有归档的版本，时间恰好卡在「{node}」发生之前，审批链却只有一半签名。",
  "你翻出过往复盘，发现「{node}」不是第一次出现：上一次的处理方式留下了可对比的代价。"
];

const SURVEY_EN = [
  "In the files for “{chapter}” you find a record tied to “{node}”: traces of {focus} appear earlier than the official process.",
  "An unarchived version sits right before “{node}” in the timeline, yet the approval chain is only half signed.",
  "Past reviews show “{node}” is not new: the previous fix left a cost you can compare against."
];

const TALK_ZH = [
  "资深同事看了看门的方向，低声说：“{chapter}这段别只看汇报，先数清楚谁在决策链上。”",
  "同事把一份折过的名单推过来：“{node}的关键不在名单本身，而在谁被反复约谈。”",
  "“上次也有人像你这样直接推进，”老同事提醒，“结果是流程赢了，人输了。”"
];

const TALK_EN = [
  "A veteran glances toward the door and whispers: “For {chapter}, do not read the reports first—count who sits on the decision chain.”",
  "A colleague slides a folded list across the desk: “{node} is not about the list itself; it is about who keeps getting pulled into meetings.”",
  "“Someone pushed forward like this last time,” the old hand warns, “and the process won while the people lost.”"
];

const DECODE_ZH = [
  "复盘纪要里的一句话连成线索：「{clue}」",
  "纪要的修订记录里藏着关键改动：{clue}",
  "复盘页脚有一行几乎被删掉的话：{clue}"
];

const DECODE_EN = [
  "A line in the review notes connects into a clue: “{clue}”",
  "The revision history hides a key change: {clue}",
  "A nearly deleted footnote reads: {clue}"
];

export function reconMoments(
  chapterId: number,
  nodeId: string,
  seed: number
): ReconMoment[] {
  const hash = (value: string): number => {
    let result = seed * 31 + chapterId * 17;
    for (let i = 0; i < value.length; i += 1) {
      result = (result * 131 + value.charCodeAt(i)) >>> 0;
    }
    return result;
  };
  const chapter = getChapter(chapterId);
  const chapterZh = chapter.title;
  const chapterEn = CHAPTER_EN[chapterId]?.title ?? chapter.title;
  const focus = stageForChapter(chapterId).focusZh;
  const focusEn = stageForChapter(chapterId).focusEn;
  let nodeTitle = nodeId;
  let nodeTitleEn = nodeId;
  try {
    const node = getNode(nodeId);
    nodeTitle = node.title;
    nodeTitleEn =
      MAIN_NODE_EN[nodeId]?.title ??
      SIDE_NODE_EN[nodeId]?.title ??
      BRANCH_NODE_EN[nodeId]?.title ??
      RANDOM_NODE_EN[nodeId]?.title ??
      node.title;
  } catch {
    // keep ids
  }
  const fill = (
    template: string,
    values: Record<string, string>
  ): string =>
    template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
  const surveyTemplate =
    SURVEY_ZH[hash(nodeId + "survey") % SURVEY_ZH.length];
  const surveyTemplateEn =
    SURVEY_EN[hash(nodeId + "surveyEn") % SURVEY_EN.length];
  const talkTemplate =
    TALK_ZH[hash(nodeId + "talk") % TALK_ZH.length];
  const talkTemplateEn =
    TALK_EN[hash(nodeId + "talkEn") % TALK_EN.length];
  const decodeTemplate =
    DECODE_ZH[hash(nodeId + "decode") % DECODE_ZH.length];
  const decodeTemplateEn =
    DECODE_EN[hash(nodeId + "decodeEn") % DECODE_EN.length];
  const decode = DECODE_CLUES[hash(nodeId + "clue") % DECODE_CLUES.length];
  const decodeEn =
    DECODE_CLUES_EN[hash(nodeId + "clueEn") % DECODE_CLUES_EN.length];
  return [
    {
      kind: "survey",
      titleZh: "翻查旧档案",
      titleEn: "Review old records",
      textZh: fill(surveyTemplate, {
        chapter: chapterZh,
        node: nodeTitle,
        focus
      }),
      textEn: fill(surveyTemplateEn, {
        chapter: chapterEn,
        node: nodeTitleEn,
        focus: focusEn
      })
    },
    {
      kind: "talk",
      titleZh: "请教资深同事",
      titleEn: "Ask a veteran colleague",
      textZh: fill(talkTemplate, {
        chapter: chapterZh,
        node: nodeTitle
      }),
      textEn: fill(talkTemplateEn, {
        chapter: chapterEn,
        node: nodeTitleEn
      })
    },
    {
      kind: "decode",
      titleZh: "破译复盘纪要",
      titleEn: "Decode the review notes",
      textZh: fill(decodeTemplate, { clue: decode }),
      textEn: fill(decodeTemplateEn, { clue: decodeEn })
    }
  ];
}
