package com.cardoptimizer.api.dto;

import com.cardoptimizer.api.model.Issuer;
import com.cardoptimizer.api.model.OfferAmount;

public record CardSummary(
        String cardId,
        String name,
        Issuer issuer,
        double annualFee,
        boolean isBusiness,
        boolean discontinued,
        OfferAmount currentOffer  // nullable; first amount of first active offer
) {}