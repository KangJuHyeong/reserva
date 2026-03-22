import { proxyBackend } from "@/lib/server/backend";

export async function POST(request: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  return proxyBackend(request, `/api/v1/events/${eventId}/watchlist`, "POST");
}

export async function DELETE(request: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  return proxyBackend(request, `/api/v1/events/${eventId}/watchlist`, "DELETE");
}
