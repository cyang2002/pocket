package com.cardoptimizer.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CardApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CardApiApplication.class, args);
    }
}