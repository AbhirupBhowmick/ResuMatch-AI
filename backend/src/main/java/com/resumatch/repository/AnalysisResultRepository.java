package com.resumatch.repository;

import com.resumatch.model.AnalysisResult;
import com.resumatch.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {
    List<AnalysisResult> findByUserOrderByCreatedAtDesc(User user);
    Optional<AnalysisResult> findTopByUserOrderByCreatedAtDesc(User user);
    Optional<AnalysisResult> findByIdAndUser(Long id, User user);
}
