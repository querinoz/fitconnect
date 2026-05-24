import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE = __ENV.BASE_URL || "http://localhost:3001";
const errorRate = new Rate("errors");
const readinessLatency = new Trend("readiness_latency");

export const options = {
  stages: [
    { duration: "2m", target: 20 },
    { duration: "25m", target: 20 },
    { duration: "3m", target: 0 }
  ],
  thresholds: {
    http_req_duration: ["p(95)<200", "p(99)<500"],
    http_req_failed: ["rate<0.01"],
    errors: ["rate<0.005"],
    readiness_latency: ["p(95)<150"]
  }
};

export default function () {
  const health = http.get(`${BASE}/api/health`);
  check(health, { "health 200": (r) => r.status === 200 }) || errorRate.add(1);

  const sessions = http.get(`${BASE}/api/v1/sessions?page=1&limit=20`);
  check(sessions, {
    "sessions schema": (r) => {
      if (r.status !== 200) return false;
      const j = r.json();
      return Array.isArray(j.data) && typeof j.meta?.total === "number";
    }
  }) || errorRate.add(1);

  const readiness = http.post(
    `${BASE}/api/v1/readiness/compute`,
    JSON.stringify({ hrvMs: 62, sleepHours: 7.5, strainScore: 30 }),
    { headers: { "Content-Type": "application/json" } }
  );
  readinessLatency.add(readiness.timings.duration);
  check(readiness, {
    "readiness score range": (r) => {
      if (r.status !== 200) return false;
      const j = r.json();
      return j.score >= 0 && j.score <= 100;
    }
  }) || errorRate.add(1);

  sleep(1);
}

export function handleSummary(data) {
  const out = JSON.stringify(data, null, 2);
  return {
    stdout: out,
    "k6-soak-report.json": out
  };
}
