import type { AbilityId } from "./types";

export interface TrainingStory {
  title: string;
  source: string;
  scenario: string;
  lesson: string;
}

export interface TrainingQuestion {
  id: string;
  prompt: string;
  options: Array<{
    label: string;
    feedback: string;
  }>;
  answer: number;
}

export interface AbilityTraining {
  abilityId: AbilityId;
  routeTitle: string;
  routeSummary: string;
  route: string[];
  story: TrainingStory;
  questions: TrainingQuestion[];
}

export const TRAINING_PATHS: AbilityTraining[] = [
  {
    abilityId: "insight",
    routeTitle: "识人五步：观察证据，验证动机",
    routeSummary: "把对人的判断从印象升级为证据链：先定义岗位成果，再观察压力下的行为，最后回到关系网校准。",
    route: [
      "先定义你要判断的岗位成果",
      "收集压力下的行为证据",
      "区分公开表态与真实投入",
      "用关键访谈验证归因",
      "回到利益相关者地图做校准"
    ],
    story: {
      title: "曾国藩识人",
      source: "《清史稿》及相关幕僚笔记",
      scenario:
        "李鸿章带三个人来见曾国藩。曾国藩没有立刻接见，而是让他们站在门厅等待，随后远远观察。一个人目光游移，反复打听何时能见到大帅；一个人低头不语，显得局促；还有一个人不因被晾而失措，从容站定。曾国藩据此判断：第三人可堪大用，因为真正的人才不会被等待和压力打乱阵脚。",
      lesson:
        "可靠识人来自具体情境中的行为证据：等待时的耐心、压力下的选择、资源投入的方向，都比简历、口才和第一印象更接近真实动机。"
    },
    questions: [
      {
        id: "train-insight-1",
        prompt: "你判断一位候选人是否可信，最应该先收集什么？",
        options: [
          {
            label: "他在压力下如何分配时间、责任和注意力",
            feedback: "行为证据比口头承诺更稳定，这是识人的起点。"
          },
          {
            label: "他承诺时语气有多肯定",
            feedback: "语气只能说明表达状态，不能证明真实投入。"
          },
          {
            label: "他引用过多少成功案例",
            feedback: "过往案例重要，但要放到当前岗位成果里验证。"
          }
        ],
        answer: 0
      },
      {
        id: "train-insight-2",
        prompt: "一个人公开表忠心，但私下从不把时间或资源投向你关心的目标，说明什么？",
        options: [
          {
            label: "动机与行动不一致，需要继续观察行为证据",
            feedback: "表态和投入分离时，要回到利益相关者地图找真实动机。"
          },
          {
            label: "他只是性格内敛，应该直接信任",
            feedback: "内敛不等于没有行动，真正的信任要落到关键行为上。"
          },
          {
            label: "他已经表明立场，可以放心授权",
            feedback: "公开表态不能替代关键资源投入，授权前仍要验证。"
          }
        ],
        answer: 0
      },
      {
        id: "train-insight-3",
        prompt: "想识别一位关键人物的真实动机，最可靠的做法是什么？",
        options: [
          {
            label: "看他把时间、预算和注意力持续投向哪里",
            feedback: "资源流向是最难伪装的动机证据。"
          },
          {
            label: "听他自己如何描述目标",
            feedback: "自我描述有用，但要和行为交叉验证。"
          },
          {
            label: "只看别人如何评价他",
            feedback: "他人评价是二手信息，容易带有立场和滤镜。"
          }
        ],
        answer: 0
      }
    ]
  },
  {
    abilityId: "deploy",
    routeTitle: "用人五步：岗位成果优先",
    routeSummary: "先定义岗位要交付什么，再用能力证据匹配人选，最后用检查节点和结果回补人才配置。",
    route: [
      "先定义岗位成果",
      "盘点候选人的能力证据",
      "允许短处存在，只要不卡核心成果",
      "设置授权边界与检查节点",
      "用交付结果回补配置"
    ],
    story: {
      title: "萧何月下追韩信",
      source: "《史记·淮阴侯列传》",
      scenario:
        "韩信在刘邦帐下起初只做小官，未受重用，于是深夜逃走。萧何来不及禀报，月下追赶，追回后向刘邦强调“国士无双”，力主设坛拜将。刘邦采纳后，韩信从汉中开始整军，最终帮助刘邦在楚汉之争中建立决定性优势。",
      lesson:
        "用人的前提不是先看谁忠诚、谁资历深，而是先看清岗位要交付的成果，再用可验证的能力证据做匹配。真正的关键人才，往往不会被常规评价表看见。"
    },
    questions: [
      {
        id: "train-deploy-1",
        prompt: "给一个关键岗位选人，第一步应该做什么？",
        options: [
          {
            label: "先定义岗位成果，再匹配能力证据",
            feedback: "成果定义是人才判断的尺子。"
          },
          {
            label: "先找忠诚可靠的人，再逐步培养",
            feedback: "忠诚很重要，但培养成本必须放在岗位成果前提下评估。"
          },
          {
            label: "先选资历最深的人，避免风险",
            feedback: "资历不等于当前岗位最需要的能力组合。"
          }
        ],
        answer: 0
      },
      {
        id: "train-deploy-2",
        prompt: "候选人的优势非常突出，但有明显短板，你会怎么做？",
        options: [
          {
            label: "评估短板是否卡住核心成果，再决定",
            feedback: "用岗位成果判断短板是否可接受，比笼统地“有短板就不用”更专业。"
          },
          {
            label: "优先选择没有明显短板的人",
            feedback: "没有短板的人也可能没有组织需要的优势。"
          },
          {
            label: "拒绝使用任何有短板的人",
            feedback: "完美候选人很少存在，关键是核心成果不被卡住。"
          }
        ],
        answer: 0
      },
      {
        id: "train-deploy-3",
        prompt: "你要给下属授权，最应该先确认什么？",
        options: [
          {
            label: "他要交付的成果和判断边界",
            feedback: "成果与边界清晰，授权才不会变成失控。"
          },
          {
            label: "他是否足够忠诚",
            feedback: "忠诚是基础条件，但授权仍要落到成果、权限和检查机制。"
          },
          {
            label: "他是否完全同意你的做法",
            feedback: "完全复制你的做法可能反而限制了人才发挥。"
          }
        ],
        answer: 0
      }
    ]
  },
  {
    abilityId: "mobilize",
    routeTitle: "驭人五步：把阻力变成共同责任",
    routeSummary: "不急着压制反对者，先理解反对声里的信息，再把关键人邀请进共同目标与试点责任。",
    route: [
      "先听清反对者的真实顾虑",
      "把顾虑变成方案前提",
      "邀请关键人承担试点责任",
      "用共同成果校准利益",
      "公开复盘，强化下一次动员"
    ],
    story: {
      title: "楚庄王绝缨",
      source: "《韩诗外传》",
      scenario:
        "楚庄王宴请群臣，酒酣时烛火熄灭，有人趁机拉扯王妃衣袖。王妃扯断对方冠缨，请庄王点灯追查。庄王却命所有人先摘掉冠缨，再重新点灯，保全了冒犯者。多年后晋楚交战中，一位将领冒死救庄王，正是当年绝缨宴上被保全的人。",
      lesson:
        "驭人不是用惩罚让所有人怕你，而是让潜在对立者成为欠你一份信任的人。把冒犯者从“要被处理的对象”变成“被保全的同盟”，人心才会在关键时刻站在你这边。"
    },
    questions: [
      {
        id: "train-mobilize-1",
        prompt: "团队公开反对你的新方案时，你的第一反应是什么？",
        options: [
          {
            label: "把反对者的顾虑变成方案前提",
            feedback: "反对声往往携带真实信息，先吸收它再推动。"
          },
          {
            label: "先稳住场面，再私下说服关键人",
            feedback: "私下说服有用，但不能替代公开的共同责任。"
          },
          {
            label: "用决策权直接推进",
            feedback: "压制反对会换来表面服从，也会让执行走样。"
          }
        ],
        answer: 0
      },
      {
        id: "train-mobilize-2",
        prompt: "团队士气低落时，最能重新激发他们的是什么？",
        options: [
          {
            label: "给一个能赢的小目标和共同责任",
            feedback: "小胜利和共同责任能把焦虑转成行动。"
          },
          {
            label: "公开表扬几个人的努力",
            feedback: "表扬能改善氛围，但不能替代共同目标。"
          },
          {
            label: "强调项目失败的严重后果",
            feedback: "恐惧只能短期驱动，容易消耗信任。"
          }
        ],
        answer: 0
      },
      {
        id: "train-mobilize-3",
        prompt: "你要让两个敌对部门合作，第一步应该做什么？",
        options: [
          {
            label: "重新定义双方共同的客户或成果",
            feedback: "共同成果能改写立场，先对齐目标再谈分工。"
          },
          {
            label: "分别说服两方负责人",
            feedback: "分别说服容易变成私下交易，缺乏公共约束。"
          },
          {
            label: "先让高层施压",
            feedback: "高层施压会让他们把责任继续向上推。"
          }
        ],
        answer: 0
      }
    ]
  },
  {
    abilityId: "strategy",
    routeTitle: "谋权五步：先建势，再争权",
    routeSummary: "在授权和名分之前，先用可验证的小成果积累筹码，同时让授权者保持信息同步。",
    route: [
      "识别授权者真正关心的结果",
      "选择两周内可验证的小胜利",
      "用成果换取资源边界",
      "同步权力地图中的关键人",
      "等势能足够再正式争权"
    ],
    story: {
      title: "朱升献九字策",
      source: "《明史·朱升传》及相关记载",
      scenario:
        "朱元璋问取天下之计，谋士朱升提出“高筑墙、广积粮、缓称王”。朱元璋没有急着争最高名号，而是先修城防、积粮草、稳住根据地。当实力和人心积累到足够程度，天下大势自然转向他。",
      lesson:
        "谋权不是先抢头衔，而是先积累别人无法忽视的筹码。真正稳固的权力来自你解决了什么、手里握着什么资源、关键人是否愿意把授权交给你。"
    },
    questions: [
      {
        id: "train-strategy-1",
        prompt: "你还没有正式授权时，会怎样推动一件重要的事？",
        options: [
          {
            label: "先做出小胜利，再向上换取授权",
            feedback: "可验证成果比诉求更能撬动授权。"
          },
          {
            label: "先向高层表达诉求，明确权力边界",
            feedback: "表达边界有必要，但空手要权容易被搁置。"
          },
          {
            label: "先观望，等授权落地再说",
            feedback: "等待过久会让团队失去方向，也让上级怀疑你的推动力。"
          }
        ],
        answer: 0
      },
      {
        id: "train-strategy-2",
        prompt: "你想获得更多资源，最有说服力的方式是什么？",
        options: [
          {
            label: "先展示一个可验证的小成果",
            feedback: "小成果能证明资源会被有效使用。"
          },
          {
            label: "先说明资源能带来多大回报",
            feedback: "回报预测有用，但没有验证前说服力有限。"
          },
          {
            label: "先强调项目紧迫性",
            feedback: "紧迫性会推动行动，但不能持续建立资源信任。"
          }
        ],
        answer: 0
      },
      {
        id: "train-strategy-3",
        prompt: "面对更强的竞争对手，你更倾向于怎么做？",
        options: [
          {
            label: "找到对方无法复制的差异化优势",
            feedback: "不硬碰对手最强处，先建立自己的不可替代性。"
          },
          {
            label: "比对方更快、更狠地投入",
            feedback: "在对手主场拼消耗，容易把资源烧光。"
          },
          {
            label: "等对方犯错再行动",
            feedback: "等待机会可以，但不能把战略主动权完全交给对手。"
          }
        ],
        answer: 0
      }
    ]
  },
  {
    abilityId: "authority",
    routeTitle: "掌权五步：用规则兑现权力",
    routeSummary: "权威来自清晰、一致、可验证的决策标准。用制度守住边界，比用情绪宣示权力更持久。",
    route: [
      "明确哪些决策必须进入闭环",
      "公开承诺一套一致的判断标准",
      "用一次可验证兑现建立公信",
      "把越权行为带回流程而非情绪",
      "定期复盘边界是否被执行"
    ],
    story: {
      title: "商鞅徙木立信",
      source: "《史记·商君列传》",
      scenario:
        "商鞅准备推行变法，但百姓不信法令。他在南门立下一根三丈高的木头，宣布谁能搬到北门就赏五十金。有人照做后，商鞅当场兑现。此后新法发布，百姓愿意相信并遵守。",
      lesson:
        "掌权不是靠职位喊话，而是靠稳定兑现的规则建立公信。一次公开兑现，比十次强调权威更能让人相信你的边界和标准。"
    },
    questions: [
      {
        id: "train-authority-1",
        prompt: "你刚接手团队，最需要先建立的权威来源是什么？",
        options: [
          {
            label: "清晰一致的决策标准和可验证结果",
            feedback: "标准与结果能让权力变得可预期。"
          },
          {
            label: "严格的工作纪律",
            feedback: "纪律重要，但若没有一致标准，容易变成控制感。"
          },
          {
            label: "公开批评问题行为",
            feedback: "公开批评能立威，也可能让团队进入防御。"
          }
        ],
        answer: 0
      },
      {
        id: "train-authority-2",
        prompt: "有人绕过你直接决策，你会怎么做？",
        options: [
          {
            label: "用联签流程重新定义权力边界",
            feedback: "流程比单次谈话更能长期守住边界。"
          },
          {
            label: "直接找对方谈话，明确边界",
            feedback: "谈话必要，但没有机制支撑容易反复。"
          },
          {
            label: "先不动，等对方出错再处理",
            feedback: "等待会放大越权，也会让组织误以为边界可以绕过。"
          }
        ],
        answer: 0
      },
      {
        id: "train-authority-3",
        prompt: "有人公开质疑你的决定，你会怎么做？",
        options: [
          {
            label: "先确认事实，再决定是否调整",
            feedback: "权力需要弹性，事实正确比面子正确更重要。"
          },
          {
            label: "立即维护决定权威",
            feedback: "立即防御会掩盖可能有价值的信息。"
          },
          {
            label: "当众驳斥质疑者",
            feedback: "当众驳斥能压住场面，但会伤害后续判断输入。"
          }
        ],
        answer: 0
      }
    ]
  },
  {
    abilityId: "stability",
    routeTitle: "固权五步：把个人能力变成组织制度",
    routeSummary: "固权的本质是让组织不依赖你也能做对高频判断：沉淀清单、复制机制、陪跑接班人。",
    route: [
      "识别组织里最高频的个人判断",
      "把判断做成清单与复盘库",
      "用制度固化关键决策闭环",
      "给接班人设置陪跑期",
      "用离开测试法检查组织韧性"
    ],
    story: {
      title: "萧规曹随",
      source: "《史记·曹相国世家》",
      scenario:
        "曹参继萧何任汉相后，没有急于推翻前任制度，而是继续遵守萧何制定的法令，任用稳重官员，让百姓休养生息。汉初政策因此保持稳定，也为后来的恢复赢得了时间。",
      lesson:
        "固权不是让组织永远依赖你，而是让有效机制独立于个人。真正稳固的权力，是当你离开后，组织仍能按正确的判断标准运行。"
    },
    questions: [
      {
        id: "train-stability-1",
        prompt: "你要离开当前岗位，最优先交接什么？",
        options: [
          {
            label: "把高频判断做成清单和决策复盘库",
            feedback: "判断清单能让经验脱离个人而存在。"
          },
          {
            label: "把关键客户和关系介绍给接班人",
            feedback: "关系交接重要，但只交接关系不能沉淀判断。"
          },
          {
            label: "把重要文档整理好即可",
            feedback: "文档只是材料，关键决策方法也要被交接。"
          }
        ],
        answer: 0
      },
      {
        id: "train-stability-2",
        prompt: "你要让团队不依赖你也能运转，关键是？",
        options: [
          {
            label: "把关键决策变成可复用的流程",
            feedback: "流程能代替个人反应速度，成为组织记忆。"
          },
          {
            label: "培养一个最信任的代理人",
            feedback: "代理人仍会形成新的个人依赖。"
          },
          {
            label: "保留关键决策在自己手里",
            feedback: "保留权力会增加稳定风险，团队无法成长。"
          }
        ],
        answer: 0
      },
      {
        id: "train-stability-3",
        prompt: "你的核心能力被别人学会后，你会怎么做？",
        options: [
          {
            label: "继续升级更高阶能力，并主动带教",
            feedback: "带教让能力变成组织资产，也逼你持续进化。"
          },
          {
            label: "保留一部分关键判断不教",
            feedback: "保留会阻碍组织能力沉淀。"
          },
          {
            label: "担心自己被替代",
            feedback: "被替代的恐惧会把固权变成防御。"
          }
        ],
        answer: 0
      }
    ]
  },
  {
    abilityId: "recovery",
    routeTitle: "情绪自愈五步：先管理状态，再管理结果",
    routeSummary: "恢复力不是硬扛，而是觉察消耗、降低内耗、保住一个能继续前进的节奏。",
    route: [
      "觉察情绪和精力下降信号",
      "离开现场，让身体先降温",
      "找出消耗最大的三项任务",
      "设置恢复边界与最低行动",
      "复盘触发点，形成重启清单"
    ],
    story: {
      title: "苏轼《定风波》",
      source: "苏轼《定风波·莫听穿林打叶声》",
      scenario:
        "苏轼被贬黄州途中遇雨，同行者都狼狈躲雨，他却写下“莫听穿林打叶声，何妨吟啸且徐行”。他没有假装雨不存在，而是承认处境、降低内耗，用继续前行的节奏保住自己的状态。",
      lesson:
        "情绪自愈不是压抑感受，而是承认现实、控制注意力、保住行动节奏。恢复力来自给自己设置一个最小可执行的下一步，而不是要求一切立刻变好。"
    },
    questions: [
      {
        id: "train-recovery-1",
        prompt: "连续一周高强度工作后，精力明显下降，你会怎么做？",
        options: [
          {
            label: "主动设恢复边界，把重要工作放到高能量时段",
            feedback: "管理精力峰值，比硬撑更可持续。"
          },
          {
            label: "先靠意志力撑过去，等工作结束再休息",
            feedback: "意志力透支会降低后续决策质量。"
          },
          {
            label: "减少睡眠，把时间全部给工作",
            feedback: "减少睡眠会加速精力和判断力崩盘。"
          }
        ],
        answer: 0
      },
      {
        id: "train-recovery-2",
        prompt: "情绪最差时，你最有效的恢复方式是什么？",
        options: [
          {
            label: "先离开现场，让身体和情绪降温",
            feedback: "物理抽离能打断情绪升级循环。"
          },
          {
            label: "找信任的人倾诉",
            feedback: "倾诉有用，但要注意场合和时机。"
          },
          {
            label: "用更多工作转移注意力",
            feedback: "转移不等于恢复，可能会把疲惫推得更远。"
          }
        ],
        answer: 0
      },
      {
        id: "train-recovery-3",
        prompt: "你发现自己连续两周疲惫，会先做什么？",
        options: [
          {
            label: "检查精力消耗最大的三项任务",
            feedback: "先定位消耗源，恢复措施才有针对性。"
          },
          {
            label: "减少睡眠以外的一切活动",
            feedback: "全面收缩可能连恢复活动也一起砍掉。"
          },
          {
            label: "硬撑到项目结束",
            feedback: "连续透支会让恢复周期变得更长。"
          }
        ],
        answer: 0
      }
    ]
  },
  {
    abilityId: "execution",
    routeTitle: "执行五步：把目标拆成可验收成果",
    routeSummary: "执行力不是忙，而是用关键结果、检查节点和验收标准让方向每天都能被确认。",
    route: [
      "把大目标拆成三个关键结果",
      "砍掉不支撑关键结果的低价值事项",
      "为每个结果指定负责人",
      "设置固定节奏的里程碑检查",
      "用验收标准复盘是否真正交付"
    ],
    story: {
      title: "西门豹治邺",
      source: "《史记·滑稽列传》",
      scenario:
        "西门豹到邺地任官，先访民间疾苦，发现“河伯娶妇”是地方官与巫祝合谋敛财。他没有只发禁令，而是用一场仪式让主谋当众现形，随后组织民众开渠治水，逐步把迷信和灾患一起解决。",
      lesson:
        "执行力是把复杂问题拆成可验证的阶段：先查清事实，再设置规则，最后用工程成果取代旧有恶习。每一步都要有负责者和验收标准。"
    },
    questions: [
      {
        id: "train-execution-1",
        prompt: "季度目标缺口很大，你会先做什么？",
        options: [
          {
            label: "拆出关键结果，砍掉低价值事项",
            feedback: "先收窄范围，才能集中资源追赶最重要结果。"
          },
          {
            label: "让团队集中加班追赶数字",
            feedback: "加班没有关键结果校准，只会放大疲惫。"
          },
          {
            label: "先和上级沟通能否降低目标",
            feedback: "调整目标可以，但不应成为第一反应。"
          }
        ],
        answer: 0
      },
      {
        id: "train-execution-2",
        prompt: "项目突然出现新任务，你会怎么做？",
        options: [
          {
            label: "先判断它是否影响关键结果",
            feedback: "用关键结果过滤新任务，避免计划被冲散。"
          },
          {
            label: "尽快插入排期，避免漏掉",
            feedback: "插入前不判断优先级，会让关键结果延期。"
          },
          {
            label: "立即处理，防止上级追问",
            feedback: "立即处理看似稳妥，但可能牺牲真正重要的交付。"
          }
        ],
        answer: 0
      },
      {
        id: "train-execution-3",
        prompt: "你要保证团队按计划推进，最有效的机制是什么？",
        options: [
          {
            label: "固定节奏的里程碑检查",
            feedback: "固定检查节点比临时催问更有预期性。"
          },
          {
            label: "每天催问进度",
            feedback: "高频催问消耗信任，也容易变成形式汇报。"
          },
          {
            label: "等交付前统一检查",
            feedback: "到最后才检查，风险已经无法及时回收。"
          }
        ],
        answer: 0
      }
    ]
  },
  {
    abilityId: "structure",
    routeTitle: "结构思考五步：抓住主要矛盾",
    routeSummary: "面对模糊问题时，先定义边界、拆出关键变量，再找到牵一发动全身的节点投入资源。",
    route: [
      "写清问题定义与判断标准",
      "拆出关键变量和因果链",
      "找出主要矛盾与限制条件",
      "形成可验证假设",
      "用最小实验修正结构"
    ],
    story: {
      title: "围魏救赵",
      source: "《史记·孙子吴起列传》",
      scenario:
        "魏国攻打赵国，赵国向齐国求救。孙膑没有直接去邯郸与魏军主力硬拼，而是判断魏国精锐在外、都城防守空虚，于是率军攻其必救的大梁。魏军被迫回撤，赵国危局随之解除。",
      lesson:
        "结构思考不是把所有信息都处理完，而是先抓住主要矛盾。找到那个牵一发动全身的关键节点，往往比在局部问题里更用力更有效。"
    },
    questions: [
      {
        id: "train-structure-1",
        prompt: "遇到一个从没做过的问题，你通常怎么开始？",
        options: [
          {
            label: "先定义问题边界，再拆解关键变量",
            feedback: "清晰的问题定义能把模糊变成可行动的结构。"
          },
          {
            label: "先找类似案例，复制成功做法",
            feedback: "案例有参考价值，但情境不同需要重新验证。"
          },
          {
            label: "先动手试，遇到问题再调整",
            feedback: "没有结构地试错，容易消耗资源且无法积累规律。"
          }
        ],
        answer: 0
      },
      {
        id: "train-structure-2",
        prompt: "一个问题反复出现，你会先分析什么？",
        options: [
          {
            label: "导致问题发生的系统条件",
            feedback: "系统条件不改变，单点修复会反复复发。"
          },
          {
            label: "这次是谁的责任",
            feedback: "追责会得到短期答案，但不一定能修复系统。"
          },
          {
            label: "如何快速补一个漏洞",
            feedback: "快速补洞可以，但要继续找深层原因。"
          }
        ],
        answer: 0
      },
      {
        id: "train-structure-3",
        prompt: "你拿到大量信息，会先做什么？",
        options: [
          {
            label: "按目标拆成关键变量和因果链",
            feedback: "目标能过滤噪音，因果链能定位杠杆点。"
          },
          {
            label: "按来源整理成清单",
            feedback: "清单是材料，不等于分析结构。"
          },
          {
            label: "直接寻找最突出的结论",
            feedback: "最突出不一定最关键，容易受信息可得性影响。"
          }
        ],
        answer: 0
      }
    ]
  },
  {
    abilityId: "communication",
    routeTitle: "协同沟通五步：先理解，再对齐",
    routeSummary: "沟通的目标不是说服对方接受你的方案，而是让各方共同重新定义目标、责任和截止时间。",
    route: [
      "先复述对方诉求，确认理解",
      "把分歧还原到共同客户或成果",
      "用提问代替结论",
      "共同确定目标、责任人和节点",
      "用一页纪要锁定共识"
    ],
    story: {
      title: "触龙说赵太后",
      source: "《战国策·赵策四》",
      scenario:
        "秦国攻赵，赵国向齐国求救，齐国要求长安君为质。赵太后拒绝所有大臣劝谏。触龙没有正面争辩，而是先聊家常，再从“父母之爱子，则为之计深远”的角度，让太后自己看见把长安君留在身边并非真爱，最终促成齐国出兵。",
      lesson:
        "协同沟通不是急着输出方案，而是先复述对方顾虑、找到共同利害，再让对方参与重新定义目标。对方愿意听，是因为他感到自己被理解。"
    },
    questions: [
      {
        id: "train-communication-1",
        prompt: "跨部门会议陷入争执，你会怎样表达？",
        options: [
          {
            label: "先复述双方诉求，再重新定义共同目标",
            feedback: "复述能降低防御，共同目标能把争执变成协作。"
          },
          {
            label: "直接提出我的方案，要求大家配合",
            feedback: "先输出方案容易让各方继续守立场。"
          },
          {
            label: "先不表态，等会后私下处理",
            feedback: "会下处理有空间，但公开分歧仍需被对齐。"
          }
        ],
        answer: 0
      },
      {
        id: "train-communication-2",
        prompt: "对方明显误解了你的意思，你会怎么做？",
        options: [
          {
            label: "先复述对方理解，再补充关键信息",
            feedback: "先确认对方听到什么，再补充信息才有效。"
          },
          {
            label: "更详细地重复自己的观点",
            feedback: "重复可能加深误解，因为问题往往不在信息量。"
          },
          {
            label: "让第三方再次转达",
            feedback: "第三方会增加失真，也不利于直接建立信任。"
          }
        ],
        answer: 0
      },
      {
        id: "train-communication-3",
        prompt: "跨部门会议时间不够，你优先对齐什么？",
        options: [
          {
            label: "共同目标、责任人和截止时间",
            feedback: "先锁定行动共识，细节可以在会后补。"
          },
          {
            label: "各部门的困难和诉求",
            feedback: "倾听必要，但不能代替行动共识。"
          },
          {
            label: "最终方案细节",
            feedback: "先争细节，可能连目标和责任都没有对齐。"
          }
        ],
        answer: 0
      }
    ]
  }
];

export const TRAINING_BY_ABILITY = Object.fromEntries(
  TRAINING_PATHS.map((path) => [path.abilityId, path])
) as Record<AbilityId, AbilityTraining>;

export function trainingQuestionCount(abilityId: AbilityId): number {
  return TRAINING_BY_ABILITY[abilityId].questions.length;
}

export function scoreTrainingAnswers(
  questions: TrainingQuestion[],
  answers: number[]
): { correct: number; total: number; answered: boolean[] } {
  const answered = questions.map(
    (question, index) => question.answer === answers[index]
  );
  return {
    correct: answered.filter(Boolean).length,
    total: questions.length,
    answered
  };
}
