package com.reserva.backend.watchlist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface WatchlistRepository extends JpaRepository<WatchlistEntity, String> {

    boolean existsByUserIdAndEventId(String userId, String eventId);

    long countByUserId(String userId);

    void deleteByUserIdAndEventId(String userId, String eventId);

    @Query("select w.eventId from WatchlistEntity w where w.userId = :userId order by w.createdAt desc")
    List<String> findEventIdsByUserIdOrderByCreatedAtDesc(@Param("userId") String userId);

    @Query("select w.eventId from WatchlistEntity w where w.userId = :userId and w.eventId in :eventIds")
    Set<String> findEventIdsByUserIdAndEventIdIn(@Param("userId") String userId, @Param("eventIds") Collection<String> eventIds);
}
