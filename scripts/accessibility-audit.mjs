import { spawn } from "node:child_process";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
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
  save.profile.name = "Axe QA";
  save.playCount = 1;
  save.unlockedChapters = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return save;
}

async function analyze(page, label) {
  // 等待入场动画结束，避免把过渡期的 opacity 误判为真实对比度。
  await page.waitForTimeout(600);
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.map((item) => ({
    id: item.id,
    impact: item.impact,
    nodes: item.nodes.length,
    targets: item.nodes.slice(0, 4).map((node) => node.target.join(" ")),
    details: item.nodes.slice(0, 2).map((node) => ({
      html: node.html,
      any: (node.any || []).map((check) => check.message)
    })),
    help: item.help
  }));
  return { label, violations };
}

try {
  await waitForServer();
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const all = [];

  for (const size of [
    { name: "desktop", width: 1280, height: 900 },
    { name: "mobile", width: 390, height: 844 }
  ]) {
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      isMobile: size.name === "mobile",
      hasTouch: size.name === "mobile"
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.evaluate((saveJson) => {
      localStorage.setItem("adaptive-ascent-save-v1", saveJson);
      localStorage.setItem("adaptive-ascent-lang", "zh");
    }, JSON.stringify(makeSave()));
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=升维");
    all.push(await analyze(page, `${size.name}-menu`));

    await page.click("button.primary[data-action=open-map]");
    await page.waitForSelector("text=九章权力架构");
    all.push(await analyze(page, `${size.name}-map`));

    await page.locator(".node-row:not([disabled])").first().click();
    await page.waitForSelector("text=当前考验");
    all.push(await analyze(page, `${size.name}-story`));

    await page.click("text=返回主线地图");
    await page.waitForSelector("text=九章权力架构");
    await page.click("[data-action=open-report]");
    await page.waitForSelector("text=复盘报告");
    all.push(await analyze(page, `${size.name}-report`));
    await context.close();
  }

  await browser.close();
  const failed = all.filter((entry) => entry.violations.length > 0);
  console.log(JSON.stringify(all, null, 2));
  if (failed.length > 0) {
    console.error("ACCESSIBILITY AUDIT FAILED");
    process.exit(1);
  }
  console.log("PASS accessibility audit");
} finally {
  server.kill();
}
