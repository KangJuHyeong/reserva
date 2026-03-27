"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, CalendarClock, ImageIcon, MapPin, Ticket, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiErrorResponse, EventCreateRequestApi, EventCreateResponseApi } from "@/lib/types";

const categoryOptions = ["Concert", "Restaurant", "Art & Design", "Sports", "Other"] as const;
const categoryLabels: Record<(typeof categoryOptions)[number], string> = {
  Concert: "콘서트",
  Restaurant: "레스토랑",
  "Art & Design": "아트 & 디자인",
  Sports: "스포츠",
  Other: "기타",
};

const errorMessages: Record<string, string> = {
  FORBIDDEN: "이벤트를 생성하거나 수정할 권한이 없습니다. 현재 로그인 상태를 다시 확인해 주세요.",
  UNAUTHENTICATED: "인증 정보가 없습니다. 로그인 후 다시 시도해 주세요.",
  INVALID_SCHEDULE: "예약 오픈 시각은 이벤트 시작 시각보다 이전이어야 합니다.",
  VALIDATION_ERROR: "입력값을 다시 확인해 주세요.",
};

interface FormState {
  title: string;
  category: (typeof categoryOptions)[number];
  description: string;
  price: string;
  totalSlots: string;
  maxTicketsPerBooking: string;
  location: string;
  imageUrl: string;
  eventDate: string;
  eventTime: string;
  reservationOpenDate: string;
  reservationOpenTime: string;
  reservedSlots?: number;
}

interface CreateEventFormProps {
  mode?: "create" | "edit";
  eventId?: string;
  initialValues?: FormState;
}

const initialState: FormState = {
  title: "",
  category: "Concert",
  description: "",
  price: "",
  totalSlots: "",
  maxTicketsPerBooking: "",
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
    return "총 좌석 수는 1 이상의 정수여야 합니다.";
  }

  const maxTicketsPerBooking = Number(form.maxTicketsPerBooking);
  if (!Number.isInteger(maxTicketsPerBooking) || maxTicketsPerBooking < 1) {
    return "1회 예약 최대 수량은 1 이상의 정수여야 합니다.";
  }

  if (maxTicketsPerBooking > totalSlots) {
    return "1회 예약 최대 수량은 총 좌석 수를 초과할 수 없습니다.";
  }

  if (form.reservedSlots != null && totalSlots < form.reservedSlots) {
    return `총 좌석 수는 현재 예약된 수량(${form.reservedSlots})보다 작을 수 없습니다.`;
  }

  const eventDateTime = new Date(toIsoString(form.eventDate, form.eventTime));
  const reservationOpenDateTime = new Date(toIsoString(form.reservationOpenDate, form.reservationOpenTime));
  if (Number.isNaN(eventDateTime.getTime()) || Number.isNaN(reservationOpenDateTime.getTime())) {
    return "날짜와 시간을 올바르게 입력해 주세요.";
  }

  if (reservationOpenDateTime >= eventDateTime) {
    return "예약 오픈 시각은 이벤트 시작 시각보다 이전이어야 합니다.";
  }

  return null;
}

export function CreateEventForm({
  mode = "create",
  eventId,
  initialValues,
}: CreateEventFormProps = {}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialValues ?? initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSlotsNumber = Number(form.totalSlots);
  const maxTicketsPerBookingNumber = Number(form.maxTicketsPerBooking);
  const reservedSlots = form.reservedSlots ?? 0;

  const capacitySummary = useMemo(() => {
    if (!Number.isInteger(totalSlotsNumber) || totalSlotsNumber < 1) {
      return "총 좌석 수를 입력하면 현재 정원 설정을 요약해 드립니다.";
    }

    const remaining = Math.max(totalSlotsNumber - reservedSlots, 0);
    const perBookingText =
      Number.isInteger(maxTicketsPerBookingNumber) && maxTicketsPerBookingNumber > 0
        ? `한 번 예약할 때 최대 ${maxTicketsPerBookingNumber}장까지 받을 수 있습니다.`
        : "1회 예약 최대 수량을 입력하면 예약 제한을 함께 안내합니다.";

    if (mode === "edit") {
      return `현재 예약된 수량은 ${reservedSlots}장이고, 수정 후 남는 좌석은 ${remaining}석입니다. ${perBookingText}`;
    }

    return `현재 설정 기준 전체 정원은 ${totalSlotsNumber}석입니다. ${perBookingText}`;
  }, [maxTicketsPerBookingNumber, mode, reservedSlots, totalSlotsNumber]);

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
      maxTicketsPerBooking: Number(form.maxTicketsPerBooking),
      imageUrl: form.imageUrl.trim(),
    };

    const response = await fetch(mode === "edit" && eventId ? `/api/events/${eventId}` : "/api/events", {
      method: mode === "edit" ? "PATCH" : "POST",
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
    router.push(mode === "edit" ? "/my-events" : "/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(242,189,97,0.18),_transparent_30%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--secondary)))] px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href={mode === "edit" ? "/my-events" : "/"}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {mode === "edit" ? "내 이벤트로 돌아가기" : "홈으로 돌아가기"}
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
                {mode === "edit" ? "이벤트 수정" : "이벤트 생성"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {mode === "edit" ? "이벤트 정보를 수정해 주세요" : "새 이벤트를 등록해 보세요"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {mode === "edit"
                  ? "이미 공개한 이벤트의 핵심 정보와 예약 조건을 여기서 조정할 수 있습니다. 정원을 줄일 때는 이미 예약된 수량보다 작아질 수 없다는 점을 확인해 주세요."
                  : "제목, 일정, 위치, 정원만 정확히 입력해도 바로 공개 가능한 이벤트를 만들 수 있습니다. 예약 오픈 시각은 이벤트 시작보다 이전이어야 합니다."}
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
                    placeholder="한강 재즈 나이트"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  카테고리
                  <select
                    value={form.category}
                    onChange={(inputEvent) =>
                      setForm((current) => ({ ...current, category: inputEvent.target.value as FormState["category"] }))
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {categoryLabels[option]}
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
                  placeholder="이벤트 분위기, 참가 대상, 진행 방식, 현장 안내를 적어 주세요."
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

                <label className="block text-sm font-medium text-foreground">
                  1회 예약 최대 수량
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.maxTicketsPerBooking}
                    onChange={(inputEvent) =>
                      setForm((current) => ({ ...current, maxTicketsPerBooking: inputEvent.target.value }))
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="4"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">정원 설정 안내</p>
                <p className="mt-2 leading-6">{capacitySummary}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  위치
                  <input
                    value={form.location}
                    onChange={(inputEvent) => setForm((current) => ({ ...current, location: inputEvent.target.value }))}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="성수 재즈 클럽"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  커버 이미지 URL
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(inputEvent) => setForm((current) => ({ ...current, imageUrl: inputEvent.target.value }))}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="https://example.com/event-cover.jpg"
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
                      onChange={(inputEvent) =>
                        setForm((current) => ({ ...current, reservationOpenDate: inputEvent.target.value }))
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-foreground">
                    예약 오픈 시간
                    <input
                      type="time"
                      value={form.reservationOpenTime}
                      onChange={(inputEvent) =>
                        setForm((current) => ({ ...current, reservationOpenTime: inputEvent.target.value }))
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-base" disabled={isSubmitting}>
                  {isSubmitting
                    ? mode === "edit"
                      ? "이벤트 수정 중..."
                      : "이벤트 생성 중..."
                    : mode === "edit"
                      ? "변경사항 저장"
                      : "이벤트 생성"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl px-6"
                  onClick={() => setForm(initialValues ?? initialState)}
                  disabled={isSubmitting}
                >
                  {mode === "edit" ? "초기값으로 되돌리기" : "입력 초기화"}
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
                  <p>현재 로그인한 사용자가 이 이벤트의 주최자로 등록됩니다.</p>
                </div>
                <div className="flex gap-3">
                  <CalendarClock className="mt-0.5 h-4 w-4 text-primary" />
                  <p>예약 오픈 시각은 이벤트 시작 시각보다 반드시 빨라야 합니다.</p>
                </div>
                <div className="flex gap-3">
                  <Ticket className="mt-0.5 h-4 w-4 text-primary" />
                  <p>총 좌석 수와 1회 예약 최대 수량은 예약 가능 정책을 직접 결정합니다.</p>
                </div>
                <div className="flex gap-3">
                  <ImageIcon className="mt-0.5 h-4 w-4 text-primary" />
                  <p>이미지 업로드 기능은 아직 없고, 외부 이미지 URL만 입력할 수 있습니다.</p>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <p>{mode === "edit" ? "저장 후에는 내 이벤트 목록으로 돌아갑니다." : "생성 후에는 홈으로 이동합니다."}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-dashed border-border/80 bg-background/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">현재 전송 값</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">title</div>
                  <div className="mt-1 break-all text-foreground">{form.title || "미입력"}</div>
                </div>
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">category / totalSlots / maxTicketsPerBooking</div>
                  <div className="mt-1 text-foreground">
                    {categoryLabels[form.category]} / {form.totalSlots || "미입력"} / {form.maxTicketsPerBooking || "미입력"}
                  </div>
                </div>
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">eventDateTime</div>
                  <div className="mt-1 break-all text-foreground">
                    {form.eventDate && form.eventTime ? toIsoString(form.eventDate, form.eventTime) : "미입력"}
                  </div>
                </div>
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">reservationOpenDateTime</div>
                  <div className="mt-1 break-all text-foreground">
                    {form.reservationOpenDate && form.reservationOpenTime
                      ? toIsoString(form.reservationOpenDate, form.reservationOpenTime)
                      : "미입력"}
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
