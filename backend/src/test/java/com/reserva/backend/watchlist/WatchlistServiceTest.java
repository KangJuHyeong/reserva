package com.reserva.backend.watchlist;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.common.security.CurrentUserProvider;
import com.reserva.backend.event.EventEntity;
import com.reserva.backend.event.EventRepository;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WatchlistServiceTest {

    @Mock
    private WatchlistRepository watchlistRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    private WatchlistService watchlistService;

    @BeforeEach
    void setUp() {
        watchlistService = new WatchlistService(watchlistRepository, eventRepository, currentUserProvider);
    }

    @Test
    void savePersistsWatchlistForCurrentUser() {
        when(currentUserProvider.getCurrentUserOrThrow()).thenReturn(new CurrentUser("usr_1", "Alex Johnson"));
        when(eventRepository.findByIdAndStatusAndVisibility("evt_1", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.of(event("evt_1")));
        when(watchlistRepository.existsByUserIdAndEventId("usr_1", "evt_1")).thenReturn(false);

        watchlistService.save("evt_1");

        ArgumentCaptor<WatchlistEntity> captor = ArgumentCaptor.forClass(WatchlistEntity.class);
        verify(watchlistRepository).save(captor.capture());
        assertThat(captor.getValue().getEventId()).isEqualTo("evt_1");
    }

    @Test
    void saveIsIdempotentWhenWatchlistAlreadyExists() {
        when(currentUserProvider.getCurrentUserOrThrow()).thenReturn(new CurrentUser("usr_1", "Alex Johnson"));
        when(eventRepository.findByIdAndStatusAndVisibility("evt_1", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.of(event("evt_1")));
        when(watchlistRepository.existsByUserIdAndEventId("usr_1", "evt_1")).thenReturn(true);

        watchlistService.save("evt_1");

        verify(watchlistRepository, never()).save(any(WatchlistEntity.class));
    }

    @Test
    void saveThrowsWhenEventDoesNotExist() {
        when(currentUserProvider.getCurrentUserOrThrow()).thenReturn(new CurrentUser("usr_1", "Alex Johnson"));
        when(eventRepository.findByIdAndStatusAndVisibility("evt_missing", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> watchlistService.save("evt_missing"))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> {
                    ApiException apiException = (ApiException) exception;
                    assertThat(apiException.getErrorCode()).isEqualTo(ErrorCode.EVENT_NOT_FOUND);
                    assertThat(apiException.getHttpStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }

    @Test
    void removeDeletesExistingOrMissingWatchlistIdempotently() {
        when(currentUserProvider.getCurrentUserOrThrow()).thenReturn(new CurrentUser("usr_1", "Alex Johnson"));
        when(eventRepository.findByIdAndStatusAndVisibility("evt_1", EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(Optional.of(event("evt_1")));

        watchlistService.remove("evt_1");

        verify(watchlistRepository).deleteByUserIdAndEventId("usr_1", "evt_1");
    }

    @Test
    void removePropagatesUnauthenticated() {
        when(currentUserProvider.getCurrentUserOrThrow()).thenThrow(
                new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "Authentication is required.")
        );

        assertThatThrownBy(() -> watchlistService.remove("evt_1"))
                .isInstanceOf(ApiException.class)
                .satisfies(exception -> assertThat(((ApiException) exception).getErrorCode()).isEqualTo(ErrorCode.UNAUTHENTICATED));
    }

    private EventEntity event(String id) {
        EventEntity event = new EventEntity();
        org.springframework.test.util.ReflectionTestUtils.setField(event, "id", id);
        org.springframework.test.util.ReflectionTestUtils.setField(event, "createdAt", LocalDateTime.now());
        org.springframework.test.util.ReflectionTestUtils.setField(event, "updatedAt", LocalDateTime.now());
        return event;
    }
}
