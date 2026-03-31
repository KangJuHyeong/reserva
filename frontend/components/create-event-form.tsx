"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { ArrowLeft, CalendarClock, ImageIcon, Lock, MapPin, Ticket, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
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
  FORBIDDEN: "이 이벤트는 예약 오픈 전까지만 수정할 수 있습니다.",
  UNAUTHENTICATED: "인증 정보가 없습니다. 다시 로그인해 주세요.",
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
  editLocked?: boolean;
  editLockedMessage?: string;
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
    return "1회 예약당 최대 수량은 1 이상의 정수여야 합니다.";
  }

  if (maxTicketsPerBooking > totalSlots) {
    return "1회 예약당 최대 수량은 총 좌석 수를 초과할 수 없습니다.";
  }

  if (form.reservedSlots != null && totalSlots < form.reservedSlots) {
    return `총 좌석 수는 현재 예약 수량(${form.reservedSlots})보다 작을 수 없습니다.`;
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
  editLocked = false,
  editLockedMessage,
}: CreateEventFormProps = {}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialValues ?? initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSlotsNumber = Number(form.totalSlots);
  const maxTicketsPerBookingNumber = Number(form.maxTicketsPerBooking);
  const reservedSlots = form.reservedSlots ?? 0;
  const isEditMode = mode === "edit";
  const controlsDisabled = isSubmitting || editLocked;

  const capacityMetrics = useMemo(() => {
    const hasTotalSlots = Number.isInteger(totalSlotsNumber) && totalSlotsNumber > 0;
    const hasMaxTicketsPerBooking = Number.isInteger(maxTicketsPerBookingNumber) && maxTicketsPerBookingNumber > 0;
    const totalSlots = hasTotalSlots ? totalSlotsNumber : 0;
    const remainingSlots = Math.max(totalSlots - reservedSlots, 0);
    const reservationProgress = totalSlots > 0 ? Math.min(100, Math.round((reservedSlots / totalSlots) * 100)) : 0;
    const effectivePerBookingLimit = hasMaxTicketsPerBooking ? Math.min(maxTicketsPerBookingNumber, totalSlots || maxTicketsPerBookingNumber) : null;

    return {
      hasTotalSlots,
      hasMaxTicketsPerBooking,
      totalSlots,
      remainingSlots,
      reservationProgress,
      effectivePerBookingLimit,
    };
  }, [maxTicketsPerBookingNumber, reservedSlots, totalSlotsNumber]);

  const capacitySummary = useMemo(() => {
    if (!capacityMetrics.hasTotalSlots) {
      return "총 좌석 수를 입력하면 현재 수용 인원 정책을 바로 요약해서 보여드립니다.";
    }

    if (!capacityMetrics.hasMaxTicketsPerBooking) {
      return `총 ${formatNumber(capacityMetrics.totalSlots)}석 기준으로 운영됩니다. 1회 예약당 최대 수량을 입력하면 실제 예약 제한도 함께 안내됩니다.`;
    }

    if (isEditMode) {
      return `현재 ${formatNumber(reservedSlots)}석이 예약되어 있고, 남은 좌석은 ${formatNumber(capacityMetrics.remainingSlots)}석입니다. 한 번의 예약에서 최대 ${formatNumber(capacityMetrics.effectivePerBookingLimit ?? 0)}석까지 받을 수 있습니다.`;
    }

    return `총 ${formatNumber(capacityMetrics.totalSlots)}석으로 시작하며, 한 번의 예약에서 최대 ${formatNumber(capacityMetrics.effectivePerBookingLimit ?? 0)}석까지 받을 수 있습니다.`;
  }, [capacityMetrics, isEditMode, reservedSlots]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editLocked) {
      setErrorMessage(editLockedMessage ?? "예약이 이미 열려 더 이상 수정할 수 없습니다.");
      return;
    }

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

    const response = await fetch(isEditMode && eventId ? `/api/events/${eventId}` : "/api/events", {
      method: isEditMode ? "PATCH" : "POST",
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

    await (response.json() as Promise<EventCreateResponseApi>);
    router.push(isEditMode ? "/my-events" : "/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(242,189,97,0.18),_transparent_30%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--secondary)))] px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href={isEditMode ? "/my-events" : "/"}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEditMode ? "내 이벤트로 돌아가기" : "홈으로 돌아가기"}
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
                {isEditMode ? "이벤트 수정" : "이벤트 생성"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {isEditMode ? "이벤트 정보를 조정해 주세요" : "새 이벤트를 등록해 보세요"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {isEditMode
                  ? "설명, 일정, 좌석 수, 예약 오픈 시점을 이 화면에서 정리할 수 있습니다. 예약이 이미 열린 이벤트는 정보 불일치를 막기 위해 수정이 잠깁니다."
                  : "제목, 일정, 장소, 좌석 정책을 입력하면 공개 가능한 이벤트를 만들 수 있습니다. 예약 오픈 시각은 이벤트 시작보다 반드시 빨라야 합니다."}
              </p>
            </div>

            {editLocked ? (
              <div className="mb-6 rounded-[24px] border border-border bg-muted/40 px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Lock className="h-4 w-4 text-primary" />
                  수정 잠금
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {editLockedMessage ?? "예약이 이미 열려 있는 이벤트는 더 이상 수정할 수 없습니다."}
                </p>
              </div>
            ) : null}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <fieldset disabled={controlsDisabled} className="space-y-6 disabled:opacity-100">
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="block text-sm font-medium text-foreground">
                    이벤트 제목
                    <input
                      value={form.title}
                      onChange={(inputEvent) => setForm((current) => ({ ...current, title: inputEvent.target.value }))}
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
                      placeholder="감성 재즈 라이브"
                    />
                  </label>

                  <label className="block text-sm font-medium text-foreground">
                    카테고리
                    <select
                      value={form.category}
                      onChange={(inputEvent) =>
                        setForm((current) => ({ ...current, category: inputEvent.target.value as FormState["category"] }))
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
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
                    className="mt-2 min-h-32 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
                    placeholder="이벤트 분위기, 참가 대상, 현장 안내를 적어 주세요."
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
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
                      placeholder="45000"
                    />
                  </label>

                  <label className="block text-sm font-medium text-foreground">
                    총 좌석 수
                    <input
                      type="number"
                      min={form.reservedSlots != null ? form.reservedSlots : 1}
                      step="1"
                      value={form.totalSlots}
                      onChange={(inputEvent) => setForm((current) => ({ ...current, totalSlots: inputEvent.target.value }))}
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
                      placeholder="120"
                    />
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      이벤트 전체 수용 인원입니다.
                      {isEditMode
                        ? ` 현재 예약된 ${formatNumber(reservedSlots)}석보다 작게 줄일 수 없습니다.`
                        : " 예약 가능한 총 재고를 정한다고 생각하면 됩니다."}
                    </p>
                  </label>

                  <label className="block text-sm font-medium text-foreground">
                    1회 예약당 최대 수량
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.maxTicketsPerBooking}
                      onChange={(inputEvent) =>
                        setForm((current) => ({ ...current, maxTicketsPerBooking: inputEvent.target.value }))
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
                      placeholder="4"
                    />
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      한 사용자가 한 번의 예약에서 가져갈 수 있는 최대 좌석 수입니다. 총 좌석 수보다 크게 설정할 수 없습니다.
                    </p>
                  </label>
                </div>

                <div className="rounded-[24px] border border-border/70 bg-background/70 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <p className="font-medium text-foreground">수용 인원 설정 요약</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{capacitySummary}</p>
                    </div>
                    {isEditMode ? (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        현재 예약 {formatNumber(reservedSlots)}석
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <MetricCard
                      label="총 좌석"
                      value={capacityMetrics.hasTotalSlots ? `${formatNumber(capacityMetrics.totalSlots)}석` : "미입력"}
                    />
                    <MetricCard
                      label={isEditMode ? "남은 좌석" : "즉시 예약 가능 좌석"}
                      value={capacityMetrics.hasTotalSlots ? `${formatNumber(capacityMetrics.remainingSlots)}석` : "미입력"}
                    />
                    <MetricCard
                      label="1회 예약 한도"
                      value={
                        capacityMetrics.hasMaxTicketsPerBooking && capacityMetrics.effectivePerBookingLimit != null
                          ? `${formatNumber(capacityMetrics.effectivePerBookingLimit)}석`
                          : "미입력"
                      }
                    />
                  </div>

                  {isEditMode && capacityMetrics.hasTotalSlots ? (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>현재 예약 점유율</span>
                        <span>{capacityMetrics.reservationProgress}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${capacityMetrics.reservationProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <label className="block text-sm font-medium text-foreground">
                    위치
                    <input
                      value={form.location}
                      onChange={(inputEvent) => setForm((current) => ({ ...current, location: inputEvent.target.value }))}
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
                      placeholder="성수 라이브하우스"
                    />
                  </label>

                  <label className="block text-sm font-medium text-foreground">
                    커버 이미지 URL
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(inputEvent) => setForm((current) => ({ ...current, imageUrl: inputEvent.target.value }))}
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
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
                        className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
                      />
                    </label>
                    <label className="block text-sm font-medium text-foreground">
                      이벤트 시간
                      <input
                        type="time"
                        value={form.eventTime}
                        onChange={(inputEvent) => setForm((current) => ({ ...current, eventTime: inputEvent.target.value }))}
                        className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
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
                        className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
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
                        className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
                      />
                    </label>
                  </div>
                </div>
              </fieldset>

              {errorMessage ? (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-base" disabled={controlsDisabled}>
                  {isSubmitting ? (isEditMode ? "이벤트 수정 중..." : "이벤트 생성 중...") : isEditMode ? "변경사항 저장" : "이벤트 생성"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl px-6"
                  onClick={() => setForm(initialValues ?? initialState)}
                  disabled={controlsDisabled}
                >
                  {isEditMode ? "초기값으로 되돌리기" : "입력 초기화"}
                </Button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-border/70 bg-card/90 p-6">
              <h2 className="text-lg font-semibold text-foreground">운영 체크리스트</h2>
              <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                <ChecklistRow icon={<UserRoundPlus className="mt-0.5 h-4 w-4 text-primary" />}>
                  현재 로그인한 사용자가 이 이벤트의 주최자로 등록됩니다.
                </ChecklistRow>
                <ChecklistRow icon={<CalendarClock className="mt-0.5 h-4 w-4 text-primary" />}>
                  예약 오픈 시각은 이벤트 시작 시각보다 반드시 빨라야 합니다.
                </ChecklistRow>
                <ChecklistRow icon={<Ticket className="mt-0.5 h-4 w-4 text-primary" />}>
                  총 좌석 수와 1회 예약당 최대 수량이 실제 예약 정책을 결정합니다.
                </ChecklistRow>
                <ChecklistRow icon={<ImageIcon className="mt-0.5 h-4 w-4 text-primary" />}>
                  이미지는 업로드가 아니라 외부 이미지 URL 입력 방식입니다.
                </ChecklistRow>
                <ChecklistRow icon={<MapPin className="mt-0.5 h-4 w-4 text-primary" />}>
                  {isEditMode ? "저장 후에는 내 이벤트 목록으로 돌아갑니다." : "생성 후에는 홈 화면으로 이동합니다."}
                </ChecklistRow>
              </div>
            </div>

            <div className="rounded-[28px] border border-dashed border-border/80 bg-background/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">현재 입력 요약</p>
              <div className="mt-4 space-y-3 text-sm">
                <SummaryRow label="title" value={form.title || "미입력"} />
                <SummaryRow
                  label="category / totalSlots / maxTicketsPerBooking"
                  value={`${categoryLabels[form.category]} / ${form.totalSlots || "미입력"} / ${form.maxTicketsPerBooking || "미입력"}`}
                />
                <SummaryRow
                  label="eventDateTime"
                  value={form.eventDate && form.eventTime ? toIsoString(form.eventDate, form.eventTime) : "미입력"}
                />
                <SummaryRow
                  label="reservationOpenDateTime"
                  value={
                    form.reservationOpenDate && form.reservationOpenTime
                      ? toIsoString(form.reservationOpenDate, form.reservationOpenTime)
                      : "미입력"
                  }
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ChecklistRow({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      {icon}
      <p>{children}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-card px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-all text-foreground">{value}</div>
    </div>
  );
}
