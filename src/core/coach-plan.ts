import { ABILITY_ORDER, abilityLevel } from "./abilities.ts";
import {
  DIMENSION_ORDER,
  LEADERSHIP_DIMENSIONS,
  dimensionLevel
} from "./leadership-model.ts";
import type { LeadershipDimension, SaveState } from "./types.ts";

export type CoachGoal =
  | "business-breakthrough"
  | "team-upgrade"
  | "personal-influence";

export type CoachChallenge =
  | "time-pressure"
  | "trust-gap"
  | "direction-fog";

export interface CoachPlanPhase {
  days: string;
  titleZh: string;
  titleEn: string;
  focusZh: string;
  focusEn: string;
  actionsZh: string[];
  actionsEn: string[];
  weeklyZh: string;
  weeklyEn: string;
  checkpointZh: string;
  checkpointEn: string;
  questionZh: string;
  questionEn: string;
}

export interface CoachPlan {
  roleZh: string;
  roleEn: string;
  weakestAbilityZh: string;
  weakestAbilityEn: string;
  weakestDimensionZh: string;
  weakestDimensionEn: string;
  decisionStyleZh: string;
  decisionStyleEn: string;
  summaryZh: string;
  summaryEn: string;
  phases: CoachPlanPhase[];
  metricZh: string;
  metricEn: string;
}

const GOAL_TITLES: Record<
  CoachGoal,
  { zh: string; en: string; zhNote: string; enNote: string }
> = {
  "business-breakthrough": {
    zh: "业绩突破",
    en: "Business Breakthrough",
    zhNote: "在 90 天内把一个核心业务结果推到可见的新台阶。",
    enNote: "Push one core business result to a visibly new level in 90 days."
  },
  "team-upgrade": {
    zh: "团队升级",
    en: "Team Upgrade",
    zhNote: "让团队从依赖你决策，变成能独立交付的系统。",
    enNote: "Turn the team from depending on you into an independent system."
  },
  "personal-influence": {
    zh: "个人影响力",
    en: "Personal Influence",
    zhNote: "让关键利益相关者更信任你，并愿意跟着你的方向走。",
    enNote: "Make key stakeholders trust you more and follow your direction."
  }
};

const CHALLENGE_TITLES: Record<
  CoachChallenge,
  { zh: string; en: string; zhNote: string; enNote: string }
> = {
  "time-pressure": {
    zh: "时间不够",
    en: "Not Enough Time",
    zhNote: "你需要在多线任务中保住真正重要的结果。",
    enNote: "Protect the truly important result across competing tasks."
  },
  "trust-gap": {
    zh: "信任不足",
    en: "Trust Gap",
    zhNote: "团队或上级还没有完全相信你的判断。",
    enNote: "The team or your boss does not fully trust your judgment yet."
  },
  "direction-fog": {
    zh: "方向模糊",
    en: "Direction Fog",
    zhNote: "目标不够清楚，资源很难聚焦。",
    enNote: "The goal is unclear, so resources are hard to focus."
  }
};

function weakestAbility(save: SaveState): string {
  let weakest = "insight";
  let minLevel = Infinity;
  for (const id of ABILITY_ORDER) {
    const level = abilityLevel(save.profile.abilities[id] ?? 0);
    if (level < minLevel) {
      minLevel = level;
      weakest = id;
    }
  }
  return weakest;
}

function weakestDimension(save: SaveState): LeadershipDimension {
  let weakest = DIMENSION_ORDER[0];
  let minExp = Infinity;
  for (const id of DIMENSION_ORDER) {
    const exp = save.dimensionExp?.[id] ?? 0;
    if (exp < minExp) {
      minExp = exp;
      weakest = id;
    }
  }
  return weakest;
}

function decisionStyle(save: SaveState): "expert" | "balanced" | "risk" {
  const total = save.decisionHistory.length;
  if (total < 3) return "balanced";
  const expert = save.decisionHistory.filter((d) => d.quality === "expert").length;
  const risk = save.decisionHistory.filter((d) => d.quality === "risk").length;
  if (risk >= Math.ceil(total * 0.35)) return "risk";
  if (expert >= Math.ceil(total * 0.6)) return "expert";
  return "balanced";
}

export function generateCoachPlan(
  save: SaveState,
  goal: CoachGoal,
  challenge: CoachChallenge
): CoachPlan {
  const role = save.profile.role;
  const weakAbility = weakestAbility(save);
  const weakDimension = weakestDimension(save);
  const style = decisionStyle(save);
  const trialProgress = save.trialCleared.length;
  const trainingDone = save.completedTraining.length;
  const gameWins = save.leadershipGameWins;
  const morale = save.morale ?? 75;

  const roleZh =
    role === "parachute"
      ? "空降管理者"
      : role === "founder"
        ? "创业者"
        : "高潜人才";
  const roleEn =
    role === "parachute"
      ? "New Executive"
      : role === "founder"
        ? "Founder"
        : "High-Potential Leader";
  const roleNoteZh =
    role === "parachute"
      ? "先建立可信度，再谈变革"
      : role === "founder"
        ? "先守住现金流，再建体系"
        : "先赢得关键支持，再推动协作";
  const roleNoteEn =
    role === "parachute"
      ? "Build credibility before driving change"
      : role === "founder"
        ? "Protect cash flow before building systems"
        : "Win key support before driving collaboration";

  const styleZh =
    style === "expert"
      ? "先诊断后行动的专家型"
      : style === "risk"
        ? "高压破局型"
        : "渐进探索型";
  const styleEn =
    style === "expert"
      ? "diagnose-then-act expert style"
      : style === "risk"
        ? "high-pressure breaker style"
        : "progressive explorer style";

  const goalInfo = GOAL_TITLES[goal];
  const challengeInfo = CHALLENGE_TITLES[challenge];
  const dimDef = LEADERSHIP_DIMENSIONS[weakDimension];

  const phaseOneActionsZh = [
    `每周用 2 小时访谈 3 位关键人，验证“${goalInfo.zh}”的真实障碍。`,
    `把「${weakAbility}」相关的训练任务排进每周一，每次只做 1 个可验收动作。`,
    `建立一张 30 天成果看板：3 个关键结果、每周检查点、一个可证明的小胜。`
  ];
  const phaseOneActionsEn = [
    `Interview 3 key people for 2 hours weekly to verify the real blockers of "${goalInfo.en}".`,
    `Put one verifiable action for ${weakAbility} training into every Monday.`,
    `Build a 30-day results board: 3 outcomes, weekly checkpoints, one provable small win.`
  ];
  const phaseTwoActionsZh = [
    `把重复决策写成清单或规则，并交给 1 位成员试运行，你只做例外裁决。`,
    `围绕「${dimDef.zh}」设计一次公开复盘，让团队看到标准而不是猜测。`,
    `每周用半天处理“${challengeInfo.zh}”，把保护重要结果变成固定节奏。`
  ];
  const phaseTwoActionsEn = [
    "Turn repeated decisions into checklists or rules and let one member pilot them.",
    `Design one public review around ${dimDef.en} so the team sees standards, not guesses.`,
    `Reserve half a day weekly to handle "${challengeInfo.en}" and protect the key result.`
  ];
  const phaseThreeActionsZh = [
    "选择一件你仍在亲自把关的业务，完整授权给接班人，并设置两周复盘点。",
    "写一份 90 天领导力复盘：哪些选择有效、哪些依赖仍在你身上。",
    "把可复制的决策标准沉淀成团队文件，确保你离开三周也能运转。"
  ];
  const phaseThreeActionsEn = [
    "Fully delegate one business you still own, with a two-week review cadence.",
    "Write a 90-day leadership review: what worked and which dependencies remain.",
    "Turn repeatable decision standards into team documentation that survives three weeks without you."
  ];

  return {
    roleZh,
    roleEn,
    weakestAbilityZh: weakAbility,
    weakestAbilityEn: weakAbility,
    weakestDimensionZh: dimDef.zh,
    weakestDimensionEn: dimDef.en,
    decisionStyleZh: styleZh,
    decisionStyleEn: styleEn,
    summaryZh: `你是${roleZh}，当前决策风格偏${styleZh}，最短板维度是「${dimDef.zh}」。过去完成 ${trialProgress} 个试炼、${trainingDone} 项训练、${gameWins} 场领导力游戏胜利，士气 ${morale}/100。目标「${goalInfo.zh}」的落地主线是：${challengeInfo.zh}。`,
    summaryEn: `As a ${roleEn} with ${styleEn}, your weakest dimension is ${dimDef.en}. You cleared ${trialProgress} trials, ${trainingDone} trainings, and won ${gameWins} leadership games; morale is ${morale}/100. The plan focuses on "${goalInfo.en}" under the challenge: ${challengeInfo.en}.`,
    phases: [
      {
        days: "第 1~30 天",
        titleZh: "诊断与微胜利",
        titleEn: "Diagnose & Small Wins",
        focusZh: `验证「${goalInfo.zh}」的真实障碍，并建立信任。${roleNoteZh}。`,
        focusEn: `Verify the real blockers of "${goalInfo.en}" and build trust. ${roleNoteEn}.`,
        actionsZh: phaseOneActionsZh,
        actionsEn: phaseOneActionsEn,
        weeklyZh: "每周做一次 30 分钟一对一，只问“你看到的最大障碍是什么”。",
        weeklyEn: "Run one 30-minute one-on-one each week asking: what is the biggest blocker you see?",
        checkpointZh: "第 30 天：至少 1 个可证明的小胜被关键人认可。",
        checkpointEn: "Day 30: at least one provable small win is recognized by a key stakeholder.",
        questionZh: "这 30 天里，哪一次访谈让你改变了原有判断？",
        questionEn: "Which interview changed your original judgment this month?"
      },
      {
        days: "第 31~60 天",
        titleZh: "系统与授权",
        titleEn: "Systems & Delegation",
        focusZh: "把个人判断变成团队规则，并开始授权。",
        focusEn: "Turn personal judgment into team rules and start delegating.",
        actionsZh: phaseTwoActionsZh,
        actionsEn: phaseTwoActionsEn,
        weeklyZh: "每周固定半天处理最棘手挑战，其余时间不被打断。",
        weeklyEn: "Protect a fixed half-day weekly for the hardest challenge.",
        checkpointZh: "第 60 天：至少 2 项关键决策已由团队成员独立完成。",
        checkpointEn: "Day 60: at least two key decisions are made independently by team members.",
        questionZh: "你授权后，最担心的事情真的发生了吗？",
        questionEn: "After delegating, did the thing you feared actually happen?"
      },
      {
        days: "第 61~90 天",
        titleZh: "传承与复盘",
        titleEn: "Legacy & Review",
        focusZh: "让成果不依赖你，也能继续运转。",
        focusEn: "Make results survive without you.",
        actionsZh: phaseThreeActionsZh,
        actionsEn: phaseThreeActionsEn,
        weeklyZh: "每周抽 1 小时做领导力复盘：有效动作、残留依赖、下个周期。",
        weeklyEn: "Spend one hour weekly on leadership review: what worked, what dependency remains, and next cycle.",
        checkpointZh: "第 90 天：你离开三周，核心业务仍能稳定交付。",
        checkpointEn: "Day 90: core delivery stays stable after you leave for three weeks.",
        questionZh: "90 天后的你，和现在相比，最大的不同是什么？",
        questionEn: "Compared with today, what is the biggest difference in you 90 days from now?"
      }
    ],
    metricZh: `目标：${goalInfo.zh}；挑战：${challengeInfo.zh}；关键指标：信任 ≥70、士气 ≥70、至少 1 个团队独立交付结果。`,
    metricEn: `Goal: ${goalInfo.en}; Challenge: ${challengeInfo.en}; Targets: trust ≥70, morale ≥70, at least one independently delivered team result.`
  };
}

export { GOAL_TITLES, CHALLENGE_TITLES };
