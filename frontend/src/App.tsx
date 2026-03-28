import { Routes, Route, Outlet } from 'react-router-dom'
import { NavBar } from '@/components/layout/NavBar'
import { LandingPage } from '@/components/landing/LandingPage'
import { EarnRateGrid } from '@/components/grid/EarnRateGrid'
import { CardDetail } from '@/components/detail/CardDetail'
import { CompareView } from '@/components/compare/CompareView'

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse" element={<EarnRateGrid />} />
        <Route path="/cards/:id" element={<CardDetail />} />
        <Route path="/compare" element={<CompareView />} />
      </Route>
    </Routes>
  )
}
