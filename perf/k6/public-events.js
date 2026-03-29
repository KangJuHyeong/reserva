import http from "k6/http";
import { check, sleep } from "k6";
import { baseUrl } from "./lib/auth.js";

const page = Number(__ENV.PAGE || 1);
const size = Number(__ENV.SIZE || 20);
const vus = Number(__ENV.VUS || 10);
const duration = __ENV.DURATION || "30s";
const query = __ENV.QUERY || "";
const category = __ENV.CATEGORY || "";
const section = __ENV.SECTION || "";

function buildQueryString() {
  const pairs = [
    ["page", String(page)],
    ["size", String(size)],
  ];

  if (query) pairs.push(["q", query]);
  if (category) pairs.push(["category", category]);
  if (section) pairs.push(["section", section]);

  return pairs
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

const queryString = buildQueryString();

export const options = {
  vus,
  duration,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(50)<400", "p(95)<1200"],
  },
};

export default function () {
  const response = http.get(`${baseUrl()}/api/v1/events?${queryString}`, {
    tags: {
      name: "events.list",
      section: section || "default",
      category: category || "all",
      page: String(page),
    },
  });

  check(response, {
    "status is 200": (res) => res.status === 200,
    "has items": (res) => Array.isArray(res.json("items")),
    "has page": (res) => Number.isInteger(res.json("page")),
    "has total": (res) => Number.isInteger(res.json("total")),
  });

  sleep(Number(__ENV.SLEEP_SECONDS || 1));
}
