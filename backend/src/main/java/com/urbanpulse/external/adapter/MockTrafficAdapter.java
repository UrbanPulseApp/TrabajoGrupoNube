package com.urbanpulse.external.adapter;

import com.urbanpulse.external.service.TrafficService;
import org.springframework.stereotype.Service;

@Service
public class MockTrafficAdapter implements TrafficService {

    @Override
    public String getTrafficStatus(Double latitude, Double longitude) {
        try {
            if (latitude == null || longitude == null) {
                return "Tráfico no disponible (degradación controlada)";
            }
            return "Fluido / Retención moderada en accesos";
        } catch (Exception e) {
            return "Servicio de tráfico no disponible (degradación controlada)";
        }
    }
}