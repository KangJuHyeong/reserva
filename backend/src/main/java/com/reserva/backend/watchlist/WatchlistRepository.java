package com.reserva.backend.watchlist;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchlistRepository extends JpaRepository<WatchlistEntity, String> {

    boolean existsByUserIdAndEventId(String userId, String eventId);
}
