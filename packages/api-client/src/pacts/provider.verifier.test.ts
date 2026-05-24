import { describe, expect, it } from "vitest";
import { Verifier } from "@pact-foundation/pact";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pactConfig } from "../../pact-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pactsDir = path.resolve(__dirname, "../../pacts");
const skip = process.env.RUN_PACT_VERIFY !== "1";

describe.skipIf(skip)("provider verification", () => {
  it("verifies all consumer contracts against running provider", async () => {
    const verifier = new Verifier({
      provider: "fitconnect-api",
      providerBaseUrl: pactConfig.providerBaseUrl,
      pactUrls: [path.join(pactsDir, "fitconnect-web-fitconnect-api.json")],
      publishVerificationResult: pactConfig.publishVerificationResults,
      providerVersion: pactConfig.providerVersion
    });

    const output = await verifier.verifyProvider();
    expect(output).toContain("finished");
  });
});
