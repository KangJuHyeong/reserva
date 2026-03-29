import http from "k6/http";
import { check, fail } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";
const PERF_PASSWORD = __ENV.PERF_PASSWORD || "perf-password";

function formatIndex(index) {
  return String(index).padStart(5, "0");
}

export function baseUrl() {
  return BASE_URL;
}

export function userEmail(index) {
  return `perf-user-${formatIndex(index)}@example.com`;
}

export function creatorEmail(index) {
  return `perf-creator-${formatIndex(index)}@example.com`;
}

export function login(email, password = PERF_PASSWORD) {
  const response = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email, password }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      tags: { name: "auth.login" },
    },
  );

  const ok = check(response, {
    "login status is 200": (res) => res.status === 200,
    "login returned token": (res) => Boolean(res.json("accessToken")),
  });

  if (!ok) {
    fail(`Failed to login with ${email}. status=${response.status} body=${response.body}`);
  }

  return response.json("accessToken");
}

export function bearerHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}
