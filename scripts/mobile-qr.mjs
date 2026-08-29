#!/usr/bin/env node
import os from "node:os";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

const port = Number(process.env.PORT || 3001);
const targetPath = process.argv[2] || "/mobile";

function localHosts() {
  const hosts = new Set();
  for (const entries of Object.values(os.networkInterfaces())) {
    if (!entries) continue;
    for (const net of entries) {
      if (net.family === "IPv4" && !net.internal) hosts.add(net.address);
    }
  }
  return [...hosts];
}

const hosts = localHosts();
const urls = hosts.map((h) => `http://${h}:${port}${targetPath}`);

if (urls.length === 0) {
  console.log("Nenhum IP LAN encontrado. Usa o Network URL do Next.js no terminal.");
  process.exit(1);
}

const outDir = path.resolve("public/mobile-qr");
mkdirSync(outDir, { recursive: true });

console.log("\nFitConnect Mobile — escaneia no telemóvel (mesma Wi‑Fi):\n");
for (const url of urls) {
  const file = path.join(outDir, `${url.replace(/[^a-z0-9]+/gi, "-")}.png`);
  await QRCode.toFile(file, url, {
    margin: 2,
    width: 512,
    color: { dark: "#C8FF00", light: "#090402" }
  });
  console.log(`  ${url}`);
  console.log(`  QR → ${file}\n`);
}

console.log(`Página web: http://localhost:${port}/mobile/qr\n`);
