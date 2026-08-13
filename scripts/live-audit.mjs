import { resolve } from "node:path";

// Local network proxies may terminate TLS for test endpoints.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const root = resolve(import.meta.dirname, "..");
const healthUrl =
  process.env.HEALTH_URL || "https://adaptive-ascent-server-production-018a.up.railway.app/";
const roomUrl =
  process.env.ROOM_SERVER_URL || "wss://adaptive-ascent-server-production-018a.up.railway.app";

const validSave = {
  version: 1,
  profileCreated: true,
  profile: {
    name: "Live QA",
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

async function checkHealth() {
  const response = await fetch(healthUrl);
  const body = await response.json().catch(() => ({}));
  if (response.ok && body.status === "ok") {
    return;
  }
  throw new Error(
    `Live server health check failed (${response.status}). Render service is not deployed or not healthy.`
  );
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

async function connect(name) {
  const ws = new WebSocket(roomUrl);
  await new Promise((resolvePromise, reject) => {
    ws.onopen = resolvePromise;
    ws.onerror = () => reject(new Error("WebSocket connect failed"));
  });
  const wait = createWaiter(ws, 10000);
  return { ws, wait };
}

async function runAccountFlow() {
  const { ws, wait } = await connect("Live QA");
  ws.send(
    JSON.stringify({
      type: "register",
      name: "Live QA",
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
      (entry) =>
        typeof entry.score === "number" && typeof entry.signature === "string"
    )
  ) {
    throw new Error("Leaderboard entries missing score/signature");
  }
  ws.close();
}

async function runMatchFlow() {
  const left = await connect("Live A");
  const right = await connect("Live B");
  left.ws.send(
    JSON.stringify({
      type: "match",
      name: "Live A",
      role: "founder",
      save: null,
      rounds: 3
    })
  );
  right.ws.send(
    JSON.stringify({
      type: "match",
      name: "Live B",
      role: "highPotential",
      save: null,
      rounds: 3
    })
  );
  const [start0, start1] = await Promise.all([
    left.wait("match_started"),
    right.wait("match_started")
  ]);
  if (start0.opponentName !== "Live B" || start1.opponentName !== "Live A") {
    throw new Error("Opponent names were not relayed correctly");
  }
  left.ws.send(JSON.stringify({ type: "pick", optionIndex: 2 }));
  await right.wait("picked");
  right.ws.send(JSON.stringify({ type: "pick", optionIndex: 0 }));
  await left.wait("picked");

  left.ws.send(JSON.stringify({ type: "reveal", optionIndex: 2 }));
  const revealToRight = await right.wait("reveal");
  if (revealToRight.optionIndex !== 2) {
    throw new Error("Reveal was not relayed correctly");
  }
  right.ws.send(JSON.stringify({ type: "reveal", optionIndex: 0 }));
  const revealToLeft = await left.wait("reveal");
  if (revealToLeft.optionIndex !== 0) {
    throw new Error("Reveal was not relayed correctly");
  }
  await Promise.all([left.wait("round_complete"), right.wait("round_complete")]);
  left.ws.close();
  right.ws.close();
}

try {
  await checkHealth();
  await runAccountFlow();
  await runMatchFlow();
  console.log("PASS public live audit");
} catch (error) {
  console.error(`FAIL public live audit: ${error.message}`);
  process.exit(1);
}
