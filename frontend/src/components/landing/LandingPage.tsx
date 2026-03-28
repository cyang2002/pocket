import { Link } from 'react-router-dom'
import { CATEGORIES, formatCategory } from '@/lib/constants'
import { useCardGrid } from '@/hooks/useCardGrid'

export function LandingPage() {
  const { data } = useCardGrid({})
  const cardCount = data?.length

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero — left-aligned editorial layout */}
      <section className="flex-1 flex flex-col justify-center px-8 sm:px-16 pt-20 pb-16">
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
        <div className="mt-10">
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded text-sm font-semibold transition-colors"
          >
            Browse Cards
            <span aria-hidden className="opacity-70">→</span>
          </Link>
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
