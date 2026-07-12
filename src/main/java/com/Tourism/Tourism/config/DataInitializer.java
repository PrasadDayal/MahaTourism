package com.Tourism.Tourism.config;

import com.Tourism.Tourism.model.*;
import com.Tourism.Tourism.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private TouristSpotRepository touristSpotRepository;

    @Autowired
    private FestivalRepository festivalRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private HotelReviewRepository hotelReviewRepository;

    @Override
    public void run(String... args) throws Exception {
        // --- 0. Seed Admin User ---
        seedAdminUser();

        // --- 1. Seed Categories ---
        seedCategories();

        // --- 2. Seed Festivals ---
        seedFestivals();

        // --- 3. Seed Hotels & Spots ---
        seedCitiesAndHotelsAndSpots();
        
        // --- 4. Seed Reviews ---
        seedReviews();
    }

    private void seedReviews() {
        if (hotelReviewRepository.count() > 0) return;
        
        User user = userRepository.findByEmail("admin@gmail.com").orElseThrow();
        List<Hotel> hotels = hotelRepository.findAll();
        
        if (hotels.isEmpty()) return;

        for (Hotel hotel : hotels) {
            HotelReview r1 = new HotelReview();
            r1.setHotel(hotel);
            r1.setUser(user);
            r1.setRating(5);
            r1.setComment("Absolutely amazing experience! The service was top-notch.");
            r1.setCreatedAt(java.time.LocalDateTime.now());
            r1.setLikes(10);
            hotelReviewRepository.save(r1);

            HotelReview r2 = new HotelReview();
            r2.setHotel(hotel);
            r2.setUser(user);
            r2.setRating(4);
            r2.setComment("Great place, very clean and comfortable.");
            r2.setCreatedAt(java.time.LocalDateTime.now());
            r2.setLikes(2);
            hotelReviewRepository.save(r2);
        }
    }

    private void seedCategories() {
        getOrCreateCategory("Beach", "Pristine golden sands and turquoise waters of the Konkan coast.", "https://i.pinimg.com/736x/11/75/63/117563bbbd3459b4194ea693f162c3b9.jpg");
        getOrCreateCategory("Heritage", "Ancient forts, rock-cut caves, and historical monuments.", "https://i.pinimg.com/1200x/b6/55/dc/b655dcdfe59835357a93dd30ca070c0a.jpg");
        getOrCreateCategory("Hills and Mountains", "Lush greenery, misty peaks, and refreshing hill stations of the Sahyadris.", "https://plus.unsplash.com/premium_photo-1697729686580-91cb90cdb7b6?w=600&auto=format&fit=crop&q=60");
        getOrCreateCategory("Romantic Places", "Dreamy escapes, sunset points, and serene lakeside retreats.", "https://i.pinimg.com/736x/d3/89/97/d389970e99a9ccc6e0137f2a0edbe0ea.jpg");
        getOrCreateCategory("Nightlife", "Vibrant clubs, illuminated skylines, and evening street food hubs.", "https://i.pinimg.com/736x/ff/2c/d4/ff2cd4b6e61402d9054e14fe8fa7a86f.jpg");
        getOrCreateCategory("Weekend Gateways", "Perfect short trips from the city to rejuvenate and explore.", "https://i.pinimg.com/736x/1d/14/88/1d14883328c2dd016f01967a90019561.jpg");
        getOrCreateCategory("Spiritual", "Sacred temples and pilgrimage sites.", "https://i.pinimg.com/736x/5c/e7/a1/5ce7a1e806a18fdc8d26f9e81777fc8c.jpg");
    }

    private void seedCitiesAndHotelsAndSpots() {
        // MUMBAI
        City mumbai = getOrCreateCity("Mumbai", "The vibrant capital of Maharashtra...", "October to March", 18.9750, 72.8258, "Connectivity...", "Stay...", "Things...", "https://as1.ftcdn.net/v2/jpg/09/26/58/90/1000_F_926589082_9ThP6ZuhmlEB8ArXJxI3MasmIQpYRgaQ.jpg", "Airport", "0 km", "Railway", "0 km", "Road");
        createHotelIfNotExists("The Taj Mahal Palace", mumbai, "Iconic luxury...", "₹25,000 - ₹50,000", 4.9, "https://media.gettyimages.com/id/520666448/photo/taj-mahal-hotel-and-waterfront.jpg?s=612x612&w=0&k=20&c=UcC4nYMurDmHvCrD1Aw2dUa3IL9ZuQuCN_ADb7ELOnk=", "Apollo Bunder, Colaba, Mumbai", "Wi-Fi, Pool, Spa, Parking", "Luxury and serene with stunning views.", "Full refund if cancelled 48 hours before check-in.");
        // ... (rest of data)
    }

    private void seedAdminUser() {
        if (!userRepository.findByEmail("admin@gmail.com").isPresent()) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }
    }

    private Category getOrCreateCategory(String name, String desc, String url) {
        Category cat = categoryRepository.findByName(name).orElse(new Category());
        cat.setName(name);
        cat.setDescription(desc);
        cat.setImageUrl(url);
        return categoryRepository.save(cat);
    }

    private City getOrCreateCity(String name, String desc, String time, Double lat, Double lon, String reach, String stay, String doItems, String url, String airport, String airportDist, String railway, String railwayDist, String road) {
        City city = cityRepository.findByName(name).orElse(new City());
        city.setName(name);
        city.setDescription(desc);
        city.setBestTimeToVisit(time);
        city.setLatitude(lat);
        city.setLongitude(lon);
        city.setHowToReach(reach);
        city.setStayInfo(stay);
        city.setThingsToDo(doItems);
        city.setImageUrl(url);
        city.setNearestAirport(airport);
        city.setNearestAirportDist(airportDist);
        city.setNearestRailwayStation(railway);
        city.setNearestRailwayStationDist(railwayDist);
        city.setRoadConnectivity(road);
        return cityRepository.save(city);
    }

    private void createHotelIfNotExists(String name, City city, String desc, String price, Double rating, String url, String address, String amenities, String atmosphere, String cancellationPolicy) {
        Hotel hotel = hotelRepository.findByCity(city).stream()
                .filter(h -> h.getName().equals(name))
                .findFirst()
                .orElse(new Hotel());
        hotel.setName(name);
        hotel.setCity(city);
        hotel.setDescription(desc);
        hotel.setPriceRange(price);
        
        try {
            String firstPrice = price.split("-")[0].replaceAll("[^0-9]", "");
            if (!firstPrice.isEmpty()) {
                hotel.setPricePerNight(Double.parseDouble(firstPrice));
            } else {
                hotel.setPricePerNight(5000.0);
            }
        } catch (Exception e) {
            hotel.setPricePerNight(5000.0);
        }
        
        hotel.setRating(rating);
        hotel.setImageUrl(url);
        hotel.setAddress(address);
        hotel.setAmenities(amenities);
        hotel.setAtmosphere(atmosphere);
        hotel.setCancellationPolicy(cancellationPolicy);
        hotelRepository.save(hotel);
    }

    private void createSpotIfNotExists(String name, City city, Category cat, String desc, String hours, String tips, Double lat, Double lon, String activities, String history, String bestTime, String url, String accessibilityInfo, String transportInfo) {
        createSpotIfNotExists(name, city, cat, desc, hours, tips, lat, lon, activities, history, bestTime, url, accessibilityInfo, transportInfo, "Free", 4.5, 0, "", false, null);
    }

    private void createSpotIfNotExists(String name, City city, Category cat, String desc, String hours, String tips, Double lat, Double lon, String activities, String history, String bestTime, String url, String accessibilityInfo, String transportInfo, String entryFee, Double rating, Integer reviewsCount, String googleMapsUrl, boolean featured) {
        createSpotIfNotExists(name, city, cat, desc, hours, tips, lat, lon, activities, history, bestTime, url, accessibilityInfo, transportInfo, entryFee, rating, reviewsCount, googleMapsUrl, featured, null);
    }

    private void createSpotIfNotExists(String name, City city, Category cat, String desc, String hours, String tips, Double lat, Double lon, String activities, String history, String bestTime, String url, String accessibilityInfo, String transportInfo, String entryFee, Double rating, Integer reviewsCount, String googleMapsUrl, boolean featured, List<String> imageGallery) {
        TouristSpot spot = touristSpotRepository.findByName(name).orElse(new TouristSpot());
        spot.setName(name);
        spot.setCity(city);
        spot.setCategory(cat);
        spot.setDescription(desc);
        spot.setOpenHours(hours);
        spot.setTips(tips);
        spot.setLatitude(lat);
        spot.setLongitude(lon);
        spot.setActivities(activities);
        spot.setHistory(history);
        spot.setBestTimeToVisit(bestTime);
        spot.setImageUrl(url);
        spot.setAccessibilityInfo(accessibilityInfo);
        spot.setTransportInfo(transportInfo);
        spot.setEntryFee(entryFee);
        spot.setRating(rating);
        spot.setReviewsCount(reviewsCount);
        spot.setGoogleMapsUrl(googleMapsUrl);
        spot.setFeatured(featured);
        spot.setImageGallery(imageGallery);
        touristSpotRepository.save(spot);
    }

    private void seedFestivals() {
        // ... (festival seeding code)
    }

    private void createFestivalIfNotExists(String name, String desc, String date, String loc, String url, String cat, Integer month, String startDate, String region, boolean isIconic) {
        Festival festival = festivalRepository.findByName(name).orElse(new Festival());
        if (festival.getId() == null) {
            festival.setName(name);
            festival.setDescription(desc);
            festival.setDateInfo(date);
            festival.setLocation(loc);
            festival.setCategory(cat);
            festival.setMonth(month);
            festival.setStartDate(LocalDate.parse(startDate));
            festival.setRegion(region);
            festival.setIconic(isIconic);
        }
        festival.setImageUrl(url);
        festivalRepository.save(festival);
    }
}
