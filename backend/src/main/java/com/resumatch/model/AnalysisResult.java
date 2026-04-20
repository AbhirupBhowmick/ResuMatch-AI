package com.resumatch.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int score;

    @Column(columnDefinition = "TEXT")
    private String strengths; // JSON array as string

    @Column(columnDefinition = "TEXT")
    private String missingKeywords; // JSON array as string

    @Column(columnDefinition = "TEXT")
    private String jobSuggestions; // JSON array as string

    @Column(columnDefinition = "TEXT")
    private String improvedSummary;

    @Column(columnDefinition = "TEXT")
    private String originalResumeText;

    @Column(columnDefinition = "TEXT")
    private String backupContent; // Original text before "Apply" overwrites

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AnalysisStatus status = AnalysisStatus.PENDING;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime appliedAt;
}
