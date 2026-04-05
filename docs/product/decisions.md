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
- `Current`: CI builds and publishes the backend container image used by the EC2 semideploy flow
- `Temporary`: frontend delivery is moving to Vercel while backend and MySQL remain on EC2 for validation
- `Current`: the EC2 semideploy baseline uses nginx as the external reverse proxy in front of the backend container
- `Current`: production env files stay on the target server instead of being committed to the repository
- `Current`: the default semideploy baseline includes MySQL in Docker on the EC2 host, with external DB connection kept available through backend env values
- `Current`: frontend server runtime should talk to the backend through `BACKEND_BASE_URL` and attach JWT bearer auth derived from a frontend-owned httpOnly cookie instead of relying on direct browser-to-backend cookie handling
- `Current`: backend CORS should allow the configured frontend origin and optional Vercel preview-origin patterns
- `Approved next phase`: Redis is the first infrastructure addition for queue-ready reservation control

## Auth Decisions
- `Current target contract`: JWT bearer auth is the documented protected-route direction
- `Current implementation`: frontend owns the auth cookie boundary and forwards JWT bearer auth to the backend
- `Current`: backend protected routes are enforced through Spring Security's stateless filter chain with JWT-backed `SecurityContext`
- `Current`: local signup may coexist with local email/password login and Google OAuth while local signup/login continue issuing the same JWT contract
- `Current`: Google is the first OAuth provider in scope
- `Current`: local email/password login may coexist with Google OAuth while both issue the same JWT contract
- `Future / Not finalized`: refresh-token rotation and multi-provider account linking beyond Google are not finalized

## Documentation Decisions
- `Current`: local-only `.agent-local/agent.md` is the operating guide and rule hub
- `Current`: `README.md` is the public-facing project summary
- `Current`: `docs/product/implementation-status.md` is the current-state status board
- `Current`: `docs/product/decisions.md` is the short decision log
- `Current`: detailed API, DB, and architecture contracts stay in dedicated engineering docs
- `Current`: default implementation should follow the local-only `.agent-local/implementation-workflow.md` feature-slice workflow
- `Current`: service ownership should stay aligned to feature domains, not temporary task groupings

## Scope Decisions
- `Current`: prioritize current product flows first
- `Current`: keep minimum safe backend requirements in scope
- `Approved next phase`: semideploy hardening and Redis-backed queue readiness follow after the JWT + Google OAuth auth baseline is stable
- `Future / Not finalized`: payments, notifications, broad user-visible queueing, and Kafka-based flows
