/**
 * Mobile / PWA checks — manifest, viewport, mobile nav markup.
 * Run: node scripts/mobile-pwa-check.mjs [baseUrl]
 */
const base = process.argv[2] ?? "http://localhost:3001";

const checks = [
  {
    name: "PWA manifest",
    path: "/manifest.webmanifest",
    test: (t) => t.includes('"display": "standalone"') && t.includes("FitConnect")
  },
  {
    name: "viewport meta",
    path: "/",
    test: (t) => t.includes("width=device-width")
  },
  {
    name: "mobile nav",
    path: "/",
    test: (t) => t.includes('id="mobile-nav"')
  },
  {
    name: "apple web app",
    path: "/",
    test: (t) => t.includes("apple-touch-icon") || t.includes("appleWebApp")
  },
  {
    name: "dashboard preview section",
    path: "/",
    test: (t) => t.includes("dashboard-preview")
  }
];

let failed = 0;

console.log(`Mobile / PWA checks @ ${base}\n`);

for (const c of checks) {
  try {
    const res = await fetch(`${base}${c.path}`);
    const text = await res.text();
    if (res.ok && c.test(text)) {
      console.log(`OK   ${c.name}`);
    } else {
      console.log(`FAIL ${c.name} (${res.status})`);
      failed++;
    }
  } catch (err) {
    console.log(`FAIL ${c.name} -> ${err.message}`);
    failed++;
  }
}

process.exit(failed ? 1 : 0);
