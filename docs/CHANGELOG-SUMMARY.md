# CHANGELOG-SUMMARY

## Documentation Rebaseline
- Rewrote `agent.md`, `README.md`, and all core docs to align with the current prototype in `prototype/b_XRSe9jZaGQj-1773064905125`.
- Changed the product framing from a queue-first reservation-system narrative to a prototype-driven event reservation marketplace narrative.
- Standardized terminology across docs:
  - `event` for joinable listings
  - `booking` for a user's confirmed reservation record
  - `creator` for users who can publish events
  - `watchlist` for saved events

## Scope Changes
- Promoted current visible flows to the primary product scope:
  - discovery
  - event detail
  - direct booking
  - dashboard
  - booking detail
  - creator event creation
  - minimal login
- Reduced auth documentation to a minimum current contract:
  - `POST /auth/login`
  - `GET /me`
  - `POST /auth/logout`
- Kept signup, OAuth, password reset, email verification, payments, notifications, and queue-based scaling as future scope.

## Architecture And Data Changes
- Rewrote architecture docs around current service responsibilities instead of Redis/Kafka-first expansion.
- Rewrote API docs around the prototype routes and the minimum contracts needed to implement them.
- Rewrote DB docs around users, events, inventory, bookings, and watchlists.
- Preserved concurrency-safe booking creation and duplicate-booking prevention as required backend invariants.

## Cleanup
- Removed duplicate sections and contradictory numbering from the previous docs set.
- Removed outdated assumptions that treated queueing and asynchronous booking as the default current user experience.

## Documentation Workflow Additions
- Added `docs/IMPLEMENTATION-STATUS.md` as a current-state status board for completed work, temporary implementation details, and next priorities.
- Added `docs/DECISIONS.md` as a short-form decision log for repository, backend, auth, and documentation decisions.

## 2026-03-21 Frontend Bootstrap
- Added a real `Next.js App Router` frontend in `frontend`.
- Connected the first live frontend slice to current backend APIs:
  - `/`
  - `/reservation/[id]`
  - `/booking/[id]`
- Added a frontend server-side backend wrapper that injects temporary development auth headers.
- Kept `/dashboard`, `/create`, and `/login` as placeholder routes until their backend support is ready.
- Updated implementation and frontend architecture docs to reflect the new current state.

## 2026-03-21 Local Env Alignment
- Moved backend datasource environment loading from the repository root `.env` to `backend/.env`.
- Added backend local CORS origin configuration with default `http://localhost:3000`.
- Updated docs to reflect the new backend local environment location and frontend origin default.
