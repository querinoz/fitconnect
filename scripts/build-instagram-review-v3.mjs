#!/usr/bin/env node
/**
 * Galeria HTML completa — pack v3 + batch v2 + batch v3
 * Saída: public/instagram-pack/review-v3.html
 */
import fs from "node:fs";
import path from "node:path";

const PACK = path.resolve("/workspace/public/instagram-pack");
const OUT = path.join(PACK, "review-v3.html");

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function listFiles(dir, ext) {
  const p = path.join(PACK, dir);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p).filter((f) => f.endsWith(ext)).sort();
}

function listPng(dir) {
  return listFiles(dir, ".png");
}

function itemsFromDir(dir, labelFn = (f) => f.replace(".png", "")) {
  return listPng(dir).map((f) => ({ file: `${dir}/${f}`, label: labelFn(f) }));
}

function imgCard(item, aspect = "1/1") {
  if (!fs.existsSync(path.join(PACK, item.file))) return "";
  return `<article class="card"><div class="thumb" style="aspect-ratio:${aspect}"><img src="${esc(item.file)}" alt="${esc(item.label)}" loading="lazy"/></div>
    <div class="meta"><h3>${esc(item.label)}</h3><code>${esc(item.file)}</code></div></article>`;
}

function carouselBlock(id, name) {
  const dir = path.join(PACK, "Carousels", id);
  if (!fs.existsSync(dir)) return "";
  const slides = listPng(`Carousels/${id}`);
  return `<div class="carousel-block"><h3>${esc(name)}</h3><p class="path"><code>Carousels/${id}/</code> · ${slides.length} slides</p>
    <div class="carousel-strip">${slides.map((s, i) => `<figure><img src="Carousels/${id}/${s}" alt="slide ${i + 1}" loading="lazy"/><figcaption>${i + 1}/${slides.length}</figcaption></figure>`).join("")}</div></div>`;
}

function reelCard(mp4Rel, coverRel, label) {
  if (!fs.existsSync(path.join(PACK, mp4Rel))) return "";
  return `<article class="card reel-card"><div class="thumb reel-thumb"><video src="${esc(mp4Rel)}" poster="${esc(coverRel)}" controls playsinline loop muted></video></div>
    <div class="meta"><h3>${esc(label)}</h3><code>${esc(mp4Rel)}</code></div></article>`;
}

const mockups = itemsFromDir("Mockups");
const educational = itemsFromDir("Educational");
const abstract = itemsFromDir("Abstract");
const features = listPng("Posts").filter((f) => f.includes("feature")).map((f) => ({ file: `Posts/${f}`, label: f.replace(".png", "") }));
const reels = listFiles("Reels/Animated", ".mp4").map((f) => {
  const id = f.replace(".mp4", "");
  return { mp4: `Reels/Animated/${f}`, cover: `Reels/${id}-cover.png`, label: id };
});

const carousels = fs.existsSync(path.join(PACK, "Carousels"))
  ? fs.readdirSync(path.join(PACK, "Carousels")).filter((d) => fs.statSync(path.join(PACK, "Carousels", d)).isDirectory()).sort()
  : [];

const totalImages = mockups.length + educational.length + abstract.length + features.length + reels.length;

const sectionsHtml = `
  <section id="mockups" class="section"><header><h2>Mockups de app (${mockups.length})</h2><p>Logo oficial + PT · mockup-09…38</p></header>
    <div class="grid">${mockups.map((i) => imgCard(i)).join("")}</div></section>
  <section id="educational" class="section"><header><h2>Educativos (${educational.length})</h2><p>edu-08…36 · português</p></header>
    <div class="grid">${educational.map((i) => imgCard(i)).join("")}</div></section>
  <section id="abstract" class="section"><header><h2>Abstratos (${abstract.length})</h2><p>abstract-01…29 · marca</p></header>
    <div class="grid">${abstract.map((i) => imgCard(i)).join("")}</div></section>
  <section id="features" class="section"><header><h2>Posts feature (${features.length})</h2><p>25-feature…58-feature</p></header>
    <div class="grid">${features.map((i) => imgCard(i)).join("")}</div></section>
  <section id="carousels" class="section"><header><h2>Carousels (${carousels.length} sets)</h2><p>Swipe sets prontos</p></header>
    ${carousels.map((id) => carouselBlock(id, id)).join("")}</section>
  <section id="reels" class="section"><header><h2>Reels animados (${reels.length})</h2><p>MP4 9:16 · PT · logo oficial</p></header>
    <div class="grid reels-grid">${reels.map((r) => reelCard(r.mp4, r.cover, r.label)).join("")}</div></section>`;

const html = `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>FitConnect — Revisão completa · @fitconnectsports</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet"/>
<style>
:root{--ink:#07080A;--ink800:#1a1d24;--volt:#C7FB3A;--muted:#8b93a7}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,system-ui,sans-serif;background:var(--ink);color:#FAFBFC;line-height:1.5}
.hero{padding:48px 32px 32px;border-bottom:1px solid var(--ink800);background:radial-gradient(ellipse 60% 80% at 10% 0%,rgba(199,251,58,.12),transparent 50%)}
.hero h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(28px,4vw,42px);font-weight:700}.hero h1 span{color:var(--volt)}
.hero p{color:var(--muted);margin-top:8px}.stats{display:flex;flex-wrap:wrap;gap:16px;margin-top:24px}
.stat{background:var(--ink800);border:1px solid #2a2f3a;border-radius:12px;padding:12px 20px}.stat b{display:block;font-size:24px;color:var(--volt);font-family:'Space Grotesk',sans-serif}
nav{position:sticky;top:0;z-index:50;display:flex;flex-wrap:wrap;gap:8px;padding:12px 32px;background:rgba(7,8,10,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--ink800)}
nav a{color:var(--muted);text-decoration:none;font-size:13px;padding:6px 12px;border-radius:8px}nav a:hover{color:var(--volt);background:var(--ink800)}
main{max-width:1400px;margin:0 auto;padding:32px}.section{margin-bottom:56px;scroll-margin-top:72px}
.section h2{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700}.section header p{color:var(--muted);margin-top:4px;margin-bottom:24px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
.reels-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.card{background:var(--ink800);border:1px solid #2a2f3a;border-radius:16px;overflow:hidden}
.thumb{background:#0b0d11;overflow:hidden}.thumb img{width:100%;height:100%;object-fit:cover;display:block}
.reel-thumb{aspect-ratio:9/16;max-height:480px;margin:0 auto}.reel-thumb video{width:100%;height:100%;object-fit:cover;display:block}
.meta{padding:14px 16px}.meta h3{font-size:14px;font-weight:600;margin-bottom:6px}.meta code{font-size:10px;color:#6b7280;word-break:break-all}
.carousel-block{margin-bottom:32px}.carousel-block h3{font-size:18px}.carousel-block .path{color:var(--muted);font-size:13px;margin-bottom:12px}
.carousel-strip{display:flex;gap:12px;overflow-x:auto;padding-bottom:12px}.carousel-strip figure{flex:0 0 200px}
.carousel-strip img{width:200px;height:200px;object-fit:cover;border-radius:12px;border:1px solid #2a2f3a}
.carousel-strip figcaption{text-align:center;font-size:11px;color:var(--muted);margin-top:4px}
.lightbox{display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.92);align-items:center;justify-content:center;padding:24px;cursor:zoom-out}
.lightbox.open{display:flex}.lightbox img{max-width:95vw;max-height:90vh;border-radius:12px}
footer{text-align:center;padding:32px;color:var(--muted);font-size:13px;border-top:1px solid var(--ink800)}
</style></head><body>
<div class="hero"><h1>Fit<span>Connect</span> — Revisão completa</h1>
<p>Pack v3.1 + batch v2 + v3 · logo oficial · português · clica para ampliar</p>
<div class="stats">
  <div class="stat"><b>${mockups.length}</b> mockups</div>
  <div class="stat"><b>${educational.length}</b> educativos</div>
  <div class="stat"><b>${abstract.length}</b> abstratos</div>
  <div class="stat"><b>${features.length}</b> features</div>
  <div class="stat"><b>${reels.length}</b> reels</div>
  <div class="stat"><b>${carousels.length}</b> carousels</div>
</div></div>
<nav><a href="#mockups">Mockups</a><a href="#educational">Educativos</a><a href="#abstract">Abstratos</a>
<a href="#features">Features</a><a href="#carousels">Carousels</a><a href="#reels">Reels</a></nav>
<main>${sectionsHtml}</main>
<footer>Gerado ${new Date().toISOString().slice(0, 10)} · <code>review-v3.html</code> · LogoMark oficial</footer>
<div class="lightbox" id="lightbox"><img alt=""/></div>
<script>
const lb=document.getElementById('lightbox'),lbImg=lb.querySelector('img');
document.querySelectorAll('.card img,.carousel-strip img').forEach(img=>{
  img.style.cursor='zoom-in';img.addEventListener('click',()=>{lbImg.src=img.src;lb.classList.add('open');});
});
lb.addEventListener('click',()=>lb.classList.remove('open'));
document.addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('open');});
</script></body></html>`;

fs.writeFileSync(OUT, html);
console.log(`✓ ${OUT}`);
console.log(`  ${mockups.length} mockups · ${educational.length} edu · ${abstract.length} abstract · ${features.length} features · ${reels.length} reels`);
