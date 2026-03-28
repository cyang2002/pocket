package com.cardoptimizer.api.model;

public record Credit(
        String description,
        double value,
        double weight,
        String currency  // nullable; only present on co-branded cards
) {}