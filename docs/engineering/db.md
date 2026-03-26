# Database Model

This document defines the minimum persistence model and integrity requirements for the current product baseline.

Use `docs/product/implementation-status.md` for current implementation coverage and `agent.md` for scope boundaries.

## Status Frame

### Current
- The current baseline tables are `users`, `events`, `event_inventory`, `bookings`, and `watchlists`.
- The current migration baseline runs from `V1__create_users.sql` through `V5__add_google_subject_to_users.sql`.

### Temporary
- `users.role` still exists in the schema, but it is not the active product-level permission contract in the current baseline.

### Target
- Strengthen constraints, indexes, and query support in ways that preserve the current feature set safely.
- Add later schema changes through new versioned migrations instead of modifying already-applied ones.

### Out Of Scope
- waiting room queue tables
- Kafka processing tables
- async booking-attempt ledger
- idempotency ledger beyond what the current booking implementation needs

## Migration Rules
- Do not modify migration versions that have already been applied.
- Add all schema changes through new versioned migration files.

## Core Data Model

### users
Purpose:
- store application users
- support authentication and current-user loading
- support both booking and event creation through the same authenticated user model
- back local login and Google-linked login without a separate auth table for the first OAuth rollout

Recommended columns:
- `id`
- `email`
- `password_hash`
- `google_subject`
- `display_name`
- `role`
- `profile_image_url`
- `created_at`
- `updated_at`

Rules:
- `email` is unique
- `password_hash` stores a one-way hash suitable for BCrypt verification when local login is enabled
- `password_hash` may be null for OAuth-only users
- `google_subject` is nullable and unique when present
- `role` is a legacy column and is not the active product-level permission contract

### events
Purpose:
- store joinable event listings shown on the home page, event detail page, and my-events page

Recommended columns:
- `id`
- `creator_id`
- `title`
- `category`
- `description`
- `image_url`
- `location`
- `price`
- `event_datetime`
- `reservation_open_datetime`
- `status`
- `visibility`
- `created_at`
- `updated_at`

Recommended enums:
- `status`: `draft | published | cancelled | completed`
- `visibility`: `public | private`

### event_inventory
Purpose:
- store current capacity state separately from event content fields

Recommended columns:
- `event_id`
- `total_slots`
- `reserved_slots`
- `updated_at`

Rules:
- `total_slots >= 1`
- `reserved_slots >= 0`
- `reserved_slots <= total_slots`

### bookings
Purpose:
- store a user's confirmed reservation record for an event

Recommended columns:
- `id`
- `booking_code`
- `user_id`
- `event_id`
- `status`
- `participant_name`
- `ticket_count`
- `unit_price`
- `total_amount`
- `booked_at`
- `cancelled_at`
- `created_at`
- `updated_at`

Recommended status values:
- `confirmed`
- `completed`
- `cancelled`

### watchlists
Purpose:
- persist per-user saved events

Recommended columns:
- `id`
- `user_id`
- `event_id`
- `created_at`

Rules:
- keep `(user_id, event_id)` unique

## Relationships
- `users 1:N events`
- `events 1:1 event_inventory`
- `users 1:N bookings`
- `events 1:N bookings`
- `users N:M events` through `watchlists`

## Required Constraints

### Auth And Identity
- `users.email` must be unique
- `users.google_subject` must be unique when not null

### Watchlist Integrity
- `watchlists` requires unique `(user_id, event_id)`

### Booking Integrity
- human-facing `booking_code` must be unique
- duplicate-booking prevention should be enforced through application logic and, where feasible, DB-backed uniqueness strategy

### Schedule Integrity
- `reservation_open_datetime < event_datetime`

## Concurrency And Integrity Rules

### Booking Creation
Booking creation must atomically do both:
- reserve available slots
- persist the booking

### Capacity Protection
Recommended approaches:
- pessimistic lock on `event_inventory`
- conditional update on `reserved_slots`

Current:
- pessimistic locking on `event_inventory` during booking creation

### Duplicate Booking Prevention
Required protection:
- application-level duplicate check
- DB-backed rule where feasible

## Query Support
The schema must support:
- category filtering
- text search on title and location, or a search-friendly alternative
- published and public event listing
- bookings by user
- created events by user
- watchlist counts
- booking status counts

Query-layer convention:
- keep simple primary-key and fixed-predicate lookups in standard Spring Data JPA repository methods
- prefer QueryDSL for dynamic filtering, optional predicates, join-heavy list queries, and section-specific ordering rules
- treat JPA Specification as legacy or exception-based within this repository

## Recommended Indexes
- `users(email)` unique
- `events(creator_id, created_at desc)`
- `events(category, status, visibility, event_datetime)`
- `event_inventory(event_id)` unique
- `bookings(user_id, booked_at desc)`
- `bookings(event_id, status)`
- `bookings(booking_code)` unique
- `watchlists(user_id, created_at desc)`
- `watchlists(user_id, event_id)` unique
