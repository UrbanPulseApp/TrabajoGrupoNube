package com.urbanpulse.service;

import com.urbanpulse.dto.CreateIncidentRequest;
import com.urbanpulse.dto.IncidentResponse;
import com.urbanpulse.dto.LocationResponse;
import com.urbanpulse.dto.StatusChangeResponse;
import com.urbanpulse.dto.UpdateIncidentStatusRequest;
import com.urbanpulse.dto.UrbanAssetResponse;
import com.urbanpulse.dto.UrbanContextResponse;
import com.urbanpulse.entity.Incident;
import com.urbanpulse.entity.StatusChange;
import com.urbanpulse.entity.UrbanAsset;
import com.urbanpulse.entity.UrbanContext;
import com.urbanpulse.enums.IncidentStatus;
import com.urbanpulse.exception.InvalidTransitionException;
import com.urbanpulse.exception.ResourceNotFoundException;
import com.urbanpulse.external.service.ExternalContextService;
import com.urbanpulse.mapper.UrbanContextMapper;
import com.urbanpulse.repository.IncidentRepository;
import com.urbanpulse.repository.StatusChangeRepository;
import com.urbanpulse.repository.UrbanAssetRepository;
import com.urbanpulse.repository.UrbanContextRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private static final List<IncidentStatus> ACTIVE_STATUSES = Arrays.asList(
            IncidentStatus.REPORTED,
            IncidentStatus.VALIDATED,
            IncidentStatus.ASSIGNED,
            IncidentStatus.IN_PROGRESS
    );

    private final IncidentRepository incidentRepository;
    private final StatusChangeRepository statusChangeRepository;
    private final ExternalContextService externalContextService;
    private final UrbanContextRepository urbanContextRepository;
    private final UrbanContextMapper urbanContextMapper;
    private final UrbanAssetRepository urbanAssetRepository;

    public IncidentService(IncidentRepository incidentRepository,
                           StatusChangeRepository statusChangeRepository,
                           ExternalContextService externalContextService,
                           UrbanContextRepository urbanContextRepository,
                           UrbanContextMapper urbanContextMapper,
                           UrbanAssetRepository urbanAssetRepository) {
        this.incidentRepository = incidentRepository;
        this.statusChangeRepository = statusChangeRepository;
        this.externalContextService = externalContextService;
        this.urbanContextRepository = urbanContextRepository;
        this.urbanContextMapper = urbanContextMapper;
        this.urbanAssetRepository = urbanAssetRepository;
    }

    @Transactional
    public IncidentResponse create(CreateIncidentRequest request) {

        Incident incident = new Incident();

        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setCategory(request.getCategory());
        incident.setLatitude(request.getLatitude());
        incident.setLongitude(request.getLongitude());

        // Toda incidencia nueva comienza en REPORTED
        incident.setStatus(IncidentStatus.REPORTED);

        incident.setCreatedAt(LocalDateTime.now());

        Incident savedIncident = incidentRepository.save(incident);

        StatusChange initialChange = new StatusChange();
        initialChange.setIncidentId(savedIncident.getId());
        initialChange.setPreviousStatus(null);
        initialChange.setNewStatus(IncidentStatus.REPORTED);
        initialChange.setReason("Incidencia registrada");
        initialChange.setChangedAt(savedIncident.getCreatedAt());
        statusChangeRepository.save(initialChange);

        // RF21, RF22, RF23, RF26: Captura de contexto urbano con degradación controlada
        enrichWithUrbanContext(savedIncident);

        return mapToResponse(savedIncident);
    }

    public IncidentResponse getById(UUID id) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia no encontrada: " + id));

        return mapToResponse(incident);
    }

    @Transactional(readOnly = true)
    public Page<IncidentResponse> search(IncidentStatus status, String category, String query,
                                         LocalDateTime from, LocalDateTime to,
                                         int page, int size, String sortParameter) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new IllegalArgumentException("La fecha inicial no puede ser posterior a la fecha final");
        }

        Sort sort = parseSort(sortParameter);
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Incident> specification = Specification.where(null);
        if (status != null) {
            specification = specification.and((root, criteria, builder) -> builder.equal(root.get("status"), status));
        }
        if (StringUtils.hasText(category)) {
            String normalizedCategory = category.trim().toLowerCase();
            specification = specification.and((root, criteria, builder) ->
                    builder.equal(builder.lower(root.get("category")), normalizedCategory));
        }
        if (StringUtils.hasText(query)) {
            String term = "%" + query.trim().toLowerCase() + "%";
            specification = specification.and((root, criteria, builder) -> builder.or(
                    builder.like(builder.lower(root.get("title")), term),
                    builder.like(builder.lower(root.get("description")), term)));
        }
        if (from != null) {
            specification = specification.and((root, criteria, builder) ->
                    builder.greaterThanOrEqualTo(root.get("createdAt"), from));
        }
        if (to != null) {
            specification = specification.and((root, criteria, builder) ->
                    builder.lessThanOrEqualTo(root.get("createdAt"), to));
        }
        return incidentRepository.findAll(specification, pageable).map(this::mapToResponse);
    }

    @Transactional
    public IncidentResponse transition(UUID id, UpdateIncidentStatusRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia no encontrada: " + id));

        IncidentStatus previous = incident.getStatus();
        IncidentStatus target = request.getStatus();
        if (!previous.canTransitionTo(target)) {
            throw new InvalidTransitionException("No se puede cambiar una incidencia de " + previous + " a " + target);
        }
        if (target == IncidentStatus.REJECTED && !StringUtils.hasText(request.getReason())) {
            throw new InvalidTransitionException("El motivo es obligatorio para rechazar una incidencia");
        }

        incident.setStatus(target);
        Incident saved = incidentRepository.save(incident);

        StatusChange change = new StatusChange();
        change.setIncidentId(id);
        change.setPreviousStatus(previous);
        change.setNewStatus(target);
        change.setReason(StringUtils.hasText(request.getReason()) ? request.getReason().trim() : null);
        change.setChangedAt(LocalDateTime.now());
        statusChangeRepository.save(change);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<StatusChangeResponse> getStatusChanges(UUID incidentId) {
        if (!incidentRepository.existsById(incidentId)) {
            throw new ResourceNotFoundException("Incidencia no encontrada: " + incidentId);
        }
        return statusChangeRepository.findByIncidentIdOrderByChangedAtAsc(incidentId)
                .stream().map(this::mapToStatusChangeResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UrbanContextResponse getUrbanContext(UUID incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia no encontrada: " + incidentId));

        UrbanContext urbanContext = urbanContextRepository.findByIncidentId(incidentId)
                .orElseGet(() -> {
                    try {
                        com.urbanpulse.external.context.UrbanContext external =
                                externalContextService.getUrbanContext(incident.getLatitude(), incident.getLongitude());
                        return urbanContextMapper.toEntity(external, incidentId);
                    } catch (Exception e) {
                        return urbanContextMapper.toEntity(null, incidentId);
                    }
                });

        // Activos físicos cercanos en un radio de 100m (RF22)
        List<UrbanAssetResponse> nearbyAssets = findNearbyAssets(incident.getLatitude(), incident.getLongitude(), 100.0);

        return urbanContextMapper.toResponseDto(urbanContext, nearbyAssets);
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> findDuplicates(Double latitude, Double longitude, String category, Double radiusMeters) {
        if (latitude == null || longitude == null) {
            throw new IllegalArgumentException("Las coordenadas latitude y longitude son obligatorias");
        }
        double radius = (radiusMeters != null && radiusMeters > 0) ? radiusMeters : 50.0;

        // Bounding box aproximado para reducir el conjunto a evaluar
        double latDelta = (radius / 111000.0) * 1.5;
        double lonDelta = (radius / (111000.0 * Math.cos(Math.toRadians(latitude)))) * 1.5;

        double minLat = latitude - latDelta;
        double maxLat = latitude + latDelta;
        double minLon = longitude - lonDelta;
        double maxLon = longitude + lonDelta;

        Specification<Incident> spec = (root, query, cb) -> cb.and(
                root.get("status").in(ACTIVE_STATUSES),
                cb.between(root.get("latitude"), minLat, maxLat),
                cb.between(root.get("longitude"), minLon, maxLon)
        );

        if (StringUtils.hasText(category)) {
            String normCategory = category.trim().toLowerCase();
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("category")), normCategory));
        }

        List<Incident> candidates = incidentRepository.findAll(spec);
        List<IncidentResponse> duplicates = new ArrayList<>();

        for (Incident inc : candidates) {
            double distance = calculateDistanceMeters(latitude, longitude, inc.getLatitude(), inc.getLongitude());
            if (distance <= radius) {
                IncidentResponse resp = mapToResponse(inc);
                resp.setDistanceMeters(Math.round(distance * 10.0) / 10.0);
                duplicates.add(resp);
            }
        }

        duplicates.sort(Comparator.comparingDouble(IncidentResponse::getDistanceMeters));
        return duplicates;
    }

    public List<UrbanAssetResponse> findNearbyAssets(Double latitude, Double longitude, Double radiusMeters) {
        if (latitude == null || longitude == null) {
            return Collections.emptyList();
        }
        double radius = (radiusMeters != null && radiusMeters > 0) ? radiusMeters : 100.0;

        double latDelta = (radius / 111000.0) * 1.5;
        double lonDelta = (radius / (111000.0 * Math.cos(Math.toRadians(latitude)))) * 1.5;

        List<UrbanAsset> candidates = urbanAssetRepository.findWithinBoundingBox(
                latitude - latDelta, latitude + latDelta,
                longitude - lonDelta, longitude + lonDelta);

        List<UrbanAssetResponse> results = new ArrayList<>();
        for (UrbanAsset asset : candidates) {
            double dist = calculateDistanceMeters(latitude, longitude, asset.getLatitude(), asset.getLongitude());
            if (dist <= radius) {
                results.add(new UrbanAssetResponse(
                        asset.getId(),
                        asset.getType(),
                        asset.getSource(),
                        asset.getLatitude(),
                        asset.getLongitude(),
                        Math.round(dist * 10.0) / 10.0,
                        asset.getMetadata()
                ));
            }
        }

        results.sort(Comparator.comparingDouble(UrbanAssetResponse::getDistanceMeters));
        return results;
    }

    private void enrichWithUrbanContext(Incident savedIncident) {
        try {
            com.urbanpulse.external.context.UrbanContext externalContext =
                    externalContextService.getUrbanContext(savedIncident.getLatitude(), savedIncident.getLongitude());
            UrbanContext urbanContextEntity = urbanContextMapper.toEntity(externalContext, savedIncident.getId());
            urbanContextRepository.save(urbanContextEntity);
        } catch (Exception ex) {
            // RF26: Degradación controlada - el fallo del servicio externo nunca debe impedir el guardado
            try {
                UrbanContext fallbackEntity = urbanContextMapper.toEntity(null, savedIncident.getId());
                urbanContextRepository.save(fallbackEntity);
            } catch (Exception ignored) {
                // Si la persistencia de contexto fallase, la incidencia ya quedó registrada de forma segura
            }
        }
    }

    public static double calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371000; // metros
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    private Sort parseSort(String value) {
        if (!StringUtils.hasText(value)) return Sort.by(Sort.Direction.DESC, "createdAt");
        String[] parts = value.split(",", 2);
        String field = parts[0].startsWith("-") ? parts[0].substring(1) : parts[0];
        if (!field.equals("createdAt") && !field.equals("title") && !field.equals("status") && !field.equals("category")) {
            throw new IllegalArgumentException("Campo de ordenación no válido: " + field);
        }
        Sort.Direction direction = parts[0].startsWith("-") ? Sort.Direction.DESC : Sort.Direction.ASC;
        if (parts.length == 2) {
            try { direction = Sort.Direction.fromString(parts[1]); }
            catch (IllegalArgumentException ex) { throw new IllegalArgumentException("Dirección de ordenación no válida"); }
        }
        return Sort.by(direction, field);
    }

    private StatusChangeResponse mapToStatusChangeResponse(StatusChange change) {
        StatusChangeResponse response = new StatusChangeResponse();
        response.setId(change.getId());
        response.setPreviousStatus(change.getPreviousStatus());
        response.setNewStatus(change.getNewStatus());
        response.setReason(change.getReason());
        response.setChangedAt(change.getChangedAt());
        return response;
    }

    private IncidentResponse mapToResponse(Incident incident) {

        IncidentResponse response = new IncidentResponse();

        response.setId(incident.getId());
        response.setTitle(incident.getTitle());
        response.setDescription(incident.getDescription());
        response.setCategory(incident.getCategory());
        response.setStatus(incident.getStatus());
        response.setCreatedAt(incident.getCreatedAt());

        LocationResponse location = new LocationResponse(
                incident.getLatitude(),
                incident.getLongitude()
        );

        response.setLocation(location);

        return response;
    }
}
