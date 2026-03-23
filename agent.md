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
- `agent.md` owns repository operating rules, scope boundaries, and documentation ownership.
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
- Create an event as a creator
- Log in with the minimum documented auth contract

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

## 5. Scope Boundaries

### 5.1 Current Scope
Use for behavior already part of the current product baseline or directly required by visible pages.

Examples:
- Event discovery and filtering
- Event detail view
- Booking creation and booking detail
- Dashboard sections
- Event creation form
- Minimal login flow
- Watchlist behavior

### 5.2 Minimum Inferred Backend Requirements
Use for requirements not directly visible in the UI but necessary to implement it safely.

Examples:
- Role and permission model
- Pagination for list endpoints
- Validation rules
- Error contracts
- Slot decrement concurrency control
- Duplicate booking prevention
- Booking and watchlist persistence

### 5.3 Future Scope
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

## 6. Current Implementation Priorities
If implementation starts from this document, use this priority order:

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
- Creator and dashboard features depend on auth and persisted event and booking data.

## 7. Minimal Auth Contract
Current documented auth endpoints:
- `POST /auth/login`
- `GET /me`
- `POST /auth/logout`

Current assumptions:
- Session-based auth is the documented default contract.
- One user model can support creator capability through a role field.
- Final auth implementation details beyond the minimum contract remain undecided.

Do not document as confirmed:
- Signup API
- OAuth providers
- JWT vs session as a final commitment
- Forgot password
- Email verification

## 8. Required Supporting Rules

### 8.1 Validation
- Event title, category, location, and description are required
- `price >= 0`
- `totalSlots >= 1`
- `reservationOpenDateTime < eventDateTime`
- Only creators can create events

### 8.2 Booking Integrity
- A sold-out event must reject additional bookings
- Duplicate booking protection must exist at application and DB levels
- Slot decrement and booking creation must be handled atomically
- Booking detail must preserve price context through snapshots or equivalent fields

### 8.3 List Behavior
- Discovery, bookings, and creator lists must support pagination
- The server should own derived sections such as trending, ending soon, and opening soon
- Filtering and sorting rules must be documented in the API contract, not inferred only from UI code

### 8.4 Backend Query Conventions
- Spring Data JPA remains the base persistence layer
- For dynamic filtering, search, sorting, or multi-condition list queries, prefer QueryDSL over JPA Specification
- Use derived query methods only for simple single-purpose lookups with stable predicates
- Do not add new `JpaSpecificationExecutor` usage for feature work unless there is a documented exception
- If an existing Specification-based query is being extended with more dynamic conditions, joins, projections, or section-specific ordering, refactor it to QueryDSL instead of growing the Specification chain
- When a query approach changes, update the relevant engineering docs so the documented stack stays aligned with the implementation plan

## 9. Documentation Update Rules
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

## 10. Implementation Workflow
Default implementation mode is a full-stack feature slice.

For any feature in current scope, use this order:
1. Confirm the feature belongs to current scope and identify its priority in this document.
2. Check whether `docs/engineering/api-spec.md` or `docs/engineering/db.md` must change before code changes begin.
3. Define or update request, response, error, validation, and persistence expectations for the feature.
4. Implement the backend slice in the owning feature package.
5. Implement the frontend route or UI integration for the same feature.
6. Verify behavior end to end, then update `docs/product/implementation-status.md` if implementation coverage changed.

Backend query design rule:
- Before adding or extending a dynamic list/search query, document whether it stays a simple repository method or becomes a QueryDSL-backed repository query
- If QueryDSL is introduced or expanded, document the repository ownership and query-building boundary in the engineering docs

Default ownership rule:
- Work is organized by feature task, but service ownership remains aligned to feature domains.
- A feature package should own its controller, service, repository access, DTOs, and domain rules.
- Reuse existing `CommandService` and `QueryService` separation where the feature already follows that pattern.
- Create a dedicated orchestration service only when one use case coordinates multiple feature domains and would otherwise overgrow an existing service.
- Do not combine unrelated booking, event, dashboard, and auth behavior into one broad service.

Reference:
- Use `docs/operations/implementation-workflow.md` for the detailed workflow template and the watchlist example.

## 11. Current Baseline
Use `docs/product/implementation-status.md` for quick current-state checks.

Current backend baseline:
- Backend project exists in `backend`
- Datasource configuration is driven by `backend/.env`
- Spring Boot, MySQL, Flyway, and JPA are active

Current frontend baseline:
- Frontend project exists in `frontend`
- Connected routes currently include `/`, `/reservation/[id]`, `/booking/[id]`, and `/create`
- `/dashboard` and `/login` remain placeholder routes

Temporary implementation detail:
- Current auth in code uses request headers `X-User-Id`, `X-User-Name`, and `X-User-Role`
- This mechanism is temporary and not the final documented auth contract

## 12. Testing Expectations
When backend code changes:
- Run `backend\\gradlew.bat test`
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
- Verify root docs and engineering docs do not contradict each other
- Verify links resolve after moves or deletions
- Verify each retained document has one clear audience

## 13. Repository Policy
- Manage the root folder as a single monorepo
- Keep `backend`, `frontend`, `docs`, `prototype`, and `infra` in the same repository while `prototype` remains a legacy reference directory
- Only consider separate repositories later if ownership or deployment boundaries clearly require it

## 14. Git Workflow Rules
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

## 15. Working Principles
- Prefer current product alignment over legacy document assumptions
- Prefer minimum safe contracts over speculative platform design
- Keep current scope and future scope clearly separated
- Do not present placeholders as final architecture decisions
- Favor consistent naming across all docs

## 16. Review Checklist
Before considering a docs update complete, verify:
- All docs use `event`, `booking`, `creator`, and `watchlist` consistently
- The documented route set matches the current product baseline
- Minimal auth remains minimal
- Unconfirmed features are labeled future scope
- No queue-first or Kafka-first framing appears as the current product story
- No duplicate or contradictory sections remain
