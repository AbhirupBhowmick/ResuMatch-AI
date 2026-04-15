package com.resumatch.controller;

import com.resumatch.model.InterviewQuestionDto;
import com.resumatch.model.InterviewRequestDto;
import com.resumatch.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/interview")
public class InterviewController {

    private final InterviewService interviewService;

    @Autowired
    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping("/generate")
    public ResponseEntity<List<InterviewQuestionDto>> generateInterviewPrep(
            @RequestBody InterviewRequestDto request,
            Principal principal) {
            
        if (request.getExtractedText() == null || request.getExtractedText().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Handle local dev fallback context where auth might be bypassed
        String userEmail = principal != null ? principal.getName() : "demo@resumatch.com";
        
        List<InterviewQuestionDto> questions = interviewService.generateInterviewQuestions(
                userEmail,
                request.getExtractedText(),
                request.getJobDescription()
        );
        
        return ResponseEntity.ok(questions);
    }
    
    @PutMapping("/question/{id}/confidence")
    public ResponseEntity<Void> updateConfidence(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String confidence = payload.get("confidence");
        if (confidence != null) {
            interviewService.updateConfidence(id, confidence);
        }
        return ResponseEntity.ok().build();
    }
}
