package com.resumatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Enriched Recruiter-Grade Resume Analysis Response.
 * Fully compliant with new commercial ATS AI schema and 100% backward compatible.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysisResponse {

    // Primary FAANG Recruiter & ATS Metrics
    private int overallScore;
    private int atsScore;
    private int roleMatch;

    private String executiveSummary;
    private String firstImpression;

    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> missingKeywords;
    private List<String> matchedKeywords;
    private List<String> recommendedKeywords;

    private List<String> technicalSkills;
    private List<String> softSkills;

    private List<String> projectsFeedback;
    private List<String> experienceFeedback;
    private List<String> educationFeedback;
    private List<String> certificationFeedback;
    private List<String> formattingFeedback;
    private List<String> grammarFeedback;

    private String recruiterComments;
    private String technicalInterviewerComments;
    private String hiringRecommendation; // "Strong Hire" | "Hire" | "Borderline" | "No Hire"
    private int interviewProbability;
    private String salaryReadiness;

    private List<String> priorityFixes;
    private List<BeforeAfterExampleDto> beforeAfterExamples;
    private ActionPlanDto thirtyDayPlan;
    private ScoreBreakdownDto scoreBreakdown;

    // Legacy fields for 100% Backward Compatibility with frontend
    private int score;
    private List<String> jobSuggestions;
    private String improvedSummary;
    private String extractedText;

    /**
     * Synchronize legacy fields with enriched recruiter fields.
     */
    public void syncLegacyFields() {
        if (this.score == 0 && this.atsScore > 0) {
            this.score = this.atsScore;
        } else if (this.atsScore == 0 && this.score > 0) {
            this.atsScore = this.score;
        }
        if (this.overallScore == 0) {
            this.overallScore = this.atsScore > 0 ? this.atsScore : this.score;
        }
        if (this.roleMatch == 0) {
            this.roleMatch = this.overallScore;
        }
        if (this.improvedSummary == null || this.improvedSummary.isBlank()) {
            this.improvedSummary = this.executiveSummary;
        }
        if (this.executiveSummary == null || this.executiveSummary.isBlank()) {
            this.executiveSummary = this.improvedSummary;
        }
        if (this.jobSuggestions == null || this.jobSuggestions.isEmpty()) {
            this.jobSuggestions = this.priorityFixes;
        }
        if (this.priorityFixes == null || this.priorityFixes.isEmpty()) {
            this.priorityFixes = this.jobSuggestions;
        }
    }
}
