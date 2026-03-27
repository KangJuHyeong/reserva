package com.reserva.backend.booking;

import com.reserva.backend.booking.model.BookingStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class BookingEntity {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @Column(name = "booking_code", nullable = false, unique = true)
    private String bookingCode;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(name = "participant_name", nullable = false)
    private String participantName;

    @Column(name = "ticket_count", nullable = false)
    private int ticketCount;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "booked_at", nullable = false)
    private LocalDateTime bookedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static BookingEntity create(String id,
                                       String bookingCode,
                                       String userId,
                                       String eventId,
                                       String participantName,
                                       int ticketCount,
                                       BigDecimal unitPrice,
                                       BigDecimal totalAmount,
                                       LocalDateTime bookedAt) {
        BookingEntity booking = new BookingEntity();
        booking.id = id;
        booking.bookingCode = bookingCode;
        booking.userId = userId;
        booking.eventId = eventId;
        booking.status = BookingStatus.CONFIRMED;
        booking.participantName = participantName;
        booking.ticketCount = ticketCount;
        booking.unitPrice = unitPrice;
        booking.totalAmount = totalAmount;
        booking.bookedAt = bookedAt;
        booking.createdAt = bookedAt;
        booking.updatedAt = bookedAt;
        return booking;
    }

    public String getBookingCode() {
        return bookingCode;
    }

    public String getUserId() {
        return userId;
    }

    public String getEventId() {
        return eventId;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public String getParticipantName() {
        return participantName;
    }

    public int getTicketCount() {
        return ticketCount;
    }

    public LocalDateTime getBookedAt() {
        return bookedAt;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void cancel(LocalDateTime cancelledAt) {
        this.status = BookingStatus.CANCELLED;
        this.cancelledAt = cancelledAt;
        this.updatedAt = cancelledAt;
    }
}
