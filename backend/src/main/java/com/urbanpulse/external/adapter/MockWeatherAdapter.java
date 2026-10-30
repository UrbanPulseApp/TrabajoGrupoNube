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
        try {
            if (latitude == null || longitude == null) {
                return "Clima no disponible (degradación controlada)";
            }
            return "22°C, Parcialmente nublado, Humedad 65%";
        } catch (Exception e) {
            return "Servicio meteorológico no disponible (degradación controlada)";
        }
    }

    @Override
    public List<ExternalObservation> getObservations(Double latitude, Double longitude) {
        List<ExternalObservation> observations = new ArrayList<>();

        try {
            if (latitude == null || longitude == null) {
                return observations;
            }
            ExternalObservation temp = new ExternalObservation();
            temp.setSource("AEMET_MOCK");
            temp.setMetricName("TEMPERATURE");
            temp.setUnit("CELSIUS");
            temp.setValue(22.5);
            temp.setQualityScore(0.98);
            temp.setObservationTimestamp(LocalDateTime.now());
            temp.setIngestionTimestamp(LocalDateTime.now());
            observations.add(temp);


            ExternalObservation humidity = new ExternalObservation();
            humidity.setSource("AEMET_MOCK");
            humidity.setMetricName("HUMIDITY");
            humidity.setUnit("PERCENTAGE");
            humidity.setValue(65.0);
            humidity.setQualityScore(0.95);
            humidity.setObservationTimestamp(LocalDateTime.now());
            humidity.setIngestionTimestamp(LocalDateTime.now());
            observations.add(humidity);

        } catch (Exception e) {

        }

        return observations;
    }
}