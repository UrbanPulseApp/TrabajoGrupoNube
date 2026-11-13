package com.urbanpulse.dto;

import com.urbanpulse.enums.IncidentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class MapIncidentResponse {

    private UUID id;
    private String title;
    private String description;
    private String category;
    private IncidentStatus status;
    private LocalDateTime createdAt;
    private Double latitude;
    private Double longitude;

    public MapIncidentResponse(UUID id, String title, String description, String category,
                               IncidentStatus status, LocalDateTime createdAt,
                               Double latitude, Double longitude) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.createdAt = createdAt;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public IncidentStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
}
