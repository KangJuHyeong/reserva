"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Timer } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { Navbar } from "@/components/navbar";
import { ReservationCard } from "@/components/reservation-card";
import { Sidebar } from "@/components/sidebar";
import { UpcomingCard } from "@/components/upcoming-card";
import { Category, CurrentUserApi, EventSummaryViewModel } from "@/lib/types";

interface HomePageProps {
  searchQuery: string;
  selectedCategory: Category;
  items: EventSummaryViewModel[];
  currentUser: CurrentUserApi | null;
  mode: "default" | "filtered" | "watchlist_unauthenticated";
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export function HomePage({ searchQuery, selectedCategory, items, currentUser, mode, currentPage, pageSize, totalItems }: HomePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [visibleItems, setVisibleItems] = useState(items);

  useEffect(() => {
    setVisibleItems(items);
  }, [items]);

  const trendingReservations = visibleItems.filter((item) => item.isTrending);
  const almostFullReservations = visibleItems.filter((item) => item.remainingSlots <= Math.max(5, Math.ceil(item.totalSlots * 0.2)));
  const endingSoonReservations = visibleItems.filter((item) => item.isEndingSoon);
  const upcomingReservations = visibleItems.filter((item) => item.isOpeningSoon);
  const latestReservations = visibleItems.slice(0, 6);
  const visibleSections = [
    { key: "trending", title: "Trending Now", items: trendingReservations },
    { key: "almost-full", title: "Almost Full", items: almostFullReservations },
    { key: "ending-soon", title: "Ending Soon", items: endingSoonReservations },
  ].filter((section) => section.items.length > 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  function clearView() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    params.delete("page");
    startTransition(() => {
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  function updateWatchlist(eventId: string, nextValue: boolean) {
    setVisibleItems((current) => {
      if (selectedCategory === "Watchlist" && !nextValue) {
        return current.filter((item) => item.id !== eventId);
      }

      return current.map((item) => (item.id === eventId ? { ...item, isWatchlisted: nextValue } : item));
    });
  }

  function changePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    startTransition(() => {
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={searchQuery} currentUser={currentUser} />

      <div className="flex">
        <Sidebar selectedCategory={selectedCategory} />
        <MobileNav selectedCategory={selectedCategory} />

        <main className="flex-1 p-6">
          {mode === "watchlist_unauthenticated" ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
              <div className="rounded-full bg-secondary p-4">
                <Timer className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground">Sign in to view your watchlist</h2>
              <p className="mt-2 text-sm text-muted-foreground">The watchlist section requires authentication before saved events can be loaded.</p>
              <button type="button" onClick={clearView} disabled={isPending} className="mt-5 text-sm text-primary hover:underline">
                Back to discovery
              </button>
            </div>
          ) : mode === "default" ? (
            <div className="space-y-10">
              <section>
                <h2 className="mb-2 text-xl font-semibold text-foreground">Latest Events</h2>
                <p className="mb-4 text-sm text-muted-foreground">A mixed discovery feed so every category stays visible even when curated sections are sparse.</p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {latestReservations.map((reservation) =>
                    reservation.isOpeningSoon ? (
                      <UpcomingCard
                        key={reservation.id}
                        reservation={reservation}
                        onWatchlistChange={(nextValue) => updateWatchlist(reservation.id, nextValue)}
                      />
                    ) : (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onWatchlistChange={(nextValue) => updateWatchlist(reservation.id, nextValue)}
                      />
                    )
                  )}
                </div>
              </section>

              {visibleSections.map((section) => (
                <section key={section.key}>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">{section.title}</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {section.items.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onWatchlistChange={(nextValue) => updateWatchlist(reservation.id, nextValue)}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {upcomingReservations.length > 0 ? (
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Opening Soon</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {upcomingReservations.map((reservation) => (
                      <UpcomingCard
                        key={reservation.id}
                        reservation={reservation}
                        onWatchlistChange={(nextValue) => updateWatchlist(reservation.id, nextValue)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                {selectedCategory === "All" ? "Search Results" : selectedCategory}
                <span className="ml-2 text-sm font-normal text-muted-foreground">({totalItems} results)</span>
              </h2>
              {visibleItems.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {visibleItems.map((reservation) =>
                      reservation.isOpeningSoon ? (
                        <UpcomingCard
                          key={reservation.id}
                          reservation={reservation}
                          onWatchlistChange={(nextValue) => updateWatchlist(reservation.id, nextValue)}
                        />
                      ) : (
                        <ReservationCard
                          key={reservation.id}
                          reservation={reservation}
                          onWatchlistChange={(nextValue) => updateWatchlist(reservation.id, nextValue)}
                        />
                      )
                    )}
                  </div>

                  {totalPages > 1 ? (
                    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isPending || currentPage <= 1}
                          onClick={() => changePage(currentPage - 1)}
                          className="rounded-lg border border-border px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={isPending || currentPage >= totalPages}
                          onClick={() => changePage(currentPage + 1)}
                          className="rounded-lg border border-border px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-secondary p-4">
                    <Timer className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-foreground">
                    {selectedCategory === "Watchlist" ? "No saved events yet" : "No events found"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedCategory === "Watchlist"
                      ? "Save events with the heart button and they will appear here."
                      : "Try adjusting your search or filter criteria."}
                  </p>
                  {selectedCategory === "Watchlist" ? (
                    <button type="button" onClick={clearView} disabled={isPending} className="mt-5 text-sm text-primary hover:underline">
                      Back to discovery
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
