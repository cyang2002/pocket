import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useCardGrid } from '@/hooks/useCardGrid'
import { GridFilters } from './GridFilters'
import { CardTile } from './CardTile'
import { WalletPanel } from './WalletPanel'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCategory } from '@/lib/constants'
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

  const clear = useCallback(() => {
    localStorage.setItem('pocket_wallet', JSON.stringify([]))
    setWallet([])
  }, [])

  return { wallet, add, remove, clear }
}

export function EarnRateGrid() {
  const [filters, setFilters] = useState<GridFiltersType>({})
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(() => {
    try { return localStorage.getItem('pocket_show_filters') !== 'false' } catch { return true }
  })
  const [showWallet, setShowWallet] = useState(() => {
    try { return localStorage.getItem('pocket_show_wallet') !== 'false' } catch { return true }
  })
  const [viewMode, setViewMode] = useState<'5col' | '3col' | 'list'>(() => {
    try {
      const v = localStorage.getItem('pocket_view_mode')
      return v === '5col' || v === '3col' || v === 'list' ? v : '3col'
    } catch { return '3col' }
  })
  const [gridFading, setGridFading] = useState(false)
  const changeView = useCallback((next: '5col' | '3col' | 'list') => {
    setGridFading(true)
    setTimeout(() => {
      setViewMode(next)
      localStorage.setItem('pocket_view_mode', next)
      setGridFading(false)
    }, 130)
  }, [])
  const { wallet, add: addToWallet, remove: removeFromWallet, clear: clearWallet } = useWallet()

  const [isCardDragging, setIsCardDragging] = useState(false)
  useEffect(() => {
    const onStart = () => setIsCardDragging(true)
    const onEnd = () => setIsCardDragging(false)
    document.addEventListener('dragstart', onStart)
    document.addEventListener('dragend', onEnd)
    return () => {
      document.removeEventListener('dragstart', onStart)
      document.removeEventListener('dragend', onEnd)
    }
  }, [])

  const lastZoomAt = useRef(0)
  useEffect(() => {
    const MODES = ['list', '3col', '5col'] as const
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const now = Date.now()
      if (now - lastZoomAt.current < 320) return
      lastZoomAt.current = now
      setViewMode(prev => {
        const idx = MODES.indexOf(prev)
        const next = e.deltaY > 0
          ? MODES[Math.min(idx + 1, MODES.length - 1)]
          : MODES[Math.max(idx - 1, 0)]
        if (next !== prev) changeView(next)
        return prev
      })
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [changeView])

  const { data, isLoading, isError } = useCardGrid({})

  const issuers = useMemo(() => {
    if (!data) return []
    return [...new Set(data.map(c => c.issuer))].sort()
  }, [data])

  const filteredData = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data.filter(card => {
      if (filters.issuer && card.issuer !== filters.issuer) return false
      if (filters.isBusiness !== undefined && card.isBusiness !== filters.isBusiness) return false
      if (filters.network && card.network !== filters.network) return false
      if (filters.maxFee !== undefined && card.annualFee > filters.maxFee) return false
      if (q && !card.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [data, filters, search])

  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData
    return [...filteredData].sort((a, b) => {
      const av = a.earnRates[sortCol] ?? -1
      const bv = b.earnRates[sortCol] ?? -1
      return bv - av
    })
  }, [filteredData, sortCol])

  const hasActiveFilters = !!(filters.issuer || filters.isBusiness !== undefined || filters.network || filters.maxFee !== undefined || sortCol || search)
  const activeFilterCount = useMemo(() =>
    [filters.issuer, filters.isBusiness !== undefined, filters.network, filters.maxFee !== undefined, sortCol, search].filter(Boolean).length,
    [filters, sortCol, search]
  )

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
          <div className="px-8 sm:px-16 py-3 flex items-center gap-3 flex-wrap">
            <SectionHeader title="Browse" />
            {!isLoading && !isError && data && (
              <span className="text-sm text-muted-foreground tabular-nums">
                {filteredData.length < data.length ? `${filteredData.length} of ${data.length}` : data.length} cards
              </span>
            )}
            {sortCol && !isLoading && !isError && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-sm bg-primary/10 text-primary">
                Sorted by {formatCategory(sortCol)}
                <button onClick={() => setSortCol(null)} className="ml-0.5 hover:opacity-60 transition-opacity" aria-label="Clear sort">×</button>
              </span>
            )}
            {!isLoading && !isError && (
              <div className="ml-auto flex items-center gap-2">
              <div className="flex rounded border border-border overflow-hidden">
                {([
                  { mode: '5col', label: 'Wide grid (5 columns)', icon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                      <rect x="0.5" y="0.5" width="2" height="5" rx="0.3"/>
                      <rect x="3.5" y="0.5" width="2" height="5" rx="0.3"/>
                      <rect x="6.5" y="0.5" width="2" height="5" rx="0.3"/>
                      <rect x="9.5" y="0.5" width="2" height="5" rx="0.3"/>
                      <rect x="0.5" y="6.5" width="2" height="5" rx="0.3"/>
                      <rect x="3.5" y="6.5" width="2" height="5" rx="0.3"/>
                      <rect x="6.5" y="6.5" width="2" height="5" rx="0.3"/>
                      <rect x="9.5" y="6.5" width="2" height="5" rx="0.3"/>
                    </svg>
                  )},
                  { mode: '3col', label: 'Standard grid (3 columns)', icon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                      <rect x="1" y="1" width="3" height="4.5" rx="0.4"/>
                      <rect x="5" y="1" width="3" height="4.5" rx="0.4"/>
                      <rect x="9" y="1" width="2" height="4.5" rx="0.4"/>
                      <rect x="1" y="6.5" width="3" height="4.5" rx="0.4"/>
                      <rect x="5" y="6.5" width="3" height="4.5" rx="0.4"/>
                      <rect x="9" y="6.5" width="2" height="4.5" rx="0.4"/>
                    </svg>
                  )},
                  { mode: 'list', label: 'List view', icon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                      <rect x="1" y="1.5" width="10" height="1.5" rx="0.5"/>
                      <rect x="1" y="5.25" width="10" height="1.5" rx="0.5"/>
                      <rect x="1" y="9" width="10" height="1.5" rx="0.5"/>
                    </svg>
                  )},
                ] as const).map(({ mode, label, icon }, i) => (
                  <button
                    key={mode}
                    onClick={() => changeView(mode)}
                    className={`h-8 w-8 flex items-center justify-center transition-colors ${i > 0 ? 'border-l border-border' : ''} ${viewMode === mode ? 'bg-secondary text-foreground' : 'bg-background text-muted-foreground hover:bg-secondary/60'}`}
                    aria-label={label}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFilters(v => { const next = !v; localStorage.setItem('pocket_show_filters', String(next)); return next })}
                className={`flex items-center gap-2 h-8 px-3 rounded border text-xs font-semibold transition-colors
                  ${showFilters
                    ? 'bg-secondary border-border text-foreground'
                    : hasActiveFilters
                      ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/15'
                      : 'bg-background border-border text-foreground hover:bg-secondary'
                  }`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 2.5h10M3 6h6M5 9.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className={`text-[10px] font-bold tabular-nums px-1 py-0.5 rounded-sm leading-none
                    ${showFilters ? 'bg-primary/15 text-primary' : 'bg-primary text-primary-foreground'}`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowWallet(v => { const next = !v; localStorage.setItem('pocket_show_wallet', String(next)); return next })}
                className={`flex items-center gap-2 h-8 px-3 rounded border text-xs font-semibold transition-colors
                  ${showWallet
                    ? 'bg-secondary border-border text-foreground'
                    : wallet.length > 0
                      ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/15'
                      : 'bg-background border-border text-foreground hover:bg-secondary'
                  }`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <rect x="1" y="3.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 3.5V2.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="9" cy="7" r="1" fill="currentColor"/>
                </svg>
                Wallet
                {wallet.length > 0 && (
                  <span className={`text-[10px] font-bold tabular-nums px-1 py-0.5 rounded-sm leading-none
                    ${showWallet ? 'bg-primary/15 text-primary' : 'bg-primary text-primary-foreground'}`}>
                    {wallet.length}
                  </span>
                )}
              </button>
              </div>
            )}
          </div>
        </div>

        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: showFilters ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <GridFilters filters={filters} onFilterChange={setFilters} issuers={issuers} sortCol={sortCol} onSortChange={setSortCol} search={search} onSearchChange={setSearch} />
          </div>
        </div>

        {isLoading && (
          <div className={`px-8 sm:px-16 py-8 grid ${
            viewMode === 'list' ? 'grid-cols-1 gap-2'
            : viewMode === '5col' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          }`}>
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="w-full rounded" style={viewMode === 'list' ? { height: 56 } : { aspectRatio: '85.6 / 54' }} />
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
          <div className="px-8 sm:px-16 py-20 text-center">
            <p className="text-sm font-semibold">No cards match</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
          </div>
        )}

        {!isLoading && !isError && sortedData.length > 0 && (
          <div
            className={`px-8 sm:px-16 py-8 grid ${
              viewMode === 'list' ? 'grid-cols-1 gap-2'
              : viewMode === '5col' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            }`}
            style={{
              opacity: gridFading ? 0 : 1,
              transform: gridFading ? 'scale(0.985)' : 'scale(1)',
              transition: 'opacity 130ms ease-out, transform 130ms ease-out',
            }}
          >
            {sortedData.map(card => (
              <CardTile
                key={card.cardId}
                card={card}
                inWallet={wallet.includes(card.cardId)}
                onAdd={() => addToWallet(card.cardId)}
                onRemove={() => removeFromWallet(card.cardId)}
                viewMode={viewMode === 'list' ? 'list' : 'grid'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resize handle */}
      {showWallet && (
        <div
          onMouseDown={handleResizeStart}
          className="w-1 flex-shrink-0 relative cursor-col-resize group"
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/20 transition-colors duration-150" />
        </div>
      )}

      {/* Wallet sidebar */}
      <div
        className={`flex-shrink-0 border-l overflow-hidden transition-[width,border-color] duration-200 ease-out ${
          isCardDragging && showWallet ? 'border-primary/60' : 'border-primary/25'
        }`}
        style={{ width: showWallet ? sidebarWidth : 0 }}
      >
        <WalletPanel
          walletCards={walletCards}
          onRemove={removeFromWallet}
          onDrop={addToWallet}
          onClearAll={clearWallet}
          isCardDragging={isCardDragging}
        />
      </div>
    </div>
  )
}
