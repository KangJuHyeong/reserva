"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Users, Heart, Share2, Clock, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockReservations } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  Concert: "bg-primary/20 text-primary",
  Restaurant: "bg-accent/20 text-accent",
  "Art & Design": "bg-chart-4/20 text-chart-4",
  Sports: "bg-chart-3/20 text-chart-3",
};

export default function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const reservation = mockReservations.find((r) => r.id === id);
  const [isWatchlisted, setIsWatchlisted] = useState(reservation?.isWatchlisted ?? false);
  const [isJoining, setIsJoining] = useState(false);

  if (!reservation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Reservation Not Found</h1>
          <p className="text-muted-foreground mb-4">The reservation you are looking for does not exist.</p>
          <Link href="/">
            <Button className="bg-primary text-primary-foreground">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = (reservation.reservedSlots / reservation.totalSlots) * 100;
  const remainingSlots = reservation.totalSlots - reservation.reservedSlots;

  const handleJoin = async () => {
    setIsJoining(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsJoining(false);
    alert("Successfully reserved your spot!");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Events</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="border border-border"
              onClick={() => setIsWatchlisted(!isWatchlisted)}
            >
              <Heart className={cn("h-5 w-5", isWatchlisted && "fill-destructive text-destructive")} />
            </Button>
            <Button variant="ghost" size="icon" className="border border-border">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={reservation.image}
                alt={reservation.title}
                fill
                className="object-cover"
              />
              <div className="absolute left-4 top-4">
                <span className={cn("rounded-full px-3 py-1.5 text-sm font-medium", categoryColors[reservation.category])}>
                  {reservation.category}
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{reservation.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{reservation.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{reservation.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{reservation.time}</span>
                </div>
              </div>
            </div>

            {reservation.host && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={reservation.host.avatar}
                    alt={reservation.host.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hosted by</p>
                  <p className="font-semibold text-foreground">{reservation.host.name}</p>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">About this event</h2>
              <p className="text-muted-foreground leading-relaxed">
                {reservation.description}
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Join us for an unforgettable experience. This event brings together enthusiasts from all over to share in a unique and memorable occasion. Whether you are a seasoned participant or joining for the first time, there is something special waiting for you.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">What to expect</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Premium seating arrangements with excellent views
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Complimentary refreshments included
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Exclusive meet and greet opportunities
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Professional photography services available
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <div className="text-3xl font-bold text-foreground mb-1">
                ${reservation.price}
                <span className="text-base font-normal text-muted-foreground"> / person</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <span>Participants</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {reservation.reservedSlots}/{reservation.totalSlots}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className={cn(
                      "font-medium",
                      remainingSlots <= 5 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {remainingSlots} spots remaining
                    </span>
                    <span className="text-muted-foreground">{Math.round(progress)}% filled</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        progress >= 90 ? "bg-destructive" : progress >= 70 ? "bg-chart-3" : "bg-primary"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <Button
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base"
                  onClick={handleJoin}
                  disabled={isJoining || remainingSlots === 0}
                >
                  {isJoining ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Reserving...
                    </span>
                  ) : remainingSlots === 0 ? (
                    "Sold Out"
                  ) : (
                    "Reserve My Spot"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Free cancellation up to 24 hours before the event
                </p>
              </div>

              {/* Reservation Open Time Info */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Reservation Opens</span>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-primary">Mar 10, 2026</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-primary">10:00 AM</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Event Details</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Event Date</span>
                  <span className="text-foreground">{reservation.date}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Event Time</span>
                  <span className="text-foreground">{reservation.time}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Location</span>
                  <span className="text-foreground text-right max-w-[180px]">{reservation.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
