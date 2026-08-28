#!/usr/bin/env node
/** Verify Meta Graph API credentials for @fitconnectsports */
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const GRAPH = "https://graph.facebook.com/v21.0";

async function main() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  if (!token) {
    console.log("INSTAGRAM_STATUS: NOT_CONFIGURED");
    console.log("Set INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_USER_ID in .env.local");
    process.exit(0);
  }
  const fields = "id,username,name,profile_picture_url,followers_count,media_count";
  const qs = new URLSearchParams({ fields, access_token: token });
  const res = await fetch(`${GRAPH}/${userId ?? "me"}?${qs}`);
  const json = await res.json();
  if (!res.ok) {
    console.error("INSTAGRAM_STATUS: ERROR", json);
    process.exit(1);
  }
  console.log("INSTAGRAM_STATUS: OK");
  console.log(JSON.stringify(json, null, 2));
}

main();
