# Performance Toolkit

This directory contains local performance-seeding and k6 load-test assets for the Reserva backend.

Main entry points:
- `k6/public-events.js`: public discovery query baseline
- `k6/my-events.js`: authenticated creator workspace query baseline
- `k6/my-bookings.js`: authenticated booking-list query baseline
- `k6/create-booking.js`: booking concurrency baseline

Detailed setup and execution steps live in `docs/operations/performance-testing.md`.
