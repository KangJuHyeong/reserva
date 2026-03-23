# agent.md

## 1. Purpose
This document is the canonical operating guide for implementation work in this repository.

Use it to keep code, scope, and supporting documents aligned with the current product baseline.

`README.md` is the public-facing project summary. It is not the implementation source of truth.

## 2. Source Of Truth Order
When repository documents conflict, use this order:

1. `agent.md`
2. `docs/product/implementation-status.md`
3. `docs/product/decisions.md`
4. `docs/engineering/frontend-architecture.md`
5. `docs/engineering/api-spec.md`
6. `docs/engineering/db.md`
7. `docs/engineering/architecture.md`
8. `README.md`

Rules:
- `agent.md` owns repository operating rules, scope boundaries, implementation priorities, and documentation ownership.
- Product and engineering docs should define minimum safe contracts, not speculative platform scope.
- If a topic is not part of the current product baseline and not required for safe implementation, keep it out of current scope.

## 3. Documentation Map

### 3.1 Root Entry Documents
- `README.md`: external-facing project summary, stack, repo shape, and doc links
- `agent.md`: internal operating guide and implementation source of truth
- `MAIN_PROMPT.md`: thin launcher for implementation sessions that defers to `agent.md`

### 3.2 Product Documents
- `docs/product/implementation-status.md`: current implementation baseline, temporary details, and next priorities
- `docs/product/decisions.md`: current, temporary, and future-facing decisions

### 3.3 Engineering Documents
- `docs/engineering/architecture.md`: service responsibilities, request flows, and system boundaries
- `docs/engineering/frontend-architecture.md`: route map, UX states, and frontend data expectations
- `docs/engineering/api-spec.md`: API contracts, shared payloads, and error behavior
- `docs/engineering/db.md`: persistence model, constraints, and integrity rules

### 3.4 Operations Documents
- `docs/operations/README.md`: boundary for operations documentation that does not belong in root entry files
- `docs/operations/implementation-workflow.md`: default feature-slice implementation workflow and service ownership rules

## 4. Current Product Definition
The current product is an event reservation marketplace.

Primary user-visible flows:
- Browse and filter events
- View event detail
- Reserve a spot
- Save and remove watchlist items
- View personal bookings and booking detail
- View personal dashboard summary
- View personal created-events list
- Create an event as an authenticated user
- Log in with the minimum documented auth contract

Current canonical routes:
- `/`
- `/reservation/[id]`
- `/booking/[id]`
- `/dashboard`
- `/my-events`
- `/create`
- `/login`

Terminology:
- `event`: a joinable listing shown in discovery and detail pages
- `booking`: a user's confirmed reservation record for an event
- `creator`: the user who authored or hosts an event; not a separate auth role in the current product baseline
- `watchlist`: a per-user saved-events collection

## 5. Repository / Feature Map
Use this section first when deciding where implementation work belongs.

### 5.1 Repository Entry Points
- `backend`: Spring Boot API, domain logic, persistence, and migrations
- `frontend`: Next.js App Router frontend and same-origin proxy routes
- `docs`: product, engineering, and operations references
- `prototype`: legacy design reference directory
- `infra`: infrastructure-related work

### 5.2 Backend Feature Packages
- `backend/src/main/java/com/reserva/backend/auth`: login, logout, current-user session contract
- `backend/src/main/java/com/reserva/backend/event`: event discovery, event detail, event creation, my events, inventory access
- `backend/src/main/java/com/reserva/backend/booking`: booking creation, my bookings list, booking detail
- `backend/src/main/java/com/reserva/backend/watchlist`: watchlist persistence and mutations
- `backend/src/main/java/com/reserva/backend/dashboard`: dashboard summary aggregation
- `backend/src/main/java/com/reserva/backend/common`: shared API, error, and security support

### 5.3 Frontend Work Areas
- `frontend/app`: route entry points such as `/`, `/reservation/[id]`, `/booking/[id]`, `/dashboard`, `/my-events`, `/create`, `/login`
- `frontend/app/api`: same-origin proxy routes for auth and event mutations
- `frontend/components`: page composition and interactive UI pieces
- `frontend/lib/server`: backend fetch wrappers and server-side query helpers

### 5.4 Current Gaps
- Development auth header fallback is still temporary and not the final auth contract
- Residual validation and test hardening remain

## 6. Scope Boundaries

### 6.1 Current Scope
Use for behavior already part of the current product baseline or directly required by visible pages.

Examples:
- Event discovery and filtering
- Event detail view
- Booking creation and booking detail
- Dashboard summary and dashboard sections
- My events list
- Event creation form
- Minimal login flow
- Watchlist behavior

### 6.2 Minimum Inferred Backend Requirements
Use for requirements not directly visible in the UI but necessary to implement it safely.

Examples:
- Pagination for list endpoints
- Validation rules
- Error contracts
- Slot decrement concurrency control
- Duplicate booking prevention
- Booking and watchlist persistence

### 6.3 Future Scope
Use for ideas not yet confirmed for the current product baseline.

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

## 7. Current Implementation Priorities
If implementation starts from this document, use this priority order:

1. Auth temporary fallback cleanup
2. Residual validation and test hardening
3. Documentation consistency follow-up

Why this order:
- Event discovery, event detail, booking flows, watchlist persistence, event creation, dashboard summary, and my-events listing are already part of the current baseline.
- The largest remaining implementation risk is the temporary dev auth fallback.
- Validation hardening and doc consistency remain important follow-up work after the current feature slice.

## 8. Current Baseline
Use `docs/product/implementation-status.md` for quick current-state checks.

Current backend baseline:
- Backend project exists in `backend`
- Datasource configuration is driven by `backend/.env`
- Spring Boot, MySQL, Flyway, JPA, and QueryDSL-backed repository queries are active
- Implemented baseline features:
  - auth login, me, and logout
  - event discovery and filtering
  - event detail
  - event creation
  - my events list
  - booking creation
  - my bookings list and booking detail
  - watchlist save and remove
  - dashboard summary aggregation

Current frontend baseline:
- Frontend project exists in `frontend`
- Live routes currently include `/`, `/reservation/[id]`, `/booking/[id]`, `/dashboard`, `/my-events`, `/create`, and `/login`
- Same-origin proxy routes exist for login, logout, current-user bootstrap, bookings, and watchlist mutations

Temporary implementation detail:
- Current auth uses server-managed sessions for the documented minimum contract
- Protected routes may still resolve request headers `X-User-Id` and `X-User-Name` as a development-only fallback when enabled
- This mechanism is temporary and not the final documented auth contract

## 9. Minimal Auth Contract
Current documented auth endpoints:
- `POST /auth/login`
- `GET /me`
- `POST /auth/logout`

Current assumptions:
- Session-based auth is the documented default contract.
- One authenticated user model supports both booking and event creation in the current baseline.
- Final auth implementation details beyond the minimum contract remain undecided.

Do not document as confirmed:
- Signup API
- OAuth providers
- JWT vs session as a final commitment
- Forgot password
- Email verification

## 10. Required Supporting Rules

### 10.1 Validation
- Event title, category, location, and description are required
- `price >= 0`
- `totalSlots >= 1`
- `reservationOpenDateTime < eventDateTime`
- Any authenticated user can create events

### 10.2 Booking Integrity
- A sold-out event must reject additional bookings
- Duplicate booking protection must exist at application and DB levels
- Slot decrement and booking creation must be handled atomically
- Booking detail must preserve price context through snapshots or equivalent fields

### 10.3 List Behavior
- Discovery, bookings, and my-events lists must support pagination
- The server should own derived sections such as trending, ending soon, and opening soon
- Filtering and sorting rules must be documented in the API contract, not inferred only from UI code

### 10.4 Backend Query Conventions
- Spring Data JPA remains the base persistence layer
- For dynamic filtering, search, sorting, or multi-condition list queries, prefer QueryDSL over JPA Specification
- Use derived query methods only for simple single-purpose lookups with stable predicates
- Do not add new `JpaSpecificationExecutor` usage for feature work unless there is a documented exception
- If a query approach changes, update the relevant engineering docs so the documented stack stays aligned with the implementation plan

## 11. Documentation Update Rules
When scope or behavior changes:
- Update `agent.md` if boundaries, priorities, terminology, or doc ownership change
- Update `README.md` if the public-facing product summary, stack summary, or repo shape changes
- Update `docs/product/implementation-status.md` if implementation coverage or temporary mechanisms change
- Update `docs/product/decisions.md` if decisions or temporary choices change
- Update `docs/engineering/frontend-architecture.md` if page structure or UX states change
- Update `docs/engineering/api-spec.md` if routes, payloads, filters, or errors change
- Update `docs/engineering/db.md` if entities, constraints, or persistence rules change
- Update `docs/engineering/architecture.md` if service responsibilities or system boundaries change

Temporary implementation details must be labeled as `temporary` and must not be described as final architecture decisions.

## 12. Implementation Workflow
Default implementation mode is a full-stack feature slice.

For any feature in current scope, use this order:
1. Confirm the feature belongs to current scope and identify its priority in this document.
2. Check whether `docs/engineering/api-spec.md` or `docs/engineering/db.md` must change before code changes begin.
3. Define or update request, response, error, validation, and persistence expectations for the feature.
4. Implement the backend slice in the owning feature package.
5. Implement the frontend route or UI integration for the same feature.
6. Verify behavior end to end, then update `docs/product/implementation-status.md` if implementation coverage changed.

Default ownership rule:
- Work is organized by feature task, but service ownership remains aligned to feature domains.
- A feature package should own its controller, service, repository access, DTOs, and domain rules.
- Reuse existing `CommandService` and `QueryService` separation where the feature already follows that pattern.
- Create a dedicated orchestration service only when one use case coordinates multiple feature domains and would otherwise overgrow an existing service.
- Do not combine unrelated booking, event, dashboard, and auth behavior into one broad service.

Reference:
- Use `docs/operations/implementation-workflow.md` for the detailed workflow template and the watchlist example.

## 13. Testing Expectations
When backend code changes:
- Run `backend\\gradlew.bat test`
- Confirm the application starts successfully
- Confirm Flyway migrations apply successfully

When frontend code changes:
- Run `npm run build` in `frontend`

When API behavior changes:
- Verify success cases
- Verify `not found` behavior
- Verify validation failures
- Verify unauthenticated behavior
- Verify sold-out booking rejection
- Verify duplicate booking rejection

When docs change:
- Verify root docs and engineering docs do not contradict each other
- Verify links resolve after moves or deletions
- Verify each retained document has one clear audience
- Verify priorities in `agent.md` and `docs/product/implementation-status.md` match
- Verify route states in `docs/engineering/frontend-architecture.md` match `frontend/app`

## 14. Repository Policy
- Manage the root folder as a single monorepo
- Keep `backend`, `frontend`, `docs`, `prototype`, and `infra` in the same repository while `prototype` remains a legacy reference directory
- Only consider separate repositories later if ownership or deployment boundaries clearly require it

## 15. Git Workflow Rules
Branching:
- Start new work from the latest `main`
- Use one branch per task or fix
- Recommended prefixes: `feature/...`, `fix/...`, `docs/...`, `refactor/...`

Working flow:
1. Update local `main`
2. Create a task branch
3. Make focused changes
4. Run required validation
5. Commit with a clear message
6. Push the branch
7. Merge through a pull request when practical

Commit rules:
- Keep commits focused on one change set
- Do not mix unrelated backend, frontend, and docs work in one commit unless they are part of the same feature
- Use clear commit prefixes such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, or `chore:`

Git hygiene:
- Do not commit `.env`, local credentials, cache folders, or build artifacts
- Review `git status` before every commit
- Prefer small, reviewable pushes over large unstructured pushes
- If a change introduces temporary behavior, document it clearly before merge

## 16. Working Principles
- Prefer current product alignment over legacy document assumptions
- Prefer minimum safe contracts over speculative platform design
- Keep current scope and future scope clearly separated
- Do not present placeholders as final architecture decisions
- Favor consistent naming across all docs
- Prefer feature-package discovery over broad cross-domain service expansion

## 17. Review Checklist
Before considering a docs update complete, verify:
- All docs use `event`, `booking`, `creator`, and `watchlist` consistently
- The documented route set matches the current product baseline
- Minimal auth remains minimal
- Unconfirmed features are labeled future scope
- No queue-first or Kafka-first framing appears as the current product story
- No duplicate or contradictory sections remain
- New contributors can identify where auth, event, booking, watchlist, dashboard, and my-events work belongs from this document alone
