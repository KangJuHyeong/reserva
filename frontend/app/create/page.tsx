import { BackendUnavailablePage } from "@/components/backend-unavailable-page";
import { redirect } from "next/navigation";
import { CreateEventForm } from "@/components/create-event-form";
import { BACKEND_UNAVAILABLE_CODE, BackendApiError } from "@/lib/server/backend";
import { fetchCurrentUser } from "@/lib/server/queries";

export default async function CreatePage() {
  try {
    await fetchCurrentUser();
  } catch (error) {
    if (error instanceof BackendApiError && error.code === BACKEND_UNAVAILABLE_CODE) {
      return (
        <BackendUnavailablePage
          title="이벤트 생성 화면을 불러올 수 없습니다"
          description="생성 페이지가 백엔드 인증 상태를 확인하지 못했습니다."
        />
      );
    }

    if (error instanceof BackendApiError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }

    throw error;
  }

  return <CreateEventForm />;
}
