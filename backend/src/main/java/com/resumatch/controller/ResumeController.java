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
import java.util.Map;

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
        
        User user = userService.getCurrentUser();
        log.info("Resume upload request from user: {}, current audit count: {}, tier: {}", 
            user.getEmail(), user.getMonthlyAuditCount(), user.getSubscriptionTier());
        subscriptionValidationService.validateAuditLimit(user);

        String parsedText = resumeService.parseResume(file);
        
        ResumeAnalysisResponse response = geminiService.analyzeResume(parsedText, industry, experienceLevel);
        response.setExtractedText(parsedText);

        user.setLastParsedResume(parsedText);

        var savedAnalysis = analysisService.saveAnalysis(user, response, parsedText);
        log.info("Analysis saved with ID: {} for user: {}", savedAnalysis.getId(), user.getEmail());

        userService.incrementAuditCount(user);

        return ResponseEntity.ok(response);
    }

    @PostMapping({"/match", "/tailor"})
    public ResponseEntity<?> jobMatchScan(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobDescription") String jobDescription,
            @RequestParam(value = "companyName", defaultValue = "Target Company") String companyName,
            @RequestParam(value = "roleTitle", defaultValue = "Target Role") String roleTitle) {
        log.info("Receiving Job Match request for company: {}, role: {}", companyName, roleTitle);
        try {
            User user = userService.getCurrentUser();
            subscriptionValidationService.validateAuditLimit(user);

            String parsedText = resumeService.parseResume(file);
            
            Map<String, Object> response = geminiService.analyzeJobMatch(parsedText, jobDescription, companyName, roleTitle);
            
            if (response.containsKey("error")) {
                return ResponseEntity.badRequest().body(response);
            }

            userService.incrementAuditCount(user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Job match process failed", e);
            if (e.getMessage() != null && e.getMessage().contains("Insufficient credits")) {
                return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chatWithResume(@RequestBody Map<String, String> request) {
        try {
            User user = userService.getCurrentUser();
            String query = request.get("query");
            if (query == null || query.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Query parameter is required"));
            }

            Optional<AnalysisResult> latest = analysisService.getLatestAnalysis();
            String resumeText = latest.map(AnalysisResult::getExtractedText).orElse(null);
            if (resumeText == null || resumeText.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No analyzed resume found. Please upload a resume first."));
            }

            Map<String, Object> response = geminiService.chatWithResume(resumeText, query);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Resume Chat process failed", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

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
