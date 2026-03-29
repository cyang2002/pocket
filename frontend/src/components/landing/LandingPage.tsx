import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, formatCategory } from '@/lib/constants'
import { useCardGrid } from '@/hooks/useCardGrid'
import { SwipeCard, CARD_H } from './SwipeCard'
import type { CardGridItem } from '@/types/api'

const SHOW_H = Math.round(CARD_H * 0.68)

const CHALLENGE_CATS = CATEGORIES.filter(c => c !== 'other' && c !== 'business')

function buildChallenges(cards: CardGridItem[]) {
  const best: { cat: string; rate: number; card: string }[] = []
  for (const cat of CHALLENGE_CATS) {
    let top = 0, topName = ''
    for (const c of cards) {
      const r = c.earnRates[cat]
      if (r != null && r > top) { top = r; topName = c.name }
    }
    if (top > 1) best.push({ cat, rate: top, card: topName })
  }
  return best.sort((a, b) => b.rate - a.rate)
}

function useFlipDisplay(cards: CardGridItem[] | undefined) {
  const challenges = useMemo(
    () => cards?.length ? buildChallenges(cards) : [],
    [cards]
  )
  const [idx, setIdx] = useState(0)
  const [flipping, setFlipping] = useState(false)

  useEffect(() => {
    if (challenges.length < 2) return
    const timer = setInterval(() => {
      setFlipping(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % challenges.length)
        setFlipping(false)
      }, 350)
    }, 4500)
    return () => clearInterval(timer)
  }, [challenges.length])

  return {
    challenge: challenges[idx % Math.max(1, challenges.length)] ?? null,
    flipping,
  }
}

export function LandingPage() {
  const { data } = useCardGrid({})
  const [dragX, setDragX] = useState(0)
  const { challenge, flipping } = useFlipDisplay(data)
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
          Every swipe,<br />maximized.
        </h1>
        <div className="mt-5" style={{ perspective: 600, minHeight: '1.5rem' }}>
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            style={{
              transform: flipping ? 'rotateX(90deg)' : 'rotateX(0deg)',
              opacity: flipping ? 0 : 1,
              transition: 'transform 350ms cubic-bezier(0.25, 1, 0.5, 1), opacity 250ms ease-out',
              transformOrigin: 'center bottom',
            }}
          >
            {challenge && (
              <>
                <span className="text-foreground font-medium">{formatCategory(challenge.cat)}</span>
                <span className="text-border select-none">·</span>
                <span>
                  <span className="text-foreground font-semibold tabular-nums">{challenge.rate}×</span>
                  {' or 1×—do you know which card to reach for?'}
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="relative overflow-hidden" style={{ height: SHOW_H }}>
        <style>{`
          @keyframes swipe-dot-flow {
            from { stroke-dashoffset: 14; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes swipe-fade {
            0%, 100% { opacity: 0.92; }
            50%       { opacity: 0.3; }
          }
          @keyframes reader-led {
            0%, 100% { opacity: 0.45; }
            50%      { opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            .swipe-arrow-line { animation: none !important; }
            .swipe-arrow-svg  { animation: none !important; opacity: 0.85 !important; }
            .reader-led       { animation: none !important; opacity: 0.8 !important; }
          }
        `}</style>

        <div className="absolute top-0 px-8 sm:px-16" style={{ zIndex: 1 }}>
          <SwipeCard card={featuredCard} showHint={false} onDrag={setDragX} />
        </div>

        <div
          className="absolute pointer-events-none left-[288px] sm:left-[360px] md:left-[392px]"
          style={{ top: Math.round(SHOW_H / 2) - 20, zIndex: 20 }}
        >
          <svg
            width="140" height="40" viewBox="0 0 140 40" fill="none"
            className="swipe-arrow-svg"
            style={
              dragX > 0
                ? { opacity: Math.max(0, 1 - dragX / 100), transition: 'opacity 60ms linear' }
                : { animation: 'swipe-fade 2.6s ease-in-out infinite' }
            }
          >
            <path
              d="M8 20 L106 20"
              stroke="var(--lp-arrow-stroke)"
              strokeWidth="4"
              strokeDasharray="1 13"
              strokeLinecap="round"
              className="swipe-arrow-line"
              style={{ animation: 'swipe-dot-flow 1.8s linear infinite' }}
            />
            <polyline
              points="114,7 135,20 114,33"
              stroke="var(--lp-arrow-stroke)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{ height: 32, zIndex: 10, background: 'linear-gradient(to bottom, transparent, oklch(0% 0 0 / 0.07))' }}
        />
      </div>

      <div style={{ background: 'var(--lp-housing-bg)', boxShadow: 'inset 0 1px 0 oklch(100% 0 0 / 0.5)' }}>
        <div style={{
          height: 4,
          background: 'var(--lp-slot-groove)',
          boxShadow: 'inset 0 2px 4px oklch(0% 0 0 / 0.25), 0 1px 0 oklch(100% 0 0 / 0.55)',
        }} />

        <div className="px-8 sm:px-16 pt-4 pb-10 flex items-center gap-3">
          <div
            className="reader-led"
            style={{
              width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
              background: 'var(--lp-led)',
              boxShadow: '0 0 6px var(--lp-led-glow)',
              animation: 'reader-led 3s ease-in-out infinite',
            }}
          />
          <span className="text-xs text-muted-foreground/80">swipe to browse</span>
          <span className="text-border select-none">·</span>
          <Link
            to="/browse"
            className="text-xs text-muted-foreground/75 hover:text-muted-foreground transition-colors underline underline-offset-2 py-2 -my-2"
          >
            browse all cards
          </Link>

          <svg
            className="ml-auto flex-shrink-0"
            width="32" height="22" viewBox="0 0 32 22" fill="none"
            style={{ opacity: 0.18 }}
          >
            <rect x="1" y="4" width="18" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <rect x="3.5" y="7.5" width="5" height="3.5" rx="0.5" stroke="currentColor" strokeWidth="0.8" />
            <polyline points="24,7 28,11 24,15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="pt-10 pb-8 flex justify-center">
        <p
          className="text-[clamp(0.95rem,1.8vw,1.15rem)] text-muted-foreground/80 text-center"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {cardCount != null && (
            <>
              <span className="text-foreground font-semibold tabular-nums">{cardCount}</span>
              {' cards tracked'}
              <span className="text-border select-none mx-2">·</span>
            </>
          )}
          <span className="text-foreground font-semibold tabular-nums">{CATEGORIES.length}</span>
          {' spend categories'}
        </p>
      </div>

    </div>
  )
}
