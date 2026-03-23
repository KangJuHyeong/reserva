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
import java.util.List;

@Component
@ConditionalOnProperty(name = "app.dev.seed-demo-data", havingValue = "true")
public class DevDataSeeder implements ApplicationRunner {

    private static final String DEMO_USER_ID = "usr_123";
    private static final String DEMO_CREATOR_ID = "usr_creator";
    private static final String DEMO_WATCHLIST_EVENT_ID = "evt_demo_jazz";
    private static final String DEMO_UPCOMING_EVENT_ID = "evt_demo_art";
    private static final List<SeedEventDefinition> SEED_EVENTS = List.of(
            new SeedEventDefinition(
                    DEMO_WATCHLIST_EVENT_ID,
                    "Summer Jazz Night",
                    EventCategory.CONCERT,
                    "An intimate late-night jazz session with a standing-room crowd and seasonal menu.",
                    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
                    "Blue Note Jazz Club, Seoul",
                    "45.00",
                    7,
                    -1,
                    120
            ),
            new SeedEventDefinition(
                    "evt_demo_concert_rooftop",
                    "Rooftop Indie Sunset",
                    EventCategory.CONCERT,
                    "A golden-hour rooftop set with indie bands, skyline views, and a casual cocktail bar.",
                    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
                    "Hangang Rooftop Stage, Seoul",
                    "32.00",
                    10,
                    -2,
                    90
            ),
            new SeedEventDefinition(
                    "evt_demo_restaurant_tasting",
                    "Chef's Table Tasting Journey",
                    EventCategory.RESTAURANT,
                    "A seasonal tasting menu with live plating commentary from the head chef.",
                    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
                    "Maison Ember, Seoul",
                    "78.00",
                    5,
                    -1,
                    24
            ),
            new SeedEventDefinition(
                    "evt_demo_restaurant_brunch",
                    "Garden Brunch Social",
                    EventCategory.RESTAURANT,
                    "A relaxed weekend brunch with floral styling, acoustic music, and signature coffee pairings.",
                    "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
                    "Bloom Courtyard, Seoul",
                    "26.00",
                    8,
                    0,
                    36
            ),
            new SeedEventDefinition(
                    DEMO_UPCOMING_EVENT_ID,
                    "Gallery After Hours",
                    EventCategory.ART_AND_DESIGN,
                    "A curator-led evening viewing with live ambient set and limited-capacity access.",
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
                    "Modern Canvas Hall, Seoul",
                    "18.00",
                    14,
                    3,
                    40
            ),
            new SeedEventDefinition(
                    "evt_demo_art_poster",
                    "Poster Lab Weekend",
                    EventCategory.ART_AND_DESIGN,
                    "Hands-on risograph poster workshop with take-home prints and design critiques.",
                    "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
                    "Studio Layer, Seoul",
                    "22.00",
                    12,
                    2,
                    28
            ),
            new SeedEventDefinition(
                    "evt_demo_sports_night_run",
                    "Seoul Night Run Crew",
                    EventCategory.SPORTS,
                    "A guided city night run with pace groups, hydration stops, and post-run recovery snacks.",
                    "https://images.unsplash.com/photo-1483721310020-03333e577078",
                    "Yeouido Park, Seoul",
                    "12.00",
                    4,
                    -1,
                    80
            ),
            new SeedEventDefinition(
                    "evt_demo_sports_climb",
                    "Beginner Bouldering Session",
                    EventCategory.SPORTS,
                    "An entry-level climbing meetup with instructor tips and gear orientation.",
                    "https://images.unsplash.com/photo-1522163182402-834f871fd851",
                    "Peak Works Gym, Seoul",
                    "19.00",
                    9,
                    1,
                    30
            )
    );

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

        EventEntity watchlistEvent = null;
        for (SeedEventDefinition definition : SEED_EVENTS) {
            EventEntity event = eventRepository.findById(definition.id())
                    .orElseGet(() -> persist(EventEntity.create(
                            definition.id(),
                            demoCreator,
                            definition.title(),
                            definition.category(),
                            definition.description(),
                            definition.imageUrl(),
                            definition.location(),
                            new BigDecimal(definition.price()),
                            now.plusDays(definition.eventOffsetDays()),
                            now.plusDays(definition.reservationOpenOffsetDays()),
                            EventStatus.PUBLISHED,
                            EventVisibility.PUBLIC,
                            now,
                            definition.totalSlots()
                    )));

            if (DEMO_WATCHLIST_EVENT_ID.equals(definition.id())) {
                watchlistEvent = event;
            }
        }

        if (watchlistEvent != null && !watchlistRepository.existsByUserIdAndEventId(demoUser.getId(), watchlistEvent.getId())) {
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

    private record SeedEventDefinition(
            String id,
            String title,
            EventCategory category,
            String description,
            String imageUrl,
            String location,
            String price,
            int eventOffsetDays,
            int reservationOpenOffsetDays,
            int totalSlots
    ) {
    }
}
