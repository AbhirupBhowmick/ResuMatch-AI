package com.resumatch.controller;

import com.resumatch.model.ExtensionQuickScanRequest;
import com.resumatch.model.User;
import com.resumatch.service.GeminiService;
import com.resumatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/extension")
@RequiredArgsConstructor
@Slf4j
public class ExtensionController {

    private final GeminiService geminiService;
    private final UserRepository userRepository;

    /**
     * Chrome Extension API — Quick Scan
     * Validates API key, runs lightweight resume vs JD analysis.
     * 
     * The API key is the user's email for simplicity in this version.
     * In production, this should be a proper API key stored on the User model.
     */
    @PostMapping("/quick-scan")
    public ResponseEntity<?> quickScan(@RequestBody ExtensionQuickScanRequest request) {
        log.info("Extension quick-scan requested with apiKey: {}", request.getApiKey());

        // Validate API key using the dedicated field
        Optional<User> userOpt = userRepository.findByApiKey(request.getApiKey());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "INVALID_API_KEY",
                "message", "The provided ResuMatch AI API key is invalid. Please check your Dashboard."
            ));
        }

        User user = userOpt.get();
        
        // Only Pro Achiever+ users can use the extension API
        if (user.getSubscriptionTier().ordinal() < com.resumatch.model.SubscriptionTier.PRO_ACHIEVER.ordinal()) {
            return ResponseEntity.status(403).body(Map.of(
                "error", "INSUFFICIENT_TIER",
                "message", "Chrome Extension Quick Scan requires Pro Achiever tier or above."
            ));
        }

        // Get the latest resume text from the user's profile
        String resumeText = user.getLastParsedResume();
        if (resumeText == null || resumeText.isBlank()) {
            return ResponseEntity.status(400).body(Map.of(
                "error", "NO_RESUME_FOUND",
                "message", "Please upload and analyze your resume on the web dashboard before using the extension."
            ));
        }

        Map<String, Object> result = geminiService.quickScan(resumeText, request.getJobDescriptionText());
        
        return ResponseEntity.ok(result);
    }
}
