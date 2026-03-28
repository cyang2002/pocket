package com.cardoptimizer.api.service;

import com.cardoptimizer.api.dto.CardGridResponse;
import com.cardoptimizer.api.model.CreditCard;
import com.cardoptimizer.api.model.EarnRate;
import com.cardoptimizer.api.model.Issuer;
import com.cardoptimizer.api.model.Network;
import com.cardoptimizer.api.repository.EarnRateRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CardGridService {

    private final CardDataService cardDataService;
    private final EarnRateRepository earnRateRepository;

    @Value("${cardapi.staleness.threshold-days:30}")
    private int stalenessDays = 30;

    public CardGridService(CardDataService cardDataService, EarnRateRepository earnRateRepository) {
        this.cardDataService = cardDataService;
        this.earnRateRepository = earnRateRepository;
    }

    public List<CardGridResponse> getGrid(
            Issuer issuer,
            Boolean isBusiness,
            Network network,
            Double maxFee,
            Boolean hasEarnRates) {

        Map<String, List<EarnRate>> byCardId = buildEarnRateMap();

        return cardDataService.getAllCards().stream()
                .filter(c -> issuer == null || c.issuer() == issuer)
                .filter(c -> isBusiness == null || c.isBusiness() == isBusiness)
                .filter(c -> network == null || network == c.network())
                .filter(c -> maxFee == null || c.annualFee() <= maxFee)
                .filter(c -> {
                    if (Boolean.TRUE.equals(hasEarnRates)) {
                        return !byCardId.getOrDefault(c.cardId(), List.of()).isEmpty();
                    }
                    return true;
                })
                .sorted(Comparator
                        .comparing((CreditCard c) -> c.issuer().name())
                        .thenComparing(CreditCard::name))
                .map(c -> toGridResponse(c, byCardId.getOrDefault(c.cardId(), List.of())))
                .toList();
    }

    public List<CardGridResponse> getCompare(List<String> ids) {
        if (ids == null || ids.isEmpty()) return List.of();

        Map<String, List<EarnRate>> byCardId = buildEarnRateMap();

        Set<String> idSet = new HashSet<>(ids);
        return cardDataService.getAllCards().stream()
                .filter(c -> idSet.contains(c.cardId()))
                .map(c -> toGridResponse(c, byCardId.getOrDefault(c.cardId(), List.of())))
                .toList();
    }

    private Map<String, List<EarnRate>> buildEarnRateMap() {
        return earnRateRepository.findAll().stream()
                .collect(Collectors.groupingBy(EarnRate::cardId));
    }

    private CardGridResponse toGridResponse(CreditCard card, List<EarnRate> rates) {
        Map<String, Double> earnRates = new LinkedHashMap<>();
        for (String cat : EarnRateService.CANONICAL_CATEGORIES) {
            earnRates.put(cat, null);
        }
        for (EarnRate rate : rates) {
            earnRates.put(rate.category(), rate.multiplier());
        }

        String lastVerified = rates.stream()
                .map(EarnRate::lastVerified)
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse(null);

        return new CardGridResponse(
                card.cardId(),
                card.name(),
                card.issuer(),
                card.network(),
                card.isBusiness(),
                card.annualFee(),
                card.isAnnualFeeWaived(),
                card.imageUrl(),
                earnRates,
                lastVerified,
                isStale(lastVerified)
        );
    }

    private boolean isStale(String lastVerified) {
        if (lastVerified == null) return true;
        try {
            Instant verified = Instant.parse(lastVerified);
            return verified.isBefore(Instant.now().minus(stalenessDays, ChronoUnit.DAYS));
        } catch (Exception e) {
            return true;
        }
    }
}
