package com.reserva.backend.booking;

public interface BookingAdmissionGuard {

    AutoCloseable acquireEventLock(String eventId);
}
