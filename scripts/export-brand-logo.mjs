/**
 * Export FitConnect brand PNGs from master SVG.
 * Usage: node scripts/export-brand-logo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const BRAND_DIR = path.resolve("apps/web/public/brand");
const MARK_SVG = path.join(BRAND_DIR, "fitconnect-logo-mark.svg");
const MASTER_SVG = path.join(BRAND_DIR, "fitconnect-logo.svg");
const ASPECT = 340 / 320;

async function renderSvg(svgPath, width) {
  const height = Math.round(width * ASPECT);
  const density = Math.ceil((width / 320) * 96);
  return sharp(svgPath, { density })
    .resize(width, height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ compressionLevel: 9, quality: 100 });
}

async function exportSizes() {
  fs.mkdirSync(BRAND_DIR, { recursive: true });

  const masterPath = path.join(BRAND_DIR, "fitconnect-logo.png");
  await (await renderSvg(MARK_SVG, 1024)).toFile(masterPath);
  await (await renderSvg(MASTER_SVG, 1024)).toFile(path.join(BRAND_DIR, "fitconnect-logo-master.png"));

  const sizes = [
    { name: "fitconnect-logo-1024.png", size: 1024 },
    { name: "fitconnect-logo-512.png", size: 512 },
    { name: "fitconnect-logo-256.png", size: 256 },
    { name: "fitconnect-logo-192.png", size: 192 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "logo.png", size: 256 }
  ];

  for (const { name, size } of sizes) {
    const dest =
      name === "logo.png"
        ? path.join(BRAND_DIR, "logo.png")
        : path.join(BRAND_DIR, name);
    await (await renderSvg(MARK_SVG, size)).toFile(dest);
  }

  await sharp(path.join(BRAND_DIR, "apple-touch-icon.png")).toFile(
    path.resolve("apps/web/public/apple-touch-icon.png")
  );

  const mobileDir = path.resolve("apps/mobile/assets/brand");
  fs.mkdirSync(mobileDir, { recursive: true });
  await (await renderSvg(MARK_SVG, 512)).toFile(path.join(mobileDir, "logo.png"));

  console.log("Brand assets exported to", BRAND_DIR);
}

await exportSizes();
