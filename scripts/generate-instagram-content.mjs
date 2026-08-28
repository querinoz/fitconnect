#!/usr/bin/env node
/**
 * FitConnect — Instagram Content Generator v3
 *
 * Gera:
 *  - Mockups de app (feed, ranks, perfil, busca coach, roster, inbox)
 *  - Posts educativos + abstratos
 *  - Reels animados (hero sports + frases motivacionais) → MP4 + cover PNG
 *
 * Uso:
 *   node scripts/generate-instagram-content.mjs
 *   node scripts/generate-instagram-content.mjs --only mockups
 *   node scripts/generate-instagram-content.mjs --only reels
 *   node scripts/generate-instagram-content.mjs --only posts
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const ROOT = path.resolve("/workspace");
const PACK = path.join(ROOT, "public/instagram-pack");
const TMP = "/tmp/ig-render";
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : "all";

fs.mkdirSync(TMP, { recursive: true });

const BRAND = {
  ink: "#07080A",
  ink800: "#1a1d24",
  ink700: "#2a2f3a",
  ink400: "#8b93a7",
  ink200: "#c8cdd8",
  volt: "#C7FB3A",
  voltDark: "#9CD81A",
  voltSoft: "#DAFE7E",
  white: "#FAFBFC",
  cyan: "#22d3ee",
  signal: "#f43f5e",
  amber: "#fbbf24"
};

const LOGO_SVG = `
<svg viewBox="0 0 40 40" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="55%" stop-color="#7dd3a3"/>
      <stop offset="100%" stop-color="#a3e635"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#p)"/>
  <path d="M12 10h14v4H16v4h8v3.5H16V30h-4V10z" fill="#020617"/>
  <path d="M22 28c6-2 10-8 10-14" stroke="#020617" stroke-width="3.2" fill="none" stroke-linecap="round"/>
</svg>`;

function baseCss(w, h) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:${BRAND.ink};
  font-family:Inter,system-ui,sans-serif;color:${BRAND.white};-webkit-font-smoothing:antialiased}
.display{font-family:'Space Grotesk',Inter,sans-serif;letter-spacing:-0.03em}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px}
.brand span{color:${BRAND.volt}}
.eyebrow{font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND.volt};font-weight:700}
.cta{display:inline-flex;align-items:center;gap:8px;background:${BRAND.volt};color:${BRAND.ink};
  font-weight:700;padding:12px 20px;border-radius:999px;font-size:14px}
.phone{width:340px;height:700px;border-radius:42px;border:3px solid #2a2f3a;background:#0b0d11;
  box-shadow:0 40px 80px rgba(0,0,0,.55),0 0 0 1px rgba(199,251,58,.15);overflow:hidden;position:relative}
.phone-notch{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:110px;height:28px;
  background:#050607;border-radius:0 0 16px 16px;z-index:5}
.screen{position:absolute;inset:0;padding:44px 16px 20px;overflow:hidden}
.dock{position:absolute;bottom:14px;left:16px;right:16px;display:flex;justify-content:space-around;
  background:rgba(20,22,28,.92);border:1px solid #2a2f3a;border-radius:18px;padding:10px 6px;font-size:9px;color:${BRAND.ink400}}
.dock .on{color:${BRAND.volt};font-weight:700}
.card{background:rgba(26,29,36,.9);border:1px solid #2a2f3a;border-radius:16px;padding:12px}
.pill{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;
  background:rgba(199,251,58,.12);color:${BRAND.volt};font-size:10px;font-weight:600}
.bar{height:8px;border-radius:99px;background:#1a1d24;overflow:hidden}
.bar>i{display:block;height:100%;background:linear-gradient(90deg,${BRAND.voltSoft},${BRAND.voltDark});border-radius:99px}
.avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${BRAND.cyan},${BRAND.volt});
  display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#020617}
`;
}

function wrapHtml(body, w = 1080, h = 1080, extraCss = "") {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseCss(w, h)}${extraCss}</style></head>
<body>${body}</body></html>`;
}

// ─── MOCKUPS (phone UI) ───────────────────────────────────────────

function phoneChrome(title, active, inner) {
  return `
  <div class="phone">
    <div class="phone-notch"></div>
    <div class="screen">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <div class="eyebrow" style="font-size:9px">${title}</div>
          <div class="display" style="font-size:22px;font-weight:700;margin-top:2px">${title === "Discover" ? "Find your coach" : title}</div>
        </div>
        <div style="width:28px;height:28px;border-radius:50%;background:#1a1d24;border:1px solid #2a2f3a;display:flex;align-items:center;justify-content:center;font-size:12px">🔔</div>
      </div>
      ${inner}
    </div>
    <div class="dock">
      <span class="${active === "home" ? "on" : ""}">Home</span>
      <span class="${active === "feed" ? "on" : ""}">Feed</span>
      <span class="${active === "search" ? "on" : ""}">Search</span>
      <span class="${active === "ranks" ? "on" : ""}">Ranks</span>
      <span class="${active === "profile" ? "on" : ""}">You</span>
    </div>
  </div>`;
}

function mockupShell(label, subtitle, phoneHtml, accent = BRAND.volt) {
  return wrapHtml(`
  <div style="width:1080px;height:1080px;position:relative;background:
    radial-gradient(ellipse 80% 60% at 20% 10%, rgba(34,211,238,.18), transparent 50%),
    radial-gradient(ellipse 70% 50% at 90% 80%, rgba(199,251,58,.15), transparent 45%),
    linear-gradient(160deg, #07080A 0%, #0e1118 50%, #07080A 100%)">
    <div style="position:absolute;inset:48px 56px;display:flex;justify-content:space-between;align-items:center">
      <div style="max-width:420px">
        <div class="brand" style="margin-bottom:28px">${LOGO_SVG}<span style="color:${BRAND.white}">Fit<span style="color:${accent}">Connect</span></span></div>
        <div class="eyebrow">${label}</div>
        <h1 class="display" style="font-size:56px;font-weight:700;line-height:1.05;margin:14px 0 18px">${subtitle}</h1>
        <p style="color:${BRAND.ink400};font-size:18px;line-height:1.5;max-width:380px">Connect. Train. Perform.</p>
        <div style="margin-top:32px" class="cta">Abrir no app →</div>
      </div>
      <div style="transform:rotate(-2deg)">${phoneHtml}</div>
    </div>
  </div>`, 1080, 1080);
}

const MOCKUPS = [
  {
    file: "mockup-09-community-feed.png",
    html: mockupShell(
      "Community Feed",
      "PRs, check-ins<br>& race day.",
      phoneChrome(
        "Feed",
        "feed",
        `
        <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
          <span class="pill">All</span><span class="pill" style="background:#1a1d24;color:#8b93a7">PR</span>
          <span class="pill" style="background:#1a1d24;color:#8b93a7">Race</span>
        </div>
        ${[
          ["Maya R.", "PR · Deadlift 140kg", "🔥 48", "PR"],
          ["João S.", "Check-in · Morning HRV 72", "💚 31", "Check-in"],
          ["Aisha K.", "Race · Half marathon 1:28", "🏅 92", "Race"]
        ]
          .map(
            ([n, t, l, k]) => `
          <div class="card" style="margin-bottom:10px">
            <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
              <div class="avatar">${n[0]}</div>
              <div style="flex:1">
                <div style="font-size:12px;font-weight:700">${n}</div>
                <div style="font-size:10px;color:${BRAND.ink400}">${t}</div>
              </div>
              <span class="pill">${k}</span>
            </div>
            <div style="font-size:11px;color:${BRAND.ink200}">${l} · 12 comentários</div>
          </div>`
          )
          .join("")}`
      )
    )
  },
  {
    file: "mockup-10-ranks-leaderboard.png",
    html: mockupShell(
      "Ranks · Leaderboard",
      "Sobe no ranking<br>da tua modalidade.",
      phoneChrome(
        "Ranks",
        "ranks",
        `
        <div class="card" style="margin-bottom:12px;background:linear-gradient(135deg,rgba(199,251,58,.15),rgba(34,211,238,.08))">
          <div style="font-size:10px;color:${BRAND.ink400}">A tua posição · Running</div>
          <div class="display" style="font-size:42px;font-weight:700;color:${BRAND.volt}">#12</div>
          <div style="font-size:11px;color:${BRAND.ink200}">Top 5% esta semana · +3</div>
        </div>
        ${[
          ["1", "Elena V.", "2,840 pts", BRAND.amber],
          ["2", "Marcus T.", "2,710 pts", "#c0c0c0"],
          ["3", "Sofia L.", "2,655 pts", "#cd7f32"],
          ["4", "You", "2,410 pts", BRAND.volt],
          ["5", "Kenji W.", "2,380 pts", BRAND.ink400]
        ]
          .map(
            ([r, n, p, c]) => `
          <div style="display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid #1a1d24">
            <div class="display" style="width:28px;font-weight:700;color:${c};font-size:16px">${r}</div>
            <div class="avatar" style="width:30px;height:30px;font-size:11px">${n[0]}</div>
            <div style="flex:1;font-size:12px;font-weight:600">${n}</div>
            <div style="font-size:11px;color:${BRAND.ink400}">${p}</div>
          </div>`
          )
          .join("")}`
      )
    )
  },
  {
    file: "mockup-11-athlete-profile.png",
    html: mockupShell(
      "Athlete Profile",
      "A tua identidade<br>multi-sport.",
      phoneChrome(
        "Profile",
        "profile",
        `
        <div style="text-align:center;margin-bottom:14px">
          <div class="avatar" style="width:72px;height:72px;font-size:28px;margin:0 auto 10px">A</div>
          <div class="display" style="font-size:20px;font-weight:700">Alex Rivera</div>
          <div style="font-size:11px;color:${BRAND.ink400}">Lisbon · Running · Strength</div>
          <div style="display:flex;gap:6px;justify-content:center;margin-top:10px">
            <span class="pill">Verified</span><span class="pill">Pro</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
          ${[
            ["82", "Readiness"],
            ["68ms", "HRV"],
            ["14", "Streak"]
          ]
            .map(
              ([v, l]) => `
            <div class="card" style="text-align:center;padding:10px 6px">
              <div class="display" style="font-size:20px;font-weight:700;color:${BRAND.volt}">${v}</div>
              <div style="font-size:9px;color:${BRAND.ink400}">${l}</div>
            </div>`
            )
            .join("")}
        </div>
        <div class="card">
          <div style="font-size:11px;font-weight:700;margin-bottom:8px">Sports</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${["Running", "Strength", "Yoga", "Cycling"]
              .map((s) => `<span class="pill">${s}</span>`)
              .join("")}
          </div>
        </div>`
      )
    )
  },
  {
    file: "mockup-12-coach-search.png",
    html: mockupShell(
      "Coach Search",
      "12.418 coaches<br>verificados.",
      phoneChrome(
        "Discover",
        "search",
        `
        <div style="background:#1a1d24;border:1px solid #2a2f3a;border-radius:14px;padding:10px 12px;margin-bottom:12px;font-size:12px;color:${BRAND.ink400}">
          🔍 Running coach · Lisbon
        </div>
        <div style="display:flex;gap:6px;margin-bottom:12px;overflow:hidden">
          ${["Best match", "Rating", "€/h"].map((t, i) => `<span class="pill" style="${i ? "background:#1a1d24;color:#8b93a7" : ""}">${t}</span>`).join("")}
        </div>
        ${[
          ["Ana Costa", "Running · Lisbon", "4.9", "€45"],
          ["Diego M.", "Strength · Porto", "4.8", "€55"],
          ["Priya N.", "Yoga · Remote", "5.0", "€38"]
        ]
          .map(
            ([n, s, r, p]) => `
          <div class="card" style="margin-bottom:10px;display:flex;gap:10px;align-items:center">
            <div class="avatar">${n[0]}</div>
            <div style="flex:1">
              <div style="font-size:12px;font-weight:700">${n}</div>
              <div style="font-size:10px;color:${BRAND.ink400}">${s}</div>
              <div style="font-size:10px;color:${BRAND.volt};margin-top:2px">★ ${r} · Verified</div>
            </div>
            <div style="font-size:12px;font-weight:700">${p}</div>
          </div>`
          )
          .join("")}`
      )
    )
  },
  {
    file: "mockup-13-coach-roster.png",
    html: mockupShell(
      "Coach Roster",
      "Heatmap do teu<br>plantel ao vivo.",
      phoneChrome(
        "Roster",
        "home",
        `
        <div class="card" style="margin-bottom:12px">
          <div style="font-size:10px;color:${BRAND.ink400}">Team readiness</div>
          <div class="display" style="font-size:28px;font-weight:700">74 <span style="font-size:14px;color:${BRAND.volt}">avg</span></div>
          <div class="bar" style="margin-top:8px"><i style="width:74%"></i></div>
        </div>
        ${[
          ["Camila", 92, "Train hard", BRAND.volt],
          ["Bruno", 71, "Steady", BRAND.cyan],
          ["Nora", 48, "Recover", BRAND.signal],
          ["Leo", 85, "Train hard", BRAND.volt]
        ]
          .map(
            ([n, r, s, c]) => `
          <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #1a1d24">
            <div class="avatar" style="width:32px;height:32px">${n[0]}</div>
            <div style="flex:1">
              <div style="font-size:12px;font-weight:600">${n}</div>
              <div class="bar" style="margin-top:4px;height:5px"><i style="width:${r}%;background:${c}"></i></div>
            </div>
            <div style="text-align:right">
              <div style="font-size:13px;font-weight:700;color:${c}">${r}</div>
              <div style="font-size:9px;color:${BRAND.ink400}">${s}</div>
            </div>
          </div>`
          )
          .join("")}`
      )
    )
  },
  {
    file: "mockup-14-inbox-nudge.png",
    html: mockupShell(
      "Inbox · Nudges",
      "Coach ↔ atleta<br>em tempo real.",
      phoneChrome(
        "Inbox",
        "home",
        `
        ${[
          ["Coach Ana", "Plano ajustado — HRV baixo. Sessão leve hoje.", "agora", true],
          ["FitConnect AI", "Nudge: 3 atletas abaixo de 50 readiness.", "12m", false],
          ["Diego", "PR no back squat! 🎉", "1h", false],
          ["System", "Morning handshake concluído.", "7h", false]
        ]
          .map(
            ([from, msg, t, unread]) => `
          <div class="card" style="margin-bottom:10px;${unread ? `border-color:${BRAND.volt};background:rgba(199,251,58,.06)` : ""}">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:12px;font-weight:700">${from}</span>
              <span style="font-size:10px;color:${BRAND.ink400}">${t}</span>
            </div>
            <div style="font-size:11px;color:${BRAND.ink200};line-height:1.4">${msg}</div>
          </div>`
          )
          .join("")}`
      )
    )
  }
];

// ─── EDUCATIONAL POSTS ────────────────────────────────────────────

function eduPost(eyebrow, title, bullets, footer = "Connect. Train. Perform.") {
  return wrapHtml(`
  <div style="width:1080px;height:1080px;padding:64px;background:
    linear-gradient(145deg,#07080A 0%,#10141c 40%,#0a0c10 100%);position:relative">
    <div style="position:absolute;top:-120px;right:-80px;width:420px;height:420px;border-radius:50%;
      background:radial-gradient(circle,rgba(199,251,58,.2),transparent 70%)"></div>
    <div class="brand" style="margin-bottom:48px">${LOGO_SVG}<span style="color:${BRAND.white}">Fit<span style="color:${BRAND.volt}">Connect</span></span></div>
    <div class="eyebrow">${eyebrow}</div>
    <h1 class="display" style="font-size:58px;font-weight:700;line-height:1.08;margin:16px 0 36px;max-width:900px">${title}</h1>
    <div style="display:flex;flex-direction:column;gap:16px">
      ${bullets
        .map(
          (b, i) => `
        <div style="display:flex;gap:16px;align-items:flex-start;background:rgba(26,29,36,.7);
          border:1px solid #2a2f3a;border-radius:18px;padding:18px 22px">
          <div class="display" style="width:36px;height:36px;border-radius:10px;background:rgba(199,251,58,.15);
            color:${BRAND.volt};display:flex;align-items:center;justify-content:center;font-weight:700">${i + 1}</div>
          <div style="font-size:20px;line-height:1.35;padding-top:4px">${b}</div>
        </div>`
        )
        .join("")}
    </div>
    <div style="position:absolute;bottom:56px;left:64px;right:64px;display:flex;justify-content:space-between;align-items:center">
      <span style="color:${BRAND.ink400};font-size:16px">${footer}</span>
      <span class="cta" style="padding:10px 18px;font-size:13px">fitconnect.app</span>
    </div>
  </div>`);
}

const EDUCATIONAL = [
  {
    file: "edu-08-training-zones.png",
    html: eduPost("Educação · Zonas", "5 zonas. 1 objetivo.", [
      "Z1–Z2: base aeróbia e recovery",
      "Z3: limiar — controlo de esforço",
      "Z4–Z5: VO2 e potência máxima",
      "FitConnect ajusta a zona ao teu HRV do dia"
    ])
  },
  {
    file: "edu-09-periodization.png",
    html: eduPost("Educação · Periodização", "Treina em ciclos, não em impulsos.", [
      "Base → Build → Peak → Taper",
      "Carga sobe. Intensidade sobe. Depois: descanso",
      "O coach vê a carga semanal em tempo real",
      "Bad week? O plano adapta — sem drama"
    ])
  },
  {
    file: "edu-10-coach-match.png",
    html: eduPost("Educação · Match", "Como escolher o coach certo", [
      "Modalidade + anos de experiência",
      "Rating + reviews de atletas reais",
      "Disponibilidade (presencial / remote)",
      "FitConnect filtra 12.418 especialistas por ti"
    ])
  },
  {
    file: "edu-11-load-management.png",
    html: eduPost("Educação · Carga", "Load management em 30s", [
      "Acute load = última semana",
      "Chronic load = média 4 semanas",
      "Ratio > 1.5 = risco de lesão sobe",
      "O AI co-pilot avisa o coach antes de falhar"
    ])
  },
  {
    file: "edu-12-morning-handshake.png",
    html: eduPost("Educação · Ritual", "Morning handshake", [
      "Acorda → mede HRV → readiness score",
      "Coach recebe o teu estado automaticamente",
      "Plano do dia ajusta-se em segundos",
      "O primeiro check-in que muda o treino"
    ])
  }
];

// ─── ABSTRACT POSTS ───────────────────────────────────────────────

function abstractPost(title, line, motif) {
  const motifs = {
    pulse: `<svg width="1080" height="1080" style="position:absolute;inset:0"><path d="M0 540 H200 L260 400 L340 680 L420 480 L500 560 H1080" fill="none" stroke="${BRAND.volt}" stroke-width="6" opacity=".85"/><path d="M0 560 H180 L250 420 L330 700 L410 500 L490 580 H1080" fill="none" stroke="${BRAND.cyan}" stroke-width="3" opacity=".4"/></svg>`,
    rings: `<svg width="1080" height="1080" style="position:absolute;inset:0">${[120, 220, 320, 420]
      .map(
        (r, i) =>
          `<circle cx="780" cy="320" r="${r}" fill="none" stroke="${i % 2 ? BRAND.volt : BRAND.cyan}" stroke-width="2" opacity="${0.5 - i * 0.08}"/>`
      )
      .join("")}</svg>`,
    grid: `<svg width="1080" height="1080" style="position:absolute;inset:0">${Array.from({ length: 12 }, (_, i) => {
      const x = 80 + i * 80;
      return `<line x1="${x}" y1="0" x2="${x}" y2="1080" stroke="${BRAND.volt}" stroke-width="1" opacity=".12"/>`;
    }).join("")}${Array.from({ length: 12 }, (_, i) => {
      const y = 80 + i * 80;
      return `<line x1="0" y1="${y}" x2="1080" y2="${y}" stroke="${BRAND.cyan}" stroke-width="1" opacity=".1"/>`;
    }).join("")}<circle cx="540" cy="540" r="180" fill="none" stroke="${BRAND.volt}" stroke-width="3" opacity=".6"/></svg>`,
    bars: `<svg width="1080" height="1080" style="position:absolute;inset:0">${[40, 70, 55, 90, 65, 80, 50]
      .map(
        (h, i) =>
          `<rect x="${180 + i * 100}" y="${700 - h * 4}" width="60" height="${h * 4}" rx="12" fill="${BRAND.volt}" opacity="${0.35 + i * 0.08}"/>`
      )
      .join("")}</svg>`
  };

  return wrapHtml(`
  <div style="width:1080px;height:1080px;position:relative;overflow:hidden;background:${BRAND.ink}">
    ${motifs[motif] || motifs.pulse}
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 70%, rgba(7,8,10,.2), rgba(7,8,10,.92))"></div>
    <div style="position:relative;z-index:2;padding:72px;height:100%;display:flex;flex-direction:column;justify-content:flex-end">
      <div class="brand" style="margin-bottom:auto">${LOGO_SVG}<span style="color:${BRAND.white}">Fit<span style="color:${BRAND.volt}">Connect</span></span></div>
      <div class="eyebrow" style="margin-bottom:16px">Brand · Abstract</div>
      <h1 class="display" style="font-size:72px;font-weight:700;line-height:1.02;max-width:900px">${title}</h1>
      <p style="margin-top:20px;font-size:24px;color:${BRAND.ink200};max-width:720px">${line}</p>
    </div>
  </div>`);
}

const ABSTRACT = [
  { file: "abstract-01-connect-train-perform.png", html: abstractPost("Connect.<br>Train.<br>Perform.", "Três palavras. Um ecossistema.", "pulse") },
  { file: "abstract-02-readiness-ring.png", html: abstractPost("Readiness<br>is the new<br>PR.", "Mede antes. Treina depois.", "rings") },
  { file: "abstract-03-signal-grid.png", html: abstractPost("Signal<br>over noise.", "Dados que o coach realmente usa.", "grid") },
  { file: "abstract-04-weekly-load.png", html: abstractPost("Load up.<br>Then recover.", "A curva que separa progresso de lesão.", "bars") },
  { file: "abstract-05-volt-pulse.png", html: abstractPost("Your pulse.<br>Their plan.", "Sync em tempo real entre atleta e coach.", "pulse") }
];

// Product feature posts (square, no phone — typography + icon blocks)
function featurePost(eyebrow, title, points) {
  return wrapHtml(`
  <div style="width:1080px;height:1080px;padding:64px;background:
    linear-gradient(160deg,#07080A,#12161f 55%,#07080A)">
    <div class="brand" style="margin-bottom:40px">${LOGO_SVG}<span style="color:${BRAND.white}">Fit<span style="color:${BRAND.volt}">Connect</span></span></div>
    <div class="eyebrow">${eyebrow}</div>
    <h1 class="display" style="font-size:52px;font-weight:700;line-height:1.1;margin:14px 0 28px">${title}</h1>
    <div style="display:grid;gap:14px">
      ${points
        .map(
          (p) => `
        <div style="display:flex;gap:14px;align-items:center;padding:18px 20px;border-radius:16px;
          border:1px solid #2a2f3a;background:rgba(26,29,36,.65)">
          <div style="width:12px;height:12px;border-radius:50%;background:${BRAND.volt};flex-shrink:0"></div>
          <div style="font-size:20px">${p}</div>
        </div>`
        )
        .join("")}
    </div>
    <div style="margin-top:36px;color:${BRAND.ink400}">#FitConnect #SportsTech #ConnectTrainPerform</div>
  </div>`);
}

const FEATURE_POSTS = [
  {
    file: "25-feature-community-feed.png",
    html: featurePost("App · Feed", "O feed da tua comunidade desportiva", [
      "PRs, check-ins, races e perguntas",
      "Filtros por modalidade e tipo de post",
      "Clubs e eventos perto de ti",
      "Celebra com a tua equipa — não sozinho"
    ])
  },
  {
    file: "26-feature-ranks.png",
    html: featurePost("App · Ranks", "Leaderboard por modalidade", [
      "Pontos por consistência + performance",
      "Sobe com readiness e streaks",
      "Compara-te com a tua divisão",
      "Top 5% = badge verificado no perfil"
    ])
  },
  {
    file: "27-feature-profile.png",
    html: featurePost("App · Perfil", "Perfil de atleta multi-sport", [
      "Readiness, HRV e streak no header",
      "Modalidades que te definem",
      "Histórico de PRs e sessões",
      "Partilha o link com o teu coach"
    ])
  },
  {
    file: "28-feature-coach-search.png",
    html: featurePost("App · Discover", "Busca integrada de coaches", [
      "12.418 especialistas verificados",
      "Filtro por desporto, preço e rating",
      "Presencial ou remote",
      "Match em menos de 60 segundos"
    ])
  }
];

// ─── ANIMATED REELS ───────────────────────────────────────────────

const REELS = [
  {
    id: "reel-hero-01-runner",
    phrase: "Bad night?\nLighter session.",
    sub: "Readiness first. Ego second.",
    sport: "Running",
    hue: BRAND.volt
  },
  {
    id: "reel-hero-02-strength",
    phrase: "O plano muda.\nO atleta sente.",
    sub: "Coach sync em tempo real.",
    sport: "Strength",
    hue: BRAND.cyan
  },
  {
    id: "reel-hero-03-swim",
    phrase: "Measure.\nThen move.",
    sub: "HRV → readiness → sessão.",
    sport: "Swimming",
    hue: "#7dd3a3"
  },
  {
    id: "reel-hero-04-cycle",
    phrase: "Consistency\nbeats intensity.",
    sub: "Streaks > one hard day.",
    sport: "Cycling",
    hue: BRAND.amber
  },
  {
    id: "reel-hero-05-stack",
    phrase: "Connect.\nTrain.\nPerform.",
    sub: "O mantra FitConnect.",
    sport: "Multi-sport",
    hue: BRAND.volt,
    multi: true
  },
  {
    id: "reel-hero-06-recovery",
    phrase: "Rest is\npart of\nthe work.",
    sub: "Recovery-aware training.",
    sport: "Recovery",
    hue: "#a78bfa"
  }
];

function reelFrameHtml(reel, phase) {
  // phase 0..1 for animation state baked into static frames
  const scale = 0.92 + phase * 0.08;
  const opacity = Math.min(1, phase * 2.2);
  const y = 40 - phase * 40;
  return wrapHtml(
    `
  <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${BRAND.ink}">
    <div style="position:absolute;inset:0;background:
      radial-gradient(ellipse 90% 50% at 50% ${20 + phase * 30}%, ${reel.hue}33, transparent 55%),
      radial-gradient(ellipse 70% 40% at 80% 80%, ${BRAND.cyan}22, transparent 50%),
      linear-gradient(180deg,#050607 0%,#0a0c12 50%,#050607 100%)"></div>

    <!-- abstract athlete silhouette -->
    <svg width="1080" height="1920" style="position:absolute;inset:0;opacity:.25">
      <ellipse cx="540" cy="980" rx="${180 + phase * 40}" ry="${320 + phase * 20}" fill="${reel.hue}" opacity=".35"/>
      <circle cx="540" cy="620" r="${70 + phase * 10}" fill="${reel.hue}" opacity=".5"/>
      <path d="M420 780 Q540 900 660 780 L700 1200 Q540 1280 380 1200 Z" fill="${reel.hue}" opacity=".4"/>
    </svg>

    <!-- pulse rings -->
    <div style="position:absolute;left:50%;top:42%;width:${400 + phase * 200}px;height:${400 + phase * 200}px;
      margin-left:-${200 + phase * 100}px;margin-top:-${200 + phase * 100}px;border-radius:50%;
      border:2px solid ${reel.hue};opacity:${0.35 - phase * 0.2}"></div>

    <div style="position:relative;z-index:2;height:100%;padding:80px 64px;display:flex;flex-direction:column">
      <div class="brand" style="font-size:22px">${LOGO_SVG}<span style="color:${BRAND.white}">Fit<span style="color:${reel.hue}">Connect</span></span></div>
      <div class="pill" style="margin-top:24px;align-self:flex-start;font-size:14px;padding:8px 14px">${reel.sport}</div>

      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;
        transform:translateY(${y}px) scale(${scale});opacity:${opacity}">
        <h1 class="display" style="font-size:92px;font-weight:700;line-height:1.02;white-space:pre-line;
          text-shadow:0 0 60px ${reel.hue}55">${reel.phrase}</h1>
        <p style="margin-top:28px;font-size:28px;color:${BRAND.ink200}">${reel.sub}</p>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:40px">
        <span style="font-size:18px;color:${BRAND.ink400}">@fitconnectsports</span>
        <span class="cta" style="background:${reel.hue}">Connect. Train. Perform.</span>
      </div>
    </div>
  </div>`,
    1080,
    1920
  );
}

// ─── RENDER ───────────────────────────────────────────────────────

async function screenshotHtml(browser, html, outPath, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  await page.screenshot({ path: outPath, type: "png", clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
}

function makeReelMp4(id, frameDir, outMp4) {
  const listFile = path.join(frameDir, "frames.txt");
  const frames = fs
    .readdirSync(frameDir)
    .filter((f) => f.endsWith(".png"))
    .sort();
  // each frame ~0.4s → ~6s total for 15 frames; hold last longer
  const lines = frames.flatMap((f, i) => {
    const dur = i === frames.length - 1 ? 1.2 : 0.35;
    return [`file '${path.join(frameDir, f)}'`, `duration ${dur}`];
  });
  lines.push(`file '${path.join(frameDir, frames[frames.length - 1])}'`);
  fs.writeFileSync(listFile, lines.join("\n"));

  const r = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-vf",
      "fps=30,format=yuv420p",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outMp4
    ],
    { encoding: "utf8" }
  );
  if (r.status !== 0) {
    console.error(r.stderr?.slice(-500));
    throw new Error(`ffmpeg failed for ${id}`);
  }
}

async function main() {
  console.log("FitConnect Instagram Content Generator");
  console.log(`Mode: ${only}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });

  try {
    if (only === "all" || only === "mockups") {
      console.log("── Mockups ──");
      for (const m of MOCKUPS) {
        const out = path.join(PACK, "Mockups", m.file);
        const car = path.join(PACK, "Carousels/09-app-features", m.file.replace("mockup-", "").replace(".png", "") + "-" + m.file);
        await screenshotHtml(browser, m.html, out, 1080, 1080);
        // also copy numbered into carousel
        const idx = String(MOCKUPS.indexOf(m) + 1).padStart(2, "0");
        const carOut = path.join(PACK, "Carousels/09-app-features", `${idx}-${m.file}`);
        fs.copyFileSync(out, carOut);
        // product post copies
        const postOut = path.join(PACK, "Posts", m.file.replace("mockup-", "29-".replace("29-", `${20 + MOCKUPS.indexOf(m)}-`)));
        console.log(`  ✓ ${m.file}`);
      }
    }

    if (only === "all" || only === "posts") {
      console.log("── Educational ──");
      for (const [i, e] of EDUCATIONAL.entries()) {
        const out = path.join(PACK, "Educational", e.file);
        await screenshotHtml(browser, e.html, out, 1080, 1080);
        const carOut = path.join(PACK, "Carousels/10-educational-v2", `${String(i + 1).padStart(2, "0")}-${e.file}`);
        fs.copyFileSync(out, carOut);
        console.log(`  ✓ ${e.file}`);
      }

      console.log("── Abstract ──");
      for (const [i, a] of ABSTRACT.entries()) {
        const out = path.join(PACK, "Abstract", a.file);
        await screenshotHtml(browser, a.html, out, 1080, 1080);
        const carOut = path.join(PACK, "Carousels/11-abstract-brand", `${String(i + 1).padStart(2, "0")}-${a.file}`);
        fs.copyFileSync(out, carOut);
        const postOut = path.join(PACK, "Posts", a.file);
        fs.copyFileSync(out, postOut);
        console.log(`  ✓ ${a.file}`);
      }

      console.log("── Feature posts ──");
      for (const p of FEATURE_POSTS) {
        const out = path.join(PACK, "Posts", p.file);
        await screenshotHtml(browser, p.html, out, 1080, 1080);
        console.log(`  ✓ ${p.file}`);
      }

      // also save mockups as posts
      for (const [i, m] of MOCKUPS.entries()) {
        const src = path.join(PACK, "Mockups", m.file);
        if (fs.existsSync(src)) {
          const dest = path.join(PACK, "Posts", `${String(29 + i).padStart(2, "0")}-${m.file}`);
          fs.copyFileSync(src, dest);
        }
      }
    }

    if (only === "all" || only === "reels") {
      console.log("── Animated Reels ──");
      const reelsOut = path.join(PACK, "Reels/Animated");
      fs.mkdirSync(reelsOut, { recursive: true });

      for (const reel of REELS) {
        const frameDir = path.join(TMP, reel.id);
        fs.mkdirSync(frameDir, { recursive: true });
        const frames = 16;
        for (let i = 0; i < frames; i++) {
          const phase = i / (frames - 1);
          const html = reelFrameHtml(reel, phase);
          const fp = path.join(frameDir, `f${String(i).padStart(3, "0")}.png`);
          await screenshotHtml(browser, html, fp, 1080, 1920);
        }
        // cover = mid frame
        const coverSrc = path.join(frameDir, "f008.png");
        const coverDest = path.join(PACK, "Reels", `${reel.id}-cover.png`);
        fs.copyFileSync(coverSrc, coverDest);
        fs.copyFileSync(coverSrc, path.join(reelsOut, `${reel.id}-cover.png`));

        const mp4 = path.join(reelsOut, `${reel.id}.mp4`);
        makeReelMp4(reel.id, frameDir, mp4);
        console.log(`  ✓ ${reel.id}.mp4 + cover`);
      }
    }
  } finally {
    await browser.close();
  }

  // update MANIFEST snippet
  const manifestPath = path.join(PACK, "MANIFEST.json");
  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  }
  manifest.generatedAt = new Date().toISOString().slice(0, 10);
  manifest.v3Content = {
    mockupsNew: MOCKUPS.map((m) => m.file),
    educationalNew: EDUCATIONAL.map((e) => e.file),
    abstract: ABSTRACT.map((a) => a.file),
    featurePosts: FEATURE_POSTS.map((p) => p.file),
    animatedReels: REELS.map((r) => `${r.id}.mp4`)
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("\n✅ Conteúdo gerado. MANIFEST atualizado.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
