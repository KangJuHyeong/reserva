# Architecture

This document describes the current system architecture for the product baseline.

Use `agent.md` for scope boundaries and `docs/product/implementation-status.md` for current implementation coverage.

## Current System Responsibilities

### Auth Service
Status:
- implemented in the current backend baseline

Responsibilities:
- handle `POST /auth/login`
- return current user from `GET /me`
- end session through `POST /auth/logout`
- expose the current user's identity to the rest of the system

Current documented default:
- server-managed session authentication

Current temporary implementation:
- `POST /auth/login` creates an HTTP session after email/password verification
- `GET /me` returns the current authenticated user from the active session
- `POST /auth/logout` invalidates the active session
- protected routes can still resolve current-user from request headers `X-User-Id` and `X-User-Name` only as a development fallback when enabled
- this header-based fallback is temporary and not the final auth contract

### Event Catalog Service
Status:
- implemented in the current backend baseline

Responsibilities:
- list events for the home page
- support search and category filtering
- support pagination
- provide server-owned derived sections such as trending, ending soon, opening soon, and watchlist
- return watchlist state for the current user when authenticated

### Event Detail Service
Status:
- implemented in the current backend baseline

Responsibilities:
- return a single event by id
- include event, host, inventory, and watchlist state needed by the detail screen
- provide the current reservation-open datetime and current fill state

### Booking Service
Status:
- implemented in the current backend baseline

Responsibilities:
- create bookings from an event detail action
- protect slot integrity under concurrent access
- prevent duplicate bookings according to product policy
- expose my bookings list and booking detail
- preserve booking snapshots needed for the confirmation page

### Watchlist Service
Status:
- implemented in the current backend baseline

Responsibilities:
- add an event to a user's watchlist
- remove an event from a user's watchlist
- support the homepage watchlist section and event-card watchlist toggles

### Event Management Service
Status:
- implemented in the current backend baseline

Responsibilities:
- create events
- list the current authenticated user's created events

Current baseline:
- event creation is implemented
- created-events listing is implemented through `GET /me/events`

### Dashboard Aggregation
Status:
- implemented in the current backend baseline

Responsibilities:
- aggregate counts and preview lists for dashboard overview
- return my bookings summary
- return created-events summary
- return watchlist summary

## Logical Components
- Web frontend
  - renders discovery, event detail, booking detail, dashboard, my-events, create, and login routes
- API application
  - handles auth, events, bookings, watchlists, dashboard, and my-events actions
- Relational database
  - stores users, events, inventory state, bookings, and watchlists
- Optional media layer
  - stores or references uploaded event cover images

Current backend baseline:
- Spring Boot API application
- Spring Data JPA for persistence
- QueryDSL for dynamic repository query composition where needed
- MySQL relational database
- Flyway-managed schema migrations
- `backend/.env`-driven datasource configuration
- local CORS allowed origin defaulting to `http://localhost:3000`

Current frontend baseline:
- Next.js App Router application in `frontend`
- live routes: discovery, event detail, booking detail, dashboard, my-events, create, and login
- same-origin proxy routes for login, logout, current-user bootstrap, booking, and watchlist mutations

## Request Flow Overview

### Browse Events
1. Frontend requests the event list with search, category, section, and page inputs.
2. API applies filters and derived-section rules through the event query layer.
3. API returns event cards with inventory summary and watchlist state.

### View Event Detail
1. Frontend requests an event by id.
2. API loads event, creator info, remaining capacity, and current user's watchlist state.
3. Frontend renders the detail page and reserve CTA.

### Create Booking
1. Authenticated user submits a booking request for an event.
2. API validates event status, reservation-open time, capacity, and duplicate-booking rules.
3. API atomically decrements capacity and creates the booking.
4. API returns a booking confirmation payload.

### Query My Bookings
1. Authenticated user requests booking list or booking detail.
2. API loads the user's booking records and related event data.
3. Frontend renders the booking summary or detail page.

### Save Or Remove Watchlist
1. Authenticated user toggles watchlist state from discovery or detail.
2. API validates the event and persists or removes the watchlist entry.
3. Frontend updates watchlist state in place.

### Create Event
1. Authenticated user submits the create-event form.
2. API validates required fields and schedule rules.
3. API stores the new event and initial inventory.
4. API returns the created event summary.

### Load Dashboard
1. Frontend requests current-user identity and dashboard summary data.
2. API aggregates recent bookings, watchlist previews, opening-soon previews, and created-events counts for the current user.
3. Frontend renders the dashboard sections using those personalized summaries.

### Load My Events
1. Authenticated user requests the created-events list.
2. API loads only the current user's created events ordered by newest first.
3. Frontend renders the paginated `/my-events` page.

## Inferred Backend Requirements

### Auth And Access Model
- Event creation and my-events listing require an authenticated user
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
- Keep service ownership aligned to feature domains rather than temporary task groupings

## Future-Only Extensions
The following are future scope and must not be described as the current architecture contract:
- signup and advanced auth flows
- payment integration
- notification delivery
- Redis waiting room
- queue-based traffic shaping
- Kafka-based asynchronous booking confirmation
- advanced observability and operations tooling
