const GOOGLE_AUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth";

function frontendBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function GET() {
  const redirectUri = `${frontendBaseUrl()}/auth/callback/google`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return Response.redirect(`${GOOGLE_AUTH_BASE_URL}?${params.toString()}`);
}
