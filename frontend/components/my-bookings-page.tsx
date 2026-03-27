"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarClock, ReceiptText, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { BookingSummaryViewModel, CurrentUserApi, MyBookingsStatus } from "@/lib/types";

interface MyBookingsPageProps {
  currentUser: CurrentUserApi;
  items: BookingSummaryViewModel[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  activeStatus: MyBookingsStatus;
}

const statusOptions: Array<{ value: MyBookingsStatus; label: string }> = [
  { value: "all", label: "전체" },
  { value: "confirmed", label: "예약 확정" },
  { value: "completed", label: "이용 완료" },
  { value: "cancelled", label: "취소됨" },
];

const badgeToneByStatus: Record<string, string> = {
  confirmed: "bg-primary/10 text-primary",
  completed: "bg-chart-3/10 text-chart-3",
  cancelled: "bg-muted text-muted-foreground",
};

export function MyBookingsPage({
  currentUser,
  items,
  currentPage,
  pageSize,
  totalItems,
  activeStatus,
}: MyBookingsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasAnyBookings = totalItems > 0;

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

  function changeStatus(nextStatus: MyBookingsStatus) {
    replaceParams((params) => {
      if (nextStatus === "all") {
        params.delete("status");
      } else {
        params.set("status", nextStatus);
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
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.24em] text-primary">Booking Workspace</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {currentUser.name}님의 예약 관리 공간입니다
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              내가 예약한 이벤트를 한곳에서 확인하고, 상태별로 빠르게 나눠볼 수 있습니다.
              대시보드는 최근 활동 요약만 보여주고 전체 예약 관리는 이 화면에서 진행합니다.
            </p>
          </div>

          <Button asChild size="lg" className="h-11 rounded-xl px-5">
            <Link href="/">
              <Ticket className="h-4 w-4" />
              이벤트 둘러보기
            </Link>
          </Button>
        </div>

        <section className="rounded-[28px] border border-border/70 bg-card/95 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">예약 기준</p>
              <p className="mt-2 text-sm text-muted-foreground">
                목록은 현재 API 기준으로 최신 예약순으로 표시됩니다. 이번 슬라이스에서는 상태 필터와 페이지 이동을 우선 제공합니다.
              </p>
            </div>

            <label className="flex min-w-[180px] flex-col gap-2 text-sm text-muted-foreground">
              상태 필터
              <select
                value={activeStatus}
                onChange={(event) => changeStatus(event.target.value as MyBookingsStatus)}
                className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-primary/10 px-4 py-2 font-medium text-primary">
              총 {formatNumber(totalItems)}건
            </span>
            <span className="rounded-full bg-background px-4 py-2 text-muted-foreground">
              필터: {statusOptions.find((option) => option.value === activeStatus)?.label}
            </span>
            <span className="rounded-full bg-background px-4 py-2 text-muted-foreground">
              정렬: 최신 예약순
            </span>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="rounded-[28px] border border-dashed border-border/80 bg-card/95 p-10 text-center">
            <ReceiptText className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              {hasAnyBookings ? "선택한 상태의 예약이 없습니다" : "아직 예약한 이벤트가 없습니다"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasAnyBookings
                ? "다른 상태 필터를 선택하면 이전 예약 내역을 확인할 수 있습니다."
                : "이벤트를 예약하면 이 화면에서 일정과 상태를 한 번에 관리할 수 있습니다."}
            </p>
            <Button asChild className="mt-6 rounded-xl">
              <Link href="/">
                <Ticket className="h-4 w-4" />
                이벤트 둘러보기
              </Link>
            </Button>
          </section>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((booking) => (
                <article
                  key={booking.bookingId}
                  className="group overflow-hidden rounded-[28px] border border-border/70 bg-card/95 transition-colors hover:border-primary/40"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={booking.imageUrl} alt={booking.title} fill className="object-cover transition-transform group-hover:scale-105" />
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeToneByStatus[booking.status] ?? "bg-muted text-muted-foreground"}`}>
                        {booking.statusLabel}
                      </span>
                      <span className="text-xs text-muted-foreground">{booking.ticketCount}매 예약</span>
                    </div>

                    <div>
                      <h2 className="line-clamp-1 text-lg font-semibold text-foreground">{booking.title}</h2>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{booking.location}</p>
                    </div>

                    <div className="grid gap-2 rounded-2xl bg-background/70 p-4 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between gap-3">
                        <span>행사 일정</span>
                        <span className="font-medium text-foreground">
                          {booking.eventDateLabel} {booking.eventTimeLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>예약일</span>
                        <span className="font-medium text-foreground">{booking.bookedAtLabel}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>예약 코드</span>
                        <span className="font-medium text-foreground">{booking.bookingId}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                      상세 페이지에서 예약 코드와 행사 정보를 다시 확인할 수 있습니다.
                    </div>

                    <div className="flex gap-3">
                      <Button asChild variant="outline" className="flex-1 rounded-xl">
                        <Link href={`/reservation/${booking.eventId}`}>이벤트 보기</Link>
                      </Button>
                      <Button asChild className="flex-1 rounded-xl">
                        <Link href={`/booking/${booking.bookingId}`}>예약 상세</Link>
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
