# Frontend Architecture

This document describes the frontend structure and UX states for the current product baseline.

Use `agent.md` for scope boundaries and `docs/product/implementation-status.md` for current implementation coverage.

## Route Map
- `/`
- `/reservation/[id]`
- `/booking/[id]`
- `/dashboard`
- `/create`
- `/login`

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
- `role`
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

## Event Detail Page
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
- placeholder route only
- no live dashboard data is wired yet

Primary sections:
- overview
- my reservations
- created reservations
- watchlist
- quick actions

## Booking Detail Page
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
- placeholder route only in the current frontend slice

Visible elements:
- email input
- password input
- remember me checkbox
- forgot password placeholder
- sign in CTA
- provider-style buttons as visual placeholders

Do not treat the page as confirmation of:
- signup flow
- OAuth provider support
- password reset flow

## State And UX Rules

### Search And Filtering
- search should update event list results
- category changes should update the visible list or sectioned feed
- opening soon can be a dedicated filtered mode

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
- not-found routes

## Frontend Data Fetching Expectations
The real frontend needs:
- current-user bootstrap from `GET /me`
- paginated event discovery requests
- event detail request
- booking list and detail requests
- dashboard summary request
- creator events request
- watchlist mutation requests

Current first-slice implementation uses:
- event discovery request
- event detail request
- booking creation request
- booking detail request
- create event request
- watchlist mutation requests
- a server-side wrapper that injects temporary development auth headers
- development auth header injection can be disabled for browser-side unauthenticated verification

## Future Extension
Waiting-room or polling UX may be added later for high-demand events, but it is not the primary frontend contract today.
