# card-api — Project Context

Spring Boot 3.2 REST API (Java 21, Maven) that serves credit card earn rate data to a frontend UI.
Package: `com.cardoptimizer.api` | Port: **8080**

## Purpose

Users need to know which card earns the most in each spending category (dining, travel, groceries, etc.) so they always know which card to use. This API is the data layer; Phase 2 adds a React UI on top.

## Stack

- **Java 25** (OpenJDK via Homebrew) + **Spring Boot 3.2** + **Maven 3.9.14**
- **SQLite** (WAL mode) via HikariCP + **Spring Data JDBC** + **Flyway** migrations
- **Earn rate data** populated via a controlled external service (not the Python scraper — see Architecture)
- Data file: `data/cardoptimizer.db` (gitignored, created at runtime)

## Dev Environment Setup (new machine)

```bash
# Java & Maven — installed via Homebrew on current machine (macOS, Apple Silicon)
export JAVA_HOME=/opt/homebrew/Cellar/openjdk/25.0.2/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:/opt/homebrew/Cellar/maven/3.9.14/bin:$PATH"

# Run the API
cd ~/Documents/Code/card-api && mvn spring-boot:run

# Run Java tests
mvn test

# Python scraper setup
cd scraper && pip install -r requirements.txt
playwright install chromium

# Run Python tests
cd scraper && pytest
```

## API Endpoints

**Card data (from upstream GitHub JSON source):**
- `GET /api/cards` — all cards; filters: `?issuer=CHASE&isBusiness=false&discontinued=false`
- `GET /api/cards/{cardId}` — single card by 32-char hex ID
- `GET /api/cards/issuers` — distinct issuers sorted
- `GET /api/cards/summary` — lightweight list (name, issuer, fee, signup bonus)

**Earn rate data (from local SQLite, populated by external controlled service):**
- `GET /api/cards/{cardId}/earn-rates` — category earn rates for a card
- `GET /api/categories` — the 12 locked canonical category names
- `GET /api/cards/grid` — all cards with earn rates joined, staleness flag, and filter support
- `GET /api/cards/compare` — subset of cards for side-by-side comparison

## Architecture

```
GitHub JSON API       ──→ CardService (Caffeine cache, 60-min TTL) ──→ /api/cards/*
SQLite DB             ──→ EarnRateRepository                       ──→ /api/cards/{id}/earn-rates
External service      ──→ SQLite DB (data/cardoptimizer.db)        (populates earn_rates table)
CardGridService       ──→ joins card data + earn rates             ──→ /api/cards/grid, /api/cards/compare
React SPA (frontend/) ──→ consumes all endpoints                   ──→ port 5173
```

**Upstream card data source:** `andenacitelli/credit-card-bonuses-api` (raw JSON on GitHub)
**Earn rate population:** External controlled service writes to `earn_rates` table with `last_verified` timestamps; partial coverage, expanding over time
**CORS origins:** `localhost:3000`, `localhost:5173`

## Category Taxonomy (locked — do not change)

12 canonical categories: `dining`, `travel`, `groceries`, `gas`, `streaming`, `drugstore`,
`entertainment`, `online_shopping`, `transit`, `home_improvement`, `business`, `other`

Defined in `EarnRateService.CANONICAL_CATEGORIES`. The Java `GET /api/categories` endpoint returns these statically.

## Key Technical Decisions

- **AnsiDialect as `@Bean`** in `JdbcConfig.java` — `spring.data.jdbc.dialect` property doesn't exist in Spring Data JDBC 3.x
- **WAL mode** via HikariCP `connection-init-sql: PRAGMA journal_mode=WAL` — not in schema SQL
- **Flyway migration** uses `CREATE TABLE IF NOT EXISTS` so dev and test share the same `data/cardoptimizer.db` without Flyway conflicts
- **`EarnRateResponse.lastVerified` is `String`** not `Instant` — SQLite stores as TEXT; avoid dialect-specific mapping failures
- **`/api/categories` is a static list**, not a DB query — works before earn rate data exists, prevents schema drift
- **ID mapping** between upstream API cards and earn rate data uses explicit `cardId` matching, not name matching
- **Staleness** — `isStale: true` when `last_verified` is null or older than 30 days (configurable via `cardapi.staleness.threshold-days`)

## GSD Planning Status

This project uses the GSD workflow. Planning files are in `.planning/` (gitignored — local only).

**Current milestone:** v1.0 | **2 phases complete**

| Phase | Status | Notes |
|-------|--------|-------|
| 1: Data Foundation | Complete | Earn rates populated via external controlled service |
| 2: Card Discovery UI | Complete (2026-03-15) | Grid, filters, detail, compare all working |

**Known tech debt (tracked in v1.0-MILESTONE-AUDIT.md):**
- `CardDetail` staleness badge always hidden — `fetchCardById` returns `CreditCard` (no `isStale`); fix by deriving staleness from earn rates query
- `fetchCategories` in `lib/api.ts` is unused — components hardcode the 12-category array inline
- Server-side filter params never sent to `/api/cards/grid` — client-side filtering only