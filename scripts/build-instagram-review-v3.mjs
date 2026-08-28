#!/usr/bin/env node
/**
 * Gera galeria HTML para revisão do pack v3 antes de publicar.
 * Saída: public/instagram-pack/review-v3.html
 */
import fs from "node:fs";
import path from "node:path";

const PACK = path.resolve("/workspace/public/instagram-pack");
const OUT = path.join(PACK, "review-v3.html");

const SECTIONS = [
  {
    id: "mockups",
    title: "Mockups de app",
    subtitle: "Feed · Ranks · Perfil · Busca coach · Roster · Inbox",
    items: [
      { file: "Mockups/mockup-09-community-feed.png", label: "Community Feed", caption: "PRs, check-ins e race day no feed da comunidade." },
      { file: "Mockups/mockup-10-ranks-leaderboard.png", label: "Ranks / Leaderboard", caption: "Ranking por modalidade · Top 5% · pontos semanais." },
      { file: "Mockups/mockup-11-athlete-profile.png", label: "Perfil atleta", caption: "Readiness · HRV · streak · sports multi-modalidade." },
      { file: "Mockups/mockup-12-coach-search.png", label: "Discover / busca coach", caption: "12.418 coaches · filtros · rating · €/h." },
      { file: "Mockups/mockup-13-coach-roster.png", label: "Coach roster", caption: "Heatmap do plantel · readiness por atleta." },
      { file: "Mockups/mockup-14-inbox-nudge.png", label: "Inbox + nudges", caption: "Coach ↔ atleta · AI nudges · plano ajustado." }
    ]
  },
  {
    id: "features",
    title: "Posts de features",
    subtitle: "Descrição textual das funções (feed 1:1)",
    items: [
      { file: "Posts/25-feature-community-feed.png", label: "Feature · Feed" },
      { file: "Posts/26-feature-ranks.png", label: "Feature · Ranks" },
      { file: "Posts/27-feature-profile.png", label: "Feature · Perfil" },
      { file: "Posts/28-feature-coach-search.png", label: "Feature · Discover" }
    ]
  },
  {
    id: "educational",
    title: "Educativos v2",
    subtitle: "Saves · autoridade · explicação rápida",
    items: [
      { file: "Educational/edu-08-training-zones.png", label: "5 zonas de treino" },
      { file: "Educational/edu-09-periodization.png", label: "Periodização" },
      { file: "Educational/edu-10-coach-match.png", label: "Como escolher coach" },
      { file: "Educational/edu-11-load-management.png", label: "Load management" },
      { file: "Educational/edu-12-morning-handshake.png", label: "Morning handshake" }
    ]
  },
  {
    id: "abstract",
    title: "Abstratos / brand",
    subtitle: "Identidade visual · frases de marca",
    items: [
      { file: "Abstract/abstract-01-connect-train-perform.png", label: "Connect. Train. Perform." },
      { file: "Abstract/abstract-02-readiness-ring.png", label: "Readiness is the new PR" },
      { file: "Abstract/abstract-03-signal-grid.png", label: "Signal over noise" },
      { file: "Abstract/abstract-04-weekly-load.png", label: "Load up. Then recover." },
      { file: "Abstract/abstract-05-volt-pulse.png", label: "Your pulse. Their plan." }
    ]
  },
  {
    id: "posts-mockups",
    title: "Posts (cópias dos mockups)",
    subtitle: "Prontos para publicar no feed",
    items: () =>
      fs
        .readdirSync(path.join(PACK, "Posts"))
        .filter((f) => /^2[5-9]-|^3[0-4]-|^abstract-/.test(f) && f.endsWith(".png"))
        .sort()
        .map((f) => ({ file: `Posts/${f}`, label: f.replace(".png", "") }))
  },
  {
    id: "carousels",
    title: "Carousels novos",
    subtitle: "3 sets prontos para swipe",
    carousels: [
      { id: "09-app-features", name: "App features (6 slides)" },
      { id: "10-educational-v2", name: "Educação v2 (5 slides)" },
      { id: "11-abstract-brand", name: "Brand abstract (5 slides)" }
    ]
  },
  {
    id: "reels",
    title: "Reels animados",
    subtitle: "MP4 9:16 · ~6.5s · hero sports + frases motivacionais",
    reels: [
      { mp4: "Reels/Animated/reel-hero-01-runner.mp4", cover: "Reels/reel-hero-01-runner-cover.png", label: "Bad night? Lighter session.", sport: "Running" },
      { mp4: "Reels/Animated/reel-hero-02-strength.mp4", cover: "Reels/reel-hero-02-strength-cover.png", label: "O plano muda. O atleta sente.", sport: "Strength" },
      { mp4: "Reels/Animated/reel-hero-03-swim.mp4", cover: "Reels/reel-hero-03-swim-cover.png", label: "Measure. Then move.", sport: "Swimming" },
      { mp4: "Reels/Animated/reel-hero-04-cycle.mp4", cover: "Reels/reel-hero-04-cycle-cover.png", label: "Consistency beats intensity.", sport: "Cycling" },
      { mp4: "Reels/Animated/reel-hero-05-stack.mp4", cover: "Reels/reel-hero-05-stack-cover.png", label: "Connect. Train. Perform.", sport: "Multi-sport" },
      { mp4: "Reels/Animated/reel-hero-06-recovery.mp4", cover: "Reels/reel-hero-06-recovery-cover.png", label: "Rest is part of the work.", sport: "Recovery" }
    ]
  }
];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function imgCard(item, aspect = "1/1") {
  const exists = fs.existsSync(path.join(PACK, item.file));
  if (!exists) return "";
  return `
    <article class="card" data-label="${esc(item.label)}">
      <div class="thumb" style="aspect-ratio:${aspect}">
        <img src="${esc(item.file)}" alt="${esc(item.label)}" loading="lazy" />
      </div>
      <div class="meta">
        <h3>${esc(item.label)}</h3>
        ${item.caption ? `<p>${esc(item.caption)}</p>` : ""}
        <code>${esc(item.file)}</code>
      </div>
    </article>`;
}

function carouselSection(c) {
  const dir = path.join(PACK, "Carousels", c.id);
  if (!fs.existsSync(dir)) return "";
  const slides = fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
  return `
    <div class="carousel-block">
      <h3>${esc(c.name)}</h3>
      <p class="path"><code>Carousels/${c.id}/</code> · ${slides.length} slides</p>
      <div class="carousel-strip">
        ${slides.map((s, i) => `
          <figure>
            <img src="Carousels/${c.id}/${s}" alt="slide ${i + 1}" loading="lazy" />
            <figcaption>${i + 1}/${slides.length}</figcaption>
          </figure>`).join("")}
      </div>
    </div>`;
}

function reelCard(r) {
  const mp4Ok = fs.existsSync(path.join(PACK, r.mp4));
  const coverOk = fs.existsSync(path.join(PACK, r.cover));
  if (!mp4Ok) return "";
  return `
    <article class="card reel-card">
      <div class="thumb reel-thumb">
        <video src="${esc(r.mp4)}" poster="${esc(r.cover)}" controls playsinline loop muted></video>
      </div>
      <div class="meta">
        <span class="pill">${esc(r.sport)}</span>
        <h3>${esc(r.label)}</h3>
        <code>${esc(r.mp4)}</code>
        ${coverOk ? `<a href="${esc(r.cover)}" target="_blank">Cover PNG →</a>` : ""}
      </div>
    </article>`;
}

let totalImages = 0;
let totalReels = 0;
for (const sec of SECTIONS) {
  if (sec.items) {
    const items = typeof sec.items === "function" ? sec.items() : sec.items;
    totalImages += items.filter((i) => fs.existsSync(path.join(PACK, i.file))).length;
  }
  if (sec.carousels) {
    for (const c of sec.carousels) {
      const dir = path.join(PACK, "Carousels", c.id);
      if (fs.existsSync(dir)) totalImages += fs.readdirSync(dir).filter((f) => f.endsWith(".png")).length;
    }
  }
  if (sec.reels) totalReels += sec.reels.filter((r) => fs.existsSync(path.join(PACK, r.mp4))).length;
}

const sectionsHtml = SECTIONS.map((sec) => {
  if (sec.reels) {
    return `
      <section id="${sec.id}" class="section">
        <header><h2>${esc(sec.title)}</h2><p>${esc(sec.subtitle)}</p></header>
        <div class="grid reels-grid">${sec.reels.map(reelCard).join("")}</div>
      </section>`;
  }
  if (sec.carousels) {
    return `
      <section id="${sec.id}" class="section">
        <header><h2>${esc(sec.title)}</h2><p>${esc(sec.subtitle)}</p></header>
        ${sec.carousels.map(carouselSection).join("")}
      </section>`;
  }
  const items = typeof sec.items === "function" ? sec.items() : sec.items;
  return `
    <section id="${sec.id}" class="section">
      <header><h2>${esc(sec.title)}</h2><p>${esc(sec.subtitle)}</p></header>
      <div class="grid">${items.map((i) => imgCard(i)).join("")}</div>
    </section>`;
}).join("");

const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FitConnect — Revisão pack v3 · @fitconnectsports</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet" />
  <style>
    :root { --ink:#07080A; --ink800:#1a1d24; --volt:#C7FB3A; --muted:#8b93a7; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Inter,system-ui,sans-serif; background:var(--ink); color:#FAFBFC; line-height:1.5; }
    .hero { padding:48px 32px 32px; border-bottom:1px solid var(--ink800);
      background:radial-gradient(ellipse 60% 80% at 10% 0%, rgba(199,251,58,.12), transparent 50%), var(--ink); }
    .hero h1 { font-family:'Space Grotesk',sans-serif; font-size:clamp(28px,4vw,42px); font-weight:700; }
    .hero h1 span { color:var(--volt); }
    .hero p { color:var(--muted); margin-top:8px; max-width:640px; }
    .stats { display:flex; flex-wrap:wrap; gap:16px; margin-top:24px; }
    .stat { background:var(--ink800); border:1px solid #2a2f3a; border-radius:12px; padding:12px 20px; }
    .stat b { display:block; font-size:24px; color:var(--volt); font-family:'Space Grotesk',sans-serif; }
    nav { position:sticky; top:0; z-index:50; display:flex; flex-wrap:wrap; gap:8px; padding:12px 32px;
      background:rgba(7,8,10,.92); backdrop-filter:blur(12px); border-bottom:1px solid var(--ink800); }
    nav a { color:var(--muted); text-decoration:none; font-size:13px; padding:6px 12px; border-radius:8px;
      border:1px solid transparent; transition:.15s; }
    nav a:hover { color:var(--volt); border-color:#2a2f3a; background:var(--ink800); }
    main { max-width:1400px; margin:0 auto; padding:32px; }
    .section { margin-bottom:56px; scroll-margin-top:72px; }
    .section header { margin-bottom:24px; }
    .section h2 { font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; }
    .section header p { color:var(--muted); margin-top:4px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px; }
    .reels-grid { grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); }
    .card { background:var(--ink800); border:1px solid #2a2f3a; border-radius:16px; overflow:hidden; }
    .thumb { background:#0b0d11; overflow:hidden; }
    .thumb img { width:100%; height:100%; object-fit:cover; display:block; }
    .reel-thumb { aspect-ratio:9/16; max-height:480px; margin:0 auto; }
    .reel-thumb video { width:100%; height:100%; object-fit:cover; display:block; }
    .meta { padding:14px 16px; }
    .meta h3 { font-size:15px; font-weight:600; margin-bottom:6px; }
    .meta p { font-size:13px; color:var(--muted); margin-bottom:8px; }
    .meta code { font-size:11px; color:#6b7280; word-break:break-all; }
    .meta a { display:inline-block; margin-top:8px; font-size:12px; color:var(--volt); }
    .pill { display:inline-block; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.1em;
      background:rgba(199,251,58,.15); color:var(--volt); padding:3px 8px; border-radius:99px; margin-bottom:8px; }
    .carousel-block { margin-bottom:32px; }
    .carousel-block h3 { font-size:18px; margin-bottom:4px; }
    .carousel-block .path { color:var(--muted); font-size:13px; margin-bottom:12px; }
    .carousel-strip { display:flex; gap:12px; overflow-x:auto; padding-bottom:12px; scroll-snap-type:x mandatory; }
    .carousel-strip figure { flex:0 0 200px; scroll-snap-align:start; }
    .carousel-strip img { width:200px; height:200px; object-fit:cover; border-radius:12px; border:1px solid #2a2f3a; }
    .carousel-strip figcaption { text-align:center; font-size:11px; color:var(--muted); margin-top:4px; }
    .lightbox { display:none; position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.92);
      align-items:center; justify-content:center; padding:24px; cursor:zoom-out; }
    .lightbox.open { display:flex; }
    .lightbox img { max-width:95vw; max-height:90vh; border-radius:12px; }
    footer { text-align:center; padding:32px; color:var(--muted); font-size:13px; border-top:1px solid var(--ink800); }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Fit<span>Connect</span> — Revisão pack v3</h1>
    <p>Analisa todo o conteúdo novo antes de publicar no @fitconnectsports. Clica numa imagem para ampliar.</p>
    <div class="stats">
      <div class="stat"><b>${totalImages}</b> imagens</div>
      <div class="stat"><b>${totalReels}</b> reels MP4</div>
      <div class="stat"><b>3</b> carousels</div>
      <div class="stat"><b>6</b> mockups app</div>
    </div>
  </div>
  <nav>
    <a href="#mockups">Mockups</a>
    <a href="#features">Features</a>
    <a href="#educational">Educativos</a>
    <a href="#abstract">Abstratos</a>
    <a href="#posts-mockups">Posts</a>
    <a href="#carousels">Carousels</a>
    <a href="#reels">Reels</a>
  </nav>
  <main>${sectionsHtml}</main>
  <footer>
    Gerado em ${new Date().toISOString().slice(0, 10)} · <code>public/instagram-pack/review-v3.html</code>
    · Ver também <code>CONTENT-V3.md</code>
  </footer>
  <div class="lightbox" id="lightbox"><img alt="" /></div>
  <script>
    const lb = document.getElementById('lightbox');
    const lbImg = lb.querySelector('img');
    document.querySelectorAll('.card img, .carousel-strip img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lb.classList.add('open');
      });
    });
    lb.addEventListener('click', () => lb.classList.remove('open'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
  </script>
</body>
</html>`;

fs.writeFileSync(OUT, html);
console.log(`✓ ${OUT}`);
console.log(`  ${totalImages} imagens · ${totalReels} reels`);
