import { abilityLevel } from "./abilities.ts";
import { clamp } from "./game.ts";
import type { SaveState } from "./types.ts";

export type EnergyDimensionKey = "physical" | "emotional" | "mental" | "will";

export interface EnergyDimensions {
  physical: number;
  emotional: number;
  mental: number;
  will: number;
}

/** 精力四维为派生展示，不替换现有单维精力资源。 */
export function energyDimensions(save: SaveState): EnergyDimensions {
  const abilities = save.profile.abilities;
  const resources = save.profile.resources;
  return {
    physical: clamp(
      Math.round(resources.energy + abilityLevel(abilities.recovery) * 4),
      0,
      100
    ),
    emotional: clamp(
      Math.round(resources.trust + abilityLevel(abilities.communication) * 3),
      0,
      100
    ),
    mental: clamp(
      Math.round(resources.influence + abilityLevel(abilities.structure) * 4),
      0,
      100
    ),
    will: clamp(
      Math.round(
        resources.capital +
          abilityLevel(abilities.execution) * 3 +
          (save.morale ?? 0) * 0.2
      ),
      0,
      100
    )
  };
}
