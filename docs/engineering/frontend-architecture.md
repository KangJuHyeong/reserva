# Frontend Architecture

This document describes the route IA, UX states, and target improvements for the current frontend baseline.

Use `agent.md` for scope boundaries and `docs/product/implementation-status.md` for repository-wide status.

## Route Map
- `/`
- `/reservation/[id]`
- `/booking/[id]`
- `/dashboard`
- `/my-bookings`
- `/my-events`
- `/my-events/[id]/edit`
- `/create`
- `/login`
- `/signup`

## Current Route Status
- live route: `/`
- live route: `/reservation/[id]`
- live route: `/booking/[id]`
- live route: `/dashboard`
- live route: `/my-bookings`
- live route: `/my-events`
- live route: `/my-events/[id]/edit`
- live route: `/create`
- live route: `/login`
- live route: `/signup`

## Shared Shell

### Current
- Discovery pages use a shared top `Navbar`.
- Home uses desktop `Sidebar` and `MobileNav` for category and quick-link navigation.
- Authenticated navigation exposes quick entry to `/dashboard`, `/my-bookings`, `/my-events`, and `/create`.
- Dashboard and My Events are intentionally separate so users can tell the difference between a summary home and a creator workspace.
- Search is query-string driven through `q`.
- Category and mode changes are query-string driven through `view`.

### Temporary
- No temporary auth fallback remains in the current frontend baseline.

### Target
- Keep the current split between discovery shell and account workspace pages.
- Preserve dedicated `/my-events` access in navigation instead of burying created-event management inside dashboard-only tabs.

### Out Of Scope
- Global notification center behavior behind the bell icon

## Core Frontend Data Model

### Event Shape
- `id`
- `title`
- `imageUrl`
- `category`
- `price`
- `location`
- `eventDateTime`
- `reservationOpenDateTime`
- `totalSlots`
- `reservedSlots`
- `description`
- `host`
- `isWatchlisted`
- optional derived flags such as `isTrending`, `isEndingSoon`, and `isOpeningSoon`

### Booking Shape
- `bookingId`
- `eventId`
- `status`
- `bookedAt`
- `participantName`
- `ticketCount`
- `unitPrice`
- `totalAmount`

### Current User Shape
- `id`
- `name`
- `email`
- optional avatar image

## Route IA

### `/`

#### Purpose
- Main discovery surface for browsing, filtering, and entering reservation detail

#### Current Structure
- sticky `Navbar`
- desktop `Sidebar`
- mobile `MobileNav`
- default mixed feed section:
  - `Latest Events`
- default curated sections:
  - `Trending Now`
  - `Almost Full`
  - `Ending Soon`
  - `Opening Soon`
- filtered/search list mode
- filtered pagination controls

#### Current States
- default curated discovery state
- filtered category state
- search result state
- watchlist unauthenticated state
- watchlist empty state
- generic no-results state
- backend unavailable fallback state

#### Current Data Dependencies
- `GET /me` for optional current-user bootstrap
- `GET /events` for discovery, filtered lists, watchlist view, and pagination
- watchlist mutations through same-origin proxy routes

#### Target Improvements
- Keep the current server-driven curated sections instead of copying the prototype's heavier client-only page-state model.
- Keep watchlist as an explicit filtered mode instead of a default home section to reduce feed clutter.
- Improve workspace handoff through stronger quick links rather than by adding more home sections.
- Keep the default home route from feeling empty by showing a mixed feed first and hiding curated sections that currently have no matching events.

### `/reservation/[id]`

#### Purpose
- Event detail and booking entry point

#### Current Structure
- event hero image
- category badge and title
- location, date, and host info
- description
- price and slot status
- remaining slots and reservation-open timestamp
- ticket-count input with a visible event-specific per-booking cap
- reserve CTA
- watchlist action
- share action

#### Current States
- available to reserve
- sold out
- opening soon
- not found

#### Current Data Dependencies
- `GET /events/{eventId}`
- `POST /events/{eventId}/bookings`
- watchlist mutation routes

#### Target Improvements
- Keep the current direct booking action.
- Only add richer urgency or wait-state messaging if backend contract changes justify it.

### `/booking/[id]`

#### Purpose
- Booking confirmation and booking detail review

#### Current Structure
- booking status banner
- event summary with cover image
- booking information
- participant details
- payment summary
- host information
- cancel CTA for cancellable reservations
- navigation back to discovery

#### Current States
- confirmed
- completed
- cancelled
- not found

#### Current Data Dependencies
- `GET /me/bookings/{bookingId}`
- `POST /me/bookings/{bookingId}/cancel`

#### Target Improvements
- Keep booking detail focused on a single reservation while exposing cancellation only when the backend marks the booking as still cancellable.
- Avoid adding broader check-in or payment-management controls until backend scope expands.

### `/dashboard`

#### Purpose
- Personal summary page for recent activity and next actions

#### Current Structure
- hero summary block focused on personal activity
- stats card grid
- recent bookings section
- CTA into `/my-bookings`
- watchlist preview section
- opening-soon preview section
- created-events preview with CTA into `/my-events`
- preview sections include handoff CTAs into full list destinations where those destinations exist
- quick guidance block that explains where Dashboard and My Events start

#### Current States
- authenticated dashboard summary
- empty preview sections
- unauthenticated redirect to `/login`
- backend unavailable fallback state

#### Current Data Dependencies
- `GET /me`
- `GET /me/dashboard-summary`

#### Target Improvements
- Keep dashboard as a summary home for reservations, watchlist, and published-event previews.
- Keep full booking management in `/my-bookings` instead of letting the summary page grow into a second booking workspace.
- Keep created-event management in `/my-events` instead of reverting to the prototype's multi-tab dashboard workspace.
- If creator tooling grows later, expand through summary-level entry points instead of turning dashboard into an all-in-one control panel.

### `/my-bookings`

#### Purpose
- Dedicated workspace for the current user's booking history and reservation management

#### Current Structure
- page header and description that frame the route as a reservation workspace
- back link to `/dashboard`
- status filter
- booking card grid
- pagination controls

#### Current States
- authenticated booking list state
- empty booking state
- filtered empty state
- unauthenticated redirect to `/login`
- backend unavailable fallback state

#### Current Data Dependencies
- `GET /me`
- `GET /me/bookings`

#### Target Improvements
- Keep this route separate from dashboard so reservations have a clear full-list destination instead of staying inside summary-only previews.
- Keep booking detail itself focused on a single reservation while list management and filtering live here.

### `/my-events`

#### Purpose
- Dedicated workspace for the current user's created events

#### Current Structure
- page header and description that frame the route as a creator workspace
- back link to `/dashboard`
- create-event CTA
- server-backed filter and sort controls
- created-event card grid
- delete CTA for still-editable events
- pagination controls

#### Current States
- authenticated list state
- empty created-events state
- unauthenticated redirect to `/login`
- backend unavailable fallback state

#### Current Data Dependencies
- `GET /me`
- `GET /me/events`
- `DELETE /events/{eventId}`

#### Target Improvements
- Keep this route separate from dashboard because it creates a clearer IA boundary between "my summary" and "my published inventory."
- Keep edit affordances focused on direct creator maintenance instead of turning the page into a broader operations console.
- Grow creator operations through server-backed filters, ordering, and clearly bounded maintenance actions before adding broader event-operations tooling.

### `/my-events/[id]/edit`

#### Purpose
- Edit an existing event from the creator workspace

#### Current Structure
- prefilled event form reusing the create-event field set
- owner-only entry from `/my-events`
- visible lock state after reservation open so creators can immediately tell whether editing is still allowed
- save CTA and reset/cancel action

#### Current States
- authenticated edit state
- validation error state
- unauthenticated redirect to `/login`
- missing or non-owned event redirect back to `/my-events`
- backend unavailable fallback state

#### Current Data Dependencies
- `GET /me`
- `GET /me/events/{eventId}`
- `PATCH /events/{eventId}`

#### Target Improvements
- Keep edit and create field sets aligned while the product stays within the current event-publishing baseline.
- Keep `/my-events` and the edit form explicit that events become non-editable once reservations have opened.

### `/create`

#### Purpose
- Event creation flow for an authenticated user

#### Current Structure
- cover image input
- title
- category
- description
- price
- total slots
- max tickets per booking
- location
- event date and time
- reservation open date and time
- validation and submit CTA

#### Current States
- idle form state
- validation error state
- saving state
- post-submit redirect or success transition
- unauthenticated redirect to `/login`
- backend unavailable fallback state

#### Current Data Dependencies
- `GET /me`
- `POST /events`

#### Target Improvements
- Keep the current explicit scheduling fields.
- Do not add richer media or draft behavior until product scope expands.

### `/login`

#### Purpose
- JWT-login and Google OAuth entry point

#### Current Structure
- back-to-home link
- email field
- password field
- sign-in CTA
- Google sign-in CTA
- error message area
- demo credential guidance
- side explanation panel for current JWT and OAuth behavior

#### Current States
- idle form state
- submitting state
- login error state
- backend unavailable fallback state

#### Current Data Dependencies
- `POST /auth/login`
- `GET /api/auth/google/start`
- post-login bootstrap through `GET /me`

#### Target Improvements
- Keep login focused on local email/password and Google OAuth only.
- Keep login focused on account entry and hand off account creation to `/signup`.

### `/signup`

#### Purpose
- Local account-creation entry point that lands the user in the same JWT-authenticated state as login

#### Current Structure
- back-to-home link
- name field
- email field
- password field
- account-create CTA
- back-to-login link
- side explanation panel for the current JWT signup behavior

#### Current States
- idle form state
- submitting state
- duplicate-email error state
- validation error state
- backend unavailable fallback state

#### Current Data Dependencies
- `POST /auth/signup`
- post-signup bootstrap through `GET /me`

#### Target Improvements
- Keep local account creation aligned to the same JWT cookie contract used by login.
- Do not add password recovery or multi-step email verification until those flows enter scope.

## Prototype Comparison Notes

### Current
- The `prototype` directory and `docs/prototype.pdf` are reference artifacts only.
- The live app already diverges from the prototype in meaningful ways, especially around dashboard and created-events flow.

### Target
- Keep current improvements where they are structurally better than the prototype:
  - separate `/my-events` workspace instead of crowding created items into dashboard tabs
  - server-driven discovery states instead of a heavier client-only homepage state model
  - dedicated summary-style dashboard instead of an overloaded all-purpose dashboard
- Reuse prototype ideas only when they improve hierarchy or task flow without blurring route responsibility.

## State And UX Rules

### Search And Filtering
- search updates event list results through query state
- category changes update the visible list or curated/feed mode
- opening soon can be a dedicated filtered mode
- filtered discovery states support pagination
- changing search or category resets filtered pagination to page 1

### Watchlist
- toggling should update card and detail state immediately
- current implementation connects watchlist actions on discovery cards, opening-soon cards, and event detail
- the watchlist filtered view shows explicit unauthenticated and empty states when needed

### Booking Action
- reserve CTA should show loading while submitting
- duplicate clicks must be prevented during submission
- ticket-count input should clamp to the smaller of remaining capacity and the event-specific per-booking limit returned by event detail
- sold-out state should disable the CTA

### Empty States
- no search results
- no watchlist items
- no opening-soon items
- no created events
- not-found routes

## Frontend Data Fetching

### Current
- current-user bootstrap from `GET /me`
- paginated event discovery requests
- event detail request
- booking creation request
- booking detail request
- create event request
- dashboard summary request
- my-events request
- watchlist mutation requests
- same-origin proxy routes for login, logout, current-user bootstrap, bookings, and watchlist mutations
- same-origin auth routes own the browser auth cookie and expose Google OAuth start/callback handling
- same-origin proxy routes convert backend transport failures into explicit unavailable responses for the UI

### Temporary
- no temporary development auth headers are injected by the server-side backend wrapper

### Target
- keep route-to-data ownership simple and page-local
- avoid adding extra frontend-only state layers when the server contract already expresses the needed filtered state
- keep browser auth storage in httpOnly cookies rather than client-readable storage

### Out Of Scope
- waiting-room or polling UX for high-demand events
