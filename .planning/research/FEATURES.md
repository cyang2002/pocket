# Feature Research: Credit Card Optimization Tool

**Domain:** Credit card portfolio optimization
**Researched:** 2026-03-11
**Confidence:** HIGH (strong competitive landscape data)

---

## Table Stakes

Features users expect. Absence causes abandonment.

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| Card database | Comprehensive, searchable card catalog (personal + business) | Medium | Data pipeline |
| Earn rates by category | 3x dining, 2x travel, etc. per card | High | Scraper |
| Category earn rate grid | Cross-card view: cards vs. spending categories | Medium | Earn rates |
| Card search/filter | By issuer, network, card type, fee | Low | Card database |
| Annual fee display | Clear fee visibility with waiver info | Low | Data source |
| Sign-up bonus display | Current offers, historical offers | Low | Existing API |
| Card detail page | Full card info in one place | Low | Card database |
| Mobile-responsive UI | Works on phone without a native app | Medium | Frontend |
| Data freshness | Cards update when terms change | High | Scraper pipeline |
| Basic card comparison | Side-by-side 2-3 cards | Medium | Earn rates |

---

## Differentiators

Features that create competitive advantage.

| Feature | Value Proposition | Complexity | Notes |
|---------|------------------|------------|-------|
| Arsenal builder | User selects their owned cards | Low | Core personalization |
| Spending category inputs | Monthly spend sliders per category | Low | Enables optimizer |
| Purchase router | "Use Chase Sapphire for this $150 dinner" | Medium | Depends on arsenal + earn rates |
| Gap analysis | "Your arsenal earns only 1x on groceries" | Medium | Depends on arsenal + spending |
| Card add recommender | Ranked cards by incremental value to your profile | High | Depends on gap analysis |
| Overlap visualizer | Show redundant benefits across owned cards | Medium | Depends on arsenal |
| Points valuation | Dollar value of points (e.g., Chase UR = 1.5¢/pt) | Medium | Subjective; need to pick a model |
| Business vs. personal toggle | Separate views or combined | Low | Existing API has isBusiness flag |
| Historical offer tracking | "Best sign-up bonus ever for this card" | Low | Existing API has historicalOffers |
| Issuer velocity warnings | "Chase 5/24 rule applies to this card" | High | Requires rules engine |
| Partner transfer display | "Chase UR transfers to Hyatt at 1:1" | Medium | New data source needed |

---

## Anti-Features

Deliberately exclude these in v1.

| Feature | Reason to Exclude |
|---------|-------------------|
| Bank/transaction import | High complexity, privacy concerns, not needed for v1 spending inputs |
| Account linking (Plaid) | Overkill for category-based optimization |
| Real-time approval odds | Requires bureau data, major compliance exposure |
| Credit score simulator | Same — bureau data territory |
| Affiliate link monetization | Changes editorial incentives, complicates recommendations |
| Social/sharing features | Distraction from core utility |
| Native mobile app | Web-first; responsive web covers the need |
| Full travel booking | Out of scope — optimization tool, not booking engine |
| Automated card applications | Legal/compliance risk |

---

## Dependency Graph

Critical path (each depends on prior):

```
Scraper → Earn Rate Data → Earn Rate Grid → Arsenal Builder → Spending Inputs → Purchase Router
                                                                    ↓
                                                             Gap Analysis → Card Add Recommender
```

**Parallel track** (can build with mock data):
- Card database, search, filter, detail page
- UI framework, design system

---

## MVP Phasing Recommendation

**Phase 1 — Foundation:** Card database + earn rate grid (no personalization)
- Value: "I can see all cards and their earn rates"
- Prerequisite for everything else

**Phase 2 — Arsenal:** Arsenal builder + spending inputs + purchase router
- Value: "I know which card to use right now"
- Depends on Phase 1 earn rates

**Phase 3 — Optimizer:** Gap analysis + card add recommender
- Value: "I know which card to get next"
- Depends on Phase 2 arsenal + spending data

---

## Competitive Landscape

| Tool | Strength | Weakness |
|------|----------|----------|
| NerdWallet | Huge card database | Affiliate-driven; no personalized routing |
| CardPointers | Great purchase router | Requires manual data updates, Apple-only |
| MaxRewards | Good daily optimizer | Subscription, limited card coverage |
| AwardWallet | Great balance tracking | Not optimization-focused |
| Churning spreadsheets | Fully custom | Manual, no UI, high effort |

**Opportunity:** A free, web-based tool with actual earn rate data and a personalized optimizer hits a gap in the market.