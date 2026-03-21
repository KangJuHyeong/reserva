"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Settings,
  Heart,
  CalendarClock,
  Users,
  TicketCheck,
  Star,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  LogOut,
  Timer,
  Lock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { mockReservations, upcomingOpenReservations, myJoinedReservations, myCreatedReservations } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const sidebarMenuItems = [
  { id: "overview", label: "Overview", icon: Star },
  { id: "myreservations", label: "My Reservations", icon: TicketCheck },
  { id: "created", label: "Created Reservations", icon: Plus },
  { id: "watchlist", label: "Watchlist", icon: Heart },
];

const bottomMenuItems = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "logout", label: "Logout", icon: LogOut },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-accent/20 text-accent",
  completed: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  // Mock user data
  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    memberSince: "Jan 2025",
  };

  // Mock stats
  const stats = {
    totalReservations: myJoinedReservations.length,
    upcomingEvents: upcomingOpenReservations.length,
    completedEvents: myJoinedReservations.filter((r) => r.status === "completed").length,
    watchlistCount: mockReservations.filter((r) => r.isWatchlisted).length,
    createdEvents: myCreatedReservations.length,
  };

  const watchlistReservations = mockReservations.filter((r) => r.isWatchlisted);

  // Calculate countdown for upcoming reservations
  const getCountdown = (openDate: string, openTime: string) => {
    // For demo purposes, return mock countdowns
    const mockCountdowns = ["Opens in 2 hours", "Opens in 5 hours", "Opens in 1 day"];
    return mockCountdowns[Math.floor(Math.random() * mockCountdowns.length)];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex">
        {/* Dashboard Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-sidebar min-h-[calc(100vh-64px)]">
          {/* Profile Card */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-primary/20">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.id === "myreservations" && stats.totalReservations > 0 && (
                    <span className={cn(
                      "ml-auto rounded-full px-2 py-0.5 text-xs",
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent/20 text-accent"
                    )}>
                      {stats.totalReservations}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Menu */}
          <div className="p-4 border-t border-border space-y-1">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome back, {user.name.split(" ")[0]}!</h1>
                <p className="text-muted-foreground mt-1">Here's what's happening with your reservations</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveSection("myreservations")}
                  className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-accent/10 p-2.5">
                      <TicketCheck className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalReservations}</p>
                      <p className="text-sm text-muted-foreground">My Reservations</p>
                    </div>
                  </div>
                </button>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-500/10 p-2.5">
                      <TicketCheck className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.completedEvents}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSection("watchlist")}
                  className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-pink-500/10 p-2.5">
                      <Heart className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.watchlistCount}</p>
                      <p className="text-sm text-muted-foreground">Watchlist</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveSection("created")}
                  className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-500/10 p-2.5">
                      <Plus className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.createdEvents}</p>
                      <p className="text-sm text-muted-foreground">Created</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* My Reservations Preview */}
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h2 className="font-semibold text-foreground">My Reservations</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveSection("myreservations")}
                    className="text-primary hover:text-primary"
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {myJoinedReservations.slice(0, 3).map((reservation) => (
                    <div key={reservation.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className="relative h-14 w-20 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={reservation.image}
                          alt={reservation.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground truncate">{reservation.title}</h4>
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusColors[reservation.status])}>
                            {statusLabels[reservation.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {reservation.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {reservation.location}
                          </span>
                        </div>
                      </div>
                      <Link href={`/booking/${reservation.bookingId}`}>
                        <Button size="sm" variant="outline" className="border-border shrink-0">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Reservations Preview (Not Yet Open) */}
              {upcomingOpenReservations.length > 0 && (
                <div className="rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between p-5 border-b border-primary/20">
                    <div className="flex items-center gap-2">
                      <Timer className="h-5 w-5 text-primary" />
                      <h2 className="font-semibold text-foreground">Opening Soon</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSection("upcoming")}
                      className="text-primary hover:text-primary"
                    >
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="divide-y divide-primary/10">
                    {upcomingOpenReservations.slice(0, 2).map((reservation) => (
                      <div key={reservation.id} className="flex items-center gap-4 p-4 hover:bg-primary/10 transition-colors">
                        <div className="relative h-14 w-20 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={reservation.image}
                            alt={reservation.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                            <Lock className="h-4 w-4 text-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{reservation.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 text-primary">
                              <Timer className="h-3.5 w-3.5" />
                              {getCountdown(reservation.reservationOpenDate || "", reservation.reservationOpenTime || "")}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" disabled className="border-border shrink-0">
                          Opens Soon
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/create" className="block">
                  <div className="rounded-xl border border-dashed border-border bg-card p-6 hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Create New Event</h3>
                        <p className="text-sm text-muted-foreground">Host your own reservation event</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/" className="block">
                  <div className="rounded-xl border border-dashed border-border bg-card p-6 hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-accent/10 p-3">
                        <Calendar className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Browse Events</h3>
                        <p className="text-sm text-muted-foreground">Discover and join new events</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* My Reservations Section (Joined Reservations) */}
          {activeSection === "myreservations" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">My Reservations</h1>
                <p className="text-muted-foreground mt-1">Reservations you have successfully joined</p>
              </div>

              {myJoinedReservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border bg-card">
                  <div className="rounded-full bg-secondary p-4 mb-4">
                    <TicketCheck className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No reservations yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">You haven't joined any reservations</p>
                  <Link href="/">
                    <Button className="mt-4 bg-primary text-primary-foreground">Browse Events</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myJoinedReservations.map((reservation) => (
                    <div
                      key={reservation.bookingId}
                      className="flex gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                    >
                      <div className="relative h-32 w-44 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={reservation.image}
                          alt={reservation.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-2", statusColors[reservation.status])}>
                              {statusLabels[reservation.status]}
                            </span>
                            <h3 className="text-lg font-semibold text-foreground">{reservation.title}</h3>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {reservation.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {reservation.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {reservation.time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            {reservation.tickets} ticket{reservation.tickets > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <Link href={`/booking/${reservation.bookingId}`}>
                            <Button size="sm" className="bg-primary text-primary-foreground">
                              <Eye className="h-4 w-4 mr-1.5" />
                              View Detail
                            </Button>
                          </Link>
                          {reservation.status === "confirmed" && (
                            <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                              <XCircle className="h-4 w-4 mr-1.5" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Created Reservations Section */}
          {activeSection === "created" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Created Reservations</h1>
                  <p className="text-muted-foreground mt-1">Events you've created and are hosting</p>
                </div>
                <Link href="/create">
                  <Button className="bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </Link>
              </div>

              {myCreatedReservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border bg-card">
                  <div className="rounded-full bg-secondary p-4 mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No created events</h3>
                  <p className="mt-1 text-sm text-muted-foreground">You haven't created any events yet</p>
                  <Link href="/create">
                    <Button className="mt-4 bg-primary text-primary-foreground">Create Your First Event</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myCreatedReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                    >
                      <div className="relative h-32 w-44 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={reservation.image}
                          alt={reservation.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                          Host
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground">{reservation.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {reservation.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {reservation.date}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <span className="flex items-center gap-1.5 text-primary">
                            <CalendarClock className="h-4 w-4" />
                            Opens: {reservation.reservationOpenDate} {reservation.reservationOpenTime}
                          </span>
                          <span className="flex items-center gap-1.5 text-accent">
                            <Users className="h-4 w-4" />
                            {reservation.reservedSlots}/{reservation.totalSlots} joined
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden max-w-xs">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(reservation.reservedSlots / reservation.totalSlots) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {reservation.totalSlots - reservation.reservedSlots} slots left
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="border-border">
                              <Edit className="h-4 w-4 mr-1.5" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="border-border">
                              <Users className="h-4 w-4 mr-1.5" />
                              Manage Participants
                            </Button>
                            <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4 mr-1.5" />
                              Close
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Watchlist Section */}
          {activeSection === "watchlist" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1>
                <p className="text-muted-foreground mt-1">Events you've saved for later</p>
              </div>

              {watchlistReservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border bg-card">
                  <div className="rounded-full bg-secondary p-4 mb-4">
                    <Heart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">Your watchlist is empty</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Save events to your watchlist to keep track of them</p>
                  <Link href="/">
                    <Button className="mt-4 bg-primary text-primary-foreground">Browse Events</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {watchlistReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                    >
                      <div className="relative h-24 w-32 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={reservation.image}
                          alt={reservation.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-foreground truncate">{reservation.title}</h3>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full text-pink-500 shrink-0"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {reservation.date}
                          <span className="mx-1 text-border">|</span>
                          <span className="font-medium text-foreground">${reservation.price}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Link href={`/reservation/${reservation.id}`}>
                            <Button size="sm" className="bg-primary text-primary-foreground">
                              View Event
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
