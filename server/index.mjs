import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import {
  createScoreSignature,
  createToken,
  hashPassword,
  hashRecovery,
  verifyToken
} from "./auth.mjs";
import {
  dbEnabled,
  dbHealth,
  getAccount,
  getAccountByUsername,
  getAccountByRecovery,
  initDb,
  isTokenRevoked,
  listAccounts,
  leaderboard as dbLeaderboard,
  revokeToken,
  upsertAccount
} from "./db.mjs";
import { cleanSave, serverAbilityScore, validateSave } from "./validation.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || join(__dirname, "data");
const DATA_FILE = join(DATA_DIR, "store.json");
const PORT = Number(process.env.PORT || 8080);
const MAX_MESSAGE_BYTES = Number(process.env.MAX_MESSAGE_BYTES || 64 * 1024);
const MAX_SAVE_BYTES = Number(process.env.MAX_SAVE_BYTES || 256 * 1024);
const ROOM_TTL_MS = Number(process.env.ROOM_TTL_MS || 10 * 60 * 1000);
const VALID_ROLES = new Set(["parachute", "founder", "highPotential"]);
const VALID_ROUNDS = new Set([3, 5, 7]);
const GROUP_SCENARIO_IDS = ["c1n1", "c2n1", "c3n1"];

if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  throw new Error("Production requires DATABASE_URL");
}

mkdirSync(DATA_DIR, { recursive: true });

let store = { accounts: {} };
try {
  store = JSON.parse(readFileSync(DATA_FILE, "utf8"));
} catch {
  store = { accounts: {} };
}

function persist() {
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

const AI_ABILITY_NAMES = {
  insight: { zh: "识人", en: "Insight" },
  deploy: { zh: "用人", en: "Placement" },
  mobilize: { zh: "驭人", en: "Mobilize" },
  strategy: { zh: "谋权", en: "Strategy" },
  authority: { zh: "掌权", en: "Authority" },
  stability: { zh: "固权", en: "Consolidation" },
  recovery: { zh: "情绪自愈", en: "Recovery" },
  execution: { zh: "执行力", en: "Execution" },
  structure: { zh: "结构思考", en: "Structured Thinking" },
  communication: { zh: "协同沟通", en: "Communication" }
};
const AI_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

function localAiScenario(payload) {
  const en = payload.language === "en";
  const abilityId = AI_ABILITY_NAMES[payload.abilityId] ? payload.abilityId : "communication";
  const difficulty = AI_DIFFICULTIES.has(payload.difficulty) ? payload.difficulty : "medium";
  const ability = AI_ABILITY_NAMES[abilityId];
  const chapterId = Number.isInteger(payload.chapterId) ? payload.chapterId : 1;
  const seed = Number.isInteger(payload.seed) ? payload.seed : Date.now() % 100000;
  const note = {
    easy: en ? "Signals are still readable." : "信息还不算复杂。",
    medium: en ? "Every choice has a cost." : "任何选择都有代价。",
    hard: en ? "The margin for error is very low." : "容错很低。"
  }[difficulty];
  const title = en
    ? `${ability.en} · Dynamic Dilemma`
    : `${ability.zh} · 动态两难`;
  const context = en
    ? `A leadership moment around ${ability.en}. ${note}`
    : `一个围绕「${ability.zh}」的现场。${note}`;
  const stake = en
    ? "See who can move the result and where the cost will land."
    : "先看清谁能推动结果、代价落在哪里。";
  return {
    id: `ai-${seed}-${abilityId}-${difficulty}`,
    chapterId,
    title,
    kind: "random",
    context,
    stake,
    options: [
      {
        label: en ? "Diagnose first, then act" : "先诊断，再行动",
        summary: en ? "Turn the contradiction into a verifiable test." : "把矛盾变成可验证的小测试。",
        quality: "expert",
        effects: { [abilityId]: 2 },
        resources: { trust: 1 },
        feedback: en ? "The situation starts moving in your direction." : "局面开始向你可控的方向移动。",
        theory: en ? "Diagnose first, act second, keep the standard." : "先诊断、再行动，握紧验证标准。"
      },
      {
        label: en ? "Hold the room steady" : "先稳住场面",
        summary: en ? "Buy time to verify the key variable." : "争取时间核实关键变量。",
        quality: "partial",
        effects: { [abilityId]: 1 },
        resources: { capital: -1 },
        feedback: en ? "The room is steady, but one variable is still open." : "局面暂时稳住，但关键变量还没验证。",
        theory: en ? "Hold the line, then close the verification gap." : "先稳住，再补上验证。"
      },
      {
        label: en ? "Send a strong signal now" : "立刻亮明态度",
        summary: en ? "Break the deadlock and accept the cost openly." : "打破僵局，公开承担代价。",
        quality: "risk",
        effects: { [abilityId]: 3 },
        resources: { trust: -2 },
        feedback: en ? "The signal lands loudly and the cost shows." : "信号很强，代价也开始显现。",
        theory: en ? "Strong signals require an exit route." : "强信号也要为代价预留退路。"
      }
    ]
  };
}

async function generateAiNode(payload) {
  if (process.env.LLM_API_URL && process.env.LLM_API_KEY) {
    try {
      const response = await fetch(process.env.LLM_API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${process.env.LLM_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You generate one Chinese/English leadership dilemma as strict JSON matching {id,chapterId,title,kind,context,stake,options:[{label,summary,quality,effects,resources,feedback,theory}]}. quality is expert|partial|risk. Return only JSON."
            },
            {
              role: "user",
              content: JSON.stringify({
                role: payload.role,
                abilityId: payload.abilityId,
                difficulty: payload.difficulty,
                language: payload.language,
                seed: payload.seed
              })
            }
          ],
          temperature: 0.8,
          response_format: { type: "json_object" }
        }),
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error(`LLM status ${response.status}`);
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(text);
      if (parsed && parsed.options?.length >= 2) {
        return { source: "llm", node: parsed };
      }
    } catch {
      // fall back to local template
    }
  }
  return { source: "local", node: localAiScenario(payload) };
}

const httpServer = createServer(async (_request, response) => {
  const url = new URL(
    _request.url ?? "/",
    `http://${_request.headers.host || "localhost"}`
  );
  if (_request.method === "POST" && url.pathname === "/api/ai-scenario") {
    let body = "";
    for await (const chunk of _request) body += chunk;
    let payload = {};
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      payload = {};
    }
    const result = await generateAiNode(payload);
    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8"
    });
    response.end(
      JSON.stringify({ ok: true, source: result.source, node: result.node })
    );
    return;
  }
  if (_request.method === "GET" && url.pathname === "/api/coach/students") {
    const students = await coachAccounts();
    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8"
    });
    response.end(JSON.stringify({ ok: true, students }));
    return;
  }
  if (_request.method === "GET" && url.pathname === "/api/coach/student") {
    const name = String(url.searchParams.get("name") || "");
    const students = await coachAccounts();
    const student =
      students.find((item) => item.name === name) ?? students[0];
    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8"
    });
    response.end(JSON.stringify({ ok: true, student: student ?? null }));
    return;
  }
  const healthy = await dbHealth();
  response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  response.end(
    JSON.stringify({
      status: dbEnabled && !healthy ? "degraded" : "ok",
      db: healthy,
      uptime: process.uptime()
    })
  );
});
const wss = new WebSocketServer({
  server: httpServer,
  maxPayload: MAX_MESSAGE_BYTES
});
const rooms = new Map();
const matchQueue = [];
const rateBuckets = new Map();
const revokedTokens = new Set();

async function isRevoked(token) {
  if (revokedTokens.has(token)) return true;
  return dbEnabled ? await isTokenRevoked(token) : false;
}

async function resolveAccount(token) {
  if (await isRevoked(token)) return null;
  return dbEnabled ? await getAccount(token) : accountForToken(token);
}

function consumeRate(key, limit, windowMs) {
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || now - current.windowStart > windowMs) {
    rateBuckets.set(key, { windowStart: now, count: 1 });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

await initDb();

function cleanName(value) {
  const name = String(value || "").trim().slice(0, 24);
  return name || "Player";
}

function cleanRole(value) {
  const role = String(value || "highPotential");
  return VALID_ROLES.has(role) ? role : "highPotential";
}

function cleanRounds(value) {
  const rounds = Number(value);
  return VALID_ROUNDS.has(rounds) ? rounds : 3;
}

function send(socket, payload) {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(payload));
  }
}

function roomById(roomId) {
  return rooms.get(roomId);
}

function addToRoom(roomId, player) {
  const room = roomById(roomId);
  if (!room) return null;
  room.players.push(player);
  player.roomId = roomId;
  if (room.players.length === 2) {
    room.status = "playing";
    send(room.players[0].socket, {
      type: "match_started",
      roomId,
      playerIndex: 0,
      opponentName: room.players[1].name
    });
    send(room.players[1].socket, {
      type: "match_started",
      roomId,
      playerIndex: 1,
      opponentName: room.players[0].name
    });
  }
  return room;
}

function createRoom(player, rounds) {
  const roomId = randomUUID().slice(0, 6);
  const room = {
    id: roomId,
    rounds: Number(rounds) || 3,
    status: "waiting",
    createdAt: Date.now(),
    round: 1,
    picks: [null, null],
    reveals: [null, null],
    players: []
  };
  rooms.set(roomId, room);
  addToRoom(roomId, player);
  send(player.socket, { type: "room_created", roomId });
  return room;
}

function broadcastGroup(room, payload) {
  for (const player of room.players) {
    send(player.socket, payload);
  }
}

function groupPlayers(room) {
  return room.players.map((player) => ({
    name: player.name,
    picked: room.picks?.[player.name] !== undefined
  }));
}

function startGroupRound(room) {
  room.status = "playing";
  room.picks = {};
  const nodeId = GROUP_SCENARIO_IDS[room.round - 1];
  broadcastGroup(room, {
    type: "group_round",
    roomId: room.id,
    round: room.round,
    nodeId
  });
}

function createGroupRoom(player, capacity) {
  const roomId = randomUUID().slice(0, 4).toUpperCase();
  const room = {
    id: roomId,
    mode: "group",
    status: "waiting",
    capacity: Math.max(2, Math.min(8, Number(capacity) || 4)),
    rounds: GROUP_SCENARIO_IDS.length,
    createdAt: Date.now(),
    round: 1,
    picks: {},
    players: []
  };
  rooms.set(roomId, room);
  addGroupPlayer(roomId, player);
  return room;
}

function addGroupPlayer(roomId, player) {
  const room = roomById(roomId);
  if (!room || room.mode !== "group" || room.status !== "waiting") return null;
  if (room.players.length >= room.capacity) return null;
  room.players.push(player);
  player.roomId = roomId;
  broadcastGroup(room, {
    type: "group_waiting",
    roomId,
    players: groupPlayers(room),
    capacity: room.capacity
  });
  if (room.players.length >= room.capacity) {
    startGroupRound(room);
  }
  return room;
}

function tryAutoMatch(player) {
  const opponent = matchQueue.shift();
  if (!opponent) {
    matchQueue.push(player);
    send(player.socket, { type: "queued" });
    return;
  }
  const room = createRoom(opponent, player.rounds || 3);
  addToRoom(room.id, player);
}

const roomCleanup = setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms) {
    if (room.status === "waiting" && now - room.createdAt > ROOM_TTL_MS) {
      send(room.players[0]?.socket, { type: "room_expired", roomId });
      leaveRoom(room.players[0]?.socket);
    }
    if (
      room.status === "playing" &&
      room.players.length > 0 &&
      room.players.every((player) => player.disconnected) &&
      now - room.createdAt > ROOM_TTL_MS
    ) {
      rooms.delete(roomId);
    }
  }
}, 60_000);
roomCleanup.unref?.();

function accountForToken(token) {
  if (revokedTokens.has(token)) return null;
  return store.accounts[token];
}

async function coachAccounts() {
  if (dbEnabled) return listAccounts(100);
  return Object.values(store.accounts)
    .map((account) => ({
      name: account.name,
      role: account.role,
      save: account.save,
      score: account.score,
      updatedAt: account.updatedAt
    }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 100);
}

function jsonLeaderboard() {
  const rows = Object.values(store.accounts)
    .map((account) => ({
      name: account.name,
      role: account.role,
      score: Number(account.score ?? serverAbilityScore(account.save)),
      signature: account.scoreSig || "",
      updatedAt: account.updatedAt,
      save: account.save
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
  return rows.map((row, index) => ({
    ...row,
    percentile: Math.round(((rows.length - index - 1) / rows.length) * 100)
  }));
}

wss.on("connection", (socket, request) => {
  socket.remoteIp = request.socket.remoteAddress || "unknown";
  socket.rateCount = 0;
  socket.rateWindow = Date.now();
  send(socket, { type: "connected", message: "自适应领导力服务已连接" });

  socket.on("message", async (raw) => {
    if (!consumeRate(`ip:${socket.remoteIp}`, 300, 10_000)) {
      send(socket, { type: "error", message: "消息过于频繁，请稍后再试" });
      return;
    }
    const now = Date.now();
    if (now - socket.rateWindow > 10000) {
      socket.rateCount = 0;
      socket.rateWindow = now;
    }
    socket.rateCount += 1;
    if (socket.rateCount > 120) {
      send(socket, { type: "error", message: "消息过于频繁，请稍后再试" });
      return;
    }
    let message;
    try {
      const text = String(raw);
      if (Buffer.byteLength(text, "utf8") > MAX_MESSAGE_BYTES) {
        send(socket, { type: "error", message: "消息过大，请分步操作" });
        return;
      }
      message = JSON.parse(text);
    } catch {
      send(socket, { type: "error", message: "无法解析消息" });
      return;
    }

    switch (message.type) {
      case "register": {
        if (!consumeRate(`auth:${socket.remoteIp}`, 20, 60_000)) {
          send(socket, { type: "error", message: "注册过于频繁，请稍后再试" });
          return;
        }
        const name = cleanName(message.name);
        const role = cleanRole(message.role);
        const save = cleanSave(message.save);
        if (message.save && !save) {
          send(socket, { type: "error", message: "存档格式无效" });
          return;
        }
        const score = serverAbilityScore(save);
        const updatedAt = new Date().toISOString();
        const scoreSig = createScoreSignature(score, name, role, updatedAt);
        const token = createToken(
          name,
          role
        );
        const recoveryCode = String(message.recoveryCode || "").trim() || null;
        const username = String(message.username || "").trim().slice(0, 24) || null;
        const passwordHash = message.password
          ? hashPassword(String(message.password))
          : null;
        const account = {
          token,
          name,
          role,
          recoveryCodeHash: recoveryCode ? hashRecovery(recoveryCode) : null,
          username,
          passwordHash,
          save,
          score,
          scoreSig,
          updatedAt
        };
        if (dbEnabled) {
          await upsertAccount(
            account.token,
            account.name,
            account.role,
            account.save,
            account.score,
            account.scoreSig,
            account.recoveryCodeHash,
            account.username,
            account.passwordHash
          );
        } else {
          store.accounts[token] = {
            ...account,
            updatedAt
          };
          persist();
        }
        send(socket, {
          type: "registered",
          token,
          account: { ...account, recoveryCode }
        });
        break;
      }
      case "login": {
        if (!consumeRate(`auth:${socket.remoteIp}`, 20, 60_000)) {
          send(socket, { type: "error", message: "登录过于频繁，请稍后再试" });
          return;
        }
        const token = String(message.token || "");
        if (!verifyToken(token)) {
          send(socket, { type: "error", message: "Token 无效或已过期" });
          return;
        }
        const account = await resolveAccount(token);
        if (!account) {
          send(socket, { type: "error", message: "账号不存在" });
          return;
        }
        if (!consumeRate(`acct:${token}`, 120, 10_000)) {
          send(socket, { type: "error", message: "账号操作过于频繁，请稍后再试" });
          return;
        }
        socket.accountToken = account.token;
        send(socket, { type: "logged_in", account });
        break;
      }
      case "login_recovery": {
        const code = String(message.code || "").trim();
        if (!code) {
          send(socket, { type: "error", message: "恢复码不能为空" });
          return;
        }
        const account = dbEnabled
          ? await getAccountByRecovery(hashRecovery(code))
          : Object.values(store.accounts).find(
              (item) => item.recoveryCodeHash === hashRecovery(code)
            );
        if (!account) {
          send(socket, { type: "error", message: "恢复码不存在" });
          return;
        }
        if (!consumeRate(`acct:${account.token}`, 120, 10_000)) {
          send(socket, { type: "error", message: "账号操作过于频繁，请稍后再试" });
          return;
        }
        socket.accountToken = account.token;
        send(socket, { type: "logged_in", account });
        const newRecoveryCode = randomUUID().slice(0, 8).toUpperCase();
        const newHash = hashRecovery(newRecoveryCode);
        account.recoveryCodeHash = newHash;
        if (dbEnabled) {
          await upsertAccount(
            account.token,
            account.name,
            account.role,
            account.save,
            account.score,
            account.scoreSig,
            newHash
          );
        } else {
          persist();
        }
        send(socket, {
          type: "recovery_reissued",
          code: newRecoveryCode,
          account
        });
        break;
      }
      case "login_password": {
        const username = String(message.username || "").trim();
        const password = String(message.password || "");
        if (!username || !password) {
          send(socket, { type: "error", message: "用户名或密码不能为空" });
          return;
        }
        const account = dbEnabled
          ? await getAccountByUsername(username)
          : Object.values(store.accounts).find(
              (item) => item.username === username
            );
        if (
          !account ||
          account.passwordHash !== hashPassword(password)
        ) {
          send(socket, { type: "error", message: "用户名或密码错误" });
          return;
        }
        if (!consumeRate(`acct:${account.token}`, 120, 10_000)) {
          send(socket, { type: "error", message: "账号操作过于频繁，请稍后再试" });
          return;
        }
        socket.accountToken = account.token;
        send(socket, { type: "logged_in", account });
        break;
      }
      case "cloud_save": {
        const token = String(message.token || "");
        if (!verifyToken(token)) {
          send(socket, { type: "error", message: "Token 无效或已过期" });
          return;
        }
        const account = await resolveAccount(token);
        if (!account) {
          send(socket, { type: "error", message: "账号不存在" });
          return;
        }
        if (!consumeRate(`acct:${token}`, 120, 10_000)) {
          send(socket, { type: "error", message: "账号操作过于频繁，请稍后再试" });
          return;
        }
        const save = cleanSave(message.save);
        if (!save) {
          send(socket, { type: "error", message: "存档格式无效或过大" });
          return;
        }
        const score = serverAbilityScore(save);
        const updatedAt = new Date().toISOString();
        const scoreSig = createScoreSignature(
          score,
          account.name,
          account.role,
          updatedAt
        );
        if (dbEnabled) {
          await upsertAccount(
            token,
            account.name,
            account.role,
            save,
            score,
            scoreSig
          );
        } else {
          account.save = save;
          account.score = score;
          account.scoreSig = scoreSig;
          account.updatedAt = updatedAt;
          persist();
        }
        send(socket, { type: "save_ok" });
        break;
      }
      case "logout": {
        const token = String(message.token || "");
        if (!verifyToken(token)) {
          send(socket, { type: "error", message: "Token 无效或已过期" });
          return;
        }
        revokedTokens.add(token);
        if (dbEnabled) {
          await revokeToken(token);
        }
        socket.accountToken = undefined;
        send(socket, { type: "logged_out" });
        break;
      }
      case "leaderboard": {
        send(socket, {
          type: "leaderboard",
          entries: dbEnabled ? await dbLeaderboard() : jsonLeaderboard()
        });
        break;
      }
      case "group_create": {
        const capacity = Number(message.capacity);
        createGroupRoom(
          {
            socket,
            name: cleanName(message.name)
          },
          Number.isInteger(capacity) ? capacity : 4
        );
        break;
      }
      case "group_join": {
        const room = roomById(String(message.roomId || "").toUpperCase());
        if (!room || room.mode !== "group" || room.status !== "waiting") {
          send(socket, { type: "error", message: "群策房间不存在或已开局" });
          return;
        }
        addGroupPlayer(room.id, {
          socket,
          name: cleanName(message.name)
        });
        break;
      }
      case "group_pick": {
        const optionIndex = Number(message.optionIndex);
        if (![0, 1, 2].includes(optionIndex)) {
          send(socket, { type: "error", message: "选项索引无效" });
          return;
        }
        const player = findPlayer(socket);
        if (!player?.roomId) return;
        const room = roomById(player.roomId);
        if (!room || room.mode !== "group" || room.status !== "playing") return;
        if (room.picks[player.name] !== undefined) {
          send(socket, { type: "error", message: "本回合已选择" });
          return;
        }
        room.picks[player.name] = optionIndex;
        broadcastGroup(room, {
          type: "group_waiting",
          roomId: room.id,
          players: groupPlayers(room),
          capacity: room.capacity
        });
        const pickedAll = room.players.every(
          (item) => room.picks[item.name] !== undefined
        );
        if (!pickedAll) break;
        const counts = [0, 0, 0];
        for (const item of room.players) {
          counts[room.picks[item.name]] += 1;
        }
        broadcastGroup(room, {
          type: "group_reveal",
          roomId: room.id,
          round: room.round,
          counts,
          players: room.players.map((item) => ({
            name: item.name,
            pick: room.picks[item.name]
          }))
        });
        room.round += 1;
        if (room.round > room.rounds) {
          room.status = "finished";
          broadcastGroup(room, {
            type: "group_end",
            roomId: room.id,
            rounds: room.rounds
          });
        } else {
          startGroupRound(room);
        }
        break;
      }
      case "create_room": {
        const name = cleanName(message.name);
        const role = cleanRole(message.role);
        const save = cleanSave(message.save);
        if (message.save && !save) {
          send(socket, { type: "error", message: "存档格式无效" });
          return;
        }
        createRoom(
          {
            socket,
            name,
            role,
            save
          },
          cleanRounds(message.rounds)
        );
        break;
      }
      case "join_room": {
        const room = roomById(String(message.roomId || ""));
        if (!room || room.status !== "waiting") {
          send(socket, { type: "error", message: "房间不存在或已满" });
          return;
        }
        const save = cleanSave(message.save);
        if (message.save && !save) {
          send(socket, { type: "error", message: "存档格式无效" });
          return;
        }
        addToRoom(room.id, {
          socket,
          name: cleanName(message.name),
          role: cleanRole(message.role),
          save
        });
        break;
      }
      case "reconnect": {
        const roomId = String(message.roomId || "");
        const name = cleanName(message.name);
        const role = cleanRole(message.role);
        const save = cleanSave(message.save);
        if (message.save && !save) {
          send(socket, { type: "error", message: "存档格式无效" });
          return;
        }
        const room = roomById(roomId);
        if (!room) {
          send(socket, { type: "error", message: "房间不存在或已过期" });
          return;
        }
        const player = room.players.find(
          (item) =>
            item.name === name &&
            item.role === role &&
            item.disconnected === true
        );
        if (!player) {
          send(socket, { type: "error", message: "没有可恢复的对局槽位" });
          return;
        }
        player.socket = socket;
        player.disconnected = false;
        player.disconnectedAt = undefined;
        socket.roomId = roomId;
        const playerIndex = room.players.indexOf(player);
        const opponent = room.players.find((item) => item !== player);
        send(socket, {
          type: "match_started",
          roomId,
          playerIndex,
          opponentName: opponent?.name
        });
        break;
      }
      case "match": {
        const save = cleanSave(message.save);
        if (message.save && !save) {
          send(socket, { type: "error", message: "存档格式无效" });
          return;
        }
        tryAutoMatch({
          socket,
          name: cleanName(message.name),
          role: cleanRole(message.role),
          save,
          rounds: cleanRounds(message.rounds)
        });
        break;
      }
      case "pick": {
        const optionIndex = Number(message.optionIndex);
        if (![0, 1, 2].includes(optionIndex)) {
          send(socket, { type: "error", message: "选项索引无效" });
          return;
        }
        const player = findPlayer(socket);
        if (!player?.roomId) return;
        const room = roomById(player.roomId);
        if (!room) return;
        if (room.status !== "playing") {
          send(socket, { type: "error", message: "对局尚未开始或已结束" });
          return;
        }
        const playerIndex = room.players.findIndex(
          (item) => item.socket === socket
        );
        if (playerIndex < 0) return;
        if (room.picks[playerIndex] !== null) {
          send(socket, { type: "error", message: "本回合已选择" });
          return;
        }
        room.picks[playerIndex] = optionIndex;
        const opponent = room.players.find((item) => item.socket !== socket);
        if (opponent) {
          send(opponent.socket, { type: "picked" });
        }
        break;
      }
      case "reveal": {
        const optionIndex = Number(message.optionIndex);
        if (![0, 1, 2].includes(optionIndex)) {
          send(socket, { type: "error", message: "选项索引无效" });
          return;
        }
        const player = findPlayer(socket);
        if (!player?.roomId) return;
        const room = roomById(player.roomId);
        if (!room) return;
        const playerIndex = room.players.findIndex(
          (item) => item.socket === socket
        );
        if (playerIndex < 0) return;
        room.reveals[playerIndex] = optionIndex;
        const opponent = room.players.find((item) => item.socket !== socket);
        if (opponent) {
          send(opponent.socket, { type: "reveal", optionIndex });
        }
        if (
          room.reveals[0] !== null &&
          room.reveals[1] !== null
        ) {
          room.picks = [null, null];
          room.reveals = [null, null];
          room.round += 1;
          if (room.round > room.rounds) {
            room.status = "finished";
            for (const item of room.players) {
              send(item.socket, { type: "duel_end", roomId: room.id });
            }
          } else {
            for (const item of room.players) {
              send(item.socket, {
                type: "round_complete",
                roomId: room.id,
                round: room.round
              });
            }
          }
        }
        break;
      }
      case "signal": {
        const player = findPlayer(socket);
        if (!player?.roomId) return;
        const room = roomById(player.roomId);
        if (!room) return;
        if (room.status !== "playing") {
          send(socket, { type: "error", message: "对局尚未开始或已结束" });
          return;
        }
        const opponent = room.players.find((item) => item.socket !== socket);
        if (opponent) {
          send(opponent.socket, { type: "signal", signal: message.signal });
        }
        break;
      }
      case "leave": {
        leaveRoom(socket);
        break;
      }
      default:
        send(socket, { type: "error", message: "未知消息类型" });
    }
  });

  socket.on("close", () => {
    leaveRoom(socket);
    const index = matchQueue.findIndex((player) => player.socket === socket);
    if (index >= 0) matchQueue.splice(index, 1);
  });
});

function findPlayer(socket) {
  for (const room of rooms.values()) {
    const player = room.players.find((item) => item.socket === socket);
    if (player) return player;
  }
  return null;
}

function leaveRoom(socket) {
  const player = findPlayer(socket);
  if (!player?.roomId) return;
  const room = roomById(player.roomId);
  if (!room) return;
  if (room.mode === "group") {
    player.disconnected = true;
    if (room.status !== "playing") {
      room.players = room.players.filter((item) => item.socket !== socket);
    }
    if (room.players.length === 0 || room.players.every((item) => item.disconnected)) {
      rooms.delete(room.id);
      return;
    }
    broadcastGroup(room, {
      type: "group_waiting",
      roomId: room.id,
      players: groupPlayers(room),
      capacity: room.capacity
    });
    if (room.status === "waiting" && room.players.length === room.capacity) {
      startGroupRound(room);
    }
    return;
  }
  if (room.status === "playing") {
    player.disconnected = true;
    player.disconnectedAt = Date.now();
    const opponent = room.players.find((item) => item !== player);
    if (opponent) {
      send(opponent.socket, { type: "opponent_left" });
    }
    return;
  }
  room.players = room.players.filter((item) => item.socket !== socket);
  if (room.players.length === 0) {
    rooms.delete(room.id);
  } else {
    send(room.players[0].socket, { type: "opponent_left" });
    room.status = "waiting";
  }
}

httpServer.listen(PORT, () => {
  console.log(`Adaptive Ascent server listening on ws://127.0.0.1:${PORT}`);
});

function shutdown(signal) {
  console.log(`Adaptive Ascent server shutting down (${signal})`);
  clearInterval(roomCleanup);
  wss.close();
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
