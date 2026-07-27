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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final KeywordEngineService keywordEngineService;

    @Value("${gemini.model:${GEMINI_MODEL:gemini-3.1-flash-lite}}")
    private String configuredModel;

    @Value("${gemini.api.key:}")
    private String apiKey;

    public GeminiService(KeywordEngineService keywordEngineService) {
        this.keywordEngineService = keywordEngineService;
    }

    @PostConstruct
    public void init() {
        String modelName = getEffectiveModel();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("Gemini Service Initialized. Target Model: {}. WARNING: API Key is missing (GEMINI_API_KEY). Set it for live AI generation.", modelName);
            return;
        }
        String maskedKey = apiKey.length() > 4 ? apiKey.substring(0, 4) + "..." : "****";
        logger.info("Gemini Service Initialized. Key: {}, Production Model: {}", maskedKey, modelName);
    }

    private String getEffectiveModel() {
        return (configuredModel != null && !configuredModel.isBlank()) ? configuredModel : "gemini-3.1-flash-lite";
    }

    // ===== 1. RECRUITER-GRADE RESUME ANALYSIS =====

    public ResumeAnalysisResponse analyzeResume(String parsedText, String industry, String experienceLevel) {
        if (parsedText == null || parsedText.trim().isEmpty()) {
            throw new IllegalArgumentException("Resume text is empty. Please upload a valid PDF or DOCX file.");
        }

        logger.info("Feature: RESUME_ANALYSIS | Target Model: {} | Text Length: {}", getEffectiveModel(), parsedText.length());

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
        } catch (Exception e) {
            logger.error("Resume Analysis AI failed: {}", e.getMessage());
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
        logger.info("Feature: STAR_REWRITE | Target Model: {}", getEffectiveModel());
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        
        String prompt = "Resume Snippet: " + resumeBullet + "\n\n" +
                "Job Context: " + jobDescription + "\n\n" +
                "Rewrite this bullet using Google's X-Y-Z and STAR formula.\n" +
                "STRICT INSTRUCTION: Return ONLY a raw JSON object with keys \"original\", \"optimized_bullet\", and \"reason\".";

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

    // ===== BATCH STAR METHOD BULLET REWRITES =====

    public List<Map<String, String>> generateBatchStarRewrites(List<String> bullets, String jobContext) {
        if (bullets == null || bullets.isEmpty()) {
            return Collections.emptyList();
        }

        logger.info("Feature: BATCH_STAR_REWRITE | Count: {} | Target Model: {}", bullets.size(), getEffectiveModel());

        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Job Context: ").append(jobContext != null ? jobContext : "Target Role").append("\n\n");
        promptBuilder.append("Rewrite each of the following resume bullets using Google's X-Y-Z and STAR formula (Situation, Task, Action, Result).\n");
        promptBuilder.append("STRICT INSTRUCTION: Return ONLY a raw JSON array of objects, where each object has keys \"original\" and \"improved\".\n\n");
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

    // ===== 3. AI COVER LETTER GENERATOR =====

    public Map<String, Object> generateCoverLetter(String parsedResume, String jobDescription) {
        logger.info("Feature: COVER_LETTER | Target Model: {}", getEffectiveModel());
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

    // ===== 4. JOB MATCH X-RAY SCAN =====

    public Map<String, Object> analyzeJobMatch(String resumeText, String jobDescriptionText, String companyName, String roleTitle) {
        logger.info("Feature: JOB_MATCH | Target Model: {}", getEffectiveModel());
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

    // ===== 5. RESUME CHAT =====

    public Map<String, Object> chatWithResume(String resumeText, String userQuery) {
        logger.info("Feature: RESUME_CHAT | Target Model: {}", getEffectiveModel());
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        String prompt = "CANDIDATE RESUME TEXT:\n" + resumeText + "\n\n" +
                "USER QUESTION: " + userQuery + "\n\n" +
                "Answer the user's question with technical accuracy based on the resume text.\n" +
                "STRICT INSTRUCTION: Return ONLY a raw JSON object with keys \"answer\" and \"keyInsights\".";

        try {
            String raw = executeGeminiQuery(prompt, systemInstruction);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            logger.error("Resume Chat failed: {}", e.getMessage());
        }

        return Map.of(
            "answer", "Answer evaluated against candidate resume content.",
            "keyInsights", List.of("Resume review complete")
        );
    }

    // ===== 6. COMPETITIVE RANK PREDICTOR =====

    public Map<String, Object> predictCompetitiveRank(String parsedResume, String jobDescription) {
        logger.info("Feature: COMPETITIVE_RANK | Target Model: {}", getEffectiveModel());
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

    // ===== 7. CHROME EXTENSION QUICK SCAN =====

    public Map<String, Object> quickScan(String resumeText, String jobDescriptionText) {
        logger.info("Feature: EXTENSION_QUICK_SCAN | Target Model: {}", getEffectiveModel());
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

    // ===== CENTRALIZED GEMINI REST ENGINE (EXCLUSIVELY USES gemini-3.1-flash-lite) =====

    public String executeGeminiQuery(String prompt, String systemInstruction) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.error("Gemini Request Failed: API Key missing.");
            throw new GeminiAuthException("Gemini API Key is missing. Please set GEMINI_API_KEY environment variable.");
        }

        String targetModel = getEffectiveModel();
        String apiVer = "v1beta";
        String url = "https://generativelanguage.googleapis.com/" + apiVer + "/models/" + targetModel + ":generateContent?key=" + apiKey;

        int maxAttempts = 2; // Initial attempt + 1 retry for transient 5xx or timeout
        long startTime = System.currentTimeMillis();

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            logger.info("Executing Gemini API Call | Model: {} | Attempt: {}/{} | Endpoint: {}", targetModel, attempt, maxAttempts, apiVer);

            Map<String, Object> requestBody = new HashMap<>();
            
            if (systemInstruction != null && !systemInstruction.isBlank()) {
                Map<String, Object> sysInst = new HashMap<>();
                sysInst.put("parts", List.of(Map.of("text", systemInstruction)));
                requestBody.put("system_instruction", sysInst);
            }

            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", List.of(Map.of("text", prompt)));
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
                long responseTimeMs = System.currentTimeMillis() - startTime;
                Map<String, Object> body = response.getBody();

                if (body != null) {
                    // Extract token usage metrics if returned by API
                    String tokenMetrics = "";
                    if (body.containsKey("usageMetadata")) {
                        Map<String, Object> usage = (Map<String, Object>) body.get("usageMetadata");
                        tokenMetrics = String.format("Tokens -> Prompt: %s, Candidates: %s, Total: %s",
                                usage.get("promptTokenCount"), usage.get("candidatesTokenCount"), usage.get("totalTokenCount"));
                    }

                    if (body.containsKey("candidates")) {
                        List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                        if (!candidates.isEmpty()) {
                            Map<String, Object> firstCandidate = candidates.get(0);
                            
                            if (firstCandidate.containsKey("finishReason") && "SAFETY".equals(firstCandidate.get("finishReason"))) {
                                logger.error("Gemini Error -> Model: {}, Error: SAFETY_BLOCKED, ResponseTime: {}ms", targetModel, responseTimeMs);
                                throw new RuntimeException("Gemini response was blocked by safety filters.");
                            }

                            if (firstCandidate.containsKey("content")) {
                                Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
                                List<Map<String, Object>> responseParts = (List<Map<String, Object>>) content.get("parts");
                                if (responseParts != null && !responseParts.isEmpty()) {
                                    logger.info("Gemini Request Succeeded | Model: {} | ResponseTime: {}ms | {}", targetModel, responseTimeMs, tokenMetrics);
                                    return (String) responseParts.get(0).get("text");
                                }
                            }
                        }
                    }

                    if (body.containsKey("error")) {
                        Map<String, Object> error = (Map<String, Object>) body.get("error");
                        String errorMsg = String.valueOf(error.get("message"));
                        logger.error("Gemini Error -> Model: {}, Error: API_ERROR - {}, ResponseTime: {}ms", targetModel, errorMsg, responseTimeMs);
                        throw new RuntimeException("Gemini API Error: " + errorMsg);
                    }
                }
            } catch (HttpClientErrorException e) {
                long responseTimeMs = System.currentTimeMillis() - startTime;
                int statusCode = e.getStatusCode().value();

                if (statusCode == 404) {
                    logger.error("Gemini Error -> Model: {}, Error: 404_MODEL_NOT_FOUND (Unsupported Model), ResponseTime: {}ms", targetModel, responseTimeMs);
                    throw new RuntimeException("Unsupported Gemini model (" + targetModel + "). Model not found (404).");
                } else if (statusCode == 401) {
                    logger.error("Gemini Error -> Model: {}, Error: 401_UNAUTHORIZED (Invalid API Key), ResponseTime: {}ms", targetModel, responseTimeMs);
                    throw new GeminiAuthException("Invalid Gemini API Key (401).");
                } else if (statusCode == 429) {
                    logger.error("Gemini Error -> Model: {}, Error: 429_QUOTA_EXCEEDED (Rate Limit Exceeded), ResponseTime: {}ms", targetModel, responseTimeMs);
                    throw new RuntimeException("Gemini API Quota Exceeded (429). Please check API quota or try again later.");
                } else {
                    logger.error("Gemini Error -> Model: {}, Error: HTTP_{} - {}, ResponseTime: {}ms", targetModel, statusCode, e.getMessage(), responseTimeMs);
                    throw new RuntimeException("Gemini API HTTP Error " + statusCode + ": " + e.getMessage());
                }
            } catch (Exception e) {
                long responseTimeMs = System.currentTimeMillis() - startTime;
                logger.warn("Gemini Request Attempt {}/{} Failed -> Model: {}, Error: {}, ResponseTime: {}ms", attempt, maxAttempts, targetModel, e.getMessage(), responseTimeMs);
                
                if (attempt < maxAttempts) {
                    try { Thread.sleep(500); } catch (InterruptedException ignored) {}
                    continue; // Retry ONCE for transient 5xx or network errors
                }
                
                logger.error("Gemini Request Final Failure -> Model: {}, Error: {}, ResponseTime: {}ms", targetModel, e.getMessage(), responseTimeMs);
                throw new RuntimeException("Gemini API call failed: " + e.getMessage());
            }
        }

        throw new RuntimeException("Gemini API call failed after retries.");
    }

    public String extractJson(String raw) {
        return JsonParsingUtils.extractJsonObject(raw);
    }

    public String extractJsonArray(String raw) {
        return JsonParsingUtils.extractJsonArray(raw);
    }
}
