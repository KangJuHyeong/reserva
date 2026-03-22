# Database Model

This document defines the minimum persistence model for the current product baseline and inferred backend requirements.

Use `docs/product/implementation-status.md` for current migration coverage and `agent.md` for scope boundaries.

## Current Baseline
Current implemented tables:
- `users`
- `events`
- `event_inventory`
- `bookings`
- `watchlists`

Current migration baseline:
- `V1__create_users.sql`
- `V2__create_events_and_event_inventory.sql`
- `V3__create_bookings.sql`
- `V4__create_watchlists.sql`

Migration rule:
- do not modify already-applied migration versions
- add a new versioned migration file for later schema changes

## Core Data Model

### users
Purpose:
- stores application users
- supports authentication and current-user loading
- supports creator capability through a role field
- backs the current session login contract without a separate auth table

Recommended columns:
- `id`
- `email`
- `password_hash`
- `display_name`
- `role`
- `profile_image_url`
- `created_at`
- `updated_at`

Rules:
- `email` is unique
- `password_hash` stores a one-way password hash suitable for BCrypt verification

### events
Purpose:
- stores joinable event listings shown on the home page and event detail page

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
- stores current capacity state separate from event content fields

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
- stores a user's confirmed reservation record for an event

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
- persists per-user saved events

Recommended columns:
- `id`
- `user_id`
- `event_id`
- `created_at`

Rules:
- unique pair on `(user_id, event_id)`

## Relationships
- `users 1:N events`
- `events 1:1 event_inventory`
- `users 1:N bookings`
- `events 1:N bookings`
- `users N:M events` through `watchlists`

## Required Constraints

### Auth And Identity
- `users.email` must be unique

### Watchlist Integrity
- unique `(user_id, event_id)` on `watchlists`

### Booking Integrity
- unique human-facing `booking_code`
- duplicate-booking prevention policy should be enforced by application logic and, where product rules allow, a DB-level uniqueness strategy

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

Current implemented approach:
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
- events by creator
- watchlist counts
- booking status counts

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

## Future-Only Persistence
The following are future scope and should not be treated as current required tables:
- waiting room queue tables
- Kafka processing tables
- async booking attempt ledger
- idempotency ledger beyond what current booking implementation needs
