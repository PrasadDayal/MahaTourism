package com.Tourism.Tourism.repository;

import com.Tourism.Tourism.model.Booking;
import com.Tourism.Tourism.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    void deleteByUser(User user);
}
