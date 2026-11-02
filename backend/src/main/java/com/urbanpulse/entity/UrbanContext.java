package com.urbanpulse.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "urban_contexts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrbanContext {

    @Id
    private UUID incidentId;

    @Column
    private String district;

    @Column
    private String neighborhood;

    @Column
    private String address;

    @Column
    private String weatherSummary;

    @Column
    private String trafficStatus;

    @Column(nullable = false)
    private LocalDateTime capturedAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "urban_context_id")
    @Builder.Default
    private List<ExternalObservation> observations = new ArrayList<>();

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

    public List<ExternalObservation> getObservations() {
        return observations;
    }

    public void setObservations(List<ExternalObservation> observations) {
        this.observations = observations;
    }
}
