package com.urbanpulse.repository;

import com.urbanpulse.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

    List<Assignment> findByIncidentId(UUID incidentId);

    Optional<Assignment> findByIdAndIncidentId(UUID id, UUID incidentId);

    boolean existsByIncidentIdAndStatus(UUID incidentId, com.urbanpulse.enums.AssignmentStatus status);
}
