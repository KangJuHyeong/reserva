"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiErrorResponse } from "@/lib/types";

interface DeleteEventButtonProps {
  eventId: string;
  title: string;
}

export function DeleteEventButton({ eventId, title }: DeleteEventButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(`"${title}" 이벤트를 삭제할까요?\n예약 오픈 전 이벤트만 삭제할 수 있습니다.`);
    if (!confirmed) {
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({ code: "UNKNOWN_ERROR", message: "이벤트 삭제에 실패했습니다." }))) as ApiErrorResponse;
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
        className="w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={isPending}
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
        {isPending ? "삭제 중..." : "이벤트 삭제"}
      </Button>
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}
