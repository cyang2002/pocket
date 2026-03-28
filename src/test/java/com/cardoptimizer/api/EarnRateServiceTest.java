package com.cardoptimizer.api;

import com.cardoptimizer.api.dto.EarnRateResponse;
import com.cardoptimizer.api.model.EarnRate;
import com.cardoptimizer.api.repository.EarnRateRepository;
import com.cardoptimizer.api.service.EarnRateService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EarnRateServiceTest {

    @Mock
    private EarnRateRepository earnRateRepository;

    @InjectMocks
    private EarnRateService earnRateService;

    @Test
    void getEarnRates_mapsModelToDto() {
        EarnRate model = new EarnRate(1L, "card-abc", "dining", 3.0, null, "2024-06-01T00:00:00Z");
        when(earnRateRepository.findByCardId("card-abc")).thenReturn(List.of(model));

        List<EarnRateResponse> result = earnRateService.getEarnRates("card-abc");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).category()).isEqualTo("dining");
        assertThat(result.get(0).multiplier()).isEqualTo(3.0);
        assertThat(result.get(0).lastVerified()).isEqualTo("2024-06-01T00:00:00Z");
    }

    @Test
    void getEarnRates_returnsEmptyListForUnknownCard() {
        when(earnRateRepository.findByCardId("unknown-id")).thenReturn(List.of());

        List<EarnRateResponse> result = earnRateService.getEarnRates("unknown-id");

        assertThat(result).isEmpty();
    }

    @Test
    void getEarnRates_includesLastVerifiedInDto() {
        EarnRate model = new EarnRate(2L, "card-def", "travel", 2.0, "Portal only", "2024-06-15T12:00:00Z");
        when(earnRateRepository.findByCardId("card-def")).thenReturn(List.of(model));

        List<EarnRateResponse> result = earnRateService.getEarnRates("card-def");

        assertThat(result.get(0).lastVerified()).isEqualTo("2024-06-15T12:00:00Z");
    }

    @Test
    void getCanonicalCategories_returnsAll12() {
        List<String> categories = earnRateService.getCanonicalCategories();
        assertThat(categories).hasSize(12);
    }

    @Test
    void getCanonicalCategories_containsExpectedValues() {
        List<String> categories = earnRateService.getCanonicalCategories();
        assertThat(categories).contains(
            "dining", "travel", "groceries", "gas", "streaming",
            "drugstore", "entertainment", "online_shopping",
            "transit", "home_improvement", "business", "other"
        );
    }
}
