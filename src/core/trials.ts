import { abilityLevel } from "./abilities.ts";
import { EXPANDED_TRAINING } from "./trainingExtras.ts";
import { shuffleOptions } from "./shuffle.ts";
import type {
  AbilityId,
  LeadershipDimension,
  SaveState
} from "./types.ts";

export interface TrialQuestion {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  referenceAnswer: string;
  followUp?: {
    prompt: string;
    options: string[];
    answer: number;
    explanation: string;
    referenceAnswer: string;
  };
  calculation?: {
    prompt: string;
    answer: number;
    unit: string;
  };
}

export type TrialQuestionSource =
  | {
      kind: "training";
      abilityId: AbilityId;
      questionIndex: number;
    }
  | {
      kind: "custom";
      question: TrialQuestion;
    };

export interface TrialGate {
  abilityId: AbilityId;
  level: number;
}

export interface TrialStageDef {
  id: string;
  order: number;
  name: string;
  boss: string;
  style: "solo" | "wolf" | "alliance";
  gates: TrialGate[];
  minChapter?: number;
  minInfluence?: number;
  resourceCost?: number;
  clue?: string;
  scene?: string;
  resolution?: string;
  allies?: string[];
  correctAlly?: string;
  suspects?: string[];
  correctSuspect?: string;
  intelChoices?: string[];
  correctIntel?: string;
  betrayalChoices?: string[];
  correctBetrayal?: string;
  staminaCost: number;
  rewardExp: number;
  rewardItem?: string;
  rewardUnlock?: string;
  source: TrialQuestionSource;
  dimension?: LeadershipDimension;
}

export interface PracticeTaskDef {
  id: string;
  title: string;
  source: string;
  quote: string;
  action: string;
  keywords: string[];
  rewardEnergy: number;
  rewardExp: number;
  rewardAbility: AbilityId;
}

export const TRIAL_STAGES: TrialStageDef[] = [
  {
    id: "trial_insight",
    order: 1,
    name: "识人试炼",
    boss: "伪装者",
    style: "wolf",
    scene:
      "深夜的办公室只亮着一盏灯。三份匿名材料摆在桌上：行政主管指出财务经理改过报销单，年轻骨干提交了聊天记录，财务经理本人则递来一份年度对账表。",
    clue: "真正动机藏在他如何处理失败和功劳上，先判断谁在压力下仍愿意暴露信息。",
    suspects: ["行政主管", "财务经理", "年轻骨干"],
    correctSuspect: "财务经理",
    resolution:
      "真相是财务经理利用前任遗留的审批空隙，把外包费用拆进三个科目。行政主管的举报来自流程直觉，年轻骨干的证据链最完整，但只有把合同、付款和交付物拉到同一张表上，才能真正锁定动机。",
    gates: [{ abilityId: "insight", level: 1 }],
    staminaCost: 8,
    rewardExp: 2,
    rewardItem: "识人罗盘",
    rewardUnlock: "解锁“识人”进阶情境",
    source: { kind: "training", abilityId: "insight", questionIndex: 0 }
  },
  {
    id: "trial_deploy",
    order: 2,
    name: "用人试炼",
    boss: "错位岗位",
    style: "solo",
    gates: [{ abilityId: "deploy", level: 1 }],
    staminaCost: 8,
    rewardExp: 2,
    rewardItem: "用人清单",
    rewardUnlock: "解锁“用人”进阶情境",
    source: { kind: "training", abilityId: "deploy", questionIndex: 0 }
  },
  {
    id: "trial_mobilize",
    order: 3,
    name: "驭人试炼",
    boss: "冷面同盟",
    style: "alliance",
    scene:
      "冷面同盟把两份合作方案推到你面前：运营负责人愿意共享交付数据，客户负责人只肯给客户名单。你必须在三分钟内决定与谁结盟。",
    allies: ["运营负责人", "客户负责人"],
    correctAlly: "运营负责人",
    resolution:
      "与运营负责人结盟是正确的：交付数据能证明你推进的变革真实可靠；客户名单只会让你陷入客户关系的资源竞争。交换全部情报后，双方都获得了可验证的信任。",
    intelChoices: ["交付数据", "客户名单", "反对者名单"],
    correctIntel: "交付数据",
    betrayalChoices: ["交换全部情报", "保留客户名单"],
    correctBetrayal: "交换全部情报",
    gates: [{ abilityId: "mobilize", level: 1 }],
    staminaCost: 8,
    rewardExp: 2,
    rewardItem: "同盟令",
    rewardUnlock: "解锁“驭人”进阶情境",
    source: { kind: "training", abilityId: "mobilize", questionIndex: 0 }
  },
  {
    id: "trial_strategy",
    order: 4,
    name: "谋权试炼",
    boss: "势能缺口",
    style: "alliance",
    scene:
      "势能缺口会议上，财务负责人和产品负责人都想成为你的主盟。财务手里有现金流数据，产品手里有路线图，但会议只剩一个席位。",
    allies: ["财务负责人", "产品负责人"],
    correctAlly: "财务负责人",
    resolution:
      "财务负责人是正确盟友：现金流数据决定了变革的可行性边界。交换现金流数据后，你可以在资源约束内设计策略，而不是被产品愿景牵着走。",
    intelChoices: ["现金流数据", "产品路线图", "组织架构"],
    correctIntel: "现金流数据",
    betrayalChoices: ["交换现金流数据", "保留关键数据"],
    correctBetrayal: "交换现金流数据",
    gates: [{ abilityId: "strategy", level: 2 }],
    staminaCost: 10,
    rewardExp: 3,
    rewardItem: "谋势棋谱",
    rewardUnlock: "解锁“谋权”进阶情境",
    source: { kind: "training", abilityId: "strategy", questionIndex: 0 }
  },
  {
    id: "trial_authority",
    order: 5,
    name: "掌权试炼",
    boss: "越权者",
    style: "solo",
    gates: [{ abilityId: "authority", level: 2 }],
    staminaCost: 10,
    rewardExp: 3,
    rewardItem: "联签印",
    rewardUnlock: "解锁“掌权”进阶情境",
    source: { kind: "training", abilityId: "authority", questionIndex: 0 }
  },
  {
    id: "trial_stability",
    order: 6,
    name: "固权试炼",
    boss: "断代危机",
    style: "solo",
    gates: [{ abilityId: "stability", level: 2 }],
    staminaCost: 10,
    rewardExp: 3,
    rewardItem: "传承册",
    rewardUnlock: "解锁“固权”进阶情境",
    source: { kind: "training", abilityId: "stability", questionIndex: 0 }
  },
  {
    id: "trial_recovery",
    order: 7,
    name: "自愈试炼",
    boss: "疲惫迷雾",
    style: "solo",
    gates: [{ abilityId: "recovery", level: 2 }],
    staminaCost: 10,
    rewardExp: 3,
    rewardItem: "重启铃",
    rewardUnlock: "解锁“情绪自愈”进阶情境",
    source: { kind: "training", abilityId: "recovery", questionIndex: 0 }
  },
  {
    id: "trial_execution",
    order: 8,
    name: "执行试炼",
    boss: "目标缺口",
    style: "solo",
    gates: [{ abilityId: "execution", level: 3 }],
    staminaCost: 12,
    rewardExp: 4,
    rewardItem: "验收剑",
    rewardUnlock: "解锁“执行”进阶情境",
    source: { kind: "training", abilityId: "execution", questionIndex: 0 }
  },
  {
    id: "trial_structure",
    order: 9,
    name: "结构试炼",
    boss: "迷雾矩阵",
    style: "wolf",
    scene:
      "迷雾矩阵的审批中心里，80% 的单据卡在同一个节点。客服主管指责财务主管拖延，财务主管反指流程主管改规则，流程主管拿出一份三个月前的流程图。",
    clue: "主要矛盾往往藏在 80% 单据被卡住的同一个审批节点。",
    suspects: ["客服主管", "流程主管", "财务主管"],
    correctSuspect: "流程主管",
    resolution:
      "真正的问题在流程主管：他在三个月前悄悄调整了审批链路，让 80% 单据必须经过他的人工复核。客服与财务的争吵只是表象，主要矛盾藏在流程本身。",
    gates: [{ abilityId: "structure", level: 3 }],
    staminaCost: 12,
    rewardExp: 4,
    rewardItem: "矛盾镜",
    rewardUnlock: "解锁“结构思考”进阶情境",
    source: { kind: "training", abilityId: "structure", questionIndex: 0 }
  },
  {
    id: "trial_communication",
    order: 10,
    name: "协同试炼",
    boss: "信息高墙",
    style: "alliance",
    scene:
      "信息高墙两侧，研发负责人和客户成功负责人同时递来合作书。研发想共享部门预算，客户成功想共享客户验收标准。",
    allies: ["研发负责人", "客户成功负责人"],
    correctAlly: "客户成功负责人",
    resolution:
      "客户成功负责人是正确盟友：客户验收标准决定了交付是否真正完成。共享验收标准后，研发、客户与你会形成同一套验收语言。",
    intelChoices: ["客户验收标准", "部门预算", "人事调整"],
    correctIntel: "客户验收标准",
    betrayalChoices: ["共享验收标准", "保留部门预算"],
    correctBetrayal: "共享验收标准",
    gates: [{ abilityId: "communication", level: 3 }],
    staminaCost: 12,
    rewardExp: 4,
    rewardItem: "共识图",
    rewardUnlock: "解锁“协同沟通”进阶情境",
    source: { kind: "training", abilityId: "communication", questionIndex: 0 }
  },
  {
    id: "mba_cashflow",
    order: 11,
    name: "MBA 现金流危机",
    boss: "现金流悬崖",
    style: "alliance",
    scene:
      "现金流悬崖的沙盘室里，财务负责人带来现金贡献地图，品牌负责人带来品牌预算表。银行只给你一次汇报机会。",
    allies: ["财务负责人", "品牌负责人"],
    correctAlly: "财务负责人",
    resolution:
      "财务负责人和现金贡献地图是正确选择：只有知道哪个区域真正贡献现金，才能回答银行最关心的 EBITDA 转正问题。品牌预算应作为后续验证项，而不是第一决策依据。",
    intelChoices: ["现金贡献地图", "品牌预算", "银行条款"],
    correctIntel: "现金贡献地图",
    betrayalChoices: ["共享现金贡献地图", "保留银行条款"],
    correctBetrayal: "共享现金贡献地图",
    gates: [
      { abilityId: "structure", level: 4 },
      { abilityId: "execution", level: 3 }
    ],
    minChapter: 5,
    minInfluence: 50,
    resourceCost: 20,
    staminaCost: 16,
    rewardExp: 6,
    rewardItem: "现金流沙盘",
    rewardUnlock: "解锁“财务决策”进阶情境",
    source: {
      kind: "custom",
      question: {
        prompt:
          "某连锁餐饮集团 6 个区域中，3 个区域盈利、2 个区域微亏、1 个区域严重亏损但贡献品牌影响力。总部现金只够维持 90 天，银行要求下季度 EBITDA 转正。你作为新任首席运营官，最优先的方案是什么？",
        options: [
          "先做全公司成本-客户-现金流地图，找出 20% 门店贡献 80% 现金，再决定关店、提价和采购集中",
          "先砍掉严重亏损区域，因为亏损会拖垮整体利润",
          "先向银行承诺整体增长，同时提高所有门店价格"
        ],
        answer: 0,
        explanation:
          "MBA 式现金流题的核心是先识别现金贡献结构，再动刀。砍亏损区域可能砍掉未来品牌现金流，全面提价可能赶走现金贡献最大的客户。",
        referenceAnswer: "先做成本-客户-现金流地图，找出现金贡献结构再决策。",
        followUp: {
          prompt:
            "现金流转正计划已经通过，但品牌区域负责人反对关店，银行要求下季度 EBITDA 转正。你会如何调整？",
          options: [
            "保留品牌店但设 60 天验证节点，关店与否由现金贡献和品牌影响数据共同决定",
            "立即关店，确保 EBITDA 数字达标",
            "向银行争取更多时间并维持现状"
          ],
          answer: 0,
          explanation:
            "多阶段决策要同时管理财务目标、组织情绪和验证周期。给品牌店设验证节点，比立刻关店或维持现状更可执行。",
          referenceAnswer: "保留品牌店但设 60 天验证节点。"
        },
        calculation: {
          prompt:
            "假设总现金 3000 万，固定成本 1200 万，变动成本率为 60%。需要多少收入（万元）才能刚好覆盖成本？",
          answer: 3000,
          unit: "万元"
        }
      }
    }
  },
  {
    id: "mba_supplychain",
    order: 12,
    name: "MBA 供应链危机",
    boss: "断链海啸",
    style: "wolf",
    scene:
      "断链海啸的作战室里，采购、销售、财务各拿一份数据。采购说高价保交付，销售说客户交期不可变，财务警告现金流，但只有一个人的数据能解释断链根源。",
    clue: "采购、销售、财务都在用一个立场解释同一组数据，先找谁最接近客户真实交付。",
    suspects: ["采购负责人", "销售负责人", "财务负责人"],
    correctSuspect: "采购负责人",
    resolution:
      "真正掌握断链源头的是采购负责人：他的单一供应商决策和延迟预警，才是危机的起点。销售与财务的立场都是结果，不是原因。",
    gates: [
      { abilityId: "strategy", level: 4 },
      { abilityId: "authority", level: 3 }
    ],
    minChapter: 6,
    minInfluence: 55,
    resourceCost: 25,
    staminaCost: 16,
    rewardExp: 6,
    rewardItem: "供应链沙盘",
    rewardUnlock: "解锁“采购与成本”进阶情境",
    source: {
      kind: "custom",
      question: {
        prompt:
          "核心供应商突然停止供货，替代供应商报价高 30%，采购团队建议接受高价保交付，销售团队坚持客户交期不可变，财务团队警告现金流。你如何同时处理成本、交期和长期依赖风险？",
        options: [
          "建立“72 小时应急交付 + 30 天替代供应商认证 + 关键物料双源”的组合方案，并同步三个部门负责人",
          "直接接受高价保客户，客户交期高于一切",
          "要求采购和销售自行解决，避免越级决策"
        ],
        answer: 0,
        explanation:
          "这不是单点采购题，而是供应链、销售承诺、财务现金流的联合决策。正确做法是同时管理短期交付、中期替代源和长期结构风险。",
        referenceAnswer: "用应急交付、替代认证和双源机制组成组合方案。",
        calculation: {
          prompt: "替换供应商报价高 30%。原材料年采购额 1200 万元，替换后年采购成本增加多少万元？",
          answer: 360,
          unit: "万元"
        },
        followUp: {
          prompt:
            "替代供应商已给出报价，但客户要求 72 小时内交付。你的组合方案里哪个环节最优先？",
          options: [
            "先锁 72 小时应急交付，再并行推进替代认证",
            "先压低替代供应商价格",
            "先追责采购团队为何出现单一供应"
          ],
          answer: 0,
          explanation:
            "在多阶段供应链危机里，客户交期是当前最硬的约束，价格和追责应放到交付稳定之后。",
          referenceAnswer: "先锁 72 小时应急交付。"
        }
      }
    }
  },
  {
    id: "mba_people",
    order: 13,
    name: "MBA 人才梯队",
    boss: "梯队断层",
    style: "alliance",
    scene:
      "梯队断层评审会上，HR 负责人带来薪酬数据，业务负责人带来岗位成果标准。你要决定谁进入陪跑计划的核心。",
    allies: ["HR 负责人", "业务负责人"],
    correctAlly: "业务负责人",
    resolution:
      "业务负责人和岗位成果标准是正确选择：梯队建设要按岗位成果培养，而不是按薪酬或离职风险培养。共享成果标准后，HR 与业务第一次用同一把尺子评估人才。",
    intelChoices: ["岗位成果标准", "薪酬数据", "离职名单"],
    correctIntel: "岗位成果标准",
    betrayalChoices: ["共享岗位成果标准", "保留薪酬数据"],
    correctBetrayal: "共享岗位成果标准",
    gates: [
      { abilityId: "deploy", level: 4 },
      { abilityId: "communication", level: 3 }
    ],
    minChapter: 7,
    minInfluence: 55,
    resourceCost: 25,
    staminaCost: 16,
    rewardExp: 6,
    rewardItem: "人才梯队图",
    rewardUnlock: "解锁“人才发展”进阶情境",
    source: {
      kind: "custom",
      question: {
        prompt:
          "公司核心岗位依赖 3 位明星员工，但 5 位高潜员工因看不到晋升通道而准备离职。HR 建议快速升职，业务负责人担心能力不足。你作为高管，如何建立人才梯队？",
        options: [
          "先定义三个核心岗位的成果标准，再给高潜员工 90 天陪跑计划，并让明星员工带教形成接班人",
          "立即提拔高潜员工，避免他们流失",
          "维持现状，等明星员工离开后再考虑梯队"
        ],
        answer: 0,
        explanation:
          "人才梯队不是提拔或压制二选一，而是用岗位成果、带教机制和陪跑周期同时管理组织连续性与个人动机。",
        referenceAnswer: "定义成果标准，用陪跑计划和带教机制建设梯队。",
        calculation: {
          prompt:
            "5 名高潜员工每人 90 天陪跑共 90 小时，其中 40 小时由外部课程覆盖，其余由 2 名导师带教。每名导师平均带教多少小时？",
          answer: 25,
          unit: "小时"
        },
        followUp: {
          prompt:
            "高潜员工表示 90 天陪跑太长，希望立刻有明确晋升通道。你如何调整？",
          options: [
            "把 90 天拆成 30/60/90 三个可验证节点并公开标准",
            "立即承诺晋升，避免人才流失",
            "拒绝调整，维持原计划"
          ],
          answer: 0,
          explanation:
            "高潜人才需要的是可见路径，不是立刻承诺。公开阶段节点能同时保护组织标准和个体动机。",
          referenceAnswer: "拆成 30/60/90 三个可验证节点。"
        }
      }
    }
  },
  {
    id: "domain_marketing",
    order: 14,
    name: "营销增长实战",
    boss: "预算放大器",
    style: "alliance",
    scene:
      "预算放大器会议上，市场负责人带来广告预算，销售负责人带来渠道转化数据。新品只有一笔验证预算。",
    allies: ["市场负责人", "销售负责人"],
    correctAlly: "销售负责人",
    resolution:
      "销售负责人和渠道转化数据是正确选择：验证预算应该投给已经被转化数据证明的渠道。广告预算适合验证之后放大，而不是在验证之前烧掉。",
    intelChoices: ["渠道转化数据", "广告预算", "竞品方案"],
    correctIntel: "渠道转化数据",
    betrayalChoices: ["共享渠道转化数据", "保留广告预算"],
    correctBetrayal: "共享渠道转化数据",
    gates: [{ abilityId: "structure", level: 3 }],
    minChapter: 5,
    staminaCost: 14,
    rewardExp: 5,
    rewardItem: "营销验证盘",
    rewardUnlock: "解锁“营销”进阶情境",
    source: {
      kind: "custom",
      question: {
        prompt:
          "新品上线前，市场部希望大预算曝光，销售部希望先验证渠道，CEO 要求下季度增长。你的第一决策是什么？",
        options: [
          "先用三个低预算渠道做 30 天验证，按转化率再放大投入",
          "按市场部方案全面铺开，抢占市场窗口",
          "先不投放，等产品功能更完善"
        ],
        answer: 0,
        explanation:
          "营销增长应先用小成本验证转化假设，再放大预算；过早全面铺开容易把资源烧在没有验证的渠道上。",
        referenceAnswer: "用三个低预算渠道做 30 天验证。",
        calculation: {
          prompt:
            "三个低预算渠道各投入 2 万元，30 天验证后转化率最高的渠道 ROI 为 3。该渠道带来多少万元收入？",
          answer: 6,
          unit: "万元"
        }
      }
    }
  },
  {
    id: "domain_finance",
    order: 15,
    name: "财务税务实战",
    boss: "成本迷雾",
    style: "wolf",
    scene:
      "成本迷雾的报表室里，财务经理、采购经理、销售经理各执一词。同一批项目数据在三张报表里出现了三个口径。",
    clue: "同一批项目数据在不同报表里口径不一致，先统一科目，再判断真实利润。",
    suspects: ["财务经理", "采购经理", "销售经理"],
    correctSuspect: "采购经理",
    resolution:
      "真正的问题在采购经理：他的发票与库存口径不一致，导致账面利润被高估。财务与销售只是按各自口径汇报，采购的数据才是污染源头。",
    gates: [{ abilityId: "execution", level: 3 }],
    minChapter: 5,
    staminaCost: 14,
    rewardExp: 5,
    rewardItem: "财务透视镜",
    rewardUnlock: "解锁“财务/税务”进阶情境",
    source: {
      kind: "custom",
      question: {
        prompt:
          "项目利润表面可观，但财务指出采购发票、库存成本和税务口径不一致。你如何处理？",
        options: [
          "先统一成本科目和发票/税务口径，再重算真实利润",
          "先按账面利润对外汇报",
          "让财务和采购自行处理"
        ],
        answer: 0,
        explanation:
          "财务判断必须基于同一套成本口径，否则账面利润可能掩盖真实风险。",
        referenceAnswer: "先统一成本科目和税务口径。",
        calculation: {
          prompt: "库存账面 800 万元，盘点差异 12%，真实库存应为多少万元？",
          answer: 704,
          unit: "万元"
        }
      }
    }
  },
  {
    id: "domain_legal",
    order: 16,
    name: "合同风险实战",
    boss: "模糊条款",
    style: "solo",
    gates: [{ abilityId: "structure", level: 3 }],
    minChapter: 5,
    staminaCost: 14,
    rewardExp: 5,
    rewardItem: "风险边界书",
    rewardUnlock: "解锁“法律/合规”进阶情境",
    source: {
      kind: "custom",
      question: {
        prompt:
          "重要客户要求先启动项目再补合同，法务提示付款条款和知识产权边界不清。你会怎么做？",
        options: [
          "先签风险边界清晰的三页临时协议再启动",
          "先启动维护客户关系，合同后补",
          "拒绝启动，等完整合同签完"
        ],
        answer: 0,
        explanation:
          "商业机会和风险边界可以同时管理；没有边界地先启动，会把付款、IP 和验收责任都变成不确定。",
        referenceAnswer: "先签三页临时协议，明确风险边界。",
        calculation: {
          prompt:
            "临时协议共 3 页，付款条款占 1 页，知识产权边界占半页，验收与交付占半页。剩余违约与退出条款占多少页？",
          answer: 1,
          unit: "页"
        }
      }
    }
  },
  {
    id: "domain_customer",
    order: 17,
    name: "客户投诉实战",
    boss: "失控客户",
    style: "solo",
    gates: [{ abilityId: "communication", level: 3 }],
    minChapter: 5,
    staminaCost: 14,
    rewardExp: 5,
    rewardItem: "客户信任卡",
    rewardUnlock: "解锁“客户管理”进阶情境",
    source: {
      kind: "custom",
      question: {
        prompt:
          "大客户公开投诉交付延误，内部销售、研发、客服各执一词。你如何处理？",
        options: [
          "先给客户一个可验证的补救计划，再拉内部复盘",
          "先安抚客户情绪，不承诺任何时间",
          "先开内部追责会，再回应客户"
        ],
        answer: 0,
        explanation:
          "客户信任依赖可验证的补救承诺，内部追责应放在稳定客户之后。",
        referenceAnswer: "先给可验证的补救计划。",
        calculation: {
          prompt:
            "补救计划承诺 48 小时内给出根因，72 小时内给出整改时间表。两个承诺节点之间相隔多少小时？",
          answer: 24,
          unit: "小时"
        }
      }
    }
  },
  {
    id: "domain_employee",
    order: 18,
    name: "员工激励实战",
    boss: "两极团队",
    style: "alliance",
    scene:
      "两极团队的复盘室里，HR 负责人带来薪酬数据，业务负责人带来绩效数据。你要决定先稳住哪一类人。",
    allies: ["HR 负责人", "业务负责人"],
    correctAlly: "业务负责人",
    resolution:
      "业务负责人和绩效数据是正确选择：绩优与躺平的判断必须基于真实绩效，而不是薪酬或考勤。共享绩效数据后，激励方案第一次有了共同依据。",
    intelChoices: ["绩效数据", "薪酬数据", "考勤记录"],
    correctIntel: "绩效数据",
    betrayalChoices: ["共享绩效数据", "保留考勤记录"],
    correctBetrayal: "共享绩效数据",
    gates: [{ abilityId: "deploy", level: 3 }],
    minChapter: 5,
    staminaCost: 14,
    rewardExp: 5,
    rewardItem: "激励路线图",
    rewardUnlock: "解锁“员工管理”进阶情境",
    source: {
      kind: "custom",
      question: {
        prompt:
          "团队里绩优员工想离职，躺平员工消极对抗，你要同时稳住两类人。你会怎么做？",
        options: [
          "给绩优员工明确成长路径，同时给躺平员工设置清晰底线和帮扶机制",
          "重点挽留绩优员工，暂时忽略躺平员工",
          "公开批评躺平员工，展示管理决心"
        ],
        answer: 0,
        explanation:
          "激励不是二选一；绩优需要成长路径，躺平需要底线和重新启动的机制。",
        referenceAnswer: "同时给绩优成长路径，给躺平底线和帮扶机制。",
        calculation: {
          prompt:
            "团队共 20 人，绩优员工占 30%，躺平员工占 15%，其余为稳定执行者。稳定执行者有多少人？",
          answer: 11,
          unit: "人"
        }
      }
    }
  },
  {
    id: "domain_delivery",
    order: 19,
    name: "交付资源实战",
    boss: "资源争夺战",
    style: "wolf",
    scene:
      "资源争夺战的作战室里，项目负责人说资源被抽走，资源负责人说需求变更太多，客户负责人催交付。延期六周已经不可回避。",
    clue: "延期不是单一执行问题，先找到卡住交付的关键资源节点。",
    suspects: ["项目负责人", "资源负责人", "客户负责人"],
    correctSuspect: "资源负责人",
    resolution:
      "真正卡住交付的是资源负责人：他的资源分配记录显示，关键岗位的资源连续三周被更高优先级项目抽走。需求变更与客户催单都是结果。",
    gates: [{ abilityId: "execution", level: 3 }],
    minChapter: 5,
    staminaCost: 14,
    rewardExp: 5,
    rewardItem: "交付作战图",
    rewardUnlock: "解锁“交付与资源”进阶情境",
    source: {
      kind: "custom",
      question: {
        prompt:
          "项目交付严重延期，资源被更高优先级项目抽走，你要争取资源并完成交付。你会怎么做？",
        options: [
          "用可验证的交付风险清单和关键结果向高层争取资源",
          "接受现状，让团队加班追赶",
          "缩小范围，但不向上级说明"
        ],
        answer: 0,
        explanation:
          "资源争取需要风险清单和关键结果作为证据；默默加班或偷偷缩范围都会让组织失去校准机会。",
        referenceAnswer: "用交付风险清单和关键结果争取资源。",
        calculation: {
          prompt:
            "交付延期 6 周，其中 2 周来自资源被抽走、1 周来自验收流程，其余来自需求变更。需求变更占多少周？",
          answer: 3,
          unit: "周"
        }
      }
    }
  }
,
  {
    id: "dim_credibility",
    order: 20,
    name: "信服力试炼",
    boss: "言行裂缝",
    style: "solo",
    scene: "团队发现你承诺的晋升名单没有兑现，质疑开始蔓延。",
    resolution: "承认偏差、公开标准，并用可验证的行动重建信任。",
    gates: [{ abilityId: "authority", level: 3 }],
    minChapter: 5,
    staminaCost: 14,
    rewardExp: 4,
    rewardItem: "信誉账本",
    rewardUnlock: "解锁「以身作则」进阶情境",
    dimension: "credibility",
    source: { kind: "custom", question: { prompt: "团队发现你上季度承诺的晋升名单没有兑现，你该怎么做？", options: ["先公开承认偏差，再给出可验证的新标准", "解释客观限制，维持原有决定", "暂时不提，等下次机会"], answer: 0, explanation: "信服力来自言行一致；先承认偏差并给出可验证标准，才能重建尊重。", referenceAnswer: "公开承认偏差，并用可验证标准重建信任。" } }
  },
  {
    id: "dim_empathy",
    order: 21,
    name: "共情力试炼",
    boss: "沉默员工",
    style: "solo",
    scene: "一位连续加班的核心员工开始沉默，交付仍在继续，但团队氛围明显降温。",
    resolution: "先一对一倾听真实压力，再调整任务和资源。",
    gates: [{ abilityId: "communication", level: 3 }],
    minChapter: 5,
    staminaCost: 14,
    rewardExp: 4,
    rewardItem: "共情清单",
    rewardUnlock: "解锁「关怀团队」进阶情境",
    dimension: "empathy",
    source: { kind: "custom", question: { prompt: "核心员工连续加班后开始沉默，你如何回应？", options: ["先一对一倾听真实压力，再调整任务和资源", "公开表扬他的付出，继续推进", "给他放假，暂不过问原因"], answer: 0, explanation: "共情力靠关怀与有效沟通增长；先听懂压力，再给资源支持。", referenceAnswer: "先倾听压力，再调整任务和资源。" } }
  },
  {
    id: "dim_decisiveness",
    order: 22,
    name: "决断力试炼",
    boss: "两难岔路",
    style: "solo",
    scene: "两个方案都有人支持：一个保护现金流，一个抢占窗口期。会议只剩十五分钟。",
    resolution: "先明确必须守住的结果，再按优先次序拍板。",
    gates: [{ abilityId: "strategy", level: 3 }],
    minChapter: 5,
    staminaCost: 14,
    rewardExp: 4,
    rewardItem: "决策罗盘",
    rewardUnlock: "解锁「把控方向」进阶情境",
    dimension: "decisiveness",
    source: { kind: "custom", question: { prompt: "两个方案都有人支持，会议只剩十五分钟，你怎么办？", options: ["先明确必须守住的结果，再按优先次序拍板", "让两方再补充数据，下次再议", "先选支持人数更多的一方"], answer: 0, explanation: "决断力靠做对的事和把控方向增长；先定义不可退让的结果，再决策。", referenceAnswer: "先明确底线结果，再按优先级决策。" } }
  },
  {
    id: "dim_vision",
    order: 23,
    name: "格局力试炼",
    boss: "亲力亲为者",
    style: "solo",
    scene: "你发现自己仍是所有关键决策的审批节点，团队开始等你拍板。",
    resolution: "选择一项关键业务完整授权，并给接手人试错与复盘空间。",
    gates: [{ abilityId: "deploy", level: 3 }],
    minChapter: 5,
    staminaCost: 14,
    rewardExp: 4,
    rewardItem: "授权地图",
    rewardUnlock: "解锁「培养他人」进阶情境",
    dimension: "vision",
    source: { kind: "custom", question: { prompt: "团队所有关键决策都在等你拍板，你会怎么做？", options: ["选一项关键业务完整授权，给接手人试错与复盘空间", "继续审批，但加快速度", "要求团队先给出完整方案再交给你"], answer: 0, explanation: "格局力靠培养他人与授权放权增长；真正授权意味着允许对方在边界内做决定。", referenceAnswer: "完整授权一项关键业务，并给试错与复盘空间。" } }
  },
  {
    id: "dim_resilience",
    order: 24,
    name: "韧性值试炼",
    boss: "连败困局",
    style: "solo",
    scene: "连续两次失败后，团队开始怀疑方向，士气明显下降。",
    resolution: "承认失败，保留关键证据，用一个小胜重建动势。",
    gates: [{ abilityId: "recovery", level: 3 }],
    minChapter: 5,
    staminaCost: 14,
    rewardExp: 4,
    rewardItem: "动势火种",
    rewardUnlock: "解锁「困境重建」进阶情境",
    dimension: "resilience",
    source: { kind: "custom", question: { prompt: "连续两次失败后团队士气下降，你会怎么带团队？", options: ["承认失败，保留关键证据，用一个可达成的小胜重建动势", "淡化失败，直接布置下一轮目标", "更换核心成员来改变气氛"], answer: 0, explanation: "韧性在困境选择中波动并影响士气；承认失败并用小胜重建动势，是最有效的止损。", referenceAnswer: "承认失败，保留证据，用小胜重建动势。" } }
  }
];

export const PRACTICE_TASKS: PracticeTaskDef[] = [
  {
    id: "practice_stakeholder",
    title: "利益相关者清单",
    source: "《人物志》九征八观",
    quote: "观其变而见其性，察其安而知其志。",
    action:
      "列出你最近要合作的 5 个人，写下每个人最在意的结果，以及你判断的依据。",
    keywords: ["利益", "结果", "依据", "清单"],
    rewardEnergy: 12,
    rewardExp: 1,
    rewardAbility: "insight"
  },
  {
    id: "practice_recovery",
    title: "定风波重启",
    source: "苏轼《定风波》",
    quote: "莫听穿林打叶声，何妨吟啸且徐行。",
    action:
      "写下此刻最消耗你精力的三件事，并给其中一件设置一个具体的恢复边界。",
    keywords: ["精力", "恢复", "边界"],
    rewardEnergy: 15,
    rewardExp: 1,
    rewardAbility: "recovery"
  },
  {
    id: "practice_execution",
    title: "关键结果拆解",
    source: "《卓有成效的管理者》",
    quote: "有效的管理者把精力集中在少数重要领域。",
    action:
      "把本周目标拆成 3 个关键结果，每个结果写明负责人和验收标准。",
    keywords: ["关键结果", "负责人", "验收"],
    rewardEnergy: 10,
    rewardExp: 1,
    rewardAbility: "execution"
  },
  {
    id: "practice_structure",
    title: "一句话问题定义",
    source: "《矛盾论》",
    quote: "研究任何过程，如果是存在着两个以上矛盾的复杂过程，就要用全力找出它的主要矛盾。",
    action:
      "写出当前最模糊问题的一句话定义，并列出两个最可能的关键变量。",
    keywords: ["问题", "变量", "定义"],
    rewardEnergy: 10,
    rewardExp: 1,
    rewardAbility: "structure"
  },
  {
    id: "practice_communication",
    title: "100 字对齐邮件",
    source: "《论语》",
    quote: "不患人之不己知，患不知人也。",
    action:
      "给一位跨部门同事写一封 100 字对齐邮件，说明目标、责任人和截止时间。",
    keywords: ["目标", "责任人", "截止"],
    rewardEnergy: 10,
    rewardExp: 1,
    rewardAbility: "communication"
  },
  {
    id: "practice_lyrics",
    title: "海阔天空歌词复盘",
    source: "Beyond《海阔天空》",
    quote: "仍然自由自我，永远高唱我歌，走遍千里。",
    action:
      "听一遍这首歌，写下最触动你的一句，并说明它对应你当前的哪个处境。",
    keywords: ["触动", "处境", "歌词"],
    rewardEnergy: 12,
    rewardExp: 1,
    rewardAbility: "recovery"
  },
  {
    id: "practice_marketing",
    title: "营销卖点一句话",
    source: "营销战略基础",
    quote: "好的定位不是说得更多，而是让目标客户一眼知道为什么要选你。",
    action:
      "为当前产品写一句卖点，并写出它对应哪个客户最痛的场景。",
    keywords: ["卖点", "客户", "场景"],
    rewardEnergy: 10,
    rewardExp: 1,
    rewardAbility: "structure"
  },
  {
    id: "practice_finance",
    title: "项目成本清单",
    source: "财务与成本基础",
    quote: "先分清固定成本、变动成本和一次性投入，再谈利润。",
    action:
      "列出当前项目三类成本，并标出哪一个最可能失控。",
    keywords: ["成本", "失控", "固定"],
    rewardEnergy: 12,
    rewardExp: 1,
    rewardAbility: "execution"
  },
  {
    id: "practice_legal",
    title: "风险边界清单",
    source: "法律与合规基础",
    quote: "风险不是出事后才知道，而是签约前就写清边界。",
    action:
      "为一项合作写下三条必须写进合同的风险边界。",
    keywords: ["风险", "边界", "合同"],
    rewardEnergy: 10,
    rewardExp: 1,
    rewardAbility: "structure"
  },
  {
    id: "practice_customer",
    title: "客户投诉安抚信",
    source: "客户服务最佳实践",
    quote: "客户先要被理解，才愿意听你的解决方案。",
    action:
      "写一封 100 字客户安抚信，包含复述问题、补救措施和时间节点。",
    keywords: ["客户", "补救", "时间"],
    rewardEnergy: 12,
    rewardExp: 1,
    rewardAbility: "communication"
  },
  {
    id: "practice_employee",
    title: "员工纠纷复述",
    source: "员工关系管理",
    quote: "处理纠纷的第一步，是让双方都相信你听懂了各自立场。",
    action:
      "把一次员工纠纷拆成双方诉求、共同目标和下一步规则。",
    keywords: ["诉求", "目标", "规则"],
    rewardEnergy: 10,
    rewardExp: 1,
    rewardAbility: "communication"
  },
  {
    id: "practice_delivery",
    title: "交付验收清单",
    source: "项目交付管理",
    quote: "交付不是把东西交出去，而是让验收标准被双方共同确认。",
    action:
      "为当前交付写一份 5 项验收清单，并指定每一项的负责人。",
    keywords: ["验收", "清单", "负责人"],
    rewardEnergy: 12,
    rewardExp: 1,
    rewardAbility: "execution"
  }
];

export function trialQuestionFor(stage: TrialStageDef): TrialQuestion {
  if (stage.source.kind === "custom") {
    const source = stage.source.question;
    // 自定义题按 stage.id 确定性打乱，消除“无脑选 A”；追问独立用 ":fu" 种子。
    const main = shuffleOptions(source.options, source.answer, stage.id);
    const followUp = source.followUp
      ? (() => {
          const shuffled = shuffleOptions(
            source.followUp.options,
            source.followUp.answer,
            `${stage.id}:fu`
          );
          return {
            ...source.followUp,
            options: shuffled.options,
            answer: shuffled.answerIndex
          };
        })()
      : undefined;
    return {
      ...source,
      options: main.options,
      answer: main.answerIndex,
      followUp
    };
  }
  const question = EXPANDED_TRAINING[stage.source.abilityId].questions[
    stage.source.questionIndex
  ];
  return {
    prompt: question.prompt,
    options: question.options.map((option) => option.label),
    answer: question.answer,
    explanation: question.options[question.answer].feedback,
    referenceAnswer: question.referenceAnswer
  };
}

export function canEnterTrial(save: SaveState, stage: TrialStageDef): boolean {
  const previous = TRIAL_STAGES.find((item) => item.order === stage.order - 1);
  if (previous && !save.trialCleared.includes(previous.id)) {
    return false;
  }
  for (const gate of stage.gates) {
    if (abilityLevel(save.profile.abilities[gate.abilityId]) < gate.level) {
      return false;
    }
  }
  if (stage.minChapter && !save.unlockedChapters.includes(stage.minChapter)) {
    return false;
  }
  if (
    stage.minInfluence &&
    save.profile.resources.influence < stage.minInfluence
  ) {
    return false;
  }
  if (
    stage.resourceCost &&
    save.profile.resources.capital < stage.resourceCost
  ) {
    return false;
  }
  if (save.trialEnergy < trialCostFor(save, stage)) {
    return false;
  }
  if (save.trialHp <= 0) {
    return false;
  }
  return true;
}

export function trialCostFor(save: SaveState, stage: TrialStageDef): number {
  let cost = stage.staminaCost;
  if (
    save.trialItems.includes("识人罗盘") &&
    stage.id === "trial_insight"
  ) {
    cost -= 2;
  }
  if (
    save.trialItems.includes("联签印") &&
    stage.id === "trial_authority"
  ) {
    cost -= 2;
  }
  if (
    save.trialItems.includes("共识图") &&
    stage.id === "trial_communication"
  ) {
    cost -= 2;
  }
  if (save.trialItems.includes("临时同伴")) {
    cost -= 2;
  }
  const itemCostMap: Record<string, number> = {
    用人清单: 2,
    谋势棋谱: 2,
    传承册: 2,
    现金流沙盘: 4,
    供应链沙盘: 4,
    人才梯队图: 4,
    营销验证盘: 2,
    财务透视镜: 2,
    风险边界书: 2,
    激励路线图: 2,
    交付作战图: 2
  };
  const stageItemMap: Record<string, string[]> = {
    trial_deploy: ["用人清单"],
    trial_strategy: ["谋势棋谱"],
    trial_stability: ["传承册"],
    mba_cashflow: ["现金流沙盘"],
    mba_supplychain: ["供应链沙盘"],
    mba_people: ["人才梯队图"],
    domain_marketing: ["营销验证盘"],
    domain_finance: ["财务透视镜"],
    domain_legal: ["风险边界书"],
    domain_employee: ["激励路线图"],
    domain_delivery: ["交付作战图"]
  };
  for (const item of stageItemMap[stage.id] ?? []) {
    if (save.trialItems.includes(item)) {
      cost -= itemCostMap[item] ?? 0;
    }
  }
  const difficultyFactor =
    save.difficulty === "extreme"
      ? 1.3
      : save.difficulty === "pressure"
        ? 1.15
        : 1;
  return Math.max(4, Math.round(cost * difficultyFactor));
}

export function trialRewardExpFor(
  save: SaveState,
  stage: TrialStageDef
): number {
  let exp = stage.rewardExp;
  if (
    save.trialItems.includes("验收剑") &&
    stage.id === "trial_execution"
  ) {
    exp += 1;
  }
  if (
    save.trialItems.includes("谋势棋谱") &&
    stage.id === "trial_strategy"
  ) {
    exp += 1;
  }
  if (
    save.trialItems.includes("营销验证盘") &&
    stage.id === "domain_marketing"
  ) {
    exp += 1;
  }
  if (
    save.trialItems.includes("客户信任卡") &&
    stage.id === "domain_customer"
  ) {
    exp += 1;
  }
  return exp;
}

export function trialStageLabel(
  stage: TrialStageDef,
  language: "zh" | "en" = "zh"
): string {
  if (stage.style === "wolf")
    return language === "en" ? "Situation-assessment case" : "局势判断情境";
  if (stage.style === "alliance")
    return language === "en" ? "Alliance-negotiation case" : "结盟博弈情境";
  return language === "en" ? "Solo-leadership challenge" : "独当一面挑战";
}

export function scoreOpenText(
  text: string,
  keywords: string[],
  minLength = 20
): number {
  const normalized = text.trim();
  if (!normalized) return 0;
  const lengthScore = Math.min(40, Math.floor(normalized.length / 2));
  const keywordHits = keywords.filter((keyword) =>
    normalized.includes(keyword)
  ).length;
  const keywordScore = Math.min(
    40,
    Math.floor((keywordHits / Math.max(1, keywords.length)) * 40)
  );
  const structureSignals = [
    /[。；;]/g.test(normalized),
    /[\d一二三四五六七八九十][.、．]/.test(normalized),
    /(第一|第二|首先|其次|最后|1\.|2\.|3\.)/.test(normalized),
    /(负责人|步骤|验收|时间|目标|依据)/.test(normalized)
  ].filter(Boolean).length;
  const structureScore = structureSignals * 5;
  return Math.min(100, lengthScore + keywordScore + structureScore);
}
