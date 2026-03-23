# Implementation Workflow

This document defines the default execution workflow for feature implementation in this repository.

The standard mode is a full-stack vertical slice: complete one feature across docs, API, backend, frontend, and verification before moving on.

## Core Rule
- Organize work by feature task.
- Keep service ownership aligned to feature domains.
- Do not create broad cross-domain services just because one task touches multiple areas.

## Default Feature Workflow
1. Confirm the feature belongs to current scope in `agent.md`.
2. Check its current priority in `agent.md` and current status in `docs/product/implementation-status.md`.
3. Confirm whether `docs/engineering/api-spec.md` needs request, response, validation, or error updates.
4. Confirm whether `docs/engineering/db.md` needs schema, constraint, or query-support updates.
5. Implement the backend slice in the owning feature package.
6. Implement the frontend route or UI integration for the same feature.
7. Verify success and failure cases end to end.
8. Update `docs/product/implementation-status.md` if implementation coverage changed.

## Service Ownership Rules
- A feature package should own its controller, service, repository access, DTOs, and domain rules.
- If a feature already uses separate command and query services, keep that split.
- Add a new orchestration service only when one use case must coordinate multiple feature domains and would otherwise overgrow an existing service.
- Do not move unrelated booking, event, dashboard, and auth logic into one service.

## When To Extend vs Add A Service

### Extend an existing service when
- the behavior belongs to the same feature package
- the behavior fits the existing service responsibility
- adding the use case does not blur command vs query boundaries

### Add a new service when
- the use case has a distinct responsibility inside the same feature
- the current service is becoming too broad
- the flow coordinates multiple domains and needs explicit orchestration

## Feature Task Template

### 1. Capability Definition
- What user-visible problem is being solved
- Whether it is in current scope
- Which route or screen it affects

### 2. Contract Check
- API endpoints to add or update
- request and response shapes
- validation and error cases
- DB constraints or indexes affected

### 3. Backend Slice
- owning package
- controller endpoints
- service methods
- repository access
- query approach for reads: derived repository method or QueryDSL-backed custom query
- authorization and validation checks
- error mapping

Query implementation rule:
- If a read use case needs optional filters, text search, conditional joins, or custom ordering, plan it as a QueryDSL-backed repository query instead of adding a new Specification chain
- If the existing code still uses Specification, treat QueryDSL migration as part of the same refactor when the query complexity is increasing

### 4. Frontend Slice
- route or component integration point
- fetch and mutation wiring
- loading, error, empty, and success states

### 5. Verification
- success case
- unauthenticated or forbidden case
- validation failure
- not-found case
- domain-specific integrity case

### 6. Documentation Update
- `docs/product/implementation-status.md`
- any changed engineering contract docs

## Workflow Example: Watchlist Persistence
1. Confirm in `agent.md` that watchlist behavior is current scope.
2. Confirm in `docs/engineering/api-spec.md` that `POST /events/{eventId}/watchlist` and `DELETE /events/{eventId}/watchlist` are the target contracts.
3. Confirm in `docs/engineering/db.md` that watchlist persistence requires unique `(user_id, event_id)`.
4. Implement backend behavior in the `watchlist` feature package.
5. Keep watchlist mutation logic inside the watchlist feature, not inside `EventCommandService`.
6. Update event query responses only as needed to expose `isWatchlisted`.
7. Wire the frontend card and detail actions and remove the disabled placeholder behavior.
8. Verify save, remove, unauthenticated, event-not-found, and duplicate-save behavior.
9. Mark the feature as implemented in `docs/product/implementation-status.md` once complete.
