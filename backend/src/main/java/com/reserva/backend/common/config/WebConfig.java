package com.reserva.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;
    private final String[] allowedOriginPatterns;

    public WebConfig(AppProperties appProperties) {
        AppProperties.Cors cors = appProperties.cors();
        this.allowedOrigins = splitCsv(cors != null ? cors.allowedOrigins() : null);
        this.allowedOriginPatterns = splitCsv(cors != null ? cors.allowedOriginPatterns() : null);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        var registration = registry.addMapping("/api/**")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowCredentials(true)
                .allowedHeaders("*");

        if (allowedOrigins.length > 0) {
            registration.allowedOrigins(allowedOrigins);
        }

        if (allowedOriginPatterns.length > 0) {
            registration.allowedOriginPatterns(allowedOriginPatterns);
        }
    }

    private String[] splitCsv(String value) {
        if (!StringUtils.hasText(value)) {
            return new String[0];
        }

        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toArray(String[]::new);
    }
}
