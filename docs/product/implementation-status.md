# Implementation Status

## Summary
- Current product mode: event reservation marketplace
- Current implementation mode: backend phase-1 baseline with docs-first contracts
- Current repository workflow: branch + PR + merge on a root monorepo
- Current implementation workflow: full-stack feature slices across docs, backend, frontend, and verification

## Implemented Now
- Backend project exists in `backend`
- Frontend Next.js app exists in `frontend`
- `backend/.env` is used for datasource configuration
- Current backend stack in use:
  - Spring Boot
  - MySQL
  - Flyway
  - JPA
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
- Implemented frontend routes backed by real API data:
  - `/`
  - `/reservation/[id]`
  - `/booking/[id]`
  - `/create`
  - `/login`
- Watchlist save/remove UI is connected on discovery cards and event detail
- `/?view=Watchlist` now loads persisted watchlist items
- Filtered catalog views now support paginated result navigation through the homepage query state
- Derived discovery sections now validate supported values and return only matching events for the selected section
- Placeholder frontend routes preserved for later work:
  - `/dashboard`
- Database baseline exists through:
  - `V1__create_users.sql`
  - `V2__create_events_and_event_inventory.sql`
  - `V3__create_bookings.sql`
  - `V4__create_watchlists.sql`

## Documented But Not Implemented
- Creator-owned event listing endpoints
- Dashboard aggregation endpoints

## Temporary
- Current auth in code uses server-managed sessions for the implemented login contract
- Implemented auth routes are session-first and match the documented minimum login, me, and logout contract
- Protected route fallback in local development can still use request headers:
  - `X-User-Id`
  - `X-User-Name`
  - `X-User-Role`
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
- Minimum routes to verify once local servers are running:
  - `/`
  - `/?view=Watchlist`
  - `/reservation/[id]`
- Minimum interaction checks to verify once local servers are running:
  - discovery list render
  - watchlist filter entry
  - card watchlist toggle
  - detail watchlist toggle
  - unauthenticated watchlist state

## Next Priorities
- Dashboard aggregation and dashboard frontend activation
- Creator-owned event listing
- Auth hardening beyond the minimum contract

Priority rationale:
- Dashboard follows because `/dashboard` is still a placeholder route and depends on authenticated user summary data
- Creator-owned event listing follows dashboard because it will likely support dashboard and creator flows, but it is less urgent as a standalone user-visible gap
- Auth hardening remains later because the minimum session contract is now implemented, but the development fallback is still temporary

## Workflow Status
- GitHub repository is connected
- Root monorepo workflow is active
- Branch + PR + merge workflow is adopted
- PR template is configured in `.github/pull_request_template.md`
