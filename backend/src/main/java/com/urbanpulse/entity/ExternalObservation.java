package com.urbanpulse.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "external_observations")
public class ExternalObservation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String source;

    @Column
    private String metricName;

    @Column(nullable = false)
    private LocalDateTime observationTimestamp;

    @Column(nullable = false)
    private LocalDateTime ingestionTimestamp;

    @Column
    private String unit;

    @Column
    private Double value;

    @Column
    private Double qualityScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "urban_context_id")
    private UrbanContext urbanContext;

    public ExternalObservation() {
    }

    public ExternalObservation(UUID id, String source, String metricName, LocalDateTime observationTimestamp,
                               LocalDateTime ingestionTimestamp, String unit, Double value,
                               Double qualityScore, UrbanContext urbanContext) {
        this.id = id;
        this.source = source;
        this.metricName = metricName;
        this.observationTimestamp = observationTimestamp;
        this.ingestionTimestamp = ingestionTimestamp;
        this.unit = unit;
        this.value = value;
        this.qualityScore = qualityScore;
        this.urbanContext = urbanContext;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public UrbanContext getUrbanContext() {
        return urbanContext;
    }

    public void setUrbanContext(UrbanContext urbanContext) {
        this.urbanContext = urbanContext;
    }
}