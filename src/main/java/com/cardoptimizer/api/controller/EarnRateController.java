package com.cardoptimizer.api.controller;

import com.cardoptimizer.api.dto.EarnRateResponse;
import com.cardoptimizer.api.service.EarnRateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class EarnRateController {

    private final EarnRateService earnRateService;

    public EarnRateController(EarnRateService earnRateService) {
        this.earnRateService = earnRateService;
    }

    /**
     * GET /api/cards/{cardId}/earn-rates
     * Returns earn rates for the given card. Empty array if no earn rates scraped yet.
     * 200 always (empty array is valid — card exists but scraper hasn't run for it).
     */
    @GetMapping("/cards/{cardId}/earn-rates")
    public ResponseEntity<List<EarnRateResponse>> getEarnRates(@PathVariable String cardId) {
        return ResponseEntity.ok(earnRateService.getEarnRates(cardId));
    }

    /**
     * GET /api/categories
     * Returns the locked canonical spending category list (12 items).
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(earnRateService.getCanonicalCategories());
    }
}
