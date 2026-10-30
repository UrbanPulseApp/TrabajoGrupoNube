package com.urbanpulse.service;

import com.urbanpulse.dto.AssignmentResponse;
import com.urbanpulse.dto.CreateAssignmentRequest;
import com.urbanpulse.entity.Assignment;
import com.urbanpulse.entity.Incident;
import com.urbanpulse.entity.StatusChange;
import com.urbanpulse.enums.AssignmentStatus;
import com.urbanpulse.enums.IncidentStatus;
import com.urbanpulse.exception.InvalidTransitionException;
import com.urbanpulse.exception.ResourceNotFoundException;
import com.urbanpulse.repository.AssignmentRepository;
import com.urbanpulse.repository.IncidentRepository;
import com.urbanpulse.repository.StatusChangeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final IncidentRepository incidentRepository;
    private final StatusChangeRepository statusChangeRepository;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             IncidentRepository incidentRepository,
                             StatusChangeRepository statusChangeRepository) {
        this.assignmentRepository = assignmentRepository;
        this.incidentRepository = incidentRepository;
        this.statusChangeRepository = statusChangeRepository;
    }

    @Transactional
    public AssignmentResponse create(UUID incidentId, CreateAssignmentRequest request) {

        // La incidencia debe existir antes de asignarla (404 si no existe).
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Incidencia no encontrada: " + incidentId)
                );

        // RF11: solo una incidencia validada (o ya asignada) puede asignarse.
        // RF12: la transición a ASSIGNED debe ser una transición permitida.
        if (!incident.getStatus().canTransitionTo(IncidentStatus.ASSIGNED)) {
            throw new InvalidTransitionException(
                    "No se puede asignar una incidencia en estado " + incident.getStatus());
        }

        Assignment assignment = new Assignment();

        assignment.setIncidentId(incidentId);
        assignment.setDepartment(request.getDepartment());
        assignment.setTeamId(request.getTeamId());
        assignment.setTechnicianId(request.getTechnicianId());
        assignment.setNotes(request.getNotes());

        // Toda asignación nueva comienza activa.
        assignment.setStatus(AssignmentStatus.ACTIVE);
        assignment.setAssignedAt(LocalDateTime.now());

        Assignment savedAssignment = assignmentRepository.save(assignment);

        // La incidencia pasa a ASSIGNED y queda auditado el cambio (RF12).
        registerStatusChange(incident, IncidentStatus.ASSIGNED,
                "Asignada a " + request.getDepartment());

        return mapToResponse(savedAssignment);
    }

    public List<AssignmentResponse> getByIncident(UUID incidentId) {

        return assignmentRepository.findByIncidentId(incidentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void registerStatusChange(Incident incident, IncidentStatus newStatus, String reason) {

        IncidentStatus previous = incident.getStatus();

        incident.setStatus(newStatus);
        incidentRepository.save(incident);

        StatusChange change = new StatusChange();
        change.setIncidentId(incident.getId());
        change.setPreviousStatus(previous);
        change.setNewStatus(newStatus);
        change.setReason(reason);
        change.setChangedAt(LocalDateTime.now());

        statusChangeRepository.save(change);
    }

    private AssignmentResponse mapToResponse(Assignment assignment) {

        AssignmentResponse response = new AssignmentResponse();

        response.setId(assignment.getId());
        response.setIncidentId(assignment.getIncidentId());
        response.setDepartment(assignment.getDepartment());
        response.setTeamId(assignment.getTeamId());
        response.setTechnicianId(assignment.getTechnicianId());
        response.setStatus(assignment.getStatus());
        response.setNotes(assignment.getNotes());
        response.setAssignedAt(assignment.getAssignedAt());
        response.setCompletedAt(assignment.getCompletedAt());

        return response;
    }
}

