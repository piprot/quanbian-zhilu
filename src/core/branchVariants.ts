import type { OptionQuality } from "./types.ts";

export interface BranchVariantView {
  label: string;
  summary: string;
  feedback: string;
  theory: string;
}

export type BranchVariantSet = Record<
  OptionQuality,
  { zh: BranchVariantView; en: BranchVariantView }
>;

export const BRANCH_VARIANTS: Record<number, BranchVariantSet> = {
  1: {
    expert: {
      zh: {
        label: "先用 48 小时最小验证建立第一份可核对的成果",
        summary: "把诊断结论压成一个可验证动作，让团队先看到确定性。",
        feedback: "你没有被“先熟悉再动手”的惯性拖住，第一份可核对的成果让授权问题自然松动。",
        theory: "《权经》：携为上，功次之；权乃人授，授为大焉。"
      },
      en: {
        label: "Build a first verifiable result within 48 hours",
        summary: "Compress the diagnosis into one testable action so the team sees certainty first.",
        feedback: "You were not held back by the get-to-know-the-team rhythm; the first verifiable result loosened the authority problem naturally.",
        theory: "The Book of Power: small wins come first; authority is granted by people."
      }
    },
    partial: {
      zh: {
        label: "先与高层对齐 90 天目标再动作",
        summary: "向上对齐指标与边界，把第一周交给正式授权。",
        feedback: "目标对齐了，但团队仍看不到你的第一份判断，信任积累慢了一步。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      },
      en: {
        label: "Align the 90-day goal with leadership before acting",
        summary: "Agree on metrics and boundaries first and spend the first week inside formal authority.",
        feedback: "The goal aligned, but the team still had not seen your first judgment, so trust accumulated slowly.",
        theory: "The Art of War: first make yourself invincible, then wait for the enemy to be vincible."
      }
    },
    risk: {
      zh: {
        label: "跳过访谈直接推动业务动作",
        summary: "用行动速度证明价值，不浪费第一周在关系上。",
        feedback: "动作很快，但组织还没有准备好接收，第一波阻力从暗处提前出现。",
        theory: "《论语》：不患人之不己知，患不知人也。"
      },
      en: {
        label: "Skip the interviews and push business action directly",
        summary: "Prove value with speed instead of spending the first week on relationships.",
        feedback: "The action was fast, but the organization was not ready to receive it, and the first resistance surfaced early.",
        theory: "The Analects: do not worry that others do not know you; worry that you do not know others."
      }
    }
  },
  2: {
    expert: {
      zh: {
        label: "先用 48 小时验证关键链路，再谈授权",
        summary: "把授权问题转成可验证的成果问题，让高层先看见确定性。",
        feedback: "你没有把授权当谈判筹码，而是用可验证的成果建立势能，权力开始自然回流。",
        theory: "《权经》：携为上，功次之；权乃人授，授为大焉。"
      },
      en: {
        label: "Verify the critical path in 48 hours before asking for authority",
        summary: "Turn the authority problem into a verifiable result so leadership sees certainty first.",
        feedback: "You built momentum with a testable result instead of bargaining for power, and authority began to return naturally.",
        theory: "The Book of Power: small wins come first; authority is granted by people."
      }
    },
    partial: {
      zh: {
        label: "直接要书面授权",
        summary: "把授权问题摆到桌面上，先拿到名分再行动。",
        feedback: "名分拿到了，但你在没有成果的情况下消耗了第一波政治资本。",
        theory: "《韩非子》：事以密成，语以泄败。"
      },
      en: {
        label: "Ask for written authority directly",
        summary: "Put the authority question on the table and act only after you hold the title.",
        feedback: "You gained the title but spent political capital before producing a result.",
        theory: "Han Feizi: matters succeed in secrecy and fail through loose talk."
      }
    },
    risk: {
      zh: {
        label: "绕开上级直接推动",
        summary: "不等授权，先用行动制造事实。",
        feedback: "行动制造了事实，也制造了更强的反对联盟，下一步阻力更大。",
        theory: "《孙子兵法》：先为不可胜，以待敌之可胜。"
      },
      en: {
        label: "Push forward around your superior",
        summary: "Do not wait for authority; create facts with action.",
        feedback: "The action created facts but also a stronger opposition coalition.",
        theory: "The Art of War: first make yourself invincible."
      }
    }
  },
  3: {
    expert: {
      zh: {
        label: "用岗位成果定义名单，而不是资历",
        summary: "先把未来六个月的关键岗位成果写清楚，再决定谁去谁留。",
        feedback: "名单有了统一标尺，争议从人事斗争变成了能力匹配，组织开始认同这套逻辑。",
        theory: "《贞观政要》：用非其才，必难致治；舍短取长，各尽其能。"
      },
      en: {
        label: "Define the roster by role outcomes, not tenure",
        summary: "Write the next six months of role outcomes first, then decide who stays.",
        feedback: "The roster gained one standard; conflict moved from politics to capability matching.",
        theory: "Zhenguan Essentials: use people by strength and set aside weakness."
      }
    },
    partial: {
      zh: {
        label: "先保住核心客户关系",
        summary: "以客户稳定性优先，暂缓结构性调整。",
        feedback: "客户暂时稳住了，但组织的职责混乱会继续积累成本。",
        theory: "《韩非子·用人》：使事不相干，使士不兼官。"
      },
      en: {
        label: "Protect core client relationships first",
        summary: "Prioritize client stability and postpone structural changes.",
        feedback: "Clients stabilized, but unclear ownership keeps accumulating cost.",
        theory: "Han Feizi: keep roles separate so people are not overloaded."
      }
    },
    risk: {
      zh: {
        label: "按亲疏定名单",
        summary: "优先留下信任的人，能力缺口用培训补。",
        feedback: "短期安全感有了，但最优秀的人开始离开，名单失去了公信力。",
        theory: "《资治通鉴》：才者，德之资也；德者，才之帅也。"
      },
      en: {
        label: "Choose the roster by loyalty",
        summary: "Keep trusted people first and fill ability gaps with training.",
        feedback: "Short-term safety appeared, but the best people started leaving.",
        theory: "Comprehensive Mirror: talent is the resource of virtue, virtue the commander of talent."
      }
    }
  },
  4: {
    expert: {
      zh: {
        label: "把反对者变成方案共同作者",
        summary: "邀请反对者补上交付保障条款，并承担试点责任。",
        feedback: "反对声变成了方案的一部分，阻力从边界移到了内部。",
        theory: "《论语》：举直错诸枉，则民服。"
      },
      en: {
        label: "Make the opponent a co-author of the plan",
        summary: "Invite them to add delivery safeguards and own the pilot.",
        feedback: "Dissent became part of the plan, and resistance moved inside ownership.",
        theory: "The Analects: promote the straight over the crooked and the people follow."
      }
    },
    partial: {
      zh: {
        label: "用高层背书压住争议",
        summary: "带着批准文件推进，减少公开讨论。",
        feedback: "方案落地快，但执行层在暗处走了样。",
        theory: "《韩非子》：法势术并用，但不能代替人心。"
      },
      en: {
        label: "Use executive backing to suppress debate",
        summary: "Move forward with approval documents and reduce public discussion.",
        feedback: "The plan landed fast, but execution quietly drifted.",
        theory: "Han Feizi: law, tactics and power must work together, but not replace people's hearts."
      }
    },
    risk: {
      zh: {
        label: "撤回方案重新评估",
        summary: "先平息争议，下次再找机会。",
        feedback: "争议平息了，但你失去了推动变革的主动权。",
        theory: "《孙子兵法》：不可胜在己，可胜在敌。"
      },
      en: {
        label: "Withdraw the plan and reassess",
        summary: "Calm the dispute now and try again later.",
        feedback: "The dispute cooled, but you lost the initiative for change.",
        theory: "The Art of War: invincibility lies in yourself; victory lies in the enemy."
      }
    }
  },
  5: {
    expert: {
      zh: {
        label: "用关键结果倒排行动和资源",
        summary: "把目标拆成三个可验收结果，并给每个结果配资源与负责人。",
        feedback: "目标第一次变成可每天检查的作战图，执行不再靠口号。",
        theory: "《卓有成效的管理者》：要事优先，把资源集中在少数真正重要的任务上。"
      },
      en: {
        label: "Work backward from key results to actions and resources",
        summary: "Break the goal into three verifiable results, each with resources and an owner.",
        feedback: "The goal became a daily-checkable battle map; execution no longer runs on slogans.",
        theory: "The Effective Executive: concentrate resources on a few truly important tasks."
      }
    },
    partial: {
      zh: {
        label: "先保当期数字再谈体系",
        summary: "优先完成本月指标，管理体系延后。",
        feedback: "数字暂时好看，但下一季仍会回到救火模式。",
        theory: "《孙子兵法》：兵贵胜，不贵久。"
      },
      en: {
        label: "Hit this quarter's numbers before building systems",
        summary: "Prioritize monthly targets and defer management systems.",
        feedback: "Numbers look good for now, but the next quarter returns to firefighting.",
        theory: "The Art of War: value victory, not prolonged campaigns."
      }
    },
    risk: {
      zh: {
        label: "让各部门自报目标",
        summary: "尊重各部门判断，汇总成总目标。",
        feedback: "各部门目标互相冲突，执行层拿到的是无法对齐的清单。",
        theory: "《矛盾论》：抓主要矛盾，其他问题才能迎刃而解。"
      },
      en: {
        label: "Let each department set its own targets",
        summary: "Respect departmental judgment and aggregate the results.",
        feedback: "The targets conflict with each other, leaving an unaligned list.",
        theory: "On Contradiction: grasp the principal contradiction and the rest resolves."
      }
    }
  },
  6: {
    expert: {
      zh: {
        label: "用制度把绕行变成不合规",
        summary: "建立关键决策闭环，让绕过流程需要付出协作成本。",
        feedback: "你没有公开对抗，而是让组织规则替你守住了边界。",
        theory: "《韩非子》：法度既立，虽庸主可治。"
      },
      en: {
        label: "Make bypassing the process a compliance issue",
        summary: "Build a decision loop so going around it costs collaboration.",
        feedback: "You did not fight openly; the rules guarded the boundary for you.",
        theory: "Han Feizi: once the law stands, even a mediocre ruler can govern."
      }
    },
    partial: {
      zh: {
        label: "在高层面前摊牌",
        summary: "把越级行为公开，让更高层表态。",
        feedback: "你得到了表态，但也让对方形成更紧的联盟。",
        theory: "《权经》：权乃人授，授为大焉。"
      },
      en: {
        label: "Force a public showdown",
        summary: "Expose the bypass in front of leadership and ask for a ruling.",
        feedback: "You gained a statement, but pushed the other side into a tighter alliance.",
        theory: "The Book of Power: authority is granted; granting it well is the greater art."
      }
    },
    risk: {
      zh: {
        label: "先忍耐到业绩翻身",
        summary: "暂时不处理，等自己重新获得话语权。",
        feedback: "忍耐换来了时间，也让组织默认你不需要被尊重。",
        theory: "《资治通鉴》：防微杜渐，不塞隙穴则暴雨疾风必坏。"
      },
      en: {
        label: "Endure until performance returns",
        summary: "Hold off and wait until results restore your voice.",
        feedback: "Patience bought time, but taught the organization that respect is optional.",
        theory: "Comprehensive Mirror: plug the crack before the storm breaks the wall."
      }
    }
  },
  7: {
    expert: {
      zh: {
        label: "按岗位匹配接班人并设计陪跑期",
        summary: "提名能力最匹配的人，同时给年轻梯队安排高挑战项目。",
        feedback: "双梯队形成，你的影响力从个人依赖变成了制度安排。",
        theory: "《贞观政要》：创业难，守成更难，关键在于持续担当。"
      },
      en: {
        label: "Match the successor to the role and design a runway",
        summary: "Nominate the best fit and give younger leaders high-challenge projects.",
        feedback: "A dual bench formed; your influence moved from personal dependence to institutions.",
        theory: "Zhenguan Essentials: starting is hard, sustaining is harder; continuity needs ownership."
      }
    },
    partial: {
      zh: {
        label: "提名忠诚的自己人",
        summary: "优先保证权力延续，能力靠时间补。",
        feedback: "权力暂时延续，但组织开始流失最有能力的人。",
        theory: "《贞观政要》：用非其才，必难致治。"
      },
      en: {
        label: "Nominate a loyal insider",
        summary: "Prioritize continuity and let capability catch up over time.",
        feedback: "Authority continued, but the most capable people began leaving.",
        theory: "Zhenguan Essentials: using the wrong talent makes governance hard."
      }
    },
    risk: {
      zh: {
        label: "让公司外部招聘接班人",
        summary: "引入外部经验，回避内部培养责任。",
        feedback: "外部人带来新经验，也堵住了内部成长通道。",
        theory: "《韩非子·用人》：明主之道，使智者尽其虑。"
      },
      en: {
        label: "Let the company hire the successor externally",
        summary: "Bring in outside experience and avoid internal development duty.",
        feedback: "New experience arrived, but internal growth paths closed.",
        theory: "Han Feizi: the wise ruler lets capable people exhaust their thinking."
      }
    }
  },
  8: {
    expert: {
      zh: {
        label: "先隔离风险，再抓机会",
        summary: "把危机拆成隔离、回款、融资三条线，按优先级行动。",
        feedback: "恐慌没有扩散，团队第一次按优先级而不是情绪行动。",
        theory: "《矛盾论》：抓住主要矛盾，其他矛盾就能牵动起来。"
      },
      en: {
        label: "Isolate the risk first, then chase opportunity",
        summary: "Split the crisis into containment, collection and funding tracks.",
        feedback: "Panic did not spread; the team acted on priority, not emotion.",
        theory: "On Contradiction: grasp the principal contradiction and the rest follows."
      }
    },
    partial: {
      zh: {
        label: "全员通报并开源节流",
        summary: "透明传递危机，同时要求各部门削减成本。",
        feedback: "透明度带来危机意识，也带来了离职风险。",
        theory: "《孙子兵法》：上下同欲者胜。"
      },
      en: {
        label: "Announce the crisis and cut costs everywhere",
        summary: "Share the risk transparently and ask every team to cut.",
        feedback: "Transparency built urgency but also resignation risk.",
        theory: "The Art of War: win when top and bottom share the same will."
      }
    },
    risk: {
      zh: {
        label: "先向老板求救",
        summary: "把问题升级，等更高层给资源。",
        feedback: "钱可能到位，但你也交出了主导权。",
        theory: "《权经》：权乃人授，授为大焉，但受制于人则不能自主。"
      },
      en: {
        label: "Ask the boss for rescue first",
        summary: "Escalate the problem and wait for resources from above.",
        feedback: "Money may arrive, but so does the loss of initiative.",
        theory: "The Book of Power: authority is granted, but dependence limits autonomy."
      }
    }
  },
  9: {
    expert: {
      zh: {
        label: "完成交接并留下决策方法",
        summary: "把关键判断写成方法清单，让继任者用真实案例演练。",
        feedback: "你离开后组织仍能稳定运行，权力在交接中变得更可靠。",
        theory: "《资治通鉴》：谦退是一种气量；《贞观政要》：善始慎终。"
      },
      en: {
        label: "Complete the handoff and leave a decision method",
        summary: "Turn key judgments into a checklist and let the successor drill with real cases.",
        feedback: "The organization kept running after you left; authority became more reliable in handoff.",
        theory: "Comprehensive Mirror: humility is a form of strength; finish well as you started."
      }
    },
    partial: {
      zh: {
        label: "抓住机会立即上升",
        summary: "先把握个人机会，交接细节交给时间。",
        feedback: "机会抓住了，但交接断层可能让组织退回原样。",
        theory: "《孙子兵法》：将能而君不御者胜。"
      },
      en: {
        label: "Take the promotion immediately",
        summary: "Seize the personal opportunity and let handoff details settle later.",
        feedback: "The opportunity landed, but the gap may let the organization regress.",
        theory: "The Art of War: win when the commander is capable and the ruler does not interfere."
      }
    },
    risk: {
      zh: {
        label: "拒绝晋升继续掌权",
        summary: "把安全感和控制感放在组织发展之前。",
        feedback: "你留住了位置，却限制了组织的人才流动。",
        theory: "《权经》：权惟用，不为大也。"
      },
      en: {
        label: "Refuse the promotion to keep control",
        summary: "Put safety and control before organizational growth.",
        feedback: "You kept the seat but limited the flow of talent.",
        theory: "The Book of Power: authority exists to be used, not to be enlarged."
      }
    }
  }
};

export function branchVariantFor(
  chapterId: number,
  quality: OptionQuality,
  language: "zh" | "en"
): BranchVariantView | undefined {
  return BRANCH_VARIANTS[chapterId]?.[quality]?.[language];
}
