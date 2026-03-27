"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { ArrowLeft, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        try {
          const payload = (await response.json()) as { message?: string };
          setErrorMessage(payload.message ?? "회원가입에 실패했습니다.");
        } catch {
          setErrorMessage("회원가입에 실패했습니다.");
        }
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(126,176,121,0.18),_transparent_28%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--secondary)))] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">회원가입</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Reserva 계정 만들기</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              먼저 이메일/비밀번호 계정을 만들 수 있습니다. 가입이 완료되면 보호된 페이지에서 사용하는 것과 같은 httpOnly JWT 쿠키 계약이 적용됩니다.
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-foreground">
                이름
                <div className="relative mt-2">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="홍길동"
                    required
                    maxLength={100}
                  />
                </div>
              </label>

              <label className="block text-sm font-medium text-foreground">
                이메일
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="you@example.com"
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
                    placeholder="8자 이상 입력해 주세요"
                    required
                    minLength={8}
                    maxLength={72}
                  />
                </div>
              </label>

              {errorMessage ? <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</div> : null}

              <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-base" disabled={isPending}>
                  {isPending ? "계정 생성 중..." : "계정 만들기"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  이미 계정이 있나요? <Link href="/login" className="text-primary hover:underline">로그인</Link>
                </p>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-border/70 bg-card/90 p-6">
              <h2 className="text-lg font-semibold text-foreground">가입 후 가능한 일</h2>
              <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                <p>이메일/비밀번호 계정을 만들면 예약, 찜, 대시보드, 이벤트 생성에 같은 인증 상태로 바로 들어갑니다.</p>
                <p>프론트엔드는 발급된 토큰을 httpOnly 쿠키에 저장하고 백엔드에는 JWT bearer 인증으로 전달합니다.</p>
                <p>Google 로그인도 이후에 같은 인증 계약으로 함께 사용할 수 있습니다.</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-dashed border-border/80 bg-background/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">입력 규칙</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>이름은 필수이며 최대 100자까지 입력할 수 있습니다.</p>
                <p>이메일은 중복될 수 없습니다.</p>
                <p>비밀번호는 8자 이상 72자 이하여야 합니다.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
