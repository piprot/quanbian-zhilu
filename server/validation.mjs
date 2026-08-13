const ABILITY_IDS = [
  "insight",
  "deploy",
  "mobilize",
  "strategy",
  "authority",
  "stability",
  "recovery",
  "execution",
  "structure",
  "communication"
];

const RESOURCE_IDS = ["energy", "trust", "influence", "capital"];
const VALID_ROLES = new Set(["parachute", "founder", "highPotential"]);
const NODE_ID_PATTERN =
  /^(c[1-9]n[12]|c[2-9]b-(parachute|founder|highPotential)|s[1-6]|r\d+)$/;

function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function validateSave(save) {
  if (!isObject(save)) return "save must be an object";
  if (typeof save.version !== "number") return "save.version must be a number";
  if (typeof save.profileCreated !== "boolean") {
    return "save.profileCreated must be a boolean";
  }
  const profile = save.profile;
  if (!isObject(profile)) return "save.profile must be an object";
  if (typeof profile.name !== "string" || !profile.name.trim()) {
    return "save.profile.name must be a non-empty string";
  }
  if (!VALID_ROLES.has(profile.role)) return "save.profile.role is invalid";
  if (!isObject(profile.abilities)) {
    return "save.profile.abilities must be an object";
  }
  for (const id of ABILITY_IDS) {
    if (!isFiniteNumber(profile.abilities[id])) {
      return `save.profile.abilities.${id} must be a non-negative number`;
    }
  }
  if (!isObject(profile.resources)) {
    return "save.profile.resources must be an object";
  }
  for (const id of RESOURCE_IDS) {
    if (!isFiniteNumber(profile.resources[id])) {
      return `save.profile.resources.${id} must be a non-negative number`;
    }
  }
  for (const key of [
    "chapterRecords",
    "unlockedChapters",
    "completedSideQuests",
    "achievements",
    "decisionHistory",
    "duelHistory",
    "claimedChallenges",
    "completedRandomEvents",
    "completedBranchNodes"
  ]) {
    if (!Array.isArray(save[key])) return `save.${key} must be an array`;
  }
  for (const key of [
    "duelWins",
    "duelLosses",
    "playCount",
    "masteryPoints",
    "assessmentScore"
  ]) {
    if (!isFiniteNumber(save[key])) {
      return `save.${key} must be a non-negative number`;
    }
  }
  if (typeof save.highPressureMode !== "boolean") {
    return "save.highPressureMode must be a boolean";
  }
  if (
    save.lastSavedAt !== undefined &&
    !isFiniteNumber(save.lastSavedAt)
  ) {
    return "save.lastSavedAt must be a non-negative number";
  }
  if (save.saveHash !== undefined && typeof save.saveHash !== "string") {
    return "save.saveHash must be a string";
  }
  if (
    !save.unlockedChapters.every(
      (item) => typeof item === "number" && Number.isInteger(item) && item > 0
    )
  ) {
    return "save.unlockedChapters must contain positive integers";
  }
  if (
    !save.decisionHistory.every(
      (record) =>
        typeof record?.nodeId === "string" &&
        NODE_ID_PATTERN.test(record.nodeId) &&
        [0, 1, 2].includes(Number(record.optionIndex)) &&
        ["expert", "partial", "risk"].includes(record.quality) &&
        isFiniteNumber(record.qualityScore) &&
        Number(record.qualityScore) <= 300
    )
  ) {
    return "save.decisionHistory contains invalid records";
  }
  return null;
}

export function cleanSave(save) {
  const error = validateSave(save);
  if (error) return null;
  try {
    return JSON.stringify(save).length > 256 * 1024 ? null : save;
  } catch {
    return null;
  }
}

export function serverAbilityScore(save) {
  const decisionScore = (save?.decisionHistory || []).reduce(
    (sum, record) => sum + (Number(record.qualityScore) || 0),
    0
  );
  const trialScore = (save?.trialCleared || []).length * 5;
  const trainingScore = Object.values(save?.trainingScores || {}).reduce(
    (sum, value) => sum + Number(value || 0) * 3,
    0
  );
  return Math.round(decisionScore + trialScore + trainingScore);
}
