package com.reserva.backend.event;

import com.reserva.backend.event.model.EventCategory;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import com.reserva.backend.user.UserEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class EventEntity {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_id", nullable = false)
    private UserEntity creator;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventCategory category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "event_datetime", nullable = false)
    private LocalDateTime eventDateTime;

    @Column(name = "reservation_open_datetime", nullable = false)
    private LocalDateTime reservationOpenDateTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventVisibility visibility;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "event", fetch = FetchType.EAGER, cascade = CascadeType.ALL, optional = false)
    private EventInventoryEntity inventory;

    public static EventEntity create(String id,
                                     UserEntity creator,
                                     String title,
                                     EventCategory category,
                                     String description,
                                     String imageUrl,
                                     String location,
                                     BigDecimal price,
                                     LocalDateTime eventDateTime,
                                     LocalDateTime reservationOpenDateTime,
                                     EventStatus status,
                                     EventVisibility visibility,
                                     LocalDateTime now,
                                     int totalSlots) {
        EventEntity event = new EventEntity();
        event.id = id;
        event.creator = creator;
        event.title = title;
        event.category = category;
        event.description = description;
        event.imageUrl = imageUrl;
        event.location = location;
        event.price = price;
        event.eventDateTime = eventDateTime;
        event.reservationOpenDateTime = reservationOpenDateTime;
        event.status = status;
        event.visibility = visibility;
        event.createdAt = now;
        event.updatedAt = now;
        event.inventory = EventInventoryEntity.create(event, totalSlots, now);
        return event;
    }

    public String getId() {
        return id;
    }

    public UserEntity getCreator() {
        return creator;
    }

    public String getTitle() {
        return title;
    }

    public EventCategory getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getLocation() {
        return location;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public LocalDateTime getEventDateTime() {
        return eventDateTime;
    }

    public LocalDateTime getReservationOpenDateTime() {
        return reservationOpenDateTime;
    }

    public EventStatus getStatus() {
        return status;
    }

    public EventVisibility getVisibility() {
        return visibility;
    }

    public EventInventoryEntity getInventory() {
        return inventory;
    }
}
