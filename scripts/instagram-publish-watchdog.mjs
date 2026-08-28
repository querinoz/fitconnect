#!/usr/bin/env node
/**
 * Monitora publicação Instagram e retoma automaticamente se falhar.
 * Uso: node scripts/instagram-publish-watchdog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execSync, spawn } from "node:child_process";

const LOG = "/tmp/instagram-publish.log";
const PROGRESS = path.resolve("/workspace/.instagram-publish-progress.json");
const ENV_LOCAL = path.resolve("/workspace/.env.local");
const TOTAL = 70;
const POLL_MS = 60_000;

function syncProgressFromLog() {
  if (!fs.existsSync(LOG)) return 0;
  const log = fs.readFileSync(LOG, "utf8");
  const published = [];
  let current = null;

  for (const line of log.split("\n")) {
    const item = line.match(/^\[(\d+)\/70\] (Carousel|Post|Story): (.+)$/);
    if (item) {
      const type = item[2];
      const id = item[3].trim();
      if (type === "Carousel") current = { key: `carousel:${id}` };
      else if (type === "Post") current = { key: `post:${id.includes("/") ? id : `Posts/${id}`}` };
      else current = { key: `story:${id.includes("/") ? id : `Stories/${id}`}` };
    }
    const done = line.match(/✓ (?:Carousel )?[Pp]ublicad[oa]: (\d+)/);
    if (done && current) {
      published.push({ ...current, mediaId: done[1], at: new Date().toISOString() });
      current = null;
    }
  }

  fs.writeFileSync(PROGRESS, JSON.stringify({ published }, null, 2));
  return published.length;
}

function countPublished() {
  if (!fs.existsSync(LOG)) return 0;
  return (fs.readFileSync(LOG, "utf8").match(/✓ (?:Carousel )?[Pp]ublicad[oa]:/g) || []).length;
}

function isComplete() {
  return fs.existsSync(LOG) && /Concluído: \d+ publicados/.test(fs.readFileSync(LOG, "utf8"));
}

function loadEnv() {
  if (!fs.existsSync(ENV_LOCAL)) return {};
  const env = {};
  for (const line of fs.readFileSync(ENV_LOCAL, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

function resumePublish() {
  console.log(`[watchdog] A retomar publicação (${countPublished()}/${TOTAL} já feitos)...`);
  const env = { ...process.env, ...loadEnv() };
  const child = spawn("node", ["scripts/publish-instagram.mjs", "--all", "--resume"], {
    cwd: "/workspace",
    env,
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stdout.on("data", (d) => {
    fs.appendFileSync(LOG, d);
    process.stdout.write(d);
  });
  child.stderr.on("data", (d) => {
    fs.appendFileSync(LOG, d);
    process.stderr.write(d);
  });
  return new Promise((resolve) => child.on("close", resolve));
}

console.log("[watchdog] A monitorizar publicação Instagram...");

while (true) {
  syncProgressFromLog();
  const done = countPublished();
  console.log(`[watchdog] ${new Date().toISOString()} — ${done}/${TOTAL} publicados`);

  if (isComplete()) {
    console.log("[watchdog] ✅ Publicação completa!");
    break;
  }

  if (done >= TOTAL) {
    console.log("[watchdog] ✅ Todos os items publicados!");
    break;
  }

  // Verificar se processo principal ainda corre
  try {
    execSync('tmux -f /exec-daemon/tmux.portal.conf capture-pane -t instagram-publish-all:0.0 -p | tail -1', {
      stdio: "pipe"
    });
  } catch {
    // sessão morreu — retomar
    if (!isComplete() && done < TOTAL) {
      await resumePublish();
    }
  }

  await new Promise((r) => setTimeout(r, POLL_MS));
}
