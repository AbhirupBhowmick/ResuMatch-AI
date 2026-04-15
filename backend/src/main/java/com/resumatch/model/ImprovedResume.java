package com.resumatch.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "improved_resumes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImprovedResume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private AnalysisResult analysisResult;

    private String sectionName; // e.g. "Professional Summary", "Experience Bullet 1"

    @Lob
    @Column(columnDefinition = "CLOB")
    private String originalText;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String aiImprovedText;
}
