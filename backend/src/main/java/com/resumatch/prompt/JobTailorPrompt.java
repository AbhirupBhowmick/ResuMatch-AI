package com.resumatch.prompt;

/**
 * Prompt Template for Job Description Matching and Resume Tailoring.
 */
public class JobTailorPrompt {

    public static String buildPrompt(String resumeText, String jobDescription) {
        return """
            Compare the candidate's resume against the Target Job Description below.
            
            Return ONLY a valid JSON object matching EXACTLY this structure:
            {
              "overallMatchScore": integer (0-100),
              "skillMatchScore": integer (0-100),
              "experienceMatchScore": integer (0-100),
              "educationMatchScore": integer (0-100),
              "keywordMatchScore": integer (0-100),
              "matchReasoning": "Detailed explanation of candidate alignment with this specific role",
              "matchedSkills": ["skills matching the JD"],
              "missingCriticalSkills": ["must-have skills in JD missing from resume"],
              "tailoredSummary": "A tailored professional summary highlighting relevant JD keywords",
              "tailoredBulletPoints": [
                {
                  "original": "original bullet point",
                  "tailored": "tailored bullet point incorporating JD technical terms and metrics",
                  "alignmentReason": "why this tailored bullet directly addresses a JD requirement"
                }
              ],
              "atsOptimizationTips": ["specific advice for passing ATS filters for this job posting"]
            }
            
            JOB DESCRIPTION:
            %s
            
            CANDIDATE RESUME TEXT:
            %s
            """.formatted(jobDescription, resumeText);
    }
}
