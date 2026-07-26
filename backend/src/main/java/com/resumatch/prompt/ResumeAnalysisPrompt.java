package com.resumatch.prompt;

/**
 * Prompt Template for Full Recruiter & ATS Resume Analysis.
 */
public class ResumeAnalysisPrompt {

    public static String buildPrompt(String resumeText, String targetIndustry, String experienceLevel) {
        return """
            Target Industry: %s
            Target Experience Level: %s
            
            Perform a complete FAANG-level recruiter audit and ATS parsing scan on the following resume text.
            
            Return ONLY a valid JSON object matching EXACTLY this structure:
            {
              "overallScore": integer (0-100),
              "atsScore": integer (0-100),
              "roleMatch": integer (0-100),
              "executiveSummary": "A concise 3-4 sentence high-level executive summary of candidate readiness",
              "firstImpression": "Immediate 6-second recruiter reaction when viewing this resume top to bottom",
              "strengths": ["at least 5 specific, evidence-backed strengths present in the resume"],
              "weaknesses": ["at least 4 specific weaknesses, missing metrics, or formatting gaps"],
              "missingKeywords": ["at least 6 critical industry keywords missing from the text"],
              "matchedKeywords": ["keywords found in resume"],
              "recommendedKeywords": ["suggested keywords for target industry"],
              "technicalSkills": ["hard skills identified"],
              "softSkills": ["demonstrated soft skills"],
              "projectsFeedback": ["constructive feedback on project section"],
              "experienceFeedback": ["constructive feedback on work experience bullet points"],
              "educationFeedback": ["constructive feedback on education"],
              "certificationFeedback": ["feedback on certifications"],
              "formattingFeedback": ["ATS parsing vulnerabilities or layout issues"],
              "grammarFeedback": ["spelling, active vs passive voice, or grammar issues"],
              "recruiterComments": "Direct feedback from a Senior Recruiter point of view",
              "technicalInterviewerComments": "Feedback from a Lead Systems Architect / Interviewer",
              "hiringRecommendation": "Strong Hire | Hire | Borderline | No Hire",
              "interviewProbability": integer (0-100),
              "salaryReadiness": "Market-aligned compensation tier string e.g. $140,000 - $165,000",
              "priorityFixes": ["5 immediate high-impact fixes to raise ATS score"],
              "beforeAfterExamples": [
                {
                  "currentText": "exact weak bullet from candidate resume",
                  "improvedText": "rewritten bullet applying Google X-Y-Z and STAR formula with metrics",
                  "reason": "explanation of why the rewrite is stronger for ATS and recruiters",
                  "category": "Impact Metrics | Action Verbs | STAR Method | Brevity"
                }
              ],
              "thirtyDayPlan": {
                "immediateFixes": ["1-3 high priority actions for today"],
                "oneWeekPlan": ["action steps for week 1"],
                "twoWeekPlan": ["action steps for week 2"],
                "thirtyDayPlan": ["30-day target goals"],
                "expectedAtsImprovement": "+15-25 Points"
              },
              "scoreBreakdown": {
                "formattingScore": integer (0-100),
                "keywordMatchScore": integer (0-100),
                "technicalSkillsScore": integer (0-100),
                "projectsScore": integer (0-100),
                "experienceScore": integer (0-100),
                "educationScore": integer (0-100),
                "achievementsScore": integer (0-100),
                "grammarScore": integer (0-100),
                "readabilityScore": integer (0-100),
                "impactMetricsScore": integer (0-100)
              }
            }
            
            Provide AT LEAST 5 concrete beforeAfterExamples items directly targeting weak bullets in the resume.
            
            RESUME TEXT:
            %s
            """.formatted(
                targetIndustry != null && !targetIndustry.isBlank() ? targetIndustry : "Software Engineering",
                experienceLevel != null && !experienceLevel.isBlank() ? experienceLevel : "Mid-Senior",
                resumeText
            );
    }
}
