import { HomePage } from "@/components/home-page";
import { toEventSummaryViewModel } from "@/lib/mappers";
import { BackendApiError, devAuthEnabled } from "@/lib/server/backend";
import { fetchEvents } from "@/lib/server/queries";
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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q?.trim() ?? "";
  const selectedCategory = parseCategory(params.view);
  const shouldUseDefaultSections = selectedCategory === "All" && !searchQuery;

  if (selectedCategory === "Watchlist" && !devAuthEnabled()) {
    return <HomePage searchQuery={searchQuery} selectedCategory={selectedCategory} items={[]} mode="watchlist_unauthenticated" />;
  }

  try {
    const response = await fetchEvents({
      q: searchQuery || undefined,
      ...toEventQuery(selectedCategory),
      size: shouldUseDefaultSections ? 60 : 20,
    });

    const items = response.items.map(toEventSummaryViewModel);

    return (
      <HomePage
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        items={items}
        mode={shouldUseDefaultSections ? "default" : "filtered"}
      />
    );
  } catch (error) {
    if (error instanceof BackendApiError && error.code === "UNAUTHENTICATED" && selectedCategory === "Watchlist") {
      return <HomePage searchQuery={searchQuery} selectedCategory={selectedCategory} items={[]} mode="watchlist_unauthenticated" />;
    }

    throw error;
  }
}
