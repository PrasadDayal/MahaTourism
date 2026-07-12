package com.Tourism.Tourism.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    // Updated for latest Flash model (2026)
    private final String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateItinerary(String destination, int days, String budget, int people) {
        String prompt = String.format("Create a detailed %d-day travel itinerary for %d people to %s with a %s budget. Include day-wise travel plan, suggested places, and cost optimization tips for Maharashtra tourism. Format the output in Markdown.", days, people, destination, budget);
        return callGeminiApi(prompt);
    }

    public String chatWithAI(String userMessage) {
        String prompt = "You are an expert travel assistant for Maharashtra Tourism. Answer the following question helpfully and concisely: " + userMessage;
        return callGeminiApi(prompt);
    }

    private String callGeminiApi(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        
        Map<String, Object> partsContainer = new HashMap<>();
        partsContainer.put("parts", Collections.singletonList(textPart));
        
        requestBody.put("contents", Collections.singletonList(partsContainer));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // Using query parameter for API key as it is most reliable for AI Studio keys
            String urlWithKey = apiUrl + "?key=" + apiKey;
            ResponseEntity<Map> response = restTemplate.postForEntity(urlWithKey, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("candidates")) {
                java.util.List<Map<String, Object>> candidates = (java.util.List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    java.util.List<Map<String, Object>> resParts = (java.util.List<Map<String, Object>>) content.get("parts");
                    if (!resParts.isEmpty()) {
                        return (String) resParts.get(0).get("text");
                    }
                }
            }
            return "Could not generate response from AI.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error communicating with AI service: " + e.getMessage();
        }
    }
}
