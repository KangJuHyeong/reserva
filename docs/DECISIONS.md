# DECISIONS

## Product And Repository Decisions
- `Current`: manage the repository root as a single monorepo
- `Current`: keep `backend`, `frontend`, `docs`, `prototype`, and `infra` in the same repository
- `Current`: use branch + pull request + merge as the default GitHub workflow

## Backend Decisions
- `Current`: Spring Boot is the backend framework baseline
- `Current`: MySQL is the relational database baseline
- `Current`: Flyway manages schema versioning
- `Current`: JPA is the current persistence approach
- `Current`: datasource configuration is driven by the root `.env`

## Auth Decisions
- `Current target contract`: session-based auth remains the documented direction
- `Temporary`: current backend code resolves users from request headers
- `Future / Not finalized`: final auth implementation details beyond the minimum contract remain undecided

## Documentation Decisions
- `Current`: `agent.md` is the operating guide and rule hub
- `Current`: `README.md` is the public-facing summary and quick entry point
- `Current`: `docs/IMPLEMENTATION-STATUS.md` is the current-state status board
- `Current`: `docs/DECISIONS.md` is the short decision log
- `Current`: detailed API, DB, and architecture contracts stay in their dedicated docs

## Scope Decisions
- `Current`: prioritize prototype-visible flows first
- `Current`: keep minimum safe backend requirements in scope
- `Future / Not finalized`: signup, OAuth, payments, notifications, queueing, Redis, and Kafka-based flows
