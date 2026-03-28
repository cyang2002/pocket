import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatIssuer, formatCategory, rateColorClass, getTopRates } from '@/lib/constants'
import type { CardGridItem } from '@/types/api'

const CARD_W   = 288
const CARD_H   = Math.round(CARD_W * 54 / 85.6) // credit card aspect ratio ~182px
const FLICK_VX = 0.52   // px/ms — velocity threshold for a flick
const DIST_PCT = 0.42   // fraction of CARD_W for position-based trigger

function springStep(pos: number, vel: number, target: number) {
  const k = 0.13, d = 0.76
  const a = (target - pos) * k - vel * d
  return { pos: pos + vel, vel: vel + a }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function SwipeCard({ card }: { card?: CardGridItem | null }) {
  const navigate = useNavigate()
  const cardRef  = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const rafRef   = useRef<number>()
  const done     = useRef(false)

  const [x,     setX]     = useState(0)
  const [tiltX, setTiltX] = useState(0)
  const [tiltY, setTiltY] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'snapping' | 'flying'>('idle')

  const sPos       = useRef(0)
  const sVel       = useRef(0)
  const originX    = useRef(0)
  const originCX   = useRef(0)
  const velBuf     = useRef<{ x: number; t: number }[]>([])

  function stop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }

  function getVx(): number {
    const b = velBuf.current
    if (b.length < 2) return 0
    const dx = b[b.length - 1].x - b[0].x
    const dt = b[b.length - 1].t - b[0].t
    return dt > 0 ? dx / dt : 0
  }

  function flyOff(curX: number, vx: number) {
    if (done.current) return
    done.current = true
    setPhase('flying')

    if (prefersReducedMotion()) {
      navigate('/browse')
      return
    }

    const el = cardRef.current
    if (!el) { navigate('/browse'); return }

    const speed = Math.max(Math.abs(vx), FLICK_VX)
    const dur   = Math.round(Math.max(190, Math.min(380, 280 / (speed / FLICK_VX))))
    const flyTo = window.innerWidth * 1.18
    const rot   = Math.min(14, 6 + speed * 4)

    el.animate(
      [
        { transform: `translateX(${curX}px) rotateZ(${curX * 0.018}deg)` },
        { transform: `translateX(${flyTo}px) rotateZ(${rot}deg)` },
      ],
      { duration: dur, easing: 'cubic-bezier(0.2, 0.0, 0.38, 1.0)', fill: 'forwards' }
    )

    setTimeout(() => navigate('/browse'), dur - 20)
  }

  function snapBack(fromX: number) {
    stop()
    sPos.current = fromX
    sVel.current = 0
    setPhase('snapping')

    function tick() {
      const s = springStep(sPos.current, sVel.current, 0)
      sPos.current = s.pos
      sVel.current = s.vel
      setX(s.pos)
      if (Math.abs(s.pos) > 0.35 || Math.abs(s.vel) > 0.07) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setX(0)
        sPos.current = 0
        setPhase('idle')
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function onPointerDown(e: React.PointerEvent) {
    if (phase === 'flying') return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    stop()
    originX.current  = x
    originCX.current = e.clientX
    velBuf.current   = [{ x: e.clientX, t: performance.now() }]
    setPhase('dragging')
    setTiltX(0)
    setTiltY(0)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (phase === 'dragging') {
      const raw  = e.clientX - originCX.current
      // Resistance for leftward drag — rubber-band feel
      const newX = raw < 0
        ? originX.current + raw * 0.1
        : originX.current + raw
      setX(newX)

      const now = performance.now()
      velBuf.current.push({ x: e.clientX, t: now })
      velBuf.current = velBuf.current.filter(p => now - p.t < 130)
    } else if (phase === 'idle' && cardRef.current) {
      const r  = cardRef.current.getBoundingClientRect()
      const nx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2)
      const ny = (e.clientY - r.top   - r.height / 2) / (r.height / 2)
      setTiltY(nx *  8)
      setTiltX(ny * -5)
    }
  }

  function onPointerUp() {
    if (phase !== 'dragging') return
    const vx = getVx()
    if (vx > FLICK_VX || x > CARD_W * DIST_PCT) {
      flyOff(x, vx)
    } else {
      snapBack(x)
    }
  }

  function onPointerLeave() {
    if (phase === 'idle') { setTiltX(0); setTiltY(0) }
  }

  // Subtle nudge animation on the arrow when idle
  useEffect(() => {
    const el = arrowRef.current
    if (!el || phase !== 'idle') return
    if (prefersReducedMotion()) return

    const anim = el.animate(
      [
        { transform: 'translateX(0px)', opacity: '0.45' },
        { transform: 'translateX(5px)', opacity: '0.75' },
        { transform: 'translateX(0px)', opacity: '0.45' },
      ],
      { duration: 1900, iterations: Infinity, easing: 'ease-in-out', delay: 800 }
    )
    return () => anim.cancel()
  }, [phase])

  useEffect(() => () => stop(), [])

  const isDrag    = phase === 'dragging'
  const isFlying  = phase === 'flying'
  const progress  = isDrag ? Math.min(1, Math.max(0, x / (CARD_W * DIST_PCT))) : 0

  const transform = isFlying ? undefined : [
    `translateX(${x}px)`,
    isDrag
      ? `rotateZ(${Math.min(8, Math.max(-2, x * 0.018))}deg)`
      : `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
  ].join(' ')

  const topRates = card ? getTopRates(card.earnRates, 2) : []

  return (
    <div className="select-none" style={{ touchAction: 'none' }}>
      <div style={{ perspective: '700px' }}>
        <div
          ref={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          style={{
            width: CARD_W,
            height: CARD_H,
            transform,
            transition: isDrag || phase === 'snapping' || isFlying
              ? 'none'
              : 'transform 220ms ease-out',
            cursor: isFlying ? 'default' : isDrag ? 'grabbing' : 'grab',
            pointerEvents: isFlying ? 'none' : undefined,
            willChange: 'transform',
          }}
          className="rounded-xl border border-border bg-card shadow-[0_8px_36px_oklch(0%_0_0/0.07)] overflow-hidden"
        >
          <div className="h-full px-5 pt-4 pb-3 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground leading-tight truncate">
                {card ? formatIssuer(card.issuer) : 'Chase'}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground flex-shrink-0">
                {card
                  ? card.annualFee === 0 ? 'No fee' : `$${card.annualFee}/yr`
                  : 'No fee'}
              </span>
            </div>
            <p
              className="flex-1 text-[1.05rem] font-medium text-foreground flex items-center leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {card?.name ?? 'Freedom Flex'}
            </p>
            {topRates.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topRates.map(([cat, val]) => (
                  <span
                    key={cat}
                    className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-sm leading-none ${rateColorClass(val)}`}
                  >
                    {formatCategory(cat)}&nbsp;{val}×
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swipe hint */}
      <div
        className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"
        style={{
          opacity: isDrag ? 0.35 + progress * 0.65 : 0.55,
          transition: isDrag ? 'none' : 'opacity 400ms',
        }}
      >
        <span>{isDrag && progress > 0.7 ? 'release to browse' : 'swipe to browse'}</span>
        <span
          ref={arrowRef}
          style={{
            display: 'inline-block',
            transform: isDrag ? `translateX(${progress * 14}px)` : undefined,
            transition: isDrag ? 'none' : undefined,
          }}
        >
          →
        </span>
      </div>
    </div>
  )
}
