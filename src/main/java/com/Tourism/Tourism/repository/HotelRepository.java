package com.Tourism.Tourism.repository;

import com.Tourism.Tourism.model.Hotel;
import com.Tourism.Tourism.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByCity(City city);
    List<Hotel> findByCityId(Long cityId);
}
