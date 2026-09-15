import assert from "node:assert/strict";
import test from "node:test";
import { parseAllowedTestFlightUrl } from "./lib/testflight-join-url.mjs";
import { upsertVercelProductionEnv } from "./set-ios-testflight-url.mjs";

test("upsert refuses a fake or non-TestFlight URL", async () => {
  await assert.rejects(
    () =>
      upsertVercelProductionEnv({
        url: "https://example.com/join/FAKECODE",
        token: "tok",
        projectId: "prj"
      }),
    /refusing/
  );
});

test("upsert is a no-op configure=false without Vercel credentials", async () => {
  const url = "https://testflight.apple.com/join/Ab12Cd34";
  const result = await upsertVercelProductionEnv({ url, token: "", projectId: "" });
  assert.equal(result.configured, false);
  assert.equal(result.url, url);
  assert.equal(parseAllowedTestFlightUrl(url), url);
});
