package com.urbanpulse.dto;

import java.util.HashMap;
import java.util.Map;

public class AnalyticsSummaryResponse {

    private long totalIncidents;
    private long activeIncidents;
    private long resolvedIncidents;
    private long closedIncidents;
    private long rejectedIncidents;
    private long incidentsLast7Days;
    private long incidentsLast30Days;
    private Map<String, Long> byStatus = new HashMap<>();
    private Map<String, Long> byCategory = new HashMap<>();
    private Map<String, Long> byDistrict = new HashMap<>();

    public AnalyticsSummaryResponse() {
    }

    public long getTotalIncidents() {
        return totalIncidents;
    }

    public void setTotalIncidents(long totalIncidents) {
        this.totalIncidents = totalIncidents;
    }

    public long getActiveIncidents() {
        return activeIncidents;
    }

    public void setActiveIncidents(long activeIncidents) {
        this.activeIncidents = activeIncidents;
    }

    public long getResolvedIncidents() {
        return resolvedIncidents;
    }

    public void setResolvedIncidents(long resolvedIncidents) {
        this.resolvedIncidents = resolvedIncidents;
    }

    public long getClosedIncidents() {
        return closedIncidents;
    }

    public void setClosedIncidents(long closedIncidents) {
        this.closedIncidents = closedIncidents;
    }

    public long getRejectedIncidents() {
        return rejectedIncidents;
    }

    public void setRejectedIncidents(long rejectedIncidents) {
        this.rejectedIncidents = rejectedIncidents;
    }

    public long getIncidentsLast7Days() {
        return incidentsLast7Days;
    }

    public void setIncidentsLast7Days(long incidentsLast7Days) {
        this.incidentsLast7Days = incidentsLast7Days;
    }

    public long getIncidentsLast30Days() {
        return incidentsLast30Days;
    }

    public void setIncidentsLast30Days(long incidentsLast30Days) {
        this.incidentsLast30Days = incidentsLast30Days;
    }

    public Map<String, Long> getByStatus() {
        return byStatus;
    }

    public void setByStatus(Map<String, Long> byStatus) {
        this.byStatus = byStatus;
    }

    public Map<String, Long> getByCategory() {
        return byCategory;
    }

    public void setByCategory(Map<String, Long> byCategory) {
        this.byCategory = byCategory;
    }

    public Map<String, Long> getByDistrict() {
        return byDistrict;
    }

    public void setByDistrict(Map<String, Long> byDistrict) {
        this.byDistrict = byDistrict;
    }
}
