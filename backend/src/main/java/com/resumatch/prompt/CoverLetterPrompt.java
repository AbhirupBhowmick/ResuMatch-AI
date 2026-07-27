package com.resumatch.prompt;

/**
 * Prompt Template for Targeted Cover Letter Generation.
 */
public class CoverLetterPrompt {

    public static String buildPrompt(String resumeText, String jobDescription, String companyName, String targetRole) {
        return """
            Write a recruiter-grade cover letter for candidate applying to %s for role %s.
            Return ONLY raw JSON matching schema:
            {
              "recipient": "Hiring Manager",
              "companyName": "%s",
              "targetRole": "%s",
              "salutation": "Dear Hiring Manager,",
              "openingParagraph": "Engaging hook showcasing candidate alignment",
              "bodyParagraph1": "Key technical achievements and metrics relevant to job",
              "bodyParagraph2": "Leadership and domain expertise matching goals",
              "closingParagraph": "Call to action expressing enthusiasm for interview",
              "fullCoverLetter": "Complete formatted cover letter"
            }
            
            JOB DESCRIPTION:
            %s
            
            CANDIDATE RESUME TEXT:
            %s
            """.formatted(
                companyName != null && !companyName.isBlank() ? companyName : "Target Company",
                targetRole != null && !targetRole.isBlank() ? targetRole : "Target Role",
                companyName != null && !companyName.isBlank() ? companyName : "Target Company",
                targetRole != null && !targetRole.isBlank() ? targetRole : "Target Role",
                jobDescription != null ? jobDescription : "N/A",
                resumeText
            );
    }
}
