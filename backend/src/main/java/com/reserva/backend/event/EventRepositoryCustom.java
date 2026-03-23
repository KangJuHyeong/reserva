package com.reserva.backend.event;

import com.reserva.backend.event.model.EventCategory;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepositoryCustom {

    SearchResult searchDiscoverableEvents(String query,
                                          EventCategory category,
                                          DiscoverySection section,
                                          String currentUserId,
                                          LocalDateTime now,
                                          int page,
                                          int size);

    record SearchResult(List<EventEntity> events, long total) {
    }
}
