# Frontend Architecture

This document describes the route IA, UX states, and target improvements for the current frontend baseline.

Use `agent.md` for scope boundaries and `docs/product/implementation-status.md` for repository-wide status.

## Route Map
- `/`
- `/reservation/[id]`
- `/booking/[id]`
- `/dashboard`
- `/my-events`
- `/create`
- `/login`

## Current Route Status
- live route: `/`
- live route: `/reservation/[id]`
- live route: `/booking/[id]`
- live route: `/dashboard`
- live route: `/my-events`
- live route: `/create`
- live route: `/login`

## Shared Shell

### Current
- Discovery pages use a shared top `Navbar`.
- Home uses desktop `Sidebar` and `MobileNav` for category and quick-link navigation.
- Authenticated navigation exposes quick entry to `/dashboard`, `/my-events`, and `/create`.
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
- ticket-count input
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
- navigation back to discovery

#### Current States
- confirmed
- completed
- cancelled
- not found

#### Current Data Dependencies
- `GET /me/bookings/{bookingId}`

#### Target Improvements
- Keep booking detail as a focused read view.
- Do not add speculative payment or cancel flows until backend support exists.

### `/dashboard`

#### Purpose
- Personal summary page for recent activity and next actions

#### Current Structure
- hero summary block
- stats card grid
- recent bookings section
- watchlist preview section
- opening-soon preview section
- created-events preview with CTA into `/my-events`
- quick context block

#### Current States
- authenticated dashboard summary
- empty preview sections
- unauthenticated redirect to `/login`
- backend unavailable fallback state

#### Current Data Dependencies
- `GET /me`
- `GET /me/dashboard-summary`

#### Target Improvements
- Keep dashboard as a summary page.
- Keep created-event management in `/my-events` instead of reverting to the prototype's multi-tab dashboard workspace.
- If creator tooling grows later, expand through summary-level entry points instead of turning dashboard into an all-in-one control panel.

### `/my-events`

#### Purpose
- Dedicated workspace for the current user's created events

#### Current Structure
- page header and description
- back link to `/dashboard`
- create-event CTA
- created-event card grid
- pagination controls

#### Current States
- authenticated list state
- empty created-events state
- unauthenticated redirect to `/login`
- backend unavailable fallback state

#### Current Data Dependencies
- `GET /me`
- `GET /me/events`

#### Target Improvements
- Keep this route separate from dashboard because it creates a clearer IA boundary between "my summary" and "my published inventory."
- Add edit/manage affordances only when the backend exposes matching update or management APIs.

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
- Minimal session-login entry point

#### Current Structure
- back-to-home link
- email field
- password field
- sign-in CTA
- error message area
- demo credential guidance
- side explanation panel for current auth behavior

#### Current States
- idle form state
- submitting state
- login error state
- backend unavailable fallback state

#### Current Data Dependencies
- `POST /auth/login`
- post-login bootstrap through `GET /me`

#### Target Improvements
- Keep login focused on the minimum session contract.
- Do not add signup, OAuth, or password-recovery IA until those flows enter scope.

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
- same-origin proxy routes convert backend transport failures into explicit unavailable responses for the UI

### Temporary
- no temporary development auth headers are injected by the server-side backend wrapper

### Target
- keep route-to-data ownership simple and page-local
- avoid adding extra frontend-only state layers when the server contract already expresses the needed filtered state

### Out Of Scope
- waiting-room or polling UX for high-demand events
