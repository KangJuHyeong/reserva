"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarClock, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurrentUserApi, EventSummaryViewModel } from "@/lib/types";

interface MyEventsPageProps {
  currentUser: CurrentUserApi;
  items: EventSummaryViewModel[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

const categoryLabels: Record<string, string> = {
  Concert: "콘서트",
  Restaurant: "레스토랑",
  "Art & Design": "아트 & 디자인",
  Other: "기타",
  Sports: "스포츠",
};

function canEditEvent(reservationOpenDateTime: string) {
  return new Date(reservationOpenDateTime).getTime() > Date.now();
}

export function MyEventsPage({
  currentUser,
  items,
  currentPage,
  pageSize,
  totalItems,
}: MyEventsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  function changePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
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
              {currentUser.name}님의 이벤트 운영 공간입니다.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              이 페이지에서는 내가 만든 이벤트를 한곳에서 확인하고 수정 가능 여부를 바로 판단할 수 있습니다.
              대시보드는 개인 활동 요약용이고, 실제 이벤트 운영은 여기서 진행합니다.
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">운영 기준</p>
              <p className="mt-2 text-sm text-muted-foreground">
                예약 오픈 전까지는 이벤트를 수정할 수 있습니다. 예약이 이미 시작된 이벤트는 공개 페이지 확인만
                가능하고, 수정 버튼은 잠금 상태로 표시됩니다.
              </p>
            </div>
            <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              게시 중인 이벤트 {totalItems.toLocaleString()}개
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="rounded-[28px] border border-dashed border-border/80 bg-card/95 p-10 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">아직 등록한 이벤트가 없습니다</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              첫 이벤트를 만들면 이 공간에서 일정, 정원, 예약 오픈 시점을 계속 관리할 수 있습니다.
            </p>
            <Button asChild className="mt-6 rounded-xl">
              <Link href="/create">
                <Plus className="h-4 w-4" />
                첫 이벤트 만들기
              </Link>
            </Button>
          </section>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((event) => {
                const editable = canEditEvent(event.reservationOpenDateTime);

                return (
                  <article
                    key={event.id}
                    className="group overflow-hidden rounded-[28px] border border-border/70 bg-card/95 transition-colors hover:border-primary/40"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={event.imageUrl} alt={event.title} fill className="object-cover transition-transform group-hover:scale-105" />
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {categoryLabels[event.category] ?? event.category}
                        </span>
                        <span className="text-xs text-muted-foreground">남은 좌석 {event.remainingSlots}석</span>
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
                          예약 오픈 전입니다. 일정, 정원, 설명을 수정할 수 있습니다.
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <Lock className="h-4 w-4 text-primary" />
                            수정 잠금
                          </div>
                          <p className="mt-1">
                            예약이 이미 오픈되어 이 이벤트는 더 이상 수정할 수 없습니다. 공개 페이지에서 현재 상태만
                            확인할 수 있습니다.
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
