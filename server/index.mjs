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

const httpServer = createServer(async (_request, response) => {
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
