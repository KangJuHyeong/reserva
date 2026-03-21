package com.reserva.backend.event;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_inventory")
public class EventInventoryEntity {

    @Id
    @Column(name = "event_id", length = 36, nullable = false)
    private String eventId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private EventEntity event;

    @Column(name = "total_slots", nullable = false)
    private int totalSlots;

    @Column(name = "reserved_slots", nullable = false)
    private int reservedSlots;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public int getTotalSlots() {
        return totalSlots;
    }

    public int getReservedSlots() {
        return reservedSlots;
    }

    public int getRemainingSlots() {
        return totalSlots - reservedSlots;
    }

    public void reserve(int ticketCount) {
        this.reservedSlots += ticketCount;
    }
}
