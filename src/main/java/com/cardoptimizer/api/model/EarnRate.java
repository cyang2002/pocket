package com.cardoptimizer.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

/**
 * Maps to earn_rates table. last_verified stored as TEXT (ISO-8601) in SQLite —
 * kept as String here to avoid dialect conversion issues; converted in DTO layer.
 */
@Table("earn_rates")
public record EarnRate(
    @Id Long id,
    @Column("card_id") String cardId,
    @Column("category") String category,
    @Column("multiplier") double multiplier,
    @Column("caveats") String caveats,
    @Column("last_verified") String lastVerified
) {}
