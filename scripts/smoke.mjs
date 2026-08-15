import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const port = 4173;
const url = `http://127.0.0.1:${port}`;
const profileDir = mkdtempSync(join(tmpdir(), "adaptive-ascent-smoke-"));

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

let serverLog = "";
server.stdout.on("data", (chunk) => {
  serverLog += String(chunk);
});
server.stderr.on("data", (chunk) => {
  serverLog += String(chunk);
});

async function waitForServer() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // server not ready yet
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error(`Vite server did not start.\n${serverLog}`);
}

try {
  await waitForServer();
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    storageState: { cookies: [], origins: [] }
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector("text=升维");

  await page.click("text=创建档案");
  await page.fill("input[name=playerName]", "林远");
  await page.click("button[data-role=highPotential]");
  await page.click("text=开启征程");
  await page.waitForSelector("text=能力基线测评");
  await page.click("[data-action=assessment-skip]");
  await page.waitForSelector("text=能力基线报告");
  await page.click("text=进入主线");
  await page.waitForSelector("text=九章权力架构");

  await page.click("text=空降首周");
  await page.waitForSelector("text=当前考验");
  await page.click("[data-action=expedition-explore]");
  await page.waitForSelector(".option-card[data-quality=expert]:not([disabled])");
  await page.click(".option-card[data-quality=expert]:not([disabled])");
  await page.waitForSelector(".outcome-panel");
  await page.click("text=进入角色分岔");
  await page.waitForSelector("text=当前考验");
  await page.click("[data-action=expedition-explore]");
  await page.waitForSelector(".option-card[data-quality=expert]:not([disabled])");
  await page.click(".option-card[data-quality=expert]:not([disabled])");
  await page.waitForSelector(".integrity-gate, .outcome-panel");
  if ((await page.locator(".integrity-gate").count()) > 0) {
    await page.click("[data-cost=correct]");
  }
  await page.waitForSelector(".outcome-panel");
  await page.click("text=返回地图");
  await page.waitForSelector("text=九章权力架构");

  await page.click("text=进入 1v1");
  await page.waitForSelector("text=谁能在复杂局势中做出更好的判断");
  await page.click("text=开始对战");
  await page.waitForSelector(".duel-options");

  for (let i = 0; i < 7; i += 1) {
    if ((await page.locator(".duel-result").count()) > 0) break;
    const enabled = page.locator(".duel-options .option-card:not([disabled])");
    const count = await enabled.count();
    if (count > 0) {
      await enabled.first().click();
      await page
        .waitForSelector(".duel-predict", { timeout: 5000 })
        .catch(() => {});
      const predict = page.locator(".duel-predict-options button");
      if ((await predict.count()) > 0) {
        await predict.first().click();
      }
      await page.waitForSelector(".duel-reveal", { timeout: 5000 }).catch(() => {});
    }
    await page
      .waitForSelector(".duel-options .option-card:not([disabled]), .duel-result", {
        timeout: 7000
      })
      .catch(() => {});
  }
  await page.waitForSelector(".duel-result", { timeout: 20000 });
  await page.waitForSelector("text=对决结束");

  // 本地双人：验证每回合玩家一先选、再传给玩家二，而不是从第二回合起卡在玩家二。
  await page.click("text=返回大厅");
  await page.waitForSelector("text=本地双人");
  await page.click("text=本地双人");
  await page.click("text=开始对战");
  await page.waitForSelector(".duel-options");
  for (let round = 0; round < 3; round += 1) {
    await page.waitForSelector(".duel-options .option-card:not([disabled])", {
      timeout: 10000
    });
    await page.locator(".duel-options .option-card:not([disabled])").first().click();
    await page.waitForSelector("button.pass-button", { timeout: 5000 });
    await page.click("button.pass-button");
    await page.waitForSelector(".duel-options .option-card:not([disabled])", {
      timeout: 5000
    });
    await page.locator(".duel-options .option-card:not([disabled])").first().click();
    const predict = page.locator(".duel-predict-options button");
    if ((await predict.count()) > 0) {
      await predict.first().click();
    }
    await page
      .waitForSelector(
        ".duel-reveal, .duel-result, .duel-options .option-card:not([disabled])",
        { timeout: 10000 }
      )
      .catch(() => {});
  }
  await page.waitForSelector(".duel-result", { timeout: 20000 });

  // 教练工作坊：载入演示小组并生成报告
  await page.click("text=返回大厅");
  await page.waitForSelector("text=返回主页");
  await page.click("text=返回主页");
  await page.waitForSelector("text=教练工作坊");
  await page.click("text=教练工作坊");
  await page.waitForSelector(".coach-shell");
  await page.click("[data-action=coach-load-demo]");
  await page.waitForSelector(".coach-report");
  await page.waitForSelector("#coach-radar");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflow > 0) {
    throw new Error(`Horizontal overflow detected: ${overflow}px`);
  }
  if (errors.length > 0) {
    throw new Error("Page errors detected: " + errors.join(" | "));
  }

  await browser.close();
  console.log("PASS smoke test");
} finally {
  server.kill();
  rmSync(profileDir, { recursive: true, force: true });
}
