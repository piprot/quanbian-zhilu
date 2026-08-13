import type { SaveState } from "./types";

export interface CivilizationDef {
  id: string;
  nameZh: string;
  nameEn: string;
  regionZh: string;
  regionEn: string;
  relicZh: string;
  relicEn: string;
  clueZh: string;
  clueEn: string;
  color: string;
  chapters: number[];
}

export const CIVILIZATIONS: CivilizationDef[] = [
  {
    id: "egypt",
    nameZh: "古埃及",
    nameEn: "Ancient Egypt",
    regionZh: "尼罗河三角洲",
    regionEn: "Nile Delta",
    relicZh: "太阳历书",
    relicEn: "Book of the Sun",
    clueZh:
      "第一块藏宝图残片藏在组织最旧的档案室里：谁先被询问、谁保持沉默，往往比任何路线图更接近真相。",
    clueEn:
      "The first map fragment hides in the oldest archive of the organization: who gets asked first and who stays silent reveals more than any drawn route.",
    color: "#d9a441",
    chapters: [1, 2]
  },
  {
    id: "mesopotamia",
    nameZh: "两河文明",
    nameEn: "Mesopotamia",
    regionZh: "幼发拉底河与底格里斯河之间",
    regionEn: "Between the Euphrates and the Tigris",
    relicZh: "楔形法典",
    relicEn: "Cuneiform Code",
    clueZh:
      "规则只有写成流程才能存续：把判断变成制度，组织才不会在权力交接时崩塌。",
    clueEn:
      "Rules survive only when they become process: turn judgment into procedure so the organization does not collapse when power changes hands.",
    color: "#57c7a3",
    chapters: [3, 4]
  },
  {
    id: "indus",
    nameZh: "印度河文明",
    nameEn: "Indus Valley",
    regionZh: "印度河与萨拉斯瓦蒂河之间",
    regionEn: "Between the Indus and Saraswati",
    relicZh: "印章城图",
    relicEn: "Seal City Map",
    clueZh:
      "真正的组织地图不在架构图上，而在资源流动里：钱、时间和关键任务流向哪里，权力就在哪里。",
    clueEn:
      "The real organization map lives in resource flows: where money, time, and critical tasks go, power follows.",
    color: "#4db7d6",
    chapters: [5, 6]
  },
  {
    id: "china",
    nameZh: "华夏文明",
    nameEn: "Chinese Civilization",
    regionZh: "黄河中下游",
    regionEn: "The Yellow River basin",
    relicZh: "九鼎星图",
    relicEn: "Nine Cauldrons Star Chart",
    clueZh:
      "成业之秘不是个人的威名，而是传位、复盘与交接制度：让系统在你离开后仍能自转。",
    clueEn:
      "Lasting success is not a person's fame but succession, review, and handover: a system that keeps turning after you leave.",
    color: "#e9826c",
    chapters: [7, 8, 9]
  }
];

export function civilizationForChapter(chapterId: number): CivilizationDef {
  return (
    CIVILIZATIONS.find((civ) => civ.chapters.includes(chapterId)) ??
    CIVILIZATIONS[0]
  );
}

export interface ExpeditionStatus {
  foundPieces: number;
  totalPieces: number;
  currentRelicZh: string;
  currentRelicEn: string;
  chapterCluesFound: number;
  chapterCluesTotal: number;
}

export function expeditionStatus(save: SaveState): ExpeditionStatus {
  const totalPieces = 9;
  const foundPieces = Math.min(
    totalPieces,
    save.chapterRecords.filter(
      (record) => record.completedNodeIds.length >= 2
    ).length
  );
  const currentChapter = save.unlockedChapters.at(-1) ?? 1;
  const civ = civilizationForChapter(currentChapter);
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
    currentRelicZh: civ.relicZh,
    currentRelicEn: civ.relicEn,
    chapterCluesFound: Math.min(3, cluesFound),
    chapterCluesTotal: 3
  };
}

export interface ExplorationMoment {
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
  "不要急着拍板，先数清决策链上有几个人。"
];

const DECODE_CLUES_EN = [
  "See who is leading, then who pretends not to know.",
  "Where resources flow, real power follows.",
  "Write rules into process, not just into words.",
  "The most valuable clues hide in handover records.",
  "Do not decide too fast; first count who sits on the decision chain."
];

export function explorationMoments(
  chapterId: number,
  nodeId: string,
  seed: number
): ExplorationMoment[] {
  const hash = (value: string): number => {
    let result = seed * 31 + chapterId * 17;
    for (let i = 0; i < value.length; i += 1) {
      result = (result * 131 + value.charCodeAt(i)) >>> 0;
    }
    return result;
  };
  const decode = DECODE_CLUES[hash(nodeId) % DECODE_CLUES.length];
  const decodeEn =
    DECODE_CLUES_EN[hash(nodeId + "en") % DECODE_CLUES_EN.length];
  return [
    {
      kind: "survey",
      titleZh: "翻查旧档案",
      titleEn: "Review old records",
      textZh: `你翻出一份旧项目档案，在审批记录、排期表和邮件往来之间，找到与当前局面隐隐对应的线索。`,
      textEn: `You pull an old project file and find faint echoes of the current situation among approvals, schedules, and email threads.`
    },
    {
      kind: "talk",
      titleZh: "请教资深同事",
      titleEn: "Ask a veteran colleague",
      textZh:
        "资深同事压低声音说：“别急着拍板。先看谁在牵头，再看谁在假装不知道。”",
      textEn:
        "A veteran colleague lowers their voice: “Do not decide too fast. See who is leading, then who pretends not to know.”"
    },
    {
      kind: "decode",
      titleZh: "破译复盘纪要",
      titleEn: "Decode the review notes",
      textZh: `复盘纪要里的一句话连成线索：「${decode}」`,
      textEn: `A line in the review notes reads: “${decodeEn}”`
    }
  ];
}
