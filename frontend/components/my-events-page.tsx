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
              Back to Dashboard
            </Link>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.24em] text-primary">Creator Workspace</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {currentUser.name}, your published events live here.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              This page keeps your created events separate from your booking summary. Open an event to review its public page, and use Create Event when you are ready to publish another one.
            </p>
          </div>

          <Button asChild size="lg" className="h-11 rounded-xl px-5">
            <Link href="/create">
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>

        <section className="rounded-[28px] border border-border/70 bg-card/95 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Workspace Notes</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Dashboard is for summary and personal activity. This page is for the events you published.
              </p>
            </div>
            <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              {totalItems.toLocaleString()} published events
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="rounded-[28px] border border-dashed border-border/80 bg-card/95 p-10 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">No published events yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Once you create and publish an event, it will appear in this creator workspace.
            </p>
            <Button asChild className="mt-6 rounded-xl">
              <Link href="/create">
                <Plus className="h-4 w-4" />
                Publish your first event
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
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{event.category}</span>
                      <span className="text-xs text-muted-foreground">{event.remainingSlots} spots left</span>
                    </div>
                    <div>
                      <h2 className="line-clamp-1 text-lg font-semibold text-foreground">{event.title}</h2>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{event.location}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{event.dateLabel} {event.timeLabel}</span>
                      <span>Open {event.reservationOpenLabel}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                      <span className="text-muted-foreground">Host</span>
                      <span className="font-medium text-foreground">{event.hostName}</span>
                    </div>
                    <div className="flex gap-3">
                      <Button asChild variant="outline" className="flex-1 rounded-xl">
                        <Link href={`/reservation/${event.id}`}>View Event</Link>
                      </Button>
                      <Button asChild className="flex-1 rounded-xl">
                        <Link href={`/my-events/${event.id}/edit`}>Edit Event</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {totalPages > 1 ? (
              <section className="flex items-center justify-between rounded-[24px] border border-border/70 bg-card/95 px-5 py-4">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={currentPage <= 1}
                    onClick={() => changePage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={currentPage >= totalPages}
                    onClick={() => changePage(currentPage + 1)}
                  >
                    Next
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
