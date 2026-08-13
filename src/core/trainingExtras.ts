import type { AbilityId, RoleId } from "./types.ts";
import {
  TRAINING_BY_ABILITY,
  type AbilityTraining,
  type TrainingQuestion
} from "./training.ts";

export interface TrainingQuestionDetail {
  solutionSteps: string[];
  referenceAnswer: string;
}

export interface AbilityTrainingExtra {
  problemPrompt: string;
  analogy: string;
  applicationPoints: string[];
  formula: {
    name: string;
    expression: string;
    explanation: string;
  };
  workedExamples: Array<{
    title: string;
    scenario: string;
    application: string;
  }>;
  roleApplications: Record<RoleId, string>;
  questionDetails: Record<string, TrainingQuestionDetail>;
}

export interface ExpandedTrainingQuestion extends TrainingQuestion {
  solutionSteps: string[];
  referenceAnswer: string;
}

export interface ExpandedAbilityTraining extends AbilityTraining {
  problemPrompt: string;
  analogy: string;
  applicationPoints: string[];
  formula: AbilityTrainingExtra["formula"];
  workedExamples: AbilityTrainingExtra["workedExamples"];
  roleApplications: AbilityTrainingExtra["roleApplications"];
  questions: ExpandedTrainingQuestion[];
}

export const TRAINING_EXTRAS: Record<AbilityId, AbilityTrainingExtra> = {
  insight: {
    problemPrompt:
      "团队里有人能力强、态度好，但你不确定他是不是真的可信，也不知道该把哪件关键事交给他。",
    analogy:
      "像解一道关于“这个人是谁”的题：简历和口才是题目包装，行为证据才是解题过程。",
    applicationPoints: [
      "先写岗位要交付的结果，再收集证据",
      "只看压力下的选择，不只看公开表态",
      "把资源投入当作最硬的动机证据",
      "用关键访谈交叉验证归因"
    ],
    formula: {
      name: "识人判断模型",
      expression: "可信度 = 压力行为证据 × 资源投入 − 口头表态误差",
      explanation: "判断人时先按公式收集证据，再决定信任边界。"
    },
    workedExamples: [
      {
        title: "空降团队里的核心骨干",
        scenario: "一位骨干主动说支持你，但每次关键信息仍由他决定给谁看。",
        application:
          "按公式算：资源投入为负、口头表态为正，可信度不能直接成立，应先设置信息透明节点。"
      },
      {
        title: "创业合伙人",
        scenario: "合伙人总在描绘客户关系，却很少出现在客户交付现场。",
        application:
          "用公式拆开能力与关系：关系表态多、交付行为少，先验证真实客户反馈，再决定是否委以重任。"
      }
    ],
    roleApplications: {
      parachute: "空降初期用来判断谁是真盟友、谁只是表面欢迎。",
      founder: "用于识别合伙人里谁真正把时间和现金流投进公司。",
      highPotential: "用于判断跨部门合作中谁会把口头配合变成真实资源。"
    },
    questionDetails: {
      "train-insight-1": {
        solutionSteps: [
          "先不看结论，看证据",
          "把压力下的时间、责任、注意力作为三项证据",
          "用岗位成果判断哪项证据最关键"
        ],
        referenceAnswer: "他在压力下如何分配时间、责任和注意力。"
      },
      "train-insight-2": {
        solutionSteps: [
          "区分公开表态与资源投入",
          "看时间、预算、注意力是否流向目标",
          "结论：动机与行动不一致，需要继续观察"
        ],
        referenceAnswer: "动机与行动不一致，需要继续收集行为证据。"
      },
      "train-insight-3": {
        solutionSteps: [
          "排除最易伪装的表达",
          "观察持续的资源流向",
          "用行为证据校准他人评价"
        ],
        referenceAnswer: "看他把时间、预算和注意力持续投向哪里。"
      }
    }
  },
  deploy: {
    problemPrompt:
      "你手里有一堆候选人：有人忠诚、有人资历深、有人能力强，但你不确定谁才是这个岗位真正需要的人。",
    analogy:
      "像给题目选最佳解题方法：先看题目要求什么，再看每个方法能解决哪一部分，而不是选名气最大的公式。",
    applicationPoints: [
      "先定义岗位成果，再比较候选人",
      "把能力证据按成果权重排序",
      "容忍不影响核心成果的短板",
      "用检查节点验证授权是否成立"
    ],
    formula: {
      name: "人岗匹配模型",
      expression: "匹配度 = 岗位成果 × 能力证据 − 短板阻塞",
      explanation: "短板只有卡住核心成果时才扣分。"
    },
    workedExamples: [
      {
        title: "空降后的关键岗位",
        scenario:
          "财务经理候选人 A 资历普通但熟悉系统流程，候选人 B 资历深但从不碰数字化。",
        application:
          "先看岗位是否要推动数字化：如果要，候选人 A 的系统熟悉度就是核心证据。"
      },
      {
        title: "高潜项目的负责人",
        scenario:
          "一位年轻人执行力强但跨部门沟通弱，另一位沟通好但总拖延交付。",
        application:
          "岗位如果以交付为核心，优先执行证据，沟通短板用搭档补位。"
      }
    ],
    roleApplications: {
      parachute: "重组名单时避免被亲疏和资历绑架。",
      founder: "在核心岗位决定上是继续依赖明星个人还是建设系统。",
      highPotential: "在无职位权力时用岗位成果定义自己推荐谁。"
    },
    questionDetails: {
      "train-deploy-1": {
        solutionSteps: [
          "先确定岗位要交付的成果",
          "把成果拆成能力证据",
          "再比较候选人是否匹配"
        ],
        referenceAnswer: "先定义岗位成果，再匹配能力证据。"
      },
      "train-deploy-2": {
        solutionSteps: [
          "列出岗位核心成果",
          "判断短板是否卡住核心成果",
          "不卡住就允许，卡住就要配置补位"
        ],
        referenceAnswer: "评估短板是否卡住核心成果，再决定。"
      },
      "train-deploy-3": {
        solutionSteps: [
          "授权前先定义成果",
          "再定义对方的判断边界",
          "最后设置检查节点"
        ],
        referenceAnswer: "先确认他要交付的成果和判断边界。"
      }
    }
  },
  mobilize: {
    problemPrompt:
      "你有一个好方案，但团队不买账，反对声越来越大。你不想靠压服，又不想放弃推进。",
    analogy:
      "像解一道团队动力学题：阻力不是敌人，而是题目里最重要的一条已知条件。",
    applicationPoints: [
      "先听反对声中的真实信息",
      "把顾虑写进方案前提",
      "让反对者承担试点责任",
      "用共同成果代替立场"
    ],
    formula: {
      name: "动员认同模型",
      expression: "认同度 = 共同成果 × 参与责任 − 恐惧成本",
      explanation: "参与感越高，反对者越容易转成同盟。"
    },
    workedExamples: [
      {
        title: "空降后的第一场变革",
        scenario: "运营负责人反对新流程，说会拖慢交付。",
        application:
          "把他的交付顾虑设为流程前提，并让他做试点负责人。"
      },
      {
        title: "跨部门合作",
        scenario: "产品与销售互相指责，没人愿意牵头。",
        application:
          "先定义共同客户成果，再让两方各出一个人进作战室。"
      }
    ],
    roleApplications: {
      parachute: "把资历深的反对者变成变革的第一责任人。",
      founder: "让老员工从质疑扩张变成共同守住现金流。",
      highPotential: "没有职位权力时，用共同成果吸引跨部门参与者。"
    },
    questionDetails: {
      "train-mobilize-1": {
        solutionSteps: [
          "先不判断对错，提取反对者顾虑",
          "把顾虑作为方案修正项",
          "邀请对方参与试点，把立场转成责任"
        ],
        referenceAnswer: "把反对者的顾虑变成方案前提。"
      },
      "train-mobilize-2": {
        solutionSteps: [
          "找到能立刻产生确定性的小目标",
          "让团队共同承担一个小责任",
          "用一次能赢的结果重建信心"
        ],
        referenceAnswer: "给一个能赢的小目标和共同责任。"
      },
      "train-mobilize-3": {
        solutionSteps: [
          "找到两个部门共同服务的客户或成果",
          "把分歧翻译成共同结果下的分工",
          "用统一目标约束后续行动"
        ],
        referenceAnswer: "重新定义双方共同的客户或成果。"
      }
    }
  },
  strategy: {
    problemPrompt:
      "你没有正式权力，也没有足够资源，但你必须推动一件重要的事。",
    analogy:
      "像解一道势能题：先积小胜，再放大，不要急着抢名义上的最高分。",
    applicationPoints: [
      "找到授权者真正关心的小结果",
      "用两周内可验证的成果换资源",
      "同步关键人，避免信息差",
      "势能足够再争正式名分"
    ],
    formula: {
      name: "权力势能模型",
      expression: "势能 = 小胜利 × 授权者信任 × 信息同步",
      explanation: "三者缺一会让授权迟迟不来。"
    },
    workedExamples: [
      {
        title: "空降管理者的 90 天",
        scenario: "CEO 只给了目标，没给预算和任命权。",
        application:
          "先选一个数据可验证的小项目做小胜，再拿结果谈授权。"
      },
      {
        title: "创业者的现金流",
        scenario: "投资人还没到账，团队需要采购。",
        application:
          "先做可验证的客户订单或最小产品，用进展换取投资人的明确资源承诺。"
      }
    ],
    roleApplications: {
      parachute: "用首周小胜利换取 CEO 的授权和团队信任。",
      founder: "用现金流验证换取投资人、供应商和团队的支持。",
      highPotential: "用项目小里程碑换取更高层对项目的资源支持。"
    },
    questionDetails: {
      "train-strategy-1": {
        solutionSteps: [
          "找到不依赖授权也能启动的小切口",
          "快速做出可验证结果",
          "用结果向上换授权"
        ],
        referenceAnswer: "先做出小胜利，再向上换取授权。"
      },
      "train-strategy-2": {
        solutionSteps: [
          "把资源请求转成一个可验证假设",
          "先做最小结果证明假设",
          "用结果支撑更大资源请求"
        ],
        referenceAnswer: "先展示一个可验证的小成果。"
      },
      "train-strategy-3": {
        solutionSteps: [
          "分析对手优势的来源",
          "寻找对方难以复制的差异化节点",
          "把资源投向该节点"
        ],
        referenceAnswer: "找到对方无法复制的差异化优势。"
      }
    }
  },
  authority: {
    problemPrompt:
      "你刚接掌局面，却发现自己被绕过，或者团队并不认真执行你的决定。",
    analogy:
      "像解一道公信力方程：权力不是来自你喊得多响，而是规则被兑现了多少次。",
    applicationPoints: [
      "明确哪些决策必须进入闭环",
      "公开一致的标准",
      "用一次兑现立信",
      "把越权拉回流程处理"
    ],
    formula: {
      name: "权威公信模型",
      expression: "公信力 = 标准一致 × 兑现次数 − 例外次数",
      explanation: "例外越多，边界越模糊。"
    },
    workedExamples: [
      {
        title: "空降新官",
        scenario: "团队口头认可你的制度，但下周仍然按老习惯决策。",
        application:
          "设置联签表，第一件越权事项回到流程处理并公示结果。"
      },
      {
        title: "创始人被架空",
        scenario: "合伙人绕过 CEO 直接找投资人。",
        application:
          "建立重大事项联签机制，不公开羞辱，但让流程挡住下一次。"
      }
    ],
    roleApplications: {
      parachute: "用制度和联签把新官权威从个人强势转为组织流程。",
      founder: "用董事会和财务联签守住创始人决策边界。",
      highPotential: "用项目章程和验收权守住没有职位权力的项目主导权。"
    },
    questionDetails: {
      "train-authority-1": {
        solutionSteps: [
          "先列出团队要遵守的判断标准",
          "用一次可验证结果证明标准有效",
          "让权威建立在结果而非情绪上"
        ],
        referenceAnswer: "清晰一致的决策标准和可验证结果。"
      },
      "train-authority-2": {
        solutionSteps: [
          "不把越权先定义成人际攻击",
          "把关键决策拉进联签流程",
          "通过流程执行让边界自动生效"
        ],
        referenceAnswer: "用联签流程重新定义权力边界。"
      },
      "train-authority-3": {
        solutionSteps: [
          "先确认质疑中的事实",
          "把事实与决策标准对照",
          "事实正确就调整，事实有误再解释"
        ],
        referenceAnswer: "先确认事实，再决定是否调整。"
      }
    }
  },
  stability: {
    problemPrompt:
      "你一离开，团队就停摆；你休假一天，问题就堆成山。你希望组织不再依赖你。",
    analogy:
      "像解一道组织连续性题：答案不是找一个替身，而是让关键判断变成可复用的程序。",
    applicationPoints: [
      "盘点高频个人判断",
      "沉淀清单和复盘库",
      "用制度固化决策闭环",
      "给接班人陪跑期"
    ],
    formula: {
      name: "组织韧性模型",
      expression: "韧性 = 关键判断清单 × 复制机制 × 接班人陪跑",
      explanation: "三者相乘，缺一不可。"
    },
    workedExamples: [
      {
        title: "高管准备晋升",
        scenario: "所有危机都要你亲自处理。",
        application:
          "把你处理危机的六步写成一页清单，让团队用同一清单演练。"
      },
      {
        title: "创始人要休假",
        scenario: "你离开后订单、招聘、售后全都停摆。",
        application:
          "建立值班决策规则，把每天最高频的三类判断交给梯队。"
      }
    ],
    roleApplications: {
      parachute: "把空降后建立的判断方法沉淀成部门运营手册。",
      founder: "把创始人直觉变成合伙人可执行的公司决策规则。",
      highPotential: "把个人关系网络转成项目交接文档和决策清单。"
    },
    questionDetails: {
      "train-stability-1": {
        solutionSteps: [
          "找出组织最依赖你的高频判断",
          "把判断步骤写成清单",
          "连同复盘案例一起交接"
        ],
        referenceAnswer: "把高频判断做成清单和决策复盘库。"
      },
      "train-stability-2": {
        solutionSteps: [
          "识别哪些决策必须由团队复用",
          "把判断逻辑固化成流程",
          "用流程替代个人反应速度"
        ],
        referenceAnswer: "把关键决策变成可复用的流程。"
      },
      "train-stability-3": {
        solutionSteps: [
          "把核心能力拆成可教的部分",
          "主动带教并更新更高阶能力",
          "让能力成为组织资产"
        ],
        referenceAnswer: "继续升级更高阶能力，并主动带教。"
      }
    }
  },
  recovery: {
    problemPrompt:
      "你连续高压、情绪不稳、精力见底，但项目又不能停。",
    analogy:
      "像解一道能量守恒题：先别想着把电量一次性加满，先停止继续漏电。",
    applicationPoints: [
      "觉察精力下降信号",
      "离开现场降温",
      "找出三大消耗源",
      "设置恢复边界和最小行动"
    ],
    formula: {
      name: "可持续状态模型",
      expression: "状态 = 觉察信号 + 恢复边界 − 情绪内耗",
      explanation: "先止损，再恢复，最后才提速。"
    },
    workedExamples: [
      {
        title: "空降管理者连续加班",
        scenario: "会议和救火占满一天，晚上还失眠。",
        application:
          "先砍掉两个不产生结果的会议，把上午留给关键决策。"
      },
      {
        title: "创业者现金流压力",
        scenario: "焦虑到睡不好，又不敢暂停任何工作。",
        application:
          "每天设 30 分钟无手机恢复时段，把焦虑写进复盘而不是带进团队。"
      }
    ],
    roleApplications: {
      parachute: "在陌生组织的高压首月保护自己的判断质量。",
      founder: "在现金流不确定时先保住决策清醒度。",
      highPotential: "在项目透支时用恢复边界避免专业判断变形。"
    },
    questionDetails: {
      "train-recovery-1": {
        solutionSteps: [
          "识别精力下降信号",
          "把高价值任务放到高能量时段",
          "设置不被打断的恢复时段"
        ],
        referenceAnswer: "主动设恢复边界，把重要工作放到高能量时段。"
      },
      "train-recovery-2": {
        solutionSteps: [
          "先离开让情绪降温",
          "等身体状态回落再处理",
          "避免用更多工作掩盖消耗"
        ],
        referenceAnswer: "先离开现场，让身体和情绪降温。"
      },
      "train-recovery-3": {
        solutionSteps: [
          "列出最近消耗最大的任务",
          "找到排名前三的消耗源",
          "先处理消耗源再谈补充"
        ],
        referenceAnswer: "检查精力消耗最大的三项任务。"
      }
    }
  },
  execution: {
    problemPrompt:
      "目标很大、时间很少，团队很忙，但你无法确定大家是否在做最重要的事。",
    analogy:
      "像解一道应用题：先把题目要求的结果写出来，再分配每个步骤的负责人和验收条件，而不是先写满草稿纸。",
    applicationPoints: [
      "拆出三个关键结果",
      "砍掉低价值事项",
      "每个结果配负责人",
      "固定里程碑检查"
    ],
    formula: {
      name: "关键结果交付模型",
      expression: "交付 = 关键结果 × 负责人 × 检查节点",
      explanation: "一个因子为 0，执行就会空转。"
    },
    workedExamples: [
      {
        title: "季度末冲刺",
        scenario: "目标缺口 30%，团队已经加班。",
        application:
          "砍掉两个非核心项目，把加班时间集中到缺口最大的关键结果上。"
      },
      {
        title: "新产品上线",
        scenario: "需求、设计、开发各忙各的。",
        application:
          "用同一份上线验收清单，每周二检查三个关键结果。"
      }
    ],
    roleApplications: {
      parachute: "把 90 天目标翻译成可验收的部门关键结果。",
      founder: "用现金流和产品验证结果替代“看起来很忙”。",
      highPotential: "在没有指挥权时用里程碑和验收清单组织跨部门交付。"
    },
    questionDetails: {
      "train-execution-1": {
        solutionSteps: [
          "找出缺口最大的关键结果",
          "砍掉不支撑它的低价值事项",
          "把资源集中到关键结果"
        ],
        referenceAnswer: "拆出关键结果，砍掉低价值事项。"
      },
      "train-execution-2": {
        solutionSteps: [
          "把新任务与关键结果对照",
          "判断它是否改变核心交付",
          "不改变就延后，改变就重排优先级"
        ],
        referenceAnswer: "先判断它是否影响关键结果。"
      },
      "train-execution-3": {
        solutionSteps: [
          "设置固定检查节奏",
          "每次检查对照关键结果",
          "用节点提前暴露风险"
        ],
        referenceAnswer: "固定节奏的里程碑检查。"
      }
    }
  },
  structure: {
    problemPrompt:
      "问题很模糊、信息很多，你不知道从哪里开始，也不知道哪个变量最值得投入。",
    analogy:
      "像解一道多变量题：不是把所有数都算一遍，而是先找哪个变量一变，其他变量都会跟着变。",
    applicationPoints: [
      "写清问题定义",
      "拆关键变量和因果链",
      "找主要矛盾",
      "用最小实验验证"
    ],
    formula: {
      name: "杠杆解法模型",
      expression: "解法效果 = 主要矛盾 × 关键变量 × 验证速度",
      explanation: "把资源投到牵一发动全身的节点。"
    },
    workedExamples: [
      {
        title: "客户流失",
        scenario: "客服、产品、销售都在给不同解释。",
        application:
          "先画客户旅程因果链，找到流失最早发生的触点，而不是同时改所有环节。"
      },
      {
        title: "组织内耗",
        scenario: "跨部门互相推责，流程越来越慢。",
        application:
          "找哪个审批节点卡住 80% 的单据，先解决这个节点。"
      }
    ],
    roleApplications: {
      parachute: "用因果链诊断陌生组织的真实问题，不被表面汇报带偏。",
      founder: "在资源有限时把现金流失、产品卡点、团队瓶颈拆开找杠杆。",
      highPotential: "在模糊项目中定义问题边界，让跨部门协作有共同结构。"
    },
    questionDetails: {
      "train-structure-1": {
        solutionSteps: [
          "先写问题定义和判断标准",
          "拆出关键变量",
          "把模糊问题变成可验证结构"
        ],
        referenceAnswer: "先定义问题边界，再拆解关键变量。"
      },
      "train-structure-2": {
        solutionSteps: [
          "找复发背后的共同条件",
          "分析条件之间如何相互强化",
          "修复系统条件而非只补单点"
        ],
        referenceAnswer: "分析导致问题发生的系统条件。"
      },
      "train-structure-3": {
        solutionSteps: [
          "先明确目标",
          "用目标过滤关键变量",
          "画因果链定位最有影响的节点"
        ],
        referenceAnswer: "按目标拆成关键变量和因果链。"
      }
    }
  },
  communication: {
    problemPrompt:
      "你觉得自己说得够清楚了，但对方还是误解，会议结束后各做各的，没有人真正对齐。",
    analogy:
      "像解一道翻译题：先确认双方对题目的理解一致，再写答案，而不是把同一句话重复十遍。",
    applicationPoints: [
      "先复述对方理解",
      "回到共同客户或成果",
      "用提问代替下结论",
      "锁定目标、责任人和截止时间"
    ],
    formula: {
      name: "协同共识模型",
      expression: "共识 = 复述理解 × 共同目标 × 行动闭环",
      explanation: "任何一环缺失，沟通都会停在表面。"
    },
    workedExamples: [
      {
        title: "跨部门会议",
        scenario: "研发说需求不清晰，产品说研发不配合。",
        application:
          "先复述双方痛点，再把客户验收标准定为共同目标，会后用一页纪要锁责任人。"
      },
      {
        title: "向上沟通",
        scenario: "你汇报了方案，上级却只回复“再想想”。",
        application:
          "复述你听到的顾虑，补充一个验证节点，把开放问题变成下一步行动。"
      }
    ],
    roleApplications: {
      parachute: "用一页共识文档降低空降后与团队的信息差。",
      founder: "用共同现金流目标让产品、销售、研发停止互相指责。",
      highPotential: "在没有指挥权时用复述和纪要建立跨部门行动闭环。"
    },
    questionDetails: {
      "train-communication-1": {
        solutionSteps: [
          "先复述双方诉求",
          "找到共同客户或成果",
          "把争执转成共同目标下的分工"
        ],
        referenceAnswer: "先复述双方诉求，再重新定义共同目标。"
      },
      "train-communication-2": {
        solutionSteps: [
          "先确认对方听到了什么",
          "找出理解差异的关键点",
          "补充缺失信息而不是重复观点"
        ],
        referenceAnswer: "先复述对方理解，再补充关键信息。"
      },
      "train-communication-3": {
        solutionSteps: [
          "先锁定共同目标",
          "指定责任人",
          "约定截止时间"
        ],
        referenceAnswer: "共同目标、责任人和截止时间。"
      }
    }
  }
};

export function expandTraining(path: AbilityTraining): ExpandedAbilityTraining {
  const extras = TRAINING_EXTRAS[path.abilityId];
  return {
    ...path,
    ...extras,
    questions: path.questions.map((question) => ({
      ...question,
      ...extras.questionDetails[question.id]
    }))
  };
}

export const EXPANDED_TRAINING = Object.fromEntries(
  Object.keys(TRAINING_BY_ABILITY).map((abilityId) => [
    abilityId,
    expandTraining(TRAINING_BY_ABILITY[abilityId as AbilityId])
  ])
) as Record<AbilityId, ExpandedAbilityTraining>;
