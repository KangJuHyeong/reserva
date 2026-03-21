# db.md

## 1. Purpose
This document defines the minimum persistence model required to support the current prototype and the inferred backend requirements behind it.

The goal is not to model every future system idea. The goal is to safely support:
- event discovery
- event detail
- bookings
- booking detail
- creator event creation
- watchlists
- minimal auth state

Current implemented baseline:
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

Migration rule for implemented schema changes:
- do not modify already-applied migration versions
- add a new versioned migration file for later schema changes

## 2. Core Data Model

### 2.1 users
Purpose:
- stores application users
- supports authentication and current-user loading
- supports creator capability through a role field

Recommended columns:
- `id`
- `email`
- `password_hash`
- `display_name`
- `role`
- `profile_image_url`
- `created_at`
- `updated_at`

Notes:
- `role` can initially be `user` or `creator`
- a separate creator profile table is optional; a role field is enough for current scope

### 2.2 events
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

Required support from this table:
- discovery summaries
- event detail
- creator-owned event listing

Recommended enums:
- `status`: `draft | published | cancelled | completed`
- `visibility`: `public | private`

### 2.3 event_inventory
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

Why separate inventory:
- keeps capacity updates isolated
- makes concurrency-focused locking rules easier to reason about

### 2.4 bookings
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

Notes:
- `booking_code` is the human-facing id used by the booking detail page
- `participant_name` supports the current booking detail UX
- `unit_price` and `total_amount` preserve price context at booking time

Recommended status values:
- `confirmed`
- `completed`
- `cancelled`

### 2.5 watchlists
Purpose:
- persists per-user saved events

Recommended columns:
- `id`
- `user_id`
- `event_id`
- `created_at`

Rules:
- unique pair on `(user_id, event_id)`

Why first-class persistence:
- the prototype uses watchlist state across multiple surfaces
- homepage and cards both depend on stable per-user watchlist state

## 3. Relationships
- `users 1:N events`
- `events 1:1 event_inventory`
- `users 1:N bookings`
- `events 1:N bookings`
- `users N:M events` through `watchlists`

## 4. Required Constraints

### 4.1 Auth And Identity
- `users.email` must be unique

Currently implemented:
- `users.email` unique

### 4.2 Watchlist Integrity
- unique `(user_id, event_id)` on `watchlists`

Currently implemented:
- unique `(user_id, event_id)` on `watchlists`

### 4.3 Booking Integrity
- unique human-facing `booking_code`
- duplicate-booking prevention policy should be enforced by application logic and, where product rules allow, a DB-level uniqueness strategy

Currently implemented:
- unique `booking_code`

### 4.4 Schedule Integrity
Validation should ensure:
- `reservation_open_datetime < event_datetime`

This can be enforced primarily at application level, with DB checks where supported and practical.

## 5. Concurrency And Integrity Rules

### 5.1 Booking Creation
Booking creation must atomically do both:
- reserve available slots
- persist the booking

The system must never create a booking without successfully consuming capacity.

### 5.2 Capacity Protection
Recommended approaches:
- pessimistic lock on `event_inventory`
- conditional update on `reserved_slots`

Either approach is acceptable as long as:
- overbooking is prevented
- the booking transaction is atomic
- retry behavior is well understood

Current implemented approach:
- pessimistic locking on `event_inventory` during booking creation

### 5.3 Duplicate Booking Prevention
The client is not enough.

Required protection:
- application-level duplicate check
- DB-backed rule where feasible

Current docs assume a user should not create duplicate active bookings for the same event unless product policy changes later.

## 6. Query Support

### 6.1 Event Discovery
The schema must support:
- category filtering
- text search on title and location, or a search-friendly alternative
- published/public event listing
- ordering by derived sections

### 6.2 Dashboard
The schema must support:
- bookings by user
- events by creator
- watchlist counts
- booking status counts

### 6.3 Booking Detail
The schema must support:
- event snapshot data via join to current event
- booking-specific values such as participant name, ticket count, price summary, and booking code

## 7. Recommended Indexes
- `users(email)` unique
- `events(creator_id, created_at desc)`
- `events(category, status, visibility, event_datetime)`
- `event_inventory(event_id)` unique
- `bookings(user_id, booked_at desc)`
- `bookings(event_id, status)`
- `bookings(booking_code)` unique
- `watchlists(user_id, created_at desc)`
- `watchlists(user_id, event_id)` unique

Search-specific indexes can be adjusted later based on the real query engine and DB choice.

## 8. Data Not Finalized Yet
These parts are intentionally under-specified:
- final image upload/storage subsystem
- creator profile extension table vs simple role field
- payment records
- notification delivery tables
- advanced audit logging

Only the minimum fields needed to support the current UI are documented now.

## 9. Future-Only Persistence
The following are future scope and should not be treated as current required tables:
- waiting room queue tables
- Kafka processing tables
- async booking attempt ledger
- idempotency ledger beyond what current booking implementation needs

If introduced later, they should be appended as roadmap extensions rather than redefining the current schema baseline.

## 10. Summary
The current DB baseline should safely support:
- users and roles
- event listings and creator ownership
- event capacity
- bookings with user-facing booking detail data
- watchlists

The most important invariants are:
- no overbooking
- no unsafe duplicate bookings
- stable watchlist state
- enough persisted data to render dashboard and booking detail views

Current implemented DB constraints also include:
- `total_slots >= 1`
- `reserved_slots >= 0`
- `reserved_slots <= total_slots`
