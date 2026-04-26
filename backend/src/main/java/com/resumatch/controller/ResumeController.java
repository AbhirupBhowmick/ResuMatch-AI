package com.resumatch.controller;

import com.resumatch.model.User;
import com.resumatch.model.ResumeAnalysisResponse;
import com.resumatch.service.AnalysisService;
import com.resumatch.service.GeminiService;
import com.resumatch.service.ResumeService;
import com.resumatch.service.UserService;
import com.resumatch.service.SubscriptionValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.resumatch.model.AnalysisResult;
import com.resumatch.service.ResumePdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/resume")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ResumeController {

    private final ResumeService resumeService;
    private final GeminiService geminiService;
    private final UserService userService;
    private final SubscriptionValidationService subscriptionValidationService;
    private final AnalysisService analysisService;
    private final ResumePdfService resumePdfService;

    @PostMapping("/upload")
    public ResponseEntity<ResumeAnalysisResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "industry", defaultValue = "Software Engineering") String industry,
            @RequestParam(value = "experienceLevel", defaultValue = "Mid-level") String experienceLevel) {
        
        // 0. Get User and Validate Limits
        User user = userService.getCurrentUser();
        log.info("Resume upload request from user: {}, current audit count: {}, tier: {}", 
            user.getEmail(), user.getMonthlyAuditCount(), user.getSubscriptionTier());
        subscriptionValidationService.validateAuditLimit(user);

        // 1. Parse Resume
        String parsedText = resumeService.parseResume(file);
        
        // 2. Call Gemini
        ResumeAnalysisResponse response = geminiService.analyzeResume(parsedText, industry, experienceLevel);
        response.setExtractedText(parsedText);

        // 3. Save parsed resume to user profile for premium features
        user.setLastParsedResume(parsedText);

        // 4. Save analysis result to DB for apply/compare flow
        var savedAnalysis = analysisService.saveAnalysis(user, response, parsedText);
        log.info("Analysis saved with ID: {} for user: {}", savedAnalysis.getId(), user.getEmail());

        // 5. Update Usage
        userService.incrementAuditCount(user);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/tailor")
    public ResponseEntity<?> jobTailorXRay(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobDescription") String jobDescription) {
        log.info("Receiving Job Tailor X-Ray request");
        try {
            // 0. Get User and Validate Limits
            User user = userService.getCurrentUser();
            subscriptionValidationService.validateAuditLimit(user);

            // 1. Parse Resume
            String parsedText = resumeService.parseResume(file);
            
            // 2. Call Gemini for X-Ray
            java.util.Map<String, Object> response = geminiService.analyzeJobTailor(parsedText, jobDescription);
            
            if (response.containsKey("error")) {
                return ResponseEntity.badRequest().body(response);
            }

            // 3. Update Usage (optional for X-Ray, but good practice since uses Gemini)
            userService.incrementAuditCount(user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Job tailor process failed", e);
            if (e.getMessage() != null && e.getMessage().contains("Insufficient credits")) {
                return ResponseEntity.status(403).body(java.util.Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * Export the current resume as a professional PDF.
     * Synchronizes content if suggestions have been applied.
     */
    @GetMapping("/export-pdf")
    public ResponseEntity<byte[]> exportPdf() {
        User user = userService.getCurrentUser();
        log.info("Resume PDF export requested for user: {}", user.getEmail());

        Optional<AnalysisResult> latest = analysisService.getLatestAnalysis();
        byte[] pdfBytes = resumePdfService.generateResumePdf(user, latest.orElse(null));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", user.getName() != null ? user.getName().replace(" ", "_") + "_Resume.pdf" : "Resume.pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
