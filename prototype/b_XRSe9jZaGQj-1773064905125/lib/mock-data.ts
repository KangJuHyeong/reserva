import { Reservation } from "./types";

export const mockReservations: Reservation[] = [
  {
    id: "1",
    title: "Summer Jazz Night",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop",
    category: "Concert",
    price: 45,
    location: "Blue Note Jazz Club, NYC",
    date: "Mar 15, 2026",
    time: "8:00 PM",
    reservationOpenDate: "Mar 8, 2026",
    reservationOpenTime: "10:00 AM",
    totalSlots: 100,
    reservedSlots: 87,
    isWatchlisted: true,
    isTrending: true,
    description: "Experience an unforgettable evening of smooth jazz performed by world-renowned musicians in an intimate setting.",
    host: {
      name: "Jazz Collective NYC",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
    }
  },
  {
    id: "2",
    title: "Chef's Table Experience",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    category: "Restaurant",
    price: 150,
    location: "Michelin Star Kitchen, LA",
    date: "Mar 18, 2026",
    time: "7:30 PM",
    reservationOpenDate: "Mar 10, 2026",
    reservationOpenTime: "12:00 PM",
    totalSlots: 12,
    reservedSlots: 11,
    isWatchlisted: false,
    isEndingSoon: true,
    description: "An exclusive 8-course tasting menu featuring seasonal ingredients prepared tableside by our executive chef.",
    host: {
      name: "Chef Marco Rivera",
      avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop"
    }
  },
  {
    id: "3",
    title: "Modern Art Exhibition",
    image: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&h=600&fit=crop",
    category: "Art & Design",
    price: 25,
    location: "Contemporary Art Museum, SF",
    date: "Mar 20, 2026",
    time: "10:00 AM",
    reservationOpenDate: "Mar 12, 2026",
    reservationOpenTime: "9:00 AM",
    totalSlots: 50,
    reservedSlots: 32,
    isWatchlisted: true,
    isTrending: true,
    description: "Explore groundbreaking works from emerging contemporary artists pushing the boundaries of visual expression.",
    host: {
      name: "SF Art Foundation",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
    }
  },
  {
    id: "4",
    title: "Basketball Championship Finals",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
    category: "Sports",
    price: 85,
    location: "Madison Square Garden, NYC",
    date: "Mar 22, 2026",
    time: "7:00 PM",
    reservationOpenDate: "Mar 10, 2026",
    reservationOpenTime: "6:00 PM",
    totalSlots: 200,
    reservedSlots: 198,
    isWatchlisted: false,
    isEndingSoon: true,
    isTrending: true,
    description: "Witness the ultimate showdown as the top two teams compete for the championship title.",
    host: {
      name: "NYC Sports League",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    }
  },
  {
    id: "5",
    title: "Acoustic Sunset Session",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    category: "Concert",
    price: 35,
    location: "Rooftop Gardens, Miami",
    date: "Mar 25, 2026",
    time: "6:00 PM",
    reservationOpenDate: "Mar 15, 2026",
    reservationOpenTime: "10:00 AM",
    totalSlots: 80,
    reservedSlots: 45,
    isWatchlisted: false,
    description: "An intimate acoustic performance as the sun sets over the Miami skyline.",
    host: {
      name: "Sunset Sessions",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
    }
  },
  {
    id: "6",
    title: "Wine Tasting Evening",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop",
    category: "Restaurant",
    price: 75,
    location: "Napa Valley Vineyards, CA",
    date: "Mar 28, 2026",
    time: "5:00 PM",
    reservationOpenDate: "Mar 18, 2026",
    reservationOpenTime: "9:00 AM",
    totalSlots: 30,
    reservedSlots: 22,
    isWatchlisted: true,
    description: "Sample award-winning wines paired with artisanal cheeses in our historic barrel room.",
    host: {
      name: "Napa Valley Winery",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop"
    }
  },
  {
    id: "7",
    title: "Design Workshop",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop",
    category: "Art & Design",
    price: 120,
    location: "Creative Hub, Austin",
    date: "Apr 1, 2026",
    time: "2:00 PM",
    reservationOpenDate: "Mar 20, 2026",
    reservationOpenTime: "12:00 PM",
    totalSlots: 20,
    reservedSlots: 18,
    isWatchlisted: false,
    isEndingSoon: true,
    description: "Learn cutting-edge design techniques from industry professionals in this hands-on workshop.",
    host: {
      name: "Design Academy",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    }
  },
  {
    id: "8",
    title: "Soccer Match",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
    category: "Sports",
    price: 55,
    location: "City Stadium, Chicago",
    date: "Apr 5, 2026",
    time: "3:00 PM",
    reservationOpenDate: "Mar 25, 2026",
    reservationOpenTime: "8:00 AM",
    totalSlots: 150,
    reservedSlots: 89,
    isWatchlisted: true,
    isTrending: true,
    description: "Cheer on your favorite team in this exciting league match.",
    host: {
      name: "Chicago FC",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop"
    }
  },
];

// Mock data for reservations that haven't opened yet (upcoming - future open time)
export const upcomingOpenReservations: Reservation[] = [
  {
    id: "u1",
    title: "K-Pop Festival 2026",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop",
    category: "Concert",
    price: 120,
    location: "Olympic Stadium, Seoul",
    date: "Apr 15, 2026",
    time: "6:00 PM",
    reservationOpenDate: "Mar 10, 2026",
    reservationOpenTime: "2:00 PM",
    totalSlots: 500,
    reservedSlots: 0,
    isWatchlisted: true,
    description: "The biggest K-Pop festival featuring top idol groups and solo artists.",
    host: {
      name: "K-Music Entertainment",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
    }
  },
  {
    id: "u2",
    title: "Exclusive Omakase Dinner",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop",
    category: "Restaurant",
    price: 250,
    location: "Sushi Master Tokyo",
    date: "Apr 20, 2026",
    time: "7:00 PM",
    reservationOpenDate: "Mar 10, 2026",
    reservationOpenTime: "6:00 PM",
    totalSlots: 8,
    reservedSlots: 0,
    isWatchlisted: false,
    description: "A once-in-a-lifetime 15-course omakase experience with the legendary Chef Tanaka.",
    host: {
      name: "Chef Tanaka",
      avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop"
    }
  },
  {
    id: "u3",
    title: "VIP Tennis Finals",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop",
    category: "Sports",
    price: 200,
    location: "Wimbledon, London",
    date: "Apr 25, 2026",
    time: "2:00 PM",
    reservationOpenDate: "Mar 11, 2026",
    reservationOpenTime: "10:00 AM",
    totalSlots: 100,
    reservedSlots: 0,
    isWatchlisted: true,
    description: "Premium seats for the tennis finals with VIP lounge access.",
    host: {
      name: "Tennis League UK",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    }
  },
];

// Mock user's joined reservations
export const myJoinedReservations = [
  {
    ...mockReservations[0],
    bookingId: "BK-2026-001",
    bookingDate: "Mar 5, 2026",
    participantName: "Alex Johnson",
    status: "confirmed" as const,
    tickets: 2,
  },
  {
    ...mockReservations[2],
    bookingId: "BK-2026-002",
    bookingDate: "Mar 6, 2026",
    participantName: "Alex Johnson",
    status: "confirmed" as const,
    tickets: 1,
  },
  {
    ...mockReservations[5],
    bookingId: "BK-2026-003",
    bookingDate: "Mar 1, 2026",
    participantName: "Alex Johnson",
    status: "completed" as const,
    tickets: 2,
  },
];

// Mock user's created reservations
export const myCreatedReservations = mockReservations.slice(3, 6).map((r) => ({
  ...r,
  isCreatedByUser: true,
}));
