package com.urbanpulse.external.service;

import com.urbanpulse.external.context.ExternalObservation;
import java.util.List;

public interface WeatherService {
    String getWeatherSummary(Double latitude, Double longitude);
    List<ExternalObservation> getObservations(Double latitude, Double longitude);
}