/**
 * 升维 V2 · 程序化情境外壳生成器
 * 
 * 核心思路：
 * 保留 18 个核心情境的"决策结构"（3 选项 + 专家基准），
 * 但根据外壳参数动态生成背景叙事，让每次体验都不同。
 * 
 * 外壳参数：
 * - 行业背景（科技/制造/零售/医疗/金融/教育）
 * - 团队规模（10人/50人/200人/1000人+）
 * - 危机类型（现金流/人事斗争/战略转型/并购整合/合规危机）
 * - 时间压力（本周/本季度/本年度）
 * - 利益相关方矩阵
 */

import type { AbilityId, OptionQuality, ResourceKey, RoleId, StoryNode, StoryOption } from "./types.ts";

// ============================================================
// 外壳参数定义
// ============================================================

export type Industry = "tech" | "manufacturing" | "retail" | "healthcare" | "finance" | "education";
export type TeamSize = "small" | "medium" | "large" | "enterprise";
export type CrisisType = "cashflow" | "personnel" | "strategy" | "merger" | "compliance";
export type TimePressure = "week" | "quarter" | "year";

export interface ScenarioShell {
  industry: Industry;
  teamSize: TeamSize;
  crisisType: CrisisType;
  timePressure: TimePressure;
  stakeholderMap: StakeholderEntry[];
  seed: number;
}

export interface StakeholderEntry {
  name: string;
  role: string;           // 职位
  disposition: "ally" | "neutral" | "adversary" | "unknown";
  influence: number;      // 0-100
  interest: number;       // 0-100
}

// ============================================================
// 参数化叙事模板
// ============================================================

const INDUSTRY_CONTEXT: Record<Industry, { zh: string; details: string[]; npcs: string[] }> = {
  tech: {
    zh: "科技公司",
    details: ["敏捷开发节奏", "技术债务累积", "产品迭代压力", "投资人期待增长"],
    npcs: ["CTO 张明", "产品总监李薇", "技术骨干王磊", "投资人代表陈总"],
  },
  manufacturing: {
    zh: "制造企业",
    details: ["生产线效率瓶颈", "供应链波动", "工人流失率上升", "数字化转型阻力"],
    npcs: ["厂长赵刚", "生产主管刘洋", "工会代表孙大姐", "供应商老板周总"],
  },
  retail: {
    zh: "零售集团",
    details: ["门店客流下滑", "电商冲击加剧", "加盟商信心动摇", "库存周转压力"],
    npcs: ["区域经理吴敏", "加盟商代表郑老板", "电商负责人林浩", "财务总监杨芳"],
  },
  healthcare: {
    zh: "医疗机构",
    details: ["医患关系紧张", "政策合规要求升级", "人才梯队断层", "设备更新预算不足"],
    npcs: ["科主任黄教授", "护理部张主任", "院长助理小陈", "药企代表刘经理"],
  },
  finance: {
    zh: "金融机构",
    details: ["监管趋严", "风控体系重塑", "数字化银行业务冲击", "团队年轻化与老干部矛盾"],
    npcs: ["风控总监马总", "合规官钱律师", "业务骨干小赵", "监管对接人孙处"],
  },
  education: {
    zh: "教育机构",
    details: ["招生竞争加剧", "家长投诉增多", "核心教师离职潮", "课程体系老化"],
    npcs: ["教务长何教授", "家长委员会代表方妈妈", "骨干教师李老师", "招生总监唐总"],
  },
};

const TEAM_SIZE_CONTEXT: Record<TeamSize, { zh: string; complexity: string; span: string }> = {
  small: { zh: "10人团队", complexity: "关系简单但容错率低", span: "直接管理，每人都关键" },
  medium: { zh: "50人部门", complexity: "中层管理开始分层", span: "需要通过 2-3 名中层推动" },
  large: { zh: "200人事业部", complexity: "组织架构复杂，利益方多", span: "跨 3-4 个子部门协调" },
  enterprise: { zh: "1000人+集团", complexity: "集团政治与派系", span: "需要董事会层面的博弈" },
};

const CRISIS_CONTEXT: Record<CrisisType, { zh: string; trigger: string; escalation: string }> = {
  cashflow: {
    zh: "现金流危机",
    trigger: "季度营收低于预期 30%，现金储备仅够维持 6 周运营",
    escalation: "如果不在 48 小时内拿出方案，投资方将启动撤资条款",
  },
  personnel: {
    zh: "人事斗争",
    trigger: "两位核心高管公开对立，团队已选边站，项目推进停滞",
    escalation: "下周的董事会上，你必须明确表态支持哪一方",
  },
  strategy: {
    zh: "战略转型",
    trigger: "行业技术变革使现有商业模式 18 个月内可能被颠覆",
    escalation: "转型方案需要在下次战略委员会前获得核心团队共识",
  },
  merger: {
    zh: "并购整合",
    trigger: "收购完成 90 天，被收购方核心团队已流失 40%，文化冲突加剧",
    escalation: "整合委员会要求本周提交人才保留与组织融合方案",
  },
  compliance: {
    zh: "合规危机",
    trigger: "监管检查发现 3 项重大违规，可能面临罚款与业务暂停",
    escalation: "整改报告须在 72 小时内提交，否则启动立案调查",
  },
};

const TIME_PRESSURE: Record<TimePressure, { zh: string; urgency: string }> = {
  week: { zh: "本周内", urgency: "时间极度紧迫，每一步都不可逆" },
  quarter: { zh: "本季度内", urgency: "有数周缓冲，但方向必须尽快确定" },
  year: { zh: "本年度内", urgency: "有战略窗口期，但拖延会错失最佳时机" },
};

// ============================================================
// 核心情境决策结构（保留 18 个，此处示例前 5 个）
// ============================================================

interface CoreScenario {
  id: string;
  chapterId: number;
  title: string;
  coreDilemma: string;       // 核心困境（不随外壳变化）
  focusAbility: AbilityId;
  options: CoreOption[];     // 3 个选项的决策结构
}

interface CoreOption {
  quality: OptionQuality;
  approach: string;          // 决策方法（不随外壳变化）
  effects: Partial<Record<AbilityId, number>>;
  resources: Partial<Record<ResourceKey, number>>;
  feedback: string;          // 反馈（部分参数化）
  theory: string;
}

const CORE_SCENARIOS: CoreScenario[] = [
  {
    id: "ch1_s1",
    chapterId: 1,
    title: "初到任的第一把火",
    coreDilemma: "空降到新岗位，团队观望，你需要用第一个决策建立威信",
    focusAbility: "authority",
    options: [
      {
        quality: "expert",
        approach: "先了解关键人物的真实诉求，找到共识点后推进变革",
        effects: { authority: 3, insight: 2, communication: 2 },
        resources: { energy: -10, trust: 5, influence: 3 },
        feedback: "你花时间与核心成员一对一沟通，虽然起步慢了两天，但团队对变革方向形成了共识",
        theory: "Kotter 变革八步法：建立紧迫感→组建联盟→形成愿景",
      },
      {
        quality: "partial",
        approach: "用制度先行，发布新规，让规则说话",
        effects: { authority: 2, structure: 2, stability: 1 },
        resources: { energy: -8, trust: -3, influence: 2 },
        feedback: "新规发布后短期执行尚可，但私下抱怨增多，信任基础薄弱",
        theory: "Weber 官僚制权威：制度合法性可快速建立，但情感认同需要时间",
      },
      {
        quality: "risk",
        approach: "直接处理一个绩效最差的人，杀鸡儆猴",
        effects: { authority: 4, stability: -3 },
        resources: { energy: -15, trust: -8, influence: 5 },
        feedback: "震慑效果明显，但团队氛围骤冷，私下开始有人更新简历",
        theory: "Machiavelli：恐惧比爱更安全，但恐惧的保质期很短",
      },
    ],
  },
  {
    id: "ch2_s1",
    chapterId: 2,
    title: "用人之际的两难",
    coreDilemma: "一个能力极强但性格有争议的人才，是否应该委以重任",
    focusAbility: "insight",
    options: [
      {
        quality: "expert",
        approach: "设立有约束的授权机制，给机会但设明确的红线与里程碑",
        effects: { insight: 3, deploy: 2, authority: 2 },
        resources: { energy: -12, trust: 3, capital: -5 },
        feedback: "有约束的授权让人才发挥作用的同时保持风险可控",
        theory: "Herd 人才矩阵：高潜力高风险人才需要'围栏式授权'",
      },
      {
        quality: "partial",
        approach: "不用此人，选择更稳妥但能力一般的候选人",
        effects: { stability: 2, insight: 1, deploy: 1 },
        resources: { energy: -5, trust: 2, capital: -2 },
        feedback: "短期平稳，但关键项目可能因能力不足而延期",
        theory: "Peter Principle：稳妥的选择往往导致平庸的结果",
      },
      {
        quality: "risk",
        approach: "完全放权，用人不疑",
        effects: { deploy: 3, insight: -2, stability: -3 },
        resources: { energy: -5, trust: 5, capital: -10 },
        feedback: "如果赌对了，收益巨大；如果赌错了，损失不可挽回",
        theory: "信任博弈：不完全信息下的信任是理性赌博",
      },
    ],
  },
  {
    id: "ch3_s1",
    chapterId: 3,
    title: "派系暗涌中的选择",
    coreDilemma: "两个派系明争暗斗，你必须选择立场或找到第三条路",
    focusAbility: "strategy",
    options: [
      {
        quality: "expert",
        approach: "不选边，而是重新定义问题框架，让两派成为解决方案的共同建设者",
        effects: { strategy: 3, communication: 2, authority: 2 },
        resources: { energy: -15, trust: 5, influence: 5 },
        feedback: "你用重构问题的方式化解了二选一困局，两派都感到被尊重",
        theory: "Heifetz 自适应领导力：技术性问题用权威解决，适应性问题需要改变价值观",
      },
      {
        quality: "partial",
        approach: "选择实力更强的一方，借力打力",
        effects: { strategy: 2, authority: 2, stability: 1 },
        resources: { energy: -8, trust: -3, influence: 8 },
        feedback: "短期内获得强势一方支持，但弱势一方记住了你的选择",
        theory: "联盟理论：权力来自资源控制与联盟网络",
      },
      {
        quality: "risk",
        approach: "同时承诺双方，走钢丝",
        effects: { strategy: 1, communication: 3, stability: -5 },
        resources: { energy: -20, trust: -5, influence: 3 },
        feedback: "如果操作得当你是赢家，一旦穿帮信任将归零",
        theory: "信息不对称博弈：双面承诺的期望收益取决于被发现概率",
      },
    ],
  },
  {
    id: "ch4_s1",
    chapterId: 4,
    title: "变革深水区",
    coreDilemma: "变革进入深水区，既得利益者的反弹超出预期",
    focusAbility: "mobilize",
    options: [
      {
        quality: "expert",
        approach: "分化反对者联盟：识别可转化的中间派，用利益交换瓦解对抗",
        effects: { mobilize: 3, strategy: 2, communication: 2 },
        resources: { energy: -15, trust: 3, capital: -8 },
        feedback: "你成功转化了两位关键反对者，剩余反对力量不足以阻断变革",
        theory: "Machiavelli 《君主论》：消灭敌人不如转化敌人",
      },
      {
        quality: "partial",
        approach: "暂停变革，回到协商桌",
        effects: { stability: 3, mobilize: -1, authority: -2 },
        resources: { energy: -8, trust: 5, influence: -3 },
        feedback: "暂停缓解了矛盾，但变革动力可能流失",
        theory: "变革曲线管理：适时休整可避免硬着陆",
      },
      {
        quality: "risk",
        approach: "强行推进，用权力碾压反对",
        effects: { authority: 4, mobilize: 2, stability: -5 },
        resources: { energy: -25, trust: -10, influence: -5 },
        feedback: "短期内变革落地，但地下反抗在酝酿，随时可能爆发",
        theory: "强制权力模型：合法性权威 vs 强制性权威的代价差异",
      },
    ],
  },
  {
    id: "ch5_s1",
    chapterId: 5,
    title: "信任裂缝的修复",
    coreDilemma: "一个关键决策失误导致团队信任受损，如何修复",
    focusAbility: "recovery",
    options: [
      {
        quality: "expert",
        approach: "主动承认错误，公开复盘，用透明度重建信任",
        effects: { recovery: 3, communication: 3 },
        resources: { energy: -12, trust: 8, influence: -2 },
        feedback: "你主动认错反而赢得了更多尊重，团队信任度不降反升",
        theory: "Brené Brown 脆弱性力量：示弱是建立深层信任的前提",
      },
      {
        quality: "partial",
        approach: "低调处理，用行动弥补，不公开讨论",
        effects: { recovery: 2, stability: 2, communication: -1 },
        resources: { energy: -10, trust: 3, capital: -5 },
        feedback: "行动弥补了部分损失，但未公开处理让传言继续发酵",
        theory: "信任修复模型：能力修复+善意修复+诚信修复三者并行最有效",
      },
      {
        quality: "risk",
        approach: "找一个替罪羊，转移注意力",
        effects: { authority: 2, recovery: -3, stability: -3 },
        resources: { energy: -5, trust: -15, influence: 3 },
        feedback: "短期内转移了焦点，但知情者的信任彻底崩塌",
        theory: "归因偏差：外归因短期内保护自我，但长期损害领导力信誉",
      },
    ],
  },
];

// ============================================================
// 外壳生成器核心
// ============================================================

export class ScenarioShellGenerator {
  private rng: () => number;

  constructor(seed: number) {
    let s = seed;
    this.rng = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  /**
   * 生成随机外壳参数
   */
  generateShell(): ScenarioShell {
    const industries = Object.keys(INDUSTRY_CONTEXT) as Industry[];
    const sizes = Object.keys(TEAM_SIZE_CONTEXT) as TeamSize[];
    const crises = Object.keys(CRISIS_CONTEXT) as CrisisType[];
    const times = Object.keys(TIME_PRESSURE) as TimePressure[];

    const industry = industries[Math.floor(this.rng() * industries.length)];
    const teamSize = sizes[Math.floor(this.rng() * sizes.length)];
    const crisisType = crises[Math.floor(this.rng() * crises.length)];
    const timePressure = times[Math.floor(this.rng() * times.length)];

    return {
      industry,
      teamSize,
      crisisType,
      timePressure,
      stakeholderMap: this.generateStakeholders(industry),
      seed: Math.floor(this.rng() * 1000000),
    };
  }

  /**
   * 根据外壳参数和核心情境，生成完整的叙事节点
   */
  generateScenario(coreScenario: CoreScenario, shell: ScenarioShell): StoryNode {
    const industryData = INDUSTRY_CONTEXT[shell.industry];
    const teamData = TEAM_SIZE_CONTEXT[shell.teamSize];
    const crisisData = CRISIS_CONTEXT[shell.crisisType];
    const timeData = TIME_PRESSURE[shell.timePressure];

    // 生成情境背景
    const context = this.buildContext(coreScenario, industryData, teamData, crisisData, timeData, shell);

    // 生成利益相关方描述
    const stakeDescription = this.buildStakeholderDescription(shell);

    // 生成选项（保留决策结构，替换叙事外壳）
    const options: StoryOption[] = coreScenario.options.map(opt => ({
      label: this.adaptLabel(opt.approach, shell),
      summary: this.adaptSummary(opt, shell),
      quality: opt.quality,
      effects: opt.effects,
      resources: opt.resources,
      feedback: this.adaptFeedback(opt.feedback, shell),
      theory: opt.theory,
    }));

    return {
      id: `${coreScenario.id}_${shell.seed}`,
      chapterId: coreScenario.chapterId,
      title: this.adaptTitle(coreScenario.title, shell),
      kind: "main",
      context: context + "\n\n" + stakeDescription,
      stake: crisisData.escalation,
      options,
    };
  }

  /**
   * 批量生成一整章的情境外壳
   */
  generateChapter(chapterId: number, shell?: ScenarioShell): StoryNode[] {
    const s = shell ?? this.generateShell();
    const chapterScenarios = CORE_SCENARIOS.filter(sc => sc.chapterId === chapterId);
    return chapterScenarios.map(sc => this.generateScenario(sc, s));
  }

  /**
   * 生成一周的每日情境（高管模式：少而精）
   */
  generateWeeklyFocus(): { theme: string; scenario: StoryNode; reflection: string } {
    const shell = this.generateShell();
    const scenario = CORE_SCENARIOS[Math.floor(this.rng() * CORE_SCENARIOS.length)];
    const node = this.generateScenario(scenario, shell);

    const themes = [
      "本周聚焦：跨部门协同",
      "本周聚焦：变革中的信任管理",
      "本周聚焦：权力与影响力运用",
      "本周聚焦：危机中的决策力",
      "本周聚焦：人才梯队建设",
    ];

    const reflections = [
      "本周的情境让你想到了工作中的哪个具体场景？那个场景中，你做了什么选择？",
      "如果这个情境发生在你的团队中，谁会是你最关键的盟友？为什么？",
      "这个决策的核心矛盾是什么？在你的工作中，类似矛盾出现在哪里？",
      "如果你选择了风险选项，最坏的结果是什么？你能承受吗？",
      "专家选项在你的实际工作中可行吗？如果不可行，障碍是什么？",
    ];

    return {
      theme: themes[Math.floor(this.rng() * themes.length)],
      scenario: node,
      reflection: reflections[Math.floor(this.rng() * reflections.length)],
    };
  }

  // --------------------------------------------------------
  // 私有方法：叙事生成
  // --------------------------------------------------------

  private generateStakeholders(industry: Industry): StakeholderEntry[] {
    const npcs = INDUSTRY_CONTEXT[industry].npcs;
    const dispositions: StakeholderEntry["disposition"][] = ["ally", "neutral", "adversary", "unknown"];

    return npcs.map((name, i) => ({
      name,
      role: this.guessRole(name, i),
      disposition: dispositions[Math.floor(this.rng() * dispositions.length)],
      influence: Math.floor(this.rng() * 60) + 30,
      interest: Math.floor(this.rng() * 60) + 30,
    }));
  }

  private guessRole(name: string, index: number): string {
    const roles = ["技术负责人", "运营负责人", "财务负责人", "外部合作方"];
    return roles[index % roles.length];
  }

  private buildContext(
    core: CoreScenario,
    industry: typeof INDUSTRY_CONTEXT[Industry],
    team: typeof TEAM_SIZE_CONTEXT[TeamSize],
    crisis: typeof CRISIS_CONTEXT[CrisisType],
    time: typeof TIME_PRESSURE[TimePressure],
    shell: ScenarioShell
  ): string {
    const detail = industry.details[Math.floor(this.rng() * industry.details.length)];

    return [
      `【场景】${industry.zh} · ${team.zh}`,
      ``,
      `你是${industry.zh}的领导，面对${team.complexity}。`,
      `当前焦点：${detail}。`,
      ``,
      `【危机】${crisis.zh}`,
      crisis.trigger,
      ``,
      `【时间压力】须在${time.zh}解决。${time.urgency}`,
      ``,
      `【核心困境】${core.coreDilemma}`,
    ].join("\n");
  }

  private buildStakeholderDescription(shell: ScenarioShell): string {
    const lines = ["【关键利益相关方】"];
    for (const s of shell.stakeholderMap) {
      const tag = s.disposition === "ally" ? "盟友" :
                  s.disposition === "adversary" ? "对手" :
                  s.disposition === "neutral" ? "中立" : "未知";
      lines.push(`• ${s.name}（${s.role}）— 立场：${tag} | 影响力：${s.influence} | 关注度：${s.interest}`);
    }
    return lines.join("\n");
  }

  private adaptTitle(title: string, shell: ScenarioShell): string {
    const industryZh = INDUSTRY_CONTEXT[shell.industry].zh;
    return `${title} · ${industryZh}情境`;
  }

  private adaptLabel(approach: string, _shell: ScenarioShell): string {
    return approach;
  }

  private adaptSummary(opt: CoreOption, shell: ScenarioShell): string {
    const crisisZh = CRISIS_CONTEXT[shell.crisisType].zh;
    return `${opt.approach}。在${crisisZh}的背景下，这个选择意味着${this.predictOutcome(opt.quality, shell)}`;
  }

  private predictOutcome(quality: OptionQuality, shell: ScenarioShell): string {
    const timePressure = TIME_PRESSURE[shell.timePressure].zh;
    switch (quality) {
      case "expert":
        return `需要在${timePressure}内协调多方利益，但一旦成功，解决方案更可持续`;
      case "partial":
        return `短期风险较低，但${shell.crisisType === "cashflow" ? "现金流" : "根本问题"}可能在后期再次爆发`;
      case "risk":
        return `如果成功将成为教科书案例，如果失败将在${timePressure}内引发连锁危机`;
    }
  }

  private adaptFeedback(feedback: string, shell: ScenarioShell): string {
    const industryZh = INDUSTRY_CONTEXT[shell.industry].zh;
    return `${feedback}。在${industryZh}的行业语境下，${this.industrySpecificInsight(shell.industry)}`;
  }

  private industrySpecificInsight(industry: Industry): string {
    const insights: Record<Industry, string> = {
      tech: "技术团队对'公平性'的敏感度高于其他行业，程序正义不可忽视",
      manufacturing: "制造体系的安全惯性极强，任何变革都需要'试点-验证-推广'的节奏",
      retail: "零售一线的反馈滞后性意味着你需要更早建立信息回路",
      healthcare: "医疗体系的合规底线不可触碰，但在合规框架内的创新空间比你想象的大",
      finance: "金融行业对'信号'极度敏感，你的每个动作都会被解读为方向性判断",
      education: "教育行业的文化变革周期以学期为单位，急不得",
    };
    return insights[industry];
  }
}

// ============================================================
// 导出核心情境列表（供外部使用）
// ============================================================

export { CORE_SCENARIOS };
