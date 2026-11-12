package com.urbanpulse.external.adapter;

import com.urbanpulse.external.context.ExternalObservation;
import com.urbanpulse.external.service.WeatherService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MockWeatherAdapter implements WeatherService {

    @Override
    public String getWeatherSummary(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return "Clima no disponible (degradación controlada)";
        }
        return "22°C, Parcialmente nublado, Humedad 65%";
    }

    @Override
    public List<ExternalObservation> getObservations(Double latitude, Double longitude) {
        List<ExternalObservation> observations = new ArrayList<>();
        if (latitude == null || longitude == null) {
            return observations;
        }
        observations.add(observation("TEMPERATURE", "CELSIUS", 22.5, 0.98));
        observations.add(observation("HUMIDITY", "PERCENTAGE", 65.0, 0.95));
        return observations;
    }

    private ExternalObservation observation(String metric, String unit, double value, double quality) {
        ExternalObservation obs = new ExternalObservation();
        obs.setSource("AEMET_MOCK");
        obs.setMetricName(metric);
        obs.setUnit(unit);
        obs.setValue(value);
        obs.setQualityScore(quality);
        obs.setObservationTimestamp(LocalDateTime.now());
        obs.setIngestionTimestamp(LocalDateTime.now());
        return obs;
    }
}
