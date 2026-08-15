import type { AbilityId, RoleId, StoryNode, StoryOption } from "./types.ts";
import { ABILITIES } from "./abilities.ts";

interface ExtraSceneBase {
  titleZh: string;
  titleEn: string;
  contextZh: string;
  contextEn: string;
  stakeZh: string;
  stakeEn: string;
}

const EXTRA_SCENE_BASES: ExtraSceneBase[] = [
  {
    titleZh: "值班事故",
    titleEn: "On-Call Incident",
    contextZh:
      "深夜两点，系统监控连续告警，核心服务开始降级。值班工程师已经忙了半小时，群里开始出现互相猜测：“是不是上线改的？”“是不是数据脚本的问题？”",
    contextEn:
      "At 2 a.m., monitoring alerts fire in sequence and core service degrades. The on-call engineer has worked for half an hour, and the channel fills with guesses: is it a deployment, a data script, or something else?",
    stakeZh: "你的第一优先是止血，而不是找责任人；复盘要留在服务恢复之后。",
    stakeEn: "Your first priority is containment, not blame; the postmortem comes after the service is restored."
  },
  {
    titleZh: "人选组合",
    titleEn: "Team Composition",
    contextZh:
      "你有一笔有限的人才预算，要在十个候选人里挑出五个人组成新团队。每个人身上都有可见特质，也可能藏着简历看不出来的短板。",
    contextEn:
      "With a limited talent budget, you must choose five people from a pool of ten to build a new team. Every candidate has visible traits, and some hide weaknesses no résumé reveals.",
    stakeZh: "你选谁，比你说什么更能暴露你的管理判断；组合要配得过未来半年的关键任务。",
    stakeEn: "Who you pick reveals more than what you say; the combination must match the critical tasks of the next six months."
  },
  {
    titleZh: "优先级抉择",
    titleEn: "Prioritization Under Overload",
    contextZh:
      "四件重要的事同时到期：客户续约、预算答辩、核心员工谈话、系统安全整改。团队只能同时推进两件。",
    contextEn:
      "Four important things land at once: a client renewal, a budget defense, a conversation with a core employee, and a security remediation. The team can only push two at a time.",
    stakeZh: "优先级不是按紧急程度排，而是按“不做哪一件损失最大”排。",
    stakeEn: "Priority is not sorted by urgency; it is sorted by which omission costs the most."
  },
  {
    titleZh: "伦理两难",
    titleEn: "Ethics Dilemma",
    contextZh:
      "一个重要客户提出灰色要求：先按口头承诺开工，付款以后再补合同，理由是“流程太慢会错过机会”。合规部门提醒你风险。",
    contextEn:
      "A key client makes a gray request: start on a verbal promise, sign the contract after payment, because process is too slow for the opportunity. Compliance warns you of the risk.",
    stakeZh: "保住客户与守住规则不能靠和稀泥；你需要一个既尊重机会、又不破例的方案。",
    stakeEn: "Keeping the client and holding the rule cannot be handled by vague compromise; you need a plan that respects the opportunity without breaking the precedent."
  },
  {
    titleZh: "危机通报",
    titleEn: "Crisis Communication",
    contextZh:
      "负面消息开始在内部和外部同时扩散：客户截图、离职传闻、供应商抱怨出现在同一个晚上。高管要求你统一口径。",
    contextEn:
      "Bad news spreads inside and outside at once: a client screenshot, a departure rumor, and a supplier complaint surface the same evening. Leadership asks you to unify the message.",
    stakeZh: "口径统一不等于隐瞒；你要让内部敢说话、外部看到行动。",
    stakeEn: "A unified message is not concealment; it lets the inside speak honestly and the outside see action."
  },
  {
    titleZh: "历史案例",
    titleEn: "Decision Lab Case",
    contextZh:
      "你面对一个和经典管理案例几乎同构的局面：资源有限、时间紧迫、各方利益纠缠，但没有一个人能给你完整信息。",
    contextEn:
      "You face a situation nearly identical to a classic management case: limited resources, a tight deadline, and tangled interests, with no one able to give you complete information.",
    stakeZh: "案例已经告诉你会发生什么；你的价值在于这次能否做出不同选择。",
    stakeEn: "The case already shows what will happen; your value is whether you choose differently this time."
  },
  {
    titleZh: "风险敞口",
    titleEn: "Risk Exposure",
    contextZh:
      "月度风险报告显示：某个业务线的敞口连续三个月上升，但没有触发任何红线。财务说“数据波动正常”，业务说“这是增长”。",
    contextEn:
      "The monthly risk report shows exposure in one business line rising for three consecutive months without triggering any red line. Finance calls it normal fluctuation; the business calls it growth.",
    stakeZh: "风险往往不是突然爆发的，而是被“看起来正常”的标签盖住的；你要决定何时把它摆上台面。",
    stakeEn: "Risk rarely explodes suddenly; it hides under the label of normal. You must decide when to put it on the table."
  }
];

/**
 * 每个模板场景按角色的真实情境/赌注区分。此前只是给相同文案加"空降/创业/高潜视角"前缀，
 * 三个角色的选项又完全相同，是"假分支"。这里让情境真正随角色差异，保留章节 detail/stake 追加。
 */
const EXTRA_SCENE_ROLE_FRAMING: Record<
  string,
  Partial<Record<RoleId, { contextZh: string; stakeZh: string }>>
> = {
  值班事故: {
    parachute: {
      contextZh:
        "深夜两点系统告警，你空降才两个月，对这套老系统的细节还不熟，只能依赖值班工程师——而他们正通过你这次的反应，判断你值不值得跟。",
      stakeZh: "你赌的是老团队对你这个外来者的第一份信任。"
    },
    founder: {
      contextZh:
        "凌晨两点系统崩了，你的初创公司没有值班团队，你就是第一响应人，客户正在流失，合伙人在等你拿主意。",
      stakeZh: "你赌的是公司能不能活过这个晚上。"
    },
    highPotential: {
      contextZh:
        "深夜故障，你被临时拉进应急群，没有处理权限却被期待给出判断，资深同事正看你敢不敢担责。",
      stakeZh: "你赌的是自己在组织里的可信度。"
    }
  },
  人选组合: {
    parachute: {
      contextZh:
        "你要在十个候选人里挑五个组队，简历之外你只能靠有限的观察判断谁可靠、谁在藏短板。",
      stakeZh: "你赌的是对这个陌生团队的第一轮识人判断。"
    },
    founder: {
      contextZh:
        "预算有限，你要从十个人里挑五个搭创始团队，错选一个人会直接拖垮现金流和士气。",
      stakeZh: "你赌的是公司未来半年的生死。"
    },
    highPotential: {
      contextZh:
        "你被邀请参与人才盘点，要给出不偏袒任何派系的专业判断，但名单背后是各方的人情。",
      stakeZh: "你赌的是自己的判断能否被各方接受。"
    }
  },
  优先级抉择: {
    parachute: {
      contextZh:
        "四件事同时到期，你还不清楚哪件事背后牵扯最多人的利益，做错选择会立刻暴露你对组织的不熟悉。",
      stakeZh: "你赌的是对组织暗流的判断。"
    },
    founder: {
      contextZh:
        "客户续约、预算答辩、核心员工谈话、安全整改同时告急，每拖延一天都在烧钱。",
      stakeZh: "你赌的是公司现金流还能撑多久。"
    },
    highPotential: {
      contextZh:
        "你没有足够话语权，只能从四件事里挑最可能被看见、最可能被支持的一件推进。",
      stakeZh: "你赌的是有限的注意力该押在哪里。"
    }
  },
  伦理两难: {
    parachute: {
      contextZh:
        "前任留下的灰色惯例摆在你面前，打破它可能得罪既得利益者，延续它可能让你背锅。",
      stakeZh: "你赌的是原则和现实的边界。"
    },
    founder: {
      contextZh:
        "客户的灰色要求关乎一笔生死订单，你要活下来，又不能留下将来被清算的把柄。",
      stakeZh: "你赌的是公司的底线值多少钱。"
    },
    highPotential: {
      contextZh:
        "你发现了灰色操作但没权处理，举报可能断送前程，沉默可能被视作共谋。",
      stakeZh: "你赌的是良心与前途的取舍。"
    }
  },
  危机通报: {
    parachute: {
      contextZh:
        "内外同时传出负面消息，你还没建立自己的口径，高管却要你立刻表态，说错一句会被记很久。",
      stakeZh: "你赌的是这次表态能不能建立权威。"
    },
    founder: {
      contextZh:
        "公司被截图、传闻、抱怨围攻，投资人开始追问，你要在几小时内定调，慢了谣言就会替你定。",
      stakeZh: "你赌的是外界的最后一点耐心。"
    },
    highPotential: {
      contextZh:
        "你被要求'统一口径'，但你知道真相和上面的说法有出入，说还是不说都有风险。",
      stakeZh: "你赌的是敢不敢在口径之外说真话。"
    }
  },
  历史案例: {
    parachute: {
      contextZh:
        "你面对的局面和经典案例几乎同构，你担心自己会重蹈案例里的覆辙，所有人都等着看你选哪边。",
      stakeZh: "你赌的是自己能否比案例里的前人更清醒。"
    },
    founder: {
      contextZh:
        "你正经历教科书级的困局，唯一的区别是这次你押上了全部身家，没有重来的机会。",
      stakeZh: "你赌的是公司的一线生机。"
    },
    highPotential: {
      contextZh:
        "你在案例复盘里被要求做决策，所有人都知道你选得对不对都会被记住。",
      stakeZh: "你赌的是这次选择会成为别人对你的评价。"
    }
  },
  风险敞口: {
    parachute: {
      contextZh:
        "你发现某业务线风险连续三个月上升，财务和业务都说'正常'，你还没拿到关键数据去戳破这层平静。",
      stakeZh: "你赌的是要不要在站稳之前就掀桌子。"
    },
    founder: {
      contextZh:
        "公司风险敞口在涨，没人敢向你汇报坏消息，你怕自己被'看起来正常'的标签麻痹。",
      stakeZh: "你赌的是公司会不会在平静里翻船。"
    },
    highPotential: {
      contextZh:
        "你看到了风险但没人在听，你要决定是否以及如何把这件事摆上台面。",
      stakeZh: "你赌的是要不要做那个指出问题的人。"
    }
  }
};

const CHAPTER_EXTRA_DETAILS: Record<
  number,
  { zh: string; en: string }
> = {
  1: {
    zh: "空降第二个月，前任遗留的问题开始集中暴露。",
    en: "Two months into the parachute role, the predecessor's unresolved problems surface at once."
  },
  2: {
    zh: "授权仍未落地，你只能靠成果换名分。",
    en: "Authority has still not landed, so you must trade visible results for legitimacy."
  },
  3: {
    zh: "重组名单已经提交，人心开始重新排队。",
    en: "The restructuring list is submitted and people are already choosing sides."
  },
  4: {
    zh: "反对声浪稍有平息，但暗流仍在。",
    en: "Public opposition has eased, but the undercurrent remains."
  },
  5: {
    zh: "季度目标压顶，每一个决策都被放大。",
    en: "Quarterly targets loom and every decision is amplified."
  },
  6: {
    zh: "权力边界正在被反复试探。",
    en: "Your authority boundary is being tested again and again."
  },
  7: {
    zh: "你正在准备交接，组织开始考验旧习惯。",
    en: "As you prepare the handover, the organization begins testing its old habits."
  },
  8: {
    zh: "危机刚过，团队仍处在应激状态。",
    en: "The crisis has passed, but the team is still in survival mode."
  },
  9: {
    zh: "离开倒计时开始，每个决定都在塑造遗产。",
    en: "The departure countdown begins, and every decision shapes your legacy."
  }
};

const CHAPTER_EXTRA_STAKES: Record<
  number,
  { zh: string; en: string }
> = {
  1: {
    zh: "第一轮信任还经不起一次草率动作。",
    en: "The first round of trust cannot survive a careless move."
  },
  2: {
    zh: "在授权真空里，每一个动作都会被解读为你要不要权力。",
    en: "In the authority vacuum, every action is read as a bid for power."
  },
  3: {
    zh: "名单已经交上去，任何新判断都会改变人心排序。",
    en: "The list is submitted; any new judgment reshuffles people's loyalties."
  },
  4: {
    zh: "反对者还在观望，你的处理方式会决定他们下一步站哪边。",
    en: "Opponents are still watching; how you respond decides their next move."
  },
  5: {
    zh: "季度数字面前，过程正确和结果达标同样会被审视。",
    en: "With quarterly numbers at stake, both process quality and results are under review."
  },
  6: {
    zh: "边界一旦被划错，修复成本远高于第一次划对。",
    en: "A wrongly drawn boundary costs far more to fix than drawing it right the first time."
  },
  7: {
    zh: "交接期里的每一次破例，都会被继任者当成默认规则。",
    en: "Every exception during handover becomes a default rule for your successor."
  },
  8: {
    zh: "应激状态下的团队，会把你的慌乱放大成组织的慌乱。",
    en: "In survival mode, the team amplifies your panic into organizational panic."
  },
  9: {
    zh: "离开之后，这串判断会被反复拿出来检验你留下的系统。",
    en: "After you leave, this sequence of judgments will repeatedly test the system you left behind."
  }
};

const CHAPTER_TITLES_ZH: Record<number, string> = {
  1: "识局",
  2: "谋权",
  3: "用人",
  4: "驭势",
  5: "执权",
  6: "掌权",
  7: "固权",
  8: "破局",
  9: "成业"
};

const CHAPTER_TITLES_EN: Record<number, string> = {
  1: "Read the Situation",
  2: "Build Power",
  3: "Deploy People",
  4: "Move the Tide",
  5: "Hold Execution",
  6: "Guard Authority",
  7: "Consolidate Power",
  8: "Break Through",
  9: "Leave a Legacy"
};

const CHAPTER_FOCUS: Record<number, AbilityId[]> = {
  1: ["insight", "structure"],
  2: ["strategy", "communication"],
  3: ["deploy", "insight"],
  4: ["mobilize", "communication"],
  5: ["execution", "authority"],
  6: ["authority", "structure"],
  7: ["stability", "deploy"],
  8: ["structure", "recovery"],
  9: ["stability", "strategy"]
};

function buildOptions(
  ability: AbilityId,
  base: ExtraSceneBase,
  slot: number,
  chapterId: number
): StoryOption[] {
  const abilityName = ABILITIES[ability].name;
  const variant = slot % 2;
  const chapterTag = `第${chapterId}章 · ${base.titleZh}`;
  const expertLabelsZh = [
    `先把${abilityName}所需的事实和流程对齐，再让决策公开可验收（${chapterTag}）`,
    `先用一个小范围试点验证${abilityName}的判断，再决定是否全面推开（${chapterTag}）`
  ];
  const partialLabelsZh = [
    `先按现状推进，边做边观察（${chapterTag}）`,
    `先处理最显眼的问题，把深层原因留到下一轮（${chapterTag}）`
  ];
  const riskLabelsZh = [
    `当众摊牌，用一次强信号逼局面转向（${chapterTag}）`,
    `绕过流程直接调动资源，抢在对手之前完成动作（${chapterTag}）`
  ];
  const secondary: AbilityId = ability === "structure" ? "insight" : "structure";
  const options: StoryOption[] = [
    {
      label: expertLabelsZh[variant],
      summary: `把「${base.titleZh}」变成一次可验证的${abilityName}练习。`,
      quality: "expert",
      effects: { [ability]: 2, [secondary]: 1 },
      resources: { energy: -6, trust: 5, influence: 2 },
      feedback: `你没有停在直觉判断上，而是把模糊局面拆成一套可检查、可复制的流程，让${abilityName}第一次能被团队学走。`,
      theory: ABILITIES[ability].sources[0]
    },
    {
      label: partialLabelsZh[variant],
      summary: `先稳住眼前，再回头补齐证据。`,
      quality: "partial",
      effects: { [ability]: 1 },
      resources: { influence: 1 },
      feedback: `你暂时稳住了局面、让紧张缓了下来，但${abilityName}背后的核心张力仍没有打开，问题只是被推迟了。`,
      theory: ABILITIES[ability].sources[1] ?? ABILITIES[ability].sources[0]
    },
    {
      label: riskLabelsZh[variant],
      summary: `用一次强信号换取局面破口。`,
      quality: "risk",
      effects: { [ability]: 1, authority: ability === "authority" ? 2 : 1 },
      resources: { energy: -9, trust: -6, influence: 4, capital: -2 },
      feedback: `你用一次强信号硬推局面转向，短期见效，却也消耗了信任、资源与团队的耐心，代价会在之后显现。`,
      theory: "《权经》：用权有度，过刚则折。"
    }
  ];
  return options;
}

const ABILITY_NAME_EN: Record<AbilityId, string> = {
  insight: "Insight",
  deploy: "Deployment",
  mobilize: "Mobilization",
  strategy: "Strategy",
  authority: "Authority",
  stability: "Stability",
  recovery: "Recovery",
  execution: "Execution",
  structure: "Structure",
  communication: "Communication"
};

function buildEnOptionViews(
  ability: AbilityId,
  base: ExtraSceneBase,
  slot: number,
  chapterId: number
): Array<{ label: string; summary: string; feedback: string }> {
  const abilityNameEn = ABILITY_NAME_EN[ability];
  const variant = slot % 2;
  const chapterTag = `Chapter ${chapterId} · ${base.titleEn}`;
  const expertLabels = [
    `Align the facts and process ${abilityNameEn} needs (${chapterTag})`,
    `Validate your ${abilityNameEn} judgment in a small pilot (${chapterTag})`
  ];
  const partialLabels = [
    `Proceed with the current pace while observing (${chapterTag})`,
    `Fix the most visible issue first (${chapterTag})`
  ];
  const riskLabels = [
    `Lay your cards on the table and force the situation to turn (${chapterTag})`,
    `Mobilize resources around the process and move before your rivals (${chapterTag})`
  ];
  return [
    {
      label: expertLabels[variant],
      summary: `Turn "${base.titleEn}" into a verifiable ${abilityNameEn} practice.`,
      feedback: `You used ${abilityNameEn} to turn the fuzzy situation into executable process, and the team started trusting that judgment can be reproduced.`
    },
    {
      label: partialLabels[variant],
      summary: "Stabilize the visible problem first, then gather evidence.",
      feedback: `You eased the immediate tension, but the core tension behind ${abilityNameEn} remains open.`
    },
    {
      label: riskLabels[variant],
      summary: "Trade a strong signal for a breakthrough.",
      feedback: "Your strong signal moved the situation but cost trust and resources."
    }
  ];
}

function buildExtraMainNodes(): {
  nodes: StoryNode[];
  en: Record<string, { title: string; context: string; stake: string }>;
  theoryEn: Record<string, string[]>;
  intel: Record<string, string[]>;
  optionsEn: Record<string, Array<{ label: string; summary: string; feedback: string }>>;
  roleVariants: Record<
    string,
    Partial<Record<RoleId, { context: string; stake: string }>>
  >;
} {
  const nodes: StoryNode[] = [];
  const en: Record<string, { title: string; context: string; stake: string }> = {};
  const theoryEn: Record<string, string[]> = {};
  const intel: Record<string, string[]> = {};
  const optionsEn: Record<
    string,
    Array<{ label: string; summary: string; feedback: string }>
  > = {};
  const roleVariants: Record<
    string,
    Partial<Record<RoleId, { context: string; stake: string }>>
  > = {};
  for (let chapterId = 1; chapterId <= 9; chapterId += 1) {
    const detail = CHAPTER_EXTRA_DETAILS[chapterId];
    const chapterStake = CHAPTER_EXTRA_STAKES[chapterId];
    EXTRA_SCENE_BASES.forEach((base, slot) => {
      const nodeNumber = slot + 3;
      const id = `c${chapterId}n${nodeNumber}`;
      const ability = CHAPTER_FOCUS[chapterId][slot % 2];
      nodes.push({
        id,
        chapterId,
        title: `${CHAPTER_TITLES_ZH[chapterId]} · ${base.titleZh}`,
        kind: "main",
        context: `${base.contextZh} ${detail.zh}`,
        stake: `${base.stakeZh}；${chapterStake.zh}`,
        options: buildOptions(ability, base, slot, chapterId)
      });
      en[id] = {
        title: `${CHAPTER_TITLES_EN[chapterId]} · ${base.titleEn}`,
        context: `${base.contextEn} ${detail.en}`,
        stake: `${base.stakeEn} ${chapterStake.en}`
      };
      theoryEn[id] = [
        "Evidence before judgment, and judgment before commitment.",
        "Process protects decisions better than personal force.",
        "Shared ownership turns resistance into momentum."
      ];
      optionsEn[id] = buildEnOptionViews(ability, base, slot, chapterId);
      intel[id] = [
        `「${base.titleZh}」涉及的记录需要交叉核对`,
        `当前章节背景：${detail.zh}`,
        "真正的判断依据往往不在第一份材料里"
      ];
      const framing = EXTRA_SCENE_ROLE_FRAMING[base.titleZh] ?? {};
      const roleContextFor = (role: RoleId): { context: string; stake: string } => {
        const f = framing[role];
        return {
          context: `${f?.contextZh ?? base.contextZh} ${detail.zh}`,
          stake: `${f?.stakeZh ?? base.stakeZh}；${chapterStake.zh}`
        };
      };
      roleVariants[id] = {
        parachute: roleContextFor("parachute"),
        founder: roleContextFor("founder"),
        highPotential: roleContextFor("highPotential")
      };
    });
  }
  return { nodes, en, theoryEn, intel, optionsEn, roleVariants };
}

const built = buildExtraMainNodes();

export const EXTRA_MAIN_NODES = built.nodes;
export const EXTRA_MAIN_EN = built.en;
export const EXTRA_MAIN_THEORY_EN = built.theoryEn;
export const EXTRA_MAIN_INTEL = built.intel;
export const EXTRA_MAIN_OPTIONS_EN = built.optionsEn;
export const EXTRA_MAIN_ROLE_VARIANTS = built.roleVariants;
