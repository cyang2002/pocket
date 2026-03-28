import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '@/lib/constants'
import { useCardGrid } from '@/hooks/useCardGrid'
import { SwipeCard, CARD_H, CARD_W } from './SwipeCard'

const SHOW_H    = Math.round(CARD_H * 0.68)  // ~137px — card enters terminal below this
const SECTION_H = SHOW_H

export function LandingPage() {
  const { data } = useCardGrid({})
  const [dragX, setDragX] = useState(0)
  const cardCount = data?.length

  const featuredCard = data?.find(
    c => !c.isBusiness && Object.values(c.earnRates).some(v => v != null && v > 1)
  ) ?? data?.[0] ?? null

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col overflow-x-hidden pt-[clamp(4rem,14vh,8rem)]">

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

      {/* Card — clipped at slot entry point */}
      <div className="relative overflow-hidden" style={{ height: SECTION_H }}>
        <style>{`
          @keyframes swipe-dot-flow {
            from { stroke-dashoffset: 14; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes swipe-fade {
            0%, 100% { opacity: 0.92; }
            50%       { opacity: 0.3; }
          }
          @media (prefers-reduced-motion: reduce) {
            .swipe-arrow-line { animation: none !important; }
            .swipe-arrow-svg  { animation: none !important; opacity: 0.85 !important; }
          }
        `}</style>

        <div className="absolute top-0 px-8 sm:px-16" style={{ zIndex: 1 }}>
          <SwipeCard card={featuredCard} showHint={false} onDrag={setDragX} />
        </div>

        {/* Swipe arrow — sits just outside the card's right edge, user drags card toward it */}
        <div
          className="absolute pointer-events-none left-[360px] sm:left-[392px]"
          style={{ top: Math.round(SHOW_H / 2) - 20, zIndex: 20 }}
        >
          <svg
            width="140"
            height="40"
            viewBox="0 0 140 40"
            fill="none"
            className="swipe-arrow-svg"
            style={
              dragX > 0
                ? { opacity: Math.max(0, 1 - dragX / 100), transition: 'opacity 60ms linear' }
                : { animation: 'swipe-fade 2.6s ease-in-out infinite' }
            }
          >
            {/* Round dot tail */}
            <path
              d="M8 20 L106 20"
              stroke="oklch(30% 0.04 240)"
              strokeWidth="4"
              strokeDasharray="1 13"
              strokeLinecap="round"
              className="swipe-arrow-line"
              style={{ animation: 'swipe-dot-flow 1.8s linear infinite' }}
            />
            {/* Arrowhead at tip — rightmost, always visible */}
            <polyline
              points="114,7 135,20 114,33"
              stroke="oklch(30% 0.04 240)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Slot-entry shadow — depth where card enters the terminal */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: 28,
            zIndex: 10,
            background: 'linear-gradient(to bottom, transparent, oklch(0% 0 0 / 0.06))',
          }}
        />
      </div>

      {/* Terminal face — where the card enters */}
      <div
        className="px-8 sm:px-16 pt-4 pb-10 flex items-center gap-3"
        style={{
          borderTop: '1.5px solid oklch(84% 0.012 75)',
          background: 'oklch(96.5% 0.007 75)',
          boxShadow: 'inset 0 6px 20px oklch(0% 0 0 / 0.035)',
        }}
      >
        <span className="text-xs text-muted-foreground/70">drag right to browse →</span>
        <span className="text-border select-none">·</span>
        <Link
          to="/browse"
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-2"
        >
          or browse directly
        </Link>
      </div>

    </div>
  )
}
