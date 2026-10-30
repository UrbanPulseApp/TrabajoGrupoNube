package com.urbanpulse.dto;

import com.urbanpulse.enums.AssignmentStatus;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class UpdateAssignmentStatusRequest {

    @NotNull(message = "El nuevo estado de la asignación es obligatorio")
    private AssignmentStatus status;

    @Size(max = 1000, message = "Las notas no pueden superar los 1000 caracteres")
    private String notes;

    public AssignmentStatus getStatus() { return status; }
    public void setStatus(AssignmentStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
