package com.resumatch.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumatch.model.*;
import com.resumatch.repository.AnalysisResultRepository;
import com.resumatch.repository.ImprovedResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisService {

    private final AnalysisResultRepository analysisResultRepository;
    private final ImprovedResumeRepository improvedResumeRepository;
    private final GeminiService geminiService;
    private final UserService userService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Save an analysis result after resume upload.
     */
    @Transactional
    public AnalysisResult saveAnalysis(User user, ResumeAnalysisResponse response, String originalText) {
        try {
            AnalysisResult result = AnalysisResult.builder()
                    .user(user)
                    .score(response.getScore())
                    .strengths(objectMapper.writeValueAsString(response.getStrengths()))
                    .missingKeywords(objectMapper.writeValueAsString(response.getMissingKeywords()))
                    .jobSuggestions(objectMapper.writeValueAsString(response.getJobSuggestions()))
                    .improvedSummary(response.getImprovedSummary())
                    .originalResumeText(originalText)
                    .status(AnalysisStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();
            return analysisResultRepository.save(result);
        } catch (Exception e) {
            log.error("Failed to save analysis result: {}", e.getMessage());
            throw new RuntimeException("Failed to save analysis result", e);
        }
    }

    /**
     * Apply AI suggestions: generates STAR rewrites, saves before/after pairs,
     * updates status to APPLIED, and backs up original content.
     */
    @Transactional
    public Map<String, Object> applySuggestions(Long analysisId) {
        User user = userService.getCurrentUser();
        AnalysisResult analysis = analysisResultRepository.findByIdAndUser(analysisId, user)
                .orElseThrow(() -> new RuntimeException("Analysis not found or not owned by user"));

        if (analysis.getStatus() == AnalysisStatus.APPLIED) {
            throw new RuntimeException("Suggestions have already been applied to this analysis.");
        }

        // Backup the original content before overwriting
        analysis.setBackupContent(analysis.getOriginalResumeText());

        // Generate STAR rewrites for weak bullet points using Gemini
        List<Map<String, String>> comparisons = new ArrayList<>();

        // Sample original bullets extracted from the resume
        List<String> originalBullets = extractBulletPoints(analysis.getOriginalResumeText());

        String jobTitle = "Target Role";
        try {
            List<String> suggestions = objectMapper.readValue(
                    analysis.getJobSuggestions(), new TypeReference<List<String>>() {});
            if (!suggestions.isEmpty()) jobTitle = suggestions.get(0);
        } catch (Exception e) {
            log.warn("Could not parse job suggestions: {}", e.getMessage());
        }

        for (String bullet : originalBullets) {
            try {
                Map<String, Object> starResult = geminiService.generateStarRewrite(bullet, "Job Title: " + jobTitle);
                String improved = (String) starResult.getOrDefault("optimized_bullet",
                        starResult.getOrDefault("star_rewrite", bullet));

                ImprovedResume section = ImprovedResume.builder()
                        .analysisResult(analysis)
                        .sectionName("Experience Bullet")
                        .originalText(bullet)
                        .aiImprovedText(improved)
                        .build();
                improvedResumeRepository.save(section);

                comparisons.add(Map.of("original", bullet, "improved", improved));
            } catch (Exception e) {
                log.error("STAR rewrite failed for bullet: {}", e.getMessage());
                comparisons.add(Map.of("original", bullet, "improved", bullet));
            }
        }

        // Save the improved summary
        ImprovedResume summarySection = ImprovedResume.builder()
                .analysisResult(analysis)
                .sectionName("Professional Summary")
                .originalText(truncateSummary(analysis.getOriginalResumeText()))
                .aiImprovedText(analysis.getImprovedSummary())
                .build();
        improvedResumeRepository.save(summarySection);

        // Update the user's stored resume with the improved version
        StringBuilder improvedResume = new StringBuilder();
        improvedResume.append("PROFESSIONAL SUMMARY\n");
        improvedResume.append(analysis.getImprovedSummary()).append("\n\n");
        improvedResume.append("EXPERIENCE\n");
        for (Map<String, String> comp : comparisons) {
            improvedResume.append("• ").append(comp.get("improved")).append("\n");
        }
        user.setLastParsedResume(improvedResume.toString());

        // Mark as applied
        analysis.setStatus(AnalysisStatus.APPLIED);
        analysis.setAppliedAt(LocalDateTime.now());
        analysisResultRepository.save(analysis);

        return Map.of(
                "status", "APPLIED",
                "analysisId", analysis.getId(),
                "comparisons", comparisons,
                "message", "Suggestions applied successfully. Your resume profile has been updated."
        );
    }

    /**
     * Get the before/after comparison for a specific analysis.
     */
    public Map<String, Object> getComparison(Long analysisId) {
        User user = userService.getCurrentUser();
        AnalysisResult analysis = analysisResultRepository.findByIdAndUser(analysisId, user)
                .orElseThrow(() -> new RuntimeException("Analysis not found"));

        List<ImprovedResume> sections = improvedResumeRepository.findByAnalysisResultId(analysisId);
        List<Map<String, String>> comparisons = new ArrayList<>();
        for (ImprovedResume section : sections) {
            comparisons.add(Map.of(
                    "section", section.getSectionName(),
                    "original", section.getOriginalText(),
                    "improved", section.getAiImprovedText()
            ));
        }

        return Map.of(
                "analysisId", analysis.getId(),
                "status", analysis.getStatus().name(),
                "score", analysis.getScore(),
                "userName", analysis.getUser() != null ? analysis.getUser().getName() : "Candidate",
                "appliedAt", analysis.getAppliedAt() != null ? analysis.getAppliedAt().toString() : "",
                "comparisons", comparisons
        );
    }

    /**
     * Undo applied suggestions.
     */
    @Transactional
    public Map<String, Object> undoSuggestions(Long analysisId) {
        User user = userService.getCurrentUser();
        AnalysisResult analysis = analysisResultRepository.findByIdAndUser(analysisId, user)
                .orElseThrow(() -> new RuntimeException("Analysis not found"));

        if (analysis.getStatus() != AnalysisStatus.APPLIED) {
            throw new RuntimeException("No applied suggestions to undo.");
        }

        // Restore backup
        if (analysis.getBackupContent() != null) {
            user.setLastParsedResume(analysis.getBackupContent());
        }

        analysis.setStatus(AnalysisStatus.UNDONE);
        analysisResultRepository.save(analysis);

        return Map.of("status", "UNDONE", "message", "Suggestions undone. Original resume restored.");
    }

    /**
     * Get the latest analysis for the current user.
     */
    public Optional<AnalysisResult> getLatestAnalysis() {
        User user = userService.getCurrentUser();
        return analysisResultRepository.findTopByUserOrderByCreatedAtDesc(user);
    }

    public Optional<AnalysisResult> getAnalysisById(Long id) {
        User user = userService.getCurrentUser();
        return analysisResultRepository.findByIdAndUser(id, user);
    }

    // ── Helpers ──

    private List<String> extractBulletPoints(String resumeText) {
        if (resumeText == null || resumeText.isEmpty()) return List.of();
        List<String> bullets = new ArrayList<>();
        String[] lines = resumeText.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
                String clean = trimmed.substring(1).trim();
                if (clean.length() > 15) { // Skip trivially short lines
                    bullets.add(clean);
                }
            }
        }
        // If no bullets found, extract sentences as fallback
        if (bullets.isEmpty()) {
            String[] sentences = resumeText.split("\\.");
            int count = 0;
            for (String sentence : sentences) {
                String trimmed = sentence.trim();
                if (trimmed.length() > 30 && count < 3) {
                    bullets.add(trimmed + ".");
                    count++;
                }
            }
        }
        return bullets.size() > 5 ? bullets.subList(0, 5) : bullets; // Cap at 5
    }

    private String truncateSummary(String text) {
        if (text == null) return "";
        String[] lines = text.split("\n");
        StringBuilder summary = new StringBuilder();
        int lineCount = 0;
        for (String line : lines) {
            if (line.trim().length() > 10) {
                summary.append(line.trim()).append(" ");
                lineCount++;
                if (lineCount >= 3) break;
            }
        }
        String result = summary.toString().trim();
        return result.length() > 300 ? result.substring(0, 300) + "..." : result;
    }
}
