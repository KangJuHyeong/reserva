import { BackendUnavailablePage } from "@/components/backend-unavailable-page";
import { SignupForm } from "@/components/signup-form";
import { redirect } from "next/navigation";
import { BACKEND_UNAVAILABLE_CODE, BackendApiError } from "@/lib/server/backend";
import { fetchCurrentUser } from "@/lib/server/queries";

export default async function SignupPage() {
  try {
    await fetchCurrentUser();
    redirect("/");
  } catch (error) {
    if (error instanceof BackendApiError && error.code === BACKEND_UNAVAILABLE_CODE) {
      return (
        <BackendUnavailablePage
          title="Unable to load sign-up"
          description="The sign-up page could not confirm backend auth availability."
        />
      );
    }

    if (!(error instanceof BackendApiError) || error.code !== "UNAUTHENTICATED") {
      throw error;
    }
  }

  return <SignupForm />;
}
