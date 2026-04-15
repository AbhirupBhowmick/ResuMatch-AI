package com.resumatch.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumatch.model.MCQQuestionDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AssessmentService {

    private static final Logger logger = LoggerFactory.getLogger(AssessmentService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    public List<MCQQuestionDto> generateMCQs(String extractedText, String jobDescription, int questionCount) {
        String model = "gemini-1.5-flash";
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        String prompt = "You are a professional technical interviewer. Generate EXACTLY " + questionCount + " technical MCQs with 4 options each. The questions must strictly follow the Job Description (JD) and assess the technical gaps based on the Resume provided.\n" +
                "Ensure all questions and explanations are complete, detailed sentences. Do not truncate any text.\n" +
                "Make the questions difficult if the JD is for a senior role, and foundational if for a junior role.\n" +
                "Return ONLY a valid JSON array of objects with these fields:\n" +
                "- \"question\": string\n" +
                "- \"options\": array of 4 strings\n" +
                "- \"correctAnswerIndex\": integer (0-3)\n" +
                "- \"explanation\": string (detailed technical explanation relating to the specific topic from the JD)\n\n" +
                "JOB DESCRIPTION FOR TARGET ROLE:\n" + jobDescription + "\n\n" +
                "USER RESUME TEXT:\n" + extractedText;

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> contents = new HashMap<>();
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", prompt);
        contents.put("parts", List.of(parts));
        requestBody.put("contents", List.of(contents));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 2048);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        List<MCQQuestionDto> generatedDtos = new ArrayList<>();
        int maxRetries = 3;
        int attempt = 0;
        boolean success = false;

        while (attempt < maxRetries && !success) {
            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                Map<String, Object> body = response.getBody();
                if (body != null && body.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        List<Map<String, Object>> responseParts = (List<Map<String, Object>>) content.get("parts");
                        String jsonText = (String) responseParts.get(0).get("text");
                        
                        int startIdx = jsonText.indexOf("[");
                        int endIdx = jsonText.lastIndexOf("]");
                        
                        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
                            jsonText = jsonText.substring(startIdx, endIdx + 1);
                            generatedDtos = objectMapper.readValue(jsonText, new TypeReference<List<MCQQuestionDto>>() {});
                            success = true;
                        } else {
                            logger.error("Attempt {}: Invalid JSON in Gemini response: {}", attempt + 1, jsonText);
                        }
                    }
                }
            } catch (Exception e) {
                attempt++;
                logger.warn("Attempt {} for Assessment failed: {} - {}", attempt, e.getClass().getSimpleName(), e.getMessage());
                if (attempt >= maxRetries) {
                    logger.error("Final attempt for Assessment failed. Using fallbacks.");
                }
            }
        }

        if (!success) {
            // Enhanced Fallback with context-aware technical questions
            String roleHint = jobDescription.split("\n")[0].trim().replaceAll("[^a-zA-Z0-9 ]", "");
            if (roleHint.length() > 30) roleHint = roleHint.substring(0, 27) + "...";
            
            String[] commonTopics = {"Performance Optimization", "Security Best Practices", "Scalable Infrastructure", "End-to-End Testing", "API Design", "Deployment Strategies", "Database Schemas", "System Reliability", "Technical Debt", "Inter-service communication"};
            for (int i = 0; i < questionCount; i++) {
                String topic = commonTopics[i % commonTopics.length];
                generatedDtos.add(MCQQuestionDto.builder()
                    .question("Regarding " + roleHint + ", how should one approach " + topic + "?")
                    .options(List.of("By prioritizing immediate delivery over quality", "By using industry-standard design patterns and regular audits", "By avoiding automation and doing everything manually", "By hardcoding configurations for simplicity"))
                    .correctAnswerIndex(1)
                    .explanation(topic + " is critical for " + roleHint + " to ensure long-term stability and success.")
                    .build());
            }
        }

        return generatedDtos;
    }
}
