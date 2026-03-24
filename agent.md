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
- `docs/product/implementation-status.md`: current vs temporary vs target implementation status
- `docs/product/decisions.md`: current, temporary, and future-facing decisions

### 3.3 Engineering Documents
- `docs/engineering/architecture.md`: service responsibilities, request flows, and system boundaries
- `docs/engineering/frontend-architecture.md`: route IA, UX states, and target improvements
- `docs/engineering/api-spec.md`: API contracts, shared payloads, and error behavior
- `docs/engineering/db.md`: persistence model, constraints, and integrity rules

### 3.4 Operations Documents
- `docs/operations/README.md`: boundary for operations documentation that does not belong in root entry files
- `docs/operations/implementation-workflow.md`: default feature-slice implementation workflow and service ownership rules

## 4. Status Vocabulary
Use the same labels across all docs.

- `Current`: exists in code now
- `Temporary`: exists now but is transitional
- `Target`: agreed next-state IA or contract, not fully implemented yet
- `Out of scope`: intentionally not part of the current baseline

Do not mix these labels in the same sentence or bullet.

## 5. Current Product Definition
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

## 6. Repository / Feature Map

### 6.1 Repository Entry Points
- `backend`: Spring Boot API, domain logic, persistence, and migrations
- `frontend`: Next.js App Router frontend and same-origin proxy routes
- `docs`: product, engineering, and operations references
- `prototype`: legacy design reference directory and comparison input
- `infra`: infrastructure-related work

### 6.2 Backend Feature Packages
- `backend/src/main/java/com/reserva/backend/auth`: login, logout, current-user session contract
- `backend/src/main/java/com/reserva/backend/event`: event discovery, event detail, event creation, my events, inventory access
- `backend/src/main/java/com/reserva/backend/booking`: booking creation, my bookings list, booking detail
- `backend/src/main/java/com/reserva/backend/watchlist`: watchlist persistence and mutations
- `backend/src/main/java/com/reserva/backend/dashboard`: dashboard summary aggregation
- `backend/src/main/java/com/reserva/backend/common`: shared API, error, and security support

### 6.3 Frontend Work Areas
- `frontend/app`: route entry points such as `/`, `/reservation/[id]`, `/booking/[id]`, `/dashboard`, `/my-events`, `/create`, `/login`
- `frontend/app/api`: same-origin proxy routes for auth and event mutations
- `frontend/components`: page composition and interactive UI pieces
- `frontend/lib/server`: backend fetch wrappers and server-side query helpers

## 7. Scope Boundaries

### 7.1 Current
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

### 7.2 Minimum Inferred Backend Requirements
Use for requirements not directly visible in the UI but necessary to implement it safely.

Examples:
- Pagination for list endpoints
- Validation rules
- Error contracts
- Slot decrement concurrency control
- Duplicate booking prevention
- Booking and watchlist persistence

### 7.3 Out Of Scope
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

Do not move out-of-scope items into current scope without a visible product reason or explicit instruction.

### 7.4 Approved Next-Phase Candidates
These are approved follow-up directions after the current baseline is kept stable. They are not part of the already-implemented baseline definition.

Examples:
- EC2 semideploy packaging with Docker-based services
- Reverse-proxy and external environment setup for lightweight deployment
- Google OAuth added on top of the current session contract
- Redis introduction for queue-ready reservation control

Rules:
- Preserve the current product routes and session-based protected-route contract while extending auth.
- Treat queue work as readiness or MVP work first, not as justification for broad speculative platform scope.
- Keep these items out of `Current` implementation claims until code and docs are updated together.

## 8. Current Priorities
If implementation starts from this document, use this priority order:

1. Local runtime stability and regression hardening for the verified baseline
2. EC2 semideploy verification and environment hardening for the Docker-based baseline
3. Google OAuth on top of the current session contract
4. Redis foundation for queue-enabled reservation control
5. IA or documentation follow-up tied to real route, auth, deployment, or queue changes

Why this order:
- Event discovery, event detail, booking flows, watchlist persistence, event creation, dashboard summary, and my-events listing are already part of the current baseline.
- The temporary dev auth fallback has been removed from the current baseline and the core flows have been verified end to end.
- Docker, compose, nginx, and CI deployment assets now define the lightweight external deployment baseline, so the next delivery need is deployment verification and environment hardening before expanding auth or traffic-control behavior.
- OAuth and queue work should extend the deployable session-based baseline rather than replace it with speculative architecture.

## 9. Baseline Snapshot

### 9.1 Current
- Backend project exists in `backend`
- Frontend project exists in `frontend`
- Datasource configuration is driven by `backend/.env`
- Spring Boot, MySQL, Flyway, JPA, and QueryDSL-backed repository queries are active
- Live frontend routes currently include `/`, `/reservation/[id]`, `/booking/[id]`, `/dashboard`, `/my-events`, `/create`, and `/login`
- EC2 semideploy assets exist in `infra/deploy`
- Frontend and backend Dockerfiles exist for container image builds
- GitHub Actions workflow exists for GHCR image publication and EC2 SSH-based redeploy

### 9.2 Temporary
- No temporary auth fallback remains in the current baseline.

## 10. Minimal Auth Contract
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

Approved next-phase extension:
- Google OAuth may be added as an additional login entry point, but protected routes should continue to rely on the session-based runtime contract unless a later decision explicitly changes it.

## 11. Required Supporting Rules

### 11.1 Validation
- Event title, category, location, and description are required
- `price >= 0`
- `totalSlots >= 1`
- `reservationOpenDateTime < eventDateTime`
- Any authenticated user can create events

### 11.2 Booking Integrity
- A sold-out event must reject additional bookings
- Duplicate booking protection must exist at application and DB levels
- Slot decrement and booking creation must be handled atomically
- Booking detail must preserve price context through snapshots or equivalent fields

### 11.3 List Behavior
- Discovery, bookings, and my-events lists must support pagination
- The server should own derived sections such as trending, ending soon, and opening soon
- Filtering and sorting rules must be documented in the API contract, not inferred only from UI code

### 11.4 Backend Query Conventions
- Spring Data JPA remains the base persistence layer
- For dynamic filtering, search, sorting, or multi-condition list queries, prefer QueryDSL over JPA Specification
- Use derived query methods only for simple single-purpose lookups with stable predicates
- Do not add new `JpaSpecificationExecutor` usage for feature work unless there is a documented exception
- If a query approach changes, update the relevant engineering docs so the documented stack stays aligned with the implementation plan

## 12. Documentation Update Rules
When scope or behavior changes:
- Update `agent.md` if boundaries, priorities, terminology, or doc ownership change
- Update `README.md` if the public-facing product summary, stack summary, or repo shape changes
- Update `docs/product/implementation-status.md` if implementation coverage or temporary mechanisms change
- Update `docs/product/decisions.md` if decisions or temporary choices change
- Update `docs/engineering/frontend-architecture.md` if route IA, structure, or UX states change
- Update `docs/engineering/api-spec.md` if routes, payloads, filters, or errors change
- Update `docs/engineering/db.md` if entities, constraints, or persistence rules change
- Update `docs/engineering/architecture.md` if service responsibilities or system boundaries change

Temporary implementation details must be labeled as `Temporary` and must not be described as final architecture decisions.

## 13. Implementation Workflow
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
