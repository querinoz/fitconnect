/**
 * FitConnect Instagram compositor — official logo, watermark, EOS tokens.
 * Uses real QA emulator captures for premium app mockups.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");

export const TOKENS = {
  floor: "#070B14",
  surface: "#0E1420",
  ink: "#E8EDF4",
  soft: "#A7B4C4",
  mute: "#6C7A8C",
  voltline: "#C8FF00",
  line: "#233046"
};

export const FEED = { w: 1080, h: 1440 };
export const FEED_SAFE = { w: 1012, h: 1350, padX: 34, padY: 45 };
export const REEL = { w: 1080, h: 1920 };
export const REEL_SAFE = { top: 480, bottom: 1440 };

const LOGO_MARK = path.join(ROOT, "apps/web/public/brand/fitconnect-logo-256.png");
const LOGO_MASTER = path.join(ROOT, "apps/web/public/brand/fitconnect-logo-master.png");

export function qa(rel) {
  return path.join(ROOT, rel.replace(/^\//, ""));
}

async function loadLogo(width) {
  const src = fs.existsSync(LOGO_MASTER) ? LOGO_MASTER : LOGO_MARK;
  return sharp(src).resize(width).png().toBuffer();
}

/** Corner watermark + footer bar with official logo + @fitconnectsports */
export async function brandOverlay(inputBuffer, { format = "feed" } = {}) {
  const { w, h } = format === "reel" ? REEL : FEED;
  const base = await sharp(inputBuffer)
    .resize(w, h, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const markW = Math.round(w * 0.11);
  const mark = await loadLogo(markW);
  const footerLogo = await loadLogo(72);

  const footerSvg = `
    <svg width="${w}" height="120" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="120" fill="${TOKENS.floor}" fill-opacity="0.92"/>
      <text x="110" y="52" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700" fill="${TOKENS.ink}">FitConnect</text>
      <text x="110" y="82" font-family="monospace" font-size="20" fill="${TOKENS.mute}">@fitconnectsports</text>
      <text x="110" y="108" font-family="monospace" font-size="16" fill="${TOKENS.soft}">Connect. Train. Perform.</text>
    </svg>`;

  const composites = [
    { input: mark, top: 36, left: w - markW - 36, blend: "over", opacity: 0.22 },
    { input: Buffer.from(footerSvg), top: h - 120, left: 0 },
    { input: footerLogo, top: h - 104, left: 28 }
  ];

  return sharp(base).composite(composites).png().toBuffer();
}

/** Phone mockup with real screenshot inside */
export async function phoneMockup(screenshotPath, { phoneW = 520 } = {}) {
  const phoneH = Math.round(phoneW * 2.05);
  const screen = await sharp(screenshotPath)
    .resize(phoneW - 28, phoneH - 56, { fit: "cover", position: "top" })
    .png()
    .toBuffer();

  const frameSvg = `
    <svg width="${phoneW}" height="${phoneH}" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="${phoneW - 8}" height="${phoneH - 8}" rx="48" fill="${TOKENS.surface}" stroke="${TOKENS.line}" stroke-width="3"/>
      <rect x="14" y="14" width="${phoneW - 28}" height="${phoneH - 28}" rx="40" fill="#000"/>
      <rect x="${phoneW / 2 - 50}" y="22" width="100" height="8" rx="4" fill="${TOKENS.line}"/>
    </svg>`;

  return sharp(Buffer.from(frameSvg))
    .composite([{ input: screen, top: 28, left: 14 }])
    .png()
    .toBuffer();
}

export async function slideWithPhone({
  screenshot,
  eyebrow,
  title,
  body,
  format = "feed"
}) {
  const { w, h } = format === "reel" ? REEL : FEED;
  const phone = await phoneMockup(screenshot, { phoneW: format === "reel" ? 480 : 440 });

  const textSvg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" fill="${TOKENS.floor}"/>
      <line x1="90" y1="130" x2="${w - 90}" y2="130" stroke="${TOKENS.line}" stroke-width="1"/>
      <text x="90" y="108" font-family="monospace" font-size="22" font-weight="600" letter-spacing="3" fill="${TOKENS.voltline}">${esc(eyebrow)}</text>
      <text x="90" y="220" font-family="Arial,Helvetica,sans-serif" font-size="64" font-weight="800" fill="${TOKENS.ink}">${esc(title)}</text>
      ${body ? `<text x="90" y="${h - 200}" font-family="Arial,Helvetica,sans-serif" font-size="34" fill="${TOKENS.soft}">${esc(body)}</text>` : ""}
    </svg>`;

  const phoneMeta = await sharp(phone).metadata();
  const top = format === "reel" ? 340 : 280;
  const left = Math.round((w - phoneMeta.width) / 2);

  const composed = await sharp(Buffer.from(textSvg))
    .composite([{ input: phone, top, left }])
    .png()
    .toBuffer();

  return brandOverlay(composed, { format });
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function gridFeedSlide({
  row,
  col,
  eyebrow,
  headline,
  sub,
  screenshot = null,
  rowTheme = "brand"
}) {
  const { w, h } = FEED;
  const themes = {
    brand: { accent: TOKENS.voltline, band: "#0A1018" },
    problem: { accent: "#FF3A5C", band: "#120A0E" },
    solution: { accent: TOKENS.voltline, band: "#0C1218" },
    feature: { accent: "#3CD7FF", band: "#081018" },
    train: { accent: "#00E090", band: "#081410" },
    coach: { accent: "#6C63FF", band: "#0C0A14" },
    social: { accent: "#00DDB4", band: "#081210" },
    cta: { accent: TOKENS.voltline, band: "#101408" }
  };
  const t = themes[rowTheme] ?? themes.brand;
  const colLabel = `${col}/4`;

  const bandSvg = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${TOKENS.floor}"/>
    <rect width="${w}" height="8" fill="${t.accent}" fill-opacity="0.85"/>
    <rect x="0" y="8" width="${w}" height="112" fill="${t.band}"/>
    <text x="90" y="52" font-family="monospace" font-size="18" fill="${t.accent}" opacity="0.9">LINHA ${row} · ${colLabel}</text>
    <text x="90" y="88" font-family="monospace" font-size="22" font-weight="600" letter-spacing="3" fill="${TOKENS.voltline}">${esc(eyebrow)}</text>
    <line x1="90" y1="108" x2="${w - 90}" y2="108" stroke="${TOKENS.line}" stroke-width="1"/>
    <text x="90" y="${screenshot ? 200 : 420}" font-family="Arial,Helvetica,sans-serif" font-size="64" font-weight="800" fill="${TOKENS.ink}">${esc(headline)}</text>
    ${sub ? `<text x="90" y="${screenshot ? 280 : 500}" font-family="Arial" font-size="34" fill="${TOKENS.soft}">${esc(sub)}</text>` : ""}
  </svg>`);

  const layers = [{ input: bandSvg, top: 0, left: 0 }];

  if (screenshot && fs.existsSync(screenshot)) {
    const phone = await phoneMockup(screenshot, { phoneW: 460 });
    const meta = await sharp(phone).metadata();
    layers.push({ input: phone, top: 320, left: Math.round((w - meta.width) / 2) });
  }

  const composed = await sharp({
    create: { width: w, height: h, channels: 4, background: TOKENS.floor }
  })
    .composite(layers)
    .png()
    .toBuffer();

  return brandOverlay(composed);
}

export async function writePng(dest, buffer) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(buffer).png({ compressionLevel: 9 }).toFile(dest);
  const publicDest = dest.replace(
    path.join(ROOT, "content/instagram"),
    path.join(ROOT, "apps/web/public/instagram")
  );
  if (publicDest !== dest) {
    fs.mkdirSync(path.dirname(publicDest), { recursive: true });
    fs.copyFileSync(dest, publicDest);
  }
}
