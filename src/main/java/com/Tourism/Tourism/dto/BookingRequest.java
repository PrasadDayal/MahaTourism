package com.Tourism.Tourism.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequest {
    private Long hotelId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfGuests;
    private Double totalAmount;
}
