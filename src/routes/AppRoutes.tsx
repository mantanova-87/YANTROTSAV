import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/mainlayout'
import CyberLoader from '../components/common/CyberLoader'

// Lazy-loaded route components for optimal bundle splitting and speed
const Home = lazy(() => import('../pages/Home'))
const Events = lazy(() => import('../pages/Events'))
const OurTeam = lazy(() => import('../pages/ourteam'))
const Contact = lazy(() => import('../pages/Contact'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const Register = lazy(() => import('../components/Register'))

function AppRoutes() {
  return (
    <Suspense fallback={<CyberLoader variant="fullscreen" text="INITIALIZING QUANTUM RUNTIME..." />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/OurTeam" element={<OurTeam />} />
          <Route path="/ourteam" element={<OurTeam />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes