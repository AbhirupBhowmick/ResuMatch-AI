package com.resumatch.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumatch.model.MCQQuestionDto;
import com.resumatch.prompt.SharedRecruiterInstructions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AssessmentService {

    private static final Logger logger = LoggerFactory.getLogger(AssessmentService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final GeminiService geminiService;

    public AssessmentService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    public List<MCQQuestionDto> generateMCQs(String extractedText, String jobDescription, int questionCount) {
        String systemInstruction = SharedRecruiterInstructions.SYSTEM_INSTRUCTION;

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

        List<MCQQuestionDto> generatedDtos = new ArrayList<>();
        boolean success = false;

        try {
            String rawResponse = geminiService.executeGeminiQuery(prompt, systemInstruction);
            String jsonText = geminiService.extractJsonArray(rawResponse);
            if (jsonText != null) {
                generatedDtos = objectMapper.readValue(jsonText, new TypeReference<List<MCQQuestionDto>>() {});
                success = true;
                logger.info("Assessment MCQs generated successfully via GeminiService.");
            }
        } catch (Exception e) {
            logger.warn("Failed to generate Assessment MCQs via GeminiService: {}", e.getMessage());
        }

        if (!success) {
            generatedDtos.add(MCQQuestionDto.builder()
                    .question("What primary metric should be monitored when scaling microservices under high traffic load?")
                    .options(List.of("CPU utilization and P99 latency", "File system inode count", "Font asset loading speed", "CSS selector specificity"))
                    .correctAnswerIndex(0)
                    .explanation("In cloud backend systems, CPU utilization, thread pool usage, and latency percentiles (P95/P99) indicate system bottlenecks under load.")
                    .build());
            generatedDtos.add(MCQQuestionDto.builder()
                    .question("Which caching strategy prevents cache stampede (thundering herd) during high concurrent requests?")
                    .options(List.of("Mutex locking / probabilistic early expiration", "Disabling cache TTL completely", "Increasing database Connection Pool to unlimited", "Clearing cache on every GET request"))
                    .correctAnswerIndex(0)
                    .explanation("Using lock mechanisms or early recomputation avoids hitting the database simultaneously when a popular key expires.")
                    .build());
        }

        return generatedDtos;
    }
}
