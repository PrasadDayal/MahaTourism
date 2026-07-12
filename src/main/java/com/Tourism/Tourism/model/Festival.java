package com.Tourism.Tourism.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "festivals")
@Data
@NoArgsConstructor
public class Festival {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String dateInfo; // e.g., "August/September" or "March"

    private Integer month; // 1-12 for filtering

    private LocalDate startDate; // For chronological sorting

    private String region; // e.g., "Konkan", "Vidarbha", "Marathwada", "Pune", "Mumbai"

    private boolean isIconic; // To highlight featured festivals

    @Column(columnDefinition = "TEXT")
    private String location;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private String category; // e.g., "Spiritual", "Cultural", "Music"
}
