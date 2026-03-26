package com.reserva.backend.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.reserva.backend.common.config.AppProperties;
import com.reserva.backend.common.error.ApiException;
import com.reserva.backend.common.error.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Component
public class GoogleOAuthClient {

    private final RestClient restClient;
    private final String clientId;
    private final String clientSecret;

    public GoogleOAuthClient(AppProperties appProperties) {
        this.restClient = RestClient.builder().build();
        this.clientId = appProperties.auth().google().clientId();
        this.clientSecret = appProperties.auth().google().clientSecret();
    }

    public GoogleUserProfile exchangeCode(String code, String redirectUri) {
        if (!StringUtils.hasText(clientId) || !StringUtils.hasText(clientSecret)) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "Google OAuth is not configured.");
        }

        GoogleTokenResponse tokenResponse = restClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(tokenRequest(code, redirectUri))
                .retrieve()
                .body(GoogleTokenResponse.class);

        if (tokenResponse == null || !StringUtils.hasText(tokenResponse.accessToken())) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "Google token exchange failed.");
        }

        GoogleUserInfoResponse userInfo = restClient.get()
                .uri("https://openidconnect.googleapis.com/v1/userinfo")
                .headers(headers -> headers.setBearerAuth(tokenResponse.accessToken()))
                .retrieve()
                .body(GoogleUserInfoResponse.class);

        if (userInfo == null || !StringUtils.hasText(userInfo.subject()) || !StringUtils.hasText(userInfo.email())) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "Google identity verification failed.");
        }

        return new GoogleUserProfile(
                userInfo.subject(),
                userInfo.email(),
                StringUtils.hasText(userInfo.name()) ? userInfo.name() : userInfo.email(),
                userInfo.picture()
        );
    }

    private LinkedMultiValueMap<String, String> tokenRequest(String code, String redirectUri) {
        LinkedMultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");
        return body;
    }

    public record GoogleUserProfile(
            String subject,
            String email,
            String name,
            String picture
    ) {
    }

    public record GoogleTokenResponse(
            @JsonProperty("access_token") String accessToken
    ) {
    }

    public record GoogleUserInfoResponse(
            @JsonProperty("sub") String subject,
            String email,
            String name,
            String picture
    ) {
    }
}
