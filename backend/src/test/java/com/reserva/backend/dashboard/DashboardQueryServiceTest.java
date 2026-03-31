package com.reserva.backend.dashboard;

import com.reserva.backend.booking.BookingEntity;
import com.reserva.backend.booking.BookingRepository;
import com.reserva.backend.booking.model.BookingStatus;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.dashboard.api.DashboardSummaryResponse;
import com.reserva.backend.event.EventEntity;
import com.reserva.backend.event.EventInventoryEntity;
import com.reserva.backend.event.EventRepository;
import com.reserva.backend.event.model.EventCategory;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import com.reserva.backend.user.UserEntity;
import com.reserva.backend.watchlist.WatchlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardQueryServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private WatchlistRepository watchlistRepository;

    private DashboardQueryService dashboardQueryService;

    @BeforeEach
    void setUp() {
        dashboardQueryService = new DashboardQueryService(bookingRepository, eventRepository, watchlistRepository);
    }

    @Test
    void getDashboardSummaryAggregatesBookingsAndEventPreviews() {
        CurrentUser currentUser = new CurrentUser("usr_1", "Alex Johnson");
        BookingEntity booking = booking("BK-2026-RECENT", "usr_1", "evt_booked", BookingStatus.CONFIRMED);
        EventEntity bookedEvent = event("evt_booked", "Booked Event", "usr_host", LocalDateTime.now().plusDays(7), LocalDateTime.now().minusDays(1), 100, 35);
        EventEntity watchlistUpcoming = event("evt_watch_1", "Opening Soon Event", "usr_host", LocalDateTime.now().plusDays(10), LocalDateTime.now().plusDays(2), 80, 12);
        EventEntity watchlistReady = event("evt_watch_2", "Ready To Reserve", "usr_host", LocalDateTime.now().plusDays(5), LocalDateTime.now().minusDays(2), 60, 25);
        EventEntity createdEvent = event("evt_created", "My Created Event", "usr_1", LocalDateTime.now().plusDays(20), LocalDateTime.now().plusDays(5), 120, 10);

        when(bookingRepository.countByUserId("usr_1")).thenReturn(4L);
        when(bookingRepository.countByUserIdAndStatus("usr_1", BookingStatus.COMPLETED)).thenReturn(1L);
        when(bookingRepository.findTop3ByUserIdOrderByBookedAtDesc("usr_1")).thenReturn(List.of(booking));
        when(eventRepository.findAllById(List.of("evt_booked"))).thenReturn(List.of(bookedEvent));
        when(watchlistRepository.countByUserId("usr_1")).thenReturn(2L);
        when(watchlistRepository.findEventIdsByUserIdOrderByCreatedAtDesc("usr_1")).thenReturn(List.of("evt_watch_1", "evt_watch_2"));
        when(eventRepository.findDetailsByIdInAndStatusAndVisibility(List.of("evt_watch_1", "evt_watch_2"), EventStatus.PUBLISHED, EventVisibility.PUBLIC))
                .thenReturn(List.of(watchlistUpcoming, watchlistReady));
        when(eventRepository.countByCreator_Id("usr_1")).thenReturn(1L);
        when(eventRepository.findRecentDetailsByCreatorId("usr_1", PageRequest.of(0, 3))).thenReturn(List.of(createdEvent));

        DashboardSummaryResponse response = dashboardQueryService.getDashboardSummary(currentUser);

        assertThat(response.stats().totalBookings()).isEqualTo(4);
        assertThat(response.stats().completedBookings()).isEqualTo(1);
        assertThat(response.stats().watchlistCount()).isEqualTo(2);
        assertThat(response.stats().upcomingOpenEvents()).isEqualTo(1);
        assertThat(response.stats().createdEvents()).isEqualTo(1);
        assertThat(response.recentBookings()).hasSize(1);
        assertThat(response.recentBookings().getFirst().bookingId()).isEqualTo("BK-2026-RECENT");
        assertThat(response.watchlistPreview()).hasSize(2);
        assertThat(response.watchlistPreview().getFirst().id()).isEqualTo("evt_watch_1");
        assertThat(response.upcomingOpenEvents()).hasSize(1);
        assertThat(response.upcomingOpenEvents().getFirst().id()).isEqualTo("evt_watch_1");
        assertThat(response.createdEventsPreview()).hasSize(1);
        assertThat(response.createdEventsPreview().getFirst().id()).isEqualTo("evt_created");
    }

    private BookingEntity booking(String bookingCode, String userId, String eventId, BookingStatus status) {
        BookingEntity booking = BookingEntity.create(
                "booking-1",
                bookingCode,
                userId,
                eventId,
                "Alex Johnson",
                2,
                new BigDecimal("45.00"),
                new BigDecimal("90.00"),
                LocalDateTime.of(2026, 3, 5, 9, 30)
        );
        ReflectionTestUtils.setField(booking, "status", status);
        return booking;
    }

    private EventEntity event(String eventId,
                              String title,
                              String creatorId,
                              LocalDateTime eventDateTime,
                              LocalDateTime reservationOpenDateTime,
                              int totalSlots,
                              int reservedSlots) {
        UserEntity creator = new UserEntity();
        ReflectionTestUtils.setField(creator, "id", creatorId);
        ReflectionTestUtils.setField(creator, "displayName", "Creator " + creatorId);
        ReflectionTestUtils.setField(creator, "profileImageUrl", "https://example.com/avatar.jpg");
        ReflectionTestUtils.setField(creator, "role", com.reserva.backend.common.model.UserRole.CREATOR);

        EventInventoryEntity inventory = new EventInventoryEntity();
        ReflectionTestUtils.setField(inventory, "eventId", eventId);
        ReflectionTestUtils.setField(inventory, "totalSlots", totalSlots);
        ReflectionTestUtils.setField(inventory, "reservedSlots", reservedSlots);

        EventEntity event = new EventEntity();
        ReflectionTestUtils.setField(event, "id", eventId);
        ReflectionTestUtils.setField(event, "creator", creator);
        ReflectionTestUtils.setField(event, "title", title);
        ReflectionTestUtils.setField(event, "category", EventCategory.CONCERT);
        ReflectionTestUtils.setField(event, "description", "Dashboard event.");
        ReflectionTestUtils.setField(event, "imageUrl", "https://example.com/image.jpg");
        ReflectionTestUtils.setField(event, "location", "Seoul");
        ReflectionTestUtils.setField(event, "price", new BigDecimal("45.00"));
        ReflectionTestUtils.setField(event, "eventDateTime", eventDateTime);
        ReflectionTestUtils.setField(event, "reservationOpenDateTime", reservationOpenDateTime);
        ReflectionTestUtils.setField(event, "status", EventStatus.PUBLISHED);
        ReflectionTestUtils.setField(event, "visibility", EventVisibility.PUBLIC);
        ReflectionTestUtils.setField(event, "inventory", inventory);
        ReflectionTestUtils.setField(event, "createdAt", LocalDateTime.now().minusDays(1));
        return event;
    }
}
