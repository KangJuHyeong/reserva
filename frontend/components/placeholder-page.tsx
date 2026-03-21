import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="max-w-xl rounded-xl border border-border bg-card p-8">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        <p className="mt-4 text-sm text-muted-foreground">This route stays in the app so the promoted frontend keeps the prototype navigation shape.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </main>
  );
}
