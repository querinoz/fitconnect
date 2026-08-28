#!/usr/bin/env node
/**
 * Publish Instagram content via Meta Graph API.
 *
 * Required env:
 *   INSTAGRAM_ACCESS_TOKEN  — long-lived user token with instagram_content_publish
 *   INSTAGRAM_USER_ID       — IG Business account id (not @handle)
 *
 * Usage:
 *   node scripts/instagram/publish.mjs --post post01 [--dry-run]
 *   node scripts/instagram/publish.mjs --all --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFiles, mediaBaseUrl, videoBaseUrl } from "./load-env.mjs";

loadEnvFiles();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CONTENT = path.join(ROOT, "content/instagram");
const GRAPH = "https://graph.facebook.com/v21.0";

function loadManifest() {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, "manifest.json"), "utf8"));
}

function loadCaption(post) {
  const file = path.join(CONTENT, post.captionFile);
  return fs.readFileSync(file, "utf8").trim();
}

function resolveMedia(rel) {
  return path.join(CONTENT, rel);
}

async function graphPost(pathname, body) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) throw new Error("INSTAGRAM_ACCESS_TOKEN missing");
  const params = new URLSearchParams({ ...body, access_token: token });
  const res = await fetch(`${GRAPH}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

async function graphGet(pathname, query = {}) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const qs = new URLSearchParams({ ...query, access_token: token });
  const res = await fetch(`${GRAPH}${pathname}?${qs}`);
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

async function waitForContainer(containerId) {
  for (let i = 0; i < 60; i++) {
    const status = await graphGet(`/${containerId}`, { fields: "status_code" });
    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR") throw new Error(`container error: ${containerId}`);
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error(`timeout waiting for ${containerId}`);
}

async function uploadImage(imagePath) {
  const userId = process.env.INSTAGRAM_USER_ID;
  const filename = path.basename(imagePath);
  const url = `${mediaBaseUrl()}/${filename}`;
  const created = await graphPost(`/${userId}/media`, { image_url: url });
  await waitForContainer(created.id);
  return created.id;
}

async function uploadVideo(videoPath, coverPath, caption) {
  const userId = process.env.INSTAGRAM_USER_ID;
  const videoUrl = `${videoBaseUrl()}/${path.basename(videoPath)}`;
  const coverUrl = `${mediaBaseUrl()}/${path.basename(coverPath)}`;
  const created = await graphPost(`/${userId}/media`, {
    media_type: "REELS",
    video_url: videoUrl,
    cover_url: coverUrl,
    caption,
    share_to_feed: "true"
  });
  await waitForContainer(created.id);
  return created.id;
}

async function publishContainer(containerId) {
  const userId = process.env.INSTAGRAM_USER_ID;
  return graphPost(`/${userId}/media_publish`, { creation_id: containerId });
}

async function publishPost(post, dryRun) {
  const caption = loadCaption(post);
  console.log(`\n=== ${post.id} (${post.type}) ===`);
  console.log(`caption: ${caption.slice(0, 80)}…`);

  if (dryRun) {
    console.log("DRY_RUN — would publish", post.media.length, "media item(s)");
    return { dryRun: true, id: post.id };
  }

  if (post.type === "image") {
    const containerId = await graphPost(`/${process.env.INSTAGRAM_USER_ID}/media`, {
      image_url: `${mediaBaseUrl()}/${path.basename(resolveMedia(post.media[0]))}`,
      caption
    });
    await waitForContainer(containerId.id);
    const published = await publishContainer(containerId.id);
    console.log("published", published.id);
    return published;
  }

  if (post.type === "reel") {
    const video = resolveMedia(post.video);
    const cover = resolveMedia(post.cover ?? post.media[0]);
    const containerId = await uploadVideo(video, cover, caption);
    const published = await publishContainer(containerId);
    console.log("published reel", published.id);
    return published;
  }

  if (post.type === "carousel") {
    const childIds = [];
    for (const rel of post.media) {
      const id = await uploadImage(resolveMedia(rel));
      childIds.push(id);
    }
    const userId = process.env.INSTAGRAM_USER_ID;
    const carousel = await graphPost(`/${userId}/media`, {
      media_type: "CAROUSEL",
      children: childIds.join(","),
      caption
    });
    await waitForContainer(carousel.id);
    const published = await publishContainer(carousel.id);
    console.log("published carousel", published.id);
    return published;
  }

  throw new Error(`unknown type ${post.type}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const all = args.includes("--all");
  const postArg = args.find((a) => a.startsWith("--post="))?.split("=")[1]
    ?? (args.includes("--post") ? args[args.indexOf("--post") + 1] : null);

  const manifest = loadManifest();

  if (!dryRun && !process.env.INSTAGRAM_ACCESS_TOKEN) {
    console.error("Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID. Use --dry-run to preview.");
    process.exit(1);
  }

  const queue = all
    ? manifest.posts
    : postArg
      ? manifest.posts.filter((p) => p.id === postArg)
      : [manifest.posts[0]];

  if (!queue.length) {
    console.error("No posts matched. Use --post post01 or --all");
    process.exit(1);
  }

  const logPath = path.join(CONTENT, "publish-log.json");
  const log = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, "utf8")) : [];

  for (const post of queue) {
    try {
      const result = await publishPost(post, dryRun);
      log.push({ at: new Date().toISOString(), post: post.id, result });
    } catch (err) {
      console.error(`FAIL ${post.id}:`, err.message);
      log.push({ at: new Date().toISOString(), post: post.id, error: err.message });
      if (!all) process.exit(1);
    }
  }

  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  console.log("\nINSTAGRAM_PUBLISH_DONE");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
