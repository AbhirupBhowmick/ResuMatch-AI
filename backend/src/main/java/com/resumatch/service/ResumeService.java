package com.resumatch.service;

import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class ResumeService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeService.class);
    private final Tika tika = new Tika();

    public String parseResume(MultipartFile file) {
        try (InputStream stream = file.getInputStream()) {
            // Tika detects and extracts text from PDF and DOCX seamlessly
            return tika.parseToString(stream);
        } catch (Exception e) {
            logger.error("Error parsing resume file: {}", e.getMessage());
            throw new RuntimeException("Failed to parse resume file", e);
        }
    }
}
