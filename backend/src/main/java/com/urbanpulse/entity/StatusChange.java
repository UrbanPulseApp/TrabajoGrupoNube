package com.urbanpulse.entity;

import com.urbanpulse.enums.IncidentStatus;
import javax.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

// Transición de estado auditable (RF12). Registra el estado anterior y el nuevo,
// el actor que la provoca, el instante y el motivo. Conserva el historial completo
// del ciclo de vida de la incidencia.
@Entity
@Table(name = "status_changes")
public class StatusChange {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID incidentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus newStatus;

    // Actor responsable del cambio (opcional mientras no exista gestión de usuarios).
    @Column
    private UUID actorId;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    public StatusChange() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(UUID incidentId) {
        this.incidentId = incidentId;
    }

    public IncidentStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(IncidentStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public IncidentStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(IncidentStatus newStatus) {
        this.newStatus = newStatus;
    }

    public UUID getActorId() {
        return actorId;
    }

    public void setActorId(UUID actorId) {
        this.actorId = actorId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}
