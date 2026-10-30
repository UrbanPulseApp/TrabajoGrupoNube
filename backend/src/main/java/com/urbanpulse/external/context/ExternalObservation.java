package com.urbanpulse.external.context;

import java.time.LocalDateTime;

public class ExternalObservation {

    private String source;
    private String metricName;
    private LocalDateTime observationTimestamp;
    private LocalDateTime ingestionTimestamp;
    private String unit;
    private Object value;
    private Double qualityScore;

    public ExternalObservation() {
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

    public LocalDateTime getObservationTimestamp() {
        return observationTimestamp;
    }

    public void setObservationTimestamp(LocalDateTime observationTimestamp) {
        this.observationTimestamp = observationTimestamp;
    }

    public LocalDateTime getIngestionTimestamp() {
        return ingestionTimestamp;
    }

    public void setIngestionTimestamp(LocalDateTime ingestionTimestamp) {
        this.ingestionTimestamp = ingestionTimestamp;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public Double getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Double qualityScore) {
        this.qualityScore = qualityScore;
    }
}