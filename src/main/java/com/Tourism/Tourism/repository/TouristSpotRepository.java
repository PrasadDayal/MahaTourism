package com.Tourism.Tourism.repository;

import com.Tourism.Tourism.model.TouristSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TouristSpotRepository extends JpaRepository<TouristSpot, Long> {
    List<TouristSpot> findByCityId(Long cityId);
    List<TouristSpot> findByCategoryId(Long categoryId);
    boolean existsByName(String name);
    Optional<TouristSpot> findByName(String name);
}
