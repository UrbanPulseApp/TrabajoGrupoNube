package com.urbanpulse.mapper;

import com.urbanpulse.entity.UrbanContext;
import com.urbanpulse.external.context.ExternalObservation;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class UrbanContextMapper {

    public UrbanContext toEntity(com.urbanpulse.external.context.UrbanContext dto, UUID incidentId) {
        UrbanContext entity = new UrbanContext();
        entity.setIncidentId(incidentId);

        if (dto != null) {
            entity.setWeatherSummary(dto.getWeatherSummary());
            entity.setTrafficStatus(dto.getTrafficStatus());
            entity.setCapturedAt(dto.getCapturedAt() != null ? dto.getCapturedAt() : LocalDateTime.now());

            if (dto.getObservations() != null) {
                List<com.urbanpulse.entity.ExternalObservation> entityObsList = dto.getObservations().stream()
                        .map(this::toObservationEntity)
                        .collect(Collectors.toList());
                entity.setObservations(entityObsList);
            }
        } else {
            entity.setWeatherSummary("No disponible (degradación controlada)");
            entity.setTrafficStatus("No disponible (degradación controlada)");
            entity.setCapturedAt(LocalDateTime.now());
        }

        return entity;
    }

    public com.urbanpulse.external.context.UrbanContext toDto(UrbanContext entity) {
        if (entity == null) {
            return null;
        }

        com.urbanpulse.external.context.UrbanContext dto = new com.urbanpulse.external.context.UrbanContext();
        dto.setIncidentId(entity.getIncidentId());
        dto.setWeatherSummary(entity.getWeatherSummary());
        dto.setTrafficStatus(entity.getTrafficStatus());
        dto.setCapturedAt(entity.getCapturedAt());

        if (entity.getObservations() != null) {
            List<ExternalObservation> dtoObsList = entity.getObservations().stream()
                    .map(this::toObservationDto)
                    .collect(Collectors.toList());
            dto.setObservations(dtoObsList);
        }

        return dto;
    }

    private com.urbanpulse.entity.ExternalObservation toObservationEntity(ExternalObservation dto) {
        com.urbanpulse.entity.ExternalObservation entity = new com.urbanpulse.entity.ExternalObservation();
        entity.setSource(dto.getSource());
        entity.setMetricName(dto.getMetricName());
        entity.setUnit(dto.getUnit());
        entity.setValue(convertToDouble(dto.getValue()));
        entity.setQualityScore(dto.getQualityScore());
        entity.setObservationTimestamp(dto.getObservationTimestamp());
        entity.setIngestionTimestamp(dto.getIngestionTimestamp());
        return entity;
    }

    private ExternalObservation toObservationDto(com.urbanpulse.entity.ExternalObservation entity) {
        ExternalObservation dto = new ExternalObservation();
        dto.setSource(entity.getSource());
        dto.setMetricName(entity.getMetricName());
        dto.setUnit(entity.getUnit());
        dto.setValue(convertToDouble(entity.getValue()));
        dto.setQualityScore(entity.getQualityScore());
        dto.setObservationTimestamp(entity.getObservationTimestamp());
        dto.setIngestionTimestamp(entity.getIngestionTimestamp());
        return dto;
    }

    private Double convertToDouble(Object rawValue) {
        if (rawValue == null) {
            return null;
        }
        if (rawValue instanceof Number) {
            return ((Number) rawValue).doubleValue();
        }
        try {
            return Double.valueOf(rawValue.toString());
        } catch (Exception e) {
            return null;
        }
    }
}