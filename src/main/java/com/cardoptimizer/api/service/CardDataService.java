package com.cardoptimizer.api.service;

import com.cardoptimizer.api.config.CacheConfig;
import com.cardoptimizer.api.exception.CardDataUnavailableException;
import com.cardoptimizer.api.model.CreditCard;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class CardDataService {

    private static final Logger log = LoggerFactory.getLogger(CardDataService.class);
    private static final String DATA_PATH =
            "/andenacitelli/credit-card-bonuses-api/main/exports/data.json";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    // Volatile fallback — survives cache eviction so we can return stale data
    // instead of a 503 if the re-fetch fails (e.g. transient GitHub outage).
    private volatile List<CreditCard> lastSuccessfulFetch = List.of();

    public CardDataService(RestClient githubRestClient, ObjectMapper objectMapper) {
        this.restClient = githubRestClient;
        this.objectMapper = objectMapper;
    }

    @Cacheable(value = CacheConfig.CARDS_CACHE, key = "'all'")
    public List<CreditCard> getAllCards() {
        return fetchFromGithub();
    }

    /**
     * Proactively evicts the cache every 60 minutes so the next call to
     * getAllCards() triggers a fresh fetch via the @Cacheable miss path.
     * The Caffeine TTL acts as an independent safety net.
     */
    @CacheEvict(value = CacheConfig.CARDS_CACHE, key = "'all'")
    @Scheduled(
            fixedDelayString = "${cardapi.cache.refresh-ms:3600000}",
            initialDelayString = "${cardapi.cache.initial-delay-ms:3600000}"
    )
    public void evictCache() {
        log.info("Cards cache evicted — will re-fetch on next request");
    }

    private List<CreditCard> fetchFromGithub() {
        try {
            String json = restClient.get()
                    .uri(DATA_PATH)
                    .retrieve()
                    .body(String.class);

            List<CreditCard> cards = objectMapper.readValue(
                    json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, CreditCard.class)
            );

            lastSuccessfulFetch = List.copyOf(cards);
            log.info("Fetched {} cards from GitHub", cards.size());
            return lastSuccessfulFetch;

        } catch (Exception e) {
            log.error("Failed to fetch cards from GitHub: {}", e.getMessage());
            if (!lastSuccessfulFetch.isEmpty()) {
                log.warn("Returning {} stale cards from last successful fetch", lastSuccessfulFetch.size());
                return lastSuccessfulFetch;
            }
            throw new CardDataUnavailableException(
                    "GitHub fetch failed and no cached data is available", e);
        }
    }
}