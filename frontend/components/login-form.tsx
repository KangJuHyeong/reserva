"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("alex@example.com");
  const [password, setPassword] = useState("dev-password");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        try {
          const payload = (await response.json()) as { message?: string };
          setErrorMessage(payload.message ?? "로그인에 실패했습니다.");
        } catch {
          setErrorMessage("로그인에 실패했습니다.");
        }
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(242,189,97,0.18),_transparent_30%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--secondary)))] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">로그인</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Reserva에 로그인</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              이메일/비밀번호로 로그인하거나 Google로 계속할 수 있습니다. 두 방식 모두 보호된 페이지와 API에서 같은 JWT 인증 계약을 사용합니다.
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-foreground">
                이메일
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="alex@example.com"
                    required
                  />
                </div>
              </label>

              <label className="block text-sm font-medium text-foreground">
                비밀번호
                <div className="relative mt-2">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="dev-password"
                    required
                  />
                </div>
              </label>

              {errorMessage ? <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</div> : null}

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-base" disabled={isPending}>
                    {isPending ? "로그인 중..." : "로그인"}
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="h-12 rounded-xl px-6 text-base" onClick={() => router.push("/api/auth/google/start")}>
                    Google로 계속하기
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  데모 시드가 켜져 있으면 `alex@example.com / dev-password` 또는 `creator@example.com / dev-password`를 사용할 수 있습니다.
                </p>
                <p className="text-sm text-muted-foreground">
                  계정이 없나요? <Link href="/signup" className="text-primary hover:underline">여기서 가입하기</Link>
                </p>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-border/70 bg-card/90 p-6">
              <h2 className="text-lg font-semibold text-foreground">로그인 안내</h2>
              <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                <p>로그인 후 프론트엔드는 httpOnly 인증 쿠키를 저장하고 백엔드에 JWT bearer 토큰을 전달합니다.</p>
                <p>로컬 로그인과 Google OAuth는 같은 JWT 계약을 사용합니다.</p>
                <p>로그아웃하면 프론트 인증 쿠키가 삭제되고 `GET /me`는 비인증 상태로 돌아갑니다.</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-dashed border-border/80 bg-background/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">데모 계정</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">alex</div>
                  <div className="mt-1 text-foreground">alex@example.com / dev-password</div>
                </div>
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">studio</div>
                  <div className="mt-1 text-foreground">creator@example.com / dev-password</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
