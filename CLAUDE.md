# pocket — Project Context

Spring Boot 3.2 REST API + React SPA. API on port 8080, frontend on port 5173.
Package: `com.cardoptimizer.api` | DB: `data/cardoptimizer.db` (SQLite, gitignored)

## Stack
- Java 25 + Spring Boot 3.2 + Maven | SQLite (WAL) + Spring Data JDBC + Flyway
- React + Vite + TanStack Query | Tailwind + shadcn/ui (base-ui primitives)
- Upstream card data: `andenacitelli/credit-card-bonuses-api` (GitHub JSON, 60-min Caffeine cache)
- Earn rates: external controlled service writes to `earn_rates` table with `last_verified` timestamps

## Category Taxonomy (locked — do not change)
12 canonical categories: `dining`, `travel`, `groceries`, `gas`, `streaming`, `drugstore`, `entertainment`, `online_shopping`, `transit`, `home_improvement`, `business`, `other`

## Non-obvious Technical Decisions
- `AnsiDialect` as `@Bean` in `JdbcConfig.java` — `spring.data.jdbc.dialect` property doesn't exist in Spring Data JDBC 3.x
- WAL mode set via HikariCP `connection-init-sql`, not in schema SQL
- `EarnRateResponse.lastVerified` is `String` not `Instant` — SQLite stores as TEXT
- `/api/categories` is a static list, not a DB query
- Staleness threshold: 30 days, configurable via `cardapi.staleness.threshold-days`

## Known Tech Debt
- `CardDetail` staleness badge always hidden — `fetchCardById` returns `CreditCard` (no `isStale`)
- `fetchCategories` in `lib/api.ts` is unused — components hardcode categories inline
- Server-side filter params never sent to `/api/cards/grid` — client-side only

## GSD Status
v1.0 | Phases 1 (Data Foundation) + 2 (Card Discovery UI) complete. Planning in `.planning/` (gitignored).
