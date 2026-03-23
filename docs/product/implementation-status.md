# Implementation Status

## Summary
- Current product mode: event reservation marketplace
- Current implementation mode: full-stack feature slices on a live backend baseline
- Current repository workflow: branch + PR + merge on a root monorepo
- Current documentation rule: treat current code as the factual baseline and `prototype` as reference input only

## Current

### Backend
- Backend project exists in `backend`.
- Datasource configuration uses `backend/.env`.
- Current stack in use:
  - Spring Boot
  - MySQL
  - Flyway
  - JPA
  - QueryDSL
- Implemented APIs:
  - `POST /api/v1/auth/login`
  - `GET /api/v1/me`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/events`
  - `GET /api/v1/events/{eventId}`
  - `POST /api/v1/events`
  - `POST /api/v1/events/{eventId}/watchlist`
  - `DELETE /api/v1/events/{eventId}/watchlist`
  - `POST /api/v1/events/{eventId}/bookings`
  - `GET /api/v1/me/bookings`
  - `GET /api/v1/me/bookings/{bookingId}`
  - `GET /api/v1/me/dashboard-summary`
  - `GET /api/v1/me/events`

### Frontend
- Frontend Next.js app exists in `frontend`.
- Live routes backed by real API data:
  - `/`
  - `/reservation/[id]`
  - `/booking/[id]`
  - `/dashboard`
  - `/my-events`
  - `/create`
  - `/login`
- Implemented product behaviors:
  - event discovery with search, category filtering, derived sections, and pagination
  - event detail with watchlist state and direct booking action
  - booking creation with capacity checks and duplicate-booking protection
  - my bookings list and booking detail
  - watchlist save/remove on cards and event detail
  - persisted watchlist loading through `/?view=Watchlist`
  - authenticated event creation page, form, and API
  - personalized dashboard summary with stats, recent bookings, opening-soon preview, watchlist preview, and quick access to my-events
  - dedicated `/my-events` page for the current user's created events with pagination

### Database
- Database baseline exists through:
  - `V1__create_users.sql`
  - `V2__create_events_and_event_inventory.sql`
  - `V3__create_bookings.sql`
  - `V4__create_watchlists.sql`

## Temporary
- No temporary auth fallback remains in the current baseline.

## Target
- Keep `/dashboard` as a summary page and `/my-events` as the dedicated created-events workspace instead of collapsing both responsibilities into one route.
- Continue using `prototype` only as comparison input and promote only the parts that improve clarity, hierarchy, or task flow over the live UI.
- Keep page documentation in a fixed IA format:
  - purpose
  - current structure
  - current states
  - current data dependencies
  - target improvements
- Keep the current session-based protected-route contract as the baseline even if new login methods are added.

## Approved Next-Phase Candidates
- EC2 semideploy packaging with Docker-based services
- reverse proxy and environment setup suitable for lightweight external access
- Google OAuth as the first additional login option
- Redis introduction for queue-ready reservation control

## Out Of Scope
- Signup
- Password reset
- Email verification
- Payments
- Notifications
- Kafka-based async processing

## Verification Readiness
- Browser-based E2E verification has been executed against the local seeded environment and recorded in `docs/operations/e2e-test-report-2026-03-23.md`.
- No Playwright project configuration is currently committed in-repo.
- Backend demo seed can be enabled with `SEED_DEMO_DATA=true`.
- Minimal session login can be verified with `alex@example.com / dev-password` and `creator@example.com / dev-password` when demo seed is enabled.
- When no authenticated session exists, `/?view=Watchlist` should render the explicit unauthenticated state instead of attempting authenticated watchlist loading.
- Stable demo event ids when demo data is enabled:
  - `evt_demo_jazz`
  - `evt_demo_art`
- Minimum routes to verify once local servers are running:
  - `/`
  - `/?view=Watchlist`
  - `/reservation/[id]`
  - `/booking/[id]`
  - `/dashboard`
  - `/my-events`
  - `/create`
  - `/login`

## Next Priorities
1. Frontend local runtime stability hardening for repeated `next dev` and `next start` restarts
2. EC2 semideploy foundation with Docker-based packaging and reverse proxy setup
3. Google OAuth on top of the current session contract
4. Redis foundation for queue-ready reservation control
5. Residual validation and regression hardening around auth/session, booking, watchlist, and create flows

Priority rationale:
- Core event, booking, watchlist, dashboard, event creation, and my-events flows are working in the current baseline after runtime bug fixes and end-to-end verification.
- The highest remaining delivery risk observed during this run was local frontend process instability during repeated restarts, not a missing baseline user flow.
- The next approved product step is semideploy readiness, so packaging, environment boundaries, and reverse-proxy setup now outrank speculative UI expansion.
- Google OAuth should extend the current session model after deployment boundaries are clear.
- Redis should be introduced first as infrastructure for queue-ready reservation control, with broad waiting-room behavior deferred until a narrower MVP is defined.
