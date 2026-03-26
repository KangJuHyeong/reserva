package com.reserva.backend.event;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.reserva.backend.event.model.EventCategory;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import com.reserva.backend.user.QUserEntity;
import com.reserva.backend.watchlist.QWatchlistEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public class EventRepositoryImpl implements EventRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    public EventRepositoryImpl(EntityManager entityManager) {
        this.queryFactory = new JPAQueryFactory(entityManager);
    }

    @Override
    public SearchResult searchDiscoverableEvents(String query,
                                                 EventCategory category,
                                                 DiscoverySection section,
                                                 String currentUserId,
                                                 LocalDateTime now,
                                                 int page,
                                                 int size) {
        QEventEntity event = QEventEntity.eventEntity;
        QUserEntity creator = QUserEntity.userEntity;
        QEventInventoryEntity inventory = QEventInventoryEntity.eventInventoryEntity;
        QWatchlistEntity watchlist = QWatchlistEntity.watchlistEntity;

        BooleanBuilder predicate = new BooleanBuilder()
                .and(event.status.eq(EventStatus.PUBLISHED))
                .and(event.visibility.eq(EventVisibility.PUBLIC))
                .and(categoryPredicate(event, category))
                .and(searchPredicate(event, creator, query))
                .and(sectionPredicate(section, inventory, event, watchlist, currentUserId, now));

        JPAQuery<EventEntity> contentQuery = queryFactory.selectFrom(event)
                .join(event.creator, creator).fetchJoin()
                .join(event.inventory, inventory).fetchJoin();

        JPAQuery<Long> countQuery = queryFactory.select(event.count())
                .from(event)
                .join(event.creator, creator)
                .join(event.inventory, inventory);

        if (section == DiscoverySection.WATCHLIST) {
            contentQuery.join(watchlist).on(watchlist.eventId.eq(event.id).and(watchlist.userId.eq(currentUserId)));
            countQuery.join(watchlist).on(watchlist.eventId.eq(event.id).and(watchlist.userId.eq(currentUserId)));
        }

        List<EventEntity> events = contentQuery
                .where(predicate)
                .orderBy(orderSpecifiers(section, event, inventory))
                .offset((long) (page - 1) * size)
                .limit(size)
                .fetch();

        Long total = countQuery
                .where(predicate)
                .fetchOne();

        return new SearchResult(events, total == null ? 0 : total);
    }

    private BooleanExpression categoryPredicate(QEventEntity event, EventCategory category) {
        return category == null ? null : event.category.eq(category);
    }

    private BooleanExpression searchPredicate(QEventEntity event, QUserEntity creator, String query) {
        if (query == null || query.isBlank()) {
            return null;
        }

        String normalizedQuery = query.trim();
        return event.title.containsIgnoreCase(normalizedQuery)
                .or(event.description.containsIgnoreCase(normalizedQuery))
                .or(event.location.containsIgnoreCase(normalizedQuery))
                .or(creator.displayName.containsIgnoreCase(normalizedQuery));
    }

    private BooleanExpression sectionPredicate(DiscoverySection section,
                                               QEventInventoryEntity inventory,
                                               QEventEntity event,
                                               QWatchlistEntity watchlist,
                                               String currentUserId,
                                               LocalDateTime now) {
        return switch (section) {
            case TRENDING -> fillRateExpression(inventory).goe(0.7d);
            case ENDING_SOON -> event.eventDateTime.goe(now).and(event.eventDateTime.loe(now.plusHours(72)));
            case OPENING_SOON -> event.reservationOpenDateTime.after(now);
            case WATCHLIST -> watchlist.userId.eq(currentUserId);
            case DEFAULT -> null;
        };
    }

    private OrderSpecifier<?>[] orderSpecifiers(DiscoverySection section,
                                                QEventEntity event,
                                                QEventInventoryEntity inventory) {
        return switch (section) {
            case TRENDING -> new OrderSpecifier<?>[]{
                    fillRateExpression(inventory).desc(),
                    event.eventDateTime.asc()
            };
            case ENDING_SOON -> new OrderSpecifier<?>[]{
                    event.eventDateTime.asc()
            };
            case OPENING_SOON -> new OrderSpecifier<?>[]{
                    event.reservationOpenDateTime.asc()
            };
            case WATCHLIST, DEFAULT -> new OrderSpecifier<?>[]{
                    event.eventDateTime.asc()
            };
        };
    }

    private NumberExpression<Double> fillRateExpression(QEventInventoryEntity inventory) {
        return Expressions.numberTemplate(
                Double.class,
                "({0} * 1.0 / nullif({1}, 0))",
                inventory.reservedSlots,
                inventory.totalSlots
        );
    }

}
