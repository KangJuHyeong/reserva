import http from "k6/http";
import { check } from "k6";
import exec from "k6/execution";
import { baseUrl, bearerHeaders, login, userEmail } from "./lib/auth.js";

const eventId = __ENV.EVENT_ID || "perf_evt_00001";
const ticketCount = Number(__ENV.TICKET_COUNT || 1);

export const options = {
  scenarios: {
    booking_race: {
      executor: "per-vu-iterations",
      vus: Number(__ENV.VUS || 20),
      iterations: Number(__ENV.ITERATIONS || 1),
      maxDuration: __ENV.MAX_DURATION || "30s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"],
  },
};

function currentUserToken() {
  const startIndex = Number(__ENV.USER_INDEX_START || 1);
  const uniqueIndex = startIndex + exec.vu.idInTest - 1;
  return login(userEmail(uniqueIndex));
}

export default function () {
  const token = currentUserToken();
  const response = http.post(
    `${baseUrl()}/api/v1/events/${eventId}/bookings`,
    JSON.stringify({ ticketCount }),
    {
      headers: bearerHeaders(token),
      tags: {
        name: "events.create-booking",
        eventId,
      },
    },
  );

  check(response, {
    "status is created or conflict": (res) => [201, 400, 401, 404, 409].includes(res.status),
  });
}
