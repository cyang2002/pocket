import { Routes, Route } from 'react-router-dom'

function GridPage() {
  return <div className="p-8"><h1 className="text-xl font-semibold">Credit Cards</h1><p className="text-sm text-muted-foreground mt-2">Grid coming in next plan.</p></div>
}

function DetailPage() {
  return <div className="p-8"><h1 className="text-xl font-semibold">Card Detail</h1><p className="text-sm text-muted-foreground mt-2">Detail coming in next plan.</p></div>
}

function ComparePage() {
  return <div className="p-8"><h1 className="text-xl font-semibold">Compare Cards</h1><p className="text-sm text-muted-foreground mt-2">Compare view coming in next plan.</p></div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GridPage />} />
      <Route path="/cards/:id" element={<DetailPage />} />
      <Route path="/compare" element={<ComparePage />} />
    </Routes>
  )
}
