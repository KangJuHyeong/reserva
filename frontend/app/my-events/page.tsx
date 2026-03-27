import { BackendUnavailablePage } from "@/components/backend-unavailable-page";
import { redirect } from "next/navigation";
import { MyEventsPage } from "@/components/my-events-page";
import { toEventSummaryViewModel } from "@/lib/mappers";
import { BACKEND_UNAVAILABLE_CODE, BackendApiError } from "@/lib/server/backend";
import { fetchCurrentUser, fetchMyEvents } from "@/lib/server/queries";
import { MyEventsFilter, MyEventsSort } from "@/lib/types";

function parsePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

function parseFilter(value?: string): MyEventsFilter {
  switch (value) {
    case "editable":
    case "open":
    case "upcoming":
    case "almostFull":
      return value;
    default:
      return "all";
  }
}

function parseSort(value?: string): MyEventsSort {
  switch (value) {
    case "eventDate":
    case "reservationOpen":
    case "mostReserved":
      return value;
    default:
      return "latest";
  }
}

export default async function MyEvents({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const filter = parseFilter(params.filter);
  const sort = parseSort(params.sort);

  try {
    const [currentUser, response] = await Promise.all([
      fetchCurrentUser(),
      fetchMyEvents({ page, size: 12, filter, sort }),
    ]);

    return (
      <MyEventsPage
        currentUser={currentUser}
        items={response.items.map(toEventSummaryViewModel)}
        currentPage={response.page}
        pageSize={response.size}
        totalItems={response.total}
        activeFilter={filter}
        activeSort={sort}
      />
    );
  } catch (error) {
    if (error instanceof BackendApiError && error.code === BACKEND_UNAVAILABLE_CODE) {
      return (
        <BackendUnavailablePage
          title="내 이벤트 화면을 불러올 수 없습니다"
          description="게시한 이벤트 작업 공간이 백엔드 서비스에 연결하지 못했습니다."
        />
      );
    }

    if (error instanceof BackendApiError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }

    throw error;
  }
}
