import { cookies } from "next/headers";
import { ApiErrorResponse, LoginResponseApi } from "@/lib/types";
import { AUTH_TOKEN_COOKIE, BACKEND_UNAVAILABLE_CODE } from "@/lib/server/backend";

function backendBaseUrl() {
  const configured = process.env.BACKEND_BASE_URL ?? "http://localhost:8080";
  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}

export async function POST(request: Request) {
  const body = await request.text();

  let response: Response;
  try {
    response = await fetch(`${backendBaseUrl()}/api/v1/auth/oauth/google/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });
  } catch {
    return Response.json(
      {
        code: BACKEND_UNAVAILABLE_CODE,
        message: "The frontend could not reach the backend service.",
      } satisfies ApiErrorResponse,
      { status: 503 },
    );
  }

  if (!response.ok) {
    const payload = await response.text();
    return new Response(payload, {
      status: response.status,
      headers: response.headers,
    });
  }

  const payload = (await response.json()) as LoginResponseApi;
  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_COOKIE, payload.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return Response.json({ user: payload.user });
}
