package com.urbanpulse.service;

import com.urbanpulse.dto.OpenDataIncidentResponse;
import com.urbanpulse.dto.OpenDataIncidentsResponse;
import com.urbanpulse.exception.OpenDataUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.Normalizer;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class OpenDataIncidentService {
    private static final Logger log = LoggerFactory.getLogger(OpenDataIncidentService.class);
    private static final String CSV_URL = "https://datosabiertos.malaga.eu/recursos/urbanismoEInfraestructura/GECOR/%d.csv";
    private static final Duration CACHE_TTL = Duration.ofHours(12);
    private static final int MAX_MAP_RECORDS = 25000;
    private static final Pattern WKT_POINT = Pattern.compile("(?i)POINT\\s*\\(\\s*(-?[0-9]+(?:[.,][0-9]+)?)\\s+(-?[0-9]+(?:[.,][0-9]+)?)\\s*\\)");
    private static final List<DateTimeFormatter> DATE_FORMATS = Arrays.asList(
            DateTimeFormatter.ofPattern("d/M/yyyy H:mm:ss"),
            DateTimeFormatter.ofPattern("d/M/yyyy H:mm"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("yyyy-M-d H:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-M-d H:mm"),
            DateTimeFormatter.ofPattern("yyyy-M-d")
    );

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();
    private final int firstYear;

    private volatile OpenDataIncidentsResponse cachedResponse;
    private volatile Instant cachedAt;

    public OpenDataIncidentService(@Value("${urbanpulse.opendata.gecor.first-year:2020}") int firstYear) {
        this.firstYear = Math.max(2005, firstYear);
    }

    public OpenDataIncidentsResponse getIncidents() {
        OpenDataIncidentsResponse current = cachedResponse;
        if (current != null && cachedAt != null && cachedAt.plus(CACHE_TTL).isAfter(Instant.now())) {
            return current;
        }
        synchronized (this) {
            current = cachedResponse;
            if (current != null && cachedAt != null && cachedAt.plus(CACHE_TTL).isAfter(Instant.now())) {
                return current;
            }
            try {
                OpenDataIncidentsResponse refreshed = refresh();
                cachedResponse = refreshed;
                cachedAt = Instant.now();
                return refreshed;
            } catch (OpenDataUnavailableException e) {
                if (current != null) {
                    log.warn("Open Data Málaga no responde; se devuelve la última caché disponible.");
                    return current;
                }
                throw e;
            }
        }
    }

    private OpenDataIncidentsResponse refresh() {
        int lastYear = LocalDate.now().getYear();
        List<Integer> years = new ArrayList<>();
        for (int year = firstYear; year <= lastYear; year++) years.add(year);

        Map<Integer, CompletableFuture<YearResult>> requests = new LinkedHashMap<>();
        for (Integer year : years) {
            requests.put(year, fetchAsync(year));
        }

        try {
            CompletableFuture.allOf(requests.values().toArray(new CompletableFuture[0]))
                    .get(20, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("La descarga de uno o más conjuntos GECOR no finalizó a tiempo: {}", e.getMessage());
        }

        List<OpenDataIncidentResponse> incidents = new ArrayList<>();
        List<Integer> included = new ArrayList<>();
        List<Integer> unavailable = new ArrayList<>();
        for (Map.Entry<Integer, CompletableFuture<YearResult>> entry : requests.entrySet()) {
            try {
                YearResult result = entry.getValue().getNow(null);
                if (result == null || !result.success) {
                    unavailable.add(entry.getKey());
                    continue;
                }
                included.add(entry.getKey());
                incidents.addAll(result.incidents);
            } catch (Exception e) {
                unavailable.add(entry.getKey());
            }
        }

        if (included.isEmpty()) {
            throw new OpenDataUnavailableException("No se pudo consultar el conjunto de incidencias de Open Data Málaga.");
        }

        incidents.sort(Comparator.comparing(OpenDataIncidentResponse::getResolvedDate,
                Comparator.nullsLast(Comparator.reverseOrder())));
        int totalAvailable = incidents.size();
        boolean truncated = totalAvailable > MAX_MAP_RECORDS;
        if (truncated) incidents = new ArrayList<>(incidents.subList(0, MAX_MAP_RECORDS));
        return new OpenDataIncidentsResponse(incidents, included, unavailable, Instant.now(), totalAvailable, truncated);
    }

    private CompletableFuture<YearResult> fetchAsync(int year) {
        URI uri = URI.create(String.format(Locale.ROOT, CSV_URL, year));
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(Duration.ofSeconds(14))
                .header("Accept", "text/csv,text/plain;q=0.9,*/*;q=0.8")
                .header("User-Agent", "UrbanPulse/1.0 (Open Data Málaga GECOR reader)")
                .GET()
                .build();
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofByteArray())
                .thenApply(response -> {
                    if (response.statusCode() < 200 || response.statusCode() >= 300) {
                        log.warn("Open Data Málaga devolvió HTTP {} para el conjunto GECOR {}.", response.statusCode(), year);
                        return YearResult.failure();
                    }
                    try {
                        String csv = new String(response.body(), StandardCharsets.UTF_8);
                        return new YearResult(parseCsv(csv, year), true);
                    } catch (Exception e) {
                        log.warn("No se pudo interpretar el CSV GECOR {}: {}", year, e.getMessage());
                        return YearResult.failure();
                    }
                })
                .exceptionally(error -> {
                    log.warn("No se pudo descargar el conjunto GECOR {}: {}", year, error.getMessage());
                    return YearResult.failure();
                });
    }

    private List<OpenDataIncidentResponse> parseCsv(String csv, int year) {
        if (csv == null || csv.trim().isEmpty()) return Collections.emptyList();
        if (csv.charAt(0) == '\uFEFF') csv = csv.substring(1);
        char delimiter = detectDelimiter(csv);
        List<List<String>> rows = readCsv(csv, delimiter);
        if (rows.isEmpty()) return Collections.emptyList();

        List<String> headers = rows.get(0).stream().map(this::normalizeHeader).collect(Collectors.toList());
        Map<String, Integer> columns = new HashMap<>();
        for (int i = 0; i < headers.size(); i++) columns.put(headers.get(i), i);
        if (!hasAnyColumn(columns, "latitud", "latitude", "lat", "latituddecimal", "latitude_dd",
                "coordenaday", "coordenadasy", "coordy", "y", "geometria", "geometry", "geom", "wkt", "coordenadas")) {
            throw new IllegalArgumentException("El CSV no contiene un campo de latitud o geometría reconocible");
        }
        if (!hasAnyColumn(columns, "longitud", "longitude", "lon", "lng", "longituddecimal", "longitude_dd",
                "coordenadax", "coordenadasx", "coordx", "x", "geometria", "geometry", "geom", "wkt", "coordenadas")) {
            throw new IllegalArgumentException("El CSV no contiene un campo de longitud o geometría reconocible");
        }

        List<OpenDataIncidentResponse> incidents = new ArrayList<>();
        for (int rowIndex = 1; rowIndex < rows.size(); rowIndex++) {
            List<String> row = rows.get(rowIndex);
            if (row.stream().allMatch(value -> value == null || value.trim().isEmpty())) continue;

            Double latitude = parseCoordinate(value(row, columns,
                    "latitud", "latitude", "lat", "latitud decimal", "latitude dd", "coordenaday", "coordenadasy", "coordy", "y"));
            Double longitude = parseCoordinate(value(row, columns,
                    "longitud", "longitude", "lon", "lng", "longitud decimal", "longitude dd", "coordenadax", "coordenadasx", "coordx", "x"));
            if (latitude == null || longitude == null) {
                double[] point = parseWkt(value(row, columns, "geometry", "geom", "wkt", "geometria", "coordenadas"));
                if (point != null) {
                    longitude = point[0];
                    latitude = point[1];
                }
            }
            if (!isMalagaCoordinate(latitude, longitude)) continue;

            String category = nonEmpty(value(row, columns,
                    "categoria", "tipologia", "tipo", "tipo incidencia", "tipo de incidencia", "subtipo", "materia"));
            String title = nonEmpty(value(row, columns,
                    "titulo", "title", "incidencia", "descripcion", "description", "tipo incidencia", "tipo de incidencia", "categoria", "tipo"));
            String description = nonEmpty(value(row, columns,
                    "detalle", "detalles", "descripcion", "description", "observaciones", "incidencia"));
            String department = nonEmpty(value(row, columns,
                    "departamento", "servicio", "area", "organismo", "entidad", "empresa"));
            LocalDate resolvedDate = parseDate(value(row, columns,
                    "fecha resolucion", "fecha de resolucion", "fecha cierre", "fecha de cierre", "fecha", "date", "fecha alta", "fecha de alta"));
            String sourceId = nonEmpty(value(row, columns,
                    "id", "id incidencia", "id de incidencia", "codigo", "numero", "numero incidencia", "numero de incidencia", "expediente", "identificador"));
            if (sourceId == null) sourceId = stableHash(year + "|" + rowIndex + "|" + row.toString());

            OpenDataIncidentResponse incident = new OpenDataIncidentResponse();
            incident.setId(year + "-" + sourceId);
            incident.setTitle(limit(title == null ? "Incidencia urbana resuelta" : title, 180));
            incident.setDescription(limit(description == null ? incident.getTitle() : description, 1200));
            incident.setCategory(limit(category, 120));
            incident.setDepartment(limit(department, 160));
            incident.setResolvedDate(resolvedDate);
            incident.setYear(year);
            incident.setLatitude(latitude);
            incident.setLongitude(longitude);
            incidents.add(incident);
        }
        return incidents;
    }

    private List<List<String>> readCsv(String content, char delimiter) {
        List<List<String>> records = new ArrayList<>();
        List<String> record = new ArrayList<>();
        StringBuilder field = new StringBuilder();
        boolean quoted = false;
        for (int i = 0; i < content.length(); i++) {
            char current = content.charAt(i);
            if (quoted) {
                if (current == '"') {
                    if (i + 1 < content.length() && content.charAt(i + 1) == '"') {
                        field.append('"');
                        i++;
                    } else {
                        quoted = false;
                    }
                } else {
                    field.append(current);
                }
            } else if (current == '"') {
                quoted = true;
            } else if (current == delimiter) {
                record.add(field.toString());
                field.setLength(0);
            } else if (current == '\n' || current == '\r') {
                if (current == '\r' && i + 1 < content.length() && content.charAt(i + 1) == '\n') i++;
                record.add(field.toString());
                field.setLength(0);
                records.add(record);
                record = new ArrayList<>();
            } else {
                field.append(current);
            }
        }
        if (field.length() > 0 || !record.isEmpty()) {
            record.add(field.toString());
            records.add(record);
        }
        return records;
    }

    private char detectDelimiter(String csv) {
        String header = csv.split("\\r?\\n", 2)[0];
        int comma = countOutsideQuotes(header, ',');
        int semicolon = countOutsideQuotes(header, ';');
        int tab = countOutsideQuotes(header, '\t');
        if (semicolon >= comma && semicolon >= tab) return ';';
        if (tab > comma) return '\t';
        return ',';
    }

    private int countOutsideQuotes(String text, char target) {
        int count = 0;
        boolean quoted = false;
        for (int i = 0; i < text.length(); i++) {
            char current = text.charAt(i);
            if (current == '"') {
                if (quoted && i + 1 < text.length() && text.charAt(i + 1) == '"') i++;
                else quoted = !quoted;
            } else if (current == target && !quoted) count++;
        }
        return count;
    }

    private String value(List<String> row, Map<String, Integer> columns, String... candidates) {
        for (String candidate : candidates) {
            Integer index = columns.get(normalizeHeader(candidate));
            if (index != null && index >= 0 && index < row.size()) {
                String found = nonEmpty(row.get(index));
                if (found != null) return found;
            }
        }
        return null;
    }

    private boolean hasAnyColumn(Map<String, Integer> columns, String... candidates) {
        for (String candidate : candidates) {
            if (columns.containsKey(normalizeHeader(candidate))) return true;
        }
        return false;
    }

    private String normalizeHeader(String value) {
        if (value == null) return "";
        String normalized = Normalizer.normalize(value.trim().replace("\uFEFF", ""), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
        return normalized.replaceAll("[^a-z0-9]", "");
    }

    private String nonEmpty(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private Double parseCoordinate(String value) {
        if (value == null) return null;
        try {
            return Double.parseDouble(value.trim().replace(',', '.'));
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private double[] parseWkt(String value) {
        if (value == null) return null;
        Matcher matcher = WKT_POINT.matcher(value);
        if (!matcher.find()) return null;
        Double x = parseCoordinate(matcher.group(1));
        Double y = parseCoordinate(matcher.group(2));
        return x == null || y == null ? null : new double[]{x, y};
    }

    private boolean isMalagaCoordinate(Double latitude, Double longitude) {
        return latitude != null && longitude != null
                && latitude >= 36.3 && latitude <= 37.0
                && longitude >= -5.0 && longitude <= -4.0;
    }

    private LocalDate parseDate(String value) {
        if (value == null) return null;
        String clean = value.trim();
        try { return LocalDateTime.parse(clean).toLocalDate(); }
        catch (DateTimeParseException ignored) { }
        try { return LocalDate.parse(clean); }
        catch (DateTimeParseException ignored) { }
        for (DateTimeFormatter formatter : DATE_FORMATS) {
            try {
                if (formatter.toString().contains("HourOfDay")) return LocalDateTime.parse(clean, formatter).toLocalDate();
                return LocalDate.parse(clean, formatter);
            } catch (DateTimeParseException ignored) { }
        }
        return null;
    }

    private String limit(String value, int maxLength) {
        return value == null || value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private String stableHash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < 8; i++) result.append(String.format("%02x", digest[i]));
            return result.toString();
        } catch (Exception e) {
            return UUID.nameUUIDFromBytes(value.getBytes(StandardCharsets.UTF_8)).toString();
        }
    }

    private static final class YearResult {
        private final List<OpenDataIncidentResponse> incidents;
        private final boolean success;

        private YearResult(List<OpenDataIncidentResponse> incidents, boolean success) {
            this.incidents = incidents;
            this.success = success;
        }

        private static YearResult failure() {
            return new YearResult(Collections.emptyList(), false);
        }
    }
}
