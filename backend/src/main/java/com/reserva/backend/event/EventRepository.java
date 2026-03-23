package com.reserva.backend.event;

import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<EventEntity, String>, EventRepositoryCustom {

    Optional<EventEntity> findByIdAndStatusAndVisibility(String id, EventStatus status, EventVisibility visibility);

    long countByCreator_Id(String creatorId);

    List<EventEntity> findTop3ByCreator_IdOrderByCreatedAtDesc(String creatorId);

    List<EventEntity> findAllByIdInAndStatusAndVisibility(Collection<String> ids, EventStatus status, EventVisibility visibility);
}
