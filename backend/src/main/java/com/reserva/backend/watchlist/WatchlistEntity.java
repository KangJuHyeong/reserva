package com.reserva.backend.watchlist;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "watchlists")
public class WatchlistEntity {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public static WatchlistEntity create(String id, String userId, String eventId, LocalDateTime createdAt) {
        WatchlistEntity watchlist = new WatchlistEntity();
        watchlist.id = id;
        watchlist.userId = userId;
        watchlist.eventId = eventId;
        watchlist.createdAt = createdAt;
        return watchlist;
    }

    public String getEventId() {
        return eventId;
    }
}
