#!/usr/bin/env node
/**
 * generate-kotlin-tokens.mjs -- Elite Surface (ADR-007) token generator.
 *
 * Emits dependency-free Kotlin token objects for native Android from
 * packages/design-tokens (colors, spacing, radius, type, motion, semantic).
 *
 * Usage:
 *   node scripts/generate-kotlin-tokens.mjs
 *   node scripts/generate-kotlin-tokens.mjs --check
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOKENS_DIR = path.join(ROOT, "packages", "design-tokens");
const OUTPUT = path.join(
  ROOT,
  "android",
  "design",
  "src",
  "main",
  "kotlin",
  "com",
  "fitconnect",
  "android",
  "design",
  "EliteSurfaceTokens.kt",
);

function fail(message) {
  console.error(`[tokens:kotlin] ERROR: ${message}`);
  process.exit(1);
}

function toConstName(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([a-zA-Z])(\d)/g, "$1_$2")
    .toUpperCase();
}

function pascalFromSnake(snake) {
  return snake
    .toLowerCase()
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function toArgbHex(value, key) {
  if (value.startsWith("#")) {
    let hex = value.slice(1).toLowerCase();
    if (!/^[0-9a-f]+$/.test(hex)) fail(`invalid hex "${value}" for token "${key}"`);
    if (hex.length === 3 || hex.length === 4) {
      hex = [...hex].map((c) => c + c).join("");
    }
    if (hex.length === 6) return `FF${hex.toUpperCase()}`;
    if (hex.length === 8) {
      return (hex.slice(6, 8) + hex.slice(0, 6)).toUpperCase();
    }
    fail(`unsupported hex length in "${value}" for token "${key}"`);
  }

  const rgba = value.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)$/,
  );
  if (rgba) {
    const [, r, g, b, a] = rgba;
    const alpha = a === undefined ? 255 : Math.round(parseFloat(a) * 255);
    const channels = [alpha, Number(r), Number(g), Number(b)];
    if (channels.some((c) => !Number.isFinite(c) || c < 0 || c > 255)) {
      fail(`channel out of range in "${value}" for token "${key}"`);
    }
    return channels
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }

  fail(`cannot convert value "${value}" for token "${key}" to ARGB`);
}

function parseSimpleObject(tsSource, exportName) {
  const re = new RegExp(
    `export const ${exportName} = \\{([\\s\\S]*?)\\}\\s*as const;`,
  );
  const objectMatch = tsSource.match(re);
  if (!objectMatch) fail(`could not locate ${exportName}`);
  const entries = [];
  for (const rawLine of objectMatch[1].split("\n")) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("//") || line.startsWith("/*")) continue;
    const num = line.match(/^([A-Za-z_$][\w$]*)\s*:\s*(-?[\d.]+)\s*,?$/);
    if (num) {
      entries.push([num[1], Number(num[2])]);
      continue;
    }
    const str = line.match(/^([A-Za-z_$][\w$]*)\s*:\s*"([^"]+)"\s*,?$/);
    if (str) {
      entries.push([str[1], str[2]]);
      continue;
    }
    fail(`unparseable ${exportName} line: "${line}"`);
  }
  if (entries.length === 0) fail(`parsed zero tokens from ${exportName}`);
  return entries;
}

function parseTypeTokens(tsSource) {
  const objectMatch = tsSource.match(
    /export const TYPE_TOKENS = \{([\s\S]*?)\}\s*as const;/,
  );
  if (!objectMatch) fail("could not locate TYPE_TOKENS");
  const entries = [];
  const blockRe =
    /([A-Za-z_$][\w$]*)\s*:\s*\{\s*size:\s*([\d.]+)\s*,\s*lineHeight:\s*([\d.]+)\s*,\s*weight:\s*(\d+)\s*,\s*tracking:\s*(-?[\d.]+)\s*,\s*family:\s*"([^"]+)"\s*\}\s*,?/g;
  let m;
  while ((m = blockRe.exec(objectMatch[1])) !== null) {
    entries.push({
      key: m[1],
      size: Number(m[2]),
      lineHeight: Number(m[3]),
      weight: Number(m[4]),
      tracking: Number(m[5]),
      family: m[6],
    });
  }
  if (entries.length === 0) fail("parsed zero TYPE_TOKENS");
  return entries;
}

function parseMotion(tsSource) {
  const micro = tsSource.match(/micro:\s*([\d.]+)/);
  const ui = tsSource.match(/ui:\s*([\d.]+)/);
  const screen = tsSource.match(/screen:\s*([\d.]+)/);
  const data = tsSource.match(/data:\s*([\d.]+)/);
  if (!micro || !ui || !screen || !data) fail("could not parse MOTION_TOKENS durations");
  return {
    microMs: Math.round(Number(micro[1]) * 1000),
    uiMs: Math.round(Number(ui[1]) * 1000),
    screenMs: Math.round(Number(screen[1]) * 1000),
    dataMs: Math.round(Number(data[1]) * 1000),
  };
}

function generateKotlin() {
  const indexTs = fs.readFileSync(path.join(TOKENS_DIR, "index.ts"), "utf8");
  const layoutTs = fs.readFileSync(path.join(TOKENS_DIR, "layout.ts"), "utf8");
  const typeTs = fs.readFileSync(path.join(TOKENS_DIR, "typography.ts"), "utf8");
  const semanticTs = fs.readFileSync(path.join(TOKENS_DIR, "semantic.ts"), "utf8");
  const motionTs = fs.readFileSync(path.join(TOKENS_DIR, "motion.ts"), "utf8");

  const colors = parseSimpleObject(indexTs, "COLOR_TOKENS");
  const colorArgb = new Map(
    colors.map(([key, value]) => [key, toArgbHex(value, key)]),
  );
  const resolveRef = (ref, label) => {
    const argb = colorArgb.get(ref);
    if (!argb) fail(`${label} references unknown colour "${ref}"`);
    return argb;
  };

  const colorConsts = [...colorArgb.entries()]
    .map(([key, argb]) => ({ name: toConstName(key), argb }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const spacing = parseSimpleObject(layoutTs, "SPACING_TOKENS");
  const radius = parseSimpleObject(layoutTs, "RADIUS_TOKENS");
  const elevation = parseSimpleObject(layoutTs, "ELEVATION_TOKENS");
  const opacity = parseSimpleObject(layoutTs, "OPACITY_TOKENS");
  const border = parseSimpleObject(layoutTs, "BORDER_TOKENS");
  const glass = parseSimpleObject(layoutTs, "GLASS_TOKENS");
  const atmosphere = parseSimpleObject(layoutTs, "ATMOSPHERE_TOKENS");
  const instrument = parseSimpleObject(layoutTs, "INSTRUMENT_TOKENS");
  const type = parseTypeTokens(typeTs);
  const semantic = parseSimpleObject(semanticTs, "SEMANTIC_TOKENS");
  const charts = parseSimpleObject(semanticTs, "CHART_TOKENS");
  const motion = parseMotion(motionTs);

  const lines = [
    "// GENERATED by scripts/generate-kotlin-tokens.mjs -- do not edit. Run: pnpm tokens:kotlin",
    "package com.fitconnect.android.design",
    "",
    "/**",
    " * Elite Surface tokens (ADR-007) -- single source mirrored from",
    " * packages/design-tokens. Mapping to Compose Color/Dp/TextStyle happens in :design-ui.",
    " */",
    "object EliteSurfaceColors {",
    ...colorConsts.map((c) => `    const val ${c.name}: Long = 0x${c.argb}L`),
    "}",
    "",
    "object EliteSurfaceSpacing {",
    ...spacing.map(
      ([k, v]) => `    const val ${toConstName(k)}: Int = ${Math.round(v)}`,
    ),
    "}",
    "",
    "object EliteSurfaceRadius {",
    ...radius.map(
      ([k, v]) => `    const val ${toConstName(k)}: Int = ${Math.round(v)}`,
    ),
    "}",
    "",
    "object EliteSurfaceElevation {",
    ...elevation.map(
      ([k, v]) => `    const val ${toConstName(k)}: Int = ${Math.round(v)}`,
    ),
    "}",
    "",
    "object EliteSurfaceOpacity {",
    ...opacity.map(([k, v]) => `    const val ${toConstName(k)}: Float = ${v}f`),
    "}",
    "",
    "object EliteSurfaceBorder {",
    ...border.map(([k, v]) => `    const val ${toConstName(k)}: Float = ${v}f`),
    "}",
    "",
    "object EliteSurfaceGlass {",
    ...glass.map(([k, v]) =>
      Number.isInteger(v)
        ? `    const val ${toConstName(k)}: Int = ${Math.round(v)}`
        : `    const val ${toConstName(k)}: Float = ${v}f`,
    ),
    "}",
    "",
    "object EliteSurfaceAtmosphere {",
    ...atmosphere.map(([k, v]) =>
      Number.isInteger(v)
        ? `    const val ${toConstName(k)}: Int = ${Math.round(v)}`
        : `    const val ${toConstName(k)}: Float = ${v}f`,
    ),
    "}",
    "",
    "object EliteSurfaceInstrument {",
    ...instrument.map(([k, v]) =>
      Number.isInteger(v)
        ? `    const val ${toConstName(k)}: Int = ${Math.round(v)}`
        : `    const val ${toConstName(k)}: Float = ${v}f`,
    ),
    "}",
    "",
    "object EliteSurfaceMotion {",
    `    const val MICRO_MS: Int = ${motion.microMs}`,
    `    const val UI_MS: Int = ${motion.uiMs}`,
    `    const val SCREEN_MS: Int = ${motion.screenMs}`,
    `    const val DATA_MS: Int = ${motion.dataMs}`,
    "}",
    "",
    "object EliteSurfaceType {",
  ];

  for (const t of type) {
    const n = toConstName(t.key);
    lines.push(`    const val ${n}_SIZE_SP: Float = ${t.size}f`);
    lines.push(`    const val ${n}_LINE_HEIGHT_SP: Float = ${t.lineHeight}f`);
    lines.push(`    const val ${n}_WEIGHT: Int = ${t.weight}`);
    lines.push(`    const val ${n}_TRACKING: Float = ${t.tracking}f`);
    lines.push(`    const val ${n}_FAMILY: String = "${t.family}"`);
  }
  lines.push("}", "");

  lines.push("object EliteSurfaceSemantic {");
  for (const [k, ref] of semantic) {
    lines.push(
      `    const val ${toConstName(k)}: Long = 0x${resolveRef(ref, "SEMANTIC")}L`,
    );
  }
  lines.push("}", "");

  lines.push("object EliteSurfaceCharts {");
  for (const [k, ref] of charts) {
    lines.push(
      `    const val ${toConstName(k)}: Long = 0x${resolveRef(ref, "CHART")}L`,
    );
  }
  lines.push("}", "");

  return lines.join("\n");
}

const checkMode = process.argv.includes("--check");
const generated = generateKotlin();

if (checkMode) {
  if (!fs.existsSync(OUTPUT)) {
    fail(`${path.relative(ROOT, OUTPUT)} missing -- run: pnpm tokens:kotlin`);
  }
  const onDisk = fs.readFileSync(OUTPUT, "utf8").replace(/\r\n/g, "\n");
  if (onDisk !== generated) {
    fail(
      `${path.relative(ROOT, OUTPUT)} is out of date with packages/design-tokens -- run: pnpm tokens:kotlin`,
    );
  }
  console.log("[tokens:kotlin] check OK -- EliteSurfaceTokens.kt is in sync");
} else {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, generated, "utf8");
  console.log(
    `[tokens:kotlin] wrote ${path.relative(ROOT, OUTPUT)} (${generated.split("\n").length - 1} lines)`,
  );
}
