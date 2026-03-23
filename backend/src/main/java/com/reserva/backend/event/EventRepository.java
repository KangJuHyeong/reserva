package com.reserva.backend.event;

import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventRepository extends JpaRepository<EventEntity, String>, EventRepositoryCustom {

    Optional<EventEntity> findByIdAndStatusAndVisibility(String id, EventStatus status, EventVisibility visibility);
}
