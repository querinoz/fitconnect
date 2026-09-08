#!/usr/bin/env node
/** Print safe hostnames from env files — never secrets. */
import fs from "node:fs";
import path from "node:path";

function load(rel) {
  const p = path.resolve(rel);
  if (!fs.existsSync(p)) return {};
  const o = {};
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    o[t.slice(0, i).trim()] = v;
  }
  return o;
}

const a = {
  ...load(".env.local"),
  ...load("apps/web/.env.local"),
  ...load("apps/web/.env.vercel"),
};

function pgHost(u) {
  try {
    return new URL(u.replace(/^postgres(ql)?:/, "http:")).host;
  } catch {
    return "INVALID";
  }
}

for (const k of ["DATABASE_URL", "DIRECT_URL", "NEXT_PUBLIC_SUPABASE_URL"]) {
  if (!a[k]) {
    console.log(`${k}=MISSING`);
    continue;
  }
  if (k === "NEXT_PUBLIC_SUPABASE_URL") {
    console.log(`${k}=${a[k].replace(/^https?:\/\//, "").split("/")[0]}`);
  } else {
    console.log(`${k}=${pgHost(a[k])}`);
  }
}
