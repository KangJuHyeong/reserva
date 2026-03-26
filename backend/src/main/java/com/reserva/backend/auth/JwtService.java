package com.reserva.backend.auth;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reserva.backend.common.config.AppProperties;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import com.reserva.backend.common.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Service
public class JwtService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;
    private final String issuer;
    private final byte[] secretBytes;
    private final long accessTokenExpirySeconds;

    public JwtService(ObjectMapper objectMapper, AppProperties appProperties) {
        this.objectMapper = objectMapper;
        AppProperties.Jwt jwt = appProperties.auth().jwt();
        this.issuer = jwt.issuer();
        this.secretBytes = jwt.secret().getBytes(StandardCharsets.UTF_8);
        this.accessTokenExpirySeconds = jwt.accessTokenExpirySeconds();
    }

    public String issueToken(String userId, String userName) {
        try {
            long now = Instant.now().getEpochSecond();
            String header = encode(objectMapper.writeValueAsBytes(Map.of("alg", "HS256", "typ", "JWT")));
            String payload = encode(objectMapper.writeValueAsBytes(Map.of(
                    "iss", issuer,
                    "sub", userId,
                    "name", userName,
                    "iat", now,
                    "exp", now + accessTokenExpirySeconds
            )));
            String signature = sign(header + "." + payload);
            return header + "." + payload + "." + signature;
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to issue JWT.", exception);
        }
    }

    public CurrentUser parseCurrentUser(String token) {
        if (!StringUtils.hasText(token)) {
            throw unauthenticated();
        }

        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw unauthenticated();
            }

            String expectedSignature = sign(parts[0] + "." + parts[1]);
            if (!expectedSignature.equals(parts[2])) {
                throw unauthenticated();
            }

            Map<String, Object> payload = objectMapper.readValue(decode(parts[1]), MAP_TYPE);
            if (!issuer.equals(payload.get("iss"))) {
                throw unauthenticated();
            }

            Number exp = (Number) payload.get("exp");
            if (exp == null || Instant.now().getEpochSecond() >= exp.longValue()) {
                throw unauthenticated();
            }

            String userId = (String) payload.get("sub");
            String userName = (String) payload.get("name");
            if (!StringUtils.hasText(userId)) {
                throw unauthenticated();
            }

            return new CurrentUser(userId, StringUtils.hasText(userName) ? userName : "Guest User");
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            throw unauthenticated();
        }
    }

    private String sign(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secretBytes, "HmacSHA256"));
        return encode(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }

    private String encode(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private byte[] decode(String value) {
        return Base64.getUrlDecoder().decode(value);
    }

    private ApiException unauthenticated() {
        return new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "Authentication is required.");
    }
}
