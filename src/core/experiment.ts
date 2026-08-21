export type ExperimentId =
  | "dda"
  | "scenario-route"
  | "review"
  | "feedback";

export function hashUserId(userId: string): number {
  let hash = 2166136261;
  for (let i = 0; i < userId.length; i += 1) {
    hash ^= userId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function assignExperimentVariant(
  userId: string,
  experimentId: ExperimentId,
  variants: string[]
): string {
  if (variants.length === 0) return "control";
  const seed = hashUserId(`${experimentId}:${userId}`);
  return variants[seed % variants.length];
}

export function experimentEnabled(
  userId: string,
  experimentId: ExperimentId,
  enabledRatio: number
): boolean {
  const bucket = hashUserId(`${experimentId}:${userId}`) % 1000;
  return bucket < Math.max(0, Math.min(1, enabledRatio)) * 1000;
}

