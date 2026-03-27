import { BackendUnavailablePage } from "@/components/backend-unavailable-page";
import { redirect } from "next/navigation";
import { DashboardPage } from "@/components/dashboard-page";
import { toBookingSummaryViewModel, toEventSummaryViewModel } from "@/lib/mappers";
import { BACKEND_UNAVAILABLE_CODE, BackendApiError } from "@/lib/server/backend";
import { fetchCurrentUser, fetchDashboardSummary } from "@/lib/server/queries";

export default async function Dashboard() {
  try {
    const [currentUser, summary] = await Promise.all([
      fetchCurrentUser(),
      fetchDashboardSummary(),
    ]);

    return (
      <DashboardPage
        currentUser={currentUser}
        stats={summary.stats}
        recentBookings={summary.recentBookings.map(toBookingSummaryViewModel)}
        upcomingOpenEvents={summary.upcomingOpenEvents.map(toEventSummaryViewModel)}
        watchlistPreview={summary.watchlistPreview.map(toEventSummaryViewModel)}
        createdEventsPreview={summary.createdEventsPreview.map(toEventSummaryViewModel)}
      />
    );
  } catch (error) {
    if (error instanceof BackendApiError && error.code === BACKEND_UNAVAILABLE_CODE) {
      return (
        <BackendUnavailablePage
          title="대시보드를 불러올 수 없습니다"
          description="프론트엔드가 백엔드에 연결하지 못해 대시보드를 표시할 수 없습니다."
        />
      );
    }

    if (error instanceof BackendApiError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }

    throw error;
  }
}
