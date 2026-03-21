"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, CalendarClock, ImageIcon, MapPin, Ticket, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiErrorResponse, EventCreateRequestApi, EventCreateResponseApi } from "@/lib/types";

const categoryOptions = ["Concert", "Restaurant", "Art & Design", "Sports"] as const;

const errorMessages: Record<string, string> = {
  FORBIDDEN: "Creator 권한이 필요합니다. 현재 개발용 사용자 역할 설정을 확인해 주세요.",
  UNAUTHENTICATED: "임시 인증 정보가 없습니다. 프론트 개발용 사용자 설정을 확인해 주세요.",
  INVALID_SCHEDULE: "예약 오픈 시간은 이벤트 시간보다 이전이어야 합니다.",
  VALIDATION_ERROR: "입력값을 다시 확인해 주세요.",
};

interface FormState {
  title: string;
  category: (typeof categoryOptions)[number];
  description: string;
  price: string;
  totalSlots: string;
  location: string;
  imageUrl: string;
  eventDate: string;
  eventTime: string;
  reservationOpenDate: string;
  reservationOpenTime: string;
}

const initialState: FormState = {
  title: "",
  category: "Concert",
  description: "",
  price: "",
  totalSlots: "",
  location: "",
  imageUrl: "",
  eventDate: "",
  eventTime: "",
  reservationOpenDate: "",
  reservationOpenTime: "",
};

function toIsoString(date: string, time: string) {
  return `${date}T${time}:00Z`;
}

function validateForm(form: FormState) {
  if (
    !form.title.trim() ||
    !form.description.trim() ||
    !form.location.trim() ||
    !form.imageUrl.trim() ||
    !form.eventDate ||
    !form.eventTime ||
    !form.reservationOpenDate ||
    !form.reservationOpenTime
  ) {
    return "필수 항목을 모두 입력해 주세요.";
  }

  const price = Number(form.price);
  if (!Number.isFinite(price) || price < 0) {
    return "가격은 0 이상이어야 합니다.";
  }

  const totalSlots = Number(form.totalSlots);
  if (!Number.isInteger(totalSlots) || totalSlots < 1) {
    return "총 좌석 수는 1 이상 정수여야 합니다.";
  }

  const eventDateTime = new Date(toIsoString(form.eventDate, form.eventTime));
  const reservationOpenDateTime = new Date(toIsoString(form.reservationOpenDate, form.reservationOpenTime));
  if (Number.isNaN(eventDateTime.getTime()) || Number.isNaN(reservationOpenDateTime.getTime())) {
    return "날짜와 시간을 올바르게 입력해 주세요.";
  }

  if (reservationOpenDateTime >= eventDateTime) {
    return "예약 오픈 시간은 이벤트 시간보다 이전이어야 합니다.";
  }

  return null;
}

export function CreateEventForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateForm(form);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: EventCreateRequestApi = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      location: form.location.trim(),
      eventDateTime: toIsoString(form.eventDate, form.eventTime),
      reservationOpenDateTime: toIsoString(form.reservationOpenDate, form.reservationOpenTime),
      totalSlots: Number(form.totalSlots),
      imageUrl: form.imageUrl.trim(),
    };

    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const apiError = (await response.json()) as ApiErrorResponse;
      setErrorMessage(errorMessages[apiError.code] ?? apiError.message);
      setIsSubmitting(false);
      return;
    }

    await response.json() as EventCreateResponseApi;
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(242,189,97,0.18),_transparent_30%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--secondary)))] px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Creator Studio</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">새 이벤트를 게시하세요</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                프로토타입 기준 최소 입력만으로 공개 이벤트를 생성합니다. 저장이 끝나면 홈으로 이동하며, 예약 오픈 시간은 이벤트 시작보다 이전이어야 합니다.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  이벤트 제목
                  <input
                    value={form.title}
                    onChange={(inputEvent) => setForm((current) => ({ ...current, title: inputEvent.target.value }))}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Summer Jazz Night"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  카테고리
                  <select
                    value={form.category}
                    onChange={(inputEvent) => setForm((current) => ({ ...current, category: inputEvent.target.value as FormState["category"] }))}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm font-medium text-foreground">
                이벤트 설명
                <textarea
                  value={form.description}
                  onChange={(inputEvent) => setForm((current) => ({ ...current, description: inputEvent.target.value }))}
                  className="mt-2 min-h-32 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="이벤트의 분위기, 참여 포인트, 진행 방식을 설명해 주세요."
                />
              </label>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  가격
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(inputEvent) => setForm((current) => ({ ...current, price: inputEvent.target.value }))}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="45"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  총 좌석 수
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.totalSlots}
                    onChange={(inputEvent) => setForm((current) => ({ ...current, totalSlots: inputEvent.target.value }))}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="120"
                  />
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  위치
                  <input
                    value={form.location}
                    onChange={(inputEvent) => setForm((current) => ({ ...current, location: inputEvent.target.value }))}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Blue Note Jazz Club, NYC"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  커버 이미지 URL
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(inputEvent) => setForm((current) => ({ ...current, imageUrl: inputEvent.target.value }))}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="https://example.com/image.jpg"
                  />
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-foreground">
                    이벤트 날짜
                    <input
                      type="date"
                      value={form.eventDate}
                      onChange={(inputEvent) => setForm((current) => ({ ...current, eventDate: inputEvent.target.value }))}
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-foreground">
                    이벤트 시간
                    <input
                      type="time"
                      value={form.eventTime}
                      onChange={(inputEvent) => setForm((current) => ({ ...current, eventTime: inputEvent.target.value }))}
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-foreground">
                    예약 오픈 날짜
                    <input
                      type="date"
                      value={form.reservationOpenDate}
                      onChange={(inputEvent) => setForm((current) => ({ ...current, reservationOpenDate: inputEvent.target.value }))}
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-foreground">
                    예약 오픈 시간
                    <input
                      type="time"
                      value={form.reservationOpenTime}
                      onChange={(inputEvent) => setForm((current) => ({ ...current, reservationOpenTime: inputEvent.target.value }))}
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>
              </div>

              {errorMessage ? <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</div> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-base" disabled={isSubmitting}>
                  {isSubmitting ? "이벤트 생성 중..." : "이벤트 생성"}
                </Button>
                <Button type="button" variant="outline" size="lg" className="h-12 rounded-xl px-6" onClick={() => setForm(initialState)} disabled={isSubmitting}>
                  입력 초기화
                </Button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-border/70 bg-card/90 p-6">
              <h2 className="text-lg font-semibold text-foreground">게시 전 확인</h2>
              <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <UserRoundPlus className="mt-0.5 h-4 w-4 text-primary" />
                  <p>현재 임시 인증에서 `creator` 역할이어야 저장할 수 있습니다.</p>
                </div>
                <div className="flex gap-3">
                  <CalendarClock className="mt-0.5 h-4 w-4 text-primary" />
                  <p>예약 오픈 시간은 이벤트 시작보다 반드시 빨라야 합니다.</p>
                </div>
                <div className="flex gap-3">
                  <Ticket className="mt-0.5 h-4 w-4 text-primary" />
                  <p>생성 시 재고는 자동으로 함께 만들어지고 예약 수는 0으로 시작합니다.</p>
                </div>
                <div className="flex gap-3">
                  <ImageIcon className="mt-0.5 h-4 w-4 text-primary" />
                  <p>이미지는 업로드가 아니라 URL 문자열만 저장합니다.</p>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <p>저장 후에는 홈으로 돌아가며 공개 이벤트로 바로 노출됩니다.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-dashed border-border/80 bg-background/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Current Payload</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">title</div>
                  <div className="mt-1 break-all text-foreground">{form.title || "미입력"}</div>
                </div>
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">category / totalSlots</div>
                  <div className="mt-1 text-foreground">{form.category} / {form.totalSlots || "미입력"}</div>
                </div>
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">eventDateTime</div>
                  <div className="mt-1 break-all text-foreground">{form.eventDate && form.eventTime ? toIsoString(form.eventDate, form.eventTime) : "미입력"}</div>
                </div>
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">reservationOpenDateTime</div>
                  <div className="mt-1 break-all text-foreground">
                    {form.reservationOpenDate && form.reservationOpenTime ? toIsoString(form.reservationOpenDate, form.reservationOpenTime) : "미입력"}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
