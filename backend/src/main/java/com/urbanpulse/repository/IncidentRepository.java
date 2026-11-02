package com.urbanpulse.repository;

import com.urbanpulse.entity.Incident;
import com.urbanpulse.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID>, JpaSpecificationExecutor<Incident> {

    long countByStatus(IncidentStatus status);

    long countByCreatedAtAfter(LocalDateTime dateTime);

    @Query("SELECT i.status, COUNT(i) FROM Incident i GROUP BY i.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT i.category, COUNT(i) FROM Incident i WHERE i.category IS NOT NULL GROUP BY i.category")
    List<Object[]> countGroupByCategory();
}
