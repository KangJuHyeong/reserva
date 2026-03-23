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
  - authenticated event creation form and API
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

## Out Of Scope
- Signup
- OAuth providers
- Password reset
- Email verification
- Payments
- Notifications
- Queue-based access
- Kafka-based async processing
- Redis waiting room

## Verification Readiness
- Playwright E2E is runnable once local frontend and backend are started with the expected dev settings.
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
1. Residual validation and test hardening
2. IA polish tied to real route or data changes
3. Documentation follow-up tied to real UI or contract changes

Priority rationale:
- Core event, booking, watchlist, dashboard, event creation, and my-events flows are already implemented in the current baseline.
- The temporary development auth fallback has been removed, so the remaining implementation risk is concentrated in validation and regression hardening.
- IA and documentation follow-up should stay attached to real UI or contract changes instead of drifting into speculative redesign.
