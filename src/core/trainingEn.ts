import type { AbilityId } from "./types";

export interface TrainingStoryEn {
  title: string;
  source: string;
  scenario: string;
  lesson: string;
}

export interface TrainingQuestionEn {
  id: string;
  prompt: string;
  options: Array<{
    label: string;
    feedback: string;
  }>;
  answer: number;
}

export interface AbilityTrainingEn {
  abilityId: AbilityId;
  routeTitle: string;
  routeSummary: string;
  route: string[];
  story: TrainingStoryEn;
  questions: TrainingQuestionEn[];
}

export const TRAINING_EN: Record<AbilityId, AbilityTrainingEn> = {
  insight: {
    abilityId: "insight",
    routeTitle: "Reading People: Observe Evidence, Verify Motives",
    routeSummary:
      "Turn judgment about people from impressions into an evidence chain: define the job result first, observe behavior under pressure, and calibrate against the stakeholder map.",
    route: [
      "Define the job result you are judging",
      "Collect behavioral evidence under pressure",
      "Separate public commitment from real investment",
      "Verify attribution through key interviews",
      "Calibrate against the stakeholder map"
    ],
    story: {
      title: "Zeng Guofan Reads People",
      source: "The Qing Draft History and related staff records",
      scenario:
        "Li Hongzhang brought three visitors to see Zeng Guofan. Instead of meeting them immediately, Zeng kept them waiting in the hall and observed them from afar. One visitor looked around restlessly, one stayed silent and nervous, and one remained composed. Zeng judged the third person as the one worth using, because pressure and waiting reveal real temperament.",
      lesson:
        "Reliable people-reading comes from behavioral evidence in a concrete situation: patience under pressure, choices in difficulty, and where resources are invested. These are closer to true motives than resumes, eloquence, or first impressions."
    },
    questions: [
      {
        id: "train-insight-1",
        prompt: "When judging whether a candidate is trustworthy, what should you collect first?",
        options: [
          {
            label: "How they allocate time, responsibility, and attention under pressure",
            feedback: "Behavioral evidence is more stable than verbal commitment."
          },
          {
            label: "How confident their tone sounds",
            feedback: "Tone reflects presentation, not real investment."
          },
          {
            label: "How many success stories they quote",
            feedback: "Past cases matter, but must be tested against the current job result."
          }
        ],
        answer: 0
      },
      {
        id: "train-insight-2",
        prompt: "Someone publicly pledges loyalty but never invests time or resources in your priority. What does that suggest?",
        options: [
          {
            label: "Motives and actions are inconsistent; keep collecting behavioral evidence",
            feedback: "When statements and investment diverge, return to the stakeholder map."
          },
          {
            label: "They are just reserved, so trust them directly",
            feedback: "Reserve is not proof of commitment."
          },
          {
            label: "Their public position is enough for delegation",
            feedback: "Public statements cannot replace verified investment."
          }
        ],
        answer: 0
      },
      {
        id: "train-insight-3",
        prompt: "What is the most reliable way to identify a key person's real motives?",
        options: [
          {
            label: "Watch where they consistently invest time, budget, and attention",
            feedback: "Resource flow is the hardest motive to fake."
          },
          {
            label: "Listen to how they describe their goals",
            feedback: "Self-description is useful, but must be cross-checked with behavior."
          },
          {
            label: "Rely only on what others say about them",
            feedback: "Other people's opinions are filtered by their own interests."
          }
        ],
        answer: 0
      }
    ]
  },
  deploy: {
    abilityId: "deploy",
    routeTitle: "Placing People: Start with Job Results",
    routeSummary:
      "Define what the role must deliver before matching evidence, then use checkpoints and delivery outcomes to adjust the talent configuration.",
    route: [
      "Define the job result",
      "Inventory capability evidence",
      "Allow weaknesses unless they block the core result",
      "Set delegation boundaries and checkpoints",
      "Use delivered results to refine the placement"
    ],
    story: {
      title: "Xiao He Chases Han Xin by Moonlight",
      source: "Records of the Grand Historian, Biography of Han Xin",
      scenario:
        "Han Xin was underused in Liu Bang's camp and fled at night. Xiao He chased him back without waiting for permission, insisting that Han Xin was a talent without equal. Liu Bang appointed him commander with full ceremony. Han Xin then rebuilt the army and helped create a decisive advantage in the struggle for power.",
      lesson:
        "Placing people starts not with loyalty or seniority but with the result the role must deliver. Real critical talent is often invisible to a standard evaluation form."
    },
    questions: [
      {
        id: "train-deploy-1",
        prompt: "When selecting someone for a key role, what should you do first?",
        options: [
          {
            label: "Define the job result, then match capability evidence",
            feedback: "The result definition is the ruler for talent decisions."
          },
          {
            label: "Find a loyal person and develop them gradually",
            feedback: "Loyalty matters, but development cost must be assessed against the job result."
          },
          {
            label: "Choose the most senior person to avoid risk",
            feedback: "Seniority is not the same as the capability mix the role needs."
          }
        ],
        answer: 0
      },
      {
        id: "train-deploy-2",
        prompt: "A candidate has an outstanding strength but a clear weakness. What do you do?",
        options: [
          {
            label: "Assess whether the weakness blocks the core result",
            feedback: "Job results determine whether a weakness is acceptable."
          },
          {
            label: "Prefer someone with no obvious weakness",
            feedback: "Someone with no weakness may also lack the needed strength."
          },
          {
            label: "Reject anyone with a weakness",
            feedback: "Perfect candidates are rare; the question is whether the core result is blocked."
          }
        ],
        answer: 0
      },
      {
        id: "train-deploy-3",
        prompt: "Before delegating to a subordinate, what should you confirm first?",
        options: [
          {
            label: "The deliverable and the decision boundary",
            feedback: "Clear results and boundaries keep delegation from becoming chaos."
          },
          {
            label: "Whether they are loyal enough",
            feedback: "Loyalty is basic, but delegation still needs outcomes, authority, and checks."
          },
          {
            label: "Whether they completely agree with your approach",
            feedback: "Requiring exact replication may suppress the talent you need."
          }
        ],
        answer: 0
      }
    ]
  },
  mobilize: {
    abilityId: "mobilize",
    routeTitle: "Mobilizing Others: Turn Resistance into Shared Ownership",
    routeSummary:
      "Do not suppress opposition first. Listen for the real concern, turn it into a precondition, and invite the key person into a pilot responsibility.",
    route: [
      "Listen to the opponent's real concern",
      "Turn the concern into a plan precondition",
      "Invite the key person to own a pilot",
      "Use a shared result to realign interests",
      "Review publicly to strengthen the next mobilization"
    ],
    story: {
      title: "King Zhuang of Chu Cuts the Tassels",
      source: "Han Shi Wai Zhuan",
      scenario:
        "During a banquet, the candles went out and someone touched the queen's sleeve. She broke the man's hat tassel and asked the king to investigate. Instead, King Zhuang ordered everyone to remove their tassels before relighting the candles, protecting the offender. Years later, that man risked his life to save the king in battle.",
      lesson:
        "Mobilization is not about making people fear punishment. It is about turning potential opponents into people who owe you trust. When people feel preserved rather than punished, loyalty shows up at the moment it matters."
    },
    questions: [
      {
        id: "train-mobilize-1",
        prompt: "Your team publicly opposes a new plan. What is your first response?",
        options: [
          {
            label: "Turn the opponent's concern into a plan precondition",
            feedback: "Opposition often carries real information; absorb it before pushing."
          },
          {
            label: "Stabilize the room, then persuade key people privately",
            feedback: "Private persuasion helps, but it cannot replace public ownership."
          },
          {
            label: "Use decision authority to move forward",
            feedback: "Suppression creates compliance and distorted execution."
          }
        ],
        answer: 0
      },
      {
        id: "train-mobilize-2",
        prompt: "When team morale is low, what most effectively re-energizes people?",
        options: [
          {
            label: "Give them a winnable small goal and shared responsibility",
            feedback: "Small wins and shared ownership turn anxiety into action."
          },
          {
            label: "Publicly praise a few people",
            feedback: "Praise improves atmosphere but does not replace a shared goal."
          },
          {
            label: "Emphasize the severe consequences of failure",
            feedback: "Fear creates short-term drive and long-term trust costs."
          }
        ],
        answer: 0
      },
      {
        id: "train-mobilize-3",
        prompt: "You need two hostile departments to cooperate. What is the first step?",
        options: [
          {
            label: "Redefine the shared customer or result",
            feedback: "A shared result rewrites positions before you argue about roles."
          },
          {
            label: "Persuade each leader separately",
            feedback: "Separate persuasion can become private deals without public accountability."
          },
          {
            label: "Ask senior management to pressure them",
            feedback: "Senior pressure lets them keep pushing accountability upward."
          }
        ],
        answer: 0
      }
    ]
  },
  strategy: {
    abilityId: "strategy",
    routeTitle: "Shaping Power: Build Leverage Before Asking for Authority",
    routeSummary:
      "Before formal authority arrives, accumulate leverage with verifiable small wins while keeping the person who grants authority informed.",
    route: [
      "Identify the result the grantor truly cares about",
      "Choose a small win you can verify in two weeks",
      "Use results to expand resource boundaries",
      "Synchronize with key people on the power map",
      "Claim formal authority when momentum is sufficient"
    ],
    story: {
      title: "Zhu Sheng's Nine-Character Strategy",
      source: "History of Ming, Biography of Zhu Sheng",
      scenario:
        "When Zhu Yuanzhang asked how to win the realm, advisor Zhu Sheng proposed: build high walls, store ample grain, and delay claiming the king's title. Zhu Yuanzhang first secured defenses and supplies instead of racing for the grandest title. When strength and trust had accumulated, the broader situation shifted toward him.",
      lesson:
        "Shaping power is not about taking a title first. It is about accumulating leverage others cannot ignore: what you solved, what resources you hold, and whether key people are willing to hand you authority."
    },
    questions: [
      {
        id: "train-strategy-1",
        prompt: "You have no formal authority yet but need to move an important initiative. What do you do?",
        options: [
          {
            label: "Create a small win first, then trade it for authority",
            feedback: "Verifiable results unlock authority more reliably than requests."
          },
          {
            label: "Tell senior leaders what authority you need",
            feedback: "Clarity helps, but empty requests are easy to postpone."
          },
          {
            label: "Wait until the authority is granted",
            feedback: "Waiting too long erodes direction and credibility."
          }
        ],
        answer: 0
      },
      {
        id: "train-strategy-2",
        prompt: "What is the most persuasive way to obtain more resources?",
        options: [
          {
            label: "Show a verifiable small result first",
            feedback: "Small results prove resources will be used well."
          },
          {
            label: "Explain the expected return first",
            feedback: "Forecasts help, but unverified returns are less convincing."
          },
          {
            label: "Emphasize urgency first",
            feedback: "Urgency creates motion, not sustained resource trust."
          }
        ],
        answer: 0
      },
      {
        id: "train-strategy-3",
        prompt: "Facing a stronger competitor, which approach do you prefer?",
        options: [
          {
            label: "Find a differentiated advantage they cannot copy",
            feedback: "Do not fight in their strongest arena; build irreplaceability first."
          },
          {
            label: "Invest faster and harder than they do",
            feedback: "Burning resources on their turf rarely works."
          },
          {
            label: "Wait for them to make a mistake",
            feedback: "Waiting can be wise, but do not surrender initiative entirely."
          }
        ],
        answer: 0
      }
    ]
  },
  authority: {
    abilityId: "authority",
    routeTitle: "Holding Authority: Enforce Power with Rules",
    routeSummary:
      "Authority comes from clear, consistent, verifiable decision standards. Systems protect power longer than emotional displays do.",
    route: [
      "Define which decisions must enter a closed loop",
      "Publicly commit to one consistent standard",
      "Build credibility with one verifiable act of follow-through",
      "Bring bypassing back into process, not emotion",
      "Review whether the boundary is actually enforced"
    ],
    story: {
      title: "Shang Yang Moves the Timber",
      source: "Records of the Grand Historian, Biography of Shang Yang",
      scenario:
        "Before issuing reforms, Shang Yang placed a long timber at the south gate and promised a reward to anyone who carried it to the north gate. When someone did it, Shang Yang paid the reward immediately. From then on, the people trusted that the new laws were real.",
      lesson:
        "Holding authority is not about shouting from a position. It is about establishing credibility through rules that are consistently honored. One public act of follow-through is worth many declarations of power."
    },
    questions: [
      {
        id: "train-authority-1",
        prompt: "When you first take over a team, what should the source of authority be?",
        options: [
          {
            label: "Clear, consistent decision standards and verifiable results",
            feedback: "Standards and results make power predictable."
          },
          {
            label: "Strict work discipline",
            feedback: "Discipline matters, but without standards it can feel like control."
          },
          {
            label: "Public criticism of problem behavior",
            feedback: "Public criticism can establish authority and push the team into defense."
          }
        ],
        answer: 0
      },
      {
        id: "train-authority-2",
        prompt: "Someone makes decisions around you. What do you do?",
        options: [
          {
            label: "Use a joint approval process to redefine the boundary",
            feedback: "Process protects boundaries longer than a single conversation."
          },
          {
            label: "Talk directly and clarify the boundary",
            feedback: "The conversation is necessary, but without a mechanism it recurs."
          },
          {
            label: "Wait until they make a mistake",
            feedback: "Waiting amplifies the bypass and teaches others it works."
          }
        ],
        answer: 0
      },
      {
        id: "train-authority-3",
        prompt: "Someone publicly questions your decision. What do you do?",
        options: [
          {
            label: "Confirm the facts first, then decide whether to adjust",
            feedback: "Power needs elasticity; being right matters more than seeming right."
          },
          {
            label: "Defend the decision immediately",
            feedback: "Immediate defense can hide useful information."
          },
          {
            label: "Rebuke the questioner publicly",
            feedback: "Public rebuttal may quiet the room but suppress future input."
          }
        ],
        answer: 0
      }
    ]
  },
  stability: {
    abilityId: "stability",
    routeTitle: "Building Stability: Turn Personal Ability into Systems",
    routeSummary:
      "Stability means the organization can make high-frequency judgments without you: capture checklists, duplicate mechanisms, and mentor a successor.",
    route: [
      "Identify the organization's most frequent personal judgments",
      "Turn judgments into checklists and review libraries",
      "Use systems to harden key decision loops",
      "Give the successor a supported transition period",
      "Test resilience with a leaving test"
    ],
    story: {
      title: "Cao Can Follows Xiao He's Rules",
      source: "Records of the Grand Historian, Biography of Cao Can",
      scenario:
        "When Cao Can became prime minister after Xiao He, he did not rush to replace the old system. He continued Xiao He's laws, appointed steady officials, and allowed the people to recover. Early Han policy remained stable and gained time for recovery.",
      lesson:
        "Stability is not making the organization depend on you forever. It is making effective mechanisms independent of any one person. Power is most secure when the organization still makes good judgments after you leave."
    },
    questions: [
      {
        id: "train-stability-1",
        prompt: "When leaving your current role, what should you hand over first?",
        options: [
          {
            label: "High-frequency judgment checklists and a decision review library",
            feedback: "Judgment checklists allow experience to exist beyond one person."
          },
          {
            label: "Key clients and relationships",
            feedback: "Relationships matter, but they do not capture judgment."
          },
          {
            label: "Important documents only",
            feedback: "Documents are material; decision methods must also be transferred."
          }
        ],
        answer: 0
      },
      {
        id: "train-stability-2",
        prompt: "What is key to making the team run without you?",
        options: [
          {
            label: "Turn key decisions into reusable processes",
            feedback: "Processes replace personal reaction speed with organizational memory."
          },
          {
            label: "Develop one trusted proxy",
            feedback: "A proxy creates a new personal dependency."
          },
          {
            label: "Keep key decisions with yourself",
            feedback: "Keeping power increases risk and prevents team growth."
          }
        ],
        answer: 0
      },
      {
        id: "train-stability-3",
        prompt: "Others have learned your core capability. What do you do?",
        options: [
          {
            label: "Upgrade to a higher-order capability and teach deliberately",
            feedback: "Teaching turns capability into organizational assets and forces your own evolution."
          },
          {
            label: "Keep some critical judgment untaught",
            feedback: "Withholding blocks organizational capability."
          },
          {
            label: "Worry about being replaced",
            feedback: "Fear of replacement turns stability into defensiveness."
          }
        ],
        answer: 0
      }
    ]
  },
  recovery: {
    abilityId: "recovery",
    routeTitle: "Emotional Recovery: Manage State Before Results",
    routeSummary:
      "Recovery is not willpower. It is noticing depletion, reducing internal friction, and keeping a pace you can continue.",
    route: [
      "Notice emotion and energy signals",
      "Leave the scene and let the body cool down",
      "Find the three largest energy drains",
      "Set a recovery boundary and a minimum next action",
      "Review triggers and build a restart checklist"
    ],
    story: {
      title: "Su Shi and the Rain",
      source: "Su Shi, Ding Feng Bo",
      scenario:
        "Exiled and traveling through Huangzhou, Su Shi was caught in rain. His companions hurried to shelter while he wrote: do not listen to the sound of rain through the forest; why not walk slowly and sing. He did not pretend the rain was absent. He accepted the situation, lowered internal friction, and kept moving.",
      lesson:
        "Emotional recovery is not suppressing feeling. It is acknowledging reality, managing attention, and keeping a sustainable pace. Resilience comes from having a minimal next step, not from demanding that everything improve at once."
    },
    questions: [
      {
        id: "train-recovery-1",
        prompt: "After a week of high-intensity work, your energy clearly drops. What do you do?",
        options: [
          {
            label: "Set a recovery boundary and put important work in high-energy periods",
            feedback: "Managing energy peaks is more sustainable than pushing through."
          },
          {
            label: "Rely on willpower until the work is finished",
            feedback: "Willpower depletion degrades future decisions."
          },
          {
            label: "Reduce sleep and give all time to work",
            feedback: "Less sleep accelerates energy and judgment collapse."
          }
        ],
        answer: 0
      },
      {
        id: "train-recovery-2",
        prompt: "When you feel worst emotionally, what is most effective?",
        options: [
          {
            label: "Leave the scene and let your body and emotions cool down",
            feedback: "Physical distance interrupts the escalation loop."
          },
          {
            label: "Talk to a trusted person",
            feedback: "Talking helps, but timing and place matter."
          },
          {
            label: "Use more work to distract yourself",
            feedback: "Distraction is not recovery and can push exhaustion further."
          }
        ],
        answer: 0
      },
      {
        id: "train-recovery-3",
        prompt: "You have felt exhausted for two consecutive weeks. What do you do first?",
        options: [
          {
            label: "Check the three tasks that consume the most energy",
            feedback: "Locate the drain before choosing a recovery tactic."
          },
          {
            label: "Cut everything except sleep",
            feedback: "Total withdrawal may remove the activities that restore you."
          },
          {
            label: "Push through until the project ends",
            feedback: "Continuous depletion makes recovery take much longer."
          }
        ],
        answer: 0
      }
    ]
  },
  execution: {
    abilityId: "execution",
    routeTitle: "Execution: Turn Goals into Verifiable Results",
    routeSummary:
      "Execution is not busyness. Use key results, checkpoints, and acceptance standards so direction can be confirmed every day.",
    route: [
      "Break the big goal into three key results",
      "Cut low-value work that does not support them",
      "Assign an owner to every result",
      "Use a fixed milestone cadence",
      "Review against acceptance standards"
    ],
    story: {
      title: "Ximen Bao Governs Ye",
      source: "Records of the Grand Historian, Biographies of Jesters",
      scenario:
        "When Ximen Bao arrived in Ye, he first studied local suffering and found that river bride sacrifices were a scheme by officials and shamans. Instead of issuing only a ban, he used a public ceremony to expose the scheme, then organized people to dig canals and gradually replace old abuses with real engineering results.",
      lesson:
        "Execution breaks a complex problem into verifiable stages: establish facts, set rules, then replace old habits with delivered results. Every stage needs an owner and an acceptance standard."
    },
    questions: [
      {
        id: "train-execution-1",
        prompt: "Your quarterly goal has a large gap. What do you do first?",
        options: [
          {
            label: "Identify key results and cut low-value work",
            feedback: "Narrow the scope first so resources can focus on the most important result."
          },
          {
            label: "Have the team work overtime to chase the number",
            feedback: "Overtime without key-result calibration amplifies exhaustion."
          },
          {
            label: "Ask leadership whether the target can be lowered",
            feedback: "Adjusting targets is possible, but not the automatic first move."
          }
        ],
        answer: 0
      },
      {
        id: "train-execution-2",
        prompt: "A new task suddenly appears in your project. What do you do?",
        options: [
          {
            label: "Judge whether it affects a key result first",
            feedback: "Use key results to filter new work so the plan is not scattered."
          },
          {
            label: "Insert it into the schedule quickly so nothing is missed",
            feedback: "Inserting without priority judgment can delay the key result."
          },
          {
            label: "Handle it immediately to avoid being asked",
            feedback: "Immediate handling may sacrifice the delivery that matters most."
          }
        ],
        answer: 0
      },
      {
        id: "train-execution-3",
        prompt: "What is the most effective mechanism for keeping the team on plan?",
        options: [
          {
            label: "Fixed milestone checkpoints",
            feedback: "A fixed cadence creates more predictability than ad hoc pressure."
          },
          {
            label: "Ask for progress every day",
            feedback: "High-frequency checking consumes trust and invites formal reporting."
          },
          {
            label: "Check once before delivery",
            feedback: "Checking too late means risk cannot be recovered."
          }
        ],
        answer: 0
      }
    ]
  },
  structure: {
    abilityId: "structure",
    routeTitle: "Structured Thinking: Find the Main Contradiction",
    routeSummary:
      "For ambiguous problems, define the boundary, break out key variables, and invest where one move changes the whole system.",
    route: [
      "Write the problem definition and judgment criteria",
      "Identify key variables and causal chains",
      "Find the main contradiction and constraints",
      "Form a testable hypothesis",
      "Use a small experiment to revise the structure"
    ],
    story: {
      title: "Besiege Wei to Rescue Zhao",
      source: "Records of the Grand Historian, Biography of Sun Tzu and Wu Qi",
      scenario:
        "When Wei attacked Zhao, Zhao asked Qi for help. Sun Bin did not march directly to Handan to fight Wei's main force. He judged that Wei's elite troops were away and its capital was vulnerable, so he attacked Daliang, a place Wei had to defend. Wei was forced to withdraw and Zhao's siege was lifted.",
      lesson:
        "Structured thinking is not processing every piece of information. It is finding the main contradiction and the leverage point where one move changes the entire system."
    },
    questions: [
      {
        id: "train-structure-1",
        prompt: "When facing a problem you have never seen, how do you begin?",
        options: [
          {
            label: "Define the problem boundary, then break out key variables",
            feedback: "A clear definition turns ambiguity into an actionable structure."
          },
          {
            label: "Find a similar case and copy it",
            feedback: "Cases are useful, but different situations require verification."
          },
          {
            label: "Start trying and adjust when problems appear",
            feedback: "Unstructured trial and error burns resources and does not accumulate patterns."
          }
        ],
        answer: 0
      },
      {
        id: "train-structure-2",
        prompt: "A problem keeps recurring. What do you analyze first?",
        options: [
          {
            label: "The system conditions that cause it",
            feedback: "If system conditions do not change, single fixes will recur."
          },
          {
            label: "Who is responsible this time",
            feedback: "Accountability gives a short answer but may not repair the system."
          },
          {
            label: "How to patch the hole quickly",
            feedback: "Quick patches are fine, but continue toward the deeper cause."
          }
        ],
        answer: 0
      },
      {
        id: "train-structure-3",
        prompt: "You receive a large amount of information. What do you do first?",
        options: [
          {
            label: "Map key variables and causal chains against the goal",
            feedback: "Goals filter noise and causal chains locate leverage."
          },
          {
            label: "Organize it into a list by source",
            feedback: "A list is material, not analysis."
          },
          {
            label: "Jump to the most prominent conclusion",
            feedback: "Prominence is not importance and can be driven by availability bias."
          }
        ],
        answer: 0
      }
    ]
  },
  communication: {
    abilityId: "communication",
    routeTitle: "Collaborative Communication: Understand First, Align Second",
    routeSummary:
      "The goal is not to persuade others to accept your plan. It is to help everyone redefine the shared goal, ownership, and deadline together.",
    route: [
      "Restate the other side's concern to confirm understanding",
      "Trace disagreement back to a shared customer or result",
      "Use questions instead of conclusions",
      "Agree on goal, owner, and checkpoints together",
      "Lock the agreement in a one-page note"
    ],
    story: {
      title: "Chu Long Persuades Queen Dowager Zhao",
      source: "Strategies of the Warring States, Zhao IV",
      scenario:
        "When Qin attacked Zhao, Qi agreed to help only if Zhao sent the queen's son as a hostage. The queen refused every minister's plea. Chu Long did not argue directly. He first talked about family matters, then led her to see that truly loving a child means planning for the child's long-term future. The queen finally accepted the arrangement and Qi sent troops.",
      lesson:
        "Collaborative communication is not rushing to output a solution. Restate the other person's concern, find shared interests, and let them help redefine the goal. People listen when they feel understood."
    },
    questions: [
      {
        id: "train-communication-1",
        prompt: "A cross-functional meeting is stuck in argument. How do you speak?",
        options: [
          {
            label: "Restate both sides' concerns, then redefine the shared goal",
            feedback: "Restating lowers defenses and a shared goal turns argument into collaboration."
          },
          {
            label: "Propose your plan and ask everyone to cooperate",
            feedback: "Leading with a solution can make sides defend their positions."
          },
          {
            label: "Stay silent and handle it privately later",
            feedback: "Private handling has room, but public divergence still needs alignment."
          }
        ],
        answer: 0
      },
      {
        id: "train-communication-2",
        prompt: "Someone clearly misunderstands you. What do you do?",
        options: [
          {
            label: "Restate their understanding, then add the missing information",
            feedback: "First confirm what they heard; then add information effectively."
          },
          {
            label: "Repeat your point in more detail",
            feedback: "Repeating may deepen the misunderstanding because volume is not the issue."
          },
          {
            label: "Have a third party relay it again",
            feedback: "A third party adds distortion and weakens direct trust."
          }
        ],
        answer: 0
      },
      {
        id: "train-communication-3",
        prompt: "A cross-functional meeting is short on time. What do you align first?",
        options: [
          {
            label: "Shared goal, owner, and deadline",
            feedback: "Lock the action consensus first; details can follow."
          },
          {
            label: "Each department's difficulties and requests",
            feedback: "Listening is necessary, but it cannot replace action consensus."
          },
          {
            label: "Details of the final solution",
            feedback: "Fighting over details before goal and ownership risks no alignment at all."
          }
        ],
        answer: 0
      }
    ]
  }
};
