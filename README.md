# Reserva

Reserva is an event reservation marketplace.

The repository contains the frontend, backend, and supporting documentation for the current product baseline.

## Stack
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Backend: Spring Boot, MySQL, Flyway, Spring Data JPA

Backend query convention:
- Dynamic query composition is documented to move toward QueryDSL for new or refactored multi-condition read queries

## Repository Layout
- `frontend`: Next.js application
- `backend`: Spring Boot API and persistence layer
- `docs`: product, engineering, and operations references
- `prototype`: legacy design reference assets
- `infra`: infrastructure-related work

## Deployment Baseline
- EC2 semideploy assets live under `infra/deploy`
- `backend/Dockerfile` and `frontend/Dockerfile` define container images for GHCR-based deployment
- the target external entrypoint is an nginx reverse proxy in front of the frontend and backend services

## Documentation
- `agent.md`: canonical internal operating guide for implementation work
- `docs/product/implementation-status.md`: current implementation status and next priorities
- `docs/product/decisions.md`: current, temporary, and future-facing decisions
- `docs/engineering/architecture.md`: system responsibilities and boundaries
- `docs/engineering/frontend-architecture.md`: route structure, UX states, and frontend data needs
- `docs/engineering/api-spec.md`: current API contracts
- `docs/engineering/db.md`: persistence model and integrity rules
- `docs/operations/README.md`: operations-documentation boundary for the repo

## Local Environment
- Backend local config lives in `backend/.env`
- Frontend local config lives in `frontend/.env`
- Production env files are expected to live on the target server and are not committed to the repo

## Working Rule
Use `agent.md` as the source of truth for development and agent-driven implementation sessions.
