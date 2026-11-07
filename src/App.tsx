import { MotionConfig } from 'framer-motion'
import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'

const Prices = lazy(() => import('./pages/Prices'))
const Compare = lazy(() => import('./pages/Compare'))
const History = lazy(() => import('./pages/History'))
const Predict = lazy(() => import('./pages/Predict'))
const MapPage = lazy(() => import('./pages/MapPage'))
const Traders = lazy(() => import('./pages/Traders'))
const Grow = lazy(() => import('./pages/Grow'))
const Varieties = lazy(() => import('./pages/Varieties'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Duration = lazy(() => import('./pages/Duration'))
const Pests = lazy(() => import('./pages/Pests'))
const Calculator = lazy(() => import('./pages/Calculator'))
const Weather = lazy(() => import('./pages/Weather'))
const Schemes = lazy(() => import('./pages/Schemes'))
const Learn = lazy(() => import('./pages/Learn'))
const More = lazy(() => import('./pages/More'))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="prices" element={<Prices />} />
          <Route path="compare" element={<Compare />} />
          <Route path="history" element={<History />} />
          <Route path="predict" element={<Predict />} />
          <Route path="map" element={<MapPage />} />
          <Route path="traders" element={<Traders />} />
          <Route path="grow" element={<Grow />} />
          <Route path="varieties" element={<Varieties />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="duration" element={<Duration />} />
          <Route path="pests" element={<Pests />} />
          <Route path="calculator" element={<Calculator />} />
          <Route path="weather" element={<Weather />} />
          <Route path="schemes" element={<Schemes />} />
          <Route path="learn" element={<Learn />} />
          <Route path="more" element={<More />} />
          <Route path="*" element={<More />} />
        </Route>
      </Routes>
    </MotionConfig>
  )
}
