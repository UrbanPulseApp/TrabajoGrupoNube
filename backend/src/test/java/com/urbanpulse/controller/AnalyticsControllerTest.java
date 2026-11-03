package com.urbanpulse.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "ANALYST")
    void shouldAllowAnalystToGetSummary() throws Exception {
        mockMvc.perform(get("/api/analytics/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncidents", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.byStatus").exists())
                .andExpect(jsonPath("$.byCategory").exists())
                .andExpect(jsonPath("$.byDistrict").exists());
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    void shouldAllowOperatorToGetSummary() throws Exception {
        mockMvc.perform(get("/api/analytics/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncidents", greaterThanOrEqualTo(0)));
    }

    @Test
    @WithMockUser(roles = "CITIZEN")
    void shouldForbidCitizenFromGettingSummary() throws Exception {
        mockMvc.perform(get("/api/analytics/summary"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }
}
