import fs from "node:fs";
import path from "node:path";

/**
 * Fill process.env keys that Next.js did not load from apps/web/.env*
 * using the monorepo root .env.local. Does not overwrite existing values.
 */
export function inheritMissingEnvFromFiles(files, env = process.env) {
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 0) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (env[k] == null || env[k] === "") env[k] = v;
    }
  }
  return env;
}

export function inheritRepoRootEnv(webDir) {
  const root = path.resolve(webDir, "../..");
  inheritMissingEnvFromFiles([path.join(root, ".env.local")]);
}
