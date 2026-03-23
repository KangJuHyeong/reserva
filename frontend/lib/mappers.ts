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

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

function formatDateLabel(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatTimeLabel(value: string) {
  return timeFormatter.format(new Date(value));
}

function formatDateTimeLabel(value: string) {
  return `${formatDateLabel(value)} ${formatTimeLabel(value)}`;
}

export function toEventSummaryViewModel(event: EventSummaryApi): EventSummaryViewModel {
  return {
    id: event.id,
    title: event.title,
    imageUrl: event.imageUrl,
    category: event.category,
    price: event.price,
    location: event.location,
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
    eventDateLabel: formatDateLabel(event.eventDateTime),
    eventTimeLabel: formatTimeLabel(event.eventDateTime),
    reservationOpenDateLabel: formatDateLabel(event.reservationOpenDateTime),
    reservationOpenTimeLabel: formatTimeLabel(event.reservationOpenDateTime),
    totalSlots: event.totalSlots,
    reservedSlots: event.reservedSlots,
    remainingSlots: event.remainingSlots,
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
  const statusLabel = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);

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
