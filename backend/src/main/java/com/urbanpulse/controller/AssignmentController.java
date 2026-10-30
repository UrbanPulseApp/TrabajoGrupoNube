package com.urbanpulse.controller;

import com.urbanpulse.dto.AssignmentResponse;
import com.urbanpulse.dto.CreateAssignmentRequest;
import com.urbanpulse.dto.UpdateAssignmentStatusRequest;
import com.urbanpulse.service.AssignmentService;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents/{incidentId}/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> createAssignment(
            @PathVariable UUID incidentId,
            @Valid @RequestBody CreateAssignmentRequest request) {

        AssignmentResponse response =
                assignmentService.create(incidentId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<AssignmentResponse>> getAssignments(
            @PathVariable UUID incidentId) {

        List<AssignmentResponse> response =
                assignmentService.getByIncident(incidentId);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{assignmentId}")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @PathVariable UUID incidentId,
            @PathVariable UUID assignmentId,
            @Valid @RequestBody UpdateAssignmentStatusRequest request) {
        return ResponseEntity.ok(assignmentService.updateStatus(incidentId, assignmentId, request));
    }
}
