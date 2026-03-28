package com.cardoptimizer.api.dto;

/**
 * API response DTO for a single earn rate.
 * lastVerified is the ISO-8601 string from DB; null when scraper has not yet run for this card.
 */
public record EarnRateResponse(
    String category,
    double multiplier,
    String caveats,
    String lastVerified,
    boolean isRotating
) {}
