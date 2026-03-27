import { BackendUnavailablePage } from "@/components/backend-unavailable-page";
import { CreateEventForm } from "@/components/create-event-form";
import { redirect } from "next/navigation";
import { BACKEND_UNAVAILABLE_CODE, BackendApiError } from "@/lib/server/backend";
import { fetchCurrentUser, fetchMyEventDetail } from "@/lib/server/queries";

function datePart(value: string) {
  return value.slice(0, 10);
}

function timePart(value: string) {
  return value.slice(11, 16);
}

export default async function EditMyEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    await fetchCurrentUser();
    const event = await fetchMyEventDetail(id);

    return (
      <CreateEventForm
        mode="edit"
        eventId={id}
        initialValues={{
          title: event.title,
          category: event.category as "Concert" | "Restaurant" | "Art & Design" | "Sports" | "Other",
          description: event.description,
          price: String(event.price),
          totalSlots: String(event.totalSlots),
          maxTicketsPerBooking: String(event.maxTicketsPerBooking),
          location: event.location,
          imageUrl: event.imageUrl,
          eventDate: datePart(event.eventDateTime),
          eventTime: timePart(event.eventDateTime),
          reservationOpenDate: datePart(event.reservationOpenDateTime),
          reservationOpenTime: timePart(event.reservationOpenDateTime),
          reservedSlots: event.reservedSlots,
        }}
      />
    );
  } catch (error) {
    if (error instanceof BackendApiError && error.code === BACKEND_UNAVAILABLE_CODE) {
      return (
        <BackendUnavailablePage
          title="이벤트 수정 화면을 불러올 수 없습니다"
          description="수정 페이지가 백엔드 서비스에 연결하지 못했습니다."
        />
      );
    }

    if (error instanceof BackendApiError && (error.code === "UNAUTHENTICATED" || error.code === "EVENT_NOT_FOUND")) {
      redirect("/my-events");
    }

    throw error;
  }
}
