package com.resumatch.controller;

import com.resumatch.model.*;
import com.resumatch.service.CoverLetterPdfService;
import com.resumatch.service.GeminiService;
import com.resumatch.service.SubscriptionValidationService;
import com.resumatch.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/premium")
@RequiredArgsConstructor
@Slf4j
public class PremiumController {

    private final GeminiService geminiService;
    private final UserService userService;
    private final SubscriptionValidationService subscriptionValidationService;
    private final CoverLetterPdfService coverLetterPdfService;

    @PostMapping("/star")
    public ResponseEntity<Map<String, Object>> starRewrite(@RequestBody StarRewriteRequest request) {
        User user = userService.getCurrentUser();
        subscriptionValidationService.validatePremiumFeature(user, SubscriptionTier.ACTIVE_HUNTER);
        log.info("STAR rewrite requested by user: {}", user.getEmail());
        Map<String, Object> result = geminiService.generateStarRewrite(request.getResumeBullet(), request.getJobDescription());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/flashcards")
    public ResponseEntity<List<Map<String, Object>>> generateFlashcards(@RequestBody FlashcardRequest request) {
        User user = userService.getCurrentUser();
        subscriptionValidationService.validatePremiumFeature(user, SubscriptionTier.ACTIVE_HUNTER);
        log.info("Flashcard generation requested by user: {}", user.getEmail());
        List<Map<String, Object>> flashcards = geminiService.generateFlashcards(request.getJobDescription());
        return ResponseEntity.ok(flashcards);
    }

    @PostMapping("/cover-letter")
    public ResponseEntity<?> generateCoverLetter(@RequestBody CoverLetterRequest request) {
        User user = userService.getCurrentUser();
        subscriptionValidationService.validatePremiumFeature(user, SubscriptionTier.PRO_ACHIEVER);
        
        String parsedResume = user.getLastParsedResume();
        if (parsedResume == null || parsedResume.trim().isEmpty()) {
            if (request.getParsedResume() != null && !request.getParsedResume().trim().isEmpty()) {
                parsedResume = request.getParsedResume();
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "NO_RESUME_DATA",
                    "message", "Please upload and analyze your resume first on the Dashboard before generating a cover letter."
                ));
            }
        }

        log.info("Cover letter generation requested by user: {} (resume length: {} chars)", user.getEmail(), parsedResume.length());
        Map<String, Object> coverLetter = geminiService.generateCoverLetter(parsedResume, request.getJobDescription());
        return ResponseEntity.ok(coverLetter);
    }

    @PostMapping("/competitive-rank")
    public ResponseEntity<?> getCompetitiveRank(@RequestBody CompetitiveRankRequest request) {
        User user = userService.getCurrentUser();
        subscriptionValidationService.validatePremiumFeature(user, SubscriptionTier.PRO_ACHIEVER);
        
        String parsedResume = user.getLastParsedResume();
        if (parsedResume == null || parsedResume.trim().isEmpty()) {
            if (request.getParsedResume() != null && !request.getParsedResume().trim().isEmpty()) {
                parsedResume = request.getParsedResume();
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "NO_RESUME_DATA",
                    "message", "Please upload and analyze your resume first on the Dashboard before using the Rank Predictor."
                ));
            }
        }

        log.info("Competitive rank prediction requested by user: {}", user.getEmail());
        Map<String, Object> rankData = geminiService.predictCompetitiveRank(parsedResume, request.getJobDescription());
        return ResponseEntity.ok(rankData);
    }

    /**
     * E. Cover Letter PDF Generator — returns downloadable PDF.
     */
    @PostMapping("/generate-pdf")
    public ResponseEntity<byte[]> generatePdf(@RequestBody Map<String, Object> request) {
        log.info("PDF generation requested");

        String subjectLine = (String) request.getOrDefault("subjectLine", 
                request.getOrDefault("subject_line", "Cover Letter"));
        @SuppressWarnings("unchecked")
        List<String> bodyParagraphs = (List<String>) request.getOrDefault("bodyParagraphs",
                request.getOrDefault("body_paragraphs", List.of()));
        String userName = (String) request.getOrDefault("userName", null);

        byte[] pdfBytes = coverLetterPdfService.generatePdf(subjectLine, bodyParagraphs, userName);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "CoverLetter.pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
