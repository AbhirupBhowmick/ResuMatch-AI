package com.resumatch.controller;

import com.resumatch.model.AssessmentRequest;
import com.resumatch.model.MCQQuestionDto;
import com.resumatch.model.User;
import com.resumatch.service.AssessmentService;
import com.resumatch.service.SubscriptionValidationService;
import com.resumatch.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assessment")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final UserService userService;
    private final SubscriptionValidationService subscriptionValidationService;

    @PostMapping("/generate")
    public ResponseEntity<List<MCQQuestionDto>> generateMCQs(@RequestBody AssessmentRequest request) {
        // 0. Get User and Validate Limits
        User user = userService.getCurrentUser();
        subscriptionValidationService.validateMcqLimit(user);

        // Determine question count based on tier
        int questionCount = user.getSubscriptionTier() == com.resumatch.model.SubscriptionTier.STARTER ? 5 : 10;
        List<MCQQuestionDto> mcqs = assessmentService.generateMCQs(request.getExtractedText(), request.getJobDescription(), questionCount);
        
        // 1. Update Usage
        userService.incrementMcqCount(user);
        
        return ResponseEntity.ok(mcqs);
    }
}
