import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackendUnavailablePageProps {
  title: string;
  description: string;
}

export function BackendUnavailablePage({
  title,
  description,
}: BackendUnavailablePageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="max-w-xl rounded-xl border border-border bg-card p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <AlertTriangle className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          백엔드가 실행 중인지, 그리고 `BACKEND_BASE_URL`이 올바른 주소를 가리키는지 확인해 주세요.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    </main>
  );
}
