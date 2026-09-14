import assert from "node:assert/strict";
import test from "node:test";
import { backoffMs, classifyVercelBuildLog } from "./classify-vercel-build-failure.mjs";

test("EAI_AGAIN base is deterministic and not retried", () => {
  const c = classifyVercelBuildLog(
    "Error occurred prerendering page \"/admin/athletes\"\nError: getaddrinfo EAI_AGAIN base"
  );
  assert.equal(c.kind, "deterministic");
  assert.equal(c.retry, false);
  assert.equal(c.hostname, "base");
});

test("EAI_AGAIN against a public registry host is transient", () => {
  const c = classifyVercelBuildLog("npm ERR! network getaddrinfo EAI_AGAIN registry.npmjs.org");
  assert.equal(c.kind, "transient");
  assert.equal(c.retry, true);
  assert.equal(c.hostname, "registry.npmjs.org");
});

test("TypeScript compile errors are not retried", () => {
  const c = classifyVercelBuildLog("Failed to compile.\nType error: Property x does not exist");
  assert.equal(c.retry, false);
  assert.equal(c.kind, "deterministic");
});

test("backoff grows 5s, 15s, 45s", () => {
  assert.equal(backoffMs(1), 5000);
  assert.equal(backoffMs(2), 15000);
  assert.equal(backoffMs(3), 45000);
});
