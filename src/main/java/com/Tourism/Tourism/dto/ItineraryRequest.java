package com.Tourism.Tourism.dto;

import lombok.Data;

@Data
public class ItineraryRequest {
    private String destination;
    private int days;
    private String budget;
    private int people;
}
