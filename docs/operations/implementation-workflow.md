# Implementation Workflow

This document defines the repository's default implementation procedure.

Use `docs/product/implementation-status.md` for status, `agent.md` for scope, and the engineering documents for technical contracts.

## Purpose
- keep feature implementation order consistent
- keep docs, backend, frontend, and verification inside the same feature slice
- prevent service ownership from drifting around temporary task grouping

## Core Rule
- Organize work by feature task.
- Keep service ownership aligned to feature domains.
- Do not create broad cross-domain services just because a task touches multiple areas.

## Default Workflow
1. Confirm that the feature belongs to current scope in `agent.md`.
2. Check its priority in `agent.md` and its current state in `docs/product/implementation-status.md`.
3. Check whether `docs/engineering/api-spec.md` needs updates.
4. Check whether `docs/engineering/db.md` needs updates.
5. Implement the backend slice in the owning feature package.
6. Implement the frontend route or UI integration for the same feature.
7. Verify success and failure cases end to end.
8. Update `docs/product/implementation-status.md` if implementation coverage changed.

## Service Ownership Rules
- A feature package should own its controller, service, repository access, DTOs, and domain rules.
- If a feature already uses command/query separation, keep that structure.
- Add an orchestration service only when a single use case must coordinate multiple domains and would otherwise overgrow an existing service.
- Do not merge unrelated booking, event, dashboard, and auth logic into one service.

## Extend vs Add

### Extend an existing service when
- the behavior belongs to the same feature package
- the behavior fits the current service responsibility
- the change does not blur command/query boundaries

### Add a new service when
- the use case has a clearly separate responsibility inside the same feature
- the current service is becoming too broad
- the flow coordinates multiple domains and needs explicit orchestration

## Execution Checklist

### 1. Capability
- what user-visible problem is being solved
- whether it belongs to current scope
- which route or screen it affects

### 2. Contract
- API endpoints to add or update
- request and response shapes
- validation and error cases
- DB constraints or indexes affected

### 3. Backend Slice
- owning package
- controller endpoint
- service method
- repository access
- read-query approach: derived method or QueryDSL
- authorization and validation checks
- error mapping

Query rule:
- if the read use case needs optional filters, text search, conditional joins, or custom ordering, prefer a QueryDSL-backed query over a new Specification chain

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

## Example: Watchlist Persistence
1. Confirm in `agent.md` that watchlist is current scope.
2. Confirm in `docs/engineering/api-spec.md` that `POST /events/{eventId}/watchlist` and `DELETE /events/{eventId}/watchlist` are the intended contracts.
3. Confirm in `docs/engineering/db.md` that watchlist persistence requires unique `(user_id, event_id)`.
4. Implement backend behavior in the `watchlist` feature package.
5. Keep watchlist mutation logic inside the watchlist feature, not inside `EventCommandService`.
6. Update event query responses only as needed to expose `isWatchlisted`.
7. Wire the frontend card and detail actions and remove disabled placeholder behavior.
8. Verify save, remove, unauthenticated, event-not-found, and duplicate-save behavior.
9. Mark the feature as implemented in `docs/product/implementation-status.md` once complete.
