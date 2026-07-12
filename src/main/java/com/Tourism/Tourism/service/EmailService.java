package com.Tourism.Tourism.service;

import com.Tourism.Tourism.model.Booking;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendBookingStatusEmail(String to, String bookingId, String status) {
        try {
            System.out.println(">>> Starting sendBookingStatusEmail to: " + to);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("blablaindia.com@gmail.com", "Priya Navle");
            helper.setTo(to);
            helper.setSubject("Booking Status Update - " + bookingId);
            helper.setText("Dear Customer,\n\nYour booking with ID " + bookingId + " has been " + status + ".\n\nThank you for choosing Maharashtra Tourism.");
            
            mailSender.send(message);
            System.out.println(">>> Status email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println(">>> ERROR sending status email to: " + to);
            e.printStackTrace();
        }
    }

    public void sendBookingConfirmationEmail(Booking booking) {
        try {
            String toEmail = booking.getUser().getEmail();
            System.out.println(">>> Starting sendBookingConfirmationEmail to: " + toEmail);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("blablaindia.com@gmail.com", "Priya Navle");
            helper.setTo(toEmail);
            helper.setSubject("Booking Confirmation - MT" + booking.getId());
            
            String customerName = booking.getUser().getName();
            String destination = (booking.getHotel() != null && booking.getHotel().getCity() != null) 
                    ? booking.getHotel().getCity().getName() 
                    : "Maharashtra";
            String travelDate = booking.getCheckInDate() != null ? booking.getCheckInDate().toString() : "N/A";
            
            String body = "Dear " + customerName + ",\n\n" +
                    "Your booking has been successfully confirmed.\n\n" +
                    "Booking ID : MT" + booking.getId() + "\n" +
                    "Destination : " + destination + "\n" +
                    "Travel Date : " + travelDate + "\n" +
                    "Travelers : " + booking.getNumberOfGuests() + "\n" +
                    "Payment Status : Paid\n\n" +
                    "Thank you for choosing MahaTourism.\n\n" +
                    "Have a safe and enjoyable journey!\n\n" +
                    "Regards,\n" +
                    "MahaTourism Team";
                    
            helper.setText(body);
            mailSender.send(message);
            System.out.println(">>> Booking confirmation email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println(">>> ERROR sending booking confirmation email!");
            e.printStackTrace();
        }
    }
}
