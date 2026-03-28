package com.cardoptimizer.api.repository;

import com.cardoptimizer.api.model.EarnRate;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface EarnRateRepository extends CrudRepository<EarnRate, Long> {

    /**
     * Returns all earn rates for a given cardId, ordered by category name.
     * Returns empty list (not null) when no rows exist for the cardId.
     */
    @Query("SELECT * FROM earn_rates WHERE card_id = :cardId ORDER BY category")
    List<EarnRate> findByCardId(String cardId);

    @Query("SELECT * FROM earn_rates ORDER BY card_id, category")
    List<EarnRate> findAll();

