"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ReservationCard } from "@/components/reservation-card";
import { UpcomingCard } from "@/components/upcoming-card";
import { mockReservations, upcomingOpenReservations } from "@/lib/mock-data";
import type { Category, Reservation } from "@/lib/types";
import { Timer, Heart, Calendar, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);

  const handleToggleWatchlist = (id: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isWatchlisted: !r.isWatchlisted } : r
      )
    );
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedCategory === "All") return matchesSearch;
      if (selectedCategory === "Trending") return matchesSearch && r.isTrending;
      if (selectedCategory === "Ending Soon") return matchesSearch && r.isEndingSoon;
      if (selectedCategory === "Watchlist") return matchesSearch && r.isWatchlisted;
      if (selectedCategory === "Upcoming") return false; // Upcoming reservations shown separately
      return matchesSearch && r.category === selectedCategory;
    });
  }, [reservations, searchQuery, selectedCategory]);

  const trendingReservations = reservations.filter((r) => r.isTrending);
  const almostFullReservations = reservations.filter(
    (r) => r.reservedSlots / r.totalSlots >= 0.9
  );
  const endingSoonReservations = reservations.filter((r) => r.isEndingSoon);
  const watchlistReservations = reservations.filter((r) => r.isWatchlisted);

  // Calculate mock countdown
  const getCountdown = () => {
    const countdowns = ["Opens in 2 hours", "Opens in 5 hours", "Opens in 1 day"];
    return countdowns[Math.floor(Math.random() * countdowns.length)];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="flex">
        <Sidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <MobileNav
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <main className="flex-1 p-6">
          {/* Upcoming Category View */}
          {selectedCategory === "Upcoming" ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Upcoming Reservations</h1>
                <p className="text-muted-foreground mt-1">Reservations that haven't opened yet - get ready to join!</p>
              </div>

              {upcomingOpenReservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border bg-card">
                  <div className="rounded-full bg-secondary p-4 mb-4">
                    <Timer className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No upcoming reservations</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Check back later for new events</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {upcomingOpenReservations.map((reservation) => (
                    <UpcomingCard key={reservation.id} reservation={reservation} />
                  ))}
                </div>
              )}
            </div>
          ) : selectedCategory === "All" && !searchQuery ? (
            <div className="space-y-10">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Trending Now</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {trendingReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onToggleWatchlist={handleToggleWatchlist}
                    />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Almost Full</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {almostFullReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onToggleWatchlist={handleToggleWatchlist}
                    />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Ending Soon</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {endingSoonReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onToggleWatchlist={handleToggleWatchlist}
                    />
                  ))}
                </div>
              </section>

              {/* Opening Soon Section */}
              {upcomingOpenReservations.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Timer className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Opening Soon</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {upcomingOpenReservations.map((reservation) => (
                      <UpcomingCard key={reservation.id} reservation={reservation} />
                    ))}
                  </div>
                </section>
              )}

              {watchlistReservations.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">My Watchlist</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {watchlistReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {selectedCategory === "All" ? "Search Results" : selectedCategory}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredReservations.length} results)
                </span>
              </h2>
              {filteredReservations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onToggleWatchlist={handleToggleWatchlist}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-secondary p-4 mb-4">
                    <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No reservations found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
