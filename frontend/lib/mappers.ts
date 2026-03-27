import {
  BookingDetailApi,
  BookingDetailViewModel,
  BookingSummaryApi,
  BookingSummaryViewModel,
  EventDetailApi,
  EventDetailViewModel,
  EventSummaryApi,
  EventSummaryViewModel,
} from "@/lib/types";
import { formatDateLabel, formatDateTimeLabel, formatTimeLabel } from "@/lib/format";

export function toEventSummaryViewModel(event: EventSummaryApi): EventSummaryViewModel {
  return {
    id: event.id,
    title: event.title,
    imageUrl: event.imageUrl,
    category: event.category,
    price: event.price,
    location: event.location,
    reservationOpenDateTime: event.reservationOpenDateTime,
    dateLabel: formatDateLabel(event.eventDateTime),
    timeLabel: formatTimeLabel(event.eventDateTime),
    reservationOpenLabel: formatDateTimeLabel(event.reservationOpenDateTime),
    totalSlots: event.totalSlots,
    reservedSlots: event.reservedSlots,
    remainingSlots: event.remainingSlots,
    isWatchlisted: event.isWatchlisted,
    isTrending: event.isTrending,
    isEndingSoon: event.isEndingSoon,
    isOpeningSoon: event.isOpeningSoon,
    hostName: event.host.name,
    hostAvatarUrl: event.host.avatarUrl,
  };
}

export function toEventDetailViewModel(event: EventDetailApi): EventDetailViewModel {
  return {
    id: event.id,
    title: event.title,
    imageUrl: event.imageUrl,
    category: event.category,
    description: event.description,
    price: event.price,
    location: event.location,
    reservationOpenDateTime: event.reservationOpenDateTime,
    eventDateLabel: formatDateLabel(event.eventDateTime),
    eventTimeLabel: formatTimeLabel(event.eventDateTime),
    reservationOpenDateLabel: formatDateLabel(event.reservationOpenDateTime),
    reservationOpenTimeLabel: formatTimeLabel(event.reservationOpenDateTime),
    totalSlots: event.totalSlots,
    reservedSlots: event.reservedSlots,
    remainingSlots: event.remainingSlots,
    maxTicketsPerBooking: event.maxTicketsPerBooking,
    isWatchlisted: event.isWatchlisted,
    hostName: event.host.name,
    hostAvatarUrl: event.host.avatarUrl,
  };
}

export function toBookingDetailViewModel(booking: BookingDetailApi): BookingDetailViewModel {
  return {
    bookingId: booking.bookingId,
    status: booking.status,
    participantName: booking.participantName,
    ticketCount: booking.ticketCount,
    bookedAtLabel: formatDateTimeLabel(booking.bookedAt),
    unitPrice: booking.unitPrice,
    totalAmount: booking.totalAmount,
    eventId: booking.eventId,
    title: booking.event.title,
    imageUrl: booking.event.imageUrl,
    category: booking.event.category,
    description: booking.event.description,
    location: booking.event.location,
    eventDateLabel: formatDateLabel(booking.event.eventDateTime),
    eventTimeLabel: formatTimeLabel(booking.event.eventDateTime),
    reservationOpenLabel: formatDateTimeLabel(booking.event.reservationOpenDateTime),
    hostName: booking.event.host.name,
    hostAvatarUrl: booking.event.host.avatarUrl,
  };
}

export function toBookingSummaryViewModel(booking: BookingSummaryApi): BookingSummaryViewModel {
  const statusLabel = booking.status === "confirmed"
    ? "예약 확정"
    : booking.status === "completed"
      ? "이용 완료"
      : booking.status === "cancelled"
        ? "취소됨"
        : booking.status;

  return {
    bookingId: booking.bookingId,
    eventId: booking.eventId,
    title: booking.title,
    imageUrl: booking.imageUrl,
    status: booking.status,
    statusLabel,
    location: booking.location,
    eventDateLabel: formatDateLabel(booking.eventDateTime),
    eventTimeLabel: formatTimeLabel(booking.eventDateTime),
    bookedAtLabel: formatDateTimeLabel(booking.bookedAt),
    ticketCount: booking.ticketCount,
  };
}
