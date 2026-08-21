import {
  CRISIS_EVENTS,
  GAME_TUTORIALS,
  LEADERSHIP_GAMES,
  RESOURCE_AREAS,
  RESOURCE_AREA_LABELS,
  TEAM_MEMBERS,
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
  interpretLeadership,
  starOf,
  type CrisisCommandState,
  type DecisionChessState,
  type GameTheoryChoice,
  type GameTheoryState,
  type LeadershipGameId,
  type LeadershipGameMode,
  type ResourceArea,
  type ResourceAllocationState,
  type TeamManagementState
} from "../core/leadership-games";
import {
  ABILITY_DIMENSION_MAP,
  LEADERSHIP_DIMENSIONS
} from "../core/leadership-model";

export type { LeadershipGameId } from "../core/leadership-games";

export interface LeadershipGamesCallbacks {
  onBack(): void;
  onReward(
    gameId: LeadershipGameId,
    won: boolean,
    score: number,
    stars: number,
    achievements: string[],
    branch: string
  ): void;
  getProgress(gameId: LeadershipGameId): {
    maxLevel: number;
    achievements: string[];
  };
}

type AnyGameState =
  | DecisionChessState
  | GameTheoryState
  | ResourceAllocationState
  | TeamManagementState
  | CrisisCommandState;

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface AchievementDef {
  id: string;
  zh: string;
  en: string;
  check: (state: AnyGameState) => boolean;
}

const ACHIEVEMENTS: Record<LeadershipGameId, AchievementDef[]> = {
  "decision-chess": [
    {
      id: "dc-win",
      zh: "旗开得胜",
      en: "First Win",
      check: (state) =>
        "winner" in state && state.winner === "player"
    },
    {
      id: "dc-resource",
      zh: "资源猎人",
      en: "Resource Hunter",
      check: (state) => "playerScore" in state && state.playerScore >= 10
    }
  ],
  "game-theory": [
    {
      id: "gt-win",
      zh: "博弈胜者",
      en: "Game Theory Winner",
      check: (state) =>
        "winner" in state && state.winner === "player"
    },
    {
      id: "gt-cooperate",
      zh: "合作大师",
      en: "Cooperation Master",
      check: (state) =>
        "playerHistory" in state &&
        state.playerHistory.filter((item) => item === "cooperate").length >= 3
    }
  ],
  "resource-allocation": [
    {
      id: "ra-balance",
      zh: "均衡大师",
      en: "Balance Master",
      check: (state) =>
        "history" in state &&
        state.history.length > 0 &&
        state.history.every((item) => item.detail.includes("+15"))
    },
    {
      id: "ra-score",
      zh: "高分调度",
      en: "High-Score Allocator",
      check: (state) => "totalScore" in state && state.totalScore >= 250
    }
  ],
  "team-management": [
    {
      id: "tm-perfect",
      zh: "人尽其才",
      en: "Perfect Fit",
      check: (state) =>
        "history" in state &&
        state.history.length > 0 &&
        state.history.every((item) => item.detail.includes("x3"))
    },
    {
      id: "tm-score",
      zh: "高效指挥",
      en: "Efficient Commander",
      check: (state) => "score" in state && state.score >= 60
    }
  ],
  "crisis-command": [
    {
      id: "cc-expert",
      zh: "冷静指挥",
      en: "Calm Commander",
      check: (state) =>
        "history" in state &&
        state.history.length > 0 &&
        state.history.every((item) => item.detail.includes("+10"))
    },
    {
      id: "cc-trust",
      zh: "信任修复者",
      en: "Trust Rebuilder",
      check: (state) => "trust" in state && state.trust >= 70
    }
  ]
};

export class LeadershipGamesApp {
  private root: HTMLElement;
  private language: "zh" | "en";
  private callbacks: LeadershipGamesCallbacks;
  private currentGameId?: LeadershipGameId;
  private currentMode?: LeadershipGameMode;
  private state?: AnyGameState;
  private rewarded = false;
  private level = 1;
  private teachStep = 0;
  private teachStarted = false;
  private lastAchievements: string[] = [];
  private lastBranch = "";

  constructor(
    language: "zh" | "en",
    callbacks: LeadershipGamesCallbacks
  ) {
    this.language = language;
    this.callbacks = callbacks;
    this.root = document.createElement("div");
  }

  render(container: HTMLElement): void {
    this.root = container;
    container.innerHTML = this.currentGameId
      ? this.renderGame()
      : this.renderIndex();
  }

  handleAction(action: string, target: HTMLElement): void {
    if (action === "lg-home") {
      this.currentGameId = undefined;
      this.currentMode = undefined;
      this.state = undefined;
      this.rewarded = false;
      this.callbacks.onBack();
      return;
    }
    if (action === "lg-back") {
      this.currentGameId = undefined;
      this.currentMode = undefined;
      this.state = undefined;
      this.rewarded = false;
      this.render(this.root);
      return;
    }
    if (action === "lg-start") {
      const gameId = target.dataset.game as LeadershipGameId;
      const mode = target.dataset.mode as LeadershipGameMode;
      if (target.dataset.level) {
        this.level = Number(target.dataset.level) || 1;
      }
      this.start(gameId, mode);
      return;
    }
    if (action === "lg-again") {
      if (this.currentGameId && this.currentMode) {
        this.start(this.currentGameId, this.currentMode);
      }
      return;
    }
    if (action === "lg-level") {
      this.level = Number(target.dataset.level) || 1;
      this.render(this.root);
      return;
    }
    if (action === "lg-teach-next") {
      this.teachStep += 1;
      this.render(this.root);
      return;
    }
    if (action === "lg-teach-start") {
      this.teachStarted = true;
      this.render(this.root);
      return;
    }
    if (!this.state) return;

    if (action === "lg-move" && "board" in this.state) {
      const to: [number, number] = [
        Number(target.dataset.row),
        Number(target.dataset.col)
      ];
      this.state = applyDecisionChessMove(this.state as DecisionChessState, to);
      this.finishIfDone();
      this.render(this.root);
      return;
    }
    if (action === "lg-choice" && "playerHistory" in this.state) {
      const choice = target.dataset.choice as GameTheoryChoice;
      this.state = applyGameTheoryChoice(this.state as GameTheoryState, choice);
      this.finishIfDone();
      this.render(this.root);
      return;
    }
    if (action === "lg-allocate" && "multipliers" in this.state) {
      const allocation: Record<string, number> = {};
      for (const area of RESOURCE_AREAS) {
        const select = this.root.querySelector<HTMLSelectElement>(
          `[data-alloc="${area}"]`
        );
        allocation[area] = Number(select?.value ?? 0);
      }
      this.state = applyResourceAllocation(
        this.state as ResourceAllocationState,
        allocation as ResourceAllocationState["multipliers"]
      );
      this.finishIfDone();
      this.render(this.root);
      return;
    }
    if (action === "lg-assign" && "members" in this.state) {
      const memberId = target.dataset.member ?? "";
      const taskId = target.dataset.task ?? "";
      this.state = applyTeamAssignment(
        this.state as TeamManagementState,
        memberId,
        taskId
      );
      this.finishIfDone();
      this.render(this.root);
      return;
    }
    if (action === "lg-crisis" && "trust" in this.state) {
      const optionIndex = Number(target.dataset.option);
      this.state = applyCrisisChoice(
        this.state as CrisisCommandState,
        optionIndex
      );
      this.finishIfDone();
      this.render(this.root);
    }
  }

  handleAllocationChange(): void {
    const selects = Array.from(
      this.root.querySelectorAll<HTMLSelectElement>("[data-alloc]")
    );
    const total = selects.reduce(
      (sum, select) => sum + (Number(select.value) || 0),
      0
    );
    const totalElement = this.root.querySelector<HTMLElement>(
      "[data-alloc-total]"
    );
    if (totalElement) {
      totalElement.textContent = `${total} / 100`;
    }
    const button = this.root.querySelector<HTMLButtonElement>(
      "[data-action=lg-allocate]"
    );
    if (button) {
      button.disabled = total !== 100;
    }
  }

  private start(gameId: LeadershipGameId, mode: LeadershipGameMode): void {
    this.currentGameId = gameId;
    this.currentMode = mode;
    this.rewarded = false;
    this.teachStep = 0;
    this.teachStarted = mode !== "teach";
    const seed =
      mode === "teach" ? 1 : Math.floor(Math.random() * 100000) + 1;
    const options = { seed, level: this.level };
    if (gameId === "decision-chess") {
      this.state = createDecisionChess(mode, options);
    } else if (gameId === "game-theory") {
      this.state = createGameTheory(mode, options);
    } else if (gameId === "resource-allocation") {
      this.state = createResourceAllocation(mode, options);
    } else if (gameId === "team-management") {
      this.state = createTeamManagement(mode, options);
    } else {
      this.state = createCrisisCommand(mode, options);
    }
    this.render(this.root);
  }

  private finishIfDone(): void {
    if (!this.state || !this.currentGameId || this.state.finished || this.rewarded) {
      return;
    }
    const won = this.isWon(this.state);
    const score = this.scoreOf(this.state);
    if (this.currentMode === "battle") {
      this.rewarded = true;
      const achievements = this.earnedAchievements(this.state);
      const branch = this.branchOf(this.state);
      const stars = starOf(this.currentGameId, this.state);
      this.lastAchievements = achievements;
      this.lastBranch = branch;
      this.callbacks.onReward(
        this.currentGameId,
        won,
        score,
        stars,
        achievements,
        branch
      );
    }
  }

  private earnedAchievements(state: AnyGameState): string[] {
    const earned: string[] = [];
    const definitions = ACHIEVEMENTS[this.currentGameId ?? "decision-chess"];
    for (const def of definitions) {
      if (def.check(state)) earned.push(def.id);
    }
    return earned;
  }

  private branchOf(state: AnyGameState): string {
    if ("playerHistory" in state) {
      const cooperate = state.playerHistory.filter(
        (item) => item === "cooperate"
      ).length;
      const compete = state.playerHistory.length - cooperate;
      return cooperate >= compete ? "cooperate" : "compete";
    }
    if ("history" in state && "totalScore" in state) {
      const allBalanced =
        state.history.length > 0 &&
        state.history.every((item) => item.detail.includes("+15"));
      return allBalanced ? "balanced" : "focused";
    }
    if ("members" in state && "history" in state) {
      const perfect = state.history.filter((item) =>
        item.detail.includes("x3")
      ).length;
      return perfect >= Math.ceil(state.history.length / 2)
        ? "fit"
        : "reactive";
    }
    if ("trust" in state && "history" in state) {
      const expert = state.history.filter((item) =>
        item.detail.includes("+10")
      ).length;
      return expert >= Math.ceil(state.history.length / 2)
        ? "decisive"
        : "steady";
    }
    if ("playerScore" in state) {
      return state.playerScore >= state.aiScore ? "offensive" : "steady";
    }
    return "steady";
  }

  private isWon(state: AnyGameState): boolean {
    if ("winner" in state) return state.winner === "player";
    if ("totalScore" in state) return state.totalScore >= 180;
    if ("score" in state && "members" in state) return state.score >= 60;
    if ("score" in state && "trust" in state) return state.score >= 20;
    return false;
  }

  private scoreOf(state: AnyGameState): number {
    if ("playerScore" in state) return state.playerScore;
    if ("totalScore" in state) return state.totalScore;
    return "score" in state ? state.score : 0;
  }

  private renderIndex(): string {
    const en = this.language === "en";
    return `
      <header class="topbar">
        <div class="brand">${en ? "Ascend" : "升维"}</div>
        <button class="link" data-action="lg-home">${en ? "Map" : "返回地图"}</button>
      </header>
      <main class="lg-shell" aria-label="${en ? "Leadership Game Center" : "领导力游戏中心"}">
        <section class="lg-hero">
          <p class="eyebrow">${en ? "Leadership Game Center" : "领导力游戏中心"}</p>
          <h1>${en ? "Five games, five leadership muscles" : "五个游戏，练五块领导力肌肉"}</h1>
          <p class="muted">${en ? "Each game has Teaching, Training, and Battle modes. Play to learn the logic behind leadership decisions." : "每个游戏都有教学、训练、对战三种模式。边玩边理解领导决策背后的逻辑。"}</p>
          <div class="lg-levels">
            <span>${en ? "Difficulty" : "难度"}</span>
            ${[1, 2, 3]
              .map(
                (level) =>
                  `<button class="${this.level === level ? "active" : ""}" data-action="lg-level" data-level="${level}">${en ? (level === 1 ? "Easy" : level === 2 ? "Medium" : "Hard") : level === 1 ? "简单" : level === 2 ? "中等" : "困难"}</button>`
              )
              .join("")}
          </div>
        </section>
        <section class="lg-grid">
          ${LEADERSHIP_GAMES.map((game) => {
            const progress = this.callbacks.getProgress(game.id);
            const achievements = ACHIEVEMENTS[game.id]
              .map(
                (def) =>
                  `${progress.achievements.includes(def.id) ? "✔" : "○"} ${esc(en ? def.en : def.zh)}`
              )
              .join(" · ");
            return `
              <article class="lg-card">
                <p class="eyebrow">${esc(en ? game.en : game.zh)}</p>
                <h2>${esc(en ? game.en : game.zh)}</h2>
                <p>${esc(en ? game.enDesc : game.zhDesc)}</p>
                <blockquote>${esc(en ? game.insightEn : game.insightZh)}</blockquote>
                <p class="lg-win">${en ? "Win" : "胜利条件"}：${esc(en ? GAME_TUTORIALS[game.id].winEn : GAME_TUTORIALS[game.id].winZh)}</p>
                <p class="lg-ach">${achievements}</p>
                <p class="muted">${en ? "Unlocked level" : "已解锁难度"}：${progress.maxLevel} / 3</p>
                <div class="lg-modes">
                  <button data-action="lg-start" data-game="${game.id}" data-mode="teach">${en ? "Teach" : "教学"}</button>
                  <button data-action="lg-start" data-game="${game.id}" data-mode="train">${en ? "Train" : "训练"}</button>
                  <button class="primary" data-action="lg-start" data-game="${game.id}" data-mode="battle" data-level="${this.level}" ${this.level > progress.maxLevel ? "disabled aria-disabled=\"true\"" : ""}>${en ? "Battle" : "对战"}</button>
                </div>
              </article>
            `;
          }).join("")}
        </section>
      </main>
    `;
  }

  private renderGame(): string {
    if (!this.state) return this.renderIndex();
    if (this.currentMode === "teach" && !this.teachStarted) {
      return this.renderTeach();
    }
    if (this.currentGameId === "decision-chess") {
      return this.renderDecisionChess(this.state as DecisionChessState);
    }
    if (this.currentGameId === "game-theory") {
      return this.renderGameTheory(this.state as GameTheoryState);
    }
    if (this.currentGameId === "resource-allocation") {
      return this.renderResourceAllocation(
        this.state as ResourceAllocationState
      );
    }
    if (this.currentGameId === "team-management") {
      return this.renderTeamManagement(this.state as TeamManagementState);
    }
    return this.renderCrisisCommand(this.state as CrisisCommandState);
  }

  private gameHeader(
    title: string,
    roundText: string,
    scoreText: string
  ): string {
    const en = this.language === "en";
    return `
      <header class="topbar">
        <div class="brand">${en ? "Ascend" : "升维"}</div>
        <button class="link" data-action="lg-back">${en ? "Games" : "游戏列表"}</button>
        <div class="topbar-meta"><span>${esc(roundText)}</span><span>${esc(scoreText)}</span></div>
      </header>
      <main class="lg-shell">
        <section class="lg-hero">
          <p class="eyebrow">${esc(title)}</p>
          <h1>${esc(title)}</h1>
        </section>
    `;
  }

  private renderTeach(): string {
    const en = this.language === "en";
    const gameId = this.currentGameId ?? "decision-chess";
    const meta = LEADERSHIP_GAMES.find((game) => game.id === gameId);
    const tutorial = GAME_TUTORIALS[gameId];
    const steps = en ? tutorial.stepsEn : tutorial.stepsZh;
    return `
      <header class="topbar">
        <div class="brand">${en ? "Ascend" : "升维"}</div>
        <button class="link" data-action="lg-back">${en ? "Games" : "游戏列表"}</button>
      </header>
      <main class="lg-shell">
        <section class="lg-tutorial">
          <p class="eyebrow">${en ? "Teaching" : "教学"}</p>
          <h1>${esc(en ? meta?.en ?? gameId : meta?.zh ?? gameId)}</h1>
          <div class="lg-win-box">
            <strong>${en ? "Win condition" : "胜利条件"}</strong>
            <p>${esc(en ? tutorial.winEn : tutorial.winZh)}</p>
          </div>
          <ol class="lg-steps">
            ${steps
              .map(
                (step, index) =>
                  `<li class="${index <= this.teachStep ? "active" : ""}">${esc(step)}</li>`
              )
              .join("")}
          </ol>
          <div class="lg-actions">
            <button data-action="lg-teach-next">${en ? "Next" : "下一步"}</button>
            <button class="primary" data-action="lg-teach-start">${en ? "Start Playing" : "开始试玩"}</button>
          </div>
        </section>
      </main>
    `;
  }

  private roundSummary(state: AnyGameState): string {
    const en = this.language === "en";
    if (!("totalRounds" in state)) return "";
    return `<p class="lg-rounds">${en ? `Total ${state.totalRounds} rounds · Round ${state.round} · Score settles after the final round` : `共 ${state.totalRounds} 局 · 当前第 ${state.round} 局 · 终局后结算积分`}</p>`;
  }

  /** 即时领导力解读：把当前小游戏映射到五维领导力模型，并给出即时解读。 */
  private leadershipInterpretationMarkup(state: AnyGameState): string {
    const en = this.language === "en";
    const game = LEADERSHIP_GAMES.find((item) => item.id === this.currentGameId);
    if (!game) return "";
    const dimensionId = ABILITY_DIMENSION_MAP[game.abilityId];
    const dim = LEADERSHIP_DIMENSIONS[dimensionId];
    if (!dim) return "";
    const live = interpretLeadership(this.currentGameId ?? game.id, state);
    return `
      <section class="lg-interpretation">
        <p class="eyebrow">${en ? "Leadership Interpretation" : "领导力解读"}</p>
        <div class="lg-interpretation-head">
          <strong>${en ? dim.en : dim.zh}</strong>
          <span>${en ? dim.enSub : dim.zhSub}</span>
        </div>
        <p class="lg-interpretation-insight">${esc(en ? game.insightEn : game.insightZh)}</p>
        <p class="lg-interpretation-live">${esc(en ? live.en : live.zh)}</p>
      </section>
    `;
  }

  private starsMarkup(state: AnyGameState): string {
    if (this.currentMode !== "battle" || !this.currentGameId) return "";
    if (!state.finished) return "";
    const stars = starOf(this.currentGameId, state);
    if (stars <= 0) return "";
    return `<div class="lg-stars" role="img" aria-label="${stars} / 3">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>`;
  }

  private reviewMarkup(state: AnyGameState): string {
    if (!("history" in state) || state.history.length === 0) return "";
    const en = this.language === "en";
    return `
      ${this.starsMarkup(state)}
      ${this.leadershipInterpretationMarkup(state)}
      <section class="lg-review">
        <h3>${en ? "Review" : "复盘"}</h3>
        <ul>
          ${state.history
            .map(
              (item) =>
                `<li><strong>${esc(item.label)}</strong><span>${esc(item.detail)}</span><em>${item.score}</em></li>`
            )
            .join("")}
        </ul>
        ${
          this.lastAchievements.length > 0
            ? `<p class="lg-ach-earned">${en ? "Achievements" : "新成就"}：${this.lastAchievements
                .map((id) => {
                  const def = ACHIEVEMENTS[
                    this.currentGameId ?? "decision-chess"
                  ].find((item) => item.id === id);
                  return def ? esc(en ? def.en : def.zh) : id;
                })
                .join(" · ")}</p>`
            : ""
        }
        ${
          this.lastBranch
            ? `<p class="lg-branch">${en ? "Branch" : "路线"}：${esc(
                this.language === "en"
                  ? this.branchLabelEn(this.lastBranch)
                  : this.branchLabelZh(this.lastBranch)
              )}</p>`
            : ""
        }
      </section>
    `;
  }

  private branchLabelZh(branch: string): string {
    const labels: Record<string, string> = {
      cooperate: "合作路线",
      compete: "竞争路线",
      balanced: "均衡路线",
      focused: "聚焦路线",
      fit: "人尽其才",
      reactive: "应急管理",
      decisive: "果断路线",
      steady: "稳妥路线",
      offensive: "进攻路线"
    };
    return labels[branch] ?? branch;
  }

  private branchLabelEn(branch: string): string {
    const labels: Record<string, string> = {
      cooperate: "Cooperation Path",
      compete: "Competition Path",
      balanced: "Balanced Path",
      focused: "Focused Path",
      fit: "Right-Fit Path",
      reactive: "Reactive Path",
      decisive: "Decisive Path",
      steady: "Steady Path",
      offensive: "Offensive Path"
    };
    return labels[branch] ?? branch;
  }

  private renderDecisionChess(state: DecisionChessState): string {
    const en = this.language === "en";
    const last =
      state.lastPlayerMove && state.lastPlayerValue !== undefined
        ? (() => {
            const value = state.lastPlayerValue;
            const note =
              value === 0
                ? en
                  ? "You stepped on an empty cell (+0) — advancing, but you skipped nearby resources."
                  : "你踩在空地（+0 分），向前推进但错过了沿途的资源格。"
                : value === 1
                  ? en
                    ? "You landed on a trust cell (+1) — safe but low yield."
                    : "你踩到信任格（+1 分），稳妥但收益偏低。"
                  : value === 2
                    ? en
                      ? "You landed on an influence cell (+2) — decent yield, mind the goal."
                      : "你踩到影响力格（+2 分），收益不错，注意别偏离目标。"
                    : en
                      ? "You landed on a resource cell (+3) — highest yield, make sure you didn't detour."
                      : "你踩到资源格（+3 分），收益最高，但要确认没绕远路。";
            return `<p class="lg-feedback">${note}</p>`;
          })()
        : "";
    const moves = state.finished
      ? []
      : decisionChessMoves(state, state.player);
    const moveSet = new Set(moves.map((m) => `${m[0]},${m[1]}`));
    const cells = state.board
      .map((row, r) =>
        row
          .map((value, c) => {
            const isPlayer = state.player[0] === r && state.player[1] === c;
            const isAi = state.ai[0] === r && state.ai[1] === c;
            const isMove = moveSet.has(`${r},${c}`);
            const label = isPlayer
              ? en ? "You" : "你"
              : isAi
                ? "AI"
                : value === 0
                  ? ""
                  : value === 1
                    ? en ? "T" : "信"
                    : value === 2
                      ? en ? "I" : "影"
                      : en ? "R" : "资";
            const cls = `lg-cell ${isPlayer ? "player" : ""} ${isAi ? "ai" : ""} ${isMove ? "move" : ""} ${value > 0 ? "rich" : ""}`;
            return `
              <button class="${cls}" data-action="lg-move" data-row="${r}" data-col="${c}" ${isMove ? "" : "disabled aria-disabled=\"true\""}>
                ${esc(label)}
              </button>
            `;
          })
          .join("")
      )
      .join("");
    const result = state.finished
      ? `<section class="lg-result ${state.winner === "player" ? "win" : "lose"}">
          <h2>${en ? (state.winner === "player" ? "Victory" : state.winner === "ai" ? "Defeat" : "Draw") : state.winner === "player" ? "推演胜利" : state.winner === "ai" ? "推演失利" : "平局"}</h2>
          <p>${en ? `You ${state.playerScore} · AI ${state.aiScore}` : `你 ${state.playerScore} · AI ${state.aiScore}`}</p>
          <div class="lg-actions"><button class="primary" data-action="lg-again">${en ? "Again" : "再来一局"}</button><button data-action="lg-back">${en ? "Games" : "游戏列表"}</button></div>
        </section>`
      : "";
    return `
      ${this.gameHeader(
        en ? "Decision Chess" : "决策棋",
        `${en ? "Round" : "回合"} ${state.round}`,
        `${en ? "Score" : "得分"} ${state.playerScore}`
      )}
      <p class="lg-hint">${en ? "Move toward the goal at the top middle. Collect trust, influence, and resources on the way." : "向棋盘顶部中间的目标前进，沿途收集信任、影响力与组织资源。"}</p>
      ${this.roundSummary(state)}
      ${last}
      ${result}
      <section class="lg-board">${cells}</section>
      ${this.reviewMarkup(state)}
      </main>
    `;
  }

  private renderGameTheory(state: GameTheoryState): string {
    const en = this.language === "en";
    const last = state.lastPlayerChoice && state.lastAiChoice
      ? (() => {
          const p = state.lastPlayerChoice;
          const a = state.lastAiChoice;
          const why =
            p === "cooperate" && a === "cooperate"
              ? en
                ? "Both cooperated (+3) — predictable goodwill compounds trust."
                : "双方合作 +3，可预测的善意正在积累长期信任。"
              : p === "compete" && a === "cooperate"
                ? en
                  ? "You competed vs cooperation (+5) — this gain invites retaliation."
                  : "你竞争、对方合作（+5），但这次占便宜会招来报复。"
                : p === "cooperate" && a === "compete"
                  ? en
                    ? "You cooperated vs competition (−1) — your trust was betrayed."
                    : "你合作、对方竞争（−1），对方背叛了你的信任。"
                  : en
                    ? "Both competed (+1 each) — a retaliation spiral hurts both."
                    : "双方竞争各 +1，报复循环让双方都吃亏。";
          return `<p class="lg-feedback">${en ? "Last round:" : "上一轮："} ${esc(p === "cooperate" ? (en ? "Cooperate" : "合作") : (en ? "Compete" : "竞争"))} vs ${esc(a === "cooperate" ? (en ? "Cooperate" : "合作") : (en ? "Compete" : "竞争"))} · ${esc(why)}</p>`;
        })()
      : "";
    const result = state.finished
      ? `<section class="lg-result ${state.winner === "player" ? "win" : "lose"}">
          <h2>${en ? (state.winner === "player" ? "Victory" : state.winner === "ai" ? "Defeat" : "Draw") : state.winner === "player" ? "博弈胜利" : state.winner === "ai" ? "博弈失利" : "平局"}</h2>
          <p>${en ? `You ${state.playerScore} · AI ${state.aiScore}` : `你 ${state.playerScore} · AI ${state.aiScore}`}</p>
          <div class="lg-actions"><button class="primary" data-action="lg-again">${en ? "Again" : "再来一局"}</button><button data-action="lg-back">${en ? "Games" : "游戏列表"}</button></div>
        </section>`
      : "";
    return `
      ${this.gameHeader(
        en ? "Game Theory" : "博弈推演",
        `${en ? "Round" : "回合"} ${state.round}`,
        `${en ? "Score" : "得分"} ${state.playerScore}`
      )}
      <p class="lg-hint">${en ? "Cooperate builds trust; competing can win once but invites retaliation." : "合作积累信任；竞争能赢一次，但会招来报复。"}</p>
      ${this.roundSummary(state)}
      ${last}
      ${result}
      <section class="lg-choices">
        <button data-action="lg-choice" data-choice="cooperate">${en ? "Cooperate" : "合作"}</button>
        <button data-action="lg-choice" data-choice="compete">${en ? "Compete" : "竞争"}</button>
      </section>
      ${this.reviewMarkup(state)}
      </main>
    `;
  }

  private renderResourceAllocation(state: ResourceAllocationState): string {
    const en = this.language === "en";
    const defaults: Record<ResourceArea, number> = {
      cashflow: 30,
      customer: 30,
      team: 20,
      innovation: 20
    };
    const selects = RESOURCE_AREAS.map(
      (area) => {
        const selectedValue = defaults[area];
        return `
        <label class="lg-field">
          <span>${esc(en ? RESOURCE_AREA_LABELS[area].en : RESOURCE_AREA_LABELS[area].zh)}</span>
          <select data-alloc="${area}">
            ${[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
              .map(
                (value) =>
                  `<option value="${value}"${value === selectedValue ? " selected" : ""}>${value}</option>`
              )
              .join("")}
          </select>
        </label>
      `;
      }
    ).join("");
    const last = state.lastRound
      ? (() => {
          const alloc = state.lastRound.allocation;
          const maxArea = RESOURCE_AREAS.reduce<ResourceArea>(
            (best, area) => (alloc[area] > alloc[best] ? area : best),
            "cashflow"
          );
          const why = state.lastRound.bonus
            ? en
              ? "All four >0 triggered the +15 balance bonus — you spread the risk."
              : "四项都 >0 触发均衡加成 +15，你把风险摊薄了。"
            : en
              ? `You focused on ${RESOURCE_AREA_LABELS[maxArea].en}, peaking this round but leaving gaps.`
              : `你重点投入「${RESOURCE_AREA_LABELS[maxArea].zh}」，单轮峰值高但留下缺口。`;
          return `<p class="lg-feedback">${en ? "Last round:" : "上一轮："} ${en ? "Score" : "得分"} ${state.lastRound.score} · ${esc(why)}</p>`;
        })()
      : "";
    const result = state.finished
      ? `<section class="lg-result win">
          <h2>${en ? "Round Complete" : "本轮完成"}</h2>
          <p>${en ? "Total score" : "总分"} ${state.totalScore}</p>
          <div class="lg-actions"><button class="primary" data-action="lg-again">${en ? "Again" : "再来一局"}</button><button data-action="lg-back">${en ? "Games" : "游戏列表"}</button></div>
        </section>`
      : "";
    return `
      ${this.gameHeader(
        en ? "Resource Allocation" : "资源分配",
        `${en ? "Round" : "回合"} ${state.round}`,
        `${en ? "Score" : "得分"} ${state.totalScore}`
      )}
      <p class="lg-hint">${en ? "Allocate exactly 100 points. Every area adds value; balanced coverage earns a bonus." : "四项合计必须等于 100。每项都有价值，均衡覆盖会获得加成。"}</p>
      ${this.roundSummary(state)}
      <p class="lg-feedback" data-alloc-total aria-live="polite">${en ? "Total 100 / 100" : "合计 100 / 100"}</p>
      ${last}
      ${result}
      <section class="lg-form">${selects}<button data-action="lg-allocate">${en ? "Commit Allocation" : "确认分配"}</button></section>
      ${this.reviewMarkup(state)}
      </main>
    `;
  }

  private renderTeamManagement(state: TeamManagementState): string {
    const en = this.language === "en";
    const task = state.tasks[state.round - 1];
    const taskMarkup = task
      ? `<section class="lg-task">
          <h2>${esc(en ? task.en : task.zh)}</h2>
          <p class="muted">${en ? "Required skill" : "所需能力"}: ${esc(task.skill)} · ${en ? "Level" : "等级"} ${task.required}</p>
        </section>`
      : "";
    const members = state.members
      .map(
        (member) => `
          <button class="lg-member" data-action="lg-assign" data-member="${member.id}" data-task="${task?.id ?? ""}" ${member.energy <= 0 || !task ? "disabled aria-disabled=\"true\"" : ""}>
            <strong>${esc(en ? member.en : member.zh)}</strong>
            <span>${esc(member.skill)} · ${en ? "Energy" : "精力"} ${member.energy}</span>
          </button>
        `
      )
      .join("");
    const last = state.lastRound
      ? (() => {
          const why =
            state.lastRound.quality === 3
              ? en
                ? "Skill matched the task — strength leveraged."
                : "成员专长与任务要求匹配，长项红利最大化。"
              : en
                ? "Skill didn't match — task covered, strength forfeited."
                : "成员专长不匹配，短期应付了任务，却放弃了长项红利。";
          return `<p class="lg-feedback">${en ? "Last match" : "上次匹配"} ${state.lastRound.quality}/3 · +${state.lastRound.gained} · ${esc(why)}</p>`;
        })()
      : "";
    const result = state.finished
      ? `<section class="lg-result win"><h2>${en ? "Round Complete" : "本轮完成"}</h2><p>${en ? "Score" : "得分"} ${state.score}</p><div class="lg-actions"><button class="primary" data-action="lg-again">${en ? "Again" : "再来一局"}</button><button data-action="lg-back">${en ? "Games" : "游戏列表"}</button></div></section>`
      : "";
    return `
      ${this.gameHeader(
        en ? "Team Management" : "团队管理",
        `${en ? "Round" : "回合"} ${state.round}`,
        `${en ? "Score" : "得分"} ${state.score}`
      )}
      <p class="lg-hint">${en ? "Assign the best member to the current task. Matching skill earns more." : "为当前任务选择最合适的成员。能力匹配会获得更高得分。"}</p>
      ${this.roundSummary(state)}
      ${taskMarkup}
      ${last}
      ${result}
      <section class="lg-team">${members}</section>
      ${this.reviewMarkup(state)}
      </main>
    `;
  }

  private renderCrisisCommand(state: CrisisCommandState): string {
    const en = this.language === "en";
    const event =
      CRISIS_EVENTS[
        (state.round - 1 + state.offset) % CRISIS_EVENTS.length
      ];
    if (!event) return this.renderIndex();
    const options = event.options
      .map(
        (option, index) => `
          <button class="lg-option" data-action="lg-crisis" data-option="${index}">
            <strong>${esc(en ? option.en : option.zh)}</strong>
            <span>${esc(en ? option.summaryEn : option.summaryZh)}</span>
          </button>
        `
      )
      .join("");
    const last = state.lastRound
      ? `<p class="lg-feedback">${esc(en ? event.options[state.lastRound.optionIndex].feedbackEn : event.options[state.lastRound.optionIndex].feedbackZh)}</p>`
      : "";
    const result = state.finished
      ? `<section class="lg-result win"><h2>${en ? "Round Complete" : "本轮完成"}</h2><p>${en ? "Score" : "得分"} ${state.score}</p><div class="lg-actions"><button class="primary" data-action="lg-again">${en ? "Again" : "再来一局"}</button><button data-action="lg-back">${en ? "Games" : "游戏列表"}</button></div></section>`
      : "";
    return `
      ${this.gameHeader(
        en ? "Crisis Command" : "危机指挥",
        `${en ? "Event" : "事件"} ${state.round}`,
        `${en ? "Score" : "得分"} ${state.score}`
      )}
      ${this.roundSummary(state)}
      <section class="lg-crisis-scene">
        <h2>${esc(en ? event.titleEn : event.titleZh)}</h2>
        <p>${esc(en ? event.sceneEn : event.sceneZh)}</p>
        <blockquote>${esc(en ? event.insightEn : event.insightZh)}</blockquote>
      </section>
      ${last}
      ${result}
      <section class="lg-options">${options}</section>
      ${this.reviewMarkup(state)}
      </main>
    `;
  }
}
