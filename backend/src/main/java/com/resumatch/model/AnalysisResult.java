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

    @Lob
    @Column(columnDefinition = "CLOB")
    private String strengths; // JSON array as string

    @Lob
    @Column(columnDefinition = "CLOB")
    private String missingKeywords; // JSON array as string

    @Lob
    @Column(columnDefinition = "CLOB")
    private String jobSuggestions; // JSON array as string

    @Lob
    @Column(columnDefinition = "CLOB")
    private String improvedSummary;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String originalResumeText;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String backupContent; // Original text before "Apply" overwrites

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AnalysisStatus status = AnalysisStatus.PENDING;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime appliedAt;
}
