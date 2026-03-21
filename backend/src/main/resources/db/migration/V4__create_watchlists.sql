CREATE TABLE watchlists (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    event_id VARCHAR(36) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_watchlists PRIMARY KEY (id),
    CONSTRAINT fk_watchlists_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_watchlists_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT uk_watchlists_user_event UNIQUE (user_id, event_id)
);

CREATE INDEX idx_watchlists_user_created_at ON watchlists (user_id, created_at DESC);
