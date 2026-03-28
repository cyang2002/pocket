package com.cardoptimizer.api.service;

import com.cardoptimizer.api.dto.CardSummary;
import com.cardoptimizer.api.exception.CardNotFoundException;
import com.cardoptimizer.api.model.CreditCard;
import com.cardoptimizer.api.model.Issuer;
import com.cardoptimizer.api.model.OfferAmount;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CardQueryService {

    private final CardDataService cardDataService;

    public CardQueryService(CardDataService cardDataService) {
        this.cardDataService = cardDataService;
    }

    public List<CreditCard> findAll(Issuer issuer, Boolean isBusiness, Boolean discontinued) {
        return cardDataService.getAllCards().stream()
                .filter(c -> issuer == null || c.issuer() == issuer)
                .filter(c -> isBusiness == null || c.isBusiness() == isBusiness)
                .filter(c -> discontinued == null || c.discontinued() == discontinued)
                .toList();
    }

    public CreditCard findById(String cardId) {
        return cardDataService.getAllCards().stream()
                .filter(c -> c.cardId().equals(cardId))
                .findFirst()
                .orElseThrow(() -> new CardNotFoundException(cardId));
    }

    public List<String> findDistinctIssuers() {
        return cardDataService.getAllCards().stream()
                .map(c -> c.issuer().name())
                .distinct()
                .sorted()
                .toList();
    }

    public List<CardSummary> getSummary() {
        return cardDataService.getAllCards().stream()
                .map(this::toSummary)
                .toList();
    }

    private CardSummary toSummary(CreditCard card) {
        OfferAmount currentOffer = card.offers().stream()
                .findFirst()
                .flatMap(o -> o.amount().stream().findFirst())
                .orElse(null);

        return new CardSummary(
                card.cardId(),
                card.name(),
                card.issuer(),
                card.annualFee(),
                card.isBusiness(),
                card.discontinued(),
                currentOffer
        );
    }
}