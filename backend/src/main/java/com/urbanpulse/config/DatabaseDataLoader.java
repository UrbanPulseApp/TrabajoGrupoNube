package com.urbanpulse.config;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.urbanpulse.entity.Incident;
import com.urbanpulse.entity.UrbanAsset;
import com.urbanpulse.entity.User;
import com.urbanpulse.enums.IncidentStatus;
import com.urbanpulse.enums.Role;
import com.urbanpulse.repository.IncidentRepository;
import com.urbanpulse.repository.UrbanAssetRepository;
import com.urbanpulse.repository.UserRepository;
import com.urbanpulse.service.OpenDataIncidentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabaseDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseDataLoader.class);

    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final UrbanAssetRepository urbanAssetRepository;
    private final OpenDataIncidentService openDataIncidentService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public DatabaseDataLoader(UserRepository userRepository,
                              IncidentRepository incidentRepository,
                              UrbanAssetRepository urbanAssetRepository,
                              OpenDataIncidentService openDataIncidentService,
                              PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
        this.urbanAssetRepository = urbanAssetRepository;
        this.openDataIncidentService = openDataIncidentService;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Cargar activos urbanos de referencia (Semáforos, paradas EMT, etc.)
        loadUrbanAssetsIfEmpty();

        // 2. Cargar datos base de usuarios e incidencias iniciales desde initial-data.json
        if (userRepository.count() == 0) {
            loadInitialJsonData();
        } else {
            log.info("Usuarios ya inicializados. Se omite la carga de initial-data.json.");
        }

        // 3. Siembra y reconciliación de incidencias GECOR desde el CSV local.
        synchronizeGecorIncidents();
    }

    private void synchronizeGecorIncidents() {
        List<Incident> csvIncidents = openDataIncidentService.loadIncidentsAsEntities();
        if (csvIncidents.isEmpty()) {
            log.warn("No se han encontrado incidencias GECOR para sincronizar.");
            return;
        }

        List<String> titles = csvIncidents.stream()
                .map(Incident::getTitle)
                .collect(Collectors.toList());
        Map<String, List<Incident>> existingByTitle = incidentRepository.findByTitleIn(titles)
                .stream()
                .collect(Collectors.groupingBy(Incident::getTitle, HashMap::new, Collectors.toList()));
        Map<String, Integer> occurrenceByTitle = new HashMap<>();
        List<Incident> synchronizedIncidents = new ArrayList<>();

        int inserted = 0;
        int updated = 0;
        for (Incident csvIncident : csvIncidents) {
            String title = csvIncident.getTitle();
            int occurrence = occurrenceByTitle.getOrDefault(title, 0);
            List<Incident> existing = existingByTitle.getOrDefault(title, List.of());
            Incident persisted = occurrence < existing.size() ? existing.get(occurrence) : null;
            occurrenceByTitle.put(title, occurrence + 1);

            if (persisted == null) {
                persisted = csvIncident;
                inserted++;
            } else {
                persisted.setDescription(csvIncident.getDescription());
                persisted.setCategory(csvIncident.getCategory());
                persisted.setLatitude(csvIncident.getLatitude());
                persisted.setLongitude(csvIncident.getLongitude());
                persisted.setStatus(csvIncident.getStatus());
                updated++;
            }
            synchronizedIncidents.add(persisted);
        }

        incidentRepository.saveAll(synchronizedIncidents);
        log.info("Sincronizadas {} incidencias GECOR: {} actualizadas y {} insertadas.",
                csvIncidents.size(), updated, inserted);
    }

    private void loadInitialJsonData() {
        log.info("Iniciando la carga de datos de prueba desde initial-data.json...");

        ClassPathResource resource = new ClassPathResource("data/initial-data.json");
        if (!resource.exists()) {
            log.warn("No se encontró el archivo 'classpath:data/initial-data.json'.");
            return;
        }

        try (InputStream inputStream = resource.getInputStream()) {
            InitialDataDTO data = objectMapper.readValue(inputStream, InitialDataDTO.class);

            // Cargar Usuarios
            if (data.getUsers() != null && !data.getUsers().isEmpty()) {
                for (UserSeedDTO userDTO : data.getUsers()) {
                    User user = new User();
                    user.setName(userDTO.getName());
                    user.setEmail(userDTO.getEmail());
                    user.setRole(Role.valueOf(userDTO.getRole()));
                    user.setActive(userDTO.isActive());
                    user.setCreatedAt(LocalDateTime.now());
                    user.setPassword(passwordEncoder.encode(userDTO.getPassword() != null ? userDTO.getPassword() : "password123"));
                    userRepository.save(user);
                }
                log.info("Cargados {} usuarios en la base de datos.", data.getUsers().size());
            }

            // Cargar Incidencias del JSON
            if (data.getIncidents() != null && !data.getIncidents().isEmpty()) {
                for (IncidentSeedDTO incDTO : data.getIncidents()) {
                    Incident incident = new Incident();
                    incident.setTitle(incDTO.getTitle());
                    incident.setDescription(incDTO.getDescription());
                    incident.setCategory(incDTO.getCategory());
                    incident.setStatus(IncidentStatus.valueOf(incDTO.getStatus()));
                    incident.setLatitude(incDTO.getLatitude());
                    incident.setLongitude(incDTO.getLongitude());
                    incident.setCreatedAt(LocalDateTime.now());
                    incidentRepository.save(incident);
                }
                log.info("Cargadas {} incidencias iniciales en la zona de Málaga.", data.getIncidents().size());
            }

            log.info("Inicialización de datos de initial-data.json completada con éxito.");
        } catch (Exception e) {
            log.error("Error durante el procesamiento e inserción del dataset JSON:", e);
        }
    }

    private void loadUrbanAssetsIfEmpty() {
        if (urbanAssetRepository.count() == 0) {
            List<UrbanAsset> defaultAssets = Arrays.asList(
                    new UrbanAsset("SEM-ALAMEDA-01", "SEMAFORO", "AYTO_MALAGA", 36.7185, -4.4202, "Cruce peatonal Alameda Principal con Calle Larios"),
                    new UrbanAsset("PAR-EMT-102", "PARADA_AUTOBUS", "EMT_MALAGA", 36.7180, -4.4210, "Líneas 1, 3, 11 - Alameda Principal"),
                    new UrbanAsset("FAR-ALAMEDA-45", "FAROLA", "ALUMBRADO_MALAGA", 36.7188, -4.4198, "Luminaria LED 150W báculo histórico"),
                    new UrbanAsset("SEM-TEATINOS-03", "SEMAFORO", "AYTO_MALAGA", 36.7162, -4.4700, "Cruce Bulevar Louis Pasteur con Calle Jenofonte"),
                    new UrbanAsset("PAR-METRO-04", "ESTACION_METRO", "METRO_MALAGA", 36.7165, -4.4710, "Estación Universidad - Teatinos"),
                    new UrbanAsset("SEM-VELAZQUEZ-12", "SEMAFORO", "AYTO_MALAGA", 36.7030, -4.4370, "Avenida de Velázquez cruce Calle Alaska")
            );
            urbanAssetRepository.saveAll(defaultAssets);
            log.info("Cargados {} activos urbanos de referencia en Málaga.", defaultAssets.size());
        }
    }

    // Estructuras DTO para deserializar el archivo JSON
    private static class InitialDataDTO {
        private List<UserSeedDTO> users;
        private List<IncidentSeedDTO> incidents;

        public List<UserSeedDTO> getUsers() { return users; }
        public void setUsers(List<UserSeedDTO> users) { this.users = users; }
        public List<IncidentSeedDTO> getIncidents() { return incidents; }
        public void setIncidents(List<IncidentSeedDTO> incidents) { this.incidents = incidents; }
    }

    private static class UserSeedDTO {
        private String name;
        private String email;
        private String role;
        private String password;
        private boolean active = true;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    private static class IncidentSeedDTO {
        private String title;
        private String description;
        private String category;
        private String status;
        private Double latitude;
        private Double longitude;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }
}