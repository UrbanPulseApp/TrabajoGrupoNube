package com.urbanpulse.controller;

import com.urbanpulse.entity.Incident;
import com.urbanpulse.enums.IncidentStatus;
import com.urbanpulse.repository.IncidentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AssignmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IncidentRepository incidentRepository;

    private UUID createIncident() {
        return createIncidentWithStatus(IncidentStatus.VALIDATED);
    }

    private UUID createIncidentWithStatus(IncidentStatus status) {
        Incident incident = new Incident();
        incident.setTitle("Semáforo averiado");
        incident.setDescription("El semáforo permanece en rojo");
        incident.setCategory("TRAFFIC_LIGHT");
        incident.setLatitude(36.7213);
        incident.setLongitude(-4.4214);
        incident.setStatus(status);
        incident.setCreatedAt(LocalDateTime.now());
        return incidentRepository.save(incident).getId();
    }

    @Test
    void shouldCreateAssignment() throws Exception {

        UUID incidentId = createIncident();

        //Nacho: saltos de línea escapados por compatibilidad con Java 11.
        String json = "{\n" +
                "    \"department\": \"MOVILIDAD\",\n" +
                "    \"teamId\": \"11111111-1111-1111-1111-111111111111\",\n" +
                "    \"notes\": \"Revisar cruce peatonal\"\n" +
                "}";

        mockMvc.perform(
                        post("/api/incidents/" + incidentId + "/assignments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.incidentId", is(incidentId.toString())))
                .andExpect(jsonPath("$.department", is("MOVILIDAD")))
                .andExpect(jsonPath("$.teamId",
                        is("11111111-1111-1111-1111-111111111111")))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.notes", is("Revisar cruce peatonal")));
    }

    @Test
    void shouldReturnNotFoundWhenIncidentDoesNotExist() throws Exception {

        String json = "{\n" +
                "    \"department\": \"MOVILIDAD\"\n" +
                "}";

        mockMvc.perform(
                        post("/api/incidents/" + UUID.randomUUID() + "/assignments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code", is("NOT_FOUND")))
                .andExpect(jsonPath("$.requestId").exists());
    }

    @Test
    void shouldRejectAssignmentWhenIncidentNotValidated() throws Exception {

        // RF11/RF12: una incidencia REPORTED no puede asignarse directamente.
        UUID incidentId = createIncidentWithStatus(IncidentStatus.REPORTED);

        String json = "{\"department\": \"MOVILIDAD\"}";

        mockMvc.perform(
                post("/api/incidents/" + incidentId + "/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code", is("INVALID_TRANSITION")));
    }

    @Test
    void shouldRejectAssignmentWithoutDepartment() throws Exception {

        UUID incidentId = createIncident();

        mockMvc.perform(
                        post("/api/incidents/" + incidentId + "/assignments")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"notes\": \"sin departamento\"}")
                )
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code", is("VALIDATION_ERROR")))
                .andExpect(jsonPath("$.errors[0].field", is("department")));
}

    @Test
    void shouldListAssignmentsByIncident() throws Exception {

        UUID incidentId = createIncident();

        mockMvc.perform(
                post("/api/incidents/" + incidentId + "/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"department\": \"LIMPIEZA\"}")
        ).andExpect(status().isCreated());

        mockMvc.perform(get("/api/incidents/" + incidentId + "/assignments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].department", is("LIMPIEZA")));
    }
}

