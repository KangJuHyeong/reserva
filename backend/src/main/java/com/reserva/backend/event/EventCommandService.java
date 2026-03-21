package com.reserva.backend.event;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.model.UserRole;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.common.security.CurrentUserProvider;
import com.reserva.backend.event.api.EventCreateRequest;
import com.reserva.backend.event.api.EventCreateResponse;
import com.reserva.backend.event.model.EventCategory;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import com.reserva.backend.user.UserEntity;
import com.reserva.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class EventCommandService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;

    public EventCommandService(EventRepository eventRepository,
                               UserRepository userRepository,
                               CurrentUserProvider currentUserProvider) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public EventCreateResponse createEvent(EventCreateRequest request) {
        CurrentUser currentUser = currentUserProvider.getCurrentUserOrThrow();
        if (currentUser.role() != UserRole.CREATOR) {
            throw new ApiException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Creator access is required.");
        }

        if (!request.reservationOpenDateTime().isBefore(request.eventDateTime())) {
            throw new ApiException(ErrorCode.INVALID_SCHEDULE, HttpStatus.BAD_REQUEST, "Reservation open datetime must be before event datetime.");
        }

        EventCategory category;
        try {
            category = EventCategory.fromLabel(request.category());
        } catch (IllegalArgumentException exception) {
            throw new ApiException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Unsupported category: " + request.category());
        }

        UserEntity creator = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "The current user was not found."));

        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        EventEntity event = EventEntity.create(
                UUID.randomUUID().toString(),
                creator,
                request.title().trim(),
                category,
                request.description().trim(),
                request.imageUrl().trim(),
                request.location().trim(),
                request.price(),
                request.eventDateTime().withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime(),
                request.reservationOpenDateTime().withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime(),
                EventStatus.PUBLISHED,
                EventVisibility.PUBLIC,
                now,
                request.totalSlots()
        );

        EventEntity savedEvent = eventRepository.save(event);
        return new EventCreateResponse(savedEvent.getId(), savedEvent.getTitle());
    }
}
