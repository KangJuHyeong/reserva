import { BackendUnavailablePage } from "@/components/backend-unavailable-page";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { BACKEND_UNAVAILABLE_CODE, BackendApiError } from "@/lib/server/backend";
import { fetchCurrentUser } from "@/lib/server/queries";

export default async function LoginPage() {
  try {
    await fetchCurrentUser();
    redirect("/");
  } catch (error) {
    if (error instanceof BackendApiError && error.code === BACKEND_UNAVAILABLE_CODE) {
      return (
        <BackendUnavailablePage
          title="로그인 화면을 불러올 수 없습니다"
          description="로그인 페이지가 백엔드 인증 상태를 확인하지 못했습니다."
        />
      );
    }

    if (!(error instanceof BackendApiError) || error.code !== "UNAUTHENTICATED") {
      throw error;
    }
  }

  return <LoginForm />;
}
