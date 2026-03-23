# E2E Test Report

Date: 2026-03-23

Scope:
- No new test dependencies or Playwright project setup were added.
- Verification used the existing local backend/frontend runtime, browser MCP, `curl`, and PowerShell HTTP requests.
- Focus stayed on the current baseline routes and the highest-risk auth/session, booking, watchlist, and event-creation paths.

Environment:
- Backend: `backend/run-local.ps1`
- Frontend: local Next.js runtime on `http://localhost:3000` and `http://localhost:3001`
- Seed data: enabled via `backend/.env`
- Demo accounts:
  - `alex@example.com / dev-password`
  - `creator@example.com / dev-password`

## Executed Scenarios

| ID | Scenario | Method | Result | Notes |
| --- | --- | --- | --- | --- |
| E2E-001 | Backend event list responds with seeded data | HTTP | Pass | `GET /api/v1/events` returned seeded items including `evt_demo_jazz` and `evt_demo_art`. |
| E2E-002 | Frontend home page renders | HTTP + browser | Pass | `/` returned `200` and rendered discovery sections. |
| E2E-003 | Login page renders | Browser + HTTP | Pass | `/login` rendered successfully after proxy/session fix. |
| E2E-004 | Login with `alex@example.com` succeeds | Browser | Pass | Session established and authenticated nav appeared. |
| E2E-005 | Event detail for `evt_demo_jazz` renders | Browser | Pass | `/reservation/evt_demo_jazz` loaded title, host, schedule, slots, and reserve CTA. |
| E2E-006 | Watchlist toggle from event detail works | Browser | Pass | Event changed from unsaved to saved state and message updated. |
| E2E-007 | Booking creation succeeds for `evt_demo_jazz` | Browser | Pass | Reservation created and redirected to `/booking/BK-...`. |
| E2E-008 | Booking detail page loads after reservation | Browser | Pass | Booking snapshot, participant, host, and total amount rendered after cookie-forwarding fix. |
| E2E-009 | Dashboard reflects new booking and watchlist state | Browser | Pass | `/dashboard` showed `Total Bookings = 1`, recent booking item, and watchlist preview. |
| E2E-010 | My Events empty state for `alex@example.com` before create | Browser | Pass | `/my-events` displayed empty created-events state. |
| E2E-011 | Create page required fields validation | Browser | Pass | Empty submit produced `필수 항목을 모두 입력해 주세요.` |
| E2E-012 | Event creation happy path succeeds | Browser | Pass | Event `Codex Test Rooftop Session` created and homepage showed new card. |
| E2E-013 | Newly created event appears in My Events | Browser | Pass | `/my-events` showed the created event for `alex@example.com`. |
| E2E-014 | Unauthenticated access to `/dashboard` redirects to `/login` | HTTP | Pass | Returned `307` with `location: /login`. |
| E2E-015 | Unauthenticated access to `/my-events` redirects to `/login` | HTTP | Pass | Returned `307` with `location: /login`. |
| E2E-016 | Unauthenticated access to `/create` redirects to `/login` | HTTP | Pass | Returned `307` with `location: /login` after route protection fix. |
| E2E-017 | Duplicate booking is rejected | HTTP | Pass | Authenticated duplicate booking attempt returned `409` with `ALREADY_BOOKED`. |
| E2E-018 | Invalid schedule create request is rejected | HTTP | Pass | Authenticated create with same open/event datetime returned `400` with `INVALID_SCHEDULE`. |
| E2E-019 | Creator account can load created-events list | HTTP | Pass | `GET /api/v1/me/events?page=1&size=5` returned creator-owned seeded items. |
| E2E-020 | Watchlist API requires auth | HTTP | Pass | Unauthenticated `GET /api/v1/events?section=watchlist` returned `401 UNAUTHENTICATED`. |
| E2E-021 | Unauthenticated `/?view=Watchlist` renders explicit watchlist sign-in state | HTTP | Pass | Frontend page rendered `Sign in to view your watchlist` and `Back to discovery`. |
| E2E-022 | Duplicate booking is surfaced in the frontend UI | Browser | Pass | Re-book attempt on `evt_demo_jazz` showed `You already have an active booking for this event.` |

## Findings Confirmed During Testing

### Fixed during this run
- Frontend backend-proxy response forwarding could hang on `/api/me`.
- Server-rendered booking detail did not forward session cookies.
- Server-rendered event/event-list reads did not consistently include session cookies.
- Event creation failed with a backend persistence error involving `EventInventoryEntity`.
- `/create` was not protected for unauthenticated users.
- Reservation error copy still referenced temporary auth wording instead of the current session contract.

### Still requiring follow-up verification
- Local frontend runtime became unstable after repeated restarts:
  - stale `next dev` lock behavior on `3000`
  - intermittent `next start` port conflicts
  - at one point `3001` stopped accepting requests until restarted cleanly via `cmd /c`

## Contract-Level Results

- `POST /api/v1/auth/login`: verified success for both demo accounts.
- `GET /api/v1/me`: backend direct unauthenticated response verified as `401 UNAUTHENTICATED`.
- `GET /api/v1/events`: verified seeded list response.
- `GET /api/v1/events/{eventId}`: verified through frontend detail load.
- `POST /api/v1/events/{eventId}/watchlist`: verified via detail-page toggle.
- `POST /api/v1/events/{eventId}/bookings`: verified success and duplicate-booking rejection.
- `GET /api/v1/me/bookings/{bookingId}`: verified via frontend booking detail.
- `GET /api/v1/me/dashboard-summary`: verified via frontend dashboard render.
- `GET /api/v1/me/events`: verified for both empty and populated cases.
- `POST /api/v1/events`: verified success and invalid-schedule failure.

## Remaining Tests To Run

- Re-verify login and create flow on a single clean frontend instance after process cleanup, not after multiple hot restarts.
- Re-run the full happy path once more from a clean database/session state:
  - login
  - save watchlist
  - reserve
  - booking detail
  - dashboard
  - create event
  - my-events
- Add a clean logout verification step after frontend runtime stabilization.

## Summary

Current baseline core flows are working after the fixes applied during this run:
- login
- event detail
- watchlist toggle
- booking creation
- booking detail
- dashboard
- event creation
- my-events

The main unresolved area is frontend runtime stability during repeated local restarts.
