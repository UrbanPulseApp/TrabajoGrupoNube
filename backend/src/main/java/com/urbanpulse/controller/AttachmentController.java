package com.urbanpulse.controller;

import com.urbanpulse.dto.AttachmentResponse;
import com.urbanpulse.entity.Attachment;
import com.urbanpulse.service.AttachmentService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents/{incidentId}/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentResponse> upload(@PathVariable UUID incidentId,
                                                      @RequestParam("file") @NotNull MultipartFile file) {
        return ResponseEntity.status(201).body(attachmentService.upload(incidentId, file));
    }

    @GetMapping
    public ResponseEntity<List<AttachmentResponse>> list(@PathVariable UUID incidentId) {
        return ResponseEntity.ok(attachmentService.list(incidentId));
    }

    @GetMapping("/{attachmentId}")
    public ResponseEntity<Resource> download(@PathVariable UUID incidentId,
                                              @PathVariable UUID attachmentId) throws IOException {
        Attachment attachment = attachmentService.downloadMetadata(incidentId, attachmentId);
        Path path = attachmentService.resolveStoredFile(attachment);
        MediaType type;
        try { type = MediaType.parseMediaType(attachment.getContentType()); }
        catch (IllegalArgumentException ex) { type = MediaType.APPLICATION_OCTET_STREAM; }
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(attachment.getFilename(), StandardCharsets.UTF_8).build();
        return ResponseEntity.ok()
                .contentType(type)
                .contentLength(attachment.getSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(new FileSystemResource(path));
    }
}
