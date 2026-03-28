package com.cardoptimizer.api.model;

import java.util.List;

public record Offer(
        double spend,
        List<OfferAmount> amount,
        int days,
        String expiration,   // nullable; format: YYYY-MM-DD
        Boolean isPublic,    // nullable
        List<Credit> credits,
        String details,      // nullable
        String url,          // nullable
        String referralUrl   // nullable
) {}