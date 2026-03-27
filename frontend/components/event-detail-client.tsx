"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CalendarClock, Clock, MapPin, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WatchlistToggleButton } from "@/components/watchlist-toggle-button";
import { ApiErrorResponse, BookingCreateResponseApi, EventDetailViewModel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventDetailClientProps {
  event: EventDetailViewModel;
}

const categoryColors: Record<string, string> = {
  Concert: "bg-primary/20 text-primary",
  Restaurant: "bg-accent/20 text-accent",
  "Art & Design": "bg-chart-4/20 text-chart-4",
  Other: "bg-muted text-foreground",
  Sports: "bg-chart-3/20 text-chart-3",
};

const categoryLabels: Record<string, string> = {
  Concert: "콘서트",
  Restaurant: "레스토랑",
  "Art & Design": "아트 & 디자인",
  Other: "기타",
  Sports: "스포츠",
};

const errorMessages: Record<string, string> = {
  UNAUTHENTICATED: "이 이벤트를 예약하려면 먼저 로그인해 주세요.",
  EVENT_SOLD_OUT: "이 이벤트는 남은 좌석이 부족합니다.",
  ALREADY_BOOKED: "이미 이 이벤트에 예약한 내역이 있습니다.",
  BOOKING_QUANTITY_LIMIT_EXCEEDED: "선택한 수량이 예약 제한을 초과했습니다.",
  VALIDATION_ERROR: "현재 이 예약 요청은 유효하지 않습니다.",
};

export function EventDetailClient({ event }: EventDetailClientProps) {
  const router = useRouter();
  const [ticketCount, setTicketCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(event.isWatchlisted);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [watchlistMessage, setWatchlistMessage] = useState<string | null>(null);
  const progress = (event.reservedSlots / event.totalSlots) * 100;
  const maxSelectableTickets = Math.min(event.maxTicketsPerBooking, event.remainingSlots);
  const isSoldOut = event.remainingSlots === 0;

  useEffect(() => {
    setIsWatchlisted(event.isWatchlisted);
  }, [event.isWatchlisted]);

  async function handleReserve() {
    if (!Number.isInteger(ticketCount) || ticketCount < 1) {
      setErrorMessage("예약 수량은 최소 1장이어야 합니다.");
      return;
    }

    if (ticketCount > maxSelectableTickets) {
      setErrorMessage(`이번 예약에서는 최대 ${maxSelectableTickets}장까지 선택할 수 있습니다.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const response = await fetch(`/api/events/${event.id}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ticketCount }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as ApiErrorResponse;
      setErrorMessage(errorMessages[payload.code] ?? payload.message);
      setIsSubmitting(false);
      return;
    }

    const payload = (await response.json()) as BookingCreateResponseApi;
    router.push(`/booking/${payload.bookingId}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span>이벤트 목록으로 돌아가기</span>
          </Link>
          <div className="flex items-center gap-2">
            <WatchlistToggleButton
              eventId={event.id}
              initialIsWatchlisted={isWatchlisted}
              className="h-10 w-10"
              iconClassName="h-5 w-5"
              onChange={setIsWatchlisted}
              onError={setWatchlistMessage}
            />
            <Button variant="ghost" size="icon" className="border border-border">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
              <div className="absolute left-4 top-4">
                <span className={cn("rounded-full px-3 py-1.5 text-sm font-medium", categoryColors[event.category] ?? "bg-secondary text-secondary-foreground")}>
                  {categoryLabels[event.category] ?? event.category}
                </span>
              </div>
            </div>

            <div>
              <h1 className="mb-4 text-3xl font-bold text-foreground">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{event.eventDateLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{event.eventTimeLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-secondary">
                {event.hostAvatarUrl ? <Image src={event.hostAvatarUrl} alt={event.hostName} fill className="object-cover" /> : null}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">주최자</p>
                <p className="font-semibold text-foreground">{event.hostName}</p>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-foreground">이벤트 소개</h2>
              <p className="leading-relaxed text-muted-foreground">{event.description}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <div className="mb-1 text-3xl font-bold text-foreground">
                  ${event.price}
                  <span className="text-base font-normal text-muted-foreground"> / 1인</span>
                </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <span>참여 인원</span>
                  </div>
                  <span className="font-semibold text-foreground">{event.reservedSlots}/{event.totalSlots}</span>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className={cn("font-medium", event.remainingSlots <= 5 ? "text-destructive" : "text-muted-foreground")}>
                      남은 좌석 {event.remainingSlots}석
                    </span>
                    <span className="text-muted-foreground">{Math.round(progress)}% 예약됨</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        progress >= 90 ? "bg-destructive" : progress >= 70 ? "bg-chart-3" : "bg-primary"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <label className="block text-sm text-muted-foreground">
                  예약 수량
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, maxSelectableTickets)}
                    value={ticketCount}
                    onChange={(inputEvent) => {
                      const nextValue = Number(inputEvent.target.value);
                      if (!Number.isFinite(nextValue) || nextValue < 1) {
                        setTicketCount(1);
                        return;
                      }

                      setTicketCount(Math.min(Math.floor(nextValue), Math.max(1, maxSelectableTickets)));
                    }}
                    disabled={isSoldOut}
                    className="mt-2 h-11 w-full rounded-lg border border-border bg-input px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    1회 예약당 최대 {event.maxTicketsPerBooking}장까지 가능합니다. 현재 남은 좌석은 {event.remainingSlots}석입니다.
                  </p>
                </label>

                {errorMessage ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</div> : null}
                {watchlistMessage ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{watchlistMessage}</div> : null}

                <Button
                  className="h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90"
                  onClick={handleReserve}
                  disabled={isSubmitting || isSoldOut}
                >
                  {isSubmitting ? "예약 중..." : event.remainingSlots === 0 ? "매진" : "예약하기"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {isWatchlisted ? "찜한 이벤트에 저장되었습니다." : "하트를 눌러 나중에 볼 이벤트로 저장하세요."}
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">예약 오픈</span>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-muted-foreground">날짜</span>
                    <span className="font-medium text-primary">{event.reservationOpenDateLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">시간</span>
                    <span className="font-medium text-primary">{event.reservationOpenTimeLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
