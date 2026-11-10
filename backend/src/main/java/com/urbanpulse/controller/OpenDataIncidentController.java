package com.urbanpulse.controller;

import com.urbanpulse.dto.OpenDataIncidentsResponse;
import com.urbanpulse.service.OpenDataIncidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/opendata/incidents")
public class OpenDataIncidentController {

    private final OpenDataIncidentService openDataIncidentService;

    public OpenDataIncidentController(OpenDataIncidentService openDataIncidentService) {
        this.openDataIncidentService = openDataIncidentService;
    }

    @GetMapping
    public ResponseEntity<OpenDataIncidentsResponse> getIncidents() {
        return ResponseEntity.ok(openDataIncidentService.getIncidents());
    }
}