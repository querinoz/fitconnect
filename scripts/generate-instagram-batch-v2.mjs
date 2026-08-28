#!/usr/bin/env node
/**
 * FitConnect — Batch v2: +12 mockups, +12 educativos, +12 abstratos, +12 features, +12 reels
 * Mesmo padrão v3.1: logo oficial + LogoMark + PT
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const ROOT = "/workspace";
const PACK = path.join(ROOT, "public/instagram-pack");
const BRAND_DIR = path.join(ROOT, "public/brand");
const TMP = "/tmp/ig-render-v2";

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
  "Carousels/12-app-features-v2",
  "Carousels/13-educational-v3",
  "Carousels/14-abstract-v2"
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

const MOCKUPS_V2 = [
  mkMockup(15, "live-session", "Sessão ao vivo", "Treino em tempo real.<br>Coach a ver.", "Sessão", "home",
    `<div class="card" style="margin-bottom:12px;border-color:${C.volt}"><div style="font-size:10px;color:${C.volt}">● AO VIVO</div>
    <div class="display" style="font-size:24px;font-weight:700">Corrida intervalada</div><div style="font-size:11px;color:${C.ink400}">Zona 4 · 8×400m</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
    ${[["142", "bpm"], ["4:12", "/km"], ["2.4", "km"], ["18:40", "tempo"]].map(([v,l])=>`<div class="card" style="text-align:center;padding:10px"><div class="display" style="font-size:22px;font-weight:700;color:${C.volt}">${v}</div><div style="font-size:9px;color:${C.ink400}">${l}</div></div>`).join("")}</div>
    <div class="card"><div style="font-size:11px;font-weight:700;margin-bottom:6px">Coach Ana está a ver</div><div style="font-size:10px;color:${C.ink200}">"Mantém o ritmo — última rep!"</div></div>`),
  mkMockup(16, "weekly-calendar", "Calendário", "A tua semana<br>num relance.", "Calendário", "home",
    `<div style="display:flex;gap:4px;margin-bottom:12px">${["S","T","Q","Q","S","S","D"].map((d,i)=>`<div style="flex:1;text-align:center;padding:8px 4px;border-radius:10px;${i===2?"background:rgba(199,251,58,.15);border:1px solid "+C.volt:"background:#1a1d24"}"><div style="font-size:9px;color:${C.ink400}">${d}</div><div style="font-size:11px;font-weight:700;margin-top:4px">${10+i}</div></div>`).join("")}</div>
    ${[["Força", "60 min · Z3"],["Corrida", "45 min · Z2"],["Yoga", "30 min · recovery"],["Descanso", "—"]].map(([t,s])=>`<div class="card" style="margin-bottom:8px;display:flex;justify-content:space-between"><span style="font-size:12px;font-weight:600">${t}</span><span style="font-size:10px;color:${C.ink400}">${s}</span></div>`).join("")}`),
  mkMockup(17, "sleep-analysis", "Análise de sono", "Sono × HRV<br>= readiness.", "Sono", "profile",
    `<div class="card" style="margin-bottom:12px"><div style="font-size:10px;color:${C.ink400}">Última noite</div>
    <div class="display" style="font-size:36px;font-weight:700">7h 24m</div><div class="bar" style="margin-top:8px"><i style="width:82%"></i></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    ${[["Profundo","1h 48m"],["REM","1h 52m"],["HRV","68 ms"],["Score","82"]].map(([l,v])=>`<div class="card"><div style="font-size:9px;color:${C.ink400}">${l}</div><div style="font-size:16px;font-weight:700;color:${C.volt}">${v}</div></div>`).join("")}</div>`),
  mkMockup(18, "wearos-sync", "WearOS", "Relógio + telemóvel<br>sync total.", "WearOS", "home",
    `<div style="text-align:center;margin-bottom:16px">${logoMark(48)}<div style="font-size:11px;color:${C.volt};margin-top:8px">● Sincronizado</div></div>
    ${[["Passos","8.420"],["FC média","128"],["Calorias","640"],["SpO2","98%"]].map(([l,v])=>`<div style="display:flex;justify-content:space-between;padding:10px 4px;border-bottom:1px solid #1a1d24"><span style="font-size:12px">${l}</span><span style="font-weight:700;color:${C.volt}">${v}</span></div>`).join("")}`),
  mkMockup(19, "programs-marketplace", "Programas", "Planos de coaches<br>verificados.", "Programas", "search",
    `${[["Plano 5K","Ana Costa","€29"],["Força 12 sem","Diego M.","€49"],["Yoga recovery","Priya N.","€19"]].map(([t,c,p])=>`<div class="card" style="margin-bottom:10px"><div style="font-size:13px;font-weight:700">${t}</div><div style="font-size:10px;color:${C.ink400}">${c}</div><div style="font-size:12px;color:${C.volt};margin-top:4px">${p}/mês</div></div>`).join("")}`),
  mkMockup(20, "coach-chat", "Chat coach", "Mensagens diretas<br>com o teu coach.", "Chat", "home",
    `${[["Coach Ana","Plano ajustado para amanhã","14:32",true],["Tu","HRV baixo hoje, ok?","14:28",false],["Coach Ana","Sim — sessão leve 💚","14:30",false]].map(([f,m,t,u])=>`<div class="card" style="margin-bottom:8px;${u?`border-color:${C.volt}`:""}"><div style="font-size:11px;font-weight:700">${f}</div><div style="font-size:10px;color:${C.ink200}">${m}</div><div style="font-size:9px;color:${C.ink400};margin-top:4px">${t}</div></div>`).join("")}`),
  mkMockup(21, "performance-metrics", "Métricas", "Performance<br>em gráficos.", "Métricas", "profile",
    `<div class="card" style="margin-bottom:12px"><div style="font-size:10px;color:${C.ink400}">Volume semanal</div><div class="display" style="font-size:28px;font-weight:700">42 km</div></div>
    <div style="display:flex;align-items:flex-end;gap:6px;height:100px;margin-bottom:12px">${[40,65,55,80,70,90,60].map((h,i)=>`<div style="flex:1;background:linear-gradient(180deg,${C.volt},${C.voltDark});height:${h}%;border-radius:6px 6px 0 0;opacity:${0.5+i*0.06}"></div>`).join("")}</div>
    <div style="font-size:10px;color:${C.ink400}">+12% vs semana passada</div>`),
  mkMockup(22, "progress-photos", "Progresso", "Antes e depois<br>documentado.", "Progresso", "profile",
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
    <div class="card" style="height:120px;display:flex;align-items:center;justify-content:center;background:#1a1d24"><span style="font-size:11px;color:${C.ink400}">Jan 2026</span></div>
    <div class="card" style="height:120px;display:flex;align-items:center;justify-content:center;border-color:${C.volt}"><span style="font-size:11px;color:${C.volt}">Ago 2026</span></div></div>
    <div class="card"><div style="font-size:12px;font-weight:700">−4,2 kg · +8% força</div><div style="font-size:10px;color:${C.ink400};margin-top:4px">12 semanas de consistência</div></div>`),
  mkMockup(23, "clubs-groups", "Clubes", "A tua tribo<br>desportiva.", "Clubes", "feed",
    `${[["Sub-3 Maratona","1.842 membros"],["Yoga Lisboa","412 membros"],["Escalada Iberia","738 membros"]].map(([n,m])=>`<div class="card" style="margin-bottom:10px;display:flex;gap:10px;align-items:center"><div class="avatar">C</div><div><div style="font-size:12px;font-weight:700">${n}</div><div style="font-size:10px;color:${C.ink400}">${m}</div></div></div>`).join("")}`),
  mkMockup(24, "subscription", "Subscrição", "Pro a partir<br>de €12/mês.", "Plano", "profile",
    `<div class="card" style="margin-bottom:12px;border-color:${C.volt};background:rgba(199,251,58,.08)"><div class="pill" style="margin-bottom:8px">Pro</div>
    <div class="display" style="font-size:32px;font-weight:700">€12<span style="font-size:14px;color:${C.ink400}">/mês</span></div></div>
    ${["Coach ilimitado","AI co-pilot","WearOS sync","Analytics avançado"].map(f=>`<div style="display:flex;gap:8px;align-items:center;padding:8px 0;font-size:11px"><span style="color:${C.volt}">✓</span>${f}</div>`).join("")}`),
  mkMockup(25, "notifications", "Notificações", "Alertas que<br>importam.", "Alertas", "home",
    `${[["Readiness baixo","Sessão ajustada automaticamente","agora"],["Novo PR!","Deadlift 140 kg","2h"],["Coach respondeu","Mantém o plano leve","5h"],["Streak 14 dias","Continua assim!","1d"]].map(([t,m,time])=>`<div class="card" style="margin-bottom:8px"><div style="display:flex;justify-content:space-between"><span style="font-size:12px;font-weight:700">${t}</span><span style="font-size:9px;color:${C.ink400}">${time}</span></div><div style="font-size:10px;color:${C.ink200}">${m}</div></div>`).join("")}`),
  mkMockup(26, "ai-copilot", "AI Co-pilot", "Insights que<br>o coach usa.", "AI", "home",
    `<div class="card" style="margin-bottom:12px;border-color:${C.cyan}"><div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">${logoMark(24)}<span style="font-size:12px;font-weight:700">FitConnect AI</span></div>
    <div style="font-size:11px;color:${C.ink200};line-height:1.4">HRV 15% abaixo da média. Recomendo reduzir intensidade 20% hoje. Coach notificado.</div></div>
    ${[["Risco lesão","Baixo",C.volt],["Carga","Ótima",C.cyan],["Sono","Bom",C.volt]].map(([l,v,col])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1a1d24"><span style="font-size:11px">${l}</span><span style="font-size:11px;font-weight:700;color:${col}">${v}</span></div>`).join("")}`)
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

const EDU_V2 = [
  ["edu-13-hrv-basics.png","Educação · HRV","O que é HRV?",["Variabilidade cardíaca = espaço entre batimentos","Alta HRV = sistema nervoso recuperado","Baixa HRV = stress, sono má ou overtraining","O FitConnect mede e interpreta por ti"]],
  ["edu-14-sleep-performance.png","Educação · Sono","Sono = performance",["7–9h para a maioria dos atletas","Sono profundo repara músculo","REM consolida aprendizagem motora","Correlação sono × HRV no dashboard"]],
  ["edu-15-overtraining.png","Educação · Overtraining","Overtraining em 4 sinais",["HRV em queda persistente","Fadiga que não passa com 1 dia off","Performance estagnada ou a descer","O AI co-pilot alerta o coach cedo"]],
  ["edu-16-nutrition.png","Educação · Nutrição","Nutrição para atletas",["Proteína: 1,6–2,2 g/kg para recovery","Hidratação afeta HRV e performance","Carbs antes de sessões intensas","Coach vê padrões — tu decides"]],
  ["edu-17-smart-goals.png","Educação · Metas","Metas SMART no desporto",["Específica: \"correr 5K em 25 min\"","Mensurável: tempo, distância, carga","Atingível com o teu nível atual","O FitConnect trackeia o progresso"]],
  ["edu-18-taper.png","Educação · Taper","Taper antes da prova",["Reduz volume 40–60% na última semana","Mantém intensidade curta","Confia no trabalho feito","Readiness no pico no dia da prova"]],
  ["edu-19-cross-training.png","Educação · Cross","Cross-training inteligente",["Modalidade diferente = recovery ativo","Força protege articulações","Mobilidade previne lesões","Perfil multi-desporto no FitConnect"]],
  ["edu-20-mobility.png","Educação · Mobilidade","Mobilidade diária",["10 min/dia > 1h no domingo","Foco em ancas, ombros, tornozelos","Antes do treino: dinâmico","Depois: estático + respiração"]],
  ["edu-21-pr-tracking.png","Educação · PRs","Tracking de PRs",["Regista marcos — motivação real","Compara ao longo do tempo","Partilha no feed da comunidade","Coach celebra contigo"]],
  ["edu-22-why-coach.png","Educação · Coach","Porquê ter um coach?",["Accountability — apareces","Plano personalizado ao teu corpo","Ajustes em tempo real via HRV","12.418 coaches no FitConnect"]],
  ["edu-23-rpe.png","Educação · RPE","RPE: esforço percebido",["Escala 1–10 após cada sessão","Complementa dados de FC e HRV","Honestidade > números bonitos","Coach usa para calibrar carga"]],
  ["edu-24-breathing.png","Educação · Respiração","Respiração e HRV",["Exercícios de 5 min aumentam HRV","Útil antes de competição","Box breathing: 4-4-4-4","Integrado no morning handshake"]]
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

const ABSTRACT_V2 = [
  ["abstract-06-data-decisions.png","Dados →<br>decisões.","Sem achismo. Só sinais.","grid"],
  ["abstract-07-smart-training.png","Treino<br>inteligente.","Não mais difícil. Mais certo.","pulse"],
  ["abstract-08-one-ecosystem.png","Um<br>ecossistema.","Atleta. Coach. Dados. App.","rings"],
  ["abstract-09-energy-focus.png","Energia +<br>foco.","O que importa, quando importa.","bars"],
  ["abstract-10-unique-athlete.png","Cada atleta<br>é único.","O plano também devia ser.","rings"],
  ["abstract-11-sustainable.png","Performance<br>sustentável.","Anos de progresso, não semanas.","pulse"],
  ["abstract-12-future-coaching.png","O futuro<br>do coaching.","Humano + AI. Já aqui.","grid"],
  ["abstract-13-green-light.png","Sinal verde<br>= GO.","Readiness alto? Treina forte.","pulse"],
  ["abstract-14-courage-rest.png","Coragem de<br>descansar.","Recovery é estratégia.","bars"],
  ["abstract-15-evolution.png","Evolução<br>constante.","1% melhor. Todo dia.","rings"],
  ["abstract-16-strong-community.png","Comunidade<br>forte.","Sozinho chegas. Em equipa vences.","grid"],
  ["abstract-17-no-limits.png","Sem<br>limites.","Só o próximo passo.","pulse"]
].map(([file,title,line,motif],i)=>({file,html:abstractPost(title,line,motif)}));

function featurePost(eyebrow, title, points) {
  return wrap(`<div style="width:1080px;height:1080px;padding:64px;background:linear-gradient(160deg,#07080A,#12161f,#07080A)">
    <div style="margin-bottom:32px">${logoFull(48)}</div><div class="eyebrow">${eyebrow}</div>
    <h1 class="display" style="font-size:44px;font-weight:700;line-height:1.1;margin:12px 0 24px">${title}</h1>
    <div style="display:grid;gap:12px">${points.map(p=>`<div style="display:flex;gap:12px;align-items:center;padding:16px 18px;border-radius:16px;border:1px solid #2a2f3a;background:rgba(26,29,36,.65)">
      ${logoMark(26)}<div style="font-size:19px">${p}</div></div>`).join("")}</div>
    <div style="margin-top:32px;color:${C.ink400}">#FitConnect #LigaTreinaPerform</div></div>`);
}

const FEATURES_V2 = [
  ["35-feature-live-session.png","App · Sessão","Sessão ao vivo com métricas em tempo real",["FC, ritmo, distância ao vivo","Coach pode ver e comentar","Zonas de treino no ecrã","Histórico guardado automaticamente"]],
  ["36-feature-calendar.png","App · Calendário","Calendário semanal inteligente",["Plano do coach sincronizado","Arrasta para reorganizar","Integra com WearOS","Lembretes antes de cada sessão"]],
  ["37-feature-sleep.png","App · Sono","Análise de sono integrada",["Duração, profundo, REM","Correlação com HRV","Score de readiness matinal","Tendências semanais"]],
  ["38-feature-wearos.png","App · WearOS","Sync total com o relógio",["Métricas no pulso","Sessão ao vivo no WearOS","Notificações de readiness","Bateria otimizada"]],
  ["39-feature-programs.png","App · Programas","Marketplace de programas",["Planos de coaches verificados","5K, força, yoga, recovery","Subscrição mensal flexível","Reviews de atletas reais"]],
  ["40-feature-chat.png","App · Chat","Chat direto com o coach",["Mensagens em tempo real","Partilha de readiness e HRV","Ficheiros e notas de sessão","Histórico pesquisável"]],
  ["41-feature-analytics.png","App · Analytics","Métricas de performance",["Volume, intensidade, carga","Gráficos semanais e mensais","Comparação com objetivos","Export para o coach"]],
  ["42-feature-progress.png","App · Progresso","Antes e depois documentado",["Fotos de progresso","Métricas corporais","PRs ao longo do tempo","Partilha no feed"]],
  ["43-feature-clubs.png","App · Clubes","Clubes e grupos desportivos",["Junta-te a comunidades","Eventos e desafios","Leaderboards internos","Motivação em grupo"]],
  ["44-feature-subscription.png","App · Pro","Subscrição Pro €12/mês",["Coach ilimitado","AI co-pilot completo","Analytics avançado","WearOS + prioridade"]],
  ["45-feature-notifications.png","App · Alertas","Notificações inteligentes",["Readiness baixo → plano ajustado","PRs e milestones","Respostas do coach","Streaks e lembretes"]],
  ["46-feature-ai-copilot.png","App · AI","AI Co-pilot para coach e atleta",["Insights de HRV e carga","Alertas de risco de lesão","Sugestões de sessão","Aprende com o teu histórico"]]
].map(([file,ey,title,points])=>({file,html:featurePost(ey,title,points)}));

const HUES = [C.volt, C.cyan, "#7dd3a3", "#fbbf24", "#a78bfa", C.signal, "#f472b6", "#38bdf8"];
const REELS_V2 = [
  ["reel-hero-07-wakeup","Acordas.\nO plano\njá mudou.","O coach viu o teu HRV.","Manhã","Corrida"],
  ["reel-hero-08-reps","Cada rep\nconta.","Consistência > intensidade ocasional.","Força","Força"],
  ["reel-hero-09-body","O teu corpo\nfala.\nOuve.","HRV não mente.","Recovery","Recovery"],
  ["reel-hero-10-remote","Coach remoto.\nResultado real.","À distância. Com proximidade.","Coaching","Multi-desporto"],
  ["reel-hero-11-pr","PR não é sorte.\nÉ sistema.","Tracking + coach + consistência.","PR","Força"],
  ["reel-hero-12-hard-weeks","Semanas difíceis\nmoldam atletas.","Fica. Adapta. Cresce.","Mindset","Corrida"],
  ["reel-hero-13-sync","Sync.\nSprint.\nRepeat.","Atleta ↔ coach em loop.","Sync","Ciclismo"],
  ["reel-hero-14-tomorrow","Amanhã\ncomeça hoje.","O treino de hoje é o PR de amanhã.","Foco","Corrida"],
  ["reel-hero-15-technique","Técnica >\nvolume.","Menos reps. Mais qualidade.","Técnica","Força"],
  ["reel-hero-16-recovery-pr","Recovery =\nperformance.","Descansar é treinar.","Recovery","Recovery"],
  ["reel-hero-17-one-percent","1% melhor.\nTodo dia.","Compounding no desporto.","Hábito","Multi-desporto"],
  ["reel-hero-18-pocket-gym","O ginásio\ncabe no\nbolso.","FitConnect em todo o lado.","App","Multi-desporto"]
].map(([id,phrase,sub,sport,cat],i)=>({id,phrase,sub,sport,hue:HUES[i%HUES.length]}));

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
  console.log("FitConnect Batch v2 — +12 de cada tipo\n");
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox","--disable-dev-shm-usage"] });
  try {
    if (only === "all" || only === "mockups") {
      console.log("── 12 Mockups ──");
      for (const [i,m] of MOCKUPS_V2.entries()) {
        const out = path.join(PACK,"Mockups",m.file);
        await shot(browser,m.html,out,1080,1080);
        fs.copyFileSync(out,path.join(PACK,"Carousels/12-app-features-v2",`${String(i+1).padStart(2,"0")}-${m.file}`));
        fs.copyFileSync(out,path.join(PACK,"Posts",m.file));
        console.log(`  ✓ ${m.file}`);
      }
    }
    if (only === "all" || only === "posts") {
      console.log("── 12 Educativos ──");
      for (const [i,e] of EDU_V2.entries()) {
        const out = path.join(PACK,"Educational",e.file);
        await shot(browser,e.html,out,1080,1080);
        fs.copyFileSync(out,path.join(PACK,"Carousels/13-educational-v3",`${String(i+1).padStart(2,"0")}-${e.file}`));
        console.log(`  ✓ ${e.file}`);
      }
      console.log("── 12 Abstratos ──");
      for (const [i,a] of ABSTRACT_V2.entries()) {
        const out = path.join(PACK,"Abstract",a.file);
        await shot(browser,a.html,out,1080,1080);
        fs.copyFileSync(out,path.join(PACK,"Carousels/14-abstract-v2",`${String(i+1).padStart(2,"0")}-${a.file}`));
        fs.copyFileSync(out,path.join(PACK,"Posts",a.file));
        console.log(`  ✓ ${a.file}`);
      }
      console.log("── 12 Features ──");
      for (const f of FEATURES_V2) {
        await shot(browser,f.html,path.join(PACK,"Posts",f.file),1080,1080);
        console.log(`  ✓ ${f.file}`);
      }
    }
    if (only === "all" || only === "reels") {
      console.log("── 12 Reels ──");
      const reelsOut = path.join(PACK,"Reels/Animated");
      for (const reel of REELS_V2) {
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
  m.batchV2 = { mockups:12, educational:12, abstract:12, features:12, reels:12, generatedAt:new Date().toISOString().slice(0,10) };
  fs.writeFileSync(path.join(PACK,"MANIFEST.json"),JSON.stringify(m,null,2));
  console.log("\n✅ Batch v2 completo: +60 assets (12×5 tipos)");
}

main().catch(e=>{console.error(e);process.exit(1);});
