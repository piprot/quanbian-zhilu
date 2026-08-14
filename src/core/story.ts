import type {
  AbilityId,
  ChapterDef,
  OptionQuality,
  RoleId,
  StoryNode
} from "./types";
import { ROLE_OPTION_SETS } from "./roleOptions.ts";
import { branchVariantFor } from "./branchVariants.ts";
import { DUEL_BANK, shuffleDuelOptions } from "./duelBank.ts";
import {
  EXTRA_MAIN_INTEL,
  EXTRA_MAIN_NODES,
  EXTRA_MAIN_ROLE_VARIANTS
} from "./mainScenarios.ts";
import { BRANCH_ROLE_CONTEXT_ZH } from "./branchDetails.ts";

export const CHAPTERS: ChapterDef[] = [
  {
    id: 1,
    code: "I",
    title: "识局",
    subtitle: "先诊断，再动手",
    focus: ["insight", "structure"],
    nodeIds: ["c1n1", "c1n2", "c1n3", "c1n4", "c1n5", "c1n6", "c1n7", "c1n8", "c1n9"]
  },
  {
    id: 2,
    code: "II",
    title: "谋权",
    subtitle: "在授权之前先建势",
    focus: ["strategy", "communication"],
    nodeIds: ["c2n1", "c2n2", "c2n3", "c2n4", "c2n5", "c2n6", "c2n7", "c2n8", "c2n9"]
  },
  {
    id: 3,
    code: "III",
    title: "用人",
    subtitle: "把对的人放进对的坑",
    focus: ["deploy", "insight"],
    nodeIds: ["c3n1", "c3n2", "c3n3", "c3n4", "c3n5", "c3n6", "c3n7", "c3n8", "c3n9"]
  },
  {
    id: 4,
    code: "IV",
    title: "驭势",
    subtitle: "让一群人不情愿的人一起走",
    focus: ["mobilize", "communication"],
    nodeIds: ["c4n1", "c4n2", "c4n3", "c4n4", "c4n5", "c4n6", "c4n7", "c4n8", "c4n9"]
  },
  {
    id: 5,
    code: "V",
    title: "执权",
    subtitle: "把决策变成可验收的成果",
    focus: ["execution", "authority"],
    nodeIds: ["c5n1", "c5n2", "c5n3", "c5n4", "c5n5", "c5n6", "c5n7", "c5n8", "c5n9"]
  },
  {
    id: 6,
    code: "VI",
    title: "掌权",
    subtitle: "用制度守住权力边界",
    focus: ["authority", "structure"],
    nodeIds: ["c6n1", "c6n2", "c6n3", "c6n4", "c6n5", "c6n6", "c6n7", "c6n8", "c6n9"]
  },
  {
    id: 7,
    code: "VII",
    title: "固权",
    subtitle: "让组织不依赖任何个人",
    focus: ["stability", "deploy"],
    nodeIds: ["c7n1", "c7n2", "c7n3", "c7n4", "c7n5", "c7n6", "c7n7", "c7n8", "c7n9"]
  },
  {
    id: 8,
    code: "VIII",
    title: "破局",
    subtitle: "在不确定中快速调整",
    focus: ["structure", "recovery"],
    nodeIds: ["c8n1", "c8n2", "c8n3", "c8n4", "c8n5", "c8n6", "c8n7", "c8n8", "c8n9"]
  },
  {
    id: 9,
    code: "IX",
    title: "成业",
    subtitle: "让成功可以延续",
    focus: ["stability", "strategy"],
    nodeIds: ["c9n1", "c9n2", "c9n3", "c9n4", "c9n5", "c9n6", "c9n7", "c9n8", "c9n9"]
  }
];

export const CHAPTER_REFLECTIONS: Record<number, string> = {
  1: "你完成了对组织的第一次诊断。真正的权力地图很少写在组织架构图上，它藏在谁被问、谁沉默、谁真正决定资源走向里。",
  2: "你在授权不完整时推进了变革。权力的起点不是职位，而是你能否用行动让关键人愿意把资源交给你。",
  3: "人才决策开始从印象走向证据。用人的核心不是谁更好，而是这个组织此刻需要什么样的能力组合。",
  4: "你理解了反对声往往携带真实信息。把阻力变成共同责任，是比压制阻力更持久的影响力。",
  5: "目标只有被拆成可验收的结果，才会变成执行。管理者的价值不是喊方向，而是让方向每天都能被检查。",
  6: "权力需要边界和制度，而不是依赖个人强势。被架空常常不是能力问题，而是流程没有保护决策权。",
  7: "你开始把个人判断转化为组织能力。固权的本质，是让组织在不依赖你的时候也能稳定运行。",
  8: "危机里最重要的是先控制范围，再寻找机会。速度不能替代结构，勇气也不能替代证据。",
  9: "你完成了从做事到建立系统的转身。真正的成业，是你离开之后，组织仍然知道如何做对决策。"
};

export interface SideQuestArc {
  id: string;
  title: string;
  summary: string;
  intro: string;
  nodes: string[];
  conclusion: string;
}

export const SIDE_QUEST_ARCS: SideQuestArc[] = [
  {
    id: "trust_rebuild",
    title: "信任重建",
    summary: "在高压管理中保留人的温度，把一次帮助变成长期的团队信任。",
    intro:
      "你决定不只在制度和结果上建立权威，还愿意处理人的情绪、勇气和尊严。这条支线会考验你是否能把善意变成可持续的组织关系。",
    nodes: ["s1", "s4", "s2"],
    conclusion:
      "当团队开始相信你不会在关键时刻缺席，他们的忠诚就不再是对权力的服从，而是对共同目标的承诺。"
  },
  {
    id: "resilience",
    title: "韧性组织",
    summary: "在高压、疲惫和连续失败中，建立能保护产能又扛住危机的团队。",
    intro:
      "执行力不只是冲刺，更是知道何时保护精力、何时缩小问题范围、何时重新凝聚团队。这条支线会把你从个人救火带到组织韧性。",
    nodes: ["s5", "s3", "s6"],
    conclusion:
      "当团队能在危机中先隔离风险、再共同复盘，而不是互相指责，你就真正建立了不依赖你个人的执行系统。"
  },
  {
    id: "power_boundaries",
    title: "权力边界",
    summary:
      "在越级汇报、绕过决策和交接断点之间，把个人权威变成可重复的组织规则。",
    intro:
      "权力不会因为头衔自动稳定，它需要被看见、被约束、被交接。这条支线会考验你能否在制度与信任之间守住边界，而不是靠一次次私下谈话补救。",
    nodes: ["s7", "s8", "s9"],
    conclusion:
      "当关键决策重新回到流程、关键信息不再依赖某一个人，你的权威才真正成为组织能力。"
  }
];

export const STORY_NODES: StoryNode[] = [
  {
    id: "c1n1",
    chapterId: 1,
    title: "空降首周",
    kind: "main",
    context:
      "你空降到一家连续两个季度下滑的事业部。前任在交接会上只留下一句话：“团队会配合你。”但财务数据、客户清单和关键项目状态始终没有交齐。CEO 在电话里说：90 天内看不到转折，就不会有第二个 90 天。",
    stake: "你只有两周建立信任、三周拿到关键事实；先见谁、先要什么，将决定信息缺口会打开还是关上。",
    options: [
      {
        label: "先约核心骨干喝咖啡",
        summary: "逐个访谈，记录谁在影响决策、谁在隐瞒什么。",
        quality: "expert",
        effects: { insight: 3, communication: 2, structure: 1 },
        resources: { energy: -8, trust: 8, influence: 4 },
        feedback:
          "你通过非正式访谈摸清了真实的权力地图，也给了对方表达的空间。你逐渐看清：数据缺口背后不是流程问题，而是信任问题——谁愿意对你开口，谁就会先帮你把信息补上。",
        theory: "《人物志》八观：观察人在不同情境中的取舍，才能看见真实动机。",
        branchTo: {
          parachute: "c1b-parachute",
          founder: "c1b-founder",
          highPotential: "c1b-highPotential"
        }
      },
      {
        label: "直接要求全量数据",
        summary: "以新任负责人的身份限期提交，建立管理权威。",
        quality: "partial",
        effects: { authority: 3, execution: 1 },
        resources: { energy: -5, trust: -8, influence: 5 },
        feedback:
          "你以权威压出了部分数据，却也消耗了第一波信任。权力从来不是靠要求得来的，先诊断清楚再精准施压，才不会让对方用一份不完整的报表反将你一军。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      },
      {
        label: "先拜访 CEO 弄清期望",
        summary: "向上对齐目标，把 90 天要求翻译成可量化的指标。",
        quality: "partial",
        effects: { strategy: 3, structure: 1 },
        resources: { energy: -6, trust: 2, influence: 7 },
        feedback:
          "向上对齐方向是对的，但你忽略了团队里真实的阻力。高层的支持不能替代一线的信息，等你从 CEO 办公室回来，团队可能已经把你归为“上面的人”，更难开口。",
        theory: "《权经》：权乃人授，授为大焉。"
      }
    ]
  },
  {
    id: "c1n2",
    chapterId: 1,
    title: "午休情报",
    kind: "main",
    context:
      "午饭时，行政主管低声说了一句：“上季度的外包费，合同到现在都没有归档。”你查预算表，发现签名栏里是前任和财务经理，交付物却在系统里找不到。下午两点，财务经理刚好来约你开会。",
    stake: "线索只够让你怀疑，还不够让你下结论；你选择先查、先问还是先存档，会直接影响第一轮信任。",
    options: [
      {
        label: "先查合同再下结论",
        summary: "把外包费、合同、交付物全部拉齐，形成完整事实链。",
        quality: "expert",
        effects: { structure: 3, insight: 2 },
        resources: { energy: -9, trust: 1, influence: 4 },
        feedback:
          "你没有被一句八卦带走，而是把零散信息结构化成一条完整的证据链。这个克制的判断让财务经理主动交出了更多历史问题，因为你证明了自己会查、也查得动。",
        theory: "《实践论》：从感性材料上升到理性认识，才能抓住本质。"
      },
      {
        label: "当众问财务经理",
        summary: "在周会上直接要求解释，展示你眼里不揉沙。",
        quality: "risk",
        effects: { authority: 2, communication: -1 },
        resources: { energy: -6, trust: -10, influence: 3 },
        feedback:
          "你赢得了“眼里不揉沙”的强硬标签，却让整个团队进入了防御状态。线索还没查清，你已经把一次调查变成了公开站队，真正的问题反而更难浮出水面。",
        theory: "《论语》：不患人之不己知，患不知人也。"
      },
      {
        label: "暂不声张，记入观察清单",
        summary: "先存档，等接触更多证据后再决定是否触发。",
        quality: "partial",
        effects: { recovery: 2, insight: 1 },
        resources: { energy: -3, trust: 2, influence: 0 },
        feedback:
          "你稳住了情绪、没有打草惊蛇，但观察如果不配上明确的验证节点，这条线索迟早会被日常琐事淹没。存档只是第一步，关键是你打算在什么条件下重新翻开它。",
        theory: "《鬼谷子》：审时度势，谋定后动。"
      }
    ]
  },
  {
    id: "c2n1",
    chapterId: 2,
    title: "授权真空",
    kind: "main",
    context:
      "组织调整后，你的直属上级调去新业务，项目名义上由你负责，但预算、编制和供应商合同全部停在旧流程。CEO 的原话是：“先干起来，授权会跟上。”可每个人都清楚，没有授权就没有资源。",
    stake: "在名分未定的窗口期，你是先拿一个小胜利换授权，还是先向上争名分，将决定团队愿不愿意跟着你。",
    options: [
      {
        label: "先立功再争权",
        summary: "用两周内可交付的小胜利证明自己，再谈资源授权。",
        quality: "expert",
        effects: { execution: 3, strategy: 2, communication: 1 },
        resources: { energy: -8, trust: 5, influence: 7 },
        feedback:
          "你没有停在“权力不够”的抱怨里，而是先用一个可验证的小胜利证明自己，再顺势谈资源授权。这正是《权经》所说的“携为上，功次之”——先给结果，再要名分。",
        theory: "《权经》：携为上，功次之；权乃人授，授为大焉。"
      },
      {
        label: "直接越级要授权",
        summary: "把组织架构调整当作机会，向 CEO 要明确的书面授权。",
        quality: "partial",
        effects: { strategy: 3, authority: 1 },
        resources: { energy: -6, trust: -3, influence: 5 },
        feedback:
          "你确实推动了授权落地，但代价是让临时上级感到被绕开。权力拿到手了，盟友却少了；在名分未定的窗口期，每一次越级都在重新划分谁是你的朋友、谁在观望。",
        theory: "马基雅维利：权力来自他人对你的依赖。"
      },
      {
        label: "先观望再行动",
        summary: "等授权落地，避免在没有名分时做容易翻车的事。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -3, trust: -4, influence: -4 },
        feedback:
          "谨慎本身没有错，但观望太久会让团队失去方向，也让 CEO 认定你无法在模糊中推进。名分不会自己长出来，它往往是你先动手做出结果、再补授的那一部分。",
        theory: "《孙子兵法》：善战者，先为不可胜，以待敌之可胜。"
      }
    ]
  },
  {
    id: "c2n2",
    chapterId: 2,
    title: "第一场会",
    kind: "main",
    context:
      "你上任后的第一场全员会安排在周五下午。走廊里已经有人在传“新领导要动组织了”，会上你刚讲完现状，就有老员工公开质疑：“这套打法我们三年前试过，死了。”会议室安静下来，所有人都在等你的反应。",
    stake: "这场会的结果不是会议纪要，而是团队愿不愿意在下一周把真实信息放到你桌上。",
    options: [
      {
        label: "先讲事实，再邀请提问",
        summary: "用数据说明现状，把问题开放给所有人，并现场记录。",
        quality: "expert",
        effects: { communication: 3, mobilize: 2, strategy: 1 },
        resources: { energy: -7, trust: 7, influence: 5 },
        feedback:
          "你没有被那句公开质疑激怒，反而把它变成了一个公共议题。沉默者开始说话，反对者也愿意把真实顾虑摆上台面——你让团队看见，分歧可以被讨论，而不是被记仇。",
        theory: "毛泽东《党委会的工作方法》：先当学生，再当先生。"
      },
      {
        label: "用魄力压住场面",
        summary: "明确宣布规矩，谁先质疑谁先拿出方案。",
        quality: "partial",
        effects: { authority: 3, mobilize: -1 },
        resources: { energy: -5, trust: -5, influence: 6 },
        feedback:
          "场面安静了，但那只是暂时的服从。你用权威换来了安静，却没有换来承诺；散会之后，真正的讨论会转到你看不见的地方，下一次你想再听真话，就没人愿意开口了。",
        theory: "《孙子兵法》：令之以文，齐之以武。"
      },
      {
        label: "私下先拉拢关键人",
        summary: "会前逐个沟通关键骨干，会上只走过场。",
        quality: "risk",
        effects: { strategy: 3 },
        resources: { energy: -6, trust: -6, influence: 2 },
        feedback:
          "私下结盟让少数人站到了你这边，但公开场合的沉默会发酵成更大的不透明。你赢得了几张私下的票，却可能在众人面前输掉整场信任，因为没人知道你和谁谈了什么。",
        theory: "《韩非子》：事以密成，语以泄败。"
      }
    ]
  },
  {
    id: "c3n1",
    chapterId: 3,
    title: "重组名单",
    kind: "main",
    context:
      "组织要求你提交一份 30 人精简到 22 人的名单。你拿到的盘点表里，有人能力突出但最近半年频繁迟到，有人掌握核心客户但交付平平，还有人年轻、执行强却没有资历。名单的截止时间是周五。",
    stake: "裁员名单会被所有人解读为你的价值观；你按什么逻辑排位，就决定了未来一年谁会真正为你干活。",
    options: [
      {
        label: "按关键岗位重新匹配",
        summary: "先定义未来 6 个月的关键岗位，再用人岗匹配决定去留。",
        quality: "expert",
        effects: { deploy: 3, structure: 2, insight: 1 },
        resources: { energy: -9, trust: 3, influence: 6 },
        feedback:
          "你没有被资历和亲疏绑架，而是先定义组织未来六个月真正需要什么，再决定谁留下。名单里难免有争议，但逻辑清晰、可以解释，明眼人一眼就能看出你的标准是什么。",
        theory: "《贞观政要》：用非其才，必难致治；舍短取长，各尽其能。"
      },
      {
        label: "优先保自己人",
        summary: "把可靠但未必最强的人放在核心岗位，降低短期风险。",
        quality: "risk",
        effects: { strategy: 3, authority: 1 },
        resources: { energy: -5, trust: -8, influence: 3 },
        feedback:
          "你获得了短期安全感，却把组织慢慢推向裙带化。明眼人很快会看穿名单背后的亲疏逻辑，真正能干活的人会开始用脚投票，留下来的反而都是围着你转的人。",
        theory: "《资治通鉴》：才者，德之资也；德者，才之帅也。"
      },
      {
        label: "尽量保留所有人",
        summary: "用轮岗和培训代替裁员，避免冲突。",
        quality: "partial",
        effects: { communication: 2, recovery: 1 },
        resources: { energy: -6, trust: 5, influence: -3 },
        feedback:
          "你避开了短期的冲突，却让组织继续背着过剩的结构和模糊的职责。善意不能替代配置决策，不裁员的温柔，最终会以所有人一起被拖垮的方式，让整个团队为你买单。",
        theory: "《韩非子·用人》：使事不相干，使士不兼官。"
      }
    ]
  },
  {
    id: "c3n2",
    chapterId: 3,
    title: "救火队长",
    kind: "main",
    context:
      "项目连续三天出现生产事故，团队已经习惯把问题直接丢到你的桌上。你发现一位年轻骨干其实能独立解决八成问题，但他每一次都会停在“等领导确认”这一步。",
    stake: "继续把关会让短期稳定，放手又可能出错；你要决定的是今天多花一小时教会他，还是以后每天替团队加班。",
    options: [
      {
        label: "授权边界并验收结果",
        summary: "明确告诉他决策权限、判断标准和汇报节点，然后让他自己闭环。",
        quality: "expert",
        effects: { deploy: 3, authority: 2, insight: 1 },
        resources: { energy: -5, trust: 8, influence: 5 },
        feedback:
          "你第一次把责任完整地交到另一个人手上。他做砸了一件事，却学会了自主判断；你从那个天天救火的队长，变成了站在后面搭规则、盯结果的组织者。",
        theory: "《权经》：授能干者，授忠诚者，权惟用，不为大也。"
      },
      {
        label: "继续亲自把关",
        summary: "自己确认每一份交付，确保短期不出错。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -12, trust: 2, influence: -2 },
        feedback:
          "短期项目稳住了，但你的精力被彻底锁死。团队越来越依赖你拍板，组织能力却没有增长；等你终于想脱身时，会发现每个人都习惯了把问题原样丢回你的桌上。",
        theory: "《卓有成效的管理者》：管理者必须把时间投入真正重要的决策。"
      },
      {
        label: "让他尝试，但暗中兜底",
        summary: "表面上放手，私下安排老员工盯着进度。",
        quality: "partial",
        effects: { structure: 2, communication: 1 },
        resources: { energy: -7, trust: 4, influence: 1 },
        feedback:
          "你给了他试错空间，可暗中的监控很快被他察觉，信任反而打了折扣。授权要么完整地放，要么说清楚这是联合管理；半明半暗的放权，两头的好处都拿不到。",
        theory: "《论语》：君子信而后劳其民。"
      }
    ]
  },
  {
    id: "c4n1",
    chapterId: 4,
    title: "反对声浪",
    kind: "main",
    context:
      "你推动的新流程在第三周遭遇公开反对。运营负责人直接在高管会上说：“这个方案会拖慢交付，出事谁负责？”他资历深、人脉广，而且他说的问题确实存在：你的方案没有覆盖一线交付的异常处理。",
    stake: "压制反对会失去人心，让步会失去变革；你需要让反对者从裁判变成共同责任人。",
    options: [
      {
        label: "把他的顾虑变成方案前提",
        summary: "先补齐交付保障条款，再邀请他担任试点负责人。",
        quality: "expert",
        effects: { mobilize: 3, communication: 2 },
        resources: { energy: -8, trust: 8, influence: 7 },
        feedback:
          "你没有把反对者当成敌人，而是把他的顾虑补进方案前提，再邀请他担任试点负责人。当他的利益被写进方案里，反对声就变成了推动力，阻力成了你的共同责任人。",
        theory: "《孙子兵法》：上下同欲者胜；《论语》：举直错诸枉，则民服。"
      },
      {
        label: "高层背书强行推进",
        summary: "带着 CEO 的批准直接宣布执行，让反对者服从。",
        quality: "partial",
        effects: { authority: 3, strategy: 1 },
        resources: { energy: -6, trust: -8, influence: 5 },
        feedback:
          "方案确实落地了，但运营团队在暗处执行走样。你赢了这一纸命令，却输了真正的协同；下一次再遇到阻力，你连一个愿意在明面上告诉你哪里出问题的人都没有了。",
        theory: "《韩非子》：法势术并用，但不能代替人心。"
      },
      {
        label: "撤回方案重新评估",
        summary: "暂缓推进，避免在反对声中强行变革。",
        quality: "risk",
        effects: { recovery: 2, structure: 1 },
        resources: { energy: -4, trust: 3, influence: -6 },
        feedback:
          "你避免了冲突，却把领导权让给了阻力。下一次再提变革，所有人都会记得你可以被反对声拖住，于是每一次推进都会变得更难，而反对的成本反而更低。",
        theory: "《孙子兵法》：不可胜在己，可胜在敌。"
      }
    ]
  },
  {
    id: "c4n2",
    chapterId: 4,
    title: "跨部门僵局",
    kind: "main",
    context:
      "一个重点客户项目已经停滞十天。产品说需求没定，销售说客户在催，研发说环境没给。你既不直接管销售，也不直接管研发，但客户只认你。",
    stake: "跨部门问题没有“你的团队”和“他们的团队”之分；你要让三方都觉得这件事与自己有关。",
    options: [
      {
        label: "建立联合作战室",
        summary: "把三个部门的关键人放进同一目标、同一看板、同一例会。",
        quality: "expert",
        effects: { communication: 3, execution: 2 },
        resources: { energy: -9, trust: 6, influence: 8 },
        feedback:
          "你没有去争谁对谁错，而是把三个部门重新放进同一个目标、同一块看板和同一个例会节奏里。僵局不再是谁的责任，而变成了一个可以被拆解、被跟进、被关闭的项目。",
        theory: "德鲁克：管理就是让平凡的人做出不平凡的事。"
      },
      {
        label: "用客户压力倒逼",
        summary: "把客户投诉放大给三部门负责人，逼他们立刻行动。",
        quality: "partial",
        effects: { execution: 3 },
        resources: { energy: -6, trust: -5, influence: 4 },
        feedback:
          "问题暂时解决了，但互相指责的剧本没有变。你靠外部压力逼出了行动，却没有建立三方共担的机制，等下一次危机来临，同样的推诿还会原样重演。",
        theory: "《孙子兵法》：致人而不致于人。"
      },
      {
        label: "请 CEO 拍板责任",
        summary: "让最高层裁决责任归属，避免自己卷入政治。",
        quality: "risk",
        effects: { strategy: 2 },
        resources: { energy: -4, trust: -6, influence: -5 },
        feedback:
          "你把协调难题上交，短期内保全了自己，却也放弃了横向推动的机会。CEO 会记住这件事本该由你收口，而三部门也会默认——凡是跨部门的事，最后都可以往上扔。",
        theory: "《资治通鉴》：推功于贤智之人，以维持团结。"
      }
    ]
  },
  {
    id: "c5n1",
    chapterId: 5,
    title: "目标拆解",
    kind: "main",
    context:
      "季度目标会上，公司给你签下“收入翻倍”的目标。回办公室的路上，销售总监说：“这数字是老板拍脑袋定的。”你问团队明天要做什么，没有人能回答。",
    stake: "目标必须变成一张每天可以检查的作战图；拆错方向比没有目标更危险。",
    options: [
      {
        label: "用关键结果倒推行动",
        summary: "把目标拆成 3 个关键结果，每个结果配负责人、里程碑和验收标准。",
        quality: "expert",
        effects: { structure: 3, execution: 2, authority: 1 },
        resources: { energy: -8, trust: 4, influence: 6 },
        feedback:
          "你给团队的不是一句口号，而是一张每天都能检查、每周都能校准的作战图。三个关键结果各有人负责、各有里程碑，目标从老板拍脑袋的数字，变成了每个人手里看得见摸得着的活。",
        theory: "《卓有成效的管理者》：要事优先，把资源集中在少数真正重要的任务上。"
      },
      {
        label: "先保营收再谈体系",
        summary: "让销售猛攻大客户，先完成数字，再回头补管理。",
        quality: "partial",
        effects: { execution: 3, strategy: 1 },
        resources: { energy: -7, trust: 2, influence: 2 },
        feedback:
          "短期数字可能好看，但组织会慢慢形成“谁有客户谁说了算”的潜规则。目标拆解的缺口被营收掩盖，等增长一停，没有作战图的团队会立刻陷入混乱。",
        theory: "《孙子兵法》：兵贵胜，不贵久。"
      },
      {
        label: "让各部门自行提目标",
        summary: "把拆解责任交给部门负责人，你只做汇总。",
        quality: "risk",
        effects: { communication: 2 },
        resources: { energy: -5, trust: 5, influence: -4 },
        feedback:
          "你尊重了各部门，却没有建立一套共同的目标逻辑。汇总出来的数字互相冲突、口径不一，执行时必然脱节，最后只会让“收入翻倍”变成一句谁都不信的空话。",
        theory: "毛泽东《矛盾论》：抓主要矛盾，其他问题才能迎刃而解。"
      }
    ]
  },
  {
    id: "c5n2",
    chapterId: 5,
    title: "季度冲刺",
    kind: "main",
    context:
      "距离季度结束还有 15 天，目标缺口 30%。团队已经连续加班两周，有人开始默认“这个季度完不成”，也有人悄悄准备跳槽。",
    stake: "你既不能假装缺口不存在，也不能靠更长的工时把团队推向崩溃；取舍本身才是执行力。",
    options: [
      {
        label: "重排优先级，砍掉非关键项",
        summary: "重新审视管线，停掉三个低价值项目，把火力集中到最大机会。",
        quality: "expert",
        effects: { execution: 3, structure: 2, authority: 1 },
        resources: { energy: -6, trust: 5, influence: 6 },
        feedback:
          "你没有靠更多加班去硬拼数字，而是用取舍把火力集中到最大的机会上。停掉三个低价值项目后，团队第一次感到目标是可以被管理的，而不是只能被命运拖着走。",
        theory: "德鲁克：管理者的成果不是做了多少事，而是做对了多少重要的事。"
      },
      {
        label: "全员加班保目标",
        summary: "要求所有人两周内取消休假，用时间换数字。",
        quality: "partial",
        effects: { authority: 2, execution: 2 },
        resources: { energy: -12, trust: -8, influence: 2 },
        feedback:
          "你可能勉强完成了这个季度，但下个季度会有人用离职来投票。精力透支换来的数字不可持续，你留下的是一个已经被榨干、随时会崩盘的团队。",
        theory: "《高效能人士的七个习惯》：关注你的影响圈，而不是耗尽自己。"
      },
      {
        label: "先向下修目标",
        summary: "提前和 CEO 沟通缺口，把目标调整为可完成值。",
        quality: "risk",
        effects: { communication: 2, recovery: 1 },
        resources: { energy: -5, trust: 2, influence: -6 },
        feedback:
          "你把现实风险讲得很清楚，但在老板眼里，你还没开打就举了白旗。修目标必须建立在新机会之上，否则你保住的只是一个更小、却同样完不成的数字。",
        theory: "《权经》：权惟用，不为大也。"
      }
    ]
  },
  {
    id: "c6n1",
    chapterId: 6,
    title: "被架空",
    kind: "main",
    context:
      "你发现最近三周，CFO 和销售副总绕过你直接推进了两个大项目，你的批示在系统里显示“参考”。更麻烦的是，团队已经默认“找他们比找你有用”。",
    stake: "被架空不是一天发生的；你要用制度重新定义边界，而不是靠一次公开争吵。",
    options: [
      {
        label: "建立关键决策闭环",
        summary: "把重大事项纳入联签机制，用流程重新定义权力边界。",
        quality: "expert",
        effects: { authority: 3, structure: 2 },
        resources: { energy: -8, trust: 2, influence: 7 },
        feedback:
          "你没有公开对抗，而是用联签机制让“绕过你”变成“不合规”。制度比个人更能守权，从此重大事项必须进入闭环，CFO 和销售副总再想绕路，就绕不开流程本身。",
        theory: "《韩非子》：法度既立，虽庸主可治。"
      },
      {
        label: "在 CEO 面前摊牌",
        summary: "列出所有绕过决策的案例，要求 CEO 表态。",
        quality: "partial",
        effects: { strategy: 3 },
        resources: { energy: -6, trust: -4, influence: 4 },
        feedback:
          "你争取到了表态，但也让 CFO 和销售副总看清了你的底牌，进而结成更紧密的联盟。摊牌必须配上后手，否则一次赢了面子，却输掉了接下来的每一次博弈。",
        theory: "《权经》：权乃人授，授为大焉。"
      },
      {
        label: "先忍到业绩翻身",
        summary: "暂时接受现状，等自己做出不可替代的成果再谈。",
        quality: "risk",
        effects: { recovery: 3 },
        resources: { energy: -4, trust: -3, influence: -4 },
        feedback:
          "忍耐给你争取了时间，但也会让组织慢慢形成“你不需要被尊重”的默认规则。等你想再立边界时，会发现绕过你已经成了所有人的习惯。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      }
    ]
  },
  {
    id: "c6n2",
    chapterId: 6,
    title: "越级汇报",
    kind: "main",
    context:
      "一位核心下属连续两次绕过你向 CEO 汇报，并在汇报里把你的决策描述成“没有考虑成本”。你手上没有直接证据，但团队已经看在眼里。",
    stake: "处理得不好会显得你小心眼，不处理又会开坏先例；你需要把个人冲突变成团队信息规则。",
    options: [
      {
        label: "建立团队信息公约",
        summary: "在集体层面约定信息同步机制，同时单独和他校准汇报口径。",
        quality: "expert",
        effects: { authority: 3, structure: 2 },
        resources: { energy: -7, trust: 6, influence: 5 },
        feedback:
          "你把个人矛盾转化为一套团队机制，既守住了边界，又没有把下属逼成敌人。信息同步的规则公开之后，越级汇报不再是对你个人的挑战，而是对大家共同约定的违反。",
        theory: "毛泽东《党委会的工作方法》：互通情报，取得共同语言。"
      },
      {
        label: "公开警告他",
        summary: "在周会上明确越级汇报的红线，杀一儆百。",
        quality: "partial",
        effects: { authority: 3, mobilize: -1 },
        resources: { energy: -5, trust: -7, influence: 4 },
        feedback:
          "边界立住了，但代价是他和 CEO 的关系反而更深。强硬管理换不来忠诚，你赢下了这一场的秩序，却可能把他彻底推向另一条权力通道。",
        theory: "《孙子兵法》：齐之以武，但也要令之以文。"
      },
      {
        label: "不闻不问",
        summary: "只要结果好，就不过问汇报路径。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -3, trust: -4, influence: -5 },
        feedback:
          "你避免了冲突，却默许了另一条权力通道。团队开始猜测到底谁才是真正做主的人，等你意识到问题严重时，指令早已发不出去、收不回来。",
        theory: "《资治通鉴》：防微杜渐，不塞隙穴则暴雨疾风必坏。"
      }
    ]
  },
  {
    id: "c7n1",
    chapterId: 7,
    title: "接班人",
    kind: "main",
    context:
      "你即将晋升，公司要求你提名接班人。候选人 A 是能力强但和你保持距离的老将，候选人 B 是忠诚但缺少大项目经验的年轻人。HR 提醒你：这是你对组织最后的考核。",
    stake: "接班不是选“谁像我”，而是选“谁能守住组织下一阶段的能力”。",
    options: [
      {
        label: "用能力匹配岗位，并设计陪跑期",
        summary: "提名老将接核心业务，同时让年轻人在高挑战项目里加速成长。",
        quality: "expert",
        effects: { stability: 3, deploy: 2 },
        resources: { energy: -8, trust: 8, influence: 7 },
        feedback:
          "你没有把接班当成私事，而是用能力匹配岗位，同时给年轻人配了陪跑期。组织形成了双梯队，你的影响力也从个人的临场判断，变成了可以传承的制度安排。",
        theory: "司马光：谦退也是一种气量和器识；推功于贤智之人。"
      },
      {
        label: "提名忠诚的自己人",
        summary: "优先确保权力延续，让年轻人逐步补能力。",
        quality: "risk",
        effects: { strategy: 3, stability: -1 },
        resources: { energy: -5, trust: -6, influence: 3 },
        feedback:
          "短期看权力没有旁落，但组织很快会因为错配而流失最优秀的人才。接班从来不是忠诚测试，用亲疏代替能力，最终接住的不是你的基业，而是你的包袱。",
        theory: "《贞观政要》：用非其才，必难致治。"
      },
      {
        label: "让公司外部招聘",
        summary: "避免内部站队，请公司空降一位更有经验的接班人。",
        quality: "partial",
        effects: { structure: 2, communication: 1 },
        resources: { energy: -6, trust: 1, influence: -4 },
        feedback:
          "外部人带来了新经验，却堵住了组织内部向上的成长通道。你回避了培养责任，等于向所有人释放了一个信号：在这里，往上走不如跳槽进来快，留下来认真做事反而吃亏。",
        theory: "《韩非子·用人》：明主之道，使智者尽其虑。"
      }
    ]
  },
  {
    id: "c7n2",
    chapterId: 7,
    title: "制度化",
    kind: "main",
    context:
      "你出差一周回来，发现团队重启了三个月前已经废弃的流程。关键客户的判断、风险清单和决策复盘都存在你脑子里，而不是在组织里。",
    stake: "个人经验不变成制度，就等于没有经验；你要决定先固化哪个判断，让团队能在你缺席时复现。",
    options: [
      {
        label: "建立决策复盘知识库",
        summary: "把高频决策做成检查清单和案例库，让团队按流程复现你的判断。",
        quality: "expert",
        effects: { stability: 3, structure: 2, deploy: 1 },
        resources: { energy: -9, trust: 4, influence: 6 },
        feedback:
          "你开始把个人经验产品化，高频决策变成检查清单和案例库。即使你不在场，组织也能稳定复现你的判断，这是固权的最高形态——让别人离不开你，是因为系统离不开你，而不是因为你守在位置上。",
        theory: "毛泽东《党委会的工作方法》：制度建党，民主集中，不依赖个人。"
      },
      {
        label: "只带核心徒弟",
        summary: "把关键经验传给最信任的一个人，保证权力有人承接。",
        quality: "partial",
        effects: { deploy: 2, strategy: 1 },
        resources: { energy: -5, trust: 4, influence: 2 },
        feedback:
          "你降低了短期风险，却把组织能力绑定在另一个人身上。个人依赖只是换了一种形式，徒弟一旦离开或出错，你辛苦攒下的判断力就会随之蒸发。",
        theory: "《权经》：授能干者，授忠诚者。"
      },
      {
        label: "保持神秘优势",
        summary: "不公开判断依据，让自己始终不可替代。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -4, trust: -5, influence: -5 },
        feedback:
          "你暂时保住了地位，却让组织无法放大你的价值。不可替代的下场往往不是被重用，而是被永远钉在原地，因为你一旦离开，就没人能接得住。",
        theory: "《贞观政要》：善始慎终，创业难守成更难。"
      }
    ]
  },
  {
    id: "c8n1",
    chapterId: 8,
    title: "现金流危机",
    kind: "main",
    context:
      "周六晚上，财务发来消息：最大客户暂停付款，没有任何书面解释，下个月工资只够发六成。你只有 48 小时决定先做什么。",
    stake: "恐慌会传染，行动也会；你要在隔离风险、寻找回款和争取融资之间排出优先级。",
    options: [
      {
        label: "先隔离风险，再找机会",
        summary: "立刻暂停非关键支出，同时盘点可快速回款的客户与可融资资产。",
        quality: "expert",
        effects: { structure: 3, execution: 2, recovery: 1 },
        resources: { energy: -8, trust: 5, influence: 6 },
        feedback:
          "你没有让恐慌扩散，而是把危机拆成隔离、回款、融资三条线同时推进。团队第一次在慌乱中拿到了明确的优先级，48 小时里每个人都知道自己该先做什么。",
        theory: "《矛盾论》：抓住主要矛盾，其他矛盾就能牵动起来。"
      },
      {
        label: "全员通报并开源节流",
        summary: "公开现金流缺口，号召所有人一起找客户、砍成本。",
        quality: "partial",
        effects: { communication: 2, mobilize: 2 },
        resources: { energy: -6, trust: 4, influence: 3 },
        feedback:
          "透明度带来了危机意识，也引发了恐慌和离职风险。危机通报必须配上一套行动方案，否则大家只知道问题有多大，却不知道该往哪里使劲。",
        theory: "《孙子兵法》：上下同欲者胜。"
      },
      {
        label: "先向老板求救",
        summary: "让大股东先垫资，把问题交给更有资源的人。",
        quality: "risk",
        effects: { strategy: 2 },
        resources: { energy: -5, trust: -3, influence: -5 },
        feedback:
          "你可能拿到了钱，但也交出了主导权。危机中最危险的信号就是“我只等别人来救”，因为你亲手让团队相信，关键时刻你并不能扛住，真正的筹码也不在你手里。",
        theory: "《权经》：权乃人授，授为大焉，但受制于人则不能自主。"
      }
    ]
  },
  {
    id: "c8n2",
    chapterId: 8,
    title: "关键客户流失",
    kind: "main",
    context:
      "你的明星销售带着最大客户跳槽到竞对。客户临走前说：“我们不是被挖走的，是被服务拖走的。”销售团队开始互相猜疑，谁也说不准下一个是谁。",
    stake: "流失已经发生，你要决定是追责、挽回还是复盘系统；不同选择会塑造团队接下来三周的行为。",
    options: [
      {
        label: "先复盘服务链，再谈问责",
        summary: "带客户和交付团队做一次真实复盘，找出系统漏洞，再决定人员调整。",
        quality: "expert",
        effects: { structure: 3, mobilize: 2, recovery: 1 },
        resources: { energy: -9, trust: 6, influence: 5 },
        feedback:
          "你让团队看见，问题不是某一个人的背叛，而是一整套服务机制的失败。猜疑被复盘替代，大家从互相指责转向一起找漏洞，这才是把一次流失变成组织免疫力的起点。",
        theory: "《实践论》：错误常常是正确的先导，关键是从失败中找出规律。"
      },
      {
        label: "立即重罚相关责任人",
        summary: "公开处理服务负责人，向客户和团队展示态度。",
        quality: "partial",
        effects: { authority: 3, execution: 1 },
        resources: { energy: -6, trust: -6, influence: 3 },
        feedback:
          "你给了外界一个交代，内部却开始人人自危。真正的问题可能被这场问责仪式掩盖了，罚掉一个人很简单，但服务的系统漏洞还在，下一个客户流失只是时间问题。",
        theory: "《韩非子》：明赏罚，但罚不中则众不惧。"
      },
      {
        label: "把客户再抢回来",
        summary: "亲自去见客户，承诺全套服务升级，用诚意挽回。",
        quality: "risk",
        effects: { execution: 2, communication: 2 },
        resources: { energy: -10, trust: 2, influence: 2 },
        feedback:
          "诚意很重要，但如果你一个人就能把客户挽回，系统的漏洞依然原地不动。客户真正想离开的不是某个销售，而是那套没人愿意修复的服务体验，下一次流失只是时间问题。",
        theory: "《孙子兵法》：善战者，先为不可胜。"
      }
    ]
  },
  {
    id: "c9n1",
    chapterId: 9,
    title: "功成身退",
    kind: "main",
    context:
      "改革成功：收入连续两个季度增长，团队稳定，CEO 邀请你进入更高层。但你知道，自己一手搭建的体系仍依赖几个关键判断，交接一旦仓促，成果可能退回原样。",
    stake: "个人上升和事业延续之间没有绝对平衡；你选择怎么交接，就是给组织留下的最后管理课。",
    options: [
      {
        label: "完成交接再上升",
        summary: "把接班人、知识库、风险预案全部落地，并承诺陪跑一个季度。",
        quality: "expert",
        effects: { stability: 3, deploy: 2, strategy: 1 },
        resources: { energy: -7, trust: 8, influence: 8 },
        feedback:
          "你没有把晋升当成终点，而是把组织的延续当成责任。接班人、知识库和风险预案一样样落地之后，你的权力在交接中反而变得更加可靠，因为你证明了自己离得开，也留得住。",
        theory: "《资治通鉴》：谦退是一种气量；《贞观政要》：善始慎终。"
      },
      {
        label: "抓住机会立即上升",
        summary: "让组织快速适应新领导，把精力投入更大的平台。",
        quality: "partial",
        effects: { authority: 2, execution: 2 },
        resources: { energy: -5, trust: -4, influence: 5 },
        feedback:
          "你抓住了个人的机会，但组织可能因为交接断层而退回原样。高层的信任也会因此打折，因为一个只顾自己向上、不留后手的人，很难被放心地托付更大的平台。",
        theory: "《孙子兵法》：将能而君不御者胜。"
      },
      {
        label: "拒绝晋升继续掌权",
        summary: "留在自己最熟悉的战场，维持当前的稳定。",
        quality: "risk",
        effects: { stability: 2, recovery: 1 },
        resources: { energy: -3, trust: -2, influence: -6 },
        feedback:
          "你把安全感当成了目标，却限制了组织的人才流动。固权不等于把所有人留在原地，你越是不肯让路，就越堵死了后来者的上升通道，最终连你自己也被钉在这个位置上。",
        theory: "《权经》：权惟用，不为大也。"
      }
    ]
  },
  {
    id: "c9n2",
    chapterId: 9,
    title: "传承抉择",
    kind: "main",
    context:
      "离开前的最后一项决策摆在桌上：一条高毛利但高风险的创新业务已经烧钱八个月，团队说“再坚持半年就能赢”，财务建议立即止损。",
    stake: "你留给组织的不是结论，而是判断的方法；这个决定会成为接班人学会的第一课。",
    options: [
      {
        label: "建立“继续/止损”检查点",
        summary: "用数据定义半年后的验证标准，同时准备两套资源方案。",
        quality: "expert",
        effects: { structure: 3, strategy: 2, execution: 1 },
        resources: { energy: -8, trust: 6, influence: 6 },
        feedback:
          "你没有武断地砍掉项目，也没有被团队的乐观情绪绑架。用数据定义半年后的验证标准，再配上两套资源方案，组织从你这里学到的，是如何理性地拥抱不确定。",
        theory: "《矛盾论》：不同质的矛盾，只有用不同质的方法才能解决。"
      },
      {
        label: "立即止损",
        summary: "按财务纪律砍掉项目，把资源还给核心业务。",
        quality: "partial",
        effects: { execution: 3, authority: 1 },
        resources: { energy: -6, trust: -2, influence: 3 },
        feedback:
          "纪律是对的，但你留下的组织可能从此学会“高风险就是错误”。真正的自适应管理不是回避风险，而是能区分什么该赌、什么该停，一刀切只会把创新一起掐死。",
        theory: "《孙子兵法》：善战者，先为不可胜。"
      },
      {
        label: "让继任者决定",
        summary: "不把难题留给自己的任期，把决策交给下一任。",
        quality: "risk",
        effects: { recovery: 2, strategy: 1 },
        resources: { energy: -4, trust: -4, influence: -4 },
        feedback:
          "你把责任推给了未来，等于给继任者埋了一颗雷。传承最重要的不是交出一个干净的答案，而是把决策的方法和承担后果的勇气一起传下去。",
        theory: "《贞观政要》：创业难，守成更难，关键在于持续担当。"
      }
    ]
  },
  {
    id: "s1",
    chapterId: 2,
    title: "危机安抚",
    kind: "side",
    context:
      "一位核心员工刚在公开场合被客户羞辱，回到工位脸色发白。你恰好路过，他没有向你求助。",
    stake: "你的一两句话可能决定他今天是否还能继续工作。",
    options: [
      {
        label: "先请他进会议室喝杯水",
        summary: "不评判、不建议，先让他把情绪说出来。",
        quality: "expert",
        effects: { recovery: 3, communication: 1 },
        resources: { energy: -4, trust: 6, influence: 3 },
        feedback:
          "你让情绪先落了地。他恢复后主动复盘了客户事件，还提出了流程改进。",
        theory: "《高效能人士的七个习惯》：知彼解己，先理解再被理解。"
      },
      {
        label: "当场替他圆场",
        summary: "出面为客户解释，让员工知道你会护着他。",
        quality: "partial",
        effects: { mobilize: 2, authority: 1 },
        resources: { energy: -5, trust: 5, influence: 1 },
        feedback:
          "你的保护让他感激，但他没有学会处理下一次羞辱。护短只能救急，不能救成长。",
        theory: "《孙子兵法》：令之以文，齐之以武。"
      },
      {
        label: "装作没看见",
        summary: "尊重他的自尊，等他主动开口再介入。",
        quality: "risk",
        effects: { recovery: 1 },
        resources: { energy: -2, trust: -4, influence: -2 },
        feedback:
          "你避免了他的尴尬，但孤独感会放大他的崩溃。关键时刻，沉默也会被记住。",
        theory: "《论语》：君子成人之美，不成人之恶。"
      }
    ]
  },
  {
    id: "s2",
    chapterId: 4,
    title: "新人入职",
    kind: "side",
    context:
      "新来的管培生第一周就提出一个看似天真的方案，被老同事笑了。他下班后还在工位改方案。",
    stake: "你会如何对待一个还在学习如何表达的人？",
    options: [
      {
        label: "让他讲完，再教他结构",
        summary: "给他 10 分钟完整表达，然后用提问帮他补上背景和证据。",
        quality: "expert",
        effects: { deploy: 2, communication: 2 },
        resources: { energy: -5, trust: 7, influence: 4 },
        feedback:
          "你保护了发言的勇气，也教了他专业表达的方法。他后来成了团队里最敢提新想法的人。",
        theory: "德鲁克：用人之所长，而不是用人之所短。"
      },
      {
        label: "让他私下先学流程",
        summary: "提醒他先了解公司规则，成熟后再提建议。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -3, trust: 1, influence: -1 },
        feedback:
          "你把他拉回了流程，但也可能扼杀了他提出新视角的意愿，创新空间被收窄。",
        theory: "《贞观政要》：舍短取长，用其所长。"
      },
      {
        label: "不表态",
        summary: "让团队自然淘汰不成熟的表达，避免特殊照顾。",
        quality: "risk",
        effects: { recovery: 1 },
        resources: { energy: -2, trust: -4, influence: -3 },
        feedback:
          "你的不表态被解读为默认嘲笑。一个高潜人才可能因此变得不敢表达。",
        theory: "《人物志》：察其行而辨其品，审其变而见其性。"
      }
    ]
  },
  {
    id: "s3",
    chapterId: 6,
    title: "深夜复盘",
    kind: "side",
    context:
      "今天你连续处理了三场冲突，晚上 11 点回到家，手机还在弹工作消息。明天还有一场重要的客户提案。",
    stake: "你如何保护自己的精力，同时不丢掉对团队的责任？",
    options: [
      {
        label: "设 30 分钟关机边界",
        summary: "把手机交给家人，做一次简单呼吸练习，明早 6 点提前处理消息。",
        quality: "expert",
        effects: { recovery: 3, structure: 1 },
        resources: { energy: 10, trust: 1, influence: 1 },
        feedback:
          "你没有把“负责”理解为“随时响应”。恢复后的提案比深夜的即时回复更有价值。",
        theory: "《高效能人士的七个习惯》：先做重要不紧急的事，保护产能。"
      },
      {
        label: "把消息全部回完",
        summary: "确保团队明天醒来没有问题，再考虑休息。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -8, trust: 3, influence: 1 },
        feedback:
          "团队感受到了你的负责，但你的精力被碎片化消耗。长期来看，你会成为新的瓶颈。",
        theory: "《卓有成效的管理者》：时间是最稀缺的资源。"
      },
      {
        label: "约同事明天一起加班",
        summary: "召集核心成员明早提前开会，把压力转成团队行动。",
        quality: "risk",
        effects: { mobilize: 1, communication: 1 },
        resources: { energy: -6, trust: -3, influence: -2 },
        feedback:
          "你把焦虑传播给了团队，却没有给出清晰的优先级。集体疲惫不等于集体执行。",
        theory: "《孙子兵法》：上下同欲者胜，但同欲不等于同耗。"
      }
    ]
  },
  {
    id: "s4",
    chapterId: 3,
    title: "谈判桌上的沉默",
    kind: "side",
    context:
      "你陪同销售负责人见一位关键客户。客户突然问起你上一家公司的失败项目，场面安静了几秒，所有人都在等你回应。",
    stake: "你的一句话可能保住这笔订单，也可能让团队失去谈判主动权。",
    options: [
      {
        label: "承认失败，并讲出可迁移的方法",
        summary: "不回避过去，把失败经验转成客户关心的交付保障。",
        quality: "expert",
        effects: { communication: 3, structure: 1 },
        resources: { energy: -5, trust: 7, influence: 6 },
        feedback:
          "你没有防御，也没有表演真诚，而是让客户看到你会从失败中提取可复用的方法。销售负责人悄悄松了口气。",
        theory: "《实践论》：错误常常是正确的先导，关键是从失败中找出规律。"
      },
      {
        label: "把问题推给销售负责人",
        summary: "暗示客户这是团队执行问题，和自己没有关系。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -3, trust: -5, influence: 2 },
        feedback:
          "你保住了自己的形象，却让团队在客户面前失去一致性。订单即使签下，信任也已经打折。",
        theory: "《孙子兵法》：上下同欲者胜。"
      },
      {
        label: "避而不答，转移话题",
        summary: "用客户更关心的问题把沉默带过去。",
        quality: "risk",
        effects: { strategy: 2 },
        resources: { energy: -4, trust: -3, influence: -2 },
        feedback:
          "你暂时避开了尴尬，但客户记得你没有正面回答。回避本身也是一种答案。",
        theory: "《权经》：揣为上，事次之，但不可失信于人。"
      }
    ]
  },
  {
    id: "s5",
    chapterId: 5,
    title: "周末交付危机",
    kind: "side",
    context:
      "周六晚上，关键项目发现严重数据错误，客户周一上午就要看演示。团队核心成员已经连续两周没有休息。",
    stake: "你需要决定：连夜修复，还是先把风险告诉客户。",
    options: [
      {
        label: "先隔离错误范围，再决定加班方案",
        summary: "用 30 分钟确认错误影响，只留下真正必要的人处理。",
        quality: "expert",
        effects: { structure: 3, execution: 2, recovery: 1 },
        resources: { energy: -6, trust: 6, influence: 5 },
        feedback:
          "你没有让所有人盲目加班，而是先缩小问题范围。团队看到你在用结构保护他们的精力。",
        theory: "《矛盾论》：抓住主要矛盾，其他问题才能迎刃而解。"
      },
      {
        label: "全员立即上线处理",
        summary: "先把错误修完，其他事情等演示结束后再说。",
        quality: "partial",
        effects: { execution: 3 },
        resources: { energy: -12, trust: -2, influence: 2 },
        feedback:
          "问题可能修完了，但团队连续加班的风险会在下个季度爆发。你不是在管理精力，只是在透支未来。",
        theory: "《卓有成效的管理者》：时间是最稀缺的资源。"
      },
      {
        label: "周一直接带风险上会",
        summary: "不临时修复，把真实情况完整告诉客户。",
        quality: "risk",
        effects: { communication: 2, recovery: 1 },
        resources: { energy: -3, trust: 3, influence: -6 },
        feedback:
          "坦诚值得肯定，但你本可以在周末先控制错误范围。只带风险上会，客户会认为团队没有执行能力。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      }
    ]
  },
  {
    id: "s6",
    chapterId: 8,
    title: "团队崩溃时刻",
    kind: "side",
    context:
      "业务连续受挫后，核心团队在复盘会上开始互相指责，有人提出辞职，有人把失败归咎于你。",
    stake: "你需要在情绪失控前，重新建立团队对彼此和目标的信任。",
    options: [
      {
        label: "先叫停指责，重新约定复盘规则",
        summary: "把讨论从“谁错了”转成“我们从哪里学到了什么”。",
        quality: "expert",
        effects: { mobilize: 3, communication: 2 },
        resources: { energy: -7, trust: 8, influence: 6 },
        feedback:
          "你没有急着背锅，也没有找人顶罪，而是先改变讨论结构。团队开始把失败当成共同材料。",
        theory: "毛泽东《党委会的工作方法》：先当学生，再当先生。"
      },
      {
        label: "独自承担责任",
        summary: "把所有失败都揽到自己身上，让团队停止争吵。",
        quality: "partial",
        effects: { recovery: 2, authority: 1 },
        resources: { energy: -8, trust: 5, influence: -2 },
        feedback:
          "团队暂时安静了，但他们没有学会面对失败。过度背锅也会让真正的问题消失。",
        theory: "《论语》：君子求诸己，小人求诸人。"
      },
      {
        label: "点名批评最响的反对者",
        summary: "用高压让团队先服从，再讨论下一步。",
        quality: "risk",
        effects: { authority: 3 },
        resources: { energy: -5, trust: -8, influence: 3 },
        feedback:
          "你压住了场面，却把团队拆成了更小的阵营。下一次失败时，没有人愿意先开口。",
        theory: "《孙子兵法》：令之以文，齐之以武，但文武必须并用。"
      }
    ]
  },
  {
    id: "s7",
    chapterId: 6,
    title: "高管群里的质疑",
    kind: "side",
    context:
      "核心下属在管理层群里公开质疑你的数据口径，并直接 @ 了 CEO。你查记录发现他的质疑有三成依据，但把误差放大成了“决策失误”。",
    stake: "直接压制会显得心虚，不回应会让质疑变成默认结论；你要让事实和规则同时回到台面。",
    options: [
      {
        label: "先对齐决策闭环，再私下谈话",
        summary: "把越级汇报变成流程问题：明确关键决策必须进入联合机制，再单独说明边界。",
        quality: "expert",
        effects: { authority: 3, structure: 2 },
        resources: { energy: -6, trust: 6, influence: 6 },
        feedback:
          "你没有把冲突变成站队，而是让所有人看到：越过流程会付出协作成本，守住流程会获得信任。下属很快回到了正式汇报路径。",
        theory: "《权经》：用权有度，授权赋能，主动掌控，先胜后战。"
      },
      {
        label: "当场驳回并警告",
        summary: "在高管会上公开纠正对方，树立不可越级的威严。",
        quality: "partial",
        effects: { authority: 3 },
        resources: { energy: -5, trust: -6, influence: 4 },
        feedback:
          "威严立住了，但下属从此把真实信息藏得更深。越级汇报减少了，越过你决策的行为却增加了。",
        theory: "《孙子兵法》：致人而不致于人。"
      },
      {
        label: "暂时沉默观察",
        summary: "不急着表态，先收集对方越级汇报的真实动机。",
        quality: "risk",
        effects: { insight: 2 },
        resources: { energy: -4, trust: -3, influence: -4 },
        feedback:
          "沉默被读成了默许。团队开始绕过你直接找高层，权力边界在观望中彻底失守。",
        theory: "《鬼谷子》：审定形势，谋定后动。"
      }
    ]
  },
  {
    id: "s8",
    chapterId: 7,
    title: "先斩后奏",
    kind: "side",
    context:
      "一位部门负责人已经代表公司与供应商签下合作意向，客户和财务都收到了邮件，你却是最后一个知道的。合同还没盖章，但对方已经开始按意向推进。",
    stake: "你既要处理“未经授权先动”的事实，又不能否定一个可能真的对组织有利的机会。",
    options: [
      {
        label: "把方案纳入正式决策评审",
        summary: "承认方案价值，同时要求它进入预算与风险评审，让权力回到机制。",
        quality: "expert",
        effects: { structure: 3, authority: 2 },
        resources: { energy: -7, trust: 5, influence: 7 },
        feedback:
          "你没有否定对方，而是让所有人都看到：好方案必须经过同一套规则。这位负责人反而成了流程的维护者。",
        theory: "《权经》：权乃人授，授为大焉；用制度守住权力边界。"
      },
      {
        label: "直接取消合作",
        summary: "用否决权证明谁说了算，避免被架空。",
        quality: "partial",
        effects: { authority: 3 },
        resources: { energy: -5, trust: -8, influence: 3 },
        feedback:
          "方案停了，但组织记住了你习惯用否决代替规则。下一次对方会带着更隐蔽的联盟回来。",
        theory: "《韩非子》：法、术、势并用，不能以力代制。"
      },
      {
        label: "让 CEO 裁断",
        summary: "把边界问题交给更高层，避免自己卷入政治。",
        quality: "risk",
        effects: { strategy: 2 },
        resources: { energy: -3, trust: -5, influence: -5 },
        feedback:
          "你把协调难题上交了，短期内安全，但高层会记住你无法横向守住边界。",
        theory: "《资治通鉴》：推功于人，以维系团结。"
      }
    ]
  },
  {
    id: "s9",
    chapterId: 8,
    title: "交接日",
    kind: "side",
    context:
      "你晋升前最后一周，系统权限已经部分移交。你发现客户拜访记录、供应商联系人、历史决策理由散落在三处，接替者连“明天该先回哪个邮件”都判断不了。",
    stake: "交接不是把账号交出去，而是让接替者能复现你每周都在做的高频判断。",
    options: [
      {
        label: "建立决策手册与交接演练",
        summary: "把高频判断写成清单，让接替者用真实案例演练并验收。",
        quality: "expert",
        effects: { structure: 3, stability: 2 },
        resources: { energy: -8, trust: 6, influence: 5 },
        feedback:
          "你离开后，团队第一次在没有你的情况下完成了一次完整决策。经验变成了流程，权力变成了能力。",
        theory: "《卓有成效的管理者》：管理者必须把时间投入真正重要的决策。"
      },
      {
        label: "只带关键助手熟悉关系",
        summary: "挑一个人贴身跟学人脉和流程，降低短期风险。",
        quality: "partial",
        effects: { deploy: 2, communication: 1 },
        resources: { energy: -6, trust: 3, influence: -3 },
        feedback:
          "单点备份解决了眼前问题，但组织仍然依赖某一个关键人。你走后，断点只是换了名字。",
        theory: "《贞观政要》：以天下之财，非其人不可治。"
      },
      {
        label: "把问题留给接替者",
        summary: "相信组织会自然适应，把精力留给新岗位。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -4, trust: -4, influence: -6 },
        feedback:
          "新岗位还没站稳，旧业务已经失速。你个人赢了晋升，组织付出了代价。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      }
    ]
  },
  {
    id: "c1b-parachute",
    chapterId: 1,
    title: "权力地图",
    kind: "branch",
    context:
      "你选择先做权力地图。行政主管愿意配合，但财务经理仍保持距离，你需要判断谁是你的第一联盟。",
    stake: "你要把第一轮访谈变成可信的联盟基础。",
    options: [
      {
        label: "先与行政主管共建信息网络",
        summary: "把行政主管变成你的组织雷达，但不让她承担风险。",
        quality: "expert",
        effects: { insight: 3, communication: 2 },
        resources: { energy: -6, trust: 8, influence: 5 },
        feedback: "你把第一个盟友放进了正确位置，组织信息开始主动流向你，你的判断也有了落地通道。",
        theory: "《人物志》：观其外而知其内，察其行而辨其品。"
      },
      {
        label: "先争取财务经理",
        summary: "用透明度换取财务数据，先建立专业信任。",
        quality: "partial",
        effects: { authority: 2, structure: 2 },
        resources: { energy: -7, trust: 5, influence: 3 },
        feedback: "你拿到了数据，但行政主管开始觉得你绕过了她，你的信息渠道反而在收窄。",
        theory: "《权经》：权乃人授，授为大焉。"
      },
      {
        label: "自己组建临时信息小组",
        summary: "绕过双方，从一线骨干收集信息。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -9, trust: -4, influence: 1 },
        feedback: "你信息更全面了，但第一周就制造了两个潜在反对者，后续协作要先消解这段警惕。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      }
    ]
  },
  {
    id: "c1b-founder",
    chapterId: 1,
    title: "现金流最小验证",
    kind: "branch",
    context:
      "你决定先用访谈建立信任，但创始人直觉提醒你：如果没有现金流验证，团队只会继续内耗。",
    stake: "你要在信任和现金流之间找到第一个可验证的突破口。",
    options: [
      {
        label: "选一个 48 小时可验证的现金流动作",
        summary: "把访谈结论压缩成一个最小验证，让团队看到数据变化。",
        quality: "expert",
        effects: { execution: 3, structure: 2 },
        resources: { energy: -8, trust: 5, influence: 6 },
        feedback: "你用一个可验证动作把关系访谈变成了业务推进，团队第一次在数据里看到方向。",
        theory: "德鲁克：管理者的成果是贡献，不是忙碌。"
      },
      {
        label: "先补齐团队信息再验证",
        summary: "等访谈完成，信息足够后再行动。",
        quality: "partial",
        effects: { communication: 2 },
        resources: { energy: -5, trust: 3, influence: 2 },
        feedback: "团队觉得你重视他们，但业务仍没有变化，信任正在被等待消耗。",
        theory: "《权经》：揣为上，事次之。"
      },
      {
        label: "跳过访谈直接做验证",
        summary: "用创始人直觉先跑一个动作，不浪费时间。",
        quality: "risk",
        effects: { execution: 3, strategy: 1 },
        resources: { energy: -7, trust: -6, influence: 2 },
        feedback: "你可能验证了业务，却让团队认为你并不真的听他们，未来沟通成本会成倍上升。",
        theory: "《孙子兵法》：兵贵胜，不贵久。"
      }
    ]
  },
  {
    id: "c1b-highPotential",
    chapterId: 1,
    title: "横向共识会",
    kind: "branch",
    context:
      "你没有正式任命，决定先用访谈建立横向共识。现在你需要让这轮共识变成一个能被各部门认可的行动计划。",
    stake: "你要让每个部门都觉得自己参与了，而不是被通知。",
    options: [
      {
        label: "把访谈结论转成共同行动计划",
        summary: "让每个关键人都带一个自己愿意负责的动作进入计划。",
        quality: "expert",
        effects: { communication: 3, mobilize: 2 },
        resources: { energy: -7, trust: 8, influence: 6 },
        feedback: "计划不再是你一个人的，各部门开始主动认领责任，横向共识第一次有了抓手。",
        theory: "毛泽东《党委会的工作方法》：互通情报，取得共同语言。"
      },
      {
        label: "先向更高层汇报结论",
        summary: "用高层支持推动部门执行。",
        quality: "partial",
        effects: { strategy: 3 },
        resources: { energy: -5, trust: -3, influence: 4 },
        feedback: "你获得了背书，却削弱了横向共识的主动性，部门开始只对上级负责。",
        theory: "《权经》：携为上，功次之。"
      },
      {
        label: "直接发出执行清单",
        summary: "自己整理清单，要求各部门配合。",
        quality: "risk",
        effects: { execution: 2, authority: 1 },
        resources: { energy: -6, trust: -6, influence: 2 },
        feedback: "清单很快被各部门当成别人家的事，执行变成了表面配合。",
        theory: "《论语》：不患人之不己知，患不知人也。"
      }
    ]
  },
  {
    id: "c2b-parachute",
    chapterId: 2,
    title: "空降 · 授权真空下的第一选择",
    kind: "branch",
    context:
      "你作为空降管理者，在没有正式授权时决定先做小胜利。团队开始观察你会把第一个承诺投给谁。",
    stake: "你要让高层看到你能在没有名分时建立判断秩序。",
    options: [
      {
        label: "先锁定一个 14 天内能赢的项目",
        summary: "选一个边界清楚、风险可控、能证明你判断力的项目。",
        quality: "expert",
        effects: { execution: 3, strategy: 2 },
        resources: { energy: -6, trust: 5, influence: 6 },
        feedback: "你把授权真空变成观察期，用可验证结果换回了主动权，名分开始跟着成果走。",
        theory: "《权经》：携为上，功次之。"
      },
      {
        label: "先向上说明需要授权",
        summary: "让 CEO 明确授权边界，避免名不正言不顺。",
        quality: "partial",
        effects: { strategy: 2, communication: 1 },
        resources: { energy: -5, trust: 2, influence: 3 },
        feedback: "你争取了授权，但高层可能觉得你在等别人给权力，主动性反而被削弱。",
        theory: "《权经》：权乃人授，授为大焉。"
      },
      {
        label: "先绕开授权推进关键动作",
        summary: "不等正式文件，先做出改变。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -6, trust: -4, influence: 2 },
        feedback: "你展现了行动力，但越权动作会留下权力边界风险，后续每件事都要被重新审视。",
        theory: "《韩非子》：事以密成，语以泄败。"
      }
    ]
  },
  {
    id: "c2b-founder",
    chapterId: 2,
    title: "创业 · 授权真空下的第一选择",
    kind: "branch",
    context:
      "你作为创始人，在没有明确组织授权时决定先验证现金流。团队开始等待你给出第一个可执行方向。",
    stake: "你要让团队相信，即使没有完整体系，你也能找到活路。",
    options: [
      {
        label: "先锁定一个可回款的客户动作",
        summary: "选一个能在两周内产生现金流的动作，先跑通再谈体系。",
        quality: "expert",
        effects: { execution: 3, structure: 2 },
        resources: { energy: -7, trust: 5, influence: 5 },
        feedback: "你用一个真实回款动作建立了创业团队的第一套确定性，现金流成了最好的共识。",
        theory: "德鲁克：管理者的成果是贡献，不是忙碌。"
      },
      {
        label: "先补齐合伙人共识",
        summary: "避免创始人独断，先统一方向再行动。",
        quality: "partial",
        effects: { communication: 2 },
        resources: { energy: -5, trust: 3, influence: 2 },
        feedback: "共识变多了，但业务动作仍没有开始，团队在讨论里耗掉了时机。",
        theory: "《论语》：君子信而后劳其民。"
      },
      {
        label: "直接砍掉低效业务",
        summary: "用创始人权力快速止血，把资源转向高潜力方向。",
        quality: "risk",
        effects: { execution: 3 },
        resources: { energy: -7, trust: -5, influence: 1 },
        feedback: "资源被集中了，但团队对未来的安全感被同时砍掉，人心开始向外部流动。",
        theory: "《孙子兵法》：兵贵胜，不贵久。"
      }
    ]
  },
  {
    id: "c2b-highPotential",
    chapterId: 2,
    title: "高潜 · 授权真空下的第一选择",
    kind: "branch",
    context:
      "你作为高潜骨干，在没有正式任命时决定先建立横向共识。各部门开始等待你证明项目值得参与。",
    stake: "你要让关键人愿意把时间投给一个没有头衔的你。",
    options: [
      {
        label: "先建立一个共同目标工作台",
        summary: "用一张看板把各部门目标、责任和截止时间公开对齐。",
        quality: "expert",
        effects: { communication: 3, structure: 2 },
        resources: { energy: -6, trust: 6, influence: 5 },
        feedback: "你没有要求授权，而是让协作关系变得可操作，各部门第一次看见共同的节奏。",
        theory: "毛泽东《党委会的工作方法》：互通情报，取得共同语言。"
      },
      {
        label: "先私下说服两个关键部门",
        summary: "减少公开阻力，先获得核心支持。",
        quality: "partial",
        effects: { strategy: 2 },
        resources: { energy: -5, trust: 2, influence: 2 },
        feedback: "你获得了局部支持，但未被邀请的部门感到被排除，裂痕开始出现。",
        theory: "《权经》：揣为上，事次之。"
      },
      {
        label: "直接向上级提交完整方案",
        summary: "用高层推动打破部门僵局。",
        quality: "risk",
        effects: { authority: 1, execution: 1 },
        resources: { energy: -4, trust: -4, influence: 2 },
        feedback: "方案被推进了，但横向关系反而变得更疏远，你在部门间失去了缓冲。",
        theory: "《韩非子》：事以密成，语以泄败。"
      }
    ]
  },
  {
    id: "c3b-parachute",
    chapterId: 3,
    title: "空降 · 人才配置的第一次落子",
    kind: "branch",
    context:
      "你作为空降管理者开始重组关键岗位。团队最担心的是你会不会用亲疏替代能力。",
    stake: "你的第一个人事动作会成为未来规则的样本。",
    options: [
      {
        label: "先定义岗位成果，再评估人选",
        summary: "让人才判断从印象变成岗位匹配证据。",
        quality: "expert",
        effects: { deploy: 3, structure: 2, insight: 1 },
        resources: { energy: -7, trust: 6, influence: 5 },
        feedback: "你让人事决定变得可解释，团队开始用成果而非关系理解你，规则成了你的护城河。",
        theory: "《贞观政要》：用非其才，必难致治。"
      },
      {
        label: "先稳住核心客户负责人",
        summary: "优先保护掌握客户的老人，避免业务波动。",
        quality: "partial",
        effects: { execution: 2, strategy: 1 },
        resources: { energy: -5, trust: 3, influence: 2 },
        feedback: "业务暂时稳定，但团队认为你被核心客户绑架，你的判断独立性开始被质疑。",
        theory: "《权经》：携为上，功次之。"
      },
      {
        label: "先替换最反对你的老将",
        summary: "用人事动作立威，让其他人快速表态。",
        quality: "risk",
        effects: { authority: 3 },
        resources: { energy: -6, trust: -8, influence: 2 },
        feedback: "你获得了短期服从，但组织开始为自保而隐藏信息，决策越来越依赖二手消息。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      }
    ]
  },
  {
    id: "c3b-founder",
    chapterId: 3,
    title: "创业 · 人才配置的第一次落子",
    kind: "branch",
    context:
      "你作为创始人开始重组团队。公司最依赖的人正控制核心客户，但管理能力不足。",
    stake: "你要在依赖与组织健康之间做第一次取舍。",
    options: [
      {
        label: "把核心客户拆成可复制的客户体系",
        summary: "不让客户只属于一个人，先建立关键客户管理流程。",
        quality: "expert",
        effects: { structure: 3, deploy: 2 },
        resources: { energy: -7, trust: 5, influence: 5 },
        feedback: "你没有直接开人，而是让组织不再被单个明星绑架，客户关系第一次可复制。",
        theory: "德鲁克：用人之所长，同时让成果可复制。"
      },
      {
        label: "继续依赖明星员工",
        summary: "先保业绩，等公司稳定后再处理结构问题。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -5, trust: 2, influence: -1 },
        feedback: "短期业绩稳定，但组织对人的依赖正在加深，单点风险越积越大。",
        theory: "《韩非子》：明主之道，使智者尽其虑。"
      },
      {
        label: "立刻架空明星员工",
        summary: "用新人接管客户，防止权力失控。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -7, trust: -7, influence: 1 },
        feedback: "你削弱了个人依赖，但客户流失风险在交接期爆发，团队信心受到打击。",
        theory: "《孙子兵法》：善战者，先为不可胜。"
      }
    ]
  },
  {
    id: "c3b-highPotential",
    chapterId: 3,
    title: "高潜 · 人才配置的第一次落子",
    kind: "branch",
    context:
      "你作为高潜骨干参与人才盘点。部门负责人希望你给结论，但所有人都在等你说出谁该被留下。",
    stake: "你要给出不偏私、又能被组织接受的判断。",
    options: [
      {
        label: "用岗位成果模型公开评估",
        summary: "先让所有人都看到评估标准，再给出人选建议。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -6, trust: 6, influence: 5 },
        feedback: "你没有制造派系，而是让组织开始用共同标准讨论人，判断第一次不靠印象。",
        theory: "《人物志》：观其外而知其内，察其行而辨其品。"
      },
      {
        label: "先私下给部门负责人结论",
        summary: "避免公开得罪人，让负责人决定是否采纳。",
        quality: "partial",
        effects: { strategy: 2 },
        resources: { energy: -5, trust: 2, influence: 2 },
        feedback: "你保护了自己，但结论缺少公开依据，很容易在下一轮被推翻。",
        theory: "《权经》：揣为上，事次之。"
      },
      {
        label: "公开点出能力不足的人",
        summary: "用数据直接说明谁不适合当前岗位。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -5, trust: -6, influence: 2 },
        feedback: "你指出了事实，却让被点名者成为靶子，讨论开始转向人身攻击。",
        theory: "《论语》：君子成人之美，不成人之恶。"
      }
    ]
  },
  {
    id: "c4b-parachute",
    chapterId: 4,
    title: "空降 · 阻力面前的第一次同盟",
    kind: "branch",
    context:
      "你作为空降管理者推动新流程，运营负责人公开反对。你没有压制，而是决定把谁拉进共同责任。",
    stake: "你要让反对者从阻力变成共同负责人，而不是把他推向更深的对立。",
    options: [
      {
        label: "把反对者变成试点负责人",
        summary: "让他的顾虑成为方案前提，并让他负责试点结果。",
        quality: "expert",
        effects: { mobilize: 3, communication: 2 },
        resources: { energy: -7, trust: 8, influence: 6 },
        feedback: "你让最有能力反对的人开始为结果负责，变革第一次有了共同所有权，阻力变成了推力。",
        theory: "《孙子兵法》：上下同欲者胜。"
      },
      {
        label: "先私下争取他的支持",
        summary: "避免公开对抗，先谈条件再宣布。",
        quality: "partial",
        effects: { strategy: 2 },
        resources: { energy: -5, trust: 3, influence: 2 },
        feedback: "他暂时支持你，但团队其他人并不清楚你们的交易，共识出现了裂缝。",
        theory: "《权经》：揣为上，事次之。"
      },
      {
        label: "用高层授权强制推进",
        summary: "不等待共识，用 CEO 背书让流程先落地。",
        quality: "risk",
        effects: { authority: 3 },
        resources: { energy: -5, trust: -7, influence: 4 },
        feedback: "流程落地了，但运营团队开始用沉默抵抗你，执行被暗中稀释。",
        theory: "《孙子兵法》：令之以文，齐之以武，但不可偏废。"
      }
    ]
  },
  {
    id: "c4b-founder",
    chapterId: 4,
    title: "创业 · 阻力面前的第一次同盟",
    kind: "branch",
    context:
      "你作为创始人推动产品方向变化，联合创始人公开反对。团队分成两派，都在等你表态。",
    stake: "你要让反对意见变成产品验证的一部分，而不是内部分裂。",
    options: [
      {
        label: "把双方观点变成可验证实验",
        summary: "不让团队站队，用两周实验验证两条路径。",
        quality: "expert",
        effects: { structure: 3, mobilize: 2 },
        resources: { energy: -7, trust: 7, influence: 5 },
        feedback: "你把创始人之间的争论变成了组织学习，团队重新开始合作，分歧成了验证材料。",
        theory: "《实践论》：从实践中找规律。"
      },
      {
        label: "按自己的判断直接定方向",
        summary: "承担创始人责任，用权力结束争论。",
        quality: "partial",
        effects: { authority: 2, execution: 1 },
        resources: { energy: -5, trust: -4, influence: 3 },
        feedback: "方向定了，但联合创始人的不认同仍会持续影响执行，内耗转入地下。",
        theory: "《权经》：权惟用，不为大也。"
      },
      {
        label: "让董事会介入仲裁",
        summary: "把内部争议交给外部裁决。",
        quality: "risk",
        effects: { strategy: 2 },
        resources: { energy: -4, trust: -6, influence: -3 },
        feedback: "你避免了亲自得罪人，却让团队看到创始团队无法自治，权威开始外移。",
        theory: "《韩非子》：明主之道，使智者尽其虑。"
      }
    ]
  },
  {
    id: "c4b-highPotential",
    chapterId: 4,
    title: "高潜 · 阻力面前的第一次同盟",
    kind: "branch",
    context:
      "你作为高潜骨干提出的方案被资深负责人反对。你没有职位权力，但方案里确实存在一个关键漏洞。",
    stake: "你要让反对者愿意和你一起改方案，而不是坚持对错。",
    options: [
      {
        label: "把反对者的漏洞变成方案修订项",
        summary: "公开承认缺口，请他提供专业补充。",
        quality: "expert",
        effects: { communication: 3, structure: 2 },
        resources: { energy: -6, trust: 8, influence: 5 },
        feedback: "你把最强反对者变成了最强协作者，方案反而更扎实，专业赢得了尊重。",
        theory: "《论语》：君子求诸己，小人求诸人。"
      },
      {
        label: "先争取更高层支持",
        summary: "绕过反对者，用上级推动方案通过。",
        quality: "partial",
        effects: { strategy: 2 },
        resources: { energy: -5, trust: -5, influence: 3 },
        feedback: "方案暂时通过了，但资深负责人不会再主动帮助你，你失去了一个导师。",
        theory: "《权经》：权乃人授，授为大焉。"
      },
      {
        label: "坚持原方案，指出对方误解",
        summary: "先证明自己没错，再讨论改进。",
        quality: "risk",
        effects: { authority: 1 },
        resources: { energy: -4, trust: -6, influence: -2 },
        feedback: "你证明了观点，却把讨论变成谁对谁错，协作的入口从此关闭。",
        theory: "《人物志》：审其变而见其性。"
      }
    ]
  },
  {
    id: "c5b-parachute",
    chapterId: 5,
    title: "空降 · 目标落地的第一次拆解",
    kind: "branch",
    context:
      "你作为空降管理者拿到收入翻倍目标，团队开始点头但没人知道明天做什么。",
    stake: "你要把口号变成每个团队都能检查的关键结果。",
    options: [
      {
        label: "用关键结果倒排行动和责任人",
        summary: "把目标拆成三个可验证结果，并让每个人认领。",
        quality: "expert",
        effects: { structure: 3, execution: 2, authority: 1 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback: "目标第一次变成可检查的作战图，团队不再只点头，开始为结果负责。",
        theory: "德鲁克：把资源集中在真正重要的少数任务上。"
      },
      {
        label: "先让各部门自报目标",
        summary: "尊重现有汇报体系，只做汇总。",
        quality: "partial",
        effects: { communication: 2 },
        resources: { energy: -5, trust: 3, influence: 1 },
        feedback: "各部门目标很快互相冲突，你只能不断协调，精力耗在了对齐上。",
        theory: "《韩非子》：使事不相干，使士不兼官。"
      },
      {
        label: "直接给每个部门下指标",
        summary: "用目标压力推动执行，避免讨论拖延。",
        quality: "risk",
        effects: { authority: 2, execution: 1 },
        resources: { energy: -5, trust: -5, influence: 3 },
        feedback: "数字被下达了，但团队开始寻找最容易完成的解释，目标被悄悄架空。",
        theory: "《孙子兵法》：上下同欲者胜。"
      }
    ]
  },
  {
    id: "c5b-founder",
    chapterId: 5,
    title: "创业 · 目标落地的第一次拆解",
    kind: "branch",
    context:
      "你作为创始人面对增长目标，产品、销售、研发各有优先级。团队需要你把目标变成共同节奏。",
    stake: "你要让三个部门围绕同一个可验证结果行动。",
    options: [
      {
        label: "锁定一个可回款的关键结果",
        summary: "让所有部门围绕“本季度回款”定义各自动作。",
        quality: "expert",
        effects: { execution: 3, structure: 2 },
        resources: { energy: -7, trust: 5, influence: 5 },
        feedback: "不同部门第一次用同一个结果语言协作，目标不再各说各话。",
        theory: "《卓有成效的管理者》：要事优先。"
      },
      {
        label: "让三个部门分别定目标",
        summary: "减少创始人干预，让部门自主。",
        quality: "partial",
        effects: { deploy: 2 },
        resources: { energy: -5, trust: 3, influence: 1 },
        feedback: "部门目标各自合理，但合在一起并不支持增长，整体方向失焦。",
        theory: "《韩非子》：明主之道，使智者尽其虑。"
      },
      {
        label: "用投资人压力强推目标",
        summary: "让团队知道目标不能谈，只能执行。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -5, trust: -6, influence: 2 },
        feedback: "团队开始执行，但不再愿意暴露真实风险，坏消息被压到最后。",
        theory: "《孙子兵法》：令之以文，齐之以武。"
      }
    ]
  },
  {
    id: "c5b-highPotential",
    chapterId: 5,
    title: "高潜 · 目标落地的第一次拆解",
    kind: "branch",
    context:
      "你作为高潜骨干被要求带领跨部门小组完成季度目标，但没有人真正向你汇报。",
    stake: "你要用目标管理代替行政命令，让成员愿意协作。",
    options: [
      {
        label: "建立共同看板和轮流主持节奏",
        summary: "让每个成员承担一个公开可见的关键结果。",
        quality: "expert",
        effects: { communication: 3, structure: 2 },
        resources: { energy: -6, trust: 7, influence: 5 },
        feedback: "你让项目变成共同所有，而不是你一个人的任务，跨部门开始互相补位。",
        theory: "毛泽东《党委会的工作方法》：互通情报，取得共同语言。"
      },
      {
        label: "先争取部门负责人支持",
        summary: "让负责人认可目标，再推动成员执行。",
        quality: "partial",
        effects: { strategy: 2 },
        resources: { energy: -5, trust: 2, influence: 2 },
        feedback: "负责人支持了，但成员仍然只向原部门汇报，你的小组名存实亡。",
        theory: "《权经》：权乃人授，授为大焉。"
      },
      {
        label: "直接发布目标清单",
        summary: "用清晰指令让各部门配合。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -5, trust: -5, influence: 2 },
        feedback: "清单发出去了，但被各部门当作别人的项目，执行落空。",
        theory: "《论语》：不患人之不己知，患不知人也。"
      }
    ]
  },
  {
    id: "c6b-parachute",
    chapterId: 6,
    title: "空降 · 权力边界的第一次固化",
    kind: "branch",
    context:
      "你作为空降管理者发现有人绕过你决策。你没有选择公开对抗，而是准备用制度重新定义边界。",
    stake: "你要让“重大决策进入闭环”成为组织默认规则。",
    options: [
      {
        label: "建立联签和变更留痕机制",
        summary: "用流程让绕过你变成不合规，而不是个人冲突。",
        quality: "expert",
        effects: { authority: 3, structure: 2 },
        resources: { energy: -7, trust: 2, influence: 6 },
        feedback: "你让权力边界从个人态度变成组织规则，冲突被流程吸收，绕行开始失效。",
        theory: "《韩非子》：法度既立，虽庸主可治。"
      },
      {
        label: "直接找越级者谈话",
        summary: "用一次明确谈话让对方知道边界。",
        quality: "partial",
        effects: { authority: 2, communication: 1 },
        resources: { energy: -5, trust: -2, influence: 3 },
        feedback: "对方暂时收敛了，但没有制度约束，下一次会换个方式绕过你。",
        theory: "《权经》：权乃人授，授为大焉。"
      },
      {
        label: "先让越级者承担一次失败",
        summary: "等他出错后再处理，用事实证明你的边界。",
        quality: "risk",
        effects: { strategy: 2 },
        resources: { energy: -5, trust: -5, influence: -2 },
        feedback: "你可能等到了失败，但组织也承担了本可避免的损失，代价被放大。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      }
    ]
  },
  {
    id: "c6b-founder",
    chapterId: 6,
    title: "创业 · 权力边界的第一次固化",
    kind: "branch",
    context:
      "你作为创始人发现合伙人绕过你直接决策。你名义上是 CEO，实际决策正在被架空。",
    stake: "你要重建决策机制，而不是让公司进入公开摊牌。",
    options: [
      {
        label: "把重大决策纳入董事会机制",
        summary: "用治理结构保护决策权，而不是靠个人对抗。",
        quality: "expert",
        effects: { structure: 3, authority: 2 },
        resources: { energy: -6, trust: 3, influence: 6 },
        feedback: "你让权力边界回到治理规则，合伙人无法再靠私人关系绕过你，制度开始说话。",
        theory: "《韩非子》：法、术、势并用。"
      },
      {
        label: "与合伙人签订权责协议",
        summary: "明确各自的决策范围，避免继续模糊。",
        quality: "partial",
        effects: { communication: 2, strategy: 1 },
        resources: { energy: -5, trust: 2, influence: 3 },
        feedback: "权责变清晰了，但执行时仍缺少强制检查，边界仍会被试探。",
        theory: "《权经》：权乃人授，授为大焉。"
      },
      {
        label: "用 CEO 身份公开重申边界",
        summary: "让团队知道所有决策必须经过你。",
        quality: "risk",
        effects: { authority: 3 },
        resources: { energy: -5, trust: -7, influence: 2 },
        feedback: "你夺回了表面权力，但合伙人开始在公司外寻找盟友，冲突转向暗处。",
        theory: "《孙子兵法》：令之以文，齐之以武。"
      }
    ]
  },
  {
    id: "c6b-highPotential",
    chapterId: 6,
    title: "高潜 · 权力边界的第一次固化",
    kind: "branch",
    context:
      "你作为高潜骨干的项目被更高层直接指挥，关键决定绕过了你，但结果仍要你负责。",
    stake: "你要守住项目主导权，又不和高层正面冲突。",
    options: [
      {
        label: "用项目章程固定决策与变更规则",
        summary: "让所有关键变更进入统一流程，保护项目一致性。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -6, trust: 4, influence: 5 },
        feedback: "你没有争夺头衔，而是让项目本身有了可执行的决策规则，边界由章程守住。",
        theory: "《韩非子》：使事不相干，使士不兼官。"
      },
      {
        label: "私下向更高层解释风险",
        summary: "用风险说明让高层愿意听你的判断。",
        quality: "partial",
        effects: { strategy: 2 },
        resources: { energy: -5, trust: 2, influence: 2 },
        feedback: "高层暂时接受了，但绕过行为没有变成制度约束，下次还会发生。",
        theory: "《权经》：揣为上，事次之。"
      },
      {
        label: "拒绝为未经你确认的决策负责",
        summary: "公开划清责任边界，防止自己被架空。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -5, trust: -6, influence: -3 },
        feedback: "你守住了责任边界，却被视为不配合高层，机会开始绕开你。",
        theory: "《论语》：君子求诸己，小人求诸人。"
      }
    ]
  },
  {
    id: "c7b-parachute",
    chapterId: 7,
    title: "空降 · 组织能力的第一次沉淀",
    kind: "branch",
    context:
      "你作为空降管理者发现很多判断只存在你脑子里。你一离开，团队就回到老路。",
    stake: "你要让组织开始离开你也能运行。",
    options: [
      {
        label: "把高频决策做成检查清单",
        summary: "让团队在关键节点使用可复用的判断流程。",
        quality: "expert",
        effects: { stability: 3, structure: 2 },
        resources: { energy: -7, trust: 4, influence: 6 },
        feedback: "你开始把个人经验产品化，组织第一次不再依赖你的反应速度，能力开始沉淀。",
        theory: "毛泽东《党委会的工作方法》：制度建党，不依赖个人。"
      },
      {
        label: "只培养一个核心代理人",
        summary: "把关键经验传给最信任的人。",
        quality: "partial",
        effects: { deploy: 2, strategy: 1 },
        resources: { energy: -5, trust: 4, influence: 2 },
        feedback: "你降低了短期风险，却把组织能力绑定在另一个人身上，单点仍在。",
        theory: "《权经》：授能干者，授忠诚者。"
      },
      {
        label: "保持个人判断优势",
        summary: "不公开方法，让自己不可替代。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -4, trust: -5, influence: -5 },
        feedback: "你保住了位置，却让组织无法放大你的价值，个人成了天花板。",
        theory: "《贞观政要》：善始慎终，创业难守成更难。"
      }
    ]
  },
  {
    id: "c7b-founder",
    chapterId: 7,
    title: "创业 · 组织能力的第一次沉淀",
    kind: "branch",
    context:
      "你作为创始人发现公司所有关键决策都要经过你，你生病一天业务就停一半。",
    stake: "你要把创始人经验变成可复制的组织流程。",
    options: [
      {
        label: "把关键决策写成经营手册",
        summary: "让核心团队使用同一套判断框架。",
        quality: "expert",
        effects: { stability: 3, structure: 2 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback: "你开始把创始人直觉制度化，公司第一次有了“不依赖你也能决策”的路径，能力真正沉淀下来。",
        theory: "德鲁克：把个人贡献转化为组织能力。"
      },
      {
        label: "只带一个联合创始人",
        summary: "把关键经验传给一人，保证重大决策不失控。",
        quality: "partial",
        effects: { deploy: 2 },
        resources: { energy: -5, trust: 3, influence: 2 },
        feedback: "公司不再只依赖你，但开始依赖另一个个人，真正的制度化还没发生。",
        theory: "《权经》：授能干者，授忠诚者。"
      },
      {
        label: "继续亲自掌控所有决策",
        summary: "保持创始人控制力，防止执行走样。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -8, trust: -2, influence: -2 },
        feedback: "公司稳定在你手里，但增长被你的精力锁死，规模上限由你一个人决定。",
        theory: "《贞观政要》：善始慎终。"
      }
    ]
  },
  {
    id: "c7b-highPotential",
    chapterId: 7,
    title: "高潜 · 组织能力的第一次沉淀",
    kind: "branch",
    context:
      "你作为高潜骨干的项目高度依赖你个人的沟通网络。你一休假，项目就停滞。",
    stake: "你要把个人关系变成团队流程。",
    options: [
      {
        label: "把关键沟通节点做成协作地图",
        summary: "让团队知道关键人、时间节点和交接责任。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -6, trust: 6, influence: 5 },
        feedback: "你把自己的网络变成了团队资产，项目第一次可以在你离开时继续运行。",
        theory: "《韩非子》：使事不相干，使士不兼官。"
      },
      {
        label: "让一位同事替代你对接",
        summary: "把关系转给最信任的同事，减少交接成本。",
        quality: "partial",
        effects: { deploy: 2 },
        resources: { energy: -5, trust: 3, influence: 2 },
        feedback: "替代者接手了，但组织仍依赖个人关系而非机制，换一个人就会断。",
        theory: "《权经》：授能干者，授忠诚者。"
      },
      {
        label: "不公开关系网络",
        summary: "保持自己在项目中的不可替代性。",
        quality: "risk",
        effects: { authority: 1 },
        resources: { energy: -3, trust: -5, influence: -4 },
        feedback: "你保住了影响力，却让项目变得脆弱，一次休假就可能停摆。",
        theory: "《贞观政要》：善始慎终。"
      }
    ]
  },
  {
    id: "c8b-parachute",
    chapterId: 8,
    title: "空降 · 危机中的第一次隔离",
    kind: "branch",
    context:
      "你作为空降管理者遭遇现金流危机。财务只给了 48 小时，团队开始恐慌。",
    stake: "你要在信息不全时先隔离风险，再寻找机会。",
    options: [
      {
        label: "先建危机作战室，分三条线处理",
        summary: "隔离风险、回款、融资三条线同时推进。",
        quality: "expert",
        effects: { structure: 3, execution: 2, recovery: 1 },
        resources: { energy: -7, trust: 6, influence: 6 },
        feedback: "你没有让恐慌扩散，而是把危机拆成可管理的任务，团队找到了抓手。",
        theory: "《矛盾论》：抓住主要矛盾，其他问题才能迎刃而解。"
      },
      {
        label: "先公开现金流缺口",
        summary: "用透明度换取团队信任，共同想办法。",
        quality: "partial",
        effects: { communication: 2, mobilize: 2 },
        resources: { energy: -6, trust: 4, influence: 2 },
        feedback: "团队开始行动，但恐慌和离职风险也被同步放大，军心开始动摇。",
        theory: "《孙子兵法》：上下同欲者胜。"
      },
      {
        label: "先让高层垫资",
        summary: "把问题交给更有资源的人。",
        quality: "risk",
        effects: { strategy: 2 },
        resources: { energy: -5, trust: -3, influence: -4 },
        feedback: "你可能拿到了钱，却把主导权也交给了别人，危机换了一种方式继续。",
        theory: "《权经》：权乃人授，授为大焉。"
      }
    ]
  },
  {
    id: "c8b-founder",
    chapterId: 8,
    title: "创业 · 危机中的第一次隔离",
    kind: "branch",
    context:
      "你作为创始人遭遇最大客户暂停付款。账上现金只够一个月，团队开始猜测公司要完。",
    stake: "你要同时解决现金流和客户关系，而不是只处理一个。",
    options: [
      {
        label: "先隔离客户问题，再盘点回款",
        summary: "把客户争议和账期问题分开，找出最快回款路径。",
        quality: "expert",
        effects: { structure: 3, execution: 2 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback: "你把危机拆成两条线，团队第一次看到现金流可以恢复的路径，恐慌开始收敛。",
        theory: "《实践论》：从感性材料上升到理性认识。"
      },
      {
        label: "全员一起砍成本",
        summary: "立即削减一切非必要支出，保住现金。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -6, trust: 2, influence: 2 },
        feedback: "成本降了，但团队也看到了你对未来的不安全感，士气开始流失。",
        theory: "《孙子兵法》：兵贵胜，不贵久。"
      },
      {
        label: "只盯最大客户道歉",
        summary: "把所有精力放在挽回客户上。",
        quality: "risk",
        effects: { communication: 2 },
        resources: { energy: -8, trust: 1, influence: 1 },
        feedback: "客户可能回来，但其他现金流风险没有被隔离，危机仍在蔓延。",
        theory: "《孙子兵法》：先为不可胜。"
      }
    ]
  },
  {
    id: "c8b-highPotential",
    chapterId: 8,
    title: "高潜 · 危机中的第一次隔离",
    kind: "branch",
    context:
      "你作为高潜骨干负责的项目被砍预算，团队和供应商同时向你要答案。",
    stake: "你要在资源收缩时保护核心交付。",
    options: [
      {
        label: "重新定义最小可行交付",
        summary: "先保住客户最需要的核心结果，再讨论扩展。",
        quality: "expert",
        effects: { structure: 3, execution: 2 },
        resources: { energy: -6, trust: 5, influence: 5 },
        feedback: "你没有让项目塌掉，而是让团队清楚知道什么必须保住，取舍变得有据。",
        theory: "德鲁克：要事优先。"
      },
      {
        label: "先向更高层争取预算",
        summary: "用项目重要性说服组织恢复资源。",
        quality: "partial",
        effects: { strategy: 2 },
        resources: { energy: -5, trust: 1, influence: 2 },
        feedback: "你可能争取到资源，但团队仍在等待答案，窗口在流失。",
        theory: "《权经》：携为上，功次之。"
      },
      {
        label: "暂停交付，等待新预算",
        summary: "避免在资源不足时承诺交付。",
        quality: "risk",
        effects: { recovery: 1 },
        resources: { energy: -3, trust: -5, influence: -4 },
        feedback: "你保护了团队，却让客户重新评估项目价值，信任开始打折。",
        theory: "《论语》：信而后劳其民。"
      }
    ]
  },
  {
    id: "c9b-parachute",
    chapterId: 9,
    title: "空降 · 成业前的最后一次选择",
    kind: "branch",
    context:
      "你作为空降管理者已证明能力。CEO 想让你进入更高层，但你知道离开会留下交接断层。",
    stake: "你要让成功在离开后延续，而不是只属于你个人。",
    options: [
      {
        label: "完成交接后再上升",
        summary: "把接班人、知识库、风险预案全部落地。",
        quality: "expert",
        effects: { stability: 3, deploy: 2 },
        resources: { energy: -7, trust: 8, influence: 8 },
        feedback: "你让组织知道你离开后依然能运行，晋升反而变得更安全，交接成了加分项。",
        theory: "《贞观政要》：善始慎终。"
      },
      {
        label: "先抓住晋升机会",
        summary: "不等待完美交接，先进入更高平台。",
        quality: "partial",
        effects: { authority: 2, execution: 2 },
        resources: { energy: -5, trust: -4, influence: 5 },
        feedback: "你抓住了机会，但组织可能因交接断层退回原样，成果难以延续。",
        theory: "《孙子兵法》：将能而君不御者胜。"
      },
      {
        label: "拒绝晋升留在原地",
        summary: "继续掌控你最熟悉的战场。",
        quality: "risk",
        effects: { stability: 2, recovery: 1 },
        resources: { energy: -3, trust: -2, influence: -6 },
        feedback: "你保住了安全区，却限制了组织的人才流动，继任者没有成长空间。",
        theory: "《权经》：权惟用，不为大也。"
      }
    ]
  },
  {
    id: "c9b-founder",
    chapterId: 9,
    title: "创业 · 成业前的最后一次选择",
    kind: "branch",
    context:
      "你作为创始人公司终于稳定，投资人想让你去做更大平台，但你担心创始团队会失控。",
    stake: "你要完成个人与组织的权力交接。",
    options: [
      {
        label: "建立创始团队决策机制",
        summary: "让方向、资源和风险由机制承接，而不是你一人。",
        quality: "expert",
        effects: { stability: 3, strategy: 2 },
        resources: { energy: -7, trust: 7, influence: 7 },
        feedback: "你把创始人控制权变成了团队治理，公司开始不依赖你也能决策，治理有了根基。",
        theory: "毛泽东《党委会的工作方法》：民主集中制。"
      },
      {
        label: "先培养一位 CEO",
        summary: "把权力交给一个可信的人，自己保留方向。",
        quality: "partial",
        effects: { deploy: 2 },
        resources: { energy: -6, trust: 3, influence: 3 },
        feedback: "你减轻了管理负担，但公司仍依赖一个人做关键判断，接班并未完成。",
        theory: "《权经》：授能干者，授忠诚者。"
      },
      {
        label: "继续亲自掌控公司",
        summary: "避免放权风险，保持创始人主导。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -7, trust: -2, influence: -2 },
        feedback: "公司稳定在你手里，但增长被你的精力锁死，规模被你的带宽限制。",
        theory: "《贞观政要》：创业难，守成更难。"
      }
    ]
  },
  {
    id: "c9b-highPotential",
    chapterId: 9,
    title: "高潜 · 成业前的最后一次选择",
    kind: "branch",
    context:
      "你即将晋升，但接替你的人还未完全准备好，项目也正处在关键节点。",
    stake: "你要安全完成交接，同时让组织看到你能承担更大责任。",
    options: [
      {
        label: "把关键决策做成交接手册",
        summary: "让接替者能通过手册理解判断依据和风险清单。",
        quality: "expert",
        effects: { stability: 3, deploy: 2 },
        resources: { energy: -6, trust: 7, influence: 6 },
        feedback: "你不仅完成了交接，还让组织第一次拥有了可传承的判断能力，经验成了资产。",
        theory: "毛泽东《党委会的工作方法》：制度建党。"
      },
      {
        label: "只带接替者做一遍关键项目",
        summary: "用实践交接代替文档。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -6, trust: 3, influence: 2 },
        feedback: "接替者学到了做法，但组织仍缺少可复用的判断规则，方法没被沉淀。",
        theory: "《权经》：授能干者，授忠诚者。"
      },
      {
        label: "先完成晋升，交接交给他人",
        summary: "不拖慢个人机会，让新负责人处理交接。",
        quality: "risk",
        effects: { authority: 1 },
        resources: { energy: -4, trust: -5, influence: -3 },
        feedback: "你抓住了机会，却让项目在交接期承受风险，交接成了空档。",
        theory: "《贞观政要》：善始慎终。"
      }
    ]
  },
  {
    id: "r1",
    chapterId: 2,
    title: "电梯偶遇",
    kind: "side",
    context:
      "周五晚上八点，你在电梯里遇到 CEO。他刚结束一场董事会，揉着眼睛问：“你接手以后，第一件要改的事是什么？”电梯门还有 12 秒就到一层。",
    stake: "你只有一句话的时间；太宏大像空谈，太具体像抱怨。",
    options: [
      {
        label: "给一个具体判断，而不是空表态",
        summary: "说出你观察到的关键矛盾，并点出下一步动作。",
        quality: "expert",
        effects: { insight: 2, communication: 2 },
        resources: { energy: -3, trust: 4, influence: 5 },
        feedback: "CEO 记住的不是你的态度，而是你能看见问题并准备行动，判断先于表态。",
        theory: "《权经》：权乃人授，授为大焉。"
      },
      {
        label: "先表达决心",
        summary: "让 CEO 看到你有信心解决问题。",
        quality: "partial",
        effects: { authority: 2 },
        resources: { energy: -2, trust: 2, influence: 2 },
        feedback: "他看到了你的信心，但没有看到具体判断，印象只是模糊的好感，很快被遗忘。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      },
      {
        label: "等电梯结束再说",
        summary: "不在公开场合谈组织问题，避免风险。",
        quality: "risk",
        effects: { strategy: 1 },
        resources: { energy: -2, trust: -1, influence: -3 },
        feedback: "谨慎保护了信息，却可能让 CEO 觉得你还没准备好接这个位子，机会擦肩而过。",
        theory: "《韩非子》：事以密成，语以泄败。"
      }
    ]
  },
  {
    id: "r2",
    chapterId: 3,
    title: "报销单异常",
    kind: "side",
    context:
      "你整理报销时发现一张金额异常大的单据：用途栏被涂改过，签名是核心骨干，日期正好是项目延期前一天。",
    stake: "单据可能只是补录错误，也可能是绕过审批的证据；在查清楚之前，任何动作都会改变信任。",
    options: [
      {
        label: "先核流程和用途，再决定是否谈话",
        summary: "先看审批链、合同和交付物，形成事实基础。",
        quality: "expert",
        effects: { structure: 3, insight: 1 },
        resources: { energy: -5, trust: 2, influence: 3 },
        feedback: "你没有让直觉变成指控，而是先把事实链闭合，判断有了可靠依据，也避免误伤。",
        theory: "《实践论》：从感性材料上升到理性认识。"
      },
      {
        label: "直接约谈核实",
        summary: "给本人解释机会，避免暗中猜疑。",
        quality: "partial",
        effects: { communication: 2 },
        resources: { energy: -4, trust: 3, influence: 1 },
        feedback: "直接沟通减少了猜疑，但你可能还没掌握足够细节，容易被反问，反而更被动。",
        theory: "《论语》：不患人之不己知，患不知人也。"
      },
      {
        label: "暂时装作没看见",
        summary: "避免破坏团队关系，等更多证据出现。",
        quality: "risk",
        effects: { recovery: 1 },
        resources: { energy: -2, trust: -2, influence: -2 },
        feedback: "你避开了冲突，但也可能让不合规行为继续发生，底线被悄悄侵蚀，代价后置。",
        theory: "《资治通鉴》：不塞隙穴，则暴雨疾风必坏。"
      }
    ]
  },
  {
    id: "r3",
    chapterId: 5,
    title: "客户深夜来电",
    kind: "side",
    context:
      "晚上 11 点，关键客户打电话说下周一要看到你们尚未准备的功能演示，并已经安排了两位高管旁听。",
    stake: "你需要在承诺、加班和真实进度之间做出选择，而不是先答应再补。",
    options: [
      {
        label: "先确认真实需求，再承诺时间",
        summary: "问清客户想看什么决策场景，再给出可验证交付。",
        quality: "expert",
        effects: { communication: 3, execution: 1 },
        resources: { energy: -4, trust: 5, influence: 4 },
        feedback: "你没有盲目答应，也没有让客户失望，而是重新定义了演示目标，把范围说清楚。",
        theory: "德鲁克：管理者的成果是贡献，不是忙碌。"
      },
      {
        label: "立即答应并组织加班",
        summary: "先让客户安心，再让团队赶制演示。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -8, trust: 2, influence: 2 },
        feedback: "客户安心了，但团队被临时承诺拖入疲劳，精力被透支，交付质量下滑。",
        theory: "《孙子兵法》：兵贵胜，不贵久。"
      },
      {
        label: "先拒绝，再约时间",
        summary: "强调时间不足，希望客户改期。",
        quality: "risk",
        effects: { authority: 1 },
        resources: { energy: -2, trust: -4, influence: -3 },
        feedback: "你保护了团队，却可能让关键客户重新评估合作关系，机会在流失，信任降温。",
        theory: "《论语》：信而后劳其民。"
      }
    ]
  },
  {
    id: "r4",
    chapterId: 6,
    title: "办公区流言",
    kind: "side",
    context:
      "你路过茶水间，听见三个人在传“下个月要裁掉整个业务组”。消息源头不明，但已经有人开始更新简历。",
    stake: "流言不会自己消失；你的回应要同时处理事实和情绪。",
    options: [
      {
        label: "用公开信息澄清，并解释决策原则",
        summary: "不点名字，但明确组织现在真正在做什么。",
        quality: "expert",
        effects: { communication: 3, mobilize: 2 },
        resources: { energy: -5, trust: 6, influence: 5 },
        feedback: "你没有追查传话人，而是用透明信息切断了恐慌，流言失去了土壤，人心重新安定。",
        theory: "毛泽东《党委会的工作方法》：互通情报，取得共同语言。"
      },
      {
        label: "让直属主管分别安抚",
        summary: "避免公开回应，让管理层私下解释。",
        quality: "partial",
        effects: { deploy: 2 },
        resources: { energy: -4, trust: 2, influence: 2 },
        feedback: "团队暂时稳定，但不同主管说法不一，信息开始失真，信任被打折，裂痕暗生。",
        theory: "《韩非子》：明主之道，使智者尽其虑。"
      },
      {
        label: "不回应，让流言自然过去",
        summary: "认为越回应越容易强化传闻。",
        quality: "risk",
        effects: { recovery: 1 },
        resources: { energy: -2, trust: -5, influence: -3 },
        feedback: "流言没有自动消失，反而在沉默中变得更加可信，人心开始浮动，更新简历的人更多。",
        theory: "《论语》：不患人之不己知，患不知人也。"
      }
    ]
  },
  {
    id: "r5",
    chapterId: 8,
    title: "复盘会被问难",
    kind: "side",
    context:
      "季度复盘会上，一位资深负责人把电脑转向大家，列出你上任以来四项未兑现的承诺，问：“你的变革到底带来了什么？”",
    stake: "数据摆在面前，现场等着你回答；躲闪会让问题显得更真实。",
    options: [
      {
        label: "用数据回应，同时承认未完成项",
        summary: "给出可验证的成果，也坦诚还有哪些没做好。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -6, trust: 6, influence: 5 },
        feedback: "你既没有防御，也没有空谈，团队开始接受复杂真实的结果，信任在回升。",
        theory: "《实践论》：错误常常是正确的先导。"
      },
      {
        label: "把问题转给团队代表回答",
        summary: "让一线负责人说明实际变化，避免自我辩护。",
        quality: "partial",
        effects: { deploy: 2 },
        resources: { energy: -4, trust: 2, influence: 2 },
        feedback: "你展示了团队能力，但资深负责人可能觉得你在回避，质疑没有真正落地，问题悬空。",
        theory: "《权经》：权惟用，不为大也。"
      },
      {
        label: "现场反击提问者",
        summary: "强调对方也没有带来成果。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -4, trust: -6, influence: -2 },
        feedback: "你赢得了场面，却输掉了复盘会最重要的信任，问题被压得更深，还会再次爆发。",
        theory: "《孙子兵法》：致人而不致于人，但不能以伤人为目的。"
      }
    ]
  },
  {
    id: "r6",
    chapterId: 9,
    title: "离职面谈",
    kind: "side",
    context:
      "你重点培养的骨干提出离职，理由是“成长到头了”。你知道他最近两次竞聘都没有被推荐，推荐名单里有你的两位亲信。",
    stake: "离职面谈里最危险的不是留人，而是让他说出真实原因后你接不住。",
    options: [
      {
        label: "帮他规划下一步挑战",
        summary: "不急着挽留，而是先确认他想要的成长到底是什么。",
        quality: "expert",
        effects: { deploy: 3, communication: 2 },
        resources: { energy: -5, trust: 7, influence: 4 },
        feedback: "你把人看得比留住人更重要，他反而开始考虑留下，成长被重新定义，留任有了理由。",
        theory: "德鲁克：用人之所长，让人才持续成长。"
      },
      {
        label: "用新项目留住他",
        summary: "立即给他更有挑战的岗位和资源。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -4, trust: 3, influence: 2 },
        feedback: "他暂时留了下来，但下一次成长瓶颈会更快出现，治标不治本，怨气在积累。",
        theory: "《贞观政要》：用非其才，必难致治。"
      },
      {
        label: "直接批准离职",
        summary: "尊重选择，不增加挽留成本。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -3, trust: -3, influence: -3 },
        feedback: "你没有制造阻力，但也可能错过了一个本可重新激活的高潜人才，培养白费。",
        theory: "《人物志》：审其变而见其性。"
      }
    ]
  },
  {
    id: "r7",
    chapterId: 2,
    title: "会议室的临时提问",
    kind: "side",
    context:
      "高层会上，你被临时要求解释一项你只看过摘要的数据。你面前没有完整报告，旁边有人开始翻手机，等待你出错。",
    stake: "承认不知道会显得准备不足，编数据会毁掉可信度；你需要给出诚实且可追踪的回答。",
    options: [
      {
        label: "先讲已知事实，再公开补数据时限",
        summary: "明确区分“已确认”和“待核实”，并给一个可验证时间。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -5, trust: 5, influence: 5 },
        feedback: "你没有假装全知，也没有失控，高层开始信任你的信息边界，也信你的诚实。",
        theory: "《实践论》：从感性材料上升到理性认识，不能跳过事实。"
      },
      {
        label: "先给一个看似肯定的答案",
        summary: "用直觉先回应，避免显得准备不足。",
        quality: "partial",
        effects: { authority: 2 },
        resources: { energy: -3, trust: -3, influence: 2 },
        feedback: "会议暂时过去了，但数据被证伪时，你的可信度会被双倍消耗，难以修复。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      },
      {
        label: "现场反问提问者数据来源",
        summary: "把问题抛回给提问者，转移压力。",
        quality: "risk",
        effects: { strategy: 2 },
        resources: { energy: -4, trust: -5, influence: -2 },
        feedback: "你暂时避开了提问，但也让其他人看到你缺乏数据准备，专业形象受损，信用透支。",
        theory: "《权经》：揣为上，事次之。"
      }
    ]
  },
  {
    id: "r8",
    chapterId: 4,
    title: "新人越权答复客户",
    kind: "side",
    context:
      "新人当着客户的面承诺了团队尚未确认的交付时间，客户已经按这个时间安排了内部排期。新人意识到问题后不敢告诉你。",
    stake: "你要保护新人表达勇气，也要守住对外承诺的一致性。",
    options: [
      {
        label: "先确认交付可行性，再带新人一起对齐",
        summary: "先核实内部是否真能做到，再决定如何调整客户预期。",
        quality: "expert",
        effects: { deploy: 3, structure: 1 },
        resources: { energy: -6, trust: 5, influence: 5 },
        feedback: "你没有在客户面前否定新人，也没有让承诺失控，团队学会了如何处理越权。",
        theory: "《韩非子·用人》：使事不相干，使士不兼官。"
      },
      {
        label: "当场纠正新人的承诺",
        summary: "在客户面前明确说这个时间不能确认。",
        quality: "partial",
        effects: { authority: 2, communication: 1 },
        resources: { energy: -4, trust: -5, influence: 3 },
        feedback: "客户看到了你的严谨，但新人在客户面前失去了信任，表达勇气受挫，之后不敢开口。",
        theory: "《论语》：君子信而后劳其民。"
      },
      {
        label: "先按新人的承诺执行",
        summary: "不推翻承诺，用加班把时间追回来。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -10, trust: -2, influence: 1 },
        feedback: "这次承诺可能保住了，但团队为越权承诺支付了高昂精力，士气和预算都受损。",
        theory: "《孙子兵法》：兵贵胜，不贵久。"
      }
    ]
  },
  {
    id: "r9",
    chapterId: 7,
    title: "项目延期前的沉默",
    kind: "side",
    context:
      "你从两个独立渠道听说关键项目大概率延期，但项目负责人还没有正式汇报。他最近一直避免和你单独开会。",
    stake: "等待正式汇报会让你失去干预窗口，主动追问又可能被视为不信任。",
    options: [
      {
        label: "主动召集一次风险复盘",
        summary: "不等正式汇报，先让团队把风险摆到桌面上。",
        quality: "expert",
        effects: { mobilize: 3, structure: 2 },
        resources: { energy: -6, trust: 6, influence: 4 },
        feedback: "你打断了“报喜不报忧”的默认规则，延期风险开始被真实管理，干预窗口打开。",
        theory: "《孙子兵法》：上下同欲者胜。"
      },
      {
        label: "先私下问项目负责人",
        summary: "避免公开制造压力，先了解真实原因。",
        quality: "partial",
        effects: { communication: 2 },
        resources: { energy: -4, trust: 2, influence: 2 },
        feedback: "你了解了真相，但团队其他成员仍不知道风险正在升级，信息没有对齐，容易误判。",
        theory: "《韩非子》：事以密成，语以泄败。"
      },
      {
        label: "继续等待正式汇报",
        summary: "尊重汇报链路，不越级介入。",
        quality: "risk",
        effects: { recovery: 1 },
        resources: { energy: -2, trust: -3, influence: -3 },
        feedback: "你遵守了流程，却让延期风险在沉默中继续扩大，干预窗口关闭，只剩被动兜底。",
        theory: "《资治通鉴》：不塞隙穴，则暴雨疾风必坏。"
      }
    ]
  },
  {
    id: "r10",
    chapterId: 5,
    title: "客户要私下回扣",
    kind: "random",
    context:
      "关键客户在饭桌上提出：价格再降 5%，他可以“私下感谢”你个人。他说这话时服务员刚好离开，没有留下任何记录。",
    stake: "没有记录不等于没有后果；你的回应会被客户当成组织底线的样本。",
    options: [
      {
        label: "明确拒绝，并提出合规优惠方案",
        summary: "守住底线，同时给出一个可公开的商务方案。",
        quality: "expert",
        effects: { authority: 3, structure: 2 },
        resources: { energy: -5, trust: 5, influence: 4 },
        feedback: "你拒绝了灰色空间，但保住了长期合作与组织安全，底线被客户尊重，关系反而更稳。",
        theory: "《论语》：君子爱财，取之有道。"
      },
      {
        label: "先拖住，再让商务负责人处理",
        summary: "不直接表态，把问题转给专业团队。",
        quality: "partial",
        effects: { communication: 2 },
        resources: { energy: -4, trust: 2, influence: 2 },
        feedback: "你避免了直接冲突，但客户可能把沉默当成默许，边界被模糊，风险转移给你。",
        theory: "《权经》：权惟用，不为大也。"
      },
      {
        label: "接受私下安排保订单",
        summary: "先保住业绩，再想办法处理风险。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -4, trust: -8, influence: 2 },
        feedback: "订单暂时保住了，但组织风险已经转移到你个人身上，代价迟早显现，无法洗清。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      }
    ]
  },
  {
    id: "r11",
    chapterId: 3,
    title: "老员工公开质疑新人",
    kind: "random",
    context:
      "周会上，老员工指着新来的高潜员工说：“这种方案只有关系户才写得出来。”会议室里有人附和，有人低头。",
    stake: "你处理的不只是两个人，而是团队是否允许公开羞辱成为默认语言。",
    options: [
      {
        label: "叫停质疑，重新用事实评价",
        summary: "不点名批评，把讨论拉回业绩与行为证据。",
        quality: "expert",
        effects: { mobilize: 3, communication: 2 },
        resources: { energy: -5, trust: 7, influence: 5 },
        feedback: "你保护了新人，也教会老员工用证据而非身份评价人，语言开始规范，羞辱不再被默认。",
        theory: "《人物志》：观其外而知其内，察其行而辨其品。"
      },
      {
        label: "私下再处理老员工",
        summary: "不公开打断，避免会议失控。",
        quality: "partial",
        effects: { authority: 2 },
        resources: { energy: -4, trust: -3, influence: 2 },
        feedback: "场面没失控，但新人已经公开受伤，下一次更难开口，勇气受损，离职念头萌生。",
        theory: "《论语》：君子成人之美，不成人之恶。"
      },
      {
        label: "让新人当场证明自己",
        summary: "要求新人用业绩回应质疑。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -4, trust: -5, influence: -2 },
        feedback: "新人被逼到证明自己的位置，团队开始把公开羞辱当成正常管理，风气更坏。",
        theory: "《孙子兵法》：上下同欲者胜。"
      }
    ]
  },
  {
    id: "r12",
    chapterId: 8,
    title: "投资人要求裁员",
    kind: "random",
    context:
      "投资人明确表示：不裁掉某个部门就暂缓下一轮投资。你知道那个部门里三个关键人才正在负责明年最重要的项目。",
    stake: "短期生存和长期能力同时摆上台面；你的方案必须让投资人和团队都看到取舍依据。",
    options: [
      {
        label: "重新测算成本结构，提出替代方案",
        summary: "不直接接受裁员，先找出真正浪费的部分。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback: "你没有用短期裁员掩盖真实问题，投资人开始看到你的经营判断，愿意继续下注。",
        theory: "《卓有成效的管理者》：把资源集中在真正重要的任务上。"
      },
      {
        label: "先裁掉部分岗位回应投资人",
        summary: "用行动证明你愿意降本，保住下一轮融资。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -6, trust: -6, influence: 3 },
        feedback: "融资暂时保住了，但组织开始担心你是谁都能砍的人，忠诚在流失，骨干开始观望。",
        theory: "《权经》：权惟用，不为大也。"
      },
      {
        label: "拒绝裁员并准备放弃融资",
        summary: "坚持长期能力，不向投资人妥协。",
        quality: "risk",
        effects: { authority: 2, recovery: 1 },
        resources: { energy: -5, trust: 2, influence: -5 },
        feedback: "你守住了组织价值，但现金流风险可能压垮整个公司，赌注太大，生死一线。",
        theory: "《孙子兵法》：善战者，先为不可胜。"
      }
    ]
  },
  {
    id: "r13",
    chapterId: 5,
    title: "预算突然被砍",
    kind: "random",
    context:
      "季度中段，财务在周三下班后通知你：项目预算砍掉 30%，原因是集团要集中现金，没有提前预警。团队已经按原计划投入三周，三个外包合同下周一就要续签。",
    stake: "你要在两天内重新定义交付范围，同时让团队看到砍预算不是砍价值。",
    options: [
      {
        label: "重排范围并明确不可砍项",
        summary: "用关键结果反推必须保留的部分，主动汇报取舍。",
        quality: "expert",
        effects: { structure: 3, execution: 2 },
        resources: { energy: -6, trust: 4, influence: 5 },
        feedback: "你没有被动接受砍预算，而是让高层看到你如何管理取舍，专业得到认可，话语权上升。",
        theory: "德鲁克：把资源集中在真正重要的少数任务上。"
      },
      {
        label: "先按原计划做，再补预算",
        summary: "暂时不改变范围，期望业绩能换回预算。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -8, trust: -2, influence: 1 },
        feedback: "团队继续冲刺，但资源缺口会很快变成交付风险，问题被延后，月底更难收场。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      },
      {
        label: "直接暂停项目",
        summary: "以预算不足为由暂停，避免仓促交付。",
        quality: "risk",
        effects: { authority: 1 },
        resources: { energy: -4, trust: -5, influence: -4 },
        feedback: "你避免了乱做，但高层可能认为你缺少在约束下推进的能力，机会减少。",
        theory: "《权经》：权惟用，不为大也。"
      }
    ]
  },
  {
    id: "r14",
    chapterId: 2,
    title: "有人打小报告",
    kind: "random",
    context:
      "你从一位关系不错的高管那里听说，有人向 CEO 汇报你在上周会议上“打压不同意见”。你确实打断了两次发言，但都是为了把讨论拉回议程。",
    stake: "你要处理的是别人感受到的真相；只证明自己没打压，反而会让感受变成事实。",
    options: [
      {
        label: "主动向 CEO 澄清事实",
        summary: "不带指责地说明会议场景，并承认表达方式可改进。",
        quality: "expert",
        effects: { communication: 3, authority: 1 },
        resources: { energy: -5, trust: 5, influence: 5 },
        feedback: "你没有追查告密者，而是直接消除了信息差，误会没有发酵，信任反而加固。",
        theory: "毛泽东《党委会的工作方法》：互通情报，取得共同语言。"
      },
      {
        label: "找会议参与者核实",
        summary: "先确认当时真实发生了什么，再决定是否回应。",
        quality: "partial",
        effects: { structure: 2 },
        resources: { energy: -6, trust: 2, influence: 2 },
        feedback: "你掌握了事实，但 CEO 可能已经形成了初步判断，被动已经形成，解释更难。",
        theory: "《实践论》：从感性材料上升到理性认识。"
      },
      {
        label: "忽略谣言，继续做好事",
        summary: "认为只要结果好，误解会自然消失。",
        quality: "risk",
        effects: { recovery: 1 },
        resources: { energy: -3, trust: -3, influence: -3 },
        feedback: "误解不会自动消失，反而会在沉默中变成默认结论，形象被固化，很难扭转。",
        theory: "《论语》：不患人之不己知，患不知人也。"
      }
    ]
  },
  {
    id: "r15",
    chapterId: 4,
    title: "客户要你的个人手机号",
    kind: "random",
    context:
      "季度评审会上，关键客户当众说：“把你手机号给我，以后有事直接找你。”会议室里有人微笑，有人看你团队的反应。",
    stake: "你的回应会定义客户和组织之间的协作边界：是绕开团队，还是尊重流程。",
    options: [
      {
        label: "提供专属支持群，不提供私人号码",
        summary: "给客户更直接的响应入口，同时保留组织边界。",
        quality: "expert",
        effects: { communication: 3, authority: 1 },
        resources: { energy: -4, trust: 6, influence: 5 },
        feedback: "客户得到了便利，团队也没有被绕开，边界反而更清晰，协作更有章法。",
        theory: "《韩非子》：使事不相干，使士不兼官。"
      },
      {
        label: "当场给他号码",
        summary: "先满足客户，私下再说明哪些事找谁。",
        quality: "partial",
        effects: { communication: 2 },
        resources: { energy: -5, trust: 3, influence: -2 },
        feedback: "客户满意了，但团队开始不确定谁才是真正的接口，流程被绕过，权责混乱。",
        theory: "《权经》：权乃人授，授为大焉。"
      },
      {
        label: "拒绝并强调流程",
        summary: "明确所有问题必须通过团队接口。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -3, trust: -5, influence: -3 },
        feedback: "你守住了流程，却可能让客户觉得你不够重视，关系降温，续约出现变数。",
        theory: "《论语》：君子信而后劳其民。"
      }
    ]
  },
  {
    id: "r16",
    chapterId: 6,
    title: "新流程没人执行",
    kind: "random",
    context:
      "你花两周设计的新流程上线两周，使用率不足 20%。没有人在会上反对，也没有人提交改进意见，但大家继续用旧表格。",
    stake: "沉默执行比公开反对更难处理；你需要找到流程为什么没进入大家的工作习惯。",
    options: [
      {
        label: "访谈一线执行者找卡点",
        summary: "不追责，先找出流程与真实工作之间的冲突。",
        quality: "expert",
        effects: { insight: 3, structure: 2 },
        resources: { energy: -6, trust: 6, influence: 4 },
        feedback: "你发现流程缺少两个关键节点，而不是团队不愿执行，问题被精准定位，改起来有的放矢。",
        theory: "《实践论》：从实践中找规律。"
      },
      {
        label: "增加强制检查节点",
        summary: "用系统卡点保证流程必须被执行。",
        quality: "partial",
        effects: { authority: 2, execution: 1 },
        resources: { energy: -5, trust: -3, influence: 3 },
        feedback: "执行率上升了，但团队开始用绕过系统的方式完成工作，形式大于实质，数据失真。",
        theory: "《韩非子》：法度既立，虽庸主可治。"
      },
      {
        label: "再发一次全员通知",
        summary: "强调新流程的重要性，要求各部门重视。",
        quality: "risk",
        effects: { communication: 1 },
        resources: { energy: -3, trust: -2, influence: -2 },
        feedback: "通知越多，团队越觉得这是形式主义，执行意愿更低，流程被架空。",
        theory: "《论语》：不患人之不己知，患不知人也。"
      }
    ]
  },
  {
    id: "r17",
    chapterId: 7,
    title: "核心员工要转岗",
    kind: "random",
    context:
      "你最重要的项目骨干申请转岗到新业务部门，理由是“想接触新业务”。你知道他一走，交付至少要延期一个月。",
    stake: "你要判断他是被新机会吸引，还是在借转岗表达对现状的不满。",
    options: [
      {
        label: "为他设计内部成长路径",
        summary: "在项目内给他新的判断空间，满足成长需求。",
        quality: "expert",
        effects: { deploy: 3, communication: 2 },
        resources: { energy: -6, trust: 7, influence: 5 },
        feedback: "你把他想离开的动机转成了组织可用的成长设计，双赢有了抓手，离职冲动消解。",
        theory: "德鲁克：用人之所长，让人才持续成长。"
      },
      {
        label: "用晋升挽留他",
        summary: "先给职位和薪资，让他继续留任。",
        quality: "partial",
        effects: { authority: 2 },
        resources: { energy: -5, trust: 3, influence: 2 },
        feedback: "他暂时留下了，但下次遇到成长瓶颈会更难处理，问题只是推迟，不满会升级。",
        theory: "《贞观政要》：用非其才，必难致治。"
      },
      {
        label: "立即批准转岗",
        summary: "尊重选择，尽快启动交接。",
        quality: "risk",
        effects: { recovery: 1 },
        resources: { energy: -3, trust: -4, influence: -3 },
        feedback: "你避免了拉扯，但项目延期风险没有提前化解，空档已经形成，交付被动。",
        theory: "《人物志》：审其变而见其性。"
      }
    ]
  },
  {
    id: "r18",
    chapterId: 8,
    title: "媒体负面报道",
    kind: "random",
    context:
      "一篇行业媒体报道了你公司的负面消息，其中引用的数据是三个月前的旧版本。客户群里已经开始转发，销售团队下午连开三场安抚会。",
    stake: "澄清要快，但不能只有辟谣；客户更想看到组织如何处理信息。",
    options: [
      {
        label: "先内部核实，再统一回应",
        summary: "不急于反驳，先确认哪些事实是真的。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback: "你没有让危机被情绪放大，而是用事实重新建立控制，舆论开始转向，客户安定下来。",
        theory: "《实践论》：从感性材料上升到理性认识。"
      },
      {
        label: "立即发布官方澄清",
        summary: "快速否认失实内容，防止客户误解。",
        quality: "partial",
        effects: { authority: 2 },
        resources: { energy: -5, trust: -3, influence: 3 },
        feedback: "回应很快，但如果内部还有未核实的问题，会被进一步放大，公信力打折。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      },
      {
        label: "保持沉默，等热度过去",
        summary: "不回应媒体报道，让事件自然降温。",
        quality: "risk",
        effects: { recovery: 1 },
        resources: { energy: -3, trust: -5, influence: -5 },
        feedback: "沉默让失实内容看起来更像真相，客户开始主动询问，被动加剧，事态升级。",
        theory: "《论语》：不患人之不己知，患不知人也。"
      }
    ]
  },
  {
    id: "r19",
    chapterId: 3,
    title: "供应商要求提前付款",
    kind: "random",
    context:
      "合作三年的关键供应商突然要求账期从 60 天缩到 30 天，否则暂停供货。你打听到对方最近听到了一些关于公司现金流的传闻。",
    stake: "现金流与供应链稳定不能二选一；你要先判断传闻从哪里来，再决定给什么承诺。",
    options: [
      {
        label: "核实付款能力和替代供应商",
        summary: "先掌握财务与备选方案，再决定是否让步。",
        quality: "expert",
        effects: { structure: 3, execution: 2 },
        resources: { energy: -6, trust: 3, influence: 5 },
        feedback: "你没有被要挟，也没有忽视风险，供应链主动权回到你手里，传闻不攻自破。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      },
      {
        label: "接受提前付款保供应",
        summary: "先满足供应商要求，避免生产中断。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -5, trust: 2, influence: -2 },
        feedback: "供应保住了，但其他供应商可能开始提出同样要求，连锁反应，现金流吃紧。",
        theory: "《权经》：权惟用，不为大也。"
      },
      {
        label: "拒绝让步，寻找新供应商",
        summary: "坚持原账期，宁可更换供应商。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -7, trust: -4, influence: 1 },
        feedback: "你守住了账期，但切换供应商的时间和风险可能更大，代价被低估，停产更贵。",
        theory: "《孙子兵法》：善战者，求之于势。"
      }
    ]
  },
  {
    id: "r20",
    chapterId: 9,
    title: "CEO 临时要你接手新业务",
    kind: "random",
    context:
      "CEO 在周五下班前要求你下周接手一个高风险新业务，同时保留现有职责。你刚完成一次重要交接，团队还没站稳。",
    stake: "承接新机会和守住现有成果不能靠口头承诺；你要先想清楚自己的精力边界。",
    options: [
      {
        label: "先确认新业务边界和退出条件",
        summary: "不拒绝机会，但把资源、授权和止损标准谈清楚。",
        quality: "expert",
        effects: { strategy: 3, authority: 2 },
        resources: { energy: -7, trust: 6, influence: 6 },
        feedback: "你没有简单接受，也没有拒绝，而是让新业务变成可管理的任务，边界清晰。",
        theory: "《权经》：权乃人授，授为大焉。"
      },
      {
        label: "立即接受并全力投入",
        summary: "先接住机会，再调整现有工作。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -9, trust: 3, influence: 3 },
        feedback: "你展示了担当，但现有职责可能开始出现风险，精力被稀释，两头都难顾好。",
        theory: "《孙子兵法》：兵贵胜，不贵久。"
      },
      {
        label: "拒绝接手",
        summary: "明确说明精力已满，要求只保留现有职责。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -3, trust: -6, influence: -4 },
        feedback: "你保护了自己，但高层可能认为你缺乏承担更大责任的意愿，晋升受阻。",
        theory: "《论语》：君子求诸己，小人求诸人。"
      }
    ]
  },
  {
    id: "r21",
    chapterId: 4,
    title: "跨部门抢功",
    kind: "random",
    context:
      "你们推动半年的项目初见成效，另一个部门却把成果写进自己的月报，还删掉了你们的名字。团队要求你公开澄清。",
    stake: "澄清会赢回功劳但可能撕破协作；不澄清会让团队寒心。你需要第三条路。",
    options: [
      {
        label: "把贡献写进共享机制",
        summary: "建立联合功劳记录，让双方都看到贡献，而不是互相拆台。",
        quality: "expert",
        effects: { communication: 3, mobilize: 2 },
        resources: { energy: -6, trust: 6, influence: 6 },
        feedback: "你没有把抢功变成战争，而是让功劳变成可共享的资产，协作反而加深，名声更稳。",
        theory: "《论语》：君子成人之美，不成人之恶。"
      },
      {
        label: "公开纠正对方的月报",
        summary: "在会上说明真实贡献，避免团队士气受损。",
        quality: "partial",
        effects: { authority: 2 },
        resources: { energy: -5, trust: -4, influence: 4 },
        feedback: "功劳澄清了，但对方部门从此开始防备你们，协作变冷，下一次更难配合。",
        theory: "《孙子兵法》：令之以文，齐之以武。"
      },
      {
        label: "暂时忍让",
        summary: "先专注交付，功劳以后再说。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -3, trust: -3, influence: -5 },
        feedback: "团队觉得你不够硬气，跨部门功劳从此开始失衡，士气受损，人心开始散。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      }
    ]
  },
  {
    id: "r22",
    chapterId: 3,
    title: "空降骨干被排挤",
    kind: "random",
    context:
      "你空降带来的新骨干连续三周收不到会议邀请，信息同步群里没有他，项目文档共享权限也“忘记”添加。他还没有向你抱怨。",
    stake: "排挤很少大声发生；你要在不公开站队的前提下，让团队看到协作是规则不是恩惠。",
    options: [
      {
        label: "用共同任务重建协作",
        summary: "让新老成员在同一个关键任务里互为依赖，而不是先谈感情。",
        quality: "expert",
        effects: { deploy: 3, communication: 2 },
        resources: { energy: -7, trust: 6, influence: 5 },
        feedback: "协作从任务开始重建，老员工看到了新骨干的真实价值，排斥被化解，融合加速。",
        theory: "《贞观政要》：舍短取长，各尽其能。"
      },
      {
        label: "单独给新骨干立威",
        summary: "公开授权新骨干，让老员工知道位置不可动摇。",
        quality: "partial",
        effects: { authority: 3 },
        resources: { energy: -5, trust: -6, influence: 4 },
        feedback: "位置稳了，但老员工把排挤转到了更隐蔽的层面，问题更难查，暗流涌动。",
        theory: "《韩非子》：明主之道，使智者尽其虑。"
      },
      {
        label: "把新骨干调去别的组",
        summary: "避免冲突，重新安排岗位。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -3, trust: -4, influence: -4 },
        feedback: "冲突暂时消失，但组织学会了用换人回避管理问题，病根没除，还会复发。",
        theory: "《资治通鉴》：防微杜渐。"
      }
    ]
  },
  {
    id: "r23",
    chapterId: 6,
    title: "供应商回扣线索",
    kind: "random",
    context:
      "财务经理深夜发来一张对账单：同一家供应商连续 18 个月在月初被优先付款，但采购记录里找不到比价流程。她说“我只能发这一次”。",
    stake: "腐败线索最怕打草惊蛇；你要先保护证据链，再决定由谁调查。",
    options: [
      {
        label: "用审计闭环收集证据",
        summary: "把异常对账单放进独立审计，先查清事实再处理。",
        quality: "expert",
        effects: { structure: 3, authority: 2 },
        resources: { energy: -8, trust: 5, influence: 7 },
        feedback: "你没有靠猜测定罪，而是让证据和流程替你说话，组织反而更信任你，调查更顺利。",
        theory: "《韩非子》：法度既立，虽庸主可治。"
      },
      {
        label: "立即约谈采购负责人",
        summary: "当面施压，逼对方交代。",
        quality: "partial",
        effects: { authority: 3 },
        resources: { energy: -5, trust: -3, influence: 2 },
        feedback: "对方否认并开始销毁痕迹，你失去了取证的主动权，线索中断，证据更难找。",
        theory: "《孙子兵法》：致人而不致于人。"
      },
      {
        label: "当作流言不予处理",
        summary: "证据不足，先不惊动任何人。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -2, trust: -6, influence: -5 },
        feedback: "流言传开后，组织开始怀疑你在包庇，底线问题变得模糊，公信受损，信任崩盘。",
        theory: "《论语》：君子求诸己，小人求诸人。"
      }
    ]
  },
  {
    id: "r24",
    chapterId: 7,
    title: "团队公开反对新考核",
    kind: "random",
    context:
      "新的绩效考核方案在全员会上被公开反对：有人指出标准里没有客观数据，有人担心奖金池会被“打折”。你本来打算下周一正式发布。",
    stake: "撤回会让方案失去权威，强压会让团队失去信任；你要让标准本身先被检验。",
    options: [
      {
        label: "先公布算法与试运行数据",
        summary: "把评分逻辑和模拟结果公开，用一个月试运行收集反馈。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -7, trust: 7, influence: 5 },
        feedback: "反对变成了改进意见，考核标准第一次获得团队背书，阻力变成共建，方案更稳。",
        theory: "《贞观政要》：善始慎终，取信于人。"
      },
      {
        label: "坚持推行并重申规则",
        summary: "明确改革不会因为反对而停止。",
        quality: "partial",
        effects: { authority: 3 },
        resources: { energy: -5, trust: -6, influence: 3 },
        feedback: "方案落地了，但团队开始用最低标准应付考核，执行走样，激励失效。",
        theory: "《孙子兵法》：齐之以武，也要令之以文。"
      },
      {
        label: "撤回方案重新调研",
        summary: "先平息情绪，标准问题交给以后。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -4, trust: 2, influence: -6 },
        feedback: "情绪平了，但下一次改革会面对同样的不信任，权威受损，退让成了习惯。",
        theory: "《孙子兵法》：不可胜在己，可胜在敌。"
      }
    ]
  },
  {
    id: "r25",
    chapterId: 8,
    title: "客户临时砍单",
    kind: "random",
    context:
      "最大客户在季度末把下季度订单砍掉 40%，理由是预算调整。销售团队准备明天集体登门求情，财务提醒你客户三个月前刚换了采购负责人。",
    stake: "砍单背后往往有真实原因；求情不是第一步，先搞清是预算、关系还是产品问题。",
    options: [
      {
        label: "先访谈客户内部关键人",
        summary: "找到预算调整的真实决策链，再决定如何回应。",
        quality: "expert",
        effects: { insight: 3, strategy: 2 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback: "你发现砍单来自一位新财务负责人，并找到了重新合作的切口，问题被定位，挽回有方向。",
        theory: "《人物志》：观察人在不同情境中的取舍，才能看见真实动机。"
      },
      {
        label: "带全队上门求情",
        summary: "用诚意打动客户，争取挽回订单。",
        quality: "partial",
        effects: { communication: 2 },
        resources: { energy: -6, trust: 3, influence: -3 },
        feedback: "诚意到了，但你没有拿到真实原因，下次砍单仍会发生，治标不治本，隐患仍在。",
        theory: "《论语》：不患人之不己知，患不知人也。"
      },
      {
        label: "接受砍单并立刻压成本",
        summary: "快速调整预算，不再追问原因。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -5, trust: -3, influence: -5 },
        feedback: "数字暂时对齐，但系统性问题被掩盖了，风险还在积累，下次更猛烈。",
        theory: "《孙子兵法》：先为不可胜。"
      }
    ]
  },
  {
    id: "r26",
    chapterId: 9,
    title: "离职骨干回归",
    kind: "random",
    context:
      "一年前离职的骨干带着新经验和行业资源回来，提出希望重新加入。原团队已经有人顶替了他的位置，新人刚做完一轮完整的项目交付。",
    stake: "回归不能只靠旧情；你要让新旧人才都看到公平的成长通道，而不是把回归变成对现任者的否定。",
    options: [
      {
        label: "设计双通道成长路径",
        summary: "让回归者与现有人才各有主攻，避免零和竞争。",
        quality: "expert",
        effects: { deploy: 3, stability: 2 },
        resources: { energy: -8, trust: 6, influence: 6 },
        feedback: "回归者带来了资源，现有人才也没有被挤掉，组织第一次有了真正的梯队。",
        theory: "《贞观政要》：创业难，守成更难，关键在于持续担当。"
      },
      {
        label: "直接恢复原职",
        summary: "用原有职位表达诚意，让团队配合调整。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -5, trust: -6, influence: 2 },
        feedback: "回归者到位了，但顶替者失去信心，团队开始动荡，稳定被破坏，人心失衡。",
        theory: "《韩非子》：用人之道，贵在明白责任。"
      },
      {
        label: "婉拒并保持联系",
        summary: "避免破坏现有团队，把回归者当外部资源。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -3, trust: 3, influence: -6 },
        feedback: "团队稳定了，但你失去了把外部资源内化的机会，成长被错过，梯队难补。",
        theory: "《孙子兵法》：善战者，求之于势。"
      }
    ]
  },
  {
    id: "r27",
    chapterId: 4,
    title: "方案提前泄露",
    kind: "random",
    context:
      "你准备在周四公布的重组方案，周三下午出现在另一个部门的群聊里。版本带水印，说明源头一定在内部，但还没有人承认。",
    stake: "追责不是重点；重点是让团队看到信息泄漏不会成为下一次变革的绊脚石。",
    options: [
      {
        label: "把方案改成两个可切换版本再公布",
        summary: "保留关键调整，把确定性信息与试探信息分开，观察泄漏路径。",
        quality: "expert",
        effects: { structure: 3, strategy: 2 },
        resources: { energy: -7, trust: 6, influence: 6 },
        feedback: "你没有先追责，而是让方案本身获得抗泄漏能力，下一次披露有了可控的验证窗口。",
        theory: "《韩非子》：事以密成，语以泄败。"
      },
      {
        label: "当众宣布彻查泄密者",
        summary: "用明确姿态立威，让所有人知道信息边界不可触碰。",
        quality: "partial",
        effects: { authority: 3 },
        resources: { energy: -5, trust: -6, influence: 4 },
        feedback: "威慑立住了，但大家开始用更隐蔽的方式传消息，信息流反而更难看见，隐患更深。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      },
      {
        label: "推迟方案并等待内部自净",
        summary: "先不公布，等泄漏源自然暴露。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -4, trust: 2, influence: -5 },
        feedback: "你保住了短期平静，却让方案失去窗口期，下一次变化会更被动，主动权流失，代价更大。",
        theory: "《论语》：不患人之不己知，患不知人也。"
      }
    ]
  },
  {
    id: "r28",
    chapterId: 2,
    title: "前任留下的人情清单",
    kind: "random",
    context:
      "交接时，前任留下一份私密文档：谁欠他人情、谁曾承诺配合新负责人、谁在关键会议上有过背叛。行政主管暗示这份清单比组织架构图更准。",
    stake: "人情账是真实资源，但直接使用它，你会成为前任政治的延续。",
    options: [
      {
        label: "把人情清单翻译成合作地图",
        summary: "拆出每个人愿意配合的成果条件，而不是欠债关系，让清单变成可验证的合作资源。",
        quality: "expert",
        effects: { insight: 3, communication: 2 },
        resources: { energy: -7, trust: 6, influence: 6 },
        feedback: "你借用了信息，却没有继承前任的人情债，第一次把历史资源变成中性资产。",
        theory: "《人物志》：观其变而见其性，察其安而知其志。"
      },
      {
        label: "私下核对清单并逐一拜访",
        summary: "先确认每条人情的真实性，再决定如何使用。",
        quality: "partial",
        effects: { strategy: 2 },
        resources: { energy: -7, trust: 2, influence: 3 },
        feedback: "你掌握了很多真实动机，但组织也开始默认你延续前任的派系玩法，被贴上标签。",
        theory: "《权经》：携为上，功次之。"
      },
      {
        label: "直接烧掉清单",
        summary: "拒绝继承任何私密关系，从公开流程重新开始。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -3, trust: -5, influence: -2 },
        feedback: "姿态干净了，但你也拒绝了最有价值的一手情报，未来要花更久补课，开局更慢。",
        theory: "《孙子兵法》：知彼知己，百战不殆。"
      }
    ]
  },
  {
    id: "r29",
    chapterId: 3,
    title: "明星员工突然提离职",
    kind: "random",
    context:
      "掌管 70% 客户关系的明星员工突然提出离职，理由是个人成长。你发现他离开前一周约谈了三位高潜同事，其中一位已经开始更新简历。",
    stake: "留住他不是唯一目标；你要判断这是个人流失信号，还是团队结构正在出问题。",
    options: [
      {
        label: "先访谈他带过的高潜同事",
        summary: "把离职当作组织信号读取，先了解谁在跟随、谁在观望，再决定挽留方案。",
        quality: "expert",
        effects: { insight: 3, deploy: 2 },
        resources: { energy: -7, trust: 5, influence: 5 },
        feedback: "你看到了离职背后的梯队结构，挽留方案第一次不是靠涨薪而是靠组织承接力。",
        theory: "《人物志》八观：观其情，察其变。"
      },
      {
        label: "开双倍挽留条件",
        summary: "用资源换时间，先把最关键的客户关系稳住。",
        quality: "partial",
        effects: { communication: 2 },
        resources: { energy: -7, trust: -3, influence: 4 },
        feedback: "人暂时留住了，但其他骨干开始用同样方式试探价格，激励结构开始变形，成本失控。",
        theory: "《贞观政要》：用非其才，必难致治。"
      },
      {
        label: "接受离职并紧急招聘",
        summary: "尊重个人选择，用外部人才补位。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -5, trust: -5, influence: -6 },
        feedback: "招聘补上了岗位，却补不上客户信任和隐性知识，组织开始支付长期学费，代价更高。",
        theory: "《孙子兵法》：先为不可胜。"
      }
    ]
  },
  {
    id: "r30",
    chapterId: 5,
    title: "预算被临时砍掉 20%",
    kind: "random",
    context:
      "季度启动会前一天，财务通知你的项目预算被砍 20%，理由是集团要集中现金。团队已经按原预算排好交付计划，销售总监已经开始质疑承诺。",
    stake: "你要在两天内给出新作战图，而不是把砍预算变成情绪事件。",
    options: [
      {
        label: "按关键结果重排预算优先级",
        summary: "把交付拆成必保、可延、可砍三档，并给每个档位配上负责人和验证节点。",
        quality: "expert",
        effects: { execution: 3, strategy: 2 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback: "你让资源约束变成优先级纪律，团队第一次知道哪三件事绝不能丢，取舍清晰。",
        theory: "《卓有成效的管理者》：要事优先。"
      },
      {
        label: "全员降级交付标准",
        summary: "先保住季度数字，把标准调整放到交付之后。",
        quality: "partial",
        effects: { authority: 2 },
        resources: { energy: -6, trust: -5, influence: 2 },
        feedback: "数字保住了，但交付标准被集体稀释，验收争议开始外溢到客户，口碑受损，续约堪忧。",
        theory: "《孙子兵法》：兵贵胜，不贵久。"
      },
      {
        label: "向集团申诉要求恢复预算",
        summary: "用数据和交付风险争取资源，不默认接受约束。",
        quality: "risk",
        effects: { strategy: 2 },
        resources: { energy: -5, trust: -3, influence: -5 },
        feedback: "你争取到了缓冲，却让集团认为你不擅长在约束下做选择，信任打折，话语权弱。",
        theory: "《权经》：权乃人授。"
      }
    ]
  },
  {
    id: "r31",
    chapterId: 6,
    title: "两个高管公开争吵",
    kind: "random",
    context:
      "经营会上，销售副总裁和产品副总裁当着 CEO 的面争吵：一个指责交付失信，一个指责销售乱承诺。CEO 没有表态，把目光转向你。",
    stake: "你的一句话会决定会议是回到事实，还是变成站队。",
    options: [
      {
        label: "先锁住客户事实与交付事实",
        summary: "把争吵转成两份可核对的事实清单，让双方在数据面前重新定义问题。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -7, trust: 6, influence: 6 },
        feedback: "你没有当裁判，而是把会议从情绪拉回事实，双方第一次愿意在同一张表上讨论。",
        theory: "《矛盾论》：抓主要矛盾。"
      },
      {
        label: "支持销售侧先保客户",
        summary: "先给客户确定性，内部问题之后再复盘。",
        quality: "partial",
        effects: { authority: 2 },
        resources: { energy: -5, trust: -3, influence: 3 },
        feedback: "客户被保护了，但产品团队认为你偏袒销售，后续协作开始设防，内耗加剧。",
        theory: "《资治通鉴》：防微杜渐。"
      },
      {
        label: "宣布散会私下分别安抚",
        summary: "避免公开站队，把矛盾移到一对一沟通。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -3, trust: -6, influence: -4 },
        feedback: "表面平息了，但双方都认为你没有立场，下一次会在更私密的场合开战，更难调和。",
        theory: "《论语》：君子和而不同。"
      }
    ]
  },
  {
    id: "r32",
    chapterId: 7,
    title: "关键流程依赖一个人",
    kind: "random",
    context:
      "你梳理流程时发现：客户续约、报价、催款三个关键环节都依赖同一位资深经理。他上周请年假，报价审批慢了三天，客户已经抱怨。",
    stake: "你要把他变成体系的老师，而不是把他变成体系本身。",
    options: [
      {
        label: "用 30 天陪跑把流程沉淀成清单",
        summary: "让他带教两名骨干，把判断规则写进检查清单，并让新人独立演练一个真实案例。",
        quality: "expert",
        effects: { stability: 3, deploy: 2 },
        resources: { energy: -7, trust: 6, influence: 5 },
        feedback: "依赖没有变成对抗，资深经理第一次被当成体系建设者，组织获得了可复制能力。",
        theory: "《贞观政要》：善始慎终。"
      },
      {
        label: "先招一名助手分担",
        summary: "用新增人手降低单点风险，流程留到以后。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -6, trust: 2, influence: 2 },
        feedback: "助手到岗了，但判断仍集中在一个人身上，瓶颈只是被延后，隐患仍在，风险未除。",
        theory: "《韩非子》：明主之道，使智者尽其虑。"
      },
      {
        label: "要求他把方法立即写出来",
        summary: "用书面材料快速复制经验。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -4, trust: -8, influence: -1 },
        feedback: "书面材料很快过时，他也觉得自己的价值被公开剥夺，配合度下降，暗生抵触。",
        theory: "《资治通鉴》：用人之长。"
      }
    ]
  },
  {
    id: "r33",
    chapterId: 8,
    title: "客户要求立即上线未验证功能",
    kind: "random",
    context:
      "大客户以合同续签为筹码，要求两周内上线一个尚未验证的新功能。研发团队评估至少需要六周，产品经理暗示可以先上线再补测试。",
    stake: "承诺会让团队透支，拒绝会让客户流失，你需要第三条路径。",
    options: [
      {
        label: "把需求拆成可试用的最小版本",
        summary: "先交付能验证核心假设的简化版，并约定 30 天联合验收节点，把风险转成共担实验。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback: "你没有在承诺与拒绝之间二选一，而是把客户变成验证伙伴，双方都有可退出的边界。",
        theory: "《矛盾论》：抓主要矛盾。"
      },
      {
        label: "承诺两周上线并要求团队加班",
        summary: "先满足客户，内部成本用加班消化。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -9, trust: -6, influence: 3 },
        feedback: "上线日期保住了，但团队以离职和倦怠回应，下一轮交付开始连锁延期，债越欠越多。",
        theory: "《孙子兵法》：兵贵胜，不贵久。"
      },
      {
        label: "拒绝需求并等待合同到期再谈",
        summary: "守住研发边界，不让客户用合同绑架计划。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -4, trust: -8, influence: -5 },
        feedback: "原则守住了，但客户关系进入冷冻期，你的谈判筹码也随之减少，续约前景黯淡。",
        theory: "《权经》：权乃人授。"
      }
    ]
  },
  {
    id: "r34",
    chapterId: 9,
    title: "继任者第一次独立决策",
    kind: "random",
    context:
      "你准备晋升，继任者需要独立处理第一场危机：供应商违约，客户在等方案。她带着两套方案来请教你，一套保守、一套激进。",
    stake: "你的回答方式决定她是学会决策，还是学会等你。",
    options: [
      {
        label: "先让她给结论和失败条件",
        summary: "要求她先说出推荐方案、依据和止损条件，你再补充一个她没看见的风险。",
        quality: "expert",
        effects: { stability: 3, communication: 2 },
        resources: { energy: -6, trust: 6, influence: 6 },
        feedback: "她第一次带着完整判断来讨论，而不是带着问题来等你，交接真正开始发生。",
        theory: "《资治通鉴》：善始慎终。"
      },
      {
        label: "直接给出你的答案",
        summary: "先解决危机，再把决策过程讲给她听。",
        quality: "partial",
        effects: { authority: 2 },
        resources: { energy: -5, trust: 2, influence: 3 },
        feedback: "危机解决了，但她学会了在下次危机前先来问你，组织仍依赖你，交接停滞。",
        theory: "《权经》：权惟用，不为大也。"
      },
      {
        label: "让她独自处理并承担全部责任",
        summary: "用真实危机加速成长，不提供任何护栏。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -6, trust: -6, influence: 2 },
        feedback: "独立感有了，但她在关键决策上缺少护栏，一次失败可能让她退回依赖，前功尽弃。",
        theory: "《孙子兵法》：上下同欲者胜。"
      }
    ]
  },
  {
    id: "r35",
    chapterId: 2,
    title: "CEO 当众问你对组织诊断",
    kind: "random",
    context:
      "全员会上，CEO 突然让你当众给出组织诊断，并说“你是新来的，看得最清楚”。全场安静下来，有人开始翻手机记录你的原话。",
    stake: "太尖锐会得罪人，太圆滑会失去公信力，你需要一句既诚实又可行动的话。",
    options: [
      {
        label: "给出三个可验证观察",
        summary: "每个观察都配一个证据和下一步动作，让诊断成为可以一起检查的清单。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -6, trust: 6, influence: 6 },
        feedback: "你既没有站队也没有空谈，全员第一次把“诊断”当成可执行的会议议题，行动有了起点。",
        theory: "《论语》：名不正则言不顺，言不顺则事不成。"
      },
      {
        label: "先肯定组织再给一个温和问题",
        summary: "保持会议气氛，同时留下一个安全的问题入口。",
        quality: "partial",
        effects: { communication: 2 },
        resources: { energy: -5, trust: 3, influence: 2 },
        feedback: "场面稳住了，但 CEO 下次不会再当众问你，因为你没有给出判断，机会流失。",
        theory: "《权经》：携为上。"
      },
      {
        label: "点名一个部门的问题",
        summary: "用具体批评展示你的观察力。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -6, trust: -8, influence: 2 },
        feedback: "你展示了锋芒，也让整个部门进入防御，下一次信息会先经过过滤，你更难看见真相。",
        theory: "《孙子兵法》：先为不可胜。"
      }
    ]
  },
  {
    id: "r36",
    chapterId: 6,
    title: "深夜收到匿名举报信",
    kind: "random",
    context:
      "深夜你收到匿名举报信，指称采购经理与供应商存在利益输送，落款是“知情同事”，没有具体证据，但附了一张金额模糊的转账截图。",
    stake: "举报信可能是真相，也可能是派系工具；你要先保护调查的公正性。",
    options: [
      {
        label: "把举报信转成独立审计线索",
        summary: "不公开信源，把异常采购记录放进独立审计，用证据链代替举报信本身。",
        quality: "expert",
        effects: { structure: 3, authority: 2 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback: "你没有把匿名信当成定罪证据，也没有忽视它，组织第一次看到你对公正性的底线。",
        theory: "《韩非子》：法度既立，虽庸主可治。"
      },
      {
        label: "立即约谈采购经理",
        summary: "用直接对话快速判断真假。",
        quality: "partial",
        effects: { authority: 3 },
        resources: { energy: -5, trust: -4, influence: 2 },
        feedback: "对方否认并开始销毁痕迹，你失去了取证窗口，消息也传遍公司，证据更难追。",
        theory: "《孙子兵法》：致人而不致于人。"
      },
      {
        label: "把举报信交给更高层处理",
        summary: "避开风险，让组织更高层决定调查方式。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -3, trust: -3, influence: -4 },
        feedback: "你避开了风险，也交出了对组织的判断权，后续调查会脱离你的控制，真相更难查。",
        theory: "《权经》：权乃人授。"
      }
    ]
  },
  {
    id: "c4-fork-expert",
    chapterId: 4,
    title: "驭势路线检查点：共同作者委员会",
    kind: "branch",
    context:
      "你选择了把反对者变成共同作者。现在需要让委员会在第一次会议上就产出可验收成果，而不是变成新的扯皮会。",
    stake: "你要证明“把反对者请进来”不是让步，而是让方案更硬的机制。",
    options: [
      {
        label: "给每位委员一个可验收议题和 24 小时交付物",
        summary: "让反对者从评论者变成交付者，用成果锁定参与。",
        quality: "expert",
        effects: { mobilize: 3, structure: 2 },
        resources: { energy: -7, trust: 7, influence: 6 },
        feedback: "反对者第一次为方案负责，会议从立场陈述变成交付承诺，阻力变成交付力。",
        theory: "《论语》：举直错诸枉，则民服。"
      },
      {
        label: "让委员会只做建议不做决策",
        summary: "保留最终决策权，避免委员会拖慢节奏。",
        quality: "partial",
        effects: { authority: 2 },
        resources: { energy: -5, trust: -3, influence: 2 },
        feedback: "形式有了，但成员很快发现意见不会被采纳，委员会成了摆设。",
        theory: "《韩非子》：法势术并用。"
      },
      {
        label: "把最激烈反对者踢出委员会",
        summary: "用权限排除干扰，保证会议效率。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -5, trust: -8, influence: 2 },
        feedback: "阻力看似消失，实际转入地下，下一次反对会以更隐蔽的方式出现，更难察觉。",
        theory: "《孙子兵法》：先为不可胜。"
      }
    ]
  },
  {
    id: "c4-fork-partial",
    chapterId: 4,
    title: "驭势路线检查点：背书换时间",
    kind: "branch",
    context:
      "你选择用高层背书压制争议。现在高层已经表态，但你必须在 48 小时内给执行层一个不靠命令也能运转的协作方式。",
    stake: "背书只能用一次，你要把它转成团队自己的流程。",
    options: [
      {
        label: "把背书转成三方确认的试点公约",
        summary: "让销售、交付、财务共同确认试点边界、责任人与复盘节点。",
        quality: "expert",
        effects: { authority: 3, communication: 2 },
        resources: { energy: -7, trust: 6, influence: 6 },
        feedback: "高层支持变成了可执行的协作规则，团队开始用公约而不是命令对齐，背书落地了。",
        theory: "《韩非子》：法度既立，虽庸主可治。"
      },
      {
        label: "要求各部门限期配合",
        summary: "用截止时间推动执行，不再逐部门沟通。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -6, trust: -4, influence: 3 },
        feedback: "配合到了，但各部门只是应付节点，真实协作仍未发生，形式大于实质。",
        theory: "《孙子兵法》：令之以文，齐之以武。"
      },
      {
        label: "把反对声音压回私下",
        summary: "让公开场合只保留支持声音，减少阻力。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -4, trust: -8, influence: 2 },
        feedback: "表面安静了，但关键信息开始绕开你流动，你被排除在真实决策外。",
        theory: "《资治通鉴》：防微杜渐。"
      }
    ]
  },
  {
    id: "c4-fork-risk",
    chapterId: 4,
    title: "驭势路线检查点：绕过阻力加速试点",
    kind: "branch",
    context:
      "你选择先跑试点。现在试点结果比预期好，但被你绕过的部门开始联合质疑试点有效性。",
    stake: "你要让试点从“你个人推动”变成“组织共同看见的证据”。",
    options: [
      {
        label: "把试点数据做成公开验证看板",
        summary: "让质疑者看到同一套口径的数据，并邀请他们补充验证条件。",
        quality: "expert",
        effects: { execution: 3, communication: 2 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback: "质疑被数据挡回，试点第一次成为组织共同的语言，证据开始说话。",
        theory: "《矛盾论》：实践是检验真理的唯一标准。"
      },
      {
        label: "先让支持者扩大试点范围",
        summary: "用更快的结果证明方向，再回头处理质疑。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -6, trust: -3, influence: 2 },
        feedback: "试点更快了，但反对部门认为你仍在圈外推进，裂痕越拉越大。",
        theory: "《权经》：携为上。"
      },
      {
        label: "撤掉试点等待共识",
        summary: "先平息质疑，再寻找更稳妥的启动时机。",
        quality: "risk",
        effects: { recovery: 2 },
        resources: { energy: -4, trust: -5, influence: -4 },
        feedback: "争议小了，但组织学会用质疑阻止任何新尝试，创新开始畏手畏脚。",
        theory: "《孙子兵法》：不可胜在己。"
      }
    ]
  },
  {
    id: "c7-fork-expert",
    chapterId: 7,
    title: "固权路线检查点：陪跑清单",
    kind: "branch",
    context:
      "你选择用陪跑把关键判断交给接班人。现在需要给陪跑设边界：哪些决策他可以独立做，哪些必须触发双人复核。",
    stake: "你要让陪跑既加速成长，又不变成另一种依赖。",
    options: [
      {
        label: "按风险档位划分独立决策清单",
        summary: "低风险放权、中风险带教、高风险双人复核，并公开清单。",
        quality: "expert",
        effects: { stability: 3, deploy: 2 },
        resources: { energy: -7, trust: 6, influence: 6 },
        feedback: "接班人第一次知道哪些判断属于他，组织开始按规则而不是按人运行，放权有了边界。",
        theory: "《贞观政要》：善始慎终。"
      },
      {
        label: "让接班人先处理低风险事务",
        summary: "先安全练手，关键决策仍由你亲自完成。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -5, trust: 2, influence: 2 },
        feedback: "安全了，但关键判断仍全部由你做出，接班周期被无限拉长。",
        theory: "《资治通鉴》：用人之长。"
      },
      {
        label: "直接全权交接",
        summary: "用真实决策加速成长，不再设置复核。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -5, trust: -5, influence: 2 },
        feedback: "接班人独立了，但没有护栏的第一次失误会动摇团队信任，代价很高。",
        theory: "《孙子兵法》：上下同欲者胜。"
      }
    ]
  },
  {
    id: "c7-fork-partial",
    chapterId: 7,
    title: "固权路线检查点：放权与复核",
    kind: "branch",
    context:
      "你选择给接班人更多决策权。现在他提交了一份预算调整方案，其中有一个你没有预料到的风险。",
    stake: "直接驳回会毁掉放权，放行又可能让组织承受风险，你需要一个复核协议。",
    options: [
      {
        label: "让他在方案里补上止损条件和 30 天复盘节点",
        summary: "不夺回决策，只补护栏，让这次风险变成一次带教。",
        quality: "expert",
        effects: { stability: 3, communication: 2 },
        resources: { energy: -6, trust: 6, influence: 5 },
        feedback: "你既没有抢回决策，也没有放任风险，组织第一次有了可学习的放权模板，带教成了机制。",
        theory: "《韩非子》：明主之道，使智者尽其虑。"
      },
      {
        label: "这次先由你最终拍板",
        summary: "先控制风险，再解释你的判断依据。",
        quality: "partial",
        effects: { authority: 2 },
        resources: { energy: -5, trust: -4, influence: 2 },
        feedback: "风险挡住了，但接班人学会了重要决策先等你表态，放权又退回去了。",
        theory: "《权经》：权乃人授。"
      },
      {
        label: "直接按他的方案执行",
        summary: "用信任换取成长，让组织承担可能的风险。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -5, trust: -5, influence: -3 },
        feedback: "信任表达了，但组织为未设防的风险支付了代价，护栏本可以避免。",
        theory: "《孙子兵法》：先为不可胜。"
      }
    ]
  },
  {
    id: "c7-fork-risk",
    chapterId: 7,
    title: "固权路线检查点：继续亲自把关",
    kind: "branch",
    context:
      "你选择继续亲自把关关键决策。现在业务量上升，你的邮箱和会议开始成为全组织的瓶颈。",
    stake: "你要找到一种不交出判断权、但能解除单点瓶颈的方式。",
    options: [
      {
        label: "把把关拆成三道标准问题",
        summary: "让所有请示先回答目标、依据、止损，你只复核例外。",
        quality: "expert",
        effects: { structure: 3, stability: 2 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback: "你仍然是最终把关人，但组织开始先自我校准，瓶颈第一次松动，效率回来了。",
        theory: "《资治通鉴》：防微杜渐。"
      },
      {
        label: "增加审批会议频率",
        summary: "用更多同步时间消化请示量。",
        quality: "partial",
        effects: { execution: 2 },
        resources: { energy: -8, trust: -2, influence: 2 },
        feedback: "决策更快了一点，但你的时间被会议吞掉，瓶颈只是换了位置。",
        theory: "《韩非子》：法度既立。"
      },
      {
        label: "让秘书代你筛选请示",
        summary: "先过滤掉低价值信息，只留关键决策。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -4, trust: -6, influence: -3 },
        feedback: "你的时间省下了，但组织开始揣测秘书的偏好，权力路径变得扭曲，风险暗藏。",
        theory: "《权经》：权惟用。"
      }
    ]
  }
];

STORY_NODES.push(...EXTRA_MAIN_NODES);

export const RANDOM_EVENT_IDS = [
  "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10",
  "r11", "r12", "r13", "r14", "r15", "r16", "r17", "r18", "r19", "r20",
  "r21", "r22", "r23", "r24", "r25", "r26", "r27", "r28", "r29", "r30",
  "r31", "r32", "r33", "r34", "r35", "r36"
];
for (const id of RANDOM_EVENT_IDS) {
  const node = STORY_NODES.find((item) => item.id === id);
  if (node) node.kind = "random";
}

export type RandomEventMeta = {
  weight: number;
  chapterId: number;
  roles?: RoleId[];
  difficulties?: Array<"normal" | "pressure" | "extreme">;
};

export const RANDOM_EVENT_META: Record<string, RandomEventMeta> = {
  r1: { weight: 3, chapterId: 2 },
  r2: { weight: 3, chapterId: 3 },
  r3: { weight: 4, chapterId: 5 },
  r4: { weight: 3, chapterId: 6 },
  r5: { weight: 4, chapterId: 8 },
  r6: { weight: 5, chapterId: 9 },
  r7: { weight: 3, chapterId: 2 },
  r8: { weight: 4, chapterId: 4 },
  r9: { weight: 4, chapterId: 7 },
  r10: { weight: 4, chapterId: 5 },
  r11: { weight: 3, chapterId: 3 },
  r12: { weight: 5, chapterId: 8 },
  r13: { weight: 4, chapterId: 5 },
  r14: { weight: 3, chapterId: 2 },
  r15: { weight: 4, chapterId: 4 },
  r16: { weight: 4, chapterId: 6 },
  r17: { weight: 4, chapterId: 7 },
  r18: { weight: 5, chapterId: 8 },
  r19: { weight: 4, chapterId: 3 },
  r20: { weight: 5, chapterId: 9 },
  r21: { weight: 4, chapterId: 4 },
  r22: { weight: 3, chapterId: 3 },
  r23: { weight: 4, chapterId: 6 },
  r24: { weight: 4, chapterId: 7 },
  r25: { weight: 5, chapterId: 8 },
  r26: { weight: 5, chapterId: 9 },
  r27: { weight: 4, chapterId: 4 },
  r28: { weight: 4, chapterId: 2, roles: ["parachute"] },
  r29: { weight: 4, chapterId: 3, roles: ["founder"] },
  r30: { weight: 4, chapterId: 5, roles: ["parachute"] },
  r31: {
    weight: 4,
    chapterId: 6,
    difficulties: ["pressure", "extreme"]
  },
  r32: { weight: 4, chapterId: 7, roles: ["founder"] },
  r33: {
    weight: 4,
    chapterId: 8,
    roles: ["highPotential"],
    difficulties: ["pressure", "extreme"]
  },
  r34: { weight: 4, chapterId: 9, roles: ["highPotential"] },
  r35: { weight: 4, chapterId: 2 },
  r36: {
    weight: 4,
    chapterId: 6,
    difficulties: ["pressure", "extreme"]
  }
};

function randomEventCategory(eventId: string): "expert" | "risk" | "partial" {
  const expertEvents = new Set([
    "r2", "r7", "r15", "r18", "r20", "r21", "r26", "r27", "r30", "r32",
    "r34"
  ]);
  const riskEvents = new Set([
    "r3", "r5", "r12", "r17", "r19", "r23", "r25", "r29", "r31", "r33",
    "r36"
  ]);
  if (expertEvents.has(eventId)) return "expert";
  if (riskEvents.has(eventId)) return "risk";
  return "partial";
}

/** 决策风格偏好：让随机事件派发受前序选择影响（轻量剧情分叉）。 */
export function randomEventAffinity(
  eventId: string,
  ratios: { expert: number; risk: number; partial: number }
): number {
  return ratios[randomEventCategory(eventId)];
}

export function nextRandomEvent(save: {
  completedRandomEvents: string[];
  unlockedChapters: number[];
  decisionHistory?: Array<{ nodeId: string; quality: OptionQuality }>;
  routePath?: Record<number, "expert" | "risk" | "partial">;
  role?: RoleId;
  difficulty?: "normal" | "pressure" | "extreme";
}): string | undefined {
  const eligible = RANDOM_EVENT_IDS.filter((id) => {
    const meta = RANDOM_EVENT_META[id];
    return (
      meta &&
      !save.completedRandomEvents.includes(id) &&
      save.unlockedChapters.includes(meta.chapterId) &&
      (!meta.roles || meta.roles.includes(save.role ?? "highPotential")) &&
      (!meta.difficulties ||
        meta.difficulties.includes(save.difficulty ?? "normal"))
    );
  });
  if (eligible.length === 0) return undefined;
  const totalWeight = eligible.reduce(
    (sum, id) => sum + weightedEventWeight(id, save),
    0
  );
  let roll = Math.random() * totalWeight;
  for (const id of eligible) {
    roll -= weightedEventWeight(id, save);
    if (roll <= 0) return id;
  }
  return eligible[0];
}

function weightedEventWeight(
  id: string,
  save: {
    completedRandomEvents: string[];
    unlockedChapters: number[];
    decisionHistory?: Array<{ nodeId: string; quality: OptionQuality }>;
    routePath?: Record<number, "expert" | "risk" | "partial">;
  }
): number {
  const history = save.decisionHistory ?? [];
  const total = Math.max(1, history.length);
  const expert = history.filter((record) => record.quality === "expert").length / total;
  const risk = history.filter((record) => record.quality === "risk").length / total;
  const partial = history.filter((record) => record.quality === "partial").length / total;
  const route = Object.values(save.routePath ?? {}).at(-1) ?? "";
  const routeBoost = randomEventCategory(id) === route ? 0.9 : 0;
  const affinity = Math.max(
    randomEventAffinity(id, { expert, risk, partial }),
    routeBoost
  );
  return RANDOM_EVENT_META[id].weight * (0.8 + affinity * 0.7);
}

/** 事件池按角色 / 难度档 / 轮换周期给出的情境变体，让二周目与不同角色看到不同开场压力。 */
export function randomEventVariantContext(
  role: RoleId,
  difficulty: "normal" | "pressure" | "extreme",
  cycle: number,
  language: "zh" | "en"
): string {
  const roleLine =
    language === "en"
      ? role === "parachute"
        ? "As the parachute executive, every first-week judgment is being compared against the old team's expectations."
        : role === "founder"
          ? "As the founder, every choice directly touches cash flow, morale, and your own authority."
          : "As a high-potential contributor, you hold no formal mandate, so you must move through judgment and consensus."
      : role === "parachute"
        ? "作为空降负责人，你的第一周判断正在被组织反复对照。"
        : role === "founder"
          ? "作为创始人，你的每个选择都会直接影响现金、士气与你的权威。"
          : "作为高潜骨干，你没有正式授权，只能靠判断与共识推进。";
  const difficultyLine =
    language === "en"
      ? difficulty === "pressure"
        ? "Pressure mode: resource losses are amplified, so every next step must be verifiable."
        : difficulty === "extreme"
          ? "Extreme mode: interference is heavier, so every promise needs a stop-loss condition."
          : "Standard mode: you have more room to validate assumptions, but windows still close."
      : difficulty === "pressure"
        ? "高压档下资源损耗放大，你必须在更短时间内给出可核对的下一步。"
        : difficulty === "extreme"
          ? "极限档下突发干扰增加，任何承诺都要先设止损条件。"
          : "标准档下你有更多空间验证假设，但机会窗口也会收窄。";
  const cycleLine =
    cycle > 0
      ? language === "en"
        ? `Event cycle ${cycle + 1}: the pool has been reshuffled by role and difficulty, and some intel has changed.`
        : `第 ${cycle + 1} 轮事件周期开启，事件池已按角色与难度重新洗牌，部分情报出现新变化。`
      : "";
  return `${roleLine} ${difficultyLine} ${cycleLine}`.trim();
}

/** 当前角色与难度档下，事件池实际可完成的事件数（用于轮换门槛与进度展示）。 */
export function randomEventEligibleCount(save: {
  profile?: { role?: RoleId };
  difficulty?: "normal" | "pressure" | "extreme";
}): number {
  const role = save.profile?.role ?? "highPotential";
  const difficulty = save.difficulty ?? "normal";
  return RANDOM_EVENT_IDS.filter((id) => {
    const meta = RANDOM_EVENT_META[id];
    return (
      meta &&
      (!meta.roles || meta.roles.includes(role)) &&
      (!meta.difficulties || meta.difficulties.includes(difficulty))
    );
  }).length;
}

/** 事件池总事件数（36），用于与图鉴/成就目标保持一致。 */
export function randomEventPoolTotal(): number {
  return RANDOM_EVENT_IDS.length;
}

export function getChapter(id: number): ChapterDef {
  const chapter = CHAPTERS.find((item) => item.id === id);
  if (!chapter) {
    throw new Error(`Missing chapter ${id}`);
  }
  return chapter;
}

export function getNode(id: string): StoryNode {
  const node = STORY_NODES.find((item) => item.id === id);
  if (!node) {
    throw new Error(`Missing story node ${id}`);
  }
  return node;
}

/** 第 4/7 章在路线选择后进入的中期分叉节点；其他章节返回 undefined，保持主线节奏。 */
export function forkNodeForRoute(
  chapterId: number,
  route: "expert" | "risk" | "partial"
): string | undefined {
  if (chapterId === 4 || chapterId === 7) {
    return `c${chapterId}-fork-${route}`;
  }
  return undefined;
}

export function nodesForChapter(chapterId: number): StoryNode[] {
  const chapter = getChapter(chapterId);
  return chapter.nodeIds.map(getNode);
}

export function sideNodesForChapter(chapterId: number): StoryNode[] {
  return STORY_NODES.filter(
    (node) => node.kind === "side" && node.chapterId === chapterId
  );
}

export const NODE_INTEL: Record<string, string[]> = {
  c1n1: [
    "前任留下的预算表里有 20% 外包费用去向不明",
    "行政主管清楚每个部门真正说了算的人是谁",
    "CEO 只给了 90 天，但尚未公开支持你"
  ],
  c1n2: [
    "财务经理上周刚提交过一份自相矛盾的支出说明",
    "外包供应商与销售副总存在私人往来",
    "这份合同在系统里的审批流程被人为跳过"
  ],
  c2n1: [
    "CEO 正在观望你是否会主动争取资源",
    "临时上级愿意支持你，但不想承担风险",
    "团队最怕的不是授权缺失，而是方向反复"
  ],
  c2n2: [
    "运营负责人提前一天拿到了会议议题",
    "沉默的老员工曾是前任的副手",
    "有人已经在私下流传你准备裁员"
  ],
  c3n1: [
    "老员工掌握核心客户，但客户只听他一个人的",
    "年轻骨干连续三次在关键节点交付出色",
    "HR 暗示组织希望借此机会清理历史包袱"
  ],
  c3n2: [
    "年轻骨干曾经独立处理过同类事故",
    "老员工多次在评审时推翻他的方案",
    "项目日报显示 80% 的阻塞都来自等待确认"
  ],
  c4n1: [
    "运营负责人的团队最近刚被新流程削权",
    "他的顾虑里有三个真实存在的交付风险",
    "CEO 曾公开支持过流程变革，但没有明确点名"
  ],
  c4n2: [
    "客户项目停滞的真实原因是三部门各自有一套验收标准",
    "研发负责人愿意配合，但不愿替销售背责",
    "产品部已经在私下做了一套替代方案"
  ],
  c5n1: [
    "收入翻倍目标里，60% 来自三个尚未签约的大客户",
    "现有团队只有 40% 的人清楚自己的关键结果",
    "财务建议先锁住现金流，再谈增长"
  ],
  c5n2: [
    "缺口最大的一笔订单仍在等待客户法务确认",
    "团队平均每天有两个小时耗在低价值会议",
    "一个被搁置的小项目预计能在两周内快速回款"
  ],
  c6n1: [
    "CFO 与销售副总共同主导了最近三次投资决策",
    "你的批示在系统里会被标记为“参考意见”",
    "财务团队有人愿意把真实流程数据交给你"
  ],
  c6n2: [
    "这位下属在上一家公司也有越级汇报记录",
    "CEO 最近询问过你两次关于他能力的问题",
    "团队其他成员已经开始模仿他的汇报方式"
  ],
  c7n1: [
    "老将的团队流失率连续两季低于公司平均",
    "年轻人在跨部门项目里获得过最高好评",
    "公司下一阶段需要同时守住存量业务和开辟新业务"
  ],
  c7n2: [
    "你出差时，团队通常要等三天才能做出一项常规决策",
    "上一任负责人留下过一套纸质制度，但没人更新",
    "有人私下把“听你的”当成团队成熟的表现"
  ],
  c8n1: [
    "最大客户暂停付款的原因是内部财务审查，而不是不满",
    "公司账上还有三笔未催收的应收账款",
    "银行愿意提供短期过桥资金，但要求下周前确认"
  ],
  c8n2: [
    "客户流失前三个月已经连续投诉交付响应速度",
    "明星销售带走的客户名单里还有两个高危客户",
    "服务团队上周刚提交过一份改进方案但未获批"
  ],
  c9n1: [
    "CEO 希望你先完成一个季度陪跑再进入更高层",
    "接班人目前只完成了 60% 的关键交接项",
    "核心客户明确表示信任你个人超过信任公司"
  ],
  c9n2: [
    "创新项目已经验证了市场需求，但单位经济模型未跑通",
    "团队里支持继续的人掌握了关键客户关系",
    "公司现金流可以再支撑九个月高风险投入"
  ],
  s1: [
    "客户羞辱发生后，这位员工已经连续三次避开了团队复盘",
    "他昨天刚提交过一份高质量的改进方案"
  ],
  s2: [
    "管培生方案里包含一个被老团队忽略的真实场景",
    "他的直属导师正在观察你会如何处理公开质疑"
  ],
  s3: [
    "提案客户最看重的是决策质量，而不是响应速度",
    "你明早要见的客户曾在凌晨收到过竞争对手的方案"
  ],
  s4: [
    "客户今天真正想确认的是你们是否还值得继续信任",
    "销售负责人已经私下承诺过交付日期，但团队并未确认"
  ],
  s5: [
    "数据错误只影响演示模块中的两张报表",
    "客户周一真正想看的是决策逻辑，而不是完整功能"
  ],
  s6: [
    "提出辞职的人并不是最失望的人，而是最沉默的人",
    "团队上周已经提交过一份风险预警，但没有被重视"
  ],
  s7: [
    "越级汇报发生前，这位下属已经在周报里连续两次提出同类风险",
    "CEO 关注的是信息是否透明，而不是谁先汇报"
  ],
  s8: [
    "这位负责人过去的方案确实有两项被流程卡住过",
    "投资人对新合作的态度取决于是否有人愿意承担风险"
  ],
  s9: [
    "最近三次关键决策都依赖你个人确认后才会启动",
    "接替者已经完成了一轮基础流程学习，但缺少真实案例演练"
  ],
  "c1b-parachute": [
    "行政主管愿意合作，但不想公开站队",
    "财务经理更在意专业证据"
  ],
  "c1b-founder": [
    "团队需要看到业务动作，而不只是新的会议",
    "48 小时内可验证的现金流动作只有三个"
  ],
  "c1b-highPotential": [
    "各部门愿意认领自己提出的动作",
    "直接下发清单会让他们退回本位"
  ],
  "c2b-parachute": [
    "CEO 正在等待一个不需要他兜底的小胜利",
    "组织里有一个停滞项目可以快速重启"
  ],
  "c2b-founder": [
    "现金流缺口来自两个逾期客户",
    "团队里有人已经准备好一份回款清单"
  ],
  "c2b-highPotential": [
    "各部门最缺的不是方案，而是共同验收标准",
    "财务愿意提供数据，但不想承担最终决策责任"
  ],
  "c3b-parachute": [
    "HR 已经准备好一份岗位成果模板",
    "核心客户负责人正在同时接触外部机会"
  ],
  "c3b-founder": [
    "明星员工上周拒绝了一次新客户分工",
    "销售后台已经有半年客户接触记录"
  ],
  "c3b-highPotential": [
    "部门负责人真正想保护的人是自己的旧下属",
    "另一名候选人在两个关键项目中有完整证据"
  ],
  "c4b-parachute": [
    "运营负责人之前曾被空降管理者公开否过一次",
    "他的团队已经私下准备了替代方案"
  ],
  "c4b-founder": [
    "联合创始人反对的不是方向，而是被排除在决策外",
    "两条路径所需的资源并不冲突"
  ],
  "c4b-highPotential": [
    "资深负责人的反对里包含一个真实交付风险",
    "他手上有一套现成的数据可以验证新方案"
  ],
  "c5b-parachute": [
    "收入缺口里 60% 来自三个未签约大客户",
    "财务手里有一份可回款订单清单"
  ],
  "c5b-founder": [
    "产品部已经在私下做新功能，但销售不知情",
    "现有客户里有两个愿意提前付款"
  ],
  "c5b-highPotential": [
    "各部门都担心目标变成自己部门独自承担",
    "有一张现成的项目看板模板可以复用"
  ],
  "c6b-parachute": [
    "系统里已经有一个可用的审批流模板",
    "CFO 愿意支持联签，但不想公开表态"
  ],
  "c6b-founder": [
    "合伙人最近两次绕过的都是同一类决策",
    "董事会章程里已经预留了联签条款"
  ],
  "c6b-highPotential": [
    "高层直接指挥的内容集中在两个交付节点",
    "项目章程尚未被正式发布"
  ],
  "c7b-parachute": [
    "团队里已经有人开始模仿你的口头决策",
    "系统里有一套未被启用的审批检查清单"
  ],
  "c7b-founder": [
    "核心团队经常等你确认后才敢行动",
    "过去三个月的高频决策可以被归类成五种"
  ],
  "c7b-highPotential": [
    "项目关键人只认可你的口头确认",
    "有一份会议记录模板可以升级为协作地图"
  ],
  "c8b-parachute": [
    "现金流缺口里有一笔可快速催收的应收账款",
    "财务团队已经准备好三套融资方案"
  ],
  "c8b-founder": [
    "最大客户暂停付款是因为内部审计，不是不满",
    "账上还有两笔未催收的应收账款"
  ],
  "c8b-highPotential": [
    "预算被砍的部门里有一个可合并项目",
    "客户最关心的交付模块已经完成 80%"
  ],
  "c9b-parachute": [
    "接班人已经完成 60% 的关键交接项",
    "CEO 愿意等待一个季度陪跑"
  ],
  "c9b-founder": [
    "投资人更看重治理结构，而不是个人能力",
    "创始团队里已有两人具备跨部门决策经验"
  ],
  "c9b-highPotential": [
    "接替者已经独立处理过两次关键危机",
    "项目手册只覆盖了流程，没有覆盖判断依据"
  ],
  "c4-fork-expert": [
    "委员会成员更在意自己的议题是否被真正采纳",
    "第一个可验收交付物决定了反对者是否愿意继续参与",
    "24 小时交付物必须是可核对的，而不是表态"
  ],
  "c4-fork-partial": [
    "高层背书只剩一次有效期",
    "三方试点公约比命令更可能被执行层接受",
    "48 小时内必须有第一个共同确认的交付节点"
  ],
  "c4-fork-risk": [
    "试点数据只有公开化才能回应联合质疑",
    "被绕过的部门在等待数据口径不一致的破绽",
    "看板上的每个指标都必须有负责人"
  ],
  "c7-fork-expert": [
    "接班人更怕的是被悄悄收回权力",
    "风险分档清单需要写进公开规则",
    "双人复核只应出现在高风险决策"
  ],
  "c7-fork-partial": [
    "接班人提交的方案里有一个真实风险",
    "止损条件比口头信任更能保护放权",
    "30 天复盘节点让风险变成学习材料"
  ],
  "c7-fork-risk": [
    "全组织开始按你的时间表安排决策",
    "三道标准问题可以过滤大部分请示",
    "例外复核仍保留你对高风险判断的把关"
  ],
  r1: [
    "CEO 最近最担心的是组织是否开始失去方向",
    "他给你一句话的机会，其实是在测试你是否已经进入状态"
  ],
  r2: [
    "报销审批链里有人刻意跳过了常规检查",
    "这笔报销与最近一个新供应商有关"
  ],
  r3: [
    "客户真正想确认的是你们的演示能否支持他们内部决策",
    "现有功能中已经有一个可用的替代场景"
  ],
  r4: [
    "流言来源与最近一次高管会议有关",
    "最焦虑的是没有直属主管的基层员工"
  ],
  r5: [
    "资深负责人手里有一组真实数据可以验证你的说法",
    "团队更想听到的是你会如何修正，而不是如何辩护"
  ],
  r6: [
    "这位骨干最近两次主动承担了超出岗位的任务",
    "他真正在意的不是职位，而是有没有更大的判断空间"
  ],
  r7: [
    "提问者手上其实也只有一份旧版数据",
    "高层真正想看你如何管理信息边界"
  ],
  r8: [
    "新人的承诺背后是销售负责人私下的催促",
    "客户真正在意的是交付机制是否透明"
  ],
  r9: [
    "项目负责人已经连续三次调整内部计划",
    "团队担心报风险会被视为能力不足"
  ],
  r10: [
    "这位客户过去两年换过三家供应商",
    "他更在意的是长期供应稳定性，而不是这次价格"
  ],
  r11: [
    "老员工曾经有过一次类似冲突记录",
    "新人上周提交的方案里包含一个关键数据错误"
  ],
  r12: [
    "投资人真正担心的是现金流模型，不是某个部门",
    "被要求裁掉的部门里有三个客户关系核心节点"
  ],
  r13: [
    "预算被砍与上一季度交付延期有关",
    "团队里有两个项目可以低成本合并"
  ],
  r14: [
    "CEO 听到的版本来自一位未参加会议的人",
    "你两次打断发言的对象恰好在客户现场"
  ],
  r15: [
    "客户真正担心的是响应速度，而不是私人关系",
    "团队里已经有人负责他所在区域的日常支持"
  ],
  r16: [
    "新流程在系统里需要三次手工录入",
    "一线主管没有收到任何培训"
  ],
  r17: [
    "这位骨干想要的新业务其实可以拆成项目内子任务",
    "转岗申请已经提交到 HR，正式流程尚未启动"
  ],
  r18: [
    "报道中有一个数据来自你们公开的旧版本年报",
    "客户服务热线已经收到十多个相关咨询"
  ],
  r19: [
    "供应商听到了公司资金链的传闻，但来源不明确",
    "采购部上周刚完成两个替代供应商评估"
  ],
  r20: [
    "CEO 更想看到你如何管理边界，而不是简单接受",
    "新业务有一半资源可以来自现有团队冗余"
  ],
  r21: [
    "对方部门的月报引用的是你们内部数据",
    "他们的负责人正在争取同一批晋升名额"
  ],
  r22: [
    "老员工曾在新骨干的岗位竞选中落选",
    "新骨干已经独立交付过一个关键成果"
  ],
  r23: [
    "异常对账单上的金额连续三个月递增",
    "财务经理此前与采购负责人有过一次公开争执"
  ],
  r24: [
    "反对最激烈的几个人并不了解新算法",
    "团队里有一份现成的试运行数据可以公开"
  ],
  r25: [
    "砍单决定来自客户新上任的财务负责人",
    "客户内部仍在讨论是否要引入第二供应商"
  ],
  r26: [
    "回归骨干带来的行业资源与现有客户不冲突",
    "顶替者已经完成两个交付周期，正在等待晋升承诺"
  ],
  r27: [
    "水印把泄漏源缩小到一个小圈子",
    "对方部门转发它，是在测试你会惩罚还是无视",
    "第二个版本可以把泄漏变成可控试探"
  ],
  r28: [
    "清单里有正式架构上看不到的名字",
    "每笔人情都对应不同的预期回报",
    "把它翻译成合作条件可以避免继承债务"
  ],
  r29: [
    "三位高潜同事被按特定顺序约谈",
    "他的离职理由里有一条从未写下的晋升路径",
    "客户关系是习惯性集中，而不是合同性集中"
  ],
  r30: [
    "砍掉的预算集中在非承诺性支出",
    "七个工作流里有两条可以压缩",
    "财务在观察你会重新规划还是抱怨"
  ],
  r31: [
    "客户合同里的交付期限没有经过交付侧评审",
    "产品侧有一份显示两个阻塞点的完成报告",
    "CEO 在测试你能否把事实与阵营分开"
  ],
  r32: [
    "资深经理已经在个人笔记里沉淀判断",
    "两名骨干曾在他的复核下完成过相似工作",
    "他担心的是被替换，而不是被要求带教"
  ],
  r33: [
    "客户的关键用户愿意参与 30 天联合验收",
    "六周里有两周来自内部签批，而不是研发",
    "续签的发起人需要一件可见的成果"
  ],
  r34: [
    "她已经知道客户偏好的方案",
    "她的两个方案一个保交付、一个保现金",
    "两个方案都没有写止损条件"
  ],
  r35: [
    "CEO 想要一个可检验的观察，而不是抱怨清单",
    "全场在听你会不会给出真实证据",
    "一个可执行的下一步能把诊断变成共同议题"
  ],
  r36: [
    "举报内容与上季度一次异常合同续约吻合",
    "匿名发送者很可能在采购或财务内部",
    "没有证据时直接行动会毁掉取证窗口"
  ]
};

Object.assign(NODE_INTEL, EXTRA_MAIN_INTEL);

export interface RoleNodeVariant {
  title?: string;
  context?: string;
  stake?: string;
}

export const ROLE_NODE_VARIANTS: Record<
  string,
  Partial<Record<RoleId, RoleNodeVariant>>
> = {
  c1n1: {
    parachute: {
      context:
        "你刚空降接任事业部负责人，团队还不知道你会带来什么，前任的人正在观察你会不会动他们。",
      stake: "先摸清谁真正掌握信息，还是先证明你能赢？"
    },
    founder: {
      context:
        "你是创始人，团队刚扩张到 30 人，创始团队开始出现流程混乱，但没人愿意承认问题。",
      stake: "你需要在没有职业经理人的情况下建立第一套管理秩序。"
    },
    highPotential: {
      context:
        "你作为高潜骨干被 CEO 点名牵头一个新项目，但没有正式任命，各部门只是给出“配合”的口头承诺。",
      stake: "你必须用专业和关系让项目真正运转起来。"
    }
  },
  c1n2: {
    parachute: {
      context:
        "空降第三周，你发现一笔外包费用去向不明，行政主管无意间给了你一条线索，但财务团队还没准备好配合。",
      stake: "在信任未建立时，你如何验证这条线索？"
    },
    founder: {
      context:
        "你发现合伙人使用的一笔外包费缺少合同，项目没交付，但这位合伙人掌握着主要客户关系。",
      stake: "你要在保护现金流和维持合伙人信任之间做判断。"
    },
    highPotential: {
      context:
        "你协助财务做预算审计时发现异常支出，但直接汇报会得罪一位跨部门负责人。",
      stake: "你如何用非正式影响力推动事实被看见？"
    }
  },
  c2n1: {
    parachute: {
      context:
        "组织架构调整后你的直属上级突然调走，授权悬空，CEO 说“先干起来，授权再谈”。",
      stake: "你要先争取资源，还是先用成果换授权？"
    },
    founder: {
      context:
        "投资人说下个月才会到账，但团队已经需要采购、招人，你没有任何正式授权文件。",
      stake: "你要先证明项目能跑，还是先逼投资人明确承诺？"
    },
    highPotential: {
      context:
        "你被授权推进一个创新项目，但没有预算和人手，所有支持都只是口头承诺。",
      stake: "你要先做出小胜利，还是先向上要明确权力？"
    }
  },
  c2n2: {
    parachute: {
      context:
        "你召开第一次全员会，团队怀疑你要裁员，有人当面问尖锐问题，有人沉默。",
      stake: "你如何用一场会建立第一波信任？"
    },
    founder: {
      context:
        "你第一次召集全员会，老员工质疑你过度扩张，新员工担心公司方向不清楚。",
      stake: "你如何在混乱中找到共同目标？"
    },
    highPotential: {
      context:
        "你作为项目牵头人第一次召集跨部门会议，但每个部门都在谈自己的 KPI。",
      stake: "你如何让会议从立场争吵变成共同方案？"
    }
  },
  c3n1: {
    parachute: {
      context:
        "你接管团队后要提交精简名单，有人能力强但关系存疑，有人平庸但掌握客户。",
      stake: "你要用人岗匹配决定去留，还是用忠诚度决定去留？"
    },
    founder: {
      context:
        "你发现团队里最能打的人开始掌控核心客户，公司人才结构过度依赖某几个人。",
      stake: "你要重组关键岗位，还是继续依赖少数明星？"
    },
    highPotential: {
      context:
        "你被邀请参与人才盘点，部门负责人希望你能给出不偏袒任何人的判断。",
      stake: "你如何在组织政治中坚持专业判断？"
    }
  },
  c3n2: {
    parachute: {
      context:
        "项目连续出问题，团队习惯把问题推给你，你发现一位年轻骨干能独立解决大部分问题。",
      stake: "你要继续当救火队长，还是真正授权？"
    },
    founder: {
      context:
        "公司订单一多，你发现自己成了唯一能解决问题的人，连办公室网络都要你修。",
      stake: "你要继续亲自把关，还是把责任还回去？"
    },
    highPotential: {
      context:
        "你发现一个初级同事能独立解决问题，但他总在等你确认，因为跨部门都把他当成传话筒。",
      stake: "你要替他扛责任，还是帮他建立自主决策空间？"
    }
  },
  c4n1: {
    parachute: {
      context:
        "你推动新流程，资历深厚的运营负责人公开反对，他的顾虑确实存在。",
      stake: "你要压制反对，还是把反对者变成方案负责人？"
    },
    founder: {
      context:
        "你想改变产品方向，但联合创始人公开反对，他认为现有客户会流失。",
      stake: "你要用数据说服，还是用创始人权力强推？"
    },
    highPotential: {
      context:
        "你提出的新流程被资深负责人反对，你没有职位权力，但方案确实有漏洞。",
      stake: "你要如何让反对者愿意和你一起修改方案？"
    }
  },
  c4n2: {
    parachute: {
      context:
        "产品、销售、研发三部门互相推责，一个客户项目停了十天，CEO 让你牵头解决。",
      stake: "你要如何跨越没有直属权力的部门墙？"
    },
    founder: {
      context:
        "你的创业团队开始出现部门墙，产品怪销售乱承诺，销售怪产品不交付。",
      stake: "你要如何用目标而不是命令重新组织协作？"
    },
    highPotential: {
      context:
        "跨部门项目陷入僵局，你既不是产品负责人也不是销售负责人，但所有人都等你给方案。",
      stake: "你要如何在没有指挥权的情况下推动行动？"
    }
  },
  c5n1: {
    parachute: {
      context:
        "公司给你定下收入翻倍目标，但团队只会点头，没人知道明天该做什么。",
      stake: "你要如何把口号拆成可执行的关键结果？"
    },
    founder: {
      context:
        "投资人给你定下增长目标，但产品、销售和研发各有各的优先级。",
      stake: "你要如何让团队围绕同一个目标排兵布阵？"
    },
    highPotential: {
      context:
        "你被要求带领跨部门小组完成季度目标，但没有人真正向你汇报。",
      stake: "你要如何用目标管理代替行政命令？"
    }
  },
  c5n2: {
    parachute: {
      context:
        "季度还有十五天，目标缺口 30%，团队已经连续加班，士气下降。",
      stake: "你要如何在不透支团队的情况下完成冲刺？"
    },
    founder: {
      context:
        "现金流只能再撑一个月，产品还没跑通收入，团队已经在超负荷工作。",
      stake: "你要如何重新排优先级，保住最关键的现金流？"
    },
    highPotential: {
      context:
        "项目交付日临近，关键成员被抽走，剩余团队已经连续加班。",
      stake: "你要如何向更高层要资源，而不是简单加码？"
    }
  },
  c6n1: {
    parachute: {
      context:
        "你发现 CFO 和销售副总绕过你直接决策，你的批示在系统中只是“参考意见”。",
      stake: "你要如何用制度重新划定权力边界？"
    },
    founder: {
      context:
        "合伙人开始绕过你直接决策，你发现自己名义上是 CEO，实际上被架空。",
      stake: "你要如何重建决策机制，而不是公开摊牌？"
    },
    highPotential: {
      context:
        "你的项目被更高层直接指挥，关键决定都绕过了你，但你还要为结果负责。",
      stake: "你要如何守住项目主导权？"
    }
  },
  c6n2: {
    parachute: {
      context:
        "核心下属开始越级汇报，并在 CEO 面前曲解你的决策，团队都看在眼里。",
      stake: "你要如何处理越级汇报而不显得心胸狭窄？"
    },
    founder: {
      context:
        "一个资深员工开始绕过你直接找投资人，投资人开始质疑你的管理能力。",
      stake: "你要如何同时守住内部纪律和投资人信任？"
    },
    highPotential: {
      context:
        "你的项目成员开始跳过你向部门负责人汇报，部门负责人开始自行决定项目方向。",
      stake: "你要如何用机制保护项目的一致性？"
    }
  },
  c7n1: {
    parachute: {
      context:
        "公司准备让你晋升，要求你提名接班人：一个能力强但和你不够亲近，一个忠诚但能力待提升。",
      stake: "你要选能力，还是选延续性？"
    },
    founder: {
      context:
        "你准备培养一个联合创始人接班，但候选人在业务能力和团队信任之间有明显差异。",
      stake: "你要如何建立不依赖任何个人的梯队？"
    },
    highPotential: {
      context:
        "你被要求推荐下一任项目负责人，候选人包括能力强的竞争者和关系好的同事。",
      stake: "你要如何给出不偏私但又能被组织接受的建议？"
    }
  },
  c7n2: {
    parachute: {
      context:
        "你发现很多好经验只存在你脑子里，你一离开，团队就回到老路。",
      stake: "你要如何把个人判断变成组织能力？"
    },
    founder: {
      context:
        "公司所有关键决策都要经过你，你生病一天业务就停一半。",
      stake: "你要如何把创始人经验制度化和产品化？"
    },
    highPotential: {
      context:
        "你负责的项目高度依赖你个人的沟通网络，你一休假项目就停滞。",
      stake: "你要如何把个人关系变成团队流程？"
    }
  },
  c8n1: {
    parachute: {
      context:
        "财务告诉你下月现金流只够发 60% 工资，最大客户突然暂停付款。",
      stake: "你要如何在 48 小时内稳住局面？"
    },
    founder: {
      context:
        "你的最大客户突然暂停付款，账面现金只够活一个月，投资还没到账。",
      stake: "你要如何同时解决现金流和客户关系？"
    },
    highPotential: {
      context:
        "你负责的关键项目被砍预算，团队和供应商同时向你要答案。",
      stake: "你要如何在资源被抽走时保护核心交付？"
    }
  },
  c8n2: {
    parachute: {
      context:
        "明星销售带着核心客户跳槽，客户说“我们不是被挖走的，是被服务拖走的”。",
      stake: "你要如何同时处理客户流失、团队信心和系统漏洞？"
    },
    founder: {
      context:
        "你的核心销售带着最大客户离职，留下的客户也开始质疑服务能力。",
      stake: "你要如何防止单个关键人成为公司命脉？"
    },
    highPotential: {
      context:
        "项目关键成员跳槽，客户开始要求换人，团队担心项目会失败。",
      stake: "你要如何重建客户信任并防止知识断层？"
    }
  },
  c9n1: {
    parachute: {
      context:
        "你的改革成功了，CEO 想让你进入更高层，但你知道离开会留下交接断层。",
      stake: "你要如何让成功在离开后延续？"
    },
    founder: {
      context:
        "公司终于稳定下来，投资人想让你去做更大平台，但你担心创始团队会失控。",
      stake: "你要如何完成个人与组织的权力交接？"
    },
    highPotential: {
      context:
        "你即将晋升，但接替你的人还没有完全准备好，项目也正处在关键节点。",
      stake: "你要如何安全地完成交接？"
    }
  },
  c9n2: {
    parachute: {
      context:
        "你离开前要决定是否继续投入一条高毛利但高风险的创新业务。",
      stake: "你要留给组织一个结论，还是一套决策方法？"
    },
    founder: {
      context:
        "你准备寻找第二增长曲线，但新业务烧钱已久，团队还想再坚持半年。",
      stake: "你要如何定义继续投入还是止损的检查点？"
    },
    highPotential: {
      context:
        "你负责的新项目已经烧钱很久，团队想继续，但组织开始要求你给出终局判断。",
      stake: "你要如何用结构思考替团队建立决策标准？"
    }
  }
};

Object.assign(ROLE_NODE_VARIANTS, EXTRA_MAIN_ROLE_VARIANTS);

export function getNodeForRole(
  role: RoleId,
  nodeId: string
): StoryNode {
  const base = getNode(nodeId);
  const variant = ROLE_NODE_VARIANTS[nodeId]?.[role];
  if (!variant) {
    return base;
  }
  const options = base.options.map((option, index) => {
    const set = ROLE_OPTION_SETS[role][option.quality];
    const variantIndex =
      (stringHash(`${nodeId}-${role}-${index}`) + index) % set.length;
    const view = set[variantIndex];
    return {
      ...option,
      label: view.label,
      summary: view.summary,
      feedback:
        base.kind === "main"
          ? `${view.feedback} 判断依据：${option.feedback}`
          : view.feedback,
      theory: option.theory
    };
  });
  return {
    ...base,
    title: variant.title ?? base.title,
    context: variant.context ?? base.context,
    stake: variant.stake ?? base.stake,
    options
  };
}

function stringHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 997;
  }
  return hash;
}

const BRANCH_TEMPLATES: Record<
  number,
  { title: string; context: string; stake: string }
> = {
  2: {
    title: "授权真空下的第一选择",
    context:
      "你在授权不完整时已经迈出第一步。现在团队正看着你会把第一份资源、第一个承诺投到哪里。",
    stake: "你要用一次行动证明：即使在授权真空里，你也能建立可预期的判断。"
  },
  3: {
    title: "人才配置的第一次落子",
    context:
      "你开始重组关键岗位。每个人都在猜自己是否安全，你的第一个人事动作会被当成未来规则。",
    stake: "你要让组织看到：人才判断的标准不是亲疏，而是未来成果。"
  },
  4: {
    title: "阻力面前的第一次同盟",
    context:
      "反对声开始出现。你没有选择压制，而是需要决定：让谁进入共同责任，又让谁保持监督。",
    stake: "你要把阻力转成同盟，而不是把反对者变成更深的敌人。"
  },
  5: {
    title: "目标落地的第一次拆解",
    context:
      "大目标已经摆在桌上。团队等待的不是又一次动员，而是第一份能被检查的关键结果。",
    stake: "你要把口号变成每天可验收的行动，并让每个人知道自己的那部分。"
  },
  6: {
    title: "权力边界的第一次固化",
    context:
      "有人开始绕过你决策。你要用制度重新定义边界，而不是只靠一次谈话。",
    stake: "你要让组织形成“重大决策必须进入闭环”的默认规则。"
  },
  7: {
    title: "组织能力的第一次沉淀",
    context:
      "你的个人判断正在支撑关键业务。你需要决定：哪些经验必须变成流程，哪些留给个人。",
    stake: "你要让组织开始离开你也能运行，而不是继续依赖你的反应速度。"
  },
  8: {
    title: "危机中的第一次隔离",
    context:
      "危机已经出现。你必须在信息不全时决定：先保护什么，先放弃什么，先让谁行动。",
    stake: "你要用最快速度缩小风险范围，同时不让团队陷入恐慌。"
  },
  9: {
    title: "成业前的最后一次选择",
    context:
      "你已经证明了能力，现在要证明系统。你留下的最后一个决策，会成为组织未来的判断模板。",
    stake: "你要让组织记住的不是你的答案，而是你决策时使用的方法。"
  }
};

const ROLE_IDS: RoleId[] = ["parachute", "founder", "highPotential"];
const BRANCH_QUALITIES: OptionQuality[] = ["expert", "partial", "risk"];

function buildBranchNodes(): void {
  for (const chapter of CHAPTERS) {
    if (chapter.id === 1) {
      continue;
    }
    const template = BRANCH_TEMPLATES[chapter.id];
    const entry = STORY_NODES.find((node) => node.id === `c${chapter.id}n1`);
    if (entry?.options[0]) {
      entry.options[0].branchTo = {
        parachute: `c${chapter.id}b-parachute`,
        founder: `c${chapter.id}b-founder`,
        highPotential: `c${chapter.id}b-highPotential`
      };
    }
    for (const role of ROLE_IDS) {
      const id = `c${chapter.id}b-${role}`;
      if (STORY_NODES.some((node) => node.id === id)) {
        continue;
      }
      STORY_NODES.push({
        id,
        chapterId: chapter.id,
        title: `${roleName(role)} · ${template.title}`,
        kind: "branch",
        context: `${template.context} ${BRANCH_ROLE_CONTEXT_ZH[id] ?? roleLens(role)}`,
        stake: template.stake,
        options: BRANCH_QUALITIES.map((quality, index) => {
          const handwritten = branchVariantFor(chapter.id, quality, "zh");
          const view =
            handwritten ?? ROLE_OPTION_SETS[role][quality][index % 3];
          const effects: Partial<Record<AbilityId, number>> =
            quality === "expert"
              ? { [chapter.focus[0]]: 3, [chapter.focus[1]]: 1 }
              : quality === "partial"
                ? { [chapter.focus[0]]: 2 }
                : { recovery: 2 };
          return {
            label: view.label,
            summary: view.summary,
            quality,
            effects,
            resources:
              quality === "expert"
                ? { energy: -6, trust: 7, influence: 5 }
                : quality === "partial"
                  ? { energy: -6, trust: 2, influence: 2 }
                  : { energy: -7, trust: -5, influence: -2 },
            feedback: view.feedback,
            theory: handwritten
              ? handwritten.theory
              : CHAPTER_REFLECTIONS[chapter.id]
          };
        })
      });
      NODE_INTEL[id] = [
        chapter.title,
        chapter.subtitle,
        ROLE_OPTION_SETS[role].expert[0].summary
      ];
    }
  }
}

function roleName(role: RoleId): string {
  return role === "parachute"
    ? "空降"
    : role === "founder"
      ? "创业"
      : "高潜";
}

function roleLens(role: RoleId): string {
  return role === "parachute"
    ? "你更关注权力结构与可信度。"
    : role === "founder"
      ? "你更关注现金流与可验证结果。"
      : "你更关注横向共识与影响力。";
}

buildBranchNodes();

export function duelNodes(
  count: number,
  seed: number,
  seenIds: string[] = []
): StoryNode[] {
  const seen = new Set(seenIds);
  const unseen = DUEL_BANK.filter((node) => !seen.has(node.id));
  const alreadySeen = DUEL_BANK.filter((node) => seen.has(node.id));
  const pool =
    unseen.length >= count ? unseen : [...unseen, ...alreadySeen];
  const shifted = pool.map((node, index) => {
    let state = (seed * 31 + index * 17 + node.id.length * 7) >>> 0;
    state = Math.imul(state ^ (state >>> 15), state | 1);
    state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
    return {
      node,
      score: (state ^ (state >>> 14)) >>> 0
    };
  });
  shifted.sort((a, b) => a.score - b.score);
  return shifted
    .slice(0, Math.min(count, shifted.length))
    .map((item, index) => shuffleDuelOptions(item.node, seed * 17 + index * 29));
}
