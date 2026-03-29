import { memo } from 'react'
import { Link } from 'react-router-dom'
import { formatIssuer, formatCategory, rateColorClass, getTopRates } from '@/lib/constants'
import { BizBadge } from '@/components/ui/biz-badge'
import type { CardGridItem } from '@/types/api'

interface CardTileProps {
  card: CardGridItem
  inWallet: boolean
  onAdd: () => void
  onRemove: () => void
  viewMode?: 'grid' | 'list'
}

export const CardTile = memo(function CardTile({ card, inWallet, onAdd, onRemove, viewMode = 'grid' }: CardTileProps) {
  const topRates = getTopRates(card.earnRates, 3)
  const totalRates = Object.values(card.earnRates).filter(v => v != null && v > 0).length
  const remaining = totalRates - topRates.length

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/plain', card.cardId)
    e.dataTransfer.effectAllowed = 'copy'
  }

  if (viewMode === 'list') {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        className={`group flex items-center gap-4 px-4 py-3 rounded border select-none cursor-grab active:cursor-grabbing transition-colors
          ${inWallet
            ? 'bg-[oklch(98%_0.012_152)] border-primary/40 ring-1 ring-primary/15'
            : 'bg-card border-border hover:bg-secondary/50'
          }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground leading-none">
              {formatIssuer(card.issuer)}
            </span>
            {card.isBusiness && <BizBadge />}
          </div>
          <p
            className="mt-0.5 text-sm font-medium leading-snug text-foreground truncate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {card.name}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          {topRates.map(([cat, val]) => (
            <span
              key={cat}
              className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-sm leading-none ${rateColorClass(val)}`}
            >
              {formatCategory(cat)}&nbsp;{val}×
            </span>
          ))}
          {remaining > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">+{remaining}</span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-sm tabular-nums ${card.annualFee === 0 ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
            {card.annualFee === 0 ? 'No fee' : `$${card.annualFee}/yr`}
          </span>
          <button
            onClick={e => { e.stopPropagation(); inWallet ? onRemove() : onAdd() }}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors
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
            className="text-xs font-semibold px-3 py-1.5 rounded bg-background border border-border text-foreground hover:bg-secondary transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`group relative rounded overflow-hidden select-none cursor-grab active:cursor-grabbing
        transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_24px_oklch(0%_0_0/0.1)]
        ${inWallet
          ? 'bg-[oklch(98%_0.012_152)] border border-primary/40 ring-1 ring-primary/15'
          : 'bg-card border border-border'
        }`}
      style={{ aspectRatio: '85.6 / 54' }}
    >
      <div className="relative h-full px-5 pt-4 pb-2 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground leading-tight truncate">
              {formatIssuer(card.issuer)}
            </span>
            {card.isBusiness && <BizBadge />}
          </div>
          <span className={`text-sm tabular-nums flex-shrink-0 ${card.annualFee === 0 ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
            {card.annualFee === 0 ? 'No fee' : `$${card.annualFee}/yr`}
          </span>
        </div>

        <p
          className="flex-1 text-[15px] font-medium leading-snug text-foreground flex items-center"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {card.name}
        </p>

        <div className="flex flex-wrap gap-1.5 pb-9">
          {topRates.map(([cat, val]) => (
            <span
              key={cat}
              className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-sm leading-none ${rateColorClass(val)}`}
            >
              {formatCategory(cat)}&nbsp;{val}×
            </span>
          ))}
          {remaining > 0 && (
            <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded-sm leading-none bg-stone-100 text-stone-400">
              +{remaining} more
            </span>
          )}
        </div>
      </div>

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
    </div>
  )
})
