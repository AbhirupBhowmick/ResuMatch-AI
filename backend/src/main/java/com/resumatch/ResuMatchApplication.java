package com.resumatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import com.resumatch.service.UserService;
import lombok.RequiredArgsConstructor;

@SpringBootApplication
@EnableScheduling
@RequiredArgsConstructor
public class ResuMatchApplication {

    private final UserService userService;

    public static void main(String[] args) {
        SpringApplication.run(ResuMatchApplication.class, args);
    }

    @Scheduled(cron = "0 0 0 1 * *")
    public void resetMonthlyUsage() {
        userService.resetMonthlyUsage();
    }
}
