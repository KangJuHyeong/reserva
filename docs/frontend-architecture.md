# frontend-architecture.md

## 1. Purpose
This document describes the frontend structure and UX states implied by the current prototype in `prototype/b_XRSe9jZaGQj-1773064905125`.

The current frontend is a marketplace-style experience, not a queue-first flow. The docs should follow the visible screens first and only mention future waiting-room ideas as optional later expansion.

Current implementation note:
- a real `Next.js App Router` frontend now exists in `frontend`
- the current connected frontend slice covers `/`, `/reservation/[id]`, `/booking/[id]`, and `/create`
- `/dashboard` and `/login` are currently preserved as placeholder routes, not full implementations

## 2. Route Map
Current canonical routes:
- `/`
- `/reservation/[id]`
- `/booking/[id]`
- `/dashboard`
- `/create`
- `/login`

## 3. Core Frontend Data Model

### 3.1 Event Shape
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

### 3.2 Booking Shape
Frontend-visible fields:
- `bookingId`
- `eventId`
- `status`
- `bookedAt`
- `participantName`
- `ticketCount`
- `unitPrice`
- `totalAmount`

### 3.3 Current User Shape
Frontend-visible fields:
- `id`
- `name`
- `email`
- `role`
- optional avatar image

## 4. Homepage Information Architecture
The homepage is the main discovery surface.

Primary behaviors:
- global search
- category switching
- discovery sections
- access to event detail
- current implementation keeps watchlist as a disabled/unavailable state until persistence APIs exist

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

## 5. Homepage Cards

### 5.1 Standard Event Card
Required visible elements:
- image
- category
- price
- title
- location
- date/time
- participant progress
- reserve CTA
- watchlist toggle or disabled placeholder state

### 5.2 Opening Soon Card
Required visible elements:
- countdown badge
- event image
- host info
- location
- event date
- reservation-open datetime
- price
- total slots
- disabled CTA

Design meaning:
- the event exists and is discoverable
- booking is not yet available
- watchlist still matters as future behavior, even if the first frontend slice keeps it disabled

## 6. Event Detail Page
The detail page is the conversion surface for booking.

Required sections:
- cover image
- category badge
- title
- location
- date/time
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

Current prototype behavior uses a direct reserve CTA. The frontend should not assume a waiting room or async attempt state as the default experience.
Current implemented first slice also keeps the reserve action as a direct API-backed booking submission.

## 7. Dashboard
The dashboard is a combined personal hub and creator hub.
Current implementation status:
- placeholder route only
- no live dashboard data is wired yet

Primary sections:
- overview
- my reservations
- created reservations
- watchlist
- quick actions

Overview expectations:
- summary stats
- recent bookings preview
- opening-soon preview
- fast navigation into deeper sections

My reservations expectations:
- card or list view of the user's bookings
- status badge per booking
- direct navigation to booking detail

Created reservations expectations:
- creator-owned event listing
- event management actions can later be attached here

Watchlist expectations:
- saved events surfaced in one place
- ability to revisit events quickly

Quick actions:
- create new event
- browse events

## 8. Booking Detail Page
The booking detail page is a confirmation-style record view.

Required sections:
- booking status banner
- event summary and cover image
- booking information
- participant details
- payment summary
- host information
- optional cancel action placeholder

Required fields:
- booking id
- booking date
- status
- participant name
- ticket count
- unit price
- total amount

Key UX states:
- confirmed
- completed
- cancelled
- not found

## 9. Create Event Page
The create page is a creator-only form.
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

Current important business rule:
- reservation open datetime must be before event datetime

## 10. Login Page
The login page currently supports only a minimal auth story.
Current implementation status:
- placeholder route only in the current frontend slice

Visible elements:
- email input
- password input
- remember me checkbox
- forgot password placeholder
- sign in CTA
- provider-style buttons as visual placeholders

Current frontend assumption:
- the page only requires login support and current-user bootstrap

Do not treat the page as confirmation of:
- signup flow
- OAuth provider support
- password reset flow

Those remain future decisions unless separately confirmed.

## 11. State And UX Rules

### 11.1 Search And Filtering
- search should update event list results
- category changes should update the visible list or sectioned feed
- opening soon can be a dedicated filtered mode

### 11.2 Watchlist
- target behavior: toggling should update card and detail state immediately
- current first-slice behavior: watchlist actions are intentionally disabled until backend watchlist endpoints exist

### 11.3 Booking Action
- reserve CTA should show loading while submitting
- duplicate clicks must be prevented during submission
- sold-out state should disable the CTA

### 11.4 Empty States
Required empty states:
- no search results
- no bookings
- no opening-soon items
- not-found routes

## 12. Frontend Data Fetching Expectations
Even though the prototype uses mock data, the real frontend will need:
- current-user bootstrap from `GET /me`
- paginated event discovery requests
- event detail request
- booking list/detail requests
- dashboard summary request
- creator events request
- watchlist mutation requests

Current first-slice implementation now uses:
- event discovery request
- event detail request
- booking creation request
- booking detail request
- a frontend server-side wrapper that injects temporary development auth headers

## 13. Future Extension
Waiting-room or polling UX may be added later for high-demand events, but it is not the primary frontend contract today.

If introduced later, it should be documented as an extension to:
- homepage opening-soon state
- event detail booking flow
- booking confirmation flow

It should not replace the current direct booking flow in the baseline docs.

## 14. Summary
The current frontend architecture centers on:
- discovery
- detail
- booking
- dashboard
- creator publishing
- minimal login

Current implementation status is narrower than the target route map:
- implemented now: discovery, event detail, booking creation, booking detail, creator event creation
- placeholder only: dashboard, login
- not yet active: watchlist persistence and dashboard data integration

The frontend should stay aligned with the prototype first and only adopt future queue or advanced auth UX when those features are explicitly confirmed.
