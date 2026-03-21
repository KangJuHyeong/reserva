# agent.md

## 1. Purpose
This document is the implementation operating guide for this repository.

Its job is to keep code, product scope, and supporting docs aligned with the current prototype in `prototype/b_XRSe9jZaGQj-1773064905125`.

This is not the public-facing project introduction. Use `README.md` for the external summary.

## 2. Source Of Truth Order
When documents conflict, use this order:

1. `prototype/b_XRSe9jZaGQj-1773064905125`
2. `agent.md`
3. `docs/frontend-architecture.md`
4. `docs/api-spec.md`
5. `docs/db.md`
6. `docs/architecture.md`
7. `README.md`

Rules:
- The prototype is the primary product truth for visible pages, flows, fields, and terminology.
- The docs define the minimum backend and data model required to support the prototype.
- Do not invent extra product scope unless it is clearly required to make the visible flows implementable.
- Use `docs/IMPLEMENTATION-STATUS.md` for fast current-state checks.
- Use `docs/DECISIONS.md` for short-form current and temporary decision context.

## 3. Current Product Definition
The current product is an event reservation marketplace.

Primary user-visible flows:
- Browse events on the home page
- Search and filter events
- View event detail
- Reserve a spot
- Save and remove watchlist items
- View personal dashboard
- View booking detail
- Create an event
- Log in

Current canonical routes:
- `/`
- `/reservation/[id]`
- `/booking/[id]`
- `/dashboard`
- `/create`
- `/login`

Terminology:
- `event`: a joinable listing shown in discovery and detail pages
- `booking`: a user's confirmed reservation record for an event
- `creator`: a user allowed to create and manage events
- `watchlist`: a per-user saved-events collection

## 4. Documentation Boundaries
Every change should be classified into one of these buckets.

### 4.1 Current Scope
Use for behavior already visible in the prototype or directly required by visible pages.

Examples:
- Event discovery and filtering
- Event detail view
- Join flow
- Dashboard sections
- Booking detail
- Event creation form
- Minimal login flow
- Watchlist behavior

### 4.2 Minimum Inferred Backend Requirements
Use for requirements not directly visible in the UI but necessary to implement it safely.

Examples:
- Role and permission model
- Pagination for list endpoints
- Validation rules
- Error contracts
- Slot decrement concurrency control
- Duplicate booking prevention
- Booking and watchlist persistence

### 4.3 Future Scope
Use for ideas not yet confirmed by the prototype.

Examples:
- Signup
- OAuth
- Password reset
- Email verification
- Payments
- Notifications
- Queue-based access
- Kafka-based async processing
- Redis waiting room

Do not move future scope into current scope without a visible product reason or explicit instruction.

## 5. Current Implementation Priorities
If code implementation starts from this document, the priority order is:

1. Event catalog and filtering
2. Event detail contract
3. Booking creation and inventory integrity
4. My bookings and booking detail
5. Watchlist persistence
6. Creator event creation and creator-owned event listing
7. Minimal auth contract
8. Dashboard aggregation

Why this order:
- The homepage and detail flows define the product.
- Booking integrity is more important than cosmetic completeness.
- Creator and dashboard features depend on auth and persisted event/booking data.

## 6. Minimal Auth Contract
Auth is intentionally small for the current docs.

Documented current auth endpoints:
- `POST /auth/login`
- `GET /me`
- `POST /auth/logout`

Current assumptions:
- Initial design can assume server-managed session auth.
- One user model can support creator capability through a role field.
- Advanced auth choices remain undecided and must stay labeled as future scope.

Do not document as confirmed:
- Signup API
- OAuth providers
- JWT vs session as a final architectural commitment
- Forgot password
- Email verification

## 7. Required Supporting Rules
These requirements are not always visible in the prototype, but they are required for a safe implementation.

### 7.1 Validation
- Event title, category, location, and description are required
- `price >= 0`
- `totalSlots >= 1`
- `reservationOpenDateTime < eventDateTime`
- Only creators can create events

### 7.2 Booking Integrity
- A sold-out event must reject additional bookings
- Duplicate booking protection must exist at application and DB levels
- Slot decrement and booking creation must be handled atomically
- Booking detail must preserve price context through snapshots or equivalent fields

### 7.3 List Behavior
- Discovery, bookings, and creator lists must support pagination
- Server should own derived sections such as trending, ending soon, and opening soon
- Filtering and sorting rules must be documented in the API contract, not inferred only from UI code

## 8. Documentation Update Rules
When product scope changes:
- Update `agent.md` if priorities, boundaries, or terminology change
- Update `README.md` if route-level summary or public product framing changes
- Update `docs/frontend-architecture.md` if page structure or UX states change
- Update `docs/api-spec.md` if routes, payloads, filters, or errors change
- Update `docs/db.md` if entities, constraints, or persistence rules change
- Update `docs/architecture.md` if service responsibilities or system boundaries change

When implementing code later, do not leave docs behind if API or persistence changes.
Temporary implementation details must be labeled as `temporary` in docs and must not be described as final architecture decisions.

## 9. Current Implementation Status
Use `docs/IMPLEMENTATION-STATUS.md` as the current-state board for new sessions and quick implementation checks.

Current backend baseline:
- Backend phase-1 skeleton exists in `backend`
- Root `.env` is used for datasource configuration
- Current backend implementation uses MySQL, Flyway, and JPA

Implemented now:
- `GET /api/v1/events`
- `GET /api/v1/events/{eventId}`
- `POST /api/v1/events/{eventId}/bookings`
- `GET /api/v1/me/bookings`
- `GET /api/v1/me/bookings/{bookingId}`

Temporary implementation detail:
- Current auth in code uses request headers `X-User-Id`, `X-User-Name`, and `X-User-Role`
- This temporary header-based mechanism is not the final documented auth contract

Related quick-reference docs:
- `docs/IMPLEMENTATION-STATUS.md`: implementation status and next priorities
- `docs/DECISIONS.md`: short-form decisions and temporary choices

## 10. Testing Expectations
When backend code changes:
- Run `backend\gradlew.bat test`
- Confirm the application starts successfully
- Confirm Flyway migrations apply successfully

When API behavior changes:
- Verify success cases
- Verify `not found` behavior
- Verify validation failures
- Verify unauthenticated behavior
- Verify sold-out booking rejection
- Verify duplicate booking rejection

When docs change:
- Verify `agent.md`, `README.md`, `docs/api-spec.md`, `docs/db.md`, and `docs/architecture.md` do not contradict each other

## 11. Repository Policy
Git management should start now, not after frontend completion.

Current repository policy:
- Manage the root folder as a single monorepo
- Keep `backend`, `frontend`, `docs`, `prototype`, and `infra` in the same repository
- Only consider separate repositories later if release ownership, access control, or deployment boundaries clearly require it

## 12. Git Workflow Rules
Branching:
- Do not treat `main` as the default working branch for feature development
- Start new work from the latest `main`
- Use one branch per task or fix
- Recommended branch prefixes:
  - `feature/...`
  - `fix/...`
  - `docs/...`
  - `refactor/...`

Branch examples:
- `feature/event-list-api`
- `fix/booking-capacity-lock`
- `docs/backend-baseline-sync`

Working flow:
1. Update local `main`
2. Create a task branch
3. Make focused changes for one purpose
4. Run required validation for that change
5. Commit with a clear message
6. Push the branch to GitHub
7. Merge through a pull request when practical

Commit rules:
- Keep commits focused on one change set
- Do not mix unrelated backend, frontend, and docs work in one commit unless they are part of the same feature
- Use clear commit prefixes such as:
  - `feat:`
  - `fix:`
  - `docs:`
  - `refactor:`
  - `test:`
  - `chore:`

Main branch rules:
- Prefer not to commit directly to `main` except for very small controlled updates
- `main` should stay in a state that can be pulled and continued from safely
- If code behavior changes, update related docs before merging to `main`

Pull request rules:
- A PR should describe what changed, why it changed, and what was verified
- If API or persistence changed, the PR should mention which docs were updated
- If docs were intentionally not updated, the PR should explain why

Git hygiene:
- Do not commit `.env`, local credentials, cache folders, or build artifacts
- Review `git status` before every commit
- Prefer small, reviewable pushes over large unstructured pushes
- If a change introduces temporary behavior, document it clearly before merge

## 13. Working Principles
- Prefer prototype alignment over legacy document assumptions
- Prefer minimum safe contracts over speculative platform design
- Keep current scope and future scope clearly separated
- Do not present placeholders as final architecture decisions
- Favor consistency of naming across all docs

## 14. Review Checklist
Before considering a docs update complete, verify:
- All docs use `event`, `booking`, `creator`, and `watchlist` consistently
- The route set matches the prototype
- Minimal auth remains minimal
- Unconfirmed features are labeled future scope
- No queue-first or Kafka-first framing appears as the current product story
- No duplicate or contradictory sections remain
