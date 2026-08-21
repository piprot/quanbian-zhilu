import type { AbilityDef, AbilityId, RoleDef, RoleId } from "./types";

export const ABILITY_ORDER: AbilityId[] = [
  "insight",
  "deploy",
  "mobilize",
  "strategy",
  "authority",
  "stability",
  "recovery",
  "execution",
  "structure",
  "communication"
];

export const ABILITIES: Record<AbilityId, AbilityDef> = {
  insight: {
    id: "insight",
    name: "识人",
    code: "SIGHT",
    tagline: "看懂人，才能看穿局",
    color: "#f2c14e",
    sources: ["《人物志》九征八观", "《冰鉴》识人八字诀", "《孙子兵法》知胜有五"],
    subSkills: ["观其外而知其内", "察其行而辨其品", "审其变而见其性", "辨其类而尽其才"],
    trainingPath: "每章先完成利益相关者地图，再进入关键人物一对一访谈。"
  },
  deploy: {
    id: "deploy",
    name: "用人",
    code: "PLACE",
    tagline: "把对的人放进对的坑",
    color: "#57c7a3",
    sources: ["《韩非子·用人》循天顺人", "《贞观政要》唯才是举", "德鲁克：用人之所长"],
    subSkills: ["因材施用", "用其所长", "赏罚分明", "职责清晰"],
    trainingPath: "用关键岗位清单代替印象分，按能力证据做人事配置。"
  },
  mobilize: {
    id: "mobilize",
    name: "驭人",
    code: "MOVE",
    tagline: "让一群人愿意一起走",
    color: "#e9826c",
    sources: ["《论语》为政以德", "《孙子兵法》令之以文，齐之以武", "毛泽东：出主意、用干部、抓重点"],
    subSkills: ["以德服人", "文德武威", "出主意引方向", "抓重点带全局"],
    trainingPath: "把反对者的顾虑写进方案，再邀请对方承担试点责任。"
  },
  strategy: {
    id: "strategy",
    name: "谋权",
    code: "SHAPE",
    tagline: "在授权之前先建势",
    color: "#41c7c0",
    sources: ["《权经》谋权篇", "《韩非子》法、术、势", "马基雅维利《君主论》"],
    subSkills: ["权力认知", "战略布局", "法势术结合", "等待时机"],
    trainingPath: "用先立功再争权的方式积累筹码，同时保持授权者信息同步。"
  },
  authority: {
    id: "authority",
    name: "掌权",
    code: "HOLD",
    tagline: "权力是用来创造结果的",
    color: "#4db7d6",
    sources: ["《权经》用权篇", "《孙子兵法》致人而不致于人", "《鬼谷子》权变思维"],
    subSkills: ["用权有度", "授权赋能", "主动掌控", "先胜后战"],
    trainingPath: "把关键决策纳入联签机制，用制度守住权力边界。"
  },
  stability: {
    id: "stability",
    name: "固权",
    code: "STAY",
    tagline: "把个人影响力变成组织能力",
    color: "#7fb069",
    sources: ["《贞观政要》善始慎终", "《资治通鉴》谦退与团结", "《党委会的工作方法》民主集中制"],
    subSkills: ["成果支撑", "制度固化", "梯队建设", "风险防范"],
    trainingPath: "把高频判断做成清单与复盘库，并给接班人设计陪跑期。"
  },
  recovery: {
    id: "recovery",
    name: "情绪自愈",
    code: "FUEL",
    tagline: "先管理精力，再管理结果",
    color: "#e9b872",
    sources: ["《卓有成效的管理者》自我管理", "《高效能人士的七个习惯》主动积极", "现代精力管理研究"],
    subSkills: ["觉察情绪", "恢复精力", "建立边界", "复盘重启"],
    trainingPath: "每天设置一个不被打断的恢复时段，用呼吸练习重置状态。"
  },
  execution: {
    id: "execution",
    name: "执行力",
    code: "DELIVER",
    tagline: "把方向拆成可验收的成果",
    color: "#d97aa2",
    sources: ["《卓有成效的管理者》要事优先", "《孙子兵法》兵贵神速", "目标管理实践"],
    subSkills: ["目标拆解", "优先级排序", "检查节点", "结果验收"],
    trainingPath: "为目标设定三个关键结果，每个结果都配负责人和验收标准。"
  },
  structure: {
    id: "structure",
    name: "结构思考",
    code: "FRAME",
    tagline: "没有答案时，先拆出问题",
    color: "#5ca9e9",
    sources: ["《矛盾论》抓主要矛盾", "《实践论》从实践中找规律", "结构化问题解决框架"],
    subSkills: ["定义问题", "拆解要素", "抓主要矛盾", "形成验证假设"],
    trainingPath: "遇到模糊问题时先写问题定义，再列出因果链和验证节点。"
  },
  communication: {
    id: "communication",
    name: "协同沟通",
    code: "ALIGN",
    tagline: "把话说清楚，把事对齐",
    color: "#d4a5e8",
    sources: ["《论语》不患人之不己知", "《高效能人士的七个习惯》知彼解己", "非暴力沟通原则"],
    subSkills: ["主动对齐", "结构化表达", "提问倾听", "化解分歧"],
    trainingPath: "跨部门会议前先同步目标，会后用一页纪要锁定责任人。"
  }
};

export const ROLES: Record<RoleId, RoleDef> = {
  parachute: {
    id: "parachute",
    name: "空降管理者",
    shortName: "空降",
    description: "进入陌生组织，90 天内建立信任、识别关键人物、完成第一场变革。",
    objective: "在 90 天内完成从陌生者到组织建设者的转身：先识别权力结构，再建立信任，最后推动变革。",
    lens: "你是空降管理者，必须在陌生组织里先识别真实权力结构，再用最短时间建立可信度。",
    focusAbilities: ["insight", "strategy", "communication", "authority"],
    startingAbilities: {
      insight: 3,
      strategy: 2,
      recovery: 1,
      communication: 1
    },
    startingResources: { energy: 78, trust: 34, influence: 58, capital: 46 }
  },
  founder: {
    id: "founder",
    name: "创业者",
    shortName: "创业",
    description: "在资源有限、方向混沌的环境里快速试错、组织突围、保住现金流。",
    objective: "在资源有限的环境中活下来并找到方向：先守住现金流，再用可验证的成果建立组织能力。",
    lens: "你是创业者，必须在不依赖职位权威、资源有限的情况下，用行动、现金流和结果建立影响力。",
    focusAbilities: ["structure", "execution", "recovery", "strategy"],
    startingAbilities: {
      execution: 3,
      structure: 2,
      recovery: 2,
      strategy: 1
    },
    startingResources: { energy: 88, trust: 38, influence: 44, capital: 32 }
  },
  highPotential: {
    id: "highPotential",
    name: "高潜人才",
    shortName: "高潜",
    description: "不靠职位权力，用专业、影响力和系统思考推动跨部门协作。",
    objective: "在不依赖职位权力的前提下建立跨部门影响力：用专业判断和协同机制推动事情发生。",
    lens: "你是高潜人才，不能直接发号施令，只能通过专业、关系和结构思考推动他人。",
    focusAbilities: ["communication", "deploy", "insight", "structure"],
    startingAbilities: {
      communication: 3,
      insight: 2,
      structure: 2,
      deploy: 1
    },
    startingResources: { energy: 72, trust: 56, influence: 38, capital: 40 }
  }
};

export const ABILITY_EXP_TABLE = [0, 4, 10, 18, 28, 40];

export function abilityLevel(exp: number): number {
  let level = 1;
  for (const threshold of ABILITY_EXP_TABLE.slice(1)) {
    if (exp >= threshold) {
      level += 1;
    } else {
      break;
    }
  }
  return Math.min(6, level);
}

export function totalAbilityLevels(abilities: Record<AbilityId, number>): number {
  return ABILITY_ORDER.reduce((sum, id) => sum + abilityLevel(abilities[id]), 0);
}

const RANKS = [
  { name: "初阶观察者", nameEn: "Observer", min: 0, color: "#9fb3c8" },
  { name: "实干者", nameEn: "Executor", min: 16, color: "#57c7a3" },
  { name: "破局者", nameEn: "Breaker", min: 26, color: "#4db7d6" },
  { name: "变革者", nameEn: "Transformer", min: 38, color: "#e9826c" },
  { name: "执权者", nameEn: "Power Holder", min: 48, color: "#f2c14e" }
];

export function rankForTotal(total: number): {
  name: string;
  nameEn: string;
  min: number;
  color: string;
} {
  return [...RANKS].reverse().find((rank) => total >= rank.min) ?? RANKS[0];
}

export interface RankProgress {
  rank: ReturnType<typeof rankForTotal>;
  next?: ReturnType<typeof rankForTotal>;
  progress: number;
  remaining: number;
}

export function rankProgress(total: number): RankProgress {
  const current = rankForTotal(total);
  const index = RANKS.findIndex((rank) => rank.min === current.min);
  const next = index >= 0 && index < RANKS.length - 1 ? RANKS[index + 1] : undefined;
  if (!next) {
    return { rank: current, progress: 100, remaining: 0 };
  }
  const span = next.min - current.min;
  const progress = Math.min(
    100,
    Math.max(0, Math.round(((total - current.min) / span) * 100))
  );
  return {
    rank: current,
    next,
    progress,
    remaining: Math.max(0, next.min - total)
  };
}

export function abilityRanking(
  abilities: Record<AbilityId, number>,
  count = 3
): AbilityId[] {
  return ABILITY_ORDER.slice()
    .sort((a, b) => abilities[b] - abilities[a])
    .slice(0, count);
}

export function weakestAbilities(
  abilities: Record<AbilityId, number>,
  count = 1
): AbilityId[] {
  return ABILITY_ORDER.slice()
    .sort((a, b) => abilities[a] - abilities[b])
    .slice(0, count);
}

export function createDefaultAbilities(): Record<AbilityId, number> {
  return {
    insight: 0,
    deploy: 0,
    mobilize: 0,
    strategy: 0,
    authority: 0,
    stability: 0,
    recovery: 0,
    execution: 0,
    structure: 0,
    communication: 0
  };
}

export function resourceLabel(resource: keyof typeof RESOURCE_NAMES): string {
  return RESOURCE_NAMES[resource];
}

export const RESOURCE_NAMES = {
  energy: "剧情精力",
  trust: "信任",
  influence: "影响力",
  capital: "组织资源"
} as const;
