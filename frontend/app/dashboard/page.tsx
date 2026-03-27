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
          title="Unable to load dashboard"
          description="The dashboard could not load because the frontend could not reach the backend."
        />
      );
    }

    if (error instanceof BackendApiError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }

    throw error;
  }
}
