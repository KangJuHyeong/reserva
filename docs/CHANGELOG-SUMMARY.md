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
