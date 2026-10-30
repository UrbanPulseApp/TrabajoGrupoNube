package com.urbanpulse.controller;

import com.urbanpulse.dto.CreateIncidentRequest;
import com.urbanpulse.dto.IncidentResponse;
import com.urbanpulse.dto.StatusChangeResponse;
import com.urbanpulse.dto.UpdateIncidentStatusRequest;
import com.urbanpulse.enums.IncidentStatus;
import com.urbanpulse.service.IncidentService;
import javax.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ResponseEntity<IncidentResponse> createIncident(
            @Valid @RequestBody CreateIncidentRequest request) {

        IncidentResponse response =
                incidentService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<Page<IncidentResponse>> searchIncidents(
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, name = "q") String query,
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "-createdAt") String sort) {
        if (page < 0) throw new IllegalArgumentException("page debe ser mayor o igual que 0");
        if (size < 1 || size > 100) throw new IllegalArgumentException("size debe estar entre 1 y 100");
        return ResponseEntity.ok(incidentService.search(status, category, query, from, to, page, size, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncident(
            @PathVariable UUID id) {

        IncidentResponse response =
                incidentService.getById(id);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<IncidentResponse> transitionIncident(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateIncidentStatusRequest request) {
        return ResponseEntity.ok(incidentService.transition(id, request));
    }

    @GetMapping("/{id}/status-changes")
    public ResponseEntity<List<StatusChangeResponse>> getStatusChanges(@PathVariable UUID id) {
        return ResponseEntity.ok(incidentService.getStatusChanges(id));
    }
}
