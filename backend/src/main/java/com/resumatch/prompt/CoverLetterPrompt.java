package com.resumatch.prompt;

/**
 * Prompt Template for Targeted Cover Letter Generation.
 */
public class CoverLetterPrompt {

    public static String buildPrompt(String resumeText, String jobDescription, String companyName, String targetRole) {
        return """
            Write a recruiter-grade, high-converting cover letter for the candidate applying to %s for the role of %s.
            
            Return ONLY a valid JSON object matching EXACTLY this structure:
            {
              "recipient": "Hiring Manager / Talent Acquisition Team",
              "companyName": "%s",
              "targetRole": "%s",
              "salutation": "Dear Hiring Manager,",
              "openingParagraph": "Engaging hook showcasing candidate alignment with company mission and role requirements",
              "bodyParagraph1": "Highlight of key technical achievements and metrics relevant to the job description",
              "bodyParagraph2": "Demonstration of leadership, problem-solving, and domain expertise matching company goals",
              "closingParagraph": "Strong call to action expressing enthusiasm for an interview",
              "fullCoverLetter": "Complete formatted cover letter combining all paragraphs with proper line breaks"
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
