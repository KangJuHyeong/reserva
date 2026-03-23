import { redirect } from "next/navigation";
import { CreateEventForm } from "@/components/create-event-form";
import { BackendApiError } from "@/lib/server/backend";
import { fetchCurrentUser } from "@/lib/server/queries";

export default async function CreatePage() {
  try {
    await fetchCurrentUser();
  } catch (error) {
    if (error instanceof BackendApiError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }

    throw error;
  }

  return <CreateEventForm />;
}
