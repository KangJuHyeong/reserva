import Image from "next/image";
import { Calendar, Clock, Lock, MapPin, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventSummaryViewModel } from "@/lib/types";

interface UpcomingCardProps {
  reservation: EventSummaryViewModel;
}

export function UpcomingCard({ reservation }: UpcomingCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50">
      <div className="relative h-48 w-full">
        <Image src={reservation.imageUrl} alt={reservation.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        <div className="absolute left-3 top-3">
          <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
            <Timer className="h-3.5 w-3.5" />
            Opening Soon
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <span className="mb-2 inline-block rounded-full bg-secondary/90 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {reservation.category}
          </span>
          <h3 className="line-clamp-1 text-lg font-bold text-foreground">{reservation.title}</h3>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{reservation.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-medium text-foreground">{reservation.dateLabel}</span>
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Reservation Opens</p>
              <p className="font-semibold text-primary">{reservation.reservationOpenLabel}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
          <div>
            <span className="text-muted-foreground">Price: </span>
            <span className="font-bold text-foreground">${reservation.price}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Slots: </span>
            <span className="font-bold text-foreground">{reservation.totalSlots}</span>
          </div>
        </div>
        <Button disabled className="w-full" variant="secondary">
          <Lock className="mr-2 h-4 w-4" />
          Opens Soon
        </Button>
      </div>
    </div>
  );
}
