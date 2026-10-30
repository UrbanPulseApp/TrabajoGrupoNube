package com.urbanpulse.repository;

import com.urbanpulse.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {

    @Query("SELECT a FROM Attachment a WHERE a.incident.id = :incidentId ORDER BY a.createdAt ASC")
    List<Attachment> findByIncidentIdOrderByCreatedAtAsc(@Param("incidentId") UUID incidentId);

    @Query("SELECT a FROM Attachment a WHERE a.id = :id AND a.incident.id = :incidentId")
    Optional<Attachment> findByIdAndIncidentId(@Param("id") UUID id, @Param("incidentId") UUID incidentId);

    @Query("SELECT COUNT(a) FROM Attachment a WHERE a.incident.id = :incidentId")
    long countByIncidentId(@Param("incidentId") UUID incidentId);
}