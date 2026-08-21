import { ROLES, abilityLevel } from "./abilities.ts";
import type { AbilityId, RoleId } from "./types";

export interface AssessmentOption {
  label: string;
  points: number;
}

export interface AssessmentQuestion {
  id: string;
  abilityId: AbilityId;
  prompt: string;
  options: AssessmentOption[];
}

export interface RoleTrackDimension {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  abilityIds: AbilityId[];
}

export interface RoleAssessmentTrack {
  role: RoleId;
  name: string;
  nameEn: string;
  dimensions: RoleTrackDimension[];
}

/** 三角色专属测评轨道：只作为测评子维度，主模型仍用现有十项能力。 */
export const ROLE_ASSESSMENT_TRACKS: RoleAssessmentTrack[] = [
  {
    role: "parachute",
    name: "空降管理者",
    nameEn: "Parachute Manager",
    dimensions: [
      {
        id: "parachute-insight",
        name: "识人",
        nameEn: "Reading People",
        description: "快速判断谁可信、谁可用、谁在观望。",
        abilityIds: ["insight"]
      },
      {
        id: "parachute-deploy",
        name: "用人",
        nameEn: "Placing People",
        description: "把对的人放进关键位置，用岗位成果验证。",
        abilityIds: ["deploy"]
      },
      {
        id: "parachute-mobilize",
        name: "驭人",
        nameEn: "Mobilizing People",
        description: "把反对者和观望者变成共同推进者。",
        abilityIds: ["mobilize"]
      },
      {
        id: "parachute-strategy",
        name: "谋权",
        nameEn: "Building Authority",
        description: "先立小胜、再换授权，建势而不硬争。",
        abilityIds: ["strategy"]
      },
      {
        id: "parachute-stability",
        name: "固权",
        nameEn: "Consolidating Power",
        description: "把个人影响变成制度与梯队。",
        abilityIds: ["stability"]
      }
    ]
  },
  {
    role: "founder",
    name: "创业者",
    nameEn: "Founder",
    dimensions: [
      {
        id: "founder-opportunity",
        name: "机会识别",
        nameEn: "Opportunity Spotting",
        description: "在不确定性里识别值得投入的信号。",
        abilityIds: ["insight", "structure"]
      },
      {
        id: "founder-resource",
        name: "资源整合",
        nameEn: "Resource Integration",
        description: "把有限资源、人才与关系拧成增长。",
        abilityIds: ["deploy", "strategy"]
      },
      {
        id: "founder-resilience",
        name: "韧性坚持",
        nameEn: "Resilience",
        description: "连续受挫后仍能恢复并重新开局。",
        abilityIds: ["recovery"]
      },
      {
        id: "founder-business",
        name: "商业敏感",
        nameEn: "Business Sense",
        description: "看穿成本、现金与增长的真实关系。",
        abilityIds: ["strategy", "structure"]
      },
      {
        id: "founder-vision",
        name: "愿景感召",
        nameEn: "Vision Pull",
        description: "让团队相信方向并愿意一起走。",
        abilityIds: ["communication", "mobilize"]
      }
    ]
  },
  {
    role: "highPotential",
    name: "高潜人才",
    nameEn: "High-Potential",
    dimensions: [
      {
        id: "highpot-selfdrive",
        name: "自驱力",
        nameEn: "Self-Drive",
        description: "没有指令也能持续产出与自我更新。",
        abilityIds: ["recovery", "execution"]
      },
      {
        id: "highpot-agile",
        name: "敏捷迭代",
        nameEn: "Agile Iteration",
        description: "小步验证、快速调整、结果说话。",
        abilityIds: ["execution", "structure"]
      },
      {
        id: "highpot-cross",
        name: "跨界协同",
        nameEn: "Cross-Boundary Alignment",
        description: "跨部门推动共同目标与责任落地。",
        abilityIds: ["communication", "deploy"]
      },
      {
        id: "highpot-influence",
        name: "影响力雏形",
        nameEn: "Emerging Influence",
        description: "不靠职位，也能让关键人愿意配合。",
        abilityIds: ["mobilize", "communication"]
      },
      {
        id: "highpot-review",
        name: "复盘自省",
        nameEn: "Review & Reflection",
        description: "从结果里提炼可复用的判断标准。",
        abilityIds: ["structure", "insight"]
      }
    ]
  }
];

export function assessmentTrackFor(role: RoleId): RoleAssessmentTrack {
  return (
    ROLE_ASSESSMENT_TRACKS.find((track) => track.role === role) ??
    ROLE_ASSESSMENT_TRACKS[0]
  );
}

export function roleTrackScores(
  role: RoleId,
  abilities: Record<AbilityId, number>
): Array<RoleTrackDimension & { score: number; grade: string }> {
  const track = assessmentTrackFor(role);
  return track.dimensions.map((dimension) => {
    const score = Math.round(
      dimension.abilityIds.reduce(
        (sum, id) => sum + abilityLevel(abilities[id]),
        0
      ) / dimension.abilityIds.length
    );
    return {
      ...dimension,
      score,
      grade: score >= 4 ? "A" : score >= 3 ? "B" : "C"
    };
  });
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q-insight",
    abilityId: "insight",
    prompt: "接手陌生团队后，你更倾向于怎样判断一个核心骨干是否可信？",
    options: [
      { label: "看他在压力下的行为细节，而不是他怎么说", points: 2 },
      { label: "先看他过去业绩和正式履历", points: 1 },
      { label: "主要看他和谁走得近", points: 0 }
    ]
  },
  {
    id: "q-deploy",
    abilityId: "deploy",
    prompt: "你有一个重要项目需要负责人，你会优先考虑什么？",
    options: [
      { label: "先定义岗位成果，再匹配能力证据", points: 2 },
      { label: "先找忠诚可靠的人，再逐步培养", points: 1 },
      { label: "先找资历最深的人，避免风险", points: 0 }
    ]
  },
  {
    id: "q-mobilize",
    abilityId: "mobilize",
    prompt: "团队公开反对你的新方案时，你的第一反应是什么？",
    options: [
      { label: "把反对者的顾虑变成方案前提", points: 2 },
      { label: "先稳住场面，再私下说服关键人", points: 1 },
      { label: "用决策权直接推进", points: 0 }
    ]
  },
  {
    id: "q-strategy",
    abilityId: "strategy",
    prompt: "你还没有正式授权时，会怎样推动一件重要的事？",
    options: [
      { label: "先做出小胜利，再向上换取授权", points: 2 },
      { label: "先向高层表达诉求，明确权力边界", points: 1 },
      { label: "先观望，等授权落地再说", points: 0 }
    ]
  },
  {
    id: "q-authority",
    abilityId: "authority",
    prompt: "你发现有人绕过你直接决策，你会怎么做？",
    options: [
      { label: "用联签流程重新定义权力边界", points: 2 },
      { label: "直接找对方谈话，明确边界", points: 1 },
      { label: "先不动，等对方出错再处理", points: 0 }
    ]
  },
  {
    id: "q-stability",
    abilityId: "stability",
    prompt: "你要离开当前岗位，最优先交接什么？",
    options: [
      { label: "把高频判断做成清单和决策复盘库", points: 2 },
      { label: "把关键客户和关系介绍给接班人", points: 1 },
      { label: "把重要文档整理好即可", points: 0 }
    ]
  },
  {
    id: "q-recovery",
    abilityId: "recovery",
    prompt: "连续一周高强度工作后，你的精力开始明显下降，你会？",
    options: [
      { label: "主动设恢复边界，把最重要工作放到高能量时段", points: 2 },
      { label: "先靠意志力撑过去，等工作结束再休息", points: 1 },
      { label: "减少睡眠，把时间全部给工作", points: 0 }
    ]
  },
  {
    id: "q-execution",
    abilityId: "execution",
    prompt: "季度目标缺口很大，你会先做什么？",
    options: [
      { label: "拆出关键结果，砍掉低价值事项", points: 2 },
      { label: "让团队集中加班追赶数字", points: 1 },
      { label: "先和上级沟通能否降低目标", points: 0 }
    ]
  },
  {
    id: "q-structure",
    abilityId: "structure",
    prompt: "遇到一个从没做过的问题，你通常怎么开始？",
    options: [
      { label: "先定义问题边界，再拆解关键变量", points: 2 },
      { label: "先找类似案例，复制成功做法", points: 1 },
      { label: "先动手试，遇到问题再调整", points: 0 }
    ]
  },
  {
    id: "q-communication",
    abilityId: "communication",
    prompt: "跨部门会议陷入争执，你会怎样表达？",
    options: [
      { label: "先复述双方诉求，再重新定义共同目标", points: 2 },
      { label: "直接提出我的方案，要求大家配合", points: 1 },
      { label: "先不表态，等会后私下处理", points: 0 }
    ]
  },
  {
    id: "q-insight-2",
    abilityId: "insight",
    prompt: "一个候选人业绩很好，但团队反馈他总把功劳归于自己，你会？",
    options: [
      { label: "观察他在失败时的归因和合作表现", points: 2 },
      { label: "先相信业绩，再补团队反馈", points: 1 },
      { label: "直接降低对他的评价", points: 0 }
    ]
  },
  {
    id: "q-insight-3",
    abilityId: "insight",
    prompt: "你想了解一位关键人物的真实动机，最有效的做法是？",
    options: [
      { label: "观察他主动投入时间和资源支持什么", points: 2 },
      { label: "直接问他最看重什么", points: 1 },
      { label: "参考别人对他的评价", points: 0 }
    ]
  },
  {
    id: "q-deploy-2",
    abilityId: "deploy",
    prompt: "关键岗位候选人有短板，但优势非常突出，你会？",
    options: [
      { label: "评估短板是否影响岗位核心成果，再决定", points: 2 },
      { label: "优先选择没有明显短板的人", points: 1 },
      { label: "拒绝使用有短板的人", points: 0 }
    ]
  },
  {
    id: "q-deploy-3",
    abilityId: "deploy",
    prompt: "你要给下属授权，最应该先确认什么？",
    options: [
      { label: "他要交付的成果和判断边界", points: 2 },
      { label: "他是否足够忠诚", points: 1 },
      { label: "他是否完全同意你的做法", points: 0 }
    ]
  },
  {
    id: "q-mobilize-2",
    abilityId: "mobilize",
    prompt: "团队士气低落时，最能重新激发他们的是什么？",
    options: [
      { label: "给他们一个能赢的小目标和共同责任", points: 2 },
      { label: "公开表扬几个人的努力", points: 1 },
      { label: "强调项目失败的严重后果", points: 0 }
    ]
  },
  {
    id: "q-mobilize-3",
    abilityId: "mobilize",
    prompt: "你要让两个敌对部门合作，第一步应该？",
    options: [
      { label: "重新定义双方共同的客户或成果", points: 2 },
      { label: "分别说服两方负责人", points: 1 },
      { label: "先让高层施压", points: 0 }
    ]
  },
  {
    id: "q-strategy-2",
    abilityId: "strategy",
    prompt: "你想获得资源，最有说服力的方式是？",
    options: [
      { label: "先展示一个可验证的小成果", points: 2 },
      { label: "先说明资源能带来多大回报", points: 1 },
      { label: "先强调项目紧迫性", points: 0 }
    ]
  },
  {
    id: "q-strategy-3",
    abilityId: "strategy",
    prompt: "面对强竞争对手，你更倾向于？",
    options: [
      { label: "先找到对方无法复制的差异化优势", points: 2 },
      { label: "比对方更快、更狠地投入", points: 1 },
      { label: "等对方犯错再行动", points: 0 }
    ]
  },
  {
    id: "q-authority-2",
    abilityId: "authority",
    prompt: "你刚接手团队，最需要先建立的权威来源是？",
    options: [
      { label: "清晰一致的决策标准和结果", points: 2 },
      { label: "严格的工作纪律", points: 1 },
      { label: "公开批评问题行为", points: 0 }
    ]
  },
  {
    id: "q-authority-3",
    abilityId: "authority",
    prompt: "有人公开质疑你的决定，你会？",
    options: [
      { label: "先确认事实，再决定是否调整", points: 2 },
      { label: "立即维护决定权威", points: 1 },
      { label: "当众驳斥质疑者", points: 0 }
    ]
  },
  {
    id: "q-stability-2",
    abilityId: "stability",
    prompt: "你要让团队不依赖你也能运转，关键是？",
    options: [
      { label: "把关键决策变成可复用的流程", points: 2 },
      { label: "培养一个最信任的代理人", points: 1 },
      { label: "保留关键决策在自己手里", points: 0 }
    ]
  },
  {
    id: "q-stability-3",
    abilityId: "stability",
    prompt: "你的核心能力被别人学会后，你会？",
    options: [
      { label: "继续升级更高阶的能力", points: 2 },
      { label: "主动带教并扩大影响力", points: 1 },
      { label: "担心自己被替代", points: 0 }
    ]
  },
  {
    id: "q-recovery-2",
    abilityId: "recovery",
    prompt: "情绪最差时，你最有效的恢复方式是？",
    options: [
      { label: "先离开现场，让身体和情绪降温", points: 2 },
      { label: "找信任的人倾诉", points: 1 },
      { label: "用更多工作转移注意力", points: 0 }
    ]
  },
  {
    id: "q-recovery-3",
    abilityId: "recovery",
    prompt: "你发现自己连续两周疲惫，会先做什么？",
    options: [
      { label: "检查精力消耗最大的三项任务", points: 2 },
      { label: "减少睡眠以外的一切活动", points: 1 },
      { label: "硬撑到项目结束", points: 0 }
    ]
  },
  {
    id: "q-execution-2",
    abilityId: "execution",
    prompt: "项目突然出现新任务，你会？",
    options: [
      { label: "先判断它是否影响关键结果", points: 2 },
      { label: "尽快插入排期，避免漏掉", points: 1 },
      { label: "立即处理，防止上级追问", points: 0 }
    ]
  },
  {
    id: "q-execution-3",
    abilityId: "execution",
    prompt: "你要保证团队按计划推进，最有效的机制是？",
    options: [
      { label: "固定节奏的里程碑检查", points: 2 },
      { label: "每天催问进度", points: 1 },
      { label: "等交付前统一检查", points: 0 }
    ]
  },
  {
    id: "q-structure-2",
    abilityId: "structure",
    prompt: "一个问题反复出现，你会先分析什么？",
    options: [
      { label: "导致问题发生的系统条件", points: 2 },
      { label: "这次是谁的责任", points: 1 },
      { label: "如何快速补一个漏洞", points: 0 }
    ]
  },
  {
    id: "q-structure-3",
    abilityId: "structure",
    prompt: "你拿到大量信息，会先做什么？",
    options: [
      { label: "按目标拆成关键变量和因果链", points: 2 },
      { label: "按来源整理成清单", points: 1 },
      { label: "直接寻找最突出的结论", points: 0 }
    ]
  },
  {
    id: "q-communication-2",
    abilityId: "communication",
    prompt: "对方明显误解了你的意思，你会？",
    options: [
      { label: "先复述对方理解，再补充关键信息", points: 2 },
      { label: "更详细地重复自己的观点", points: 1 },
      { label: "让第三方再次转达", points: 0 }
    ]
  },
  {
    id: "q-communication-3",
    abilityId: "communication",
    prompt: "跨部门会议时间不够，你优先对齐什么？",
    options: [
      { label: "共同目标、责任人和截止时间", points: 2 },
      { label: "各部门的困难和诉求", points: 1 },
      { label: "最终方案细节", points: 0 }
    ]
  }
];

export function certificationLevel(save: {
  profile: { role: import("./types").RoleId; abilities: Record<AbilityId, number> };
  assessmentScore: number;
}): { level: string; passed: boolean; score: number; next: string } {
  const role = save.profile.role;
  const focusSum = ROLES[role].focusAbilities.reduce(
    (sum, id) => sum + abilityLevel(save.profile.abilities[id]),
    0
  );
  const score = save.assessmentScore;
  if (score >= 42 && focusSum >= 30) {
    return { level: "高级认证", passed: true, score, next: "已达最高认证标准" };
  }
  if (score >= 32 && focusSum >= 20) {
    return { level: "中级认证", passed: true, score, next: "继续提升角色重点能力至 30 级经验可获高级认证" };
  }
  if (score >= 22 && focusSum >= 10) {
    return { level: "初级认证", passed: true, score, next: "继续提升角色重点能力并提升测评总分可获中级认证" };
  }
  return {
    level: "未认证",
    passed: false,
    score,
    next: "完成测评并提升角色重点能力后即可申请认证"
  };
}
