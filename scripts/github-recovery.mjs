import { spawnSync } from "node:child_process";

const STATUS_URL = "https://www.githubstatus.com/api/v2/components.json";
const REPO = process.env.REPO || "piprot/shengwei-game-starter";
const MAX_WAIT_SECONDS = Number(process.env.MAX_WAIT_SECONDS || 1800);
const POLL_SECONDS = Number(process.env.POLL_SECONDS || 30);

function gh(args) {
  const result = spawnSync("gh", args, { encoding: "utf8" });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(`gh ${args.join(" ")} failed: ${detail}`);
  }
  return result.stdout.trim();
}

function gitHead() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(`git rev-parse HEAD failed: ${detail}`);
  }
  return result.stdout.trim();
}

async function waitForOperational() {
  const deadline = Date.now() + MAX_WAIT_SECONDS * 1000;
  while (Date.now() < deadline) {
    const response = await fetch(STATUS_URL);
    const data = await response.json();
    const required = ["Actions", "Pages"];
    const operational = required.every((name) =>
      data.components.some(
        (component) =>
          component.name === name && component.status === "operational"
      )
    );
    if (operational) {
      console.log("GitHub Actions and Pages are operational.");
      return;
    }
    const next = Math.min(deadline - Date.now(), POLL_SECONDS * 1000);
    console.log(
      `GitHub incident still active; retrying in ${Math.max(
        1,
        Math.round(next / 1000)
      )}s.`
    );
    await new Promise((resolve) => setTimeout(resolve, next));
  }
  throw new Error(
    `GitHub Actions/Pages did not recover within ${MAX_WAIT_SECONDS}s.`
  );
}

async function waitForHeadRun(head, waitMs) {
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    const runs = JSON.parse(
      gh([
        "run",
        "list",
        "--repo",
        REPO,
        "--workflow=CI",
        "--limit",
        "30",
        "--json",
        "databaseId,headSha,status,conclusion"
      ])
    );
    const target = runs.find((run) => run.headSha === head);
    if (target) return target;
    console.log("Waiting for CI run on current HEAD...");
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
  return undefined;
}

try {
  await waitForOperational();
  const head = gitHead();
  let target = await waitForHeadRun(head, 5 * 60 * 1000);
  if (!target) {
    console.log("No CI run found yet; dispatching CI workflow.");
    gh(["workflow", "run", "ci.yml", "--repo", REPO, "--ref", "main"]);
    target = await waitForHeadRun(head, 5 * 60 * 1000);
  }
  if (!target) {
    throw new Error("No CI run found for current HEAD after dispatch.");
  }
  if (target.conclusion === "failure") {
    gh([
      "run",
      "rerun",
      String(target.databaseId),
      "--repo",
      REPO,
      "--failed"
    ]);
  }
  console.log(`Watching CI run ${target.databaseId}.`);
  gh([
    "run",
    "watch",
    String(target.databaseId),
    "--repo",
    REPO,
    "--exit-status",
    "--interval",
    "15"
  ]);
} catch (error) {
  console.error(`FAIL github-recovery: ${error.message}`);
  process.exit(1);
}