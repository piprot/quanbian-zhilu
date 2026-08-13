import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { DEFAULT_SAVE } from "../src/core/game.ts";

const root = process.cwd();
const port = 4178;
const url = `http://127.0.0.1:${port}`;

const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort"
  ],
  {
    cwd: root,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"]
  }
);

let log = "";
server.stdout.on("data", (chunk) => (log += String(chunk)));
server.stderr.on("data", (chunk) => (log += String(chunk)));

async function waitForServer() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not ready
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error(`Vite server did not start.\n${log}`);
}

function makeSave() {
  const save = structuredClone(DEFAULT_SAVE);
  save.profileCreated = true;
  save.profile.role = "highPotential";
  save.profile.name = "RTC QA";
  save.playCount = 1;
  save.unlockedChapters = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return save;
}

try {
  await waitForServer();
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const errors = [];

  const host = await context.newPage();
  host.on("pageerror", (error) => errors.push(error.stack || error.message));
  host.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await host.goto(url, { waitUntil: "networkidle" });
  await host.evaluate(
    ({ saveJson }) => {
      localStorage.setItem("adaptive-ascent-save-v1", saveJson);
      localStorage.setItem("adaptive-ascent-lang", "en");
    },
    { saveJson: JSON.stringify(makeSave()) }
  );
  await host.reload({ waitUntil: "networkidle" });
  await host.waitForSelector("text=Ascend");
  await host.click("text=Enter 1v1");
  await host.click("[data-action=set-duel-mode][data-mode=remote]");
  await host.click("[data-action=create-remote]");
  await host.waitForSelector("textarea[data-copy-target]");
  const invite = await host.locator("textarea[data-copy-target]").inputValue();

  const joiner = await context.newPage();
  joiner.on("pageerror", (error) => errors.push(error.stack || error.message));
  joiner.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await joiner.goto(url, { waitUntil: "networkidle" });
  await joiner.waitForSelector("text=Ascend");
  await joiner.click("text=Enter 1v1");
  await joiner.click("[data-action=set-duel-mode][data-mode=remote]");
  await joiner.fill("textarea[data-remote-input]", invite);
  await joiner.click("[data-action=join-remote]");
  await joiner.waitForSelector("textarea[readonly]");
  const answer = await joiner.locator("textarea[readonly]").last().inputValue();

  await host.fill("textarea[data-answer-input]", answer);
  await host.click("[data-action=finish-remote]");

  await Promise.all([
    host.waitForSelector(".duel-options", { timeout: 20000 }),
    joiner.waitForSelector(".duel-options", { timeout: 20000 })
  ]);

  if (errors.length > 0) {
    throw new Error(`Page errors: ${errors.join(" | ")}`);
  }

  await browser.close();
  console.log("PASS local dual-browser WebRTC audit");
} finally {
  server.kill();
}
