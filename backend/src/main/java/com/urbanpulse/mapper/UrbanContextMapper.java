package com.urbanpulse.mapper;

import com.urbanpulse.entity.ExternalObservation;
import com.urbanpulse.entity.UrbanContext;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class UrbanContextMapper {

    public UrbanContext toEntity(com.urbanpulse.external.context.UrbanContext dto, UUID incidentId) {
        UrbanContext entity = new UrbanContext();
        entity.setIncidentId(incidentId);

        if (dto == null) {
            entity.setWeatherSummary("No disponible (degradación controlada)");
            entity.setTrafficStatus("No disponible (degradación controlada)");
            entity.setCapturedAt(LocalDateTime.now());
            return entity;
        }

        entity.setWeatherSummary(dto.getWeatherSummary() != null ? dto.getWeatherSummary() : "Sin datos");
        entity.setTrafficStatus(dto.getTrafficStatus() != null ? dto.getTrafficStatus() : "Sin datos");
        entity.setCapturedAt(dto.getCapturedAt() != null ? dto.getCapturedAt() : LocalDateTime.now());

        if (dto.getObservations() != null) {
            for (com.urbanpulse.external.context.ExternalObservation obsDto : dto.getObservations()) {
                ExternalObservation obsEntity = new ExternalObservation();
                obsEntity.setSource(obsDto.getSource() != null ? obsDto.getSource() : "UNKNOWN");
                obsEntity.setMetricName(obsDto.getMetricName());
                obsEntity.setObservationTimestamp(
                        obsDto.getObservationTimestamp() != null ? obsDto.getObservationTimestamp() : LocalDateTime.now()
                );
                obsEntity.setIngestionTimestamp(
                        obsDto.getIngestionTimestamp() != null ? obsDto.getIngestionTimestamp() : LocalDateTime.now()
                );
                obsEntity.setUnit(obsDto.getUnit());

                if (obsDto.getValue() instanceof Number) {
                    obsEntity.setValue(((Number) obsDto.getValue()).doubleValue());
                } else {
                    obsEntity.setValue(null);
                }

                obsEntity.setQualityScore(obsDto.getQualityScore());
                entity.addObservation(obsEntity);
            }
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
            for (ExternalObservation obsEntity : entity.getObservations()) {
                com.urbanpulse.external.context.ExternalObservation obsDto = new com.urbanpulse.external.context.ExternalObservation();
                obsDto.setSource(obsEntity.getSource());
                obsDto.setMetricName(obsEntity.getMetricName());
                obsDto.setObservationTimestamp(obsEntity.getObservationTimestamp());
                obsDto.setIngestionTimestamp(obsEntity.getIngestionTimestamp());
                obsDto.setUnit(obsEntity.getUnit());
                obsDto.setValue(obsEntity.getValue());
                obsDto.setQualityScore(obsEntity.getQualityScore());

                dto.getObservations().add(obsDto);
            }
        }

        return dto;
    }
}