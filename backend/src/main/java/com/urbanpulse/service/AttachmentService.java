package com.urbanpulse.service;

import com.urbanpulse.dto.AttachmentResponse;
import com.urbanpulse.entity.Attachment;
import com.urbanpulse.exception.ResourceNotFoundException;
import com.urbanpulse.repository.AttachmentRepository;
import com.urbanpulse.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    private static final long MAX_SIZE = 10L * 1024L * 1024L;
    private static final long MAX_ATTACHMENTS = 4L;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "application/pdf");

    private final AttachmentRepository attachmentRepository;
    private final IncidentRepository incidentRepository;
    private final Path storageDirectory;

    public AttachmentService(AttachmentRepository attachmentRepository,
                             IncidentRepository incidentRepository,
                             @Value("${urbanpulse.attachments.directory:uploads/attachments}") String directory) {
        this.attachmentRepository = attachmentRepository;
        this.incidentRepository = incidentRepository;
        this.storageDirectory = Paths.get(directory).toAbsolutePath().normalize();
    }

    @Transactional
    public AttachmentResponse upload(UUID incidentId, MultipartFile file) {
        ensureIncidentExists(incidentId);
        if (attachmentRepository.countByIncidentId(incidentId) >= MAX_ATTACHMENTS) {
            throw new IllegalArgumentException("Una incidencia admite como máximo 4 evidencias");
        }
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Selecciona un archivo no vacío");
        if (file.getSize() > MAX_SIZE) throw new IllegalArgumentException("El archivo supera el máximo de 10 MB");
        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipo de archivo no permitido. Usa JPG, PNG, WEBP o PDF");
        }

        String originalName = Paths.get(StringUtils.cleanPath(file.getOriginalFilename() == null
                ? "evidencia" : file.getOriginalFilename())).getFileName().toString();
        if (!StringUtils.hasText(originalName) || originalName.contains("..") || originalName.length() > 255) {
            throw new IllegalArgumentException("Nombre de archivo no válido");
        }

        Attachment attachment = new Attachment();
        attachment.setIncidentId(incidentId);
        attachment.setFilename(originalName);
        attachment.setContentType(contentType.toLowerCase());
        attachment.setSize(file.getSize());
        attachment.setStorageLocation(UUID.randomUUID().toString());
        attachment.setCreatedAt(LocalDateTime.now());

        Path destination = storageDirectory.resolve(attachment.getStorageLocation()).normalize();
        if (!destination.startsWith(storageDirectory)) throw new IllegalArgumentException("Ruta de archivo no válida");
        try {
            Files.createDirectories(storageDirectory);
            file.transferTo(destination.toFile());
            return toResponse(attachmentRepository.save(attachment));
        } catch (IOException | RuntimeException ex) {
            try { Files.deleteIfExists(destination); } catch (IOException ignored) { }
            throw new IllegalStateException("No se pudo almacenar el archivo", ex);
        }
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> list(UUID incidentId) {
        ensureIncidentExists(incidentId);
        return attachmentRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Attachment downloadMetadata(UUID incidentId, UUID attachmentId) {
        ensureIncidentExists(incidentId);
        return attachmentRepository.findByIdAndIncidentId(attachmentId, incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto no encontrado: " + attachmentId));
    }

    public Path resolveStoredFile(Attachment attachment) {
        Path path = storageDirectory.resolve(attachment.getStorageLocation()).normalize();
        if (!path.startsWith(storageDirectory)) throw new IllegalStateException("Ruta de archivo no válida");
        if (!Files.isRegularFile(path)) throw new ResourceNotFoundException("El archivo adjunto ya no está disponible");
        return path;
    }

    private void ensureIncidentExists(UUID incidentId) {
        if (!incidentRepository.existsById(incidentId)) {
            throw new ResourceNotFoundException("Incidencia no encontrada: " + incidentId);
        }
    }

    private AttachmentResponse toResponse(Attachment attachment) {
        AttachmentResponse response = new AttachmentResponse();
        response.setId(attachment.getId());
        response.setIncidentId(attachment.getIncidentId());
        response.setFilename(attachment.getFilename());
        response.setContentType(attachment.getContentType());
        response.setSize(attachment.getSize());
        response.setCreatedAt(attachment.getCreatedAt());
        return response;
    }
}
