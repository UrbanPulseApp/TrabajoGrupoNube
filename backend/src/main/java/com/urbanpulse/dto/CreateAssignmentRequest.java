package com.urbanpulse.dto;


import javax.validation.constraints.NotBlank;
import java.util.UUID;

public class CreateAssignmentRequest {

    @NotBlank(message = "El departamento es obligatorio")
    private String department;

    private UUID teamId;

    private UUID technicianId;

    private String notes;

    public CreateAssignmentRequest() {
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public UUID getTeamId() {
        return teamId;
    }

    public void setTeamId(UUID teamId) {
        this.teamId = teamId;
    }

    public UUID getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(UUID technicianId) {
        this.technicianId = technicianId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

