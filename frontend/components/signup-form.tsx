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
          setErrorMessage(payload.message ?? "Sign-up failed.");
        } catch {
          setErrorMessage("Sign-up failed.");
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
          Back to home
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-border/70 bg-card/95 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Account Setup</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Create your Reserva account</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Start with local email/password access. After sign-up, the frontend issues the same httpOnly JWT cookie contract used by protected pages.
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-foreground">
                Name
                <div className="relative mt-2">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Alex Johnson"
                    required
                    maxLength={100}
                  />
                </div>
              </label>

              <label className="block text-sm font-medium text-foreground">
                Email
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
                Password
                <div className="relative mt-2">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Use at least 8 characters"
                    required
                    minLength={8}
                    maxLength={72}
                  />
                </div>
              </label>

              {errorMessage ? <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</div> : null}

              <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-base" disabled={isPending}>
                  {isPending ? "Creating account..." : "Create Account"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-border/70 bg-card/90 p-6">
              <h2 className="text-lg font-semibold text-foreground">What you get</h2>
              <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                <p>Create an account with email/password and land in the same authenticated state used by booking, watchlist, dashboard, and event creation.</p>
                <p>The frontend stores the issued token in an httpOnly cookie and forwards JWT bearer auth to the backend.</p>
                <p>Google sign-in can still coexist later because both paths issue the same auth contract.</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-dashed border-border/80 bg-background/70 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Validation</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Name is required and capped at 100 characters.</p>
                <p>Email must be unique.</p>
                <p>Password must be 8 to 72 characters.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
