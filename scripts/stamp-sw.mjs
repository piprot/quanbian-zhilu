import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve(import.meta.dirname, "..", "dist");
const swPath = resolve(dist, "sw.js");

try {
  const source = readFileSync(swPath, "utf8");
  const stamp = `adaptive-ascent-${Date.now()}`;
  const updated = source
    .replace(/"adaptive-ascent-v2"/g, `"${stamp}"`)
    .replace(/"adaptive-ascent-shell-v2"/g, `"${stamp}-shell"`)
    .replace(/"adaptive-ascent-assets-v2"/g, `"${stamp}-assets"`);
  writeFileSync(swPath, updated);
  console.log(`stamped service worker: ${stamp}`);
} catch (error) {
  console.error("failed to stamp service worker:", error);
  process.exitCode = 1;
}
