# api-spec.md

## 1. Purpose
This document defines the minimum API contract required to support the current prototype.

Vocabulary:
- `event`: a joinable listing shown in discovery and detail pages
- `booking`: a user's confirmed reservation record for an event

The prototype currently uses mock data. These endpoints are the inferred minimum needed to make those screens implementable without committing to unconfirmed product scope.

## 2. Common Rules

### 2.1 Current Implementation Status
Target documented auth model:
- session-based authentication

Current temporary backend implementation:
- request headers `X-User-Id`, `X-User-Name`, `X-User-Role`
- this is a development-only current-user resolution mechanism
- this is not the final documented auth contract

Implemented now:
- `GET /events`
- `GET /events/{eventId}`
- `POST /events/{eventId}/bookings`
- `GET /me/bookings`
- `GET /me/bookings/{bookingId}`

Documented contract but not yet implemented:
- `POST /auth/login`
- `GET /me`
- `POST /auth/logout`
- watchlist endpoints
- dashboard and creator endpoints

### 2.2 Base Path
Example base path:

```text
/api/v1
```

### 2.3 Auth Model
Current documented default:
- session-based authentication

Authenticated endpoints should use the current logged-in user from the active session.

Temporary implementation note:
- the current backend code resolves the user from request headers during local development
- this temporary mechanism should not be treated as the final auth design

### 2.4 Common Error Shape

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

## 3. Shared Data Shapes

### 3.1 Event Summary

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

### 3.2 Event Detail

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

### 3.3 Booking Summary

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

### 3.4 Booking Detail

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

## 4. Auth APIs

Status:
- documented contract
- not yet implemented in the current backend baseline

### 4.1 POST /auth/login
Logs a user in with the current minimal login form.

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
- `UNAUTHENTICATED` for invalid credentials
- `VALIDATION_ERROR`

### 4.2 GET /me
Returns the current user for app bootstrapping and route protection.

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

### 4.3 POST /auth/logout
Ends the current authenticated session.

Response `204 No Content`

## 5. Event Discovery APIs

### 5.1 GET /events
Returns the discovery feed for the home page.

Query parameters:
- `q`: search string
- `category`: `Concert | Restaurant | Art & Design | Sports`
- `section`: optional derived section such as `trending`, `endingSoon`, `openingSoon`, `watchlist`
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
- The server may compute `isTrending`, `isEndingSoon`, and `isOpeningSoon`.
- The `watchlist` section requires authentication.

### 5.2 GET /events/{eventId}
Returns the event detail page payload.

Response `200 OK`:
- returns the `Event Detail` shape

Errors:
- `EVENT_NOT_FOUND`

## 6. Watchlist APIs

Status:
- documented contract
- not yet implemented in the current backend baseline

### 6.1 POST /events/{eventId}/watchlist
Adds an event to the current user's watchlist.

Response `204 No Content`

Errors:
- `UNAUTHENTICATED`
- `EVENT_NOT_FOUND`

### 6.2 DELETE /events/{eventId}/watchlist
Removes an event from the current user's watchlist.

Response `204 No Content`

Errors:
- `UNAUTHENTICATED`
- `EVENT_NOT_FOUND`

## 7. Booking APIs

### 7.1 POST /events/{eventId}/bookings
Creates a booking for the current user.

Status:
- implemented now in the current backend baseline
- current auth input is temporary request-header based during development

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

Current implementation notes:
- duplicate active bookings are rejected
- sold-out or insufficient remaining slots are rejected
- inventory update and booking creation are handled in one transaction

### 7.2 GET /me/bookings
Returns bookings for the current user.

Status:
- implemented now in the current backend baseline
- current auth input is temporary request-header based during development

Query parameters:
- `status`: optional
- `page`
- `size`

Response `200 OK`:

```json
{
  "items": [
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
  "page": 1,
  "size": 20,
  "total": 3
}
```

Errors:
- `UNAUTHENTICATED`
- `VALIDATION_ERROR` for unsupported `status`

### 7.3 GET /me/bookings/{bookingId}
Returns the booking detail page payload.

Status:
- implemented now in the current backend baseline
- current auth input is temporary request-header based during development

Response `200 OK`:
- returns the `Booking Detail` shape

Errors:
- `UNAUTHENTICATED`
- `BOOKING_NOT_FOUND`

## 8. Dashboard And Creator APIs

Status:
- documented contract
- not yet implemented in the current backend baseline

### 8.1 GET /me/dashboard-summary
Returns aggregate counts and preview lists for the dashboard overview.

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
  "recentBookings": [],
  "upcomingOpenEvents": [],
  "watchlistPreview": [],
  "createdEventsPreview": []
}
```

Errors:
- `UNAUTHENTICATED`

### 8.2 GET /me/events
Returns creator-owned events.

Query parameters:
- `status`: optional
- `page`
- `size`

Response `200 OK`:

```json
{
  "items": [],
  "page": 1,
  "size": 20,
  "total": 2
}
```

Errors:
- `UNAUTHENTICATED`
- `FORBIDDEN`

### 8.3 POST /events
Creates a new event from the creator form.

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
- `FORBIDDEN`
- `INVALID_SCHEDULE`
- `VALIDATION_ERROR`

## 9. Unconfirmed Auth Features
The following are intentionally not defined in the current API contract:
- signup
- OAuth
- forgot password
- email verification
- MFA
- final token strategy beyond the current session-based default

If these features are later confirmed, they should be added as a separate documented expansion rather than silently folded into the current minimum scope.
