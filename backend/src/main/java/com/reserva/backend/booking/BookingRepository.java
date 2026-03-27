package com.reserva.backend.booking;

import com.reserva.backend.booking.model.BookingStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<BookingEntity, String> {

    boolean existsByUserIdAndEventIdAndStatusIn(String userId, String eventId, Collection<BookingStatus> statuses);

    long countByUserId(String userId);

    long countByUserIdAndStatus(String userId, BookingStatus status);

    Page<BookingEntity> findByUserIdOrderByBookedAtDesc(String userId, Pageable pageable);

    Page<BookingEntity> findByUserIdAndStatusOrderByBookedAtDesc(String userId, BookingStatus status, Pageable pageable);

    List<BookingEntity> findTop3ByUserIdOrderByBookedAtDesc(String userId);

    Optional<BookingEntity> findByBookingCodeAndUserId(String bookingCode, String userId);

    boolean existsByEventId(String eventId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select booking from BookingEntity booking where booking.bookingCode = :bookingCode and booking.userId = :userId")
    Optional<BookingEntity> findByBookingCodeAndUserIdForUpdate(String bookingCode, String userId);
}
