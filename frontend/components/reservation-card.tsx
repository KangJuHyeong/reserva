import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WatchlistToggleButton } from "@/components/watchlist-toggle-button";
import { EventSummaryViewModel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReservationCardProps {
  reservation: EventSummaryViewModel;
  onWatchlistChange?: (nextValue: boolean) => void;
}

const categoryColors: Record<string, string> = {
  Concert: "bg-primary/20 text-primary",
  Restaurant: "bg-accent/20 text-accent",
  "Art & Design": "bg-chart-4/20 text-chart-4",
  Sports: "bg-chart-3/20 text-chart-3",
};

export function ReservationCard({ reservation, onWatchlistChange }: ReservationCardProps) {
  const progress = (reservation.reservedSlots / reservation.totalSlots) * 100;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <Link href={`/reservation/${reservation.id}`}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image src={reservation.imageUrl} alt={reservation.title} fill className="object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

          <div className="absolute left-3 top-3 flex gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", categoryColors[reservation.category] ?? "bg-secondary text-secondary-foreground")}>
              {reservation.category}
            </span>
          </div>

          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground">
              ${reservation.price}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/reservation/${reservation.id}`}>
          <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">{reservation.title}</h3>
        </Link>

        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{reservation.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{reservation.dateLabel} {reservation.timeLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{reservation.reservedSlots}/{reservation.totalSlots} participants</span>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{reservation.remainingSlots} spots left</span>
            <span>{Math.round(progress)}% filled</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progress >= 90 ? "bg-destructive" : progress >= 70 ? "bg-chart-3" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link href={`/reservation/${reservation.id}`} className="flex-1">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Reserve My Spot</Button>
          </Link>
          <WatchlistToggleButton eventId={reservation.id} initialIsWatchlisted={reservation.isWatchlisted} onChange={onWatchlistChange} />
        </div>
      </div>
    </div>
  );
}
