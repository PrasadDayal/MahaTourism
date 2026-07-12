package com.Tourism.Tourism.repository;

import com.Tourism.Tourism.model.Festival;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FestivalRepository extends JpaRepository<Festival, Long> {
    Optional<Festival> findByName(String name);
    List<Festival> findByMonth(Integer month);
    List<Festival> findByRegion(String region);
    List<Festival> findByCategory(String category);
    List<Festival> findByIsIconicTrue();
}
