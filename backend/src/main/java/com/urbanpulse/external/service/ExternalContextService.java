package com.urbanpulse.external.service;

import com.urbanpulse.external.context.ExternalObservation;
import com.urbanpulse.external.context.UrbanContext;
import com.urbanpulse.external.location.LocationContext;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExternalContextService {

    private final GeoLocationService geoLocationService;
    private final WeatherService weatherService;
    private final TrafficService trafficService;

    public ExternalContextService(GeoLocationService geoLocationService,
                                  WeatherService weatherService,
                                  TrafficService trafficService) {
        this.geoLocationService = geoLocationService;
        this.weatherService = weatherService;
        this.trafficService = trafficService;
    }

    public UrbanContext getUrbanContext(Double latitude, Double longitude) {

        LocationContext locationContext = geoLocationService.getLocationContext(latitude, longitude);
        String weatherSummary = weatherService.getWeatherSummary(latitude, longitude);
        List<ExternalObservation> observations = weatherService.getObservations(latitude, longitude);
        String trafficStatus = trafficService.getTrafficStatus(latitude, longitude);

        UrbanContext context = new UrbanContext();
        context.setWeatherSummary(weatherSummary);
        context.setTrafficStatus(trafficStatus);
        context.setLocationContext(locationContext);
        context.setCapturedAt(LocalDateTime.now());
        context.setObservations(observations);

        return context;
    }
}