import { totalAbilityLevels } from "./abilities.ts";
import type { SaveState } from "./types";

export interface ChallengeDef {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: "ability" | "chapter" | "trial" | "duel";
}

export interface ChallengeState extends ChallengeDef {
  current: number;
  target: number;
  done: boolean;
}

const CHALLENGE_POOL: Array<ChallengeDef & { target: number; progress(save: SaveState): number }> = [
  {
    id: "expert_3",
    title: "连续精准",
    description: "完成 3 次专家级情境选择",
    target: 3,
    reward: 4,
    category: "chapter",
    progress: (save) =>
      save.decisionHistory.filter((record) => record.quality === "expert").length
  },
  {
    id: "side_1",
    title: "支线推进",
    description: "完成 1 个支线剧情节点",
    target: 1,
    reward: 4,
    category: "chapter",
    progress: (save) => save.completedSideQuests.length
  },
  {
    id: "duel_1",
    title: "一次对决",
    description: "完成 1 场 1v1 对决",
    target: 1,
    reward: 4,
    category: "duel",
    progress: (save) => save.duelWins + save.duelLosses
  },
  {
    id: "chapter_1",
    title: "章节突破",
    description: "完成任意一章主线",
    target: 1,
    reward: 6,
    category: "chapter",
    progress: (save) =>
      save.chapterRecords.filter((record) => record.completedNodeIds.length >= 2)
        .length
  },
  {
    id: "rank_20",
    title: "能力跃迁",
    description: "综合能力值达到 20",
    target: 20,
    reward: 6,
    category: "ability",
    progress: (save) => totalAbilityLevels(save.profile.abilities)
  },
  {
    id: "training_1",
    title: "专项训练",
    description: "完成 1 条能力训练路线",
    target: 1,
    reward: 4,
    category: "ability",
    progress: (save) => save.completedTraining.length
  },
  {
    id: "trial_1",
    title: "试炼破关",
    description: "通关 1 个成长试炼关卡",
    target: 1,
    reward: 4,
    category: "trial",
    progress: (save) => save.trialCleared.length
  },
  {
    id: "practice_1",
    title: "行动修炼",
    description: "完成 1 个修炼任务",
    target: 1,
    reward: 4,
    category: "trial",
    progress: (save) => save.completedPracticeTasks.length
  },
  {
    id: "story_3",
    title: "情境连续",
    description: "累计完成 3 个情境决策",
    target: 3,
    reward: 5,
    category: "chapter",
    progress: (save) => save.decisionHistory.length
  },
  {
    id: "side_3",
    title: "支线深入",
    description: "完成 3 个支线节点",
    target: 3,
    reward: 5,
    category: "chapter",
    progress: (save) => save.completedSideQuests.length
  },
  {
    id: "duel_3",
    title: "三场对决",
    description: "完成 3 场 1v1 对决",
    target: 3,
    reward: 5,
    category: "duel",
    progress: (save) => save.duelWins + save.duelLosses
  },
  {
    id: "random_2",
    title: "随机应变",
    description: "处理 2 个随机事件",
    target: 2,
    reward: 5,
    category: "chapter",
    progress: (save) => save.completedRandomEvents.length
  },
  {
    id: "branch_3",
    title: "角色分岔",
    description: "完成 3 个角色分岔节点",
    target: 3,
    reward: 5,
    category: "chapter",
    progress: (save) => save.completedBranchNodes.length
  },
  {
    id: "mba_1",
    title: "MBA 案例",
    description: "通关 1 个 MBA 高难案例",
    target: 1,
    reward: 6,
    category: "trial",
    progress: (save) =>
      save.trialCleared.filter((id) => id.startsWith("mba_")).length
  }
];

/** 当日日期键，统一为 "YYYY-MM-DD"，与领取记录的键格式保持一致。 */
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dailyChallenges(save: SaveState): ChallengeState[] {
  const today = todayKey();
  const seed = [...today].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const start = seed % CHALLENGE_POOL.length;
  return CHALLENGE_POOL.slice(start)
    .concat(CHALLENGE_POOL.slice(0, start))
    .slice(0, 3)
    .map((challenge) => {
      const current = Math.min(challenge.target, challenge.progress(save));
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        reward: challenge.reward,
        category: challenge.category,
        current,
        target: challenge.target,
        done: current >= challenge.target
      };
    });
}

/** 鏈€杩戜竴鍛ㄧ殑绱㈠紩锛屽舰寮忎负 YYYY-Www銆?*/
export function weekKey(): string {
  const now = new Date();
  const target = new Date(now.getTime());
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const year = target.getFullYear();
  const week = Math.floor(
    (target.getTime() - new Date(year, 0, 1).getTime()) / 604800000
  ) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function weekEndsAt(): number {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const nextMonday = new Date(now.getTime());
  nextMonday.setHours(24, 0, 0, 0);
  nextMonday.setDate(now.getDate() + (7 - day));
  return nextMonday.getTime();
}

/** 鍛ㄥ父鎸戞垬锛氭寜鍛ㄥ害绉嶅瓙浠庢睜瀛愰噷鍙?2 椤癸紝缁欓暱鏈熻繍钀ユ彁渚涘惊鐜€?*/
export function weeklyChallenges(save: SaveState): ChallengeState[] {
  const week = weekKey();
  const seed = [...week].reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7);
  const start = seed % CHALLENGE_POOL.length;
  return CHALLENGE_POOL.slice(start)
    .concat(CHALLENGE_POOL.slice(0, start))
    .slice(0, 2)
    .map((challenge) => {
      const current = Math.min(challenge.target, challenge.progress(save));
      return {
        id: `${challenge.id}-${week}`,
        title: challenge.title,
        description: challenge.description,
        reward: challenge.reward,
        category: challenge.category,
        current,
        target: challenge.target,
        done: current >= challenge.target
      };
    });
}

export function claimableChallenges(
  save: SaveState
): ChallengeState[] {
  const today = todayKey();
  return dailyChallenges(save).filter(
    (challenge) =>
      challenge.done && !(save.claimedDaily[today] ?? []).includes(challenge.id)
  );
}
