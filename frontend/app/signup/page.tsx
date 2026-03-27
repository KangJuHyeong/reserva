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
          title="회원가입 화면을 불러올 수 없습니다"
          description="회원가입 페이지가 백엔드 인증 상태를 확인하지 못했습니다."
        />
      );
    }

    if (!(error instanceof BackendApiError) || error.code !== "UNAUTHENTICATED") {
      throw error;
    }
  }

  return <SignupForm />;
}
