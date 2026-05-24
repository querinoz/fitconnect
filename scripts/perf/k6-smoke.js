import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE_URL || "http://localhost:3001";
const REQUIRED_HEADERS = [
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy"
];

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500", "p(99)<1000"]
  }
};

export default function () {
  const health = http.get(`${BASE}/api/health`);
  check(health, {
    "health status 200": (r) => r.status === 200,
    "health schema status": (r) => {
      const j = r.json();
      return typeof j.status === "string" && typeof j.timestamp === "string";
    },
    "security headers present": (r) =>
      REQUIRED_HEADERS.every((h) => Boolean(r.headers[h] || r.headers[h.toUpperCase()]))
  });

  const landing = http.get(`${BASE}/`);
  check(landing, {
    "landing status 200": (r) => r.status === 200,
    "landing has editorial shell": (r) =>
      r.body.includes("landing-editorial") || r.body.includes("FitConnect")
  });

  sleep(0.3);
}

export function handleSummary(data) {
  return { "k6-smoke-report.json": JSON.stringify(data, null, 2) };
}
