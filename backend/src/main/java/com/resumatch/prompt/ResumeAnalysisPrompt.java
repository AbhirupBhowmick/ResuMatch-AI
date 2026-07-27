package com.resumatch.prompt;

/**
 * Prompt Template for Full Recruiter & ATS Resume Analysis.
 */
public class ResumeAnalysisPrompt {

    public static String buildPrompt(String resumeText, String targetIndustry, String experienceLevel) {
        return """
            Evaluate resume text for target industry "%s" at experience level "%s".
            Return ONLY raw JSON matching schema:
            {
              "overallScore": 88,
              "atsScore": 86,
              "roleMatch": 90,
              "executiveSummary": "Concise high-level executive summary of candidate readiness",
              "firstImpression": "6-second recruiter reaction when viewing resume",
              "strengths": ["specific evidence-backed strengths"],
              "weaknesses": ["specific weaknesses, missing metrics, or formatting gaps"],
              "missingKeywords": ["critical industry keywords missing"],
              "matchedKeywords": ["keywords found in resume"],
              "recommendedKeywords": ["suggested keywords for target industry"],
              "technicalSkills": ["hard skills identified"],
              "softSkills": ["demonstrated soft skills"],
              "projectsFeedback": ["feedback on projects"],
              "experienceFeedback": ["feedback on work experience bullets"],
              "educationFeedback": ["feedback on education"],
              "certificationFeedback": ["feedback on certifications"],
              "formattingFeedback": ["ATS parsing vulnerabilities or layout issues"],
              "grammarFeedback": ["spelling or active vs passive voice issues"],
              "recruiterComments": "Senior recruiter perspective",
              "technicalInterviewerComments": "Interviewer perspective",
              "hiringRecommendation": "Strong Hire",
              "interviewProbability": 85,
              "salaryReadiness": "$140,000 - $165,000",
              "priorityFixes": ["5 immediate high-impact fixes"],
              "beforeAfterExamples": [
                {
                  "currentText": "exact weak bullet",
                  "improvedText": "rewritten bullet applying Google X-Y-Z and STAR formula with metrics",
                  "reason": "why rewrite is stronger for ATS",
                  "category": "Impact Metrics"
                }
              ],
              "thirtyDayPlan": {
                "immediateFixes": ["immediate actions"],
                "oneWeekPlan": ["week 1 action steps"],
                "twoWeekPlan": ["week 2 action steps"],
                "thirtyDayPlan": ["30-day target goals"],
                "expectedAtsImprovement": "+15-25 Points"
              },
              "scoreBreakdown": {
                "formattingScore": 90,
                "keywordMatchScore": 85,
                "technicalSkillsScore": 88,
                "projectsScore": 84,
                "experienceScore": 86,
                "educationScore": 90,
                "achievementsScore": 82,
                "grammarScore": 98,
                "readabilityScore": 92,
                "impactMetricsScore": 80
              }
            }
            
            CANDIDATE RESUME TEXT:
            %s
            """.formatted(
                targetIndustry != null && !targetIndustry.isBlank() ? targetIndustry : "Software Engineering",
                experienceLevel != null && !experienceLevel.isBlank() ? experienceLevel : "Mid-Senior",
                resumeText
            );
    }
}
