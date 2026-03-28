import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatCategory, formatIssuer, CATEGORIES, rateColorClass, getTopRates } from '@/lib/constants'
import { SectionHeader } from '@/components/ui/section-header'
import type { CardGridItem } from '@/types/api'

interface WalletPanelProps {
  walletCards: CardGridItem[]
  onRemove: (cardId: string) => void
  onDrop: (cardId: string) => void
}

type ViewMode = 'carousel' | 'list' | 'grid'


function MiniCard({ card, isCenter }: { card: CardGridItem; isCenter?: boolean }) {
  const topRates = getTopRates(card.earnRates, 1)

  return (
    <div
      className={`w-full h-full rounded border relative overflow-hidden select-none
        ${isCenter
          ? 'bg-[oklch(98%_0.012_152)] border-primary/40 ring-1 ring-primary/15'
          : 'bg-card border-border'
        }`}
    >
      <div className="relative h-full px-3 pt-2.5 pb-2 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground leading-tight truncate">
            {formatIssuer(card.issuer)}
          </span>
          <span className={`text-[10px] tabular-nums flex-shrink-0 ${card.annualFee === 0 ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
            {card.annualFee === 0 ? 'No fee' : `$${card.annualFee}`}
          </span>
        </div>
        <p className="text-xs font-medium leading-snug text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          {card.name}
        </p>
        <div className="flex flex-wrap gap-1">
          {topRates.map(([cat, val]) => (
            <span key={cat} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm leading-none ${rateColorClass(val)}`}>
              {formatCategory(cat)} {val}×
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function IconCarousel() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="4" height="8" rx="0.8" fill="currentColor" opacity="0.4" transform="skewY(-8)" />
      <rect x="5" y="2" width="4" height="10" rx="0.8" fill="currentColor" />
      <rect x="9" y="3" width="4" height="8" rx="0.8" fill="currentColor" opacity="0.4" transform="skewY(8)" />
    </svg>
  )
}
function IconList() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="6" width="12" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="10" width="12" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}
function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
      <rect x="7.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
      <rect x="1" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
      <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
    </svg>
  )
}

export function WalletPanel({ walletCards, onRemove, onDrop }: WalletPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(() => {
    try { return Math.max(0, Number(localStorage.getItem('pocket_wallet_focused')) || 0) } catch { return 0 }
  })
  const [displayPosition, setDisplayPosition] = useState(() => {
    try { return Math.max(0, Number(localStorage.getItem('pocket_wallet_focused')) || 0) } catch { return 0 }
  })
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const v = localStorage.getItem('pocket_wallet_view') as ViewMode
      return v === 'carousel' || v === 'list' || v === 'grid' ? v : 'carousel'
    } catch { return 'carousel' }
  })
  const [containerWidth, setContainerWidth] = useState(256)

  const panelRef       = useRef<HTMLDivElement>(null)
  const positionRef    = useRef(focusedIndex)
  const cardCountRef   = useRef(walletCards.length)
  const slotXRef       = useRef(180)
  const lastFocusedRef = useRef(focusedIndex)
  const isDraggingRef  = useRef(false)

  cardCountRef.current = walletCards.length

  const cardWidth      = Math.max(72, Math.round(containerWidth * 0.68))
  const cardHeight     = cardWidth * (54 / 85.6)
  const carouselHeight = cardHeight + 20
  const SLOT_X         = containerWidth * 0.30
  slotXRef.current     = SLOT_X

  useEffect(() => {
    if (!panelRef.current) return
    const ro = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width))
    ro.observe(panelRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    localStorage.setItem('pocket_wallet_view', viewMode)
  }, [viewMode])

  useEffect(() => {
    localStorage.setItem('pocket_wallet_focused', String(focusedIndex))
  }, [focusedIndex])

  function clamp(pos: number) {
    return Math.max(0, Math.min(cardCountRef.current - 1, pos))
  }

  function syncFocused(pos: number) {
    const rounded = Math.round(clamp(pos))
    if (rounded !== lastFocusedRef.current) {
      lastFocusedRef.current = rounded
      setFocusedIndex(rounded)
    }
  }

  function snapTo(target: number) {
    const t = clamp(Math.round(target))
    positionRef.current = t
    lastFocusedRef.current = t
    setFocusedIndex(t)
    setDisplayPosition(t)
  }

  const navigate = useCallback((dir: 1 | -1) => {
    snapTo(Math.round(positionRef.current) + dir)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const bounded = clamp(focusedIndex)
    if (bounded !== focusedIndex || positionRef.current !== bounded) {
      positionRef.current = bounded
      setDisplayPosition(bounded)
      setFocusedIndex(bounded)
    }
  }, [walletCards.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function onCarouselMouseDown(e: React.MouseEvent) {
    e.preventDefault()

    const startX   = e.clientX
    const startPos = positionRef.current
    let   velPxPerFrame = 0
    let   lastX    = startX
    let   lastT    = performance.now()
    let   hasDragged = false

    document.body.style.cursor = 'grabbing'

    function onMove(ev: MouseEvent) {
      const now = performance.now()
      const dt  = now - lastT
      if (dt > 0) velPxPerFrame = (ev.clientX - lastX) / dt * 16.67
      lastX = ev.clientX
      lastT = now

      if (!hasDragged) {
        if (Math.abs(ev.clientX - startX) < 6) return
        hasDragged = true
        isDraggingRef.current = true
      }

      const newPos = clamp(startPos - (ev.clientX - startX) / slotXRef.current)
      positionRef.current = newPos
      syncFocused(newPos)
      setDisplayPosition(newPos)
    }

    function onUp() {
      isDraggingRef.current = false
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      const velPos = -velPxPerFrame / slotXRef.current
      snapTo(positionRef.current + velPos * 4)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  function getCardStyle(cardIndex: number): React.CSSProperties {
    const offset = cardIndex - displayPosition
    const abs    = Math.abs(offset)
    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: cardWidth,
      height: cardHeight,
      transform: `translateX(calc(-50% + ${offset * SLOT_X}px)) translateY(-50%) scale(${Math.max(0.88, 1 - abs * 0.07)})`,
      opacity: Math.max(0, 1 - abs * 0.65),
      zIndex: Math.round(20 - abs * 5),
      transition: isDraggingRef.current ? 'none' : 'transform 260ms cubic-bezier(0.25, 1, 0.5, 1), opacity 260ms ease-out',
      willChange: 'transform, opacity',
      cursor: 'grab',
      userSelect: 'none',
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const cardId = e.dataTransfer.getData('text/plain')
    if (cardId) onDrop(cardId)
  }

  const coverage = useMemo(() => {
    return CATEGORIES.map(cat => {
      let best: { card: CardGridItem; rate: number } | null = null
      for (const card of walletCards) {
        const rate = card.earnRates[cat]
        if (rate != null && (best === null || rate > best.rate)) best = { card, rate }
      }
      return { category: cat, best }
    })
  }, [walletCards])

  const focusedCard  = walletCards[focusedIndex] ?? null
  const coveredCount = coverage.filter(c => c.best !== null).length
  const totalFee     = walletCards.reduce((sum, c) => sum + c.annualFee, 0)
  const canGoLeft    = focusedIndex > 0
  const canGoRight   = focusedIndex < walletCards.length - 1

  const viewSwitcher = (
    <div className="flex items-center gap-0.5">
      {([
        { mode: 'carousel', Icon: IconCarousel, label: 'Carousel' },
        { mode: 'list',     Icon: IconList,     label: 'List'     },
        { mode: 'grid',     Icon: IconGrid,     label: 'Grid'     },
      ] as const).map(({ mode, Icon, label }) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          aria-label={label}
          className={`p-1 rounded transition-colors
            ${viewMode === mode ? 'text-primary' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
        >
          <Icon />
        </button>
      ))}
    </div>
  )

  return (
    <aside ref={panelRef} className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <SectionHeader title="Wallet" />
            {walletCards.length > 0 && (
              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                <span className="tabular-nums">${totalFee}/yr</span>
                <span className="text-border">·</span>
                <span>{coveredCount}/12 categories</span>
              </div>
            )}
          </div>
          {walletCards.length > 0 && (
            <div className="text-center leading-none">
              <span
                className="block tabular-nums font-bold text-foreground"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
              >
                {walletCards.length}
              </span>
              <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">
                {walletCards.length === 1 ? 'card' : 'cards'}
              </span>
            </div>
          )}
        </div>
      </div>

      {walletCards.length === 0 ? (

        /* ── Empty drop zone ── */
        <div
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`mx-3 mt-3 rounded border-2 border-dashed transition-all duration-150 py-10 flex-1
            ${isDragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
        >
          <p className="text-center text-xs text-muted-foreground/60 leading-relaxed px-4">
            Drag cards here<br />to build your wallet
          </p>
        </div>

      ) : viewMode === 'carousel' ? (

        /* ── Carousel view ── */
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onMouseDown={onCarouselMouseDown}
            className={`relative flex-shrink-0 transition-colors duration-150 ${isDragOver ? 'bg-primary/5' : ''}`}
            style={{
              height: carouselHeight,
              perspective: '900px',
              perspectiveOrigin: '50% 50%',
              overflow: 'hidden',
            }}
          >
            {walletCards.map((card, i) => {
              const offset = i - displayPosition
              if (Math.abs(offset) > 1.8) return null  // only render ±1 neighbors
              return (
                <div
                  key={card.cardId}
                  style={getCardStyle(i)}
                  onClick={() => {
                    const off = i - Math.round(positionRef.current)
                    if (off !== 0) snapTo(i)
                  }}
                >
                  <MiniCard card={card} isCenter={Math.abs(i - displayPosition) < 0.3} />
                </div>
              )
            })}

            {/* Left arrow */}
            <button
              onClick={() => navigate(-1)}
              disabled={!canGoLeft}
              aria-label="Previous card"
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-30
                w-7 h-7 flex items-center justify-center rounded-full
                bg-background/90 border border-border shadow-sm text-foreground
                transition-opacity duration-150 text-base leading-none
                ${canGoLeft ? 'opacity-100 hover:bg-secondary' : 'opacity-20 cursor-default'}`}
            >
              ‹
            </button>

            {/* Right arrow */}
            <button
              onClick={() => navigate(1)}
              disabled={!canGoRight}
              aria-label="Next card"
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-30
                w-7 h-7 flex items-center justify-center rounded-full
                bg-background/90 border border-border shadow-sm text-foreground
                transition-opacity duration-150 text-base leading-none
                ${canGoRight ? 'opacity-100 hover:bg-secondary' : 'opacity-20 cursor-default'}`}
            >
              ›
            </button>

            {isDragOver && (
              <div className="absolute inset-0 z-50 flex items-center justify-center">
                <p className="text-xs text-primary font-medium bg-background/80 px-3 py-1.5 rounded-full border border-primary/30">
                  Drop to add
                </p>
              </div>
            )}
          </div>

          {/* Controls: dots centered, view switcher right */}
          <div className="grid grid-cols-3 items-center px-3 py-1.5 flex-shrink-0">
            <div />
            <div className="flex items-center justify-center gap-1">
              {walletCards.length > 1 && walletCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => snapTo(i)}
                  className={`rounded-full transition-all duration-200
                    ${i === focusedIndex
                      ? 'w-4 h-1.5 bg-primary'
                      : 'w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                    }`}
                />
              ))}
            </div>
            <div className="flex justify-end">{viewSwitcher}</div>
          </div>

          {/* Focused card label + remove */}
          {focusedCard && (
            <div className="px-3 py-2 flex items-center justify-between flex-shrink-0 border-t border-border">
              <Link
                to={`/cards/${focusedCard.cardId}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate mr-2"
              >
                {focusedCard.name}
              </Link>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to={`/cards/${focusedCard.cardId}`}
                  className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  Details →
                </Link>
                <button
                  onClick={() => onRemove(focusedCard.cardId)}
                  className="text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Coverage */}
          <CoverageList coverage={coverage} coveredCount={coveredCount} focusedCard={focusedCard} />
        </>

      ) : viewMode === 'list' ? (

        /* ── List view ── */
        <>
          <div
            className="overflow-y-auto flex-shrink-0"
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="px-3 py-2 space-y-1">
              {walletCards.map(card => {
                const topRates = getTopRates(card.earnRates, 2)
                return (
                  <Link
                    key={card.cardId}
                    to={`/cards/${card.cardId}`}
                    className="flex items-center justify-between gap-2 px-2.5 py-2 rounded border border-border bg-card hover:bg-secondary transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground leading-none mb-1">
                        {formatIssuer(card.issuer)}
                      </p>
                      <p className="text-sm font-medium text-foreground truncate leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                        {card.name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {topRates.map(([cat, val]) => (
                          <span key={cat} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm leading-none ${rateColorClass(val)}`}>
                            {formatCategory(cat)} {val}×
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-xs tabular-nums ${card.annualFee === 0 ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
                        {card.annualFee === 0 ? 'No fee' : `$${card.annualFee}`}
                      </span>
                      <button
                        onClick={e => { e.preventDefault(); onRemove(card.cardId) }}
                        className="text-[10px] text-muted-foreground/50 hover:text-destructive transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-3 items-center px-3 py-1.5 flex-shrink-0 border-b border-border/40">
            <div /><div />
            <div className="flex justify-end">{viewSwitcher}</div>
          </div>
          <CoverageList coverage={coverage} coveredCount={coveredCount} focusedCard={null} />
        </>

      ) : (

        /* ── Grid view ── */
        <>
          <div
            className="overflow-y-auto flex-shrink-0"
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="px-3 py-2 grid grid-cols-2 gap-2">
              {walletCards.map(card => (
                <div key={card.cardId} className="relative group">
                  <div style={{ aspectRatio: '85.6 / 54' }}>
                    <MiniCard card={card} />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 rounded-b pt-4 pb-1.5 px-2
                    bg-gradient-to-t from-card via-card/90 to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-150
                    flex items-end justify-between gap-1"
                  >
                    <Link
                      to={`/cards/${card.cardId}`}
                      className="text-[10px] font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      Details →
                    </Link>
                    <button
                      onClick={() => onRemove(card.cardId)}
                      className="text-[10px] text-muted-foreground/60 hover:text-destructive transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 items-center px-3 py-1.5 flex-shrink-0 border-b border-border/40">
            <div /><div />
            <div className="flex justify-end">{viewSwitcher}</div>
          </div>
          <CoverageList coverage={coverage} coveredCount={coveredCount} focusedCard={null} />
        </>
      )}
    </aside>
  )
}

function CoverageList({
  coverage,
  coveredCount,
  focusedCard,
}: {
  coverage: { category: string; best: { card: CardGridItem; rate: number } | null }[]
  coveredCount: number
  focusedCard: CardGridItem | null
}) {
  const gaps = coverage.filter(c => c.best === null)
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-4 min-h-0">
      <p className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2 mt-3">
        Coverage
      </p>
      <div className="space-y-px">
        {coverage.filter(c => c.best !== null).map(({ category, best }) => {
          const wins = focusedCard != null && best?.card.cardId === focusedCard.cardId
          return (
            <div
              key={category}
              className={`px-2 py-1.5 rounded-sm transition-colors ${wins ? 'bg-primary/10' : 'hover:bg-secondary'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm truncate ${wins ? 'text-foreground font-medium' : 'text-foreground/80'}`}>
                  {formatCategory(category)}
                </span>
                <span className={`text-xs font-semibold px-1.5 py-1 rounded-sm leading-none flex-shrink-0 ${rateColorClass(best!.rate)}`}>
                  {best!.rate}×
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground/60 truncate block mt-0.5">
                {best!.card.name}
              </span>
            </div>
          )
        })}
      </div>
      {coveredCount < 12 && gaps.length > 0 && (
        <div className="space-y-px mt-px">
          {gaps.map(({ category }) => (
            <div key={category} className="px-2 py-1.5 rounded-sm opacity-40">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-foreground/80 truncate">{formatCategory(category)}</span>
                <span className="text-xs font-semibold px-1.5 py-1 rounded-sm leading-none flex-shrink-0 bg-stone-100 text-stone-400">
                  —
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground/60 block mt-0.5">No card</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
