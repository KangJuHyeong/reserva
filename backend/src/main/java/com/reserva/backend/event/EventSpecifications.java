package com.reserva.backend.event;

import com.reserva.backend.event.model.EventCategory;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import org.springframework.data.jpa.domain.Specification;

public final class EventSpecifications {

    private EventSpecifications() {
    }

    public static Specification<EventEntity> discoverable() {
        return (root, query, builder) -> builder.and(
                builder.equal(root.get("status"), EventStatus.PUBLISHED),
                builder.equal(root.get("visibility"), EventVisibility.PUBLIC)
        );
    }

    public static Specification<EventEntity> hasCategory(EventCategory category) {
        return (root, query, builder) -> category == null ? null : builder.equal(root.get("category"), category);
    }

    public static Specification<EventEntity> matchesQuery(String rawQuery) {
        return (root, query, builder) -> {
            if (rawQuery == null || rawQuery.isBlank()) {
                return null;
            }
            String pattern = "%" + rawQuery.trim().toLowerCase() + "%";
            var creator = root.join("creator");
            return builder.or(
                    builder.like(builder.lower(root.get("title")), pattern),
                    builder.like(builder.lower(root.get("description")), pattern),
                    builder.like(builder.lower(root.get("location")), pattern),
                    builder.like(builder.lower(creator.get("displayName")), pattern)
            );
        };
    }
}
