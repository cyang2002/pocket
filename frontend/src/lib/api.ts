import type { CardGridItem, EarnRateDetail, GridFilters } from '@/types/api'

const BASE = 'http://localhost:8080'

export async function fetchCardGrid(filters: GridFilters = {}): Promise<CardGridItem[]> {
  const params = new URLSearchParams()
  if (filters.issuer) params.set('issuer', filters.issuer)
  if (filters.isBusiness !== undefined) params.set('isBusiness', String(filters.isBusiness))
  if (filters.network) params.set('network', filters.network)
  if (filters.maxFee !== undefined) params.set('maxFee', String(filters.maxFee))
  if (filters.hasEarnRates !== undefined) params.set('hasEarnRates', String(filters.hasEarnRates))
  const query = params.toString()
  const res = await fetch(`${BASE}/api/cards/grid${query ? '?' + query : ''}`)
  if (!res.ok) throw new Error(`Grid fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchCardById(cardId: string): Promise<CardGridItem> {
  const res = await fetch(`${BASE}/api/cards/${cardId}`)
  if (!res.ok) throw new Error(`Card fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchEarnRates(cardId: string): Promise<EarnRateDetail[]> {
  const res = await fetch(`${BASE}/api/cards/${cardId}/earn-rates`)
  if (!res.ok) throw new Error(`Earn rates fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchCompare(ids: string[]): Promise<CardGridItem[]> {
  if (ids.length === 0) return []
  const params = new URLSearchParams({ ids: ids.join(',') })
  const res = await fetch(`${BASE}/api/cards/compare?${params}`)
  if (!res.ok) throw new Error(`Compare fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${BASE}/api/categories`)
  if (!res.ok) throw new Error(`Categories fetch failed: ${res.status}`)
  return res.json()
}
