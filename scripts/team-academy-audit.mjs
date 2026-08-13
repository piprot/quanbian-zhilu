import {
  ALL_ACADEMY_SCENARIOS,
  scenarioById
} from "../src/core/academy-scenarios.ts";
import { ACADEMY_COURSES } from "../src/core/team-academy.ts";

const errors = [];
const check = (ok, message) => {
  if (!ok) errors.push(message);
};

const scenarios = ALL_ACADEMY_SCENARIOS;
check(scenarios.length === 108, `academy should have 108 scenarios, got ${scenarios.length}`);
check(
  new Set(scenarios.map((item) => item.id)).size === scenarios.length,
  "academy scenario ids must be unique"
);
check(
  new Set(scenarios.map((item) => item.title)).size === scenarios.length,
  "academy scenario titles must be unique across roles"
);

const bestCount = { 0: 0, 1: 0, 2: 0, 3: 0 };
for (const scenario of scenarios) {
  check(
    scenario.options.length === 4,
    `${scenario.id} must have exactly 4 options`
  );
  check(
    Number.isInteger(scenario.best) && scenario.best >= 0 && scenario.best <= 3,
    `${scenario.id} best index must be 0..3`
  );
  bestCount[scenario.best] += 1;
  check(
    scenario.situation.length >= 25,
    `${scenario.id} situation should be detailed (>=25 chars)`
  );
  check(
    scenario.feedback.length >= 20,
    `${scenario.id} feedback should teach a principle (>=20 chars)`
  );
  check(
    scenario.knowledge.length >= 2,
    `${scenario.id} knowledge point should not be empty`
  );
  check(
    Array.isArray(scenario.paths) && scenario.paths.length === 4,
    `${scenario.id} must have 4 path explanations`
  );
  if (Array.isArray(scenario.paths) && scenario.paths.length === 4) {
    scenario.paths.forEach((path, index) => {
      check(
        path.outcome.length >= 8 && path.why.length >= 8 && path.recovery.length >= 8,
        `${scenario.id} path ${index + 1} must include outcome, why and recovery`
      );
    });
  }
  check(
    new Set(scenario.options).size === scenario.options.length,
    `${scenario.id} options must not repeat`
  );
}

for (const index of [0, 1, 2, 3]) {
  check(
    bestCount[index] >= 6,
    `best answers should be distributed, index ${index} only appears ${bestCount[index]} times`
  );
}

for (const role of ["parachute", "founder", "highPotential"]) {
  const roleScenarios = scenarios.filter((item) => item.role === role);
  check(
    roleScenarios.length === 36,
    `${role} should have 36 scenarios, got ${roleScenarios.length}`
  );
  const levelCount = {};
  for (const scenario of roleScenarios) {
    levelCount[scenario.level] = (levelCount[scenario.level] ?? 0) + 1;
  }
  check(
    Object.keys(levelCount).length === 9 &&
      Object.values(levelCount).every((count) => count === 4),
    `${role} should have 4 scenarios per level across 9 levels`
  );

  const course = ACADEMY_COURSES.find((item) => item.role === role);
  check(course, `${role} should have a course`);
  if (!course) continue;
  check(
    course.lessons.length === 9,
    `${role} course should have 9 lessons`
  );
  const lessonIds = new Set(
    course.lessons.flatMap((lesson) => lesson.scenarioIds)
  );
  check(
    lessonIds.size === 36,
    `${role} lessons should cover all 36 scenario ids exactly once`
  );
  course.lessons.forEach((lesson, lessonIndex) => {
    check(
      Array.isArray(lesson.checklist) && lesson.checklist.length >= 5,
      `${role}/${lesson.id} should have a 5-item action checklist`
    );
    check(
      lesson.model.length >= 4 &&
        lesson.examples.length >= 2 &&
        lesson.practice.length >= 3,
      `${role}/${lesson.id} should keep model/examples/practice structure`
    );
    check(
      lesson.keywords.length >= 4,
      `${role}/${lesson.id} should have at least 4 homework keywords`
    );
    lesson.scenarioIds.forEach((scenarioId) => {
      const scenario = scenarioById(scenarioId);
      check(
        scenario && scenario.role === role,
        `${role}/${lesson.id} references missing or wrong-role scenario ${scenarioId}`
      );
      if (scenario) {
        check(
          scenario.level === lessonIndex + 1,
          `${role}/${lesson.id} scenario ${scenarioId} level ${scenario.level} should match lesson ${lessonIndex + 1}`
        );
      }
    });
    lesson.practice.forEach((question, questionIndex) => {
      check(
        Number.isInteger(question.answer) &&
          question.answer >= 0 &&
          question.answer < question.options.length,
        `${role}/${lesson.id} practice ${questionIndex + 1} answer must be valid`
      );
    });
  });
}

if (errors.length > 0) {
  console.error(`Team academy audit failed:\n${errors.join("\n")}`);
  process.exit(1);
}

console.log(
  `PASS team academy audit: ${scenarios.length} scenarios, ${scenarios.reduce(
    (sum, scenario) => sum + scenario.paths.length,
    0
  )} path explanations, ${ACADEMY_COURSES.reduce(
    (sum, course) => sum + course.lessons.length,
    0
  )} lessons with action checklists`
);
