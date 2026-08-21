// 群策堂冒烟：两个 WebSocket 客户端完成 创建/加入/3 轮选择/揭示/结束。
import WebSocket from "ws";

const port = process.env.GROUP_PORT || 8135;
const url = `ws://127.0.0.1:${port}`;

function waitFor(ws, type, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout waiting for ${type}`)),
      timeout
    );
    const onMessage = (raw) => {
      const message = JSON.parse(String(raw));
      if (message.type === type) {
        clearTimeout(timer);
        ws.off("message", onMessage);
        resolve(message);
      }
    };
    ws.on("message", onMessage);
  });
}

function connect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.on("open", () => resolve(ws));
    ws.on("error", reject);
  });
}

const alice = await connect();
const bob = await connect();
const waitingA = waitFor(alice, "group_waiting");
alice.send(JSON.stringify({ type: "group_create", name: "Alice", capacity: 2 }));
const created = await waitingA;

const roundA = waitFor(alice, "group_round");
const roundB = waitFor(bob, "group_round");
bob.send(
  JSON.stringify({
    type: "group_join",
    roomId: created.roomId,
    name: "Bob"
  })
);
const [roundAValue, roundBValue] = await Promise.all([roundA, roundB]);
if (roundAValue.nodeId !== roundBValue.nodeId || roundAValue.roomId !== created.roomId) {
  throw new Error("group rounds should be shared");
}

for (let round = 0; round < 3; round += 1) {
  const reveal = waitFor(alice, "group_reveal");
  const endPromise =
    round === 2
      ? Promise.all([waitFor(alice, "group_end"), waitFor(bob, "group_end")])
      : null;
  alice.send(JSON.stringify({ type: "group_pick", optionIndex: 0 }));
  bob.send(JSON.stringify({ type: "group_pick", optionIndex: round === 2 ? 2 : 1 }));
  const revealValue = await reveal;
  if (revealValue.counts.reduce((sum, count) => sum + count, 0) !== 2) {
    throw new Error(`round ${round + 1} reveal should count 2 picks`);
  }
  if (round < 2) {
    await Promise.all([waitFor(alice, "group_round"), waitFor(bob, "group_round")]);
  } else {
    await endPromise;
  }
}

alice.close();
bob.close();
console.log("PASS group hall smoke");
