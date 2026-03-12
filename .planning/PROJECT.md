# Credit Card Optimizer

## What This Is

A web tool that helps the general public optimize their credit card portfolio. Users can browse all commercially available personal and business cards, view earn rates by spending category, and ultimately build, analyze, and optimize their card arsenal. The tool starts as a card database with a category earn-rate grid, expanding into personalized spending optimization and card recommendations.

## Core Value

Users can see at a glance which card earns the most in each spending category, so they always know which card to use and which cards are worth adding.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Comprehensive card database: all commercially available personal and business cards
- [ ] Category earn rate data per card (3x dining, 2x travel, etc.) sourced via web scraper
- [ ] Card browse/search with filtering (issuer, card type, network)
- [ ] Card-by-category earn rate grid view (the core UI)
- [ ] Arsenal builder: user selects their current cards
- [ ] Spending optimizer: route purchases to the best card in your arsenal
- [ ] Gap analysis: identify categories where your arsenal earns poorly
- [ ] Card add recommender: rank candidate cards by incremental value to your specific spending profile
- [ ] Spending category inputs (monthly spend sliders/inputs per category)

### Out of Scope

- Bank/transaction import (Plaid or similar) — manual category inputs sufficient for v1; may add later
- Credit score requirements — missing from current data source, add when scraper covers it
- APR calculations — useful but not core to rewards optimization
- Mobile app — web-first

## Context

- Existing Spring Boot 3.2 API (Java 21, Maven) at `card-api` serves card data from `andenacitelli/credit-card-bonuses-api` (GitHub raw JSON)
- Current data: cardId, name, issuer, network, currency (points program), isBusiness, annualFee, isAnnualFeeWaived, universalCashbackPercent, url, imageUrl, credits[], offers[], historicalOffers[], discontinued
- Missing: category earn rate multipliers (3x dining, 2x travel), APR, credit score requirements, full card benefits
- A web scraper plan (`scraper-plan.md`) exists to fill the earn rate gap
- Caffeine in-memory cache (60-min TTL), CORS for localhost:3000 and localhost:5173, port 8080

## Constraints

- **Tech Stack**: Spring Boot backend already exists — extend rather than replace
- **Data**: Earn rates must be scraped (no free API with this data exists); scraper is a prerequisite for the optimizer features
- **Scope**: Start with card database + grid view; design for expansion without overbuilding
- **Flexibility**: Architecture should allow arsenal/optimizer/recommender features to be added without rewrites

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web scraper for earn rates | No free API has category multipliers; scraping is the practical path | — Pending |
| v1 = card database + grid view | Smallest version that's useful and showable; optimizer requires earn rate data anyway | — Pending |
| Expand iteratively | General public tool that should grow based on real usage, not over-engineered upfront | — Pending |

---
*Last updated: 2026-03-11 after initialization*