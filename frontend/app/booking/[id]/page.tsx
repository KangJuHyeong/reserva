import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Hash, MapPin, User, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toBookingDetailViewModel } from "@/lib/mappers";
import { BackendApiError } from "@/lib/server/backend";
import { fetchBookingDetail } from "@/lib/server/queries";

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  confirmed: {
    color: "text-accent",
    bgColor: "bg-accent/10",
    label: "Confirmed",
  },
  completed: {
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "Completed",
  },
  cancelled: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Cancelled",
  },
};

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const booking = toBookingDetailViewModel(await fetchBookingDetail(id));
    const status = statusConfig[booking.status] ?? statusConfig.confirmed;

    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-4xl px-6 py-8">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Reservation Confirmation</h1>
              <p className="mt-1 text-muted-foreground">Booking details and payment summary</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className={`rounded-xl p-4 ${status.bgColor}`}>
                <h2 className={`text-lg font-semibold ${status.color}`}>{status.label}</h2>
                <p className="text-sm text-muted-foreground">Your reservation is stored as a booking record.</p>
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative h-56 w-full">
                  <Image src={booking.imageUrl} alt={booking.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      {booking.category}
                    </span>
                    <h3 className="text-xl font-bold text-foreground">{booking.title}</h3>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Location</p>
                        <p className="text-sm font-medium text-foreground">{booking.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Event Date</p>
                        <p className="text-sm font-medium text-foreground">{booking.eventDateLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Event Time</p>
                        <p className="text-sm font-medium text-foreground">{booking.eventTimeLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Reservation Opened</p>
                        <p className="text-sm font-medium text-foreground">{booking.reservationOpenLabel}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">Hosted by</p>
                    <p className="text-sm font-medium text-foreground">{booking.hostName}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="mb-3 font-semibold text-foreground">About this event</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{booking.description}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                  <Hash className="h-4 w-4 text-primary" />
                  Booking Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border py-3">
                    <span className="text-sm text-muted-foreground">Booking ID</span>
                    <span className="text-sm font-mono font-medium text-foreground">{booking.bookingId}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border py-3">
                    <span className="text-sm text-muted-foreground">Booked At</span>
                    <span className="text-sm font-medium text-foreground">{booking.bookedAtLabel}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  Participant Details
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border py-3">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="text-sm font-medium text-foreground">{booking.participantName}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">Tickets</span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {booking.ticketCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                <h4 className="mb-4 font-semibold text-foreground">Payment Summary</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price per ticket</span>
                    <span className="text-foreground">${booking.unitPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="text-foreground">x {booking.ticketCount}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-primary/20 pt-3">
                    <span className="font-medium text-foreground">Total Amount</span>
                    <span className="text-xl font-bold text-primary">${booking.totalAmount}</span>
                  </div>
                </div>
              </div>

              {booking.status === "confirmed" ? (
                <Button variant="outline" className="w-full cursor-not-allowed border-destructive text-destructive hover:bg-destructive/10" disabled>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Reservation
                </Button>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    if (error instanceof BackendApiError && error.code === "BOOKING_NOT_FOUND") {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Booking Not Found</h1>
          <p className="mt-2 text-muted-foreground">The booking you are looking for does not exist for the current user.</p>
          <Link href="/" className="mt-6 inline-block">
            <Button>Back to Home</Button>
          </Link>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Unable to load booking</h1>
        <p className="mt-2 text-muted-foreground">The frontend could not load this booking from the backend.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Back to Home</Button>
        </Link>
      </main>
    );
  }
}
