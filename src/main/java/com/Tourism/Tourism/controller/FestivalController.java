package com.Tourism.Tourism.controller;

import com.Tourism.Tourism.model.Festival;
import com.Tourism.Tourism.repository.FestivalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FestivalController {

    @Autowired
    private FestivalRepository festivalRepository;

    @GetMapping("/festivals")
    public List<Festival> getAllFestivals() {
        return festivalRepository.findAll();
    }

    @GetMapping("/festivals/iconic")
    public List<Festival> getIconicFestivals() {
        return festivalRepository.findByIsIconicTrue();
    }

    @GetMapping("/festivals/month/{month}")
    public List<Festival> getFestivalsByMonth(@PathVariable Integer month) {
        return festivalRepository.findByMonth(month);
    }

    @GetMapping("/festivals/category/{category}")
    public List<Festival> getFestivalsByCategory(@PathVariable String category) {
        return festivalRepository.findByCategory(category);
    }

    @GetMapping("/festivals/region/{region}")
    public List<Festival> getFestivalsByRegion(@PathVariable String region) {
        return festivalRepository.findByRegion(region);
    }
}
