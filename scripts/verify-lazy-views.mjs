import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

// 校验动态 import() 分包后的团队学院 / 领导力游戏懒加载视图能正常渲染。
const root = resolve(import.meta.dirname, "..");
const port = 4174;
const url = `http://127.0.0.1:${port}`;
const profileDir = mkdtempSync(join(tmpdir(), "adaptive-ascent-lazy-"));

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
  { cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }
);

async function waitForServer() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not ready
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Vite server did not start.");
}

try {
  await waitForServer();
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.stack || e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector("text=升维");

  // 建档 → 进主线 → 回到主页
  await page.click("text=创建档案");
  await page.fill("input[name=playerName]", "校验员");
  await page.click("button[data-role=highPotential]");
  await page.click("text=开启征程");
  await page.waitForSelector("text=能力基线测评");
  await page.click("[data-action=assessment-skip]");
  await page.waitForSelector("text=能力基线报告");
  await page.click("text=进入主线");
  await page.waitForSelector("text=九章权力架构");
  await page.click("[data-action=open-menu]");
  await page.waitForSelector("text=团队管理训练营");

  // 团队学院（懒加载）
  await page.click("[data-action=open-team-academy]");
  await page.waitForSelector(".ta-shell", { timeout: 10000 });
  await page.click("[data-action=ta-home]");
  await page.waitForSelector("text=领导力游戏");

  // 领导力游戏（懒加载）
  await page.click("[data-action=open-leadership-games]");
  await page.waitForSelector(".lg-shell", { timeout: 10000 });

  await browser.close();
  if (errors.length > 0) {
    throw new Error("Lazy-view errors detected: " + errors.join(" | "));
  }
  console.log("PASS lazy-view verification");
} finally {
  server.kill();
  rmSync(profileDir, { recursive: true, force: true });
}
