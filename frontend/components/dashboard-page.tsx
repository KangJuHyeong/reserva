import Image from "next/image";
import Link from "next/link";
import { Children, type ReactNode } from "react";
import { ArrowRight, CalendarClock, Heart, LayoutDashboard, Plus, Ticket, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingSummaryViewModel, CurrentUserApi, DashboardStatsApi, EventSummaryViewModel } from "@/lib/types";

interface DashboardPageProps {
  currentUser: CurrentUserApi;
  stats: DashboardStatsApi;
  recentBookings: BookingSummaryViewModel[];
  upcomingOpenEvents: EventSummaryViewModel[];
  watchlistPreview: EventSummaryViewModel[];
}

const statCards = [
  { key: "totalBookings", label: "Total Bookings", tone: "bg-primary/10 text-primary" },
  { key: "completedBookings", label: "Completed", tone: "bg-accent/10 text-accent" },
  { key: "watchlistCount", label: "Watchlist", tone: "bg-chart-4/10 text-chart-4" },
  { key: "upcomingOpenEvents", label: "Opening Soon", tone: "bg-chart-3/10 text-chart-3" },
  { key: "createdEvents", label: "Created Events", tone: "bg-secondary text-secondary-foreground" },
] as const;

export function DashboardPage({
  currentUser,
  stats,
  recentBookings,
  upcomingOpenEvents,
  watchlistPreview,
}: DashboardPageProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(242,189,97,0.18),_transparent_28%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--secondary)))] px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[32px] border border-border/70 bg-card/95 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
          <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {currentUser.name}, your reservation pulse is live.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                Track bookings, monitor saved events that are about to open, and move between your personal activity and your published events without losing context.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-11 rounded-xl px-5">
                  <Link href="/">
                    Browse Events
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 rounded-xl px-5">
                  <Link href="/my-events">
                    <LayoutDashboard className="h-4 w-4" />
                    My Events
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 rounded-xl px-5">
                  <Link href="/create">
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {statCards.map((card) => (
                <div key={card.key} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${card.tone}`}>{card.label}</div>
                  <div className="mt-4 text-3xl font-semibold text-foreground">
                    {stats[card.key].toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-8">
            <DashboardSection
              title="Recent Bookings"
              description="Your latest reservation activity."
              emptyMessage="No bookings yet. Reserve a spot and your booking history will appear here."
              icon={<Ticket className="h-4 w-4 text-primary" />}
            >
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
                      <span>{booking.ticketCount} tickets</span>
                      <span>Booked {booking.bookedAtLabel}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </DashboardSection>

            <DashboardSection
              title="Watchlist Preview"
              description="Saved events you may want to revisit."
              emptyMessage="Your watchlist is empty. Save events from discovery to build this section."
              icon={<Heart className="h-4 w-4 text-primary" />}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {watchlistPreview.map((event) => (
                  <EventPreviewCard key={event.id} event={event} eyebrow="Watchlist" />
                ))}
              </div>
            </DashboardSection>
          </div>

          <div className="space-y-8">
            <DashboardSection
              title="Opening Soon"
              description="Saved events whose reservation window has not opened yet."
              emptyMessage="No saved events are waiting to open right now."
              icon={<CalendarClock className="h-4 w-4 text-primary" />}
            >
              <div className="space-y-4">
                {upcomingOpenEvents.map((event) => (
                  <EventPreviewCard key={event.id} event={event} eyebrow={event.reservationOpenLabel} compact />
                ))}
              </div>
            </DashboardSection>

            <DashboardSection
              title="My Events"
              description="Keep your created events in a dedicated page separate from your personal reservations."
              emptyMessage="Create your first event to start building your lineup."
              icon={<LayoutDashboard className="h-4 w-4 text-primary" />}
            >
              <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
                <p className="text-sm text-muted-foreground">
                  My Page now focuses on bookings, watchlist activity, and summary stats. Use My Events for your full published event list.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild className="rounded-xl">
                    <Link href="/my-events">
                      Open My Events
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/create">
                      <Plus className="h-4 w-4" />
                      Create Event
                    </Link>
                  </Button>
                </div>
              </div>
            </DashboardSection>

            <section className="rounded-[28px] border border-border/70 bg-card/95 p-6">
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                <UserRound className="h-4 w-4 text-primary" />
                Quick Context
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>This dashboard is auth-aware and uses the same authenticated backend context as bookings and watchlist flows.</p>
                <p>Protected data on this page now depends on the same JWT contract used by login, current-user bootstrap, and logout.</p>
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
          <span>{event.remainingSlots} spots left</span>
        </div>
      </div>
    </Link>
  );
}
