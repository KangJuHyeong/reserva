"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiErrorResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

interface WatchlistToggleButtonProps {
  eventId: string;
  initialIsWatchlisted: boolean;
  className?: string;
  iconClassName?: string;
  onChange?: (nextValue: boolean) => void;
  onError?: (message: string | null) => void;
}

const errorMessages: Record<string, string> = {
  UNAUTHENTICATED: "찜 기능을 사용하려면 로그인해 주세요.",
  EVENT_NOT_FOUND: "이 이벤트를 찾을 수 없습니다.",
};

export function WatchlistToggleButton({
  eventId,
  initialIsWatchlisted,
  className,
  iconClassName,
  onChange,
  onError,
}: WatchlistToggleButtonProps) {
  const [isWatchlisted, setIsWatchlisted] = useState(initialIsWatchlisted);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsWatchlisted(initialIsWatchlisted);
  }, [initialIsWatchlisted]);

  function toggleWatchlist() {
    const nextValue = !isWatchlisted;
    setIsWatchlisted(nextValue);
    onChange?.(nextValue);
    onError?.(null);

    setIsPending(true);
    void (async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/watchlist`, {
          method: nextValue ? "POST" : "DELETE",
        });

        if (response.ok) {
          return;
        }

        const payload = (await response.json().catch(() => ({ code: "UNKNOWN_ERROR", message: "찜 요청에 실패했습니다." }))) as ApiErrorResponse;
        const message = errorMessages[payload.code] ?? payload.message;
        setIsWatchlisted(!nextValue);
        onChange?.(!nextValue);
        onError?.(message);
      } catch {
        setIsWatchlisted(!nextValue);
        onChange?.(!nextValue);
        onError?.("찜 요청에 실패했습니다.");
      } finally {
        setIsPending(false);
      }
    })();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={toggleWatchlist}
      className={cn(
        "shrink-0 border transition-colors",
        isWatchlisted
          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
        className
      )}
      aria-pressed={isWatchlisted}
      aria-label={isWatchlisted ? "찜 해제" : "찜하기"}
      title={isWatchlisted ? "찜 해제" : "찜하기"}
    >
      <Heart className={cn("h-4 w-4", isWatchlisted && "fill-current", iconClassName)} />
    </Button>
  );
}
