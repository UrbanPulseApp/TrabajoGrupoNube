package com.urbanpulse.dto;

import com.urbanpulse.enums.IncidentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class StatusChangeResponse {

    private UUID id;
    private IncidentStatus previousStatus;
    private IncidentStatus newStatus;
    private String reason;
    private LocalDateTime changedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public IncidentStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(IncidentStatus previousStatus) { this.previousStatus = previousStatus; }
    public IncidentStatus getNewStatus() { return newStatus; }
    public void setNewStatus(IncidentStatus newStatus) { this.newStatus = newStatus; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}
