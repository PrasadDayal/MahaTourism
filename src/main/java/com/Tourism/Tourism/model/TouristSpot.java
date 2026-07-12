package com.Tourism.Tourism.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tourist_spots")
@Data
@NoArgsConstructor
public class TouristSpot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "city_id")
    private City city;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String openHours;
    
    @Column(columnDefinition = "TEXT")
    private String tips;

    private Double latitude;
    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String activities;

    @Column(columnDefinition = "TEXT")
    private String history;

    private String bestTimeToVisit;

    @Column(columnDefinition = "TEXT")
    private String accessibilityInfo;

    @Column(columnDefinition = "TEXT")
    private String transportInfo;

    private boolean bookingRequired;
    private String bookingUrl;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "spot_images", joinColumns = @JoinColumn(name = "spot_id"))
    @Column(name = "image_url")
    private java.util.List<String> imageGallery;

    private String entryFee;
    private Double rating;
    private Integer reviewsCount;
    
    @Column(columnDefinition = "TEXT")
    private String googleMapsUrl;
    
    private boolean featured;
}
