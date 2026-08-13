export interface NpcArc {
  zh: string[];
  en: string[];
  dialogue: {
    questionZh: string;
    questionEn: string;
    answerZh: string;
    answerEn: string;
  };
  questZh: string;
  questEn: string;
}

export const NPC_ARCS: Record<string, NpcArc> = {
  "npc-assistant": {
    zh: [
      "建立信任后，行政主管开始把日程表里被反复改动的会议标注出来，并主动提出每周三下午开一场「信息走廊」短会，让跨部门信息不再经过私人转述。",
      "她说，真正危险的从来不是坏消息迟到，而是好消息被包装得太多。她要的，是你愿意在走廊会上先听坏消息。"
    ],
    en: [
      "Once trust is built, the administrative lead starts flagging meetings that keep getting moved and proposes a weekly Wednesday 'information corridor' where cross-team updates stop travelling through private channels.",
      "She says the danger is never late bad news, but good news wrapped too nicely. What she wants is for you to hear bad news first in that corridor."
    ],
    dialogue: {
      questionZh: "信息走廊会上，你希望我第一个公开什么？",
      questionEn: "What do you want me to share first in the information corridor?",
      answerZh: "先公开你判断错了什么，再公开你要改什么。大家不是怕错误，是怕错误被藏着。",
      answerEn: "Share first what you judged wrong, then what you will change. People are not afraid of mistakes; they fear mistakes being hidden."
    },
    questZh: "把一次跨部门会议改成 15 分钟信息走廊，并邀请行政主管记录跟进项。",
    questEn: "Turn one cross-team meeting into a 15-minute information corridor and ask the administrative lead to track follow-ups."
  },
  "npc-finance": {
    zh: [
      "财务经理开始每月做一次「资金链公开会」，把授权链上的每一笔签字都摊开。她说，透明不是为了追责，而是为了让下一次没人敢绕过流程。",
      "她愿意第一个被检查，但要求你也成为流程的第一位遵守者：你批过的每一笔钱，都要有同样的验收记录。"
    ],
    en: [
      "The finance manager starts a monthly 'cash chain open session' where every signature on the authorization chain is laid open. Transparency, she says, is not for blame but so nobody dares bypass the process again.",
      "She volunteers to be checked first, but asks that you be the first follower too: every approval you sign must carry the same verification record."
    ],
    dialogue: {
      questionZh: "资金链公开会最应该先公开哪类数据？",
      questionEn: "Which data should the cash chain session open first?",
      answerZh: "先公开被跳过验收的三笔付款，再公开新的验收标准。让问题先出现，标准才有意义。",
      answerEn: "Open the three payments that skipped verification first, then the new standard. Let the problem appear before the standard matters."
    },
    questZh: "发起一次资金链公开会，公开 1 笔未验收付款并补齐验收记录。",
    questEn: "Host one cash chain session, expose one unverified payment, and complete its verification record."
  },
  "npc-ops": {
    zh: [
      "运营负责人答应试点新的交付流程，但条件是设置「三天叫停」按钮：试点成本超过三天，或者关键交付线出现断裂，他可以立即停止。",
      "他会亲手写一份「试点失败手册」，记录哪些环节最容易被理想化方案忽略，让下一次试点不再重犯。"
    ],
    en: [
      "The operations lead agrees to pilot the new delivery process on one condition: a 'three-day stop' button. If pilot cost exceeds three days or a key delivery line breaks, he can stop immediately.",
      "He will write a 'pilot failure handbook' recording which steps ideal plans usually ignore, so the next pilot starts wiser."
    ],
    dialogue: {
      questionZh: "试点失败手册里，你最想先写哪一条？",
      questionEn: "Which entry do you want to write first in the pilot failure handbook?",
      answerZh: "写「新流程第一天总有人找不到负责人」。这句话听着简单，却能拦下一半变更事故。",
      answerEn: "Write: 'On day one of a new process, someone always cannot find the owner.' Simple, but it stops half the change incidents."
    },
    questZh: "为一项变更设置三天叫停机制，并让运营负责人写下第一条失败教训。",
    questEn: "Give one change a three-day stop mechanism and ask the operations lead to write the first failure lesson."
  },
  "npc-young": {
    zh: [
      "年轻骨干接下一个 14 天项目，条件只有一个：每周只检查一次，其余时间他要自己决定执行顺序。",
      "他说，被信任不是一句口号，而是你愿意在他犯错时先问过程、再谈结果。他准备用这 14 天证明自己值得被这样对待。"
    ],
    en: [
      "The young core member takes on a 14-day project with one condition: a single weekly checkpoint, with full freedom over execution order the rest of the time.",
      "He says being trusted is not a slogan; it is whether you ask about the process before the result when he errs. He plans to prove he deserves that treatment in 14 days."
    ],
    dialogue: {
      questionZh: "14 天里，你最担心哪一天出错？",
      questionEn: "Which day are you most worried about failing?",
      answerZh: "第 9 天。前 8 天都能靠热情撑住，第 9 天开始才会暴露出真实依赖，我需要在那天得到一次复盘而不是责备。",
      answerEn: "Day nine. The first eight days run on enthusiasm; day nine exposes real dependencies. I need a review that day, not blame."
    },
    questZh: "给年轻骨干一个 14 天项目，并在第 9 天安排一次过程复盘。",
    questEn: "Give the young core member a 14-day project and schedule a process review on day nine."
  },
  "npc-veteran": {
    zh: [
      "老将愿意带三个最难缠的客户进入新流程，但他要求保留对客户事项的最终否决权。他说，改革可以改内部，不能拿客户信任试错。",
      "他会把每次客户沟通写成简短的「信任账本」：这次有没有让客户更愿意提前告诉我们坏消息。"
    ],
    en: [
      "The veteran agrees to bring the three toughest clients into the new process, but keeps final veto over client matters. Reform can change the inside, he says, not test client trust.",
      "He will keep a short 'trust ledger' for every client conversation: did this meeting make clients more willing to share bad news early?"
    ],
    dialogue: {
      questionZh: "信任账本里，什么才算一次成功的沟通？",
      questionEn: "What counts as a successful entry in the trust ledger?",
      answerZh: "客户主动提前告诉你一个坏消息。比拿到新订单更珍贵，因为那是他愿意和你站在同一边的信号。",
      answerEn: "The client tells you bad news early on their own. That beats a new order, because it signals they are on your side."
    },
    questZh: "和老将一起拜访一位最难客户，并在拜访后记录一条信任账本。",
    questEn: "Visit one hard client with the veteran and record one trust-ledger entry afterward."
  },
  "npc-chen": {
    zh: [
      "陈宇同意在小范围会上重新发言，条件是你会亲口引用他的方案。他说，他不需要掌声，需要看到自己的观点被认真使用。",
      "如果引用后方案被采纳，他会继续补充第二版；如果被否，他希望你知道否的是方案，不是他的人。"
    ],
    en: [
      "Chen Yu agrees to speak again in a small circle if you quote his proposal yourself. He does not need applause; he needs to see his idea genuinely used.",
      "If the idea survives, he will draft version two. If it is rejected, he wants to know the plan was rejected, not him."
    ],
    dialogue: {
      questionZh: "你希望我引用你方案时，重点引用哪部分？",
      questionEn: "Which part do you want me to quote when I cite your proposal?",
      answerZh: "引用那个「最可能被跳过」的建议，而不是最受欢迎的建议。那才是我真正想被听见的东西。",
      answerEn: "Quote the suggestion most likely to be skipped, not the most popular one. That is what I actually want heard."
    },
    questZh: "在小范围会议中亲口引用陈宇方案里最容易被跳过的建议。",
    questEn: "Quote the most easily skipped suggestion from Chen Yu's proposal in a small meeting."
  },
  "npc-shen": {
    zh: [
      "沈捷开始使用「今天确认、明天签字」的机制，并邀请你在谈判前陪他过一遍底线清单。他说，他不是不需要帮助，是需要帮助出现在冲出去之前。",
      "他还会在每次谈判后写一行「团队成本」，提醒自己：赢下客户的价格里，有没有让团队多付的部分。"
    ],
    en: [
      "Shen Jie adopts a 'confirm today, sign tomorrow' mechanism and invites you to review the bottom-line checklist before negotiations. He is not refusing help; he needs it before he charges out.",
      "He also writes one line of 'team cost' after each negotiation, asking whether winning the client made the team pay extra."
    ],
    dialogue: {
      questionZh: "谈判前过底线清单时，你希望我拦你几次？",
      questionEn: "During the pre-negotiation checklist, how many times should I stop you?",
      answerZh: "至少一次。你拦我的时候，我会不舒服；但正是那次不舒服，提醒我这一单还有别的成本。",
      answerEn: "At least once. It will feel uncomfortable, but that discomfort reminds me this deal carries other costs."
    },
    questZh: "陪沈捷做一次谈判前底线清单，并在谈判后记录一行团队成本。",
    questEn: "Review a bottom-line checklist with Shen Jie and record one line of team cost after the negotiation."
  },
  "npc-xu": {
    zh: [
      "小许的方案得到保护后，她开始每周向一位资深同事请教一次「方案会被哪里拒绝」。她说，提前听反对意见，比事后解释容易得多。",
      "她希望有一天她的方案不再需要你保护，而是自己能撑过第一次公开质疑。"
    ],
    en: [
      "Once her proposal is protected, Xiao Xu starts a weekly review with a senior colleague asking 'where will this plan be rejected?' Hearing objections early, she says, is easier than explaining later.",
      "She wants her proposals to survive public challenge without your protection one day."
    ],
    dialogue: {
      questionZh: "你希望资深同事先看方案的哪一部分？",
      questionEn: "Which part should the senior colleague review first?",
      answerZh: "先看数据之外的那部分假设。方案被否时，多数是因为我们默认了别人不认可的前提。",
      answerEn: "Review the assumptions beyond the data. Plans are usually rejected because we assumed premises others do not accept."
    },
    questZh: "为小许安排一次资深同事的「方案会被哪里拒绝」评审。",
    questEn: "Arrange one 'where will this plan be rejected' review for Xiao Xu with a senior colleague."
  },
  "npc-he": {
    zh: [
      "何川开始用数据追踪加班时间，目标是在 30 天内把深夜加班减少 30%。他说，他不是想偷懒，是想让问题在白天出现。",
      "他会每周给你一份「加班雷达」，标出哪类任务总在夜里爆雷，让你看到系统问题而不是个人态度。"
    ],
    en: [
      "He Chuan starts tracking overtime with data, aiming to cut late-night work by 30% in 30 days. He is not avoiding work; he wants problems to surface during the day.",
      "Every week he shares an 'overtime radar' showing which task types always explode at night, so you see a system issue, not a personal attitude."
    ],
    dialogue: {
      questionZh: "加班雷达里，你最想先解决哪一类？",
      questionEn: "Which category do you want to fix first in the overtime radar?",
      answerZh: "先解决「等确认」类任务。它们不是难，而是卡在别人手上，逼得团队半夜还在等。",
      answerEn: "Fix the 'waiting for approval' category. It is not hard work; it is blocked work that forces the team to wait at midnight."
    },
    questZh: "用数据追踪一周加班，识别出「等确认」类任务并设定 30% 削减目标。",
    questEn: "Track one week of overtime, identify approval-waiting tasks, and set a 30% reduction target."
  },
  "npc-tang": {
    zh: [
      "唐瑶获得不被打断的恢复时段后，开始主动设计自己的「不可占用时间」。她说，她以前把忙当成安全感，现在想证明休息不会让交付变差。",
      "她希望你能帮她守住边界：在她休息时段内，除非真正升级到失控，否则不打扰她。"
    ],
    en: [
      "With an unbroken recovery slot, Tang Yao starts designing her own 'non-interruptible time'. She used to treat busyness as safety and now wants to prove rest does not weaken delivery.",
      "She asks you to protect the boundary: no interruptions during her slot unless the issue truly escalates beyond control."
    ],
    dialogue: {
      questionZh: "什么时候可以打破你的休息边界？",
      questionEn: "When is it acceptable to break your rest boundary?",
      answerZh: "当客户已经公开升级、且只有我能救场时。其余时候，先发消息不打电话，让我决定要不要接。",
      answerEn: "Only when a client has publicly escalated and only I can save it. Otherwise, message first; let me decide whether to answer."
    },
    questZh: "为唐瑶设置每周不被打断的恢复时段，并一起定义唯一的破例标准。",
    questEn: "Set a weekly non-interruptible recovery slot for Tang Yao and define the single exception together."
  },
  "npc-fang": {
    zh: [
      "方然在连续失败后选择留下，并提出由他带队打下一个「小胜」：一个 7 天内可完成的客户回访，目标是让团队重新听到一次感谢。",
      "他说，士气不是开会喊出来的，而是从一次能赢的小事里长回来的。他要的就是那件小事。"
    ],
    en: [
      "After consecutive losses, Fang Ran chooses to stay and offers to lead one 'small win': a 7-day client follow-up designed to let the team hear one thank-you again.",
      "Morale, he says, is not created by rally speeches; it grows back from one winnable small thing. That small thing is what he wants."
    ],
    dialogue: {
      questionZh: "这次小胜你希望团队看到什么？",
      questionEn: "What do you want the team to see in this small win?",
      answerZh: "看到「我们还能影响结果」。不一定是大订单，只要客户说一句感谢，就足够重新开始。",
      answerEn: "See that we can still influence outcomes. It does not need to be a big order; one client thank-you is enough to restart."
    },
    questZh: "支持方然在 7 天内完成一次客户回访，并把感谢反馈公开给团队。",
    questEn: "Support Fang Ran's 7-day client follow-up and share the thank-you feedback with the team."
  }
};

export function npcArcFor(id: string): NpcArc | undefined {
  return NPC_ARCS[id];
}
