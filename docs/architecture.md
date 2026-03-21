# architecture.md

## 1. Purpose
This document describes the current system architecture needed to support the visible prototype in `prototype/b_XRSe9jZaGQj-1773064905125`.

The current product is an event reservation marketplace. The architecture should support the prototype's real flows first and keep scalability-oriented ideas as future roadmap material.

## 2. Current Product Flows
The architecture must support these flows:
- browse events
- search and filter events
- inspect event detail
- reserve a spot in an event
- save and remove watchlist items
- manage my bookings
- inspect booking detail
- manage creator-owned events
- create an event
- authenticate a user

## 3. Current System Responsibilities

### 3.1 Auth Service
Responsibilities:
- handle `POST /auth/login`
- return current user from `GET /me`
- end session through `POST /auth/logout`
- expose the current user's role and identity to the rest of the system

Current default:
- server-managed session authentication is the simplest starting point for documentation

Current temporary implementation:
- current-user resolution from request headers `X-User-Id`, `X-User-Name`, `X-User-Role`
- this is a development-only temporary mechanism, not the final auth contract

Future scope:
- signup
- OAuth
- password reset
- email verification

### 3.2 Event Catalog Service
Responsibilities:
- list events for the home page
- support search and category filtering
- support pagination
- provide server-owned derived sections such as trending, ending soon, and opening soon
- return watchlist state for the current user when authenticated

### 3.3 Event Detail Service
Responsibilities:
- return a single event by id
- include event, host, inventory, and watchlist state needed by the detail screen
- provide the current reservation-open datetime and current fill state

### 3.4 Booking Service
Responsibilities:
- create bookings from an event detail action
- protect slot integrity under concurrent access
- prevent duplicate bookings according to product policy
- expose my bookings list and booking detail
- preserve booking snapshots needed for the confirmation page

### 3.5 Watchlist Service
Responsibilities:
- add an event to a user's watchlist
- remove an event from a user's watchlist
- support the homepage watchlist section and event-card watchlist toggles

### 3.6 Creator Event Management Service
Responsibilities:
- create events
- validate creator-only access
- list the current creator's events for dashboard use

### 3.7 Dashboard Aggregation
Responsibilities:
- aggregate counts and preview lists for dashboard overview
- return my bookings summary
- return created-events summary
- return watchlist summary

## 4. Logical Components
The current architecture can be described as these logical components:

- Web frontend
  - renders discovery, event detail, booking detail, dashboard, create, and login pages
- API application
  - handles auth, events, bookings, watchlists, and creator actions
- Relational database
  - stores users, roles, events, inventory state, bookings, and watchlists
- Optional media layer
  - stores or references uploaded event cover images

For current docs, media upload can remain abstracted as `imageUrl` storage rather than a finalized storage subsystem.

Current backend baseline:
- Spring Boot API application
- MySQL relational database
- Flyway-managed schema migrations
- root `.env`-driven datasource configuration

Current frontend baseline:
- Next.js App Router application in `frontend`
- current connected frontend slice: discovery, event detail, booking creation, booking detail
- current placeholder frontend routes: dashboard, create, login

## 5. Request Flow Overview

### 5.1 Browse Events
1. Frontend requests event list with search, category, and page inputs.
2. API applies filters and derived section rules.
3. API returns event cards with inventory summary and watchlist state.

### 5.2 View Event Detail
1. Frontend requests an event by id.
2. API loads event, creator info, remaining capacity, and current user's watchlist state.
3. Frontend renders detail page and reserve CTA.

### 5.3 Create Booking
1. Authenticated user submits booking request for an event.
2. API validates event status, reservation-open time, capacity, and duplicate-booking rules.
3. API atomically decrements capacity and creates booking.
4. API returns booking confirmation payload.

Implementation note:
- the event list, event detail, booking creation, and booking query flows are currently the implemented backend baseline
- the first real frontend slice now consumes those flows through a Next.js server-side backend wrapper with temporary development auth headers
- auth, watchlist, dashboard, and creator management remain target contract areas beyond the current temporary auth mechanism

### 5.4 Create Event
1. Authenticated creator submits the create-event form.
2. API validates required fields and schedule rules.
3. API stores the new event and initial inventory.
4. API returns the created event summary.

### 5.5 Dashboard Load
1. Frontend requests user summary and supporting lists.
2. API aggregates stats, bookings, watchlist, and creator-owned event data.
3. Frontend renders dashboard sections using those summaries.

## 6. Inferred Backend Requirements
These items are not always visible in the UI, but they are required to make the product safe and implementable.

### 6.1 Role And Permission Model
- A user account must carry enough information to determine creator access
- Event creation and creator-event management must be creator-only actions
- Booking and watchlist actions require an authenticated user

### 6.2 Validation Rules
- `price >= 0`
- `totalSlots >= 1`
- reservation-open datetime must be before event datetime
- category must be one of the supported values
- event title, description, location, and image reference are required by current product expectations

### 6.3 Pagination
- Event list
- My bookings
- My events
- Watchlist-backed sections when they become list endpoints

### 6.4 Sorting And Derived Sections
- search and category filters must be stable
- trending and ending soon should be server-derived, not frontend-invented
- opening soon should be derived from future reservation-open datetime

### 6.5 Error Contract
At minimum, the API must distinguish:
- unauthenticated
- forbidden
- validation failure
- sold out
- already booked
- event not found
- booking not found

### 6.6 Concurrency Guarantees
- booking creation must protect remaining capacity
- duplicate booking prevention must not rely only on client behavior
- DB constraints and transactional logic must both be used where appropriate

## 7. Current Architecture Principles
- Prototype-visible flows come first
- Backend contracts should be minimal but implementable
- Keep event and booking terminology distinct
- Prefer current-safe sync booking semantics over speculative async booking complexity
- Derived UI sections should be owned by the server when business semantics matter

## 8. Future Roadmap
These items are future scope and must not be described as the current architecture contract:
- signup and advanced auth flows
- payment integration
- notification delivery
- Redis waiting room
- queue-based traffic shaping
- Kafka-based asynchronous booking confirmation
- advanced observability and operations tooling

If adopted later, they should extend the current marketplace architecture rather than redefine the current product story.

## 9. Summary
The current architecture is a straightforward product-serving architecture:
- authenticate user
- serve event discovery and detail
- create and query bookings safely
- support watchlists
- support creator event management
- aggregate dashboard views

Scalability architecture remains valuable, but it is not the mainline story of the current product.

Current implementation status should be read separately from the target contract:
- implemented now: event discovery, event detail, booking creation, booking queries
- not yet fully implemented: documented auth endpoints, watchlists, creator endpoints, dashboard aggregation
