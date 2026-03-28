package com.cardoptimizer.api.controller;

import com.cardoptimizer.api.dto.CardSummary;
import com.cardoptimizer.api.model.CreditCard;
import com.cardoptimizer.api.model.Issuer;
import com.cardoptimizer.api.service.CardQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardQueryService cardQueryService;

    public CardController(CardQueryService cardQueryService) {
        this.cardQueryService = cardQueryService;
    }

    /**
     * GET /api/cards
     * Optional query params: issuer, isBusiness, discontinued
     * Examples:
     *   /api/cards?issuer=CHASE
     *   /api/cards?isBusiness=false&discontinued=false
     */
    @GetMapping
    public ResponseEntity<List<CreditCard>> getAllCards(
            @RequestParam(required = false) Issuer issuer,
            @RequestParam(required = false) Boolean isBusiness,
            @RequestParam(required = false) Boolean discontinued) {
        return ResponseEntity.ok(cardQueryService.findAll(issuer, isBusiness, discontinued));
    }

    /**
     * GET /api/cards/issuers
     * Returns sorted list of all distinct issuer names present in the data.
     * Declared before /{cardId} so the literal path wins over the variable.
     */
    @GetMapping("/issuers")
    public ResponseEntity<List<String>> getIssuers() {
        return ResponseEntity.ok(cardQueryService.findDistinctIssuers());
    }

    /**
     * GET /api/cards/summary
     * Lightweight list — name, issuer, annual fee, current signup bonus.
     */
    @GetMapping("/summary")
    public ResponseEntity<List<CardSummary>> getSummary() {
        return ResponseEntity.ok(cardQueryService.getSummary());
    }

    /**
     * GET /api/cards/{cardId}
     * Returns the full card object for the given cardId (32-char hex string).
     */
    @GetMapping("/{cardId}")
    public ResponseEntity<CreditCard> getCardById(@PathVariable String cardId) {
        return ResponseEntity.ok(cardQueryService.findById(cardId));
    }
}