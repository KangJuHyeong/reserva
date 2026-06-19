# README Product Demo Redesign

Date: 2026-06-19

## Goal

Rewrite the project README as a product-demo-focused portfolio page for hiring or portfolio reviewers.

The README should present Reserva as a locally reproducible event reservation service. It should not depend on the deployed URL because the deployment may be taken down. The opening impression should come from product screenshots and end-to-end user flows, not from a performance report.

## Audience

Primary audience:
- Hiring and portfolio reviewers

Reader expectations:
- Quickly understand what the product does
- See evidence that the service is implemented end to end
- Understand the main technology choices
- See one strong backend engineering highlight
- Reproduce the demo locally if they want to inspect it

## Scope

In scope:
- Replace the current README structure with a product-demo-centered portfolio README
- Remove deployed-site emphasis
- Add local screenshots captured from seeded demo data
- Summarize the technology stack by purpose
- Highlight reservation concurrency control
- Document local execution, demo accounts, and seed options
- Improve demo seed data so screenshots are rich and repeatable

Out of scope:
- Performance optimization narrative
- k6 p95 improvement tables in the README
- Public deployment documentation as a primary README section
- New product features beyond demo data needed for screenshots
- Payment, notification, queue-based waiting room, or Kafka-based booking flow

## README Structure

### 1. Project Introduction

Open with a short Korean introduction that explains Reserva as an event reservation platform.

The introduction should emphasize:
- Users can discover events, save them, and create reservations
- Hosts can create and manage events
- The project is locally reproducible with demo data
- The main engineering focus is reservation correctness under concurrent requests

Do not lead with a deployment URL.

### 2. Demo Screens

Add a visual demo section near the top of the README.

Recommended primary screenshots:
- Home and event discovery
- Event detail and reservation call to action
- Booking confirmation or booking detail
- User dashboard
- Host event management
- Event creation form

Recommended secondary screenshots:
- Login or signup
- Watchlist state
- Concurrency verification result

Image location:
- `docs/assets/readme/`

Image style:
- Use PNG screenshots
- Prefer several focused screenshots over a long animated GIF
- Keep filenames stable and descriptive, such as `home-discovery.png`

### 3. Main Features

Group features by product role:
- User: discovery, search, filtering, event detail, booking, booking cancellation, watchlist, dashboard
- Host: event creation, created-event list, event editing/deletion where supported by current code
- Auth: email/password login, signup, Google OAuth support if still available in local configuration
- Reservation control: capacity validation, duplicate booking prevention, concurrent booking protection

### 4. Tech Stack

Present technologies by responsibility, not as a flat list.

Frontend:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Route handlers for same-origin API boundaries and auth-cookie handling

Backend:
- Spring Boot
- Spring Security
- Spring Data JPA
- QueryDSL
- Flyway

Data and infrastructure:
- MySQL
- Redis
- Docker Compose
- Nginx and container deployment assets as supporting infrastructure, not the README's main story

Validation and testing:
- Backend unit/service tests
- Local end-to-end browser verification for README screenshots
- Focused concurrent booking verification

### 5. Core Technical Highlight: Concurrent Reservation Control

Keep one deep technical section focused on booking correctness.

Problem:
- Multiple users can attempt to reserve the same event at the same time
- A naive implementation can oversell seats or allow duplicate bookings

Solution:
- Use a short-lived Redis booking admission lock per event
- Validate event state, reservation-open time, remaining capacity, and duplicate booking rules
- Apply booking creation and inventory updates inside a database transaction
- Fail closed when reservation-control Redis is unavailable

Evidence:
- Add a concise table or screenshot showing a local concurrent booking verification
- Emphasize correctness, not latency
- Example checks: `reserved_slots <= total_slots`, duplicate active bookings are not created, expected conflicts are returned

### 6. Local Execution

Document a local-first run path:
- Start MySQL and Redis with `infra/local/compose.yml`
- Run the backend
- Run the frontend
- Enable demo seed data for screenshot-ready content

The README should mention required environment variables and point to existing local infra docs where appropriate.

### 7. Demo Accounts And Seed Data

Use the existing demo account pattern and document it clearly:
- User: `alex@example.com` / `dev-password`
- Host: `creator@example.com` / `dev-password`

Seed data should support:
- Rich home discovery
- Open reservation event
- Opening-soon event
- Ending-soon event
- Nearly sold out or sold out event
- Existing user booking
- Existing user watchlist
- Host-owned event list

The preferred implementation is to extend `DevDataSeeder` so `SEED_DEMO_DATA=true` is enough for README capture.

### 8. Screenshot Reproduction Notes

Add a short note that the README screenshots were captured from local seeded data.

Include:
- Seed flags used
- Demo accounts used
- Suggested browser route sequence for recapturing images

## E2E Capture Plan

Capture the following flow locally after seed data is ready:

1. Log in as the demo user.
2. Capture the home discovery screen.
3. Search or filter events and capture a rich event list state if useful.
4. Open an event detail page with available seats.
5. Create a booking and capture confirmation or booking detail.
6. Capture the dashboard with non-empty summary sections.
7. Capture watchlist state if it is visually distinct.
8. Log in as the host account.
9. Capture the host's created events page.
10. Capture the event creation form.
11. Run a focused concurrent booking verification and capture its result as a screenshot or table.

## Demo Data Design

Extend demo data conservatively.

Add or adjust seeded entities so the local product looks alive:
- Several public events across categories
- Different reservation states: open, opening soon, ending soon, nearly sold out
- At least one booking for the demo user
- At least one watchlist item for the demo user
- Several events owned by the demo host

Avoid overfitting seed data to screenshots. The data should still feel like plausible local demo content.

## Acceptance Criteria

The README redesign is complete when:
- The README no longer relies on a public deployed URL
- The top section presents the product with local demo screenshots
- The technology stack is explained by responsibility
- The only deep technical narrative is concurrent reservation control
- Performance improvement details are omitted from the main README
- Demo accounts and local seed instructions are documented
- Screenshots are stored under `docs/assets/readme/`
- A reviewer can understand the product and its main engineering point in a few minutes

## Self-Review

Placeholder scan:
- No TBD or TODO placeholders remain.

Consistency check:
- The README direction, screenshot plan, seed-data plan, and concurrency highlight all target the same audience: portfolio reviewers.

Scope check:
- The work is focused enough for one implementation plan: README rewrite, demo seed enhancement, local screenshot capture, and concurrency evidence.

Ambiguity check:
- Performance optimization content is explicitly out of scope for the README.
- Public deployment is explicitly not the primary README story.
