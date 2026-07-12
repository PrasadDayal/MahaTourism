package com.Tourism.Tourism.controller;

import com.Tourism.Tourism.dto.ChatRequest;
import com.Tourism.Tourism.dto.ItineraryRequest;
import com.Tourism.Tourism.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/itinerary")
    public ResponseEntity<?> generateItinerary(@RequestBody ItineraryRequest request) {
        String responseText = geminiService.generateItinerary(
                request.getDestination(), 
                request.getDays(), 
                request.getBudget(), 
                request.getPeople()
        );
        Map<String, String> response = new HashMap<>();
        response.put("data", responseText);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        String responseText = geminiService.chatWithAI(request.getMessage());
        Map<String, String> response = new HashMap<>();
        response.put("data", responseText);
        return ResponseEntity.ok(response);
    }
}
