package com.cardoptimizer.api.controller;

import com.cardoptimizer.api.dto.CardGridResponse;
import com.cardoptimizer.api.model.Issuer;
import com.cardoptimizer.api.model.Network;
import com.cardoptimizer.api.service.CardGridService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CardGridController {

    private final CardGridService cardGridService;

    public CardGridController(CardGridService cardGridService) {
        this.cardGridService = cardGridService;
    }

    @GetMapping("/grid")
    public ResponseEntity<List<CardGridResponse>> getGrid(
            @RequestParam(required = false) Issuer issuer,
            @RequestParam(required = false) Boolean isBusiness,
            @RequestParam(required = false) Network network,
            @RequestParam(required = false) Double maxFee,
            @RequestParam(required = false) Boolean hasEarnRates) {
        return ResponseEntity.ok(cardGridService.getGrid(issuer, isBusiness, network, maxFee, hasEarnRates));
    }

    @GetMapping("/compare")
    public ResponseEntity<List<CardGridResponse>> compare(
            @RequestParam List<String> ids) {
        return ResponseEntity.ok(cardGridService.getCompare(ids));
    }
}
