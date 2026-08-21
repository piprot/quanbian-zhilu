import { readFileSync } from "node:fs";
import { adaptiveMetricsSummary } from "../src/core/adaptive-metrics.ts";
import { migrateSave } from "../src/core/game.ts";
import type { SaveState } from "../src/core/types.ts";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npm run adaptive:export -- <save.json>");
  process.exit(1);
}
const raw = JSON.parse(readFileSync(file, "utf8")) as SaveState;
const save = migrateSave(raw);
const summary = adaptiveMetricsSummary(save);
const rows = [
  [
    "totalDecisions",
    "expertRate",
    "partialRate",
    "riskRate",
    "flowZoneRatio",
    "demonstratedCount",
    "pps",
    "tier",
    "reviewDue"
  ],
  [
    summary.totalDecisions,
    summary.expertRate.toFixed(3),
    summary.partialRate.toFixed(3),
    summary.riskRate.toFixed(3),
    summary.flowZoneRatio.toFixed(3),
    summary.demonstratedCount,
    summary.pps.toFixed(2),
    summary.tier,
    summary.reviewDue
  ]
];
console.log(JSON.stringify(summary, null, 2));
console.log(
  rows.map((row) => row.join(",")).join("\n")
);

