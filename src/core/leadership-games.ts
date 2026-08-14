import type { AbilityId } from "./types";

export type LeadershipGameId =
  | "decision-chess"
  | "game-theory"
  | "resource-allocation"
  | "team-management"
  | "crisis-command";

export type LeadershipGameMode = "teach" | "train" | "battle";

export interface LeadershipGameMeta {
  id: LeadershipGameId;
  zh: string;
  en: string;
  zhDesc: string;
  enDesc: string;
  insightZh: string;
  insightEn: string;
  /** 完成该小游戏所训练的核心能力，用于结算时发放对应能力经验。 */
  abilityId: AbilityId;
}

export const LEADERSHIP_GAMES: LeadershipGameMeta[] = [
  {
    id: "decision-chess",
    zh: "决策棋",
    en: "Decision Chess",
    zhDesc: "在棋盘上推进目标，用有限资源换取信任、影响力与组织结果。",
    enDesc: "Advance on the board and trade limited resources for trust, influence, and results.",
    insightZh: "领导力不是一次漂亮的决策，而是每一步都在为下一步创造选择空间。",
    insightEn: "Leadership is not one brilliant move; every step should create options for the next.",
    abilityId: "strategy"
  },
  {
    id: "game-theory",
    zh: "博弈推演",
    en: "Game Theory",
    zhDesc: "在合作与竞争之间反复选择，练习读懂对手并建立可预测的信任。",
    enDesc: "Repeatedly choose between cooperation and competition to read opponents and build predictable trust.",
    insightZh: "重复博弈中，可预测的合作往往比短期占便宜更能积累长期收益。",
    insightEn: "In repeated games, predictable cooperation usually beats short-term advantage.",
    abilityId: "insight"
  },
  {
    id: "resource-allocation",
    zh: "资源分配",
    en: "Resource Allocation",
    zhDesc: "在现金流、客户、团队与创新之间分配有限预算，练习取舍与平衡。",
    enDesc: "Allocate limited budget across cash flow, customers, team, and innovation.",
    insightZh: "资源分配考验的不是平均，而是知道什么阶段该倾斜、什么缺口不能放。",
    insightEn: "Allocation is not about being average; it is about knowing what to bias and what gap you cannot ignore.",
    abilityId: "structure"
  },
  {
    id: "team-management",
    zh: "团队管理",
    en: "Team Management",
    zhDesc: "把对的人放到对的任务上，管理成员精力与任务匹配度。",
    enDesc: "Put the right people on the right tasks while managing energy and fit.",
    insightZh: "团队管理最大的杠杆，是把人的长项和任务的真正需求对齐。",
    insightEn: "The biggest team leverage is aligning each person's strength with the task's real need.",
    abilityId: "deploy"
  },
  {
    id: "crisis-command",
    zh: "危机指挥",
    en: "Crisis Command",
    zhDesc: "在高压事件里做取舍，练习稳住局面、恢复信任并推动结果。",
    enDesc: "Make trade-offs under pressure: stabilize, rebuild trust, and drive results.",
    insightZh: "危机里最重要的不是显得果断，而是让关键人知道你的判断依据。",
    insightEn: "In a crisis, clarity of reasoning matters more than appearing decisive.",
    abilityId: "recovery"
  }
];

export interface LeadershipGameTutorial {
  winZh: string;
  winEn: string;
  stepsZh: string[];
  stepsEn: string[];
}

export const GAME_TUTORIALS: Record<
  LeadershipGameId,
  LeadershipGameTutorial
> = {
  "decision-chess": {
    winZh:
      "谁先到达棋盘顶部中间的目标格，或 6~10 回合结束时得分更高，谁就获胜。",
    winEn:
      "Reach the goal at the top middle first, or have a higher score when the round limit ends.",
    stepsZh: [
      "第 1 步：你从棋盘下方出发，每次移动一格（上下左右）。",
      "第 2 步：踩到「信/影/资」格子会获得对应分数；空地为 0 分。",
      "第 3 步：AI 也会移动并收集资源，目标是抢先到达顶部中间或积累更高分。",
      "第 4 步：每回合先选一个可移动格子，点击高亮格完成移动。"
    ],
    stepsEn: [
      "Step 1: You start at the bottom and move one cell per turn (up, down, left, right).",
      "Step 2: Landing on T/I/R cells earns score; empty cells earn 0.",
      "Step 3: The AI also moves and collects resources, racing to the top-middle goal or a higher score.",
      "Step 4: Click a highlighted cell to move."
    ]
  },
  "game-theory": {
    winZh:
      "5~9 个回合结束后，你的累计收益高于 AI 即获胜。",
    winEn:
      "Win by having more total payoff than the AI after 5-9 rounds.",
    stepsZh: [
      "第 1 步：每回合在「合作」和「竞争」中二选一。",
      "第 2 步：双方都合作各 +3；你竞争对方合作你 +5；都竞争各 +1。",
      "第 3 步：AI 会记住你上一轮的选择并可能报复。",
      "第 4 步：看累计得分判断长期策略是否有效。"
    ],
    stepsEn: [
      "Step 1: Choose Cooperate or Compete each round.",
      "Step 2: Both cooperate +3 each; you compete vs cooperate +5; both compete +1 each.",
      "Step 3: The AI remembers your last move and may retaliate.",
      "Step 4: Watch cumulative score to judge your long-term strategy."
    ]
  },
  "resource-allocation": {
    winZh:
      "完成 3~5 轮分配后总分越高越好；每轮四项必须合计 100。",
    winEn:
      "Finish 3-5 rounds with the highest total score; each round must allocate exactly 100.",
    stepsZh: [
      "第 1 步：把 100 点预算分配到现金流、客户、团队、创新四项。",
      "第 2 步：每轮四项的收益倍率不同，重点倾斜会带来高收益。",
      "第 3 步：四项都不为 0 会获得均衡加成。",
      "第 4 步：提交后立即看到本轮得分与倍率，再进入下一轮。"
    ],
    stepsEn: [
      "Step 1: Split 100 budget across Cash Flow, Customers, Team, and Innovation.",
      "Step 2: Each round has different multipliers; focusing can pay off.",
      "Step 3: Keeping all four above 0 earns a balance bonus.",
      "Step 4: Submit to see the round score and next multipliers."
    ]
  },
  "team-management": {
    winZh:
      "完成 3~5 个任务后得分越高越好；能力匹配的任务得分更高。",
    winEn:
      "Finish 3-5 tasks with the highest score; matching skills score higher.",
    stepsZh: [
      "第 1 步：每个任务都要求一种能力。",
      "第 2 步：选择拥有对应能力的成员，匹配度越高得分越高。",
      "第 3 步：成员精力有限，用完后不能再被派出。",
      "第 4 步：尽量让每个人都有贡献，并保住关键任务。"
    ],
    stepsEn: [
      "Step 1: Each task requires a skill.",
      "Step 2: Pick the member with the matching skill for a higher score.",
      "Step 3: Members have limited energy and cannot work once exhausted.",
      "Step 4: Keep everyone contributing while protecting critical tasks."
    ]
  },
  "crisis-command": {
    winZh:
      "完成 3~5 个危机事件后，累计得分与信任、精力、影响力共同构成你的复盘。",
    winEn:
      "Finish 3-5 crisis events; cumulative score, trust, energy, and influence form your review.",
    stepsZh: [
      "第 1 步：每个事件有三个选项：专家级、稳妥、冒险。",
      "第 2 步：选项会改变信任、精力与影响力。",
      "第 3 步：先稳住局面和关键人，再处理结果。",
      "第 4 步：看反馈学习每个选择背后的领导力逻辑。"
    ],
    stepsEn: [
      "Step 1: Each event offers expert, steady, and risky options.",
      "Step 2: Options change trust, energy, and influence.",
      "Step 3: Stabilize the situation and key people before chasing results.",
      "Step 4: Read the feedback to learn the leadership logic behind each choice."
    ]
  }
};

export interface LeadershipGameOptions {
  seed?: number;
  level?: number;
}

// ---------------------------------------------------------------------------
// 1. Decision Chess
// ---------------------------------------------------------------------------

export interface DecisionChessState {
  mode: LeadershipGameMode;
  seed: number;
  level: number;
  totalRounds: number;
  board: number[][];
  player: [number, number];
  ai: [number, number];
  round: number;
  playerScore: number;
  aiScore: number;
  finished: boolean;
  winner?: "player" | "ai" | "draw";
  lastPlayerMove?: [number, number];
  lastAiMove?: [number, number];
  history: Array<{
    round: number;
    label: string;
    detail: string;
    score: number;
  }>;
}

const DECISION_BOARD: number[][] = [
  [2, 0, 1, 0, 3],
  [0, 3, 0, 2, 0],
  [1, 0, 2, 0, 1],
  [0, 2, 0, 3, 0],
  [3, 0, 1, 0, 2]
];

function decisionBoardForSeed(seed: number): number[][] {
  const shift = Math.abs(seed || 1) % 5;
  return DECISION_BOARD.map((row) =>
    row.map((_, i) => row[(i + shift) % 5])
  );
}

export function createDecisionChess(
  mode: LeadershipGameMode,
  options: LeadershipGameOptions = {}
): DecisionChessState {
  const seed = Math.abs(options.seed || 1);
  const level = Math.min(3, Math.max(1, options.level || 1));
  return {
    mode,
    seed,
    level,
    totalRounds: mode === "battle" ? 6 + level * 2 : 3,
    board: decisionBoardForSeed(seed),
    player: [4, 1],
    ai: [0, 3],
    round: 1,
    playerScore: 0,
    aiScore: 0,
    finished: false,
    history: []
  };
}

export function decisionChessMoves(
  state: DecisionChessState,
  pos: [number, number]
): Array<[number, number]> {
  const moves: Array<[number, number]> = [];
  const isPlayer = pos[0] === state.player[0] && pos[1] === state.player[1];
  const occupied = isPlayer ? state.ai : state.player;
  for (const [dr, dc] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ]) {
    const nr = pos[0] + dr;
    const nc = pos[1] + dc;
    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
      if (nr === occupied[0] && nc === occupied[1]) continue;
      moves.push([nr, nc]);
    }
  }
  return moves;
}

export function decisionChessBestMove(
  state: DecisionChessState,
  pos: [number, number],
  goal: [number, number]
): [number, number] {
  const moves = decisionChessMoves(state, pos);
  let best = moves[0];
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const move of moves) {
    const value = state.board[move[0]][move[1]];
    const distance =
      Math.abs(move[0] - goal[0]) + Math.abs(move[1] - goal[1]);
    const score = value * 2 + (10 - distance) + (move[0] === goal[0] && move[1] === goal[1] ? 30 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}

function decisionChessAdvance(
  state: DecisionChessState,
  side: "player" | "ai",
  to: [number, number]
): DecisionChessState {
  const next: DecisionChessState = {
    ...state,
    board: state.board.map((row) => [...row]),
    player: [...state.player] as [number, number],
    ai: [...state.ai] as [number, number]
  };
  if (side === "player") {
    next.player = to;
    next.lastPlayerMove = to;
    next.playerScore += state.board[to[0]][to[1]];
  } else {
    next.ai = to;
    next.lastAiMove = to;
    next.aiScore += state.board[to[0]][to[1]];
  }
  next.board[to[0]][to[1]] = 0;
  return next;
}

export function applyDecisionChessMove(
  state: DecisionChessState,
  to: [number, number]
): DecisionChessState {
  if (state.finished) return state;
  let next = decisionChessAdvance(state, "player", to);
  if (next.player[0] === 0 && next.player[1] === 3) {
    next.playerScore += 20;
    next.finished = true;
    next.winner = "player";
    next.history = [
      ...next.history,
      {
        round: next.round,
        label: `R${next.round}`,
        detail: `${next.player[0]},${next.player[1]} +${next.playerScore}`,
        score: next.playerScore
      }
    ];
    return next;
  }
  const maxRounds = next.totalRounds;
  if (next.round >= maxRounds) {
    next.finished = true;
    next.winner =
      next.playerScore > next.aiScore
        ? "player"
        : next.aiScore > next.playerScore
          ? "ai"
          : "draw";
    return next;
  }
  const aiMove = decisionChessBestMove(next, next.ai, [4, 1]);
  next = decisionChessAdvance(next, "ai", aiMove);
  if (next.ai[0] === 4 && next.ai[1] === 1) {
    next.aiScore += 20;
    next.finished = true;
    next.winner = "ai";
    return next;
  }
  next.history = [
    ...next.history,
    {
      round: next.round,
      label: `R${next.round}`,
      detail: `${next.player[0]},${next.player[1]} vs ${next.ai[0]},${next.ai[1]}`,
      score: next.playerScore
    }
  ];
  next.round += 1;
  if (next.round > maxRounds) {
    next.finished = true;
    next.winner =
      next.playerScore > next.aiScore
        ? "player"
        : next.aiScore > next.playerScore
          ? "ai"
          : "draw";
  }
  return next;
}

// ---------------------------------------------------------------------------
// 2. Game Theory
// ---------------------------------------------------------------------------

export type GameTheoryChoice = "cooperate" | "compete";

export interface GameTheoryState {
  mode: LeadershipGameMode;
  seed: number;
  level: number;
  totalRounds: number;
  round: number;
  playerScore: number;
  aiScore: number;
  playerHistory: GameTheoryChoice[];
  aiHistory: GameTheoryChoice[];
  finished: boolean;
  winner?: "player" | "ai" | "draw";
  lastPlayerChoice?: GameTheoryChoice;
  lastAiChoice?: GameTheoryChoice;
  history: Array<{
    round: number;
    label: string;
    detail: string;
    score: number;
  }>;
}

export function createGameTheory(
  mode: LeadershipGameMode,
  options: LeadershipGameOptions = {}
): GameTheoryState {
  const seed = Math.abs(options.seed || 1);
  const level = Math.min(3, Math.max(1, options.level || 1));
  return {
    mode,
    seed,
    level,
    totalRounds: mode === "battle" ? 5 + (level - 1) * 2 : 3,
    round: 1,
    playerScore: 0,
    aiScore: 0,
    playerHistory: [],
    aiHistory: [],
    finished: false,
    history: []
  };
}

export function gameTheoryAiChoice(
  state: GameTheoryState
): GameTheoryChoice {
  const last = state.playerHistory[state.playerHistory.length - 1];
  const retaliateRate = state.level >= 3 ? 0.9 : state.level === 2 ? 0.65 : 0.35;
  if (last === "compete") {
    return (state.round * 7 + state.seed) % 10 < retaliateRate * 10
      ? "compete"
      : "cooperate";
  }
  return (state.round * 3 + state.seed) % 5 === 0 ? "compete" : "cooperate";
}

export function gameTheoryPayoff(
  player: GameTheoryChoice,
  ai: GameTheoryChoice
): [number, number] {
  if (player === "cooperate" && ai === "cooperate") return [3, 3];
  if (player === "compete" && ai === "cooperate") return [5, -1];
  if (player === "cooperate" && ai === "compete") return [-1, 5];
  return [1, 1];
}

export function applyGameTheoryChoice(
  state: GameTheoryState,
  choice: GameTheoryChoice
): GameTheoryState {
  if (state.finished) return state;
  const ai = gameTheoryAiChoice(state);
  const [playerDelta, aiDelta] = gameTheoryPayoff(choice, ai);
  const playerScore = state.playerScore + playerDelta;
  const next: GameTheoryState = {
    ...state,
    playerScore,
    aiScore: state.aiScore + aiDelta,
    playerHistory: [...state.playerHistory, choice],
    aiHistory: [...state.aiHistory, ai],
    lastPlayerChoice: choice,
    lastAiChoice: ai,
    history: [
      ...state.history,
      {
        round: state.round,
        label: choice,
        detail: `${choice} vs ${ai}: +${playerDelta}`,
        score: playerScore
      }
    ]
  };
  const maxRounds = next.totalRounds;
  if (next.round >= maxRounds) {
    next.finished = true;
    next.winner =
      next.playerScore > next.aiScore
        ? "player"
        : next.aiScore > next.playerScore
          ? "ai"
          : "draw";
  } else {
    next.round += 1;
  }
  return next;
}

// ---------------------------------------------------------------------------
// 3. Resource Allocation
// ---------------------------------------------------------------------------

export type ResourceArea =
  | "cashflow"
  | "customer"
  | "team"
  | "innovation";

export const RESOURCE_AREAS: ResourceArea[] = [
  "cashflow",
  "customer",
  "team",
  "innovation"
];

export const RESOURCE_AREA_LABELS: Record<
  ResourceArea,
  { zh: string; en: string }
> = {
  cashflow: { zh: "现金流", en: "Cash Flow" },
  customer: { zh: "客户", en: "Customers" },
  team: { zh: "团队", en: "Team" },
  innovation: { zh: "创新", en: "Innovation" }
};

export interface ResourceAllocationState {
  mode: LeadershipGameMode;
  seed: number;
  level: number;
  totalRounds: number;
  round: number;
  totalScore: number;
  finished: boolean;
  multipliers: Record<ResourceArea, number>;
  lastRound?: {
    allocation: Record<ResourceArea, number>;
    score: number;
    bonus: boolean;
  };
  history: Array<{
    round: number;
    label: string;
    detail: string;
    score: number;
  }>;
}

const ALLOCATION_TABLES: Record<
  LeadershipGameMode,
  Array<Record<ResourceArea, number>>
> = {
  teach: [
    { cashflow: 1, customer: 0.8, team: 0.6, innovation: 0.4 }
  ],
  train: [
    { cashflow: 0.5, customer: 1, team: 0.7, innovation: 0.9 }
  ],
  battle: [
    { cashflow: 1, customer: 0.6, team: 0.8, innovation: 0.7 },
    { cashflow: 0.5, customer: 1, team: 0.7, innovation: 0.9 },
    { cashflow: 0.7, customer: 0.5, team: 1, innovation: 0.8 }
  ]
};

function allocationMultipliers(
  mode: LeadershipGameMode,
  level: number,
  round: number,
  seed: number
): Record<ResourceArea, number> {
  if (mode !== "battle") {
    return { ...ALLOCATION_TABLES[mode][0] };
  }
  const safeSeed = Math.abs(seed || 1);
  const base =
    ALLOCATION_TABLES.battle[
      (round - 1 + safeSeed) % ALLOCATION_TABLES.battle.length
    ];
  const shift = safeSeed % 4;
  const result = {} as Record<ResourceArea, number>;
  RESOURCE_AREAS.forEach((area, i) => {
    const bonus = (i + shift) % 4 === 0 ? 0.15 : 0;
    result[area] = Math.round((base[area] + bonus) * 100) / 100;
  });
  return result;
}

export function createResourceAllocation(
  mode: LeadershipGameMode,
  options: LeadershipGameOptions = {}
): ResourceAllocationState {
  const seed = Math.abs(options.seed || 1);
  const level = Math.min(3, Math.max(1, options.level || 1));
  return {
    mode,
    seed,
    level,
    totalRounds: mode === "battle" ? 2 + level : 3,
    round: 1,
    totalScore: 0,
    finished: false,
    multipliers: allocationMultipliers(mode, level, 1, seed),
    history: []
  };
}

export function applyResourceAllocation(
  state: ResourceAllocationState,
  allocation: Record<ResourceArea, number>
): ResourceAllocationState {
  if (state.finished) return state;
  const total = RESOURCE_AREAS.reduce(
    (sum, area) => sum + (allocation[area] ?? 0),
    0
  );
  if (total !== 100) return state;
  const raw = RESOURCE_AREAS.reduce(
    (sum, area) => sum + (allocation[area] ?? 0) * state.multipliers[area],
    0
  );
  const bonus = RESOURCE_AREAS.every((area) => (allocation[area] ?? 0) > 0);
  const score = Math.round(raw + (bonus ? 15 : 0));
  const totalScore = state.totalScore + score;
  const next: ResourceAllocationState = {
    ...state,
    totalScore,
    lastRound: { allocation: { ...allocation }, score, bonus },
    multipliers: { ...state.multipliers },
    history: [
      ...state.history,
      {
        round: state.round,
        label: `R${state.round}`,
        detail: `${allocation.cashflow}/${allocation.customer}/${allocation.team}/${allocation.innovation} +${score}`,
        score: totalScore
      }
    ]
  };
  const maxRounds = next.totalRounds;
  if (next.round >= maxRounds) {
    next.finished = true;
  } else {
    next.round += 1;
    next.multipliers = allocationMultipliers(
      next.mode,
      next.level,
      next.round,
      next.seed
    );
  }
  return next;
}

// ---------------------------------------------------------------------------
// 4. Team Management
// ---------------------------------------------------------------------------

export type TeamSkill = "analysis" | "communication" | "execution" | "innovation";

export interface TeamMember {
  id: string;
  zh: string;
  en: string;
  skill: TeamSkill;
  energy: number;
}

export interface TeamTask {
  id: string;
  zh: string;
  en: string;
  skill: TeamSkill;
  required: number;
}

export interface TeamManagementState {
  mode: LeadershipGameMode;
  seed: number;
  level: number;
  totalRounds: number;
  round: number;
  score: number;
  finished: boolean;
  members: TeamMember[];
  tasks: TeamTask[];
  lastRound?: {
    memberId: string;
    taskId: string;
    quality: number;
    gained: number;
  };
  history: Array<{
    round: number;
    label: string;
    detail: string;
    score: number;
  }>;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "m1", zh: "张伟", en: "Wei", skill: "analysis", energy: 2 },
  { id: "m2", zh: "李娜", en: "Na", skill: "communication", energy: 2 },
  { id: "m3", zh: "陈峰", en: "Feng", skill: "execution", energy: 2 },
  { id: "m4", zh: "赵敏", en: "Min", skill: "innovation", energy: 2 }
];

const TEAM_TASKS: TeamTask[] = [
  { id: "t1", zh: "预算异常分析", en: "Budget Anomaly Review", skill: "analysis", required: 2 },
  { id: "t2", zh: "跨部门对齐会", en: "Cross-team Alignment", skill: "communication", required: 2 },
  { id: "t3", zh: "客户交付冲刺", en: "Customer Delivery Sprint", skill: "execution", required: 2 },
  { id: "t4", zh: "新方案原型", en: "New Proposal Prototype", skill: "innovation", required: 2 },
  { id: "t5", zh: "季度复盘会", en: "Quarterly Review", skill: "analysis", required: 3 },
  { id: "t6", zh: "跨部门方案路演", en: "Cross-team Roadshow", skill: "communication", required: 3 }
];

export function createTeamManagement(
  mode: LeadershipGameMode,
  options: LeadershipGameOptions = {}
): TeamManagementState {
  const seed = Math.abs(options.seed || 1);
  const level = Math.min(3, Math.max(1, options.level || 1));
  const shift = seed % 4;
  const members = [
    ...TEAM_MEMBERS.slice(shift),
    ...TEAM_MEMBERS.slice(0, shift)
  ].map((member) => ({ ...member }));
  const tasks = TEAM_TASKS.map((task) => ({ ...task })).slice(
    0,
    3 + level
  );
  return {
    mode,
    seed,
    level,
    totalRounds: mode === "battle" ? 3 + level : 3,
    round: 1,
    score: 0,
    finished: false,
    members,
    tasks,
    history: []
  };
}

export function applyTeamAssignment(
  state: TeamManagementState,
  memberId: string,
  taskId: string
): TeamManagementState {
  if (state.finished) return state;
  const member = state.members.find((item) => item.id === memberId);
  const task = state.tasks.find((item) => item.id === taskId);
  if (!member || !task || member.energy <= 0) return state;
  const quality = member.skill === task.skill ? 3 : 1;
  const gained = 10 + quality * 2;
  const score = state.score + gained;
  const next: TeamManagementState = {
    ...state,
    score,
    members: state.members.map((item) =>
      item.id === memberId ? { ...item, energy: item.energy - 1 } : item
    ),
    lastRound: { memberId, taskId, quality, gained },
    history: [
      ...state.history,
      {
        round: state.round,
        label: taskId,
        detail: `${memberId} -> ${taskId} x${quality}`,
        score
      }
    ]
  };
  const maxRounds = next.totalRounds;
  if (next.round >= maxRounds) {
    next.finished = true;
  } else {
    next.round += 1;
  }
  return next;
}

// ---------------------------------------------------------------------------
// 5. Crisis Command
// ---------------------------------------------------------------------------

export interface CrisisOption {
  zh: string;
  en: string;
  summaryZh: string;
  summaryEn: string;
  score: number;
  effects: { trust: number; energy: number; influence: number };
  feedbackZh: string;
  feedbackEn: string;
}

export interface CrisisEvent {
  id: string;
  titleZh: string;
  titleEn: string;
  sceneZh: string;
  sceneEn: string;
  insightZh: string;
  insightEn: string;
  options: CrisisOption[];
}

export interface CrisisCommandState {
  mode: LeadershipGameMode;
  seed: number;
  level: number;
  offset: number;
  totalRounds: number;
  round: number;
  score: number;
  trust: number;
  energy: number;
  influence: number;
  finished: boolean;
  lastRound?: {
    eventId: string;
    optionIndex: number;
    gained: number;
  };
  history: Array<{
    round: number;
    label: string;
    detail: string;
    score: number;
  }>;
}

export const CRISIS_EVENTS: CrisisEvent[] = [
  {
    id: "c1",
    titleZh: "凌晨系统故障",
    titleEn: "Midnight System Outage",
    sceneZh: "核心服务在深夜降级，群里开始互相猜测责任。",
    sceneEn: "Core service degrades at midnight and the team starts guessing who is at fault.",
    insightZh: "先止血，再复盘；责任问题等系统恢复后再谈。",
    insightEn: "Stop the bleeding first; review responsibility after recovery.",
    options: [
      {
        zh: "先确认现状并分配止血动作",
        en: "Confirm the situation and assign recovery actions",
        summaryZh: "让值班团队先恢复服务，再收集证据。",
        summaryEn: "Let the on-call team recover service before gathering evidence.",
        score: 10,
        effects: { trust: 2, energy: -2, influence: 2 },
        feedbackZh: "你把注意力放在可执行动作上，团队信任没有受损。",
        feedbackEn: "You focused on executable actions and preserved team trust."
      },
      {
        zh: "先要求立刻给出责任人",
        en: "Demand the responsible person immediately",
        summaryZh: "在信息不全时先追责，容易制造防御气氛。",
        summaryEn: "Chasing blame without full information creates defensiveness.",
        score: 2,
        effects: { trust: -2, energy: -2, influence: 1 },
        feedbackZh: "你看起来果断，但团队开始保护自己。",
        feedbackEn: "You looked decisive, but the team started protecting itself."
      },
      {
        zh: "让团队自行处理，你不介入",
        en: "Let the team handle it alone",
        summaryZh: "不介入会让关键决策失去支持。",
        summaryEn: "Staying away leaves key decisions without support.",
        score: -1,
        effects: { trust: -1, energy: 0, influence: -1 },
        feedbackZh: "你保留了精力，却失去了在场感。",
        feedbackEn: "You saved energy but lost presence."
      }
    ]
  },
  {
    id: "c2",
    titleZh: "核心员工提出离职",
    titleEn: "Key Employee Resigns",
    sceneZh: "核心骨干突然提出离职，客户项目正处关键期。",
    sceneEn: "A key member resigns during a critical client project.",
    insightZh: "先搞清楚是钱、成长还是信任问题，再决定挽留方式。",
    insightEn: "Find out whether it is pay, growth, or trust before deciding how to retain.",
    options: [
      {
        zh: "先约谈了解真实原因",
        en: "Meet to understand the real reason",
        summaryZh: "用一次安静对话获取真实信息。",
        summaryEn: "Use one quiet conversation to learn the real reason.",
        score: 10,
        effects: { trust: 3, energy: -2, influence: 1 },
        feedbackZh: "你拿到了比离职单更有价值的信息。",
        feedbackEn: "You gained more valuable information than the resignation letter."
      },
      {
        zh: "直接承诺加薪留住",
        en: "Offer a raise immediately",
        summaryZh: "用钱回应，可能掩盖更深的问题。",
        summaryEn: "Money may mask a deeper problem.",
        score: 3,
        effects: { trust: 1, energy: -1, influence: -1 },
        feedbackZh: "短期留住了人，但没有解决真正的问题。",
        feedbackEn: "You kept the person short-term without fixing the real issue."
      },
      {
        zh: "让 HR 处理，你不过问",
        en: "Let HR handle it",
        summaryZh: "关键人才问题不应该完全外包。",
        summaryEn: "Key talent problems should not be fully outsourced.",
        score: -1,
        effects: { trust: -1, energy: 0, influence: -1 },
        feedbackZh: "你失去了了解团队情绪的机会。",
        feedbackEn: "You missed the chance to understand team morale."
      }
    ]
  },
  {
    id: "c3",
    titleZh: "预算被削减",
    titleEn: "Budget Cut",
    sceneZh: "季度预算削减 20%，所有项目组都在等你的优先级。",
    sceneEn: "Quarterly budget drops 20% and every project waits for your priorities.",
    insightZh: "资源分配要公开标准，而不是只公布结果。",
    insightEn: "Share the allocation criteria, not just the outcome.",
    options: [
      {
        zh: "先公布取舍标准再定项目",
        en: "Publish criteria before cutting projects",
        summaryZh: "让团队理解为什么留下这些项目。",
        summaryEn: "Help the team understand why these projects survive.",
        score: 10,
        effects: { trust: 3, energy: -2, influence: 2 },
        feedbackZh: "标准公开后，反对声变成了执行共识。",
        feedbackEn: "Public criteria turned resistance into execution alignment."
      },
      {
        zh: "私下决定后直接公布",
        en: "Decide privately and announce",
        summaryZh: "效率高，但团队会猜测决策依据。",
        summaryEn: "Efficient, but the team will guess the rationale.",
        score: 3,
        effects: { trust: -1, energy: -1, influence: 1 },
        feedbackZh: "结果清晰，但信任出现缺口。",
        feedbackEn: "The outcome is clear but trust has a gap."
      },
      {
        zh: "先拖延等新预算",
        en: "Delay and wait for new budget",
        summaryZh: "把不确定性留给了所有项目组。",
        summaryEn: "You leave uncertainty to every team.",
        score: -2,
        effects: { trust: -2, energy: -1, influence: -1 },
        feedbackZh: "等待并没有消除风险，只放大了焦虑。",
        feedbackEn: "Waiting did not remove risk; it amplified anxiety."
      }
    ]
  },
  {
    id: "c4",
    titleZh: "客户当众质疑",
    titleEn: "Client Challenge in Public",
    sceneZh: "关键客户在会议上公开质疑团队交付能力。",
    sceneEn: "A key client publicly questions your team's delivery capability.",
    insightZh: "对外稳住局面，对内保护团队尊严。",
    insightEn: "Stabilize externally and protect team dignity internally.",
    options: [
      {
        zh: "先承接问题并给验证时间",
        en: "Accept the concern and set a verification timeline",
        summaryZh: "给客户确定性，也给团队空间。",
        summaryEn: "Give the client certainty and the team space.",
        score: 10,
        effects: { trust: 2, energy: -2, influence: 3 },
        feedbackZh: "你保护了团队，也给了客户可验证的承诺。",
        feedbackEn: "You protected the team and gave the client a verifiable promise."
      },
      {
        zh: "当场反驳客户",
        en: "Push back on the client immediately",
        summaryZh: "赢了面子，输了关系。",
        summaryEn: "You win the argument but lose the relationship.",
        score: 0,
        effects: { trust: 1, energy: -1, influence: -2 },
        feedbackZh: "团队觉得你维护了他们，但客户关系受损。",
        feedbackEn: "The team feels defended, but the client relationship suffers."
      },
      {
        zh: "当场承诺不可能的时间",
        en: "Promise an impossible deadline",
        summaryZh: "短期安抚客户，长期制造失信。",
        summaryEn: "Short-term comfort creates long-term distrust.",
        score: -3,
        effects: { trust: -2, energy: -2, influence: 1 },
        feedbackZh: "承诺无法兑现时，信任会双倍流失。",
        feedbackEn: "When the promise fails, trust drains twice as fast."
      }
    ]
  },
  {
    id: "c5",
    titleZh: "业绩连续下滑",
    titleEn: "Declining Performance",
    sceneZh: "连续两个季度业绩下滑，总部开始施压。",
    sceneEn: "Two straight quarters of decline and headquarters is pressing.",
    insightZh: "先把下滑拆成可验证的信号，再决定动哪里。",
    insightEn: "Break the decline into verifiable signals before deciding what to change.",
    options: [
      {
        zh: "先做信号拆解再定动作",
        en: "Break down signals before acting",
        summaryZh: "区分市场、产品与执行问题。",
        summaryEn: "Separate market, product, and execution problems.",
        score: 10,
        effects: { trust: 2, energy: -2, influence: 3 },
        feedbackZh: "你让团队看到了可以行动的方向。",
        feedbackEn: "You gave the team a direction they can act on."
      },
      {
        zh: "先换掉负责人",
        en: "Replace the leader first",
        summaryZh: "快速动作，但没有验证根因。",
        summaryEn: "Fast action without verifying the root cause.",
        score: 1,
        effects: { trust: -2, energy: -1, influence: 2 },
        feedbackZh: "你制造了变化，也制造了新的不确定性。",
        feedbackEn: "You created change and new uncertainty."
      },
      {
        zh: "要求团队加班冲业绩",
        en: "Order the team to work overtime",
        summaryZh: "短期冲量，长期消耗。",
        summaryEn: "Short-term output, long-term burnout.",
        score: -2,
        effects: { trust: -3, energy: -3, influence: 1 },
        feedbackZh: "压力没有变成能力，只变成了疲劳。",
        feedbackEn: "Pressure became fatigue, not capability."
      }
    ]
  }
];

export function createCrisisCommand(
  mode: LeadershipGameMode,
  options: LeadershipGameOptions = {}
): CrisisCommandState {
  const seed = Math.abs(options.seed || 1);
  const level = Math.min(3, Math.max(1, options.level || 1));
  return {
    mode,
    seed,
    level,
    offset: seed % CRISIS_EVENTS.length,
    totalRounds:
      mode === "battle" ? Math.min(CRISIS_EVENTS.length, 3 + level) : 3,
    round: 1,
    score: 0,
    trust: 50,
    energy: 60,
    influence: 40,
    finished: false,
    history: []
  };
}

export function applyCrisisChoice(
  state: CrisisCommandState,
  optionIndex: number
): CrisisCommandState {
  if (state.finished) return state;
  const event =
    CRISIS_EVENTS[
      (state.round - 1 + state.offset) % CRISIS_EVENTS.length
    ];
  const option = event?.options[optionIndex];
  if (!event || !option) return state;
  const score = state.score + option.score;
  const next: CrisisCommandState = {
    ...state,
    score,
    trust: Math.max(0, Math.min(100, state.trust + option.effects.trust)),
    energy: Math.max(0, Math.min(100, state.energy + option.effects.energy)),
    influence: Math.max(
      0,
      Math.min(100, state.influence + option.effects.influence)
    ),
    lastRound: {
      eventId: event.id,
      optionIndex,
      gained: option.score
    },
    history: [
      ...state.history,
      {
        round: state.round,
        label: event.id,
        detail: `${event.titleZh} #${optionIndex + 1} +${option.score}`,
        score
      }
    ]
  };
  const maxRounds = next.totalRounds;
  if (next.round >= maxRounds) {
    next.finished = true;
  } else {
    next.round += 1;
  }
  return next;
}
