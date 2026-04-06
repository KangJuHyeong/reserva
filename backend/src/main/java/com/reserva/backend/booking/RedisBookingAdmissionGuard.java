package com.reserva.backend.booking;

import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.connection.ReturnType;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;

@Component
public class RedisBookingAdmissionGuard implements BookingAdmissionGuard {

    private static final byte[] RELEASE_LOCK_SCRIPT = """
            if redis.call('get', KEYS[1]) == ARGV[1] then
              return redis.call('del', KEYS[1])
            end
            return 0
            """.getBytes(StandardCharsets.UTF_8);

    private final StringRedisTemplate stringRedisTemplate;
    private final Duration lockTtl;

    public RedisBookingAdmissionGuard(StringRedisTemplate stringRedisTemplate,
                                      @Value("${app.booking.lock-ttl-seconds:5}") long lockTtlSeconds) {
        this.stringRedisTemplate = stringRedisTemplate;
        this.lockTtl = Duration.ofSeconds(lockTtlSeconds);
    }

    @Override
    public AutoCloseable acquireEventLock(String eventId) {
        Assert.hasText(eventId, "eventId must not be blank");

        String lockKey = "booking:lock:event:" + eventId;
        String lockValue = UUID.randomUUID().toString();

        try {
            Boolean acquired = stringRedisTemplate.opsForValue().setIfAbsent(lockKey, lockValue, lockTtl);
            if (!Boolean.TRUE.equals(acquired)) {
                throw new ApiException(
                        ErrorCode.BOOKING_IN_PROGRESS,
                        HttpStatus.CONFLICT,
                        "Another booking for this event is currently being processed. Please try again shortly."
                );
            }
        } catch (ApiException exception) {
            throw exception;
        } catch (DataAccessException exception) {
            throw new ApiException(
                    ErrorCode.BOOKING_UNAVAILABLE,
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Booking is temporarily unavailable because reservation control could not be reached."
            );
        }

        return () -> release(lockKey, lockValue);
    }

    private void release(String lockKey, String lockValue) {
        try {
            stringRedisTemplate.execute(
                    connection -> connection.scriptingCommands().eval(
                            RELEASE_LOCK_SCRIPT,
                            ReturnType.INTEGER,
                            1,
                            lockKey.getBytes(StandardCharsets.UTF_8),
                            lockValue.getBytes(StandardCharsets.UTF_8)
                    ),
                    false,
                    true
            );
        } catch (DataAccessException ignored) {
            // Let TTL clean up the lock if Redis is unavailable during release.
        }
    }
}
