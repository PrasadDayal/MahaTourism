package com.Tourism.Tourism.controller;

import com.Tourism.Tourism.model.Hotel;
import com.Tourism.Tourism.repository.HotelRepository;
import com.Tourism.Tourism.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class HotelController {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private CityRepository cityRepository;

    @GetMapping("/public/hotels")
    public ResponseEntity<List<Hotel>> getAllHotels() {
        return ResponseEntity.ok(hotelRepository.findAll());
    }

    @GetMapping("/public/hotels/{id}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable Long id) {
        return hotelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/public/hotels/city/{cityId}")
    public ResponseEntity<List<Hotel>> getHotelsByCity(@PathVariable Long cityId) {
        return ResponseEntity.ok(hotelRepository.findByCityId(cityId));
    }

    @PostMapping("/admin/hotels")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Hotel> createHotel(@RequestBody Hotel hotel, @RequestParam Long cityId) {
        hotel.setCity(cityRepository.findById(cityId).orElseThrow(() -> new RuntimeException("City not found")));
        return ResponseEntity.ok(hotelRepository.save(hotel));
    }

    @PutMapping("/admin/hotels/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Hotel> updateHotel(@PathVariable Long id, @RequestBody Hotel hotelDetails, @RequestParam Long cityId) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new RuntimeException("Hotel not found"));
        hotel.setName(hotelDetails.getName());
        hotel.setDescription(hotelDetails.getDescription());
        hotel.setPriceRange(hotelDetails.getPriceRange());
        hotel.setPricePerNight(hotelDetails.getPricePerNight());
        hotel.setRating(hotelDetails.getRating());
        hotel.setImageUrl(hotelDetails.getImageUrl());
        hotel.setAddress(hotelDetails.getAddress());
        hotel.setCity(cityRepository.findById(cityId).orElseThrow(() -> new RuntimeException("City not found")));
        return ResponseEntity.ok(hotelRepository.save(hotel));
    }

    @DeleteMapping("/admin/hotels/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteHotel(@PathVariable Long id) {
        hotelRepository.deleteById(id);
        return ResponseEntity.ok().body("Hotel deleted successfully");
    }
}
