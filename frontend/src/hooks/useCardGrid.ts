import { useQuery } from '@tanstack/react-query'
import { fetchCardGrid } from '@/lib/api'
import type { GridFilters } from '@/types/api'

export function useCardGrid(filters: GridFilters = {}) {
  return useQuery({
    queryKey: ['cardGrid', filters],
    queryFn: () => fetchCardGrid(filters),
    staleTime: 5 * 60 * 1000,
  })
}
