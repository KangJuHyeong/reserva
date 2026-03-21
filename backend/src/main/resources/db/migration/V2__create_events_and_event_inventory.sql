CREATE TABLE events (
    id VARCHAR(36) NOT NULL,
    creator_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    location VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    event_datetime DATETIME(6) NOT NULL,
    reservation_open_datetime DATETIME(6) NOT NULL,
    status VARCHAR(20) NOT NULL,
    visibility VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_events PRIMARY KEY (id),
    CONSTRAINT fk_events_creator FOREIGN KEY (creator_id) REFERENCES users(id),
    CONSTRAINT chk_events_price CHECK (price >= 0),
    CONSTRAINT chk_events_schedule CHECK (reservation_open_datetime < event_datetime)
);

CREATE INDEX idx_events_creator_created_at ON events (creator_id, created_at DESC);
CREATE INDEX idx_events_category_status_visibility_event_datetime ON events (category, status, visibility, event_datetime);

CREATE TABLE event_inventory (
    event_id VARCHAR(36) NOT NULL,
    total_slots INT NOT NULL,
    reserved_slots INT NOT NULL DEFAULT 0,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_event_inventory PRIMARY KEY (event_id),
    CONSTRAINT fk_event_inventory_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT chk_event_inventory_total_slots CHECK (total_slots >= 1),
    CONSTRAINT chk_event_inventory_reserved_slots_non_negative CHECK (reserved_slots >= 0),
    CONSTRAINT chk_event_inventory_reserved_slots_bounds CHECK (reserved_slots <= total_slots)
);
