import Link from "next/link";
import { EventDetailClient } from "@/components/event-detail-client";
import { Button } from "@/components/ui/button";
import { toEventDetailViewModel } from "@/lib/mappers";
import { BackendApiError } from "@/lib/server/backend";
import { fetchEventDetail } from "@/lib/server/queries";

export default async function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await fetchEventDetail(id);
    return <EventDetailClient event={toEventDetailViewModel(event)} />;
  } catch (error) {
    if (error instanceof BackendApiError && error.code === "EVENT_NOT_FOUND") {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Event Not Found</h1>
          <p className="mt-2 text-muted-foreground">The event you are looking for does not exist.</p>
          <Link href="/" className="mt-6 inline-block">
            <Button>Go Home</Button>
          </Link>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Unable to load event</h1>
        <p className="mt-2 text-muted-foreground">The frontend could not load this event from the backend.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Back to Home</Button>
        </Link>
      </main>
    );
  }
}
