import { readFileSync } from "node:fs";
import { totalAbilityLevels } from "../src/core/abilities.ts";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: npm run coach:export -- <save1.json> <save2.json> ...");
  process.exit(1);
}

const rows = files.map((file) => {
  const save = JSON.parse(readFileSync(file, "utf8"));
  return {
    name: save.profile?.name || "未知",
    role: save.profile?.role || "unknown",
    total: totalAbilityLevels(save.profile?.abilities || {}),
    chapters: (save.chapterRecords || []).filter(
      (record) => (record.completedNodeIds || []).length >= 2
    ).length,
    side: (save.completedSideQuests || []).length,
    random: (save.completedRandomEvents || []).length,
    wins: save.duelWins || 0,
    losses: save.duelLosses || 0
  };
});

const header = "name,role,total,chapters,side,random,wins,losses";
console.log(header);
for (const row of rows) {
  console.log(
    [
      row.name,
      row.role,
      row.total,
      row.chapters,
      row.side,
      row.random,
      row.wins,
      row.losses
    ].join(",")
  );
}
