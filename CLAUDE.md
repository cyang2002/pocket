# card-api — Project Context

Spring Boot 3.2 REST API (Java 21, Maven) that serves credit card earn rate data to a frontend UI.
Package: `com.cardoptimizer.api` | Port: **8080**

## Purpose

Users need to know which card earns the most in each spending category (dining, travel, groceries, etc.) so they always know which card to use. This API is the data layer; Phase 2 adds a React UI on top.

## Stack

- **Java 21** (Microsoft OpenJDK) + **Spring Boot 3.2** + **Maven 3.9.9**
- **SQLite** (WAL mode) via HikariCP + **Spring Data JDBC** + **Flyway** migrations
- **Python 3** scraper (`scraper/`) using crawl4ai + playwright to populate earn rate data
- Data file: `data/cardoptimizer.db` (gitignored, created at runtime)

## Dev Environment Setup (new machine)

```bash
# Java & Maven — must be in PATH
export JAVA_HOME=~/tools/jdk-21.0.10+7
export PATH="$JAVA_HOME/bin:~/tools/apache-maven-3.9.9/bin:$PATH"

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

**Earn rate data (from local SQLite, populated by scraper):**
- `GET /api/cards/{cardId}/earn-rates` — category earn rates for a card (empty until scraper runs)
- `GET /api/categories` — the 12 locked canonical category names

## Architecture

```
GitHub JSON API ──→ CardService (Caffeine cache, 60-min TTL) ──→ /api/cards/*
SQLite DB        ──→ EarnRateRepository                       ──→ /api/cards/{id}/earn-rates
Python scraper   ──→ SQLite DB (data/cardoptimizer.db)
```

**Upstream card data source:** `andenacitelli/credit-card-bonuses-api` (raw JSON on GitHub)
**CORS origins:** `localhost:3000`, `localhost:5173`

## Category Taxonomy (locked — do not change)

12 canonical categories: `dining`, `travel`, `groceries`, `gas`, `streaming`, `drugstore`,
`entertainment`, `online_shopping`, `transit`, `home_improvement`, `business`, `other`

Defined in `scraper/categories.yaml`. The Java `GET /api/categories` endpoint returns these statically.

## Key Technical Decisions

- **AnsiDialect as `@Bean`** in `JdbcConfig.java` — `spring.data.jdbc.dialect` property doesn't exist in Spring Data JDBC 3.x
- **WAL mode** via HikariCP `connection-init-sql: PRAGMA journal_mode=WAL` — not in schema SQL
- **Flyway migration** uses `CREATE TABLE IF NOT EXISTS` so dev and test share the same `data/cardoptimizer.db` without Flyway conflicts
- **`normalize()` returns `None`** for unmapped strings (not `'other'`) — callers decide handling
- **SQLite tests use `tmp_path`** fixture (real file path required for WAL mode — in-memory SQLite can't enable WAL)
- **`EarnRateResponse.lastVerified` is `String`** not `Instant` — SQLite stores as TEXT; avoid dialect-specific mapping failures
- **`/api/categories` is a static list**, not a DB query — works before scraper runs, prevents schema drift
- **ID mapping** between upstream API cards and scraped data uses explicit `cardId` matching, not name matching

## GSD Planning Status

This project uses the GSD workflow. Planning files are in `.planning/` (gitignored — local only).

**Current milestone:** v1.0 | **2 phases total**

| Phase | Status | Plans |
|-------|--------|-------|
| 1: Data Foundation | In Progress (3/5 plans done) | 01-01 ✓, 01-02 ✓, 01-03 ✓, 01-04 ⏳, 01-05 ○ |
| 2: Card Discovery UI | Not started | TBD |

**Where we left off (2026-03-13):**
Phase 1, plan 01-04 — blocked at a **human checkpoint**. The Chase/Amex scraper code (plan 01-04) requires DOM inspection of live card pages before CSS selectors can be written. Need to inspect these pages in DevTools:
- `https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred`
- `https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited`
- `https://www.americanexpress.com/us/credit-cards/card/gold-card/`
- `https://www.americanexpress.com/us/credit-cards/card/blue-cash-preferred-card-from-american-express/`

Find the repeating earn rate rows, copy CSS selectors for: base row, multiplier text, category label, caveats. Then resume `/gsd:execute-phase 1` and paste the selectors when prompted.

**Known blocker:** Unknown whether Chase/Amex pages require Playwright vs. plain HTTP — validate during the DOM spike.

## Resuming on a New Machine

1. Clone repo and set up Java/Maven/Python (see Dev Environment Setup above)
2. Install GSD: follow instructions at `~/.claude/get-shit-done/` (or reinstall)
3. Re-initialize `.planning/` state: run `/gsd:progress` — GSD will detect missing STATE.md and offer to reconstruct from the ROADMAP.md and plan files that are in the repo
4. Resume phase 1: `/gsd:execute-phase 1` — it will skip completed plans (01-01 through 01-03 have SUMMARY.md files) and resume at 01-04
5. Provide DOM inspection results when prompted at the 01-04 checkpoint