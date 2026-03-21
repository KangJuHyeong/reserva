# IMPLEMENTATION-STATUS

## Summary
- Current product mode: prototype-aligned event reservation marketplace
- Current implementation mode: backend phase-1 baseline with docs-first contracts
- Current repository workflow: branch + PR + merge on a root monorepo

## Implemented Now
- Backend project skeleton exists in `backend`
- Frontend Next.js app skeleton exists in `frontend`
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
  - `GET /api/v1/events`
  - `GET /api/v1/events/{eventId}`
  - `POST /api/v1/events/{eventId}/bookings`
  - `GET /api/v1/me/bookings`
  - `GET /api/v1/me/bookings/{bookingId}`
- Implemented frontend routes backed by real API data:
  - `/`
  - `/reservation/[id]`
  - `/booking/[id]`
- Placeholder frontend routes preserved for later work:
  - `/dashboard`
  - `/create`
  - `/login`
- Database baseline exists through:
  - `V1__create_users.sql`
  - `V2__create_events_and_event_inventory.sql`
  - `V3__create_bookings.sql`
  - `V4__create_watchlists.sql`

## Documented But Not Implemented
- Session-based auth endpoints:
  - `POST /auth/login`
  - `GET /me`
  - `POST /auth/logout`
- Watchlist persistence endpoints
- Creator event creation/listing endpoints
- Dashboard aggregation endpoints

## Temporary
- Current auth in code uses request headers:
  - `X-User-Id`
  - `X-User-Name`
  - `X-User-Role`
- This is a temporary local-development mechanism, not the final auth contract
- Current frontend server-side backend wrapper also injects the same temporary development headers
- Current backend local CORS allowed origin defaults to `http://localhost:3000`
- Watchlist UI is visible only as disabled/unavailable state in the current frontend slice

## Next Priorities
- Watchlist persistence
- Minimal auth contract
- Dashboard aggregation and dashboard frontend activation
- Creator event creation and creator-owned event listing

## Recent Workflow Status
- GitHub repository is connected
- Root monorepo workflow is active
- Branch + PR + merge workflow is adopted
- PR template is configured in `.github/pull_request_template.md`
