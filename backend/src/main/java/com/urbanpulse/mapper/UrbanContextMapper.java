package com.urbanpulse.mapper;

import com.urbanpulse.dto.ExternalObservationResponse;
import com.urbanpulse.dto.UrbanAssetResponse;
import com.urbanpulse.dto.UrbanContextResponse;
import com.urbanpulse.entity.UrbanContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UrbanContextMapper {

    public UrbanContextResponse toResponseDto(UrbanContext entity, List<UrbanAssetResponse> nearbyAssets) {
        if (entity == null) {
            return null;
        }

        UrbanContextResponse response = new UrbanContextResponse();
        response.setIncidentId(entity.getIncidentId());
        response.setDistrict(entity.getDistrict());
        response.setNeighborhood(entity.getNeighborhood());
        response.setAddress(entity.getAddress());
        response.setWeatherSummary(entity.getWeatherSummary());
        response.setTrafficStatus(entity.getTrafficStatus());
        response.setCapturedAt(entity.getCapturedAt());

        if (entity.getObservations() != null) {
            response.setObservations(entity.getObservations().stream()
                    .map(obs -> new ExternalObservationResponse(
                            obs.getSource(),
                            obs.getMetricName(),
                            obs.getUnit(),
                            obs.getValue(),
                            obs.getQualityScore(),
                            obs.getObservationTimestamp()))
                    .collect(Collectors.toList()));
        } else {
            response.setObservations(new ArrayList<>());
        }

        response.setNearbyAssets(nearbyAssets != null ? nearbyAssets : new ArrayList<>());
        return response;
    }
}
