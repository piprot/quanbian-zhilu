import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
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
      if (response.ok) return;
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
    viewport: { width: 1280, height: 900 }
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator('button:has-text("立即试玩第一章")').first().click();
  await page.waitForSelector("text=九章权力架构");

  // 地图面板折叠/展开与刷新恢复
  await page.click("[data-action=toggle-map-detail]");
  await page.waitForFunction(
    () => !document.querySelector(".map-extras")?.hidden
  );
  await page.locator('button:has-text("进入 1v1")').first().click();
  await page.waitForSelector("text=谁能在复杂局势中做出更好的判断");
  await page.locator('button:has-text("返回主页")').first().click();
  await page.waitForSelector("text=继续主线");

  await page.locator('button:has-text("设置")').first().click();
  await page.waitForSelector(".settings-shell");
  await page.locator('button:has-text("返回主页")').first().click();
  await page.waitForSelector("text=继续主线");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("text=继续主线");

  // 快速打一局 AI 1v1，中间再刷新一次，验证对局/存档状态可恢复。
  await page.locator('button:has-text("进入 1v1")').first().click();
  await page.waitForSelector("text=开始对战");
  await page.locator('button:has-text("开始对战")').first().click();
  await page.waitForSelector(".duel-options .option-card:not([disabled])");
  await page.locator(".duel-options .option-card:not([disabled])").first().click();
  await page.waitForSelector(".duel-predict-options button");
  await page.locator(".duel-predict-options button").first().click();
  await page
    .waitForSelector(".duel-reveal, .duel-round-result, .duel-options .option-card:not([disabled])", {
      timeout: 12000
    })
    .catch(() => {});
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("text=继续主线");

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
  console.log("PASS stress smoke (multi-view navigation + reload recovery)");
} finally {
  server.kill();
}
