package com.Tourism.Tourism.service;

import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import ai.onnxruntime.OnnxTensor;
import com.Tourism.Tourism.dto.CrowdPredictionRequest;
import com.Tourism.Tourism.dto.CrowdPredictionResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CrowdPredictionService {

    private OrtEnvironment env;
    private OrtSession session;
    private Map<String, float[]> placeFeatures;

    // StandardScaler parameters for dynamic inputs
    // Month: index 36, Mean: 5.18966737, Scale: 3.34601295
    // Season: index 37, Mean: 1.58050248, Scale: 1.21810849
    // Weekend: index 38, Mean: 0.51804671, Scale: 0.49967421
    // Holiday: index 39, Mean: 0.51238500, Scale: 0.49984659
    // Trip Duration: index 40, Mean: 1.95346780, Scale: 1.35235647
    
    private static final double MONTH_MEAN = 5.18966737;
    private static final double MONTH_SCALE = 3.34601295;
    
    private static final double SEASON_MEAN = 1.58050248;
    private static final double SEASON_SCALE = 1.21810849;
    
    private static final double WEEKEND_MEAN = 0.51804671;
    private static final double WEEKEND_SCALE = 0.49967421;
    
    private static final double HOLIDAY_MEAN = 0.51238500;
    private static final double HOLIDAY_SCALE = 0.49984659;
    
    private static final double DURATION_MEAN = 1.95346780;
    private static final double DURATION_SCALE = 1.35235647;

    @PostConstruct
    public void init() throws Exception {
        env = OrtEnvironment.getEnvironment();
        
        // Load ONNX Model
        InputStream modelStream = new ClassPathResource("model/crowd_prediction_model.onnx").getInputStream();
        byte[] modelBytes = modelStream.readAllBytes();
        session = env.createSession(modelBytes, new OrtSession.SessionOptions());
        
        // Load place features
        InputStream jsonStream = new ClassPathResource("model/place_features.json").getInputStream();
        ObjectMapper mapper = new ObjectMapper();
        
        // Deserialize list of floats into float[]
        Map<String, List<Double>> rawFeatures = mapper.readValue(
            jsonStream,
            new TypeReference<Map<String, List<Double>>>() {}
        );
        
        placeFeatures = new HashMap<>();
        for (Map.Entry<String, List<Double>> entry : rawFeatures.entrySet()) {
            float[] arr = new float[36];
            for (int i = 0; i < 36; i++) {
                arr[i] = entry.getValue().get(i).floatValue();
            }
            placeFeatures.put(entry.getKey(), arr);
        }
    }

    @PreDestroy
    public void cleanup() throws Exception {
        if (session != null) {
            session.close();
        }
        if (env != null) {
            env.close();
        }
    }

    public CrowdPredictionResponse predict(CrowdPredictionRequest request) throws Exception {
        String place = request.getPlace();
        float[] baseFeatures = placeFeatures.get(place);
        if (baseFeatures == null) {
            // Fallback to Gateway of India if not found
            baseFeatures = placeFeatures.get("Gateway of India");
        }

        // Encode and scale dynamic features
        int encMonth = encodeMonth(request.getMonth());
        int encSeason = encodeSeason(request.getSeason());
        int encWeekend = encodeWeekend(request.getWeekend());
        int encHoliday = encodeHoliday(request.getHoliday());
        int encDuration = encodeDuration(request.getTrip_duration());

        float scaledMonth = (float) ((encMonth - MONTH_MEAN) / MONTH_SCALE);
        float scaledSeason = (float) ((encSeason - SEASON_MEAN) / SEASON_SCALE);
        float scaledWeekend = (float) ((encWeekend - WEEKEND_MEAN) / WEEKEND_SCALE);
        float scaledHoliday = (float) ((encHoliday - HOLIDAY_MEAN) / HOLIDAY_SCALE);
        float scaledDuration = (float) ((encDuration - DURATION_MEAN) / DURATION_SCALE);

        // Build 41 features input
        float[][] inputData = new float[1][41];
        System.arraycopy(baseFeatures, 0, inputData[0], 0, 36);
        inputData[0][36] = scaledMonth;
        inputData[0][37] = scaledSeason;
        inputData[0][38] = scaledWeekend;
        inputData[0][39] = scaledHoliday;
        inputData[0][40] = scaledDuration;

        // Run ONNX Session
        try (OnnxTensor tensor = OnnxTensor.createTensor(env, inputData)) {
            try (OrtSession.Result result = session.run(Collections.singletonMap("float_input", tensor))) {
                // Read label output
                // The label tensor type is tensor(int64) shape [1]
                long[] labelOutput = (long[]) result.get(0).getValue();
                int prediction = (int) labelOutput[0];

                String crowdLevel;
                // Target Encoder categories: ['High', 'Low', 'Medium']
                // High = 0, Low = 1, Medium = 2
                if (prediction == 0) {
                    crowdLevel = "HIGH";
                } else if (prediction == 1) {
                    crowdLevel = "LOW";
                } else {
                    crowdLevel = "MEDIUM";
                }

                // Return details based on crowdLevel
                String percentage;
                String waitingTime;
                String bestTime;
                String recommendation;

                if ("HIGH".equals(crowdLevel)) {
                    percentage = "85-100%";
                    waitingTime = "20-40 minutes";
                    bestTime = "6 AM - 8 AM";
                    recommendation = "Visit before 8 AM";
                } else if ("MEDIUM".equals(crowdLevel)) {
                    percentage = "40-70%";
                    waitingTime = "10-20 minutes";
                    bestTime = "8 AM - 10 AM";
                    recommendation = "Visit during early morning or late afternoon";
                } else {
                    percentage = "10-40%";
                    waitingTime = "0-10 minutes";
                    bestTime = "10 AM - 5 PM";
                    recommendation = "Great time to visit! Enjoy your trip.";
                }

                // Extract confidence score from probabilities output safely
                float confidenceVal = 0.0f;
                ai.onnxruntime.OnnxSequence sequence = (ai.onnxruntime.OnnxSequence) result.get(1);
                java.util.List<? extends ai.onnxruntime.OnnxValue> sequenceList = sequence.getValue();
                if (!sequenceList.isEmpty()) {
                    ai.onnxruntime.OnnxMap onnxMap = (ai.onnxruntime.OnnxMap) sequenceList.get(0);
                    java.util.Map<Long, Float> probsMap = (java.util.Map<Long, Float>) onnxMap.getValue();
                    Float val = probsMap.get((long) prediction);
                    if (val != null) {
                        confidenceVal = val;
                    }
                    onnxMap.close();
                }
                String confidence = String.format("%.1f%%", confidenceVal * 100);

                return new CrowdPredictionResponse(
                    crowdLevel,
                    percentage,
                    waitingTime,
                    bestTime,
                    recommendation,
                    confidence
                );
            }
        }
    }

    private int encodeMonth(String month) {
        // Classes: ['April', 'August', 'December', 'February', 'January', 'July', 'June', 'March', 'May', 'November', 'October', 'September']
        if (month == null) return 4; // default to January
        switch (month.trim()) {
            case "April": return 0;
            case "August": return 1;
            case "December": return 2;
            case "February": return 3;
            case "January": return 4;
            case "July": return 5;
            case "June": return 6;
            case "March": return 7;
            case "May": return 8;
            case "November": return 9;
            case "October": return 10;
            case "September": return 11;
            default: return 4; // default January
        }
    }

    private int encodeSeason(String season) {
        // Classes: ['Monsoon', 'Post-Monsoon', 'Summer', 'Winter']
        if (season == null) return 3; // default Winter
        switch (season.trim()) {
            case "Monsoon": return 0;
            case "Post-Monsoon": return 1;
            case "Summer": return 2;
            case "Winter": return 3;
            default: return 3;
        }
    }

    private int encodeWeekend(String weekend) {
        // Classes: ['No', 'Yes']
        if ("Yes".equalsIgnoreCase(weekend)) return 1;
        return 0;
    }

    private int encodeHoliday(String holiday) {
        // Classes: ['No', 'Yes']
        if ("Yes".equalsIgnoreCase(holiday)) return 1;
        return 0;
    }

    private int encodeDuration(String duration) {
        // Classes: ['1 day', '2 days', '3 days', '4 days', '5 days']
        if (duration == null) return 0; // default 1 day
        switch (duration.trim()) {
            case "1 day": return 0;
            case "2 days": return 1;
            case "3 days": return 2;
            case "4 days": return 3;
            case "5 days": return 4;
            default: return 0;
        }
    }
}
