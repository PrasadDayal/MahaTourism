package com.Tourism.Tourism.controller;

import com.Tourism.Tourism.model.HotelReview;
import com.Tourism.Tourism.repository.HotelReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class HotelReviewController {

    @Autowired
    private HotelReviewRepository reviewRepository;

    @PostMapping
    public ResponseEntity<HotelReview> addReview(@RequestBody HotelReview review) {
        review.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @GetMapping("/{hotelId}")
    public List<HotelReview> getReviews(@PathVariable Long hotelId) {
        return reviewRepository.findByHotelId(hotelId);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeReview(@PathVariable Long id) {
        return reviewRepository.findById(id).map(review -> {
            review.setLikes(review.getLikes() + 1);
            reviewRepository.save(review);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
