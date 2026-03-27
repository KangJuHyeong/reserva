import "server-only";
import { fetchBackendJson } from "@/lib/server/backend";
import {
  BookingDetailApi,
  BookingSummaryApi,
  DashboardSummaryApi,
  CurrentUserApi,
  EventDetailApi,
  EventSummaryApi,
  MyBookingsStatus,
  MyEventsFilter,
  MyEventsSort,
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

  return fetchBackendJson<PageResponse<EventSummaryApi>>(`/api/v1/events?${search.toString()}`, undefined, {
    includeIncomingCookies: true,
  });
}

export async function fetchEventDetail(eventId: string) {
  return fetchBackendJson<EventDetailApi>(`/api/v1/events/${eventId}`, undefined, {
    includeIncomingCookies: true,
  });
}

export async function fetchBookingDetail(bookingId: string) {
  return fetchBackendJson<BookingDetailApi>(`/api/v1/me/bookings/${bookingId}`, undefined, {
    includeIncomingCookies: true,
  });
}

export async function fetchMyBookings(params?: {
  status?: MyBookingsStatus;
  page?: number;
  size?: number;
}) {
  const search = new URLSearchParams();
  search.set("page", String(params?.page ?? 1));
  search.set("size", String(params?.size ?? 12));
  if (params?.status && params.status !== "all") search.set("status", params.status);

  return fetchBackendJson<PageResponse<BookingSummaryApi>>(`/api/v1/me/bookings?${search.toString()}`, undefined, {
    includeIncomingCookies: true,
  });
}

export async function fetchCurrentUser() {
  return fetchBackendJson<CurrentUserApi>("/api/v1/me", undefined, {
    includeIncomingCookies: true,
  });
}

export async function fetchDashboardSummary() {
  return fetchBackendJson<DashboardSummaryApi>("/api/v1/me/dashboard-summary", undefined, {
    includeIncomingCookies: true,
  });
}

export async function fetchMyEvents(params?: {
  page?: number;
  size?: number;
  filter?: MyEventsFilter;
  sort?: MyEventsSort;
}) {
  const search = new URLSearchParams();
  search.set("page", String(params?.page ?? 1));
  search.set("size", String(params?.size ?? 12));
  if (params?.filter && params.filter !== "all") search.set("filter", params.filter);
  if (params?.sort && params.sort !== "latest") search.set("sort", params.sort);

  return fetchBackendJson<PageResponse<EventSummaryApi>>(`/api/v1/me/events?${search.toString()}`, undefined, {
    includeIncomingCookies: true,
  });
}

export async function fetchMyEventDetail(eventId: string) {
  return fetchBackendJson<EventDetailApi>(`/api/v1/me/events/${eventId}`, undefined, {
    includeIncomingCookies: true,
  });
}
