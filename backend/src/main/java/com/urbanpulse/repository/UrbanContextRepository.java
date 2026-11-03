package com.urbanpulse.repository;

import com.urbanpulse.entity.UrbanContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UrbanContextRepository extends JpaRepository<UrbanContext, UUID> {

    Optional<UrbanContext> findByIncidentId(UUID incidentId);

    @Query("SELECT u.district, COUNT(u) FROM UrbanContext u WHERE u.district IS NOT NULL GROUP BY u.district")
    List<Object[]> countByDistrict();
}
