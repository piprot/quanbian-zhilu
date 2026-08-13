import type {
  AbilityId,
  StoryNode,
  StoryOption
} from "./types.ts";
import { ABILITIES, ABILITY_ORDER } from "./abilities.ts";

interface DuelSetting {
  zhTitle: string;
  enTitle: string;
  zhContext: string;
  enContext: string;
  zhStake: string;
  enStake: string;
}

const SETTINGS: DuelSetting[] = [
  {
    zhTitle: "季度启动会",
    enTitle: "Quarterly Kickoff",
    zhContext:
      "启动会上，各部门都拿到了新指标。有人当场叫好，有人反复追问口径，有人一言不发把手机收进抽屉。",
    enContext:
      "At the kickoff, every department receives new targets. Some cheer, some keep questioning the numbers, and one person silently puts their phone away.",
    zhStake: "会议结束前，你必须判断谁的话可信、谁的动作会拖垮进度。",
    enStake: "Before the meeting ends, you must decide whose words count and whose actions will slow delivery."
  },
  {
    zhTitle: "大客户投诉",
    enTitle: "Key Client Complaint",
    zhContext:
      "重要客户投诉交付质量，并暗示如果本周没有方案就要重新评估合作。销售、交付、产品各自给出了不同的解释。",
    enContext:
      "A key client complains about delivery quality and hints they may reconsider the partnership unless a plan arrives this week. Sales, delivery, and product all tell different stories.",
    zhStake: "你需要在信息相互矛盾时，决定先回应客户还是先核清内部事实。",
    enStake: "With conflicting accounts, you must choose between reassuring the client and verifying internal facts."
  },
  {
    zhTitle: "跨部门资源战",
    enTitle: "Cross-Team Resource War",
    zhContext:
      "两个部门同时申请同一批工程师。两边都声称自己的事情更紧急，高层则等着你给出一个不会被推翻的分配建议。",
    enContext:
      "Two teams request the same engineers at once. Both insist they are more urgent, and leadership waits for an allocation that will not be overturned.",
    zhStake: "资源只有一份，你的分配依据必须能公开讲清楚。",
    enStake: "There is only one pool of resources, and your reasoning must survive public scrutiny."
  },
  {
    zhTitle: "核心骨干请辞",
    enTitle: "Core Member Resigns",
    zhContext:
      "一位核心骨干提出离职，理由是“想换个方向”。你知道他最近被另一个项目反复拉去救火，已经连续三周没有完整休息。",
    enContext:
      "A core member hands in their resignation, saying they want a new direction. You know they have been pulled into firefighting for three straight weeks.",
    zhStake: "挽留他的话可能明天就失效，你需要先听懂真正的原因。",
    enStake: "A retention pitch may expire tomorrow, so you must first understand the real reason."
  },
  {
    zhTitle: "数据异常",
    enTitle: "Data Anomaly",
    zhContext:
      "月底报表出现一条异常数据：成本比上月高出 23%，但系统里找不到对应的审批记录。财务说“可能只是口径问题”。",
    enContext:
      "The month-end report shows an anomaly: costs are 23% higher than last month, but no matching approval record exists. Finance says it may be a definition issue.",
    zhStake: "你需要在避免冤枉人和放过真问题之间做出选择。",
    enStake: "You must choose between protecting someone from blame and overlooking a real problem."
  },
  {
    zhTitle: "并购传闻",
    enTitle: "Merger Rumor",
    zhContext:
      "公司可能被并购的传闻在内部蔓延。有人开始私下联系外部机会，也有人趁机争夺新组织里的位置。",
    enContext:
      "A merger rumor spreads through the company. Some people quietly reach out to external opportunities while others compete for positions in the new organization.",
    zhStake: "谣言会改变行为，你要决定先澄清信息，还是先稳住关键人。",
    enStake: "Rumors change behavior, so you must decide whether to clarify facts first or stabilize key people first."
  },
  {
    zhTitle: "供应链中断",
    enTitle: "Supply Chain Break",
    zhContext:
      "关键供应商突然停供，替代方案要两周才能到位。团队提出三种应急路径，每一种都有代价。",
    enContext:
      "A key supplier stops delivery abruptly, and the alternative needs two weeks. Your team proposes three contingency paths, each with its own cost.",
    zhStake: "你需要在有限信息和更大代价之间，选出一条能立刻执行的路径。",
    enStake: "With limited information and real costs, you must pick a path that can start today."
  },
  {
    zhTitle: "项目延期",
    enTitle: "Project Delay",
    zhContext:
      "核心项目确认延期三周。客户已经催了两轮，团队里开始互相推责：产品说需求不清，开发说排期太紧，测试说环境不稳定。",
    enContext:
      "The core project is delayed by three weeks. The client has asked twice, and the team blames each other: product says requirements were unclear, engineering says the timeline was tight, QA says the environment was unstable.",
    zhStake: "今晚之前，你需要一个既能让客户接受、又不只是安慰的恢复计划。",
    enStake: "Before tonight, you need a recovery plan that the client can accept and that is not just comfort."
  },
  {
    zhTitle: "新官上任",
    enTitle: "New Leader Arrives",
    zhContext:
      "一位新上级空降，第一周就调整了汇报线，并约你单独谈话。你还不清楚他的真实目标，团队已经在猜测谁会被边缘化。",
    enContext:
      "A new boss arrives, reshuffles reporting lines in the first week, and asks for a private talk. You do not know their real goals yet, and the team already guesses who will be marginalized.",
    zhStake: "第一印象会决定未来三个月的空间，你要决定如何开场。",
    enStake: "The first impression shapes the next three months, so you must decide how to open the conversation."
  },
  {
    zhTitle: "深夜复盘",
    enTitle: "Late-Night Review",
    zhContext:
      "项目刚经历一次失败复盘。会议室里只剩几个人，有人自责，有人沉默，有人已经开始讨论下一次方案的细节。",
    enContext:
      "A project has just been reviewed after failure. Only a few people remain in the room: someone blames themselves, someone stays silent, and someone already discusses details of the next plan.",
    zhStake: "复盘的质量取决于你如何结束今晚，而不是你如何总结数据。",
    enStake: "The quality of the review depends on how you end tonight, not how you summarize the data."
  },
  {
    zhTitle: "市场突变",
    enTitle: "Market Shift",
    zhContext:
      "竞品突然降价 30%，你的核心产品三天内流失了两位签约客户。市场部建议跟进降价，财务提醒现金流只够撑一个季度。",
    enContext:
      "A competitor cuts prices by 30%, and your core product loses two signed clients in three days. Marketing wants to match the price; finance warns cash flow only lasts one quarter.",
    zhStake: "你需要在跟随市场与守住基本盘之间找到新的平衡点。",
    enStake: "You must find a new balance between following the market and protecting the base."
  },
  {
    zhTitle: "老团队排外",
    enTitle: "Veteran Clique",
    zhContext:
      "你带的项目里，几位老员工习惯了原来的流程，对新方案总说“我们以前试过”。新人提出的想法经常在会议里被打断。",
    enContext:
      "In your project, several veterans are used to the old process and keep saying “we tried that before.” New people's ideas are often interrupted in meetings.",
    zhStake: "你要让老经验不变成阻力，又不能让新人失去表达空间。",
    enStake: "You must keep old experience from becoming resistance without silencing new voices."
  },
  {
    zhTitle: "预算被砍",
    enTitle: "Budget Cut",
    zhContext:
      "年中预算被砍 20%。原计划的三个项目只能保住一个半，团队不知道哪个方向会被放弃。",
    enContext:
      "The mid-year budget is cut by 20%. Of three planned projects, only one and a half can survive, and the team does not know which direction will be dropped.",
    zhStake: "你需要在资源不足时，让放弃和保留都变成清晰的决定。",
    enStake: "With fewer resources, you must make both the cuts and the keeps into clear decisions."
  },
  {
    zhTitle: "越级指挥",
    enTitle: "Skip-Level Order",
    zhContext:
      "高层绕过你直接给下属布置任务，还要求今晚交付。下属来问你要不要执行，你还没有收到任何正式沟通。",
    enContext:
      "Senior leadership gives a direct order to your subordinate, bypassing you, and asks for delivery tonight. The subordinate asks whether to proceed while you have received no official communication.",
    zhStake: "你的回应既要保护流程，又不能当场顶撞高层。",
    enStake: "Your response must protect the process without directly confronting leadership."
  },
  {
    zhTitle: "试点失败",
    enTitle: "Pilot Failure",
    zhContext:
      "你力推的试点项目在第三周暴露严重问题。支持者开始沉默，反对者开始翻旧账，客户还在等待承诺过的结果。",
    enContext:
      "The pilot you championed hits a serious problem in week three. Supporters grow quiet, opponents revisit old grievances, and the client still waits for promised results.",
    zhStake: "你需要在承认失败与保住方向之间，找到下一步能走的路。",
    enStake: "You must acknowledge the failure while preserving a path forward."
  },
  {
    zhTitle: "晋升争议",
    enTitle: "Promotion Dispute",
    zhContext:
      "年度晋升名单公布后，两位表现接近的骨干都觉得自己应该上位。消息传到团队，有人开始站队。",
    enContext:
      "After the annual promotion list is announced, two equally strong performers each believe they deserve the role. The news spreads, and people begin choosing sides.",
    zhStake: "你的判断标准必须经得起追问，而不是只给一个名额安抚。",
    enStake: "Your criteria must survive questioning instead of being a single slot of appeasement."
  },
  {
    zhTitle: "灰色要求",
    enTitle: "Gray Request",
    zhContext:
      "重要客户提出一个“可以变通”的交付要求：先不签合同、先按口头承诺开工，付款以后再补流程。",
    enContext:
      "A key client proposes a “flexible” delivery: start work on a verbal promise, skip the contract, and complete paperwork after payment.",
    zhStake: "你既要保住客户，也不能让组织为一次破例承担失控风险。",
    enStake: "You must keep the client without letting one exception erode organizational control."
  },
  {
    zhTitle: "全员质疑",
    enTitle: "All-Hands Challenge",
    zhContext:
      "全员会上，有人公开质疑你的决策方向：“为什么我们的优先级和上季度完全相反？”现场气氛安静，所有人都在等你回答。",
    enContext:
      "At an all-hands meeting, someone publicly challenges your direction: “Why is our priority exactly the opposite of last quarter?” The room goes quiet and waits for your answer.",
    zhStake: "你需要在几十人面前把决策逻辑讲清楚，又不让质疑者下不来台。",
    enStake: "You must explain your reasoning in front of dozens of people without humiliating the questioner."
  },
  {
    zhTitle: "裁员压力",
    enTitle: "Layoff Pressure",
    zhContext:
      "总部要求压缩人力成本，但名单上没有给出具体人选。管理层希望你“根据绩效表快速提供建议”，团队已经开始焦虑。",
    enContext:
      "Headquarters asks to cut staffing costs but gives no names. Management wants a quick recommendation from performance sheets while the team grows anxious.",
    zhStake: "你需要在服从压力与保留组织能力之间做出选择。",
    enStake: "You must choose between complying with pressure and preserving organizational capability."
  },
  {
    zhTitle: "目标重定",
    enTitle: "Goal Reset",
    zhContext:
      "年初刚定下的年度目标被总部推翻，新的数字比原计划高出 40%，理由只有一句话：“市场环境变了。”",
    enContext:
      "The annual goal set in January is overturned by headquarters, replaced by a number 40% higher, with a single explanation: “The market has changed.”",
    zhStake: "你要让团队相信目标可执行，而不是再经历一次空转。",
    enStake: "You must make the goal believable and executable instead of another round of spinning wheels."
  }
];

const ABILITY_FOCUS: Record<
  AbilityId,
  { zh: string; en: string }
> = {
  insight: {
    zh: "你需要判断谁真正值得信任",
    en: "you must judge who is truly worth trusting"
  },
  deploy: {
    zh: "你需要把对的人放进对的坑",
    en: "you must put the right people in the right roles"
  },
  mobilize: {
    zh: "你需要让一群不情愿的人一起走",
    en: "you must move a reluctant group together"
  },
  strategy: {
    zh: "你需要在授权之前先建势",
    en: "you must build momentum before asking for authority"
  },
  authority: {
    zh: "你需要用制度而不是强势守住决策权",
    en: "you must protect decisions with structure, not force"
  },
  stability: {
    zh: "你需要让组织不依赖任何个人",
    en: "you must make the organization independent of any one person"
  },
  recovery: {
    zh: "你需要先管理精力，再管理结果",
    en: "you must manage energy before managing outcomes"
  },
  execution: {
    zh: "你需要把方向拆成可验收的成果",
    en: "you must turn direction into verifiable results"
  },
  structure: {
    zh: "你需要在模糊中先拆出问题",
    en: "you must decompose the problem before choosing"
  },
  communication: {
    zh: "你需要把关键人拉到同一页",
    en: "you must bring key people onto the same page"
  }
};

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

const EXPERT_LABELS: Record<AbilityId, [string, string]> = {
  insight: ["先重建完整证据链，再判断关键人", "先访谈关键人物，验证真实动机"],
  deploy: ["先按岗位成果重新排兵布阵", "把任务分给最接近证据的人"],
  mobilize: ["先安抚反对者，把顾虑写进方案", "先建立共同目标，再分配责任"],
  strategy: ["先造势再争权，等待授权窗口", "先拿小胜积累筹码，再谈资源"],
  authority: ["把关键决策纳入联签机制", "用制度守住边界，再行使权力"],
  stability: ["把高频判断写成清单与复盘库", "先建立梯队，再交权"],
  recovery: ["先隔离压力，恢复精力再决策", "把恢复时段写进日程"],
  execution: ["把目标拆成三个可验收结果", "先设检查节点，再开始执行"],
  structure: ["先把问题定义清楚，再拆因果链", "先找主要矛盾，再列验证假设"],
  communication: ["先同步目标，再用一页纪要锁定责任", "先倾听关键人，再对齐方案"]
};

const EXPERT_LABELS_EN: Record<AbilityId, [string, string]> = {
  insight: [
    "Rebuild the full evidence chain before judging anyone",
    "Interview key people to verify real motives"
  ],
  deploy: [
    "Reshape assignments around measurable outcomes",
    "Give the task to whoever is closest to evidence"
  ],
  mobilize: [
    "Address resistance first and put concerns into the plan",
    "Build a shared goal before assigning responsibility"
  ],
  strategy: [
    "Build momentum before asking for authority",
    "Win small battles first, then negotiate resources"
  ],
  authority: [
    "Put critical decisions into a co-signing mechanism",
    "Guard boundaries with procedure, not force"
  ],
  stability: [
    "Turn frequent judgments into checklists and reviews",
    "Build a bench before handing over power"
  ],
  recovery: [
    "Isolate pressure and restore energy before deciding",
    "Put recovery time on the calendar"
  ],
  execution: [
    "Split the goal into three verifiable results",
    "Set checkpoints before execution starts"
  ],
  structure: [
    "Define the problem before tracing causal chains",
    "Find the main contradiction, then test hypotheses"
  ],
  communication: [
    "Align goals first, then lock owners with one page",
    "Listen to key people before aligning the plan"
  ]
};

const PARTIAL_LABELS: Record<AbilityId, [string, string]> = {
  insight: ["先按现有印象推进，边做边观察", "先处理最明显的症状"],
  deploy: ["先维持现有人事，暂时不动", "把新增任务交给最顺手的人"],
  mobilize: ["先说服一两个人，再带动全队", "先开动员会，把责任推下去"],
  strategy: ["先低调执行，等局面明朗", "先争取高层口头支持"],
  authority: ["先按惯例行事，暂不变更流程", "先展示强硬姿态"],
  stability: ["先维持现状，等风头过去", "先口头承诺，不写制度"],
  recovery: ["先硬撑过去，再找时间休息", "先降低标准完成眼前任务"],
  execution: ["先按老计划执行，再补检查", "先抓交付数量，再谈质量"],
  structure: ["先按经验处理，再回头总结", "先解决最显眼的问题"],
  communication: ["先发邮件同步，不单独沟通", "先按自己的方案推进，会后解释"]
};

const PARTIAL_LABELS_EN: Record<AbilityId, [string, string]> = {
  insight: ["Proceed on current impressions while observing", "Treat the most visible symptom first"],
  deploy: ["Keep the current team and adjust later", "Give the new task to whoever is easiest"],
  mobilize: ["Persuade one or two people first", "Hold a rally and push responsibility down"],
  strategy: ["Stay quiet and wait for clarity", "Seek verbal support from leadership"],
  authority: ["Follow convention and keep the process unchanged", "Show a tough stance"],
  stability: ["Keep the status quo until pressure passes", "Promise informally without writing rules"],
  recovery: ["Push through first, rest later", "Lower the bar to finish today's task"],
  execution: ["Follow the old plan and add checks later", "Prioritize delivery volume over quality"],
  structure: ["Use experience and summarize later", "Fix the most obvious problem"],
  communication: ["Sync by email without talking directly", "Push your plan forward and explain later"]
};

const RISK_LABELS: Record<AbilityId, [string, string]> = {
  insight: ["当众对质，逼对方交出真相", "用一次强信号试探所有人"],
  deploy: ["直接换掉关键岗位的人", "把最难的任务压给一个人"],
  mobilize: ["公开点名反对者，杀鸡儆猴", "宣布目标必须达成，不接受讨论"],
  strategy: ["绕过上级直接调动资源", "押上全部筹码赌一次"],
  authority: ["越级推动决策，绕开流程", "公开否决既有安排"],
  stability: ["一次性推翻旧制度", "把关键权力收回自己手里"],
  recovery: ["连续加班直到问题解决", "用一次极限挑战逼团队突破"],
  execution: ["砍掉所有非核心工作，立即冲刺", "把截止日期提前一半"],
  structure: ["凭直觉快速定方案", "让所有部门按同一个模板执行"],
  communication: ["在全员会上直接摊牌", "越过对方领导直接下达要求"]
};

const RISK_LABELS_EN: Record<AbilityId, [string, string]> = {
  insight: ["Confront the person publicly to force the truth", "Probe everyone with one strong signal"],
  deploy: ["Replace people in key roles immediately", "Push the hardest task onto one person"],
  mobilize: ["Name the resistor publicly as a warning", "Declare the goal non-negotiable"],
  strategy: ["Mobilize resources while bypassing your boss", "Bet everything on a single move"],
  authority: ["Push the decision upward around the process", "Publicly overturn the existing arrangement"],
  stability: ["Tear up the old system in one move", "Pull all critical power back to yourself"],
  recovery: ["Work through until the problem is solved", "Force a breakthrough with an extreme challenge"],
  execution: ["Cut all non-core work and sprint now", "Move the deadline up by half"],
  structure: ["Pick a plan quickly by instinct", "Force every team into the same template"],
  communication: ["Lay your cards on the table in the all-hands", "Issue the order around the other leader"]
};

const EXPERT_SUMMARY_ZH: Record<AbilityId, string> = {
  insight: "先验证动机，再决定信任边界",
  deploy: "先看岗位成果，再看人头安排",
  mobilize: "把反对者的顾虑变成共同责任",
  strategy: "用小胜建立势能，再谈授权",
  authority: "让关键决策回到可检验的流程",
  stability: "把个人判断沉淀成组织记忆",
  recovery: "先恢复判断力，再推进结果",
  execution: "让目标每一步都可验收",
  structure: "先拆清问题，再动手解决",
  communication: "先对齐目标，再锁定责任"
};

const EXPERT_SUMMARY_EN: Record<AbilityId, string> = {
  insight: "Verify motives before setting trust boundaries",
  deploy: "Start with outcomes, then arrange people",
  mobilize: "Turn resistors' concerns into shared responsibility",
  strategy: "Build momentum with small wins before asking for authority",
  authority: "Bring key decisions back into verifiable process",
  stability: "Turn personal judgment into organizational memory",
  recovery: "Restore judgment before pushing outcomes",
  execution: "Make every step of the goal verifiable",
  structure: "Decompose the problem before acting",
  communication: "Align goals first, then lock owners"
};

interface EnOptionView {
  label: string;
  summary: string;
  feedback: string;
}

function buildOptions(
  ability: AbilityId,
  index: number
): { zh: StoryOption[]; en: EnOptionView[] } {
  const abilityDef = ABILITIES[ability];
  const variant = index % 2;
  const focus = ABILITY_FOCUS[ability];
  const expertZh = EXPERT_LABELS[ability][variant];
  const expertEnLabel = EXPERT_LABELS_EN[ability][variant];
  const partialZh = PARTIAL_LABELS[ability][variant];
  const partialEnLabel = PARTIAL_LABELS_EN[ability][variant];
  const riskZh = RISK_LABELS[ability][variant];
  const riskEnLabel = RISK_LABELS_EN[ability][variant];
  const secondary: AbilityId = ability === "structure" ? "insight" : "structure";

  const expert: StoryOption = {
    label: expertZh,
    summary: `${expertZh}；${EXPERT_SUMMARY_ZH[ability]}。`,
    quality: "expert",
    effects: { [ability]: 2, [secondary]: 1 },
    resources: { energy: -6, trust: 5, influence: 2 },
    feedback: `这一步让「${abilityDef.name}」成为真正可验证的筹码：${focus.zh}。局面开始向你能控制的方向移动。`,
    theory: abilityDef.sources[0]
  };
  const partial: StoryOption = {
    label: partialZh,
    summary: `${partialZh}；先让眼前的问题不再扩大。`,
    quality: "partial",
    effects: { [ability]: 1 },
    resources: { energy: -4, trust: -1, influence: 2 },
    feedback: `你缓解了眼前的紧张，但没有真正打开核心张力。局面暂时平稳，代价留给了下一步。`,
    theory: abilityDef.sources[1] ?? abilityDef.sources[0]
  };
  const risk: StoryOption = {
    label: riskZh,
    summary: `${riskZh}；用一次强信号换取局面推进。`,
    quality: "risk",
    effects: { [ability]: 1, authority: ability === "authority" ? 2 : 1 },
    resources: { energy: -9, trust: -6, influence: 4, capital: -2 },
    feedback: `你用强信号推进了局面，也付出了信任与资源的代价。如果能复盘修正，还有机会挽回。`,
    theory: "《权经》：用权有度，过刚则折。"
  };

  const expertEn: EnOptionView = {
    label: expertEnLabel,
    summary: `${expertEnLabel}. ${EXPERT_SUMMARY_EN[ability]}.`,
    feedback: `This move turns ${ABILITY_NAME_EN[ability]} into verifiable leverage: ${focus.en}. The situation begins to move toward your control.`
  };
  const partialEn: EnOptionView = {
    label: partialEnLabel,
    summary: `${partialEnLabel}. Keep the visible problem from growing.`,
    feedback: `You eased the immediate tension without opening the core tension. The situation is stable for now, at a cost deferred to the next step.`
  };
  const riskEn: EnOptionView = {
    label: riskEnLabel,
    summary: `${riskEnLabel}. Trade a strong signal for forward motion.`,
    feedback: `Your strong signal moved the situation but cost trust and resources. A deliberate review can still recover the position.`
  };

  return {
    zh: [expert, partial, risk],
    en: [expertEn, partialEn, riskEn]
  };
}

function buildDuelNodes(): {
  bank: StoryNode[];
  en: Record<string, { title: string; context: string; stake: string; options: EnOptionView[] }>;
} {
  const bank: StoryNode[] = [];
  const en: Record<
    string,
    { title: string; context: string; stake: string; options: EnOptionView[] }
  > = {};
  let index = 0;
  for (const ability of ABILITY_ORDER) {
    const abilityDef = ABILITIES[ability];
    for (const setting of SETTINGS) {
      index += 1;
      const id = `duel-${String(index).padStart(3, "0")}`;
      const focus = ABILITY_FOCUS[ability];
      const { zh, en: enOptions } = buildOptions(ability, index);
      bank.push({
        id,
        chapterId: 1 + (index % 9),
        title: `${setting.zhTitle} · ${abilityDef.name}焦点`,
        kind: "main",
        context: `${setting.zhContext} 此刻，${focus.zh}。`,
        stake: setting.zhStake,
        options: zh
      });
      en[id] = {
        title: `${setting.enTitle} · ${ABILITY_NAME_EN[ability]} Focus`,
        context: `${setting.enContext} Right now, ${focus.en}.`,
        stake: setting.enStake,
        options: enOptions
      };
    }
  }
  return { bank, en };
}

const { bank: DUEL_BANK, en: DUEL_BANK_EN } = buildDuelNodes();

export const DUEL_BANK_SIZE = DUEL_BANK.length;

export function duelBankEn(node: StoryNode): StoryNode {
  const view = DUEL_BANK_EN[node.id];
  if (!view) return node;
  return {
    ...node,
    title: view.title,
    context: view.context,
    stake: view.stake,
    options: node.options.map((option, optionIndex) => ({
      ...option,
      ...(view.options[optionIndex] ?? {})
    }))
  };
}

export function shuffleDuelOptions(node: StoryNode, seed: number): StoryNode {
  const order = node.options.map((_, optionIndex) => optionIndex);
  let state = seed >>> 0;
  const random = (): number => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...node,
    options: order.map((optionIndex) => node.options[optionIndex])
  };
}

export { DUEL_BANK, DUEL_BANK_EN };
