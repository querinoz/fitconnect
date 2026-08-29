import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("public/design-review");
const BASE = process.env.PREVIEW_URL || "http://localhost:3001";

const ROUTES = [
  { id: "01-landing", url: "/", title: "Landing" },
  { id: "02-signin", url: "/signin", title: "Sign in" },
  { id: "03-feed", url: "/feed", title: "Feed (HOME)", auth: true },
  { id: "04-settings-sheet", url: "/feed", title: "Settings", auth: true, settings: true },
  { id: "05-dashboard", url: "/dashboard", title: "Dashboard", auth: true },
  { id: "06-appearance", url: "/settings/appearance", title: "Appearance", auth: true },
  { id: "07-community", url: "/community", title: "Community / Squads", auth: true },
  { id: "08-discover", url: "/discover", title: "Discover", auth: true }
];

async function signIn(page) {
  await page.goto(`${BASE}/signin`);
  await page.locator("#identifier").fill("ines@fitconnect.local");
  await page.locator("#password").fill("Athlete");
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(/\/feed/, { timeout: 15000 });
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["Pixel 7"],
  colorScheme: "dark"
});
const page = await context.newPage();

const captured = [];

for (const route of ROUTES) {
  if (route.auth) await signIn(page);
  await page.goto(`${BASE}${route.url}`, { waitUntil: "networkidle" });
  if (route.settings) {
    await page.getByLabel("Open settings").click();
    await page.getByRole("dialog", { name: "Settings" }).waitFor();
  }
  const file = await shot(page, route.id);
  captured.push({ ...route, file: path.basename(file) });
  if (route.settings) {
    await page.keyboard.press("Escape");
  }
}

await browser.close();

const cards = captured
  .map(
    (r) => `    <a class="card" href="${r.url}">
      <img src="/design-review/${r.file}" alt="${r.title}" loading="eager" decoding="async" width="412" height="892" />
      <div class="meta"><strong>${r.title}</strong><span>${r.url}</span></div>
    </a>`
  )
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FitConnect Elite OS — Design Review</title>
  <style>
    :root { color-scheme: dark; --bg:#090402; --text:#F2F3F6; --muted:#8A8378; --accent:#C8FF00; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: system-ui, sans-serif; background:var(--bg); color:var(--text); }
    header { padding:24px 20px; border-bottom:1px solid rgba(255,255,255,.08); }
    h1 { margin:0 0 8px; font-size:1.35rem; }
    p, li { color:var(--muted); line-height:1.5; }
    .links { display:flex; flex-wrap:wrap; gap:10px; margin-top:12px; }
    .links a { color:var(--accent); text-decoration:none; padding:8px 12px; border:1px solid rgba(200,255,0,.25); border-radius:999px; font-size:.85rem; }
    .links a:hover { background:rgba(200,255,0,.08); }
    .grid { display:grid; gap:20px; padding:20px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
    .card { display:block; border:1px solid rgba(255,255,255,.08); border-radius:20px; overflow:hidden; background:rgba(255,255,255,.04); text-decoration:none; color:inherit; transition: border-color .2s; }
    .card:hover { border-color: rgba(200,255,0,.35); }
    img { width:100%; height:auto; display:block; background:#111; }
    .meta { padding:12px 14px; display:flex; flex-direction:column; gap:4px; }
    .meta span { color:var(--accent); font-size:.8rem; font-family: monospace; }
    .note { margin: 0 20px 20px; padding:14px 16px; border-radius:14px; background:rgba(200,255,0,.06); border:1px solid rgba(200,255,0,.18); }
  </style>
</head>
<body>
  <header>
    <h1>FitConnect Elite OS — Visual Review</h1>
    <p>Clique num card para abrir a rota real no app. Requer <code>npm run dev</code> em <strong>${BASE}</strong>.</p>
    <div class="links">
      <a href="/">Landing</a>
      <a href="/signin">Sign in</a>
      <a href="/feed">Feed</a>
      <a href="/discover">Discover</a>
      <a href="/community">Community</a>
      <a href="/dashboard">Dashboard</a>
      <a href="/settings/appearance">Appearance</a>
    </div>
  </header>
  <div class="note">
    <strong>Como ver ao vivo:</strong> no terminal do projeto, execute <code>npm run dev</code> e abra <code>${BASE}</code>.
    Login demo: <code>ines@fitconnect.local</code> / <code>Athlete</code>
  </div>
  <div class="grid">
${cards}
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(OUT, "index.html"), html);
console.log(`Gallery ready: ${BASE}/design-review/index.html`);
