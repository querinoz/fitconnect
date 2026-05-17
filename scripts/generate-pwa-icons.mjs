import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const OUT = path.resolve("public/icons");
fs.mkdirSync(OUT, { recursive: true });

function svg({ size, padded }) {
  const cx = size / 2;
  const cy = size / 2;
  const fit = padded ? 0.72 : 1;
  const ringR = Math.max(((size / 2) * fit) / 2.25, size * 0.18);
  const strokeWidth = Math.max(2, Math.round(size * 0.04));
  const checkStroke = Math.max(3, Math.round(size * 0.055));

  const p1 = { x: cx - ringR * 0.45, y: cy + ringR * 0.05 };
  const p2 = { x: cx - ringR * 0.08, y: cy + ringR * 0.42 };
  const p3 = { x: cx + ringR * 0.55, y: cy - ringR * 0.38 };

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#15171B"/>
      <stop offset="100%" stop-color="#07080A"/>
    </radialGradient>
    <linearGradient id="lime" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DAFE7E"/>
      <stop offset="100%" stop-color="#9CD81A"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="url(#lime)" stroke-width="${strokeWidth}"/>
  <path d="M${p1.x} ${p1.y} L${p2.x} ${p2.y} L${p3.x} ${p3.y}"
        stroke="url(#lime)"
        stroke-width="${checkStroke}"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, padded: false },
  { name: "icon-512.png", size: 512, padded: false },
  { name: "icon-maskable-192.png", size: 192, padded: true },
  { name: "icon-maskable-512.png", size: 512, padded: true }
];

for (const t of targets) {
  await sharp(Buffer.from(svg(t))).png().toFile(path.join(OUT, t.name));
  console.log("wrote", t.name);
}
