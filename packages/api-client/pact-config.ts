export const pactConfig = {
  pactBrokerUrl: process.env.PACT_BROKER_URL ?? "http://localhost:9292",
  publishVerificationResults: process.env.CI === "true",
  consumerVersion: process.env.GITHUB_SHA ?? "local",
  providerVersion: process.env.GITHUB_SHA ?? "local",
  providerBaseUrl: process.env.PACT_PROVIDER_URL ?? "http://localhost:3001"
};
