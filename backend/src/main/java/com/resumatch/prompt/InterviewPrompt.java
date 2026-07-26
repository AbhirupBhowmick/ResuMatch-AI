package com.resumatch.prompt;

/**
 * Prompt Template for Behavioral and Technical Interview Preparation.
 */
public class InterviewPrompt {

    public static String buildPrompt(String resumeText, String jobDescription) {
        return """
            Identify potential gaps, red flags, or shallow project bullet points in the resume relative to the Target Job Description.
            Generate EXACTLY 4 tough behavioral/technical interview questions with custom STAR strategy guides.
            
            Return ONLY a valid JSON array of 4 objects matching EXACTLY this structure:
            [
              {
                "question": "The specific behavioral or technical interview question",
                "redFlagAddressed": "The gap or red flag probed",
                "strategy": "Custom STAR method strategy based on candidate's background",
                "sampleAnswer": "Comprehensive model answer utilizing STAR framework"
              }
            ]
            
            JOB DESCRIPTION:
            %s
            
            RESUME TEXT:
            %s
            """.formatted(
                jobDescription != null && !jobDescription.isBlank() ? jobDescription : "Senior Software Engineer / Technical Role",
                resumeText
            );
    }
}
