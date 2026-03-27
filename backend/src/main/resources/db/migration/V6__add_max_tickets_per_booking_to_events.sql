ALTER TABLE events
    ADD COLUMN max_tickets_per_booking INT NOT NULL DEFAULT 10;

ALTER TABLE events
    ADD CONSTRAINT chk_events_max_tickets_per_booking_min CHECK (max_tickets_per_booking >= 1);
