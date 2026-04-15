package com.resumatch.repository;

import com.resumatch.model.AnalysisResult;
import com.resumatch.model.ImprovedResume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImprovedResumeRepository extends JpaRepository<ImprovedResume, Long> {
    List<ImprovedResume> findByAnalysisResult(AnalysisResult analysisResult);
    List<ImprovedResume> findByAnalysisResultId(Long analysisResultId);
    void deleteByAnalysisResult(AnalysisResult analysisResult);
}
