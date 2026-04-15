package com.resumatch.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumatch.model.InterviewQuestion;
import com.resumatch.model.InterviewQuestionDto;
import com.resumatch.model.InterviewSession;
import com.resumatch.model.User;
import com.resumatch.repository.InterviewQuestionRepository;
import com.resumatch.repository.InterviewSessionRepository;
import com.resumatch.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private static final Logger logger = LoggerFactory.getLogger(InterviewService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final UserRepository userRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;

    @Value("${gemini.api.key}")
    private String apiKey;

    public InterviewService(UserRepository userRepository, InterviewSessionRepository interviewSessionRepository, InterviewQuestionRepository interviewQuestionRepository) {
        this.userRepository = userRepository;
        this.interviewSessionRepository = interviewSessionRepository;
        this.interviewQuestionRepository = interviewQuestionRepository;
    }

    public List<InterviewQuestionDto> generateInterviewQuestions(String userEmail, String extractedText, String jobDescription) {
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        User user = userOpt.orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        String model = "gemini-1.5-flash";
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        String prompt = "As a Senior Hiring Manager, identify exactly 3 potential gaps (red flags) in this resume relative to the following Job Description (JD) " +
                "and generate EXACTLY 4 tough behavioral interview questions based on those gaps.\n" +
                "Ensure all sentences (question, strategy, sampleAnswer) are complete, detailed, and professionally written. Do not truncate text.\n" +
                "For each question, provide a 'Winning Answer' strategy based on the user's specific experience.\n\n" +
                "Return ONLY a strict JSON array of objects where each object has exactly these fields:\n" +
                "- \"question\": string (the behavioral interview question)\n" +
                "- \"redFlagAddressed\": string (the specific gap/red flag this question probes)\n" +
                "- \"strategy\": string (a custom Winning Answer strategy)\n" +
                "- \"sampleAnswer\": string (a sample response utilizing the strategy)\n\n" +
                "Job Description:\n" + jobDescription + "\n\n" +
                "Resume Text:\n" + extractedText;

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

        List<InterviewQuestionDto> generatedDtos = new ArrayList<>();
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
                            generatedDtos = objectMapper.readValue(jsonText, new TypeReference<List<InterviewQuestionDto>>() {});
                            success = true;
                        } else {
                            logger.error("Attempt {}: Invalid JSON in Gemini response: {}", attempt + 1, jsonText);
                        }
                    }
                }
            } catch (Exception e) {
                attempt++;
                logger.warn("Attempt {} for Interview Prep failed: {} - {}", attempt, e.getClass().getSimpleName(), e.getMessage());
            }
        }

        if (!success) {
            // Enhanced Fallback with context-aware technical questions
            String roleName = jobDescription.split("\n")[0].trim().replaceAll("[^a-zA-Z0-9 ]", "");
            if (roleName.length() > 40) roleName = roleName.substring(0, 37) + "...";
            
            generatedDtos.add(InterviewQuestionDto.builder()
                    .question("Tell me about a time you handled a high-pressure situation for " + roleName + ".")
                    .redFlagAddressed("Ability to handle stress under deadlines relevant to the role")
                    .strategy("Use the STAR method to highlight technical problem-solving.")
                    .sampleAnswer("In a recent project, we encountered a critical production bug. I isolated the issue and deployed a fix within 2 hours.")
                    .build());
            generatedDtos.add(InterviewQuestionDto.builder()
                    .question("How do you stay up-to-date with new tech for " + roleName + "?")
                    .redFlagAddressed("Concern about staying current in the field")
                    .strategy("Mention specific blogs, courses, or side projects.")
                    .sampleAnswer("I regularly follow industry leaders and spend 5 hours a week learning new frameworks like Spring Boot or React.")
                    .build());
            generatedDtos.add(InterviewQuestionDto.builder()
                    .question("Describe a conflict you had with a teammate and how you resolved it.")
                    .redFlagAddressed("Team collaboration and soft skills")
                    .strategy("Focus on professional resolution and 'win-win' outcomes.")
                    .sampleAnswer("I disagreed with a peer's architectural choice. We did a POC for both and data showed mine was more efficient, so we went with that.")
                    .build());
            generatedDtos.add(InterviewQuestionDto.builder()
                    .question("What is your greatest technical achievement relative to this role?")
                    .redFlagAddressed("Demonstrating high-impact contributions")
                    .strategy("Quantify your impact with numbers or percentages.")
                    .sampleAnswer("I optimized a query that reduced load times by 40%, saving the company $10k in server costs.")
                    .build());
        }

        // Persist Session & Questions
        InterviewSession session = InterviewSession.builder()
                .user(user)
                .jobDescription(jobDescription)
                .resumeText(extractedText)
                .createdAt(LocalDateTime.now())
                .build();
        InterviewSession savedSession = interviewSessionRepository.save(session);

        List<InterviewQuestion> savedQuestions = new ArrayList<>();
        for (InterviewQuestionDto dto : generatedDtos) {
            InterviewQuestion question = InterviewQuestion.builder()
                    .session(savedSession)
                    .question(dto.getQuestion())
                    .redFlagAddressed(dto.getRedFlagAddressed())
                    .strategy(dto.getStrategy())
                    .sampleAnswer(dto.getSampleAnswer())
                    .confidence("UNRATED")
                    .build();
            savedQuestions.add(interviewQuestionRepository.save(question));
        }

        // Map back to DTO including ID
        return savedQuestions.stream().map(q -> new InterviewQuestionDto(
                q.getId(),
                q.getQuestion(),
                q.getRedFlagAddressed(),
                q.getStrategy(),
                q.getSampleAnswer(),
                q.getConfidence()
        )).collect(Collectors.toList());
    }

    public void updateConfidence(Long questionId, String confidence) {
        Optional<InterviewQuestion> optionalQuestion = interviewQuestionRepository.findById(questionId);
        if (optionalQuestion.isPresent()) {
            InterviewQuestion question = optionalQuestion.get();
            question.setConfidence(confidence);
            interviewQuestionRepository.save(question);
        }
    }
}
