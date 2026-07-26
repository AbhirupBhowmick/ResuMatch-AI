package com.resumatch.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JsonParsingUtilsTest {

    @Test
    @DisplayName("1. Valid raw JSON string should be extracted directly")
    public void testValidRawJson() {
        String input = "{\"score\":85,\"strengths\":[\"Java\",\"Spring\"]}";
        String result = JsonParsingUtils.extractJsonObject(input);
        assertNotNull(result);
        assertTrue(result.contains("\"score\":85"));
        assertTrue(JsonParsingUtils.isValidJson(result));
    }

    @Test
    @DisplayName("2. Markdown-wrapped JSON (```json ... ```) should strip fences and extract JSON")
    public void testMarkdownWrappedJson() {
        String input = "```json\n{\n  \"score\": 90,\n  \"strengths\": [\"React\"]\n}\n```";
        String result = JsonParsingUtils.extractJsonObject(input);
        assertNotNull(result);
        assertTrue(result.contains("\"score\": 90"));
        assertTrue(JsonParsingUtils.isValidJson(result));
    }

    @Test
    @DisplayName("3. Plain text / Markdown list response without JSON should return null safely")
    public void testPlainTextResponse() {
        String input = "* Target Industry: Software Engineering\n* Score: 85\nHere are some feedback points.";
        String result = JsonParsingUtils.extractJsonObject(input);
        assertNull(result);
        assertFalse(JsonParsingUtils.isValidJson(input));
    }

    @Test
    @DisplayName("4. Malformed / Invalid JSON should return null safely without throwing exceptions")
    public void testInvalidJson() {
        String input = "{\"score\": 85, \"strengths\": [\"Java\", }"; // Broken syntax
        String result = JsonParsingUtils.extractJsonObject(input);
        assertNull(result);
    }

    @Test
    @DisplayName("5. Response with leading commentary before JSON object should extract JSON object")
    public void testTextSurroundingJson() {
        String input = "Here is the requested AI evaluation analysis:\n\n{\"overallScore\":88,\"atsScore\":86}\n\nHope this helps!";
        String result = JsonParsingUtils.extractJsonObject(input);
        assertNotNull(result);
        assertEquals("{\"overallScore\":88,\"atsScore\":86}", result);
        assertTrue(JsonParsingUtils.isValidJson(result));
    }
}
