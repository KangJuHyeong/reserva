package com.reserva.backend;

import com.reserva.backend.common.config.AppProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class ReservaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReservaBackendApplication.class, args);
    }
}
