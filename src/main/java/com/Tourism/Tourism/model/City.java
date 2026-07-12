package com.Tourism.Tourism.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cities")
@Data
@NoArgsConstructor
public class City {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String bestTimeToVisit;
    
    private String district;
    
    private Double latitude;
    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String howToReach;

    @Column(columnDefinition = "TEXT")
    private String stayInfo;

    @Column(columnDefinition = "TEXT")
    private String thingsToDo;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private String nearestAirport;
    private String nearestAirportDist;
    private String nearestRailwayStation;
    private String nearestRailwayStationDist;
    private String roadConnectivity;

    @OneToMany(mappedBy = "city", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private java.util.List<Hotel> hotels = new java.util.ArrayList<>();
}
