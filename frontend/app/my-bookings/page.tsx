import { redirect } from "next/navigation";
import { BackendUnavailablePage } from "@/components/backend-unavailable-page";
import { MyBookingsPage } from "@/components/my-bookings-page";
import { toBookingSummaryViewModel } from "@/lib/mappers";
import { BACKEND_UNAVAILABLE_CODE, BackendApiError } from "@/lib/server/backend";
import { fetchCurrentUser, fetchMyBookings } from "@/lib/server/queries";
import { MyBookingsStatus } from "@/lib/types";

function parsePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

function parseStatus(value?: string): MyBookingsStatus {
  switch (value) {
    case "confirmed":
    case "completed":
    case "cancelled":
      return value;
    default:
      return "all";
  }
}

export default async function MyBookings({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const status = parseStatus(params.status);

  try {
    const [currentUser, response] = await Promise.all([
      fetchCurrentUser(),
      fetchMyBookings({ page, size: 12, status }),
    ]);

    return (
      <MyBookingsPage
        currentUser={currentUser}
        items={response.items.map(toBookingSummaryViewModel)}
        currentPage={response.page}
        pageSize={response.size}
        totalItems={response.total}
        activeStatus={status}
      />
    );
  } catch (error) {
    if (error instanceof BackendApiError && error.code === BACKEND_UNAVAILABLE_CODE) {
      return (
        <BackendUnavailablePage
          title="예약 목록을 불러올 수 없습니다"
          description="백엔드 연결이 확인되지 않아 내 예약 페이지를 표시할 수 없습니다."
        />
      );
    }

    if (error instanceof BackendApiError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }

    throw error;
  }
}
