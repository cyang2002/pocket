export interface CardGridItem {
  cardId: string
  name: string
  issuer: string
  network: string | null
  isBusiness: boolean
  annualFee: number
  isAnnualFeeWaived: boolean
  imageUrl: string | null
  earnRates: Record<string, number | null>
  lastVerified: string | null
  isStale: boolean
}

export interface EarnRateDetail {
  category: string
  multiplier: number
  caveats: string | null
  lastVerified: string | null
}

export interface GridFilters {
  issuer?: string
  isBusiness?: boolean
  network?: string
  maxFee?: number
  hasEarnRates?: boolean
}
