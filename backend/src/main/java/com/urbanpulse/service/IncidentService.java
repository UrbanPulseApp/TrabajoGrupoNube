package com.urbanpulse.service;

import com.urbanpulse.dto.CreateIncidentRequest;
import com.urbanpulse.dto.IncidentResponse;
import com.urbanpulse.dto.LocationResponse;
import com.urbanpulse.dto.StatusChangeResponse;
import com.urbanpulse.dto.UpdateIncidentStatusRequest;
import com.urbanpulse.entity.Incident;
import com.urbanpulse.entity.StatusChange;
import com.urbanpulse.enums.IncidentStatus;
import com.urbanpulse.exception.InvalidTransitionException;
import com.urbanpulse.exception.ResourceNotFoundException;
import com.urbanpulse.repository.IncidentRepository;
import com.urbanpulse.repository.StatusChangeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final StatusChangeRepository statusChangeRepository;

    public IncidentService(IncidentRepository incidentRepository,
                           StatusChangeRepository statusChangeRepository) {
        this.incidentRepository = incidentRepository;
        this.statusChangeRepository = statusChangeRepository;
    }

    @Transactional
    public IncidentResponse create(CreateIncidentRequest request) {

        Incident incident = new Incident();

        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setCategory(request.getCategory());
        incident.setLatitude(request.getLatitude());
        incident.setLongitude(request.getLongitude());

        // Toda incidencia nueva comienza en REPORTED
        incident.setStatus(IncidentStatus.REPORTED);

        incident.setCreatedAt(LocalDateTime.now());

        Incident savedIncident = incidentRepository.save(incident);

        StatusChange initialChange = new StatusChange();
        initialChange.setIncidentId(savedIncident.getId());
        initialChange.setPreviousStatus(null);
        initialChange.setNewStatus(IncidentStatus.REPORTED);
        initialChange.setReason("Incidencia registrada");
        initialChange.setChangedAt(savedIncident.getCreatedAt());
        statusChangeRepository.save(initialChange);

        return mapToResponse(savedIncident);
    }

    public IncidentResponse getById(UUID id) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia no encontrada: " + id));

        return mapToResponse(incident);
    }

    @Transactional(readOnly = true)
    public Page<IncidentResponse> search(IncidentStatus status, String category, String query,
                                        LocalDateTime from, LocalDateTime to,
                                        int page, int size, String sortParameter) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new IllegalArgumentException("La fecha inicial no puede ser posterior a la fecha final");
        }

        Sort sort = parseSort(sortParameter);
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Incident> specification = Specification.where(null);
        if (status != null) {
            specification = specification.and((root, criteria, builder) -> builder.equal(root.get("status"), status));
        }
        if (StringUtils.hasText(category)) {
            String normalizedCategory = category.trim().toLowerCase();
            specification = specification.and((root, criteria, builder) ->
                    builder.equal(builder.lower(root.get("category")), normalizedCategory));
        }
        if (StringUtils.hasText(query)) {
            String term = "%" + query.trim().toLowerCase() + "%";
            specification = specification.and((root, criteria, builder) -> builder.or(
                    builder.like(builder.lower(root.get("title")), term),
                    builder.like(builder.lower(root.get("description")), term)));
        }
        if (from != null) {
            specification = specification.and((root, criteria, builder) ->
                    builder.greaterThanOrEqualTo(root.get("createdAt"), from));
        }
        if (to != null) {
            specification = specification.and((root, criteria, builder) ->
                    builder.lessThanOrEqualTo(root.get("createdAt"), to));
        }
        return incidentRepository.findAll(specification, pageable).map(this::mapToResponse);
    }

    @Transactional
    public IncidentResponse transition(UUID id, UpdateIncidentStatusRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia no encontrada: " + id));

        IncidentStatus previous = incident.getStatus();
        IncidentStatus target = request.getStatus();
        if (!previous.canTransitionTo(target)) {
            throw new InvalidTransitionException("No se puede cambiar una incidencia de " + previous + " a " + target);
        }
        if (target == IncidentStatus.REJECTED && !StringUtils.hasText(request.getReason())) {
            throw new InvalidTransitionException("El motivo es obligatorio para rechazar una incidencia");
        }

        incident.setStatus(target);
        Incident saved = incidentRepository.save(incident);

        StatusChange change = new StatusChange();
        change.setIncidentId(id);
        change.setPreviousStatus(previous);
        change.setNewStatus(target);
        change.setReason(StringUtils.hasText(request.getReason()) ? request.getReason().trim() : null);
        change.setChangedAt(LocalDateTime.now());
        statusChangeRepository.save(change);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<StatusChangeResponse> getStatusChanges(UUID incidentId) {
        if (!incidentRepository.existsById(incidentId)) {
            throw new ResourceNotFoundException("Incidencia no encontrada: " + incidentId);
        }
        return statusChangeRepository.findByIncidentIdOrderByChangedAtAsc(incidentId)
                .stream().map(this::mapToStatusChangeResponse).collect(Collectors.toList());
    }

    private Sort parseSort(String value) {
        if (!StringUtils.hasText(value)) return Sort.by(Sort.Direction.DESC, "createdAt");
        String[] parts = value.split(",", 2);
        String field = parts[0].startsWith("-") ? parts[0].substring(1) : parts[0];
        if (!field.equals("createdAt") && !field.equals("title") && !field.equals("status") && !field.equals("category")) {
            throw new IllegalArgumentException("Campo de ordenación no válido: " + field);
        }
        Sort.Direction direction = parts[0].startsWith("-") ? Sort.Direction.DESC : Sort.Direction.ASC;
        if (parts.length == 2) {
            try { direction = Sort.Direction.fromString(parts[1]); }
            catch (IllegalArgumentException ex) { throw new IllegalArgumentException("Dirección de ordenación no válida"); }
        }
        return Sort.by(direction, field);
    }

    private StatusChangeResponse mapToStatusChangeResponse(StatusChange change) {
        StatusChangeResponse response = new StatusChangeResponse();
        response.setId(change.getId());
        response.setPreviousStatus(change.getPreviousStatus());
        response.setNewStatus(change.getNewStatus());
        response.setReason(change.getReason());
        response.setChangedAt(change.getChangedAt());
        return response;
    }

    private IncidentResponse mapToResponse(Incident incident) {

        IncidentResponse response = new IncidentResponse();

        response.setId(incident.getId());
        response.setTitle(incident.getTitle());
        response.setDescription(incident.getDescription());
        response.setCategory(incident.getCategory());
        response.setStatus(incident.getStatus());
        response.setCreatedAt(incident.getCreatedAt());

        LocationResponse location = new LocationResponse(
                incident.getLatitude(),
                incident.getLongitude()
        );

        response.setLocation(location);

        return response;
    }
}
