package com.Tourism.Tourism.controller;

import com.Tourism.Tourism.dto.CrowdPredictionRequest;
import com.Tourism.Tourism.dto.CrowdPredictionResponse;
import com.Tourism.Tourism.service.CrowdPredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/crowd")
@CrossOrigin(origins = "*")
public class CrowdPredictionController {

    @Autowired
    private CrowdPredictionService crowdPredictionService;

    @PostMapping("/predict")
    public ResponseEntity<?> predictCrowd(
            @RequestBody CrowdPredictionRequest request
    ) {
        try {
            CrowdPredictionResponse response = crowdPredictionService.predict(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Prediction failed: " + e.getMessage());
        }
    }
}