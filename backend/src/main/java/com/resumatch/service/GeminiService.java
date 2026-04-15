package com.resumatch.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumatch.model.ResumeAnalysisResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import com.resumatch.exception.GeminiAuthException;
import java.util.HashMap;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String MODEL = "gemini-flash-latest";

    @Value("${gemini.api.key}")
    private String apiKey;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.error("Gemini API Key is MISSING!");
            throw new GeminiAuthException("Gemini API Key is not configured.");
        }
        String maskedKey = apiKey.length() > 4 ? apiKey.substring(0, 4) + "..." : "****";
        logger.info("Gemini Key Loaded: " + maskedKey);
    }


    // ===== RESUME ANALYSIS (existing) =====

    public ResumeAnalysisResponse analyzeResume(String parsedText, String industry, String experienceLevel) {
        if (parsedText == null || parsedText.trim().isEmpty()) {
            logger.warn("Parsed text is empty, using placeholder for analysis.");
            parsedText = "Extracted text was empty. Please check the PDF/DOCX file.";
        }

        logger.info("Analyzing resume for industry: {}. Experience: {}. Text length: {}", industry, experienceLevel, parsedText.length());

        String prompt = "You are an elite ATS and technical recruiter evaluator. Analyze the following resume text. " +
                "The candidate targets the '" + industry + "' industry with an experience level of '" + experienceLevel + "'.\n\n" +
                "Evaluate the resume and return ONLY a strict JSON object with exactly these fields:\n" +
                "- \"score\": integer representing the ATS score from 0 to 100 based on keyword density and structural integrity.\n" +
                "- \"strengths\": list of strings detailing strong points.\n" +
                "- \"missingKeywords\": list of strings detailing critical missing skills or words.\n" +
                "- \"jobSuggestions\": list of strings detailing suggested job titles.\n" +
                "- \"improvedSummary\": string rewriting their summary to be more impactful.\n\n" +
                "CRITICAL INSTRUCTION: You MUST return ONLY valid JSON. If the input text is completely unrelated to a resume (e.g., a class routine, gibberish, or blank), you MUST STILL return the strict JSON format with a score of 0, and mention in the strengths/missingKeywords that the document is not a recognizable resume.\n\n" +
                "Resume Text:\n" + parsedText;


        try {
            String jsonText = callGeminiForRawText(prompt);
            String cleaned = extractJson(jsonText);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, ResumeAnalysisResponse.class);
            }
            throw new RuntimeException("AI response was not a valid JSON object.");
        } catch (Exception e) {
            logger.error("Error calling Gemini API for analysis: {}", e.getMessage());
            throw new RuntimeException("AI analysis failed: " + e.getMessage());
        }
    }

    // ===== A. STAR METHOD GENERATOR (Hunter+) =====

    public Map<String, Object> generateStarRewrite(String resumeBullet, String jobDescription) {
        String prompt = "You are an elite Tech Recruiter. You will receive a snippet of a candidate's resume.\n\n" +
                "Rule 1: If the snippet is just a name, email, or contact info, do not change it. Return it as-is.\n" +
                "Rule 2: If it is an experience or project bullet, rewrite it using the STAR method.\n" +
                "Rule 3: DO NOT literally write the words 'Situation:', 'Task:', 'Action:', or 'Result:'. " +
                "Combine them into ONE single, professional, flowing sentence that starts with a strong action verb (e.g., 'Developed', 'Architected').\n" +
                "Rule 4: NEVER return '...' or empty strings. Always output a full, high-impact sentence.\n\n" +
                "Resume Snippet: " + resumeBullet + "\n\n" +
                "Job Context: " + jobDescription + "\n\n" +
                "Return ONLY valid JSON. Do NOT wrap in markdown code blocks.\n" +
                "Return JSON: { \"original\": \"...\", \"optimized_bullet\": \"Actual generated high-impact bullet here\" }";

        try {
            String raw = callGeminiForRawText(prompt);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
            throw new RuntimeException("AI response for STAR rewrite was invalid.");
        } catch (Exception e) {
            logger.error("STAR rewrite failed: {}", e.getMessage());
            throw new RuntimeException("AI STAR generation failed: " + e.getMessage());
        }
    }

    // ===== B. SMART FLASHCARDS (Hunter+) =====

    public List<Map<String, Object>> generateFlashcards(String jobDescription) {
        String prompt = "You are a Senior Engineering Manager interviewing a candidate for the provided job description. " +
                "Generate exactly 5 highly specific interview questions based on the requirements.\n\n" +
                "Job Description: " + jobDescription + "\n\n" +
                "Return ONLY valid JSON. Do NOT wrap in markdown code blocks.\n" +
                "Return a JSON array of objects: [ { \"question\": \"...\", \"difficulty\": \"Medium/Hard\", " +
                "\"recruiter_perspective\": \"What I am actually looking for when I ask this...\" } ]";

        try {
            String raw = callGeminiForRawText(prompt);
            String cleaned = extractJsonArray(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<List<Map<String, Object>>>() {});
            }
            throw new RuntimeException("AI response for Flashcards was invalid.");
        } catch (Exception e) {
            logger.error("Flashcard generation failed: {}", e.getMessage());
            throw new RuntimeException("AI Flashcard generation failed: " + e.getMessage());
        }
    }

    // ===== C. AI COVER LETTER GENERATOR (Pro) =====

    public Map<String, Object> generateCoverLetter(String parsedResume, String jobDescription) {
        String systemPrompt = "You are an elite career strategist writing a custom cover letter based on the applicant's resume and a target job description.\n\n" +
                "CRITICAL RULES:\n" +
                "1. Explicitly mention the target Company Name and the exact Job Title in the first paragraph.\n" +
                "2. Select 2-3 specific technical skills mentioned in the Job Description and write a paragraph explaining how the candidate used those exact skills in their past experience.\n" +
                "3. Write completely fluent, finalized, and highly professional paragraphs. NEVER output words like 'para 1', 'para 2', or '[insert here]'.\n\n" +
                "Output ONLY a valid JSON object. Do not wrap it in markdown block quotes. Use exactly this schema:\n" +
                "{\n" +
                "  \"subject_line\": \"An attention-grabbing email subject line\",\n" +
                "  \"body_paragraphs\": [\n" +
                "    \"The complete first paragraph text...\",\n" +
                "    \"The complete second paragraph text detailing skills...\",\n" +
                "    \"The complete closing paragraph with a call to action...\"\n" +
                "  ]\n" +
                "}";

        String fullPrompt = systemPrompt + "\n\n" +
                "=== CANDIDATE RESUME ===\n" + parsedResume + "\n\n" +
                "=== TARGET JOB DESCRIPTION ===\n" + jobDescription;

        try {
            String raw = callGeminiForRawText(fullPrompt);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
            throw new RuntimeException("AI response for Cover Letter was invalid.");
        } catch (Exception e) {
            logger.error("Cover letter generation failed: {}", e.getMessage());
            throw new RuntimeException("AI Cover Letter generation failed: " + e.getMessage());
        }
    }

    // ===== D. COMPETITIVE RANK PREDICTOR (Pro) =====

    public Map<String, Object> predictCompetitiveRank(String parsedResume, String jobDescription) {
        String prompt = "Simulate an applicant pool of 200 candidates for this job description. " +
                "Compare the provided resume against this simulated pool.\n\n" +
                "Resume:\n" + parsedResume + "\n\n" +
                "Job Description:\n" + jobDescription + "\n\n" +
                "Return ONLY valid JSON. Do NOT wrap in markdown code blocks.\n" +
                "Return a JSON object: { \"estimated_percentile\": 82, " +
                "\"top_competitor_advantage\": \"80% of applicants have AWS certification, which is missing here.\", " +
                "\"quick_win_recommendation\": \"...\" }";

        try {
            String raw = callGeminiForRawText(prompt);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
            throw new RuntimeException("AI response for Rank Prediction was invalid.");
        } catch (Exception e) {
            logger.error("Competitive rank prediction failed: {}", e.getMessage());
            throw new RuntimeException("AI Rank Prediction failed: " + e.getMessage());
        }
    }

    // ===== E. CHROME EXTENSION QUICK SCAN =====

    public Map<String, Object> quickScan(String resumeText, String jobDescriptionText) {
        String prompt = "You are an ATS expert. Compare the provided resume against the job description. " +
                "Return a match percentage and a list of missing keywords that the resume should include.\n\n" +
                "Resume:\n" + resumeText + "\n\n" +
                "Job Description:\n" + jobDescriptionText + "\n\n" +
                "Return ONLY valid JSON. Do NOT wrap in markdown code blocks.\n" +
                "Return JSON: { \"matchPercentage\": 75, \"missingKeywords\": [\"keyword1\", \"keyword2\"] }";

        try {
            String raw = callGeminiForRawText(prompt);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
            throw new RuntimeException("AI response for Quick Scan was invalid.");
        } catch (Exception e) {
            logger.error("Quick scan failed: {}", e.getMessage());
            throw new RuntimeException("AI Quick Scan failed: " + e.getMessage());
        }
    }

    // ===== INTERNAL HELPERS =====

    private String callGeminiForRawText(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new GeminiAuthException("Gemini API Key is missing. Cannot call API.");
        }
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent?key=" + apiKey;


        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> contents = new HashMap<>();
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", prompt);
        contents.put("parts", List.of(parts));
        requestBody.put("contents", List.of(contents));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> responseParts = (List<Map<String, Object>>) content.get("parts");
                    return (String) responseParts.get(0).get("text");
                }
            }
        } catch (Exception e) {
            logger.error("Error in callGeminiForRawText: {}", e.getMessage());
        }
        return "";
    }

    private String extractJson(String raw) {
        if (raw == null || raw.trim().isEmpty()) return null;
        
        // Remove markdown code block markers if present
        String cleaned = raw.replaceAll("```json", "").replaceAll("```", "").trim();
        
        int startIdx = cleaned.indexOf("{");
        int endIdx = cleaned.lastIndexOf("}");
        
        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
            return cleaned.substring(startIdx, endIdx + 1);
        }
        
        logger.error("Could not find valid JSON object in response: {}", raw.length() > 500 ? raw.substring(0, 500) : raw);
        return null;
    }


    private String extractJsonArray(String raw) {
        if (raw == null || raw.isEmpty()) return null;
        int startIdx = raw.indexOf("[");
        int endIdx = raw.lastIndexOf("]");
        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
            return raw.substring(startIdx, endIdx + 1);
        }
        logger.error("Could not find valid JSON array in response: {}", raw.substring(0, Math.min(200, raw.length())));
        return null;
    }
}
