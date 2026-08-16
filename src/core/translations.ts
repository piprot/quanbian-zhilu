import type {
  AbilityId,
  OptionQuality,
  ResourceKey,
  RoleId
} from "./types";
import {
  EXTRA_MAIN_EN,
  EXTRA_MAIN_THEORY_EN
} from "./mainScenarios.ts";
import { BRANCH_ROLE_CONTEXT_EN } from "./branchDetails.ts";

export const CHAPTER_EN: Record<
  number,
  { title: string; subtitle: string }
> = {
  1: { title: "Diagnose", subtitle: "Look before you act" },
  2: { title: "Build Power", subtitle: "Create leverage before authority arrives" },
  3: { title: "Deploy People", subtitle: "Put the right people in the right places" },
  4: { title: "Mobilize", subtitle: "Make reluctant people move together" },
  5: { title: "Execute", subtitle: "Turn decisions into verifiable results" },
  6: { title: "Hold Power", subtitle: "Protect authority with systems" },
  7: { title: "Stabilize", subtitle: "Make the organization independent of any one person" },
  8: { title: "Break Through", subtitle: "Adjust quickly under uncertainty" },
  9: { title: "Legacy", subtitle: "Make success continue after you leave" }
};

export const ABILITY_EN: Record<
  AbilityId,
  { name: string; tagline: string }
> = {
  insight: { name: "Reading People", tagline: "Understand people before you understand the situation" },
  deploy: { name: "Placing People", tagline: "Match capability to role with evidence" },
  mobilize: { name: "Mobilizing Others", tagline: "Turn resistance into shared ownership" },
  strategy: { name: "Shaping Power", tagline: "Build leverage before you demand authority" },
  authority: { name: "Holding Authority", tagline: "Use power to create results" },
  stability: { name: "Building Stability", tagline: "Turn personal influence into organizational capability" },
  recovery: { name: "Emotional Recovery", tagline: "Manage energy before you manage outcomes" },
  execution: { name: "Execution", tagline: "Break goals into verifiable results" },
  structure: { name: "Structured Thinking", tagline: "Solve problems by defining the real question" },
  communication: { name: "Collaborative Communication", tagline: "Align language, decisions, and ownership" }
};

export const ROLE_EN: Record<
  RoleId,
  {
    name: string;
    shortName: string;
    lens: string;
    objective: string;
    description: string;
  }
> = {
  parachute: {
    name: "New Executive",
    shortName: "Executive",
    lens: "As a new executive, you must first map the real power structure and build credibility quickly.",
    objective: "Turn from outsider into institution builder within 90 days.",
    description:
      "Enter an unfamiliar organization and build trust, identify key people, and complete your first change within 90 days."
  },
  founder: {
    name: "Founder",
    shortName: "Founder",
    lens: "As a founder, you must build influence through cash flow and verifiable results, not formal authority.",
    objective: "Survive first, then convert founder instincts into organizational capability.",
    description:
      "Move fast in resource-constrained chaos, protect cash flow, and turn founder instincts into organizational capability."
  },
  highPotential: {
    name: "High-Potential Talent",
    shortName: "High-Potential",
    lens: "Without positional power, you must move others through expertise, relationships, and structured thinking.",
    objective: "Build cross-functional influence without formal authority.",
    description:
      "Drive cross-functional collaboration through expertise, relationships, and structured thinking without positional power."
  }
};

export const RESOURCE_EN: Record<ResourceKey, string> = {
  energy: "Energy",
  trust: "Trust",
  influence: "Influence",
  capital: "Capital"
};

export const MAIN_NODE_EN: Record<
  string,
  { title: string; context: string; stake: string }
> = {
  c1n1: {
    title: "First Week",
    context:
      "You take over a division that has declined for two quarters. Your predecessor leaves one sentence: “The team will cooperate.” Financial data, client lists, and project status never arrive. The CEO tells you there will be no second ninety days.",
    stake: "You have two weeks to build trust and three to gather facts; who you see first decides whether the information gap opens or closes."
  },
  c1n2: {
    title: "Lunchroom Intel",
    context:
      "At lunch, the administrative lead quietly mentions that last quarter's outsourcing contract was never archived. The budget table carries two signatures, but the deliverables cannot be found. At two o'clock, the finance manager asks for a meeting.",
    stake: "The clue is enough to suspect but not enough to conclude; whether you investigate, ask, or file it first shapes the first round of trust."
  },
  c2n1: {
    title: "Authority Gap",
    context:
      "After the reorganization, your direct manager moves to a new business. The project is nominally yours, but budgets, headcount, and supplier contracts remain stuck in the old process. The CEO says: start first and authority will follow.",
    stake: "In this undefined window, whether you win a small victory first or fight for the title decides whether the team follows you."
  },
  c2n2: {
    title: "First All-Hands",
    context:
      "Your first all-hands is scheduled for Friday afternoon. Before you finish explaining the current state, a veteran challenges you: “We tried this three years ago and it died.” The room goes quiet and waits for your response.",
    stake: "The real outcome is not the minutes; it is whether the team puts true information on your table next week."
  },
  c3n1: {
    title: "Restructuring List",
    context:
      "You must submit a list reducing the team from 30 to 22. One person has strong ability but weak loyalty, another has the client but mixed results.",
    stake: "Decide whether to restructure around future roles or around loyalty."
  },
  c3n2: {
    title: "Firefighter Trap",
    context:
      "The team keeps pushing every problem to you. A young high performer can solve most issues but waits for your approval.",
    stake: "Decide whether to keep controlling delivery or return the work to the team."
  },
  c4n1: {
    title: "Public Opposition",
    context:
      "A senior operations leader publicly opposes your new process. His concerns are real, and his network is strong.",
    stake: "Decide how to turn opposition into ownership without losing the change."
  },
  c4n2: {
    title: "Cross-Functional Deadlock",
    context:
      "Product, sales, and engineering blame each other while a client project remains stuck. You have no direct authority over two of the teams.",
    stake: "Decide how to align teams you cannot command."
  },
  c5n1: {
    title: "Goal Decomposition",
    context:
      "You receive a revenue-doubling target with no clear path. The team nods but nobody knows what to do tomorrow.",
    stake: "Decide how to turn the target into checkable responsibilities."
  },
  c5n2: {
    title: "Quarter-End Sprint",
    context:
      "Fifteen days remain and the goal gap is 30%. The team is already exhausted and some people expect failure.",
    stake: "Decide how to close the gap without destroying the team."
  },
  c6n1: {
    title: "Being Bypassed",
    context:
      "The CFO and sales VP start making decisions around you. Your approvals are treated as references rather than requirements.",
    stake: "Decide how to reclaim decision authority without public confrontation."
  },
  c6n2: {
    title: "Skipping the Chain",
    context:
      "A core subordinate starts reporting directly to the CEO and misrepresents your decisions. The team notices.",
    stake: "Decide how to handle it without seeming insecure."
  },
  c7n1: {
    title: "Succession Choice",
    context:
      "You are being promoted and must name a successor. One candidate is capable but distant; the other is loyal but less proven.",
    stake: "Decide whether to prioritize capability or continuity."
  },
  c7n2: {
    title: "Institutionalizing",
    context:
      "Many of your best judgments live only in your head. When you travel, the team returns to old habits.",
    stake: "Decide how to convert personal expertise into organizational capability."
  },
  c8n1: {
    title: "Cash Flow Crisis",
    context:
      "Finance tells you payroll is at risk in 30 days after your largest client freezes payment without explanation.",
    stake: "Decide how to stabilize the company in 48 hours."
  },
  c8n2: {
    title: "Losing a Key Client",
    context:
      "Your star salesperson leaves with a core client, who says they were not stolen but worn down by weak service.",
    stake: "Decide how to handle the client, the team, and the systemic failure."
  },
  c9n1: {
    title: "Success and Exit",
    context:
      "Your reform worked. The CEO wants you at a higher level, but you know leaving too early will create a gap.",
    stake: "Decide how to let success continue after you leave."
  },
  c9n2: {
    title: "The Last Decision",
    context:
      "Before you leave, you must decide whether to keep funding a risky but promising innovation project that has burned cash for eight months.",
    stake: "Decide what to leave behind: a conclusion or a decision method."
  },
  ...EXTRA_MAIN_EN
};

export const MAIN_NODE_THEORY_EN: Record<string, string[]> = {
  c1n1: [
    "The Record of Characters: watch how people trade off in different situations to see their real motives.",
    "The Art of War: first make yourself invincible, then wait for the enemy to become vincible.",
    "The Book of Power: authority is granted by people; granting it well is the greater art."
  ],
  c1n2: [
    "On Practice: only by moving from perceptual materials to rational knowledge can you grasp the essence.",
    "The Analects: do not worry that others do not know you; worry that you do not know others.",
    "Guiguzi: assess the situation and timing before moving."
  ],
  c2n1: [
    "The Book of Power: winning support comes before claiming merit; authority is granted by people.",
    "Machiavelli: power comes from others' dependence on you.",
    "The Art of War: the skilled commander first makes himself invincible."
  ],
  c2n2: [
    "Methods of Work in Party Committees: be a student before becoming a teacher.",
    "The Art of War: unite people with civility and discipline them with martial order.",
    "Han Feizi: matters succeed through secrecy and fail through leakage."
  ],
  c3n1: [
    "Zhenguan Essentials: without the right talent, governance is hard; use strengths and set aside weaknesses.",
    "Zizhi Tongjian: ability is the resource of virtue; virtue is the commander of ability.",
    "Han Feizi on Personnel: keep duties separate and posts non-overlapping."
  ],
  c3n2: [
    "The Book of Power: delegate to capable and loyal people; power exists to be used, not enlarged.",
    "The Effective Executive: managers must spend time on genuinely important decisions.",
    "The Analects: a leader earns trust before asking people to labor."
  ],
  c4n1: [
    "The Art of War: when superiors and subordinates share intent, victory follows; the Analects: promote the upright and the people submit.",
    "Han Feizi: law, power, and technique must work together, but cannot replace people's hearts.",
    "The Art of War: invincibility lies in yourself; victory depends on the enemy."
  ],
  c4n2: [
    "Drucker: management is making ordinary people produce extraordinary results.",
    "The Art of War: make the opponent come to you, not the reverse.",
    "Zizhi Tongjian: give credit to the wise and capable to preserve unity."
  ],
  c5n1: [
    "The Effective Executive: put first things first and concentrate resources on a few truly important tasks.",
    "The Art of War: speed and victory matter more than prolonged campaigns.",
    "On Contradiction: seize the principal contradiction and other problems can be resolved."
  ],
  c5n2: [
    "Drucker: a manager's results are not how much work was done, but how many important things were done right.",
    "The 7 Habits: focus on your circle of influence instead of exhausting yourself.",
    "The Book of Power: power exists to be used, not enlarged."
  ],
  c6n1: [
    "Han Feizi: once rules are established, even an ordinary ruler can govern.",
    "The Book of Power: authority is granted by people; granting it well is the greater art.",
    "The Art of War: first make yourself invincible, then wait for the enemy to become vincible."
  ],
  c6n2: [
    "Methods of Work in Party Committees: share intelligence to create common language.",
    "The Art of War: discipline with martial order, but also unite with civility.",
    "Zizhi Tongjian: prevent problems before they grow; stop cracks before storms destroy the wall."
  ],
  c7n1: [
    "Sima Guang: humility is also magnanimity; give credit to the wise and capable.",
    "Zhenguan Essentials: without the right talent, governance is hard.",
    "Han Feizi on Personnel: the wise ruler lets the intelligent exhaust their judgment."
  ],
  c7n2: [
    "Methods of Work in Party Committees: institutionalize and use democratic centralism rather than relying on one person.",
    "The Book of Power: delegate to capable and loyal people.",
    "Zhenguan Essentials: start well and end cautiously; founding is hard, but preserving is harder."
  ],
  c8n1: [
    "On Contradiction: seize the principal contradiction and other contradictions can be moved.",
    "The Art of War: when superiors and subordinates share intent, victory follows.",
    "The Book of Power: authority is granted by people; but those controlled by others cannot act independently."
  ],
  c8n2: [
    "On Practice: mistakes often precede correct understanding; the key is finding the pattern in failure.",
    "Han Feizi: make rewards and punishments clear, but unjust punishment makes people unafraid.",
    "The Art of War: the skilled commander first makes himself invincible."
  ],
  c9n1: [
    "Zizhi Tongjian: humility is magnanimity; Zhenguan Essentials: start well and end cautiously.",
    "The Art of War: when the general is capable and the ruler does not interfere, victory follows.",
    "The Book of Power: power exists to be used, not enlarged."
  ],
  c9n2: [
    "On Contradiction: contradictions of different natures must be solved with methods of different natures.",
    "The Art of War: the skilled commander first makes himself invincible.",
    "Zhenguan Essentials: founding is hard, but preserving is harder; the key is sustained responsibility."
  ],
  ...EXTRA_MAIN_THEORY_EN
};

export const ROLE_OPTION_EN: Record<
  RoleId,
  Record<
    OptionQuality,
    Array<{ label: string; summary: string; feedback: string }>
  >
> = {
  parachute: {
    expert: [
      {
        label: "Map power first, then act publicly",
        summary: "Interview key people and record who truly decides.",
        feedback:
          "You turned an unfamiliar organization into a power map before acting, and key people began sharing real information."
      },
      {
        label: "Win a small verifiable battle first",
        summary: "Deliver a 14-day result to earn authority.",
        feedback:
          "Instead of waiting for authority, you used a visible win to change how the organization sees you."
      },
      {
        label: "Interview key people before changing process",
        summary: "Repair trust before redesigning systems.",
        feedback:
          "You listened before changing rules, and the real resistance behind the data gap began to surface."
      }
    ],
    partial: [
      {
        label: "Establish authority first, repair trust later",
        summary: "Show management strength, then rebuild relationships.",
        feedback:
          "You created authority but pushed parts of the team into defense. Trust still needs repair."
      },
      {
        label: "Deliver first, manage relationships later",
        summary: "Protect business results before fixing relations.",
        feedback:
          "Results held, but unresolved concerns will create hidden resistance later."
      },
      {
        label: "Get executive backing first",
        summary: "Turn CEO support into public authorization.",
        feedback:
          "You gained top-down support, but the team still may not follow voluntarily."
      }
    ],
    risk: [
      {
        label: "Set hard boundaries without waiting for consensus",
        summary: "Make expectations clear immediately.",
        feedback:
          "You clarified boundaries fast, but real concerns may have gone underground."
      },
      {
        label: "Push around resistance",
        summary: "Act first and force results later.",
        feedback:
          "You bypassed resistance, but opponents may now organize more tightly."
      },
      {
        label: "Use personnel action to break the deadlock",
        summary: "Change key roles to create a turning point.",
        feedback:
          "The move created change, but the team now fears who will be next."
      }
    ]
  },
  founder: {
    expert: [
      {
        label: "Validate cash flow before investing more",
        summary: "Run a 48-hour cash verification first.",
        feedback:
          "You refused to be captured by vision and let cash evidence decide where resources go."
      },
      {
        label: "Prove the smallest closed loop first",
        summary: "Validate one complete commercial loop.",
        feedback:
          "You turned a vague startup problem into a concrete loop the team could execute."
      },
      {
        label: "Lock the key customer before fixing structure",
        summary: "Secure cash-generating relationships first.",
        feedback:
          "You prioritized survival, stabilized the key customer, and created room to fix the organization."
      }
    ],
    partial: [
      {
        label: "Protect delivery first, add systems later",
        summary: "Keep current business moving before reorganizing.",
        feedback:
          "Delivery held, but the missing system will resurface during the next expansion."
      },
      {
        label: "Push business first, fix internal friction later",
        summary: "Defer internal conflict and chase growth.",
        feedback:
          "Business moved faster, but internal friction is consuming the gains."
      },
      {
        label: "Get investor support before changing direction",
        summary: "Let external resources lead the internal shift.",
        feedback:
          "You secured external support, but the team may feel the direction came from investors."
      }
    ],
    risk: [
      {
        label: "Force the decision as founder",
        summary: "Move on your judgment without consensus.",
        feedback:
          "You moved fast, but the team may obey without understanding why."
      },
      {
        label: "Bet on a new direction quickly",
        summary: "Choose a bigger opportunity under uncertainty.",
        feedback:
          "You showed founder decisiveness, but this bet needs a validation checkpoint."
      },
      {
        label: "Cut the old business to fund transformation",
        summary: "Use radical pruning to free resources.",
        feedback:
          "Resources were freed, but customers and the team lost safety during the transition."
      }
    ]
  },
  highPotential: {
    expert: [
      {
        label: "Build horizontal consensus before deciding",
        summary: "Align key people and turn the plan into shared ownership.",
        feedback:
          "You let every key person see their responsibility and gain, so execution became shared."
      },
      {
        label: "Use evidence to influence decisions",
        summary: "Reduce perceived risk with data and examples.",
        feedback:
          "You replaced debate with evidence, and decision makers began trusting your judgment."
      },
      {
        label: "Align key people before presenting the plan",
        summary: "Remove hidden resistance before the formal proposal.",
        feedback:
          "Your proposal no longer felt like an ambush; it felt like a decision people had already joined."
      }
    ],
    partial: [
      {
        label: "Win a few key supporters first",
        summary: "Get initial sponsorship before broad execution.",
        feedback:
          "You gained support, but people excluded from the process still resist."
      },
      {
        label: "Protect the project before repairing relations",
        summary: "Keep delivery alive and fix collaboration later.",
        feedback:
          "The project survived, but department resentment will make the next collaboration harder."
      },
      {
        label: "Borrow resources to push execution",
        summary: "Use other people's resources to make progress.",
        feedback:
          "You borrowed resources, but ownership disappears when the relationship cools."
      }
    ],
    risk: [
      {
        label: "Escalate and bypass department resistance",
        summary: "Let higher authority break the horizontal deadlock.",
        feedback:
          "You moved fast, but department leaders now treat you as someone who goes around them."
      },
      {
        label: "Surface the conflict publicly",
        summary: "Force the organization to respond.",
        feedback:
          "The problem became visible, but you now need a concrete executable solution."
      },
      {
        label: "Use data to challenge the existing plan",
        summary: "Let facts put pressure on current decision makers.",
        feedback:
          "The data was strong, but the challenge made decision makers defensive."
      }
    ]
  }
};

export const SIDE_NODE_EN: Record<
  string,
  {
    title: string;
    context: string;
    stake: string;
    intel: string[];
    options: Array<{
      label: string;
      summary: string;
      feedback: string;
      theory: string;
    }>;
  }
> = {
  s1: {
    title: "Calming a Crisis",
    context:
      "A core employee was just publicly humiliated by a client and returned to their desk pale. You happen to pass by, but they do not ask for help.",
    stake: "A sentence or two from you may decide whether they can continue working today.",
    intel: [
      "After the client's humiliation, this employee has skipped the team retrospective three times in a row.",
      "They submitted a high-quality improvement proposal yesterday."
    ],
    options: [
      {
        label: "Invite them into a meeting room and offer water",
        summary: "Do not judge or advise; let them speak the emotion out first.",
        feedback:
          "You let the emotion land first. After recovering, they voluntarily reviewed the client incident and proposed a process improvement.",
        theory:
          "The 7 Habits: seek first to understand, then to be understood."
      },
      {
        label: "Defend them on the spot",
        summary: "Explain on their behalf so the employee knows you will protect them.",
        feedback:
          "Your protection earned gratitude, but they did not learn to handle the next humiliation. Protecting once is rescue, not growth.",
        theory:
          "The Art of War: unite people with civility and discipline them with martial order."
      },
      {
        label: "Pretend not to notice",
        summary: "Respect their pride and step in only if they speak first.",
        feedback:
          "You avoided their embarrassment, but isolation amplifies collapse. Silence is remembered in a key moment.",
        theory:
          "The Analects: a leader helps others complete what is good, not what is harmful."
      }
    ]
  },
  s2: {
    title: "New Hire Onboarding",
    context:
      "A new management trainee proposed a seemingly naive idea in their first week and was laughed at by senior colleagues. They are still revising the proposal after work.",
    stake: "How do you treat someone still learning how to express themselves?",
    intel: [
      "The trainee's proposal contains a real scenario the older team has overlooked.",
      "Their mentor is watching how you handle public challenge."
    ],
    options: [
      {
        label: "Let them finish, then teach structure",
        summary:
          "Give them ten minutes to express fully, then use questions to add background and evidence.",
        feedback:
          "You protected the courage to speak and taught professional expression. They later became the person most willing to propose new ideas.",
        theory: "Drucker: build on people's strengths, not their weaknesses."
      },
      {
        label: "Have them learn internal process privately",
        summary:
          "Remind them to understand company rules before making suggestions.",
        feedback:
          "You pulled them back into process, but may have suppressed their willingness to bring a new perspective.",
        theory:
          "Zhenguan Essentials: set aside weaknesses and use strengths."
      },
      {
        label: "Do not take a position",
        summary:
          "Let the team naturally filter immature expression and avoid special treatment.",
        feedback:
          "Your silence was read as approval of the laughter. A high-potential employee may stop speaking.",
        theory:
          "The Record of Characters: observe behavior to judge character and inspect change to see nature."
      }
    ]
  },
  s3: {
    title: "Late-Night Review",
    context:
      "After handling three conflicts today, you get home at 11 p.m. and work messages are still arriving. Tomorrow is an important client proposal.",
    stake: "How do you protect your energy without abandoning responsibility to the team?",
    intel: [
      "The proposal client cares most about decision quality, not response speed.",
      "The client you will meet tomorrow received a competitor's proposal in the middle of the night."
    ],
    options: [
      {
        label: "Set a 30-minute phone boundary",
        summary:
          "Hand the phone to family, do a short breathing exercise, and process messages at 6 a.m.",
        feedback:
          "You did not define responsibility as constant availability. The recovered proposal was worth more than a midnight reply.",
        theory:
          "The 7 Habits: do important but non-urgent work first and protect production capacity."
      },
      {
        label: "Reply to every message",
        summary:
          "Make sure the team has no open questions tomorrow before resting.",
        feedback:
          "The team felt your responsibility, but your energy was fragmented. Long term, you become the new bottleneck.",
        theory: "The Effective Executive: time is the scarcest resource."
      },
      {
        label: "Ask colleagues to work tomorrow too",
        summary:
          "Gather core members for an early meeting and turn pressure into team action.",
        feedback:
          "You spread anxiety without giving clear priorities. Collective exhaustion is not collective execution.",
        theory:
          "The Art of War: shared intent wins, but shared intent is not shared burnout."
      }
    ]
  },
  s4: {
    title: "Silence at the Negotiation Table",
    context:
      "You are accompanying the sales lead to see a key client. The client suddenly asks about a failed project at your previous company. The room goes quiet as everyone waits for your response.",
    stake:
      "One sentence can save the deal or hand the team the loss of negotiation initiative.",
    intel: [
      "What the client really needs to confirm today is whether you are still worth trusting.",
      "The sales lead has privately promised a delivery date that the team has not confirmed."
    ],
    options: [
      {
        label: "Own the failure and explain the transferable method",
        summary:
          "Do not avoid the past; turn the lesson into delivery assurance the client cares about.",
        feedback:
          "You were neither defensive nor performatively sincere. The client saw that you extract reusable methods from failure, and the sales lead quietly relaxed.",
        theory:
          "On Practice: mistakes are often the forerunner of correct understanding; the key is finding the pattern in failure."
      },
      {
        label: "Push the problem to the sales lead",
        summary:
          "Hint that this was a team execution issue and unrelated to you.",
        feedback:
          "You protected your image but broke team consistency in front of the client. Even if the deal closes, trust has already been discounted.",
        theory: "The Art of War: shared intent wins."
      },
      {
        label: "Avoid the question and change the subject",
        summary:
          "Move past the silence by raising a topic the client cares more about.",
        feedback:
          "You temporarily avoided awkwardness, but the client remembers you did not answer directly. Avoidance is itself an answer.",
        theory:
          "The Book of Power: reading the situation is primary and action secondary, but you must not lose credibility."
      }
    ]
  },
  s5: {
    title: "Weekend Delivery Crisis",
    context:
      "On Saturday night, a serious data error appears in a key project, and the client needs a demo Monday morning. Core team members have not rested for two weeks.",
    stake: "Do you fix it overnight or tell the client about the risk first?",
    intel: [
      "The data error only affects two reports in the demo module.",
      "What the client really wants to see Monday is the decision logic, not every feature."
    ],
    options: [
      {
        label: "Isolate the error scope before deciding on overtime",
        summary:
          "Use 30 minutes to confirm impact and keep only the necessary people working.",
        feedback:
          "You did not make everyone work blindly; you narrowed the problem first. The team saw you using structure to protect their energy.",
        theory:
          "On Contradiction: seize the principal contradiction and other problems can be resolved."
      },
      {
        label: "Put the whole team online immediately",
        summary:
          "Fix the error first and deal with everything else after the demo.",
        feedback:
          "The problem may be fixed, but the risk of sustained overtime will erupt next quarter. You are not managing energy; you are borrowing from the future.",
        theory: "The Effective Executive: time is the scarcest resource."
      },
      {
        label: "Bring the risk to the meeting Monday",
        summary:
          "Do not make emergency fixes; tell the client the full truth.",
        feedback:
          "Honesty deserves credit, but you could have contained the error over the weekend. Bringing only risk makes the client doubt execution.",
        theory: "The Art of War: first make yourself invincible."
      }
    ]
  },
  s6: {
    title: "The Moment the Team Breaks",
    context:
      "After repeated business setbacks, core members start blaming each other in the retrospective. Someone offers to resign; others blame you for the failure.",
    stake:
      "Can you rebuild trust in each other and the goal before emotions collapse?",
    intel: [
      "The person offering to resign is not the most disappointed; the most silent person is.",
      "The team submitted a risk warning last week that was not taken seriously."
    ],
    options: [
      {
        label: "Stop the blame and reset the retrospective rules",
        summary:
          "Shift the discussion from who is wrong to what we can learn.",
        feedback:
          "You did not rush to take blame or find a scapegoat. You changed the structure of the discussion, and the team began treating failure as shared material.",
        theory:
          "Methods of Work in Party Committees: be a student before becoming a teacher."
      },
      {
        label: "Take all responsibility alone",
        summary:
          "Accept every failure yourself so the team stops fighting.",
        feedback:
          "The team quieted down, but they did not learn to face failure. Taking too much blame also makes the real problem disappear.",
        theory:
          "The Analects: the gentleman seeks causes in himself; the petty person seeks them in others."
      },
      {
        label: "Publicly criticize the loudest opponent",
        summary:
          "Use pressure to make the team obey before discussing next steps.",
        feedback:
          "You controlled the room but split the team into smaller camps. The next failure, no one will speak first.",
        theory:
          "The Art of War: unite with civility and discipline with martial order, but both must work together."
      }
    ]
  },
  s7: {
    title: "Challenge in the Leadership Chat",
    context:
      "A core subordinate publicly questions your data basis in the leadership chat and directly mentions the CEO. Your review shows that about 30% of the challenge is valid, but the error has been amplified into a decision failure.",
    stake: "Pressing down looks defensive, staying silent makes the challenge the default conclusion; put facts and rules back on the table.",
    intel: [
      "The subordinate raised the same risk twice in weekly reports before going over your head.",
      "The CEO cares about whether information is transparent, not who reports first."
    ],
    options: [
      {
        label: "Align the decision loop first, then talk privately",
        summary:
          "Treat it as a process problem: key decisions must enter a joint mechanism, then explain the boundary in private.",
        feedback:
          "You did not turn the conflict into choosing sides. Everyone saw that bypassing process costs collaboration and following it earns trust.",
        theory:
          "The Book of Power: use authority with limits, delegate with capability, control proactively, and win before fighting."
      },
      {
        label: "Reject and warn on the spot",
        summary:
          "Correct them publicly in the executive meeting to establish that bypassing is unacceptable.",
        feedback:
          "Authority held, but the subordinate started hiding real information. Bypassing reports decreased while bypassing decisions increased.",
        theory: "The Art of War: control others without being controlled."
      },
      {
        label: "Stay silent and observe",
        summary:
          "Hold off and first collect the real motive behind the bypassing reports.",
        feedback:
          "Silence was read as permission. The team began going around you directly, and the power boundary collapsed while you watched.",
        theory: "The Ghost Valley: assess the situation before acting."
      }
    ]
  },
  s8: {
    title: "Act First, Ask Later",
    context:
      "A department head has already signed a cooperation intent with a supplier on behalf of the company. The client and finance received emails; you learned about it last. The contract is unsigned, but the other side is already moving forward.",
    stake: "You must address the unauthorized action without denying an opportunity that may genuinely benefit the organization.",
    intel: [
      "Two of this leader's past proposals were genuinely blocked by process.",
      "The investor's attitude depends on whether someone is willing to own the risk."
    ],
    options: [
      {
        label: "Bring the proposal into formal review",
        summary:
          "Recognize the value of the idea while requiring budget and risk review, returning power to the mechanism.",
        feedback:
          "You did not reject the person; everyone saw that a good proposal must pass the same rules. The leader became a defender of the process.",
        theory:
          "The Book of Power: authority is granted by people; guard its boundaries with institutions."
      },
      {
        label: "Cancel the partnership directly",
        summary:
          "Use veto power to prove who is in charge and avoid being sidelined.",
        feedback:
          "The proposal stopped, but the organization remembers that you replace rules with vetoes. The next coalition will be more hidden.",
        theory:
          "Han Feizi: law, tactics, and power must work together; force cannot replace institutions."
      },
      {
        label: "Let the CEO decide",
        summary:
          "Escalate the boundary problem to avoid involving yourself in politics.",
        feedback:
          "You escaped short-term risk, but leadership remembers that you cannot hold boundaries horizontally.",
        theory:
          "Comprehensive Mirror: credit others to keep the team united."
      }
    ]
  },
  s9: {
    title: "Handoff Day",
    context:
      "In your final week before promotion, system permissions have been partially transferred. Client visit records, supplier contacts, and historical decision reasons are scattered across three places, and your successor cannot even decide which email to answer first.",
    stake: "Handoff is not handing over accounts; it is enabling your successor to reproduce the high-frequency judgments you make every week.",
    intel: [
      "The last three key decisions only started after your personal confirmation.",
      "Your successor finished basic process training but lacks real-case practice."
    ],
    options: [
      {
        label: "Build a decision handbook and run a handoff drill",
        summary:
          "Turn frequent judgments into checklists and let the successor practice with real cases and acceptance criteria.",
        feedback:
          "After you left, the team completed a full decision without you for the first time. Experience became process, and authority became capability.",
        theory:
          "The Effective Executive: leaders must invest time in genuinely important decisions."
      },
      {
        label: "Only mentor one key assistant",
        summary:
          "Pick one person to shadow relationships and process closely to lower short-term risk.",
        feedback:
          "Single-point backup solved today's problem, but the organization still depends on one key person. The gap only changed its name.",
        theory:
          "Zhenguan Essentials: without the right talent, governance is hard."
      },
      {
        label: "Leave the problem to the successor",
        summary:
          "Trust the organization to adapt naturally and focus on your new role.",
        feedback:
          "Before the new role stabilized, the old business lost momentum. You won the promotion; the organization paid the price.",
        theory: "The Art of War: first make yourself invincible."
      }
    ]
  }
};

export const SIDE_ARC_EN: Record<
  string,
  { title: string; summary: string; intro: string; conclusion: string }
> = {
  trust_rebuild: {
    title: "Rebuilding Trust",
    summary:
      "Keep human warmth under high-pressure management and turn one act of help into long-term team trust.",
    intro:
      "You have decided not to build authority only through systems and results, but also to handle people's emotions, courage, and dignity. This arc tests whether you can turn goodwill into sustainable organizational relationships.",
    conclusion:
      "When the team begins to believe you will not disappear in a key moment, their loyalty stops being obedience to power and becomes commitment to a shared goal."
  },
  resilience: {
    title: "Resilient Organization",
    summary:
      "Under pressure, exhaustion, and repeated failure, build a team that protects capacity and survives crises.",
    intro:
      "Execution is not only sprinting; it is knowing when to protect energy, when to narrow the problem, and when to rebuild the team. This arc takes you from personal firefighting to organizational resilience.",
    conclusion:
      "When the team can isolate risk first and then review together instead of blaming each other, you have built an execution system that does not depend on you."
  },
  power_boundaries: {
    title: "Power Boundaries",
    summary:
      "Between bypassing reports, circumventing decisions, and handoff gaps, turn personal authority into repeatable organizational rules.",
    intro:
      "Power does not stabilize by title alone; it must be seen, bounded, and handed over. This arc tests whether you can hold boundaries between institutions and trust instead of patching every gap with a private conversation.",
    conclusion:
      "When key decisions return to process and key information stops depending on one person, your authority becomes organizational capability."
  }
};

export const BRANCH_NODE_EN: Record<
  string,
  { title: string; context: string; stake: string }
> = {
  "c1b-parachute": {
    title: "Power Map",
    context:
      "You chose to build a power map first. The administrative lead is willing to cooperate, but the finance manager keeps distance. You need to decide who becomes your first alliance.",
    stake: "Turn your first round of interviews into a credible alliance foundation."
  },
  "c1b-founder": {
    title: "Cash Flow Minimum Validation",
    context:
      "You chose to build trust through interviews, but founder instinct reminds you that without cash-flow validation the team will only keep burning energy.",
    stake: "Find the first verifiable breakthrough between trust and cash flow."
  },
  "c1b-highPotential": {
    title: "Horizontal Consensus Session",
    context:
      "Without a formal appointment, you decided to build horizontal consensus through interviews. Now you need to turn that consensus into a plan every department recognizes.",
    stake: "Make every department feel it participated rather than being notified."
  },
  "c2b-parachute": {
    title: "New Executive: First Choice in an Authority Vacuum",
    context:
      "As a new executive without formal authority, you decided to win a small result first. The team is watching where you place your first commitment.",
    stake: "Show leadership that you can build judgment order without a title."
  },
  "c2b-founder": {
    title: "Founder: First Choice in an Authority Vacuum",
    context:
      "As a founder without clear organizational authority, you decided to validate cash flow first. The team is waiting for your first executable direction.",
    stake: "Help the team believe you can find a path even without a complete system."
  },
  "c2b-highPotential": {
    title: "High-Potential: First Choice in an Authority Vacuum",
    context:
      "Without a formal appointment, you decided to build horizontal consensus. Departments are waiting for you to prove the project deserves their time.",
    stake: "Make key people willing to invest time in someone without a title."
  },
  "c3b-parachute": {
    title: "New Executive: First Move in Talent Placement",
    context:
      "As a new executive, you begin restructuring key roles. The team's biggest worry is whether you will replace capability with loyalty.",
    stake: "Your first people move becomes the sample for future rules."
  },
  "c3b-founder": {
    title: "Founder: First Move in Talent Placement",
    context:
      "As a founder, you begin restructuring the team. The person the company depends on controls core clients but lacks management capability.",
    stake: "Make your first tradeoff between dependence and organizational health."
  },
  "c3b-highPotential": {
    title: "High-Potential: First Move in Talent Placement",
    context:
      "As a high-potential contributor, you join a talent review. The department lead wants your conclusion, but everyone waits for you to say who should stay.",
    stake: "Give a judgment that is impartial and acceptable to the organization."
  },
  "c4b-parachute": {
    title: "New Executive: First Alliance Against Resistance",
    context:
      "As a new executive pushing a new process, the operations lead publicly opposes it. Instead of suppressing him, you decide who to bring into shared responsibility.",
    stake: "Turn the opponent into a co-owner rather than pushing him deeper into opposition."
  },
  "c4b-founder": {
    title: "Founder: First Alliance Against Resistance",
    context:
      "As a founder pushing a product direction change, your co-founder publicly opposes it. The team splits into two camps waiting for your position.",
    stake: "Make the opposing view part of product validation instead of internal division."
  },
  "c4b-highPotential": {
    title: "High-Potential: First Alliance Against Resistance",
    context:
      "Your proposal is opposed by a senior lead. You have no positional power, but the proposal does contain a real key gap.",
    stake: "Make the opponent willing to revise the proposal with you instead of fighting over who is right."
  },
  "c5b-parachute": {
    title: "New Executive: First Goal Breakdown",
    context:
      "As a new executive, you receive a revenue-doubling target. The team nods, but nobody knows what to do tomorrow.",
    stake: "Turn slogans into key results every team can check."
  },
  "c5b-founder": {
    title: "Founder: First Goal Breakdown",
    context:
      "As a founder facing a growth target, product, sales, and engineering each have different priorities. The team needs you to turn the goal into a shared rhythm.",
    stake: "Align three departments around one verifiable result."
  },
  "c5b-highPotential": {
    title: "High-Potential: First Goal Breakdown",
    context:
      "As a high-potential contributor, you are asked to lead a cross-functional team on a quarterly goal, but nobody actually reports to you.",
    stake: "Replace administrative commands with goal management so members collaborate willingly."
  },
  "c6b-parachute": {
    title: "New Executive: First Consolidation of Power Boundaries",
    context:
      "As a new executive, you discover people are bypassing your decisions. You choose not to confront them publicly and prepare to redefine boundaries through systems.",
    stake: "Make major decisions entering a closed loop the organization's default rule."
  },
  "c6b-founder": {
    title: "Founder: First Consolidation of Power Boundaries",
    context:
      "As a founder, you discover a co-founder is bypassing you to make decisions. You are CEO in name, but real decisions are slipping away.",
    stake: "Rebuild decision mechanisms instead of entering a public showdown."
  },
  "c6b-highPotential": {
    title: "High-Potential: First Consolidation of Power Boundaries",
    context:
      "Your project is being directed by higher levels. Key decisions bypass you, yet you are still responsible for results.",
    stake: "Protect project ownership without a direct conflict with leadership."
  },
  "c7b-parachute": {
    title: "New Executive: First Institutionalization of Capability",
    context:
      "As a new executive, you realize many judgments live only in your head. When you leave, the team returns to old habits.",
    stake: "Help the organization run without you."
  },
  "c7b-founder": {
    title: "Founder: First Institutionalization of Capability",
    context:
      "As a founder, every key decision passes through you. One sick day stops half the business.",
    stake: "Turn founder experience into replicable organizational process."
  },
  "c7b-highPotential": {
    title: "High-Potential: First Institutionalization of Capability",
    context:
      "Your project depends heavily on your personal communication network. When you take a break, the project stalls.",
    stake: "Turn personal relationships into team process."
  },
  "c8b-parachute": {
    title: "New Executive: First Isolation in a Crisis",
    context:
      "As a new executive, you face a cash-flow crisis. Finance gives you 48 hours and the team begins to panic.",
    stake: "Isolate risk first with incomplete information, then look for opportunity."
  },
  "c8b-founder": {
    title: "Founder: First Isolation in a Crisis",
    context:
      "As a founder, your largest client freezes payment. You have one month of cash, and the team begins to speculate about collapse.",
    stake: "Solve cash flow and client relationships together rather than only one."
  },
  "c8b-highPotential": {
    title: "High-Potential: First Isolation in a Crisis",
    context:
      "Your project budget is cut. The team and suppliers are both demanding answers from you.",
    stake: "Protect core delivery while resources shrink."
  },
  "c9b-parachute": {
    title: "New Executive: Final Choice Before Legacy",
    context:
      "As a new executive, you have proven your capability. The CEO wants to promote you, but you know leaving will create a handoff gap.",
    stake: "Make success continue after you leave rather than belonging only to you."
  },
  "c9b-founder": {
    title: "Founder: Final Choice Before Legacy",
    context:
      "As a founder, the company is finally stable. Investors want you to run a larger platform, but you worry the founding team will lose control.",
    stake: "Complete the transfer of power between you and the organization."
  },
  "c9b-highPotential": {
    title: "High-Potential: Final Choice Before Legacy",
    context:
      "You are about to be promoted, but your successor is not fully ready and the project is at a critical point.",
    stake: "Complete the handoff safely while showing the organization you can take on more responsibility."
  },
  "c4-fork-expert": {
    title: "Momentum Checkpoint: Co-Author Committee",
    context:
      "You chose to make opponents co-authors. Now the first committee meeting must produce verifiable results instead of becoming another debate.",
    stake: "Prove that inviting opponents in is not a concession but a mechanism that makes the plan stronger."
  },
  "c4-fork-partial": {
    title: "Momentum Checkpoint: Backing Buys Time",
    context:
      "You chose to use executive backing to suppress debate. The backing has arrived, but you have 48 hours to give the execution layer a collaboration method that works without commands.",
    stake: "Backing can only be used once; turn it into the team's own process."
  },
  "c4-fork-risk": {
    title: "Momentum Checkpoint: Bypassing Resistance to Accelerate the Pilot",
    context:
      "You chose to run the pilot first. Results are better than expected, but the departments you bypassed are now jointly questioning its validity.",
    stake: "Turn the pilot from your personal push into evidence the whole organization can see."
  },
  "c7-fork-expert": {
    title: "Consolidation Checkpoint: Runway Checklist",
    context:
      "You chose to hand key judgments to the successor through a runway. Now the runway needs boundaries: what he may decide alone, and what must trigger dual review.",
    stake: "Make the runway accelerate growth without becoming a new dependency."
  },
  "c7-fork-partial": {
    title: "Consolidation Checkpoint: Delegation with Review",
    context:
      "You chose to give the successor more decision rights. He submitted a budget adjustment that contains a risk you did not anticipate.",
    stake: "Rejecting it directly would destroy the delegation; approving it may expose the organization to risk. You need a review protocol."
  },
  "c7-fork-risk": {
    title: "Consolidation Checkpoint: Keeping the Final Gate",
    context:
      "You chose to keep personally reviewing key decisions. Now volume is rising and your inbox and calendar are becoming the organization's bottleneck.",
    stake: "Find a way to keep the final judgment while removing the single-point bottleneck."
  }
};

export const FORK_NODE_EN: Record<
  string,
  {
    title: string;
    context: string;
    stake: string;
    intel: string[];
    options: Array<{
      label: string;
      summary: string;
      feedback: string;
      theory: string;
    }>;
  }
> = {
  "c4-fork-expert": {
    title: "Momentum Checkpoint: Co-Author Committee",
    context:
      "You chose to make opponents co-authors. Now the first committee meeting must produce verifiable results instead of becoming another debate.",
    stake: "Prove that inviting opponents in is not a concession but a mechanism that makes the plan stronger.",
    intel: [
      "Members care whether their own topics are actually adopted.",
      "The first deliverable decides whether opponents keep participating.",
      "A 24-hour deliverable must be verifiable, not just supportive."
    ],
    options: [
      {
        label: "Give each member a verifiable topic and a 24-hour deliverable",
        summary: "Turn opponents from commentators into deliverers and lock participation with results.",
        feedback:
          "Opponents owned the plan for the first time; the meeting moved from positions to commitments.",
        theory: "The Analects: promote the straight and the people follow."
      },
      {
        label: "Let the committee advise but not decide",
        summary: "Keep the final call and avoid slowing the plan down.",
        feedback:
          "The form existed, but members quickly saw their opinions would not be adopted.",
        theory: "Han Feizi: law, power, and tactics must work together."
      },
      {
        label: "Remove the loudest opponent from the committee",
        summary: "Protect efficiency by limiting access.",
        feedback:
          "Resistance seemed to disappear but moved underground.",
        theory: "The Art of War: first make yourself invincible."
      }
    ]
  },
  "c4-fork-partial": {
    title: "Momentum Checkpoint: Backing Buys Time",
    context:
      "You chose to use executive backing to suppress debate. The backing has arrived, but you have 48 hours to give the execution layer a collaboration method that works without commands.",
    stake: "Backing can only be used once; turn it into the team's own process.",
    intel: [
      "Executive backing has only one expiry.",
      "A three-party pilot pact is more executable than a command.",
      "The first jointly confirmed delivery node must exist within 48 hours."
    ],
    options: [
      {
        label: "Turn the backing into a three-party pilot pact",
        summary: "Let sales, delivery, and finance confirm the pilot boundary, owners, and review nodes.",
        feedback:
          "Executive support became executable rules; teams align through the pact, not commands.",
        theory: "Han Feizi: once the law stands, even a mediocre ruler can govern."
      },
      {
        label: "Require departments to comply by deadline",
        summary: "Use deadlines instead of one-by-one communication.",
        feedback:
          "Compliance arrived, but departments only checked boxes; real collaboration did not happen.",
        theory: "The Art of War: unite them with culture and discipline."
      },
      {
        label: "Push dissent back into private channels",
        summary: "Let public meetings show only support.",
        feedback:
          "The surface quieted, but key information began flowing around you.",
        theory: "Comprehensive Mirror: plug the crack before the storm."
      }
    ]
  },
  "c4-fork-risk": {
    title: "Momentum Checkpoint: Bypassing Resistance to Accelerate the Pilot",
    context:
      "You chose to run the pilot first. Results are better than expected, but the departments you bypassed are now jointly questioning its validity.",
    stake: "Turn the pilot from your personal push into evidence the whole organization can see.",
    intel: [
      "Pilot data must be public to answer the joint challenge.",
      "The bypassed departments are waiting for an inconsistency in the numbers.",
      "Every metric on the board needs an owner."
    ],
    options: [
      {
        label: "Turn pilot data into a public verification board",
        summary: "Let skeptics see the same data and invite them to add validation conditions.",
        feedback:
          "The challenge was answered by data; the pilot became shared language.",
        theory: "On Contradiction: practice is the only standard of truth."
      },
      {
        label: "Expand the pilot with supporters first",
        summary: "Prove the direction faster, then deal with the questions.",
        feedback:
          "Faster, but the opposing departments see you still pushing outside the circle.",
        theory: "The Book of Power: small wins first."
      },
      {
        label: "Withdraw the pilot and wait for consensus",
        summary: "Calm the dispute and wait for a safer launch window.",
        feedback:
          "Dispute shrank, but the organization learned to block new attempts with questions.",
        theory: "The Art of War: invincibility lies in yourself."
      }
    ]
  },
  "c7-fork-expert": {
    title: "Consolidation Checkpoint: Runway Checklist",
    context:
      "You chose to hand key judgments to the successor through a runway. Now the runway needs boundaries: what he may decide alone, and what must trigger dual review.",
    stake: "Make the runway accelerate growth without becoming a new dependency.",
    intel: [
      "The successor fears authority being quietly taken back.",
      "The risk-tier checklist needs to be public.",
      "Dual review should only appear on high-risk decisions."
    ],
    options: [
      {
        label: "Split independent decisions by risk tier",
        summary: "Delegate low risk, coach medium risk, dual-review high risk, and publish the list.",
        feedback:
          "The successor learned which judgments are his; the organization began running on rules, not people.",
        theory: "Zhenguan Essentials: finish well as you started."
      },
      {
        label: "Let the successor handle low-risk work first",
        summary: "Practice safely while you keep the key judgments.",
        feedback:
          "Safe, but every key judgment still passed through you.",
        theory: "Comprehensive Mirror: use people's strengths."
      },
      {
        label: "Hand over full authority immediately",
        summary: "Accelerate growth with real decisions and no review.",
        feedback:
          "The successor was independent, but the first unguarded mistake shook team trust.",
        theory: "The Art of War: win when top and bottom share the same will."
      }
    ]
  },
  "c7-fork-partial": {
    title: "Consolidation Checkpoint: Delegation with Review",
    context:
      "You chose to give the successor more decision rights. He submitted a budget adjustment that contains a risk you did not anticipate.",
    stake: "Rejecting it directly would destroy the delegation; approving it may expose the organization to risk. You need a review protocol.",
    intel: [
      "The successor's plan contains one real risk.",
      "A stop-loss condition protects delegation better than verbal trust.",
      "A 30-day review node turns the risk into learning material."
    ],
    options: [
      {
        label: "Ask him to add a stop-loss condition and a 30-day review node",
        summary: "Do not take back the decision; add guardrails and make the risk a coaching moment.",
        feedback:
          "You neither took back the decision nor ignored the risk; the organization gained a reusable delegation template.",
        theory: "Han Feizi: let capable people exhaust their thinking."
      },
      {
        label: "You make the final call this time",
        summary: "Control the risk first, then explain your judgment.",
        feedback:
          "The risk was blocked, but the successor learned to wait for your approval first.",
        theory: "The Book of Power: authority is granted."
      },
      {
        label: "Execute his plan directly",
        summary: "Buy growth with trust and let the organization absorb the risk.",
        feedback:
          "Trust was shown, but the organization paid for unguarded risk.",
        theory: "The Art of War: first make yourself invincible."
      }
    ]
  },
  "c7-fork-risk": {
    title: "Consolidation Checkpoint: Keeping the Final Gate",
    context:
      "You chose to keep personally reviewing key decisions. Now volume is rising and your inbox and calendar are becoming the organization's bottleneck.",
    stake: "Find a way to keep the final judgment while removing the single-point bottleneck.",
    intel: [
      "The whole organization schedules decisions around your calendar.",
      "Three standard questions can filter most requests.",
      "Exception review keeps your gate on high-risk judgments."
    ],
    options: [
      {
        label: "Split review into three standard questions",
        summary: "Require every request to answer goal, evidence, and stop-loss; review only exceptions.",
        feedback:
          "You remain the final gate, but the organization starts calibrating itself first; the bottleneck loosened.",
        theory: "Comprehensive Mirror: plug the crack early."
      },
      {
        label: "Add more approval meetings",
        summary: "Absorb the request volume with more synchronization time.",
        feedback:
          "Decisions moved a little faster, but your calendar swallowed the gain.",
        theory: "Han Feizi: once the law stands..."
      },
      {
        label: "Let an assistant pre-filter requests",
        summary: "Remove low-value information and keep only key decisions.",
        feedback:
          "You saved time, but the organization began guessing the assistant's preferences.",
        theory: "The Book of Power: authority exists to be used."
      }
    ]
  }
};

for (const [id, context] of Object.entries(BRANCH_ROLE_CONTEXT_EN)) {
  if (BRANCH_NODE_EN[id]) {
    BRANCH_NODE_EN[id].context = context;
  }
}

export const RANDOM_NODE_EN: Record<
  string,
  {
    title: string;
    context: string;
    stake: string;
    intel: string[];
    options: Array<{
      label: string;
      summary: string;
      feedback: string;
      theory: string;
    }>;
  }
> = {
  r1: {
    title: "Elevator Encounter",
    context:
      "At eight o'clock on Friday evening, you meet the CEO in the elevator. He just finished a board meeting and asks, with tired eyes: “What is the first thing you would change after taking over?” The doors will open in twelve seconds.",
    stake: "You have one sentence; too broad sounds empty, too specific sounds like complaining.",
    intel: [
      "The CEO is most worried about whether the organization is losing direction.",
      "His one-sentence opening is a test of whether you are already on top of the situation."
    ],
    options: [
      {
        label: "Give a specific judgment, not empty commitment",
        summary: "Name the key contradiction you observed and point to the next action.",
        feedback:
          "The CEO remembered not your attitude but that you could see the problem and prepare to act.",
        theory:
          "The Book of Power: authority is granted by people; granting it well is the greater art."
      },
      {
        label: "Express commitment first",
        summary: "Let the CEO see that you are confident about solving the problem.",
        feedback:
          "He saw your confidence, but not a concrete judgment.",
        theory: "The Art of War: first make yourself invincible."
      },
      {
        label: "Wait until the elevator ride ends",
        summary: "Avoid discussing organizational issues in public to reduce risk.",
        feedback:
          "Caution protected the information, but it may make the CEO think you are not ready.",
        theory: "Han Feizi: matters succeed through secrecy and fail through leakage."
      }
    ]
  },
  r2: {
    title: "Suspicious Expense Report",
    context:
      "While reviewing reimbursements, you find an unusually large receipt: the purpose field has been altered, it carries a core performer's signature, and the date is the day before a project delay.",
    stake: "The document may be a correction error or evidence of bypassed approval; before you verify it, every move changes trust.",
    intel: [
      "Someone deliberately skipped the normal check in the approval chain.",
      "This reimbursement is linked to a new supplier."
    ],
    options: [
      {
        label: "Check the process and purpose before deciding to talk",
        summary:
          "Review the approval chain, contract, and deliverables to build a factual base.",
        feedback:
          "You did not turn instinct into accusation; you closed the factual chain first.",
        theory: "On Practice: move from perceptual materials to rational knowledge."
      },
      {
        label: "Invite them in to clarify directly",
        summary:
          "Give the person a chance to explain and avoid silent suspicion.",
        feedback:
          "Direct communication reduced suspicion, but you may not yet have enough detail.",
        theory:
          "The Analects: do not worry that others do not know you; worry that you do not know others."
      },
      {
        label: "Temporarily pretend not to see it",
        summary:
          "Avoid damaging team relationships until more evidence appears.",
        feedback:
          "You avoided conflict, but non-compliant behavior may continue.",
        theory: "Zizhi Tongjian: stop cracks before storms destroy the wall."
      }
    ]
  },
  r3: {
    title: "Late-Night Client Call",
    context:
      "At 11 p.m., a key client calls to say they need the unbuilt feature demo on Monday and have already invited two executives to watch.",
    stake: "You must choose among commitment, overtime, and true progress instead of promising first and patching later.",
    intel: [
      "What the client really wants to confirm is whether your demo can support their internal decision.",
      "An existing feature can already serve as a replacement scenario."
    ],
    options: [
      {
        label: "Confirm the real need before promising a time",
        summary:
          "Ask what decision scenario they want to see, then offer a verifiable delivery.",
        feedback:
          "You neither promised blindly nor disappointed the client; you redefined the demo goal.",
        theory: "Drucker: a manager's results are contribution, not busyness."
      },
      {
        label: "Agree immediately and organize overtime",
        summary:
          "Reassure the client first, then have the team build the demo.",
        feedback:
          "The client felt reassured, but the team was dragged into fatigue by a rushed promise.",
        theory: "The Art of War: speed and victory matter more than prolonged campaigns."
      },
      {
        label: "Refuse first and reschedule",
        summary:
          "Emphasize the lack of time and ask the client to change the date.",
        feedback:
          "You protected the team, but the key client may reassess the partnership.",
        theory: "The Analects: a leader earns trust before asking people to labor."
      }
    ]
  },
  r4: {
    title: "Office Rumor",
    context:
      "Passing the break room, you hear three people saying the entire business group will be cut next month. The source is unknown, but résumés are already being updated.",
    stake: "The rumor will not disappear on its own; your response must handle both facts and emotions.",
    intel: [
      "The rumor is connected to a recent executive meeting.",
      "The most anxious employees are frontline staff without a direct manager."
    ],
    options: [
      {
        label: "Clarify with public information and explain decision principles",
        summary:
          "Do not name people; state clearly what the organization is actually doing.",
        feedback:
          "You did not hunt for the source; transparent information cut off the panic.",
        theory:
          "Methods of Work in Party Committees: share intelligence to create common language."
      },
      {
        label: "Ask direct managers to reassure people separately",
        summary:
          "Avoid a public response and let managers explain privately.",
        feedback:
          "The team stabilized temporarily, but different managers gave different versions and information distorted.",
        theory: "Han Feizi: the wise ruler lets the intelligent exhaust their judgment."
      },
      {
        label: "Do not respond and let the rumor pass",
        summary:
          "Believe that responding only strengthens the rumor.",
        feedback:
          "The rumor did not disappear; silence made it more believable.",
        theory:
          "The Analects: do not worry that others do not know you; worry that you do not know others."
      }
    ]
  },
  r5: {
    title: "Challenge at the Review",
    context:
      "At the quarterly review, a senior lead turns the laptop toward the room, lists four promises you have not kept since taking office, and asks: “What has your change actually delivered?”",
    stake: "The evidence is on the table and everyone is waiting; dodging makes the question look more real.",
    intel: [
      "The senior lead holds a set of real data that can verify your claim.",
      "The team wants to hear how you will correct course, not how you will defend yourself."
    ],
    options: [
      {
        label: "Respond with data and acknowledge unfinished work",
        summary:
          "Give verifiable results and honestly state what has not been done well.",
        feedback:
          "You were neither defensive nor vague; the team began accepting complex real results.",
        theory: "On Practice: mistakes often precede correct understanding."
      },
      {
        label: "Pass the question to a team representative",
        summary:
          "Let a frontline lead describe the actual change to avoid self-defense.",
        feedback:
          "You showed team capability, but the senior lead may see it as avoidance.",
        theory: "The Book of Power: power exists to be used, not enlarged."
      },
      {
        label: "Attack the questioner on the spot",
        summary:
          "Point out that they have not delivered results either.",
        feedback:
          "You won the room but lost the trust that matters most in a review.",
        theory:
          "The Art of War: make the opponent come to you, but not with the purpose of harming people."
      }
    ]
  },
  r6: {
    title: "Exit Interview",
    context:
      "A core performer you invested in asks to leave, saying growth has reached its ceiling. You know he lost two recent promotion reviews and the shortlist included two people close to you.",
    stake: "The danger is not keeping the person; it is hearing the real reason and failing to respond to it.",
    intel: [
      "This performer recently volunteered twice for work beyond his role.",
      "What he really wants is more judgment space, not a higher title."
    ],
    options: [
      {
        label: "Help him plan the next challenge",
        summary:
          "Do not rush to retain him; first confirm what growth he actually wants.",
        feedback:
          "You valued the person more than retention, and he began considering staying.",
        theory: "Drucker: build on people's strengths and let talent keep growing."
      },
      {
        label: "Retain him with a new project",
        summary:
          "Immediately offer a more challenging role and resources.",
        feedback:
          "He stayed for now, but the next growth ceiling will arrive faster.",
        theory: "Zhenguan Essentials: without the right talent, governance is hard."
      },
      {
        label: "Approve the departure immediately",
        summary:
          "Respect the choice and avoid retention costs.",
        feedback:
          "You created no friction, but may have missed a high-potential person who could be reactivated.",
        theory: "The Record of Characters: inspect change to see nature."
      }
    ]
  },
  r7: {
    title: "Unexpected Question in a Meeting",
    context:
      "At a leadership meeting, you are asked to explain a number you have only seen in a summary. No full report is in front of you, and someone nearby starts checking their phone, waiting for you to slip.",
    stake:
      "Admitting ignorance looks unprepared, and inventing data destroys credibility; you need an honest, traceable answer.",
    intel: [
      "The questioner also has only an outdated version of the data.",
      "Leadership wants to see how you manage information boundaries."
    ],
    options: [
      {
        label: "State known facts first, then set a deadline for the missing data",
        summary:
          "Clearly separate confirmed from unverified information and give a verifiable time.",
        feedback:
          "You did not pretend to know everything or lose control; leadership began trusting your boundaries.",
        theory:
          "On Practice: move from perceptual materials to rational knowledge without skipping facts."
      },
      {
        label: "Give a seemingly confident answer first",
        summary:
          "Use instinct to respond and avoid appearing unprepared.",
        feedback:
          "The meeting moved on, but if the data is disproven, your credibility is consumed twice.",
        theory: "The Art of War: first make yourself invincible."
      },
      {
        label: "Ask the questioner for their source",
        summary:
          "Throw the question back to transfer pressure.",
        feedback:
          "You avoided the question temporarily, but showed a lack of data preparation.",
        theory: "The Book of Power: reading the situation is primary, action secondary."
      }
    ]
  },
  r8: {
    title: "New Hire Overpromises to a Client",
    context:
      "In front of the client, a new hire promises a delivery date the team has not confirmed, and the client has already planned around it. The new hire realizes the problem but is afraid to tell you.",
    stake:
      "You must protect the new hire's courage to speak while keeping external commitments consistent.",
    intel: [
      "Behind the new hire's promise is private pressure from the sales lead.",
      "What the client really cares about is whether the delivery mechanism is transparent."
    ],
    options: [
      {
        label: "Confirm feasibility first, then align with the new hire together",
        summary:
          "Check whether the team can truly deliver, then decide how to adjust client expectations.",
        feedback:
          "You did not discredit the new hire in front of the client or let the promise run away; the team learned how to handle overreach.",
        theory:
          "Han Feizi on Personnel: keep duties separate and posts non-overlapping."
      },
      {
        label: "Correct the new hire's promise on the spot",
        summary:
          "Clearly tell the client the time cannot be confirmed.",
        feedback:
          "The client saw your rigor, but the new hire lost trust in front of them.",
        theory: "The Analects: a leader earns trust before asking people to labor."
      },
      {
        label: "Execute on the new hire's promise",
        summary:
          "Do not overturn the promise; use overtime to recover the time.",
        feedback:
          "The promise may survive, but the team paid high energy for an unauthorized commitment.",
        theory: "The Art of War: speed and victory matter more than prolonged campaigns."
      }
    ]
  },
  r9: {
    title: "Silence Before a Delay",
    context:
      "From two independent channels, you hear the key project is likely to be delayed, but the project owner has not reported it and has been avoiding one-on-one meetings.",
    stake:
      "Waiting for the official report may cost you the intervention window, while asking directly may look like distrust.",
    intel: [
      "The project lead has revised the internal plan three times.",
      "The team is afraid that reporting risk will be seen as incapability."
    ],
    options: [
      {
        label: "Proactively convene a risk review",
        summary:
          "Do not wait for the official report; bring the risk onto the table.",
        feedback:
          "You broke the default rule of reporting only good news, and delay risk began to be managed honestly.",
        theory: "The Art of War: shared intent wins."
      },
      {
        label: "Ask the project lead privately first",
        summary:
          "Avoid public pressure and understand the real cause.",
        feedback:
          "You learned the truth, but other team members still do not know the risk is escalating.",
        theory: "Han Feizi: matters succeed through secrecy and fail through leakage."
      },
      {
        label: "Keep waiting for the official report",
        summary:
          "Respect the reporting chain and avoid bypassing it.",
        feedback:
          "You followed process, but the delay risk kept growing in silence.",
        theory: "Zizhi Tongjian: stop cracks before storms destroy the wall."
      }
    ]
  },
  r10: {
    title: "A Client Asks for a Private Kickback",
    context:
      "At dinner, a key client suggests that if you lower the price by 5%, he can personally thank you. He says it just as the server leaves, leaving no record.",
    stake:
      "No record does not mean no consequence; your response becomes the organization's sample of its bottom line.",
    intel: [
      "This client has changed suppliers three times in the past two years.",
      "He cares more about long-term supply stability than this price."
    ],
    options: [
      {
        label: "Clearly refuse and propose a compliant discount plan",
        summary:
          "Hold the line and offer a public commercial solution.",
        feedback:
          "You rejected the gray space and protected long-term cooperation and organizational safety.",
        theory: "The Analects: the gentleman earns wealth through proper means."
      },
      {
        label: "Delay and let the commercial lead handle it",
        summary:
          "Do not respond directly; hand the issue to the professional team.",
        feedback:
          "You avoided direct conflict, but silence may be read as consent.",
        theory: "The Book of Power: power exists to be used, not enlarged."
      },
      {
        label: "Accept the private arrangement to keep the order",
        summary:
          "Protect the result first and deal with risk later.",
        feedback:
          "The order survived for now, but organizational risk moved onto you personally.",
        theory: "The Art of War: first make yourself invincible."
      }
    ]
  },
  r11: {
    title: "A Veteran Publicly Challenges a New Hire",
    context:
      "At the weekly meeting, a veteran points at a new high-potential employee and says: “Only a connection hire could write a plan like this.” Some people nod, some look down.",
    stake:
      "You are not handling two people; you are deciding whether public humiliation becomes the team's default language.",
    intel: [
      "The veteran has had a similar conflict before.",
      "The new hire's proposal last week contained a key data error."
    ],
    options: [
      {
        label: "Stop the challenge and return to factual evaluation",
        summary:
          "Do not criticize by name; pull the discussion back to performance and behavioral evidence.",
        feedback:
          "You protected the new hire and taught the veteran to judge by evidence rather than identity.",
        theory:
          "The Record of Characters: observe behavior to judge character."
      },
      {
        label: "Handle the veteran privately later",
        summary:
          "Do not interrupt publicly to avoid losing control of the meeting.",
        feedback:
          "The room stayed controlled, but the new hire was publicly hurt and will find it harder to speak next time.",
        theory:
          "The Analects: help people complete what is good, not what is harmful."
      },
      {
        label: "Ask the new hire to prove themselves on the spot",
        summary:
          "Require them to respond to the challenge with results.",
        feedback:
          "The new hire was forced into proving their worth, and public humiliation became normal management.",
        theory: "The Art of War: shared intent wins."
      }
    ]
  },
  r12: {
    title: "Investor Demands Layoffs",
    context:
      "An investor makes it clear: cut a department or the next round will be postponed. You know three key talents in that department are responsible for next year's most important project.",
    stake:
      "Short-term survival and long-term capability sit on the table together; your plan must show both the investor and the team the basis for the trade-off.",
    intel: [
      "The investor is actually worried about the cash-flow model, not the department.",
      "Three customer-relationship hubs sit inside the department targeted for cuts."
    ],
    options: [
      {
        label: "Recalculate the cost structure and propose an alternative",
        summary:
          "Do not accept layoffs directly; first find what is truly wasted.",
        feedback:
          "You did not hide the real problem with short-term cuts, and the investor began seeing your business judgment.",
        theory:
          "The Effective Executive: concentrate resources on truly important tasks."
      },
      {
        label: "Cut some roles to respond to the investor",
        summary:
          "Show willingness to reduce costs and protect the next round.",
        feedback:
          "Funding may be protected, but the organization begins to see you as willing to cut anyone.",
        theory: "The Book of Power: power exists to be used, not enlarged."
      },
      {
        label: "Refuse layoffs and prepare to give up funding",
        summary:
          "Hold the long-term capability and do not compromise with the investor.",
        feedback:
          "You protected organizational value, but cash-flow risk may bring down the company.",
        theory: "The Art of War: the skilled commander first makes himself invincible."
      }
    ]
  },
  r13: {
    title: "Budget Suddenly Cut",
    context:
      "Mid-quarter, finance tells you on Wednesday evening that the project budget is cut by 30% because the group is centralizing cash, with no advance warning. The team has invested three weeks and three outsourcing contracts renew on Monday.",
    stake: "You must redefine delivery scope in two days while showing the team that a budget cut is not a cut in value.",
    intel: [
      "The cut is related to last quarter's delivery delay.",
      "Two projects in the team can be merged at low cost."
    ],
    options: [
      {
        label: "Reprioritize scope and state what cannot be cut",
        summary:
          "Use key results to derive what must stay, and report tradeoffs proactively.",
        feedback:
          "You did not passively accept the cut; leadership saw how you manage tradeoffs.",
        theory:
          "Drucker: concentrate resources on the few truly important tasks."
      },
      {
        label: "Keep the original plan and request more budget later",
        summary:
          "Do not change scope for now; hope results will earn the budget back.",
        feedback:
          "The team kept sprinting, but the resource gap will soon become a delivery risk.",
        theory: "The Art of War: first make yourself invincible."
      },
      {
        label: "Pause the project immediately",
        summary:
          "Stop on the grounds of insufficient budget to avoid rushed delivery.",
        feedback:
          "You avoided chaotic delivery, but leadership may see you as unable to advance under constraints.",
        theory: "The Book of Power: power exists to be used, not enlarged."
      }
    ]
  },
  r14: {
    title: "Someone Goes Over Your Head",
    context:
      "You hear from a well-connected executive that someone told the CEO you suppressed different opinions at last week's meeting. You did interrupt twice, but only to pull the discussion back to the agenda.",
    stake:
      "You are handling how others experienced the truth; proving you did not suppress anything can make the feeling more real.",
    intel: [
      "The version the CEO heard came from someone who was not in the meeting.",
      "The two people you interrupted were both in front of a client."
    ],
    options: [
      {
        label: "Proactively clarify the facts with the CEO",
        summary:
          "Describe the meeting scenario without blame and acknowledge your style can improve.",
        feedback:
          "You did not hunt for the informant; you directly removed the information gap.",
        theory:
          "Methods of Work in Party Committees: share intelligence to create common language."
      },
      {
        label: "Check with meeting participants",
        summary:
          "Confirm what actually happened before deciding how to respond.",
        feedback:
          "You have the facts, but the CEO may have already formed an initial view.",
        theory: "On Practice: move from perceptual materials to rational knowledge."
      },
      {
        label: "Ignore the rumor and keep doing good work",
        summary:
          "Believe that good results will dissolve misunderstanding.",
        feedback:
          "Misunderstanding does not disappear by itself; silence turns it into a default conclusion.",
        theory:
          "The Analects: do not worry that others do not know you; worry that you do not know others."
      }
    ]
  },
  r15: {
    title: "A Client Asks for Your Personal Number",
    context:
      "At the quarterly review, a key client says publicly: “Give me your personal number; I will contact you directly from now on.” Some people smile and some watch your team's reaction.",
    stake:
      "Your response defines the collaboration boundary between the client and the organization: bypass the team or respect the process.",
    intel: [
      "The client is worried about response speed, not personal access.",
      "Someone on the team already handles daily support for their region."
    ],
    options: [
      {
        label: "Offer a dedicated support group, not a private number",
        summary:
          "Give the client a faster response channel while preserving organizational boundaries.",
        feedback:
          "The client got convenience, the team was not bypassed, and the boundary became clearer.",
        theory:
          "Han Feizi: keep duties separate and posts non-overlapping."
      },
      {
        label: "Give the number on the spot",
        summary:
          "Satisfy the client first, then privately explain who handles which issues.",
        feedback:
          "The client was satisfied, but the team is no longer sure who the real interface is.",
        theory:
          "The Book of Power: authority is granted by people; granting it well is the greater art."
      },
      {
        label: "Refuse and emphasize process",
        summary:
          "Make clear that all issues must go through the team interface.",
        feedback:
          "You protected process, but the client may feel undervalued.",
        theory: "The Analects: a leader earns trust before asking people to labor."
      }
    ]
  },
  r16: {
    title: "Nobody Uses the New Process",
    context:
      "The process you spent two weeks designing has been live for two weeks with usage under 20%. No one objects in meetings, no one submits improvement feedback, and everyone keeps using the old spreadsheet.",
    stake:
      "Silent non-execution is harder than open opposition; find why the process never entered people's work habits.",
    intel: [
      "The new process requires three manual entries in the system.",
      "Frontline managers received no training."
    ],
    options: [
      {
        label: "Interview frontline executors to find the friction",
        summary:
          "Do not blame; find the conflict between the process and real work.",
        feedback:
          "You discovered two missing key nodes instead of a team unwilling to comply.",
        theory: "On Practice: find patterns from practice."
      },
      {
        label: "Add mandatory checkpoints",
        summary:
          "Use system gates to force execution.",
        feedback:
          "Adoption rose, but the team began working around the system.",
        theory: "Han Feizi: once rules are established, even an ordinary ruler can govern."
      },
      {
        label: "Send another company-wide notice",
        summary:
          "Emphasize the process's importance and ask departments to take it seriously.",
        feedback:
          "The more notices, the more the team treats it as formalism.",
        theory:
          "The Analects: do not worry that others do not know you; worry that you do not know others."
      }
    ]
  },
  r17: {
    title: "A Core Employee Wants to Transfer",
    context:
      "Your most important project performer applies to transfer to a new business unit, saying he wants to learn something new. You know his departure will delay delivery by at least a month.",
    stake: "Determine whether he is drawn by the new opportunity or using the transfer to express dissatisfaction with the current situation.",
    intel: [
      "The new business he wants can be split into sub-tasks inside the project.",
      "The transfer request has reached HR, but the formal process has not started."
    ],
    options: [
      {
        label: "Design an internal growth path for him",
        summary:
          "Give him new judgment space inside the project to meet his growth need.",
        feedback:
          "You turned the reason he wanted to leave into growth design the organization can use.",
        theory: "Drucker: build on people's strengths and let talent keep growing."
      },
      {
        label: "Retain him with a promotion",
        summary:
          "Offer title and pay first so he stays.",
        feedback:
          "He stayed for now, but the next growth ceiling will be harder to manage.",
        theory: "Zhenguan Essentials: without the right talent, governance is hard."
      },
      {
        label: "Approve the transfer immediately",
        summary:
          "Respect the choice and start the handoff quickly.",
        feedback:
          "You avoided the tug of war, but the delivery-delay risk was not addressed in advance.",
        theory: "The Record of Characters: inspect change to see nature."
      }
    ]
  },
  r18: {
    title: "Negative Media Coverage",
    context:
      "An industry outlet publishes negative news about your company, citing data that is three months old. The client group is already forwarding it, and the sales team has held three reassurance meetings this afternoon.",
    stake:
      "Clarification must be fast, but it cannot be only a denial; clients want to see how the organization handles information.",
    intel: [
      "One figure in the article comes from your publicly released older annual report.",
      "The client service hotline has already received more than ten related inquiries."
    ],
    options: [
      {
        label: "Verify internally first, then respond consistently",
        summary:
          "Do not rush to refute; first confirm which facts are true.",
        feedback:
          "You did not let emotion amplify the crisis; facts restored control.",
        theory: "On Practice: move from perceptual materials to rational knowledge."
      },
      {
        label: "Publish an official clarification immediately",
        summary:
          "Quickly deny the inaccurate content to prevent client misunderstanding.",
        feedback:
          "The response was fast, but unverified internal issues may amplify further.",
        theory: "The Art of War: first make yourself invincible."
      },
      {
        label: "Stay silent and wait for the heat to pass",
        summary:
          "Do not respond and let the event cool naturally.",
        feedback:
          "Silence made the inaccurate content look more like truth, and clients began asking proactively.",
        theory:
          "The Analects: do not worry that others do not know you; worry that you do not know others."
      }
    ]
  },
  r19: {
    title: "A Supplier Demands Earlier Payment",
    context:
      "A supplier you have worked with for three years suddenly demands cutting payment terms from 60 to 30 days, or it will pause supply. You learn the supplier recently heard rumors about the company's cash flow.",
    stake:
      "Cash flow and supply-chain stability cannot be traded one for one; first find where the rumor came from, then decide what to promise.",
    intel: [
      "The supplier heard a vague rumor about the company's cash chain.",
      "Procurement completed evaluations of two alternative suppliers last week."
    ],
    options: [
      {
        label: "Verify payment capacity and alternative suppliers",
        summary:
          "Understand finance and backup options before deciding whether to concede.",
        feedback:
          "You were neither coerced nor blind to risk; supply-chain initiative returned to you.",
        theory: "The Art of War: first make yourself invincible."
      },
      {
        label: "Accept earlier payment to protect supply",
        summary:
          "Satisfy the supplier first to avoid production interruption.",
        feedback:
          "Supply was protected, but other suppliers may make the same demand.",
        theory: "The Book of Power: power exists to be used, not enlarged."
      },
      {
        label: "Refuse to concede and find a new supplier",
        summary:
          "Hold the original terms even if it means switching suppliers.",
        feedback:
          "You protected the terms, but switching time and risk may be greater.",
        theory:
          "The Art of War: the skilled commander seeks victory through position."
      }
    ]
  },
  r20: {
    title: "The CEO Asks You to Take on New Business",
    context:
      "At the end of Friday, the CEO asks you to take over a high-risk new business next week while keeping your current responsibilities. You just completed an important handoff and the team has not settled yet.",
    stake:
      "Seizing the new opportunity and protecting existing results cannot rely on verbal promises; first define your energy boundary.",
    intel: [
      "The CEO wants to see how you manage boundaries, not a simple yes.",
      "Half of the new business resources can come from existing team slack."
    ],
    options: [
      {
        label: "Confirm the new business boundary and exit conditions first",
        summary:
          "Do not reject the opportunity, but make resources, authority, and stop-loss standards clear.",
        feedback:
          "You neither accepted blindly nor rejected; you made the new business manageable.",
        theory:
          "The Book of Power: authority is granted by people; granting it well is the greater art."
      },
      {
        label: "Accept immediately and invest fully",
        summary:
          "Catch the opportunity first, then adjust current work.",
        feedback:
          "You showed ownership, but current responsibilities may begin to show risk.",
        theory: "The Art of War: speed and victory matter more than prolonged campaigns."
      },
      {
        label: "Refuse the assignment",
        summary:
          "State clearly that your capacity is full and request keeping current duties only.",
        feedback:
          "You protected yourself, but leadership may see a lack of willingness to take on more.",
        theory:
          "The Analects: the gentleman seeks causes in himself; the petty person seeks them in others."
      }
    ]
  },
  r21: {
    title: "Credit Claimed by Another Department",
    context:
      "The project you pushed for six months is showing results, but another department credited it in their monthly report and deleted your names. Your team demands a public correction.",
    stake: "Clarifying wins back credit but may tear collaboration; staying silent disappoints the team. You need a third path.",
    intel: [
      "The other report cites your internal data.",
      "Their leader is competing for the same promotion slot."
    ],
    options: [
      {
        label: "Put contributions into a shared mechanism",
        summary: "Create a joint credit record so both sides see the contribution.",
        feedback: "You turned a fight into shared assets, and collaboration deepened.",
        theory: "The Analects: the gentleman completes what is good in others."
      },
      {
        label: "Correct their report publicly",
        summary: "State the real contribution at the meeting to protect team morale.",
        feedback: "The credit was clarified, but the other department became defensive.",
        theory: "The Art of War: unite with civility, discipline with martial order."
      },
      {
        label: "Stay silent and deliver",
        summary: "Focus on delivery; deal with credit later.",
        feedback: "The team saw you as weak, and credit began to skew.",
        theory: "The Art of War: first make yourself invincible."
      }
    ]
  },
  r22: {
    title: "New Key Hire Excluded",
    context:
      "The new key hire you brought in has missed meeting invites for three weeks, is absent from the information sync group, and was never added to document sharing permissions. He has not complained to you yet.",
    stake: "Exclusion rarely happens loudly; without publicly taking sides, make the team see collaboration as a rule, not a favor.",
    intel: [
      "A veteran lost the promotion race to the new hire.",
      "The new hire has already delivered one critical result independently."
    ],
    options: [
      {
        label: "Rebuild collaboration through a shared task",
        summary: "Make veterans and the new hire interdependent on one key project.",
        feedback: "Collaboration rebuilt through work; veterans saw the real value.",
        theory: "Zhenguan Essentials: set aside weakness and use strength."
      },
      {
        label: "Publicly empower the new hire",
        summary: "Make the position untouchable with visible authority.",
        feedback: "The position held, but exclusion moved to a subtler level.",
        theory: "Han Feizi: the wise ruler lets capable people use their minds."
      },
      {
        label: "Move the new hire to another team",
        summary: "Avoid conflict by rearranging the assignment.",
        feedback: "Conflict disappeared, but the organization learned to avoid management.",
        theory: "Comprehensive Mirror: plug the crack early."
      }
    ]
  },
  r23: {
    title: "Supplier Kickback Clue",
    context:
      "Late at night, the finance manager sends a reconciliation showing the same supplier paid early at the start of each month for eighteen consecutive months, with no comparison process in procurement records. She says she can only send this once.",
    stake: "Integrity clues are most fragile before the suspect notices; protect the evidence chain first, then decide who investigates.",
    intel: [
      "The unusual amounts have risen for three straight months.",
      "Finance and procurement had one public argument earlier."
    ],
    options: [
      {
        label: "Collect evidence through an audit loop",
        summary: "Put the reconciliation into an independent audit and establish facts first.",
        feedback: "You let evidence and process speak, and the organization trusted you more.",
        theory: "Han Feizi: once the law stands, even a mediocre ruler can govern."
      },
      {
        label: "Interview the procurement lead immediately",
        summary: "Apply pressure face to face and demand an explanation.",
        feedback: "The lead denied everything and began destroying traces.",
        theory: "The Art of War: control others without being controlled."
      },
      {
        label: "Treat it as rumor",
        summary: "With insufficient evidence, do not disturb anyone.",
        feedback: "Once rumors spread, the organization suspected you of shielding misconduct.",
        theory: "The Analects: the gentleman seeks causes in himself."
      }
    ]
  },
  r24: {
    title: "Team Opposes New Performance Review",
    context:
      "The new performance review is publicly opposed at the all-hands meeting: some point out there is no objective data in the criteria, others worry the bonus pool will be discounted. You planned to launch it next Monday.",
    stake: "Withdrawing weakens the standard's authority and imposing it loses trust; let the standard be tested before it takes effect.",
    intel: [
      "The loudest opponents have not read the new algorithm.",
      "A pilot dataset exists and can be published."
    ],
    options: [
      {
        label: "Publish the algorithm and run a pilot",
        summary: "Open the scoring logic and pilot results, then collect feedback for a month.",
        feedback: "Opposition became improvement input, and the standard earned backing.",
        theory: "Zhenguan Essentials: finish well as you started and keep people's trust."
      },
      {
        label: "Push forward and restate the rules",
        summary: "Make clear the reform will not stop because of objection.",
        feedback: "The plan landed, but the team started gaming the minimum standard.",
        theory: "The Art of War: discipline with civility and martial order together."
      },
      {
        label: "Withdraw and research again",
        summary: "Calm the emotion first and revisit standards later.",
        feedback: "Emotions cooled, but the next reform will meet the same distrust.",
        theory: "The Art of War: invincibility lies in yourself."
      }
    ]
  },
  r25: {
    title: "Major Customer Cuts Orders",
    context:
      "At the end of the quarter, your largest customer cuts next quarter's orders by 40%, citing budget adjustment. The sales team plans to visit tomorrow and plead together, and finance reminds you that the customer changed its procurement lead three months ago.",
    stake: "Behind the cut is often a real cause; pleading is not the first step. First find whether it is budget, relationship, or product.",
    intel: [
      "The decision came from the customer's new finance lead.",
      "The customer is internally discussing a second supplier."
    ],
    options: [
      {
        label: "Interview key people inside the customer first",
        summary: "Find the real decision chain behind the budget change before responding.",
        feedback: "You found a new finance lead and a concrete reopening path.",
        theory: "The Record of Characters: observe choices across situations to see real motive."
      },
      {
        label: "Visit with the whole team and plead",
        summary: "Win back the order with sincerity.",
        feedback: "Sincerity arrived, but the real reason stayed hidden; the next cut is coming.",
        theory: "The Analects: worry about not understanding people, not about being understood."
      },
      {
        label: "Accept the cut and compress costs",
        summary: "Adjust the budget quickly and stop asking why.",
        feedback: "Numbers aligned, but the systemic problem was covered up.",
        theory: "The Art of War: first make yourself invincible."
      }
    ]
  },
  r26: {
    title: "Departing Leader Wants to Return",
    context:
      "A key person who left a year ago now wants to rejoin with new experience and industry resources. The original team already has a replacement, and the newcomer just completed a full delivery cycle.",
    stake: "Returning must not rely on old affection; give both old and new talent a fair growth path instead of turning the return into a denial of the current person.",
    intel: [
      "The returning leader's resources do not conflict with existing clients.",
      "The replacement has completed two delivery cycles and is waiting for a promotion promise."
    ],
    options: [
      {
        label: "Design a dual growth path",
        summary: "Give the returning leader and existing talent different focus areas.",
        feedback: "The return brought resources without pushing out current talent; a real bench formed.",
        theory: "Zhenguan Essentials: sustaining is harder than starting; continuity needs ownership."
      },
      {
        label: "Restore the original role directly",
        summary: "Show sincerity with the old title and ask the team to adjust.",
        feedback: "The return landed, but the replacement lost confidence and the team shook.",
        theory: "Han Feizi: clear responsibility is the art of using people."
      },
      {
        label: "Politely decline and stay in touch",
        summary: "Protect the current team and treat the returnee as an external resource.",
        feedback: "The team stabilized, but you lost the chance to internalize external resources.",
        theory: "The Art of War: seek advantage from the situation."
      }
    ]
  },
  r27: {
    title: "The Plan Leaked Early",
    context:
      "The restructuring plan you planned to announce on Thursday appears in another department's group chat on Wednesday afternoon. The version carries a watermark, so the source must be internal, but no one admits it yet.",
    stake: "Blame is not the point. The point is keeping leaks from blocking the next change.",
    intel: [
      "The watermark narrows the leak to a small circle.",
      "The other department shared it to test whether you will punish or ignore.",
      "A second version can turn the leak into a controlled probe."
    ],
    options: [
      {
        label: "Publish two switchable versions of the plan",
        summary: "Keep the key changes, separate certain from exploratory information, and observe the leak path.",
        feedback:
          "You did not start with blame; the plan gained anti-leak capability and a controlled disclosure window.",
        theory: "Han Feizi: matters succeed in secrecy and fail through loose talk."
      },
      {
        label: "Announce a formal leak investigation",
        summary: "Use a clear stance to make information boundaries untouchable.",
        feedback:
          "The warning landed, but people moved to more hidden channels and information became harder to see.",
        theory: "The Art of War: first make yourself invincible."
      },
      {
        label: "Postpone the plan and wait for the source to surface",
        summary: "Do not publish until the leak resolves itself.",
        feedback:
          "You protected short-term calm but lost the window; the next change will be more passive.",
        theory: "The Analects: worry about knowing others, not about being known."
      }
    ]
  },
  r28: {
    title: "The Predecessor's Favor Ledger",
    context:
      "During handover, your predecessor leaves a private document listing who owes him favors, who promised to support the new leader, and who once betrayed him at a key meeting. The admin lead hints this ledger is more accurate than the org chart.",
    stake: "Favor accounts are real resources, but using them directly makes you the continuation of old politics.",
    intel: [
      "The ledger contains names not visible in the formal structure.",
      "Each favor maps to a different expected payoff.",
      "Translating it into collaboration conditions avoids inheriting the debt."
    ],
    options: [
      {
        label: "Translate the favor ledger into a collaboration map",
        summary: "Extract each person's cooperation conditions instead of debts, making the ledger a verifiable resource.",
        feedback:
          "You used the information without inheriting the debt, turning historical resources into neutral assets.",
        theory: "The Book of Character: watch changes to see nature."
      },
      {
        label: "Verify the ledger privately and visit each name",
        summary: "Confirm each favor before deciding how to use it.",
        feedback:
          "You learned real motivations, but the organization now assumes you continue the predecessor's faction play.",
        theory: "The Book of Power: small wins first."
      },
      {
        label: "Burn the ledger",
        summary: "Refuse all private relationships and restart from public process.",
        feedback:
          "The gesture was clean, but you also rejected the best first-hand intelligence and will pay tuition longer.",
        theory: "The Art of War: know yourself and know the other."
      }
    ]
  },
  r29: {
    title: "The Star Employee Suddenly Quits",
    context:
      "The employee controlling 70% of client relationships suddenly resigns for personal growth. You find that a week before leaving, he met privately with three high-potential colleagues, and one of them has already started updating their résumé.",
    stake: "Retaining him is not the only goal. Decide whether this is individual attrition or a team structure problem.",
    intel: [
      "The three high-potential colleagues were invited in a specific order.",
      "His reasons include a promotion path that was never written down.",
      "The client relationships are concentrated by habit, not by contract."
    ],
    options: [
      {
        label: "Interview the high-potential colleagues he mentored first",
        summary: "Read the resignation as an organizational signal before designing a retention plan.",
        feedback:
          "You saw the bench structure behind the departure; the retention plan relied on organizational capacity, not a raise.",
        theory: "The Book of Character: observe feelings and changes."
      },
      {
        label: "Offer double the retention package",
        summary: "Buy time with resources and stabilize client relationships.",
        feedback:
          "He stayed temporarily, but other leaders began pricing their own resignations.",
        theory: "Zhenguan Essentials: using the wrong talent makes governance hard."
      },
      {
        label: "Accept the resignation and recruit urgently",
        summary: "Respect the choice and backfill externally.",
        feedback:
          "The role was filled, but client trust and tacit knowledge were not; the organization pays tuition long term.",
        theory: "The Art of War: first make yourself invincible."
      }
    ]
  },
  r30: {
    title: "Budget Cut by 20% Overnight",
    context:
      "The day before the quarterly kickoff, finance tells you the project budget is cut 20% because the group needs cash. The team has already planned delivery around the original budget, and the sales director has begun questioning the promises.",
    stake: "Give a new battle map within two days instead of turning the cut into an emotional event.",
    intel: [
      "The cut lands on discretionary spend, not on the three committed client nodes.",
      "The team's delivery plan has seven workstreams, but two can be compressed.",
      "Finance is watching whether you re-plan or complain."
    ],
    options: [
      {
        label: "Re-prioritize the budget by key results",
        summary: "Split delivery into must-keep, deferrable, and cuttable tiers with owners and checkpoints.",
        feedback:
          "Resource constraints became priority discipline; the team learned which three things cannot be lost.",
        theory: "The Effective Executive: concentrate on a few truly important tasks."
      },
      {
        label: "Lower delivery standards across the board",
        summary: "Protect the quarter's numbers and adjust standards later.",
        feedback:
          "Numbers held, but standards were diluted and acceptance disputes spilled to clients.",
        theory: "The Art of War: value victory, not prolonged campaigns."
      },
      {
        label: "Appeal to the group to restore the budget",
        summary: "Use delivery risk to argue for resources.",
        feedback:
          "You bought a buffer, but the group concluded you cannot make choices under constraints.",
        theory: "The Book of Power: authority is granted."
      }
    ]
  },
  r31: {
    title: "Two Executives Fight Publicly",
    context:
      "At the operating meeting, the sales VP and product VP argue in front of the CEO: one blames broken delivery, the other blames reckless promises. The CEO stays silent and turns to you.",
    stake: "Your next sentence decides whether the meeting returns to facts or becomes a faction choice.",
    intel: [
      "The customer contract contains a deadline the sales side promised without a delivery review.",
      "Product has a completion report showing two blockers from sales data.",
      "The CEO is testing whether you can separate facts from alliances."
    ],
    options: [
      {
        label: "Lock down customer facts and delivery facts first",
        summary: "Turn the argument into two verifiable lists so both sides redefine the problem on data.",
        feedback:
          "You did not judge; the meeting returned from emotion to facts and both sides finally discussed the same table.",
        theory: "On Contradiction: grasp the principal contradiction."
      },
      {
        label: "Support the sales side to protect the client",
        summary: "Give the client certainty now and review internally later.",
        feedback:
          "The client was protected, but product concluded you favor sales and started defensive collaboration.",
        theory: "Comprehensive Mirror: plug cracks early."
      },
      {
        label: "Adjourn and calm each side privately",
        summary: "Avoid taking a public side.",
        feedback:
          "The surface calmed, but both sides concluded you have no position; the next fight moved to private channels.",
        theory: "The Analects: harmony without sameness."
      }
    ]
  },
  r32: {
    title: "A Critical Process Depends on One Person",
    context:
      "While mapping the workflow, you find that renewal, pricing, and collection all depend on the same senior manager. During his annual leave last week, a pricing approval took three extra days and the client complained.",
    stake: "Turn him into a teacher of the system, not the system itself.",
    intel: [
      "He already documents decisions in personal notes.",
      "Two juniors have completed similar work under his review.",
      "His fear is being replaced, not being asked to teach."
    ],
    options: [
      {
        label: "Use a 30-day runway to turn the process into a checklist",
        summary: "Have him mentor two juniors, write judgment rules into a checklist, and let a junior drill a real case.",
        feedback:
          "Dependency did not become confrontation; he became the system builder and the organization gained replicable capability.",
        theory: "Zhenguan Essentials: finish well as you started."
      },
      {
        label: "Hire an assistant to share the load",
        summary: "Reduce single-point risk with headcount and defer process work.",
        feedback:
          "The assistant arrived, but judgment still concentrated on one person; the bottleneck was postponed.",
        theory: "Han Feizi: let capable people exhaust their thinking."
      },
      {
        label: "Demand he write the method immediately",
        summary: "Copy experience into documentation fast.",
        feedback:
          "The document aged quickly and he felt publicly stripped of value; cooperation dropped.",
        theory: "Comprehensive Mirror: use people's strengths."
      }
    ]
  },
  r33: {
    title: "The Client Demands an Unverified Feature Immediately",
    context:
      "Using contract renewal as leverage, the largest client demands an unverified feature go live in two weeks. Engineering estimates at least six weeks, and the product manager hints that you can ship first and test later.",
    stake: "Promising will burn out the team; refusing may lose the client. Find a third path.",
    intel: [
      "The client's key user is willing to participate in a 30-day joint acceptance.",
      "Two of the six weeks come from internal sign-off, not engineering.",
      "The renewal is signed by a sponsor who needs a visible result."
    ],
    options: [
      {
        label: "Split the need into a minimal testable version",
        summary: "Ship a simplified version that validates the core assumption and agree on a 30-day joint acceptance node.",
        feedback:
          "You did not choose between promise and refusal; the client became a validation partner with exit boundaries.",
        theory: "On Contradiction: grasp the principal contradiction."
      },
      {
        label: "Promise two weeks and ask the team to work overtime",
        summary: "Meet the client and absorb internal cost with overtime.",
        feedback:
          "The date held, but the team answered with attrition and burnout; the next delivery chain broke.",
        theory: "The Art of War: value victory, not prolonged campaigns."
      },
      {
        label: "Refuse the demand and wait for the contract term",
        summary: "Protect engineering boundaries and resist contract leverage.",
        feedback:
          "The principle held, but the relationship entered a freeze and your leverage shrank.",
        theory: "The Book of Power: authority is granted."
      }
    ]
  },
  r34: {
    title: "The Successor's First Independent Decision",
    context:
      "You are about to be promoted. The successor must handle her first crisis alone: a supplier defaults and the client is waiting. She brings two options to you, one conservative and one aggressive.",
    stake: "How you answer decides whether she learns to decide or learns to wait for you.",
    intel: [
      "She already knows the client's preferred option.",
      "Her first option protects delivery; her second protects cash.",
      "She has not written a stop-loss condition for either."
    ],
    options: [
      {
        label: "Ask her for a conclusion and failure conditions first",
        summary: "Have her state the recommendation, evidence, and stop-loss before you add one risk she missed.",
        feedback:
          "She came with a complete judgment, not a question; the handoff actually began.",
        theory: "Comprehensive Mirror: finish well as you started."
      },
      {
        label: "Give her your answer directly",
        summary: "Solve the crisis first and explain the decision process after.",
        feedback:
          "The crisis was solved, but she learned to check with you before the next one.",
        theory: "The Book of Power: authority exists to be used."
      },
      {
        label: "Let her handle it alone with full responsibility",
        summary: "Accelerate growth with a real crisis and no guardrails.",
        feedback:
          "Independence appeared, but without guardrails one failure may push her back into dependency.",
        theory: "The Art of War: win when top and bottom share the same will."
      }
    ]
  },
  r35: {
    title: "The CEO Asks You to Diagnose the Organization Publicly",
    context:
      "At the all-hands meeting, the CEO suddenly asks you to diagnose the organization publicly and says, 'You are new, so you see it most clearly.' The room goes quiet and someone starts writing down your exact words.",
    stake: "Too sharp alienates people; too smooth loses credibility. You need one honest, actionable sentence.",
    intel: [
      "The CEO wants a testable observation, not a list of complaints.",
      "The room is listening for whether you will name real evidence.",
      "One verifiable next step turns diagnosis into a shared agenda."
    ],
    options: [
      {
        label: "Give three verifiable observations",
        summary: "Pair each observation with evidence and one next action, turning diagnosis into a checklist.",
        feedback:
          "You neither took sides nor talked in circles; the all-hands treated diagnosis as an executable agenda.",
        theory: "The Analects: without correct names, words do not flow."
      },
      {
        label: "Praise the organization first, then ask one soft question",
        summary: "Keep the mood safe while leaving a question mark.",
        feedback:
          "The room stayed calm, but the CEO will not ask you again because you gave no judgment.",
        theory: "The Book of Power: small wins first."
      },
      {
        label: "Name one department's problem directly",
        summary: "Use specific criticism to show sharp observation.",
        feedback:
          "You showed edge, but the whole department went defensive and information will be filtered.",
        theory: "The Art of War: first make yourself invincible."
      }
    ]
  },
  r36: {
    title: "An Anonymous Letter Arrives at Midnight",
    context:
      "At midnight you receive an anonymous letter accusing the purchasing manager of conflicts of interest with a supplier. It is signed 'a colleague who knows' and contains no evidence, but it includes a blurry transfer screenshot.",
    stake: "The letter may be truth or faction tooling. Protect the fairness of the investigation first.",
    intel: [
      "The letter's claims match an unusual contract renewal from last quarter.",
      "The anonymous sender likely works inside purchasing or finance.",
      "No evidence means acting directly will destroy the investigation window."
    ],
    options: [
      {
        label: "Turn the letter into an independent audit lead",
        summary: "Keep the source private, put the abnormal records into an independent audit, and let evidence replace the letter.",
        feedback:
          "You neither treated the letter as a verdict nor ignored it; the organization saw your standard of fairness.",
        theory: "Han Feizi: once the law stands, even a mediocre ruler can govern."
      },
      {
        label: "Interview the purchasing manager immediately",
        summary: "Judge quickly through direct conversation.",
        feedback:
          "He denied it and began erasing traces; you lost the evidence window and the news spread.",
        theory: "The Art of War: control the opponent, do not be controlled."
      },
      {
        label: "Hand the letter to higher leadership",
        summary: "Avoid the risk and let the organization decide.",
        feedback:
          "You avoided risk but also gave up judgment; the investigation will drift beyond your control.",
        theory: "The Book of Power: authority is granted."
      }
    ]
  }
};

export const CHALLENGE_EN: Record<
  string,
  { title: string; description: string }
> = {
  expert_3: {
    title: "Three Precise Calls",
    description: "Complete 3 expert-level scenario choices"
  },
  side_1: {
    title: "Side Quest Progress",
    description: "Complete 1 side quest node"
  },
  duel_1: {
    title: "One Duel",
    description: "Complete 1 1v1 duel"
  },
  chapter_1: {
    title: "Chapter Breakthrough",
    description: "Complete any main chapter"
  },
  rank_20: {
    title: "Ability Leap",
    description: "Reach 20 total ability levels"
  },
  training_1: {
    title: "Dedicated Training",
    description: "Complete 1 ability training path"
  },
  trial_1: {
    title: "Trial Breakthrough",
    description: "Clear 1 growth trial stage"
  },
  practice_1: {
    title: "Practice Task",
    description: "Complete 1 practice task"
  },
  story_3: {
    title: "Scenario Streak",
    description: "Complete 3 scenario decisions"
  },
  side_3: {
    title: "Side Quest Depth",
    description: "Complete 3 side quest nodes"
  },
  duel_3: {
    title: "Three Duels",
    description: "Complete 3 1v1 duels"
  },
  random_2: {
    title: "Random Resilience",
    description: "Handle 2 random events"
  },
  branch_3: {
    title: "Role Branches",
    description: "Complete 3 role branch nodes"
  },
  mba_1: {
    title: "MBA Case",
    description: "Clear 1 MBA advanced case"
  }
};

export const ASSESSMENT_EN: Record<
  string,
  { prompt: string; options: string[] }
> = {
  "q-insight": {
    prompt:
      "After taking over an unfamiliar team, how do you judge whether a core performer is trustworthy?",
    options: [
      "Watch his behavior under pressure instead of listening to what he says.",
      "Check past performance and formal history first.",
      "Mainly see who he is close to."
    ]
  },
  "q-deploy": {
    prompt:
      "You have an important project that needs an owner. What do you prioritize?",
    options: [
      "Define the role's outcomes first, then match ability evidence.",
      "Find a loyal and reliable person first, then develop them.",
      "Choose the most senior person to avoid risk."
    ]
  },
  "q-mobilize": {
    prompt:
      "When the team publicly opposes your new plan, what is your first reaction?",
    options: [
      "Turn the opponent's concerns into premises of the plan.",
      "Stabilize the room first, then persuade key people privately.",
      "Push forward directly with decision authority."
    ]
  },
  "q-strategy": {
    prompt:
      "Without formal authority, how do you advance an important matter?",
    options: [
      "Win a small result first, then trade it for authority.",
      "Express needs to leadership and clarify power boundaries first.",
      "Wait until authority is granted before acting."
    ]
  },
  "q-authority": {
    prompt:
      "You discover someone is bypassing you to make decisions. What do you do?",
    options: [
      "Redefine power boundaries with a joint approval process.",
      "Talk directly to the person and clarify boundaries.",
      "Do nothing until they make a mistake."
    ]
  },
  "q-stability": {
    prompt:
      "Before leaving your current role, what do you hand over first?",
    options: [
      "Turn high-frequency judgments into checklists and a decision review library.",
      "Introduce key clients and relationships to your successor.",
      "Organize the important documents and finish."
    ]
  },
  "q-recovery": {
    prompt:
      "After a week of intense work, your energy starts dropping noticeably. What do you do?",
    options: [
      "Set recovery boundaries and move the most important work to high-energy periods.",
      "Push through on willpower and rest after the work is done.",
      "Sleep less and give all time to work."
    ]
  },
  "q-execution": {
    prompt: "The quarterly goal gap is large. What do you do first?",
    options: [
      "Break out key results and cut low-value work.",
      "Have the team focus on overtime to catch the numbers.",
      "Talk to leadership about lowering the target."
    ]
  },
  "q-structure": {
    prompt:
      "Facing a problem you have never handled, how do you usually start?",
    options: [
      "Define the problem boundary, then break out the key variables.",
      "Find a similar case and copy a successful approach.",
      "Start acting and adjust when problems appear."
    ]
  },
  "q-communication": {
    prompt:
      "A cross-functional meeting is stuck in conflict. How do you express yourself?",
    options: [
      "Restate both sides' concerns, then redefine the shared goal.",
      "Propose my plan directly and ask everyone to cooperate.",
      "Stay quiet now and handle it privately after the meeting."
    ]
  },
  "q-insight-2": {
    prompt:
      "A candidate has strong results, but the team says he takes all the credit. What do you do?",
    options: [
      "Observe how he explains failure and collaborates.",
      "Trust the results first, then add team feedback.",
      "Lower your evaluation of him directly."
    ]
  },
  "q-insight-3": {
    prompt:
      "To understand a key person's real motives, what is the most effective action?",
    options: [
      "Watch what he voluntarily invests time and resources in.",
      "Ask him directly what matters most.",
      "Rely on what others say about him."
    ]
  },
  "q-deploy-2": {
    prompt:
      "A key role candidate has weaknesses but outstanding strengths. What do you do?",
    options: [
      "Assess whether the weaknesses affect core role outcomes, then decide.",
      "Prefer someone with no obvious weaknesses.",
      "Refuse to use anyone with weaknesses."
    ]
  },
  "q-deploy-3": {
    prompt:
      "When delegating to a subordinate, what should you confirm first?",
    options: [
      "The results he must deliver and his judgment boundaries.",
      "Whether he is loyal enough.",
      "Whether he fully agrees with your approach."
    ]
  },
  "q-mobilize-2": {
    prompt:
      "When team morale is low, what most re-energizes people?",
    options: [
      "Give them a winnable small goal and shared responsibility.",
      "Publicly praise a few people's effort.",
      "Emphasize the serious consequences of failure."
    ]
  },
  "q-mobilize-3": {
    prompt:
      "To make two hostile departments cooperate, what is the first step?",
    options: [
      "Redefine the customer or result they both share.",
      "Persuade the two leads separately.",
      "Ask leadership to pressure them."
    ]
  },
  "q-strategy-2": {
    prompt:
      "What is the most persuasive way to obtain resources?",
    options: [
      "Show a verifiable small result first.",
      "Explain how much return the resources can bring.",
      "Emphasize the urgency of the project."
    ]
  },
  "q-strategy-3": {
    prompt:
      "Facing a strong competitor, what do you prefer?",
    options: [
      "Find a differentiation advantage they cannot copy.",
      "Invest faster and harder than them.",
      "Wait for them to make a mistake."
    ]
  },
  "q-authority-2": {
    prompt:
      "After taking over a team, what authority source should you build first?",
    options: [
      "Clear, consistent decision standards and results.",
      "Strict work discipline.",
      "Public criticism of problematic behavior."
    ]
  },
  "q-authority-3": {
    prompt:
      "Someone publicly challenges your decision. What do you do?",
    options: [
      "Confirm the facts first, then decide whether to adjust.",
      "Immediately defend the decision's authority.",
      "Publicly rebut the challenger."
    ]
  },
  "q-stability-2": {
    prompt:
      "To make the team run without depending on you, the key is?",
    options: [
      "Turn key decisions into reusable processes.",
      "Develop one most trusted deputy.",
      "Keep key decisions in your own hands."
    ]
  },
  "q-stability-3": {
    prompt:
      "After someone learns your core ability, you will?",
    options: [
      "Keep upgrading to a higher-order ability.",
      "Actively mentor them and expand influence.",
      "Worry about being replaced."
    ]
  },
  "q-recovery-2": {
    prompt:
      "When you feel worst emotionally, what recovers you most effectively?",
    options: [
      "Leave the scene first and let your body and emotions cool down.",
      "Talk to a trusted person.",
      "Use more work to distract yourself."
    ]
  },
  "q-recovery-3": {
    prompt:
      "You notice two weeks of continuous fatigue. What do you do first?",
    options: [
      "Check the three tasks that consume the most energy.",
      "Cut everything except sleep.",
      "Push through until the project ends."
    ]
  },
  "q-execution-2": {
    prompt:
      "A new task suddenly appears in the project. What do you do?",
    options: [
      "First judge whether it affects key results.",
      "Insert it into the schedule quickly so nothing is missed.",
      "Handle it immediately to avoid being questioned by leadership."
    ]
  },
  "q-execution-3": {
    prompt:
      "What mechanism most effectively keeps the team on plan?",
    options: [
      "Fixed-rhythm milestone checks.",
      "Ask for progress every day.",
      "Check everything before delivery."
    ]
  },
  "q-structure-2": {
    prompt:
      "When a problem repeats, what do you analyze first?",
    options: [
      "The systemic conditions that cause it.",
      "Who is responsible this time.",
      "How to patch one gap quickly."
    ]
  },
  "q-structure-3": {
    prompt:
      "When you receive a lot of information, what do you do first?",
    options: [
      "Break it into key variables and causal chains by goal.",
      "Organize it into a list by source.",
      "Look directly for the most striking conclusion."
    ]
  },
  "q-communication-2": {
    prompt:
      "The other person clearly misunderstands you. What do you do?",
    options: [
      "Restate their understanding first, then add key information.",
      "Repeat your own point in more detail.",
      "Ask a third party to convey it again."
    ]
  },
  "q-communication-3": {
    prompt:
      "Cross-functional meeting time is running out. What do you align first?",
    options: [
      "Shared goal, owners, and deadline.",
      "Each department's difficulties and concerns.",
      "Final solution details."
    ]
  }
};

export const ABILITY_DETAIL_EN: Record<
  AbilityId,
  { subSkills: string[]; trainingPath: string; sources: string[] }
> = {
  insight: {
    subSkills: [
      "See beyond the surface to understand what is inside",
      "Observe behavior to judge character",
      "Inspect change to see nature",
      "Recognize categories and make the most of talent"
    ],
    trainingPath:
      "Complete a stakeholder map in each chapter, then move into one-on-one interviews with key people.",
    sources: [
      "The Record of Characters: Nine Signs and Eight Observations",
      "The Ice Mirror: eight-character reading formula",
      "The Art of War: five ways to know victory"
    ]
  },
  deploy: {
    subSkills: [
      "Match people to roles by ability",
      "Use what each person does best",
      "Make rewards and punishments clear",
      "Keep responsibilities clear"
    ],
    trainingPath:
      "Replace impression scores with a key-role checklist and make people decisions from ability evidence.",
    sources: [
      "Han Feizi on Personnel: follow heaven and people",
      "Zhenguan Essentials: promote only the capable",
      "Drucker: build on people's strengths"
    ]
  },
  mobilize: {
    subSkills: [
      "Win people through virtue",
      "Combine civil trust with martial discipline",
      "Offer direction, not just orders",
      "Seize the key point and carry the whole"
    ],
    trainingPath:
      "Write opponents' concerns into the plan, then invite them to own a pilot.",
    sources: [
      "The Analects: govern through virtue",
      "The Art of War: unite with civility and discipline with martial order",
      "Mao Zedong: make proposals, use cadres, grasp key points"
    ]
  },
  strategy: {
    subSkills: [
      "Power awareness",
      "Strategic positioning",
      "Combine law, power, and technique",
      "Wait for the right moment"
    ],
    trainingPath:
      "Earn leverage by winning before claiming power, while keeping authorizers informed.",
    sources: [
      "The Book of Power: Building Power",
      "Han Feizi: law, power, and technique",
      "Machiavelli: The Prince"
    ]
  },
  authority: {
    subSkills: [
      "Use power with restraint",
      "Delegate and empower",
      "Take active control",
      "Secure victory before battle"
    ],
    trainingPath:
      "Put key decisions into joint approval mechanisms and use systems to protect power boundaries.",
    sources: [
      "The Book of Power: Using Power",
      "The Art of War: make the opponent come to you",
      "Guiguzi: adaptive power thinking"
    ]
  },
  stability: {
    subSkills: [
      "Support results",
      "Institutionalize systems",
      "Build succession",
      "Prevent risks"
    ],
    trainingPath:
      "Turn high-frequency judgments into checklists and a review library, and design a runway period for successors.",
    sources: [
      "Zhenguan Essentials: start well and end cautiously",
      "Zizhi Tongjian: humility and unity",
      "Methods of Work in Party Committees: democratic centralism"
    ]
  },
  recovery: {
    subSkills: [
      "Notice emotions",
      "Restore energy",
      "Set boundaries",
      "Review and restart"
    ],
    trainingPath:
      "Set one uninterrupted recovery block each day and reset your state with breathing practice.",
    sources: [
      "The Effective Executive: self-management",
      "The 7 Habits: be proactive",
      "Modern energy management research"
    ]
  },
  execution: {
    subSkills: [
      "Break goals into results",
      "Prioritize",
      "Create checkpoints",
      "Accept verified outcomes"
    ],
    trainingPath:
      "Set three key results for the goal; give each result an owner and acceptance criteria.",
    sources: [
      "The Effective Executive: first things first",
      "The Art of War: speed wins",
      "Goal management practice"
    ]
  },
  structure: {
    subSkills: [
      "Define the problem",
      "Break out elements",
      "Seize the principal contradiction",
      "Form a testable hypothesis"
    ],
    trainingPath:
      "For vague problems, write the problem definition first, then list causal chains and validation checkpoints.",
    sources: [
      "On Contradiction: seize the principal contradiction",
      "On Practice: find patterns from practice",
      "Structured problem-solving framework"
    ]
  },
  communication: {
    subSkills: [
      "Align proactively",
      "Communicate with structure",
      "Ask and listen",
      "Resolve disagreement"
    ],
    trainingPath:
      "Align goals before cross-functional meetings, and lock owners with a one-page summary afterward.",
    sources: [
      "The Analects: do not worry that others do not know you",
      "The 7 Habits: seek first to understand",
      "Nonviolent communication principles"
    ]
  }
};

export const NPC_EN: Record<
  string,
  { name: string; title: string; description: string }
> = {
  "npc-assistant": {
    name: "Administrative Lead",
    title: "Organizational Information Node",
    description:
      "She knows who truly influences the organization better than most of the management team."
  },
  "npc-finance": {
    name: "Finance Manager",
    title: "Guardian of Resource Truth",
    description:
      "Her ledger hides the decision traces left by your predecessor."
  },
  "npc-ops": {
    name: "Operations Lead",
    title: "Seasoned Resistance",
    description:
      "His opposition comes from real delivery risk and from losing control of the new process."
  },
  "npc-young": {
    name: "Young High Performer",
    title: "Trainable Independent Executor",
    description:
      "He is waiting not for approval but for a clear delegation boundary."
  },
  "npc-veteran": {
    name: "Veteran",
    title: "Guardian of Core Clients",
    description:
      "He controls the clients and fears being marginalized by the organization."
  },
  "npc-chen": {
    name: "Yu Chen",
    title: "Humiliated Core Employee",
    description:
      "He is capable, but that public humiliation nearly cost him the courage to speak again."
  },
  "npc-shen": {
    name: "Jie Shen",
    title: "Sales Lead",
    description:
      "He is excellent at attacking clients but weak at protecting team consistency in negotiations."
  },
  "npc-xu": {
    name: "Xu",
    title: "New Management Trainee",
    description:
      "Her proposal contains unpolished insight; someone needs to protect her right to speak first."
  },
  "npc-he": {
    name: "Chuan He",
    title: "Data Engineer",
    description:
      "He can locate the scope of an error fastest, but overtime always breaks him at the key moment."
  },
  "npc-tang": {
    name: "Lan Tang",
    title: "Late-Night Colleague",
    description:
      "She owns the client proposal and needs an uninterrupted recovery window."
  },
  "npc-fang": {
    name: "Ran Fang",
    title: "Team Emotional Center",
    description:
      "After repeated failures, he both wants to leave and does not want to watch the team dissolve."
  }
};

export const ACHIEVEMENT_EN: Record<
  string,
  { name: string; description: string }
> = {
  first_step: {
    name: "First Judgment",
    description: "Complete your first real workplace scenario"
  },
  assessment_done: {
    name: "Ability Portrait",
    description: "Complete the 30-question ability baseline assessment"
  },
  training_first: {
    name: "First Training",
    description: "Complete any dedicated ability training path"
  },
  training_four: {
    name: "Four Tracks",
    description: "Complete 4 ability training paths"
  },
  training_all: {
    name: "Ability Trainer",
    description: "Complete all 10 ability training paths"
  },
  trial_first: {
    name: "First Trial Win",
    description: "Clear your first growth trial stage"
  },
  trial_five: {
    name: "Five Trials Broken",
    description: "Clear 5 growth trial stages"
  },
  trial_all: {
    name: "Trial Master",
    description: "Clear all growth trial stages"
  },
  mba_clear: {
    name: "MBA Breakthrough",
    description: "Clear any MBA advanced case"
  },
  hidden_route: {
    name: "Hidden Route",
    description: "Enter an advanced ability review route"
  },
  alternate_ending: {
    name: "Alternate Ending Collector",
    description: "Record one alternate ending"
  },
  random_rotation: {
    name: "Event Rotator",
    description: "Complete one full random event cycle and start a new one"
  },
  random_rotation_2: {
    name: "Second-Cycle Strategist",
    description: "Complete two event cycles and unlock role and difficulty variants"
  },
  random_collector: {
    name: "Event Collector",
    description: "Complete all 36 random events in one cycle"
  },
  chapter_1: {
    name: "Chapter 1 Complete",
    description: "Complete both main scenarios in chapter 1"
  },
  chapter_2: {
    name: "Chapter 2 Complete",
    description: "Complete both main scenarios in chapter 2"
  },
  chapter_3: {
    name: "Chapter 3 Complete",
    description: "Complete both main scenarios in chapter 3"
  },
  chapter_4: {
    name: "Chapter 4 Complete",
    description: "Complete both main scenarios in chapter 4"
  },
  chapter_5: {
    name: "Chapter 5 Complete",
    description: "Complete both main scenarios in chapter 5"
  },
  chapter_6: {
    name: "Chapter 6 Complete",
    description: "Complete both main scenarios in chapter 6"
  },
  chapter_7: {
    name: "Chapter 7 Complete",
    description: "Complete both main scenarios in chapter 7"
  },
  chapter_8: {
    name: "Chapter 8 Complete",
    description: "Complete both main scenarios in chapter 8"
  },
  chapter_9: {
    name: "Chapter 9 Complete",
    description: "Complete both main scenarios in chapter 9"
  },
  perfect_chapter: {
    name: "Expert-Level Chapter",
    description: "Earn three stars in any chapter"
  },
  all_side: {
    name: "Side Quest Collector",
    description: "Complete all 9 side quests"
  },
  side_trust_rebuild: {
    name: "Trust Rebuilder",
    description: "Complete the Rebuilding Trust side arc"
  },
  side_resilience: {
    name: "Resilient Organizer",
    description: "Complete the Resilient Organization side arc"
  },
  side_power_boundaries: {
    name: "Boundary Keeper",
    description: "Complete the Power Boundaries side arc"
  },
  duel_winner: {
    name: "First Victory",
    description: "Win a 1v1 duel"
  },
  duel_ten: {
    name: "Regular Duelist",
    description: "Complete 10 1v1 duels"
  },
  rank_leader: {
    name: "Change Maker",
    description: "Reach 38 total ability levels"
  },
  role_ending: {
    name: "Role Ending",
    description: "Complete chapter 9 and unlock your role ending"
  },
  master: {
    name: "Power Holder",
    description: "Reach 48 total ability levels"
  }
};

export const CHAPTER_REFLECTION_EN: Record<number, string> = {
  1: "You completed your first diagnosis of the organization. The real power map is rarely written on the org chart; it lives in who gets asked, who stays silent, and who truly controls resources.",
  2: "You advanced change without complete authority. Power starts not with a title but with whether your actions make key people willing to give you resources.",
  3: "People decisions began moving from impression to evidence. The core of staffing is not who is better, but what capability combination this organization needs now.",
  4: "You understood that opposition often carries real information. Turning resistance into shared responsibility is more lasting influence than suppressing it.",
  5: "A goal only becomes execution when it is broken into verifiable results. A manager's value is not announcing direction but making it checkable every day.",
  6: "Power needs boundaries and systems, not personal dominance. Being bypassed is often not a capability problem; it is a process that fails to protect decision rights.",
  7: "You began converting personal judgment into organizational capability. Consolidating power means the organization can stay stable without depending on you.",
  8: "In a crisis, the first priority is controlling the scope before searching for opportunity. Speed cannot replace structure, and courage cannot replace evidence.",
  9: "You completed the turn from doing work to building systems. True legacy is that the organization still knows how to make good decisions after you leave."
};
