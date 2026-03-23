# API Specification

This document defines the minimum API contract for the current product baseline.

Use `docs/product/implementation-status.md` for implementation coverage and `agent.md` for scope boundaries.

## Status Frame

### Current
- The auth, event, booking, watchlist, dashboard, my-events, and create APIs documented here are part of the current baseline.

### Temporary
- No temporary auth fallback remains in the current baseline.

### Target
- Converge protected API authentication on the session contract only.

### Out Of Scope
- Signup
- OAuth
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
- session-based authentication

Current:
- the backend authenticates documented auth endpoints through server-managed sessions
- protected routes use the same session contract as login, me, and logout

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
- invalidating a missing session is still treated as success

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
- `category` must be one of `Concert`, `Restaurant`, `Art & Design`, `Sports`
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
- `VALIDATION_ERROR`

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
