package com.cardoptimizer.api.dto;

import com.cardoptimizer.api.model.Issuer;
import com.cardoptimizer.api.model.Network;
import java.util.Map;

public record CardGridResponse(
    String cardId,
    String name,
    Issuer issuer,
    Network network,
    boolean isBusiness,
    double annualFee,
    boolean isAnnualFeeWaived,
    String imageUrl,
    Map<String, Double> earnRates,
    String lastVerified,
    boolean isStale
) {}
