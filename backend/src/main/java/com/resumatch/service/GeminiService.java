package com.resumatch.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumatch.exception.GeminiAuthException;
import com.resumatch.model.ResumeAnalysisResponse;
import com.resumatch.prompt.CoverLetterPrompt;
import com.resumatch.prompt.JobTailorPrompt;
import com.resumatch.prompt.ResumeAnalysisPrompt;
import com.resumatch.prompt.SharedRecruiterInstructions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final KeywordEngineService keywordEngineService;

    @Value("${gemini.model:${GEMINI_MODEL:gemini-2.5-flash-lite}}")
    private String configuredModel;

    @Value("${gemini.api.key}")
    private String apiKey;

    public GeminiService(KeywordEngineService keywordEngineService) {
        this.keywordEngineService = keywordEngineService;
    }

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.error("Gemini API Key is MISSING!");
            throw new GeminiAuthException("Gemini API Key is not configured.");
        }
        String maskedKey = apiKey.length() > 4 ? apiKey.substring(0, 4) + "..." : "****";
        logger.info("Gemini Service Initialized. Key: {}, Configured Model: {}", maskedKey, configuredModel);
    }

    // ===== 1. RECRUITER-GRADE RESUME ANALYSIS =====

    public ResumeAnalysisResponse analyzeResume(String parsedText, String industry, String experienceLevel) {
        if (parsedText == null || parsedText.trim().isEmpty()) {
            logger.warn("Parsed text is empty, using placeholder for analysis.");
            parsedText = "Extracted text was empty. Please check the PDF/DOCX file.";
        }

        logger.info("Analyzing resume for industry: {}. Experience: {}. Text length: {}", industry, experienceLevel, parsedText.length());

        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        String prompt = ResumeAnalysisPrompt.buildPrompt(parsedText, industry, experienceLevel);

        try {
            String jsonText = callGemini(prompt, systemInstruction);
            
            if (jsonText.startsWith("ERROR_")) {
                throw new RuntimeException(jsonText);
            }

            String cleaned = extractJson(jsonText);
            if (cleaned != null) {
                ResumeAnalysisResponse response = objectMapper.readValue(cleaned, ResumeAnalysisResponse.class);
                
                // Keyword Engine Analysis Integration
                KeywordEngineService.KeywordAnalysisResult kwResult = keywordEngineService.analyzeResumeKeywords(parsedText, industry);
                if (response.getMatchedKeywords() == null || response.getMatchedKeywords().isEmpty()) {
                    response.setMatchedKeywords(kwResult.getMatchedKeywords());
                }
                if (response.getRecommendedKeywords() == null || response.getRecommendedKeywords().isEmpty()) {
                    response.setRecommendedKeywords(kwResult.getRecommendedKeywords());
                }
                if (response.getMissingKeywords() == null || response.getMissingKeywords().isEmpty()) {
                    response.setMissingKeywords(kwResult.getMissingKeywords());
                }

                response.setExtractedText(parsedText);
                response.syncLegacyFields();
                return response;
            }
            throw new RuntimeException("AI response was not a valid JSON object. Raw snippet: " + (jsonText.length() > 60 ? jsonText.substring(0, 60) + "..." : jsonText));
        } catch (Exception e) {
            logger.error("Error calling Gemini API for analysis: {}", e.getMessage());
            throw new RuntimeException("AI analysis failed: " + e.getMessage());
        }
    }

    // ===== 2. STAR METHOD BULLET REWRITE =====

    public Map<String, Object> generateStarRewrite(String resumeBullet, String jobDescription) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        
        String prompt = "Resume Snippet: " + resumeBullet + "\n\n" +
                "Job Context: " + jobDescription + "\n\n" +
                "Rewrite this bullet using Google's X-Y-Z and STAR formula.\n" +
                "Return ONLY a JSON object: { \"original\": \"...\", \"optimized_bullet\": \"Generated high-impact STAR bullet point here\", \"reason\": \"Explanation of improvement\" }";

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

    // ===== 3. SMART INTERVIEW FLASHCARDS =====

    public List<Map<String, Object>> generateFlashcards(String jobDescription) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;

        String prompt = "Job Description: " + jobDescription + "\n\n" +
                "Generate exactly 5 technical/behavioral interview questions.\n" +
                "Return ONLY a JSON array of 5 objects: [ { \"question\": \"...\", \"difficulty\": \"Medium/Hard\", \"recruiter_perspective\": \"...\" } ]";

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

    // ===== 4. AI COVER LETTER GENERATOR =====

    public Map<String, Object> generateCoverLetter(String parsedResume, String jobDescription) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        String prompt = CoverLetterPrompt.buildPrompt(parsedResume, jobDescription, "Target Company", "Target Role");

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

    // ===== 5. COMPETITIVE RANK PREDICTOR =====

    public Map<String, Object> predictCompetitiveRank(String parsedResume, String jobDescription) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;

        String prompt = "Simulate an applicant pool of 200 candidates competing for this role.\n" +
                "Resume:\n" + parsedResume + "\n\n" +
                "Job Description:\n" + jobDescription + "\n\n" +
                "Return ONLY a JSON object: { \"estimated_percentile\": 85, \"top_competitor_advantage\": \"...\", \"quick_win_recommendation\": \"...\" }";

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

    // ===== 6. CHROME EXTENSION QUICK SCAN =====

    public Map<String, Object> quickScan(String resumeText, String jobDescriptionText) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;

        String prompt = "Resume:\n" + resumeText + "\n\n" +
                "Job Description:\n" + jobDescriptionText + "\n\n" +
                "Return ONLY a JSON object: { \"matchPercentage\": 78, \"missingKeywords\": [\"keyword1\", \"keyword2\"] }";

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

    // ===== 7. JOB TAILOR X-RAY SCAN =====

    public Map<String, Object> analyzeJobTailor(String resumeText, String jobDescriptionText) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        String prompt = JobTailorPrompt.buildPrompt(resumeText, jobDescriptionText);

        try {
            String raw = callGemini(prompt, systemInstruction);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
            throw new RuntimeException("AI response for Job Tailor was invalid.");
        } catch (Exception e) {
            logger.error("Job Tailor scan failed: {}", e.getMessage());
            throw new RuntimeException("Job Tailor AI failed: " + e.getMessage());
        }
    }

    // ===== CENTRALIZED GEMINI ENGINE WITH AUTOMATIC MODEL FALLBACK =====

    private String callGemini(String prompt, String systemInstruction) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new GeminiAuthException("Gemini API Key is missing.");
        }

        List<String> modelsToTry = new ArrayList<>();
        if (configuredModel != null && !configuredModel.isBlank()) {
            modelsToTry.add(configuredModel);
        }
        for (String fallback : List.of("gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite")) {
            if (!modelsToTry.contains(fallback)) {
                modelsToTry.add(fallback);
            }
        }

        String lastError = "ERROR_EMPTY_RESPONSE";

        for (String currentModel : modelsToTry) {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + currentModel + ":generateContent?key=" + apiKey;
            logger.info("Sending request to Gemini API. Model: {}", currentModel);

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
                            
                            if (firstCandidate.containsKey("finishReason") && "SAFETY".equals(firstCandidate.get("finishReason"))) {
                               logger.error("Gemini response was blocked by safety filters on model {}.", currentModel);
                               return "ERROR_SAFETY_BLOCKED";
                            }

                            if (firstCandidate.containsKey("content")) {
                                Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
                                List<Map<String, Object>> responseParts = (List<Map<String, Object>>) content.get("parts");
                                if (responseParts != null && !responseParts.isEmpty()) {
                                    logger.info("Gemini API call succeeded using model: {}", currentModel);
                                    return (String) responseParts.get(0).get("text");
                                }
                            }
                        }
                    }
                    if (body.containsKey("error")) {
                        Map<String, Object> error = (Map<String, Object>) body.get("error");
                        String errorMsg = String.valueOf(error.get("message"));
                        logger.warn("Gemini API model {} returned error: {}", currentModel, errorMsg);
                        lastError = "ERROR_API_" + errorMsg;
                        if (errorMsg.contains("NOT_FOUND") || errorMsg.contains("404") || errorMsg.contains("not found")) {
                            continue; // Try next model in fallback list
                        }
                        return lastError;
                    }
                }
            } catch (Exception e) {
                logger.warn("Gemini API call failed for model {}: {}", currentModel, e.getMessage());
                lastError = "ERROR_EXCEPTION_" + e.getMessage();
                if (e.getMessage() != null && (e.getMessage().contains("404") || e.getMessage().contains("NOT_FOUND") || e.getMessage().contains("not found"))) {
                    continue; // Try next model in fallback list
                }
            }
        }

        return lastError;
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
