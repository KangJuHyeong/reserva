# Concurrent Booking Verification

Event: `evt_demo_chef_waitlist`

| Metric | Value |
| --- | ---: |
| Requests | 8 |
| Ticket count per request | 2 |
| Created bookings (201) | 0 |
| Expected conflicts (409) | 8 |
| Unexpected failures | 0 |

This local check is valid when unexpected failures are zero and database inventory remains within capacity after the run.
