import { BackendUnavailablePage } from "@/components/backend-unavailable-page";
import { HomePage } from "@/components/home-page";
import { toEventSummaryViewModel } from "@/lib/mappers";
import { BACKEND_UNAVAILABLE_CODE, BackendApiError } from "@/lib/server/backend";
import { fetchCurrentUser, fetchEvents } from "@/lib/server/queries";
import { Category } from "@/lib/types";

function parseCategory(value?: string): Category {
  const allowed: Category[] = ["All", "Concert", "Restaurant", "Art & Design", "Sports", "Trending", "Ending Soon", "Upcoming", "Watchlist"];
  if (!value || !allowed.includes(value as Category)) {
    return "All";
  }
  return value as Category;
}

function toEventQuery(category: Category) {
  switch (category) {
    case "Concert":
    case "Restaurant":
    case "Art & Design":
    case "Sports":
      return { category };
    case "Watchlist":
      return { section: "watchlist" };
    case "Trending":
      return { section: "trending" };
    case "Ending Soon":
      return { section: "endingSoon" };
    case "Upcoming":
      return { section: "openingSoon" };
    default:
      return {};
  }
}

function parsePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string; page?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q?.trim() ?? "";
  const selectedCategory = parseCategory(params.view);
  const shouldUseDefaultSections = selectedCategory === "All" && !searchQuery;
  const page = shouldUseDefaultSections ? 1 : parsePage(params.page);
  let currentUser = null;

  try {
    currentUser = await fetchCurrentUser();
  } catch (error) {
    if (error instanceof BackendApiError && error.code === BACKEND_UNAVAILABLE_CODE) {
      return (
        <BackendUnavailablePage
          title="Unable to load discovery"
          description="The frontend started, but it could not reach the backend to load the event feed."
        />
      );
    }

    if (!(error instanceof BackendApiError) || error.code !== "UNAUTHENTICATED") {
      throw error;
    }
  }

  if (selectedCategory === "Watchlist" && currentUser == null) {
    return (
      <HomePage
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        items={[]}
        currentUser={currentUser}
        mode="watchlist_unauthenticated"
        currentPage={1}
        pageSize={20}
        totalItems={0}
      />
    );
  }

  try {
    const response = await fetchEvents({
      q: searchQuery || undefined,
      ...toEventQuery(selectedCategory),
      page,
      size: shouldUseDefaultSections ? 60 : 20,
    });

    const items = response.items.map(toEventSummaryViewModel);

    return (
      <HomePage
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        items={items}
        currentUser={currentUser}
        mode={shouldUseDefaultSections ? "default" : "filtered"}
        currentPage={response.page}
        pageSize={response.size}
        totalItems={response.total}
      />
    );
  } catch (error) {
    if (error instanceof BackendApiError && error.code === "UNAUTHENTICATED" && selectedCategory === "Watchlist") {
      return (
        <HomePage
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          items={[]}
          currentUser={currentUser}
          mode="watchlist_unauthenticated"
          currentPage={1}
          pageSize={20}
          totalItems={0}
        />
      );
    }

    throw error;
  }
}
