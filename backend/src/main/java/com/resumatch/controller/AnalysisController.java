package com.resumatch.controller;

import com.resumatch.model.AnalysisResult;
import com.resumatch.service.AnalysisService;
import com.resumatch.service.ReportGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/analysis")
@RequiredArgsConstructor
@Slf4j
public class AnalysisController {

    private final AnalysisService analysisService;
    private final ReportGeneratorService reportGeneratorService;

    /**
     * Apply AI suggestions to an analysis result.
     * Generates STAR rewrites, saves before/after, marks as APPLIED.
     */
    @PostMapping("/apply")
    public ResponseEntity<?> applySuggestions(@RequestBody Map<String, Long> request) {
        try {
            Long analysisId = request.get("analysisId");
            if (analysisId == null) {
                // If no ID provided, use the latest analysis
                Optional<AnalysisResult> latest = analysisService.getLatestAnalysis();
                if (latest.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "NO_ANALYSIS",
                            "message", "No analysis found. Please upload and analyze a resume first."
                    ));
                }
                analysisId = latest.get().getId();
            }

            Map<String, Object> result = analysisService.applySuggestions(analysisId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("Apply suggestions failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "APPLY_FAILED",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get before/after comparison for a specific analysis.
     */
    @GetMapping("/comparison/{id}")
    public ResponseEntity<?> getComparison(@PathVariable Long id) {
        try {
            Map<String, Object> comparison = analysisService.getComparison(id);
            return ResponseEntity.ok(comparison);
        } catch (RuntimeException e) {
            log.error("Comparison fetch failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "COMPARISON_FAILED",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Undo applied suggestions — restore original resume.
     */
    @PostMapping("/undo/{id}")
    public ResponseEntity<?> undoSuggestions(@PathVariable Long id) {
        try {
            Map<String, Object> result = analysisService.undoSuggestions(id);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("Undo failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "UNDO_FAILED",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get the latest analysis result for the current user.
     */
    @GetMapping("/latest")
    public ResponseEntity<?> getLatest() {
        Optional<AnalysisResult> latest = analysisService.getLatestAnalysis();
        if (latest.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasAnalysis", false));
        }
        AnalysisResult a = latest.get();
        return ResponseEntity.ok(Map.of(
                "hasAnalysis", true,
                "analysisId", a.getId(),
                "score", a.getScore(),
                "status", a.getStatus().name(),
                "createdAt", a.getCreatedAt().toString()
        ));
    }

    /**
     * Export analysis result as a professional PDF report.
     */
    @GetMapping("/export/{id}")
    public ResponseEntity<?> exportPdf(@PathVariable Long id) {
        log.info("PDF Export requested for analysis ID: {}", id);
        try {
            Optional<AnalysisResult> analysisOpt = analysisService.getAnalysisById(id);
            if (analysisOpt.isEmpty()) {
                log.warn("Export failed: Analysis {} not found for current user.", id);
                return ResponseEntity.status(404).body(Map.of(
                        "error", "NOT_FOUND",
                        "message", "Analysis result not found."
                ));
            }

            byte[] pdfBytes = reportGeneratorService.generateAnalysisReport(analysisOpt.get());

            log.info("PDF Export successful for analysis ID: {}. Size: {} bytes.", id, pdfBytes.length);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ResuMatch_Report_" + id + ".pdf")
                    .body(pdfBytes);
        } catch (Exception e) {
            log.error("CRITICAL: PDF export failed for analysis {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "EXPORT_FAILED",
                    "message", "Failed to generate professional PDF report: " + e.getMessage()
            ));
        }
    }
}
