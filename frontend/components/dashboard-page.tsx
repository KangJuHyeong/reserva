import Image from "next/image";
import Link from "next/link";
import { Children, type ReactNode } from "react";
import { ArrowRight, CalendarClock, Heart, LayoutDashboard, Plus, Ticket, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { BookingSummaryViewModel, CurrentUserApi, DashboardStatsApi, EventSummaryViewModel } from "@/lib/types";

interface DashboardPageProps {
  currentUser: CurrentUserApi;
  stats: DashboardStatsApi;
  recentBookings: BookingSummaryViewModel[];
  upcomingOpenEvents: EventSummaryViewModel[];
  watchlistPreview: EventSummaryViewModel[];
  createdEventsPreview: EventSummaryViewModel[];
}

const statCards = [
  { key: "totalBookings", label: "예약", tone: "bg-primary/10 text-primary" },
  { key: "completedBookings", label: "이용 완료", tone: "bg-accent/10 text-accent" },
  { key: "watchlistCount", label: "찜한 이벤트", tone: "bg-chart-4/10 text-chart-4" },
  { key: "upcomingOpenEvents", label: "오픈 예정", tone: "bg-chart-3/10 text-chart-3" },
  { key: "createdEvents", label: "내 이벤트", tone: "bg-secondary text-secondary-foreground" },
] as const;

export function DashboardPage({
  currentUser,
  stats,
  recentBookings,
  upcomingOpenEvents,
  watchlistPreview,
  createdEventsPreview,
}: DashboardPageProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(242,189,97,0.18),_transparent_28%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--secondary)))] px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[32px] border border-border/70 bg-card/95 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
          <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Activity Home</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {currentUser.name}님의 예약 현황과 creator 작업 흐름을 한 번에 확인하세요
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                대시보드는 개인 활동 요약 화면입니다. 최근 예약과 찜한 이벤트, 오픈 예정 이벤트를 빠르게 훑고,
                전체 예약은 내 예약으로, 내가 만든 이벤트 관리는 내 이벤트로 이동해 이어서 작업할 수 있습니다.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-11 rounded-xl px-5">
                  <Link href="/">
                    이벤트 둘러보기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 rounded-xl px-5">
                  <Link href="/my-bookings">
                    <Ticket className="h-4 w-4" />
                    내 예약 보기
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 rounded-xl px-5">
                  <Link href="/my-events">
                    <LayoutDashboard className="h-4 w-4" />
                    내 이벤트 보기
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 rounded-xl px-5">
                  <Link href="/create">
                    <Plus className="h-4 w-4" />
                    이벤트 만들기
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {statCards.map((card) => (
                <div key={card.key} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${card.tone}`}>{card.label}</div>
                  <div className="mt-4 text-3xl font-semibold text-foreground">
                    {formatNumber(stats[card.key])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-8">
            <DashboardSection
              title="최근 예약"
              description="최근 예약한 이벤트를 빠르게 확인하고 상세 화면으로 이동할 수 있습니다."
              emptyMessage="아직 예약 내역이 없습니다. 이벤트를 예약하면 이 영역에 최근 예약이 표시됩니다."
              icon={<Ticket className="h-4 w-4 text-primary" />}
            >
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <Link
                      key={booking.bookingId}
                      href={`/booking/${booking.bookingId}`}
                      className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card/90 p-4 transition-colors hover:border-primary/40"
                    >
                      <div className="relative h-20 w-24 overflow-hidden rounded-xl bg-secondary">
                        <Image src={booking.imageUrl} alt={booking.title} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="line-clamp-1 font-semibold text-foreground">{booking.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{booking.location}</p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{booking.statusLabel}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{booking.eventDateLabel} {booking.eventTimeLabel}</span>
                          <span>{booking.ticketCount}매</span>
                          <span>예약일 {booking.bookedAtLabel}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="flex justify-end">
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link href="/my-bookings">
                        전체 예약 보기
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </DashboardSection>

            <DashboardSection
              title="찜한 이벤트"
              description="다시 보고 싶은 이벤트를 모아두는 영역입니다."
              emptyMessage="찜한 이벤트가 아직 없습니다. 둘러보기에서 이벤트를 저장하면 여기에서 다시 확인할 수 있습니다."
              icon={<Heart className="h-4 w-4 text-primary" />}
            >
              {watchlistPreview.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {watchlistPreview.map((event) => (
                      <EventPreviewCard key={event.id} event={event} eyebrow="찜함" />
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link href="/?view=Watchlist">
                        전체 찜 보기
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </DashboardSection>
          </div>

          <div className="space-y-8">
            <DashboardSection
              title="오픈 예정"
              description="예약 오픈을 기다리는 이벤트를 미리 확인할 수 있습니다."
              emptyMessage="현재 오픈 대기 중인 찜한 이벤트가 없습니다."
              icon={<CalendarClock className="h-4 w-4 text-primary" />}
            >
              {upcomingOpenEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingOpenEvents.map((event) => (
                    <EventPreviewCard key={event.id} event={event} eyebrow={event.reservationOpenLabel} compact />
                  ))}
                  <div className="flex justify-end">
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link href="/?view=Upcoming">
                        전체 오픈 예정 보기
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </DashboardSection>

            <DashboardSection
              title="내 이벤트 미리보기"
              description="최근에 만든 이벤트를 빠르게 확인하고 creator workspace로 이동합니다."
              emptyMessage="이벤트를 만들면 creator workspace가 여기에서 시작됩니다."
              icon={<LayoutDashboard className="h-4 w-4 text-primary" />}
            >
              {createdEventsPreview.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {createdEventsPreview.map((event) => (
                      <EventPreviewCard key={event.id} event={event} eyebrow="게시 중" compact />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="rounded-xl">
                      <Link href="/my-events">
                        내 이벤트 열기
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link href="/create">
                        <Plus className="h-4 w-4" />
                        이벤트 만들기
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </DashboardSection>

            <section className="rounded-[28px] border border-border/70 bg-card/95 p-6">
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                <UserRound className="h-4 w-4 text-primary" />
                어디서 시작할까
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">대시보드</span>는 최근 예약과 저장한 이벤트를 한눈에 보는 요약 화면입니다.</p>
                <p><span className="font-medium text-foreground">내 예약</span>은 내가 예약한 이벤트를 상태별로 확인하는 전용 관리 화면입니다.</p>
                <p><span className="font-medium text-foreground">내 이벤트</span>는 내가 만든 이벤트를 수정하고 운영하는 creator workspace입니다.</p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardSection({
  title,
  description,
  emptyMessage,
  icon,
  children,
}: {
  title: string;
  description: string;
  emptyMessage: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const isEmpty = Children.count(children) === 0;

  return (
    <section className="rounded-[28px] border border-border/70 bg-card/95 p-6">
      <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
        {icon}
        {title}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">
        {isEmpty ? <p className="rounded-2xl border border-dashed border-border/80 bg-background/60 px-4 py-6 text-sm text-muted-foreground">{emptyMessage}</p> : children}
      </div>
    </section>
  );
}

function EventPreviewCard({
  event,
  eyebrow,
  compact = false,
}: {
  event: EventSummaryViewModel;
  eyebrow: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/reservation/${event.id}`}
      className={`group block overflow-hidden rounded-2xl border border-border/70 bg-background/70 transition-colors hover:border-primary/40 ${compact ? "p-4" : ""}`}
    >
      {compact ? null : (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image src={event.imageUrl} alt={event.title} fill className="object-cover transition-transform group-hover:scale-105" />
        </div>
      )}
      <div className={compact ? "space-y-3" : "p-4"}>
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
        <div>
          <h3 className="line-clamp-1 font-semibold text-foreground">{event.title}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{event.location}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{event.dateLabel} {event.timeLabel}</span>
          <span>남은 좌석 {event.remainingSlots}석</span>
        </div>
      </div>
    </Link>
  );
}
