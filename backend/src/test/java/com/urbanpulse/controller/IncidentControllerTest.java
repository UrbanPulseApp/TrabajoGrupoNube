package com.urbanpulse.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.urbanpulse.entity.Incident;
import com.urbanpulse.enums.IncidentStatus;
import com.urbanpulse.repository.IncidentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "CITIZEN")
class IncidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateIncident() throws Exception {
        String json = "{\n" +
                "    \"title\": \"Semáforo averiado\",\n" +
                "    \"description\": \"El semáforo permanece en rojo\",\n" +
                "    \"category\": \"TRAFFIC_LIGHT\",\n" +
                "    \"latitude\": 36.7213,\n" +
                "    \"longitude\": -4.4214\n" +
                "}";

        mockMvc.perform(
                        post("/api/incidents")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Semáforo averiado")))
                .andExpect(jsonPath("$.description", is("El semáforo permanece en rojo")))
                .andExpect(jsonPath("$.category", is("TRAFFIC_LIGHT")))
                .andExpect(jsonPath("$.status", is("REPORTED")))
                .andExpect(jsonPath("$.location.latitude", is(36.7213)))
                .andExpect(jsonPath("$.location.longitude", is(-4.4214)));
    }

    @Test
    void shouldGetIncidentUrbanContext() throws Exception {
        String json = "{\n" +
                "    \"title\": \"Farola rota en Soho\",\n" +
                "    \"description\": \"Luminaria caída en Calle Larios\",\n" +
                "    \"category\": \"ILUMINACION\",\n" +
                "    \"latitude\": 36.7184,\n" +
                "    \"longitude\": -4.4201\n" +
                "}";

        MvcResult createResult = mockMvc.perform(
                        post("/api/incidents")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        String incidentId = responseNode.get("id").asText();

        mockMvc.perform(get("/api/incidents/" + incidentId + "/context"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidentId", is(incidentId)))
                .andExpect(jsonPath("$.district").exists())
                .andExpect(jsonPath("$.weatherSummary").exists())
                .andExpect(jsonPath("$.trafficStatus").exists())
                .andExpect(jsonPath("$.observations").isArray());
    }

    @Test
    void shouldFindDuplicateIncidentsNearby() throws Exception {
        String json = "{\n" +
                "    \"title\": \"Bache peligroso Alameda\",\n" +
                "    \"description\": \"Bache hondo en el carril bus\",\n" +
                "    \"category\": \"CALZADA\",\n" +
                "    \"latitude\": 36.7185,\n" +
                "    \"longitude\": -4.4205\n" +
                "}";

        mockMvc.perform(
                        post("/api/incidents")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isCreated());

        // Búsqueda de duplicados a escasos metros (misma zona)
        mockMvc.perform(
                        get("/api/incidents/duplicates")
                                .param("latitude", "36.71852")
                                .param("longitude", "-4.42052")
                                .param("category", "CALZADA")
                                .param("radiusMeters", "50.0")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].distanceMeters", lessThanOrEqualTo(50.0)));
    }
}
