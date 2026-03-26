package com.reserva.backend.watchlist;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.event.EventEntity;
import com.reserva.backend.event.EventRepository;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final EventRepository eventRepository;

    public WatchlistService(WatchlistRepository watchlistRepository,
                            EventRepository eventRepository) {
        this.watchlistRepository = watchlistRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional
    public void save(CurrentUser currentUser, String eventId) {
        EventEntity event = findEventOrThrow(eventId);

        if (watchlistRepository.existsByUserIdAndEventId(currentUser.id(), event.getId())) {
            return;
        }

        watchlistRepository.save(WatchlistEntity.create(
                UUID.randomUUID().toString(),
                currentUser.id(),
                event.getId(),
                LocalDateTime.now()
        ));
    }

    @Transactional
    public void remove(CurrentUser currentUser, String eventId) {
        EventEntity event = findEventOrThrow(eventId);
        watchlistRepository.deleteByUserIdAndEventId(currentUser.id(), event.getId());
    }

    private EventEntity findEventOrThrow(String eventId) {
        return eventRepository.findByIdAndStatusAndVisibility(eventId, EventStatus.PUBLISHED, EventVisibility.PUBLIC)
                .orElseThrow(() -> new ApiException(ErrorCode.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND, "The event was not found."));
    }
}
