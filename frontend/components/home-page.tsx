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

const categoryLabels: Record<Category, string> = {
  All: "전체",
  Concert: "콘서트",
  Restaurant: "레스토랑",
  "Art & Design": "아트 & 디자인",
  Other: "기타",
  Sports: "스포츠",
  Trending: "인기",
  "Ending Soon": "마감 임박",
  Upcoming: "오픈 예정",
  Watchlist: "찜한 이벤트",
};

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
    { key: "trending", title: "지금 인기", items: trendingReservations },
    { key: "almost-full", title: "거의 마감", items: almostFullReservations },
    { key: "ending-soon", title: "마감 임박", items: endingSoonReservations },
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
              <h2 className="mt-4 text-xl font-semibold text-foreground">찜한 이벤트를 보려면 로그인해 주세요</h2>
              <p className="mt-2 text-sm text-muted-foreground">찜한 이벤트 목록은 로그인한 사용자만 불러올 수 있습니다.</p>
              <button type="button" onClick={clearView} disabled={isPending} className="mt-5 text-sm text-primary hover:underline">
                둘러보기로 돌아가기
              </button>
            </div>
          ) : mode === "default" ? (
            <div className="space-y-10">
              <section>
                <h2 className="mb-2 text-xl font-semibold text-foreground">최신 이벤트</h2>
                <p className="mb-4 text-sm text-muted-foreground">추천 섹션이 적을 때도 전체 분위기를 볼 수 있도록 다양한 카테고리를 함께 보여줍니다.</p>
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
                    <h2 className="text-xl font-semibold text-foreground">오픈 예정</h2>
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
                {selectedCategory === "All" ? "검색 결과" : categoryLabels[selectedCategory]}
                <span className="ml-2 text-sm font-normal text-muted-foreground">({totalItems}개)</span>
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
                        {currentPage} / {totalPages} 페이지
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isPending || currentPage <= 1}
                          onClick={() => changePage(currentPage - 1)}
                          className="rounded-lg border border-border px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          이전
                        </button>
                        <button
                          type="button"
                          disabled={isPending || currentPage >= totalPages}
                          onClick={() => changePage(currentPage + 1)}
                          className="rounded-lg border border-border px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          다음
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
                    {selectedCategory === "Watchlist" ? "아직 찜한 이벤트가 없습니다" : "이벤트를 찾을 수 없습니다"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedCategory === "Watchlist"
                      ? "하트 버튼으로 저장한 이벤트가 여기에 표시됩니다."
                      : "검색어나 필터 조건을 바꿔서 다시 시도해 보세요."}
                  </p>
                  {selectedCategory === "Watchlist" ? (
                    <button type="button" onClick={clearView} disabled={isPending} className="mt-5 text-sm text-primary hover:underline">
                      둘러보기로 돌아가기
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
