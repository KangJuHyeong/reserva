import "server-only";
import { fetchBackendJson } from "@/lib/server/backend";
import {
  BookingDetailApi,
  EventDetailApi,
  EventSummaryApi,
  PageResponse,
} from "@/lib/types";

export async function fetchEvents(params: {
  q?: string;
  category?: string;
  section?: string;
  page?: number;
  size?: number;
}) {
  const search = new URLSearchParams();

  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.section) search.set("section", params.section);
  search.set("page", String(params.page ?? 1));
  search.set("size", String(params.size ?? 20));

  return fetchBackendJson<PageResponse<EventSummaryApi>>(`/api/v1/events?${search.toString()}`);
}

export async function fetchEventDetail(eventId: string) {
  return fetchBackendJson<EventDetailApi>(`/api/v1/events/${eventId}`);
}

export async function fetchBookingDetail(bookingId: string) {
  return fetchBackendJson<BookingDetailApi>(`/api/v1/me/bookings/${bookingId}`);
}
