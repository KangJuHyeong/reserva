package com.reserva.backend.event;

import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<EventEntity, String>, EventRepositoryCustom {

    Optional<EventEntity> findByIdAndStatusAndVisibility(String id, EventStatus status, EventVisibility visibility);

    Optional<EventEntity> findByIdAndCreator_Id(String id, String creatorId);

    long countByCreator_Id(String creatorId);

    List<EventEntity> findTop3ByCreator_IdOrderByCreatedAtDesc(String creatorId);

    Page<EventEntity> findByCreator_IdOrderByCreatedAtDesc(String creatorId, Pageable pageable);

    List<EventEntity> findAllByIdInAndStatusAndVisibility(Collection<String> ids, EventStatus status, EventVisibility visibility);
}
