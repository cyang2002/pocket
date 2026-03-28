package com.cardoptimizer.api.model;

import java.util.List;

public record CreditCard(
        String cardId,
        String name,
        Issuer issuer,
        Network network,
        String currency,
        boolean isBusiness,
        double annualFee,
        boolean isAnnualFeeWaived,
        double universalCashbackPercent,
        String url,
        String imageUrl,
        List<Credit> credits,
        List<Offer> offers,
        List<Offer> historicalOffers,
        boolean discontinued
) {}