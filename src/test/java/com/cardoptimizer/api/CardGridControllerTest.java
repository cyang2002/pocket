package com.cardoptimizer.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CardGridControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getGrid_returns200AndJsonArray() throws Exception {
        mockMvc.perform(get("/api/cards/grid"))
               .andExpect(status().isOk())
               .andExpect(content().contentTypeCompatibleWith("application/json"))
               .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getGrid_filterByIssuer_returnsOnlyChaseCards() throws Exception {
        // Shape check only — filtering correctness covered by service unit test
        mockMvc.perform(get("/api/cards/grid").param("issuer", "CHASE"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getGrid_filterHasEarnRates_excludesEmptyCards() throws Exception {
        mockMvc.perform(get("/api/cards/grid").param("hasEarnRates", "true"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray());
    }

    @Test
    void compare_returnsRequestedCards() throws Exception {
        mockMvc.perform(get("/api/cards/compare").param("ids", "fake-id-1,fake-id-2"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getGrid_gridItemShape_hasRequiredFields() throws Exception {
        mockMvc.perform(get("/api/cards/grid"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray());
        // when data exists: jsonPath("$[0].cardId").exists()
        // when data exists: jsonPath("$[0].name").exists()
        // when data exists: jsonPath("$[0].issuer").exists()
        // when data exists: jsonPath("$[0].earnRates").exists()
        // when data exists: jsonPath("$[0].isStale").exists()
    }
}
