package com.urbanpulse.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class UrbanContextResponse {

    private UUID incidentId;
    private String district;
    private String neighborhood;
    private String address;
    private String weatherSummary;
    private String trafficStatus;
    private LocalDateTime capturedAt;
    private List<ExternalObservationResponse> observations = new ArrayList<>();
    private List<UrbanAssetResponse> nearbyAssets = new ArrayList<>();

    public UrbanContextResponse() {
    }

    public UUID getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(UUID incidentId) {
        this.incidentId = incidentId;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getNeighborhood() {
        return neighborhood;
    }

    public void setNeighborhood(String neighborhood) {
        this.neighborhood = neighborhood;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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

    public List<ExternalObservationResponse> getObservations() {
        return observations;
    }

    public void setObservations(List<ExternalObservationResponse> observations) {
        this.observations = observations;
    }

    public List<UrbanAssetResponse> getNearbyAssets() {
        return nearbyAssets;
    }

    public void setNearbyAssets(List<UrbanAssetResponse> nearbyAssets) {
        this.nearbyAssets = nearbyAssets;
    }
}
