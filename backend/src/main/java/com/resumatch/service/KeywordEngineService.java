package com.resumatch.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Role-Specific Keyword Database and Keyword Matching Engine.
 */
@Service
public class KeywordEngineService {

    private static final Map<String, List<String>> ROLE_KEYWORD_DATABASE = new HashMap<>();

    static {
        ROLE_KEYWORD_DATABASE.put("SOFTWARE_ENGINEER", List.of(
            "Java", "Python", "C++", "Data Structures", "Algorithms", "System Design",
            "Git", "REST APIs", "Microservices", "SQL", "Multithreading", "CI/CD", "Unit Testing", "Object-Oriented Design"
        ));
        ROLE_KEYWORD_DATABASE.put("AI_ENGINEER", List.of(
            "PyTorch", "TensorFlow", "LangChain", "LLMs", "RAG", "Transformers", "Fine-Tuning",
            "Vector Databases", "Embeddings", "Python", "CUDA", "OpenAI API", "HuggingFace", "Prompt Engineering"
        ));
        ROLE_KEYWORD_DATABASE.put("ML_ENGINEER", List.of(
            "Scikit-Learn", "PyTorch", "TensorFlow", "MLOps", "Kubeflow", "Feature Engineering",
            "Model Deployment", "MLflow", "Hyperparameter Tuning", "Computer Vision", "NLP", "Pandas", "NumPy"
        ));
        ROLE_KEYWORD_DATABASE.put("DATA_SCIENTIST", List.of(
            "Python", "R", "SQL", "Pandas", "NumPy", "Statistical Modeling", "A/B Testing",
            "Data Visualization", "Tableau", "Power BI", "Exploratory Data Analysis", "Machine Learning", "BigQuery"
        ));
        ROLE_KEYWORD_DATABASE.put("FRONTEND", List.of(
            "React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Next.js",
            "Redux", "State Management", "Webpack", "Vite", "Web Performance", "Accessibility (a11y)", "REST API Integration"
        ));
        ROLE_KEYWORD_DATABASE.put("BACKEND", List.of(
            "Spring Boot", "Java", "Node.js", "Express", "PostgreSQL", "MongoDB", "Redis",
            "Kafka", "Docker", "RESTful APIs", "GraphQL", "gRPC", "Database Indexing", "System Architecture"
        ));
        ROLE_KEYWORD_DATABASE.put("FULL_STACK", List.of(
            "React", "TypeScript", "Node.js", "Spring Boot", "PostgreSQL", "GraphQL", "Docker",
            "AWS", "CI/CD", "Tailwind CSS", "REST API", "State Management", "Git", "Agile"
        ));
        ROLE_KEYWORD_DATABASE.put("DEVOPS", List.of(
            "Docker", "Kubernetes", "Terraform", "Ansible", "AWS", "Azure", "GCP",
            "CI/CD", "Jenkins", "GitHub Actions", "Prometheus", "Grafana", "Linux", "Shell Scripting"
        ));
        ROLE_KEYWORD_DATABASE.put("CLOUD", List.of(
            "AWS", "Azure", "GCP", "CloudFormation", "Terraform", "IAM", "VPC", "EC2",
            "S3", "Serverless", "Lambda", "Kubernetes", "Microservices", "Cloud Security"
        ));
        ROLE_KEYWORD_DATABASE.put("CYBERSECURITY", List.of(
            "Penetration Testing", "SIEM", "SOC", "Network Security", "Cryptography",
            "Wireshark", "Metasploit", "Identity Access Management", "Zero Trust", "CISSP", "Vulnerability Assessment", "Firewalls"
        ));
        ROLE_KEYWORD_DATABASE.put("ANDROID", List.of(
            "Kotlin", "Java", "Android SDK", "Jetpack Compose", "Coroutines", "Dagger Hilt",
            "Retrofit", "Room DB", "MVVM", "Clean Architecture", "Gradle", "Google Play Release"
        ));
        ROLE_KEYWORD_DATABASE.put("IOS", List.of(
            "Swift", "SwiftUI", "UIKit", "Combine", "CoreData", "CocoaPods", "SPM",
            "XCTest", "MVVM", "App Store Submission", "Memory Management", "ARC"
        ));
        ROLE_KEYWORD_DATABASE.put("PRODUCT_MANAGER", List.of(
            "Product Roadmap", "User Stories", "Agile", "Scrum", "PRD", "Feature Prioritization",
            "Stakeholder Management", "A/B Testing", "Mixpanel", "Jira", "Go-To-Market Strategy", "KPIs"
        ));
        ROLE_KEYWORD_DATABASE.put("QA", List.of(
            "Selenium", "Cypress", "Playwright", "Test Automation", "JUnit", "TestNG",
            "Postman", "API Testing", "Regression Testing", "Jira", "Test Cases", "CI/CD Integration"
        ));
        ROLE_KEYWORD_DATABASE.put("DATA_ANALYST", List.of(
            "SQL", "Excel", "Tableau", "Power BI", "Python", "Data Cleaning", "Dashboarding",
            "Business Intelligence", "Google Analytics", "Data Modeling", "ETL Pipelines"
        ));
        ROLE_KEYWORD_DATABASE.put("BUSINESS_ANALYST", List.of(
            "Requirements Gathering", "UML Diagrams", "Business Process Mapping", "Gap Analysis",
            "User Acceptance Testing (UAT)", "SQL", "Stakeholder Communication", "Jira", "Confluence"
        ));
    }

    public static class KeywordAnalysisResult {
        private final List<String> matchedKeywords;
        private final List<String> missingKeywords;
        private final List<String> recommendedKeywords;
        private final int matchPercentage;

        public KeywordAnalysisResult(List<String> matchedKeywords, List<String> missingKeywords, List<String> recommendedKeywords, int matchPercentage) {
            this.matchedKeywords = matchedKeywords;
            this.missingKeywords = missingKeywords;
            this.recommendedKeywords = recommendedKeywords;
            this.matchPercentage = matchPercentage;
        }

        public List<String> getMatchedKeywords() { return matchedKeywords; }
        public List<String> getMissingKeywords() { return missingKeywords; }
        public List<String> getRecommendedKeywords() { return recommendedKeywords; }
        public int getMatchPercentage() { return matchPercentage; }
    }

    public KeywordAnalysisResult analyzeResumeKeywords(String resumeText, String roleInput) {
        if (resumeText == null) resumeText = "";
        String normalizedRole = normalizeRoleKey(roleInput);
        List<String> roleKeywords = ROLE_KEYWORD_DATABASE.getOrDefault(normalizedRole, ROLE_KEYWORD_DATABASE.get("SOFTWARE_ENGINEER"));

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        String textLower = resumeText.toLowerCase();

        for (String kw : roleKeywords) {
            Pattern pattern = Pattern.compile("\\b" + Pattern.quote(kw.toLowerCase()) + "\\b");
            if (pattern.matcher(textLower).find()) {
                matched.add(kw);
            } else {
                missing.add(kw);
            }
        }

        int total = roleKeywords.size();
        int matchPct = total > 0 ? (int) Math.round(((double) matched.size() / total) * 100) : 70;
        List<String> recommended = new ArrayList<>(missing);

        return new KeywordAnalysisResult(matched, missing, recommended, matchPct);
    }

    private String normalizeRoleKey(String input) {
        if (input == null || input.isBlank()) return "SOFTWARE_ENGINEER";
        String clean = input.toUpperCase().replaceAll("[^A_Z0-9]", "_");

        for (String key : ROLE_KEYWORD_DATABASE.keySet()) {
            if (clean.contains(key) || key.contains(clean)) {
                return key;
            }
        }

        if (clean.contains("FRONT") || clean.contains("REACT")) return "FRONTEND";
        if (clean.contains("BACK") || clean.contains("SPRING") || clean.contains("JAVA")) return "BACKEND";
        if (clean.contains("FULL")) return "FULL_STACK";
        if (clean.contains("DATA_SCI")) return "DATA_SCIENTIST";
        if (clean.contains("ML") || clean.contains("MACHINE")) return "ML_ENGINEER";
        if (clean.contains("AI") || clean.contains("INTELLIGENCE")) return "AI_ENGINEER";
        if (clean.contains("DEV") || clean.contains("OPS")) return "DEVOPS";

        return "SOFTWARE_ENGINEER";
    }
}
