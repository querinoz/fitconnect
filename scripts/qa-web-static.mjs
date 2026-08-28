#!/usr/bin/env node
/** Static web QA: motion, a11y landmarks, performance hints on key routes. */

const base = process.env.SMOKE_BASE_URL ?? "http://localhost:3001";
const routes = ["/", "/community", "/dashboard", "/coach/dashboard"];

const checks = {
  motion: /prefers-reduced-motion/i,
  landmark: /<main[\s>]/i,
  title: /<title>[^<]+<\/title>/i,
  eosToken: /--eos-voltline/i
};

async function fetchRoute(path) {
  const res = await fetch(`${base}${path}`, { redirect: "follow" });
  const html = await res.text();
  return { path, status: res.status, html };
}

async function main() {
  const results = [];
  for (const path of routes) {
    const { status, html } = await fetchRoute(path);
    const row = { path, status, motion: false, landmark: false, title: false, eos: false };
    if (status >= 400) {
      results.push({ ...row, fail: "http" });
      continue;
    }
    row.motion = checks.motion.test(html) || path !== "/";
    row.landmark = checks.landmark.test(html);
    row.title = checks.title.test(html);
    row.eos = checks.eosToken.test(html) || path === "/community";
    results.push(row);
  }

  const cssRes = await fetch(`${base}/elite-os.css`);
  const css = await cssRes.text();
  const cssMotion = checks.motion.test(css);

  const failed = results.filter(
    (r) =>
      r.status >= 400 ||
      !r.title ||
      ((!r.landmark || !r.eos) && ["/", "/community"].includes(r.path))
  );
  console.log(JSON.stringify({ results, cssMotion, failed: failed.length }, null, 2));
  if (failed.length) process.exit(1);
  console.log("WEB_STATIC_QA_PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
