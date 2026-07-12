package com.Tourism.Tourism.controller;

import com.Tourism.Tourism.dto.BookingRequest;
import com.Tourism.Tourism.dto.MessageResponse;
import com.Tourism.Tourism.model.Booking;
import com.Tourism.Tourism.model.Hotel;
import com.Tourism.Tourism.model.User;
import com.Tourism.Tourism.repository.BookingRepository;
import com.Tourism.Tourism.repository.HotelRepository;
import com.Tourism.Tourism.repository.UserRepository;
import com.Tourism.Tourism.security.UserDetailsImpl;
import com.Tourism.Tourism.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {


    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    HotelRepository hotelRepository;

    @Autowired
    EmailService emailService;

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest bookingRequest) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        Hotel hotel = hotelRepository.findById(bookingRequest.getHotelId()).orElseThrow(() -> new RuntimeException("Hotel not found"));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setHotel(hotel);
        booking.setCheckInDate(bookingRequest.getCheckInDate());
        booking.setCheckOutDate(bookingRequest.getCheckOutDate());
        booking.setNumberOfGuests(bookingRequest.getNumberOfGuests());
        booking.setTotalAmount(bookingRequest.getTotalAmount());
        booking.setStatus(Booking.BookingStatus.PENDING); // Set to PENDING for admin review

        bookingRepository.save(booking);

        // Send booking confirmation email immediately
        emailService.sendBookingConfirmationEmail(booking);

        return ResponseEntity.ok(new MessageResponse("Booking request submitted successfully!"));
    }

    @GetMapping("/bookings/user")
    public ResponseEntity<List<Booking>> getUserBookings() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(bookingRepository.findByUser(user));
    }

    @GetMapping("/admin/bookings/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    @PutMapping("/admin/bookings/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestParam Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        bookingRepository.save(booking);
        
        // Send email
        if (status == Booking.BookingStatus.CONFIRMED) {
            emailService.sendBookingConfirmationEmail(booking);
        } else {
            emailService.sendBookingStatusEmail(booking.getUser().getEmail(), booking.getId().toString(), status.toString());
        }
        
        return ResponseEntity.ok(new MessageResponse("Booking status updated to " + status));
    }
}
