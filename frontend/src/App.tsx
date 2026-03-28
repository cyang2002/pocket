import { Routes, Route } from 'react-router-dom'
import { EarnRateGrid } from '@/components/grid/EarnRateGrid'
import { CardDetail } from '@/components/detail/CardDetail'
import { CompareView } from '@/components/compare/CompareView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EarnRateGrid />} />
      <Route path="/cards/:id" element={<CardDetail />} />
      <Route path="/compare" element={<CompareView />} />
    </Routes>
  )
}
