"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CalendarClock,
  Clock,
  Heart,
  LayoutGrid,
  ListChecks,
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
    params.delete("page");

    startTransition(() => {
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    });
  }

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-sidebar p-4 lg:flex">
      <nav className="space-y-6">
        <div className="space-y-1">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">바로가기</p>
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
            <User className="h-4 w-4" />
            마이페이지
          </Link>
          <Link href="/my-events" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
            <ListChecks className="h-4 w-4" />
            내 이벤트
          </Link>
          <Link href="/create" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
            <Plus className="h-4 w-4" />
            이벤트 만들기
          </Link>
        </div>

        <div className="space-y-1">
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
        </div>
      </nav>
    </aside>
  );
}
