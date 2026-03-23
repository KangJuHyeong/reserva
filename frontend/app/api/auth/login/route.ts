import { proxyBackend } from "@/lib/server/backend";

export async function POST(request: Request) {
  return proxyBackend(request, "/api/v1/auth/login", "POST");
}
