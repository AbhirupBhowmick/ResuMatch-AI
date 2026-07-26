package com.resumatch.prompt;

/**
 * Prompt Template for Job Matching and Resume Comparison against Target JD.
 */
public class JobMatchPrompt {

    public static String buildPrompt(String resumeText, String jobDescription, String companyName, String roleTitle) {
        return """
            STRICT FORMAT MANDATE: You MUST return ONLY a single, raw, valid JSON object starting with '{' and ending with '}'. Do NOT include markdown code blocks (```json), intro text, or echo the prompt.
            
            Perform a complete, objective recruiter comparison of the candidate's resume against the Target Job Description below.
            Target Company: %s
            Target Role: %s
            
            Required Output JSON Schema:
            {
              "overallMatchScore": 84,
              "atsMatchScore": 82,
              "skillMatchScore": 85,
              "experienceMatchScore": 80,
              "educationMatchScore": 90,
              "keywordMatchScore": 83,
              "matchReasoning": "Detailed breakdown of candidate alignment with this role and company requirements.",
              "matchedSkills": ["hard skills present in resume that match JD"],
              "missingSkills": ["must-have skills in JD missing from resume"],
              "missingKeywords": ["critical ATS keywords missing"],
              "experienceComparison": "Analysis comparing candidate's experience level against JD requirements.",
              "recruiterFeedback": "Direct hiring manager feedback regarding this candidate's fit.",
              "suggestedImprovements": ["5 high-impact bullet improvements to raise ATS match for this job"],
              "expectedAtsIncrease": "+15-20 Points",
              "tailoredSummary": "A tailored professional summary highlighting relevant JD keywords",
              "tailoredBulletPoints": [
                {
                  "original": "original weak bullet point",
                  "tailored": "tailored bullet point incorporating JD technical terms and metrics",
                  "alignmentReason": "why this tailored bullet directly addresses a JD requirement"
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
