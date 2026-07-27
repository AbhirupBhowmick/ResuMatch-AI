package com.resumatch.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumatch.exception.GeminiAuthException;
import com.resumatch.model.ResumeAnalysisResponse;
import com.resumatch.prompt.CoverLetterPrompt;
import com.resumatch.prompt.JobMatchPrompt;
import com.resumatch.prompt.ResumeAnalysisPrompt;
import com.resumatch.prompt.SharedRecruiterInstructions;
import com.resumatch.util.JsonParsingUtils;
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

    private volatile List<String> cachedSupportedModels = null;
    private volatile long lastModelFetchTime = 0;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.error("Gemini API Key is MISSING!");
            throw new GeminiAuthException("Gemini API Key is not configured.");
        }
        String maskedKey = apiKey.length() > 4 ? apiKey.substring(0, 4) + "..." : "****";
        logger.info("Gemini Service Initialized. Key: {}, Configured Model: {}", maskedKey, configuredModel);
    }

    public List<String> fetchSupportedModels() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return Collections.emptyList();
        }
        long now = System.currentTimeMillis();
        if (cachedSupportedModels != null && (now - lastModelFetchTime < 3600000)) { // Cache for 1 hour
            return cachedSupportedModels;
        }
        String listUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(listUrl, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("models")) {
                List<Map<String, Object>> modelsList = (List<Map<String, Object>>) body.get("models");
                List<String> validModels = new ArrayList<>();
                for (Map<String, Object> m : modelsList) {
                    List<String> methods = (List<String>) m.get("supportedGenerationMethods");
                    if (methods != null && methods.contains("generateContent")) {
                        String rawName = (String) m.get("name");
                        if (rawName != null) {
                            String modelName = rawName.replace("models/", "");
                            validModels.add(modelName);
                        }
                    }
                }
                logger.info("Google ModelService ListModels returned supported generateContent models: {}", validModels);
                cachedSupportedModels = validModels;
                lastModelFetchTime = now;
                return validModels;
            }
        } catch (Exception e) {
            logger.warn("Failed to fetch models dynamically from ListModels API: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    // ===== 1. RECRUITER-GRADE RESUME ANALYSIS =====

    public ResumeAnalysisResponse analyzeResume(String parsedText, String industry, String experienceLevel) {
        if (parsedText == null || parsedText.trim().isEmpty()) {
            throw new IllegalArgumentException("Resume text is empty. Please upload a valid PDF or DOCX file.");
        }

        logger.info("Analyzing resume for industry: {}. Experience: {}. Text length: {}", industry, experienceLevel, parsedText.length());

        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        String prompt = ResumeAnalysisPrompt.buildPrompt(parsedText, industry, experienceLevel);

        try {
            String rawText = executeGeminiQuery(prompt, systemInstruction);
            
            if (rawText != null && !rawText.startsWith("ERROR_")) {
                String cleaned = extractJson(rawText);
                if (cleaned != null) {
                    ResumeAnalysisResponse response = objectMapper.readValue(cleaned, ResumeAnalysisResponse.class);
                    
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
            }
            logger.warn("Raw Gemini AI response was not parsable JSON. Creating fallback structured response based on Keyword Engine.");
        } catch (Exception e) {
            logger.error("Error parsing Gemini API JSON response: {}", e.getMessage());
        }

        return createFallbackAnalysisResponse(parsedText, industry);
    }

    private ResumeAnalysisResponse createFallbackAnalysisResponse(String parsedText, String industry) {
        KeywordEngineService.KeywordAnalysisResult kwResult = keywordEngineService.analyzeResumeKeywords(parsedText, industry);
        int score = kwResult.getMatchPercentage();

        ResumeAnalysisResponse fallback = ResumeAnalysisResponse.builder()
                .overallScore(score)
                .atsScore(score)
                .roleMatch(score)
                .executiveSummary("Resume keyword alignment audit completed for " + (industry != null ? industry : "target role") + ".")
                .firstImpression("Keyword audit completed based on resume text.")
                .strengths(kwResult.getMatchedKeywords())
                .weaknesses(kwResult.getMissingKeywords().isEmpty() ? List.of() : List.of("Missing industry keywords: " + String.join(", ", kwResult.getMissingKeywords())))
                .missingKeywords(kwResult.getMissingKeywords())
                .matchedKeywords(kwResult.getMatchedKeywords())
                .recommendedKeywords(kwResult.getRecommendedKeywords())
                .technicalSkills(kwResult.getMatchedKeywords())
                .softSkills(List.of())
                .priorityFixes(kwResult.getMissingKeywords().isEmpty() ? List.of() : List.of("Incorporate missing keywords into experience bullets"))
                .hiringRecommendation(score >= 70 ? "Hire" : "Review")
                .interviewProbability(score)
                .salaryReadiness("Market Competitive")
                .extractedText(parsedText)
                .score(score)
                .improvedSummary("Resume analyzed based on keyword match score.")
                .jobSuggestions(List.of(industry != null ? industry : "Software Engineering"))
                .build();

        fallback.syncLegacyFields();
        return fallback;
    }

    // ===== 2. STAR METHOD BULLET REWRITE =====

    public Map<String, Object> generateStarRewrite(String resumeBullet, String jobDescription) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        
        String prompt = "Resume Snippet: " + resumeBullet + "\n\n" +
                "Job Context: " + jobDescription + "\n\n" +
                "Rewrite this bullet using Google's X-Y-Z and STAR formula.\n" +
                "STRICT INSTRUCTION: Return ONLY a raw JSON object with keys \"original\", \"optimized_bullet\", and \"reason\". Do not use markdown code block syntax.";

        try {
            String raw = executeGeminiQuery(prompt, systemInstruction);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            logger.error("STAR rewrite failed: {}", e.getMessage());
        }

        return Map.of(
            "original", resumeBullet != null ? resumeBullet : "",
            "optimized_bullet", resumeBullet != null ? resumeBullet : "",
            "reason", "Could not transform bullet point via AI service."
        );
    }

    // ===== BATCH STAR METHOD BULLET REWRITES (1 API CALL) =====

    public List<Map<String, String>> generateBatchStarRewrites(List<String> bullets, String jobContext) {
        if (bullets == null || bullets.isEmpty()) {
            return Collections.emptyList();
        }

        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Job Context: ").append(jobContext != null ? jobContext : "Target Role").append("\n\n");
        promptBuilder.append("Rewrite each of the following resume bullets using Google's X-Y-Z and STAR formula (Situation, Task, Action, Result).\n");
        promptBuilder.append("STRICT INSTRUCTION: Return ONLY a raw JSON array of objects, where each object has keys \"original\" and \"improved\". Do not use markdown code block syntax.\n\n");
        promptBuilder.append("Bullets to rewrite:\n");
        for (int i = 0; i < bullets.size(); i++) {
            promptBuilder.append(i + 1).append(". ").append(bullets.get(i)).append("\n");
        }

        try {
            String raw = executeGeminiQuery(promptBuilder.toString(), systemInstruction);
            String cleaned = extractJsonArray(raw);
            if (cleaned != null) {
                List<Map<String, String>> results = objectMapper.readValue(cleaned, new TypeReference<List<Map<String, String>>>() {});
                if (results != null && !results.isEmpty()) {
                    return results;
                }
            }
        } catch (Exception e) {
            logger.error("Batch STAR rewrite failed: {}", e.getMessage());
        }

        List<Map<String, String>> fallbackList = new ArrayList<>();
        for (String bullet : bullets) {
            fallbackList.add(Map.of("original", bullet, "improved", bullet));
        }
        return fallbackList;
    }

    // ===== 3. SMART INTERVIEW FLASHCARDS =====

    public List<Map<String, Object>> generateFlashcards(String jobDescription) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;

        String prompt = "Job Description: " + jobDescription + "\n\n" +
                "Generate exactly 5 technical/behavioral interview questions.\n" +
                "STRICT INSTRUCTION: Return ONLY a raw JSON array of 5 objects containing keys \"question\", \"difficulty\", \"recruiter_perspective\". Do not use markdown code block syntax.";

        try {
            String raw = executeGeminiQuery(prompt, systemInstruction);
            String cleaned = extractJsonArray(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<List<Map<String, Object>>>() {});
            }
        } catch (Exception e) {
            logger.error("Flashcard generation failed: {}", e.getMessage());
        }

        return Collections.emptyList();
    }

    // ===== 4. AI COVER LETTER GENERATOR =====

    public Map<String, Object> generateCoverLetter(String parsedResume, String jobDescription) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        String prompt = CoverLetterPrompt.buildPrompt(parsedResume, jobDescription, "Target Company", "Target Role");

        try {
            String raw = executeGeminiQuery(prompt, systemInstruction);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            logger.error("Cover letter generation failed: {}", e.getMessage());
            throw new RuntimeException("Cover letter generation failed: " + e.getMessage());
        }

        throw new RuntimeException("Failed to parse Gemini response for cover letter.");
    }

    // ===== 5. COMPETITIVE RANK PREDICTOR =====

    public Map<String, Object> predictCompetitiveRank(String parsedResume, String jobDescription) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;

        String prompt = "Simulate an applicant pool of 200 candidates competing for this role.\n" +
                "Resume:\n" + parsedResume + "\n\n" +
                "Job Description:\n" + jobDescription + "\n\n" +
                "STRICT INSTRUCTION: Return ONLY a raw JSON object with keys \"estimated_percentile\", \"top_competitor_advantage\", \"quick_win_recommendation\".";

        try {
            String raw = executeGeminiQuery(prompt, systemInstruction);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            logger.error("Competitive rank prediction failed: {}", e.getMessage());
            throw new RuntimeException("Competitive rank prediction failed: " + e.getMessage());
        }

        throw new RuntimeException("Failed to generate competitive rank prediction.");
    }

    // ===== 6. CHROME EXTENSION QUICK SCAN =====

    public Map<String, Object> quickScan(String resumeText, String jobDescriptionText) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;

        String prompt = "Resume:\n" + resumeText + "\n\n" +
                "Job Description:\n" + jobDescriptionText + "\n\n" +
                "STRICT INSTRUCTION: Return ONLY a raw JSON object with keys \"matchPercentage\" and \"missingKeywords\".";

        try {
            String raw = executeGeminiQuery(prompt, systemInstruction);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            logger.error("Quick scan failed: {}", e.getMessage());
        }

        KeywordEngineService.KeywordAnalysisResult kwResult = keywordEngineService.analyzeResumeKeywords(resumeText, "SOFTWARE_ENGINEER");
        return Map.of(
            "matchPercentage", kwResult.getMatchPercentage(),
            "missingKeywords", kwResult.getMissingKeywords()
        );
    }

    // ===== 7. JOB MATCH X-RAY SCAN =====

    public Map<String, Object> analyzeJobMatch(String resumeText, String jobDescriptionText, String companyName, String roleTitle) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        String prompt = JobMatchPrompt.buildPrompt(resumeText, jobDescriptionText, companyName, roleTitle);

        try {
            String raw = executeGeminiQuery(prompt, systemInstruction);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            logger.error("Job Match scan failed: {}", e.getMessage());
        }

        KeywordEngineService.KeywordAnalysisResult kwResult = keywordEngineService.analyzeResumeKeywords(resumeText, "SOFTWARE_ENGINEER");
        Map<String, Object> realMap = new HashMap<>();
        realMap.put("overallMatchScore", kwResult.getMatchPercentage());
        realMap.put("atsMatchScore", kwResult.getMatchPercentage());
        realMap.put("skillMatchScore", kwResult.getMatchPercentage());
        realMap.put("experienceMatchScore", kwResult.getMatchPercentage());
        realMap.put("educationMatchScore", kwResult.getMatchPercentage());
        realMap.put("keywordMatchScore", kwResult.getMatchPercentage());
        realMap.put("matchReasoning", "Keyword analysis evaluated against job description requirements.");
        realMap.put("matchedSkills", kwResult.getMatchedKeywords());
        realMap.put("missingSkills", kwResult.getMissingKeywords());
        realMap.put("missingKeywords", kwResult.getMissingKeywords());
        realMap.put("expectedAtsIncrease", "+10 Points");
        return realMap;
    }

    // ===== CENTRALIZED ENGINE WITH RESPONSE_MIME_TYPE: APPLICATION/JSON =====

    public String executeGeminiQuery(String prompt, String systemInstruction) {
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

        List<String> apiVersions = List.of("v1beta", "v1");
        String lastError = "ERROR_EMPTY_RESPONSE";

        for (String currentModel : modelsToTry) {
            for (String apiVer : apiVersions) {
                String url = "https://generativelanguage.googleapis.com/" + apiVer + "/models/" + currentModel + ":generateContent?key=" + apiKey;
                logger.info("Executing Gemini API request. Version: {}, Model: {}", apiVer, currentModel);

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

                // Force Gemini REST API to return application/json
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
                                        logger.info("Gemini API call succeeded using version: {}, model: {}", apiVer, currentModel);
                                        return (String) responseParts.get(0).get("text");
                                    }
                                }
                            }
                        }
                        if (body.containsKey("error")) {
                            Map<String, Object> error = (Map<String, Object>) body.get("error");
                            String errorMsg = String.valueOf(error.get("message"));
                            logger.warn("Gemini API version {} model {} returned error: {}", apiVer, currentModel, errorMsg);
                            lastError = "ERROR_API_" + errorMsg;
                            if (errorMsg.contains("NOT_FOUND") || errorMsg.contains("404") || errorMsg.contains("not found")) {
                                continue;
                            }
                            return lastError;
                        }
                    }
                } catch (Exception e) {
                    logger.warn("Gemini API call failed for version {} model {}: {}", apiVer, currentModel, e.getMessage());
                    lastError = "ERROR_EXCEPTION_" + e.getMessage();
                    if (e.getMessage() != null && (e.getMessage().contains("404") || e.getMessage().contains("NOT_FOUND") || e.getMessage().contains("not found"))) {
                        continue;
                    }
                }
            }
        }

        return lastError;
    }

    public String extractJson(String raw) {
        return JsonParsingUtils.extractJsonObject(raw);
    }

    public String extractJsonArray(String raw) {
        return JsonParsingUtils.extractJsonArray(raw);
    }
}
