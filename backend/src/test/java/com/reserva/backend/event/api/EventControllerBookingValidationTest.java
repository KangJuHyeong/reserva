package com.reserva.backend.event.api;

import com.reserva.backend.booking.BookingService;
import com.reserva.backend.common.error.GlobalExceptionHandler;
import com.reserva.backend.event.EventCommandService;
import com.reserva.backend.event.EventQueryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
@Import(GlobalExceptionHandler.class)
class EventControllerBookingValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventQueryService eventQueryService;

    @MockBean
    private EventCommandService eventCommandService;

    @MockBean
    private BookingService bookingService;

    @Test
    void createBookingRejectsInvalidTicketCount() throws Exception {
        mockMvc.perform(post("/api/v1/events/evt_1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"ticketCount":0}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("ticketCount")));
    }
}
