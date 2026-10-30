package com.urbanpulse.external.context;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class UrbanContext {

    private UUID incidentId;
    private String weatherSummary;
    private String trafficStatus;
    private LocalDateTime capturedAt;
    private List<ExternalObservation> observations = new ArrayList<>();

    public UrbanContext() {
    }

    public UrbanContext(UUID incidentId, String weatherSummary, String trafficStatus,
                        LocalDateTime capturedAt, List<ExternalObservation> observations) {
        this.incidentId = incidentId;
        this.weatherSummary = weatherSummary;
        this.trafficStatus = trafficStatus;
        this.capturedAt = capturedAt;
        if (observations != null) {
            this.observations = observations;
        }
    }

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