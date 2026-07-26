package com.resumatch.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utility for robust AI JSON response cleaning, fence stripping, extraction, and validation.
 */
public class JsonParsingUtils {

    private static final Logger logger = LoggerFactory.getLogger(JsonParsingUtils.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Extracts and validates a JSON object string from raw AI output.
     * Handles markdown code block fences (```json ... ```), leading/trailing text, and whitespace.
     */
    public static String extractJsonObject(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return null;
        }

        String cleaned = cleanMarkdownFences(rawResponse);

        int startIdx = cleaned.indexOf("{");
        int endIdx = cleaned.lastIndexOf("}");

        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
            String candidate = cleaned.substring(startIdx, endIdx + 1).trim();
            if (isValidJson(candidate)) {
                return candidate;
            }
        }

        logger.warn("Could not find a valid JSON object in response. Raw snippet: {}", 
            rawResponse.length() > 120 ? rawResponse.substring(0, 120) + "..." : rawResponse);
        return null;
    }

    /**
     * Extracts and validates a JSON array string from raw AI output.
     */
    public static String extractJsonArray(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return null;
        }

        String cleaned = cleanMarkdownFences(rawResponse);

        int startIdx = cleaned.indexOf("[");
        int endIdx = cleaned.lastIndexOf("]");

        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
            String candidate = cleaned.substring(startIdx, endIdx + 1).trim();
            if (isValidJson(candidate)) {
                return candidate;
            }
        }

        logger.warn("Could not find a valid JSON array in response. Raw snippet: {}", 
            rawResponse.length() > 120 ? rawResponse.substring(0, 120) + "..." : rawResponse);
        return null;
    }

    /**
     * Validates whether a string is valid JSON object or array.
     */
    public static boolean isValidJson(String jsonString) {
        if (jsonString == null || jsonString.isBlank()) return false;
        try {
            JsonNode node = objectMapper.readTree(jsonString);
            return node.isObject() || node.isArray();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Strips ```json and ``` markdown code block wrappers.
     */
    public static String cleanMarkdownFences(String input) {
        if (input == null) return "";
        String trimmed = input.trim();
        
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf("\n");
            if (firstNewline != -1) {
                trimmed = trimmed.substring(firstNewline + 1);
            } else {
                trimmed = trimmed.replace("```json", "").replace("```", "");
            }
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
