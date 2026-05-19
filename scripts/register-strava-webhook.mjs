#!/usr/bin/env node
/**
 * Register Strava webhook subscription for FitConnect.
 * Usage: node scripts/register-strava-webhook.mjs [callbackUrl]
 */
import { createPushSubscription } from "../packages/strava-integration/src/index.js";

const clientId = process.env.STRAVA_CLIENT_ID;
const clientSecret = process.env.STRAVA_CLIENT_SECRET;
const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN ?? "fitconnect-dev";

const callbackUrl =
  process.argv[2] ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/v1/integrations/strava/webhook`
    : process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/strava/webhook`
      : "https://fitconnect-phi.vercel.app/api/v1/integrations/strava/webhook");

if (!clientId || !clientSecret) {
  console.error("Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET");
  process.exit(1);
}

console.log("Registering Strava webhook →", callbackUrl);

const result = await createPushSubscription({
  clientId,
  clientSecret,
  callbackUrl,
  verifyToken
});

console.log(JSON.stringify(result, null, 2));
