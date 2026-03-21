CREATE TABLE bookings (
    id VARCHAR(36) NOT NULL,
    booking_code VARCHAR(50) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    event_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL,
    participant_name VARCHAR(100) NOT NULL,
    ticket_count INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booked_at DATETIME(6) NOT NULL,
    cancelled_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_bookings PRIMARY KEY (id),
    CONSTRAINT uk_bookings_booking_code UNIQUE (booking_code),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_bookings_event FOREIGN KEY (event_id) REFERENCES events(id),
    CONSTRAINT chk_bookings_ticket_count CHECK (ticket_count >= 1),
    CONSTRAINT chk_bookings_price_values CHECK (unit_price >= 0 AND total_amount >= 0)
);

CREATE INDEX idx_bookings_user_booked_at ON bookings (user_id, booked_at DESC);
CREATE INDEX idx_bookings_event_status ON bookings (event_id, status);
