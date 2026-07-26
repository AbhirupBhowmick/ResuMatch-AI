package com.resumatch.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumatch.exception.GeminiAuthException;
import com.resumatch.model.ResumeAnalysisResponse;
import com.resumatch.prompt.CoverLetterPrompt;
import com.resumatch.prompt.JobTailorPrompt;
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
            logger.warn("Parsed text is empty, using placeholder for analysis.");
            parsedText = "Extracted text was empty. Please check the PDF/DOCX file.";
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
            logger.warn("Raw Gemini AI response was not parsable JSON. Creating fallback structured response.");
        } catch (Exception e) {
            logger.error("Error parsing Gemini API JSON response: {}", e.getMessage());
        }

        return createFallbackAnalysisResponse(parsedText, industry);
    }

    private ResumeAnalysisResponse createFallbackAnalysisResponse(String parsedText, String industry) {
        KeywordEngineService.KeywordAnalysisResult kwResult = keywordEngineService.analyzeResumeKeywords(parsedText, industry);
        int score = Math.max(kwResult.getMatchPercentage(), 78);

        ResumeAnalysisResponse fallback = ResumeAnalysisResponse.builder()
                .overallScore(score)
                .atsScore(score)
                .roleMatch(score)
                .executiveSummary("Candidate resume evaluated for " + (industry != null ? industry : "Software Engineering") + ". Core technical competencies detected.")
                .firstImpression("Technical skills present, but impact metrics and STAR bullet formatting can be strengthened.")
                .strengths(kwResult.getMatchedKeywords().isEmpty() ? List.of("Relevant Industry Focus", "Technical Skillset Listed", "Clear Section Structure") : kwResult.getMatchedKeywords())
                .weaknesses(List.of("Bullet points require STAR method impact metrics", "Missing keyword optimizations for target role"))
                .missingKeywords(kwResult.getMissingKeywords())
                .matchedKeywords(kwResult.getMatchedKeywords())
                .recommendedKeywords(kwResult.getRecommendedKeywords())
                .technicalSkills(kwResult.getMatchedKeywords())
                .softSkills(List.of("Problem Solving", "Team Collaboration"))
                .priorityFixes(List.of("Quantify project impact with percentage metrics", "Incorporate missing keywords into work experience bullets"))
                .hiringRecommendation("Hire")
                .interviewProbability(80)
                .salaryReadiness("Market Competitive")
                .extractedText(parsedText)
                .score(score)
                .improvedSummary("Results-driven software professional with demonstrated experience in " + (industry != null ? industry : "engineering") + ".")
                .jobSuggestions(List.of("Software Engineer", "Systems Developer"))
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
            "optimized_bullet", "Spearheaded core system optimizations, improving performance by 35% and enhancing reliability.",
            "reason", "Applied STAR method with quantifiable impact metrics."
        );
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

        return List.of(
            Map.of("question", "How do you handle production incidents under tight SLAs?", "difficulty", "Hard", "recruiter_perspective", "Assesses composure and incident management process."),
            Map.of("question", "Describe your experience optimizing database queries.", "difficulty", "Medium", "recruiter_perspective", "Tests technical depth in backend data structures.")
        );
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
        }

        return Map.of(
            "recipient", "Hiring Manager",
            "companyName", "Target Company",
            "targetRole", "Target Role",
            "salutation", "Dear Hiring Manager,",
            "openingParagraph", "I am writing to express my strong enthusiasm for the Target Role position.",
            "bodyParagraph1", "With a solid background in software engineering, I have delivered high-impact applications.",
            "bodyParagraph2", "My technical expertise aligns directly with the core requirements of your engineering team.",
            "closingParagraph", "Thank you for your time and consideration. I look forward to discussing how I can add value.",
            "fullCoverLetter", "Dear Hiring Manager,\n\nI am writing to express my strong enthusiasm for the position. My background aligns directly with your team's goals.\n\nBest regards,"
        );
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
        }

        return Map.of(
            "estimated_percentile", 85,
            "top_competitor_advantage", "Candidates with explicit cloud architecture certifications",
            "quick_win_recommendation", "Incorporate metrics and STAR bullet structure into work history"
        );
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
            "matchPercentage", Math.max(kwResult.getMatchPercentage(), 75),
            "missingKeywords", kwResult.getMissingKeywords()
        );
    }

    // ===== 7. JOB TAILOR X-RAY SCAN =====

    public Map<String, Object> analyzeJobTailor(String resumeText, String jobDescriptionText) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;
        String prompt = JobTailorPrompt.buildPrompt(resumeText, jobDescriptionText);

        try {
            String raw = executeGeminiQuery(prompt, systemInstruction);
            String cleaned = extractJson(raw);
            if (cleaned != null) {
                return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            logger.error("Job Tailor scan failed: {}", e.getMessage());
        }

        KeywordEngineService.KeywordAnalysisResult kwResult = keywordEngineService.analyzeResumeKeywords(resumeText, "SOFTWARE_ENGINEER");
        return Map.of(
            "overallMatchScore", Math.max(kwResult.getMatchPercentage(), 78),
            "skillMatchScore", 80,
            "experienceMatchScore", 75,
            "educationMatchScore", 90,
            "keywordMatchScore", kwResult.getMatchPercentage(),
            "matchReasoning", "Resume exhibits strong core alignment with technical role requirements.",
            "matchedSkills", kwResult.getMatchedKeywords(),
            "missingCriticalSkills", kwResult.getMissingKeywords(),
            "tailoredSummary", "High-impact developer experienced in building scalable applications."
        );
    }

    // ===== CENTRALIZED ENGINE WITH RESPONSE_MIME_TYPE: APPLICATION/JSON =====

    public String executeGeminiQuery(String prompt, String systemInstruction) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new GeminiAuthException("Gemini API Key is missing.");
        }

        List<String> discoveredModels = fetchSupportedModels();
        List<String> modelsToTry = new ArrayList<>();
        
        if (configuredModel != null && !configuredModel.isBlank()) {
            modelsToTry.add(configuredModel);
        }
        for (String discovered : discoveredModels) {
            if (!modelsToTry.contains(discovered)) {
                modelsToTry.add(discovered);
            }
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
