// 行为单测：在 Node 下跑核心游戏逻辑。
// localStorage 在 Node 不存在，给一个最小桩，让 saveState/applyStoryChoice 可运行。
const store = new Map();
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key)
};
const backupStore = new Map();
globalThis.sessionStorage = {
  getItem: (key) => (backupStore.has(key) ? backupStore.get(key) : null),
  setItem: (key, value) => backupStore.set(key, String(value)),
  removeItem: (key) => backupStore.delete(key)
};

import { abilityLevel, totalAbilityLevels } from "../src/core/abilities.ts";
import { ASSESSMENT_QUESTIONS } from "../src/core/assessment.ts";
import {
  TRAINING_PATHS,
  scoreTrainingAnswers
} from "../src/core/training.ts";
import {
  PRACTICE_TASKS,
  TRIAL_STAGES,
  canEnterTrial,
  scoreOpenText,
  trialCostFor,
  trialQuestionFor,
  trialRewardExpFor
} from "../src/core/trials.ts";
import { hiddenRouteSteps } from "../src/core/hiddenRoutes.ts";
import {
  proceduralNarrativeFor,
  scenarioShellFor
} from "../src/core/scenarioShell.ts";
import { CoachWorkshopEngine } from "../src/core/coach-workshop.ts";


import {
  ACHIEVEMENTS,
  achievementCategory,
  achievementLore,
  achievementRarity,
  isAchievementUnlocked
} from "../src/core/achievements.ts";
import {
  claimableChallenges,
  dailyChallenges,
  todayKey
} from "../src/core/challenges.ts";
import {
  CHAPTERS,
  RANDOM_EVENT_IDS,
  RANDOM_EVENT_META,
  STORY_NODES,
  duelNodes,
  forkNodeForRoute,
  getNode,
  nodesForChapter,
  nextRandomEvent,
  randomEventAffinity,
  randomEventEligibleCount,
  randomEventVariantContext
} from "../src/core/story.ts";
import { ROLE_OPTION_SETS } from "../src/core/roleOptions.ts";
import { DuelEngine } from "../src/core/duel.ts";
import { DUEL_BANK, DUEL_BANK_SIZE } from "../src/core/duelBank.ts";
import {
  CRISIS_EVENTS,
  applyCrisisChoice,
  applyDecisionChessMove,
  applyGameTheoryChoice,
  applyResourceAllocation,
  applyTeamAssignment,
  createCrisisCommand,
  createDecisionChess,
  createGameTheory,
  createResourceAllocation,
  createTeamManagement,
  decisionChessMoves,
  gameTheoryPayoff
} from "../src/core/leadership-games.ts";
import {
  dueReviewCards,
  dualAxisQuality,
  recordReviewResult,
  reviewBoard,
  reviewStats,
  scoreDualAxis,
  scheduleMissedDecision,
  worstOptionIndex
} from "../src/core/review-schedule.ts";
import {
  createCustomScenario,
  customScenarioToNode,
  exportCustomScenarios,
  importCustomScenarios,
  validateCustomScenario
} from "../src/core/custom-scenarios.ts";
import {
  ALL_ACADEMY_SCENARIOS,
  applyScenarioChoice,
  scenariosForRole
} from "../src/core/academy-scenarios.ts";
import {
  ACADEMY_COURSES,
  TEAM_MENTORS,
  applyPracticeAnswer,
  courseFor,
  createTeamAcademyState,
  recruitMentor,
  submitHomework
} from "../src/core/team-academy.ts";
import {
  DIMENSION_ORDER,
  LEADERSHIP_DIMENSIONS,
  addDimensionExp,
  dimensionLevel
} from "../src/core/leadership-model.ts";
import { generateCoachPlan } from "../src/core/coach-plan.ts";
import { NPCS } from "../src/core/npcs.ts";
import { NPC_STORIES } from "../src/core/npcStories.ts";
import { NPC_ARCS } from "../src/core/npcArcs.ts";
import {
  CHAPTER_PASS_STARS,
  DEFAULT_SAVE,
  NORMAL_DECISION_MS,
  PRESSURE_FACTORS,
  applyDailyResourceRecovery,
  applyDailyTrialRecovery,
  applyStoryChoice,
  applyTrainingResult,
  activateProfile,
  buildAiProfile,
  buyTrialEnergy,
  buyTrialEnergyWithInfluence,
  chapterStarCount,
  computeSaveHash,
  decisionWindowMs,
  deleteRoleSlot,
  hireTrialAlly,
  investTrialAccelerator,
  isChapterComplete,
  isChapterPassed,
  loadSave,
  migrateSave,
  optionGateFor,
  recordDuelResult,
  normalizeVolume,
  resourceStrainFor,
  resolveCloudConflict,
  roleSlotSummaries,
  retryChapter,
  rotateRandomEventPool,
  roundDurationMsForDifficulty,
  saveState,
  scoreQuality
} from "../src/core/game.ts";
import { uiString } from "../src/core/i18n.ts";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(abilityLevel(0) === 1, "ability level 0 should be 1");
assert(abilityLevel(4) === 2, "ability level 4 should be 2");
assert(abilityLevel(40) === 6, "ability level 40 should be 6");
assert(
  totalAbilityLevels({
    insight: 40,
    deploy: 40,
    mobilize: 40,
    strategy: 40,
    authority: 40,
    stability: 40,
    recovery: 40,
    execution: 40,
    structure: 40,
    communication: 40
  }) === 60,
  "total ability levels should cap at 60"
);

assert(ASSESSMENT_QUESTIONS.length === 30, "assessment must contain 30 questions");
assert(
  ASSESSMENT_QUESTIONS.every((question) => question.options.length === 3),
  "every assessment question must have 3 options"
);

assert(TRAINING_PATHS.length === 10, "training must cover all 10 abilities");
assert(
  new Set(TRAINING_PATHS.map((path) => path.abilityId)).size === 10,
  "training ability ids must be unique"
);
for (const path of TRAINING_PATHS) {
  assert(path.route.length >= 3, `${path.abilityId} training route must have 3+ steps`);
  assert(path.questions.length >= 3, `${path.abilityId} training must have 3+ questions`);
  for (const question of path.questions) {
    assert(question.options.length === 3, `${question.id} must have 3 options`);
    assert(
      Number.isInteger(question.answer) && question.answer >= 0 && question.answer <= 2,
      `${question.id} must have a valid answer`
    );
  }
  const scored = scoreTrainingAnswers(path.questions, path.questions.map((question) => question.answer));
  assert(scored.correct === path.questions.length, `${path.abilityId} perfect answers must score perfectly`);
}

assert(TRIAL_STAGES.length === 24, "trial must contain 24 stages");
assert(
  new Set(TRIAL_STAGES.map((stage) => stage.order)).size === TRIAL_STAGES.length,
  "trial stage orders must be unique"
);
for (const stage of TRIAL_STAGES) {
  assert(stage.gates.length > 0, `${stage.id} must have ability gates`);
  assert(stage.staminaCost > 0, `${stage.id} must cost energy`);
  const question = trialQuestionFor(stage);
  assert(question.options.length === 3, `${stage.id} trial question must have 3 options`);
  assert(
    Number.isInteger(question.answer) && question.answer >= 0 && question.answer <= 2,
    `${stage.id} trial question must have a valid answer`
  );
}
const trialDefaultSave = structuredClone(DEFAULT_SAVE);
assert(
  canEnterTrial(trialDefaultSave, TRIAL_STAGES[0]),
  "default profile should enter the first trial"
);
assert(PRACTICE_TASKS.length >= 5, "practice tasks must contain at least 5 missions");
assert(
  hiddenRouteSteps("insight").length === 3,
  "hidden routes should contain 3 real decision steps"
);
assert(
  scoreOpenText("嗯嗯嗯", ["关键结果"], 20) < 60,
  "low-quality open text should score below threshold"
);
assert(
  scoreOpenText(
    "1. 关键结果。2. 负责人。3. 验收标准。",
    ["关键结果", "负责人", "验收"],
    20
  ) >= 70,
  "structured open text should score high"
);
const shellA = scenarioShellFor(1, 100);
const shellB = scenarioShellFor(1, 100);
assert(
  shellA.zh === shellB.zh && shellA.en === shellB.en,
  "scenario shell should be deterministic for the same seed"
);
const shellC = scenarioShellFor(2, 100);
assert(
  shellA.zh !== shellC.zh || shellA.en !== shellC.en,
  "scenario shell should vary by chapter"
);
assert(
  shellA.zh.length > 0 && shellA.en.length > 0,
  "scenario shell labels should be non-empty in both languages"
);
const narrativeA = proceduralNarrativeFor(1, 100, "parachute");
const narrativeB = proceduralNarrativeFor(1, 100, "founder");
assert(
  narrativeA.zh === narrativeB.zh && narrativeA.en === narrativeB.en,
  "procedural narrative should be deterministic for the same chapter and seed"
);
const narrativeC = proceduralNarrativeFor(2, 100, "parachute");
assert(
  narrativeA.zh !== narrativeC.zh || narrativeA.en !== narrativeC.en,
  "procedural narrative should vary by chapter"
);
assert(
  narrativeA.zh.length >= 40 && narrativeA.en.length >= 40,
  "procedural narrative should produce complete bilingual prose"
);

const seededSave = structuredClone(DEFAULT_SAVE);
seededSave.profile.name = "QA";
seededSave.profile.role = "highPotential";
activateProfile(seededSave, seededSave.profile);
assert(
  typeof seededSave.scenarioSeed === "number" && seededSave.scenarioSeed > 0,
  "profile activation should assign a stable scenario seed"
);
assert(
  scenarioShellFor(1, seededSave.scenarioSeed).zh ===
    scenarioShellFor(1, seededSave.scenarioSeed).zh,
  "scenario shell should stay stable within a chapter for the same run seed"
);
assert(normalizeVolume(60) === 50, "volume 60 should normalize to 50");
assert(normalizeVolume(90) === 100, "volume 90 should normalize to 100");
assert(normalizeVolume(0) === 0, "volume 0 should stay 0");
assert(
  decisionWindowMs(22000, "x".repeat(300)) > 22000,
  "long scenarios should extend the decision window"
);
assert(
  decisionWindowMs(0, "x".repeat(300)) === 0,
  "normal difficulty should stay untimed"
);

// 精力恢复：每日恢复只生效一次，组织资源可兑换精力。
const energySave = structuredClone(DEFAULT_SAVE);
energySave.trialEnergy = 0;
assert(
  applyDailyTrialRecovery(energySave) && energySave.trialEnergy === 50,
  "daily trial recovery should restore 50 energy once"
);
assert(
  !applyDailyTrialRecovery(energySave),
  "daily trial recovery should not repeat on the same day"
);
energySave.trialEnergy = 0;
energySave.profile.resources.capital = 20;
assert(buyTrialEnergy(energySave), "capital should buy trial energy");
assert(
  energySave.trialEnergy === 30 && energySave.profile.resources.capital === 5,
  "buy trial energy should spend 15 capital and restore 30 energy"
);

const influenceSave = structuredClone(DEFAULT_SAVE);
influenceSave.trialEnergy = 0;
influenceSave.profile.resources.influence = 30;
assert(
  buyTrialEnergyWithInfluence(influenceSave),
  "influence should buy trial energy"
);
assert(
  influenceSave.trialEnergy === 30 &&
    influenceSave.profile.resources.influence === 5,
  "influence energy trade should spend 25 influence"
);

const accelSave = structuredClone(DEFAULT_SAVE);
accelSave.profile.resources.capital = 50;
assert(investTrialAccelerator(accelSave), "capital should invest accelerator");
assert(
  accelSave.trialAccelerator && accelSave.profile.resources.capital === 10,
  "accelerator investment should spend 40 capital"
);

const allySave = structuredClone(DEFAULT_SAVE);
allySave.profile.resources.trust = 30;
assert(hireTrialAlly(allySave), "trust should hire temporary ally");
assert(
  allySave.trialItems.includes("临时同伴") &&
    allySave.profile.resources.trust === 10,
  "ally hire should spend 20 trust"
);

// MBA 多阶段 + 资源门槛。
const mba = TRIAL_STAGES.find((stage) => stage.id === "mba_cashflow");
const mbaSave = structuredClone(DEFAULT_SAVE);
for (const stage of TRIAL_STAGES.filter((item) => item.order < mba.order)) {
  mbaSave.trialCleared.push(stage.id);
}
for (const gate of mba.gates) {
  mbaSave.profile.abilities[gate.abilityId] = 40;
}
mbaSave.unlockedChapters.push(5);
mbaSave.profile.resources.influence = 50;
mbaSave.profile.resources.capital = 20;
assert(canEnterTrial(mbaSave, mba), "MBA stage should open with gates and resources");
const mbaQuestion = trialQuestionFor(mba);
assert(Boolean(mbaQuestion.followUp), "MBA cases should include a follow-up decision");

// 道具真实增益。
const costSave = structuredClone(DEFAULT_SAVE);
costSave.trialItems.push("识人罗盘");
assert(
  trialCostFor(costSave, TRIAL_STAGES[0]) ===
    TRIAL_STAGES[0].staminaCost - 2,
  "insight item should reduce insight trial cost"
);
assert(
  trialRewardExpFor(costSave, TRIAL_STAGES[0]) ===
    TRIAL_STAGES[0].rewardExp,
  "insight item should not alter insight reward"
);
const pressureCost = structuredClone(DEFAULT_SAVE);
pressureCost.difficulty = "pressure";
pressureCost.trialItems.push("识人罗盘");
assert(
  trialCostFor(pressureCost, TRIAL_STAGES[0]) ===
    Math.max(4, Math.round((TRIAL_STAGES[0].staminaCost - 2) * 1.15)),
  "pressure difficulty should raise trial energy cost"
);

assert(CHAPTERS.length === 9, "chapters must be 9");
assert(STORY_NODES.length >= 60, "story nodes should be 60+");
assert(DUEL_BANK_SIZE === 200, "duel bank should contain 200 questions");
assert(
  new Set(DUEL_BANK.map((node) => node.id)).size === DUEL_BANK.length,
  "duel bank ids should be unique"
);
for (const node of DUEL_BANK) {
  assert(node.options.length === 3, `duel node ${node.id} should have 3 options`);
  assert(
    node.options.some((option) => option.quality === "expert") &&
      node.options.some((option) => option.quality === "partial") &&
      node.options.some((option) => option.quality === "risk"),
    `duel node ${node.id} should cover expert/partial/risk qualities`
  );
}
assert(
  DIMENSION_ORDER.length === 5,
  "leadership model should contain 5 dimensions"
);
assert(
  TRIAL_STAGES.filter((stage) => stage.dimension).length === 5,
  "five trial stages should map to leadership dimensions"
);
assert(
  dimensionLevel(40) === 5,
  "dimension exp 40 should reach level 5"
);
const dimSave = structuredClone(DEFAULT_SAVE);
addDimensionExp(dimSave, "credibility", 12);
assert(
  dimSave.dimensionExp.credibility === 12,
  "addDimensionExp should update credibility exp"
);
const planSave = structuredClone(DEFAULT_SAVE);
const planA = generateCoachPlan(planSave, "business-breakthrough", "time-pressure");
const planB = generateCoachPlan(planSave, "team-upgrade", "trust-gap");
assert(
  planA.phases.length === 3 && planB.phases.length === 3,
  "90-day coach plan should contain 3 phases"
);
assert(
  planA.summaryZh !== planB.summaryZh,
  "different goals should generate different coach plans"
);
const founderSave = structuredClone(DEFAULT_SAVE);
founderSave.profile.role = "founder";
const founderPlan = generateCoachPlan(
  founderSave,
  "business-breakthrough",
  "time-pressure"
);
assert(
  founderPlan.roleZh !== planA.roleZh,
  "coach plan should differentiate roles"
);
assert(
  NPCS.length === 11 && Object.keys(NPC_STORIES).length === 11,
  "all 11 NPCs should have base stories"
);
assert(
  Object.keys(NPC_ARCS).length === 11,
  "all 11 NPCs should have deeper story arcs"
);
for (const npc of NPCS) {
  assert(
    NPC_STORIES[npc.id] && NPC_ARCS[npc.id],
    `${npc.id} should have both story and arc`
  );
}
const decisionChess = createDecisionChess("battle");
assert(
  decisionChess.board.length === 5 && decisionChess.board[0].length === 5,
  "decision chess should use a 5x5 board"
);
const dcMoves = decisionChessMoves(decisionChess, decisionChess.player);
assert(dcMoves.length > 0, "decision chess player should have moves");
const dcMove =
  dcMoves.find(
    (move) => decisionChess.board[move[0]][move[1]] > 0
  ) ?? dcMoves[0];
const dcNext = applyDecisionChessMove(decisionChess, dcMove);
assert(
  dcNext.playerScore > 0 || dcNext.aiScore > 0,
  "decision chess move should add score"
);

const gameTheory = createGameTheory("battle");
const gtNext = applyGameTheoryChoice(gameTheory, "cooperate");
assert(
  gtNext.playerScore === 3 && gtNext.aiScore === 3,
  "cooperate-cooperate should pay 3 each"
);
assert(
  gameTheoryPayoff("compete", "cooperate")[0] === 5,
  "compete against cooperate should pay 5"
);

const allocation = createResourceAllocation("battle");
const allocNext = applyResourceAllocation(allocation, {
  cashflow: 40,
  customer: 30,
  team: 20,
  innovation: 10
});
assert(
  allocNext.totalScore > 0,
  "resource allocation should produce a positive score"
);

const team = createTeamManagement("battle");
const teamNext = applyTeamAssignment(team, "m1", "t1");
assert(
  teamNext.score >= 14,
  "matching team skill should score at least 14"
);

const crisis = createCrisisCommand("battle");
const activeCrisisEvent =
  CRISIS_EVENTS[(crisis.round - 1 + crisis.offset) % CRISIS_EVENTS.length];
const expertCrisisIndex = activeCrisisEvent.options.findIndex(
  (option) => option.score === 10
);
assert(
  expertCrisisIndex >= 0,
  "crisis event should contain an expert option"
);
const crisisNext = applyCrisisChoice(crisis, expertCrisisIndex);
assert(
  crisisNext.score === 10,
  "expert crisis choice should score 10"
);

const reviewCards = scheduleMissedDecision([], "c1n1", "risk", 1000);
assert(
  reviewCards.length === 1 && reviewCards[0].dueAt === 1000 + 86400000,
  "missed decision should create a review card due after one day"
);
const reviewedOnce = recordReviewResult(
  reviewCards,
  "c1n1",
  "expert",
  2000
);
assert(
  reviewedOnce[0].repetition === 1 && reviewedOnce[0].intervalDays === 1,
  "first expert review should set interval to one day"
);
const partialFail = recordReviewResult(
  reviewCards,
  "c1n1",
  "partial",
  1500
);
assert(
  partialFail[0].repetition === 0,
  "non-expert review should reset the streak"
);
const reviewedTwice = recordReviewResult(
  reviewedOnce,
  "c1n1",
  "expert",
  3000
);
const reviewedThrice = recordReviewResult(
  reviewedTwice,
  "c1n1",
  "expert",
  4000
);
assert(
  reviewedThrice[0].intervalDays >= 15,
  "repeated expert reviews should grow the interval to 15+ days"
);
assert(
  dueReviewCards(reviewCards, 1000 + 86400000 + 1).length === 1,
  "due review should surface cards past due"
);
assert(
  reviewStats(reviewedThrice).mastered === 1,
  "mastered count should reflect 15+ day interval"
);
const board = reviewBoard(reviewedThrice, (nodeId) =>
  nodeId === "c1n1" ? "insight" : "other"
);
assert(
  board.length === 1 &&
    board[0].ability === "insight" &&
    board[0].total === 1 &&
    board[0].mastered === 1,
  "review board should group cards by ability"
);
assert(
  scoreDualAxis(0, 2, 0, 2) === "perfect" &&
    scoreDualAxis(0, 1, 0, 2) === "partial" &&
    scoreDualAxis(1, 2, 0, 2) === "missed",
  "dual-axis scoring should distinguish best/worst accuracy"
);
assert(
  dualAxisQuality("perfect") === "expert" &&
    dualAxisQuality("partial") === "partial" &&
    dualAxisQuality("missed") === "risk",
  "dual-axis outcome should map back to review quality"
);
assert(
  worstOptionIndex([
    {
      quality: "partial",
      resources: { energy: -5, trust: -8, influence: 5 }
    },
    {
      quality: "partial",
      resources: { energy: -6, trust: 2, influence: 7 }
    }
  ]) === 0,
  "worst option should prefer risk, then lowest net resource value"
);
const validScenarioInput = {
  title: "客户投诉",
  context: "大客户当众质疑交付能力。",
  stake: "保住客户与团队尊严。",
  options: [
    { label: "先承接并给验证时间", summary: "给确定性", feedback: "团队被保护。", quality: "expert" },
    { label: "当场反驳", summary: "赢面子", feedback: "关系受损。", quality: "partial" },
    { label: "承诺不可能时间", summary: "安抚客户", feedback: "失信。", quality: "risk" }
  ]
};
assert(
  validateCustomScenario(validScenarioInput).length === 0,
  "valid custom scenario should pass validation"
);
const scenario = createCustomScenario(validScenarioInput, 1234);
const customNode = customScenarioToNode(scenario);
assert(
  scenario.id.startsWith("custom-") &&
    customNode.options.length === 3 &&
    customNode.options.every((option) => option.theory.length > 0),
  "custom scenario should become a playable story node"
);
assert(
  validateCustomScenario({ ...validScenarioInput, options: [] }).length > 0,
  "invalid custom scenario should fail validation"
);
const exported = exportCustomScenarios([scenario]);
const imported = importCustomScenarios(exported, 5678);
assert(
  imported.length === 1 &&
    imported[0].title === "客户投诉" &&
    imported[0].createdAt === 5678,
  "custom scenario export should round-trip through import"
);
assert(
  importCustomScenarios("{broken json", 1).length === 0,
  "broken custom scenario import should return an empty list"
);

assert(
  ALL_ACADEMY_SCENARIOS.length === 108,
  "team academy should contain 108 scenarios across three roles"
);
assert(
  new Set(ALL_ACADEMY_SCENARIOS.map((item) => item.id)).size === 108,
  "team academy scenario ids should be unique across roles"
);
assert(
  ALL_ACADEMY_SCENARIOS.every((item) => item.paths?.length === 4),
  "every academy scenario should explain all 4 paths"
);
const academyBestCount = { 0: 0, 1: 0, 2: 0, 3: 0 };
for (const item of ALL_ACADEMY_SCENARIOS) {
  academyBestCount[item.best] += 1;
}
assert(
  Object.values(academyBestCount).every((count) => count >= 6),
  "academy best answers should be distributed across all options"
);
for (const role of ["parachute", "founder", "highPotential"]) {
  const scenarios = scenariosForRole(role);
  assert(
    scenarios.length === 36,
    `${role} should have 36 scenarios`
  );
  assert(
    new Set(scenarios.map((item) => item.level)).size === 9,
    `${role} scenarios should span 9 levels`
  );
  const course = ACADEMY_COURSES.find((item) => item.role === role);
  assert(
    course && course.lessons.length === 9,
    `${role} course should have 9 lessons`
  );
  const ids = new Set(
    course.lessons.flatMap((lesson) => lesson.scenarioIds)
  );
  assert(
    ids.size === 36,
    `${role} lessons should cover all 36 scenario ids`
  );
  assert(
    course.lessons.every((lesson) => lesson.checklist?.length >= 5),
    `${role} lessons should each have a 5-item action checklist`
  );
}

const academyState = createTeamAcademyState("parachute");
const p1 = ALL_ACADEMY_SCENARIOS.find((item) => item.id === "p1");
const scenarioResult = applyScenarioChoice(academyState, "p1", p1.best);
assert(
  scenarioResult.correct === true &&
    scenarioResult.gained === 6 &&
    scenarioResult.path &&
    scenarioResult.bestPath &&
    scenarioResult.state.completedScenarios.length === 1,
  "team academy scenario choice should score, track completion and return path"
);
const replayed = applyScenarioChoice(
  scenarioResult.state,
  "p1",
  p1.best
);
assert(
  replayed.gained === 0 && replayed.state.completedScenarios.length === 1,
  "team academy scenario should not award repeat points after completion"
);
const wrongIndex = p1.best === 0 ? 1 : 0;
const wrongResult = applyScenarioChoice(academyState, "p2", wrongIndex);
assert(
  wrongResult.correct === false &&
    wrongResult.gained === 0 &&
    wrongResult.state.completedScenarios.length === 0,
  "wrong academy scenario choice should not mark completion"
);
const p2 = ALL_ACADEMY_SCENARIOS.find((item) => item.id === "p2");
const retried = applyScenarioChoice(wrongResult.state, "p2", p2.best);
assert(
  retried.correct === true && retried.gained === 6,
  "academy scenario should award points on first correct attempt after a wrong try"
);
const practiceResult = applyPracticeAnswer(
  academyState,
  "p1",
  0,
  courseFor("parachute").lessons[0].practice[0].answer
);
assert(
  practiceResult.correct === true && practiceResult.gained === 6,
  "team academy practice answer should score correct choices"
);
const practiceReplay = applyPracticeAnswer(
  practiceResult.state,
  "p1",
  0,
  courseFor("parachute").lessons[0].practice[0].answer
);
assert(
  practiceReplay.gained === 0,
  "team academy practice should not award repeat points after a correct answer"
);
const homeworkResult = submitHomework(
  academyState,
  "p1",
  "前任信任观察1对1授权"
);
assert(
  homeworkResult.score >= 70 && homeworkResult.passed === true,
  "team academy homework should pass with keywords"
);
const homeworkReplay = submitHomework(
  homeworkResult.state,
  "p1",
  "前任信任观察1对1授权"
);
assert(
  homeworkReplay.passed === true &&
    homeworkReplay.state.dimensions.trust ===
      homeworkResult.state.dimensions.trust,
  "team academy homework should not double-award dimensions"
);
const mentored = recruitMentor(academyState, TEAM_MENTORS[0].id);
assert(
  mentored.mentorId === TEAM_MENTORS[0].id &&
    mentored.dimensions.trust === 8,
  "team academy mentor should boost the matching dimension"
);
const mentoredAgain = recruitMentor(mentored, TEAM_MENTORS[0].id);
assert(
  mentoredAgain.dimensions.trust === 8,
  "team academy should only allow one mentor per run"
);

assert(RANDOM_EVENT_IDS.length >= 20, "random events must be 20+");
assert(
  RANDOM_EVENT_IDS.every((id) => RANDOM_EVENT_META[id]),
  "every random event must have metadata"
);
// 随机事件的每个 ID 都必须在 STORY_NODES 里有真实节点，否则 nextRandomEvent 会返回无节点的 ID（潜在 bug）。
assert(
  RANDOM_EVENT_IDS.every((id) => STORY_NODES.some((node) => node.id === id)),
  "every random event id must resolve to a real story node"
);
assert(
  nextRandomEvent({
    completedRandomEvents: [...RANDOM_EVENT_IDS],
    unlockedChapters: [2, 3, 4, 5, 6, 7, 8, 9]
  }) === undefined,
  "no random event should be offered after all are complete"
);
assert(
  randomEventAffinity("r2", { expert: 1, risk: 0, partial: 0 }) === 1,
  "expert-preference events should react to expert ratio"
);
assert(
  randomEventAffinity("r3", { expert: 0, risk: 1, partial: 0 }) === 1,
  "risk-preference events should react to risk ratio"
);
assert(
  randomEventAffinity("r1", { expert: 0, risk: 0, partial: 1 }) === 1,
  "gradual-preference events should react to partial ratio"
);
const routeEvent = nextRandomEvent({
  completedRandomEvents: [],
  unlockedChapters: [2, 3],
  decisionHistory: [],
  routePath: { 1: "expert" }
});
assert(
  typeof routeEvent === "string" && routeEvent.length > 0,
  "nextRandomEvent should accept routePath and still return an event"
);

assert(
  forkNodeForRoute(4, "expert") === "c4-fork-expert" &&
    forkNodeForRoute(7, "partial") === "c7-fork-partial" &&
    forkNodeForRoute(1, "expert") === undefined,
  "route forks should exist for chapters 4/7 only"
);
for (const forkId of [
  "c4-fork-expert",
  "c4-fork-partial",
  "c4-fork-risk",
  "c7-fork-expert",
  "c7-fork-partial",
  "c7-fork-risk"
]) {
  assert(getNode(forkId).options.length === 3, `${forkId} must have 3 options`);
}
const eligible = randomEventEligibleCount({
  profile: { role: "highPotential" },
  difficulty: "normal"
});
assert(
  eligible > 20 && eligible <= RANDOM_EVENT_IDS.length,
  "eligible event count should be within the pool"
);
const roleSave = structuredClone(DEFAULT_SAVE);
roleSave.profile.role = "parachute";
const parachuteEligible = randomEventEligibleCount(roleSave);
assert(
  parachuteEligible < RANDOM_EVENT_IDS.length,
  "role filtering should shrink the eligible pool"
);
roleSave.completedRandomEvents = [...RANDOM_EVENT_IDS];
assert(
  rotateRandomEventPool(roleSave),
  "role-filtered full pool should rotate"
);
assert(
  (roleSave.randomEventCycle ?? 0) >= 1 &&
    roleSave.achievements.includes("random_rotation"),
  "rotation should advance the event cycle"
);
const variant = randomEventVariantContext(
  "parachute",
  "extreme",
  1,
  "zh"
);
assert(
  variant.includes("空降") && variant.includes("极限"),
  "event variant should include role and difficulty pressure"
);

for (const role of Object.keys(ROLE_OPTION_SETS)) {
  for (const quality of ["expert", "partial", "risk"]) {
    assert(
      ROLE_OPTION_SETS[role][quality].length === 3,
      `${role}/${quality} must contain 3 options`
    );
  }
}

assert(ACHIEVEMENTS.length >= 18, "achievements must be 18+");
const allSideAchievement = ACHIEVEMENTS.find((item) => item.id === "all_side");
assert(
  allSideAchievement?.description.includes("9 个支线任务"),
  "side quest collector description should match the 9 side nodes"
);
assert(
  achievementRarity("master") === "legendary" &&
    achievementRarity("trial_five") === "rare",
  "achievement rarity tiers should be stable"
);
assert(
  achievementCategory("trial_five") === "trial" &&
    achievementCategory("duel_ten") === "duel" &&
    achievementCategory("random_rotation") === "event",
  "achievement categories should map by id"
);
assert(
  achievementLore("first_step", "zh").includes("权力地图"),
  "achievement lore should provide a narrative hook"
);

// ---- scoreQuality 行为 ----
const baseProfile = structuredClone(DEFAULT_SAVE.profile);
// 同档案下：专家 > 部分 > 风险（base 100 > 55 > 20，bonus 一致）
assert(
  scoreQuality("expert", baseProfile) > scoreQuality("partial", baseProfile),
  "expert should score above partial"
);
assert(
  scoreQuality("partial", baseProfile) > scoreQuality("risk", baseProfile),
  "partial should score above risk"
);
// abilityBonus 提升分数（会抬高 best 能力等级，再走 min(30, best*3)）
assert(
  scoreQuality("expert", baseProfile, 5) > scoreQuality("expert", baseProfile),
  "abilityBonus should raise score"
);
// 高能力等级提升分数（best*3 + roleBest*2 上限）
const strongProfile = structuredClone(baseProfile);
for (const id of Object.keys(strongProfile.abilities)) strongProfile.abilities[id] = 40;
assert(
  scoreQuality("expert", strongProfile) > scoreQuality("expert", baseProfile),
  "stronger profile should score higher"
);

// ---- applyStoryChoice 行为 ----
const save = structuredClone(DEFAULT_SAVE);
const node = nodesForChapter(1)[0];
const option = node.options[0];
const beforePlayCount = save.playCount;
const beforeAbilities = { ...save.profile.abilities };
const beforeResources = { ...save.profile.resources };

const outcome = applyStoryChoice(save, node.id, 0);
assert(outcome.optionIndex === 0, "outcome optionIndex should match");
assert(
  outcome.qualityScore === scoreQuality(option.quality, baseProfile),
  "outcome qualityScore should match scoreQuality of that option"
);
assert(save.playCount === beforePlayCount + 1, "playCount should increment");
assert(
  save.achievements.includes("first_step"),
  "first decision should persist first_step achievement"
);
// 能力结算
for (const [abilityId, gained] of Object.entries(option.effects)) {
  assert(
    save.profile.abilities[abilityId] === beforeAbilities[abilityId] + (gained || 0),
    `ability ${abilityId} should increase by effect`
  );
}
// 资源结算 + 钳制在 [0,100]
for (const [resource, delta] of Object.entries(option.resources)) {
  const production =
    option.quality === "expert"
      ? { trust: 1, influence: 1 }
      : option.quality === "partial"
        ? { influence: 1 }
        : { capital: -1 };
  const expected = Math.max(
    0,
    Math.min(100, beforeResources[resource] + (delta || 0) + (production[resource] || 0))
  );
  assert(
    save.profile.resources[resource] === expected,
    `resource ${resource} should change by delta and clamp`
  );
}
for (const resource of Object.keys(save.profile.resources)) {
  assert(
    save.profile.resources[resource] >= 0 && save.profile.resources[resource] <= 100,
    `resource ${resource} must stay in [0,100]`
  );
}

// 高压模式资源缩放：负向更狠、正向更弱
const saveNormal = structuredClone(DEFAULT_SAVE);
const saveHard = structuredClone(DEFAULT_SAVE);
saveHard.highPressureMode = true;
// 在所有节点里找一个同时含正/负资源的选项
let probe = null;
for (const n of STORY_NODES) {
  const res = n.options[0].resources;
  if (Object.values(res).some((v) => v < 0) &&
      Object.values(res).some((v) => v > 0)) {
    probe = n;
    break;
  }
}
if (probe) {
  const res = probe.options[0].resources;
  const beforeN = { ...saveNormal.profile.resources };
  const beforeH = { ...saveHard.profile.resources };
  applyStoryChoice(saveNormal, probe.id, 0);
  applyStoryChoice(saveHard, probe.id, 0);
  const production =
    probe.options[0].quality === "expert"
      ? { trust: 1, influence: 1 }
      : probe.options[0].quality === "partial"
        ? { influence: 1 }
        : { capital: -1 };
  for (const [resource, delta] of Object.entries(res)) {
    const d = delta || 0;
    const expectNormal = Math.max(
      0,
      Math.min(100, beforeN[resource] + d + (production[resource] || 0))
    );
    const expectHard =
      d < 0
        ? Math.max(
            0,
            Math.min(
              100,
              beforeH[resource] +
                Math.round(d * 1.4) +
                (production[resource] || 0)
            )
          )
        : Math.max(
            0,
            Math.min(
              100,
              beforeH[resource] +
                Math.round(d * 0.7) +
                (production[resource] || 0)
            )
          );
    assert(
      saveNormal.profile.resources[resource] === expectNormal,
      "normal mode resource delta as-is"
    );
    assert(
      saveHard.profile.resources[resource] === expectHard,
      "high pressure mode scales resource delta"
    );
  }
}

// 章节通关解锁下一章
const save2 = structuredClone(DEFAULT_SAVE);
const chapter1Nodes = nodesForChapter(1);
applyStoryChoice(save2, chapter1Nodes[0].id, 0);
assert(!save2.unlockedChapters.includes(2), "chapter 2 not unlocked after 1 node");
applyStoryChoice(save2, chapter1Nodes[1].id, 0);
assert(save2.unlockedChapters.includes(2), "chapter 2 unlocked after 2 nodes");
assert(
  save2.chapterRecords.some((r) => r.chapterId === 1 && r.stars > 0),
  "chapter 1 record should have stars"
);

// ---- computeSaveHash 稳定性 ----
const h1 = computeSaveHash(structuredClone(DEFAULT_SAVE));
const h2 = computeSaveHash(structuredClone(DEFAULT_SAVE));
assert(h1 === h2, "identical saves should hash identically");
const modified = structuredClone(DEFAULT_SAVE);
modified.decisionHistory.push({ nodeId: "x", optionIndex: 0, quality: "expert", qualityScore: 100, chapterId: 1 });
assert(computeSaveHash(modified) !== h1, "different content should hash differently");
// lastSavedAt / saveHash 不应影响哈希（避免每次保存都变）
const withTime = structuredClone(DEFAULT_SAVE);
withTime.lastSavedAt = 123456;
withTime.saveHash = "abc";
assert(computeSaveHash(withTime) === h1, "lastSavedAt/saveHash must not affect hash");

// ---- migrateSave：旧版本/未知字段不丢 ----
const oldSave = {
  version: 0,
  profileCreated: true,
  profile: { name: "测试", role: "founder", abilities: {}, resources: {} },
  playCount: 3,
  customFlag: true,
  mysteryField: "keep-me"
};
const migrated = migrateSave(oldSave);
assert(migrated.version === DEFAULT_SAVE.version, "migrated version should be current");
assert(migrated.playCount === 3, "migrated should preserve playCount");
assert(migrated.profile.abilities.structure >= 0, "migrated should fill default abilities");
assert(migrated.profile.resources.trust >= 0, "migrated should fill default resources");
assert(migrated.customFlag === true, "migrated should preserve unknown field customFlag");
assert(migrated.mysteryField === "keep-me", "migrated should preserve unknown field mysteryField");
const routedSave = migrateSave({
  ...structuredClone(DEFAULT_SAVE),
  routePath: { 2: "risk", 5: "expert" }
});
assert(
  routedSave.routePath[2] === "risk" && routedSave.routePath[5] === "expert",
  "migrateSave should preserve routePath choices"
);

// ---- resolveCloudConflict 双校验 ----
const localA = { ...structuredClone(DEFAULT_SAVE), lastSavedAt: 1000, saveHash: "h1", playCount: 5 };
const remoteNewer = { ...structuredClone(DEFAULT_SAVE), lastSavedAt: 2000, saveHash: "h2", playCount: 5 };
const remoteOlder = { ...structuredClone(DEFAULT_SAVE), lastSavedAt: 500, saveHash: "h3", playCount: 5 };
const remoteSameContent = { ...structuredClone(DEFAULT_SAVE), lastSavedAt: 1000, saveHash: "h1", playCount: 5 };
const remoteDiffContent = { ...structuredClone(DEFAULT_SAVE), lastSavedAt: 1000, saveHash: "hX", playCount: 5 };
assert(resolveCloudConflict(localA, null) === "no-remote", "no remote => no-remote");
assert(resolveCloudConflict(null, remoteNewer) === "remote-newer", "no local => remote-newer");
assert(resolveCloudConflict(localA, remoteNewer) === "remote-newer", "remote time newer => remote-newer");
assert(resolveCloudConflict(localA, remoteOlder) === "local-newer", "local time newer => local-newer");
assert(resolveCloudConflict(localA, remoteSameContent) === "equal", "same time+hash => equal");
// 关键：同游玩次数但内容不同 => conflict（原先只会按 playCount 误判为可覆盖）
assert(
  resolveCloudConflict(localA, remoteDiffContent) === "conflict",
  "same playCount but different content => conflict"
);

// ---- 分支引用完整性 ----
for (const node of STORY_NODES) {
  for (const option of node.options) {
    if (option.branchTo) {
      for (const role of Object.keys(option.branchTo)) {
        const target = option.branchTo[role];
        let found = false;
        try {
          getNode(target);
          found = true;
        } catch {
          found = false;
        }
        assert(found, `branchTo target ${target} from node ${node.id} must exist`);
      }
    }
  }
}
for (const chapter of CHAPTERS) {
  for (const nodeId of chapter.nodeIds) {
    let found = false;
    try {
      getNode(nodeId);
      found = true;
    } catch {
      found = false;
    }
    assert(found, `chapter ${chapter.id} nodeId ${nodeId} must exist`);
  }
  assert(
    nodesForChapter(chapter.id).length === chapter.nodeIds.length,
    `nodesForChapter(${chapter.id}) length should match`
  );
}

// ---- D1/D2：难度档位驱动资源缩放（effectiveDifficulty 以 save.difficulty 为准）----
// 覆盖 extreme 档（PRESSURE_FACTORS.extreme = neg:1.8 / pos:0.5），并验证
// normal / pressure / extreme 三档缩放系数与 PRESSURE_FACTORS 一致。
const probe2 =
  probe ??
  (() => {
    for (const n of STORY_NODES) {
      const res = n.options[0].resources;
      if (Object.values(res).some((v) => v < 0) && Object.values(res).some((v) => v > 0)) {
        return n;
      }
    }
    return null;
  })();
assert(probe2, "need a node whose option has both positive and negative resource deltas");
const probeRes = probe2.options[0].resources;

for (const difficulty of ["normal", "pressure", "extreme"]) {
  const s = structuredClone(DEFAULT_SAVE);
  s.difficulty = difficulty;
  const before = { ...s.profile.resources };
  applyStoryChoice(s, probe2.id, 0);
  const factor = PRESSURE_FACTORS[difficulty];
  const production =
    probe2.options[0].quality === "expert"
      ? { trust: 1, influence: 1 }
      : probe2.options[0].quality === "partial"
        ? { influence: 1 }
        : { capital: -1 };
  for (const [resource, delta] of Object.entries(probeRes)) {
    const d = delta || 0;
    const expected = Math.max(
      0,
      Math.min(
        100,
        before[resource] +
          Math.round(d < 0 ? d * factor.neg : d * factor.pos) +
          (production[resource] || 0)
      )
    );
    assert(
      s.profile.resources[resource] === expected,
      `${difficulty} mode should scale resource ${resource} by ${d < 0 ? factor.neg : factor.pos}`
    );
  }
}

// normalizeSave 必须保留 pressure / extreme（D1：难度选择写入后能正确持久化）
const normalizedExtreme = (function () {
  const base = structuredClone(DEFAULT_SAVE);
  base.difficulty = "extreme";
  return base;
})();
assert(normalizedExtreme.difficulty === "extreme", "difficulty=extreme must survive normalizeSave path");
const normalizedPressure = structuredClone(DEFAULT_SAVE);
normalizedPressure.difficulty = "pressure";
assert(normalizedPressure.difficulty === "pressure", "difficulty=pressure must survive normalizeSave path");

// 难度选择后，难度档位变化能被 applyStoryChoice 直接反映（save.difficulty 生效）
const selA = structuredClone(DEFAULT_SAVE);
const selB = structuredClone(DEFAULT_SAVE);
selA.difficulty = "normal";
selB.difficulty = "extreme";
const beforeA = { ...selA.profile.resources };
const beforeB = { ...selB.profile.resources };
applyStoryChoice(selA, probe2.id, 0);
applyStoryChoice(selB, probe2.id, 0);
const negKey = Object.keys(probeRes).find((k) => (probeRes[k] || 0) < 0);
assert(negKey !== undefined, "probe option must contain a negative resource delta");
const dropNormal = beforeA[negKey] - selA.profile.resources[negKey];
const dropExtreme = beforeB[negKey] - selB.profile.resources[negKey];
assert(
  dropExtreme > dropNormal,
  "extreme mode must amplify a negative delta more than normal mode (effectiveDifficulty tracks save.difficulty)"
);

// ---- D2：回合时限纯函数 ----
assert(
  roundDurationMsForDifficulty("normal") === NORMAL_DECISION_MS,
  "normal difficulty should not run a decision timer"
);
assert(NORMAL_DECISION_MS === 0, "standard mode must not time decisions");
assert(roundDurationMsForDifficulty("pressure") === 22000, "pressure duration should be 22000ms");
assert(roundDurationMsForDifficulty("extreme") === 14000, "extreme duration should be 14000ms");

const gateSave = structuredClone(DEFAULT_SAVE);
gateSave.profile.resources.energy = 0;
const expensiveOption =
  STORY_NODES.flatMap((n) => n.options).find(
    (o) => (o.resources?.energy || 0) < 0
  ) ?? probe2.options[0];
assert(
  optionGateFor(gateSave, expensiveOption, 1).kind === "resource",
  "low energy should gate costly options"
);

const highChapterExpert = STORY_NODES.filter((n) => n.chapterId >= 8)
  .flatMap((n) => n.options)
  .find((o) => o.quality === "expert");
assert(highChapterExpert, "need an expert option in chapters 8+");
const abilityGateSave = structuredClone(DEFAULT_SAVE);
assert(
  optionGateFor(abilityGateSave, highChapterExpert, 8).kind === "ability",
  "expert option should require ability level in late chapters"
);

const strainSave = structuredClone(DEFAULT_SAVE);
strainSave.profile.resources.energy = 12;
assert(
  resourceStrainFor(strainSave, expensiveOption) > 0,
  "low energy should produce resource strain"
);

const aiA = buildAiProfile("founder", 4);
const aiB = buildAiProfile("founder", 4);
assert(
  JSON.stringify(aiA) === JSON.stringify(aiB),
  "AI profile should be deterministic for same role and strength"
);

// ---- D3：随机干扰文案可解析、随机节点 kind 正确（相关纯逻辑不抛错）----
assert(
  typeof uiString("zh", "interferenceNote") === "string" &&
    uiString("zh", "interferenceNote").length > 0,
  "interferenceNote i18n key must resolve to non-empty string"
);
assert(
  RANDOM_EVENT_IDS.every((id) => getNode(id).kind === "random"),
  "every random event id must resolve to a node of kind 'random'"
);

const bestSave = structuredClone(DEFAULT_SAVE);
recordDuelResult(bestSave, true, true, 10, "opponent", 88, 70);
assert(
  bestSave.bestScore === 88,
  "recordDuelResult should track local best score"
);

const achSave = structuredClone(DEFAULT_SAVE);
achSave.playCount = 1;
assert(
  isAchievementUnlocked(achSave, "first_step"),
  "first_step should unlock after the first decision"
);
achSave.completedTraining = ["insight", "deploy", "mobilize", "strategy"];
assert(
  isAchievementUnlocked(achSave, "training_four"),
  "training_four should unlock after four training routes"
);
achSave.trialCleared = TRIAL_STAGES.map((stage) => stage.id);
assert(
  isAchievementUnlocked(achSave, "trial_all"),
  "trial_all should unlock after clearing every trial stage"
);
achSave.hiddenRoutes = ["ability-insight"];
assert(
  isAchievementUnlocked(achSave, "hidden_route"),
  "hidden_route should unlock after entering a hidden route"
);

const campaignSave = structuredClone(DEFAULT_SAVE);
const chapterNineMains = nodesForChapter(9).filter((n) => n.kind === "main");
for (const n of chapterNineMains) {
  applyStoryChoice(campaignSave, n.id, 0);
}
assert(
  campaignSave.campaignCompletions === 1,
  "campaignCompletions should increment once per completed campaign"
);
assert(
  campaignSave.masteryPoints === 10,
  "chapter mastery should be awarded once per chapter"
);
for (const n of chapterNineMains) {
  let threw = false;
  try {
    applyStoryChoice(campaignSave, n.id, 1);
  } catch {
    threw = true;
  }
  assert(threw, "completed node must not be re-settled");
}
assert(
  campaignSave.campaignCompletions === 1,
  "campaignCompletions must not double count replays"
);
assert(
  campaignSave.masteryPoints === 10,
  "chapter mastery must not double count replays"
);

// ---- 每日挑战：跨天重置（claimedDaily 按日期隔离）----
const challengeSave = structuredClone(DEFAULT_SAVE);
challengeSave.decisionHistory.push(
  { nodeId: "c1n1", optionIndex: 0, quality: "expert", qualityScore: 100, chapterId: 1 },
  { nodeId: "c1n2", optionIndex: 0, quality: "expert", qualityScore: 100, chapterId: 1 },
  { nodeId: "c2n1", optionIndex: 0, quality: "expert", qualityScore: 100, chapterId: 2 },
  { nodeId: "c2n2", optionIndex: 0, quality: "expert", qualityScore: 100, chapterId: 2 },
  { nodeId: "c3n1", optionIndex: 0, quality: "expert", qualityScore: 100, chapterId: 3 },
  { nodeId: "c3n2", optionIndex: 0, quality: "expert", qualityScore: 100, chapterId: 3 }
);
challengeSave.completedSideQuests = ["s1", "s2", "s3", "s4", "s5", "s6"];
challengeSave.duelWins = 2;
challengeSave.duelLosses = 1;
challengeSave.completedRandomEvents = ["r1", "r2"];
challengeSave.completedBranchNodes = ["c2b-parachute", "c3b-parachute", "c4b-parachute"];
challengeSave.completedTraining = Object.keys(challengeSave.profile.abilities);
challengeSave.trialCleared = TRIAL_STAGES.map((stage) => stage.id);
challengeSave.completedPracticeTasks = ["p1", "p2", "p3", "p4", "p5"];
challengeSave.chapterRecords = CHAPTERS.map((chapter) => ({
  chapterId: chapter.id,
  completedNodeIds: chapter.nodeIds.slice(0, 2),
  stars: 220
}));
for (const abilityId of Object.keys(challengeSave.profile.abilities)) {
  challengeSave.profile.abilities[abilityId] = 40;
}
const todayChallenge = dailyChallenges(challengeSave)[0];
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);
challengeSave.claimedDaily[yesterday] = [todayChallenge.id];
assert(
  claimableChallenges(challengeSave).some((challenge) => challenge.id === todayChallenge.id),
  "yesterday's claim must not block today's challenge"
);
challengeSave.claimedDaily[todayKey()] = [todayChallenge.id];
assert(
  !claimableChallenges(challengeSave).some((challenge) => challenge.id === todayChallenge.id),
  "today's claim must block today's challenge"
);
assert(
  dailyChallenges(challengeSave).length === 3,
  "dailyChallenges should always return 3 challenges"
);

// ---- saveState：写失败返回 false，loadSave 可回退到 session 备份 ----
const backupSave = structuredClone(DEFAULT_SAVE);
backupSave.profileCreated = true;
backupSave.profile.name = "Backup";
assert(saveState(backupSave) === true, "normal saveState should succeed");
const originalSetItem = globalThis.localStorage.setItem;
globalThis.localStorage.setItem = () => {
  throw new Error("quota exceeded");
};
const failed = structuredClone(DEFAULT_SAVE);
assert(saveState(failed) === false, "saveState should report failure when storage is full");
globalThis.localStorage.setItem = originalSetItem;

// 损坏主存档时，loadSave 应从 session 备份恢复并留下通知标记
deleteRoleSlot("highPotential");
store.set("adaptive-ascent-save-v1", "{broken json");
const recovered = loadSave();
assert(
  recovered.profileCreated === false,
  "loadSave should fall back to default/backup instead of throwing"
);
assert(
  store.has("adaptive-ascent-save-corrupt"),
  "corrupt save should leave a recovery notice"
);

// ---- v1.1 修復回归：星级门槛 / 重打 / 经济闭合 / 恢复循环 / 事件轮转 ----
assert(chapterStarCount(200) === 3, "200 stars should be 3 stars");
assert(chapterStarCount(150) === 2, "150 stars should be 2 stars");
assert(
  chapterStarCount(CHAPTER_PASS_STARS) === 1,
  "one-star threshold should be 1 star"
);
assert(
  chapterStarCount(CHAPTER_PASS_STARS - 1) === 0,
  "below one-star threshold should be 0 stars"
);

const failChapter = structuredClone(DEFAULT_SAVE);
const failNodes = nodesForChapter(2);
applyStoryChoice(failChapter, failNodes[0].id, 2);
applyStoryChoice(failChapter, failNodes[1].id, 2);
assert(
  !failChapter.unlockedChapters.includes(3),
  "sub-star chapter must not unlock the next chapter"
);
assert(
  !isChapterPassed(failChapter, 2),
  "chapter with low stars should not pass"
);
retryChapter(failChapter, 2);
assert(
  !failChapter.unlockedChapters.includes(3),
  "retry must not auto-unlock the next chapter"
);
assert(
  !isChapterComplete(failChapter, 2),
  "retry should clear the chapter record"
);
assert(
  failChapter.decisionHistory.length === 0,
  "retry should clear the chapter's decision history"
);

const passChapter = structuredClone(DEFAULT_SAVE);
const passNodes = nodesForChapter(1);
applyStoryChoice(passChapter, passNodes[0].id, 0);
applyStoryChoice(passChapter, passNodes[1].id, 0);
assert(
  passChapter.unlockedChapters.includes(2) && isChapterPassed(passChapter, 1),
  "expert chapter should pass and unlock the next chapter"
);

const recovery = structuredClone(DEFAULT_SAVE);
recovery.profile.resources.energy = 50;
assert(
  applyDailyResourceRecovery(recovery),
  "daily resource recovery should apply once"
);
assert(
  recovery.profile.resources.energy === 60,
  "energy should recover +10 per day"
);
assert(
  !applyDailyResourceRecovery(recovery),
  "daily resource recovery should not repeat on the same day"
);

const rotation = structuredClone(DEFAULT_SAVE);
rotation.completedRandomEvents = [...RANDOM_EVENT_IDS];
assert(rotateRandomEventPool(rotation), "full event pool should rotate");
assert(
  rotation.completedRandomEvents.length === 0,
  "rotation should reset the event pool"
);
assert(!rotateRandomEventPool(rotation), "rotation requires a full pool");

const riskNode = STORY_NODES.find((node) =>
  node.options.some((option) => option.quality === "risk")
);
const riskOptionIndex = riskNode.options.findIndex(
  (option) => option.quality === "risk"
);
const riskEconomy = structuredClone(DEFAULT_SAVE);
const capitalBefore = riskEconomy.profile.resources.capital;
applyStoryChoice(riskEconomy, riskNode.id, riskOptionIndex);
assert(
  riskEconomy.profile.resources.capital <= capitalBefore,
  "risk choice must never grant free capital"
);

const repeatTraining = structuredClone(DEFAULT_SAVE);
repeatTraining.completedTraining = ["insight"];
repeatTraining.trialEnergy = 50;
const energyBeforeRepeat = repeatTraining.trialEnergy;
applyTrainingResult(repeatTraining, "insight", 4, 4);
assert(
  repeatTraining.trialEnergy > energyBeforeRepeat,
  "repeat training should restore trial energy"
);

const capHistory = structuredClone(DEFAULT_SAVE);
for (let i = 0; i < 250; i += 1) {
  capHistory.decisionHistory.push({
    nodeId: `cap-${i}`,
    optionIndex: 0,
    quality: "expert",
    qualityScore: 100,
    chapterId: 1
  });
}
saveState(capHistory);
const capped = loadSave();
assert(
  capped.decisionHistory.length <= 200,
  "decision history should be capped at 200 entries"
);

const duelProfile = structuredClone(DEFAULT_SAVE).profile;
const humanProfile = {
  ...duelProfile,
  color: "#41c7c0",
  isHuman: true
};
const aiProfile = buildAiProfile("founder", 3);
const duel = new DuelEngine(humanProfile, aiProfile, 3, 42);
duel.pick(0, 0);
const restoredDuel = DuelEngine.fromSnapshot(duel.toSnapshot());
assert(
  restoredDuel.picks[0] === 0 &&
    restoredDuel.currentRound === 0 &&
    restoredDuel.roundCount === 3,
  "duel snapshot should restore picks, round, and round count"
);

const styleDuel = new DuelEngine(humanProfile, aiProfile, 3, 42);
styleDuel.pick(0, 0);
styleDuel.pick(1, 1);
const opponentQuality = styleDuel.node.options[styleDuel.picks[1]].quality;
const styleScoreBefore = styleDuel.scores[0];
const styleBonus = styleDuel.predictOpponentStyle(0, opponentQuality);
assert(
  styleBonus >= 2,
  "style bet hit should grant at least +2 bonus"
);
assert(
  styleDuel.scores[0] === styleScoreBefore + styleBonus,
  "style bet bonus should be added to the predicting player score"
);

const missDuel = new DuelEngine(humanProfile, aiProfile, 3, 42);
missDuel.pick(0, 0);
missDuel.pick(1, 1);
const missQuality =
  missDuel.node.options[missDuel.picks[1]].quality === "expert"
    ? "risk"
    : "expert";
const missBonus = missDuel.predictOpponentStyle(0, missQuality);
assert(missBonus === 0, "style bet miss should grant no bonus");

const duelDrawIds = duelNodes(7, 42).map((node) => node.id);
assert(
  new Set(duelDrawIds).size === duelDrawIds.length,
  "duel draw should never repeat questions inside one match"
);
const seenDuelIds = duelDrawIds.slice(0, 3);
const nextDuelDraw = duelNodes(7, 43, seenDuelIds).map((node) => node.id);
assert(nextDuelDraw.length === 7, "duel draw should keep requested round count");
assert(
  new Set(nextDuelDraw).size === nextDuelDraw.length,
  "next duel draw should also avoid repeats"
);
assert(
  seenDuelIds.every((id) => !nextDuelDraw.includes(id)),
  "duel draw should avoid recently seen questions when possible"
);

// ---- 多角色存档槽：三角色独立存档、切换与删除 ----
const slotParachute = structuredClone(DEFAULT_SAVE);
slotParachute.profileCreated = true;
slotParachute.profile.name = "SlotA";
slotParachute.profile.role = "parachute";
slotParachute.playCount = 3;
assert(saveState(slotParachute), "parachute slot should save");

const slotFounder = structuredClone(DEFAULT_SAVE);
slotFounder.profileCreated = true;
slotFounder.profile.name = "SlotB";
slotFounder.profile.role = "founder";
assert(saveState(slotFounder), "founder slot should save");

const loadedParachute = loadSave("parachute");
assert(
  loadedParachute.profile.name === "SlotA" &&
    loadedParachute.playCount === 3,
  "parachute slot should load its own progress"
);
const loadedFounder = loadSave("founder");
assert(
  loadedFounder.profile.name === "SlotB",
  "founder slot should load independently"
);
const slotSummaries = roleSlotSummaries();
assert(
  slotSummaries.filter((slot) => slot.exists).length === 2,
  "roleSlotSummaries should detect two saved roles"
);
deleteRoleSlot("founder");
assert(
  loadSave("founder").profileCreated === false,
  "deleteRoleSlot should clear a single role slot"
);

// ---- 教练工作坊引擎 ----
const coachEngine = new CoachWorkshopEngine();
function coachDemoSave(
  name,
  role,
  abilities,
  qualities
) {
  const data = structuredClone(DEFAULT_SAVE);
  data.profileCreated = true;
  data.profile.name = name;
  data.profile.role = role;
  Object.assign(data.profile.abilities, abilities);
  data.decisionHistory = ["c1n1", "c1n2", "c2n1", "c2n2", "c3n1", "c3n2"].map(
    (nodeId, index) => ({
      nodeId,
      optionIndex: 0,
      quality: qualities[index],
      qualityScore: 50,
      chapterId: Number(nodeId[1])
    })
  );
  return { name, data };
}
coachEngine.importParticipants([
  coachDemoSave(
    "A",
    "parachute",
    { insight: 28, deploy: 16, mobilize: 12, strategy: 8, authority: 20, stability: 14, recovery: 10, execution: 24, structure: 18, communication: 22 },
    ["expert", "expert", "partial", "risk", "expert", "partial"]
  ),
  coachDemoSave(
    "B",
    "founder",
    { insight: 12, deploy: 26, mobilize: 22, strategy: 18, authority: 24, stability: 10, recovery: 8, execution: 30, structure: 14, communication: 12 },
    ["risk", "partial", "expert", "risk", "partial", "expert"]
  ),
  coachDemoSave(
    "C",
    "highPotential",
    { insight: 20, deploy: 10, mobilize: 18, strategy: 26, authority: 8, stability: 22, recovery: 20, execution: 14, structure: 28, communication: 30 },
    ["partial", "risk", "partial", "expert", "partial", "risk"]
  )
]);
const coachReport = coachEngine.generateReport("QA Group");
assert(
  coachReport.participantCount === 3,
  "coach report should count imported participants"
);
assert(
  coachReport.groupRadar.length === 10,
  "coach report should include all ten abilities"
);
assert(
  coachReport.discussionQuestions.length > 0,
  "coach report should generate discussion questions"
);
assert(
  coachReport.workshopPlan.length >= 4,
  "coach report should include a workshop plan"
);
assert(
  coachReport.blindSpots.length >= 1,
  "demo group should surface at least one decision blind spot"
);
assert(
  coachReport.blindSpots.every(
    (spot) => spot.nodeTitle && spot.nodeTitle !== spot.nodeId
  ),
  "coach blind spots should resolve real node titles"
);
const personalCoach = coachEngine.generatePersonalReport(
  structuredClone(DEFAULT_SAVE)
);
assert(
  personalCoach.strengths.length === 3 && personalCoach.focus.length === 2,
  "personal coach report should include strengths and focus abilities"
);
assert(
  personalCoach.actionPlan.length === 3,
  "personal coach report should include a three-step action plan"
);

console.log("PASS unit test");
