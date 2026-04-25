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
    private static final String MODEL = "gemini-1.5-flash-latest";

    @Value("${gemini.api.key}")
    private String apiKey;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.error("Gemini API Key is MISSING!");
            throw new GeminiAuthException("Gemini API Key is not configured.");
        }
        String maskedKey = apiKey.length() > 4 ? apiKey.substring(0, 4) + "..." : "****";
        logger.info("Gemini Key Loaded: " + maskedKey + " using model: " + MODEL);
    }


    // ===== RESUME ANALYSIS (existing) =====

    public ResumeAnalysisResponse analyzeResume(String parsedText, String industry, String experienceLevel) {
        if (parsedText == null || parsedText.trim().isEmpty()) {
            logger.warn("Parsed text is empty, using placeholder for analysis.");
            parsedText = "Extracted text was empty. Please check the PDF/DOCX file.";
        }

        logger.info("Analyzing resume for industry: {}. Experience: {}. Text length: {}", industry, experienceLevel, parsedText.length());

        String systemInstruction = "You are an elite ATS and technical recruiter evaluator. " +
                "Evaluate the resume based on the provided industry and experience level. " +
                "Return result as STRICT JSON.";

        String prompt = "Candidate targets '" + industry + "' industry with experience level '" + experienceLevel + "'.\n\n" +
                "Evaluate and return exactly this JSON schema:\n" +
                "{\n" +
                "  \"score\": integer (0-100),\n" +
                "  \"strengths\": [\"string\"],\n" +
                "  \"missingKeywords\": [\"string\"],\n" +
                "  \"jobSuggestions\": [\"string\"],\n" +
                "  \"improvedSummary\": \"string\"\n" +
                "}\n\n" +
                "Resume Text:\n" + parsedText;

        try {
            String jsonText = callGemini(prompt, systemInstruction);
            
            if (jsonText.startsWith("ERROR_")) {
                throw new RuntimeException(jsonText);
            }

            String cleaned = extractJson(jsonText);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, ResumeAnalysisResponse.class);
            }
            throw new RuntimeException("AI response was not a valid JSON object. Raw: " + (jsonText.length() > 50 ? jsonText.substring(0, 50) + "..." : jsonText));
        } catch (Exception e) {
            logger.error("Error calling Gemini API for analysis: {}", e.getMessage());
            throw new RuntimeException("AI analysis failed: " + e.getMessage());
        }
    }

    // ===== A. STAR METHOD GENERATOR (Hunter+) =====

    public Map<String, Object> generateStarRewrite(String resumeBullet, String jobDescription) {
        String systemInstruction = "You are an elite Tech Recruiter. Rewrite resume bullets using the STAR method. Return ONLY valid JSON.";
        
        String prompt = "Resume Snippet: " + resumeBullet + "\n\n" +
                "Job Context: " + jobDescription + "\n\n" +
                "Return JSON: { \"original\": \"...\", \"optimized_bullet\": \"Actual generated high-impact bullet here\" }";

        try {
            String raw = callGemini(prompt, systemInstruction);
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
        String systemInstruction = "You are a Senior Engineering Manager. Generate exactly 5 interview questions. Return ONLY a JSON array.";

        String prompt = "Job Description: " + jobDescription + "\n\n" +
                "Return a JSON array of objects: [ { \"question\": \"...\", \"difficulty\": \"Medium/Hard\", " +
                "\"recruiter_perspective\": \"...\" } ]";

        try {
            String raw = callGemini(prompt, systemInstruction);
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
        String systemInstruction = "You are an elite career strategist writing custom cover letters. Return result as STRICT JSON.";

        String prompt = "=== CANDIDATE RESUME ===\n" + parsedResume + "\n\n" +
                "=== TARGET JOB DESCRIPTION ===\n" + jobDescription + "\n\n" +
                "Use exactly this schema:\n" +
                "{\n" +
                "  \"subject_line\": \"An attention-grabbing email subject line\",\n" +
                "  \"body_paragraphs\": [\n" +
                "    \"Paragraph 1...\",\n" +
                "    \"Paragraph 2...\",\n" +
                "    \"Paragraph 3...\"\n" +
                "  ]\n" +
                "}";

        try {
            String raw = callGemini(prompt, systemInstruction);
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
        String systemInstruction = "Simulate an applicant pool of 200 candidates. Compare the provided resume. Return result as STRICT JSON.";

        String prompt = "Resume:\n" + parsedResume + "\n\n" +
                "Job Description:\n" + jobDescription + "\n\n" +
                "Return a JSON object: { \"estimated_percentile\": 82, \"top_competitor_advantage\": \"...\", \"quick_win_recommendation\": \"...\" }";

        try {
            String raw = callGemini(prompt, systemInstruction);
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
        String systemInstruction = "You are an ATS expert. Return match percentage and missing keywords as STRICT JSON.";

        String prompt = "Resume:\n" + resumeText + "\n\n" +
                "Job Description:\n" + jobDescriptionText + "\n\n" +
                "Return JSON: { \"matchPercentage\": 75, \"missingKeywords\": [\"keyword1\", \"keyword2\"] }";

        try {
            String raw = callGemini(prompt, systemInstruction);
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

    private String callGemini(String prompt, String systemInstruction) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new GeminiAuthException("Gemini API Key is missing.");
        }
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent?key=" + apiKey;

        Map<String, Object> requestBody = new HashMap<>();
        
        if (systemInstruction != null) {
            Map<String, Object> sysInst = new HashMap<>();
            Map<String, Object> sysParts = new HashMap<>();
            sysParts.put("text", systemInstruction);
            sysInst.put("parts", List.of(sysParts));
            requestBody.put("system_instruction", sysInst);
        }

        Map<String, Object> contents = new HashMap<>();
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", prompt);
        contents.put("parts", List.of(parts));
        requestBody.put("contents", List.of(contents));

        Map<String, Object> genConfig = new HashMap<>();
        genConfig.put("response_mime_type", "application/json");
        requestBody.put("generationConfig", genConfig);

        // Safety Settings to prevent false positives
        List<Map<String, Object>> safetySettings = List.of(
            Map.of("category", "HARM_CATEGORY_HARASSMENT", "threshold", "BLOCK_NONE"),
            Map.of("category", "HARM_CATEGORY_HATE_SPEECH", "threshold", "BLOCK_NONE"),
            Map.of("category", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold", "BLOCK_NONE"),
            Map.of("category", "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold", "BLOCK_NONE")
        );
        requestBody.put("safetySettings", safetySettings);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null) {
                if (body.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> firstCandidate = candidates.get(0);
                        
                        // Check for safety block
                        if (firstCandidate.containsKey("finishReason") && "SAFETY".equals(firstCandidate.get("finishReason"))) {
                           logger.error("Gemini response was blocked by safety filters.");
                           return "ERROR_SAFETY_BLOCKED";
                        }

                        if (firstCandidate.containsKey("content")) {
                            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
                            List<Map<String, Object>> responseParts = (List<Map<String, Object>>) content.get("parts");
                            if (responseParts != null && !responseParts.isEmpty()) {
                                return (String) responseParts.get(0).get("text");
                            }
                        }
                    }
                }
                if (body.containsKey("error")) {
                    Map<String, Object> error = (Map<String, Object>) body.get("error");
                    logger.error("Gemini API returned error: {}", error);
                    return "ERROR_API_" + error.get("message");
                }
            }
            logger.error("Empty or invalid response from Gemini: {}", body);
            return "ERROR_EMPTY_RESPONSE";
        } catch (Exception e) {
            logger.error("Gemini API Call Failed: {}", e.getMessage());
            return "ERROR_EXCEPTION_" + e.getMessage();
        }
    }

    private String extractJson(String raw) {
        if (raw == null || raw.trim().isEmpty()) return null;
        int startIdx = raw.indexOf("{");
        int endIdx = raw.lastIndexOf("}");
        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
            return raw.substring(startIdx, endIdx + 1);
        }
        logger.error("Could not find valid JSON object in response.");
        return null;
    }

    private String extractJsonArray(String raw) {
        if (raw == null || raw.isEmpty()) return null;
        int startIdx = raw.indexOf("[");
        int endIdx = raw.lastIndexOf("]");
        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
            return raw.substring(startIdx, endIdx + 1);
        }
        logger.error("Could not find valid JSON array in response.");
        return null;
    }
}
