import type { AbilityId, RoleId } from "./types.ts";
import { TRAINING_EN, type AbilityTrainingEn, type TrainingQuestionEn } from "./trainingEn.ts";
import type { AbilityTrainingExtra, TrainingQuestionDetail } from "./trainingExtras.ts";

export interface ExpandedTrainingQuestionEn extends TrainingQuestionEn {
  solutionSteps: string[];
  referenceAnswer: string;
}

export interface ExpandedAbilityTrainingEn extends AbilityTrainingEn {
  problemPrompt: string;
  analogy: string;
  applicationPoints: string[];
  formula: AbilityTrainingExtra["formula"];
  workedExamples: AbilityTrainingExtra["workedExamples"];
  roleApplications: Record<RoleId, string>;
  questions: ExpandedTrainingQuestionEn[];
}

export const TRAINING_EXTRAS_EN: Record<
  AbilityId,
  Omit<AbilityTrainingExtra, "questionDetails"> & {
    questionDetails: Record<string, TrainingQuestionDetail>;
  }
> = {
  insight: {
    problemPrompt:
      "A capable, agreeable person seems trustworthy, but you are not sure whether to hand them the critical task.",
    analogy:
      "Think of it as a question about who this person really is. The resume and charm are the packaging; behavioral evidence is the working.",
    applicationPoints: [
      "Define the job result before collecting evidence",
      "Watch choices under pressure, not public statements",
      "Treat resource investment as the hardest evidence",
      "Cross-check attribution through key interviews"
    ],
    formula: {
      name: "People-Reading Model",
      expression: "Trustworthiness = Pressure Behavior × Resource Investment − Statement Error",
      explanation: "Collect evidence first, then decide how much trust to grant."
    },
    workedExamples: [
      {
        title: "Core member in a new team",
        scenario: "A member says they support you but still controls who sees critical information.",
        application:
          "Run the formula: stated support is positive, resource investment is negative, so do not grant full trust yet; add information transparency."
      },
      {
        title: "Startup cofounder",
        scenario: "A cofounder constantly describes client relationships but rarely appears at delivery.",
        application:
          "Separate relationship claims from delivery behavior and verify real client feedback first."
      }
    ],
    roleApplications: {
      parachute: "Use it in the first weeks to tell real allies from surface welcome.",
      founder: "Use it to see which cofounder truly invests time and cash.",
      highPotential: "Use it to see who converts verbal cross-department support into resources."
    },
    questionDetails: {
      "train-insight-1": {
        solutionSteps: [
          "Do not jump to a conclusion; list evidence",
          "Collect time, responsibility, and attention under pressure",
          "Judge which evidence matters most for the job result"
        ],
        referenceAnswer: "How they allocate time, responsibility, and attention under pressure."
      },
      "train-insight-2": {
        solutionSteps: [
          "Separate public commitment from resource investment",
          "Check whether time, budget, and attention flow to the goal",
          "Conclude that more behavioral evidence is needed"
        ],
        referenceAnswer: "Motives and actions are inconsistent; keep collecting behavioral evidence."
      },
      "train-insight-3": {
        solutionSteps: [
          "Remove the easiest evidence to fake: words",
          "Watch sustained resource flows",
          "Calibrate other people's opinions with behavior"
        ],
        referenceAnswer: "Watch where they consistently invest time, budget, and attention."
      }
    }
  },
  deploy: {
    problemPrompt:
      "You have candidates who are loyal, senior, or capable, but you are not sure who the role really needs.",
    analogy:
      "Like choosing the best method for a problem: first read what the problem requires, then see which method solves which part.",
    applicationPoints: [
      "Define the job result before comparing people",
      "Rank capability evidence by the result",
      "Allow weaknesses that do not block the core result",
      "Use checkpoints to verify delegation"
    ],
    formula: {
      name: "Person-Role Fit Model",
      expression: "Fit = Job Result × Capability Evidence − Blocking Weakness",
      explanation: "A weakness only subtracts when it blocks the core result."
    },
    workedExamples: [
      {
        title: "Key role after arriving",
        scenario: "Candidate A has average seniority but knows the systems; Candidate B is senior but avoids digitalization.",
        application:
          "If the role must drive digitalization, Candidate A's systems knowledge is the core evidence."
      },
      {
        title: "Project lead for high-potential work",
        scenario: "One person executes well but communicates little; another communicates well but delays delivery.",
        application:
          "If delivery is the core result, prioritize execution evidence and compensate the communication gap with a partner."
      }
    ],
    roleApplications: {
      parachute: "Keep restructuring lists from being captured by loyalty and seniority.",
      founder: "Decide whether to rely on a star person or build a system.",
      highPotential: "Use job results to define whom you recommend without positional power."
    },
    questionDetails: {
      "train-deploy-1": {
        solutionSteps: [
          "Define what the role must deliver",
          "Translate the result into capability evidence",
          "Compare candidates against that evidence"
        ],
        referenceAnswer: "Define the job result, then match capability evidence."
      },
      "train-deploy-2": {
        solutionSteps: [
          "List the core job results",
          "Check whether the weakness blocks one of them",
          "Accept if not blocked; compensate if blocked"
        ],
        referenceAnswer: "Assess whether the weakness blocks the core result."
      },
      "train-deploy-3": {
        solutionSteps: [
          "Define the deliverable before delegating",
          "Define the decision boundary",
          "Set checkpoints"
        ],
        referenceAnswer: "The deliverable and the decision boundary."
      }
    }
  },
  mobilize: {
    problemPrompt:
      "You have a good plan, but the team resists. You do not want to suppress them, and you do not want to abandon progress.",
    analogy:
      "Like a team dynamics problem: resistance is not the enemy; it is one of the most important known conditions.",
    applicationPoints: [
      "Listen for the real information in opposition",
      "Turn concerns into plan preconditions",
      "Give the opponent pilot responsibility",
      "Replace positions with a shared result"
    ],
    formula: {
      name: "Mobilization Model",
      expression: "Commitment = Shared Result × Participation − Fear Cost",
      explanation: "More participation makes an opponent easier to turn into an ally."
    },
    workedExamples: [
      {
        title: "First change after arriving",
        scenario: "The operations leader opposes a new process because it may slow delivery.",
        application:
          "Make delivery protection a precondition and put that leader in charge of the pilot."
      },
      {
        title: "Cross-functional collaboration",
        scenario: "Product and sales blame each other and no one wants to lead.",
        application:
          "Define the shared customer result, then ask each side to place one person in a joint war room."
      }
    ],
    roleApplications: {
      parachute: "Turn a senior opponent into the first owner of change.",
      founder: "Help veteran employees move from questioning growth to protecting cash flow.",
      highPotential: "Attract cross-functional participants with a shared result when you have no authority."
    },
    questionDetails: {
      "train-mobilize-1": {
        solutionSteps: [
          "Extract the concern before judging right or wrong",
          "Use it as a plan correction",
          "Invite the opponent to own a pilot"
        ],
        referenceAnswer: "Turn the opponent's concern into a plan precondition."
      },
      "train-mobilize-2": {
        solutionSteps: [
          "Find a small goal that can be won quickly",
          "Give the team a shared responsibility",
          "Use one winnable result to rebuild confidence"
        ],
        referenceAnswer: "Give them a winnable small goal and shared responsibility."
      },
      "train-mobilize-3": {
        solutionSteps: [
          "Find the customer or result both departments share",
          "Translate the dispute into division of labor under that result",
          "Use the shared goal to constrain action"
        ],
        referenceAnswer: "Redefine the shared customer or result."
      }
    }
  },
  strategy: {
    problemPrompt:
      "You have no formal authority or enough resources, but you must move an important initiative forward.",
    analogy:
      "Like a potential-energy problem: accumulate small wins first, then amplify them; do not rush to claim the highest title.",
    applicationPoints: [
      "Find the small result the grantor truly cares about",
      "Use a two-week verifiable win to trade for resources",
      "Keep key people synchronized",
      "Claim formal power only when momentum is enough"
    ],
    formula: {
      name: "Power Momentum Model",
      expression: "Momentum = Small Win × Grantor Trust × Information Sync",
      explanation: "Missing any factor delays the authority you need."
    },
    workedExamples: [
      {
        title: "The new executive's 90 days",
        scenario: "The CEO gives a goal but no budget or appointment authority.",
        application:
          "Choose a verifiable small project, win it, then negotiate authority with the result."
      },
      {
        title: "Founder cash flow",
        scenario: "Investment has not arrived and the team needs supplies.",
        application:
          "Produce a verifiable order or minimum product, then trade that progress for a clearer resource commitment."
      }
    ],
    roleApplications: {
      parachute: "Use first-week wins to earn CEO authority and team trust.",
      founder: "Use cash-flow validation to earn support from investors, suppliers, and the team.",
      highPotential: "Use project milestones to earn senior support for the project."
    },
    questionDetails: {
      "train-strategy-1": {
        solutionSteps: [
          "Find a small start that does not require authority",
          "Produce a verifiable result quickly",
          "Trade the result for authority"
        ],
        referenceAnswer: "Create a small win first, then trade it for authority."
      },
      "train-strategy-2": {
        solutionSteps: [
          "Turn the resource request into a testable hypothesis",
          "Prove it with a minimal result",
          "Use the result to support a larger request"
        ],
        referenceAnswer: "Show a verifiable small result first."
      },
      "train-strategy-3": {
        solutionSteps: [
          "Analyze where the competitor's advantage comes from",
          "Find a differentiated node they cannot copy",
          "Invest resources there"
        ],
        referenceAnswer: "Find a differentiated advantage they cannot copy."
      }
    }
  },
  authority: {
    problemPrompt:
      "You just took over, but people bypass your decisions or do not seriously execute them.",
    analogy:
      "Like a credibility equation: power comes not from how loudly you claim it, but from how many times rules are honored.",
    applicationPoints: [
      "Define which decisions must enter a closed loop",
      "Publish one consistent standard",
      "Build credibility with one act of follow-through",
      "Bring bypassing back into process"
    ],
    formula: {
      name: "Authority Credibility Model",
      expression: "Credibility = Consistent Standard × Follow-Through − Exceptions",
      explanation: "More exceptions make the boundary blurrier."
    },
    workedExamples: [
      {
        title: "New executive",
        scenario: "The team verbally accepts your system but returns to old habits next week.",
        application:
          "Create a joint approval form and take the first bypassed decision back into the process, publishing the result."
      },
      {
        title: "Founder being bypassed",
        scenario: "A cofounder goes directly to investors around the CEO.",
        application:
          "Establish a major-decision approval mechanism without public humiliation, and let the process block the next attempt."
      }
    ],
    roleApplications: {
      parachute: "Turn new-executive authority from personal force into organizational process.",
      founder: "Use board and finance approvals to protect founder decision boundaries.",
      highPotential: "Use a project charter and acceptance authority to protect project leadership."
    },
    questionDetails: {
      "train-authority-1": {
        solutionSteps: [
          "List the decision standards the team must follow",
          "Prove the standards with a verifiable result",
          "Let authority rest on results, not emotion"
        ],
        referenceAnswer: "Clear, consistent decision standards and verifiable results."
      },
      "train-authority-2": {
        solutionSteps: [
          "Avoid treating bypassing as a personal attack",
          "Pull key decisions into a joint approval process",
          "Let the process enforce the boundary"
        ],
        referenceAnswer: "Use a joint approval process to redefine the boundary."
      },
      "train-authority-3": {
        solutionSteps: [
          "Confirm the facts in the question",
          "Compare facts with the decision standard",
          "Adjust if correct, explain if not"
        ],
        referenceAnswer: "Confirm the facts first, then decide whether to adjust."
      }
    }
  },
  stability: {
    problemPrompt:
      "When you leave, the team stops. When you take one day off, problems pile up. You want the organization to stop depending on you.",
    analogy:
      "Like an organizational continuity problem: the answer is not a substitute person, it is making key judgments reusable.",
    applicationPoints: [
      "Inventory high-frequency personal judgments",
      "Capture checklists and review libraries",
      "Harden decision loops with systems",
      "Give successors a supported transition"
    ],
    formula: {
      name: "Organizational Resilience Model",
      expression: "Resilience = Judgment Checklists × Replication × Successor Runway",
      explanation: "The factors multiply; missing one reduces resilience."
    },
    workedExamples: [
      {
        title: "Executive about to be promoted",
        scenario: "Every crisis still needs your personal intervention.",
        application:
          "Write your crisis-handling process into a one-page checklist and let the team rehearse it."
      },
      {
        title: "Founder taking a break",
        scenario: "Orders, hiring, and support all stop when you leave.",
        application:
          "Create duty-decision rules and hand the three most frequent judgment types to the bench."
      }
    ],
    roleApplications: {
      parachute: "Turn the judgment methods you built into a department operating manual.",
      founder: "Turn founder instinct into company decision rules cofounders can execute.",
      highPotential: "Turn personal relationships into project handoff documents and checklists."
    },
    questionDetails: {
      "train-stability-1": {
        solutionSteps: [
          "Find the high-frequency judgments the organization depends on",
          "Write them as checklists",
          "Hand over the review cases with them"
        ],
        referenceAnswer: "High-frequency judgment checklists and a decision review library."
      },
      "train-stability-2": {
        solutionSteps: [
          "Identify decisions the team must reuse",
          "Turn judgment logic into process",
          "Let process replace personal reaction speed"
        ],
        referenceAnswer: "Turn key decisions into reusable processes."
      },
      "train-stability-3": {
        solutionSteps: [
          "Break the core capability into teachable parts",
          "Teach deliberately and upgrade your own next skill",
          "Make capability an organizational asset"
        ],
        referenceAnswer: "Upgrade to a higher-order capability and teach deliberately."
      }
    }
  },
  recovery: {
    problemPrompt:
      "You are under continuous pressure, emotionally unstable, and running low on energy, but the project cannot stop.",
    analogy:
      "Like an energy conservation problem: before trying to recharge fully, stop the continued energy leak.",
    applicationPoints: [
      "Notice energy-decline signals",
      "Leave the scene to cool down",
      "Find the top three drains",
      "Set a recovery boundary and a minimum next action"
    ],
    formula: {
      name: "Sustainable State Model",
      expression: "State = Signal Awareness + Recovery Boundary − Internal Friction",
      explanation: "Stop the loss first, recover second, accelerate last."
    },
    workedExamples: [
      {
        title: "New executive overworking",
        scenario: "Meetings and firefighting fill the day, followed by sleepless nights.",
        application:
          "Cut two meetings that do not produce results and protect the morning for key decisions."
      },
      {
        title: "Founder under cash-flow pressure",
        scenario: "You cannot sleep from anxiety but are afraid to pause any work.",
        application:
          "Set a daily 30-minute phone-free recovery period and put anxiety in a review note, not into the team."
      }
    ],
    roleApplications: {
      parachute: "Protect judgment quality during the high-pressure first months.",
      founder: "Preserve decision clarity when cash flow is uncertain.",
      highPotential: "Use recovery boundaries to keep professional judgment intact under project overload."
    },
    questionDetails: {
      "train-recovery-1": {
        solutionSteps: [
          "Recognize the energy-decline signal",
          "Move high-value work to high-energy periods",
          "Create an uninterrupted recovery period"
        ],
        referenceAnswer: "Set a recovery boundary and put important work in high-energy periods."
      },
      "train-recovery-2": {
        solutionSteps: [
          "Leave the scene first",
          "Let the body and emotions cool down",
          "Avoid using more work to mask depletion"
        ],
        referenceAnswer: "Leave the scene and let your body and emotions cool down."
      },
      "train-recovery-3": {
        solutionSteps: [
          "List the most exhausting recent tasks",
          "Find the top three drains",
          "Handle the drains before trying to recharge"
        ],
        referenceAnswer: "Check the three tasks that consume the most energy."
      }
    }
  },
  execution: {
    problemPrompt:
      "The goal is large, time is short, and the team is busy, but you cannot tell whether everyone is doing the most important work.",
    analogy:
      "Like a word problem: first write the required result, then assign owners and acceptance criteria to each step, instead of filling the page with work.",
    applicationPoints: [
      "Break out three key results",
      "Cut low-value work",
      "Assign an owner to every result",
      "Use fixed milestone checkpoints"
    ],
    formula: {
      name: "Key Result Delivery Model",
      expression: "Delivery = Key Results × Owner × Checkpoints",
      explanation: "If any factor is zero, execution spins without delivery."
    },
    workedExamples: [
      {
        title: "End-of-quarter sprint",
        scenario: "The goal gap is 30% and the team is already working overtime.",
        application:
          "Cut two non-core projects and focus overtime on the key result with the largest gap."
      },
      {
        title: "New product launch",
        scenario: "Requirements, design, and engineering each do their own thing.",
        application:
          "Use one launch acceptance checklist and check three key results every Tuesday."
      }
    ],
    roleApplications: {
      parachute: "Translate the 90-day goal into verifiable departmental key results.",
      founder: "Use cash flow and product-validation results instead of visible busyness.",
      highPotential: "Use milestones and acceptance checklists to organize delivery without command authority."
    },
    questionDetails: {
      "train-execution-1": {
        solutionSteps: [
          "Find the key result with the largest gap",
          "Cut work that does not support it",
          "Concentrate resources there"
        ],
        referenceAnswer: "Identify key results and cut low-value work."
      },
      "train-execution-2": {
        solutionSteps: [
          "Compare the new task with key results",
          "Decide whether it changes core delivery",
          "Defer it if not; reorder priorities if yes"
        ],
        referenceAnswer: "Judge whether it affects a key result first."
      },
      "train-execution-3": {
        solutionSteps: [
          "Set a fixed review cadence",
          "Check each review against key results",
          "Use checkpoints to expose risk early"
        ],
        referenceAnswer: "Fixed milestone checkpoints."
      }
    }
  },
  structure: {
    problemPrompt:
      "The problem is vague, information is abundant, and you do not know where to start or which variable deserves investment.",
    analogy:
      "Like a multivariable problem: do not calculate every number; find the variable that changes many others when it changes.",
    applicationPoints: [
      "Write a clear problem definition",
      "Identify key variables and causal chains",
      "Find the main contradiction",
      "Validate with a small experiment"
    ],
    formula: {
      name: "Leverage Solution Model",
      expression: "Solution Effect = Main Contradiction × Key Variable × Validation Speed",
      explanation: "Invest in the node that moves the whole system."
    },
    workedExamples: [
      {
        title: "Customer churn",
        scenario: "Support, product, and sales give different explanations.",
        application:
          "Map the customer journey causal chain and find the earliest churn point instead of changing everything."
      },
      {
        title: "Organizational friction",
        scenario: "Departments blame each other and processes slow down.",
        application:
          "Find the approval node that blocks 80% of documents and fix that node first."
      }
    ],
    roleApplications: {
      parachute: "Use causal chains to diagnose the real problem beneath surface reports.",
      founder: "Separate cash-flow loss, product blockers, and team bottlenecks to find leverage.",
      highPotential: "Define problem boundaries in ambiguous projects so collaboration has a shared structure."
    },
    questionDetails: {
      "train-structure-1": {
        solutionSteps: [
          "Write the problem definition and judgment criteria",
          "Break out key variables",
          "Turn ambiguity into a testable structure"
        ],
        referenceAnswer: "Define the problem boundary, then break out key variables."
      },
      "train-structure-2": {
        solutionSteps: [
          "Find the shared conditions behind recurrence",
          "Analyze how the conditions reinforce each other",
          "Repair system conditions, not just one point"
        ],
        referenceAnswer: "Analyze the system conditions that cause it."
      },
      "train-structure-3": {
        solutionSteps: [
          "Clarify the goal first",
          "Use the goal to filter key variables",
          "Map the causal chain to find the most influential node"
        ],
        referenceAnswer: "Map key variables and causal chains against the goal."
      }
    }
  },
  communication: {
    problemPrompt:
      "You think you have explained yourself clearly, but others misunderstand, and after the meeting everyone still does their own thing.",
    analogy:
      "Like a translation problem: first confirm both sides read the same question, then write the answer, instead of repeating the same sentence ten times.",
    applicationPoints: [
      "Restate the other side's understanding first",
      "Return to a shared customer or result",
      "Use questions instead of conclusions",
      "Lock the goal, owner, and deadline"
    ],
    formula: {
      name: "Shared Alignment Model",
      expression: "Alignment = Restated Understanding × Shared Goal × Action Loop",
      explanation: "If any part is missing, communication stays at the surface."
    },
    workedExamples: [
      {
        title: "Cross-functional meeting",
        scenario: "Engineering says requirements are unclear; product says engineering will not cooperate.",
        application:
          "Restate both pain points, make the customer acceptance standard the shared goal, and use a one-page note to lock owners."
      },
      {
        title: "Upward communication",
        scenario: "You present a plan and the leader only says, think about it again.",
        application:
          "Restate the concern you heard, add a validation checkpoint, and turn the open question into a next action."
      }
    ],
    roleApplications: {
      parachute: "Use a one-page consensus document to reduce information gaps after arriving.",
      founder: "Use a shared cash-flow goal to stop product, sales, and engineering from blaming each other.",
      highPotential: "Use restatement and meeting notes to create an action loop without authority."
    },
    questionDetails: {
      "train-communication-1": {
        solutionSteps: [
          "Restate both sides' requests",
          "Find a shared customer or result",
          "Turn the dispute into division under the shared goal"
        ],
        referenceAnswer: "Restate both sides' concerns, then redefine the shared goal."
      },
      "train-communication-2": {
        solutionSteps: [
          "Confirm what the other person heard",
          "Find the key difference in understanding",
          "Add missing information instead of repeating the point"
        ],
        referenceAnswer: "Restate their understanding, then add the missing information."
      },
      "train-communication-3": {
        solutionSteps: [
          "Lock the shared goal first",
          "Name the owner",
          "Agree on the deadline"
        ],
        referenceAnswer: "Shared goal, owner, and deadline."
      }
    }
  }
};

export function expandTrainingEn(
  path: AbilityTrainingEn
): ExpandedAbilityTrainingEn {
  const extras = TRAINING_EXTRAS_EN[path.abilityId];
  return {
    ...path,
    ...extras,
    questions: path.questions.map((question) => ({
      ...question,
      ...extras.questionDetails[question.id]
    }))
  };
}

export const EXPANDED_TRAINING_EN = Object.fromEntries(
  Object.keys(TRAINING_EN).map((abilityId) => [
    abilityId,
    expandTrainingEn(TRAINING_EN[abilityId as AbilityId])
  ])
) as Record<AbilityId, ExpandedAbilityTrainingEn>;
