import { Link } from 'react-router-dom'
import { CATEGORIES } from '@/lib/constants'
import { useCardGrid } from '@/hooks/useCardGrid'
import { SwipeCard, CARD_H } from './SwipeCard'

const SHOW_H    = Math.round(CARD_H * 0.65)  // ~131px — card fades out gently below this
const SECTION_H = SHOW_H

export function LandingPage() {
  const { data } = useCardGrid({})
  const cardCount = data?.length

  const featuredCard = data?.find(
    c => !c.isBusiness && Object.values(c.earnRates).some(v => v != null && v > 1)
  ) ?? data?.[0] ?? null

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center overflow-x-hidden">

      <section className="px-8 sm:px-16 pb-12">
        <h1
          className="text-[clamp(2.8rem,6vw,4.8rem)] font-normal leading-[1.08] tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Know which card<br />to reach for.
        </h1>
        <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
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
      </section>

      {/* Card swipe — top portion of card visible, reader housing covers the rest */}
      <div className="relative overflow-hidden" style={{ height: SECTION_H }}>

        {/* Card */}
        <div className="absolute top-0 px-8 sm:px-16" style={{ zIndex: 1 }}>
          <SwipeCard card={featuredCard} showHint={false} />
        </div>

        {/* Gradient fade — card dissolves into the page */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: 80,
            zIndex: 10,
            background: 'linear-gradient(to bottom, transparent 0%, oklch(98.5% 0.006 75) 85%)',
          }}
        />

      </div>

      {/* Hint + fallback link */}
      <div className="px-8 sm:px-16 pt-4 pb-10 flex items-center justify-between">
        <span className="text-xs text-muted-foreground/40">drag right to browse →</span>
        <Link
          to="/browse"
          className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors underline underline-offset-2"
        >
          or browse directly
        </Link>
      </div>

    </div>
  )
}
