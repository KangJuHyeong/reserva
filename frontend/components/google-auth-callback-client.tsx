"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function GoogleAuthCallbackClient({ code }: { code: string | null }) {
  const router = useRouter();
  const [message, setMessage] = useState("Google 로그인 처리 중입니다...");

  useEffect(() => {
    if (!code) {
      setMessage("Google 로그인에서 인증 코드가 전달되지 않았습니다.");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback/google`;

    void fetch("/api/auth/google/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, redirectUri }),
    }).then(async (response) => {
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setMessage(payload?.message ?? "Google 로그인에 실패했습니다.");
        return;
      }

      router.replace("/");
      router.refresh();
    });
  }, [code, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="rounded-2xl border border-border bg-card px-6 py-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Google 로그인</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      </div>
    </main>
  );
}
