/**
 * Recolor official FitConnect logo: cyan/blue → Volt green (#bfee16).
 * Usage: node scripts/recolor-logo.mjs [input.png] [output-dir]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const VOLT = { r: 191, g: 238, b: 22 };

function isBluePixel(r, g, b, a) {
  if (a < 12) return false;
  const max = Math.max(r, g, b);
  if (max < 40) return false;
  // cyan / blue accent pixels
  return b > r + 18 && (b > g + 10 || (g > 90 && b > 90 && r < 120));
}

function toVolt(r, g, b) {
  const lum = Math.min(1, (0.35 * b + 0.45 * g + 0.2 * r) / 255);
  const boost = 0.55 + lum * 0.55;
  return {
    r: Math.round(Math.min(255, VOLT.r * boost)),
    g: Math.round(Math.min(255, VOLT.g * boost)),
    b: Math.round(Math.min(255, VOLT.b * boost + lum * 18))
  };
}

async function recolor(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (!isBluePixel(r, g, b, a)) continue;
    const next = toVolt(r, g, b);
    data[i] = next.r;
    data[i + 1] = next.g;
    data[i + 2] = next.b;
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(outputPath);
}

async function exportSizes(inputPath, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const master = path.join(outDir, "fitconnect-logo.png");
  await recolor(inputPath, master);

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
        ? path.join(outDir, "..", "logo.png")
        : path.join(outDir, name);
    await sharp(master)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(dest);
  }

  await sharp(path.join(outDir, "apple-touch-icon.png")).toFile(
    path.join(outDir, "..", "apple-touch-icon.png")
  );

  // Mobile asset
  const mobileDir = path.resolve("apps/mobile/assets/brand");
  fs.mkdirSync(mobileDir, { recursive: true });
  await sharp(master).resize(512, 512, { fit: "contain", background: { r: 9, g: 4, b: 2, alpha: 1 } }).png().toFile(path.join(mobileDir, "logo.png"));

  console.log("Exported:", outDir);
}

const input =
  process.argv[2] ??
  "C:/Users/duhqu/.cursor/projects/d-fitconnect/assets/c__Users_duhqu_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-7346b706-e80f-4ccf-82a1-cfeb2100e08c.png";
const outDir = process.argv[3] ?? path.resolve("apps/web/public/brand");

await exportSizes(input, outDir);
