import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

export const options = {
  scenarios: {
    api_smoke: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS || 2),
      duration: __ENV.DURATION || "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    "http_req_duration{endpoint:health}": ["p(95)<200"],
    "http_req_duration{endpoint:projects}": ["p(95)<350"],
  },
};

export default function () {
  const health = http.get(`${BASE_URL}/api/v1/health`, {
    tags: { endpoint: "health" },
  });
  check(health, {
    "health status is 200": (res) => res.status === 200,
    "health envelope is success": (res) => res.json("status") === "success",
  });

  const projects = http.get(`${BASE_URL}/api/v1/projects?featured=true&limit=6`, {
    tags: { endpoint: "projects" },
  });
  check(projects, {
    "projects status is 200": (res) => res.status === 200,
    "projects envelope is success": (res) => res.json("status") === "success",
  });

  sleep(1);
}
