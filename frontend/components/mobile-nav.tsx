"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarClock,
  Clock,
  Heart,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Menu,
  Music,
  Palette,
  Plus,
  Ticket,
  TrendingUp,
  Trophy,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/lib/types";

interface MobileNavProps {
  selectedCategory: Category;
}

const categories: Array<{ id: Category; label: string; icon: React.ElementType }> = [
  { id: "All", label: "전체", icon: LayoutGrid },
  { id: "Concert", label: "콘서트", icon: Music },
  { id: "Restaurant", label: "레스토랑", icon: UtensilsCrossed },
  { id: "Art & Design", label: "아트 & 디자인", icon: Palette },
  { id: "Sports", label: "스포츠", icon: Trophy },
  { id: "Other", label: "기타", icon: LayoutGrid },
  { id: "Trending", label: "인기", icon: TrendingUp },
  { id: "Ending Soon", label: "마감 임박", icon: Clock },
  { id: "Upcoming", label: "오픈 예정", icon: CalendarClock },
  { id: "Watchlist", label: "찜한 이벤트", icon: Heart },
];

export function MobileNav({ selectedCategory }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function changeCategory(category: Category) {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("view");
    } else {
      params.set("view", category);
    }
    params.delete("page");

    startTransition(() => {
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
      setIsOpen(false);
    });
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border bg-sidebar p-4">
            <div className="mb-6 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">R</span>
                </div>
                <span className="text-xl font-semibold text-sidebar-foreground">Reserva</span>
              </Link>
              <button type="button" onClick={() => setIsOpen(false)} className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mb-6 space-y-1">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">카테고리</p>
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    disabled={isPending}
                    onClick={() => changeCategory(category.id)}
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
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                <LayoutDashboard className="h-4 w-4" />
                대시보드
              </Link>
              <Link href="/my-bookings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                <Ticket className="h-4 w-4" />
                내 예약
              </Link>
              <Link href="/my-events" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                <ListChecks className="h-4 w-4" />
                내 이벤트
              </Link>
              <Link href="/create" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                <Plus className="h-4 w-4" />
                이벤트 만들기
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
