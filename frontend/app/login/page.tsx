import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { BackendApiError } from "@/lib/server/backend";
import { fetchCurrentUser } from "@/lib/server/queries";

export default async function LoginPage() {
  try {
    await fetchCurrentUser({ includeDevAuth: false });
    redirect("/");
  } catch (error) {
    if (!(error instanceof BackendApiError) || error.code !== "UNAUTHENTICATED") {
      throw error;
    }
  }

  return <LoginForm />;
}
