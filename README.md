# Reserva

Reserva is a prototype-driven event reservation platform. The current product shape comes from the UI prototype in `prototype/b_XRSe9jZaGQj-1773064905125`, and the supporting docs describe the minimum backend, API, and data model needed to make those screens real.

The product is not currently framed as a queue-first reservation system. It is a marketplace-style experience centered on event discovery, reservation, watchlist management, creator event publishing, and booking management.

## Current Prototype Scope

### Main Routes
- `/`: discovery home with search, categories, trending, almost full, ending soon, opening soon, and watchlist sections
- `/reservation/[id]`: event detail with event information, host, slot progress, and reserve action
- `/booking/[id]`: booking detail with status, participant data, ticket count, and payment summary
- `/dashboard`: personal hub for overview, my bookings, created events, watchlist, and quick actions
- `/create`: event creation form for creators
- `/login`: minimal login entry point

### Current User Flows
- Browse and filter events
- Inspect a specific event
- Reserve a spot in an event
- Save or remove watchlist items
- Review personal bookings
- Review booking details
- Create and manage creator-owned events
- Log in and load current user state

## Minimum Supporting Product Assumptions
- Event listings are backed by persistent event, inventory, and watchlist data
- Booking creation requires concurrency-safe capacity checks
- Creator-only actions require an authorization model
- List APIs should support pagination even if the prototype uses mock data
- Server-derived sections such as trending, ending soon, and opening soon are allowed

## Minimal Auth Scope
The current docs only define the minimum auth contract needed by the visible UI:

- `POST /auth/login`
- `GET /me`
- `POST /auth/logout`

The following are intentionally not yet committed:
- signup
- OAuth
- forgot password
- email verification
- final token/session strategy beyond an initial practical default

## Documentation Map
- `agent.md`: repo operating guide and source-of-truth rules
- `MAIN_PROMPT.md`: reusable working prompt for Codex-based implementation sessions
- `docs/IMPLEMENTATION-STATUS.md`: current implementation status and next priorities
- `docs/DECISIONS.md`: short log of current, temporary, and future-facing decisions
- `docs/architecture.md`: current system responsibilities and future roadmap
- `docs/api-spec.md`: current API contracts inferred from the prototype
- `docs/db.md`: persistence model and integrity rules
- `docs/frontend-architecture.md`: route structure, UX states, and frontend data needs
- `docs/CHANGELOG-SUMMARY.md`: summary of documentation rebaseline changes

## Git Workflow
- Use the repository root as a single monorepo for `backend`, `frontend`, `docs`, `prototype`, and `infra`
- Start feature work from `main`, then create a task branch such as `feature/...`, `fix/...`, or `docs/...`
- Prefer focused commits with clear prefixes such as `feat:`, `fix:`, and `docs:`
- Update related docs when API or persistence behavior changes
- Run the required checks before merge, especially `backend\gradlew.bat test` for backend changes

## Stack Notes
Current prototype frontend stack:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui style component structure

Current frontend implementation baseline:
- `frontend` now contains a Next.js App Router application
- currently connected to backend APIs:
  - `/`
  - `/reservation/[id]`
  - `/booking/[id]`
- currently placeholder-only routes:
  - `/dashboard`
  - `/create`
  - `/login`
- frontend server-side backend access currently uses temporary development headers:
  - `X-User-Id`
  - `X-User-Name`
  - `X-User-Role`
 - backend local frontend origin default:
   - `http://localhost:3000`

Current backend implementation baseline:
- Spring Boot
- MySQL
- Flyway
- JPA
- `backend/.env`-driven datasource configuration

## Local Environment Files
- Keep real local values in untracked `.env` files
- Backend local config lives in `backend/.env`
- Frontend local config should live in `frontend/.env`
- Example values that are safe to commit should stay in `frontend/.env.example`
- `.env` and `.env.*` files are ignored by git, while `.env.example` remains tracked for onboarding

These backend choices currently back the first backend implementation baseline. The visible product definition still comes from the prototype first.

## Future Backend Roadmap
The following topics remain future scope and are not part of the current confirmed product contract:
- signup and advanced auth flows
- payments
- notifications
- queue-based waiting room
- Redis-based admission control
- Kafka-based asynchronous booking flow
- advanced observability and operations tooling

## Current Goal
The immediate goal is to turn the prototype into a real product incrementally: keep the prototype-aligned UI, connect the currently supported backend flows, and leave unsupported areas clearly marked as later work instead of pretending they are complete.

Current backend implementation status:
- Implemented now:
  - `GET /api/v1/events`
  - `GET /api/v1/events/{eventId}`
  - `POST /api/v1/events/{eventId}/bookings`
  - `GET /api/v1/me/bookings`
  - `GET /api/v1/me/bookings/{bookingId}`
- Database baseline:
  - Flyway migrations `V1__create_users.sql`
  - `V2__create_events_and_event_inventory.sql`
  - `V3__create_bookings.sql`
  - `V4__create_watchlists.sql`
- Current temporary auth for local development:
  - request headers `X-User-Id`, `X-User-Name`, `X-User-Role`

The temporary header-based auth is a development implementation detail, not the final documented auth contract.
