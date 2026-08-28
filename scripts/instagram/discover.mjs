#!/usr/bin/env node
/** Discover Instagram Business Account ID from access token */
import { loadEnvFiles } from "./load-env.mjs";

const GRAPH = "https://graph.facebook.com/v21.0";

async function graphGet(pathname, token, query = {}) {
  const qs = new URLSearchParams({ ...query, access_token: token });
  const res = await fetch(`${GRAPH}${pathname}?${qs}`);
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

async function main() {
  loadEnvFiles();
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    console.error("Set INSTAGRAM_ACCESS_TOKEN first (short or long-lived).");
    process.exit(1);
  }

  const me = await graphGet("/me", token, {
    fields: "id,name"
  });
  console.log("facebook_user:", me);

  const pages = await graphGet("/me/accounts", token, {
    fields: "id,name,instagram_business_account{id,username,name,followers_count,media_count}"
  });

  const withIg = (pages.data ?? []).filter((p) => p.instagram_business_account);
  if (!withIg.length) {
    console.error("No Facebook Page with linked Instagram found.");
    console.error("Link IG Business account to a Facebook Page in Meta Business Suite.");
    process.exit(1);
  }

  for (const page of withIg) {
    const ig = page.instagram_business_account;
    console.log("\n---");
    console.log(`page: ${page.name} (${page.id})`);
    console.log(`instagram: @${ig.username} id=${ig.id}`);
    console.log(`followers: ${ig.followers_count ?? "?"} | posts: ${ig.media_count ?? "?"}`);
    console.log(`\nAdd to .env.local:\nINSTAGRAM_USER_ID=${ig.id}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
