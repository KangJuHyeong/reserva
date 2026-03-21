"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Music,
  UtensilsCrossed,
  Palette,
  Trophy,
  TrendingUp,
  Clock,
  Heart,
  Menu,
  X,
  User,
  Plus,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface MobileNavProps {
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

const navLinks = [
  { href: "/dashboard", label: "My Page", icon: User },
  { href: "/create", label: "Create Event", icon: Plus },
];

export function MobileNav({ selectedCategory, onCategoryChange }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border p-4">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">R</span>
                </div>
                <span className="text-xl font-semibold text-sidebar-foreground">Reserva</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1 mb-6">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </p>
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      onCategoryChange(category.id);
                      setIsOpen(false);
                    }}
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
            </nav>

            <div className="border-t border-sidebar-border pt-4">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Links
              </p>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
