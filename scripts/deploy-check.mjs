import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok, detail });
}

function read(file) {
  try {
    return readFileSync(join(root, file), "utf8");
  } catch {
    return "";
  }
}

const render = read("render.yaml");
check("render.yaml exists", render.length > 0);
check(
  "render.yaml defines the web service",
  /adaptive-ascent-server/.test(render)
);
check("render.yaml defines PostgreSQL", /databases:/.test(render));
check("render.yaml generates JWT_SECRET", /JWT_SECRET/.test(render));

const dockerfile = read("Dockerfile");
check("Dockerfile exists", dockerfile.length > 0);
check("Dockerfile runs the Node server", /server\/index\.mjs/.test(dockerfile));

const ci = read(".github/workflows/ci.yml");
check("CI workflow exists", ci.length > 0);
check("CI injects VITE_ROOM_SERVER_URL", /VITE_ROOM_SERVER_URL/.test(ci));

const pkg = read("package.json");
check("package.json exists", pkg.length > 0);
check(
  "package.json has server script",
  /"server"\s*:\s*"node server\/index\.mjs"/.test(pkg)
);
check("package.json has test:server", /"test:server"/.test(pkg));

const server = read("server/index.mjs");
check(
  "server enforces production DATABASE_URL",
  /NODE_ENV\s*===\s*"production"\s*&&\s*!process\.env\.DATABASE_URL/.test(server)
);
check(
  "server exposes JSON health endpoint",
  /dbHealth\(\)/.test(server) && /status:/.test(server)
);
check("server signs leaderboard scores", /createScoreSignature/.test(server));

const validation = read("server/validation.mjs");
check("server has save schema validation", /validateSave/.test(validation));

const auth = read("server/auth.mjs");
check(
  "production requires JWT_SECRET",
  /Production requires JWT_SECRET/.test(auth)
);

const schema = read("server/schema.sql");
check("schema stores leaderboard score signature", /score_sig/.test(schema));

const failed = checks.filter((item) => !item.ok);
console.log(JSON.stringify(checks, null, 2));
if (failed.length > 0) {
  console.error("DEPLOY CHECK FAILED");
  process.exit(1);
}
console.log("PASS deploy check");
