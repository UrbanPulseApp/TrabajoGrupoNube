package com.urbanpulse.dto;

import java.time.Instant;
import java.util.List;

public class OpenDataIncidentsResponse {
    private List<OpenDataIncidentResponse> incidents;
    private List<Integer> yearsIncluded;
    private List<Integer> unavailableYears;
    private Instant loadedAt;
    private int totalAvailable;
    private boolean truncated;

    public OpenDataIncidentsResponse() { }

    public OpenDataIncidentsResponse(List<OpenDataIncidentResponse> incidents,
                                     List<Integer> yearsIncluded,
                                     List<Integer> unavailableYears,
                                     Instant loadedAt,
                                     int totalAvailable,
                                     boolean truncated) {
        this.incidents = incidents;
        this.yearsIncluded = yearsIncluded;
        this.unavailableYears = unavailableYears;
        this.loadedAt = loadedAt;
        this.totalAvailable = totalAvailable;
        this.truncated = truncated;
    }

    public List<OpenDataIncidentResponse> getIncidents() { return incidents; }
    public void setIncidents(List<OpenDataIncidentResponse> incidents) { this.incidents = incidents; }
    public List<Integer> getYearsIncluded() { return yearsIncluded; }
    public void setYearsIncluded(List<Integer> yearsIncluded) { this.yearsIncluded = yearsIncluded; }
    public List<Integer> getUnavailableYears() { return unavailableYears; }
    public void setUnavailableYears(List<Integer> unavailableYears) { this.unavailableYears = unavailableYears; }
    public Instant getLoadedAt() { return loadedAt; }
    public void setLoadedAt(Instant loadedAt) { this.loadedAt = loadedAt; }
    public int getTotalAvailable() { return totalAvailable; }
    public void setTotalAvailable(int totalAvailable) { this.totalAvailable = totalAvailable; }
    public boolean isTruncated() { return truncated; }
    public void setTruncated(boolean truncated) { this.truncated = truncated; }
}
