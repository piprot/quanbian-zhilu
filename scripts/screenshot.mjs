import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const outDir = "screenshots";
mkdirSync(outDir, { recursive: true });

const sizes = [
  { name: "desktop-1280x720", width: 1280, height: 720 },
  { name: "phone-720x1280", width: 720, height: 1280 },
  { name: "phone-1080x2400", width: 1080, height: 2400 }
];

const browser = await chromium.launch({ channel: "msedge", headless: true });

for (const size of sizes) {
  const page = await browser.newPage({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1
  });
  await page.goto("http://127.0.0.1:5173", {
    waitUntil: "networkidle"
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${outDir}/${size.name}.png`,
    fullPage: true
  });
  await page.close();
}

await browser.close();
console.log("screenshots written to " + outDir);
