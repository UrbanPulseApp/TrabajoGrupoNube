package com.urbanpulse.repository;

import com.urbanpulse.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    List<Attachment> findByIncidentIdOrderByCreatedAtAsc(UUID incidentId);
    Optional<Attachment> findByIdAndIncidentId(UUID id, UUID incidentId);
    long countByIncidentId(UUID incidentId);
}
