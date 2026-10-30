package com.urbanpulse.repository;

import com.urbanpulse.entity.StatusChange;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StatusChangeRepository extends JpaRepository<StatusChange, UUID> {

    List<StatusChange> findByIncidentId(UUID incidentId);
}
