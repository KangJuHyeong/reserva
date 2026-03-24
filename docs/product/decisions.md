# Decisions

## Product And Repository Decisions
- `Current`: manage the repository root as a single monorepo
- `Current`: keep `backend`, `frontend`, `docs`, `prototype`, and `infra` in the same repository while `prototype` remains a legacy reference directory
- `Current`: use branch + pull request + merge as the default GitHub workflow

## Backend Decisions
- `Current`: Spring Boot is the backend framework baseline
- `Current`: MySQL is the relational database baseline
- `Current`: Flyway manages schema versioning
- `Current`: JPA is the current persistence approach
- `Current`: simple fixed-condition lookups may use standard Spring Data JPA repository methods
- `Current target`: QueryDSL is the preferred approach for new or refactored dynamic query composition
- `Temporary`: some current dynamic event discovery queries still use JPA Specification and are candidates for QueryDSL migration
- `Current`: datasource configuration is driven by `backend/.env`
- `Current`: local backend CORS allowed origin defaults to `http://localhost:3000`
- `Approved next phase`: lightweight semideploy should target EC2 with Docker-based packaging
- `Approved next phase`: prefer keeping the application services containerized even if the database deployment choice changes later
- `Current`: semideploy packaging assets live under `infra/deploy`
- `Current`: CI builds frontend and backend container images and publishes them to GHCR
- `Current`: the EC2 semideploy baseline uses nginx as the external reverse proxy in front of the frontend and backend containers
- `Current`: production env files stay on the target server instead of being committed to the repository
- `Current`: the default semideploy baseline includes MySQL in Docker on the EC2 host, with external DB connection kept available through backend env values
- `Approved next phase`: Redis is the first infrastructure addition for queue-ready reservation control

## Auth Decisions
- `Current target contract`: session-based auth remains the documented direction
- `Current implementation`: backend auth uses the same session-first contract for login, me, logout, and protected routes
- `Future / Not finalized`: final auth implementation details beyond the minimum contract remain undecided
- `Approved next phase`: Google is the first OAuth provider to add
- `Approved next phase`: OAuth should extend the existing session-based runtime contract rather than replace it with JWT-only auth

## Documentation Decisions
- `Current`: `agent.md` is the operating guide and rule hub
- `Current`: `README.md` is the public-facing project summary
- `Current`: `docs/product/implementation-status.md` is the current-state status board
- `Current`: `docs/product/decisions.md` is the short decision log
- `Current`: detailed API, DB, and architecture contracts stay in dedicated engineering docs
- `Current`: default implementation should follow a full-stack feature-slice workflow
- `Current`: service ownership should stay aligned to feature domains, not temporary task groupings

## Scope Decisions
- `Current`: prioritize current product flows first
- `Current`: keep minimum safe backend requirements in scope
- `Approved next phase`: semideploy, Google OAuth, and Redis-backed queue readiness are the next follow-up scope after baseline stability
- `Future / Not finalized`: signup, payments, notifications, broad user-visible queueing, and Kafka-based flows
