import { memo } from 'react'
import { Link } from 'react-router-dom'
import { formatIssuer, formatCategory, rateColorClass, getTopRates } from '@/lib/constants'
import type { CardGridItem } from '@/types/api'

interface CardTileProps {
  card: CardGridItem
  inWallet: boolean
  onAdd: () => void
  onRemove: () => void
}

export const CardTile = memo(function CardTile({ card, inWallet, onAdd, onRemove }: CardTileProps) {
  const topRates = getTopRates(card.earnRates, 3)

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/plain', card.cardId)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`group relative rounded select-none cursor-grab active:cursor-grabbing
        transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_24px_oklch(0%_0_0/0.1)]
        ${inWallet
          ? 'bg-[oklch(98%_0.012_152)] border border-primary/40 ring-1 ring-primary/15'
          : 'bg-card border border-border'
        }`}
      style={{ aspectRatio: '85.6 / 54' }}
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 rounded opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, oklch(70% 0.01 75) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Card content — always fully visible */}
      <div className="relative h-full px-5 pt-4 pb-10 flex flex-col gap-2">
        {/* Header row: issuer + fee */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground leading-tight truncate">
            {formatIssuer(card.issuer)}
          </span>
          <span className={`text-sm tabular-nums flex-shrink-0 ${card.annualFee === 0 ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
            {card.annualFee === 0 ? 'No fee' : `$${card.annualFee}/yr`}
          </span>
        </div>

        {/* Card name */}
        <p
          className="flex-1 text-[17px] font-medium leading-snug text-foreground flex items-center"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {card.name}
        </p>

        {/* Earn rate badges */}
        <div className="flex flex-wrap gap-1.5">
          {topRates.map(([cat, val]) => (
            <span
              key={cat}
              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-sm leading-none ${rateColorClass(val)}`}
            >
              {formatCategory(cat)}&nbsp;{val}×
            </span>
          ))}
        </div>
      </div>

      {/* Bottom gradient action bar — visible on hover, never covers card name or rates */}
      <div
        className="absolute bottom-0 inset-x-0 rounded-b
          pt-6 pb-2.5 px-4
          bg-gradient-to-t from-card via-card/90 to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
          flex items-end gap-2"
      >
        <button
          onClick={e => { e.stopPropagation(); inWallet ? onRemove() : onAdd() }}
          className={`text-xs font-semibold px-3 py-1 rounded transition-colors
            ${inWallet
              ? 'bg-muted text-muted-foreground border border-border hover:border-destructive/40 hover:text-destructive'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
        >
          {inWallet ? 'Remove' : '+ Wallet'}
        </button>
        <Link
          to={`/cards/${card.cardId}`}
          onClick={e => e.stopPropagation()}
          className="text-xs font-semibold px-3 py-1 rounded bg-background border border-border text-foreground hover:bg-secondary transition-colors"
        >
          Details →
        </Link>
      </div>

      {/* In-wallet ring is the indicator — no extra dot needed */}
    </div>
  )
})
