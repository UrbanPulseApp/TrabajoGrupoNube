package com.urbanpulse.service;

import com.urbanpulse.dto.CreateNotification;
import com.urbanpulse.dto.NotificationResponse;
import com.urbanpulse.entity.Incident;
import com.urbanpulse.entity.Notification;
import com.urbanpulse.entity.User;
import com.urbanpulse.repository.IncidentRepository;
import com.urbanpulse.repository.NotificationRepository;
import com.urbanpulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               IncidentRepository incidentRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
    }

    @Transactional
    public NotificationResponse createNotification(CreateNotification dto) {
        User recipient = userRepository.findById(dto.getRecipientId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + dto.getRecipientId()));

        Incident incident = null;
        if (dto.getIncidentId() != null) {
            incident = incidentRepository.findById(dto.getIncidentId())
                    .orElseThrow(() -> new IllegalArgumentException("Incidencia no encontrada con ID: " + dto.getIncidentId()));
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setIncident(incident);
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setType(dto.getType());
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(UUID userId, boolean unreadOnly) {
        List<Notification> notifications = unreadOnly
                ? notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId)
                : notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);

        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notificación no encontrada con ID: " + notificationId));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return mapToResponse(notification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setRecipientId(notification.getRecipient().getId());
        response.setIncidentId(notification.getIncident() != null ? notification.getIncident().getId() : null);
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        response.setReadAt(notification.getReadAt());
        return response;
    }
}
