import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { DEFAULT_SAVE } from "../src/core/game.ts";

const root = process.cwd();
const port = 4176;
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

try {
  await waitForServer();
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 }
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const save = structuredClone(DEFAULT_SAVE);
  save.profileCreated = true;
  save.profile.role = "highPotential";
  for (const abilityId of Object.keys(save.profile.abilities)) {
    save.profile.abilities[abilityId] = 4;
  }
  save.playCount = 1;
  save.unlockedChapters = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  save.completedRandomEvents = [];
  save.completedSideQuests = [];
  save.highPressureMode = false;

  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ saveJson, lang }) => {
      localStorage.setItem("adaptive-ascent-save-v1", saveJson);
      localStorage.setItem("adaptive-ascent-lang", lang);
    },
    { saveJson: JSON.stringify(save), lang: "en" }
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("text=Ascend");
  await page.click("button.primary[data-action=open-map]");
  await page.waitForSelector("text=Diagnose");

  await page.click("text=Handle Event");
  await page.waitForSelector("text=Random Event");
  const randomOptionCount = await page.locator(".option-card").count();
  if (randomOptionCount !== 3) {
    throw new Error(`Random event should render 3 English options, got ${randomOptionCount}`);
  }
  await page.click("text=Back to Map");
  await page.waitForSelector("text=Diagnose");

  await page.click('button.chapter-badge[data-chapter="2"]');
  await page.click("text=Authority Gap");
  await page.waitForSelector("text=Current Test");
  // 选项在完成一次勘察动作后才解锁；c2n1 的原始第 1 个选项（expert）带角色分岔 branchTo
  const explore = page.locator("[data-action=expedition-explore]");
  if ((await explore.count()) > 0) {
    await explore.first().click();
  }
  await page.waitForSelector('.option-card[data-option="0"]:not([disabled])');
  await page.locator('.option-card[data-option="0"]').first().click();
  await page.waitForSelector("text=Enter Role Branch");
  await page.click("text=Enter Role Branch");
  await page.waitForSelector("text=Role Branch");
  await page.waitForSelector(
    "text=High-Potential: First Choice in an Authority Vacuum"
  );

  if (errors.length > 0) {
    throw new Error(`Page errors: ${errors.join(" | ")}`);
  }

  await browser.close();
  console.log("PASS i18n browser audit");
} finally {
  server.kill();
}
