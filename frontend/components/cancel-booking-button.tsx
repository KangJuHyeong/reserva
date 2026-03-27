"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiErrorResponse } from "@/lib/types";

interface CancelBookingButtonProps {
  bookingId: string;
}

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCancel() {
    const confirmed = window.confirm("이 예약을 취소할까요?");
    if (!confirmed) {
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/me/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ code: "UNKNOWN_ERROR", message: "예약 취소에 실패했습니다." }))) as ApiErrorResponse;
        setErrorMessage(payload.message);
        return;
      }

      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full border-destructive text-destructive hover:bg-destructive/10"
        disabled={isPending}
        onClick={handleCancel}
      >
        <XCircle className="mr-2 h-4 w-4" />
        {isPending ? "취소 중..." : "예약 취소"}
      </Button>
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}
