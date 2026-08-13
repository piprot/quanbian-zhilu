import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const port = 8090;
const dataDir = mkdtempSync(join(tmpdir(), "adaptive-ascent-server-"));

const validSave = {
  version: 1,
  profileCreated: true,
  profile: {
    name: "服务端测试",
    role: "founder",
    abilities: {
      insight: 0,
      deploy: 0,
      mobilize: 0,
      strategy: 0,
      authority: 0,
      stability: 0,
      recovery: 0,
      execution: 5,
      structure: 0,
      communication: 0
    },
    resources: { energy: 75, trust: 60, influence: 40, capital: 45 }
  },
  chapterRecords: [],
  unlockedChapters: [1],
  completedSideQuests: [],
  achievements: [],
  duelWins: 0,
  duelLosses: 0,
  playCount: 0,
  masteryPoints: 0,
  decisionHistory: [],
  duelHistory: [],
  claimedChallenges: [],
  assessmentScore: 0,
  completedRandomEvents: [],
  completedBranchNodes: [],
  highPressureMode: false
};

const server = spawn(process.execPath, ["server/index.mjs"], {
  cwd: root,
  windowsHide: true,
  env: {
    ...process.env,
    PORT: String(port),
    DATA_DIR: dataDir
  },
  stdio: ["ignore", "pipe", "pipe"]
});

let log = "";
server.stdout.on("data", (chunk) => (log += String(chunk)));
server.stderr.on("data", (chunk) => (log += String(chunk)));

async function waitForServer() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}`);
      if (response.ok) return;
    } catch {
      // not ready
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 200));
  }
  throw new Error(`Server did not start.\n${log}`);
}

function createWaiter(ws, timeoutMs) {
  const buffer = [];
  const pending = [];
  ws.onmessage = (event) => {
    const message = JSON.parse(String(event.data));
    const index = pending.findIndex((entry) => entry.type === message.type);
    if (index >= 0) {
      const entry = pending.splice(index, 1)[0];
      clearTimeout(entry.timer);
      entry.resolve(message);
      return;
    }
    buffer.push(message);
  };
  return (type) =>
    new Promise((resolvePromise, reject) => {
      const index = buffer.findIndex((message) => message.type === type);
      if (index >= 0) {
        resolvePromise(buffer.splice(index, 1)[0]);
        return;
      }
      const entry = {
        type,
        resolve: resolvePromise,
        timer: setTimeout(
          () => reject(new Error(`timeout waiting ${type}`)),
          timeoutMs
        )
      };
      pending.push(entry);
    });
}

async function runClient() {
  const ws = new WebSocket(`ws://127.0.0.1:${port}`);
  await new Promise((resolvePromise, reject) => {
    ws.onopen = resolvePromise;
    ws.onerror = () => reject(new Error("WebSocket connect failed"));
  });

  const wait = createWaiter(ws, 5000);

  ws.send(
    JSON.stringify({
      type: "register",
      name: "服务端测试",
      role: "founder",
      save: validSave
    })
  );
  const registered = await wait("registered");
  ws.send(
    JSON.stringify({
      type: "cloud_save",
      token: registered.token,
      save: { invalid: true }
    })
  );
  await wait("error");
  ws.send(
    JSON.stringify({
      type: "cloud_save",
      token: registered.token,
      save: {
        ...validSave,
        profile: {
          ...validSave.profile,
          abilities: { ...validSave.profile.abilities, execution: 9 }
        }
      }
    })
  );
  await wait("save_ok");
  ws.send(JSON.stringify({ type: "leaderboard" }));
  const board = await wait("leaderboard");
  if (!Array.isArray(board.entries) || board.entries.length === 0) {
    throw new Error("Leaderboard empty");
  }
  if (
    !board.entries.every(
      (entry) => typeof entry.score === "number" && typeof entry.signature === "string"
    )
  ) {
    throw new Error("Leaderboard entries missing score/signature");
  }
  ws.send(JSON.stringify({ type: "logout", token: registered.token }));
  await wait("logged_out");
  ws.send(
    JSON.stringify({
      type: "cloud_save",
      token: registered.token,
      save: validSave
    })
  );
  const revokedError = await wait("error");
  if (!/账号不存在|Token/.test(String(revokedError.message))) {
    throw new Error("Revoked token should be rejected after logout");
  }
  ws.close();
}

async function runMatchTest() {
  const clients = [
    new WebSocket(`ws://127.0.0.1:${port}`),
    new WebSocket(`ws://127.0.0.1:${port}`)
  ];
  await Promise.all(
    clients.map(
      (ws) =>
        new Promise((resolvePromise, reject) => {
          ws.onopen = resolvePromise;
          ws.onerror = () => reject(new Error("WebSocket connect failed"));
        })
    )
  );

  const waitFor0 = createWaiter(clients[0], 5000);
  const waitFor1 = createWaiter(clients[1], 5000);

  clients[0].send(JSON.stringify({ type: "match", name: "甲", role: "founder", save: null, rounds: 3 }));
  clients[1].send(JSON.stringify({ type: "match", name: "乙", role: "highPotential", save: null, rounds: 3 }));

  const [start0, start1] = await Promise.all([
    waitFor0("match_started"),
    waitFor1("match_started")
  ]);
  if (start0.opponentName !== "乙" || start1.opponentName !== "甲") {
    throw new Error("Opponent names were not relayed correctly");
  }

  clients[0].send(JSON.stringify({ type: "pick", optionIndex: 2 }));
  await waitFor1("picked");
  clients[1].send(JSON.stringify({ type: "pick", optionIndex: 0 }));
  await waitFor0("picked");

  clients[0].send(JSON.stringify({ type: "reveal", optionIndex: 2 }));
  const revealToRight = await waitFor1("reveal");
  if (revealToRight.optionIndex !== 2) {
    throw new Error("Reveal was not relayed correctly");
  }
  clients[1].send(JSON.stringify({ type: "reveal", optionIndex: 0 }));
  const revealToLeft = await waitFor0("reveal");
  if (revealToLeft.optionIndex !== 0) {
    throw new Error("Reveal was not relayed correctly");
  }
  await Promise.all([
    waitFor0("round_complete"),
    waitFor1("round_complete")
  ]);

  clients.forEach((ws) => ws.close());
}

try {
  await waitForServer();
  const health = await (await fetch(`http://127.0.0.1:${port}`)).json();
  if (health.status !== "ok") {
    throw new Error("Health endpoint did not return ok");
  }
  await runClient();
  await runMatchTest();
  console.log("PASS server smoke test");
} finally {
  server.kill();
  rmSync(dataDir, { recursive: true, force: true });
}
