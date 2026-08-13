import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { DEFAULT_SAVE } from "../src/core/game.ts";

const root = process.cwd();
const port = 4177;
const url = `http://127.0.0.1:${port}`;
const outDir = "screenshots/device-audit";
mkdirSync(outDir, { recursive: true });

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
  save.profile.name = "Device QA";
  save.playCount = 1;
  save.unlockedChapters = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return save;
}

async function overflow(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

const sizes = [
  { name: "360x800", width: 360, height: 800, mobile: true },
  { name: "720x1280", width: 720, height: 1280, mobile: true },
  { name: "1080x2400", width: 1080, height: 2400, mobile: true },
  { name: "1024x768", width: 1024, height: 768, mobile: false },
  { name: "844x390-landscape", width: 844, height: 390, mobile: true }
];

try {
  await waitForServer();
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const results = [];

  for (const size of sizes) {
    for (const lang of ["zh", "en"]) {
      for (const fontScale of size.mobile ? [1, 1.5] : [1]) {
        const tag = `${size.name}-${lang}-${fontScale === 1.5 ? "fs15" : "fs1"}`;
        const page = await browser.newPage({
          viewport: { width: size.width, height: size.height },
          deviceScaleFactor: 1,
          isMobile: size.mobile,
          hasTouch: size.mobile
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.stack || error.message));
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await page.evaluate(
          ({ saveJson, langValue, scale }) => {
            localStorage.setItem("adaptive-ascent-save-v1", saveJson);
            localStorage.setItem("adaptive-ascent-lang", langValue);
            localStorage.setItem("adaptive-ascent-font-scale", String(scale));
          },
          {
            saveJson: JSON.stringify(makeSave()),
            langValue: lang,
            scale: fontScale
          }
        );
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForSelector(
          lang === "en" ? "text=Ascend" : "text=升维"
        );
        const menuOverflow = await overflow(page);
        await page.screenshot({ path: `${outDir}/${tag}-menu.png`, fullPage: true });

        await page.click("button.primary[data-action=open-map]");
        await page.waitForSelector(
          lang === "en" ? "text=Nine Chapters of Power" : "text=九章权力架构"
        );
        const mapOverflow = await overflow(page);
        await page.screenshot({ path: `${outDir}/${tag}-map.png`, fullPage: true });

        await page.locator(".node-row").first().click();
        await page.waitForSelector(
          lang === "en" ? "text=Current Test" : "text=当前考验"
        );
        const storyOverflow = await overflow(page);
        await page.screenshot({ path: `${outDir}/${tag}-story.png`, fullPage: true });

        await page.click(lang === "en" ? "text=Back to Map" : "text=返回主线地图");
        await page.waitForSelector(
          lang === "en" ? "text=Nine Chapters of Power" : "text=九章权力架构"
        );
        await page.click("[data-action=open-report]");
        await page.waitForSelector(
          lang === "en" ? "text=Review Report" : "text=复盘报告"
        );
        const reportOverflow = await overflow(page);
        await page.screenshot({
          path: `${outDir}/${tag}-report.png`,
          fullPage: true
        });

        results.push({ tag, menuOverflow, mapOverflow, storyOverflow, reportOverflow, errors: errors.length });
        if (
          errors.length > 0 ||
          menuOverflow > 0 ||
          mapOverflow > 0 ||
          storyOverflow > 0 ||
          reportOverflow > 0
        ) {
          throw new Error(
            `${tag} failed: errors=${errors.length} overflow=${JSON.stringify({
              menuOverflow,
              mapOverflow,
              storyOverflow,
              reportOverflow
            })}`
          );
        }
        await page.close();
      }
    }
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  console.log(`PASS device screenshots -> ${outDir}`);
} finally {
  server.kill();
}
