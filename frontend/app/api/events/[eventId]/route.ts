import { proxyBackend } from "@/lib/server/backend";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  return proxyBackend(request, `/api/v1/events/${eventId}`, "PATCH");
}
