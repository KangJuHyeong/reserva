"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarClock, Plus } from "lucide-react";
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
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.24em] text-primary">크리에이터 작업 공간</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {currentUser.name}님이 만든 이벤트를 여기서 관리하세요.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              대시보드는 개인 활동 요약용이고, 이 페이지는 creator 관리용입니다. 각 이벤트의 공개 페이지를 확인하거나 수정 화면으로 바로 이동할 수 있습니다.
            </p>
          </div>

          <Button asChild size="lg" className="h-11 rounded-xl px-5">
            <Link href="/create">
              <Plus className="h-4 w-4" />
              이벤트 만들기
            </Link>
          </Button>
        </div>

        <section className="rounded-[28px] border border-border/70 bg-card/95 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">안내</p>
              <p className="mt-2 text-sm text-muted-foreground">
                대시보드는 예약과 찜 내역을 보는 곳이고, 내 이벤트는 직접 게시한 이벤트를 운영하는 공간입니다.
              </p>
            </div>
            <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              게시한 이벤트 {totalItems.toLocaleString()}개
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="rounded-[28px] border border-dashed border-border/80 bg-card/95 p-10 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">아직 게시한 이벤트가 없습니다</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              첫 이벤트를 만들고 게시하면 이 creator workspace에서 바로 관리할 수 있습니다.
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
              {items.map((event) => (
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
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{event.dateLabel} {event.timeLabel}</span>
                      <span>예약 오픈 {event.reservationOpenLabel}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                      <span className="text-muted-foreground">주최자</span>
                      <span className="font-medium text-foreground">{event.hostName}</span>
                    </div>
                    <div className="flex gap-3">
                      <Button asChild variant="outline" className="flex-1 rounded-xl">
                        <Link href={`/reservation/${event.id}`}>공개 페이지</Link>
                      </Button>
                      <Button asChild className="flex-1 rounded-xl">
                        <Link href={`/my-events/${event.id}/edit`}>수정하기</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
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
