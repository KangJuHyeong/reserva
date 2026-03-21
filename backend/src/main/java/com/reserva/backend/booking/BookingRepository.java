package com.reserva.backend.booking;

import com.reserva.backend.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface BookingRepository extends JpaRepository<BookingEntity, String> {

    boolean existsByUserIdAndEventIdAndStatusIn(String userId, String eventId, Collection<BookingStatus> statuses);
}
