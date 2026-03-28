package com.cardoptimizer.api;

import com.cardoptimizer.api.dto.CardGridResponse;
import com.cardoptimizer.api.model.CreditCard;
import com.cardoptimizer.api.model.EarnRate;
import com.cardoptimizer.api.model.Issuer;
import com.cardoptimizer.api.model.Network;
import com.cardoptimizer.api.repository.EarnRateRepository;
import com.cardoptimizer.api.service.CardDataService;
import com.cardoptimizer.api.service.CardGridService;
import com.cardoptimizer.api.service.EarnRateService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CardGridServiceTest {

    @Mock
    private CardDataService cardDataService;

    @Mock
    private EarnRateRepository earnRateRepository;

    @InjectMocks
    private CardGridService cardGridService;

    private static final CreditCard CARD_1 = new CreditCard(
            "card-1", "Test Card", Issuer.CHASE, Network.VISA,
            "USD", false, 95.0, false, 0.0,
            null, null, List.of(), List.of(), List.of(), false
    );

    private static final CreditCard CARD_2 = new CreditCard(
            "card-2", "Test Card 2", Issuer.CHASE, Network.VISA,
            "USD", false, 0.0, false, 0.0,
            null, null, List.of(), List.of(), List.of(), false
    );

    @Test
    void buildGridResponse_containsAll12Categories() {
        when(earnRateRepository.findAll()).thenReturn(List.of());
        when(cardDataService.getAllCards()).thenReturn(List.of(CARD_1));

        List<CardGridResponse> result = cardGridService.getGrid(null, null, null, null, null);

        assertThat(result).isNotEmpty();
        assertThat(result.get(0).earnRates().keySet())
                .containsExactlyInAnyOrderElementsOf(EarnRateService.CANONICAL_CATEGORIES);
    }

    @Test
    void isStale_nullLastVerified_returnsTrue() {
        when(earnRateRepository.findAll()).thenReturn(List.of());
        when(cardDataService.getAllCards()).thenReturn(List.of(CARD_1));

        List<CardGridResponse> result = cardGridService.getGrid(null, null, null, null, null);

        assertThat(result.get(0).isStale()).isTrue();
    }

    @Test
    void isStale_oldDate_returnsTrue() {
        when(earnRateRepository.findAll()).thenReturn(
                List.of(new EarnRate(1L, "card-1", "dining", 3.0, null, "2020-01-01T00:00:00Z"))
        );
        when(cardDataService.getAllCards()).thenReturn(List.of(CARD_1));

        List<CardGridResponse> result = cardGridService.getGrid(null, null, null, null, null);

        assertThat(result.get(0).isStale()).isTrue();
    }

    @Test
    void isStale_recentDate_returnsFalse() {
        when(earnRateRepository.findAll()).thenReturn(
                List.of(new EarnRate(1L, "card-1", "dining", 3.0, null, Instant.now().toString()))
        );
        when(cardDataService.getAllCards()).thenReturn(List.of(CARD_1));

        List<CardGridResponse> result = cardGridService.getGrid(null, null, null, null, null);

        assertThat(result.get(0).isStale()).isFalse();
    }

    @Test
    void compare_unknownIdSkipped() {
        when(earnRateRepository.findAll()).thenReturn(List.of());
        when(cardDataService.getAllCards()).thenReturn(List.of(CARD_1, CARD_2));

        List<CardGridResponse> result = cardGridService.getCompare(List.of("card-1", "DOES_NOT_EXIST", "card-2"));

        assertThat(result).hasSize(2);
    }
}
