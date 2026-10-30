package com.urbanpulse.repository;

import com.urbanpulse.entity.ExternalObservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExternalObservationRepository extends JpaRepository<ExternalObservation, UUID> {

    // Opción explícita con JPQL apuntando a 'incidentId'
    @Query("SELECT e FROM ExternalObservation e WHERE e.urbanContext.incidentId = :incidentId")
    List<ExternalObservation> findByUrbanContextId(@Param("incidentId") UUID incidentId);

    // Opción basada en la convención de nombres de Spring Data JPA (Navegación: urbanContext.incidentId)
    List<ExternalObservation> findByUrbanContextIncidentId(UUID incidentId);
}