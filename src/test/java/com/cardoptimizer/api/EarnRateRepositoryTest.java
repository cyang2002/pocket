package com.cardoptimizer.api;

import com.cardoptimizer.api.model.EarnRate;
import com.cardoptimizer.api.repository.EarnRateRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class EarnRateRepositoryTest {

    @Autowired
    private EarnRateRepository earnRateRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String TEST_CARD_ID = "test-repo-card-id-do-not-use";

    @AfterEach
    void cleanup() {
        jdbcTemplate.update("DELETE FROM earn_rates WHERE card_id = ?", TEST_CARD_ID);
    }

    @Test
    void findByCardId_returnsEmptyListWhenNoRows() {
        List<EarnRate> result = earnRateRepository.findByCardId("nonexistent-card-id-xyz");
        assertThat(result).isEmpty();
    }

    @Test
    void findByCardId_returnsRowsForKnownCardId() {
        // Insert directly via JDBC to test the read side
        jdbcTemplate.update(
            "INSERT INTO earn_rates (card_id, category, multiplier, caveats, last_verified) VALUES (?, ?, ?, ?, ?)",
            TEST_CARD_ID, "dining", 3.0, null, "2024-01-01T00:00:00Z"
        );

        List<EarnRate> result = earnRateRepository.findByCardId(TEST_CARD_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).category()).isEqualTo("dining");
        assertThat(result.get(0).multiplier()).isEqualTo(3.0);
        assertThat(result.get(0).lastVerified()).isEqualTo("2024-01-01T00:00:00Z");
    }

    @Test
    void findByCardId_returnsMultipleCategories() {
        jdbcTemplate.update(
            "INSERT INTO earn_rates (card_id, category, multiplier, caveats, last_verified) VALUES (?, ?, ?, ?, ?)",
            TEST_CARD_ID, "dining", 3.0, null, "2024-01-01T00:00:00Z"
        );
        jdbcTemplate.update(
            "INSERT INTO earn_rates (card_id, category, multiplier, caveats, last_verified) VALUES (?, ?, ?, ?, ?)",
            TEST_CARD_ID, "travel", 2.0, "Portal only", "2024-01-01T00:00:00Z"
        );

        List<EarnRate> result = earnRateRepository.findByCardId(TEST_CARD_ID);

        assertThat(result).hasSize(2);
        // Results are ordered by category name
        assertThat(result.get(0).category()).isEqualTo("dining");
        assertThat(result.get(1).category()).isEqualTo("travel");
    }
}
