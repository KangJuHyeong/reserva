package com.reserva.backend.event.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reserva.backend.auth.JwtService;
import com.reserva.backend.booking.BookingService;
import com.reserva.backend.common.api.ApiErrorResponse;
import com.reserva.backend.common.security.CurrentUser;
import com.reserva.backend.common.error.GlobalExceptionHandler;
import com.reserva.backend.event.EventCommandService;
import com.reserva.backend.event.EventQueryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class EventControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EventQueryService eventQueryService;

    @MockBean
    private EventCommandService eventCommandService;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private JwtService jwtService;

    @Test
    void createEventReturnsCreatedResponseForValidPayload() throws Exception {
        when(eventCommandService.createEvent(nullable(CurrentUser.class), any(EventCreateRequest.class)))
                .thenReturn(new EventCreateResponse("evt_1", "Summer Jazz Night"));

        mockMvc.perform(post("/api/v1/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validPayload())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("evt_1"))
                .andExpect(jsonPath("$.title").value("Summer Jazz Night"));
    }

    @ParameterizedTest
    @MethodSource("invalidPayloads")
    void createEventRejectsInvalidBody(Map<String, Object> payload, String expectedMessageFragment) throws Exception {
        mockMvc.perform(post("/api/v1/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value(expectedMessageFragment));

        verify(eventCommandService, never()).createEvent(any(CurrentUser.class), any(EventCreateRequest.class));
    }

    static Stream<Arguments> invalidPayloads() {
        return Stream.of(
                Arguments.of(payloadWith("title", " "), "title: must not be blank"),
                Arguments.of(payloadWith("category", " "), "category: must not be blank"),
                Arguments.of(payloadWith("description", " "), "description: must not be blank"),
                Arguments.of(payloadWith("location", " "), "location: must not be blank"),
                Arguments.of(payloadWith("imageUrl", " "), "imageUrl: must not be blank"),
                Arguments.of(payloadWith("price", new BigDecimal("-1")), "price: must be greater than or equal to 0"),
                Arguments.of(payloadWith("totalSlots", 0), "totalSlots: must be greater than or equal to 1"),
                Arguments.of(payloadWith("maxTicketsPerBooking", 0), "maxTicketsPerBooking: must be greater than or equal to 1"),
                Arguments.of(payloadWith("eventDateTime", null), "eventDateTime: must not be null"),
                Arguments.of(payloadWith("reservationOpenDateTime", null), "reservationOpenDateTime: must not be null")
        );
    }

    private static Map<String, Object> payloadWith(String field, Object value) {
        Map<String, Object> payload = new LinkedHashMap<>(validPayload());
        payload.put(field, value);
        return payload;
    }

    private static Map<String, Object> validPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("title", "Summer Jazz Night");
        payload.put("category", "Concert");
        payload.put("description", "Experience an unforgettable evening of smooth jazz.");
        payload.put("price", new BigDecimal("45.00"));
        payload.put("location", "Blue Note Jazz Club, NYC");
        payload.put("eventDateTime", "2026-04-15T18:00:00Z");
        payload.put("reservationOpenDateTime", "2026-04-10T10:00:00Z");
        payload.put("totalSlots", 120);
        payload.put("maxTicketsPerBooking", 6);
        payload.put("imageUrl", "https://example.com/image.jpg");
        return payload;
    }
}
