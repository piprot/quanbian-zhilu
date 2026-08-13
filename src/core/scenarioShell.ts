export interface ScenarioShellText {
  zh: string;
  en: string;
  key: string;
}

const INDUSTRIES = [
  { zh: "科技", en: "Tech" },
  { zh: "制造", en: "Manufacturing" },
  { zh: "零售", en: "Retail" },
  { zh: "医疗", en: "Healthcare" },
  { zh: "金融", en: "Finance" },
  { zh: "教育", en: "Education" }
] as const;

const TEAM_SIZES = [10, 50, 200, 500] as const;

const CRISES = [
  { zh: "授权真空", en: "authority vacuum" },
  { zh: "派系斗争", en: "faction rivalry" },
  { zh: "关键人才流失", en: "key talent churn" },
  { zh: "战略转型", en: "strategic shift" },
  { zh: "并购整合", en: "merger integration" },
  { zh: "流程失序", en: "process disorder" },
  { zh: "继任断层", en: "succession gap" },
  { zh: "市场危机", en: "market crisis" },
  { zh: "增长失速", en: "growth stall" }
] as const;

/**
 * 程序化情境外壳：不改 18 个核心情境的决策结构，
 * 只按章节与游玩种子轮换行业/团队规模/危机类型，让重玩时背景保持新鲜。
 */
export function scenarioShellFor(
  chapterId: number,
  seed: number
): ScenarioShellText {
  const safeSeed = Math.abs(Math.floor(seed) || 1);
  const industry =
    INDUSTRIES[Math.floor(safeSeed / 7) % INDUSTRIES.length];
  const teamSize =
    TEAM_SIZES[Math.floor(safeSeed / 31) % TEAM_SIZES.length];
  const crisis =
    CRISES[(chapterId - 1 + Math.floor(safeSeed / 13)) % CRISES.length];
  return {
    zh: `${industry.zh}行业 · ${teamSize} 人团队 · ${crisis.zh}`,
    en: `${industry.en} · ${teamSize}-person team · ${crisis.en}`,
    key: crisis.en
  };
}

export interface ProceduralNarrativeText {
  zh: string;
  en: string;
}

const NARRATIVE_OPENINGS = [
  {
    zh: "消息在周三下午的周会上传开，会议室里没有人先开口。",
    en: "The news spread at Wednesday's weekly review, and no one in the room spoke first."
  },
  {
    zh: "季度复盘刚结束，一封没有抄送你的邮件先到了关键客户手里。",
    en: "The quarterly review had just ended when an email that skipped you reached the key client first."
  },
  {
    zh: "新任命的第二天，你发现核心项目群的日程已经排到下个月，但没有人知道谁在负责。",
    en: "On your second day, you find the core project calendar already fills the month, and no one can say who owns it."
  }
] as const;

const NARRATIVE_STAKEHOLDERS = [
  {
    zh: "财务负责人已经准备好一页纸的止损清单，正在等你表态。",
    en: "The finance lead already has a one-page stop-loss list and is waiting for your position."
  },
  {
    zh: "最资深的老员工没有说话，但所有人的目光都在往他身上飘。",
    en: "The most senior veteran says nothing, yet every gaze in the room drifts toward him."
  },
  {
    zh: "HR 私下提醒你：上周已经有人开始私下更新简历。",
    en: "HR quietly warns you that people started updating their resumes last week."
  }
] as const;

const NARRATIVE_TENSIONS = [
  {
    zh: "真正的问题不是方案本身，而是有人在等它失败后接手资源。",
    en: "The real problem is not the plan; someone is waiting for it to fail so they can take the resources."
  },
  {
    zh: "数据表面一致，但两份报表背后的口径完全不同。",
    en: "The data looks aligned, but the two reports use completely different definitions."
  },
  {
    zh: "所有人都支持改革，也都在等着别人先承担风险。",
    en: "Everyone supports the change, and everyone is waiting for someone else to take the risk."
  }
] as const;

const NARRATIVE_URGENCIES = [
  {
    zh: "你最多只有 72 小时，之后任何调整都会变成“推翻前任”。",
    en: "You have at most 72 hours; after that, any adjustment reads as overturning your predecessor."
  },
  {
    zh: "董事会下周一就要看到结论，而关键证据还缺最后一块。",
    en: "The board expects a conclusion by Monday, and the final piece of evidence is still missing."
  },
  {
    zh: "客户已经给了最后期限，团队内部却连统一口径都还没达成。",
    en: "The client has set a final deadline, while the team still has not aligned on a single message."
  }
] as const;

function narrativeIndex(seed: number, salt: number, length: number): number {
  const value = Math.abs(Math.floor(seed) || 1) * 31 + salt * 17;
  return value % length;
}

export function proceduralNarrativeFor(
  chapterId: number,
  seed: number,
  _role: "parachute" | "founder" | "highPotential" = "parachute"
): ProceduralNarrativeText {
  const safeSeed = Math.abs(Math.floor(seed) || 1) + chapterId * 101;
  const opening =
    NARRATIVE_OPENINGS[narrativeIndex(safeSeed, 1, NARRATIVE_OPENINGS.length)];
  const stakeholder =
    NARRATIVE_STAKEHOLDERS[
      narrativeIndex(safeSeed, 2, NARRATIVE_STAKEHOLDERS.length)
    ];
  const tension =
    NARRATIVE_TENSIONS[narrativeIndex(safeSeed, 3, NARRATIVE_TENSIONS.length)];
  const urgency =
    NARRATIVE_URGENCIES[narrativeIndex(safeSeed, 4, NARRATIVE_URGENCIES.length)];
  return {
    zh: `${opening.zh} ${stakeholder.zh} ${tension.zh} ${urgency.zh}`,
    en: `${opening.en} ${stakeholder.en} ${tension.en} ${urgency.en}`
  };
}
