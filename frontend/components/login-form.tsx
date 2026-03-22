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
          Back to home
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Session Access</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Reserva에 로그인</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              현재 최소 인증 계약은 이메일과 비밀번호로 세션을 생성합니다. 로그인 후 예약, 워치리스트, 크리에이터 기능이 같은 사용자 컨텍스트로 연결됩니다.
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-foreground">
                Email
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
                Password
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

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-base" disabled={isPending}>
                  {isPending ? "Signing in..." : "Sign In"}
                </Button>
                <p className="text-sm text-muted-foreground">시드가 켜져 있으면 `alex@example.com / dev-password` 또는 `creator@example.com / dev-password`를 사용할 수 있습니다.</p>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-border/70 bg-card/90 p-6">
              <h2 className="text-lg font-semibold text-foreground">현재 동작</h2>
              <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                <p>로그인 성공 시 백엔드 세션이 생성되고 이후 보호 API는 세션을 우선 사용합니다.</p>
                <p>개발 환경에서는 필요할 때만 임시 헤더 fallback이 유지됩니다.</p>
                <p>로그아웃하면 세션이 무효화되고 `GET /me`는 다시 미인증 상태를 반환합니다.</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-dashed border-border/80 bg-background/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Demo Credentials</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">user</div>
                  <div className="mt-1 text-foreground">alex@example.com / dev-password</div>
                </div>
                <div className="rounded-xl bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">creator</div>
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
