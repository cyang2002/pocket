import { Link } from 'react-router-dom'
import { CATEGORIES, formatCategory } from '@/lib/constants'
import { useCardGrid } from '@/hooks/useCardGrid'
import { SwipeCard } from './SwipeCard'

export function LandingPage() {
  const { data } = useCardGrid({})
  const cardCount = data?.length

  // Pick a featured card: non-business, with at least one earn rate > 1
  const featuredCard = data?.find(
    c => !c.isBusiness && Object.values(c.earnRates).some(v => v != null && v > 1)
  ) ?? data?.[0] ?? null

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center px-8 sm:px-16 pt-20 pb-16">
        <div className="max-w-4xl mx-auto w-full flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-20">

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-10">
              Credit Card Earn Rates
            </p>
            <h1
              className="text-[clamp(2.8rem,6vw,4.8rem)] font-normal leading-[1.08] tracking-tight text-foreground max-w-xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Know which card<br />to reach for.
            </h1>
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              {cardCount != null && (
                <>
                  <span>
                    <span className="text-foreground font-semibold tabular-nums">{cardCount}</span>
                    {' '}cards tracked
                  </span>
                  <span className="text-border select-none">·</span>
                </>
              )}
              <span>
                <span className="text-foreground font-semibold tabular-nums">{CATEGORIES.length}</span>
                {' '}spend categories
              </span>
            </div>
          </div>

          {/* Swipeable card */}
          <div className="flex-shrink-0 flex flex-col items-start">
            <SwipeCard card={featuredCard} />
            <Link
              to="/browse"
              className="mt-4 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2"
            >
              or browse directly
            </Link>
          </div>

        </div>
      </section>

      {/* Category chips */}
      <section className="border-t border-border px-8 sm:px-16 py-12">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-5">
          Tracked categories
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <span
              key={cat}
              className="text-xs font-medium px-3 py-1.5 rounded border border-border text-muted-foreground"
            >
              {formatCategory(cat)}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
