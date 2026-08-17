import { totalAbilityLevels } from "./abilities.ts";
import {
  getChapter,
  randomEventPoolTotal,
  SIDE_QUEST_ARCS
} from "./story.ts";
import { TRIAL_STAGES } from "./trials.ts";
import type { SaveState } from "./types";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export type AchievementRarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary";

export type AchievementCategory =
  | "story"
  | "training"
  | "trial"
  | "duel"
  | "event"
  | "rank";

export function achievementRarity(id: string): AchievementRarity {
  if (id === "master" || id === "random_collector" || id === "role_ending") {
    return "legendary";
  }
  if (
    id === "training_all" ||
    id === "trial_all" ||
    id === "all_side" ||
    id === "rank_leader" ||
    id === "alternate_ending" ||
    id === "random_rotation_2"
  ) {
    return "epic";
  }
  if (
    id === "training_four" ||
    id === "trial_five" ||
    id === "duel_ten" ||
    id === "mba_clear" ||
    id === "hidden_route" ||
    id === "perfect_chapter" ||
    id === "random_rotation"
  ) {
    return "rare";
  }
  return "common";
}

export function achievementCategory(id: string): AchievementCategory {
  if (id.startsWith("training")) return "training";
  if (id.startsWith("trial") || id === "mba_clear") return "trial";
  if (id.startsWith("duel")) return "duel";
  if (id.startsWith("random")) return "event";
  if (id === "rank_leader" || id === "master") return "rank";
  return "story";
}

export function achievementLore(
  id: string,
  language: "zh" | "en"
): string {
  const specific: Record<
    string,
    { zh: string; en: string }
  > = {
    first_step: {
      zh: "从第一次判断开始，你的权力地图就在改变。",
      en: "Your power map starts changing from the very first judgment."
    },
    assessment_done: {
      zh: "30 题之后，你更清楚自己如何判断人。",
      en: "After 30 questions, you see more clearly how you judge people."
    },
    training_first: {
      zh: "能力不是听会的，是在一次次选择里长出来的。",
      en: "Ability is not learned by listening; it grows through repeated choices."
    },
    training_four: {
      zh: "四条路线同时生长，判断开始有体系。",
      en: "Four tracks growing at once; judgment becomes systematic."
    },
    training_all: {
      zh: "十条路线全部走完，你的判断有了完整地图。",
      en: "All ten tracks complete; your judgment now has a full map."
    },
    trial_first: {
      zh: "第一次指认，你开始用证据替代直觉。",
      en: "The first identification starts replacing instinct with evidence."
    },
    trial_five: {
      zh: "五关之后，压力不再是借口。",
      en: "After five gates, pressure stops being an excuse."
    },
    trial_all: {
      zh: "全部试炼通关，你的判断经得起反推。",
      en: "Every trial cleared; your judgment survives reverse inspection."
    },
    mba_clear: {
      zh: "MBA 案例不是考卷，是真实代价的沙盘。",
      en: "MBA cases are not exams; they are sandboxes of real cost."
    },
    hidden_route: {
      zh: "你找到了一条别人看不到的复盘路线。",
      en: "You found a review route others cannot see."
    },
    role_ending: {
      zh: "第九章的结束不是终点，而是组织第一次可以不完全依赖你。",
      en: "Chapter nine is not the end; it is the first time the organization can run without you."
    },
    alternate_ending: {
      zh: "另一个选择没有消失，它成了你反复回来重走的理由。",
      en: "The other choice never disappears; it becomes the reason you come back."
    },
    random_rotation: {
      zh: "一个周期结束，混乱重新开始排序。",
      en: "One cycle ends; chaos starts sorting itself again."
    },
    random_rotation_2: {
      zh: "两轮事件之后，预案已经长成习惯。",
      en: "After two cycles, preparedness has become a habit."
    },
    random_collector: {
      zh: "把 36 个突发事件全部走完的人，已经学会在混乱中保持秩序。",
      en: "Someone who walks through all 36 incidents learns to keep order inside chaos."
    },
    chapter_1: {
      zh: "识局：先诊断，再动手。",
      en: "Read the situation: diagnose before acting."
    },
    chapter_2: {
      zh: "谋权：在授权之前先建势。",
      en: "Build momentum before authority arrives."
    },
    chapter_3: {
      zh: "用人：把对的人放进对的坑。",
      en: "Place the right people in the right roles."
    },
    chapter_4: {
      zh: "驭势：让不情愿的人一起走。",
      en: "Move the reluctant together."
    },
    chapter_5: {
      zh: "执权：把决策变成可验收的成果。",
      en: "Turn decisions into verifiable results."
    },
    chapter_6: {
      zh: "掌权：用制度守住边界。",
      en: "Guard boundaries with systems."
    },
    chapter_7: {
      zh: "固权：让组织不依赖任何个人。",
      en: "Make the organization independent of any one person."
    },
    chapter_8: {
      zh: "破局：在不确定中快速调整。",
      en: "Adjust quickly inside uncertainty."
    },
    chapter_9: {
      zh: "成业：让成功可以延续。",
      en: "Make success sustainable."
    },
    perfect_chapter: {
      zh: "三星不是满分，而是判断闭环。",
      en: "Three stars are not perfection; they are a closed judgment loop."
    },
    all_side: {
      zh: "九条支线全部收束，个人判断长成了组织规则。",
      en: "All nine side quests close; personal judgment becomes organizational rules."
    },
    side_trust_rebuild: {
      zh: "信任重建完成，善意变成了可持续的关系。",
      en: "Trust rebuilt; goodwill becomes a sustainable relationship."
    },
    side_resilience: {
      zh: "韧性组织完成，团队不再靠你一个人救火。",
      en: "A resilient team no longer depends on one firefighter."
    },
    side_power_boundaries: {
      zh: "权力边界收束，个人权威变成了组织规则。",
      en: "Power boundaries hold; personal authority becomes organizational rules."
    },
    duel_winner: {
      zh: "第一场胜利，来自对局势更完整的读取。",
      en: "The first win comes from reading the situation more completely."
    },
    duel_ten: {
      zh: "十场对决之后，你的判断有了稳定节拍。",
      en: "After ten duels, your judgment keeps a steady rhythm."
    },
    rank_leader: {
      zh: "变革者：你开始把危机拆成结构。",
      en: "Change-maker: you begin to see structure inside crisis."
    },
    master: {
      zh: "综合能力 48，意味着你已经能从危机里看到结构。",
      en: "At 48 total ability, you can see structure inside a crisis."
    }
  };
  if (specific[id]) {
    return language === "en" ? specific[id].en : specific[id].zh;
  }
  const categoryLore: Record<
    AchievementCategory,
    { zh: string; en: string }
  > = {
    story: {
      zh: "这条路线决定了你留下的是个人判断，还是组织规则。",
      en: "This path decides whether you leave behind personal judgment or organizational rules."
    },
    training: {
      zh: "能力不是听会的，是在一次一次选择里长出来的。",
      en: "Ability is not learned by listening; it grows through repeated choices."
    },
    trial: {
      zh: "试炼里的每一个指认，都在检验你敢不敢用证据替代直觉。",
      en: "Every identification in a trial tests whether you replace instinct with evidence."
    },
    duel: {
      zh: "对局把同一道难题交给两个人，分数背后是判断节奏。",
      en: "A duel gives the same problem to two people; the score hides their judgment rhythm."
    },
    event: {
      zh: "突发事件不会等你准备好，它只奖励先建立预案的人。",
      en: "Sudden events never wait; they reward those who prepared first."
    },
    rank: {
      zh: "段位不是标签，是你对复杂局势的长期掌控力。",
      en: "Rank is not a label; it is long-term control over complex situations."
    }
  };
  return language === "en"
    ? categoryLore[achievementCategory(id)].en
    : categoryLore[achievementCategory(id)].zh;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_step",
    name: "第一次判断",
    description: "完成第一个真实职场情境",
    icon: "01"
  },
  {
    id: "assessment_done",
    name: "能力画像",
    description: "完成 30 题能力基线测评",
    icon: "02"
  },
  {
    id: "training_first",
    name: "第一次训练",
    description: "完成任意能力专项训练",
    icon: "03"
  },
  {
    id: "training_four",
    name: "四线并进",
    description: "完成 4 条能力训练路线",
    icon: "04"
  },
  {
    id: "training_all",
    name: "能力训练家",
    description: "完成全部 10 条能力训练路线",
    icon: "05"
  },
  {
    id: "trial_first",
    name: "试炼初胜",
    description: "首次通关成长试炼关卡",
    icon: "06"
  },
  {
    id: "trial_five",
    name: "五关连破",
    description: "通关 5 个成长试炼关卡",
    icon: "07"
  },
  {
    id: "trial_all",
    name: "试炼霸主",
    description: "通关全部成长试炼关卡",
    icon: "08"
  },
  {
    id: "mba_clear",
    name: "MBA 破局者",
    description: "完成任一 MBA 高难案例",
    icon: "09"
  },
  {
    id: "hidden_route",
    name: "高阶路线",
    description: "进入一次能力隐藏复盘路线",
    icon: "10"
  },
  {
    id: "alternate_ending",
    name: "备选结局收集者",
    description: "记录一条备选结局",
    icon: "11"
  },
  {
    id: "random_rotation",
    name: "事件轮换手",
    description: "完成一轮全部随机事件并开启新周期",
    icon: "12"
  },
  {
    id: "random_rotation_2",
    name: "二周目策士",
    description: "完成两轮事件轮换，解锁角色与难度变体",
    icon: "13"
  },
  {
    id: "random_collector",
    name: "事件收藏家",
    description: "在同一周期内完成全部 36 个随机事件",
    icon: "14"
  },
  ...Array.from({ length: 9 }, (_, index) => ({
    id: `chapter_${index + 1}`,
    name: `第 ${index + 1} 章完成`,
    description: `完成第 ${index + 1} 章全部 9 个主线情境`,
    icon: String(index + 15).padStart(2, "0")
  })),
  ...Array.from({ length: 9 }, (_, index) => ({
    id: `chapter_master_${index + 1}`,
    name: `第 ${index + 1} 章全境探索`,
    description: `完成第 ${index + 1} 章全部 9 个主线情境`,
    icon: String(index + 24).padStart(2, "0")
  })),
  {
    id: "perfect_chapter",
    name: "专家级章节",
    description: "任一章达到三星评价",
    icon: "33"
  },
  {
    id: "all_side",
    name: "支线收集者",
    description: "完成全部 9 个支线任务",
    icon: "34"
  },
  {
    id: "side_trust_rebuild",
    name: "信任重建者",
    description: "完成“信任重建”支线剧情弧",
    icon: "35"
  },
  {
    id: "side_resilience",
    name: "韧性组织者",
    description: "完成“韧性组织”支线剧情弧",
    icon: "36"
  },
  {
    id: "duel_winner",
    name: "第一场胜利",
    description: "赢得一场 1v1 对决",
    icon: "37"
  },
  {
    id: "duel_ten",
    name: "常驻对决者",
    description: "累计完成 10 场 1v1 对决",
    icon: "38"
  },
  {
    id: "rank_leader",
    name: "变革者",
    description: "综合能力值达到 38",
    icon: "39"
  },
  {
    id: "role_ending",
    name: "角色结局",
    description: "完成第九章并解锁角色结局",
    icon: "40"
  },
  {
    id: "master",
    name: "执权者",
    description: "综合能力值达到 48",
    icon: "41"
  },
  {
    id: "side_power_boundaries",
    name: "权力边界守卫者",
    description: "完成“权力边界”支线剧情弧",
    icon: "42"
  }
];

export function isAchievementUnlocked(save: SaveState, id: string): boolean {
  if (save.achievements.includes(id)) {
    return true;
  }
  if (id === "first_step") {
    return save.playCount >= 1;
  }
  if (id === "training_first") {
    return save.completedTraining.length >= 1;
  }
  if (id === "training_four") {
    return save.completedTraining.length >= 4;
  }
  if (id === "training_all") {
    return save.completedTraining.length >= 10;
  }
  if (id === "trial_first") {
    return save.trialCleared.length >= 1;
  }
  if (id === "trial_five") {
    return save.trialCleared.length >= 5;
  }
  if (id === "trial_all") {
    return save.trialCleared.length >= TRIAL_STAGES.length;
  }
  if (id === "mba_clear") {
    return save.trialCleared.some((trialId) => trialId.startsWith("mba_"));
  }
  if (id === "hidden_route") {
    return save.hiddenRoutes.length >= 1;
  }
  if (id === "alternate_ending") {
    return save.alternateEndings.length >= 1;
  }
  if (id === "random_rotation") {
    return (save.randomEventCycle ?? 0) >= 1;
  }
  if (id === "random_rotation_2") {
    return (save.randomEventCycle ?? 0) >= 2;
  }
  if (id === "random_collector") {
    return save.completedRandomEvents.length >= randomEventPoolTotal();
  }
  if (id.startsWith("chapter_master_")) {
    const chapterId = Number(id.slice("chapter_master_".length));
    const record = save.chapterRecords.find(
      (item) => item.chapterId === chapterId
    );
    return Boolean(
      record &&
        getChapter(chapterId).nodeIds.every((nodeId) =>
          record.completedNodeIds.includes(nodeId)
        )
    );
  }
  if (id.startsWith("chapter_")) {
    const chapterId = Number(id.split("_")[1]);
    const record = save.chapterRecords.find(
      (item) => item.chapterId === chapterId
    );
    return Boolean(
      record &&
        getChapter(chapterId).nodeIds.every((nodeId) =>
          record.completedNodeIds.includes(nodeId)
        )
    );
  }
  if (id === "perfect_chapter") {
    return save.chapterRecords.some(
      (record) =>
        record.stars >= getChapter(record.chapterId).nodeIds.length * 100
    );
  }
  if (id === "all_side") {
    const arcNodes = SIDE_QUEST_ARCS.flatMap((arc) => arc.nodes);
    return arcNodes.every((nodeId) =>
      save.completedSideQuests.includes(nodeId)
    );
  }
  if (id.startsWith("side_")) {
    const arc = SIDE_QUEST_ARCS.find((item) => item.id === id.replace("side_", ""));
    return Boolean(
      arc && arc.nodes.every((nodeId) => save.completedSideQuests.includes(nodeId))
    );
  }
  if (id === "duel_winner") {
    return save.duelWins >= 1;
  }
  if (id === "duel_ten") {
    return save.duelWins + save.duelLosses >= 10;
  }
  if (id === "rank_leader") {
    return totalAbilityLevels(save.profile.abilities) >= 38;
  }
  if (id === "role_ending") {
    const record = save.chapterRecords.find(
      (item) => item.chapterId === 9
    );
    return Boolean(
      record &&
        getChapter(9).nodeIds.every((nodeId) =>
          record.completedNodeIds.includes(nodeId)
        )
    );
  }
  if (id === "master") {
    return totalAbilityLevels(save.profile.abilities) >= 48;
  }
  return false;
}

export function unlockedCount(save: SaveState): number {
  return ACHIEVEMENTS.filter((achievement) =>
    isAchievementUnlocked(save, achievement.id)
  ).length;
}

/** 成就进度（未解锁时给玩家可见的剩余目标）。 */
export function achievementProgress(
  save: SaveState,
  id: string
): { current: number; target: number } {
  if (id === "first_step") return { current: save.playCount, target: 1 };
  if (id === "assessment_done")
    return { current: save.assessmentScore > 0 ? 1 : 0, target: 1 };
  if (id === "training_first")
    return { current: save.completedTraining.length, target: 1 };
  if (id === "training_four")
    return { current: save.completedTraining.length, target: 4 };
  if (id === "training_all")
    return { current: save.completedTraining.length, target: 10 };
  if (id === "trial_first")
    return { current: save.trialCleared.length, target: 1 };
  if (id === "trial_five")
    return { current: save.trialCleared.length, target: 5 };
  if (id === "trial_all")
    return { current: save.trialCleared.length, target: TRIAL_STAGES.length };
  if (id === "mba_clear")
    return {
      current: save.trialCleared.filter((trialId) => trialId.startsWith("mba_"))
        .length,
      target: 1
    };
  if (id === "hidden_route")
    return { current: save.hiddenRoutes.length, target: 1 };
  if (id === "alternate_ending")
    return { current: save.alternateEndings.length, target: 1 };
  if (id === "random_rotation")
    return { current: Math.min(1, save.randomEventCycle ?? 0), target: 1 };
  if (id === "random_rotation_2")
    return { current: Math.min(2, save.randomEventCycle ?? 0), target: 2 };
  if (id === "random_collector")
    return {
      current: save.completedRandomEvents.length,
      target: randomEventPoolTotal()
    };
  if (id.startsWith("chapter_")) {
    const chapterId = Number(id.split("_")[1]);
    const record = save.chapterRecords.find(
      (item) => item.chapterId === chapterId
    );
    return {
      current: record ? record.completedNodeIds.length : 0,
      target: 2
    };
  }
  if (id === "perfect_chapter") {
    const best = Math.max(0, ...save.chapterRecords.map((record) => record.stars));
    return { current: best >= 220 ? 1 : 0, target: 1 };
  }
  if (id === "all_side") {
    const arcNodes = SIDE_QUEST_ARCS.flatMap((arc) => arc.nodes);
    return {
      current: arcNodes.filter((nodeId) =>
        save.completedSideQuests.includes(nodeId)
      ).length,
      target: arcNodes.length
    };
  }
  if (id.startsWith("side_")) {
    const arc = SIDE_QUEST_ARCS.find(
      (item) => item.id === id.replace("side_", "")
    );
    if (arc) {
      return {
        current: arc.nodes.filter((nodeId) =>
          save.completedSideQuests.includes(nodeId)
        ).length,
        target: arc.nodes.length
      };
    }
  }
  if (id === "duel_winner") return { current: save.duelWins, target: 1 };
  if (id === "duel_ten")
    return { current: save.duelWins + save.duelLosses, target: 10 };
  if (id === "rank_leader")
    return { current: totalAbilityLevels(save.profile.abilities), target: 38 };
  if (id === "role_ending") {
    const record = save.chapterRecords.find((item) => item.chapterId === 9);
    return {
      current: record ? record.completedNodeIds.length : 0,
      target: 2
    };
  }
  if (id === "master")
    return { current: totalAbilityLevels(save.profile.abilities), target: 48 };
  return { current: 0, target: 1 };
}
