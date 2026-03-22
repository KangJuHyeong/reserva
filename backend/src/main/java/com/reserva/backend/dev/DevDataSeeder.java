package com.reserva.backend.dev;

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
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Component
@ConditionalOnProperty(name = "app.dev.seed-demo-data", havingValue = "true")
public class DevDataSeeder implements ApplicationRunner {

    private static final String DEMO_USER_ID = "usr_123";
    private static final String DEMO_CREATOR_ID = "usr_creator";
    private static final String DEMO_WATCHLIST_EVENT_ID = "evt_demo_jazz";
    private static final String DEMO_UPCOMING_EVENT_ID = "evt_demo_art";

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final WatchlistRepository watchlistRepository;
    private final EntityManager entityManager;
    private final PasswordEncoder passwordEncoder;

    public DevDataSeeder(UserRepository userRepository,
                         EventRepository eventRepository,
                         WatchlistRepository watchlistRepository,
                         EntityManager entityManager,
                         PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.watchlistRepository = watchlistRepository;
        this.entityManager = entityManager;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        String demoPasswordHash = passwordEncoder.encode("dev-password");

        UserEntity demoUser = userRepository.findById(DEMO_USER_ID)
                .map(existing -> refreshSeedUser(
                        existing,
                        demoPasswordHash,
                        "Alex Johnson",
                        UserRole.USER,
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
                        now
                ))
                .orElseGet(() -> persist(UserEntity.create(
                        DEMO_USER_ID,
                        "alex@example.com",
                        demoPasswordHash,
                        "Alex Johnson",
                        UserRole.USER,
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
                        now
                )));

        UserEntity demoCreator = userRepository.findById(DEMO_CREATOR_ID)
                .map(existing -> refreshSeedUser(
                        existing,
                        demoPasswordHash,
                        "City Culture Studio",
                        UserRole.CREATOR,
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
                        now
                ))
                .orElseGet(() -> persist(UserEntity.create(
                        DEMO_CREATOR_ID,
                        "creator@example.com",
                        demoPasswordHash,
                        "City Culture Studio",
                        UserRole.CREATOR,
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
                        now
                )));

        EventEntity watchlistEvent = eventRepository.findById(DEMO_WATCHLIST_EVENT_ID)
                .orElseGet(() -> persist(EventEntity.create(
                        DEMO_WATCHLIST_EVENT_ID,
                        demoCreator,
                        "Summer Jazz Night",
                        EventCategory.CONCERT,
                        "An intimate late-night jazz session with a standing-room crowd and seasonal menu.",
                        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
                        "Blue Note Jazz Club, Seoul",
                        new BigDecimal("45.00"),
                        now.plusDays(7),
                        now.minusDays(1),
                        EventStatus.PUBLISHED,
                        EventVisibility.PUBLIC,
                        now,
                        120
                )));

        eventRepository.findById(DEMO_UPCOMING_EVENT_ID)
                .orElseGet(() -> persist(EventEntity.create(
                        DEMO_UPCOMING_EVENT_ID,
                        demoCreator,
                        "Gallery After Hours",
                        EventCategory.ART_AND_DESIGN,
                        "A curator-led evening viewing with live ambient set and limited-capacity access.",
                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
                        "Modern Canvas Hall, Seoul",
                        new BigDecimal("18.00"),
                        now.plusDays(14),
                        now.plusDays(3),
                        EventStatus.PUBLISHED,
                        EventVisibility.PUBLIC,
                        now,
                        40
                )));

        if (!watchlistRepository.existsByUserIdAndEventId(demoUser.getId(), watchlistEvent.getId())) {
            persist(WatchlistEntity.create(
                    "wl_demo_jazz",
                    demoUser.getId(),
                    watchlistEvent.getId(),
                    now
            ));
        }
    }

    private <T> T persist(T entity) {
        entityManager.persist(entity);
        return entity;
    }

    private UserEntity refreshSeedUser(UserEntity user,
                                       String passwordHash,
                                       String displayName,
                                       UserRole role,
                                       String profileImageUrl,
                                       LocalDateTime now) {
        user.refreshSeedProfile(passwordHash, displayName, role, profileImageUrl, now);
        return user;
    }
}
