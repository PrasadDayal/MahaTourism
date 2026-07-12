package com.Tourism.Tourism.controller;

import com.Tourism.Tourism.model.Role;
import com.Tourism.Tourism.model.User;
import com.Tourism.Tourism.repository.UserRepository;
import com.Tourism.Tourism.repository.BookingRepository;
import com.Tourism.Tourism.repository.HotelReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private HotelReviewRepository hotelReviewRepository;

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        bookingRepository.deleteByUser(user);
        hotelReviewRepository.deleteByUser(user);
        userRepository.deleteById(id);
        return ResponseEntity.ok().body("User deleted successfully");
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok().body("User role updated successfully");
    }
}
