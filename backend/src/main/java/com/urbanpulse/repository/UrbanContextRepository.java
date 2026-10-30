package com.urbanpulse.repository;

import com.urbanpulse.entity.UrbanContext;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UrbanContextRepository extends JpaRepository<UrbanContext, UUID> {

    Optional<UrbanContext> findByIncidentId(UUID incidentId);
}