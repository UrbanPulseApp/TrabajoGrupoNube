package com.urbanpulse.entity;

import com.urbanpulse.enums.AssignmentStatus;
import javax.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

// Asignación: relación TEMPORAL entre una incidencia y un destino operativo
// (departamento, equipo y/o técnico), tal como define el modelo de dominio del
// caso de estudio UrbanPulse (RF11).
// Se guarda la referencia por UUID (mismo estilo que Attachment) para no acoplar
// el modelo de persistencia a relaciones JPA complejas en esta primera versión.
@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID incidentId;

    // Departamento responsable (ej. Movilidad, Limpieza, Alumbrado). Actúa como
    // destino mínimo obligatorio de la asignación.
    @Column(nullable = false)
    private String department;

    // Equipo de trabajo dentro del departamento (opcional).
    @Column
    private UUID teamId;

    // Técnico asignado (opcional: puede asignarse a departamento/equipo sin técnico concreto).
    @Column
    private UUID technicianId;

    // La asignación es temporal: existe mientras está ACTIVE y termina en
    // COMPLETED o CANCELLED, momento en que se registra la finalización.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private LocalDateTime assignedAt;

    @Column
    private LocalDateTime completedAt;

    public Assignment() {
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

    public AssignmentStatus getStatus() {
        return status;
    }

    public void setStatus(AssignmentStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}

