import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const dataDir = mkdtempSync(join(tmpdir(), "adaptive-edge-"));
const server = spawn(
  process.execPath,
  ["server/index.mjs"],
  {
    cwd: root,
    windowsHide: true,
    env: {
      ...process.env,
      PORT: "8091",
      DATA_DIR: dataDir,
      JWT_SECRET: "ci-test-secret"
    },
    stdio: ["ignore", "pipe", "pipe"]
  }
);
console.log("spawned");
server.stdout.on("data", (chunk) => process.stdout.write(String(chunk)));
server.stderr.on("data", (chunk) => process.stderr.write(String(chunk)));

const { default: WebSocket } = await import(
  pathToFileURL(`${root}/node_modules/ws/index.js`).href
);

function waitForServer() {
  return new Promise((resolvePromise) => {
    const check = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8091");
        if (response.ok) resolvePromise();
        else setTimeout(check, 200);
      } catch {
        setTimeout(check, 200);
      }
    };
    check();
  });
}

function connect() {
  return new Promise((resolvePromise, reject) => {
    const ws = new WebSocket("ws://127.0.0.1:8091");
    const messages = [];
    const waiters = [];
    ws.on("open", () =>
      resolvePromise({
        ws,
        send: (payload) => ws.send(JSON.stringify(payload)),
        next: (predicate) => {
          const found = messages.find(predicate);
          if (found) {
            messages.splice(messages.indexOf(found), 1);
            return Promise.resolve(found);
          }
          return new Promise((res) => waiters.push({ predicate, res }));
        }
      })
    );
    ws.on("message", (raw) => {
      const msg = JSON.parse(String(raw));
      const index = waiters.findIndex((item) => item.predicate(msg));
      if (index >= 0) waiters.splice(index, 1)[0].res(msg);
      else messages.push(msg);
    });
    ws.on("error", reject);
  });
}

const validSave = {
  version: 1,
  profileCreated: true,
  profile: {
    name: "边界测试",
    role: "founder",
    abilities: { insight: 0, deploy: 0, mobilize: 0, strategy: 0, authority: 0, stability: 0, recovery: 0, execution: 0, structure: 0, communication: 0 },
    resources: { energy: 90, trust: 40, influence: 45, capital: 35 }
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
  claimedDaily: {},
  assessmentScore: 0,
  completedRandomEvents: [],
  completedBranchNodes: [],
  completedTraining: [],
  trainingScores: {},
  trialEnergy: 100,
  trialCleared: [],
  trialItems: [],
  completedPracticeTasks: [],
  trialStreak: 0,
  trialAccelerator: false,
  trialOpenAnswers: {},
  hiddenRoutes: [],
  alternateEndings: [],
  highPressureMode: false,
  difficulty: "normal"
};

try {
  console.log("waiting for edge server");
  await waitForServer();
  console.log("edge server ready");
  const a = await connect();
  await a.next((m) => m.type === "connected");
  a.send({
    type: "register",
    name: "边界测试",
    role: "founder",
    recoveryCode: "CI-CODE-1",
    save: validSave
  });
  const registered = await a.next((m) => m.type === "registered");
  if (!registered.account.recoveryCode) {
    throw new Error("recovery code should be returned once");
  }
  a.ws.close();

  const b = await connect();
  await b.next((m) => m.type === "connected");
  b.send({ type: "login_recovery", code: "CI-CODE-1" });
  await b.next((m) => m.type === "logged_in");
  const reissued = await b.next((m) => m.type === "recovery_reissued");
  if (!reissued.code || reissued.code === "CI-CODE-1") {
    throw new Error("recovery code must be reissued after login");
  }
  b.ws.close();

  const bad = await connect();
  await bad.next((m) => m.type === "connected");
  bad.send({
    type: "register",
    name: "坏存档",
    role: "founder",
    recoveryCode: "BAD-CODE-1",
    save: {
      ...validSave,
      decisionHistory: [
        { nodeId: "hack", optionIndex: 9, quality: "expert", qualityScore: 9999 }
      ]
    }
  });
  const error = await bad.next((m) => m.type === "error");
  if (!error.message) throw new Error("invalid save should be rejected");
  bad.ws.close();

  const passA = await connect();
  await passA.next((m) => m.type === "connected");
  passA.send({
    type: "register",
    name: "密码测试",
    role: "founder",
    username: "pwduser",
    password: "secret123",
    recoveryCode: "PWD-CODE-1",
    save: validSave
  });
  const passRegistered = await passA.next((m) => m.type === "registered");
  if (!passRegistered.account.username) {
    throw new Error("register should store username");
  }
  passA.ws.close();

  const passB = await connect();
  await passB.next((m) => m.type === "connected");
  passB.send({
    type: "login_password",
    username: "pwduser",
    password: "secret123"
  });
  const passLogged = await passB.next((m) => m.type === "logged_in");
  if (passLogged.account?.name !== "密码测试") {
    throw new Error("password login should restore account");
  }
  passB.ws.close();

  const p1 = await connect();
  await p1.next((m) => m.type === "connected");
  p1.send({
    type: "create_room",
    name: "A",
    role: "founder",
    save: validSave,
    rounds: 3
  });
  const room = await p1.next((m) => m.type === "room_created");
  const p2 = await connect();
  await p2.next((m) => m.type === "connected");
  p2.send({
    type: "join_room",
    roomId: room.roomId,
    name: "B",
    role: "founder",
    save: validSave
  });
  await p1.next((m) => m.type === "match_started");
  await p2.next((m) => m.type === "match_started");
  p1.ws.close();
  await p2.next((m) => m.type === "opponent_left");
  const p3 = await connect();
  await p3.next((m) => m.type === "connected");
  p3.send({
    type: "reconnect",
    roomId: room.roomId,
    name: "A",
    role: "founder",
    save: validSave
  });
  const restored = await p3.next((m) => m.type === "match_started");
  if (restored.playerIndex !== 0) throw new Error("reconnect should restore slot 0");
  p2.ws.close();
  p3.ws.close();

  console.log("PASS server edge audit");
} finally {
  server.kill();
  rmSync(dataDir, { recursive: true, force: true });
}
