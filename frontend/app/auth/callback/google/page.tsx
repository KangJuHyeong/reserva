import { GoogleAuthCallbackClient } from "@/components/google-auth-callback-client";

export default async function GoogleAuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  return <GoogleAuthCallbackClient code={params.code ?? null} />;
}
