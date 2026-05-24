import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE_URL || "http://localhost:3001";

export const options = {
  stages: [
    { duration: "30s", target: 200 },
    { duration: "2m", target: 200 },
    { duration: "30s", target: 0 }
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<800"]
  }
};

export default function () {
  const res = http.get(`${BASE}/api/health`);
  check(res, { "health available under spike": (r) => r.status === 200 });
  sleep(0.2);
}
