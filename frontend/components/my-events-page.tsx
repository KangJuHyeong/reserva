"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarClock, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurrentUserApi, EventSummaryViewModel, MyEventsFilter, MyEventsSort } from "@/lib/types";

interface MyEventsPageProps {
  currentUser: CurrentUserApi;
  items: EventSummaryViewModel[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  activeFilter: MyEventsFilter;
  activeSort: MyEventsSort;
}

const categoryLabels: Record<string, string> = {
  Concert: "콘서트",
  Restaurant: "레스토랑",
  "Art & Design": "아트 & 디자인",
  Other: "기타",
  Sports: "스포츠",
};

const filterOptions: Array<{ value: MyEventsFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "editable", label: "수정 가능" },
  { value: "open", label: "예약 오픈됨" },
  { value: "upcoming", label: "오픈 예정" },
  { value: "almostFull", label: "매진 임박" },
];

const sortOptions: Array<{ value: MyEventsSort; label: string }> = [
  { value: "latest", label: "최신순" },
  { value: "eventDate", label: "이벤트 날짜순" },
  { value: "reservationOpen", label: "예약 오픈 빠른순" },
  { value: "mostReserved", label: "예약 많은순" },
];

function canEditEvent(reservationOpenDateTime: string) {
  return new Date(reservationOpenDateTime).getTime() > Date.now();
}

function isAlmostFullEvent(event: EventSummaryViewModel) {
  const reservedThreshold = Math.max(5, Math.ceil(event.totalSlots * 0.8));
  return event.reservedSlots >= reservedThreshold;
}

export function MyEventsPage({
  currentUser,
  items,
  currentPage,
  pageSize,
  totalItems,
  activeFilter,
  activeSort,
}: MyEventsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  function replaceParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function changePage(nextPage: number) {
    replaceParams((params) => {
      if (nextPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }
    });
  }

  function changeFilter(nextFilter: MyEventsFilter) {
    replaceParams((params) => {
      if (nextFilter === "all") {
        params.delete("filter");
      } else {
        params.set("filter", nextFilter);
      }
      params.delete("page");
    });
  }

  function changeSort(nextSort: MyEventsSort) {
    replaceParams((params) => {
      if (nextSort === "latest") {
        params.delete("sort");
      } else {
        params.set("sort", nextSort);
      }
      params.delete("page");
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(242,189,97,0.18),_transparent_30%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--secondary)))] px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              대시보드로 돌아가기
            </Link>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.24em] text-primary">Creator Workspace</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {currentUser.name}님의 이벤트 운영 공간입니다
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              내가 만든 이벤트를 한곳에서 관리하고, 예약 오픈 상태와 수정 가능 여부를 빠르게 확인할 수 있습니다.
              이번 화면에서는 운영에 필요한 필터와 정렬을 먼저 강화했습니다.
            </p>
          </div>

          <Button asChild size="lg" className="h-11 rounded-xl px-5">
            <Link href="/create">
              <Plus className="h-4 w-4" />
              새 이벤트 만들기
            </Link>
          </Button>
        </div>

        <section className="rounded-[28px] border border-border/70 bg-card/95 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">운영 기준</p>
              <p className="mt-2 text-sm text-muted-foreground">
                예약 오픈 전 이벤트만 수정할 수 있습니다. 필터와 정렬은 서버 기준으로 적용되어 페이지가 많아져도
                결과 순서가 유지됩니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="flex min-w-[180px] flex-col gap-2 text-sm text-muted-foreground">
                상태 필터
                <select
                  value={activeFilter}
                  onChange={(event) => changeFilter(event.target.value as MyEventsFilter)}
                  className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                >
                  {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-[180px] flex-col gap-2 text-sm text-muted-foreground">
                정렬
                <select
                  value={activeSort}
                  onChange={(event) => changeSort(event.target.value as MyEventsSort)}
                  className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-primary/10 px-4 py-2 font-medium text-primary">
              총 {totalItems.toLocaleString("ko-KR")}개
            </span>
            <span className="rounded-full bg-background px-4 py-2 text-muted-foreground">
              필터: {filterOptions.find((option) => option.value === activeFilter)?.label}
            </span>
            <span className="rounded-full bg-background px-4 py-2 text-muted-foreground">
              정렬: {sortOptions.find((option) => option.value === activeSort)?.label}
            </span>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="rounded-[28px] border border-dashed border-border/80 bg-card/95 p-10 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">조건에 맞는 이벤트가 없습니다</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              다른 필터나 정렬을 선택하거나 새 이벤트를 만들어 운영 목록을 채워보세요.
            </p>
            <Button asChild className="mt-6 rounded-xl">
              <Link href="/create">
                <Plus className="h-4 w-4" />
                새 이벤트 만들기
              </Link>
            </Button>
          </section>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((event) => {
                const editable = canEditEvent(event.reservationOpenDateTime);
                const almostFull = isAlmostFullEvent(event);

                return (
                  <article
                    key={event.id}
                    className="group overflow-hidden rounded-[28px] border border-border/70 bg-card/95 transition-colors hover:border-primary/40"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={event.imageUrl} alt={event.title} fill className="object-cover transition-transform group-hover:scale-105" />
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {categoryLabels[event.category] ?? event.category}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
                            남은 좌석 {event.remainingSlots}석
                          </span>
                          {editable ? (
                            <span className="rounded-full bg-chart-3/10 px-3 py-1 text-xs font-medium text-chart-3">수정 가능</span>
                          ) : (
                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">예약 오픈됨</span>
                          )}
                          {almostFull ? (
                            <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">매진 임박</span>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <h2 className="line-clamp-1 text-lg font-semibold text-foreground">{event.title}</h2>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{event.location}</p>
                      </div>

                      <div className="grid gap-2 rounded-2xl bg-background/70 p-4 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between gap-3">
                          <span>이벤트 일정</span>
                          <span className="font-medium text-foreground">
                            {event.dateLabel} {event.timeLabel}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>예약 오픈</span>
                          <span className="font-medium text-foreground">{event.reservationOpenLabel}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>현재 예약</span>
                          <span className="font-medium text-foreground">
                            {event.reservedSlots} / {event.totalSlots}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                        <span className="text-muted-foreground">주최자</span>
                        <span className="font-medium text-foreground">{event.hostName}</span>
                      </div>

                      {editable ? (
                        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                          예약 오픈 전입니다. 일정, 좌석, 설명을 계속 수정할 수 있습니다.
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <Lock className="h-4 w-4 text-primary" />
                            수정 잠금
                          </div>
                          <p className="mt-1">
                            예약이 이미 열려 수정은 막혀 있습니다. 공개 페이지 또는 이후 운영 화면에서 현황을 확인하세요.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button asChild variant="outline" className="flex-1 rounded-xl">
                          <Link href={`/reservation/${event.id}`}>공개 페이지</Link>
                        </Button>
                        {editable ? (
                          <Button asChild className="flex-1 rounded-xl">
                            <Link href={`/my-events/${event.id}/edit`}>수정하기</Link>
                          </Button>
                        ) : (
                          <Button className="flex-1 rounded-xl" disabled>
                            수정 불가
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {totalPages > 1 ? (
              <section className="flex items-center justify-between rounded-[24px] border border-border/70 bg-card/95 px-5 py-4">
                <p className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages} 페이지
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={currentPage <= 1}
                    onClick={() => changePage(currentPage - 1)}
                  >
                    이전
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={currentPage >= totalPages}
                    onClick={() => changePage(currentPage + 1)}
                  >
                    다음
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
