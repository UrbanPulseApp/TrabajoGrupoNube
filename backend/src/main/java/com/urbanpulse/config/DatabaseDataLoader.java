package com.urbanpulse.config;

import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.urbanpulse.entity.Incident;
import com.urbanpulse.entity.User;
import com.urbanpulse.enums.IncidentStatus;
import com.urbanpulse.enums.Role;
import com.urbanpulse.repository.IncidentRepository;
import com.urbanpulse.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;

@Component
public class DatabaseDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseDataLoader.class);

    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final ObjectMapper objectMapper;

    public DatabaseDataLoader(UserRepository userRepository, IncidentRepository incidentRepository) {
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Evita duplicar datos si la base de datos ya contiene registros
        if (userRepository.count() > 0 || incidentRepository.count() > 0) {
            log.info("Base de datos ya inicializada. Se omite la carga del dataset JSON.");
            return;
        }

        log.info("Iniciando la carga de datos de prueba desde initial-data.json...");

        ClassPathResource resource = new ClassPathResource("data/initial-data.json");
        if (!resource.exists()) {
            log.warn("No se encontró el archivo 'classpath:data/initial-data.json'.");
            return;
        }

        try (InputStream inputStream = resource.getInputStream()) {
            InitialDataDTO data = objectMapper.readValue(inputStream, InitialDataDTO.class);

            // 1. Cargar Usuarios
            if (data.getUsers() != null && !data.getUsers().isEmpty()) {
                for (UserSeedDTO userDTO : data.getUsers()) {
                    User user = new User();
                    user.setName(userDTO.getName());
                    user.setEmail(userDTO.getEmail());
                    user.setRole(Role.valueOf(userDTO.getRole()));
                    user.setActive(userDTO.isActive());
                    user.setCreatedAt(LocalDateTime.now()); // <--- Asignar fecha
                    userRepository.save(user);
                }
                log.info("Cargados {} usuarios en la base de datos.", data.getUsers().size());
            }

            // 2. Cargar Incidencias
            if (data.getIncidents() != null && !data.getIncidents().isEmpty()) {
                for (IncidentSeedDTO incDTO : data.getIncidents()) {
                    Incident incident = new Incident();
                    incident.setTitle(incDTO.getTitle());
                    incident.setDescription(incDTO.getDescription());
                    incident.setCategory(incDTO.getCategory());
                    incident.setStatus(IncidentStatus.valueOf(incDTO.getStatus()));
                    incident.setLatitude(incDTO.getLatitude());
                    incident.setLongitude(incDTO.getLongitude());
                    incident.setCreatedAt(LocalDateTime.now()); // <--- Soluciona el error de NOT NULL
                    incidentRepository.save(incident);
                }
                log.info("Cargadas {} incidencias iniciales en la zona de Málaga.", data.getIncidents().size());
            }

            log.info("Inicialización de datos completada con éxito.");
        } catch (Exception e) {
            log.error("Error durante el procesamiento e inserción del dataset JSON:", e);
        }
    }

    // Estruturas DTO para deserializar el archivo JSON
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
        private boolean active = true;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
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