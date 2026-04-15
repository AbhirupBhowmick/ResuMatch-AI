package com.resumatch.model;

import lombok.Data;

@Data
public class CoverLetterRequest {
    private String parsedResume;
    private String jobDescription;
}
