# Pitfalls Research: Credit Card Optimization Tool

**Domain:** Credit card portfolio optimization
**Researched:** 2026-03-11
**Confidence:** MEDIUM

---

## Pitfall 1: Scraper Fragility

**Risk:** HIGH — the entire product depends on scraped earn rate data

Issuer websites break scrapers regularly. Chase, Amex, and Citi update their pages, add bot detection, and restructure their DOM without warning. A broken scraper means stale data, which means wrong recommendations — the worst possible outcome for a trust-based tool.

**Warning signs:**
- Earn rates stop updating
- Scraper returns empty results without errors
- Cloudflare or CAPTCHA blocks appearing

**Prevention:**
- Design for failure from day one: staleness timestamps on all earn rate records
- Surface data age to users ("earn rates last verified: 3 days ago")
- Build manual override capability — admin can correct a card's earn rate without re-scraping
- Monitor scraper runs with success/failure logging; alert on consecutive failures
- Start with 1-2 issuers (Chase + Amex), not all — validate the scraper approach before scaling
- Use Playwright for JS-rendered pages; have a fallback path for when pages change

**Phase:** Data pipeline (Phase 1)

---

## Pitfall 2: Category Taxonomy as a Data Modeling Landmine

**Risk:** HIGH — every issuer defines categories differently

Chase calls it "Dining." Amex calls it "U.S. Restaurants." Citi uses "Restaurants." If you map these to a single canonical category inconsistently, your recommendations will be wrong and debugging will be a nightmare.

**Warning signs:**
- Earn rate queries returning unexpected results
- Users reporting "the wrong card was recommended for dining"
- Multiple rows for the same real-world category

**Prevention:**
- Define the canonical category taxonomy BEFORE writing the scraper
- Store both raw issuer language AND canonical mapping in the DB:
  ```sql
  issuer_category VARCHAR,   -- "U.S. Supermarkets" (what Amex says)
  canonical_category VARCHAR, -- "groceries" (our taxonomy)
  ```
- Include caveats field for restrictions ("at U.S. supermarkets only", "first $6,000/year")
- Document the mapping table as a first-class artifact

**Phase:** Database schema (Phase 1)

---

## Pitfall 3: Earn Rates Are Conditional, Not Flat Numbers

**Risk:** HIGH — a simple `{category: "dining", multiplier: 3}` model will produce wrong recommendations

Real earn rates have conditions: spending caps ("3x on first $6,000/year then 1x"), portal requirements ("5x on travel booked through Chase portal"), rotating categories (Discover/Freedom), and geographic restrictions ("at U.S. gas stations only").

**Warning signs:**
- Users disputing recommendations ("that card doesn't actually give 5x unless you book through their portal")
- No way to represent the Chase Freedom's quarterly rotation

**Prevention:**
- Model conditions structurally from the start — add a `conditions` or `caveats` text field at minimum
- For v1, it's acceptable to store the "headline" rate with a caveats note
- For the optimizer, flag conditional rates as "may vary" rather than treating them as guaranteed
- Never present a conditional rate without surfacing the condition to the user

**Phase:** Database schema (Phase 1)

---

## Pitfall 4: Point Valuation Subjectivity

**Risk:** MEDIUM — comparing cards across currencies (UR vs MR vs cash back) requires a valuation model

Chase Ultimate Rewards at 1.5¢/pt is very different from Amex Membership Rewards at 2.0¢/pt (if you use Amex transfer partners well) or 0.6¢/pt (if you redeem for Amazon purchases). There is no single right answer.

**Warning signs:**
- Users disagreeing with recommendations because they value their points differently
- The optimizer silently treating 1 Amex MR = 1 Chase UR

**Prevention:**
- Use cash-equivalent defaults (conservative: 1¢/pt for most currencies)
- Surface the valuation assumption to users ("based on 1.5¢ per Chase UR")
- Plan for user-configurable CPP overrides in a later phase
- For v1 grid view, show raw multipliers (3x, 2x) NOT dollar values — defer valuation to the optimizer phase

**Phase:** Optimizer (Phase 3+)

---

## Pitfall 5: Two Data Sources Will Disagree

**Risk:** HIGH — existing upstream JSON + scraped earn rates must be merged

The existing `andenacitelli/credit-card-bonuses-api` provides card identity (cardId, name, issuer) and bonuses. The scraper will provide earn rates. These must be linked, but card names won't match exactly, IDs won't overlap, and the same card may appear differently in both sources.

**Warning signs:**
- Scraped earn rates can't be matched to cards in the existing API
- Duplicate cards appearing with different IDs
- Recommendations failing because earn rate rows have no matching card

**Prevention:**
- Build a card identity mapping layer before merging data sources
- Use the existing cardId as the canonical key; create a mapping table from scraped identifiers to cardIds
- Write a reconciliation script early (list unmatched scraped cards) to catch gaps
- Never assume name matching works — always use explicit ID mapping

**Phase:** Data pipeline (Phase 1)

---

## Pitfall 6: Scope Creep from Optimizer Complexity

**Risk:** MEDIUM — the optimization problem is deeper than it looks

Once the grid exists, there's always "one more thing": points transfer partners, travel portal multipliers, limited-time offers, business card vs. personal interaction, credit score requirements, approval odds, velocity rules (Chase 5/24)... Each addition multiplies data requirements and complexity.

**Warning signs:**
- Adding scraper targets for every new data point
- "Just one more field" in the earn rate schema
- Phase 1 scope expanding to cover the optimizer

**Prevention:**
- Stick to the phased plan: grid first, arsenal second, optimizer third
- Treat each new data requirement (APR, credit score, transfer partners) as its own phase
- The grid with raw multipliers is genuinely useful without any of the optimizer features
- Resist the urge to build the full product before validating the core value

**Phase:** All phases — ongoing discipline

---

## Pitfall 7: Data Staleness Without Visibility

**Risk:** MEDIUM — stale earn rates are worse than no earn rates (confident wrong advice)

Card terms change. The Freedom Flex's 5x categories rotate quarterly. Amex changes the Gold card's dining credit periodically. If the tool shows outdated earn rates without any indication of staleness, users make decisions based on wrong information.

**Warning signs:**
- Scraper is running but no one is checking if data actually changed
- Earn rates from 6 months ago treated as current

**Prevention:**
- Store `last_verified_at` on every earn rate row
- Show staleness badge in the UI when data is >30 days old
- Build scraper monitoring before scaling to many issuers

**Phase:** Data pipeline (Phase 1)