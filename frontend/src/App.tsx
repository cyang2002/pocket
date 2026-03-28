import { Routes, Route } from 'react-router-dom'
import { EarnRateGrid } from '@/components/grid/EarnRateGrid'

function DetailPage() {
  return <div className="p-8"><h1 className="text-xl font-semibold">Card Detail</h1><p className="text-sm text-muted-foreground mt-2">Detail view coming soon.</p></div>
}

function ComparePage() {
  return <div className="p-8"><h1 className="text-xl font-semibold">Compare Cards</h1><p className="text-sm text-muted-foreground mt-2">Compare view coming soon.</p></div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EarnRateGrid />} />
      <Route path="/cards/:id" element={<DetailPage />} />
      <Route path="/compare" element={<ComparePage />} />
    </Routes>
  )
}
