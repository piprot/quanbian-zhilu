import { weakestAbilities } from "./abilities.ts";
import { nextIncompleteMainNode } from "./game.ts";
import { mirrorForAbility } from "./historyMirrors.ts";
import type { AbilityId, SaveState } from "./types.ts";

export interface RecommendationCard {
  kind: "main" | "training" | "mirror";
  abilityId: AbilityId;
  nodeId?: string;
  mirrorId?: string;
}

/** 自适应推荐：按最弱能力给出“主线情境 / 训练 / 史鉴”三张卡。 */
export function adaptiveRecommendations(save: SaveState): RecommendationCard[] {
  const weak = weakestAbilities(save.profile.abilities, 1)[0] ?? "communication";
  const nextNode = nextIncompleteMainNode(save);
  const cards: RecommendationCard[] = [];
  if (nextNode) {
    cards.push({ kind: "main", abilityId: weak, nodeId: nextNode });
  }
  cards.push({ kind: "training", abilityId: weak });
  cards.push({
    kind: "mirror",
    abilityId: weak,
    mirrorId: mirrorForAbility(weak).id
  });
  return cards;
}
