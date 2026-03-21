package com.reserva.backend.booking;

import com.reserva.backend.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<BookingEntity, String> {

    boolean existsByUserIdAndEventIdAndStatusIn(String userId, String eventId, Collection<BookingStatus> statuses);

    Page<BookingEntity> findByUserIdOrderByBookedAtDesc(String userId, Pageable pageable);

    Page<BookingEntity> findByUserIdAndStatusOrderByBookedAtDesc(String userId, BookingStatus status, Pageable pageable);

    Optional<BookingEntity> findByBookingCodeAndUserId(String bookingCode, String userId);
}
