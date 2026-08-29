#!/usr/bin/env node
/**
 * FitConnect — Batch v3: +12 mockups, +12 educativos, +12 abstratos, +12 features, +12 reels
 * Mesmo padrão v3.1: logo oficial + LogoMark + PT
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const ROOT = "/workspace";
const PACK = path.join(ROOT, "public/instagram-pack");
const BRAND_DIR = path.join(ROOT, "public/brand");
const TMP = "/tmp/ig-render-v3";

const only = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : "all";

fs.mkdirSync(TMP, { recursive: true });
for (const d of [
  "Mockups",
  "Educational",
  "Posts",
  "Abstract",
  "Reels/Animated",
  "Carousels/15-app-features-v3",
  "Carousels/16-educational-v4",
  "Carousels/17-abstract-v3"
]) {
  fs.mkdirSync(path.join(PACK, d), { recursive: true });
}

const C = {
  ink: "#07080A",
  volt: "#C7FB3A",
  voltDark: "#9CD81A",
  white: "#FAFBFC",
  cyan: "#22d3ee",
  signal: "#f43f5e",
  ink400: "#8b93a7",
  ink200: "#c8cdd8"
};

const MARK_URI = `data:image/png;base64,${fs.readFileSync(path.join(BRAND_DIR, "logomark-official-256.png")).toString("base64")}`;

function logoFull(h = 44) {
  return `<div style="display:inline-flex;align-items:center;gap:12px;height:${h}px">
    <img src="${MARK_URI}" alt="FitConnect" style="height:${h}px;width:${h}px;object-fit:contain;border-radius:10px"/>
    <span class="display" style="font-size:${Math.round(h * 0.55)}px;font-weight:700;letter-spacing:-0.03em;line-height:1">
      <span style="color:${C.white}">Fit</span><span style="color:${C.volt}">Connect</span>
    </span>
  </div>`;
}

function logoMark(h = 40) {
  return `<img src="${MARK_URI}" alt="FitConnect" style="height:${h}px;width:${h}px;object-fit:contain;border-radius:8px"/>`;
}

function baseCss(w, h) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:${C.ink};font-family:Inter,system-ui,sans-serif;color:${C.white}}
.display{font-family:'Space Grotesk',Inter,sans-serif;letter-spacing:-0.03em}
.eyebrow{font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${C.volt};font-weight:700}
.cta{display:inline-flex;align-items:center;gap:8px;background:${C.volt};color:${C.ink};font-weight:700;padding:12px 20px;border-radius:999px;font-size:14px}
.phone{width:340px;height:700px;border-radius:42px;border:3px solid #2a2f3a;background:#0b0d11;box-shadow:0 40px 80px rgba(0,0,0,.55);overflow:hidden;position:relative}
.phone-notch{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:110px;height:28px;background:#050607;border-radius:0 0 16px 16px;z-index:5}
.screen{position:absolute;inset:0;padding:44px 16px 20px;overflow:hidden}
.dock{position:absolute;bottom:14px;left:16px;right:16px;display:flex;justify-content:space-around;background:rgba(20,22,28,.92);border:1px solid #2a2f3a;border-radius:18px;padding:10px 6px;font-size:9px;color:${C.ink400}}
.dock .on{color:${C.volt};font-weight:700}
.card{background:rgba(26,29,36,.9);border:1px solid #2a2f3a;border-radius:16px;padding:12px}
.pill{display:inline-flex;padding:4px 10px;border-radius:999px;background:rgba(199,251,58,.12);color:${C.volt};font-size:10px;font-weight:600}
.bar{height:8px;border-radius:99px;background:#1a1d24;overflow:hidden}
.bar>i{display:block;height:100%;background:linear-gradient(90deg,#DAFE7E,${C.voltDark});border-radius:99px}
.avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${C.cyan},${C.volt});display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#020617}
`;
}

function wrap(body, w = 1080, h = 1080) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseCss(w, h)}</style></head><body>${body}</body></html>`;
}

function phoneChrome(title, active, inner) {
  return `<div class="phone"><div class="phone-notch"></div><div class="screen">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">${logoMark(18)}<span class="eyebrow" style="font-size:9px">${title}</span></div>
      <div class="display" style="font-size:20px;font-weight:700">${title}</div></div>
      <div style="width:28px;height:28px;border-radius:50%;background:#1a1d24;border:1px solid #2a2f3a;display:flex;align-items:center;justify-content:center;font-size:12px">🔔</div>
    </div>${inner}</div>
    <div class="dock"><span class="${active === "home" ? "on" : ""}">Início</span><span class="${active === "feed" ? "on" : ""}">Feed</span>
    <span class="${active === "search" ? "on" : ""}">Busca</span><span class="${active === "ranks" ? "on" : ""}">Ranks</span><span class="${active === "profile" ? "on" : ""}">Tu</span></div></div>`;
}

function mockupShell(label, subtitle, phoneHtml) {
  return wrap(`<div style="width:1080px;height:1080px;position:relative;background:
    radial-gradient(ellipse 80% 60% at 20% 10%, rgba(34,211,238,.16), transparent 50%),
    radial-gradient(ellipse 70% 50% at 90% 80%, rgba(199,251,58,.14), transparent 45%),
    linear-gradient(160deg,#07080A,#0e1118 50%,#07080A)">
    <div style="position:absolute;inset:48px 56px;display:flex;justify-content:space-between;align-items:center">
      <div style="max-width:420px"><div style="margin-bottom:28px">${logoFull(48)}</div>
        <div class="eyebrow">${label}</div>
        <h1 class="display" style="font-size:50px;font-weight:700;line-height:1.05;margin:14px 0 18px">${subtitle}</h1>
        <p style="color:${C.ink400};font-size:18px">Liga. Treina. Perform.</p>
        <div style="margin-top:32px" class="cta">Abrir no app →</div></div>
      <div style="transform:rotate(-2deg)">${phoneHtml}</div></div></div>`);
}

function mkMockup(num, slug, label, subtitle, screenTitle, active, inner) {
  return {
    file: `mockup-${String(num).padStart(2, "0")}-${slug}.png`,
    html: mockupShell(label, subtitle, phoneChrome(screenTitle, active, inner))
  };
}

const MOCKUPS_V3 = [
  mkMockup(27, "injury-prevention", "Prevenção", "Lesões evitadas<br>antes de acontecer.", "Lesões", "profile",
    `<div class="card" style="margin-bottom:12px;border-color:${C.volt}"><div style="font-size:10px;color:${C.volt}">Risco baixo</div>
    <div class="display" style="font-size:24px;font-weight:700">Tudo verde</div><div style="font-size:11px;color:${C.ink400}">Carga + mobilidade OK</div></div>
    ${[["Joelho","Estável",C.volt],["Ombros","Atenção",C.cyan],["Tornozelo","Ótimo",C.volt]].map(([l,v,col])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1a1d24"><span style="font-size:11px">${l}</span><span style="font-size:11px;font-weight:700;color:${col}">${v}</span></div>`).join("")}`),
  mkMockup(28, "hydration", "Hidratação", "Água também<br>é performance.", "Hidratação", "home",
    `<div class="card" style="margin-bottom:12px"><div style="font-size:10px;color:${C.ink400}">Hoje</div>
    <div class="display" style="font-size:32px;font-weight:700">2,1 L</div><div class="bar" style="margin-top:8px"><i style="width:70%"></i></div>
    <div style="font-size:10px;color:${C.ink400};margin-top:6px">Meta: 3,0 L</div></div>
    ${[["Antes treino","500 ml"],["Durante","800 ml"],["Depois","800 ml"]].map(([l,v])=>`<div class="card" style="margin-bottom:8px;display:flex;justify-content:space-between"><span style="font-size:11px">${l}</span><span style="font-weight:700;color:${C.cyan}">${v}</span></div>`).join("")}`),
  mkMockup(29, "race-day", "Dia de prova", "Checklist<br>sem stress.", "Prova", "home",
    `${[["Kit verificado","✓"],["Plano de ritmo","✓"],["HRV 78 — GO","✓"],["Coach notificado","✓"]].map(([t,s])=>`<div class="card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:12px;font-weight:600">${t}</span><span style="color:${C.volt};font-weight:700">${s}</span></div>`).join("")}
    <div class="card" style="margin-top:12px;border-color:${C.cyan}"><div style="font-size:10px;color:${C.cyan}">Meia maratona · 09:00</div>
    <div style="font-size:13px;font-weight:700;margin-top:4px">Ritmo alvo: 4:45/km</div></div>`),
  mkMockup(30, "workout-builder", "Construtor", "Monta sessões<br>em minutos.", "Treino", "search",
    `${[["Aquecimento","10 min","Z1"],["Principal","6×800m","Z4"],["Cool-down","8 min","Z1"]].map(([t,d,z])=>`<div class="card" style="margin-bottom:8px"><div style="font-size:12px;font-weight:700">${t}</div><div style="font-size:10px;color:${C.ink400}">${d} · ${z}</div></div>`).join("")}
    <div style="margin-top:10px;font-size:10px;color:${C.volt}">+ Arrastar para reordenar</div>`),
  mkMockup(31, "nutrition-log", "Nutrição", "Diário alimentar<br>ligado ao treino.", "Nutrição", "profile",
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
    ${[["Proteína","142g",C.volt],["Carbs","310g",C.cyan],["Gordura","68g","#a78bfa"],["Calorias","2.480","#fbbf24"]].map(([l,v,col])=>`<div class="card"><div style="font-size:9px;color:${C.ink400}">${l}</div><div style="font-size:16px;font-weight:700;color:${col}">${v}</div></div>`).join("")}</div>
    <div class="card"><div style="font-size:11px;font-weight:700">Pós-treino</div><div style="font-size:10px;color:${C.ink200}">Shake · 30g proteína · 14:20</div></div>`),
  mkMockup(32, "team-dashboard", "Equipa", "Coach vê<br>toda a equipa.", "Equipa", "home",
    `${[["Ana R.","HRV 72 · GO",C.volt],["João M.","HRV 48 · Leve",C.cyan],["Sofia L.","Descanso",C.ink400],["Diego P.","HRV 81 · GO",C.volt]].map(([n,s,col])=>`<div class="card" style="margin-bottom:8px;display:flex;gap:10px;align-items:center"><div class="avatar">${n[0]}</div><div style="flex:1"><div style="font-size:12px;font-weight:700">${n}</div><div style="font-size:10px;color:${col}">${s}</div></div></div>`).join("")}`),
  mkMockup(33, "hr-zones", "Zonas FC", "Treina na zona<br>certa.", "Zonas", "home",
    `${[["Z1","Recuperação","120-140",false],["Z2","Base","140-155",false],["Z3","Tempo","155-168",true],["Z4","Limiar","168-178",false]].map(([z,n,r,on])=>`<div class="card" style="margin-bottom:8px;${on?`border-color:${C.volt};background:rgba(199,251,58,.08)`:""}"><div style="display:flex;justify-content:space-between"><span style="font-size:12px;font-weight:700">${z} · ${n}</span><span style="font-size:10px;color:${on?C.volt:C.ink400}">${r} bpm</span></div></div>`).join("")}
    <div style="font-size:10px;color:${C.ink400};margin-top:8px">Sessão atual: Z3</div>`),
  mkMockup(34, "achievements", "Conquistas", "Streaks e badges<br>que motivam.", "Conquistas", "profile",
  `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
    ${[["🔥","14 dias"],["🏅","5K PR"],["💪","100 sessões"],["🌙","Sono 7d"],["⚡","Z4 master"],["🤝","Coach 30d"]].map(([ico,l])=>`<div class="card" style="text-align:center;padding:14px 8px"><div style="font-size:22px">${ico}</div><div style="font-size:9px;color:${C.ink400};margin-top:4px">${l}</div></div>`).join("")}</div>
    <div class="card"><div style="font-size:12px;font-weight:700">Próximo: 21 dias streak</div><div class="bar" style="margin-top:8px"><i style="width:67%"></i></div></div>`),
  mkMockup(35, "coach-finder", "Encontrar coach", "Match perfeito<br>em 3 passos.", "Coaches", "search",
    `${[["Ana Costa","Corrida · Lisboa","4.9★"],["Marco Silva","Força · Porto","4.8★"],["Priya Nair","Yoga · Online","5.0★"]].map(([n,s,r])=>`<div class="card" style="margin-bottom:10px"><div style="display:flex;gap:10px;align-items:center"><div class="avatar">${n[0]}</div><div><div style="font-size:12px;font-weight:700">${n}</div><div style="font-size:10px;color:${C.ink400}">${s}</div><div style="font-size:10px;color:${C.volt};margin-top:2px">${r}</div></div></div></div>`).join("")}
    <div class="pill">Filtros: modalidade · local · preço</div>`),
  mkMockup(36, "morning-handshake", "Ritual matinal", "30 segundos<br>que mudam o dia.", "Manhã", "home",
    `<div class="card" style="margin-bottom:12px;border-color:${C.volt}"><div style="font-size:10px;color:${C.volt}">Morning handshake</div>
    <div class="display" style="font-size:28px;font-weight:700">HRV 74</div><div style="font-size:11px;color:${C.ink200}">+6 vs média · Sono 7h 12m</div></div>
    ${[["Energia","Alta",C.volt],["Plano hoje","Tempo run",C.cyan],["Coach","Aprovado ✓",C.volt]].map(([l,v,col])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1a1d24"><span style="font-size:11px">${l}</span><span style="font-size:11px;font-weight:700;color:${col}">${v}</span></div>`).join("")}`),
  mkMockup(37, "data-export", "Exportar", "Os teus dados<br>sempre contigo.", "Exportar", "profile",
    `${[["CSV","Sessões e métricas"],["PDF","Relatório mensal"],["GPX","Rotas de corrida"],["API","Integração coach"]].map(([f,d])=>`<div class="card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:12px;font-weight:700">${f}</div><div style="font-size:10px;color:${C.ink400}">${d}</div></div><span style="color:${C.volt};font-size:14px">↓</span></div>`).join("")}
    <div style="font-size:10px;color:${C.ink400};margin-top:8px">Último export: há 2 dias</div>`),
  mkMockup(38, "onboarding", "Primeiros passos", "Setup em<br>menos de 2 min.", "Bem-vindo", "home",
    `<div style="text-align:center;margin-bottom:16px">${logoMark(56)}<div class="display" style="font-size:22px;font-weight:700;margin-top:12px">Bem-vindo!</div></div>
    ${[["Perfil atleta","✓"],["Modalidade","Corrida"],["Objetivo","Meia maratona"],["Coach","Opcional"]].map(([l,v],i)=>`<div class="card" style="margin-bottom:8px;display:flex;justify-content:space-between"><span style="font-size:11px">${l}</span><span style="font-size:11px;font-weight:700;color:${i===0?C.volt:C.ink200}">${v}</span></div>`).join("")}
    <div class="cta" style="margin-top:12px;width:100%;justify-content:center;font-size:12px">Continuar →</div>`)
];

function eduPost(eyebrow, title, bullets) {
  return wrap(`<div style="width:1080px;height:1080px;padding:64px;background:linear-gradient(145deg,#07080A,#10141c 40%,#0a0c10);position:relative">
    <div style="margin-bottom:36px">${logoFull(48)}</div><div class="eyebrow">${eyebrow}</div>
    <h1 class="display" style="font-size:50px;font-weight:700;line-height:1.08;margin:16px 0 32px">${title}</h1>
    <div style="display:flex;flex-direction:column;gap:14px">${bullets.map((b,i)=>`<div style="display:flex;gap:14px;align-items:flex-start;background:rgba(26,29,36,.7);border:1px solid #2a2f3a;border-radius:18px;padding:16px 20px">
      <div class="display" style="width:34px;height:34px;border-radius:10px;background:rgba(199,251,58,.15);color:${C.volt};display:flex;align-items:center;justify-content:center;font-weight:700">${i+1}</div>
      <div style="font-size:19px;line-height:1.35;padding-top:2px">${b}</div></div>`).join("")}</div>
    <div style="position:absolute;bottom:52px;left:64px;right:64px;display:flex;justify-content:space-between;align-items:center">
      <span style="color:${C.ink400};display:flex;align-items:center;gap:10px">${logoMark(26)} Liga. Treina. Perform.</span>
      <span class="cta" style="padding:10px 16px;font-size:13px">fitconnect.app</span></div></div>`);
}

const EDU_V3 = [
  ["edu-25-warmup.png","Educação · Aquecimento","Aquecimento que funciona",["5–10 min antes de cada sessão","Dinâmico: mobilidade + ativação","Aumenta FC gradualmente","Reduz risco de lesão em 40%"]],
  ["edu-26-cooldown.png","Educação · Cool-down","Cool-down inteligente",["5–8 min após treino intenso","Caminhada leve + alongamento","Ajuda remoção de lactato","Melhora recovery para amanhã"]],
  ["edu-27-heart-rate.png","Educação · FC","Zonas de frequência cardíaca",["Z1–Z2: base aeróbica e recovery","Z3: tempo e ritmo sustentado","Z4–Z5: limiar e VO2max","O FitConnect calcula as tuas zonas"]],
  ["edu-28-injury-prevention.png","Educação · Lesões","Prevenir > tratar",["Carga progressiva (+10% max/semana)","Mobilidade 10 min/dia","Ouve sinais: dor ≠ fadiga normal","AI alerta padrões de risco"]],
  ["edu-29-hydration.png","Educação · Hidratação","Hidratação para atletas",["2–3 L/dia como base","+500 ml por hora de treino intenso","Desidratação 2% = −10% performance","Tracker integrado no app"]],
  ["edu-30-mental.png","Educação · Mental","Treino mental",["Visualização antes de provas","Rotinas pré-competição","Foco no processo, não só resultado","Coach ajuda com mindset"]],
  ["edu-31-competition.png","Educação · Competição","Dia de competição",["Acorda cedo — sem pressa","Refeição leve 3h antes","Confia no taper feito","HRV no pico = sinal verde"]],
  ["edu-32-deload.png","Educação · Deload","Semana de deload",["A cada 3–4 semanas de carga alta","Reduz volume 40–50%","Mantém alguma intensidade","HRV recupera — volta mais forte"]],
  ["edu-33-supplements.png","Educação · Suplementos","Suplementação básica",["Creatina: evidência forte para força","Vitamina D se deficiente","Proteína via comida primeiro","Coach orienta — não substitui comida"]],
  ["edu-34-failure.png","Educação · Falha","Falhar com propósito",["Últimas reps até falha técnica","Só em exercícios seguros","1–2 séries por sessão máximo","Recovery extra no dia seguinte"]],
  ["edu-35-periodization.png","Educação · Periodização","Periodização avançada",["Macrociclo: temporada completa","Mesociclo: blocos de 4–6 semanas","Microciclo: a tua semana","O app sincroniza com o coach"]],
  ["edu-36-active-rest.png","Educação · Descanso","Descanso ativo",["Caminhada leve ou yoga suave","Aumenta fluxo sanguíneo","Não é dia off do sofá","HRV sobe mais rápido assim"]]
].map(([file,ey,title,bullets])=>({file,html:eduPost(ey,title,bullets)}));

const MOTIFS = ["pulse","rings","grid","bars"];
function abstractPost(title, line, motif) {
  const svg = { pulse:`<svg width="1080" height="1080" style="position:absolute;inset:0"><path d="M0 540 H200 L260 400 L340 680 L420 480 L500 560 H1080" fill="none" stroke="${C.volt}" stroke-width="6" opacity=".85"/></svg>`,
    rings:`<svg width="1080" height="1080" style="position:absolute;inset:0">${[120,220,320].map((r,i)=>`<circle cx="780" cy="320" r="${r}" fill="none" stroke="${i%2?C.volt:C.cyan}" stroke-width="2" opacity=".4"/>`).join("")}</svg>`,
    grid:`<svg width="1080" height="1080" style="position:absolute;inset:0"><circle cx="540" cy="540" r="180" fill="none" stroke="${C.volt}" stroke-width="3" opacity=".5"/></svg>`,
    bars:`<svg width="1080" height="1080" style="position:absolute;inset:0">${[40,70,55,90,65,80].map((h,i)=>`<rect x="${180+i*100}" y="${700-h*4}" width="60" height="${h*4}" rx="12" fill="${C.volt}" opacity="${0.35+i*0.08}"/>`).join("")}</svg>`};
  return wrap(`<div style="width:1080px;height:1080px;position:relative;overflow:hidden;background:${C.ink}">${svg[motif]||svg.pulse}
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 70%, transparent, rgba(7,8,10,.9))"></div>
    <div style="position:relative;z-index:2;padding:72px;height:100%;display:flex;flex-direction:column;justify-content:flex-end">
      <div style="margin-bottom:auto">${logoFull(48)}</div><div style="margin-bottom:16px">${logoMark(72)}</div>
      <div class="eyebrow" style="margin-bottom:14px">Marca · Abstrato</div>
      <h1 class="display" style="font-size:64px;font-weight:700;line-height:1.02">${title}</h1>
      <p style="margin-top:18px;font-size:22px;color:${C.ink200}">${line}</p></div></div>`);
}

const ABSTRACT_V3 = [
  ["abstract-18-trust-process.png","Confia no<br>processo.","Resultados seguem consistência.","pulse"],
  ["abstract-19-morning-ritual.png","Ritual<br>matinal.","30 segundos. Todo o dia muda.","rings"],
  ["abstract-20-body-signals.png","O corpo<br>envia sinais.","HRV é a linguagem.","grid"],
  ["abstract-21-coach-athlete.png","Coach +<br>atleta.","Parceria, não hierarquia.","bars"],
  ["abstract-22-small-wins.png","Vitórias<br>pequenas.","Compõem grandes resultados.","rings"],
  ["abstract-23-discipline.png","Disciplina<br>> motivação.","Motivação acaba. Sistema fica.","pulse"],
  ["abstract-24-race-morning.png","Manhã de<br>prova.","Tudo o que treinaste, aqui.","grid"],
  ["abstract-25-hydrate.png","Hidrata.<br>Performa.","Água é combustível.","bars"],
  ["abstract-26-listen-rest.png","Ouve quando<br>descansar.","Coragem de parar.","pulse"],
  ["abstract-27-team-energy.png","Energia de<br>equipa.","Sozinho treinas. Juntos vences.","rings"],
  ["abstract-28-precision.png","Precisão<br>importa.","Cada zona. Cada rep. Cada dia.","grid"],
  ["abstract-29-start-today.png","Começa<br>hoje.","O melhor dia era ontem. O segundo melhor é hoje.","pulse"]
].map(([file,title,line,motif])=>({file,html:abstractPost(title,line,motif)}));

function featurePost(eyebrow, title, points) {
  return wrap(`<div style="width:1080px;height:1080px;padding:64px;background:linear-gradient(160deg,#07080A,#12161f,#07080A)">
    <div style="margin-bottom:32px">${logoFull(48)}</div><div class="eyebrow">${eyebrow}</div>
    <h1 class="display" style="font-size:44px;font-weight:700;line-height:1.1;margin:12px 0 24px">${title}</h1>
    <div style="display:grid;gap:12px">${points.map(p=>`<div style="display:flex;gap:12px;align-items:center;padding:16px 18px;border-radius:16px;border:1px solid #2a2f3a;background:rgba(26,29,36,.65)">
      ${logoMark(26)}<div style="font-size:19px">${p}</div></div>`).join("")}</div>
    <div style="margin-top:32px;color:${C.ink400}">#FitConnect #LigaTreinaPerform</div></div>`);
}

const FEATURES_V3 = [
  ["47-feature-injury.png","App · Lesões","Prevenção de lesões com AI",["Monitoriza carga por articulação","Alertas antes do pico de risco","Exercícios de prevenção sugeridos","Coach recebe relatório semanal"]],
  ["48-feature-hydration.png","App · Hidratação","Tracker de hidratação",["Meta diária personalizada","Lembretes antes e depois do treino","Correlação com performance","Integra com WearOS"]],
  ["49-feature-race-day.png","App · Prova","Modo dia de competição",["Checklist automático","Plano de ritmo no relógio","HRV matinal com sinal GO/NO-GO","Coach em tempo real"]],
  ["50-feature-builder.png","App · Construtor","Construtor de treinos",["Arrasta blocos de sessão","Zonas e duração automáticas","Partilha com atletas","Templates do coach"]],
  ["51-feature-nutrition.png","App · Nutrição","Diário nutricional",["Macros diários trackeados","Sugestões pós-treino","Histórico semanal","Export para nutricionista"]],
  ["52-feature-team.png","App · Equipa","Dashboard de equipa",["Visão de todos os atletas","HRV e readiness em grupo","Alertas de atletas em risco","Comunicação em massa"]],
  ["53-feature-hr-zones.png","App · Zonas FC","Zonas de FC personalizadas",["Calculadas pelo teu perfil","Alertas em tempo real no treino","Histórico por zona","Sync com WearOS"]],
  ["54-feature-achievements.png","App · Conquistas","Sistema de conquistas",["Streaks e badges","PRs celebrados automaticamente","Partilha no feed","Motivação gamificada"]],
  ["55-feature-coach-finder.png","App · Coaches","Encontrar o coach ideal",["Filtros por modalidade e local","Reviews de atletas reais","Match por objetivos","Chat direto após match"]],
  ["56-feature-handshake.png","App · Manhã","Morning handshake",["HRV + sono em 30 segundos","Plano do dia ajustado","Coach aprova ou modifica","Ritual diário de consistência"]],
  ["57-feature-export.png","App · Export","Exportação de dados",["CSV, PDF, GPX e API","Relatórios mensais automáticos","Dados sempre teus","Integração com ferramentas externas"]],
  ["58-feature-onboarding.png","App · Onboarding","Setup em 2 minutos",["Perfil atleta em 4 passos","Objetivos e modalidade","Match opcional com coach","Primeiro treino sugerido"]]
].map(([file,ey,title,points])=>({file,html:featurePost(ey,title,points)}));

const HUES = [C.volt, C.cyan, "#7dd3a3", "#fbbf24", "#a78bfa", C.signal, "#f472b6", "#38bdf8"];
const REELS_V3 = [
  ["reel-hero-19-warmup","Aquece<br>bem.","Lesões não avisam.","Aquecimento","Multi-desporto"],
  ["reel-hero-20-hydrate","Bebe água.<br>Vence.","2% desidratação = −10% performance.","Hidratação","Corrida"],
  ["reel-hero-21-race-day","Hoje é<br>o dia.","Meses de treino. Uma manhã.","Prova","Corrida"],
  ["reel-hero-22-coach-team","Equipa<br>forte.","Coach vê tudo. Atleta sente tudo.","Equipa","Coaching"],
  ["reel-hero-23-zones","Zona certa.<br>Resultado certo.","Treinar duro ≠ treinar certo.","Zonas","Ciclismo"],
  ["reel-hero-24-streak","14 dias.<br>Sem falhar.","Streaks constroem atletas.","Hábito","Força"],
  ["reel-hero-25-match","O coach<br>certo muda tudo.","12.418 coaches. Um para ti.","Match","Coaching"],
  ["reel-hero-26-morning","30 segundos.<br>Todo o dia.","Morning handshake.","Manhã","Recovery"],
  ["reel-hero-27-data","Os teus dados.<br>As tuas regras.","Exporta. Analisa. Evolui.","Dados","App"],
  ["reel-hero-28-start","Começa<br>agora.","Setup em 2 minutos.","Onboarding","App"],
  ["reel-hero-29-deload","Descansa.<br>Volta mais forte.","Deload não é fraqueza.","Deload","Recovery"],
  ["reel-hero-30-breathe","Respira.<br>Performa.","5 minutos. HRV sobe.","Respiração","Recovery"]
].map(([id,phrase,sub,sport],i)=>({id,phrase,sub,sport,hue:HUES[i%HUES.length]}));

function reelFrameHtml(reel, phase) {
  const scale = 0.92 + phase * 0.08, opacity = Math.min(1, phase * 2.2), y = 40 - phase * 40;
  return wrap(`<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${C.ink}">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse 90% 50% at 50% ${20+phase*30}%, ${reel.hue}33, transparent 55%),linear-gradient(180deg,#050607,#0a0c12,#050607)"></div>
    <div style="position:absolute;left:50%;top:42%;width:${400+phase*200}px;height:${400+phase*200}px;margin-left:-${200+phase*100}px;margin-top:-${200+phase*100}px;border-radius:50%;border:2px solid ${reel.hue};opacity:${0.35-phase*0.2}"></div>
    <div style="position:relative;z-index:2;height:100%;padding:80px 64px;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;justify-content:space-between">${logoFull(52)}<span class="pill" style="font-size:14px;padding:8px 14px">${reel.sport}</span></div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;transform:translateY(${y}px) scale(${scale});opacity:${opacity}">
        <div style="margin-bottom:28px">${logoMark(96)}</div>
        <h1 class="display" style="font-size:84px;font-weight:700;line-height:1.02;white-space:pre-line;text-shadow:0 0 60px ${reel.hue}55">${reel.phrase}</h1>
        <p style="margin-top:28px;font-size:26px;color:${C.ink200}">${reel.sub}</p></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:40px">
        <span style="font-size:18px;color:${C.ink400}">@fitconnectsports</span>
        <span class="cta" style="background:${reel.hue}">Liga. Treina. Perform.</span></div></div></div>`,1080,1920);
}

async function shot(browser, html, out, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  await page.screenshot({ path: out, type: "png", clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
}

function makeMp4(id, frameDir, out) {
  const frames = fs.readdirSync(frameDir).filter(f=>f.endsWith(".png")).sort();
  const list = path.join(frameDir,"frames.txt");
  const lines = frames.flatMap((f,i)=>[`file '${path.join(frameDir,f)}'`,`duration ${i===frames.length-1?1.2:0.35}`]);
  lines.push(`file '${path.join(frameDir,frames[frames.length-1])}'`);
  fs.writeFileSync(list, lines.join("\n"));
  const r = spawnSync("ffmpeg",["-y","-f","concat","-safe","0","-i",list,"-vf","fps=30,format=yuv420p","-c:v","libx264","-pix_fmt","yuv420p","-movflags","+faststart",out],{encoding:"utf8"});
  if(r.status) throw new Error(r.stderr?.slice(-300));
}

async function main() {
  console.log("FitConnect Batch v3 — +12 de cada tipo\n");
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox","--disable-dev-shm-usage"] });
  try {
    if (only === "all" || only === "mockups") {
      console.log("── 12 Mockups ──");
      for (const [i,m] of MOCKUPS_V3.entries()) {
        const out = path.join(PACK,"Mockups",m.file);
        await shot(browser,m.html,out,1080,1080);
        fs.copyFileSync(out,path.join(PACK,"Carousels/15-app-features-v3",`${String(i+1).padStart(2,"0")}-${m.file}`));
        fs.copyFileSync(out,path.join(PACK,"Posts",m.file));
        console.log(`  ✓ ${m.file}`);
      }
    }
    if (only === "all" || only === "posts") {
      console.log("── 12 Educativos ──");
      for (const [i,e] of EDU_V3.entries()) {
        const out = path.join(PACK,"Educational",e.file);
        await shot(browser,e.html,out,1080,1080);
        fs.copyFileSync(out,path.join(PACK,"Carousels/16-educational-v4",`${String(i+1).padStart(2,"0")}-${e.file}`));
        console.log(`  ✓ ${e.file}`);
      }
      console.log("── 12 Abstratos ──");
      for (const [i,a] of ABSTRACT_V3.entries()) {
        const out = path.join(PACK,"Abstract",a.file);
        await shot(browser,a.html,out,1080,1080);
        fs.copyFileSync(out,path.join(PACK,"Carousels/17-abstract-v3",`${String(i+1).padStart(2,"0")}-${a.file}`));
        fs.copyFileSync(out,path.join(PACK,"Posts",a.file));
        console.log(`  ✓ ${a.file}`);
      }
      console.log("── 12 Features ──");
      for (const f of FEATURES_V3) {
        await shot(browser,f.html,path.join(PACK,"Posts",f.file),1080,1080);
        console.log(`  ✓ ${f.file}`);
      }
    }
    if (only === "all" || only === "reels") {
      console.log("── 12 Reels ──");
      const reelsOut = path.join(PACK,"Reels/Animated");
      for (const reel of REELS_V3) {
        const frameDir = path.join(TMP,reel.id);
        fs.mkdirSync(frameDir,{recursive:true});
        for (let i=0;i<16;i++) await shot(browser,reelFrameHtml(reel,i/15),path.join(frameDir,`f${String(i).padStart(3,"0")}.png`),1080,1920);
        const cover = path.join(frameDir,"f008.png");
        fs.copyFileSync(cover,path.join(PACK,"Reels",`${reel.id}-cover.png`));
        fs.copyFileSync(cover,path.join(reelsOut,`${reel.id}-cover.png`));
        makeMp4(reel.id,frameDir,path.join(reelsOut,`${reel.id}.mp4`));
        console.log(`  ✓ ${reel.id}.mp4`);
      }
    }
  } finally { await browser.close(); }

  const m = fs.existsSync(path.join(PACK,"MANIFEST.json"))?JSON.parse(fs.readFileSync(path.join(PACK,"MANIFEST.json"),"utf8")):{};
  m.batchV3 = { mockups:12, educational:12, abstract:12, features:12, reels:12, generatedAt:new Date().toISOString().slice(0,10) };
  fs.writeFileSync(path.join(PACK,"MANIFEST.json"),JSON.stringify(m,null,2));
  console.log("\n✅ Batch v3 completo: +60 assets (12×5 tipos)");
}

main().catch(e=>{console.error(e);process.exit(1);});
