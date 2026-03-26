# Architecture

This document describes the current product-baseline system responsibilities, request flows, and system boundaries.

Use `agent.md` for scope boundaries and `docs/product/implementation-status.md` for current implementation coverage.

## Status Frame

### Current
- The system currently runs around `frontend`, `backend`, and a relational database.
- The main user-visible flows in scope are discovery, event detail, booking, watchlist, dashboard, my-events, create, and login.
- Authentication uses the same session-first contract across login, me, logout, and protected routes.

### Temporary
- No temporary auth fallback remains in the current baseline.
- Frontend hosting is temporarily shifting from EC2 semideploy to Vercel while backend and MySQL continue on EC2.

### Target
- Keep the current route split where dashboard remains a summary workspace and my-events remains the created-events workspace.
- Keep the current session-based protected-route contract even if new login providers are introduced.
- Prepare the system for lightweight external deployment without changing the current product route model.

### Out Of Scope
- Advanced authentication flows
- Payments
- Notifications
- Queue-based traffic control
- Kafka-based asynchronous booking confirmation

### Approved Next-Phase Candidates
- EC2 semideploy packaging with containerized backend services and optional containerized database
- reverse-proxy setup suitable for lightweight external access
- Google OAuth added as an additional login entry point
- Redis added as infrastructure for queue-ready reservation control

## Deployment Topology

### Current
- Deployment assets exist for a single-host EC2 semideploy baseline.
- `nginx` is the public entrypoint.
- `backend` runs behind the proxy.
- `mysql` can run as a container on the same host for the default lightweight deployment.
- The frontend is expected to run on Vercel and reach the backend through the public nginx origin.

### Target
- CI builds and publishes the versioned backend image used by EC2.
- EC2 pulls the published image and restarts the stack through Docker Compose.
- Runtime env files remain on the server and are mounted or referenced at deploy time instead of being stored in Git.
- The semideploy layout should keep backend and database access private to the internal Docker network even when the database moves off-host later.
- The frontend host should keep browser traffic same-origin and use its server runtime and route handlers to forward cookies to the backend.

## Logical Components

### Frontend Web App
Responsibilities:
- render discovery, event detail, booking detail, dashboard, my-events, create, and login routes
- connect auth, booking, and watchlist mutations through same-origin API routes
- manage query-string-based search, filter, and pagination state
- read `BACKEND_BASE_URL` from runtime env so the same build can target either local backend, EC2 backend, or other environments without code changes
- surface explicit backend-unavailable fallback states when the frontend runtime cannot reach the backend

Current baseline:
- Next.js App Router application
- `frontend/app` and `frontend/components` centered structure
- Vercel-friendly runtime because protected mutations already flow through same-origin Next.js route handlers

### Backend API Application
Responsibilities:
- provide auth, events, bookings, watchlists, dashboard, and my-events capabilities
- perform validation, authorization, and error mapping
- compute derived sections and compose user-specific payloads

Current baseline:
- Spring Boot
- Spring Data JPA
- QueryDSL

### Relational Database
Responsibilities:
- persist users, events, inventory, bookings, and watchlists
- support booking integrity and watchlist uniqueness

Current baseline:
- MySQL
- Flyway-managed migrations

### Optional Media Layer
Responsibilities:
- store or reference event cover images

Current baseline:
- image-URL-reference-first approach

## Feature Responsibility Map

### Auth
Current:
- `POST /auth/login`
- `GET /me`
- `POST /auth/logout`
- expose the current user identity to the rest of the system

### Event Catalog
Current:
- provide the home-page event list
- support search, category filtering, and pagination
- compute trending, ending soon, opening soon, and watchlist sections
- return watchlist state for authenticated users

### Event Detail
Current:
- load one event by id
- include host info, inventory state, and watchlist state
- provide reservation-open datetime and fill state

### Booking
Current:
- create bookings from event detail
- protect slot integrity under concurrent access
- prevent duplicate bookings
- expose my-bookings list and detail
- preserve snapshot data required by the confirmation view

### Watchlist
Current:
- save and remove watchlist items
- support the home watchlist view and card/detail toggles

### Event Management
Current:
- create events
- list the current user's created events

### Dashboard Aggregation
Current:
- aggregate dashboard overview counts and preview lists
- return recent bookings, watchlist summary, created-events summary, and opening-soon preview

## Request Flow Overview

### External Request Routing
1. The browser connects to the frontend host, expected to be Vercel.
2. The frontend host serves pages and same-origin route handlers such as `/api/auth/*`, `/api/me`, and mutation proxies.
3. The frontend server runtime calls the EC2 backend through `BACKEND_BASE_URL` and forwards incoming cookies.
4. If the frontend runtime cannot reach the backend, server-rendered pages and same-origin proxy routes should fail with an explicit backend-unavailable state instead of an opaque runtime crash.
5. The EC2 nginx host routes `/api/v1/*` traffic to the backend container and keeps MySQL private on the internal Docker network.

### Browse Events
1. The frontend requests the event list with search, category, section, and page inputs.
2. The API applies filters and derived-section rules in the event query layer.
3. The API returns event cards with inventory summary and watchlist state.

### View Event Detail
1. The frontend requests the event detail by id.
2. The API loads the event, host, remaining capacity, and watchlist state.
3. The frontend renders the detail page and reserve CTA.

### Create Booking
1. An authenticated user submits a booking request for an event.
2. The API validates event state, reservation-open time, capacity, and duplicate-booking rules.
3. The API atomically decrements capacity and creates the booking.
4. The API returns a booking confirmation payload.

### Query My Bookings
1. An authenticated user requests the booking list or booking detail.
2. The API loads the user's bookings and related event data.
3. The frontend renders the summary or detail page.

### Save Or Remove Watchlist
1. An authenticated user toggles watchlist state from discovery or detail.
2. The API validates the event and persists or removes the watchlist entry.
3. The frontend updates watchlist state in place.

### Create Event
1. An authenticated user submits the create-event form.
2. The API validates required fields and schedule rules.
3. The API stores the new event and initial inventory.
4. The API returns the created event summary.

### Load Dashboard
1. The frontend requests current-user identity and dashboard summary data.
2. The API aggregates recent bookings, watchlist preview, opening-soon preview, and created-events counts.
3. The frontend renders the personalized dashboard sections.

### Load My Events
1. An authenticated user requests the created-events list.
2. The API loads only the current user's events, ordered newest first.
3. The frontend renders the paginated `/my-events` page.

## Required Backend Rules

### Auth And Access
- Event creation and my-events listing require an authenticated user.
- Booking and watchlist actions require an authenticated user.

### Validation
- `price >= 0`
- `totalSlots >= 1`
- `reservationOpenDateTime < eventDateTime`
- category must be one of the supported values
- title, description, location, and image reference are required by current product expectations

### Error Contract
At minimum, the API must distinguish:
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `EVENT_NOT_FOUND`
- `BOOKING_NOT_FOUND`
- `EVENT_SOLD_OUT`
- `ALREADY_BOOKED`

### Concurrency
- Booking creation must protect remaining capacity.
- Duplicate booking prevention must not rely on client behavior alone.
- DB constraints and transactional logic should be combined where needed.

## Architecture Principles
- Prioritize product-critical flows.
- Keep backend contracts minimal but implementable.
- Keep event and booking terminology distinct.
- Prefer safe synchronous booking semantics over speculative async complexity.
- Let the server own derived UI sections when business semantics matter.
- Keep service ownership aligned to feature domains instead of temporary task groupings.
- Extend auth through the existing session runtime contract before considering broader auth redesign.
- Introduce queue infrastructure in narrow, replaceable seams before committing to a large visible waiting-room experience.
