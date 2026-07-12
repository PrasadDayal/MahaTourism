package com.Tourism.Tourism.controller;

import com.Tourism.Tourism.model.Category;
import com.Tourism.Tourism.model.City;
import com.Tourism.Tourism.model.TouristSpot;
import com.Tourism.Tourism.repository.CategoryRepository;
import com.Tourism.Tourism.repository.CityRepository;
import com.Tourism.Tourism.repository.TouristSpotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PlaceController {

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TouristSpotRepository touristSpotRepository;

    // Public Endpoints
    @GetMapping("/public/cities")
    public ResponseEntity<List<City>> getAllCities() {
        return ResponseEntity.ok(cityRepository.findAll());
    }

    @GetMapping("/public/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/public/spots")
    public ResponseEntity<List<TouristSpot>> getAllSpots() {
        return ResponseEntity.ok(touristSpotRepository.findAll());
    }

    @GetMapping("/public/spots/city/{cityId}")
    public ResponseEntity<List<TouristSpot>> getSpotsByCity(@PathVariable Long cityId) {
        return ResponseEntity.ok(touristSpotRepository.findByCityId(cityId));
    }

    @GetMapping("/public/spots/category/{categoryId}")
    public ResponseEntity<List<TouristSpot>> getSpotsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(touristSpotRepository.findByCategoryId(categoryId));
    }

    @GetMapping("/public/cities/{id}")
    public ResponseEntity<City> getCityById(@PathVariable Long id) {
        return cityRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/public/spots/{id}")
    public ResponseEntity<TouristSpot> getSpotById(@PathVariable Long id) {
        return touristSpotRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Admin Endpoints for Cities
    @PostMapping("/admin/cities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<City> createCity(@RequestBody City city) {
        return ResponseEntity.ok(cityRepository.save(city));
    }

    @PutMapping("/admin/cities/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<City> updateCity(@PathVariable Long id, @RequestBody City cityDetails) {
        City city = cityRepository.findById(id).orElseThrow(() -> new RuntimeException("City not found"));
        city.setName(cityDetails.getName());
        city.setDescription(cityDetails.getDescription());
        city.setBestTimeToVisit(cityDetails.getBestTimeToVisit());
        city.setDistrict(cityDetails.getDistrict());
        city.setLatitude(cityDetails.getLatitude());
        city.setLongitude(cityDetails.getLongitude());
        city.setHowToReach(cityDetails.getHowToReach());
        city.setStayInfo(cityDetails.getStayInfo());
        city.setThingsToDo(cityDetails.getThingsToDo());
        city.setImageUrl(cityDetails.getImageUrl());
        city.setNearestAirport(cityDetails.getNearestAirport());
        city.setNearestAirportDist(cityDetails.getNearestAirportDist());
        city.setNearestRailwayStation(cityDetails.getNearestRailwayStation());
        city.setNearestRailwayStationDist(cityDetails.getNearestRailwayStationDist());
        city.setRoadConnectivity(cityDetails.getRoadConnectivity());
        return ResponseEntity.ok(cityRepository.save(city));
    }

    @DeleteMapping("/admin/cities/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCity(@PathVariable Long id) {
        cityRepository.deleteById(id);
        return ResponseEntity.ok().body("City deleted successfully");
    }

    // Admin Endpoints for Tourist Spots
    @PostMapping("/admin/spots")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TouristSpot> createSpot(@RequestBody TouristSpot spot, @RequestParam Long cityId, @RequestParam Long categoryId) {
        spot.setCity(cityRepository.findById(cityId).orElseThrow(() -> new RuntimeException("City not found")));
        spot.setCategory(categoryRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Category not found")));
        return ResponseEntity.ok(touristSpotRepository.save(spot));
    }

    @PutMapping("/admin/spots/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TouristSpot> updateSpot(@PathVariable Long id, @RequestBody TouristSpot spotDetails, @RequestParam Long cityId, @RequestParam Long categoryId) {
        TouristSpot spot = touristSpotRepository.findById(id).orElseThrow(() -> new RuntimeException("Spot not found"));
        spot.setName(spotDetails.getName());
        spot.setDescription(spotDetails.getDescription());
        spot.setOpenHours(spotDetails.getOpenHours());
        spot.setTips(spotDetails.getTips());
        spot.setLatitude(spotDetails.getLatitude());
        spot.setLongitude(spotDetails.getLongitude());
        spot.setActivities(spotDetails.getActivities());
        spot.setHistory(spotDetails.getHistory());
        spot.setBestTimeToVisit(spotDetails.getBestTimeToVisit());
        spot.setImageUrl(spotDetails.getImageUrl());
        spot.setEntryFee(spotDetails.getEntryFee());
        spot.setRating(spotDetails.getRating());
        spot.setReviewsCount(spotDetails.getReviewsCount());
        spot.setGoogleMapsUrl(spotDetails.getGoogleMapsUrl());
        spot.setFeatured(spotDetails.isFeatured());
        spot.setCity(cityRepository.findById(cityId).orElseThrow(() -> new RuntimeException("City not found")));
        spot.setCategory(categoryRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Category not found")));
        return ResponseEntity.ok(touristSpotRepository.save(spot));
    }

    @DeleteMapping("/admin/spots/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSpot(@PathVariable Long id) {
        touristSpotRepository.deleteById(id);
        return ResponseEntity.ok().body("Spot deleted successfully");
    }
}
