package com.urbanpulse.external.context;

import com.urbanpulse.external.location.LocationContext;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrbanContext {

    private UUID incidentId;
    private String weatherSummary;
    private String trafficStatus;
    private LocationContext locationContext;
    private LocalDateTime capturedAt;

    @Builder.Default
    private List<ExternalObservation> observations = new ArrayList<>();


    public UUID getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(UUID incidentId) {
        this.incidentId = incidentId;
    }

    public String getWeatherSummary() {
        return weatherSummary;
    }

    public void setWeatherSummary(String weatherSummary) {
        this.weatherSummary = weatherSummary;
    }

    public String getTrafficStatus() {
        return trafficStatus;
    }

    public void setTrafficStatus(String trafficStatus) {
        this.trafficStatus = trafficStatus;
    }

    public LocationContext getLocationContext() {
        return locationContext;
    }

    public void setLocationContext(LocationContext locationContext) {
        this.locationContext = locationContext;
    }

    public LocalDateTime getCapturedAt() {
        return capturedAt;
    }

    public void setCapturedAt(LocalDateTime capturedAt) {
        this.capturedAt = capturedAt;
    }

    public List<ExternalObservation> getObservations() {
        return observations;
    }

    public void setObservations(List<ExternalObservation> observations) {
        this.observations = observations;
    }
}