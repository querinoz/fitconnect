#!/usr/bin/env node
/**
 * Accept Convex TOS non-interactively (for CI/automation).
 * Requires a valid accessToken in ~/.convex/config.json from device login.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const VERSION = require("convex/package.json").version;

const configPath = path.join(os.homedir(), ".convex", "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const token = config.accessToken;
if (!token) {
  console.error("No accessToken in ~/.convex/config.json — run: npx convex login");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Convex-Client": `npm-cli-${VERSION}`,
  "Content-Type": "application/json",
};

async function main() {
  const check = await fetch("https://api.convex.dev/api/check_opt_ins", {
    method: "POST",
    headers,
  });
  if (!check.ok) {
    console.error("check_opt_ins failed:", check.status, await check.text());
    process.exit(1);
  }
  const data = await check.json();
  if (!data.optInsToAccept?.length) {
    console.log("No opt-ins pending — already accepted.");
    return;
  }
  const optInsAccepted = data.optInsToAccept.map((o) => o.optIn ?? o);
  console.log("Accepting:", optInsAccepted.join(", "));
  const accept = await fetch("https://api.convex.dev/api/accept_opt_ins", {
    method: "POST",
    headers,
    body: JSON.stringify({ optInsAccepted }),
  });
  if (!accept.ok) {
    console.error("accept_opt_ins failed:", accept.status, await accept.text());
    process.exit(1);
  }
  console.log("Convex TOS accepted.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
