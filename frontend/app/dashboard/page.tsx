import { redirect } from "next/navigation";
import { DashboardPage } from "@/components/dashboard-page";
import { toBookingSummaryViewModel, toEventSummaryViewModel } from "@/lib/mappers";
import { BackendApiError } from "@/lib/server/backend";
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
    if (error instanceof BackendApiError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }

    throw error;
  }
}
