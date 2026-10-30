package com.urbanpulse.entity;

import com.urbanpulse.external.location.LocationContext;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
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
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID incidentId;

    @Column
    private String weatherSummary;

    @Column
    private String trafficStatus;

    @Embedded
    private LocationContext locationContext;

    @Column(nullable = false)
    private LocalDateTime capturedAt;

    @OneToMany(mappedBy = "urbanContext", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExternalObservation> observations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.capturedAt == null) {
            this.capturedAt = LocalDateTime.now();
        }
    }

    public void addObservation(ExternalObservation observation) {
        if (this.observations == null) {
            this.observations = new ArrayList<>();
        }
        this.observations.add(observation);
        observation.setUrbanContext(this);
    }

    public void removeObservation(ExternalObservation observation) {
        if (this.observations != null) {
            this.observations.remove(observation);
            observation.setUrbanContext(null);
        }
    }
}