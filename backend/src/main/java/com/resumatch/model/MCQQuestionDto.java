package com.resumatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MCQQuestionDto {
    private String question;
    private List<String> options;
    private int correctAnswerIndex;
    private String explanation;
}
