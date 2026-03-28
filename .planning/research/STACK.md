# Stack Research: Credit Card Optimization Tool

**Domain:** Credit card portfolio optimization web app
**Researched:** 2026-03-11
**Confidence:** HIGH

---

## Constraint

Existing Spring Boot 3.2 (Java 21, Maven) backend must be extended, not replaced.

---

## Frontend

### Framework: React 19 + Vite + TypeScript
**Confidence:** HIGH

- SPA is appropriate — no SEO requirement, no SSR needed
- React 19 is stable; Vite is the standard build tool replacing CRA
- TypeScript is non-negotiable for a data-heavy grid interface

**Do NOT use:**
- Next.js — SSR adds complexity with no benefit for a portfolio tool
- Angular/Vue — React ecosystem has the best table/grid libraries

### State Management
| Concern | Library | Rationale |
|---------|---------|-----------|
| Server state (API data) | TanStack Query v5 | Caching, background refresh, loading states |
| Client state (arsenal, spending) | Zustand | Lightweight, no boilerplate, persists to localStorage easily |
| URL state (filters) | nuqs | Type-safe URL search params |

### The Earn Rate Grid: TanStack Table v8
**Confidence:** HIGH

- Purpose-built for complex data grids; handles virtual scrolling for 500+ cards
- Headless — bring your own styles (Tailwind compatible)
- Best option for the cards × categories matrix that is the core UI

**Do NOT use:**
- AG Grid — overkill and heavy for this use case
- React Table v7 — outdated; TanStack Table is the successor

### UI Components: Tailwind CSS + shadcn/ui
**Confidence:** HIGH

- shadcn/ui: copy-paste components (not a dependency), fully customizable
- Tailwind: utility-first, no CSS file bloat
- Combination is the dominant 2025 pattern for custom-looking apps

**Do NOT use:**
- MUI / Ant Design — opinionated styles hard to override for a financial tool
- Chakra UI — less momentum in 2025

---

## Backend

### Upgrade: Spring Boot 3.2 → 3.4
**Confidence:** HIGH

- 3.4 is the current release; active support through 2027
- No breaking changes from 3.2
- Virtual threads (Project Loom) stable in 3.4 — useful for scraper I/O

### API Type Safety: SpringDoc OpenAPI + openapi-typescript
**Confidence:** HIGH

Key insight: Generate TypeScript types from the Spring Boot OpenAPI spec automatically. Zero hand-maintained types between Java and TypeScript.

```
Spring Boot (SpringDoc) → openapi.json → openapi-typescript → TypeScript types
```

Use `openapi-fetch` (typed fetch client) on the frontend.

### Database: H2 (embedded) → PostgreSQL migration path
**Confidence:** MEDIUM

- H2 embedded works for v1 (no user accounts = no multi-tenancy)
- Spring Data JPA with Flyway migrations from day one — ensures clean PostgreSQL migration when needed
- Trigger for PostgreSQL: user accounts, cloud deployment, concurrent scraper writes

---

## Scraper

### Python + Playwright + BeautifulSoup4 + Pydantic
**Confidence:** HIGH

- Playwright: headless Chrome for JS-rendered issuer pages (Chase, Amex require JS)
- BeautifulSoup4: HTML parsing for static pages
- Pydantic: data validation and schema enforcement for scraped data
- Output: JSON → Spring Boot API or direct DB write

**Do NOT use:**
- Scrapy — overkill for targeted issuer scraping
- Selenium — slower than Playwright, less modern API
- requests + lxml alone — insufficient for JS-rendered pages

### Scraper Architecture
- Runs as a separate process (not inside Spring Boot)
- Writes to shared database or exposes JSON files the API reads
- Decoupled: scraper failures don't affect API

---

## Summary Recommendations

| Layer | Choice | Version |
|-------|--------|---------|
| Frontend framework | React + Vite + TypeScript | React 19, Vite 6 |
| Server state | TanStack Query | v5 |
| Client state | Zustand | v5 |
| Grid/table | TanStack Table | v8 |
| UI components | shadcn/ui + Tailwind | latest |
| Type bridge | SpringDoc + openapi-typescript | latest |
| Backend | Spring Boot (upgrade 3.2→3.4) | 3.4.x |
| ORM | Spring Data JPA + Flyway | — |
| Database | H2 → PostgreSQL | — |
| Scraper | Python + Playwright + BS4 + Pydantic | Playwright 1.x |