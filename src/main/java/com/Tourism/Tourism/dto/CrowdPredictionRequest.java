package com.Tourism.Tourism.dto;

import lombok.Data;

@Data
public class CrowdPredictionRequest {

    private String place;
    private String month;
    private String season;
    private String weekend;
    private String holiday;
    private String trip_duration;
}