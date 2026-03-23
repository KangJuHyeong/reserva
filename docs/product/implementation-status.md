# Implementation Status

## Summary
- Current product mode: event reservation marketplace
- Current implementation mode: full-stack feature slices on a live backend baseline
- Current repository workflow: branch + PR + merge on a root monorepo
- Current implementation workflow: backend, frontend, docs, and verification move together per feature slice

## Implemented Now
- Backend project exists in `backend`
- Frontend Next.js app exists in `frontend`
- `backend/.env` is used for datasource configuration
- Current backend stack in use:
  - Spring Boot
  - MySQL
  - Flyway
  - JPA
  - QueryDSL
- Current frontend stack in use:
  - Next.js App Router
  - React
  - TypeScript
  - Tailwind CSS
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
- Implemented frontend routes backed by real API data:
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
  - authenticated event creation form and API
  - personalized dashboard summary with stats, recent bookings, watchlist preview, opening-soon preview, and my-events navigation
  - dedicated `/my-events` page for the current user's created events with pagination
- Database baseline exists through:
  - `V1__create_users.sql`
  - `V2__create_events_and_event_inventory.sql`
  - `V3__create_bookings.sql`
  - `V4__create_watchlists.sql`

## Not Implemented Yet
- Auth temporary fallback cleanup
- Residual validation and test hardening

## Temporary
- Current auth in code uses server-managed sessions for the implemented login contract
- Implemented auth routes are session-first and match the documented minimum login, me, and logout contract
- Protected routes may still resolve users from request headers during local development when the fallback is enabled:
  - `X-User-Id`
  - `X-User-Name`
- This header path is a temporary local-development mechanism, not the final auth contract
- Current frontend server-side backend wrapper can still inject the same temporary development headers when `DEV_AUTH_ENABLED=true`
- Current backend local CORS allowed origin defaults to `http://localhost:3000`

## Playwright Readiness
- Playwright E2E is runnable once local frontend and backend are started with the expected dev settings
- Backend demo seed can be enabled with `SEED_DEMO_DATA=true`
- Frontend development auth header injection can be disabled with `DEV_AUTH_ENABLED=false`
- Minimal session login can be verified with `alex@example.com / dev-password` and `creator@example.com / dev-password` when demo seed is enabled
- When frontend dev auth is disabled, `/?view=Watchlist` should render the explicit unauthenticated state instead of attempting the authenticated watchlist load
- Seeded stable demo event ids when demo data is enabled:
  - `evt_demo_jazz`
  - `evt_demo_art`
- Demo seed now expands the catalog with additional themed events across concert, restaurant, art & design, and sports
- Minimum routes to verify once local servers are running:
  - `/`
  - `/?view=Watchlist`
  - `/reservation/[id]`
  - `/booking/[id]`
  - `/dashboard`
  - `/my-events`
  - `/create`
  - `/login`
- Minimum interaction checks to verify once local servers are running:
  - discovery list render
  - filtered pagination
  - watchlist filter entry
  - card watchlist toggle
  - detail watchlist toggle
  - booking submission
  - login flow
  - dashboard summary render
  - my events list render
  - unauthenticated watchlist state

## Next Priorities
1. Auth temporary fallback cleanup
2. Residual validation and test hardening
3. Documentation consistency follow-up

Priority rationale:
- Core event, booking, watchlist, dashboard, event creation, and my-events flows are implemented in the current baseline.
- The highest remaining implementation risk is the temporary development auth fallback.
- Validation hardening and document consistency remain the main follow-up tasks.

## Workflow Status
- GitHub repository is connected
- Root monorepo workflow is active
- Branch + PR + merge workflow is adopted
- PR template is configured in `.github/pull_request_template.md`
