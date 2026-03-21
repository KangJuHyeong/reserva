export interface Reservation {
  id: string;
  title: string;
  image: string;
  category: "Concert" | "Restaurant" | "Art & Design" | "Sports";
  price: number;
  location: string;
  date: string;
  time: string;
  reservationOpenDate?: string;
  reservationOpenTime?: string;
  totalSlots: number;
  reservedSlots: number;
  isWatchlisted: boolean;
  isTrending?: boolean;
  isEndingSoon?: boolean;
  description?: string;
  host?: {
    name: string;
    avatar: string;
  };
  isCreatedByUser?: boolean;
  isJoinedByUser?: boolean;
  status?: "upcoming" | "completed" | "cancelled";
  bookedDate?: string;
  tickets?: number;
}

export type Category =
  | "All"
  | "Concert"
  | "Restaurant"
  | "Art & Design"
  | "Sports"
  | "Trending"
  | "Ending Soon"
  | "Watchlist"
  | "Upcoming";

export interface UserStats {
  totalReservations: number;
  upcomingEvents: number;
  completedEvents: number;
  watchlistCount: number;
  createdEvents: number;
}
