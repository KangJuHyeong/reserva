import http from "k6/http";
import { check, sleep } from "k6";
import { baseUrl, bearerHeaders, creatorEmail, login } from "./lib/auth.js";

const page = Number(__ENV.PAGE || 1);
const size = Number(__ENV.SIZE || 12);
const filter = __ENV.FILTER || "";
const sort = __ENV.SORT || "";

export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(50)<500", "p(95)<1500"],
  },
};

export function setup() {
  const token = login(__ENV.CREATOR_EMAIL || creatorEmail(Number(__ENV.CREATOR_INDEX || 1)));
  return { token };
}

export default function (data) {
  const pairs = [
    ["page", String(page)],
    ["size", String(size)],
  ];
  if (filter) pairs.push(["filter", filter]);
  if (sort) pairs.push(["sort", sort]);

  const queryString = pairs
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  const response = http.get(`${baseUrl()}/api/v1/me/events?${queryString}`, {
    headers: bearerHeaders(data.token),
    tags: {
      name: "me.events",
      filter: filter || "all",
      sort: sort || "latest",
      page: String(page),
    },
  });

  check(response, {
    "status is 200": (res) => res.status === 200,
    "has items": (res) => Array.isArray(res.json("items")),
  });

  sleep(Number(__ENV.SLEEP_SECONDS || 1));
}
