# API Specification

This document defines the minimum API contract for the current product baseline.

Use `docs/product/implementation-status.md` for implementation coverage and `agent.md` for scope boundaries.

## Status Frame

### Current
- The auth, event, booking, watchlist, dashboard, my-events, and create APIs documented here are part of the current baseline.

### Temporary
- No temporary auth fallback remains in the current baseline.

### Target
- Converge protected API authentication on the JWT bearer contract only.

### Out Of Scope
- Password reset
- Payments
- Notifications

## Common Rules

### Base Path
```text
/api/v1
```

### Auth Model
Current:
- JWT bearer authentication

Current:
- the backend authenticates protected routes through `Authorization: Bearer <token>`
- the frontend host stores the issued token in an httpOnly cookie and attaches it when calling the backend
- the backend enforces protected routes through Spring Security's stateless filter chain before controller logic runs

### Common Error Shape
```json
{
  "code": "EVENT_SOLD_OUT",
  "message": "The event is sold out."
}
```

Common error codes:
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `EVENT_NOT_FOUND`
- `BOOKING_NOT_FOUND`
- `EVENT_SOLD_OUT`
- `ALREADY_BOOKED`
- `BOOKING_QUANTITY_LIMIT_EXCEEDED`
- `INVALID_SCHEDULE`

## Shared Data Shapes

### Event Summary
```json
{
  "id": "evt_123",
  "title": "Summer Jazz Night",
  "imageUrl": "https://example.com/image.jpg",
  "category": "Concert",
  "price": 45,
  "location": "Blue Note Jazz Club, NYC",
  "eventDateTime": "2026-03-15T20:00:00Z",
  "reservationOpenDateTime": "2026-03-08T10:00:00Z",
  "totalSlots": 100,
  "reservedSlots": 87,
  "remainingSlots": 13,
  "isWatchlisted": true,
  "isTrending": true,
  "isEndingSoon": false,
  "isOpeningSoon": false,
  "host": {
    "id": "usr_900",
    "name": "Jazz Collective NYC",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

### Event Detail
```json
{
  "id": "evt_123",
  "title": "Summer Jazz Night",
  "imageUrl": "https://example.com/image.jpg",
  "category": "Concert",
  "description": "Experience an unforgettable evening of smooth jazz.",
  "price": 45,
  "location": "Blue Note Jazz Club, NYC",
  "eventDateTime": "2026-03-15T20:00:00Z",
  "reservationOpenDateTime": "2026-03-08T10:00:00Z",
  "totalSlots": 100,
  "reservedSlots": 87,
  "remainingSlots": 13,
  "maxTicketsPerBooking": 10,
  "isWatchlisted": true,
  "host": {
    "id": "usr_900",
    "name": "Jazz Collective NYC",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

### Booking Summary
```json
{
  "bookingId": "BK-2026-001",
  "eventId": "evt_123",
  "title": "Summer Jazz Night",
  "imageUrl": "https://example.com/image.jpg",
  "status": "confirmed",
  "location": "Blue Note Jazz Club, NYC",
  "eventDateTime": "2026-03-15T20:00:00Z",
  "bookedAt": "2026-03-05T09:30:00Z",
  "ticketCount": 2
}
```

### Booking Detail
```json
{
  "bookingId": "BK-2026-001",
  "eventId": "evt_123",
  "status": "confirmed",
  "participantName": "Alex Johnson",
  "ticketCount": 2,
  "bookedAt": "2026-03-05T09:30:00Z",
  "unitPrice": 45,
  "totalAmount": 90,
  "event": {
    "id": "evt_123",
    "title": "Summer Jazz Night",
    "imageUrl": "https://example.com/image.jpg",
    "category": "Concert",
    "description": "Experience an unforgettable evening of smooth jazz.",
    "location": "Blue Note Jazz Club, NYC",
    "eventDateTime": "2026-03-15T20:00:00Z",
    "reservationOpenDateTime": "2026-03-08T10:00:00Z",
    "host": {
      "id": "usr_900",
      "name": "Jazz Collective NYC",
      "avatarUrl": "https://example.com/avatar.jpg"
    }
  }
}
```

## Auth APIs

### POST /auth/signup
Current:
- implemented

Request:
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "dev-password"
}
```

Response `200 OK`:
```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "usr_123",
    "name": "Alex Johnson",
    "email": "alex@example.com"
  }
}
```

Errors:
- `EMAIL_ALREADY_IN_USE` when the email already exists
- `VALIDATION_ERROR` for malformed request fields
- same JWT contract as local login and Google OAuth
### POST /auth/login
Current:
- implemented

Request:
```json
{
  "email": "alex@example.com",
  "password": "secret"
}
```

Response `200 OK`:
```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "usr_123",
    "name": "Alex Johnson",
    "email": "alex@example.com"
  }
}
```

Errors:
- `UNAUTHENTICATED` for invalid email or password
- `VALIDATION_ERROR` for malformed request fields

### POST /auth/oauth/google/exchange
Current:
- implemented

Request:
```json
{
  "code": "google-auth-code",
  "redirectUri": "http://localhost:3000/auth/callback/google"
}
```

Response `200 OK`:
```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "usr_123",
    "name": "Alex Johnson",
    "email": "alex@example.com"
  }
}
```

Errors:
- `UNAUTHENTICATED` for invalid Google identity or failed token exchange
- `VALIDATION_ERROR` for malformed request fields

### GET /me
Current:
- implemented

Response `200 OK`:
```json
{
  "id": "usr_123",
  "name": "Alex Johnson",
  "email": "alex@example.com"
}
```

Errors:
- `UNAUTHENTICATED`

### POST /auth/logout
Current:
- implemented

Response `204 No Content`

Note:
- stateless logout succeeds even when no token is currently stored by the frontend

## Event Discovery APIs

### GET /events
Current:
- implemented

Query parameters:
- `q`
- `category`
- `section`
- `page`
- `size`

Query behavior:
- `q` matches event title, description, location, and host name
- `category` must be one of `Concert`, `Restaurant`, `Art & Design`, `Sports`, `Other`
- `section` must be one of `trending`, `endingSoon`, `openingSoon`, `watchlist`
- invalid `category` or `section` returns `VALIDATION_ERROR`

Response `200 OK`:
```json
{
  "items": [
    {
      "id": "evt_123",
      "title": "Summer Jazz Night",
      "imageUrl": "https://example.com/image.jpg",
      "category": "Concert",
      "price": 45,
      "location": "Blue Note Jazz Club, NYC",
      "eventDateTime": "2026-03-15T20:00:00Z",
      "reservationOpenDateTime": "2026-03-08T10:00:00Z",
      "totalSlots": 100,
      "reservedSlots": 87,
      "remainingSlots": 13,
      "isWatchlisted": true,
      "isTrending": true,
      "isEndingSoon": false,
      "isOpeningSoon": false,
      "host": {
        "id": "usr_900",
        "name": "Jazz Collective NYC",
        "avatarUrl": "https://example.com/avatar.jpg"
      }
    }
  ],
  "page": 1,
  "size": 20,
  "total": 125
}
```

Notes:
- the server may compute `isTrending`, `isEndingSoon`, and `isOpeningSoon`
- `section=trending`, `section=endingSoon`, and `section=openingSoon` return only items in that derived section
- `section=watchlist` requires authentication
- `isEndingSoon` and `section=endingSoon` are time-based and represent events happening within the next 72 hours

### GET /events/{eventId}
Current:
- implemented

Response `200 OK`:
- returns the `Event Detail` shape

Errors:
- `EVENT_NOT_FOUND`

## Watchlist APIs

### POST /events/{eventId}/watchlist
Current:
- implemented

Response `204 No Content`

### DELETE /events/{eventId}/watchlist
Current:
- implemented

Response `204 No Content`

## Booking APIs

### POST /events/{eventId}/bookings
Current:
- implemented

Request:
```json
{
  "ticketCount": 2
}
```

Response `201 Created`:
```json
{
  "bookingId": "BK-2026-001",
  "eventId": "evt_123",
  "status": "confirmed",
  "ticketCount": 2,
  "bookedAt": "2026-03-05T09:30:00Z",
  "unitPrice": 45,
  "totalAmount": 90
}
```

Errors:
- `UNAUTHENTICATED`
- `EVENT_NOT_FOUND`
- `EVENT_SOLD_OUT`
- `ALREADY_BOOKED`
- `BOOKING_QUANTITY_LIMIT_EXCEEDED`
- `VALIDATION_ERROR`

Notes:
- `ticketCount` must be at least `1`
- `ticketCount` must not exceed the event's `maxTicketsPerBooking`
- `GET /events/{eventId}` returns `maxTicketsPerBooking` so the frontend can clamp the selector before submit

### GET /me/bookings
Current:
- implemented

Query parameters:
- `status`
- `page`
- `size`

Notes:
- returns paginated booking summary items for the authenticated user

### GET /me/bookings/{bookingId}
Current:
- implemented

Response `200 OK`:
- returns the `Booking Detail` shape

Errors:
- `UNAUTHENTICATED`
- `BOOKING_NOT_FOUND`

## Dashboard And My Event APIs

### GET /me/dashboard-summary
Current:
- implemented

Response `200 OK`:
```json
{
  "stats": {
    "totalBookings": 3,
    "upcomingOpenEvents": 2,
    "completedBookings": 1,
    "watchlistCount": 4,
    "createdEvents": 2
  },
  "recentBookings": [
    {
      "bookingId": "BK-2026-001",
      "eventId": "evt_123",
      "title": "Summer Jazz Night",
      "imageUrl": "https://example.com/image.jpg",
      "status": "confirmed",
      "location": "Blue Note Jazz Club, NYC",
      "eventDateTime": "2026-03-15T20:00:00Z",
      "bookedAt": "2026-03-05T09:30:00Z",
      "ticketCount": 2
    }
  ],
  "upcomingOpenEvents": [],
  "watchlistPreview": [],
  "createdEventsPreview": []
}
```

Notes:
- `recentBookings` reuses `Booking Summary`
- `upcomingOpenEvents`, `watchlistPreview`, and `createdEventsPreview` reuse `Event Summary`

### GET /me/events
Current:
- implemented

Query parameters:
- `page`
- `size`

Response `200 OK`:
```json
{
  "items": [
    {
      "id": "evt_123",
      "title": "Summer Jazz Night",
      "imageUrl": "https://example.com/image.jpg",
      "category": "Concert",
      "price": 45,
      "location": "Blue Note Jazz Club, NYC",
      "eventDateTime": "2026-03-15T20:00:00Z",
      "reservationOpenDateTime": "2026-03-08T10:00:00Z",
      "totalSlots": 100,
      "reservedSlots": 87,
      "remainingSlots": 13,
      "isWatchlisted": false,
      "isTrending": true,
      "isEndingSoon": false,
      "isOpeningSoon": false,
      "host": {
        "id": "usr_123",
        "name": "Alex Johnson",
        "avatarUrl": null
      }
    }
  ],
  "page": 1,
  "size": 12,
  "total": 3
}
```

Notes:
- reuses `Event Summary`
- returns only the authenticated user's created events
- default ordering is newest-created first

### GET /me/events/{eventId}
Current:
- implemented

Response `200 OK`:
- returns the `Event Detail` shape for the authenticated creator's own event

Errors:
- `UNAUTHENTICATED`
- `EVENT_NOT_FOUND`

## Event Management API

### POST /events
Current:
- implemented

Request:
```json
{
  "title": "New Event",
  "category": "Concert",
  "description": "Event description",
  "price": 45,
  "location": "Seoul",
  "eventDateTime": "2026-04-15T18:00:00Z",
  "reservationOpenDateTime": "2026-04-10T10:00:00Z",
  "totalSlots": 100,
  "maxTicketsPerBooking": 4,
  "imageUrl": "https://example.com/image.jpg"
}
```

Response `201 Created`:
```json
{
  "id": "evt_999",
  "title": "New Event"
}
```

Errors:
- `UNAUTHENTICATED`
- `VALIDATION_ERROR`
- `INVALID_SCHEDULE`

Notes:
- `maxTicketsPerBooking` must be at least `1`
- `maxTicketsPerBooking` must not exceed `totalSlots`

### PATCH /events/{eventId}
Current:
- implemented

Request:
- same payload as `POST /events`

Response `200 OK`:
```json
{
  "id": "evt_999",
  "title": "Updated Event"
}
```

Errors:
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `EVENT_NOT_FOUND`
- `VALIDATION_ERROR`
- `INVALID_SCHEDULE`

Notes:
- only the creator who owns the event may update it
- edits are allowed only before `reservationOpenDateTime`; once reservations are open the API returns `FORBIDDEN`
- `totalSlots` must remain greater than or equal to the current reserved slot count
- `maxTicketsPerBooking` must not exceed `totalSlots`
