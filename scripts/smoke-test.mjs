/**
 * Quick smoke test — HTTP status + hero HTML markers + auth module.
 * Run: node scripts/smoke-test.mjs [baseUrl]
 */
const base = process.argv[2] ?? "http://localhost:3001";

const routes = [
  "/",
  "/signin",
  "/signup",
  "/discover",
  "/dashboard",
  "/coach/dashboard",
  "/coach/athletes/a-ines",
  "/programs",
  "/pricing",
  "/community",
  "/methodology",
  "/trainer",
  "/trainer/t-001"
];

const heroMarkers = [
  "fc-hero-title",
  "fc-kinetic",
  "fc-headline-line",
  "Find my specialist"
];

const previewMarkers = ["dashboard-preview", "fc-dashboard-preview-title"];

let failed = 0;

async function checkRoute(path) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();

    if (!res.ok) {
      console.log(`FAIL ${path} -> ${res.status}`);
      failed++;
      return;
    }

    if (path === "/") {
      const missing = heroMarkers.filter((m) => !html.includes(m));
      if (missing.length) {
        console.log(`FAIL / hero missing in HTML: ${missing.join(", ")}`);
        failed++;
        return;
      }
      const previewMissing = previewMarkers.filter((m) => !html.includes(m));
      if (previewMissing.length) {
        console.log(`FAIL / dashboard preview missing in HTML: ${previewMissing.join(", ")}`);
        failed++;
        return;
      }
    }

    console.log(`OK   ${path} -> ${res.status} (${html.length} bytes)`);
  } catch (err) {
    console.log(`FAIL ${path} -> ${err.message}`);
    failed++;
  }
}

async function checkAuth() {
  try {
    const res = await fetch(`${base}/signin`);
    const html = await res.text();

    if (!res.ok) {
      console.log(`FAIL auth -> /signin returned ${res.status}`);
      failed++;
      return;
    }
    if (!html.includes("signin") && !html.includes("password")) {
      console.log("FAIL auth -> /signin page missing expected content");
      failed++;
      return;
    }
    console.log("OK   auth -> /signin page accessible");
  } catch (err) {
    console.log(`FAIL auth -> ${err.message}`);
    failed++;
  }
}

console.log(`Smoke test @ ${base}\n`);
for (const path of routes) {
  await checkRoute(path);
}
await checkAuth();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);