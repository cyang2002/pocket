package com.cardoptimizer.api.model;

public record OfferAmount(
        double amount,
        String currency,  // nullable; absent means same currency as the card
        Double weight,    // nullable; present in actual data but not in OpenAPI spec
        String details    // nullable; present in actual data but not in OpenAPI spec
) {}