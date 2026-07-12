package com.Tourism.Tourism.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CrowdPredictionResponse {

    private String crowd_level;
    private String crowd_percentage;
    private String waiting_time;
    private String best_time;
    private String recommendation;
    private String confidence;
}