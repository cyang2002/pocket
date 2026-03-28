import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatIssuer, formatCategory, getTopRates } from '@/lib/constants'
import type { CardGridItem } from '@/types/api'

export const CARD_W = 320
export const CARD_H = Math.round(CARD_W * 54 / 85.6) // credit card aspect ratio ~202px

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

interface SwipeCardProps {
  card?: CardGridItem | null
  showHint?: boolean
  onDrag?: (x: number) => void
}

export function SwipeCard({ card, showHint = true, onDrag }: SwipeCardProps) {
  const navigate = useNavigate()
  const cardRef  = useRef<HTMLDivElement>(null)
  const rafRef   = useRef<number>()
  const done     = useRef(false)

  const [x,     setX]     = useState(0)
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'snapping' | 'flying'>('idle')

  function updateX(val: number) {
    setX(val)
    onDrag?.(val)
  }

  const sPos      = useRef(0)
  const sVel      = useRef(0)
  const originX   = useRef(0)
  const originCX  = useRef(0)
  const velBuf    = useRef<{ x: number; t: number }[]>([])
  const nudgeDone = useRef(false)

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
    const dur   = Math.round(Math.max(160, Math.min(300, 240 / (speed / FLICK_VX))))
    const flyTo = window.innerWidth * 1.1

    el.animate(
      [
        { transform: `translateX(${curX}px)` },
        { transform: `translateX(${flyTo}px)` },
      ],
      { duration: dur, easing: 'cubic-bezier(0.15, 0.0, 0.25, 1.0)', fill: 'forwards' }
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
      updateX(s.pos)
      if (Math.abs(s.pos) > 0.35 || Math.abs(s.vel) > 0.07) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        updateX(0)
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
  }

  function onPointerMove(e: React.PointerEvent) {
    if (phase !== 'dragging') return
    const raw  = e.clientX - originCX.current
    const newX = raw < 0
      ? originX.current + raw * 0.1
      : originX.current + raw
    updateX(newX)

    const now = performance.now()
    velBuf.current.push({ x: e.clientX, t: now })
    velBuf.current = velBuf.current.filter(p => now - p.t < 130)
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

  useEffect(() => () => stop(), [])

  // Nudge right on first card load to signal draggability
  useEffect(() => {
    if (!card || nudgeDone.current || prefersReducedMotion()) return
    nudgeDone.current = true
    const id = setTimeout(() => {
      if (done.current) return
      stop()
      sPos.current = 28
      sVel.current = 0
      updateX(28)
      setPhase('snapping')
      function tick() {
        const s = springStep(sPos.current, sVel.current, 0)
        sPos.current = s.pos
        sVel.current = s.vel
        updateX(s.pos)
        if (Math.abs(s.pos) > 0.35 || Math.abs(s.vel) > 0.07) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          updateX(0)
          sPos.current = 0
          setPhase('idle')
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }, 1000)
    return () => clearTimeout(id)
  }, [card])

  const isDrag   = phase === 'dragging'
  const isFlying = phase === 'flying'
  const progress = isDrag ? Math.min(1, Math.max(0, x / (CARD_W * DIST_PCT))) : 0

  const transform = isFlying ? undefined : `translateX(${x}px)`
  const topRates  = card ? getTopRates(card.earnRates, 2) : []

  return (
    <div className="select-none" style={{ touchAction: 'none' }}>
      <div
        ref={cardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position:      'relative',
          width:         CARD_W,
          height:        CARD_H,
          transform,
          transition: isDrag || phase === 'snapping' || isFlying
            ? 'opacity 300ms ease-out'
            : 'transform 200ms ease-out, opacity 300ms ease-out',
          cursor:        isFlying ? 'default' : isDrag ? 'grabbing' : 'grab',
          pointerEvents: isFlying ? 'none' : undefined,
          willChange:    'transform',
          background:    'linear-gradient(135deg, oklch(26% 0.04 240) 0%, oklch(20% 0.03 255) 60%, oklch(23% 0.035 248) 100%)',
          boxShadow: [
            '0 2px 4px oklch(0% 0 0 / 0.45)',
            '0 8px 24px oklch(0% 0 0 / 0.2)',
            '0 24px 60px oklch(0% 0 0 / 0.12)',
            'inset 0 1px 0 oklch(100% 0 0 / 0.09)',
          ].join(', '),
          opacity:       card ? 1 : 0,
        }}
        className="rounded-xl overflow-hidden"
      >
        {/* Top-left light catch — suggests plastic/metal surface */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, oklch(100% 0 0 / 0.06) 0%, transparent 45%)', borderRadius: 'inherit' }}
        />

        <div className="h-full px-5 pt-4 pb-4 flex flex-col">
          {/* Issuer + fee */}
          <div className="flex items-start justify-between">
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-white/55">
              {formatIssuer(card?.issuer ?? '')}
            </span>
            <span className="text-[8px] font-medium tabular-nums text-white/35">
              {card && (card.annualFee === 0 ? 'No fee' : `$${card.annualFee}/yr`)}
            </span>
          </div>

          {/* Earn rates — up top, visible in landing page clip zone */}
          {topRates.length > 0 && (
            <div className="mt-3 flex gap-4">
              {topRates.map(([cat, val]) => (
                <div key={cat} className="flex flex-col">
                  <span className="text-[1.6rem] font-black leading-none tabular-nums text-white">
                    {val}<span className="text-[1.1rem]">×</span>
                  </span>
                  <span className="mt-[2px] text-[7px] font-bold tracking-[0.14em] uppercase text-white/45">
                    {formatCategory(cat)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Chip + number dots + name — decorative, behind fade on landing */}
          <div className="mt-auto">
            <div
              style={{
                width: 28, height: 20, borderRadius: 3, flexShrink: 0,
                background: 'linear-gradient(145deg, oklch(80% 0.05 80), oklch(68% 0.04 74))',
                border: '0.5px solid oklch(62% 0.04 74 / 0.6)',
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr',
                overflow: 'hidden',
              }}
            >
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{
                  borderRight:  i % 3 !== 2 ? '0.5px solid oklch(55% 0.03 74 / 0.4)' : undefined,
                  borderBottom: i < 3      ? '0.5px solid oklch(55% 0.03 74 / 0.4)' : undefined,
                }} />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              {[0,1,2,3].map(g => (
                <span key={g} className="flex gap-[3px]">
                  {[0,1,2,3].map(d => (
                    <span key={d} style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'oklch(100% 0 0 / 0.22)' }} />
                  ))}
                </span>
              ))}
            </div>
            <p
              className="mt-2 text-[0.88rem] font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'oklch(100% 0 0 / 0.7)' }}
            >
              {card?.name}
            </p>
          </div>
        </div>

        {/* Network emblem — two overlapping circles, bottom-right */}
        <div className="absolute bottom-4 right-5 flex items-center">
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            background: 'oklch(58% 0.18 28 / 0.72)',
          }} />
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            background: 'oklch(72% 0.15 65 / 0.72)',
            marginLeft: -8,
          }} />
        </div>
      </div>

      {showHint && (
        <p
          className="mt-2 text-xs text-muted-foreground/50"
          style={{
            opacity:    isDrag ? 0.35 + progress * 0.65 : 0.5,
            transition: isDrag ? 'none' : 'opacity 300ms',
          }}
        >
          {isDrag && progress > 0.7 ? 'release to browse' : 'drag right to browse →'}
        </p>
      )}
    </div>
  )
}
