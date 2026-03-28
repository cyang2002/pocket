# Project Research Summary

**Project:** Credit Card Optimization Tool
**Domain:** Personal finance / credit card portfolio optimization
**Researched:** 2026-03-11
**Confidence:** HIGH (stack), HIGH (features), MEDIUM (architecture/pitfalls)

## Executive Summary

This is a data-heavy web application in a well-understood domain with several established competitors (NerdWallet, CardPointers, MaxRewards) — but a genuine gap exists for a free, web-based tool that combines a real earn rate database with personalized portfolio optimization. The recommended approach extends the existing Spring Boot 3.2 backend (upgrading to 3.4) and builds a React 19 + TypeScript SPA on top. The core technical differentiator is scraped earn rate data: category multipliers (3x dining, 2x travel) are the single missing ingredient that unlocks every personalization feature downstream.

The critical dependency chain runs scraper → earn rate data → grid → arsenal → optimizer. Nothing in Phase 2 or Phase 3 is buildable without Phase 1 data. However, the frontend grid UI can be built in parallel against seeded/mock data, allowing UI and data pipeline work to proceed concurrently. The data pipeline itself carries the highest technical risk: issuer websites break scrapers, category taxonomies must be locked in before writing any scraper code, and the existing upstream API (andenacitelli/credit-card-bonuses-api) must be reconciled with scraped data via an explicit ID mapping layer.

The top risks are all data modeling problems that must be solved in Phase 1: category taxonomy normalization, conditional earn rate representation (spending caps, portal requirements), and data source reconciliation. Getting these schemas right upfront is far cheaper than migrating them later. The optimizer's point valuation subjectivity and scope creep risk are real but controllable if the phased plan is enforced.

---

## Key Findings

### Recommended Stack

The existing Spring Boot backend is a constraint, not a weakness. Upgrading 3.2 → 3.4 is non-breaking and adds stable virtual thread support useful for scraper I/O. The full-stack type safety story — SpringDoc OpenAPI spec → openapi-typescript → typed fetch client — eliminates an entire class of frontend/backend interface bugs with no hand-maintained type definitions.

The frontend recommendation is React 19 + Vite + TypeScript with TanStack Table v8 as the centerpiece. TanStack Table is the only serious choice for the cards × categories earn rate matrix: headless (Tailwind-compatible), built for virtual scrolling over 500+ rows, with the strongest React ecosystem support. State management is split cleanly: TanStack Query for server state, Zustand for client state (arsenal, spending inputs), and nuqs for URL-serialized filter state.

**Core technologies:**
- React 19 + Vite + TypeScript: SPA framework — no SSR needed, best grid/table ecosystem
- TanStack Table v8: earn rate grid — purpose-built for complex data matrices
- TanStack Query v5: server state — caching, background refresh, loading/error states
- Zustand v5: client state — arsenal + spending inputs, localStorage persistence
- shadcn/ui + Tailwind CSS: UI components — composable, customizable, avoids MUI lock-in
- SpringDoc OpenAPI + openapi-typescript: type bridge — zero hand-maintained API types
- Spring Boot 3.4: backend — upgrade from 3.2, active support through 2027
- Spring Data JPA + Flyway: data layer — clean PostgreSQL migration path from H2
- Python + Playwright + BeautifulSoup4 + Pydantic: scraper — handles JS-rendered issuer pages

### Expected Features

The dependency graph is explicit: Earn Rate Grid is the prerequisite for everything. Arsenal builder, purchase router, gap analysis, and card recommender are all blocked until earn rates exist. Card database, search/filter, and UI scaffolding can be built in parallel against mock data.

**Must have (table stakes):**
- Earn rates by category (3x dining, 2x travel, etc.) — the entire value proposition
- Category earn rate grid — cross-card comparison matrix, core UI
- Card search and filter (issuer, network, type, fee) — expected by every user
- Sign-up bonus display — already in existing API
- Card detail page — full card info in one place
- Mobile-responsive UI — web-first, no native app needed
- Data freshness indicators — staleness is worse than absence for a trust-based tool

**Should have (competitive differentiators):**
- Arsenal builder — user's owned cards, enables all personalization
- Spending category inputs — monthly spend per category, enables optimizer
- Purchase router — "use this card for dining right now"
- Gap analysis — "your arsenal earns only 1x on groceries"
- Card add recommender — ranked by incremental value to your specific portfolio
- Points valuation model — dollar value of points with transparent assumptions
- Historical offer tracking — already in upstream API, easy win

**Defer (v2+):**
- Issuer velocity warnings (Chase 5/24, etc.) — requires separate rules engine
- Transfer partner display — new data source needed
- User-configurable CPP overrides — build default model first, validate need
- APR, credit score requirements — separate data concerns, not core optimizer

**Explicitly excluded (anti-features):**
- Bank/transaction import or Plaid integration
- Real-time approval odds or credit score simulation
- Affiliate links, social features, native mobile app, travel booking

### Architecture Approach

Five clean components with explicit boundaries: scraper writes to database, API reads from database, frontend reads from API, calculation engine lives in the API service layer (not the frontend). This keeps optimization logic testable, reusable across potential clients, and out of the browser. No microservices — the calculation engine is a service class inside Spring Boot, not a separate deployment. H2 for v1 with Flyway from day one ensures a clean PostgreSQL migration path when multi-user or cloud deployment is needed.

**Major components:**
1. Python Scraper — runs independently; scrapes issuer sites for earn rate data; failures isolated from API
2. Card Database (H2/PostgreSQL) — relational schema with separate earn_rates table; enables cross-card queries
3. Spring Boot REST API — serves card data + earn rates; hosts calculation engine; exposes OpenAPI spec
4. Calculation Engine (inside API) — portfolio analysis: routing, gap analysis, card recommendations
5. React SPA — UI only; no business logic; arsenal + spending persisted in localStorage (no auth in v1)

**New API endpoints needed:**
- `GET /api/cards/{id}/earn-rates`
- `GET /api/categories`
- `POST /api/optimize`
- `POST /api/recommend`

### Critical Pitfalls

1. **Scraper fragility** — design for failure from day one: staleness timestamps on all earn rate rows, manual override capability for admins, scraper success/failure monitoring. Start with Chase + Amex only, not all issuers.

2. **Category taxonomy as a data modeling landmine** — define the canonical category list BEFORE writing any scraper code. Store both raw issuer language and canonical mapping. This decision cannot be easily undone after data is loaded.

3. **Earn rates are conditional, not flat numbers** — a simple `{category: "dining", multiplier: 3}` model produces wrong recommendations. Model a `caveats` field from the start; flag conditional rates as "may vary" in the optimizer; never show a conditional rate without surfacing the condition.

4. **Two data sources will disagree** — existing upstream API (card identity, bonuses) and scraped earn rates must be reconciled via an explicit ID mapping layer, not name matching. Build this mapping table before any data merge.

5. **Scope creep from optimizer complexity** — the grid with raw multipliers is genuinely useful on its own. Resist adding APR, transfer partners, approval odds, or velocity rules until Phase 1-2 are validated with users.

---

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Data Foundation
**Rationale:** Everything downstream depends on earn rate data existing in a well-modeled schema. This phase is the entire critical path prerequisite. Getting the schema wrong here is the most expensive mistake possible.
**Delivers:** Earn rate data in relational DB, scraper for Chase + Amex, category taxonomy locked, data reconciliation layer for upstream API, new API endpoints for earn rates and categories
**Addresses:** Earn rates by category (table stakes), data freshness (table stakes)
**Avoids:** Category taxonomy landmine (Pitfall 2), conditional earn rates problem (Pitfall 3), two data sources disagreement (Pitfall 5), scraper fragility (Pitfall 1)
**Research flag:** Needs `/gsd:research-phase` — scraper approach for specific issuer sites (Chase, Amex) needs validation; which pages require Playwright vs. static HTTP is unknown until attempted

### Phase 2: Card Grid and Discovery UI
**Rationale:** Frontend can be built against seeded data in parallel with Phase 1. The grid is the core UI and the first thing users need to experience value. Delivers standalone utility even without personalization.
**Delivers:** React SPA scaffolding, TanStack Table earn rate grid, card search/filter, card detail pages, mobile-responsive layout, data freshness indicators in UI
**Uses:** React 19 + Vite + TypeScript, TanStack Table v8, TanStack Query v5, shadcn/ui + Tailwind, SpringDoc type bridge
**Implements:** Frontend component (React SPA), OpenAPI type generation pipeline
**Avoids:** Data staleness without visibility (Pitfall 7)
**Research flag:** Standard patterns — well-documented React + TanStack stack; skip `/gsd:research-phase`

### Phase 3: Arsenal and Purchase Routing
**Rationale:** First personalization layer. Depends on Phase 1 earn rates and Phase 2 grid. Delivers the "which card to use right now" value proposition that differentiates from static card databases.
**Delivers:** Arsenal builder (localStorage), spending category input UI, POST /api/optimize endpoint, purchase routing results view
**Uses:** Zustand (arsenal + spending state), nuqs (URL state for filters)
**Implements:** Calculation Engine (service layer in Spring Boot)
**Avoids:** Point valuation subjectivity (Pitfall 4) — show raw multipliers first, defer dollar values
**Research flag:** Optimization algorithm design may warrant `/gsd:research-phase` if ranking logic becomes complex

### Phase 4: Gap Analysis and Card Recommender
**Rationale:** Depends on Phase 3 arsenal and spending data. This is the highest-value feature for the target user (credit card enthusiast who wants to know what card to get next) and the hardest to copy.
**Delivers:** Gap analysis report, ranked card add recommendations, overlap visualizer
**Implements:** Extended calculation engine, POST /api/recommend endpoint
**Avoids:** Scope creep (Pitfall 6) — treat each new data requirement (transfer partners, velocity rules) as a separate future phase
**Research flag:** Standard algorithmic patterns; skip `/gsd:research-phase` unless user validation reveals unexpected complexity

### Phase Ordering Rationale

- Phase 1 must come first because earn rates are a hard prerequisite for all personalization features — this is the single critical path dependency the entire architecture research confirms
- Phases 1 and 2 can be partially parallelized: UI scaffolding and mock-data grid work can proceed while the scraper is being built
- Phase 3 groups together all features that require both earn rate data AND user state (arsenal + spending), which have no value independently
- Phase 4 is the optimizer layer and is the natural culmination — it requires all prior phases and delivers the product's most defensible value

### Research Flags

Phases needing deeper research during planning:
- **Phase 1:** Scraper implementation for Chase and Amex specifically — need to determine which pages require Playwright vs. plain HTTP, bot detection patterns, and DOM structure before writing production scrapers
- **Phase 1:** Data reconciliation strategy — the exact cardId matching approach between upstream API and scraped data needs design before implementation

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 2:** React + TanStack Table + shadcn/ui is a well-documented, widely-adopted 2025 pattern
- **Phase 3:** Spring Boot service layer + localStorage persistence are standard patterns
- **Phase 4:** Gap analysis and ranking algorithms are straightforward once data model is correct

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | React + TanStack + Spring Boot choices are well-validated; technology selection is low-risk |
| Features | HIGH | Competitive landscape clearly defines table stakes; dependency graph is unambiguous |
| Architecture | MEDIUM | Component boundaries are clear but open questions remain around issuer site behavior and earn rate edge cases |
| Pitfalls | MEDIUM | Based on general web scraping and data modeling knowledge; issuer-specific scraper behavior untested |

**Overall confidence:** MEDIUM-HIGH — stack and feature decisions are solid; main unknowns are in scraper implementation details that only become clear during Phase 1 execution.

### Gaps to Address

- **Issuer JS requirements:** Which issuer pages (Chase, Amex, Citi) require Playwright vs. plain HTTP is unknown — validate with a spike during Phase 1 planning before committing scraper architecture
- **Earn rate exception modeling:** The `caveats` text field approach is intentionally simplified; a structured `conditions` model (spending cap amount, portal requirement flag, rotation schedule) may be needed — decide before finalizing Phase 1 schema
- **Points valuation CPP table:** A fixed cents-per-point table needs to be sourced from a credible reference (e.g., The Points Guy, NerdWallet valuations) before implementing the optimizer — this is a content decision as much as a technical one
- **H2 → PostgreSQL trigger:** No users = H2 is fine; establish the specific trigger criteria (first deployment, first user account, concurrent scraper writes) to avoid premature migration

---

## Sources

### Primary (HIGH confidence)
- STACK.md research — React 19, TanStack v8, Spring Boot 3.4, Playwright stack selections
- FEATURES.md competitive analysis — NerdWallet, CardPointers, MaxRewards, MaxRewards feature landscape

### Secondary (MEDIUM confidence)
- ARCHITECTURE.md — component boundaries and data flow patterns; open questions noted
- PITFALLS.md — data modeling and scraper fragility patterns based on domain knowledge

### Tertiary (LOW confidence / needs validation)
- Issuer-specific scraper behavior — requires implementation spike to validate
- Earn rate exception edge cases — real-world card terms may require more complex data model than anticipated

---
*Research completed: 2026-03-11*
*Ready for roadmap: yes*
