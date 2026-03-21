export type Category =
  | "All"
  | "Concert"
  | "Restaurant"
  | "Art & Design"
  | "Sports"
  | "Trending"
  | "Ending Soon"
  | "Upcoming"
  | "Watchlist";

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
}

export interface EventHostApi {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface EventSummaryApi {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  price: number;
  location: string;
  eventDateTime: string;
  reservationOpenDateTime: string;
  totalSlots: number;
  reservedSlots: number;
  remainingSlots: number;
  isWatchlisted: boolean;
  isTrending: boolean;
  isEndingSoon: boolean;
  isOpeningSoon: boolean;
  host: EventHostApi;
}

export interface EventDetailApi {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  description: string;
  price: number;
  location: string;
  eventDateTime: string;
  reservationOpenDateTime: string;
  totalSlots: number;
  reservedSlots: number;
  remainingSlots: number;
  isWatchlisted: boolean;
  host: EventHostApi;
}

export interface BookingCreateResponseApi {
  bookingId: string;
  eventId: string;
  status: string;
  ticketCount: number;
  bookedAt: string;
  unitPrice: number;
  totalAmount: number;
}

export interface BookingDetailEventApi {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  description: string;
  location: string;
  eventDateTime: string;
  reservationOpenDateTime: string;
  host: EventHostApi;
}

export interface BookingDetailApi {
  bookingId: string;
  eventId: string;
  status: string;
  participantName: string;
  ticketCount: number;
  bookedAt: string;
  unitPrice: number;
  totalAmount: number;
  event: BookingDetailEventApi;
}

export interface EventSummaryViewModel {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  price: number;
  location: string;
  dateLabel: string;
  timeLabel: string;
  reservationOpenLabel: string;
  totalSlots: number;
  reservedSlots: number;
  remainingSlots: number;
  isWatchlisted: boolean;
  isTrending: boolean;
  isEndingSoon: boolean;
  isOpeningSoon: boolean;
  hostName: string;
  hostAvatarUrl: string | null;
}

export interface EventDetailViewModel {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  description: string;
  price: number;
  location: string;
  eventDateLabel: string;
  eventTimeLabel: string;
  reservationOpenDateLabel: string;
  reservationOpenTimeLabel: string;
  totalSlots: number;
  reservedSlots: number;
  remainingSlots: number;
  isWatchlisted: boolean;
  hostName: string;
  hostAvatarUrl: string | null;
}

export interface BookingDetailViewModel {
  bookingId: string;
  status: string;
  participantName: string;
  ticketCount: number;
  bookedAtLabel: string;
  unitPrice: number;
  totalAmount: number;
  eventId: string;
  title: string;
  imageUrl: string;
  category: string;
  description: string;
  location: string;
  eventDateLabel: string;
  eventTimeLabel: string;
  reservationOpenLabel: string;
  hostName: string;
  hostAvatarUrl: string | null;
}
