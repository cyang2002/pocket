package com.cardoptimizer.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.hamcrest.Matchers.startsWith;

/**
 * Regression tests — confirm existing CardController endpoints still respond after
 * adding SQLite/Flyway to the application context. Card data comes from the live
 * upstream GitHub API; if GitHub is unreachable, CardDataService returns stale data.
 */
@SpringBootTest
@AutoConfigureMockMvc
class CardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getAllCards_returns200() throws Exception {
        mockMvc.perform(get("/api/cards"))
               .andExpect(status().isOk())
               .andExpect(content().contentType("application/json"));
    }

    @Test
    void getIssuers_returns200AndNonEmptyArray() throws Exception {
        mockMvc.perform(get("/api/cards/issuers"))
               .andExpect(status().isOk())
               .andExpect(content().string(startsWith("[")));
    }

    @Test
    void getSummary_returns200() throws Exception {
        mockMvc.perform(get("/api/cards/summary"))
               .andExpect(status().isOk())
               .andExpect(content().contentType("application/json"));
    }
}
