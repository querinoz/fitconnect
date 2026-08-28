#!/usr/bin/env node
/** Delete all media from @fitconnectsports via Graph API */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const GRAPH = "https://graph.facebook.com/v21.0";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

async function getPageToken() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  const res = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${token}`
  );
  const json = await res.json();
  const page = (json.data ?? []).find((p) => p.instagram_business_account?.id === userId);
  if (!page?.access_token) throw new Error("No page token for INSTAGRAM_USER_ID — link FB Page to IG");
  return page.access_token;
}

async function graphGet(pathOrUrl, pageToken) {
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl.replace(/access_token=[^&]+/, `access_token=${pageToken}`)
    : `https://graph.facebook.com/v21.0${pathOrUrl}${pathOrUrl.includes("?") ? "&" : "?"}access_token=${pageToken}`;
  const res = await fetch(url);
  return res.json();
}

async function graphDelete(mediaId, pageToken) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${mediaId}?access_token=${pageToken}`, {
    method: "DELETE"
  });
  return res.json();
}

async function main() {
  const userId = process.env.INSTAGRAM_USER_ID;
  if (!userId || !process.env.INSTAGRAM_ACCESS_TOKEN) {
    console.error("Set INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_USER_ID");
    process.exit(1);
  }

  const pageToken = await getPageToken();
  console.log("using page token for delete");

  const deleted = [];
  let next = `/${userId}/media?fields=id,caption,media_type,timestamp&limit=25`;

  while (next) {
    const page = await graphGet(next, pageToken);
    if (page.error) throw new Error(JSON.stringify(page.error));
    for (const item of page.data ?? []) {
      const result = await graphDelete(item.id, pageToken);
      console.log("deleted", item.id, item.media_type, result.success ? "OK" : JSON.stringify(result));
      deleted.push({ id: item.id, type: item.media_type, result });
      await new Promise((r) => setTimeout(r, 2000));
    }
    next = page.paging?.next ?? null;
  }

  const logPath = path.join(ROOT, "content/instagram/publish-log.json");
  fs.writeFileSync(
    logPath,
    JSON.stringify([{ at: new Date().toISOString(), action: "delete-all", deleted }], null, 2)
  );
  console.log(`\nINSTAGRAM_DELETE_ALL_DONE (${deleted.length} items)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
