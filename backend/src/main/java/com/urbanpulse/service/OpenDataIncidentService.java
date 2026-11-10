package com.urbanpulse.service;

import com.urbanpulse.dto.OpenDataIncidentResponse;
import com.urbanpulse.dto.OpenDataIncidentsResponse;
import com.urbanpulse.entity.Incident;
import com.urbanpulse.enums.IncidentStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OpenDataIncidentService {

    private static final Logger log = LoggerFactory.getLogger(OpenDataIncidentService.class);
    private static final int[] SUPPORTED_YEARS = {2026};

    /**
     * Devuelve la respuesta estructurada de Open Data para la API REST (OpenDataIncidentController).
     */
    public OpenDataIncidentsResponse getIncidents() {
        List<OpenDataIncidentResponse> allIncidents = new ArrayList<>();
        List<Integer> yearsIncluded = new ArrayList<>();
        List<Integer> unavailableYears = new ArrayList<>();

        for (int year : SUPPORTED_YEARS) {
            List<OpenDataIncidentResponse> yearIncidents = loadGecorCsvDataset(year);
            if (!yearIncidents.isEmpty()) {
                allIncidents.addAll(yearIncidents);
                yearsIncluded.add(year);
            } else {
                unavailableYears.add(year);
            }
        }

        return new OpenDataIncidentsResponse(
                allIncidents,
                yearsIncluded,
                unavailableYears,
                Instant.now(),
                allIncidents.size(),
                false
        );
    }

    /**
     * Lee un fichero CSV estático de recursos para un año determinado.
     */
    public List<OpenDataIncidentResponse> loadGecorCsvDataset(int year) {
        String path = String.format("data/gecor/gecor-%d.csv", year);
        ClassPathResource resource = new ClassPathResource(path);

        if (!resource.exists()) {
            log.warn("No se encontró el archivo CSV local para GECOR {}: {}", year, path);
            return List.of();
        }

        List<OpenDataIncidentResponse> incidents = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean isHeader = true;
            int rowCount = 0;

            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;

                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                String delimiter = line.contains(";") ? ";" : ",";
                String[] columns = line.split(delimiter, -1);

                OpenDataIncidentResponse dto = mapCsvLineToDTO(columns, year, ++rowCount);
                if (dto != null) {
                    incidents.add(dto);
                }
            }

            log.info("Cargadas {} incidencias GECOR para el año {} desde el archivo CSV local.", incidents.size(), year);
        } catch (Exception e) {
            log.error("Error al procesar el dataset CSV local GECOR {}: {}", year, e.getMessage());
        }

        return incidents;
    }

    /**
     * Método auxiliar para transformar el dataset de DTOs a entidades JPA Incident
     * cuando se requiere sembrar directamente en PostgreSQL mediante DatabaseDataLoader.
     */
    public List<Incident> loadIncidentsAsEntities() {
        OpenDataIncidentsResponse response = getIncidents();
        return response.getIncidents().stream()
                .map(this::mapDtoToEntity)
                .collect(Collectors.toList());
    }

    private OpenDataIncidentResponse mapCsvLineToDTO(String[] columns, int year, int rowCount) {
        try {
            if (columns.length < 3) return null;

            String title = cleanValue(columns[0]);
            String description = cleanValue(columns[1]);
            String category = columns.length > 2 ? cleanValue(columns[2]) : "GENERAL";
            String department = columns.length > 3 ? cleanValue(columns[3]) : "MANTENIMIENTO";

            if (title.isBlank() && description.isBlank()) return null;

            Double lat = 36.7213;
            Double lon = -4.4214;

            if (columns.length > 5 && !columns[4].isBlank() && !columns[5].isBlank()) {
                try {
                    lat = Double.parseDouble(cleanValue(columns[4]).replace(",", "."));
                    lon = Double.parseDouble(cleanValue(columns[5]).replace(",", "."));
                } catch (NumberFormatException ignored) { }
            }

            OpenDataIncidentResponse dto = new OpenDataIncidentResponse();
            dto.setId(String.format("GECOR-%d-%04d", year, rowCount));
            dto.setTitle(title.isEmpty() ? "Incidencia GECOR " + year : title);
            dto.setDescription(description);
            dto.setCategory(category.isEmpty() ? "URBANISMO" : category);
            dto.setDepartment(department.isEmpty() ? "AYTO_MALAGA" : department);
            dto.setResolvedDate(LocalDate.of(year, 1, 1));
            dto.setYear(year);
            dto.setLatitude(lat);
            dto.setLongitude(lon);

            return dto;
        } catch (Exception e) {
            return null;
        }
    }

    private Incident mapDtoToEntity(OpenDataIncidentResponse dto) {
        Incident incident = new Incident();
        incident.setTitle(dto.getTitle());
        incident.setDescription(dto.getDescription());
        incident.setCategory(dto.getCategory());
        incident.setLatitude(dto.getLatitude());
        incident.setLongitude(dto.getLongitude());
        incident.setStatus(IncidentStatus.VALIDATED);
        incident.setCreatedAt(LocalDateTime.now());
        return incident;
    }

    private Incident mapCsvLineToIncident(String[] columns) {
        try {
            if (columns.length < 1) return null;

            // Si la línea venía pegada por comas dentro de columns[0], intentamos re-separarla
            String rawFirstCol = columns[0];
            if (columns.length == 1 || (rawFirstCol.contains(",") && rawFirstCol.length() > 100)) {
                columns = rawFirstCol.split(",", -1);
            }

            String title = cleanValue(columns[0]);
            String description = columns.length > 1 ? cleanValue(columns[1]) : "";
            String category = columns.length > 2 ? cleanValue(columns[2]) : "GENERAL";

            if (title.isBlank() && description.isBlank()) return null;

            Incident incident = new Incident();

            // Truncar defensivamente el título a un máximo de 255 caracteres para PostgreSQL
            String safeTitle = title.length() > 255 ? title.substring(0, 255) : title;
            incident.setTitle(safeTitle.isEmpty() ? "Incidencia GECOR 2026" : safeTitle);

            incident.setDescription(description);
            incident.setCategory(category.length() > 100 ? category.substring(0, 100) : category);

            // Coordenadas
            Double lat = 36.7213;
            Double lon = -4.4214;
            if (columns.length > 4 && !columns[3].isBlank() && !columns[4].isBlank()) {
                try {
                    lat = Double.parseDouble(cleanValue(columns[3]).replace(",", "."));
                    lon = Double.parseDouble(cleanValue(columns[4]).replace(",", "."));
                } catch (NumberFormatException ignored) {}
            }

            incident.setLatitude(lat);
            incident.setLongitude(lon);
            incident.setStatus(IncidentStatus.VALIDATED);
            incident.setCreatedAt(LocalDateTime.now());

            return incident;
        } catch (Exception e) {
            return null; // Si una fila específica falla, se ignora de forma segura sin detener el arranque
        }
    }

    private String cleanValue(String text) {
        return text != null ? text.replace("\"", "").trim() : "";
    }
}