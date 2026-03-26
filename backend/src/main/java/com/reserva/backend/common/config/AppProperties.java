package com.reserva.backend.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Cors cors,
        Auth auth,
        Dev dev
) {
    public record Cors(
            String allowedOrigins,
            String allowedOriginPatterns
    ) {
    }

    public record Auth(
            Jwt jwt,
            Google google
    ) {
    }

    public record Jwt(
            String issuer,
            String secret,
            long accessTokenExpirySeconds
    ) {
    }

    public record Google(
            String clientId,
            String clientSecret
    ) {
    }

    public record Dev(
            boolean seedDemoData
    ) {
    }
}
