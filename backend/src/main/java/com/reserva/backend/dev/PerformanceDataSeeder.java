package com.reserva.backend.dev;

import com.reserva.backend.booking.BookingEntity;
import com.reserva.backend.booking.BookingRepository;
import com.reserva.backend.common.model.UserRole;
import com.reserva.backend.event.EventEntity;
import com.reserva.backend.event.EventRepository;
import com.reserva.backend.event.model.EventCategory;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import com.reserva.backend.user.UserEntity;
import com.reserva.backend.user.UserRepository;
import com.reserva.backend.watchlist.WatchlistEntity;
import com.reserva.backend.watchlist.WatchlistRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.Set;

@Component
@ConditionalOnProperty(name = "app.dev.seed-performance-data", havingValue = "true")
public class PerformanceDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PerformanceDataSeeder.class);

    private static final String PERF_USER_ID_PREFIX = "perf_usr_";
    private static final String PERF_CREATOR_ID_PREFIX = "perf_crt_";
    private static final String PERF_EVENT_ID_PREFIX = "perf_evt_";
    private static final String PERF_BOOKING_ID_PREFIX = "perf_bkg_";
    private static final String PERF_BOOKING_CODE_PREFIX = "PFBK-";
    private static final String PERF_WATCHLIST_ID_PREFIX = "perf_wl_";
    private static final String PERF_EMAIL_DOMAIN = "@example.com";
    private static final String PERF_PASSWORD = "perf-password";

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final WatchlistRepository watchlistRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    private final boolean resetExistingData;
    private final int creatorCount;
    private final int userCount;
    private final int eventCount;
    private final int watchlistsPerUser;
    private final long randomSeed;

    public PerformanceDataSeeder(UserRepository userRepository,
                                 EventRepository eventRepository,
                                 BookingRepository bookingRepository,
                                 WatchlistRepository watchlistRepository,
                                 PasswordEncoder passwordEncoder,
                                 @Value("${app.dev.performance.reset-existing-data:false}") boolean resetExistingData,
                                 @Value("${app.dev.performance.creator-count:20}") int creatorCount,
                                 @Value("${app.dev.performance.user-count:300}") int userCount,
                                 @Value("${app.dev.performance.event-count:1000}") int eventCount,
                                 @Value("${app.dev.performance.watchlists-per-user:4}") int watchlistsPerUser,
                                 @Value("${app.dev.performance.random-seed:20260329}") long randomSeed) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.watchlistRepository = watchlistRepository;
        this.passwordEncoder = passwordEncoder;
        this.resetExistingData = resetExistingData;
        this.creatorCount = creatorCount;
        this.userCount = userCount;
        this.eventCount = eventCount;
        this.watchlistsPerUser = watchlistsPerUser;
        this.randomSeed = randomSeed;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info(
                "Performance seed config: resetExistingData={}, creatorCount={}, userCount={}, eventCount={}, watchlistsPerUser={}, randomSeed={}",
                resetExistingData,
                creatorCount,
                userCount,
                eventCount,
                watchlistsPerUser,
                randomSeed
        );

        boolean incrementalMode = false;
        if (resetExistingData) {
            deleteExistingPerformanceData();
            entityManager.flush();
            entityManager.clear();
        } else if (userRepository.findById(formatCreatorId(1)).isPresent() || eventRepository.findById(formatEventId(1)).isPresent()) {
            incrementalMode = true;
        }

        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        Random random = new Random(randomSeed);
        String encodedPassword = passwordEncoder.encode(PERF_PASSWORD);

        SeedBatch<UserEntity> creatorBatch = seedCreators(now, encodedPassword);
        SeedBatch<UserEntity> userBatch = seedUsers(now, encodedPassword);
        SeedBatch<EventEntity> eventBatch = seedEvents(creatorBatch.entities(), now, random);
        SeedResult bookingResult;
        int watchlistCount;
        if (incrementalMode) {
            bookingResult = new SeedResult(0);
            watchlistCount = 0;
            log.info(
                    "Performance incremental seed added {} events without expanding bookings/watchlists to keep scaling runs fast.",
                    eventBatch.createdEntities().size()
            );
        } else {
            bookingResult = seedBookings(userBatch.entities(), eventBatch.entities(), eventBatch.createdEntities(), now, random);
            watchlistCount = seedWatchlists(userBatch.entities(), eventBatch.entities(), eventBatch.createdEntities(), now, random);
        }

        log.info(
                "Performance seed {} {} creators, {} users, {} events, {} bookings, {} watchlists. " +
                        "Sample accounts: {} / {}, {} / {}. Anchor events: {}, {}",
                incrementalMode ? "updated" : "created",
                creatorBatch.createdEntities().size(),
                userBatch.createdEntities().size(),
                eventBatch.createdEntities().size(),
                bookingResult.bookingsCreated(),
                watchlistCount,
                formatCreatorEmail(1),
                PERF_PASSWORD,
                formatUserEmail(1),
                PERF_PASSWORD,
                formatEventId(1),
                formatEventId(Math.min(2, eventBatch.entities().size()))
        );
    }

    private SeedBatch<UserEntity> seedCreators(LocalDateTime now, String encodedPassword) {
        List<UserEntity> creators = new ArrayList<>(creatorCount);
        List<UserEntity> createdCreators = new ArrayList<>();
        for (int index = 1; index <= creatorCount; index++) {
            UserEntity existing = userRepository.findById(formatCreatorId(index)).orElse(null);
            if (existing != null) {
                creators.add(existing);
                continue;
            }

            UserEntity creator = UserEntity.create(
                    formatCreatorId(index),
                    formatCreatorEmail(index),
                    encodedPassword,
                    null,
                    "Performance Creator " + index,
                    UserRole.CREATOR,
                    null,
                    now.minusDays(Math.max(1, index % 30))
            );
            UserEntity savedCreator = userRepository.save(creator);
            creators.add(savedCreator);
            createdCreators.add(savedCreator);
        }
        return new SeedBatch<>(creators, createdCreators);
    }

    private SeedBatch<UserEntity> seedUsers(LocalDateTime now, String encodedPassword) {
        List<UserEntity> users = new ArrayList<>(userCount);
        List<UserEntity> createdUsers = new ArrayList<>();
        for (int index = 1; index <= userCount; index++) {
            UserEntity existing = userRepository.findById(formatUserId(index)).orElse(null);
            if (existing != null) {
                users.add(existing);
                continue;
            }

            UserEntity user = UserEntity.create(
                    formatUserId(index),
                    formatUserEmail(index),
                    encodedPassword,
                    null,
                    "Performance User " + index,
                    UserRole.USER,
                    null,
                    now.minusDays(Math.max(1, index % 20))
            );
            UserEntity savedUser = userRepository.save(user);
            users.add(savedUser);
            createdUsers.add(savedUser);
        }
        return new SeedBatch<>(users, createdUsers);
    }

    private SeedBatch<EventEntity> seedEvents(List<UserEntity> creators, LocalDateTime now, Random random) {
        List<EventEntity> events = new ArrayList<>(eventCount);
        List<EventEntity> createdEvents = new ArrayList<>();
        EventCategory[] categories = EventCategory.values();

        for (int index = 1; index <= eventCount; index++) {
            EventEntity existing = eventRepository.findById(formatEventId(index)).orElse(null);
            if (existing != null) {
                events.add(existing);
                continue;
            }

            UserEntity creator = creators.get((index - 1) % creators.size());
            EventCategory category = categories[(index - 1) % categories.length];
            EventShape shape = classifyEvent(index);
            int totalSlots = 40 + (index % 8) * 20;
            int maxTicketsPerBooking = Math.min(6, Math.max(2, totalSlots / 20));
            LocalDateTime eventDateTime;
            LocalDateTime reservationOpenDateTime;

            if (shape == EventShape.OPENING_SOON) {
                reservationOpenDateTime = now.plusHours(6L + (index % 72));
                eventDateTime = reservationOpenDateTime.plusDays(3L + (index % 9));
            } else if (shape == EventShape.ENDING_SOON) {
                reservationOpenDateTime = now.minusDays(4L + (index % 14));
                eventDateTime = now.plusHours(6L + (index % 60));
            } else {
                reservationOpenDateTime = now.minusDays(3L + (index % 15));
                eventDateTime = now.plusDays(5L + (index % 45));
            }

            EventEntity event = EventEntity.create(
                    formatEventId(index),
                    creator,
                    "Performance Event " + index,
                    category,
                    "Synthetic performance event for load-testing discovery, my-events, bookings, and watchlists.",
                    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
                    "Seoul Venue " + ((index % 40) + 1),
                    BigDecimal.valueOf(15L + (index % 90)),
                    eventDateTime,
                    reservationOpenDateTime,
                    maxTicketsPerBooking,
                    EventStatus.PUBLISHED,
                    EventVisibility.PUBLIC,
                    now.minusDays(index % 25),
                    totalSlots
            );
            EventEntity savedEvent = eventRepository.save(event);
            events.add(savedEvent);
            createdEvents.add(savedEvent);
        }

        return new SeedBatch<>(events, createdEvents);
    }

    private SeedResult seedBookings(List<UserEntity> users,
                                    List<EventEntity> events,
                                    List<EventEntity> createdEvents,
                                    LocalDateTime now,
                                    Random random) {
        int bookingSequence = nextSequence(
                (String) entityManager.createNativeQuery("select max(id) from bookings where id like 'perf_bkg_%'").getSingleResult(),
                PERF_BOOKING_ID_PREFIX
        );
        int bookingsCreated = 0;
        Set<String> createdEventIds = new HashSet<>();
        for (EventEntity event : createdEvents) {
            createdEventIds.add(event.getId());
        }

        for (int index = 0; index < events.size(); index++) {
            EventEntity event = events.get(index);
            if (!createdEventIds.contains(event.getId()) && hasPerformanceBookings(event.getId())) {
                continue;
            }

            if (event.getReservationOpenDateTime().isAfter(now)) {
                continue;
            }

            int totalSlots = event.getInventory().getTotalSlots();
            int targetReservedSlots = switch (classifyEvent(index + 1)) {
                case TRENDING -> Math.min(totalSlots - 1, Math.max(5, (int) Math.floor(totalSlots * 0.85)));
                case ENDING_SOON -> Math.min(totalSlots - 2, Math.max(4, (int) Math.floor(totalSlots * 0.72)));
                default -> Math.min(totalSlots - 3, Math.max(2, (int) Math.floor(totalSlots * 0.38)));
            };

            Set<String> bookedUserIds = new HashSet<>();
            int attempts = 0;
            while (event.getInventory().getReservedSlots() < targetReservedSlots && attempts < users.size() * 3) {
                UserEntity user = users.get((index + attempts) % users.size());
                attempts++;

                if (!bookedUserIds.add(user.getId())) {
                    continue;
                }

                int remainingSlots = targetReservedSlots - event.getInventory().getReservedSlots();
                int ticketCount = Math.min(remainingSlots, 1 + random.nextInt(event.getMaxTicketsPerBooking()));
                if (ticketCount <= 0) {
                    break;
                }

                LocalDateTime bookedAt = event.getReservationOpenDateTime().plusHours((bookingSequence % 48) + 1L);
                BookingEntity booking = BookingEntity.create(
                        formatBookingId(bookingSequence),
                        formatBookingCode(bookingSequence),
                        user.getId(),
                        event.getId(),
                        user.getDisplayName(),
                        ticketCount,
                        event.getPrice(),
                        event.getPrice().multiply(BigDecimal.valueOf(ticketCount)),
                        bookedAt
                );

                if (bookingSequence % 7 == 0 && bookedAt.plusDays(1).isBefore(event.getEventDateTime())) {
                    booking.cancel(bookedAt.plusHours(12));
                } else {
                    event.getInventory().reserve(ticketCount);
                }

                bookingRepository.save(booking);
                bookingSequence++;
                bookingsCreated++;
            }
        }

        return new SeedResult(bookingsCreated);
    }

    private int seedWatchlists(List<UserEntity> users,
                               List<EventEntity> events,
                               List<EventEntity> createdEvents,
                               LocalDateTime now,
                               Random random) {
        if (createdEvents.isEmpty()) {
            return 0;
        }

        int sequence = nextSequence(
                (String) entityManager.createNativeQuery("select max(id) from watchlists where id like 'perf_wl_%'").getSingleResult(),
                PERF_WATCHLIST_ID_PREFIX
        );
        int createdCount = 0;
        List<EventEntity> watchlistSource = createdEvents.isEmpty() ? events : createdEvents;

        for (int userIndex = 0; userIndex < users.size(); userIndex++) {
            UserEntity user = users.get(userIndex);
            Set<String> chosenEventIds = new HashSet<>();
            int targetCount = Math.min(watchlistsPerUser, watchlistSource.size());

            for (int offset = 0; offset < targetCount; offset++) {
                EventEntity event = watchlistSource.get(random.nextInt(watchlistSource.size()));
                if (!chosenEventIds.add(event.getId())) {
                    continue;
                }

                if (hasWatchlist(user.getId(), event.getId())) {
                    continue;
                }

                watchlistRepository.save(WatchlistEntity.create(
                        formatWatchlistId(sequence),
                        user.getId(),
                        event.getId(),
                        now.minusHours((long) ((userIndex + offset) % 96))
                ));
                sequence++;
                createdCount++;
            }
        }
        return createdCount;
    }

    private void deleteExistingPerformanceData() {
        entityManager.createNativeQuery("delete from watchlists where id like 'perf_wl_%'").executeUpdate();
        entityManager.createNativeQuery("delete from bookings where id like 'perf_bkg_%'").executeUpdate();
        entityManager.createNativeQuery("delete from bookings where event_id like 'perf_evt_%'").executeUpdate();
        entityManager.createNativeQuery("delete from event_inventory where event_id like 'perf_evt_%'").executeUpdate();
        entityManager.createNativeQuery("delete from events where id like 'perf_evt_%'").executeUpdate();
        entityManager.createNativeQuery("delete from users where id like 'perf_usr_%' or id like 'perf_crt_%'").executeUpdate();
    }

    private boolean hasPerformanceBookings(String eventId) {
        Number count = (Number) entityManager.createNativeQuery(
                        "select count(*) from bookings where event_id = :eventId and id like 'perf_bkg_%'")
                .setParameter("eventId", eventId)
                .getSingleResult();
        return count.longValue() > 0;
    }

    private boolean hasWatchlist(String userId, String eventId) {
        Number count = (Number) entityManager.createNativeQuery(
                        "select count(*) from watchlists where user_id = :userId and event_id = :eventId")
                .setParameter("userId", userId)
                .setParameter("eventId", eventId)
                .getSingleResult();
        return count.longValue() > 0;
    }

    private int nextSequence(String maxId, String prefix) {
        if (maxId == null || maxId.isBlank()) {
            return 1;
        }

        String normalizedPrefix = prefix.toLowerCase(Locale.ROOT);
        String normalizedId = maxId.toLowerCase(Locale.ROOT);
        if (!normalizedId.startsWith(normalizedPrefix)) {
            return 1;
        }

        return Integer.parseInt(maxId.substring(prefix.length())) + 1;
    }

    private EventShape classifyEvent(int index) {
        if (index % 7 == 0) {
            return EventShape.OPENING_SOON;
        }
        if (index % 5 == 0) {
            return EventShape.ENDING_SOON;
        }
        if (index % 3 == 0) {
            return EventShape.TRENDING;
        }
        return EventShape.DEFAULT;
    }

    private String formatCreatorId(int index) {
        return PERF_CREATOR_ID_PREFIX + formatNumber(index);
    }

    private String formatUserId(int index) {
        return PERF_USER_ID_PREFIX + formatNumber(index);
    }

    private String formatEventId(int index) {
        return PERF_EVENT_ID_PREFIX + formatNumber(index);
    }

    private String formatBookingId(int index) {
        return PERF_BOOKING_ID_PREFIX + formatNumber(index);
    }

    private String formatWatchlistId(int index) {
        return PERF_WATCHLIST_ID_PREFIX + formatNumber(index);
    }

    private String formatBookingCode(int index) {
        return PERF_BOOKING_CODE_PREFIX + formatNumber(index);
    }

    private String formatCreatorEmail(int index) {
        return "perf-creator-" + formatNumber(index) + PERF_EMAIL_DOMAIN;
    }

    private String formatUserEmail(int index) {
        return "perf-user-" + formatNumber(index) + PERF_EMAIL_DOMAIN;
    }

    private String formatNumber(int index) {
        return String.format("%05d", index);
    }

    private enum EventShape {
        DEFAULT,
        TRENDING,
        ENDING_SOON,
        OPENING_SOON
    }

    private record SeedResult(int bookingsCreated) {
    }

    private record SeedBatch<T>(List<T> entities, List<T> createdEntities) {
    }
}
