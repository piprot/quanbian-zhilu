import type {
  AbilityId,
  ChapterDef,
  OptionQuality,
  RoleId,
  StoryNode
} from "./types";
import {
  STORY_NODES,
  CHAPTER_REFLECTIONS,
  SIDE_QUEST_ARCS
} from "./story";

/* ============================================================
 *  SideQuestArc interface — matches the one defined in story.ts
 * ============================================================ */
export interface SideQuestArc {
  id: string;
  title: string;
  summary: string;
  intro: string;
  nodes: string[];
  conclusion: string;
}

/* ============================================================
 *  New transition story nodes (one per chapter, between n1 & n2)
 *  Each carries a unique leadership lesson with expert / partial / risk
 *  options, ability effects, resource effects, and theory references.
 * ============================================================ */
const TRANSITION_NODES: StoryNode[] = [
  /* ---------- Chapter 1 transition ---------- */
  {
    id: "c1n1b",
    chapterId: 1,
    title: "第一份周报",
    kind: "main",
    context:
      "你已经用一周时间建立了初步的权力地图，但 CEO 要求你周五前提交第一份书面诊断。你掌握的信息还不足以下结论，但 CEO 明确说「不需要完美，需要你的判断」。团队成员也在观望你会在报告中如何描述他们——你写的每一句话都可能成为未来信任的起点或裂痕。",
    stake: "你如何在信息不完整时给出有判断力的诊断，同时不提前暴露你的权力地图。",
    options: [
      {
        label: "给出三个可验证观察加下一步验证计划",
        summary: "每个观察都配证据和待验证假设，让报告成为诊断工具而非审判书。",
        quality: "expert",
        effects: { insight: 3, communication: 2, structure: 1 },
        resources: { energy: -7, trust: 6, influence: 5 },
        feedback:
          "你没有假装全知，而是让 CEO 看到你的判断框架。团队也感到被观察而非被审判，因为你的观察都指向机制而非个人。",
        theory: "《实践论》：从感性材料上升到理性认识，但不能跳过事实阶段。"
      },
      {
        label: "只汇报安全的事实，判断留到以后",
        summary: "把已知数据整理清楚，不下任何可能得罪人的结论。",
        quality: "partial",
        effects: { structure: 2, communication: 1 },
        resources: { energy: -5, trust: 3, influence: 1 },
        feedback:
          "报告很安全，但 CEO 觉得你没有给出判断。安全的信息汇总不等于诊断，他需要的不是数据搬运工。",
        theory: "《权经》：权乃人授，授为大焉——但授权的前提是你展示了判断力。"
      },
      {
        label: "在报告中点名关键人物的潜在问题",
        summary: "直接写出谁在隐瞒信息、谁在设阻，展示你的洞察力。",
        quality: "risk",
        effects: { insight: 2, authority: 1 },
        resources: { energy: -6, trust: -8, influence: 3 },
        feedback:
          "CEO 看到了你的敏锐，但报告传出去后，被点名的人会立刻进入防御。诊断变成了站队的起点。",
        theory: "《鬼谷子》：审定形势，谋定后动——过早暴露判断等于放弃主动权。"
      }
    ]
  },

  /* ---------- Chapter 2 transition ---------- */
  {
    id: "c2n1b",
    chapterId: 2,
    title: "暗流涌动",
    kind: "main",
    context:
      "在等待正式授权的间隙，你发现一位中层管理者正在私下串联，准备在下次高管会上提出自己的方案。他的方案和你的方向部分重叠，但核心利益不同。你的盟友提醒你「他比你想的更有影响力」，而 CEO 似乎也在等看你们谁先拿出成果。",
    stake: "你要在没有正式权力时处理一个正在形成的竞争性联盟，而不是把潜在合作者变成确定的敌人。",
    options: [
      {
        label: "把他的方案纳入你的框架，邀请他成为共同设计者",
        summary: "主动约他，承认他方案中的亮点，同时提出联合推进的框架。",
        quality: "expert",
        effects: { strategy: 3, communication: 2, mobilize: 1 },
        resources: { energy: -7, trust: 7, influence: 6 },
        feedback:
          "你没有把他当对手，而是让他的能量流入你的方向。他成为共同设计者后，竞争联盟自动消解，你的影响力反而扩大了。",
        theory: "《孙子兵法》：上兵伐谋，其次伐交——不战而屈人之兵，善之善者也。"
      },
      {
        label: "先向上反映这个情况，让高层知道",
        summary: "把他的串联行为告诉 CEO 或临时上级，防止被动。",
        quality: "partial",
        effects: { strategy: 2, authority: 1 },
        resources: { energy: -5, trust: -3, influence: 3 },
        feedback:
          "你保护了自己的信息优势，但高层可能认为你在搞政治而非做事。告状换不来真正的权力。",
        theory: "《韩非子》：事以密成，语以泄败——但密不是告密，而是谋略。"
      },
      {
        label: "私下约谈他，要求他停止串联",
        summary: "用直接对话划清界限，让他知道你已经注意到他的动作。",
        quality: "risk",
        effects: { authority: 2, communication: -1 },
        resources: { energy: -6, trust: -7, influence: 2 },
        feedback:
          "他表面收敛了，但私下更紧密地联络盟友。你把一个潜在合作者逼成了确定的对手，而且是在你还没有正式权力的时候。",
        theory: "《资治通鉴》：逼之太急则反，缓之则散——处理竞争要留转化空间。"
      }
    ]
  },

  /* ---------- Chapter 3 transition ---------- */
  {
    id: "c3n1b",
    chapterId: 3,
    title: "面谈风暴",
    kind: "main",
    context:
      "重组名单还没正式公布，但消息已经泄露。两位你计划保留的骨干提出「如果你不信任我们，我们走」，一位你计划调整的老将在办公室公开质问你「凭什么」。HR 总监说这种情绪如果继续蔓延，可能触发集体离职。你还有 48 小时窗口来控制局面。",
    stake: "你要在名单正式公布前，把情绪管理变成信任管理——人们离开不是因为被调整，而是因为感到不被尊重。",
    options: [
      {
        label: "先与最关键的三人逐一沟通，用岗位逻辑解释",
        summary: "不谈个人好坏，只谈组织需要什么能力组合，以及每个人的新位置如何匹配。",
        quality: "expert",
        effects: { deploy: 3, communication: 2, insight: 1 },
        resources: { energy: -9, trust: 7, influence: 6 },
        feedback:
          "你没有用权力压制情绪，而是用逻辑重建了对话框架。两位骨干理解了调整逻辑后选择留下，老将虽然不满但不再公开对抗。",
        theory: "《贞观政要》：用人如器，各取所长——让人理解岗位逻辑比让人接受结论更重要。"
      },
      {
        label: "紧急召开全员会，公开解释重组原则",
        summary: "在大会上说明重组的必要性和标准，让所有人同时听到。",
        quality: "partial",
        effects: { communication: 3, mobilize: 1 },
        resources: { energy: -7, trust: 4, influence: 3 },
        feedback:
          "透明度值得肯定，但公开场合无法处理个人情绪。被调整者在全员会上只会更尴尬，私下沟通的窗口也关闭了。",
        theory: "《论语》：不患人之不己知，患不知人也——但知人需要一对一的深度，不是大会能替代的。"
      },
      {
        label: "加速公布名单，用既成事实消除猜测",
        summary: "不再沟通，直接发布正式通知，让所有人面对结果。",
        quality: "risk",
        effects: { execution: 2, authority: 1 },
        resources: { energy: -5, trust: -9, influence: 2 },
        feedback:
          "猜测消失了，但信任也消失了。两位骨干在公布当天提交辞呈，老将开始在外部寻找机会。效率换来了人才流失。",
        theory: "《孙子兵法》：兵贵胜，不贵久——但人事不是战场，速战速决的代价可能是永久损失。"
      }
    ]
  },

  /* ---------- Chapter 4 transition ---------- */
  {
    id: "c4n1b",
    chapterId: 4,
    title: "试点初验",
    kind: "main",
    context:
      "新流程试点两周，试点团队效率提升 15%，但非试点团队开始抱怨「为什么他们有特殊待遇」。运营负责人（之前的反对者）私下告诉你：「试点团队之所以好，是因为你给了他们更多资源，不是流程本身好。」他的话有一定道理——试点团队确实获得了额外的关注和支持。",
    stake: "你要证明试点成功来自机制而非资源倾斜，同时不让非试点团队感到被边缘化。",
    options: [
      {
        label: "公开试点数据和方法，邀请非试点团队参与下一轮验证设计",
        summary: "把试点变成所有人的学习材料，而非少数人的特权。",
        quality: "expert",
        effects: { structure: 3, mobilize: 2, communication: 1 },
        resources: { energy: -8, trust: 7, influence: 6 },
        feedback:
          "你没有急于扩大试点，而是让数据和方法成为共同资产。非试点团队从「被排除」变成了「被邀请」，反对者的质疑也被公开数据回应了。",
        theory: "德鲁克：管理的本质是让知识在工作组织中流动起来，而不是让知识成为少数人的特权。"
      },
      {
        label: "扩大试点范围，让更多人享受资源",
        summary: "把试点团队的经验复制到其他团队，同时给其他团队也配备资源。",
        quality: "partial",
        effects: { execution: 2, mobilize: 1 },
        resources: { energy: -7, trust: 4, influence: 3 },
        feedback:
          "更多人受益了，但你无法区分是流程有效还是资源有效。扩大试点等于稀释了验证的严肃性，数据变得更难解读。",
        theory: "《矛盾论》：抓主要矛盾——现在的主要矛盾是验证机制有效性，而非扩大覆盖面。"
      },
      {
        label: "立即全面推行，结束试点阶段",
        summary: "用试点成果证明方向正确，直接在全组织推行新流程。",
        quality: "risk",
        effects: { execution: 3, authority: 1 },
        resources: { energy: -6, trust: -5, influence: 3 },
        feedback:
          "推行速度快了，但非试点团队在没有准备的情况下被强制切换，抵触情绪爆发。试点成功被归因为「特殊条件」，全面推行反而证明了反对者的观点。",
        theory: "《孙子兵法》：善战者，求之于势，不责于人——但势需要积累，不能跳过验证阶段。"
      }
    ]
  },

  /* ---------- Chapter 5 transition ---------- */
  {
    id: "c5n1b",
    chapterId: 5,
    title: "第一个里程碑",
    kind: "main",
    context:
      "目标拆解后的第一个里程碑到了。三个关键结果中两个达标，一个延期 40%。延期的负责人是你最信任的骨干，他主动承认问题但给出了三个外部原因。与此同时，CEO 助理来电询问进展，语气里带着「你能不能管住团队」的意味。团队在看你如何处理第一次未达标。",
    stake: "你如何处理第一个未达标结果，会定义团队对「可验收」的真实理解——是惩罚机制还是学习机制。",
    options: [
      {
        label: "让他补上根因分析和补救计划，同时你向 CEO 主动汇报含风险的全貌",
        summary: "不掩盖延期，但把延期变成一次可控的风险沟通和流程改进。",
        quality: "expert",
        effects: { structure: 3, execution: 2, communication: 1 },
        resources: { energy: -8, trust: 6, influence: 6 },
        feedback:
          "你没有替骨干隐瞒，也没有把他推出去当替罪羊。CEO 看到你对风险有掌控力，团队看到你对未达标有建设性态度。可验收从此意味着「可以暴露问题并改进」。",
        theory: "《卓有成效的管理者》：管理者的价值不是消除失败，而是让每一次失败都产生组织学习。"
      },
      {
        label: "只汇报两个达标的，延期的等补救后再说",
        summary: "先给 CEO 好消息，把坏消息留到有解决方案的时候。",
        quality: "partial",
        effects: { communication: 1, strategy: 1 },
        resources: { energy: -5, trust: 2, influence: 1 },
        feedback:
          "CEO 暂时满意了，但延期的风险在暗中扩大。当问题最终暴露时，你的可信度会被双倍消耗——不是因为延期，而是因为你选择了隐瞒。",
        theory: "《资治通鉴》：不塞隙穴，则暴雨疾风必坏——小风险不报，大风险不可控。"
      },
      {
        label: "当众批评他，证明你对所有人一视同仁",
        summary: "在团队面前指出他的延期问题，展示你不会因为私人关系放松标准。",
        quality: "risk",
        effects: { authority: 2, execution: 1 },
        resources: { energy: -6, trust: -8, influence: 2 },
        feedback:
          "你展示了严格，但最信任的骨干感到被公开羞辱。团队学到的是「未达标会被公开批评」，于是开始粉饰数据、降低目标。可验收变成了可伪装。",
        theory: "《韩非子》：明赏罚，但罚不中则众不惧——惩罚方式比惩罚本身更重要。"
      }
    ]
  },

  /* ---------- Chapter 6 transition ---------- */
  {
    id: "c6n1b",
    chapterId: 6,
    title: "规则重塑",
    kind: "main",
    context:
      "你建立的联签机制运行了两周，重大决策确实回到了流程。但团队开始抱怨审批变慢，有人开始用「紧急」名义绕过联签。你发现上周有三个决策以「紧急」为由跳过了你，而事后看其中两个并不紧急。团队的默契正在变成「只要贴上紧急标签就可以不走流程」。",
    stake: "你要在守住流程和保持速度之间找到平衡，不能让「紧急」成为新的绕过通道。",
    options: [
      {
        label: "定义「紧急」标准和事后补审机制，让速度和规则兼容",
        summary: "明确什么情况可以走紧急通道，同时要求紧急决策在 48 小时内补完成联签和记录。",
        quality: "expert",
        effects: { structure: 3, authority: 2, execution: 1 },
        resources: { energy: -7, trust: 5, influence: 6 },
        feedback:
          "你没有堵死紧急通道，而是给它装上护栏。团队既有速度又有规则，「紧急」不再是权力的后门，而是有约束的工具。",
        theory: "《韩非子》：法度既立，虽庸主可治——但法度需要有弹性，否则会被绕过。"
      },
      {
        label: "取消紧急通道，所有决策必须走完整流程",
        summary: "用铁律堵住所有绕过可能，确保流程绝对权威。",
        quality: "partial",
        effects: { authority: 3, structure: 1 },
        resources: { energy: -6, trust: -4, influence: 3 },
        feedback:
          "流程权威保住了，但真正紧急的决策也被拖慢。团队开始用更隐蔽的方式绕过——比如把重大决策拆成小决策分批审批。刚性规则催生了柔性规避。",
        theory: "《孙子兵法》：兵无常势，水无常形——管理规则也需要适应性，不能一刀切。"
      },
      {
        label: "默许紧急通道，只要结果好就不追究",
        summary: "不追究绕过行为，用结果导向代替流程导向。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -4, trust: 3, influence: -4 },
        feedback:
          "短期内决策变快了，但联签机制名存实亡。团队发现「紧急」标签可以无成本使用，越来越多决策绕过流程。你建立的规则在默许中被瓦解。",
        theory: "《资治通鉴》：防微杜渐，不塞隙穴则暴雨疾风必坏——规则不被执行，比没有规则更危险。"
      }
    ]
  },

  /* ---------- Chapter 7 transition ---------- */
  {
    id: "c7n1b",
    chapterId: 7,
    title: "第一次放手",
    kind: "main",
    context:
      "接班人已经到位，知识库也开始建设。但今天一个重要客户提出要修改合同条款，涉及 200 万的让步。接班人拿着方案来找你，他的分析逻辑清晰，但你发现他忽略了一个关键风险——客户的真实意图不是降价，而是为下一步更换供应商积累谈判筹码。你的本能是直接修改他的方案。",
    stake: "你要决定是修改他的结论，还是让他自己发现盲点——这会定义他学到的领导方式。",
    options: [
      {
        label: "用提问引导他自己发现盲点，让他修改方案并承担决策",
        summary: "不给出答案，而是问三个问题，让他在回答中看见自己遗漏的风险。",
        quality: "expert",
        effects: { stability: 3, deploy: 2, communication: 1 },
        resources: { energy: -7, trust: 8, influence: 6 },
        feedback:
          "他通过你的提问自己发现了盲点，修改了方案并主动承担了决策。他学到的不是「正确答案」，而是「如何检查自己的盲区」。这正是固权的核心——让组织拥有判断力，而非复制你的结论。",
        theory: "德鲁克：管理者的终极贡献不是做出正确决策，而是培养出能做出正确决策的人。"
      },
      {
        label: "指出盲点并给出你的修改建议，让他执行",
        summary: "直接告诉他风险在哪里，按你的方案调整后让他去谈。",
        quality: "partial",
        effects: { execution: 2, authority: 1 },
        resources: { energy: -5, trust: 4, influence: 3 },
        feedback:
          "方案更安全了，但接班人学到的是「遇到难题先来找你」。你解决了这一次的问题，却强化了对你的依赖。放手的第一次就变成了收手。",
        theory: "《权经》：授能干者，授忠诚者——但授权不是授答案，而是授判断空间。"
      },
      {
        label: "直接修改方案，这次先保证结果正确",
        summary: "自己接管谈判，确保 200 万的决策不出错。",
        quality: "risk",
        effects: { execution: 3 },
        resources: { energy: -8, trust: 2, influence: 2 },
        feedback:
          "谈判结果可能更好，但接班人从此知道「重要决策你不会真正放手」。你给了他职位，却没有给他决策权。固权变成了控权，组织能力无法增长。",
        theory: "《贞观政要》：善始慎终——但慎终不是事事亲为，而是让继承者学会承担。"
      }
    ]
  },

  /* ---------- Chapter 8 transition ---------- */
  {
    id: "c8n1b",
    chapterId: 8,
    title: "内部震荡",
    kind: "main",
    context:
      "现金流危机暂时控制住了，但你刚发现三位核心工程师在私下更新简历。一位直接来问你：「公司还能撑多久？」你的回答可能在 10 分钟内传遍整个团队。与此同时，财务告诉你按当前消耗速度，现金只能撑 6 周——比之前预估的短了两周。你需要在不确定中同时处理员工信心和真实风险。",
    stake: "你要在不确定中给出既诚实又不引发恐慌的回答——虚假的安慰比沉默更危险。",
    options: [
      {
        label: "诚实说明已采取的行动和下一步计划，同时给他一个具体的留任理由",
        summary: "不隐瞒挑战，但用具体行动和未来机会重建信心，让他在信息充分的情况下做选择。",
        quality: "expert",
        effects: { recovery: 3, communication: 2, mobilize: 1 },
        resources: { energy: -8, trust: 7, influence: 6 },
        feedback:
          "你没有用谎言买时间，而是用真实和行动赢得了信任。这位工程师选择留下，并把你的坦诚传了出去——不是「公司没问题」，而是「领导在认真解决问题」。团队的恐慌被行动感替代。",
        theory: "《高效能人士的七个习惯》：诚信是情感账户的基础——危机中的诚实比平时的承诺更有价值。"
      },
      {
        label: "让他放心，说「公司没有问题」",
        summary: "用信心安抚他，避免人才流失加剧危机。",
        quality: "partial",
        effects: { mobilize: 1, communication: 1 },
        resources: { energy: -4, trust: -3, influence: 1 },
        feedback:
          "他暂时留下来了，但当他从其他渠道得知现金流真相时，信任会彻底崩塌。虚假安慰买来的留任，会在真相暴露时变成更猛烈的离职潮。",
        theory: "《论语》：民无信不立——但信不是让人安心，而是让人知道真实并愿意同行。"
      },
      {
        label: "要求他不要传播恐慌情绪",
        summary: "用管理权威压制信息扩散，防止恐慌蔓延。",
        quality: "risk",
        effects: { authority: 2 },
        resources: { energy: -5, trust: -7, influence: -3 },
        feedback:
          "你堵住了一个人的嘴，但恐慌在沉默中加速传播。团队开始用「领导不让说」来确认危机比想象中更严重，离职从三个人变成了八个人。",
        theory: "《鬼谷子》：欲擒故纵——但信息不是猎物，越压制越失控。"
      }
    ]
  },

  /* ---------- Chapter 9 transition ---------- */
  {
    id: "c9n1b",
    chapterId: 9,
    title: "告别演说",
    kind: "main",
    context:
      "你即将离开一手带起来的组织。CEO 建议你在全员会上做一次告别演说。团队里有人感激，有人松了口气，有人担心未来。你知道这次演说不是总结过去，而是给组织留下一个可延续的方向感。你的最后一句话会成为团队未来面对困难时的内心声音。",
    stake: "你的告别演说会定义你离开后组织的信心基础——是依赖你的记忆，还是依赖组织已验证的能力。",
    options: [
      {
        label: "讲三个组织已验证的能力加一个有路径的未解挑战",
        summary: "用具体案例证明组织已经能独立应对挑战，同时留一个真实的未解问题激发持续成长。",
        quality: "expert",
        effects: { stability: 3, strategy: 2, communication: 1 },
        resources: { energy: -7, trust: 8, influence: 8 },
        feedback:
          "你没有把告别变成自我表彰，而是让团队看到自己的力量。那个未解挑战不是负担，而是你留给组织的成长礼物。团队离开会场时的感受不是「他走了我们怎么办」，而是「我们知道该怎么做」。",
        theory: "《资治通鉴》：善始慎终——真正的善终不是完美句号，而是让组织有能力书写下一章。"
      },
      {
        label: "回顾自己的贡献和团队的成长",
        summary: "用真诚的回顾总结这段旅程，感谢每一个人的付出。",
        quality: "partial",
        effects: { communication: 2, mobilize: 1 },
        resources: { energy: -5, trust: 5, influence: 3 },
        feedback:
          "团队感受到了温度，但缺少方向。感性告别让人怀念你，却没有给组织留下可操作的信心。你走后，团队会反复回忆「如果是他会怎么做」，而不是「我们已经知道怎么做」。",
        theory: "《论语》：君子成人之美——但成人的美不只是情感传承，更是能力传承。"
      },
      {
        label: "用感性告别打动人心，不谈业务",
        summary: "讲一个团队共同经历的故事，用情感连接收尾。",
        quality: "risk",
        effects: { communication: 2 },
        resources: { energy: -4, trust: 4, influence: -3 },
        feedback:
          "现场很感动，但第二天团队面对真实业务决策时，发现你的演说没有留下任何可操作的东西。感性记忆在两周内褪色，组织开始用「他不会这么做」来质疑新领导的每一个决定。",
        theory: "《孙子兵法》：上下同欲者胜——但同欲不能只靠情感，还需要共同的方法论。"
      }
    ]
  }
];

/* ============================================================
 *  New side-quest nodes for the two new arcs
 * ============================================================ */
const NEW_SIDE_NODES: StoryNode[] = [
  /* ---- crisis_leadership arc ---- */
  {
    id: "s10",
    chapterId: 5,
    title: "凌晨三点的电话",
    kind: "side",
    context:
      "产品发布周的第一天凌晨三点，核心系统崩溃。值班工程师打电话给你，声音发抖。客户演示在早上 9 点，团队已经连续工作 16 小时。你知道修复需要至少 4 小时，但没有把握能在 9 点前完成。工程师在等你拍板。",
    stake: "你要在 6 小时内做出是全力修复还是降级演示的决策——两者都有真实代价。",
    options: [
      {
        label: "决定降级演示，把修复精力转向核心场景",
        summary: "只演示已验证的核心功能，用真诚沟通替代全面演示，同时安排修复在演示后继续。",
        quality: "expert",
        effects: { structure: 3, recovery: 2, execution: 1 },
        resources: { energy: -6, trust: 7, influence: 6 },
        feedback:
          "你做出了一个不受欢迎但正确的决策。客户虽然失望，但看到了你对质量的底线和对团队的负责。工程师从恐惧中恢复，因为你替他承担了降级的压力。",
        theory: "《矛盾论》：抓住主要矛盾——演示的核心是建立信任，而非展示功能完整性。"
      },
      {
        label: "全员修复，赌一把 9 点前能搞定",
        summary: "调动所有人投入修复，力争在演示前恢复全部功能。",
        quality: "partial",
        effects: { execution: 3 },
        resources: { energy: -12, trust: 2, influence: 3 },
        feedback:
          "如果你赢了，团队士气大振。但连续工作 20 小时后的修复质量不可控，演示中出现新 bug 的风险极高。你在用团队健康赌一个不确定的结果。",
        theory: "《孙子兵法》：兵贵胜，不贵久——但胜利不只是完成，更是可持续。"
      },
      {
        label: "推迟演示时间，向客户说明真实情况",
        summary: "不等 9 点，立即通知客户推迟演示。",
        quality: "risk",
        effects: { communication: 2, recovery: 1 },
        resources: { energy: -4, trust: 3, influence: -4 },
        feedback:
          "坦诚值得肯定，但客户可能认为你的团队不具备交付能力。推迟演示在发布周是严重信号，可能影响后续合作。危机中过早示弱也是一种风险。",
        theory: "《权经》：权惟用，不为大也——但用权包括在压力下做出不受欢迎但正确的取舍。"
      }
    ]
  },
  {
    id: "s11",
    chapterId: 8,
    title: "供应链断裂",
    kind: "side",
    context:
      "你最大的供应商突然宣布破产，所有在途订单冻结。生产线下周就要停工，而季度交付承诺只差三周。财务说切换供应商至少需要两周，而且新供应商的价格高 20%。客户的合同里有延期罚款条款。",
    stake: "你要在时间、成本和质量之间做出极限取舍——没有完美方案，只有最优权衡。",
    options: [
      {
        label: "同时启动三条线：应急采购、客户重谈、内部降耗",
        summary: "不把赌注押在一个方案上，而是用并行策略分散风险。",
        quality: "expert",
        effects: { structure: 3, execution: 2, recovery: 1 },
        resources: { energy: -9, trust: 5, influence: 6 },
        feedback:
          "你没有在「切换供应商」和「求客户延期」之间二选一，而是同时推进三条线。应急采购保住了短期交付，客户重谈争取了缓冲，内部降耗消化了成本上升。危机变成了组织韧性的检验场。",
        theory: "《孙子兵法》：多算胜，少算不胜——危机中的并行策略是对不确定性的最好回应。"
      },
      {
        label: "立即切换供应商，接受 20% 成本上升",
        summary: "用价格换时间，保证交付不断线。",
        quality: "partial",
        effects: { execution: 3 },
        resources: { energy: -7, trust: 3, influence: 2 },
        feedback:
          "交付保住了，但利润被大幅侵蚀。如果你没有同时启动成本优化和客户沟通，20% 的成本上升会在下季度变成更大的财务问题。",
        theory: "《孙子兵法》：兵贵神速——但速度不能替代全局思考。"
      },
      {
        label: "向客户坦白并启动合同中的不可抗力条款",
        summary: "用合同条款保护自己，把风险转嫁给客户。",
        quality: "risk",
        effects: { recovery: 2, communication: 1 },
        resources: { energy: -5, trust: -6, influence: -3 },
        feedback:
          "法律上你站得住，但客户关系会严重受损。供应商破产可能不完全符合不可抗力定义，而且即使成立，客户也会重新评估对你的依赖度。",
        theory: "《论语》：君子信而后劳其民——但信不是用合同条款保护自己，而是在困难中共同寻找方案。"
      }
    ]
  },
  {
    id: "s12",
    chapterId: 8,
    title: "公开危机",
    kind: "side",
    context:
      "一起安全事故被媒体曝光，虽然无人受伤，但视频已经传播。客户开始打电话询问，投资人要求你 24 小时内给出公开声明。法务说任何表态都可能被引用。社交媒体上已经开始出现猜测和夸大版本。",
    stake: "你要在法律安全和公众信任之间做出平衡——沉默会被解读为隐瞒，表态可能被法律束缚。",
    options: [
      {
        label: "发布事实声明加行动计划，法务审核后立即公开",
        summary: "承认事实，说明已采取的措施和下一步计划，用透明度和行动重建信任。",
        quality: "expert",
        effects: { structure: 3, communication: 2, recovery: 1 },
        resources: { energy: -8, trust: 6, influence: 6 },
        feedback:
          "你在 12 小时内发布了经过法务审核的声明，既没有回避事实，也没有过度承诺。客户和投资人看到了一个在危机中仍然可控的组织。社交媒体上的猜测被官方信息对冲，热度开始下降。",
        theory: "《实践论》：从感性材料上升到理性认识——危机沟通的核心是用事实替代猜测。"
      },
      {
        label: "先完成内部调查再表态",
        summary: "等查明全部原因后，一次性给出完整回应。",
        quality: "partial",
        effects: { structure: 2, recovery: 1 },
        resources: { energy: -7, trust: -3, influence: 2 },
        feedback:
          "调查需要时间，但 24 小时的信息真空会让猜测变成「事实」。等你给出完整回应时，公众已经形成了自己的叙事，你的声明变成了辩解而非信息。",
        theory: "《资治通鉴》：防微杜渐——信息真空也是一种危机，会被别人填充。"
      },
      {
        label: "让法务部门发布最小化声明",
        summary: "只说「已知晓，正在调查」，不披露任何细节。",
        quality: "risk",
        effects: { recovery: 1 },
        resources: { energy: -4, trust: -7, influence: -5 },
        feedback:
          "法务风险最小化了，但公众信任也最小化了。最小化声明被解读为「有更多问题不敢说」，媒体开始挖掘更深层的故事。你用法律安全换来了公关灾难。",
        theory: "《论语》：不患人之不己知，患不知人也——但在危机中，不知人不如先让人知你。"
      }
    ]
  },

  /* ---- cross_cultural arc ---- */
  {
    id: "s13",
    chapterId: 4,
    title: "时区困局",
    kind: "side",
    context:
      "你的团队分布在三个时区：北京、伦敦和旧金山。关键决策总是在旧金山的工作时间做出，北京团队每次醒来都面对既成事实。北京团队负责人已经第二次缺席决策会议，理由是「凌晨两点开会不现实」。旧金山团队觉得北京方在消极抵抗。",
    stake: "你要让跨时区协作不变成一方主导——制度设计比呼吁「互相理解」更有效。",
    options: [
      {
        label: "建立异步决策机制，用文档代替实时会议",
        summary: "所有关键决策必须先用文档提案，各时区有 24 小时异步窗口反馈，最后由责任人裁决。",
        quality: "expert",
        effects: { structure: 3, communication: 2 },
        resources: { energy: -8, trust: 7, influence: 6 },
        feedback:
          "你没有试图找到一个对所有人都方便的会议时间——那不存在。而是用异步机制让每个时区都有真实的参与权。北京团队不再面对既成事实，旧金山团队也不再觉得被拖慢。",
        theory: "德鲁克：组织的结构应该服务于协作，而不是让协作迁就时区。"
      },
      {
        label: "轮流调整会议时间，让各方都承担一些不便",
        summary: "每周轮换会议时间，让三个时区轮流承受不舒适时段。",
        quality: "partial",
        effects: { communication: 2, mobilize: 1 },
        resources: { energy: -7, trust: 4, influence: 3 },
        feedback:
          "公平感提升了，但轮流不便不等于高效协作。凌晨会议的质量远低于正常时段，关键决策仍然在精神状态最好的一方主导。形式公平掩盖了实质不平等。",
        theory: "《论语》：不患寡而患不均——但均不等于好，真正的公平是让每个人都能有效参与。"
      },
      {
        label: "让旧金山团队作为决策中心，其他方执行",
        summary: "承认时区差异的现实，让最活跃的时区主导决策。",
        quality: "risk",
        effects: { execution: 2 },
        resources: { energy: -5, trust: -6, influence: 2 },
        feedback:
          "决策速度提升了，但北京团队的归属感急速下降。他们在执行自己没有参与制定决策时，质量和速度都会打折。你用效率换来了分裂，而分裂最终会反噬效率。",
        theory: "《孙子兵法》：上下同欲者胜——但同欲需要真实的参与权，不能只有执行义务。"
      }
    ]
  },
  {
    id: "s14",
    chapterId: 3,
    title: "文化误解",
    kind: "side",
    context:
      "新来的德国技术负责人在会上直接说中国团队的设计方案「不够专业」。中国团队感到被冒犯，会后集体沉默。德国负责人不理解为什么大家反应这么大，他觉得自己只是在陈述事实。你需要在两个文化框架之间做翻译，而不是选边。",
    stake: "你要把一次文化冲突变成团队协作规则的建立机会，而不是让任何一方感到被否定。",
    options: [
      {
        label: "分别沟通后建立团队反馈公约",
        summary: "先帮双方理解对方的文化框架，再共同制定反馈规则：直接但具体、对事不对人、反馈必须带建议。",
        quality: "expert",
        effects: { communication: 3, deploy: 2 },
        resources: { energy: -7, trust: 8, influence: 6 },
        feedback:
          "你没有评判谁对谁错，而是让双方的文化差异变成团队公约的素材。德国负责人学会了反馈需要建设性，中国团队学会了直接反馈不等于不尊重。团队从这次冲突中获得了更健康的沟通规则。",
        theory: "《论语》：君子和而不同——真正的团队不是消除差异，而是让差异成为协作的丰富度。"
      },
      {
        label: "私下安抚中国团队，让德国负责人注意措辞",
        summary: "分别安抚双方，避免公开讨论文化差异。",
        quality: "partial",
        effects: { communication: 1, mobilize: 1 },
        resources: { energy: -5, trust: 3, influence: 2 },
        feedback:
          "冲突暂时平息了，但双方都没有真正理解对方。下一次类似的情况会再次发生，而且中国团队会觉得你只是在「灭火」而非解决问题。文化差异被回避而非处理。",
        theory: "《鬼谷子》：审定形势，谋定后动——但审定的目的是行动，不是回避。"
      },
      {
        label: "支持德国负责人的直接风格，要求中国团队适应",
        summary: "明确团队需要直接沟通文化，让所有人调整。",
        quality: "risk",
        effects: { execution: 1 },
        resources: { energy: -4, trust: -7, influence: -2 },
        feedback:
          "你选择了效率导向的文化，但中国团队的沉默从「暂时的」变成了「永久的」。他们不再在会上提出异议，但执行力开始下降。直接沟通文化如果没有信任基础，只会制造更多沉默。",
        theory: "《人物志》：察其行而辨其品——不同文化背景的人有不同的表达方式，强求统一反而损失信息。"
      }
    ]
  },
  {
    id: "s15",
    chapterId: 2,
    title: "总部与前线",
    kind: "side",
    context:
      "总部要求东南亚团队执行一套标准化的客户流程，但当地团队说这套流程在他们的市场完全行不通。总部认为当地团队在找借口，当地团队觉得总部不了解实情。双方都向你施压：总部要你「确保执行」，前线要你「帮我们挡住」。",
    stake: "你要在标准化和本地化之间找到一条既不削弱总部权威、又不牺牲前线效率的路。",
    options: [
      {
        label: "用「原则统一、路径灵活」框架重新定义标准",
        summary: "总部定义客户体验的核心原则和验收标准，前线自主设计本地化执行路径。",
        quality: "expert",
        effects: { structure: 3, strategy: 2, communication: 1 },
        resources: { energy: -8, trust: 7, influence: 7 },
        feedback:
          "你没有在「执行」和「不执行」之间选边，而是重新定义了问题。总部得到了核心原则的统一性，前线得到了执行路径的灵活性。这个框架后来被推广到其他区域。",
        theory: "德鲁克：管理的原则是分权——但分权不是放弃标准，而是让标准在原则层面统一，在执行层面灵活。"
      },
      {
        label: "支持总部标准，让前线先试行再反馈",
        summary: "先执行标准流程，用试行数据证明是否需要调整。",
        quality: "partial",
        effects: { execution: 2, structure: 1 },
        resources: { energy: -6, trust: -3, influence: 3 },
        feedback:
          "试行的初衷是好的，但前线在执行一个他们认为无效的流程时，数据和反馈可能被扭曲以证明「确实不行」。试行变成了政治博弈而非真实验证。",
        theory: "《实践论》：实践是检验真理的唯一标准——但实践需要真实的态度，而非消极的证明。"
      },
      {
        label: "支持前线，向总部申请豁免",
        summary: "帮前线挡住总部的标准，让当地团队自主决策。",
        quality: "risk",
        effects: { communication: 1, mobilize: 1 },
        resources: { energy: -5, trust: 5, influence: -4 },
        feedback:
          "前线感激你，但总部认为你不愿推动标准落地。你成了前线的保护伞而非组织的协调者，下一次总部会更强硬地推行标准，而你的协调空间已经被压缩。",
        theory: "《权经》：权乃人授——但用权不是帮一方挡另一方，而是找到让双方都能接受的框架。"
      }
    ]
  }
];

/* ============================================================
 *  CHAPTERS_ENHANCED — 9 chapters, 3 nodes each
 *  (original two nodes plus a transition node in between)
 * ============================================================ */
export const CHAPTERS_ENHANCED: ChapterDef[] = [
  {
    id: 1,
    code: "I",
    title: "识局",
    subtitle: "先诊断，再动手",
    focus: ["insight", "structure"],
    nodeIds: ["c1n1", "c1n1b", "c1n2"]
  },
  {
    id: 2,
    code: "II",
    title: "谋权",
    subtitle: "在授权之前先建势",
    focus: ["strategy", "communication"],
    nodeIds: ["c2n1", "c2n1b", "c2n2"]
  },
  {
    id: 3,
    code: "III",
    title: "用人",
    subtitle: "把对的人放进对的坑",
    focus: ["deploy", "insight"],
    nodeIds: ["c3n1", "c3n1b", "c3n2"]
  },
  {
    id: 4,
    code: "IV",
    title: "驭势",
    subtitle: "让一群人不情愿的人一起走",
    focus: ["mobilize", "communication"],
    nodeIds: ["c4n1", "c4n1b", "c4n2"]
  },
  {
    id: 5,
    code: "V",
    title: "执权",
    subtitle: "把决策变成可验收的成果",
    focus: ["execution", "authority"],
    nodeIds: ["c5n1", "c5n1b", "c5n2"]
  },
  {
    id: 6,
    code: "VI",
    title: "掌权",
    subtitle: "用制度守住权力边界",
    focus: ["authority", "structure"],
    nodeIds: ["c6n1", "c6n1b", "c6n2"]
  },
  {
    id: 7,
    code: "VII",
    title: "固权",
    subtitle: "让组织不依赖任何个人",
    focus: ["stability", "deploy"],
    nodeIds: ["c7n1", "c7n1b", "c7n2"]
  },
  {
    id: 8,
    code: "VIII",
    title: "破局",
    subtitle: "在不确定中快速调整",
    focus: ["structure", "recovery"],
    nodeIds: ["c8n1", "c8n1b", "c8n2"]
  },
  {
    id: 9,
    code: "IX",
    title: "成业",
    subtitle: "让成功可以延续",
    focus: ["stability", "strategy"],
    nodeIds: ["c9n1", "c9n1b", "c9n2"]
  }
];

/* ============================================================
 *  CHAPTER_REFLECTIONS_ENHANCED — original reflections plus
 *  new ones for transition phases and new quest themes
 * ============================================================ */
export const CHAPTER_REFLECTIONS_ENHANCED: Record<number, string> = {
  ...CHAPTER_REFLECTIONS,

  /* Transition-phase reflections (101–109) */
  101: "你在信息不完整时给出了第一个判断。诊断的价值不在于结论完美，而在于你能否让团队感到被观察而非被审判——观察指向机制，审判指向个人。",
  102: "你处理了一个暗流中的竞争者。真正的谋权不是消灭对手，而是让对方的能量流入你的方向——从竞争联盟到共同设计者，只差一个邀请。",
  103: "你在名单泄露后把情绪管理变成了信任管理。人离开不是因为被调整，而是因为感到不被尊重。用岗位逻辑替代个人评价，是用人决策从艺术走向专业的第一步。",
  104: "你让试点从特权变成了共同资产。验证机制有效性的关键不是扩大范围，而是让数据和方法的流动打破'特殊待遇'的叙事。",
  105: "你处理了第一个未达标结果。团队对'可验收'的真实理解，不在于你制定了什么标准，而在于你如何对待第一个没达标的人——是惩罚还是学习。",
  106: "你在速度和规则之间找到了兼容方案。好的制度不是堵死所有绕过通道，而是给绕过通道装上护栏——紧急不是权力的后门，而是有约束的工具。",
  107: "你在接班人的第一次重大决策中选择了放手。固权的核心不是复制你的结论，而是培养组织的判断力——让他在自己的盲点中学会检查盲点。",
  108: "你在不确定中选择了诚实。危机中的虚假安慰比沉默更危险——用真实和行动赢得的信任，比用谎言买来的留任更持久。",
  109: "你的告别演说定义了离开后的信心基础。真正的善终不是完美句号，而是让组织相信'我们知道该怎么做'——你留下的不是记忆，而是已验证的能力。",

  /* New arc-theme reflections */
  110: "你在极限压力下做出了决策。危机领导力的本质不是勇敢，而是在信息不全、时间不够、资源不足时仍然能做出有逻辑的取舍——并让团队理解这个取舍。",
  111: "你处理了跨文化协作的张力。文化差异不是需要消除的问题，而是需要翻译的信号——真正的多元团队不是统一表达方式，而是让每种表达方式背后的价值被看见。"
};

/* ============================================================
 *  SIDE_QUEST_ARCS_ENHANCED — original 3 arcs plus 2 new ones
 * ============================================================ */
export const SIDE_QUEST_ARCS_ENHANCED: SideQuestArc[] = [
  ...SIDE_QUEST_ARCS,

  {
    id: "crisis_leadership",
    title: "极限领导力",
    summary: "在系统崩溃、供应链断裂和公众危机中，测试你在极限压力下的决策质量和团队保护能力。",
    intro:
      "真正的领导力不是在顺境中展现的，而是在信息不全、时间紧迫、资源枯竭时仍然能做出有逻辑的取舍。这条支线会把你推到三个极限场景中，考验你能否在恐惧中保持判断力，在不确定中保护团队，在危机中留下组织学习。",
    nodes: ["s10", "s11", "s12"],
    conclusion:
      "当团队能在危机中回忆起你做出的取舍逻辑，而不是你的焦虑和指令，你就真正建立了极限领导力——它不是个人英雄主义，而是让组织在极端条件下仍然能做出有依据的决策。"
  },

  {
    id: "cross_cultural",
    title: "跨文化协作",
    summary: "在时区差异、文化冲突和总部-前线博弈中，建立让多元背景团队真正协作的机制。",
    intro:
      "跨文化管理不是消除差异，而是让差异变成协作的丰富度。这条支线会考验你能否在制度层面解决文化摩擦——用异步机制替代时区妥协，用反馈公约替代文化评判，用原则统一替代路径强制。",
    nodes: ["s13", "s14", "s15"],
    conclusion:
      "当团队能在文化差异中找到共同的工作规则，而不是要求一方适应另一方，你就真正建立了跨文化协作能力——它不是统一性，而是让每种视角都能真实地贡献于共同目标。"
  }
];

/* ============================================================
 *  STORY_NODES_ENHANCED — ALL original nodes (imported and
 *  spread) PLUS 9 transition nodes PLUS 6 new side-quest nodes
 * ============================================================ */
export const STORY_NODES_ENHANCED: StoryNode[] = [
  ...STORY_NODES,
  ...TRANSITION_NODES,
  ...NEW_SIDE_NODES
];
