package com.resumatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionPlanDto {
    private List<String> immediateFixes;
    private List<String> oneWeekPlan;
    private List<String> twoWeekPlan;
    private List<String> thirtyDayPlan;
    private String expectedAtsImprovement;
}
