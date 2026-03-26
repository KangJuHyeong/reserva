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
          setErrorMessage(payload.message ?? "Login failed.");
        } catch {
          setErrorMessage("Login failed.");
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
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Auth Access</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Sign in to Reserva</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Use local email/password sign-in or continue with Google. Both paths issue the same JWT-based auth contract used by protected pages and API mutations.
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

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-base" disabled={isPending}>
                    {isPending ? "Signing in..." : "Sign In"}
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="h-12 rounded-xl px-6 text-base" onClick={() => router.push("/api/auth/google/start")}>
                    Continue with Google
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  When demo seed is enabled, use `alex@example.com / dev-password` or `creator@example.com / dev-password`.
                </p>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-border/70 bg-card/90 p-6">
              <h2 className="text-lg font-semibold text-foreground">How it works</h2>
              <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                <p>After sign-in, the frontend stores an httpOnly auth cookie and forwards a JWT bearer token to the backend.</p>
                <p>Protected API routes use the same JWT contract for local login and Google OAuth.</p>
                <p>Signing out clears the frontend auth cookie, and `GET /me` returns to the unauthenticated state.</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-dashed border-border/80 bg-background/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Demo Credentials</p>
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
