"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, Plus } from "lucide-react";
import { DeleteEventButton } from "@/components/delete-event-button";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
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

const filterOptions: Array<{ value: MyEventsFilter; label: string; description: string }> = [
  { value: "all", label: "전체", description: "내가 만든 모든 이벤트를 확인합니다." },
  { value: "editable", label: "수정 가능", description: "예약 오픈 전이라 아직 수정할 수 있는 이벤트입니다." },
  { value: "open", label: "예약 진행 중", description: "이미 예약이 열려 현재 운영 중인 이벤트입니다." },
  { value: "upcoming", label: "오픈 예정", description: "예약 오픈이 남아 있어 준비가 필요한 이벤트입니다." },
  { value: "almostFull", label: "매진 임박", description: "예약률이 높아 좌석 상황을 바로 확인해야 하는 이벤트입니다." },
];

const sortOptions: Array<{ value: MyEventsSort; label: string }> = [
  { value: "latest", label: "최신 등록순" },
  { value: "eventDate", label: "이벤트 일정순" },
  { value: "reservationOpen", label: "예약 오픈 임박순" },
  { value: "mostReserved", label: "예약 많은 순" },
];

function canEditEvent(reservationOpenDateTime: string) {
  return new Date(reservationOpenDateTime).getTime() > Date.now();
}

function isAlmostFullEvent(event: EventSummaryViewModel) {
  const reservedThreshold = Math.max(5, Math.ceil(event.totalSlots * 0.8));
  return event.reservedSlots >= reservedThreshold;
}

function getReservationProgress(event: EventSummaryViewModel) {
  if (event.totalSlots <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((event.reservedSlots / event.totalSlots) * 100));
}

function getManagementSummary(event: EventSummaryViewModel, editable: boolean, almostFull: boolean) {
  if (!editable) {
    return "예약이 이미 열려 있어 상세 정보 수정은 잠겨 있습니다. 현재 상태 확인과 공개 페이지 점검에 집중해 주세요.";
  }

  if (almostFull) {
    return "예약이 빠르게 차고 있습니다. 설명, 일정, 좌석 수를 다시 확인한 뒤 필요한 경우 오픈 전까지 수정할 수 있습니다.";
  }

  return "아직 예약 오픈 전입니다. 일정, 소개, 좌석 정책을 다시 점검하고 오픈 전에 마지막으로 정리해 두세요.";
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
  const editableCount = items.filter((event) => canEditEvent(event.reservationOpenDateTime)).length;
  const openCount = items.length - editableCount;
  const almostFullCount = items.filter((event) => isAlmostFullEvent(event)).length;
  const activeFilterMeta = filterOptions.find((option) => option.value === activeFilter) ?? filterOptions[0];
  const activeSortMeta = sortOptions.find((option) => option.value === activeSort) ?? sortOptions[0];

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
        <section className="rounded-[32px] border border-border/70 bg-card/95 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                대시보드로 돌아가기
              </Link>
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.24em] text-primary">Creator Workspace</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {currentUser.name}님의 이벤트 운영 공간입니다
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                내가 만든 이벤트의 오픈 상태, 예약 현황, 수정 가능 여부를 한눈에 확인할 수 있도록 정리한 관리 화면입니다.
                운영 중인 이벤트와 아직 준비 중인 이벤트를 나눠 보면서 다음 액션을 빠르게 결정할 수 있습니다.
              </p>
            </div>

            <Button asChild size="lg" className="h-11 rounded-xl px-5">
              <Link href="/create">
                <Plus className="h-4 w-4" />새 이벤트 만들기
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <WorkspaceStatCard label="전체 이벤트" value={`${formatNumber(totalItems)}개`} description="현재 조건 기준 총 이벤트 수" />
            <WorkspaceStatCard label="수정 가능" value={`${formatNumber(editableCount)}개`} description="예약 오픈 전이라 수정할 수 있는 항목" />
            <WorkspaceStatCard label="예약 진행 중" value={`${formatNumber(openCount)}개`} description="이미 예약이 열린 운영 중 이벤트" />
            <WorkspaceStatCard label="매진 임박" value={`${formatNumber(almostFullCount)}개`} description="잔여 좌석을 바로 확인할 이벤트" />
          </div>
        </section>

        <section className="rounded-[28px] border border-border/70 bg-card/95 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">운영 기준</p>
              <p className="mt-2 text-sm text-muted-foreground">
                현재 선택된 필터는 <span className="font-medium text-foreground">{activeFilterMeta.label}</span>입니다.
                {" "}{activeFilterMeta.description}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                정렬은 <span className="font-medium text-foreground">{activeSortMeta.label}</span> 기준으로 적용됩니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="flex min-w-[200px] flex-col gap-2 text-sm text-muted-foreground">
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

              <label className="flex min-w-[200px] flex-col gap-2 text-sm text-muted-foreground">
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
              총 {formatNumber(totalItems)}개
            </span>
            <span className="rounded-full bg-background px-4 py-2 text-muted-foreground">
              필터: {activeFilterMeta.label}
            </span>
            <span className="rounded-full bg-background px-4 py-2 text-muted-foreground">
              정렬: {activeSortMeta.label}
            </span>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="rounded-[28px] border border-dashed border-border/80 bg-card/95 p-10 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">조건에 맞는 이벤트가 없습니다</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              다른 필터나 정렬을 선택해 보거나, 새 이벤트를 만들어 creator workspace를 채워보세요.
            </p>
            <Button asChild className="mt-6 rounded-xl">
              <Link href="/create">
                <Plus className="h-4 w-4" />새 이벤트 만들기
              </Link>
            </Button>
          </section>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((event) => {
                const editable = canEditEvent(event.reservationOpenDateTime);
                const almostFull = isAlmostFullEvent(event);
                const progress = getReservationProgress(event);

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
                          <StatusBadge tone="neutral">잔여 좌석 {formatNumber(event.remainingSlots)}석</StatusBadge>
                          {editable ? <StatusBadge tone="positive">수정 가능</StatusBadge> : <StatusBadge tone="muted">예약 오픈됨</StatusBadge>}
                          {almostFull ? <StatusBadge tone="danger">매진 임박</StatusBadge> : null}
                        </div>
                      </div>

                      <div>
                        <h2 className="line-clamp-1 text-lg font-semibold text-foreground">{event.title}</h2>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{event.location}</p>
                      </div>

                      <div className="grid gap-3 rounded-2xl bg-background/70 p-4 text-sm text-muted-foreground">
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
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <span>예약 현황</span>
                            <span className="font-medium text-foreground">
                              {formatNumber(event.reservedSlots)} / {formatNumber(event.totalSlots)}
                            </span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-secondary">
                            <div
                              className="h-2 rounded-full bg-primary transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            좌석 사용률 {progress}% · 남은 좌석 {formatNumber(event.remainingSlots)}석
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">다음 운영 액션</p>
                        <p className="mt-1 leading-6">{getManagementSummary(event, editable, almostFull)}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                        <span className="text-muted-foreground">주최자</span>
                        <span className="font-medium text-foreground">{event.hostName}</span>
                      </div>

                      <div className="flex gap-3">
                        <Button asChild variant="outline" className="flex-1 rounded-xl">
                          <Link href={`/reservation/${event.id}`}>공개 페이지 보기</Link>
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

                      {editable ? <DeleteEventButton eventId={event.id} title={event.title} /> : null}
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

function WorkspaceStatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function StatusBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "neutral" | "positive" | "muted" | "danger";
}) {
  const className = {
    neutral: "bg-background text-muted-foreground",
    positive: "bg-chart-3/10 text-chart-3",
    muted: "bg-muted text-muted-foreground",
    danger: "bg-destructive/10 text-destructive",
  }[tone];

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>{children}</span>;
}
