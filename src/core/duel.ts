import {
  ABILITY_ORDER,
  ROLES,
  abilityLevel,
  createDefaultAbilities
} from "./abilities.ts";
import { duelNodes } from "./story.ts";
import type {
  AbilityId,
  DuelProfile,
  DuelResult,
  RoleId,
  StoryNode
} from "./types.ts";

export const DUEL_ROUND_TIMEOUT_MS = 60000;

export interface DuelSnapshot {
  players: DuelProfile[];
  nodes: StoryNode[];
  roundCount: number;
  currentRound: number;
  scores: [number, number];
  picks: [number | null, number | null];
  roundResults: DuelResult["roundResults"];
}

export class DuelEngine {
  players: [DuelProfile, DuelProfile];
  nodes: StoryNode[];
  readonly roundCount: number;
  currentRound = 0;
  scores: [number, number] = [0, 0];
  picks: [number | null, number | null] = [null, null];
  roundResults: DuelResult["roundResults"] = [];

  constructor(
    playerOne: DuelProfile,
    playerTwo: DuelProfile,
    roundCount: number,
    seed: number,
    seenIds: string[] = []
  ) {
    this.players = [playerOne, playerTwo];
    this.roundCount = Math.min(7, Math.max(1, roundCount));
    this.nodes = duelNodes(this.roundCount, seed, seenIds);
  }

  get node(): StoryNode {
    return this.nodes[this.currentRound];
  }

  pick(playerIndex: 0 | 1, optionIndex: number): void {
    if (this.picks[playerIndex] !== null) {
      return;
    }
    this.picks[playerIndex] = optionIndex;
  }

  resolvePendingRound(): void {
    if (this.picks[0] !== null && this.picks[1] !== null) {
      this.resolveRound();
    }
  }

  /**
   * 风格押注：玩家在揭晓前押对手会选择 expert/partial/risk 中的哪种风格。
   * 押中后按本回合自身基础得分的 20% 加成分数（至少 +2），返回实际加成。
   */
  predictOpponentStyle(
    playerIndex: 0 | 1,
    quality: "expert" | "partial" | "risk"
  ): number {
    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const opponentPick = this.picks[opponentIndex];
    const ownPick = this.picks[playerIndex];
    if (opponentPick === null || ownPick === null) {
      return 0;
    }
    if (this.node.options[opponentPick].quality !== quality) {
      return 0;
    }
    const bonus = Math.max(2, Math.round(this.scorePick(playerIndex, ownPick) * 0.2));
    this.scores[playerIndex] += bonus;
    return bonus;
  }

  aiPick(playerIndex: 0 | 1): number {
    const player = this.players[playerIndex];
    const node = this.node;
    const strength = player.strength ?? 2;
    const archetype = player.archetype ?? "builder";
    if (archetype === "gambler" && Math.random() < 0.22) {
      const riskIndex = node.options.findIndex(
        (option) => option.quality === "risk"
      );
      if (riskIndex >= 0) {
        this.pick(playerIndex, riskIndex);
        return riskIndex;
      }
    }
    const expertChance = strength <= 1 ? 0.45 : strength <= 3 ? 0.65 : 0.85;
    const expertIndexes: number[] = [];
    const fallbackIndexes: number[] = [];
    node.options.forEach((option, index) => {
      if (option.quality === "expert") {
        expertIndexes.push(index);
      } else {
        fallbackIndexes.push(index);
      }
    });
    const preferExpert = Math.random() < expertChance;
    const pool =
      preferExpert && expertIndexes.length > 0
        ? expertIndexes
        : fallbackIndexes.length > 0
          ? fallbackIndexes
          : expertIndexes;
    const scored = pool.map((index) => {
      const option = node.options[index];
      const focus = (Object.keys(option.effects) as AbilityId[]).reduce(
        (best, id) => Math.max(best, abilityLevel(player.abilities[id])),
        1
      );
      const quality =
        option.quality === "expert"
          ? 1
          : option.quality === "partial"
            ? 0.55
            : 0.2;
      const effectIds = Object.keys(option.effects) as AbilityId[];
      const archetypeBias =
        archetype === "executor" &&
        effectIds.some((id) =>
          ["authority", "execution", "stability"].includes(id)
        )
          ? 0.3
          : archetype === "builder" &&
              effectIds.some((id) =>
                ["communication", "insight", "recovery"].includes(id)
              )
            ? 0.3
            : archetype === "gambler" && option.quality === "risk"
              ? 0.2
              : 0;
      return {
        index,
        score:
          quality * (2 + focus) +
          resourceBonus(player) / 40 +
          Math.random() * 0.35 +
          archetypeBias
      };
    });
    const bestIndex = scored.reduce((best, current) =>
      current.score > best.score ? current : best
    ).index;
    this.pick(playerIndex, bestIndex);
    return bestIndex;
  }

  /** 回合超时时强制为某位玩家放入风险回合，防止双方不选或一方逃开而永久卡死。 */
  forceTimeoutPick(playerIndex: 0 | 1): void {
    if (this.picks[playerIndex] !== null) {
      return;
    }
    const qualityOrder = ["expert", "partial", "risk"] as const;
    const timeoutIndex = qualityOrder
      .map((quality) =>
        this.node.options.findIndex((option) => option.quality === quality)
      )
      .find((index) => index >= 0);
    this.pick(
      playerIndex,
      timeoutIndex ?? this.node.options.length - 1
    );
  }

  toSnapshot(): DuelSnapshot {
    return {
      players: [...this.players],
      nodes: [...this.nodes],
      roundCount: this.roundCount,
      currentRound: this.currentRound,
      scores: [...this.scores] as [number, number],
      picks: [...this.picks] as [number | null, number | null],
      roundResults: this.roundResults
    };
  }

  static fromSnapshot(snapshot: DuelSnapshot): DuelEngine {
    const dummy: DuelProfile = {
      name: "",
      role: "highPotential",
      abilities: createDefaultAbilities(),
      resources: { energy: 75, trust: 60, influence: 40, capital: 45 },
      color: "#41c7c0",
      isHuman: true
    };
    const engine = new DuelEngine(dummy, dummy, snapshot.roundCount, 1);
    engine.players = snapshot.players as [DuelProfile, DuelProfile];
    engine.nodes = snapshot.nodes;
    engine.currentRound = snapshot.currentRound;
    engine.scores = snapshot.scores;
    engine.picks = snapshot.picks;
    engine.roundResults = snapshot.roundResults;
    return engine;
  }

  get finished(): boolean {
    return this.currentRound >= this.roundCount;
  }

  get winnerIndex(): 0 | 1 | -1 {
    if (this.scores[0] === this.scores[1]) return -1;
    return this.scores[0] > this.scores[1] ? 0 : 1;
  }

  toResult(): DuelResult {
    return {
      winnerName:
        this.winnerIndex === -1
          ? "平局"
          : this.players[this.winnerIndex].name,
      scores: [...this.scores] as [number, number],
      roundResults: this.roundResults
    };
  }

  private resolveRound(): void {
    const [pickOne, pickTwo] = this.picks as [number, number];
    const points: [number, number] = [
      this.scorePick(0, pickOne),
      this.scorePick(1, pickTwo)
    ];
    this.scores[0] += points[0];
    this.scores[1] += points[1];
    this.roundResults.push({
      node: this.node,
      picks: [pickOne, pickTwo],
      points
    });
    this.currentRound += 1;
    this.picks = [null, null];
  }

  private scorePick(playerIndex: 0 | 1, optionIndex: number): number {
    const option = this.node.options[optionIndex];
    const profile = this.players[playerIndex];
    const relevantLevel = (Object.keys(option.effects) as AbilityId[]).reduce(
      (best, id) => Math.max(best, abilityLevel(profile.abilities[id])),
      1
    );
    const base =
      option.quality === "expert" ? 100 : option.quality === "partial" ? 55 : 20;
    let combo = 0;
    for (let i = this.roundResults.length - 1; i >= 0; i -= 1) {
      const previous = this.roundResults[i];
      const previousOption =
        previous.node.options[previous.picks[playerIndex]];
      if (previousOption.quality === "expert") {
        combo += 1;
      } else {
        break;
      }
    }
    return Math.round(
      base +
        relevantLevel * 4 +
        resourceBonus(profile) +
        Math.min(15, combo * 5)
    );
  }
}

/** 四项资源的综合加成：让 1v1 不再只由精力和能力决定。 */
function resourceBonus(profile: DuelProfile): number {
  return (
    profile.resources.energy / 15 +
    profile.resources.trust / 25 +
    profile.resources.influence / 30 +
    profile.resources.capital / 35
  );
}

export function duelSeed(): number {
  return Math.floor(Math.random() * 100000);
}

export function recommendedTraining(
  abilities: Record<AbilityId, number>,
  role?: RoleId
): AbilityId[] {
  const focus = role ? ROLES[role].focusAbilities : [];
  return ABILITY_ORDER.slice()
    .sort((a, b) => {
      const focusDelta =
        (focus.includes(b) ? 1 : 0) - (focus.includes(a) ? 1 : 0);
      return (
        focusDelta * 10 +
        (abilityLevel(abilities[a]) - abilityLevel(abilities[b]))
      );
    })
    .slice(0, 3);
}
