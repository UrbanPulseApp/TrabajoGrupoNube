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

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class IncidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IncidentRepository incidentRepository;

    @Test
    void shouldCreateIncident() throws Exception {

        //Nacho: He añadido los saltos de línea porque en java 11 no funciona como en la versión anterior.
        String json = "{\n" +
                "    \"title\": \"Semáforo averiado\",\n" +
                "    \"description\": \"El semáforo permanece en rojo\",\n" +
                "    \"category\": \"TRAFFIC_LIGHT\",\n" +
                "    \"latitude\": 36.7213,\n" +
                "    \"longitude\": -4.4214\n" +
                "}";

        mockMvc.perform(
                        post("/api/incidents")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title",
                        is("Semáforo averiado")))
                .andExpect(jsonPath("$.description",
                        is("El semáforo permanece en rojo")))
                .andExpect(jsonPath("$.category",
                        is("TRAFFIC_LIGHT")))
                .andExpect(jsonPath("$.status",
                        is("REPORTED")))
                .andExpect(jsonPath("$.location.latitude",
                        is(36.7213)))
                .andExpect(jsonPath("$.location.longitude",
                        is(-4.4214)));
    }
}