package com.cardoptimizer.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class EarnRateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getEarnRates_unknownCard_returns200WithEmptyArray() throws Exception {
        mockMvc.perform(get("/api/cards/nonexistent-card-id-xyz/earn-rates"))
               .andExpect(status().isOk())
               .andExpect(content().json("[]"));
    }

    @Test
    void getCategories_returns200WithExactly12Items() throws Exception {
        mockMvc.perform(get("/api/categories"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.length()").value(12));
    }

    @Test
    void getCategories_containsDining() throws Exception {
        mockMvc.perform(get("/api/categories"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasItem("dining")));
    }

    @Test
    void getCategories_containsTravel() throws Exception {
        mockMvc.perform(get("/api/categories"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasItem("travel")));
    }
}
