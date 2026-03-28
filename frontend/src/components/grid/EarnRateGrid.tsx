import { useState, useMemo, useCallback, useRef } from 'react'
import { useCardGrid } from '@/hooks/useCardGrid'
import { GridFilters } from './GridFilters'
import { CardTile } from './CardTile'
import { WalletPanel } from './WalletPanel'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { CATEGORIES, formatCategory } from '@/lib/constants'
import { SectionHeader } from '@/components/ui/section-header'
import type { GridFilters as GridFiltersType } from '@/types/api'

function useWallet() {
  const [wallet, setWallet] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pocket_wallet')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const add = useCallback((cardId: string) => {
    setWallet(prev => {
      if (prev.includes(cardId)) return prev
      const next = [...prev, cardId]
      localStorage.setItem('pocket_wallet', JSON.stringify(next))
      return next
    })
  }, [])

  const remove = useCallback((cardId: string) => {
    setWallet(prev => {
      const next = prev.filter(id => id !== cardId)
      localStorage.setItem('pocket_wallet', JSON.stringify(next))
      return next
    })
  }, [])

  return { wallet, add, remove }
}

export function EarnRateGrid() {
  const [filters, setFilters] = useState<GridFiltersType>({})
  const [sortCol, setSortCol] = useState<string | null>(null)
  const { wallet, add: addToWallet, remove: removeFromWallet } = useWallet()

  const { data, isLoading, isError } = useCardGrid({})

  const issuers = useMemo(() => {
    if (!data) return []
    return [...new Set(data.map(c => c.issuer))].sort()
  }, [data])

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter(card => {
      if (filters.issuer && card.issuer !== filters.issuer) return false
      if (filters.isBusiness !== undefined && card.isBusiness !== filters.isBusiness) return false
      if (filters.network && card.network !== filters.network) return false
      if (filters.maxFee !== undefined && card.annualFee > filters.maxFee) return false
      return true
    })
  }, [data, filters])

  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData
    return [...filteredData].sort((a, b) => {
      const av = a.earnRates[sortCol] ?? -1
      const bv = b.earnRates[sortCol] ?? -1
      return bv - av
    })
  }, [filteredData, sortCol])

  const walletCards = useMemo(() => {
    if (!data) return []
    return wallet.map(id => data.find(c => c.cardId === id)).filter(Boolean) as NonNullable<typeof data[number]>[]
  }, [data, wallet])

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const v = localStorage.getItem('pocket_sidebar_width')
      return v ? Math.max(180, Math.min(520, Number(v))) : 256
    } catch { return 256 }
  })
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)
  const lastWidthRef = useRef(sidebarWidth)

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartWidth.current = sidebarWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const delta = dragStartX.current - e.clientX
      const w = Math.max(180, Math.min(520, dragStartWidth.current + delta))
      lastWidthRef.current = w
      setSidebarWidth(w)
    }

    const onMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      localStorage.setItem('pocket_sidebar_width', String(lastWidthRef.current))
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [sidebarWidth])

  return (
    <div className="flex" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="px-8 sm:px-16 py-4 flex items-center gap-3">
            <SectionHeader title="Browse" />
            {!isLoading && !isError && data && (
              <span className="text-sm text-muted-foreground tabular-nums">
                {filteredData.length < data.length ? `${filteredData.length} of ${data.length}` : data.length} cards
                {sortCol ? ` · ${formatCategory(sortCol)}` : ''}
              </span>
            )}
            {!isLoading && !isError && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort</span>
                <Select value={sortCol ?? ''} onValueChange={v => setSortCol(v || null)}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{formatCategory(cat)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <GridFilters filters={filters} onFilterChange={setFilters} issuers={issuers} />

        {isLoading && (
          <div className="px-8 sm:px-16 py-6 grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="w-full rounded" style={{ aspectRatio: '85.6 / 54' }} />
            ))}
          </div>
        )}

        {isError && (
          <div className="px-8 sm:px-16 py-4">
            <Alert>
              <AlertDescription>Unable to load card data. Check your connection and try again.</AlertDescription>
            </Alert>
          </div>
        )}

        {!isLoading && !isError && filteredData.length === 0 && data && data.length > 0 && (
          <div className="px-8 py-20 text-center">
            <p className="text-sm font-semibold">No cards match</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
          </div>
        )}

        {!isLoading && !isError && sortedData.length > 0 && (
          <div className="px-8 sm:px-16 py-6 grid grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedData.map(card => (
              <CardTile
                key={card.cardId}
                card={card}
                inWallet={wallet.includes(card.cardId)}
                onAdd={() => addToWallet(card.cardId)}
                onRemove={() => removeFromWallet(card.cardId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className="w-1 flex-shrink-0 relative cursor-col-resize group"
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/20 transition-colors duration-150" />
      </div>

      {/* Wallet sidebar */}
      <div className="flex-shrink-0 border-l border-primary/25 overflow-hidden" style={{ width: sidebarWidth }}>
        <WalletPanel
          walletCards={walletCards}
          onRemove={removeFromWallet}
          onDrop={addToWallet}
        />
      </div>
    </div>
  )
}
