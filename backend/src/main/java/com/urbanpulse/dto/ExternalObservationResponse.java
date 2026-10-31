package com.urbanpulse.dto;

import java.time.LocalDateTime;

public class ExternalObservationResponse {

    private String source;
    private String metricName;
    private String unit;
    private Double value;
    private Double qualityScore;
    private LocalDateTime observationTimestamp;

    public ExternalObservationResponse() {
    }

    public ExternalObservationResponse(String source, String metricName, String unit, Double value,
                                       Double qualityScore, LocalDateTime observationTimestamp) {
        this.source = source;
        this.metricName = metricName;
        this.unit = unit;
        this.value = value;
        this.qualityScore = qualityScore;
        this.observationTimestamp = observationTimestamp;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getMetricName() {
        return metricName;
    }

    public void setMetricName(String metricName) {
        this.metricName = metricName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public Double getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Double qualityScore) {
        this.qualityScore = qualityScore;
    }

    public LocalDateTime getObservationTimestamp() {
        return observationTimestamp;
    }

    public void setObservationTimestamp(LocalDateTime observationTimestamp) {
        this.observationTimestamp = observationTimestamp;
    }
}
