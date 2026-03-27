import { proxyBackend } from "@/lib/server/backend";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  return proxyBackend(request, `/api/v1/me/bookings/${bookingId}/cancel`, "POST");
}
