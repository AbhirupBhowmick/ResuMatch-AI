package com.resumatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BeforeAfterExampleDto {
    private String currentText;
    private String improvedText;
    private String reason;
    private String category; // Impact Metrics | Action Verbs | STAR Method | Brevity
}
