# API Specification

This document defines the minimum API contract for the current product baseline.

Use `docs/product/implementation-status.md` for current implementation coverage and `agent.md` for scope boundaries.

## Common Rules

### Base Path
```text
/api/v1
```

### Auth Model
Current documented default:
- session-based authentication

Temporary implementation note:
- the backend authenticates through server-managed sessions for the documented auth endpoints
- protected routes may still resolve the user from request headers during local development only when `DEV_AUTH_ENABLED=true`
- this header-based fallback is temporary and must not be treated as the final auth design

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
Status:
- implemented in the current backend baseline

### POST /auth/login
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
    "email": "alex@example.com",
    "role": "creator"
  }
}
```

Errors:
- `UNAUTHENTICATED` for invalid email or password
- `VALIDATION_ERROR` for malformed request fields

### GET /me
Response `200 OK`:
```json
{
  "id": "usr_123",
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "role": "creator"
}
```

Errors:
- `UNAUTHENTICATED`

### POST /auth/logout
Response `204 No Content`

Notes:
- invalidating a missing session is still treated as success

## Event Discovery APIs

### GET /events
Status:
- implemented now in the current backend baseline

Query parameters:
- `q`
- `category`
- `section`
- `page`
- `size`

Query behavior:
- `q` matches event title, description, location, and host name
- `category` must be one of `Concert`, `Restaurant`, `Art & Design`, or `Sports`
- `section` must be one of `trending`, `endingSoon`, `openingSoon`, or `watchlist`
- invalid `category` or `section` values return `VALIDATION_ERROR`

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
- `section=trending`, `section=endingSoon`, and `section=openingSoon` return only items that belong to that derived section
- `section=watchlist` requires authentication

### GET /events/{eventId}
Status:
- implemented now in the current backend baseline

Response `200 OK`:
- returns the `Event Detail` shape

Errors:
- `EVENT_NOT_FOUND`

## Watchlist APIs
Status:
- implemented now in the current backend baseline
- current auth input is session-first, with the temporary development fallback when enabled

### POST /events/{eventId}/watchlist
Response `204 No Content`

### DELETE /events/{eventId}/watchlist
Response `204 No Content`

## Booking APIs

### POST /events/{eventId}/bookings
Status:
- implemented now in the current backend baseline
- current auth input is session-first, with the temporary development fallback when enabled

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

### GET /me/bookings
Status:
- implemented now in the current backend baseline
- current auth input is session-first, with the temporary development fallback when enabled

Query parameters:
- `status`
- `page`
- `size`

### GET /me/bookings/{bookingId}
Status:
- implemented now in the current backend baseline
- current auth input is session-first, with the temporary development fallback when enabled

Response `200 OK`:
- returns the `Booking Detail` shape

## Dashboard And Creator APIs

### GET /me/dashboard-summary
Status:
- implemented now in the current backend baseline
- current auth input is session-first, with the temporary development fallback when enabled

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
- `recentBookings` reuses the `Booking Summary` shape
- `upcomingOpenEvents`, `watchlistPreview`, and `createdEventsPreview` reuse the `Event Summary` shape

### GET /me/events
Status:
- documented target contract
- not yet implemented in the current backend baseline

### POST /events
Status:
- implemented now in the current backend baseline
- current auth input is session-first, with the temporary development fallback when enabled

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

## Unconfirmed Auth Features
The following are intentionally not defined in the current API contract:
- signup
- OAuth
- forgot password
- email verification
- MFA
- final token strategy beyond the current session-based default
