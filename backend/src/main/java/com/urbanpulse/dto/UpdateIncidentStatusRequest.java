package com.urbanpulse.dto;

import com.urbanpulse.enums.IncidentStatus;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class UpdateIncidentStatusRequest {

    @NotNull(message = "El nuevo estado es obligatorio")
    private IncidentStatus status;

    @Size(max = 1000, message = "El motivo no puede superar los 1000 caracteres")
    private String reason;

    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
