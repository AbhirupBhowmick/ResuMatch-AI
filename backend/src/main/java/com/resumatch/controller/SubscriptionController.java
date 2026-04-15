package com.resumatch.controller;

import com.resumatch.model.User;
import com.resumatch.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class SubscriptionController {

    private final UserService userService;

    @GetMapping("/usage")
    public ResponseEntity<Map<String, Object>> getUsage() {
        User user = userService.getCurrentUser();
        
        Map<String, Object> usage = new HashMap<>();
        usage.put("tier", user.getSubscriptionTier());
        usage.put("auditsUsed", user.getMonthlyAuditCount());
        
        int limit = getAuditLimitForTier(user.getSubscriptionTier());
        usage.put("auditsLimit", limit == -1 ? "Unlimited" : limit);
        
        // Calculate next reset date (1st of next month)
        LocalDate nextReset = LocalDate.now().with(TemporalAdjusters.firstDayOfNextMonth());
        usage.put("nextReset", nextReset.toString());
        
        return ResponseEntity.ok(usage);
    }

    private int getAuditLimitForTier(com.resumatch.model.SubscriptionTier tier) {
        return switch (tier) {
            case FREE -> 1;
            case STARTER -> 5;
            default -> -1; // Unlimited
        };
    }
}
