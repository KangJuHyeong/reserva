"use client";

import Image from "next/image";
import { Timer, Heart, Calendar, MapPin, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/lib/types";
import { useState } from "react";

interface UpcomingCardProps {
  reservation: Reservation;
}

export function UpcomingCard({ reservation }: UpcomingCardProps) {
  const [isWatchlisted, setIsWatchlisted] = useState(reservation.isWatchlisted);

  // Calculate mock countdown - in real app this would be dynamic
  const getCountdown = () => {
    const countdowns = ["Opens in 2 hours", "Opens in 5 hours", "Opens in 1 day", "Opens in 3 hours"];
    // Use reservation id to get consistent countdown per card
    const index = parseInt(reservation.id.replace(/\D/g, "") || "0") % countdowns.length;
    return countdowns[index];
  };

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all duration-300">
      {/* Image Section */}
      <div className="relative h-48 w-full">
        <Image
          src={reservation.image}
          alt={reservation.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Countdown Badge */}
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground flex items-center gap-1.5 shadow-lg">
            <Timer className="h-3.5 w-3.5 animate-pulse" />
            {getCountdown()}
          </span>
        </div>

        {/* Watchlist Button */}
        <div className="absolute top-3 right-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsWatchlisted(!isWatchlisted)}
            className={cn(
              "h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm transition-colors",
              isWatchlisted ? "text-pink-500 hover:text-pink-400" : "text-foreground hover:text-pink-500"
            )}
          >
            <Heart className={cn("h-4 w-4", isWatchlisted && "fill-current")} />
          </Button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-block rounded-full bg-secondary/90 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground mb-2">
            {reservation.category}
          </span>
          <h3 className="text-lg font-bold text-foreground line-clamp-1">{reservation.title}</h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        {/* Host Info */}
        {reservation.host && (
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 rounded-full overflow-hidden ring-1 ring-border">
              <Image
                src={reservation.host.avatar}
                alt={reservation.host.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm text-muted-foreground">{reservation.host.name}</span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{reservation.location}</span>
        </div>

        {/* Event Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-foreground font-medium">{reservation.date}</span>
        </div>

        {/* Reservation Open Time */}
        <div className="rounded-lg bg-primary/10 p-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Reservation Opens</p>
              <p className="font-semibold text-primary">
                {reservation.reservationOpenDate} {reservation.reservationOpenTime}
              </p>
            </div>
          </div>
        </div>

        {/* Price & Slots Info */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
          <div>
            <span className="text-muted-foreground">Price: </span>
            <span className="font-bold text-foreground">${reservation.price}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Slots: </span>
            <span className="font-bold text-foreground">{reservation.totalSlots}</span>
          </div>
        </div>

        {/* Disabled Join Button */}
        <Button disabled className="w-full" variant="secondary">
          <Lock className="h-4 w-4 mr-2" />
          Opens Soon
        </Button>
      </div>
    </div>
  );
}
