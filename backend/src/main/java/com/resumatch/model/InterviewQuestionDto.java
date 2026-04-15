package com.resumatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestionDto {
    private Long id;
    private String question;
    private String redFlagAddressed;
    private String strategy;
    private String sampleAnswer;
    private String confidence;
}
