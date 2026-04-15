package com.resumatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysisResponse {
    private int score;
    private List<String> strengths;
    private List<String> missingKeywords;
    private List<String> jobSuggestions;
    private String improvedSummary;
    private String extractedText;
}
