import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/lib/server/backend";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return new Response(null, { status: 204 });
}
