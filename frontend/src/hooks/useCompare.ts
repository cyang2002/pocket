import { useQuery } from '@tanstack/react-query'
import { fetchCompare } from '@/lib/api'

export function useCompare(ids: string[]) {
  return useQuery({
    queryKey: ['compare', ids],
    queryFn: () => fetchCompare(ids),
    staleTime: 5 * 60 * 1000,
    enabled: ids.length >= 2,
  })
}
