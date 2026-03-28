# Architecture Research: Credit Card Optimization Tool

**Domain:** Credit card portfolio optimization
**Researched:** 2026-03-11
**Confidence:** MEDIUM (training data; no live web search)

---

## Component Overview

Five core components with clear boundaries:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Python Scraper │────▶│  Card Database   │────▶│  Spring Boot    │
│  (data pipeline)│     │  (PostgreSQL/H2) │     │  REST API       │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
                                               ┌─────────────────────┐
                                               │  React SPA          │
                                               │  (frontend)         │
                                               │  + Calculation      │
                                               │    Engine (in API)  │
                                               └─────────────────────┘
```

---

## Component Boundaries

### 1. Data Pipeline (Python Scraper)
- **Responsibility:** Scrape card earn rates from issuer sites; produce structured data
- **Inputs:** Issuer URLs (Chase, Amex, Citi, Capital One, etc.)
- **Outputs:** Structured earn rate records written to DB or JSON
- **Isolation:** Runs independently of the API; failures don't affect API serving
- **Trigger:** Scheduled (weekly/monthly) or manual

### 2. Card Database
- **Responsibility:** Single source of truth for all card data
- **Schema:** Cards table + EarnRates table (separate, not JSON blobs)
- **Why relational for earn rates:** The grid requires cross-card queries ("show all cards earning 3x+ on dining") — JSON blobs can't do this efficiently
- **H2 for v1**, PostgreSQL when cloud deployment or multi-user needed

### 3. REST API (Spring Boot)
- **Responsibility:** Serve card data, earn rates, and optimization calculations
- **Existing endpoints:** /api/cards, /api/cards/{id}, /api/cards/issuers, /api/cards/summary
- **New endpoints needed:**
  - `GET /api/cards/{id}/earn-rates` — category multipliers for a card
  - `GET /api/categories` — canonical spending category list
  - `POST /api/optimize` — given arsenal + spending, return routing recommendations
  - `POST /api/recommend` — given arsenal + spending, return card add candidates
- **Calculation engine lives here** (not in frontend) — keeps logic testable, reusable

### 4. Frontend (React SPA)
- **Responsibility:** UI only — display, user input, state management
- **Does NOT compute:** Optimization calculations done server-side
- **Key views:** Card grid, Card detail, Arsenal builder, Spending input, Optimizer results
- **State:** Arsenal and spending inputs persisted in localStorage (no auth needed for v1)

### 5. Calculation Engine (inside API)
- **Responsibility:** Portfolio analysis — routing, gap analysis, card recommendations
- **Inputs:** Arsenal (list of card IDs) + spending (category → monthly amount)
- **Outputs:** Per-purchase routing advice, gap report, ranked card candidates
- **Location:** Service layer within Spring Boot (not a separate service)

---

## Data Flow

### Card Data Flow
```
Issuer websites → Scraper → Database → Spring Boot API → React frontend
```

### Optimization Flow
```
User selects cards (arsenal) + enters spending →
Frontend sends POST /api/optimize →
API reads earn rates from DB →
Calculation engine computes best card per category →
Returns routing table + gap analysis + recommendations →
Frontend renders grid
```

---

## Critical Design Decisions

### Spending Category Taxonomy (define early)
The canonical category list is the backbone of the entire system. Earn rates, spending inputs, gap analysis, and recommendations all hinge on consistent categories.

**Recommended starting taxonomy:**
- Dining/Restaurants
- Groceries/Supermarkets
- Gas/Fuel
- Travel (flights, hotels, rental cars)
- Online Shopping
- Streaming Services
- Drugstores/Pharmacies
- Transit/Commute
- All Other (base rate)

Must map to what issuers actually use in their T&Cs (e.g., Chase calls it "Dining" not "Restaurants").

### Earn Rates as Relational Data
```sql
card_earn_rates (
  card_id VARCHAR,
  category VARCHAR,        -- "dining", "travel", etc.
  multiplier DECIMAL(4,2), -- 3.00 for 3x
  currency VARCHAR,        -- "chase_ur", "amex_mr", "cash"
  notes TEXT               -- "at US supermarkets only"
)
```

### Scraper Priority Order
1. Chase (Sapphire, Freedom, Ink — most popular cards)
2. American Express (Gold, Platinum, Blue Cash)
3. Citi (Double Cash, Custom Cash, Premier)
4. Capital One (Venture, Savor)
5. Remaining issuers

---

## Build Order (Dependencies)

```
Phase 1: Database schema + scraper + earn rate API endpoints
          (prerequisite for everything downstream)

Phase 2: Card grid frontend + search/filter
          (can use seeded data while scraper is built)

Phase 3: Arsenal builder + spending inputs (frontend)
          + /api/optimize endpoint (backend)

Phase 4: Gap analysis + card recommender
          (depends on Phase 3 arsenal/spending data)
```

Phases 2 and 1 can be partially parallelized using seeded/mock earn rate data.

---

## Open Questions

1. Which issuer sites require JS rendering vs. plain HTTP? (affects scraper tool choice per site)
2. How to handle earn rate exceptions (e.g., "3x on first $6,000/year then 1x")?
3. Points valuation model — use a fixed CPP table (e.g., Chase UR = 1.5¢) or let users set it?