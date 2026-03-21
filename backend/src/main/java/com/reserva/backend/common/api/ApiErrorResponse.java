package com.reserva.backend.common.api;

import com.reserva.backend.common.error.ErrorCode;

public record ApiErrorResponse(
        ErrorCode code,
        String message
) {
}
