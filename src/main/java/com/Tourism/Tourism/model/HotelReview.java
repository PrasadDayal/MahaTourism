package com.Tourism.Tourism.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "hotel_reviews")
@Data
@NoArgsConstructor
public class HotelReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @ElementCollection
    private List<String> photos;

    private LocalDateTime createdAt;

    private Integer likes = 0;
}
