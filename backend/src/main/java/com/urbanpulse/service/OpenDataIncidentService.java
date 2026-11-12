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
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OpenDataIncidentService {

    private static final Logger log = LoggerFactory.getLogger(OpenDataIncidentService.class);
    private static final int[] SUPPORTED_YEARS = {2026};
    private static final double GECOR_MALAGA_LATITUDE_OFFSET = 0.4;

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

            String line = reader.readLine();
            if (line == null) return List.of();

            String delimiter = detectDelimiter(line);
            Map<String, Integer> columnsByName = indexHeader(splitCsvLine(line, delimiter));
            int rowCount = 0;
            int invalidRows = 0;

            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;

                OpenDataIncidentResponse dto = mapCsvLineToDTO(
                        splitCsvLine(line, delimiter), columnsByName, year, ++rowCount);
                if (dto != null) {
                    incidents.add(dto);
                } else {
                    invalidRows++;
                }
            }

            log.info("Cargadas {} incidencias GECOR para el año {} desde el archivo CSV local. Filas inválidas: {}.",
                    incidents.size(), year, invalidRows);
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

    private OpenDataIncidentResponse mapCsvLineToDTO(String[] columns, Map<String, Integer> columnsByName,
                                                     int year, int rowCount) {
        try {
            String code = valueAt(columns, columnsByName, "CODIGO");
            String registeredAt = valueAt(columns, columnsByName, "FECHA_REGISTRO");
            String resolvedAt = valueAt(columns, columnsByName, "FECHA_RESOLUCION");
            String priority = valueAt(columns, columnsByName, "PRIORIDAD");
            String address = valueAt(columns, columnsByName, "DIRECCION");
            String longitudeText = valueAt(columns, columnsByName, "LONGITUD");
            String latitudeText = valueAt(columns, columnsByName, "LATITUD");
            String type = valueAt(columns, columnsByName, "TIPO");
            String department = valueAt(columns, columnsByName, "RESPONSABLE");

            if (code.isBlank() && address.isBlank() && type.isBlank()) return null;

            Double latitude = parseCoordinate(latitudeText, -90, 90);
            Double longitude = parseCoordinate(longitudeText, -180, 180);
            if (looksLikeSwappedMalagaCoordinates(latitude, longitude)) {
                Double correctedLatitude = longitude;
                longitude = latitude;
                latitude = correctedLatitude;
            }
            latitude = normalizeGecorLatitude(latitude, longitude);
            if (latitude == null || longitude == null) {
                log.warn("Se omite la fila GECOR {} por coordenadas inválidas: lat={}, lon={}",
                        rowCount, latitudeText, longitudeText);
                return null;
            }

            OpenDataIncidentResponse dto = new OpenDataIncidentResponse();
            dto.setId(String.format("GECOR-%d-%04d", year, rowCount));
            dto.setTitle(code.isEmpty() ? "Incidencia GECOR " + year : code);
            dto.setDescription(buildDescription(address, type, priority, registeredAt));
            dto.setCategory(type.isEmpty() ? "GENERAL" : type);
            dto.setDepartment(department.isEmpty() ? "AYTO_MALAGA" : department);
            dto.setResolvedDate(parseDate(resolvedAt, year));
            dto.setYear(year);
            dto.setLatitude(latitude);
            dto.setLongitude(longitude);

            return dto;
        } catch (Exception e) {
            log.warn("No se pudo interpretar la fila GECOR {}: {}", rowCount, e.getMessage());
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

    private String cleanValue(String text) {
        return text != null ? text.trim() : "";
    }

    private String detectDelimiter(String header) {
        return header.contains(";") ? ";" : ",";
    }

    private Map<String, Integer> indexHeader(String[] header) {
        Map<String, Integer> indexes = new HashMap<>();
        for (int index = 0; index < header.length; index++) {
            String name = cleanValue(header[index]).replace("\uFEFF", "").toUpperCase(Locale.ROOT);
            indexes.put(name, index);
        }
        return indexes;
    }

    private String valueAt(String[] columns, Map<String, Integer> indexes, String name) {
        Integer index = indexes.get(name);
        return index == null || index >= columns.length ? "" : cleanValue(columns[index]);
    }

    private String[] splitCsvLine(String line, String delimiter) {
        List<String> values = new ArrayList<>();
        StringBuilder value = new StringBuilder();
        boolean quoted = false;

        for (int index = 0; index < line.length(); index++) {
            char current = line.charAt(index);
            if (current == '"') {
                if (quoted && index + 1 < line.length() && line.charAt(index + 1) == '"') {
                    value.append('"');
                    index++;
                } else {
                    quoted = !quoted;
                }
            } else if (!quoted && line.startsWith(delimiter, index)) {
                values.add(value.toString().trim());
                value.setLength(0);
                index += delimiter.length() - 1;
            } else {
                value.append(current);
            }
        }
        values.add(value.toString().trim());
        return values.toArray(new String[0]);
    }

    private Double parseCoordinate(String value, double minimum, double maximum) {
        if (value.isBlank()) return null;
        try {
            double coordinate = Double.parseDouble(value.replace(",", "."));
            return coordinate >= minimum && coordinate <= maximum ? coordinate : null;
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private boolean looksLikeSwappedMalagaCoordinates(Double latitude, Double longitude) {
        return latitude != null && longitude != null
                && latitude < 5 && latitude > -10
                && longitude > 30 && longitude < 45;
    }

    private Double normalizeGecorLatitude(Double latitude, Double longitude) {
        if (latitude != null && longitude != null
                && latitude >= 37.0 && latitude <= 37.3
                && longitude >= -4.7 && longitude <= -4.2) {
            return latitude - GECOR_MALAGA_LATITUDE_OFFSET;
        }
        return latitude;
    }

    private LocalDate parseDate(String value, int year) {
        if (value.length() >= 10) {
            try {
                return LocalDate.parse(value.substring(0, 10));
            } catch (java.time.format.DateTimeParseException ignored) {
                // Se usa el año del dataset si la fecha externa no es ISO.
            }
        }
        return LocalDate.of(year, 1, 1);
    }

    private String buildDescription(String address, String type, String priority, String registeredAt) {
        List<String> parts = new ArrayList<>();
        if (!type.isBlank()) parts.add(type);
        if (!address.isBlank()) parts.add(address);
        if (!priority.isBlank()) parts.add("Prioridad: " + priority);
        if (!registeredAt.isBlank()) parts.add("Registrada: " + registeredAt);
        return String.join(" · ", parts);
    }
}