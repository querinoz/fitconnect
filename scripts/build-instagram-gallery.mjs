#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("/workspace/public/instagram");

const sets = [
  { title: "Série 1 — Feed original (32)", dir: ROOT, pattern: /^\d{2}-.+\.png$/, aspect: "1/1" },
  { title: "Série 2 — Diversidade (32)", dir: path.join(ROOT, "v2-diverse"), pattern: /^v2-.+\.png$/, aspect: "1/1" },
  { title: "Série 3 — Devices & ângulos (16)", dir: path.join(ROOT, "v3-devices"), pattern: /^v3-.+\.png$/, aspect: "1/1" },
  { title: "Stories — 9:16 (16)", dir: path.join(ROOT, "stories"), pattern: /^story-.+\.png$/, aspect: "9/16" }
];

const captions = {
  "01-coach-tablet-track.png": "Coach com tablet na pista",
  "02-coach-phone-gym.png": "Coach no ginásio · mobile",
  "03-athlete-hrv-track.png": "Atleta HRV na pista · mobile",
  "04-cyclist-live-session.png": "Ciclista live session · mobile",
  "05-coach-athlete-sidelines.png": "Coach + atleta · tablet",
  "06-yoga-coach-tablet.png": "Yoga coach · tablet",
  "07-bjj-coach-phone.png": "BJJ coach · mobile",
  "08-swim-coach-poolside.png": "Natação poolside · tablet",
  "09-climbing-coach-phone.png": "Escalada · mobile",
  "10-crossfit-coach-tablet.png": "CrossFit box · tablet",
  "11-morning-handshake-sunrise.png": "Morning handshake · mobile",
  "12-celebration-pr-gym.png": "Celebração PR · mobile",
  "13-tennis-athlete-phone.png": "Ténis · mobile",
  "14-basketball-coach-timeout.png": "Basquetebol · tablet",
  "15-trail-runner-summit.png": "Trail running · mobile",
  "16-surf-coach-beach.png": "Surf coach · mobile",
  "17-pilates-coach-tablet.png": "Pilates · tablet",
  "18-rowing-coach-dock.png": "Remo · tablet",
  "19-marathon-group-coach.png": "Grupo maratona · mobile",
  "20-powerlifter-phone-gym.png": "Powerlifting · mobile",
  "21-recovery-foam-roll.png": "Recovery · mobile",
  "22-night-stadium-coach.png": "Estádio nocturno · tablet",
  "23-spin-studio-coach.png": "Spin studio · mobile",
  "24-soccer-postmatch-phone.png": "Futebol · mobile",
  "25-boxing-coach-corner.png": "Boxe · tablet",
  "26-sprint-coach-blocks.png": "Sprint · mobile",
  "27-master-athlete-coach.png": "Master athlete · tablet",
  "28-mobility-coach-phone-stand.png": "Mobilidade · mobile",
  "29-hockey-locker-phone.png": "Hockey · mobile",
  "30-skate-coach-park.png": "Skate · mobile",
  "31-gymnastics-coach-tablet.png": "Ginástica · tablet",
  "32-ai-copilot-review.png": "AI co-pilot · tablet",
  "v2-01-black-sprint-coach.png": "Sprint coach — mulher negra · tablet",
  "v2-02-latina-volleyball.png": "Voleibol — atleta latina · mobile",
  "v2-03-black-basketball-coach.png": "Basquetebol — coach negro · tablet",
  "v2-04-asian-figure-skating.png": "Patinagem — atleta asiática · tablet",
  "v2-05-afro-capoeira.png": "Capoeira — mestre afro-brasileiro · mobile",
  "v2-06-latina-soccer.png": "Futebol — atacante latina · mobile",
  "v2-07-black-crossfit-pr.png": "CrossFit PR — atleta negra · mobile",
  "v2-08-south-asian-cricket.png": "Críquete — coach sul-asiático · tablet",
  "v2-09-mixed-trail-running.png": "Trail — casal multirracial · mobile",
  "v2-10-black-boxing-coach.png": "Boxe — coach negro · tablet",
  "v2-11-black-coach-latina-swim.png": "Natação — coach negra + atleta latina · tablet",
  "v2-12-indigenous-climbing.png": "Escalada — atleta indígena · mobile",
  "v2-13-black-yoga-coach.png": "Yoga — instrutora negra · tablet",
  "v2-14-latino-bmx.png": "BMX — rider latino · mobile",
  "v2-15-black-rugby.png": "Rugby — jogador negro · mobile",
  "v2-16-asian-tennis-doubles.png": "Ténis — duplas asiáticas · mobile",
  "v2-17-latina-dance-fitness.png": "Dance fitness — instrutora latina · tablet",
  "v2-18-black-hurdler-sunrise.png": "Barreiras — atleta negra · mobile",
  "v2-19-south-asian-badminton.png": "Badminton — coach sul-asiática · mobile",
  "v2-20-afro-caribbean-beach-volleyball.png": "Beach volley — afro-caribenha · mobile",
  "v2-21-latino-equestrian.png": "Hipismo — coach latino · tablet",
  "v2-22-black-wheelchair-basketball.png": "Basquetebol adaptado · mobile",
  "v2-23-middle-eastern-fencing.png": "Esgrima — coach Médio Oriente · tablet",
  "v2-24-latina-softball.png": "Softball — atleta latina · mobile",
  "v2-25-black-triathlete.png": "Triatlo — atleta negra · mobile",
  "v2-26-pacific-rugby-sevens.png": "Rugby sevens — Pacífico · tablet",
  "v2-27-latina-pole-vault.png": "Salto com vara — latina · mobile",
  "v2-28-black-football.png": "Futebol americano — atleta negro · mobile",
  "v2-29-asian-taekwondo.png": "Taekwondo — mestre asiático · tablet",
  "v2-30-afro-latina-velodrome.png": "Velódromo — afro-latina · mobile",
  "v2-31-black-golf-coach.png": "Golfe — coach negra · tablet",
  "v2-32-multiracial-rowing.png": "Remo — equipa multirracial · tablet",
  "v3-01-black-kickboxing-phone-selfie.png": "Kickboxing · mobile · selfie",
  "v3-02-latina-handball-wearos.png": "Handball · WearOS · 3/4 trás",
  "v3-03-south-asian-cricket-tablet-wide.png": "Críquete · tablet · wide",
  "v3-04-black-marathon-wearos-macro.png": "Maratona · WearOS · macro",
  "v3-05-asian-skate-phone-dutch.png": "Skate · mobile · dutch angle",
  "v3-06-afro-caribbean-surf-phone.png": "Surf · mobile · over-shoulder",
  "v3-07-middle-eastern-weightlifting-tablet.png": "Weightlifting · tablet · low angle",
  "v3-08-latina-climbing-wearos-pov.png": "Escalada · WearOS · POV",
  "v3-09-black-lacrosse-tablet-side.png": "Lacrosse · tablet · perfil",
  "v3-10-pacific-outrigger-phone-aerial.png": "Outrigger · mobile · aerial",
  "v3-11-indigenous-archery-phone.png": "Arco e flecha · mobile · close-up",
  "v3-12-latino-futsal-wearos.png": "Futsal · WearOS · tracking",
  "v3-13-black-triathlon-tablet-rear.png": "Triatlo · tablet · 3/4 trás",
  "v3-14-multiracial-hockey-tablet-wide.png": "Hockey · tablet · wide",
  "v3-15-afro-latina-gymnastics-wearos.png": "Ginástica · WearOS · close-up",
  "v3-16-asian-badminton-all-devices.png": "Badminton · mobile+tablet+WearOS · flat lay",
  "story-01-black-runner-wearos.png": "Story · corrida · WearOS · over-shoulder",
  "story-02-latina-coach-tablet-low.png": "Story · CrossFit · tablet · low angle",
  "story-03-south-asian-cyclist-phone-mount.png": "Story · ciclismo · mobile mount · close-up",
  "story-04-afro-capoeira-phone-wide.png": "Story · capoeira · mobile · wide",
  "story-05-black-boxing-tablet-pov.png": "Story · boxe · tablet · POV",
  "story-06-asian-swimmer-wearos.png": "Story · natação · WearOS · perfil",
  "story-07-middle-eastern-fencing-tablet.png": "Story · esgrima · tablet · overhead",
  "story-08-latina-soccer-phone-celebration.png": "Story · futebol · mobile · dutch angle",
  "story-09-indigenous-trail-wearos.png": "Story · trail · WearOS · macro pulso",
  "story-10-black-yoga-tablet-back.png": "Story · yoga · tablet · back shot",
  "story-11-pacific-rugby-tablet-huddle.png": "Story · rugby · tablet · wide huddle",
  "story-12-afro-latina-dance-phone.png": "Story · dance · mobile · extreme close-up",
  "story-13-black-wheelchair-wearos.png": "Story · basquete adaptado · WearOS · low angle",
  "story-14-multiracial-rowing-tablet-aerial.png": "Story · remo · tablet · bird-eye",
  "story-15-latino-bmx-phone-action.png": "Story · BMX · mobile · action tracking",
  "story-16-black-latina-golf-tablet.png": "Story · golfe · tablet · two-shot"
};

function listImages(dir, pattern) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => pattern.test(f))
    .sort()
    .map((f) => ({
      file: f,
      rel: path.relative(ROOT, path.join(dir, f)).replace(/\\/g, "/"),
      caption: captions[f] ?? f
    }));
}

let globalIndex = 0;
const allSets = sets.map((s) => {
  const images = listImages(s.dir, s.pattern);
  const numbered = images.map((img) => {
    globalIndex += 1;
    return { ...img, num: globalIndex };
  });
  return { ...s, images: numbered };
});

const total = globalIndex;

const cards = allSets
  .map(
    (set) => `
<section class="set" data-aspect="${set.aspect}">
  <h2>${set.title} <span class="count">(${set.images.length})</span></h2>
  <div class="grid${set.aspect === "9/16" ? " stories" : ""}">
    ${set.images
      .map(
        (img) => `
    <figure style="--aspect:${set.aspect}">
      <a href="${img.rel}" target="_blank">
        <img src="${img.rel}" alt="${img.caption}" loading="lazy" />
      </a>
      <figcaption><strong>${img.num}.</strong> ${img.caption}<br><code>${img.file}</code></figcaption>
    </figure>`
      )
      .join("")}
  </div>
</section>`
  )
  .join("");

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FitConnect Instagram — ${total} fotos</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; background: #07080A; color: #e8e8e8; }
    header { padding: 2rem; text-align: center; border-bottom: 1px solid #222; background: linear-gradient(180deg,#111,#07080A); position: sticky; top: 0; z-index: 10; }
    h1 { margin: 0 0 .5rem; font-size: 1.75rem; }
    .tagline { color: #9CD81A; font-family: monospace; letter-spacing: .08em; }
    .meta { color: #888; margin-top: .5rem; }
    nav { margin-top: 1rem; display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; }
    nav a { color: #9CD81A; font-size: .85rem; padding: .25rem .75rem; border: 1px solid #333; border-radius: 999px; }
    .set { padding: 2rem 1rem; max-width: 1600px; margin: 0 auto; scroll-margin-top: 5rem; }
    .set h2 { border-left: 4px solid #9CD81A; padding-left: .75rem; margin-bottom: 1.5rem; }
    .count { color: #9CD81A; font-weight: normal; font-size: .9em; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem; }
    .grid.stories { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
    figure { margin: 0; background: #111; border-radius: 12px; overflow: hidden; border: 1px solid #222; }
    img { width: 100%; aspect-ratio: var(--aspect, 1); object-fit: cover; display: block; transition: transform .2s; }
    figure:hover img { transform: scale(1.02); }
    figcaption { padding: .75rem; font-size: .82rem; line-height: 1.4; }
    code { font-size: .68rem; color: #666; word-break: break-all; }
    a { color: inherit; text-decoration: none; }
  </style>
</head>
<body>
  <header>
    <h1>FitConnect Instagram Pack</h1>
    <div class="tagline">Connect. Train. Perform.</div>
    <div class="meta">@fitconnectsports · ${total} fotos · Feed 1:1 + Stories 9:16 · mobile · tablet · WearOS</div>
    <nav>
      <a href="#s1">Série 1 (32)</a>
      <a href="#s2">Série 2 (32)</a>
      <a href="#s3">Série 3 (16)</a>
      <a href="#s4">Stories (16)</a>
    </nav>
  </header>
  ${cards.replace('Série 1', '<span id="s1"></span>Série 1').replace('Série 2', '<span id="s2"></span>Série 2').replace('Série 3', '<span id="s3"></span>Série 3').replace('Stories', '<span id="s4"></span>Stories')}
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, "gallery.html"), html);
console.log(`Gallery written: ${total} images`);
