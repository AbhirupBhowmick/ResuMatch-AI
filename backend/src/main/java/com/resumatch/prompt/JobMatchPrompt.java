package com.resumatch.prompt;

/**
 * Prompt Template for Job Matching and Resume Comparison against Target JD.
 */
public class JobMatchPrompt {

    public static String buildPrompt(String resumeText, String jobDescription, String companyName, String roleTitle) {
        return """
            Compare candidate resume against target job description.
            Target Company: %s | Target Role: %s
            Return ONLY raw JSON matching schema:
            {
              "overallMatchScore": 84,
              "atsMatchScore": 82,
              "skillMatchScore": 85,
              "experienceMatchScore": 80,
              "educationMatchScore": 90,
              "keywordMatchScore": 83,
              "matchReasoning": "Detailed breakdown of candidate alignment",
              "matchedSkills": ["hard skills present in resume matching JD"],
              "missingSkills": ["must-have skills in JD missing from resume"],
              "missingKeywords": ["critical ATS keywords missing"],
              "experienceComparison": "Analysis comparing experience level vs JD",
              "recruiterFeedback": "Direct hiring manager feedback",
              "suggestedImprovements": ["5 high-impact bullet improvements"],
              "expectedAtsIncrease": "+15-20 Points",
              "tailoredSummary": "Tailored professional summary highlighting JD keywords",
              "tailoredBulletPoints": [
                {
                  "original": "original weak bullet point",
                  "tailored": "tailored bullet point with JD terms and metrics",
                  "alignmentReason": "why tailored bullet addresses JD requirement"
                }
              ]
            }
            
            JOB DESCRIPTION:
            %s
            
            CANDIDATE RESUME TEXT:
            %s
            """.formatted(
                companyName != null && !companyName.isBlank() ? companyName : "Target Company",
                roleTitle != null && !roleTitle.isBlank() ? roleTitle : "Target Role",
                jobDescription,
                resumeText
            );
    }
}
