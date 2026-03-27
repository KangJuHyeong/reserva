"use client";

import Link from "next/link";
import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, LayoutDashboard, ListChecks, LogOut, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurrentUserApi } from "@/lib/types";

interface NavbarProps {
  searchQuery: string;
  currentUser: CurrentUserApi | null;
}

export function Navbar({ searchQuery, currentUser }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  function updateSearch(query: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.delete("page");

    startTransition(() => {
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    });
  }

  function logout() {
    startLogoutTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      router.push("/");
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">R</span>
          </div>
          <span className="text-xl font-semibold text-foreground">Reserva</span>
        </Link>

        <div className="mx-8 flex max-w-md flex-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              defaultValue={searchQuery}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search events..."
              className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {isPending ? <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">...</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Link href="/my-events">
                <Button variant="outline" className="gap-2">
                  <ListChecks className="h-4 w-4" />
                  <span className="hidden sm:inline">My Events</span>
                </Button>
              </Link>
            </>
          ) : null}
          <Link href="/create">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Event</span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          {currentUser ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="gap-2 rounded-full bg-secondary px-4 text-secondary-foreground">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{currentUser.name}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} disabled={isLoggingOut} className="rounded-full border border-border">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
