"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CalendarClock, Clock, Heart, MapPin, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiErrorResponse, BookingCreateResponseApi, EventDetailViewModel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventDetailClientProps {
  event: EventDetailViewModel;
}

const categoryColors: Record<string, string> = {
  Concert: "bg-primary/20 text-primary",
  Restaurant: "bg-accent/20 text-accent",
  "Art & Design": "bg-chart-4/20 text-chart-4",
  Sports: "bg-chart-3/20 text-chart-3",
};

const errorMessages: Record<string, string> = {
  UNAUTHENTICATED: "Temporary authentication is missing. Check the frontend development user settings.",
  EVENT_SOLD_OUT: "This event no longer has enough remaining slots.",
  ALREADY_BOOKED: "You already have an active booking for this event.",
  VALIDATION_ERROR: "This reservation request is invalid right now.",
};

export function EventDetailClient({ event }: EventDetailClientProps) {
  const router = useRouter();
  const [ticketCount, setTicketCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const progress = (event.reservedSlots / event.totalSlots) * 100;

  async function handleReserve() {
    if (!Number.isInteger(ticketCount) || ticketCount < 1) {
      setErrorMessage("Ticket count must be at least 1.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const response = await fetch(`/api/events/${event.id}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ticketCount }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as ApiErrorResponse;
      setErrorMessage(errorMessages[payload.code] ?? payload.message);
      setIsSubmitting(false);
      return;
    }

    const payload = (await response.json()) as BookingCreateResponseApi;
    router.push(`/booking/${payload.bookingId}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Events</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="cursor-not-allowed border border-border" disabled title="Watchlist is not available yet.">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="border border-border">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
              <div className="absolute left-4 top-4">
                <span className={cn("rounded-full px-3 py-1.5 text-sm font-medium", categoryColors[event.category] ?? "bg-secondary text-secondary-foreground")}>
                  {event.category}
                </span>
              </div>
            </div>

            <div>
              <h1 className="mb-4 text-3xl font-bold text-foreground">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{event.eventDateLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{event.eventTimeLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-secondary">
                {event.hostAvatarUrl ? <Image src={event.hostAvatarUrl} alt={event.hostName} fill className="object-cover" /> : null}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hosted by</p>
                <p className="font-semibold text-foreground">{event.hostName}</p>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-foreground">About this event</h2>
              <p className="leading-relaxed text-muted-foreground">{event.description}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <div className="mb-1 text-3xl font-bold text-foreground">
                ${event.price}
                <span className="text-base font-normal text-muted-foreground"> / person</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <span>Participants</span>
                  </div>
                  <span className="font-semibold text-foreground">{event.reservedSlots}/{event.totalSlots}</span>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className={cn("font-medium", event.remainingSlots <= 5 ? "text-destructive" : "text-muted-foreground")}>
                      {event.remainingSlots} spots remaining
                    </span>
                    <span className="text-muted-foreground">{Math.round(progress)}% filled</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        progress >= 90 ? "bg-destructive" : progress >= 70 ? "bg-chart-3" : "bg-primary"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <label className="block text-sm text-muted-foreground">
                  Ticket Count
                  <input
                    type="number"
                    min={1}
                    value={ticketCount}
                    onChange={(inputEvent) => {
                      const nextValue = Number(inputEvent.target.value);
                      setTicketCount(Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1);
                    }}
                    className="mt-2 h-11 w-full rounded-lg border border-border bg-input px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>

                {errorMessage ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</div> : null}

                <Button
                  className="h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90"
                  onClick={handleReserve}
                  disabled={isSubmitting || event.remainingSlots === 0}
                >
                  {isSubmitting ? "Reserving..." : event.remainingSlots === 0 ? "Sold Out" : "Reserve My Spot"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">Direct booking flow only. Watchlist and advanced auth are not connected yet.</p>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Reservation Opens</span>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-primary">{event.reservationOpenDateLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-primary">{event.reservationOpenTimeLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
