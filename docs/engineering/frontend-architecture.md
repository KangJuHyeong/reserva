# Frontend Architecture

This document describes the frontend structure and UX states for the current product baseline.

Use `agent.md` for scope boundaries and `docs/product/implementation-status.md` for current implementation coverage.

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

## Frontend Work Areas
- `frontend/app`: route entry points
- `frontend/app/api`: same-origin proxy routes for auth and event mutations
- `frontend/components`: interactive UI and page composition
- `frontend/lib/server`: backend wrappers and server-side queries

## Core Frontend Data Model

### Event Shape
Frontend-visible fields:
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
- optional server-derived flags such as `isTrending`, `isEndingSoon`, `isOpeningSoon`

### Booking Shape
Frontend-visible fields:
- `bookingId`
- `eventId`
- `status`
- `bookedAt`
- `participantName`
- `ticketCount`
- `unitPrice`
- `totalAmount`

### Current User Shape
Frontend-visible fields:
- `id`
- `name`
- `email`
- optional avatar image

## Homepage Information Architecture
Primary behaviors:
- global search
- category switching
- discovery sections
- navigation into event detail
- watchlist save and remove actions on event cards
- watchlist filtered view through `/?view=Watchlist`

Primary sections:
- trending
- almost full
- ending soon
- opening soon
- watchlist
- filtered search results

UX expectations:
- the default view should feel like curated discovery
- filtered state should feel like a list view
- empty results should be handled with an explicit empty state

Current implementation:
- discovery sections are backed by live API data
- filtered discovery states support pagination through the homepage query state
- watchlist view shows explicit unauthenticated and empty states when needed

## Event Detail Page
Current implementation status:
- live route backed by real API data

Required sections:
- cover image
- category badge
- title
- location
- date and time
- host info
- description
- price
- slot progress
- remaining slots
- reserve CTA
- ticket count input
- reservation-open datetime
- watchlist action
- share action

Key UX states:
- available to reserve
- sold out
- still opening soon
- not found

Current implementation keeps the reserve action as a direct API-backed booking submission.

## Dashboard
Current implementation status:
- live route backed by dashboard summary data

Primary sections:
- overview stats
- recent bookings
- opening-soon preview
- watchlist preview
- my-events quick link
- quick context / actions

Key UX states:
- authenticated dashboard summary
- unauthenticated access redirected to `/login`

## My Events Page
Current implementation status:
- live route backed by the created-events API

Primary sections:
- page header and description
- create-event CTA
- created-event card grid
- pagination controls

Key UX states:
- authenticated list state
- empty created-events state
- unauthenticated access redirected to `/login`

## Booking Detail Page
Current implementation status:
- live route backed by real API data

Required sections:
- booking status banner
- event summary and cover image
- booking information
- participant details
- payment summary
- host information
- optional cancel action placeholder

Key UX states:
- confirmed
- completed
- cancelled
- not found

## Create Event Page
Current implementation status:
- implemented as a live create form in the current frontend slice

Current visible inputs:
- cover image
- title
- category
- description
- price
- total slots
- location
- event date
- event time
- reservation open date
- reservation open time

Required frontend behavior:
- submit disabled or loading state while saving
- field validation feedback
- schedule validation
- redirect or success transition after creation

## Login Page
Current implementation status:
- implemented as a live session-login route in the current frontend slice

Visible elements:
- email input
- password input
- sign in CTA
- demo credential guidance

Do not treat the page as confirmation of:
- signup flow
- OAuth provider support
- password reset flow

## State And UX Rules

### Search And Filtering
- search should update event list results
- category changes should update the visible list or sectioned feed
- opening soon can be a dedicated filtered mode
- filtered discovery states should support pagination
- changing search or category should reset filtered pagination back to page 1

### Watchlist
- target behavior: toggling should update card and detail state immediately
- current implementation: watchlist toggles are connected on discovery cards, opening-soon cards, and event detail
- current implementation: the watchlist filtered view loads persisted items and shows an explicit unauthenticated or empty state when needed

### Booking Action
- reserve CTA should show loading while submitting
- duplicate clicks must be prevented during submission
- sold-out state should disable the CTA

### Empty States
Required empty states:
- no search results
- no bookings
- no opening-soon items
- no watchlist items
- no created events
- not-found routes

## Frontend Data Fetching

### Currently Used
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
- a server-side wrapper that can still inject the temporary development auth fallback

### Still Needed For Remaining Product Gaps
- no additional my-events endpoint gaps in the current baseline

## Future Extension
Waiting-room or polling UX may be added later for high-demand events, but it is not the primary frontend contract today.
