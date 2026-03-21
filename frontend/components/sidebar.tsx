"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CalendarClock,
  Clock,
  Heart,
  LayoutGrid,
  Music,
  Palette,
  Plus,
  TrendingUp,
  Trophy,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/lib/types";

interface SidebarProps {
  selectedCategory: Category;
}

const categories: Array<{ id: Category; label: string; icon: React.ElementType; disabled?: boolean }> = [
  { id: "All", label: "All", icon: LayoutGrid },
  { id: "Concert", label: "Concert", icon: Music },
  { id: "Restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "Art & Design", label: "Art & Design", icon: Palette },
  { id: "Sports", label: "Sports", icon: Trophy },
  { id: "Trending", label: "Trending", icon: TrendingUp },
  { id: "Ending Soon", label: "Ending Soon", icon: Clock },
  { id: "Upcoming", label: "Upcoming", icon: CalendarClock },
  { id: "Watchlist", label: "Watchlist", icon: Heart, disabled: true },
];

export function Sidebar({ selectedCategory }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function changeCategory(category: Category) {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("view");
    } else {
      params.set("view", category);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-sidebar p-4 lg:flex">
      <nav className="space-y-6">
        <div className="space-y-1">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Links</p>
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
            <User className="h-4 w-4" />
            My Page
          </Link>
          <Link href="/create" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </div>

        <div className="space-y-1">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                disabled={category.disabled || isPending}
                onClick={() => changeCategory(category.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  category.disabled && "cursor-not-allowed opacity-50",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {category.label}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
