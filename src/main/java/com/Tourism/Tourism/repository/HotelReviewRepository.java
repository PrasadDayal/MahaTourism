package com.Tourism.Tourism.repository;

import com.Tourism.Tourism.model.HotelReview;
import com.Tourism.Tourism.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelReviewRepository extends JpaRepository<HotelReview, Long> {
    List<HotelReview> findByHotelId(Long hotelId);
    void deleteByUser(User user);
}
