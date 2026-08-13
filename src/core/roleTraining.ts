import type { AbilityId, RoleId } from "./types.ts";

export interface RoleText {
  zh: string;
  en: string;
}

export interface RoleRoadmapStage {
  id: string;
  title: RoleText;
  goal: RoleText;
  abilities: AbilityId[];
}

export interface RoleRoadmap {
  role: RoleId;
  theme: RoleText;
  themeDetail: RoleText;
  pitfalls: RoleText[];
  stages: RoleRoadmapStage[];
}

export const ROLE_ROADMAPS: Record<RoleId, RoleRoadmap> = {
  parachute: {
    role: "parachute",
    theme: {
      zh: "空降管理者：先看懂权力，再建立信任，最后推动变革",
      en: "Parachute manager: read the power map first, build trust, then lead change"
    },
    themeDetail: {
      zh: "你的 90 天不是从发令开始，而是从诊断开始。先识别谁真正决定资源，再用小胜利换授权，最后把个人判断变成组织共识。",
      en: "Your first 90 days start with diagnosis, not orders. Map who truly decides resources, trade small wins for authority, then turn personal judgment into shared commitment."
    },
    pitfalls: [
      {
        zh: "急着证明自己而跳过诊断，容易把第一波信任烧在错误的胜利上。",
        en: "Rushing to prove yourself before diagnosing burns first-wave trust on the wrong wins."
      },
      {
        zh: "把授权当福利而不是责任，会让团队把变革看成另一场服从测试。",
        en: "Treating authority as a reward instead of responsibility turns change into another obedience test."
      }
    ],
    stages: [
      {
        id: "diagnose",
        title: { zh: "识局", en: "Diagnose" },
        goal: {
          zh: "先访谈关键人物，画出真实权力地图",
          en: "Interview key people and map the real power structure"
        },
        abilities: ["insight"]
      },
      {
        id: "build",
        title: { zh: "建势", en: "Build Momentum" },
        goal: {
          zh: "用小胜利与信息同步换取授权空间",
          en: "Trade small wins and information alignment for authority"
        },
        abilities: ["strategy"]
      },
      {
        id: "align",
        title: { zh: "对齐", en: "Align" },
        goal: {
          zh: "把反对者和沉默者都变成共同责任人",
          en: "Turn opponents and silent voices into co-owners"
        },
        abilities: ["communication"]
      },
      {
        id: "hold",
        title: { zh: "掌权", en: "Hold Authority" },
        goal: {
          zh: "用制度守住边界，不靠个人威慑",
          en: "Guard boundaries with institutions, not personal fear"
        },
        abilities: ["authority"]
      },
      {
        id: "certify",
        title: { zh: "认证", en: "Certify" },
        goal: {
          zh: "四项焦点能力达到认证线",
          en: "Reach certification on all four focus abilities"
        },
        abilities: ["insight", "strategy", "communication", "authority"]
      }
    ]
  },
  founder: {
    role: "founder",
    theme: {
      zh: "创业者：先活下来，再用可验证的成果建立组织能力",
      en: "Founder: survive first, then build organizational capability on verified results"
    },
    themeDetail: {
      zh: "你的权力来自现金流和证据，而不是头衔。先守住生存线，把模糊方向拆成可验证的动作，再让团队为共同目标负责。",
      en: "Your authority comes from cash flow and evidence, not titles. Protect survival first, break ambiguity into testable actions, then hold the team to shared outcomes."
    },
    pitfalls: [
      {
        zh: "把加班当执行，会让精力循环变成透支循环。",
        en: "Treating overtime as execution turns the energy loop into burnout."
      },
      {
        zh: "用创始人权威硬推，会赢得服从、失去真实信息。",
        en: "Pushing with founder authority wins compliance and loses real information."
      }
    ],
    stages: [
      {
        id: "frame",
        title: { zh: "定义", en: "Frame" },
        goal: {
          zh: "把模糊目标拆成一句话问题与关键变量",
          en: "Turn fuzzy goals into a one-line problem with key variables"
        },
        abilities: ["structure"]
      },
      {
        id: "deliver",
        title: { zh: "交付", en: "Deliver" },
        goal: {
          zh: "用关键结果与验收标准保住现金流",
          en: "Protect cash flow with key results and acceptance criteria"
        },
        abilities: ["execution"]
      },
      {
        id: "recover",
        title: { zh: "恢复", en: "Recover" },
        goal: {
          zh: "管理自己的精力，不把焦虑传染给团队",
          en: "Manage your energy instead of infecting the team with anxiety"
        },
        abilities: ["recovery"]
      },
      {
        id: "shape",
        title: { zh: "定方向", en: "Shape Direction" },
        goal: {
          zh: "在不确定中用检查点持续校准方向",
          en: "Calibrate direction with checkpoints under uncertainty"
        },
        abilities: ["strategy"]
      },
      {
        id: "certify",
        title: { zh: "认证", en: "Certify" },
        goal: {
          zh: "四项焦点能力达到认证线",
          en: "Reach certification on all four focus abilities"
        },
        abilities: ["structure", "execution", "recovery", "strategy"]
      }
    ]
  },
  highPotential: {
    role: "highPotential",
    theme: {
      zh: "高潜人才：不靠职位，用专业、关系与结构推动事情发生",
      en: "High potential: move work forward with expertise, relationships, and structure instead of title"
    },
    themeDetail: {
      zh: "你不能发号施令，所以每一分影响力都要靠判断力、协同机制和证据获得。先把横向共识做出来，再让方案自己获得支持。",
      en: "You cannot command, so every bit of influence comes from judgment, collaboration mechanisms, and evidence. Build horizontal consensus first, then let the plan win support on its own."
    },
    pitfalls: [
      {
        zh: "用专业碾压别人，会让专业变成防御而不是贡献。",
        en: "Overwhelming others with expertise turns it into a defense instead of a contribution."
      },
      {
        zh: "绕过部门负责人推方案，会赢得结果、输掉长期协作。",
        en: "Going around department owners wins the result and loses long-term collaboration."
      }
    ],
    stages: [
      {
        id: "align",
        title: { zh: "协同", en: "Align" },
        goal: {
          zh: "先让关键人理解背景，再提出方案",
          en: "Help key people understand context before proposing"
        },
        abilities: ["communication"]
      },
      {
        id: "place",
        title: { zh: "用人", en: "Place" },
        goal: {
          zh: "借力他人资源，把责任分给协作方",
          en: "Leverage others' resources and share ownership"
        },
        abilities: ["deploy"]
      },
      {
        id: "see",
        title: { zh: "洞察", en: "See" },
        goal: {
          zh: "用证据看穿表面诉求下的真实动机",
          en: "Use evidence to see the real motive under surface demands"
        },
        abilities: ["insight"]
      },
      {
        id: "frame",
        title: { zh: "结构", en: "Frame" },
        goal: {
          zh: "把跨部门问题变成可管理的共同机制",
          en: "Turn cross-department problems into manageable joint mechanisms"
        },
        abilities: ["structure"]
      },
      {
        id: "certify",
        title: { zh: "认证", en: "Certify" },
        goal: {
          zh: "四项焦点能力达到认证线",
          en: "Reach certification on all four focus abilities"
        },
        abilities: ["communication", "deploy", "insight", "structure"]
      }
    ]
  }
};
