import type {
  AdaptiveDifficultyTier,
  OptionQuality
} from "./types.ts";

export interface AdaptiveConfig {
  calibrationCount: number;
  ppsWindow: number;
  qualityScore: Record<OptionQuality, number>;
  tierThresholds: Record<
    AdaptiveDifficultyTier,
    { min: number; max: number }
  >;
  resourceFactor: Record<
    AdaptiveDifficultyTier,
    { neg: number; pos: number }
  >;
  decisionWindowMs: Record<AdaptiveDifficultyTier, number>;
  gateOffset: Record<AdaptiveDifficultyTier, number>;
  aiStrength: Record<AdaptiveDifficultyTier, number>;
  recoveryScale: Record<AdaptiveDifficultyTier, number>;
  comeback: {
    ppsThreshold: number;
    bonusPerExpertStreak: number;
    maxBonus: number;
  };
  bkt: {
    probMastery: number;
    probLearn: number;
    probGuess: number;
    probSlip: number;
  };
}

export const ADAPTIVE_CONFIG: AdaptiveConfig = {
  calibrationCount: 5,
  ppsWindow: 15,
  qualityScore: {
    expert: 1,
    partial: 0.55,
    risk: 0.2
  },
  tierThresholds: {
    recovery: { min: 0, max: 1.6 },
    standard: { min: 1.6, max: 3.4 },
    stretch: { min: 3.4, max: 5.01 }
  },
  resourceFactor: {
    recovery: { neg: 0.7, pos: 1.3 },
    standard: { neg: 1, pos: 1 },
    stretch: { neg: 1.35, pos: 0.75 }
  },
  decisionWindowMs: {
    recovery: 30000,
    standard: 22000,
    stretch: 14000
  },
  gateOffset: {
    recovery: -1,
    standard: 0,
    stretch: 1
  },
  aiStrength: {
    recovery: 0.7,
    standard: 1,
    stretch: 1.35
  },
  recoveryScale: {
    recovery: 1.25,
    standard: 1,
    stretch: 0.85
  },
  comeback: {
    ppsThreshold: 2,
    bonusPerExpertStreak: 0.08,
    maxBonus: 0.2
  },
  bkt: {
    probMastery: 0.3,
    probLearn: 0.12,
    probGuess: 0.2,
    probSlip: 0.1
  }
};

export function tierForPps(
  pps: number,
  config: AdaptiveConfig = ADAPTIVE_CONFIG
): AdaptiveDifficultyTier {
  const value = Math.max(0, Math.min(5, pps));
  if (value >= config.tierThresholds.stretch.min) {
    return "stretch";
  }
  if (value >= config.tierThresholds.standard.min) {
    return "standard";
  }
  return "recovery";
}

export function tierLabel(
  tier: AdaptiveDifficultyTier,
  language: "zh" | "en"
): string {
  if (language === "en") {
    return tier === "recovery"
      ? "Recovery"
      : tier === "standard"
        ? "Standard"
        : "Stretch";
  }
  return tier === "recovery" ? "恢复档" : tier === "standard" ? "标准档" : "拉伸档";
}

