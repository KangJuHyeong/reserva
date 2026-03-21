"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Hash,
  CheckCircle,
  XCircle,
  Users,
  CalendarClock,
  Printer,
  Share2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { myJoinedReservations } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof CheckCircle; label: string }> = {
  confirmed: {
    color: "text-accent",
    bgColor: "bg-accent/10",
    icon: CheckCircle,
    label: "Confirmed",
  },
  completed: {
    color: "text-primary",
    bgColor: "bg-primary/10",
    icon: CheckCircle,
    label: "Completed",
  },
  cancelled: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: XCircle,
    label: "Cancelled",
  },
};

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // Find the booking by ID
  const booking = myJoinedReservations.find((r) => r.bookingId === id);

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery="" onSearchChange={() => {}} />
        <main className="flex flex-col items-center justify-center py-20 px-6">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <Hash className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Booking Not Found</h1>
          <p className="text-muted-foreground mb-6">The booking you're looking for doesn't exist.</p>
          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Page
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const status = statusConfig[booking.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery="" onSearchChange={() => {}} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Reservations</span>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reservation Confirmation</h1>
            <p className="text-muted-foreground mt-1">Booking details and information</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-border">
              <Printer className="h-4 w-4 mr-1.5" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="border-border">
              <Download className="h-4 w-4 mr-1.5" />
              Download
            </Button>
            <Button variant="outline" size="sm" className="border-border">
              <Share2 className="h-4 w-4 mr-1.5" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            <div className={cn("rounded-xl p-4 flex items-center gap-4", status.bgColor)}>
              <div className={cn("rounded-full p-2", status.bgColor)}>
                <StatusIcon className={cn("h-6 w-6", status.color)} />
              </div>
              <div>
                <h2 className={cn("font-semibold text-lg", status.color)}>{status.label}</h2>
                <p className="text-sm text-muted-foreground">Your reservation has been {booking.status}</p>
              </div>
            </div>

            {/* Event Image & Title */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="relative h-56 w-full">
                <Image
                  src={booking.image}
                  alt={booking.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground mb-2">
                    {booking.category}
                  </span>
                  <h3 className="text-xl font-bold text-foreground">{booking.title}</h3>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-secondary p-2">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
                      <p className="text-sm font-medium text-foreground">{booking.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-secondary p-2">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Event Date</p>
                      <p className="text-sm font-medium text-foreground">{booking.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-secondary p-2">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Event Time</p>
                      <p className="text-sm font-medium text-foreground">{booking.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-secondary p-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Reservation Opened</p>
                      <p className="text-sm font-medium text-foreground">{booking.reservationOpenDate} {booking.reservationOpenTime}</p>
                    </div>
                  </div>
                </div>

                {/* Host Info */}
                {booking.host && (
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                      <Image
                        src={booking.host.avatar}
                        alt={booking.host.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hosted by</p>
                      <p className="text-sm font-medium text-foreground">{booking.host.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {booking.description && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="font-semibold text-foreground mb-3">About this event</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{booking.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Info */}
          <div className="space-y-6">
            {/* Booking Information Card */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                Booking Information
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Booking ID</span>
                  <span className="text-sm font-mono font-medium text-foreground">{booking.bookingId}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Booking Date</span>
                  <span className="text-sm font-medium text-foreground">{booking.bookingDate}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={cn("text-sm font-medium flex items-center gap-1.5", status.color)}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Participant Info Card */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Participant Details
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm font-medium text-foreground">{booking.participantName}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Tickets</span>
                  <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {booking.tickets} ticket{booking.tickets > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Summary Card */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <h4 className="font-semibold text-foreground mb-4">Payment Summary</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price per ticket</span>
                  <span className="text-foreground">${booking.price}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="text-foreground">x {booking.tickets}</span>
                </div>
                <div className="pt-3 border-t border-primary/20 flex items-center justify-between">
                  <span className="font-medium text-foreground">Total Amount</span>
                  <span className="text-xl font-bold text-primary">${booking.price * booking.tickets}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {booking.status === "confirmed" && (
                <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Reservation
                </Button>
              )}
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full border-border">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to My Reservations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
