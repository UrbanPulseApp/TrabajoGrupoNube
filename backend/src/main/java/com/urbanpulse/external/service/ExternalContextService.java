package com.urbanpulse.external.service;

import com.urbanpulse.entity.ExternalObservation;
import com.urbanpulse.entity.UrbanContext;
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

    /**
     * Consulta las fuentes externas y devuelve el contexto urbano sin asociar a ninguna incidencia
     * (quien lo invoca establece el {@code incidentId}).
     */
    public UrbanContext getUrbanContext(Double latitude, Double longitude) {
        LocationContext location = geoLocationService.getLocationContext(latitude, longitude);
        List<ExternalObservation> observations = weatherService.getObservations(latitude, longitude);

        UrbanContext context = new UrbanContext();
        context.setWeatherSummary(weatherService.getWeatherSummary(latitude, longitude));
        context.setTrafficStatus(trafficService.getTrafficStatus(latitude, longitude));
        context.setCapturedAt(LocalDateTime.now());
        if (location != null) {
            context.setDistrict(location.getDistrict());
            context.setNeighborhood(location.getNeighborhood());
            context.setAddress(location.getAddress());
        }
        if (observations != null) {
            context.setObservations(observations);
        }
        return context;
    }
}
