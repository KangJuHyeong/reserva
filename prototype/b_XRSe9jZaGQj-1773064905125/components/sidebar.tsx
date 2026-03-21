"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Music,
  UtensilsCrossed,
  Palette,
  Trophy,
  TrendingUp,
  Clock,
  Heart,
  CalendarClock,
  User,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface SidebarProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const categories: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: "All", label: "All", icon: LayoutGrid },
  { id: "Concert", label: "Concert", icon: Music },
  { id: "Restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "Art & Design", label: "Art & Design", icon: Palette },
  { id: "Sports", label: "Sports", icon: Trophy },
  { id: "Trending", label: "Trending", icon: TrendingUp },
  { id: "Ending Soon", label: "Ending Soon", icon: Clock },
  { id: "Upcoming", label: "Upcoming", icon: CalendarClock },
  { id: "Watchlist", label: "Watchlist", icon: Heart },
];

const quickLinks = [
  { href: "/dashboard", label: "My Page", icon: User },
  { href: "/create", label: "Create Event", icon: Plus },
];

export function Sidebar({ selectedCategory, onCategoryChange }: SidebarProps) {
  const pathname = usePathname();
  
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar p-4">
      <nav className="space-y-6">
        <div className="space-y-1">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Links
          </p>
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </p>
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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
