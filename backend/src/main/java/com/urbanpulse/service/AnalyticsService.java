package com.urbanpulse.service;

import com.urbanpulse.dto.AnalyticsSummaryResponse;
import com.urbanpulse.enums.IncidentStatus;
import com.urbanpulse.repository.IncidentRepository;
import com.urbanpulse.repository.UrbanContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final IncidentRepository incidentRepository;
    private final UrbanContextRepository urbanContextRepository;

    public AnalyticsService(IncidentRepository incidentRepository,
                            UrbanContextRepository urbanContextRepository) {
        this.incidentRepository = incidentRepository;
        this.urbanContextRepository = urbanContextRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary() {
        AnalyticsSummaryResponse summary = new AnalyticsSummaryResponse();

        long total = incidentRepository.count();
        summary.setTotalIncidents(total);

        // Conteo por estado
        Map<String, Long> byStatus = new HashMap<>();
        List<Object[]> statusCounts = incidentRepository.countGroupByStatus();
        for (Object[] row : statusCounts) {
            if (row[0] != null && row[1] != null) {
                byStatus.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }
        summary.setByStatus(byStatus);

        long active = byStatus.getOrDefault(IncidentStatus.REPORTED.name(), 0L)
                + byStatus.getOrDefault(IncidentStatus.VALIDATED.name(), 0L)
                + byStatus.getOrDefault(IncidentStatus.ASSIGNED.name(), 0L)
                + byStatus.getOrDefault(IncidentStatus.IN_PROGRESS.name(), 0L)
                + byStatus.getOrDefault(IncidentStatus.REOPENED.name(), 0L);
        summary.setActiveIncidents(active);

        long resolved = byStatus.getOrDefault(IncidentStatus.RESOLVED.name(), 0L);
        summary.setResolvedIncidents(resolved);

        long closed = byStatus.getOrDefault(IncidentStatus.CLOSED.name(), 0L);
        summary.setClosedIncidents(closed);

        long rejected = byStatus.getOrDefault(IncidentStatus.REJECTED.name(), 0L);
        summary.setRejectedIncidents(rejected);

        // Conteo por categoría
        Map<String, Long> byCategory = new HashMap<>();
        List<Object[]> categoryCounts = incidentRepository.countGroupByCategory();
        for (Object[] row : categoryCounts) {
            if (row[0] != null && row[1] != null) {
                byCategory.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }
        summary.setByCategory(byCategory);

        // Conteo por distrito
        Map<String, Long> byDistrict = new HashMap<>();
        List<Object[]> districtCounts = urbanContextRepository.countByDistrict();
        for (Object[] row : districtCounts) {
            if (row[0] != null && row[1] != null) {
                byDistrict.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }
        summary.setByDistrict(byDistrict);

        // Incidencias recientes (últimos 7 y 30 días)
        LocalDateTime now = LocalDateTime.now();
        summary.setIncidentsLast7Days(incidentRepository.countByCreatedAtAfter(now.minusDays(7)));
        summary.setIncidentsLast30Days(incidentRepository.countByCreatedAtAfter(now.minusDays(30)));

        return summary;
    }
}
