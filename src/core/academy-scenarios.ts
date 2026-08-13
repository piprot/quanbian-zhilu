import type {
  AcademyScenario,
  AcademyScenarioPath,
  TeamAcademyState,
  TeamRole
} from "./team-academy";
import { HIGH_POTENTIAL_SCENARIOS } from "./academy-scenarios-high-potential.ts";
import { PARACHUTE_SCENARIOS } from "./academy-scenarios-parachute.ts";
import { FOUNDER_SCENARIOS } from "./academy-scenarios-founder.ts";

export const ALL_ACADEMY_SCENARIOS: AcademyScenario[] = [
  ...HIGH_POTENTIAL_SCENARIOS,
  ...PARACHUTE_SCENARIOS,
  ...FOUNDER_SCENARIOS
];

export function scenariosForRole(role: TeamRole): AcademyScenario[] {
  return ALL_ACADEMY_SCENARIOS.filter((scenario) => scenario.role === role);
}

export function scenarioById(id: string): AcademyScenario | undefined {
  return ALL_ACADEMY_SCENARIOS.find((scenario) => scenario.id === id);
}

export function applyScenarioChoice(
  state: TeamAcademyState,
  scenarioId: string,
  optionIndex: number
): {
  state: TeamAcademyState;
  correct: boolean;
  gained: number;
  feedback: string;
  path?: AcademyScenarioPath;
  bestIndex: number;
  bestPath?: AcademyScenarioPath;
} {
  const scenario = scenarioById(scenarioId);
  if (!scenario) {
    return {
      state,
      correct: false,
      gained: 0,
      feedback: "",
      bestIndex: -1
    };
  }
  const correct = scenario.best === optionIndex;
  const alreadyCompleted = state.completedScenarios.includes(scenarioId);
  const gained = correct && !alreadyCompleted ? 6 : 0;
  const completed = correct && !alreadyCompleted
    ? [...state.completedScenarios, scenarioId]
    : state.completedScenarios;
  const path = scenario.paths?.[optionIndex];
  const bestPath = scenario.paths?.[scenario.best];
  return {
    state: {
      ...state,
      completedScenarios: completed,
      scenarioScores: {
        ...state.scenarioScores,
        [scenarioId]: (state.scenarioScores[scenarioId] ?? 0) + gained
      },
      updatedAt: Date.now()
    },
    correct,
    gained,
    feedback: scenario.feedback,
    path,
    bestIndex: scenario.best,
    bestPath
  };
}
