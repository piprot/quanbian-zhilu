export interface NpcStory {
  zh: string[];
  en: string[];
  dialogue: Array<{
    questionZh: string;
    questionEn: string;
    answerZh: string;
    answerEn: string;
  }>;
  relicNoteZh: string;
  relicNoteEn: string;
}

export const NPC_STORIES: Record<string, NpcStory> = {
  "npc-assistant": {
    zh: [
      "行政主管是最早注意到前任异常的人。她发现外包费的签名栏多了一个人的笔迹，却没有声张，因为她知道在组织里“先说出来”的人往往要承担代价。",
      "她有一套自己的观察方法：看谁在订会议室时被反复调走，看谁的名字总出现在最后一分钟的审批里。这些细节拼起来，就是一张没有画在纸上的权力地图。",
      "她说：“权力不在头衔里，在日程表里。谁总能占用别人的时间，谁就是真正有权力的人。”"
    ],
    en: [
      "The administrative lead was the first to notice something unusual under your predecessor. She saw an extra signature on the outsourcing invoice but stayed quiet, knowing the first person to speak often pays the price.",
      "She reads the organization through details: whose meetings keep getting moved, whose name appears in last-minute approvals. Together those details form a power map no one ever draws.",
      "Her rule: “Power lives not in titles but in calendars. Whoever can command other people's time holds the real power.”"
    ],
    dialogue: [
      {
        questionZh: "你为什么不早点把外包费的事告诉我？",
        questionEn: "Why didn't you tell me about the outsourcing invoice earlier?",
        answerZh: "因为我还不确定你是来调查的，还是来背锅的。先确认你扛得住，再给信息，对双方都安全。",
        answerEn: "Because I was not sure whether you came to investigate or to take the blame. Once I knew you could carry it, sharing was safer for both of us."
      },
      {
        questionZh: "你希望我怎么做，才算尊重你的信息？",
        questionEn: "What would it take for you to trust me with information?",
        answerZh: "别在周会上提起我。给我一个安静的渠道，让我看到信息确实被用来解决问题，而不是用来站队。",
        answerEn: "Do not mention me in the weekly meeting. Give me a quiet channel and let me see the information used to solve problems, not to pick sides."
      }
    ],
    relicNoteZh: "她把行政档案看作组织里最古老的“遗迹”：每一份日程和审批记录，都写着谁真正掌握组织的时间。",
    relicNoteEn: "She treats the admin archive as the oldest relic in the organization: every calendar and approval records who truly owns the organization's time."
  },
  "npc-finance": {
    zh: [
      "财务经理的账本里存着前任遗留的每一笔痕迹。她不急着揭发，因为她见过太多“抓出问题的人”最后被问题反噬。",
      "她最在意的是授权链是否完整：一笔钱从哪里来、谁批准、谁验收。只要这条链断掉，数字就会说谎。",
      "她说：“钱不会说谎，但账本会。要让账本诚实，先让流程诚实。”"
    ],
    en: [
      "The finance manager's ledger keeps every trace your predecessor left behind. She does not rush to expose them because she has seen too many truth-tellers consumed by the problem they surfaced.",
      "What she cares about is the completeness of the authorization chain: where money comes from, who approves it, and who verifies it. When that chain breaks, numbers begin to lie.",
      "Her words: “Money does not lie, but ledgers can. To make ledgers honest, first make the process honest.”"
    ],
    dialogue: [
      {
        questionZh: "这笔外包费到底有没有问题？",
        questionEn: "Is there really a problem with the outsourcing fee?",
        answerZh: "数字本身没问题，问题在签名后面没有人负责验收。你想查的是钱，还是谁绕过了规则？",
        answerEn: "The number itself is fine. The problem is that no one verifies behind the signature. Are you investigating the money, or who bypassed the rules?"
      },
      {
        questionZh: "你要什么条件才愿意配合？",
        questionEn: "What would make you willing to cooperate?",
        answerZh: "我要一条公开的核查标准。我不想因为配合你，明天变成全公司的敌人。",
        answerEn: "I want a public review standard. I do not want to become the company's enemy tomorrow for cooperating with you."
      }
    ],
    relicNoteZh: "她像整理组织法典的审计者：规则一旦写进流程，就不该被任何人的记忆改写。",
    relicNoteEn: "She is like the auditor of the organization's code: once a rule enters the process, no one's memory should rewrite it."
  },
  "npc-ops": {
    zh: [
      "运营负责人反对新流程，不是因为他守旧，而是因为他看过太多“看起来很美的方案”在第一天就把交付线撞碎。",
      "他记得每一次变革的真实成本：谁加班、哪个环节出错、哪家客户因此抱怨。这些记忆让他对新方案天然不信任。",
      "他说：“你可以说服我，但别让我背着你试错。让我参与，我才会为结果负责。”"
    ],
    en: [
      "The operations lead resists new processes not because he is conservative, but because he has seen too many beautiful plans shatter the delivery line on day one.",
      "He remembers the real cost of every change: who worked overtime, which step failed, which client complained. Those memories make him instinctively distrust new proposals.",
      "He says: “You can persuade me, but do not make me test your mistakes in secret. Let me participate, and I will own the outcome.”"
    ],
    dialogue: [
      {
        questionZh: "你为什么总说新方案不行？",
        questionEn: "Why do you always say the new plan will not work?",
        answerZh: "因为每次改流程，加班的是我的团队，挨骂的也是我的团队。你要我愿意试，就先让我改它。",
        answerEn: "Because every process change means my team works overtime and takes the blame. If you want me to try, let me shape it."
      },
      {
        questionZh: "怎样才算你认可的新方案？",
        questionEn: "What would a plan need to earn your approval?",
        answerZh: "先给我一个最小试点，把失败成本控制在三天以内，并且允许我随时叫停。",
        answerEn: "Start with a small pilot, cap the failure cost at three days, and let me call a stop whenever I want."
      }
    ],
    relicNoteZh: "他反对华美蓝图，只相信经过真实交付检验的流程，像工程团队验证一条新管线。",
    relicNoteEn: "He distrusts pretty blueprints and trusts only processes proven by real delivery, like an engineering team validating a new pipeline."
  },
  "npc-young": {
    zh: [
      "年轻骨干等待的从来不是一次批准，而是一个清晰的授权边界。他曾经在边界模糊的项目里耗掉半年，最后功劳被拿走，责任被留下。",
      "他不怕辛苦，只怕“做到一半发现方向又变了”。他需要的是目标、资源、检查节点，三者缺一不可。",
      "他说：“给我一个可以验收的结果，我就能证明自己。给我一个模糊的期待，我只能证明你不想负责。”"
    ],
    en: [
      "The young core member never waited for approval; he waited for a clear boundary of delegation. He once spent half a year in a project with fuzzy boundaries, only to see credit taken and blame left behind.",
      "He is not afraid of hard work; he fears discovering halfway that the direction changed again. He needs a goal, resources, and checkpoints together.",
      "He says: “Give me a verifiable outcome and I will prove myself. Give me vague expectations and you only prove you do not want responsibility.”"
    ],
    dialogue: [
      {
        questionZh: "你希望我如何授权给你？",
        questionEn: "How do you want me to delegate to you?",
        answerZh: "把结果写清楚，把资源给足，然后每周只检查一次。其余时间别让我猜你会不会改主意。",
        answerEn: "Write the outcome clearly, give me enough resources, then check in once a week. The rest of the time, do not make me guess whether you will change your mind."
      },
      {
        questionZh: "如果任务失败了，你希望我怎么处理？",
        questionEn: "If the task fails, how should I handle it?",
        answerZh: "先看决策过程，再谈结果。只要过程有记录、判断有依据，失败也应该算一次能力积累。",
        answerEn: "Look at the decision process before the result. If the process was recorded and the judgment had evidence, failure should still count as capability."
      }
    ],
    relicNoteZh: "他不需要上司站在身后，只需要任务说明里写清楚他要交付什么。",
    relicNoteEn: "He does not need a leader standing behind him, only a task brief that states exactly what to deliver."
  },
  "npc-veteran": {
    zh: [
      "老将掌握着核心客户，也害怕被组织边缘化。他不是不配合，而是需要在新的秩序里看到自己的位置。",
      "他见过太多新人把客户关系当成“旧资产”清理，最后丢掉的不是名单，而是多年积累的信任。",
      "他说：“客户不是资料库里的名字，是这么多年一起扛过事的人。你要改革，先让我带着客户进改革。”"
    ],
    en: [
      "The veteran holds the core clients and fears being pushed to the edge of the organization. He is not unwilling; he needs to see his place in the new order.",
      "He has watched newcomers treat client relationships as legacy assets to clean out, losing not just a contact list but years of accumulated trust.",
      "He says: “Clients are not names in a database; they are people I carried through hard years with. If you want reform, let me bring the clients into it.”"
    ],
    dialogue: [
      {
        questionZh: "你担心改革会让你失去什么？",
        questionEn: "What do you fear reform will take from you?",
        answerZh: "我担心自己在新的评分体系里变成“旧人”。我的客户关系应该被算作资产，而不是被当作阻力。",
        answerEn: "I fear becoming the “old person” in the new scoring system. My client relationships should count as assets, not resistance."
      },
      {
        questionZh: "你愿意为改革做什么？",
        questionEn: "What are you willing to do for the reform?",
        answerZh: "我愿意带三个最难的客户做新流程的验证，但你要保证：客户的事，我有最终否决权。",
        answerEn: "I will take the three hardest clients through the new process, but only if I keep final veto power over client matters."
      }
    ],
    relicNoteZh: "他不拒绝新流程，但要确保多年积累的客户信任不被一次翻新烧掉。",
    relicNoteEn: "He welcomes new processes but insists that years of client trust are not burned in a renovation."
  },
  "npc-chen": {
    zh: [
      "陈屿能力很强，但那次公开羞辱几乎夺走了他表达的勇气。从那以后，他只在私聊里提想法，会上永远点头。",
      "他不是不想承担责任，而是学会了把责任让给那些“说话安全”的人。你需要先重建他开口的安全感。",
      "他说：“我不会再在会议上第一个发言。除非你让我看到，说真话不会变成下一次公开处刑。”"
    ],
    en: [
      "Chen Yu is highly capable, but a public humiliation nearly took away his courage to speak. Since then he only shares ideas in private chat and always nods in meetings.",
      "He has not stopped wanting responsibility; he learned to hand it to people who can speak safely. You must first rebuild the safety of his voice.",
      "He says: “I will not speak first in a meeting again, unless you show me that telling the truth will not become the next public execution.”"
    ],
    dialogue: [
      {
        questionZh: "你为什么不把想法在会上说出来？",
        questionEn: "Why do you not share your ideas in meetings?",
        answerZh: "因为上次我提完建议，被当场批到连坐的位置都不稳。我需要知道，你会在别人反驳我时站出来。",
        answerEn: "Because the last time I raised a suggestion, I was picked apart until my seat felt unsafe. I need to know you will stand up when others push back."
      },
      {
        questionZh: "我要怎么证明这次不一样？",
        questionEn: "How can I prove this time is different?",
        answerZh: "先在小范围里让我讲一次，并且由你亲口引用我的方案。等大家习惯了，我再回到大场。",
        answerEn: "Let me speak once in a small circle, and quote my idea yourself. Once people get used to it, I will return to the big room."
      }
    ],
    relicNoteZh: "他像一份被批注得面目全非的方案：观点还在，只是需要有人先承认那次批注错了。",
    relicNoteEn: "He is like a proposal buried under harsh comments: the ideas remain, but someone must first admit the critique was wrong."
  },
  "npc-shen": {
    zh: [
      "沈捷擅长进攻客户，却不擅长在谈判中保护团队的一致性。他常常在现场临时承诺，回来后再让团队补救。",
      "他不是不守信，而是把“拿下客户”当成了唯一目标，忘记团队也是谈判桌上的一方。",
      "他说：“我知道自己容易一个人冲太快。我需要有人在我冲出去之前，先把底线焊在我的背上。”"
    ],
    en: [
      "Shen Jie excels at attacking client deals but struggles to protect team consistency during negotiations. He often makes promises on the spot and leaves the team to repair them afterward.",
      "He is not dishonest; he treats winning the client as the only goal and forgets the team is also at the table.",
      "He says: “I know I tend to charge ahead alone. I need someone to weld the bottom line onto my back before I run.”"
    ],
    dialogue: [
      {
        questionZh: "你知道团队怎么看你临时承诺吗？",
        questionEn: "Do you know how the team sees your on-the-spot promises?",
        answerZh: "我知道。我觉得客户在等答案，等不起回去开会的流程。但你说得对，我该给客户一个“今天确认、明天签字”的机制。",
        answerEn: "I know. I feel the client is waiting and cannot wait for our internal process. But you are right: I should offer a “confirm today, sign tomorrow” mechanism."
      },
      {
        questionZh: "下次谈判前，你需要什么支持？",
        questionEn: "What support do you need before the next negotiation?",
        answerZh: "一份只有三条的底线清单，加上一个可以随时叫停我的手势。",
        answerEn: "A bottom-line list with only three items, plus a signal you can use to call a timeout."
      }
    ],
    relicNoteZh: "他像谈判桌上的主攻手：局面一变就加速，但需要后方把底线同步给他。",
    relicNoteEn: "He is the lead negotiator at the front: quick to accelerate, but needing the back office to sync the bottom line."
  },
  "npc-xu": {
    zh: [
      "小许的方案里有未经打磨的洞察。她总能看见数据背后的异常，却不敢确认自己的想法值得被听见。",
      "她需要有人先保护她说话，也需要有人帮她把“直觉”翻译成“证据”。",
      "她说：“我不是没有想法，我是害怕说完之后被问三个我还没准备好答案的问题。”"
    ],
    en: [
      "Xu's proposals contain unpolished insight. She can always spot anomalies behind the data, but she is not sure her ideas deserve to be heard.",
      "She needs someone to protect her voice and help translate “intuition” into “evidence.”",
      "She says: “I do have ideas. I am afraid of speaking and then being hit with three questions I have not prepared for.”"
    ],
    dialogue: [
      {
        questionZh: "你的发现为什么不写进正式报告？",
        questionEn: "Why did you not put your finding in the formal report?",
        answerZh: "因为我的依据还不完整。我怕别人只看到异常，看不到我还没有验证的那一半。",
        answerEn: "Because my evidence is incomplete. I am afraid people will see the anomaly without seeing the half I have not verified yet."
      },
      {
        questionZh: "你需要什么才能把想法讲出来？",
        questionEn: "What do you need to share your idea?",
        answerZh: "一个不会被打断的十分钟，以及一个答应帮我把问题补完的人。",
        answerEn: "Ten uninterrupted minutes, and someone who promises to help me complete the answer instead of only interrogating me."
      }
    ],
    relicNoteZh: "她像反复出现在草稿里的新线索：还没被正式解读，却已经三次证明自己值得追查。",
    relicNoteEn: "She is like a clue that keeps appearing in drafts: not yet formally decoded, yet already proving three times that it deserves a follow-up."
  },
  "npc-he": {
    zh: [
      "何川能最快定位错误范围，但总在关键时被加班拖垮。他解决问题的速度很快，恢复的速度却跟不上。",
      "他习惯把“我再顶一晚”当作专业精神，直到某次凌晨把生产环境改错，他才开始怀疑自己的判断力已经透支。",
      "他说：“我能把火扑灭，但我需要有人在我眼皮开始打架时，把我的键盘拿走。”"
    ],
    en: [
      "He Chuan can locate the scope of an error faster than anyone, but he is always worn down by overtime at the critical moment. He solves problems quickly, yet his recovery cannot keep pace.",
      "He treats “one more night” as professionalism until a 3 a.m. change to production goes wrong and he begins to doubt his own exhausted judgment.",
      "He says: “I can put out the fire, but I need someone to take my keyboard away when my eyes start to fail.”"
    ],
    dialogue: [
      {
        questionZh: "上次凌晨改错，问题出在哪里？",
        questionEn: "Where did last week's 3 a.m. mistake come from?",
        answerZh: "不是我不会改，是我当时已经连续工作了十六个小时。判断力不是技能，是资源，我不该把资源用光。",
        answerEn: "It was not that I did not know the change. I had been working sixteen hours straight. Judgment is not a skill; it is a resource, and I spent it all."
      },
      {
        questionZh: "你希望我如何防止下次发生？",
        questionEn: "How do you want me to prevent the next one?",
        answerZh: "给我一个强制恢复时段，并且规定：连续两次失败后必须有人陪我一起看问题。",
        answerEn: "Give me a mandatory recovery window, and make a rule: after two consecutive failures, someone has to review with me."
      }
    ],
    relicNoteZh: "他像系统值班室的守门人：处理故障最快，但连续值守后必须有人替他按下暂停。",
    relicNoteEn: "He is the on-call guard of the system: fastest at resolving incidents, but after long shifts someone must press pause for him."
  },
  "npc-tang": {
    zh: [
      "唐岚负责客户提案，也需要一个不被打断的恢复时段。她的提案质量明显和上一晚的睡眠质量成正比。",
      "她从不拒绝额外任务，于是所有人都把“紧急”丢给她，直到她的日程变成一串永远做不完的补救。",
      "她说：“我不是不愿意多干，我是希望你们尊重我同意的顺序，而不是默认我永远有空。”"
    ],
    en: [
      "Tang Lan owns client proposals and needs an uninterrupted recovery window. The quality of her deck is visibly proportional to the quality of her previous night's sleep.",
      "She never refuses extra work, so everyone routes “urgent” tasks to her until her calendar becomes an endless chain of rescues.",
      "She says: “I am willing to do more, but respect the order I agreed to instead of assuming I am always available.”"
    ],
    dialogue: [
      {
        questionZh: "你为什么不拒绝临时加进来的任务？",
        questionEn: "Why do you not refuse the tasks added at the last minute?",
        answerZh: "因为我怕拒绝一次，就会被认为“不够拼”。我需要你帮我把拒绝变成可接受的工作语言。",
        answerEn: "Because I fear one refusal will label me as “not committed enough.” I need you to make refusal a normal part of work language."
      },
      {
        questionZh: "你的恢复时段应该怎么设计？",
        questionEn: "How should your recovery window be designed?",
        answerZh: "每天下午四点到五点半，不排任何会议。紧急情况需要你本人打电话，而不是群里@我。",
        answerEn: "From 4:00 to 5:30 every afternoon, no meetings. Emergencies require a direct call from you, not an @mention in the group."
      }
    ],
    relicNoteZh: "她像负责最终审校的负责人：方案必须安静完成，嘈杂的临时插入只会让每一页多出错误。",
    relicNoteEn: "She is the final reviewer of the deck: it needs quiet focus, and last-minute interruptions add errors to every page."
  },
  "npc-fang": {
    zh: [
      "连续失败后，方然既想离开，也不愿意看到团队解散。他是团队的情绪中心，也是最先替所有人感到累的人。",
      "他把失败都当成自己的责任，因此每一次复盘都会让他更沉默。他需要有人告诉他：失败是系统的信号，不是一个人的罪名。",
      "他说：“我不是怕重来，我是怕重来以后，还是我一个人背着全队的失望。”"
    ],
    en: [
      "After consecutive failures, Fang Ran wants to leave yet cannot bear watching the team disband. He is the emotional center of the team and the first person to feel everyone's exhaustion.",
      "He takes every failure as his own fault, so each review makes him quieter. He needs someone to say that failure is a signal from the system, not a charge against one person.",
      "He says: “I am not afraid of starting over. I am afraid that when we do, I will still be carrying the whole team's disappointment alone.”"
    ],
    dialogue: [
      {
        questionZh: "失败复盘时，你为什么越来越安静？",
        questionEn: "Why do you grow quieter during failure reviews?",
        answerZh: "因为每次复盘最后都会变成“我哪里做得不够”。我希望有人先把问题拆到系统层面，再谈个人。",
        answerEn: "Because every review ends up becoming “what I did not do enough.” I want someone to decompose the problem at the system level before talking about individuals."
      },
      {
        questionZh: "如果继续干，你想要什么改变？",
        questionEn: "If you stay, what change do you want?",
        answerZh: "我要一个失败后先复盘机制、再复盘人的固定流程，并且这次不能只停留在口头。",
        answerEn: "I want a fixed process that reviews the mechanism before reviewing the person, and this time it cannot stay on paper."
      }
    ],
    relicNoteZh: "他像连续扛了三轮项目的负责人：愿意重新开始，但需要先看到问题记录、负荷与真正的恢复计划。",
    relicNoteEn: "He is the lead who carried three rounds of the same project: willing to start over, but only with issue logs, workload data, and a real recovery plan."
  }
};

export function npcStoryFor(id: string): NpcStory | undefined {
  return NPC_STORIES[id];
}
