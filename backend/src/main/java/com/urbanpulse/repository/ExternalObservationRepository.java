package com.urbanpulse.repository;

import com.urbanpulse.entity.ExternalObservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExternalObservationRepository extends JpaRepository<ExternalObservation, UUID> {

    List<ExternalObservation> findByUrbanContextId(UUID urbanContextId);
}