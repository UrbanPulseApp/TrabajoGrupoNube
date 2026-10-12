package com.urbanpulse.service;

import com.urbanpulse.dto.CreateIncidentRequest;
import com.urbanpulse.dto.IncidentResponse;
import com.urbanpulse.dto.LocationResponse;
import com.urbanpulse.entity.Incident;
import com.urbanpulse.enums.IncidentStatus;
import com.urbanpulse.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;

    public IncidentService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

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

        return mapToResponse(savedIncident);
    }

    public IncidentResponse getById(UUID id) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Incidencia no encontrada")
                );

        return mapToResponse(incident);
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