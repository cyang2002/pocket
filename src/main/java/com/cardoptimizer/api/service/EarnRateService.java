package com.cardoptimizer.api.service;

import com.cardoptimizer.api.dto.EarnRateResponse;
import com.cardoptimizer.api.repository.EarnRateRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EarnRateService {

    // Canonical categories — matches categories.yaml. Sorted alphabetically.
    // LOCKED: Do not add/remove without updating categories.yaml in the scraper.
    public static final List<String> CANONICAL_CATEGORIES = List.of(
        "business", "dining", "drugstore", "entertainment", "gas",
        "groceries", "home_improvement", "online_shopping", "other",
        "streaming", "transit", "travel"
    );

    private final EarnRateRepository earnRateRepository;

    public EarnRateService(EarnRateRepository earnRateRepository) {
        this.earnRateRepository = earnRateRepository;
    }

    /**
     * Returns earn rates for a card. Empty list (not exception) if card has no earn rates.
     */
    public List<EarnRateResponse> getEarnRates(String cardId) {
        return earnRateRepository.findByCardId(cardId)
            .stream()
            .map(er -> new EarnRateResponse(
                er.category(),
                er.multiplier(),
                er.caveats(),
                er.lastVerified()
            ))
            .toList();
    }

    /**
     * Returns the locked canonical category list. Static — does not query DB.
     */
    public List<String> getCanonicalCategories() {
        return CANONICAL_CATEGORIES;
    }
}
