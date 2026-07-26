package com.resumatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreBreakdownDto {
    private int formattingScore;
    private int keywordMatchScore;
    private int technicalSkillsScore;
    private int projectsScore;
    private int experienceScore;
    private int educationScore;
    private int achievementsScore;
    private int grammarScore;
    private int readabilityScore;
    private int impactMetricsScore;
}
