"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Timer } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { Navbar } from "@/components/navbar";
import { ReservationCard } from "@/components/reservation-card";
import { Sidebar } from "@/components/sidebar";
import { UpcomingCard } from "@/components/upcoming-card";
import { Category, EventSummaryViewModel } from "@/lib/types";

interface HomePageProps {
  searchQuery: string;
  selectedCategory: Category;
  items: EventSummaryViewModel[];
  mode: "default" | "filtered" | "watchlist_unavailable";
}

export function HomePage({ searchQuery, selectedCategory, items, mode }: HomePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const trendingReservations = items.filter((item) => item.isTrending);
  const almostFullReservations = items.filter((item) => item.remainingSlots <= Math.max(5, Math.ceil(item.totalSlots * 0.2)));
  const endingSoonReservations = items.filter((item) => item.isEndingSoon);
  const upcomingReservations = items.filter((item) => item.isOpeningSoon);

  function clearView() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={searchQuery} />

      <div className="flex">
        <Sidebar selectedCategory={selectedCategory} />
        <MobileNav selectedCategory={selectedCategory} />

        <main className="flex-1 p-6">
          {mode === "watchlist_unavailable" ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
              <div className="rounded-full bg-secondary p-4">
                <Timer className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground">Watchlist is not available yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">Watchlist persistence is a later backend priority. Browse other sections first.</p>
              <button type="button" onClick={clearView} disabled={isPending} className="mt-5 text-sm text-primary hover:underline">
                Back to discovery
              </button>
            </div>
          ) : mode === "default" ? (
            <div className="space-y-10">
              <section>
                <h2 className="mb-4 text-xl font-semibold text-foreground">Trending Now</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {trendingReservations.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} />)}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-foreground">Almost Full</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {almostFullReservations.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} />)}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-foreground">Ending Soon</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {endingSoonReservations.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} />)}
                </div>
              </section>

              {upcomingReservations.length > 0 ? (
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Opening Soon</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {upcomingReservations.map((reservation) => <UpcomingCard key={reservation.id} reservation={reservation} />)}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                {selectedCategory === "All" ? "Search Results" : selectedCategory}
                <span className="ml-2 text-sm font-normal text-muted-foreground">({items.length} results)</span>
              </h2>
              {items.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((reservation) =>
                    reservation.isOpeningSoon ? (
                      <UpcomingCard key={reservation.id} reservation={reservation} />
                    ) : (
                      <ReservationCard key={reservation.id} reservation={reservation} />
                    )
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-secondary p-4">
                    <Timer className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-foreground">No events found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
