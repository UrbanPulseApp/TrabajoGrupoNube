package com.urbanpulse.repository;

import com.urbanpulse.entity.Incident;
import com.urbanpulse.dto.MapIncidentResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

public interface IncidentRepository extends JpaRepository<Incident, UUID>, JpaSpecificationExecutor<Incident> {

    @Query("SELECT new com.urbanpulse.dto.MapIncidentResponse(i.id, i.title, i.description, i.category, i.status, i.createdAt, i.latitude, i.longitude) " +
            "FROM Incident i WHERE i.latitude BETWEEN :minLatitude AND :maxLatitude " +
            "AND i.longitude BETWEEN :minLongitude AND :maxLongitude ORDER BY i.createdAt DESC")
    List<MapIncidentResponse> findForMap(@Param("minLatitude") Double minLatitude,
                                         @Param("maxLatitude") Double maxLatitude,
                                         @Param("minLongitude") Double minLongitude,
                                         @Param("maxLongitude") Double maxLongitude,
                                         Pageable pageable);

    long countByCreatedAtAfter(LocalDateTime dateTime);

    @Query("SELECT i.status, COUNT(i) FROM Incident i GROUP BY i.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT i.category, COUNT(i) FROM Incident i WHERE i.category IS NOT NULL GROUP BY i.category")
    List<Object[]> countGroupByCategory();
}
