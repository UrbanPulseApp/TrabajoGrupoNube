package com.urbanpulse.dto;

public class UrbanAssetResponse {

    private String id;
    private String type;
    private String source;
    private Double latitude;
    private Double longitude;
    private Double distanceMeters;
    private String metadata;

    public UrbanAssetResponse() {
    }

    public UrbanAssetResponse(String id, String type, String source, Double latitude, Double longitude,
                              Double distanceMeters, String metadata) {
        this.id = id;
        this.type = type;
        this.source = source;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceMeters = distanceMeters;
        this.metadata = metadata;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getDistanceMeters() {
        return distanceMeters;
    }

    public void setDistanceMeters(Double distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}
