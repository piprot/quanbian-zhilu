import type { AbilityId } from "./types.ts";

export interface HistoryMirror {
  id: string;
  title: string;
  source: string;
  abilityId: AbilityId;
  quote: string;
  lessonZh: string;
  lessonEn: string;
  tags: string[];
}

/** 轻量史鉴库：每一条只讲清“事件 + 一句镜鉴”，映射到现有十项能力。 */
export const HISTORY_MIRRORS: HistoryMirror[] = [
  {
    id: "shangyang-limu",
    title: "徙木立信",
    source: "资治通鉴 · 秦",
    abilityId: "stability",
    quote: "商鞅立三丈木于南门，募民搬迁，由十金至五十金，徙木后颁新法。",
    lessonZh: "立信从不被人注意的小承诺开始，制度才立得住。",
    lessonEn: "Credibility starts with a small, visible promise kept exactly as stated.",
    tags: ["立信", "制度"]
  },
  {
    id: "caocao-fenxin",
    title: "焚信安军",
    source: "资治通鉴 · 汉",
    abilityId: "mobilize",
    quote: "官渡之战后缴获部下通敌信件，曹操当众焚之。",
    lessonZh: "把人心稳住，常常比把账算清更重要。",
    lessonEn: "Stabilizing hearts often matters more than settling every account.",
    tags: ["驭人", "收心"]
  },
  {
    id: "xiaohe-zhui-hanxin",
    title: "月下追韩信",
    source: "史记 · 淮阴侯列传",
    abilityId: "insight",
    quote: "韩信逃亡，萧何连夜追回，力荐刘邦拜将。",
    lessonZh: "识人之后要敢用人，把真人才放在与能力匹配的位置。",
    lessonEn: "Knowing talent is only the start; place it where it can act.",
    tags: ["识人", "用人"]
  },
  {
    id: "xiangyu-hongmen",
    title: "鸿门之失",
    source: "史记 · 项羽本纪",
    abilityId: "execution",
    quote: "鸿门宴范增示意杀刘邦，项羽犹豫不决，刘邦遁走。",
    lessonZh: "关键时刻的犹豫，会亲手放走最好的窗口。",
    lessonEn: "Hesitation at the decisive moment can hand away the best opening.",
    tags: ["决断", "执行"]
  },
  {
    id: "zhugeliang-zhan-masu",
    title: "挥泪斩马谡",
    source: "三国志 · 诸葛亮传",
    abilityId: "authority",
    quote: "马谡失街亭，诸葛亮挥泪斩之，自贬三等。",
    lessonZh: "赏罚一致才有人服；主帅也要为自己的用人之失担责。",
    lessonEn: "Consistent consequences build authority; leaders own their misplacements too.",
    tags: ["赏罚", "掌权"]
  },
  {
    id: "simayi-zhuangbing",
    title: "装病夺权",
    source: "资治通鉴 · 三国",
    abilityId: "strategy",
    quote: "司马懿称病十年，高平陵之变一击夺权。",
    lessonZh: "势未成时不亮底牌，势成之后一击定局。",
    lessonEn: "Hide your hand until the balance of power is ready, then move once.",
    tags: ["谋权", "等待时机"]
  },
  {
    id: "guoziyi-danji",
    title: "单骑退敌",
    source: "资治通鉴 · 唐",
    abilityId: "communication",
    quote: "郭子仪六十九岁单骑入回纥营，以信义退敌。",
    lessonZh: "最高级的沟通，是让对方愿意相信你这个人。",
    lessonEn: "The strongest communication makes the other side trust the person, not just the words.",
    tags: ["心力", "沟通"]
  },
  {
    id: "liubang-feng-yongchi",
    title: "封雍齿",
    source: "史记 · 留侯世家",
    abilityId: "mobilize",
    quote: "刘邦初定，张良劝先封最恨之雍齿，群臣遂安。",
    lessonZh: "先安抚最不安的人，比先奖励最忠诚的人更能稳定大局。",
    lessonEn: "Settling the most anxious person first can steady the whole room.",
    tags: ["驭人", "安抚"]
  },
  {
    id: "zhugeliang-qiqin",
    title: "七擒孟获",
    source: "三国志 · 诸葛亮传",
    abilityId: "mobilize",
    quote: "诸葛亮南征，七擒七纵孟获，攻心为上，南人不复反。",
    lessonZh: "赢一次容易，让对方心服才不需要反复镇压。",
    lessonEn: "Winning once is easy; winning the heart ends the need for repeated force.",
    tags: ["驭人", "攻心"]
  },
  {
    id: "fanli-wuhu",
    title: "泛舟五湖",
    source: "史记 · 越王勾践世家",
    abilityId: "strategy",
    quote: "范蠡佐勾践灭吴，知其不可共乐，泛舟五湖而去。",
    lessonZh: "知道什么时候让权，也是一种深谋远虑。",
    lessonEn: "Knowing when to let go of power is itself a strategic move.",
    tags: ["让权", "谋权"]
  },
  {
    id: "taizong-rong-zheng",
    title: "太宗容征",
    source: "资治通鉴 · 唐纪",
    abilityId: "communication",
    quote: "魏征廷争面折，太宗怒欲杀「田舍翁」，后拜诤臣。",
    lessonZh: "把最难听的话留下来，往往是组织最值钱的资产。",
    lessonEn: "The hardest words to hear are often the organization's most valuable asset.",
    tags: ["纳谏", "沟通"]
  },
  {
    id: "suwu-muyang",
    title: "苏武牧羊",
    source: "汉书 · 苏武传",
    abilityId: "recovery",
    quote: "苏武使匈奴被扣十九年，北海牧羊，杖节不降。",
    lessonZh: "长期压力下，真正撑住你的不是蛮力，而是信念和节律。",
    lessonEn: "Under long pressure, rhythm and conviction outlast raw willpower.",
    tags: ["心力", "坚持"]
  },
  {
    id: "zengguofan-lvbai",
    title: "屡败屡战",
    source: "清史稿 · 曾国藩传",
    abilityId: "recovery",
    quote: "曾国藩四战四败，投水自尽未遂，再练湘军，终克天京。",
    lessonZh: "允许自己失败一次，但绝不允许自己退出战场。",
    lessonEn: "Permit a failure, but never permit leaving the battlefield.",
    tags: ["心力", "韧性"]
  },
  {
    id: "caocao-guandu",
    title: "官渡决断",
    source: "三国志 · 武帝纪",
    abilityId: "execution",
    quote: "官渡相持，曹操欲退，荀彧劝坚持，许攸来降，决断烧乌巢。",
    lessonZh: "难局里最重要的，是把有限资源压到决定胜负的那一个点。",
    lessonEn: "In a stalemate, the decisive move is concentrating limited resources on one point.",
    tags: ["决断", "执行"]
  },
  {
    id: "zhugeliang-kongcheng",
    title: "空城退敌",
    source: "三国演义 · 第九十五回",
    abilityId: "strategy",
    quote: "街亭败后，西城空虚，诸葛亮焚香抚琴，空城退司马。",
    lessonZh: "越是资源见底，越要用确定性制造对方的犹豫。",
    lessonEn: "When resources are thin, visible composure can make the other side hesitate.",
    tags: ["谋权", "虚实"]
  },
  {
    id: "zouji-fengwang",
    title: "邹忌讽王",
    source: "战国策 · 齐策",
    abilityId: "communication",
    quote: "邹忌以妻私臣妾畏臣之喻，讽齐王纳谏，门庭若市。",
    lessonZh: "把道理放进对方熟悉的处境里，改变才会发生。",
    lessonEn: "Put the truth inside the listener's own situation and change becomes possible.",
    tags: ["沟通", "劝谏"]
  }
];

export function mirrorForAbility(abilityId: AbilityId): HistoryMirror {
  return (
    HISTORY_MIRRORS.find((mirror) => mirror.abilityId === abilityId) ??
    HISTORY_MIRRORS[0]
  );
}

export function dominantMirror(
  effects: Partial<Record<AbilityId, number>>
): HistoryMirror {
  let best: AbilityId | undefined;
  let bestMagnitude = -1;
  for (const [abilityId, delta] of Object.entries(effects) as Array<
    [AbilityId, number]
  >) {
    const magnitude = Math.abs(delta);
    if (magnitude > bestMagnitude) {
      best = abilityId;
      bestMagnitude = magnitude;
    }
  }
  return mirrorForAbility(best ?? "strategy");
}
