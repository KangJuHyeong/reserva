package com.reserva.backend.event;

import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @EntityGraph(attributePaths = {"creator", "inventory"})
    @Query("select event from EventEntity event where event.id = :id and event.status = :status and event.visibility = :visibility")
    Optional<EventEntity> findDetailByIdAndStatusAndVisibility(@Param("id") String id,
                                                               @Param("status") EventStatus status,
                                                               @Param("visibility") EventVisibility visibility);

    @EntityGraph(attributePaths = {"creator", "inventory"})
    @Query("select event from EventEntity event where event.id = :id and event.creator.id = :creatorId")
    Optional<EventEntity> findDetailByIdAndCreatorId(@Param("id") String id, @Param("creatorId") String creatorId);

    @EntityGraph(attributePaths = {"creator"})
    @Query("select event from EventEntity event where event.id = :id")
    Optional<EventEntity> findByIdWithCreator(@Param("id") String id);

    @EntityGraph(attributePaths = {"creator", "inventory"})
    @Query("select event from EventEntity event where event.id in :ids and event.status = :status and event.visibility = :visibility")
    List<EventEntity> findDetailsByIdInAndStatusAndVisibility(@Param("ids") Collection<String> ids,
                                                              @Param("status") EventStatus status,
                                                              @Param("visibility") EventVisibility visibility);

    @EntityGraph(attributePaths = {"creator", "inventory"})
    @Query("select event from EventEntity event where event.creator.id = :creatorId order by event.createdAt desc")
    List<EventEntity> findRecentDetailsByCreatorId(@Param("creatorId") String creatorId, Pageable pageable);
}
