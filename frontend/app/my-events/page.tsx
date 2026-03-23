import { redirect } from "next/navigation";
import { MyEventsPage } from "@/components/my-events-page";
import { toEventSummaryViewModel } from "@/lib/mappers";
import { BackendApiError } from "@/lib/server/backend";
import { fetchCurrentUser, fetchMyEvents } from "@/lib/server/queries";

function parsePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export default async function MyEvents({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);

  try {
    const [currentUser, response] = await Promise.all([
      fetchCurrentUser(),
      fetchMyEvents({ page, size: 12 }),
    ]);

    return (
      <MyEventsPage
        currentUser={currentUser}
        items={response.items.map(toEventSummaryViewModel)}
        currentPage={response.page}
        pageSize={response.size}
        totalItems={response.total}
      />
    );
  } catch (error) {
    if (error instanceof BackendApiError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }

    throw error;
  }
}
