package com.reserva.backend.event;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface EventInventoryRepository extends JpaRepository<EventInventoryEntity, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select inventory from EventInventoryEntity inventory where inventory.eventId = :eventId")
    Optional<EventInventoryEntity> findByEventIdForUpdate(String eventId);
}
