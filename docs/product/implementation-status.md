# Implementation Status

## Summary
- Current product mode: event reservation marketplace
- Current implementation mode: full-stack feature slices on a live backend baseline
- Current repository workflow: branch + PR + merge on a root monorepo
- Current documentation rule: treat current code as the factual baseline and `prototype` as reference input only
- Current auth transition: move from session-first auth to JWT-protected APIs plus Google OAuth

## Current

### Backend
- Backend project exists in `backend`.
- Datasource configuration uses `backend/.env`.
- Current stack in use:
  - Spring Boot
  - Spring Security
  - MySQL
  - Flyway
  - JPA
  - QueryDSL
  - Docker packaging for EC2 semideploy
- Implemented APIs:
  - `POST /api/v1/auth/signup`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/oauth/google/exchange`
  - `GET /api/v1/me`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/events`
  - `GET /api/v1/events/{eventId}`
  - `POST /api/v1/events`
  - `PATCH /api/v1/events/{eventId}`
  - `POST /api/v1/events/{eventId}/watchlist`
  - `DELETE /api/v1/events/{eventId}/watchlist`
  - `POST /api/v1/events/{eventId}/bookings`
  - `GET /api/v1/me/bookings`
  - `GET /api/v1/me/bookings/{bookingId}`
  - `GET /api/v1/me/dashboard-summary`
  - `GET /api/v1/me/events`
  - `GET /api/v1/me/events/{eventId}`

### Frontend
- Frontend Next.js app exists in `frontend`.
- Frontend runtime can be built into a Docker image, but the current lightweight deployment direction is Vercel hosting.
- Server-rendered frontend routes and same-origin proxy routes now surface explicit backend-unavailable fallback states when the backend origin cannot be reached.
- Frontend auth transport is transitioning from forwarded backend session cookies to a frontend-owned httpOnly JWT cookie.
- Backend protected-route authentication now runs through Spring Security with a stateless JWT filter chain.
- Live routes backed by real API data:
  - `/`
  - `/reservation/[id]`
  - `/booking/[id]`
  - `/dashboard`
  - `/my-events`
  - `/my-events/[id]/edit`
  - `/create`
  - `/login`
  - `/signup`
- Implemented product behaviors:
  - local sign-up backed by frontend-owned httpOnly JWT cookie
  - local email/password login backed by frontend-owned httpOnly JWT cookie
  - Google OAuth callback exchange backed by the same frontend-owned JWT cookie contract
  - event discovery with search, category filtering, a default mixed feed, derived sections, and pagination
  - event detail with watchlist state and direct booking action
  - booking creation with capacity checks, duplicate-booking protection, and an event-specific per-booking ticket quantity limit
  - my bookings list and booking detail
  - watchlist save/remove on cards and event detail
  - persisted watchlist loading through `/?view=Watchlist`
  - authenticated event creation page, form, and API including event-specific max ticket configuration
  - authenticated creator event editing through `/my-events/[id]/edit` with owner-only backend update rules
  - personalized dashboard summary that more clearly serves as the user's activity home for bookings, saved events, opening-soon items, and published-event preview
  - dedicated `/my-events` page for the current user's created events with pagination and clearer creator-workspace framing

### Database
- Database baseline exists through:
  - `V1__create_users.sql`
  - `V2__create_events_and_event_inventory.sql`
  - `V3__create_bookings.sql`
  - `V4__create_watchlists.sql`
  - `V5__add_google_subject_to_users.sql`
  - `V6__add_max_tickets_per_booking_to_events.sql`

### Deployment
- Deployment assets exist in `infra/deploy`.
- The current semideploy baseline uses Docker Compose with `nginx`, `backend`, and profile-gated `mysql` services.
- GitHub Actions workflow exists for backend image build/push and EC2 SSH-based redeploy.
- Production env files are expected to remain on the target server instead of in the repository.

## Temporary
- No temporary auth fallback remains in the current baseline.
- Frontend deployment is temporarily split from EC2 and is expected to run on Vercel while backend and MySQL stay on EC2 for validation.
- Auth runtime is temporarily mid-transition from backend-managed session state to JWT bearer auth.

## Target
- Keep `/dashboard` as a summary page and `/my-events` as the dedicated created-events workspace instead of collapsing both responsibilities into one route.
- Continue using `prototype` only as comparison input and promote only the parts that improve clarity, hierarchy, or task flow over the live UI.
- Keep page documentation in a fixed IA format:
  - purpose
  - current structure
  - current states
  - current data dependencies
  - target improvements
- Keep browser requests same-origin to the frontend host and let the frontend host own the httpOnly auth cookie used to forward JWT bearer auth to the backend.
- Keep EC2 semideploy lightweight, with same-host MySQL as the default baseline and external DB fallback available through env-only changes.
- Keep Google as the first OAuth provider while preserving local email/password login during transition if needed.

## Approved Next-Phase Candidates
- EC2 semideploy packaging with Docker-based services
- reverse proxy and environment setup suitable for lightweight external access
- JWT-protected API baseline with frontend-owned auth cookie
- Google OAuth as the first additional login option
- Redis introduction for queue-ready reservation control

## Out Of Scope
- Password reset
- Email verification
- Payments
- Notifications
- Kafka-based async processing

## Verification Readiness
- Browser-based E2E verification has been executed against the local seeded environment and recorded in `docs/operations/e2e-test-report-2026-03-23.md`.
- No Playwright project configuration is currently committed in-repo.
- Backend demo seed can be enabled with `SEED_DEMO_DATA=true`.
- Local email/password login can be verified with `alex@example.com / dev-password` and `creator@example.com / dev-password` when demo seed is enabled.
- When no authenticated session exists, `/?view=Watchlist` should render the explicit unauthenticated state instead of attempting authenticated watchlist loading.
- Stable demo event ids when demo data is enabled:
  - `evt_demo_jazz`
  - `evt_demo_art`
- Minimum routes to verify once local servers are running:
  - `/`
  - `/?view=Watchlist`
  - `/reservation/[id]`
  - `/booking/[id]`
  - `/dashboard`
  - `/my-events`
  - `/create`
  - `/login`

## Next Priorities
1. Creator workspace UX polish for `/dashboard`, `/my-events`, `/my-events/[id]/edit`, and event-capacity form clarity
2. Frontend local runtime stability hardening for repeated `next dev` and `next start` restarts
3. JWT-protected API baseline and Google OAuth follow-up validation
4. Vercel frontend plus EC2 backend and MySQL verification and environment hardening
5. Redis foundation for queue-ready reservation control

Priority rationale:
- Core event, booking, watchlist, dashboard, event creation, event editing, and my-events flows are working in the current baseline after runtime bug fixes and end-to-end verification.
- The most visible remaining product gap is creator-side UX clarity: edit-mode copy, workspace information hierarchy, and event-capacity guidance still need polish to feel production-ready.
- Local frontend runtime stability remains important because repeated restart reliability affects verification speed and deployment confidence.
- JWT and Google OAuth are now part of the live baseline, so the remaining auth work is validation and hardening rather than first-pass rollout.
- Docker packaging, reverse-proxy setup, and server-side env conventions are now present, and the current lightweight deploy path remains Vercel for frontend plus EC2 for backend and MySQL.
