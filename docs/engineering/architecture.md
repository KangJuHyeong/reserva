# Architecture

This document describes the current system architecture for the product baseline.

Use `agent.md` for scope boundaries and `docs/product/implementation-status.md` for current implementation coverage.

## Current System Responsibilities

### Auth Service
Responsibilities:
- handle `POST /auth/login`
- return current user from `GET /me`
- end session through `POST /auth/logout`
- expose the current user's role and identity to the rest of the system

Current documented default:
- server-managed session authentication

Current temporary implementation:
- `POST /auth/login` creates an HTTP session after email/password verification
- `GET /me` returns the current authenticated user from the active session
- `POST /auth/logout` invalidates the active session
- protected routes can still resolve current-user from request headers `X-User-Id`, `X-User-Name`, `X-User-Role` only as a development fallback when enabled
- this header path is a development-only temporary mechanism, not the final auth contract

### Event Catalog Service
Responsibilities:
- list events for the home page
- support search and category filtering
- support pagination
- provide server-owned derived sections such as trending, ending soon, and opening soon
- return watchlist state for the current user when authenticated

### Event Detail Service
Responsibilities:
- return a single event by id
- include event, host, inventory, and watchlist state needed by the detail screen
- provide the current reservation-open datetime and current fill state

### Booking Service
Responsibilities:
- create bookings from an event detail action
- protect slot integrity under concurrent access
- prevent duplicate bookings according to product policy
- expose my bookings list and booking detail
- preserve booking snapshots needed for the confirmation page

### Watchlist Service
Responsibilities:
- add an event to a user's watchlist
- remove an event from a user's watchlist
- support the homepage watchlist section and event-card watchlist toggles

### Creator Event Management Service
Responsibilities:
- create events
- validate creator-only access
- list the current creator's events for dashboard use

### Dashboard Aggregation
Responsibilities:
- aggregate counts and preview lists for dashboard overview
- return my bookings summary
- return created-events summary
- return watchlist summary

## Logical Components
- Web frontend
  - renders discovery, event detail, booking detail, dashboard, create, and login pages
- API application
  - handles auth, events, bookings, watchlists, and creator actions
- Relational database
  - stores users, roles, events, inventory state, bookings, and watchlists
- Optional media layer
  - stores or references uploaded event cover images

Current backend baseline:
- Spring Boot API application
- Spring Data JPA for persistence
- QueryDSL as the preferred dynamic-query direction for repository query composition
- MySQL relational database
- Flyway-managed schema migrations
- `backend/.env`-driven datasource configuration
- local CORS allowed origin defaulting to `http://localhost:3000`

Current frontend baseline:
- Next.js App Router application in `frontend`
- current connected frontend slice: discovery, event detail, booking creation, booking detail, and minimal login
- current placeholder frontend route: dashboard
- current implemented create-event route: `/create`

## Request Flow Overview

### Browse Events
1. Frontend requests the event list with search, category, and page inputs.
2. API applies filters and derived-section rules through the event query layer.
3. API returns event cards with inventory summary and watchlist state.

Implementation note:
- The current event catalog query still uses JPA Specification in code.
- For new or expanded dynamic query composition, the preferred repository direction is QueryDSL-backed query code rather than adding more Specification chains.

### View Event Detail
1. Frontend requests an event by id.
2. API loads event, creator info, remaining capacity, and current user's watchlist state.
3. Frontend renders the detail page and reserve CTA.

### Create Booking
1. Authenticated user submits a booking request for an event.
2. API validates event status, reservation-open time, capacity, and duplicate-booking rules.
3. API atomically decrements capacity and creates the booking.
4. API returns a booking confirmation payload.

Implementation note:
- event list, event detail, booking creation, event creation, and booking query flows are currently implemented in the backend baseline
- the frontend now uses same-origin proxy routes for login, logout, and current-user bootstrap
- the first real frontend slice still consumes event, booking, and watchlist flows through a Next.js server-side backend wrapper with development auth fallback available
- watchlist save and remove flows now work against session auth or the development fallback
- dashboard and creator event listing remain target contract areas beyond the current temporary auth mechanism

### Create Event
1. Authenticated creator submits the create-event form.
2. API validates required fields and schedule rules.
3. API stores the new event and initial inventory.
4. API returns the created event summary.

### Dashboard Load
1. Frontend requests user summary and supporting lists.
2. API aggregates stats, bookings, watchlist, and creator-owned event data.
3. Frontend renders dashboard sections using those summaries.

## Inferred Backend Requirements

### Role And Permission Model
- A user account must carry enough information to determine creator access
- Event creation and creator-event management must be creator-only actions
- Booking and watchlist actions require an authenticated user

### Validation Rules
- `price >= 0`
- `totalSlots >= 1`
- reservation-open datetime must be before event datetime
- category must be one of the supported values
- event title, description, location, and image reference are required by current product expectations

### Pagination
- event list
- my bookings
- my events
- watchlist-backed sections when they become list endpoints

### Error Contract
At minimum, the API must distinguish:
- unauthenticated
- forbidden
- validation failure
- sold out
- already booked
- event not found
- booking not found

### Concurrency Guarantees
- booking creation must protect remaining capacity
- duplicate booking prevention must not rely only on client behavior
- DB constraints and transactional logic must both be used where appropriate

## Architecture Principles
- Product-critical flows come first
- Backend contracts should be minimal but implementable
- Keep event and booking terminology distinct
- Prefer current-safe synchronous booking semantics over speculative async booking complexity
- Derived UI sections should be owned by the server when business semantics matter

## Future-Only Extensions
The following are future scope and must not be described as the current architecture contract:
- signup and advanced auth flows
- payment integration
- notification delivery
- Redis waiting room
- queue-based traffic shaping
- Kafka-based asynchronous booking confirmation
- advanced observability and operations tooling
